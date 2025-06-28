import shortUUID from 'short-uuid';
import PrometheusMetrics from '@/metrics/PrometheusMetrics';
import { AccountModel, BankingTransactionsModel, TransactionsModel, UsersModel, CardsModel } from '@/models'
import { checkForProtectedRequests, getQueryResponseFields, getRecurrenceTopUps, getRecurrenceTransactions, getWaitingTransactions, } from '@/helpers'
import { GraphQLError } from 'graphql';
import { TransactionJoiSchema } from '@/auth/transactionJoiSchema';
import { CRON_JOB_BIWEEKLY_PATTERN, CRON_JOB_MONTHLY_PATTERN, CRON_JOB_WEEKLY_PATTERN, ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY } from '@/constants';
import { Op } from 'sequelize';
import { Span, SpanStatusCode, Tracer } from '@opentelemetry/api';
import { AES, HASH, RSA } from 'cryptografia';
import { connection } from '@/redis';
import { Queue } from 'bullmq';


const transactionQueue = new Queue("transactions", { connection });
const topUpQueue = new Queue("topups", { connection });


export class TransactionsController {
    static transaction = async (_: unknown, { transactionId }: { transactionId: string }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const { user } = await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'transaction')

            const transaction = await TransactionsModel.findOne({
                attributes: fields['transaction'],
                where: {
                    [Op.and]: [
                        { transactionId },
                        {
                            [Op.or]: [
                                {
                                    fromAccount: user.account.id
                                },
                                {
                                    toAccount: user.account.id,
                                }
                            ]
                        }
                    ]
                },
                include: [
                    {
                        model: AccountModel,
                        as: 'from',
                        attributes: fields['from'],
                        include: [{
                            model: UsersModel,
                            as: 'user',
                            attributes: fields['user']
                        }]
                    },
                    {
                        model: AccountModel,
                        as: 'to',
                        attributes: fields['to'],
                        include: [{
                            model: UsersModel,
                            as: 'user',
                            attributes: fields['user']
                        }]
                    }
                ]
            })

