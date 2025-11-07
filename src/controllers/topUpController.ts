import {checkForProtectedRequests, getQueryResponseFields, getWaitingTopUps} from '@/helpers'
import {GraphQLError} from 'graphql';
import {TopUpCompanyModel, TopUpPhonesModel, TopUpsModel, UsersModel} from '@/models';
import {Op} from 'sequelize';
import {TopUpSchema} from '@/auth';
import shortUUID from 'short-uuid';
import redis, {connection} from '@/redis';
import {AES} from 'cryptografia';
import {ZERO_ENCRYPTION_KEY} from '@/constants';
import {Queue} from 'bullmq';

const topUpQueue = new Queue('topups', { connection });


export class TopUpController {
    static topUp = async (_: unknown, { referenceId }: { referenceId: string }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'topup')

            const cachedTopUp = await redis.get(`topup:${session.userId}:${referenceId}`)
            if (cachedTopUp)
                return JSON.parse(cachedTopUp)


            const tupup = await TopUpsModel.findOne({
                order: [['createdAt', 'DESC']],
                attributes: fields['topup'],
                where: {
                    [Op.and]: [
                        { userId: session.userId },
                        { referenceId }
                    ]
                }
            })

            if (tupup)
                await redis.set(`topup:${session.userId}:${referenceId}`, JSON.stringify(tupup), 'EX', 10)

