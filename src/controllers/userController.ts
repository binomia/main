import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import KYCModel from '@/models/kycModel';
import {AccountModel, CardsModel, kycModel, SessionModel, TransactionsModel, UsersModel} from '@/models'
import {Op} from 'sequelize'
import {checkForProtectedRequests, GENERATE_SIX_DIGIT_TOKEN, getQueryResponseFields, notificationsQueue} from '@/helpers'
import {ZERO_ENCRYPTION_KEY, ZERO_SIGN_PRIVATE_KEY, ZERO_SIGN_PUBLIC_KEY} from '@/constants'
import {GraphQLError} from 'graphql';
import {GlobalZodSchema, UserJoiSchema} from '@/auth';
import {UserModelType, VerificationDataType} from '@/types';
import shortUUID, {generate} from 'short-uuid';
import {z} from 'zod'
import {Counter} from 'prom-client';
import PrometheusMetrics from '@/metrics/PrometheusMetrics';
import {AES, ECC, HASH} from "cryptografia"

export class UsersController {
    static users = async (_: unknown, {page, pageSize}: { page: number, pageSize: number }, context: any, {fieldNodes}: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(context.req);

            const fields = getQueryResponseFields(fieldNodes, 'users')

            const _pageSize = pageSize > 50 ? 50 : pageSize
            const offset = (page - 1) * _pageSize;
            const limit = _pageSize;

            const users = await UsersModel.findAll({
                limit,
                offset,
                include: [
                    {
                        model: CardsModel,
                        as: 'card',
                    },
                    {
                        model: AccountModel,
                        as: 'account',
                        attributes: fields['account']
                    },
                    {
                        model: TransactionsModel,
                        limit,
                        order: [['createdAt', 'DESC']],
                        as: 'incomingTransactions',
                        isMultiAssociation: true
                    },
                    {
                        model: TransactionsModel,
                        limit,
                        order: [['createdAt', 'DESC']],
                        as: 'outgoingTransactions',

                    }
                ]
            })

            const response: any[] = users.map((user: any) => {
                const txs = user.dataValues.incomingTransactions.concat(user.dataValues.outgoingTransactions)
                return Object.assign({}, user.dataValues, {
                    transactions: txs
                })
            })

            return response

        } catch (error: any) {
            throw new GraphQLError(error.message);

        }
    }

    static user = async (_: unknown, ___: any, {req}: { __: any, req: any }, {fieldNodes}: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(req);
            const fields = getQueryResponseFields(fieldNodes, 'user')

            const user = await UsersModel.findOne({
                where: {
                    id: req.session.userId
                },
                attributes: fields['user'],
                include: [
                    {
                        model: CardsModel,
                        as: 'cards'
                    },
                    {
                        model: AccountModel,
                        as: 'account',
                        attributes: fields['account'],
                        include: [
                            {
                                model: TransactionsModel,
                                limit: 10,
                                order: [['createdAt', 'DESC']],
                                as: 'incomingTransactions',
                                attributes: fields['transactions']
                            },
                            {
                                model: TransactionsModel,
                                limit: 10,
                                order: [['createdAt', 'DESC']],
                                as: 'outgoingTransactions',
                                attributes: fields['transactions']
                            }
                        ]
                    },
                    {
                        model: kycModel,
                        as: 'kyc',
                        attributes: fields['kyc']
                    }
                ]
            })


            if (!user) return null

            const userData = Object.assign({}, user.toJSON(), {
                transactions: [
                    ...user.toJSON().account.incomingTransactions,
                    ...user.toJSON().account.outgoingTransactions,
                ]
            })

            const decryptedCardData = userData.card ? await AES.decryptAsync(userData.card.data, ZERO_ENCRYPTION_KEY) : null
            const card = decryptedCardData ? JSON.parse(decryptedCardData) : null

            return Object.assign({}, userData, {
                card
            })

        } catch (error: any) {
            throw new GraphQLError(error.message);

        }
    }

    static sessionUser = async (_: unknown, ___: any, {metrics, req}: { metrics: PrometheusMetrics, req: any }) => {
        try {
            const session = await checkForProtectedRequests(req);

            metrics.sessionUser.inc()
            return Object.assign({}, session.user, {
                signingKey: session.signingKey
            })

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static userByEmail = async (_: unknown, {email}: { email: string }) => {
        try {
            const user = await UsersModel.findOne({
                where: {
                    email
                },
                attributes: ["id"]
            })

            return Boolean(user)

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static singleUser = async (_: unknown, {username}: { username: string }, {req}: { __: any, req: any }, {fieldNodes}: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(req);
            const fields = getQueryResponseFields(fieldNodes, 'user')
            return await UsersModel.findOne({
                attributes: fields['user'],
                where: {
                    username
                },
                include: [
                    {
                        model: AccountModel,
                        as: 'account',
                        attributes: fields['account'],
                    },
                    {
                        model: CardsModel,
                        as: 'cards',
                        attributes: fields['cards']
                    },
                    {
                        model: kycModel,
                        as: 'kyc',
                        attributes: fields['kyc']
                    }
                ]
            })

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static updateUserPassword = async (_: unknown, {email, password}: { email: string, password: string, data: VerificationDataType }) => {
        const counter = new Counter({
            name: `binomia_apollo_update_user_password_resolver_calls`,
            help: `Number of times the session_user resolver is called`,
        })
        try {
            const validatedData = await UserJoiSchema.updateUserPassword.parseAsync({email, password})
            const user = await UsersModel.findOne({
                where: {
                    email
                },
                attributes: ["id"]
            })

            if (!user) {
                throw new GraphQLError('User not found')
            }

            // const verify = await authServer('verifyData', data)

            // if (!verify) {
            //     throw new GraphQLError('Invalid token or signature')
            // }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(validatedData.password, salt);

            const updatedUser = await user.update({
                password: hashedPassword
            })

            return updatedUser.reload()

        } catch (error: any) {
            throw new GraphQLError(error.message);
        } finally {
            counter.inc()
        }
    }

    static searchSingleUser = async (_: any, {search, limit}: { search: UserModelType, limit: number }, {req}: { __: any, req: any }, {fieldNodes}: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(req);
            const fields = getQueryResponseFields(fieldNodes, "users")

            const searchFilter = []
            for (const [key, value] of Object.entries(search)) {
                if (value) {
                    searchFilter.push({[key]: {[Op.like]: `%${value}%`}}) // change like to ilike for postgres
                }
            }

            const users = await UsersModel.findOne({
                limit,
                attributes: fields['users'],
                where: {
                    [Op.and]: [
                        {[Op.or]: searchFilter},
                        {id: {[Op.ne]: req.session.userId}}
                    ]
                },
                include: [
                    {
                        model: AccountModel,
                        as: 'account',
                        attributes: ["id", "allowReceive"]
                    }
                ]
            })

            if (users?.toJSON().account.allowReceive !== true) throw new GraphQLError(`${users?.toJSON().fullName} no puede recibir pagos`);

            return users

        } catch (error: any) {
            throw new GraphQLError(error.message);

        }
    }

    static searchUsers = async (_: any, {allowRequestMe, search, limit}: { allowRequestMe: boolean, search: UserModelType, limit: number }, {req}: { __: any, req: any }, {fieldNodes}: { fieldNodes: any }) => {
        try {
            await checkForProtectedRequests(req);
            const fields = getQueryResponseFields(fieldNodes, "users")

            const searchFilter = []
            for (const [key, value] of Object.entries(search)) {
                if (value) {
                    searchFilter.push({[key]: {[Op.like]: `%${value}%`}}) // change like to ilike for postgres
                }
            }

            const users = await UsersModel.findAll({
                limit,
                attributes: fields['users'],
                where: {
                    [Op.and]: [
                        {[Op.or]: searchFilter},
                        {id: {[Op.ne]: req.session.userId}},
                        {username: {[Op.ne]: "$binomia"}}
                    ]
                },
                include: [
                    {
                        model: AccountModel,
                        as: 'account',
                        attributes: ["id", "allowReceive", "allowRequestMe"],
                    }
                ]
            })

            return users.filter(user => {
                const {allowReceive, allowRequestMe: requestMe} = user.toJSON().account

                if (allowRequestMe)
                    return requestMe === true

                return allowReceive === true
            })

        } catch (error: any) {
            throw new GraphQLError(error.message);

        }
    }

    static createUser = async (_: unknown, {data}: { data: any }, {req}: { __: any, req: any }) => {
        try {
            const validatedData = await UserJoiSchema.createUser.parseAsync(data)
            const registerHeader = await GlobalZodSchema.registerHeader.parseAsync(req.headers)
            const regexPattern = new RegExp('^\\d{3}-\\d{7}-\\d');

            if (!regexPattern.test(validatedData.dniNumber))
                throw new GraphQLError('Invalid `dni` format');


            const userExists = await UsersModel.findOne({
                where: {
                    [Op.or]: [
                        {email: validatedData.email},
                        {username: validatedData.username}
                    ]
                },
                attributes: ["email", "username", "dniNumber"]
            })

            if (userExists?.toJSON().email === validatedData.email)
                throw new GraphQLError('A user with email: ' + validatedData.email + ' already exists');

            if (userExists?.toJSON().username === validatedData.username)
                throw new GraphQLError('A user with username: ' + validatedData.username + ' already exists');


            const kycExists = await kycModel.findOne({
                where: {
                    dniNumber: validatedData.dniNumber
                }
            })

            if (kycExists)
                throw new GraphQLError('The dni: ' + validatedData.dniNumber + ' already belong to a existing user');


            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(validatedData.password, salt);

            const user = await UsersModel.create(Object.assign({}, validatedData, {
                password: hashedPassword
            }))

            const userData = user.toJSON()

            const account = await AccountModel.create({
                username: user.dataValues.username,
                currency: "DOP",
            })

            const kyc = await kycModel.create({
                userId: userData.id,
                dniNumber: validatedData.dniNumber,
                dob: validatedData.dob,
                status: "validated",
                expiration: validatedData.dniExpiration,
                occupation: validatedData.occupation,
                gender: validatedData.gender,
                maritalStatus: validatedData.maritalStatus,
                bloodType: validatedData.bloodType
            })

            const key = await AES.generateKeyAsync()
            const signingKey = await AES.encryptAsync(key, ZERO_ENCRYPTION_KEY)

            const sid = `${generate()}${generate()}${generate()}`
            const token = jwt.sign({
                username: userData.username,
                signingKey,
                sid
            }, ZERO_ENCRYPTION_KEY);

            const expires = new Date(Date.now() + 1000 * 60 * 60 * 24) // 1 day

            await SessionModel.create({
                sid,
                signingKey,
                deviceId: registerHeader.deviceid,
                jwt: token,
                userId: user.dataValues.id,
                expires,
                data: registerHeader.device || {},
                expoNotificationToken: req.headers.exponotificationtoken || null,
            })

            return {
                ...userData,
                accounts: [account.toJSON()],
                kyc: kyc.toJSON(),
                token
            }

        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }

    static updateUser = async (_: unknown, {data}: { data: any }, {req}: { req: any }) => {
        try {
            await checkForProtectedRequests(req);
            const validatedData = await UserJoiSchema.updateUser.parseAsync(data)
            const user = await UsersModel.findOne({
                where: {
                    id: req.session.user.id
                }
            })

            if (!user)
                throw new GraphQLError('User not found');

            return await user.update(validatedData)

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static login = async (_: unknown, {email, password}: { email: string, password: string }, {req}: { res: any, req: any }) => {
        try {

            const validatedData = await UserJoiSchema.login.parseAsync({email, password})
            const deviceId = await z.string().transform((val) => val.trim()).parseAsync(req.headers["deviceid"]);


            const user = await UsersModel.findOne({
                where: {email},
                attributes: ["id", "password", "username", "email", "status", "phone", "dniNumber"],
                include: [
                    {
                        model: AccountModel,
                        as: 'account'
                    },
                    {
                        model: CardsModel,
                        as: 'cards'
                    },
                    {
                        model: KYCModel,
                        as: 'kyc'
                    }
                ]
            })

            if (!user)
                throw new GraphQLError(`Not found user with email: ${validatedData.email}`);

            const isMatch = await bcrypt.compare(password, user.toJSON().password);
            if (!isMatch)
                throw new GraphQLError('Incorrect password');

            const session = await SessionModel.findOne({
                where: {
                    [Op.and]: [
                        {userId: user.toJSON().id},
                        {deviceId},
                        {
                            expires: {
                                [Op.gt]: Date.now()
                            }
                        }
                    ]
                }
            })

            if (session) {
                if (!session.toJSON().verified) {
                    const code = GENERATE_SIX_DIGIT_TOKEN()
                    const hash = await HASH.sha256Async(JSON.stringify({
                        sid: session.toJSON().sid,
                        code,
                        ZERO_ENCRYPTION_KEY,
                    }))

                    const signature = await ECC.signAsync(hash, ZERO_SIGN_PRIVATE_KEY)
                    const jobId = `sendVerificationCode@${shortUUID.generate()}${shortUUID.generate()}`
                    const transactionEncryptedData = await AES.encryptAsync(JSON.stringify({
                        email,
                        code
                    }), ZERO_ENCRYPTION_KEY);

                    await notificationsQueue.add(jobId, transactionEncryptedData, {
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


                    console.log({code});
                    return {
                        user: user.toJSON(),
                        sid: session.toJSON().sid,
                        token: session.toJSON().jwt,
                        signature,
                        code,
                        needVerification: !session.toJSON().verified
                    }
                }

                return {
                    user: user.toJSON(),
                    sid: session.toJSON().sid,
                    token: session.toJSON().jwt,
                    needVerification: !session.toJSON().verified
                }
            }
            const key = await AES.generateKeyAsync()
            const signingKey = await AES.encryptAsync(key, ZERO_ENCRYPTION_KEY)

            const sid = `${generate()}${generate()}${generate()}`
            const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days
            const token = jwt.sign({sid, signingKey: signingKey, username: user.toJSON().username}, ZERO_ENCRYPTION_KEY);

            const sessionCreated = await SessionModel.create({
                sid,
                verified: !!session,
                deviceId,
                signingKey,
                expoNotificationToken: req.headers.exponotificationtoken || null,
                jwt: token,
                userId: user.dataValues.id,
                expires,
                data: req.headers.device ? JSON.stringify(req.headers.device) : {}
            })

            const code = GENERATE_SIX_DIGIT_TOKEN()
            const hash = await HASH.sha256Async(JSON.stringify({
                sid: sessionCreated.toJSON().sid,
                code,
                ZERO_ENCRYPTION_KEY,
            }))

            const signature = await ECC.signAsync(hash, ZERO_SIGN_PRIVATE_KEY)
            const jobId = `sendVerificationCode@${shortUUID.generate()}${shortUUID.generate()}`
            const transactionEncryptedData = await AES.encryptAsync(JSON.stringify({
                email,
                code
            }), ZERO_ENCRYPTION_KEY);

            await notificationsQueue.add(jobId, transactionEncryptedData, {
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

            console.log({code});
            return {
                sid: sessionCreated.toJSON().sid,
                signingKey: sessionCreated.toJSON().signingKey,
                token,
                code,
                signature,
                needVerification: true
            }

        } catch (error: any) {
            console.error(error);
            throw new GraphQLError(error.message);
        }
    }

    static logout = async (_: unknown, ___: any, {req}: { __: any, req: any }) => {
        try {
            const {sid} = await checkForProtectedRequests(req);
            const session = await SessionModel.findOne({
                where: {
                    [Op.and]: [
                        {sid},
                        {verified: false}
                    ]
                }
            })

            if (!session)
                throw new GraphQLError('Session not found or already verified');

            await session.update({status: "inactive"})
            return true

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static verifySession = async (_: unknown, {sid, code, signature}: { sid: string, code: string, signature: string }) => {
        try {
            const session = await SessionModel.findOne({
                where: {
                    [Op.and]: [
                        {sid},
                        {verified: false}
                    ]
                },
                include: [{
                    model: UsersModel,
                    as: 'user',
                    include: [
                        {
                            model: AccountModel,
                            as: 'account'
                        },
                        {
                            model: CardsModel,
                            as: 'cards'
                        },
                        {
                            model: KYCModel,
                            as: 'kyc'
                        }
                    ]
                }]
            })

            if (!session)
                throw new GraphQLError('Session not found or already verified');

            const hash = await HASH.sha256Async(JSON.stringify({
                sid,
                code,
                ZERO_ENCRYPTION_KEY,
            }))

            const verified = await ECC.verifyAsync(hash, signature, ZERO_SIGN_PUBLIC_KEY)
            if (!verified)
                throw new GraphQLError('Failed to verify session');

            await session.update({verified, status: "active"})
            return session.toJSON().user

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static sugestedUsers = async (_: unknown, {allowRequestMe}: { allowRequestMe: boolean }, {req}: { req: any }) => {
        try {
            await checkForProtectedRequests(req);

            const transactions = await TransactionsModel.findAll({
                limit: 20,
                where: {
                    [Op.or]: [
                        {fromAccount: req.session.user.account.id},
                        {toAccount: req.session.user.account.id}
                    ]
                },
                include: [
                    {
                        model: AccountModel,
                        as: 'from',
                        attributes: ["id"],
                        include: [
                            {
                                model: UsersModel,
                                as: 'user',
                                include: [
                                    {
                                        model: AccountModel,
                                        as: 'account',
                                        attributes: ["id", "allowReceive", "allowRequestMe"]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: AccountModel,
                        as: 'to',
                        attributes: ["id"],
                        include: [
                            {
                                model: UsersModel,
                                as: 'user',
                                include: [
                                    {
                                        model: AccountModel,
                                        as: 'account',
                                        attributes: ["id", "allowReceive", "allowRequestMe"]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            })

            if (transactions.length === 0 || !transactions) return []

            const users = transactions.reduce((acc: any[], item: any) => {
                // Check if the 'from' user is not the current user and is not already in the array
                if (item.from && item.from.user.id !== req.session.user.id &&
                    !acc.some((user) => user.id === item.from.user.id)) {
                    acc.push(item.from.user.toJSON());
                }

                // Check if the 'to' user is not the current user and is not already in the array
                if (item.to && item.to.user.id !== req.session.user.id &&
                    !acc.some((user) => user.id === item.to.user.id)) {
                    acc.push(item.to.user.toJSON());
                }

                return acc;
            }, []);

            return users.filter(user => {
                const {allowReceive, allowRequestMe: requestMe} = user.account

                if (allowRequestMe)
                    return requestMe === true

                return allowReceive === true
            })

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }
}