            return transaction

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static createTransaction = async (_: unknown, { message }: { message: string }, { req, tracer }: { req: any, metrics: PrometheusMetrics, tracer: Tracer }) => {
        const span: Span = tracer.startSpan("createTransaction");
        try {
            span.addEvent("Starting transaction creation");
            span.setAttribute("graphql.mutation.data", JSON.stringify(message));

            const { user, account, sid, userId, signingKey } = await checkForProtectedRequests(req);

            const decryptedPrivateKey = await AES.decrypt(signingKey, ZERO_ENCRYPTION_KEY)
            const decryptedMessage = await AES.decrypt(message, decryptedPrivateKey)
            const { data, recurrence } = JSON.parse(decryptedMessage)

            console.log({ data });


            const validatedData = await TransactionJoiSchema.createTransaction.parseAsync(data)
            const recurrenceData = await TransactionJoiSchema.recurrenceTransaction.parseAsync(recurrence)

            const messageToSign = `${validatedData.receiver}&${user.username}@${validatedData.amount}@${ZERO_ENCRYPTION_KEY}`
            const hash = await HASH.sha256Async(messageToSign)
            const signature = await RSA.sign(hash, ZERO_SIGN_PRIVATE_KEY)

            const transactionId = `${shortUUID.generate()}${shortUUID.generate()}`
            const jobId = `queueTransaction@${transactionId}`
            const { deviceid, ipaddress, platform } = req.headers

            const receiverAccount = await AccountModel.findOne({
                attributes: { exclude: ['username'] },
                where: {
                    username: validatedData.receiver
                },
                include: [
                    {
                        model: UsersModel,
                        as: 'user',
                        attributes: { exclude: ['createdAt', 'dniNumber', 'updatedAt', 'faceVideoUrl', 'idBackUrl', 'idFrontUrl', 'password'] }
                    }
                ]
            })

            if (!receiverAccount)
                throw "Receiver account not found";

            span.addEvent("queueServer is queuing the transaction");

            const transactionResponse = {
                userId,
                transactionId,
                "amount": validatedData.amount,
                "deliveredAmount": validatedData.amount,
                "voidedAmount": validatedData.amount,
                "transactionType": validatedData.transactionType,
                "currency": "DOP",
                "status": "waiting",
                "location": validatedData.location,
                "createdAt": Date.now().toString(),
                "updatedAt": Date.now().toString(),
                "from": {
                    ...account,
                    user
                },
                "to": {
                    ...receiverAccount.toJSON()
                }
            }

            const queueData = {
                receiverUsername: validatedData.receiver,
                sender: {
                    id: userId,
                    fullName: user.fullName,
                    username: user.username,
                    accountId: user.account.id,
                    balance: user.account.balance
                },
                transaction: {
                    transactionId,
                    amount: validatedData.amount,
                    location: validatedData.location,
                    currency: validatedData.currency,
                    transactionType: validatedData.transactionType,
                    signature,
                    recurrenceData,
                    status: "pending",
                    isRecurring: recurrenceData.time !== "oneTime",
                },
                device: {
                    deviceId: deviceid,
                    sessionId: sid,
                    ipAddress: ipaddress,
                    platform,
                }
            }
            console.log("Queue data");
            const encryptedData = await AES.encrypt(JSON.stringify(queueData), ZERO_ENCRYPTION_KEY)
            await transactionQueue.add(jobId, encryptedData, {
                jobId,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: {
                    age: 20 // 30 minutes
                },
                removeOnFail: {
                    age: 60 * 30 // 24 hours
                },
            })

            console.log("Transaction queued");


            span.setAttribute("queueServer.response", JSON.stringify(jobId));
            span.setStatus({ code: SpanStatusCode.OK });

            return transactionResponse

        } catch (error: any) {
            throw new GraphQLError(error.message);
        } finally {
            span.end();
        }
    }

    static createRequestTransaction = async (_: unknown, { message }: { message: string }, context: any) => {
        try {
            const { user, userId, sid: sessionId, signingKey } = await checkForProtectedRequests(context.req);
            const { deviceid, ipaddress, platform } = context.req.headers

            const decryptedPrivateKey = await AES.decrypt(signingKey, ZERO_ENCRYPTION_KEY)
            const decryptedMessage = await AES.decrypt(message, decryptedPrivateKey)

            const { data, recurrence } = JSON.parse(decryptedMessage)

            const validatedData = await TransactionJoiSchema.createTransaction.parseAsync(data)
            const recurrenceData = await TransactionJoiSchema.recurrenceTransaction.parseAsync(recurrence)

            const transactionId = `${shortUUID.generate()}${shortUUID.generate()}`
            const messageToSign = `${transactionId}&${validatedData.amount}@${ZERO_ENCRYPTION_KEY}`
            const hash = await HASH.sha256Async(messageToSign)
            const signature = await RSA.sign(hash, ZERO_SIGN_PRIVATE_KEY)

            const receiverAccount = await AccountModel.findOne({
                attributes: { exclude: ['username'] },
                where: {
                    username: validatedData.receiver
                },
                include: [
                    {
                        model: UsersModel,
                        as: 'user',
                        attributes: { exclude: ['createdAt', 'dniNumber', 'updatedAt', 'faceVideoUrl', 'idBackUrl', 'idFrontUrl', 'password'] }
                    }
                ]
            })

            if (!receiverAccount)
                throw "Receiver account not found";

            const transactionResponse = {
                userId,
                transactionId,
                "amount": validatedData.amount,
                "deliveredAmount": validatedData.amount,
                "voidedAmount": validatedData.amount,
                "transactionType": validatedData.transactionType,
                "currency": "DOP",
                "status": "waiting",
                "location": validatedData.location,
                "createdAt": Date.now().toString(),
                "updatedAt": Date.now().toString(),
                "from": {
                    ...user.account,
                    user
                },
                "to": {
                    ...receiverAccount.toJSON()
                }
            }

            const queueData = {
                receiverUsername: validatedData.receiver,
                sender: {
                    id: userId,
                    fullName: user.fullName,
                    username: user.username,
                    accountId: user.account.id,
                    balance: user.account.balance
                },
                transaction: {
                    transactionId,
                    amount: validatedData.amount,
                    location: validatedData.location,
                    currency: validatedData.currency,
                    transactionType: validatedData.transactionType,
                    signature,
                    recurrenceData,
                    status: "pending",
                    isRecurring: recurrenceData.time !== "oneTime",
                },
                device: {
                    deviceId: deviceid,
                    sessionId,
                    ipAddress: ipaddress,
                    platform,
                },
                response: transactionResponse

            }

            const encryptedData = await AES.encrypt(JSON.stringify(queueData), ZERO_ENCRYPTION_KEY)
            const jobId = `queueRequestTransaction@${transactionId}`

            await transactionQueue.add(jobId, encryptedData, {
                jobId,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: {
                    age: 20
                },
                removeOnFail: {
                    age: 60 * 30
                }
            })

            return transactionResponse

        } catch (error: any) {
            console.log({ error });

            throw new GraphQLError(error.message);
        }
    }