            return tupup

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static topUps = async (_: unknown, { phoneId, page, pageSize }: { phoneId: string, page: number, pageSize: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const { userId } = await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'topups')

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const offset = (page - 1) * _pageSize;
            const limit = _pageSize;

            const waitingTopUps = await getWaitingTopUps({ userId, queue: topUpQueue }).catch(() => [])
            const tupups = await TopUpsModel.findAll({
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                attributes: fields['topups'],
                where: {
                    [Op.and]: [
                        { userId },
                        { phoneId }
                    ]
                },
                include: [
                    {
                        model: TopUpCompanyModel,
                        as: 'company',
                        attributes: fields['company']
                    },
                    {
                        model: TopUpPhonesModel,
                        as: 'phone'
                    },
                    {
                        model: UsersModel,
                        as: 'user',
                        attributes: fields['user']
                    }
                ]
            })

            return [...tupups, ...waitingTopUps]

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static recentTopUps = async (_: unknown, { page, pageSize }: { page: number, pageSize: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            try {
                const { userId } = await checkForProtectedRequests(context.req);
                const fields = getQueryResponseFields(fieldNodes, 'topups')

                const _pageSize = pageSize > 50 ? 50 : pageSize
                const offset = (page - 1) * _pageSize;
                const limit = _pageSize;

                const lastFetchDate = context.req.headers['last-fetch-date']

                const waitingTopUps = await getWaitingTopUps({ userId, queue: topUpQueue }).catch(() => [])
                const tupups = await TopUpsModel.findAll({
                    limit,
                    offset,
                    order: [['createdAt', 'DESC']],
                    attributes: fields['topups'],
                    where: {
                        [Op.and]: [
                            { userId },
                            { createdAt: { [Op.gt]: lastFetchDate ? new Date(Number(lastFetchDate)) : new Date(0) } }
                        ]
                    },
                    include: [
                        {
                            model: UsersModel,
                            as: 'user',
                            attributes: fields['user']
                        },
                        {
                            model: TopUpCompanyModel,
                            as: 'company',
                            attributes: fields['company']
                        },
                        {
                            model: TopUpPhonesModel,
                            as: 'phone'
                        }
                    ]
                })

                return [...tupups, ...waitingTopUps]

            } catch (error: any) {
                throw new GraphQLError(error.message);
            }

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static topUpPhones = async (_: unknown, { page, pageSize }: { page: number, pageSize: number }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const session = await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'topUpPhones')

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const offset = (page - 1) * _pageSize;
            const limit = _pageSize;

            const cachedTopUpPhones = await redis.get(`topUpPhones:${session.userId}:${page}:${pageSize}`)
            if (cachedTopUpPhones)
                return JSON.parse(cachedTopUpPhones)

            const phones = await TopUpPhonesModel.findAll({
                limit,
                offset,
                attributes: [...fields['topUpPhones'], "phone"],
                order: [['updatedAt', 'DESC']],
                where: {
                    userId: session.userId
                },
                include: [
                    {
                        model: TopUpCompanyModel,
                        as: 'company',
                        attributes: fields['company']
                    }
                ]
            })

            if (phones.length > 0)
                await redis.set(`topUpPhones:${session.userId}:${page}:${pageSize}`, JSON.stringify(phones), 'EX', 10)

            return phones

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static createTopUp = async (_: unknown, { message }: { message: string }, context: any) => {
        try {
            const { userId, user, signingKey, } = await checkForProtectedRequests(context.req);

            const decryptedPrivateKey = await AES.decryptAsync(signingKey, ZERO_ENCRYPTION_KEY)
            const decryptedMessage = await AES.decryptAsync(message, decryptedPrivateKey)
            const { data, recurrence } = JSON.parse(decryptedMessage)

            const topUpData = await TopUpSchema.createTopUp.parseAsync(data)
            const recurrenceData = await TopUpSchema.recurrenceTopUp.parseAsync(recurrence)

            const referenceId = `${shortUUID.generate()}${shortUUID.generate()}`
            const jobId = `queueTopUp@${shortUUID.generate()}${shortUUID.generate()}`

            const encryptedData = await AES.encryptAsync(JSON.stringify({
                referenceId,
                ...topUpData,
                phoneNumber: topUpData.phone,
                senderUsername: user.username,
                recurrenceData,
                userId,
            }), ZERO_ENCRYPTION_KEY)


            await topUpQueue.add(jobId, encryptedData, {
                jobId,
                removeOnComplete: { age: 20 },
                removeOnFail: { age: 60 * 30 }
            });

            return topUpData.response

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static topUpCompanies = async (_: unknown, __: unknown, context: any) => {
        try {
            await checkForProtectedRequests(context.req);

            const cachedCompanies = await redis.get('topUpCompanies')
            if (cachedCompanies)
                return JSON.parse(cachedCompanies)

            const companies = await TopUpCompanyModel.findAll({
                where: {
                    status: 'active'
                }
            })

            if (companies.length > 0)
                await redis.set('topUpCompanies', JSON.stringify(companies), 'EX', 30)

            return companies

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static searchTopUps = async (_: unknown, { page, pageSize, search }: { page: number, pageSize: number, search: string }, context: any, { fieldNodes }: { fieldNodes: any }) => {
        try {
            const { user } = await checkForProtectedRequests(context.req);
            const fields = getQueryResponseFields(fieldNodes, 'phones')

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const limit = _pageSize;
            const offset = (page - 1) * _pageSize;

            const phones = await TopUpPhonesModel.findAll({
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                attributes: ["id", "fullName", "phone", "createdAt", "userId"],
                where: {
                    [Op.and]: [
                        {
                            userId: user.id
                        },
                        {
                            [Op.or]: [
                                {
                                    fullName: { [Op.iLike]: `%${search}%` },
                                },
                                {
                                    phone: { [Op.iLike]: `%${search}%` },
                                }
                            ]
                        }
                    ]
                },
                include: [
                    {
                        model: TopUpsModel,
                        as: 'topups',
                        include: [
                            {
                                model: TopUpCompanyModel,
                                as: 'company',
                                attributes: fields['company']
                            },
                            {
                                model: TopUpPhonesModel,
                                as: 'phone',
                                attributes: fields['phone']
                            }
                        ]
                    }
                ]
            })

            if (!phones)
                throw new GraphQLError('No transactions found');


            return phones.map((phone) => phone.toJSON()?.topups?.map((topup: any) => ({
                type: "topups",
                timestamp: topup?.createdAt,
                data: topup
            }))).flat()

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }
}