    static cancelRequestedTransaction = async (_: unknown, { transactionId }: { transactionId: string }, context: any) => {
        try {
            const { user } = await checkForProtectedRequests(context.req);
            const jobId = `cancelRequestedTransaction@${transactionId}`
            const queueData = {
                transactionId,
                fromAccount: user.account.id,
                senderUsername: user.username
            }
            await transactionQueue.add(jobId, queueData, {
                jobId,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: { age: 20 },
                removeOnFail: { age: 60 * 30 }
            })

            return { transactionId }

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static payRequestTransaction = async (_: unknown, { transactionId, paymentApproved }: { transactionId: string, paymentApproved: boolean }, context: any) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const jobId = `payRequestTransaction@${transactionId}`
            const queueData = {
                transactionId,
                paymentApproved,
                toAccount: session.user.account.id,
            }

            await transactionQueue.add(jobId, queueData, {
                jobId,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: {
                    age: 20 // 30 minutes
                },
                removeOnFail: {
                    age: 60 * 30 // 24 hours
                }
            })

            return { status: "pending", transactionId }

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static createBankingTransaction = async (_: unknown, { cardId, data }: { cardId: number, data: any }, context: any) => {
        try {
            const { user, sid } = await checkForProtectedRequests(context.req);
            const { deviceid, ipaddress, platform } = context.req.headers

            const validatedData = await TransactionJoiSchema.bankingCreateTransaction.parseAsync(data)

            const transactionId = `${shortUUID.generate()}${shortUUID.generate()}`

            const messageToSign = `${user.account.id}&${user.id}@${validatedData.amount}@${ZERO_ENCRYPTION_KEY}`
            const hash = await HASH.sha256Async(messageToSign)
            const signature = await RSA.sign(hash, ZERO_SIGN_PRIVATE_KEY)

            const responseData = {
                transactionId,
                ...validatedData,
                account: null,
                card: null,
                deliveredAmount: validatedData.amount,
                voidedAmount: validatedData.amount,
                status: "waiting",
                createdAt: Date.now().toString(),
                updatedAt: Date.now().toString(),
                data: {
                    deviceId: deviceid,
                    sessionId: sid,
                    ipAddress: ipaddress,
                    platform,
                }
            }

            const queueData = {
                transactionId,
                ...validatedData,
                status: "pending",
                voidedAmount: validatedData.amount,
                deliveredAmount: validatedData.amount,
                signature,
                cardId,
                accountId: user.account.id,
                userId: user.id,
                data: {
                    deviceId: deviceid,
                    sessionId: sid,
                    ipAddress: ipaddress,
                    platform,
                }
            }

            const jobId = `createBankingTransaction@${transactionId}`
            await transactionQueue.add(jobId, queueData, {
                jobId,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: { age: 20 },
                removeOnFail: { age: 60 * 30 }
            })

            return responseData

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static accountBankingTransactions = async (_: unknown, { page, pageSize }: { page: number, pageSize: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'transactions')

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const limit = _pageSize;
            const offset = (page - 1) * _pageSize;

            const transactions = await BankingTransactionsModel.findAll({
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                attributes: [...fields['transactions']],
                where: {
                    accountId: session.user.account.id
                },
                include: [
                    {
                        model: AccountModel,
                        as: 'account',
                        attributes: fields['account'],
                        include: [{
                            model: UsersModel,
                            as: 'user',
                            attributes: fields['user']
                        }]
                    },
                    {
                        model: CardsModel,
                        as: 'card',
                        attributes: fields['card']
                    }
                ]
            })

            if (!transactions)
                throw new GraphQLError('No transactions found');

            return transactions

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static accountTransactions = async (_: unknown, { page, pageSize }: { page: number, pageSize: number, fromDate: string }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'transactions')
            const { user } = session

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const limit = _pageSize;
            const offset = (page - 1) * _pageSize;

            const transactions = await TransactionsModel.findAll({
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                attributes: [...fields['transactions'], "fromAccount", "toAccount"],
                where: {
                    [Op.or]: [
                        {
                            fromAccount: user.account.id,
                        },
                        {
                            toAccount: user.account.id,
                            status: { [Op.ne]: "suspicious" }
                        }
                    ]
                },
                include: [
                    {
                        model: AccountModel,
                        as: 'from',
                        attributes: fields['from'],
                        include: [{
                            model: UsersModel,
                            as: 'user',
                            attributes: fields['user']
                        }]
                    },
                    {
                        model: AccountModel,
                        as: 'to',
                        attributes: fields['to'],
                        include: [{
                            model: UsersModel,
                            as: 'user',
                            attributes: fields['user']
                        }]
                    }
                ]
            });

            const waitingTransactions = await getWaitingTransactions({ userId: user.id, queue: transactionQueue }).catch(() => [])
            return [...transactions, ...waitingTransactions]

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static searchAccountTransactions = async (_: unknown, { page, pageSize, fullName }: { page: number, pageSize: number, fullName: string }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const { user } = session

            const fields = getQueryResponseFields(fieldNodes, 'transactions')

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const limit = _pageSize;
            const offset = (page - 1) * _pageSize;

            const transactions = await TransactionsModel.findAll({
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                attributes: [...fields['transactions'], "fromAccount", "toAccount"],
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                {
                                    [Op.and]: [
                                        {
                                            senderFullName: { [Op.iLike]: `%${fullName}%` },
                                        },
                                        {
                                            fromAccount: { [Op.ne]: user.account.id }
                                        }
                                    ]
                                },
                                {
                                    [Op.and]: [
                                        {
                                            receiverFullName: { [Op.iLike]: `%${fullName}%` },
                                        },
                                        {
                                            fromAccount: user.account.id
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            [Op.or]: [
                                {
                                    fromAccount: user.account.id
                                },
                                {
                                    toAccount: user.account.id,
                                }
                            ]
                        }
                    ]
                },
                include: [
                    {
                        model: AccountModel,
                        as: 'from',
                        attributes: fields['from'],

                        include: [{
                            model: UsersModel,
                            as: 'user',
                            attributes: fields['user']
                        }]
                    },
                    {
                        model: AccountModel,
                        as: 'to',
                        attributes: fields['to'],
                        include: [{
                            model: UsersModel,
                            as: 'user',
                            attributes: fields['user']
                        }]
                    }
                ]
            })

            if (!transactions)
                throw new GraphQLError('No transactions found');

            return transactions

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static accountRecurrentTransactions = async (_: unknown, { page, pageSize }: { page: number, pageSize: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const transactions = await getRecurrenceTransactions({ userId: session.userId, queue: transactionQueue })
            const topups = await getRecurrenceTopUps({ userId: session.userId, queue: topUpQueue })

            const limitedTransactions = transactions.slice((page - 1) * pageSize, page * pageSize)
            const limitedTopUps = topups.slice((page - 1) * pageSize, page * pageSize)
            const allTransactions = [...limitedTransactions, ...limitedTopUps]

            const sortedTransactions = allTransactions.sort((a: any, b: any) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            })

            return sortedTransactions

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static deleteRecurrentTransactions = async (_: unknown, { repeatJobKey, queueType }: { repeatJobKey: string, queueType: string }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(context.req);

            if (queueType === "topUp") {
                const job = await topUpQueue.removeJobScheduler(repeatJobKey)
                return job
            }

            const job = await transactionQueue.removeJobScheduler(repeatJobKey)
            return job

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static updateRecurrentTransactions = async (_: unknown, { data: { repeatJobKey, queueType, jobName, jobTime } }: { data: { repeatJobKey: string, queueType: string, jobName: string, jobTime: string } }, context: any) => {
        try {
            await checkForProtectedRequests(context.req);

            if (queueType === "topUp") {
                const oldJob: any = await topUpQueue.getJobScheduler(repeatJobKey);
                const decryptedData = await AES.decrypt(oldJob.template.data, ZERO_ENCRYPTION_KEY)
                const data = JSON.parse(decryptedData)

                const updatedData = Object.assign(data, {
                    response: {
                        ...data.response,
                        jobName,
                        jobTime
                    }
                })
                const updatedEncryptedData = await AES.encrypt(JSON.stringify(updatedData), ZERO_ENCRYPTION_KEY)
                const pattern = jobName === "biweekly" ? CRON_JOB_BIWEEKLY_PATTERN : jobName === "monthly" ? CRON_JOB_MONTHLY_PATTERN[jobTime as keyof typeof CRON_JOB_MONTHLY_PATTERN] : CRON_JOB_WEEKLY_PATTERN[jobTime as keyof typeof CRON_JOB_WEEKLY_PATTERN]
                const job = await topUpQueue.upsertJobScheduler(repeatJobKey, { pattern }, {
                    name: jobName,
                    data: updatedEncryptedData,
                    opts: {
                        backoff: {
                            type: 'exponential',
                            delay: 1000,
                        },
                        removeOnComplete: { age: 20 },
                        removeOnFail: { age: 60 * 30 }
                    }
                })

                return job
            }
            else {
                const oldJob: any = await transactionQueue.getJobScheduler(repeatJobKey);
                const decryptedData = await AES.decrypt(oldJob.template.data, ZERO_ENCRYPTION_KEY)
                const data = JSON.parse(decryptedData)

                const updatedData = Object.assign(data, {
                    response: {
                        ...data.response,
                        jobName,
                        jobTime
                    }
                })

                const updatedEncryptedData = await AES.encrypt(JSON.stringify(updatedData), ZERO_ENCRYPTION_KEY)

                const pattern = jobName === "biweekly" ? CRON_JOB_BIWEEKLY_PATTERN : jobName === "monthly" ? CRON_JOB_MONTHLY_PATTERN[jobTime as keyof typeof CRON_JOB_MONTHLY_PATTERN] : CRON_JOB_WEEKLY_PATTERN[jobTime as keyof typeof CRON_JOB_WEEKLY_PATTERN]
                const job = await transactionQueue.upsertJobScheduler(repeatJobKey, { pattern }, {
                    name: jobName,
                    data: updatedEncryptedData,
                    opts: {
                        backoff: {
                            type: 'exponential',
                            delay: 1000,
                        },
                        removeOnComplete: { age: 20 },
                        removeOnFail: { age: 60 * 30 }
                    }
                })

                return job
            }


        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }
}