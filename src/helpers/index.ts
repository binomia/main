import { AccountModel, CardsModel, LedgerModel, SessionModel, UsersModel } from '@/models';
import KYCModel from '@/models/kycModel';
import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import { ZERO_ENCRYPTION_KEY } from '@/constants';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { z } from 'zod'
import redis, { connection } from '@/redis';
import * as zlib from 'zlib';
import { Queue } from 'bullmq';
import { AES } from 'cryptografia';

export const notificationsQueue = new Queue("notifications", { connection });

export const insertLadger = async ({ sender, receiver }: any) => {
    try {
        await Promise.all([
            LedgerModel.create(sender),
            LedgerModel.create(receiver)
        ])
    } catch (error) {
        console.log({ insertLadger: error })
    }
}



export const getRecurrenceTopUps = async ({ userId, queue }: { userId: string, queue: Queue }) => {
    try {
        const getJobs = await queue.getJobs(["delayed"])
        const jobs = await Promise.all(
            getJobs.map(async job => {
                const jsonData = job.asJSON()

                const decryptedData = await AES.decryptAsync(JSON.parse(jsonData.data), ZERO_ENCRYPTION_KEY)
                const response = JSON.parse(decryptedData).response

                if (response?.userId === userId && response.isRecurrence)
                    return response

                return []

            }).flat()
        )

        return jobs.flat()

    } catch (error: any) {
        console.log({ error });
        throw new Error(error);
    }
}
export const getWaitingTopUps = async ({ userId, queue }: { userId: string, queue: Queue }) => {
    try {
        const getJobs = await queue.getJobs(["waiting"])
        const jobs = await Promise.all(
            getJobs.map(async job => {
                const jsonData = job.asJSON()

                const decryptedData = await AES.decryptAsync(JSON.parse(jsonData.data), ZERO_ENCRYPTION_KEY)
                const response = JSON.parse(decryptedData).response

                if (response?.userId === userId)
                    return response

                return []

            }).flat()
        )

        return jobs.flat()

    } catch (error: any) {
        console.log({ error });
        throw new Error(error);
    }
}
export const getRecurrenceTransactions = async ({ userId, queue }: { userId: string, queue: Queue }) => {
    try {
        const getJobs = await queue.getJobs(["delayed"])

        const jobs = await Promise.all(
            getJobs.map(async job => {
                const jsonData = job.asJSON()

                const decryptedData = await AES.decryptAsync(JSON.parse(jsonData.data), ZERO_ENCRYPTION_KEY)
                const response = JSON.parse(decryptedData).response

                if (response?.userId === userId && response.isRecurrence)
                    return response

                return []
            }).flat()
        )

        return jobs.flat()

    } catch (error: any) {
        console.log({ error });
        throw new Error(error);
    }
}
export const getWaitingTransactions = async ({ userId, queue }: { userId: string, queue: Queue }) => {
    try {
        const getJobs = await queue.getJobs(["waiting"])
        const jobs = await Promise.all(
            getJobs.map(async job => {
                const jsonData = job.asJSON()
                const decryptedData = await AES.decryptAsync(JSON.parse(jsonData.data), ZERO_ENCRYPTION_KEY)

                const response = JSON.parse(decryptedData).response
                if (response?.userId === userId)
                    return response

                return []
            }).flat()
        )

        return jobs.flat()

    } catch (error: any) {
        console.log({ error });
        throw new Error(error);
    }
}

export function compressData(data: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        zlib.gzip(data, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

export function decompressData(data: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        zlib.gunzip(data, (err, result) => {
            if (err) reject(err);
            else resolve(result.toString());
        });
    });
}

const getGqlBody = (fieldNodes: any[], schema: string) => {
    let body: any = {
        [schema]: []
    }

    const gqlSchemas = [
        "topUpPhones",
        "phone",
        "phones",
        "user",
        "company",
        "companies",
        "kyc",
        "users",
        "account",
        "accounts",
        "card",
        "cards",
        "receiver",
        "sender",
        "to",
        "from",
        "transactions",
        "transaction"
    ];

    fieldNodes?.forEach((item: any) => {
        if (item.kind === 'Field') {
            if (!gqlSchemas.includes(item.name.value)) {
                if (item.name.value !== "__typename") {
                    body[schema].push(item.name.value)
                }
            } else {
                const items = getGqlBody(item.selectionSet?.selections, item.name.value)
                body = Object.assign(body, items)
            }
        }
    })

    return body
}

export const getQueryResponseFields = (fieldNodes: any[], name: string) => {
    const selections = fieldNodes[0].selectionSet?.selections;
    const fields = getGqlBody(selections, name)

    return fields
}

export const addFutureDate = (day: number = 30): number => {
    const currentDate = new Date();
    const futureDate = new Date(currentDate.setDate(currentDate.getDate() + day));
    return futureDate.getTime();
}

export const hashPassword = (password: string): Promise<string> => {
    const saltRounds = 10;
    const hashedPassword = bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    const isMatch = bcrypt.compareSync(password, hashedPassword)
    return isMatch
}

export const formatCedula = (value: string): string => {
    if (value.length <= 3 && value !== "") {
        return value.replaceAll("-", "")
    }
    else if (value.length > 3 && value.length <= 10) {
        const formattedValue = value.slice(0, 3) + "-" + value.slice(3)
        return formattedValue
    }
    else if (value.length > 10 && value.length <= 11) {
        const formattedValue = value.slice(0, 3) + "-" + value.slice(3, 10) + "-" + value.slice(10, 11);
        return formattedValue
    }
    return value
}

export const generateUUID = (): string => {
    const inputString = Date.now().toString().slice(1, 12)

    if (inputString.length === 11) {
        const formattedString =
            inputString[0] +
            "-" +
            inputString.slice(0, 3) +
            "-" +
            inputString.slice(3, 10) +
            "-" +
            inputString.slice(10);

        return formattedString.toString();

    } else {
        return inputString.toString();
        // throw new Error("Invalid input string length");
    }
}

export const IDENTIFY_CARD_TYPE = (cardNumber: string): string | undefined => {
    cardNumber = cardNumber.replace(/[\s-]/g, "");

    const cardPatterns: { [key: string]: RegExp } = {
        "visa": /^4/,                                    // Visa: starts with 4
        "mastercard": /^5[1-5]/,                         // MasterCard: starts with 51-55
        "american-express": /^3[47]/,                    // Amex: starts with 34 or 37
        "jcb": /^(?:2131|1800|35)/,                      // JCB: starts with 2131, 1800, or 35
        "discover": /^6(?:011|5)/,                       // Discover: starts with 6011 or 65
        "diners-club": /^3(?:0[0-5]|[689])/,             // Diners Club: starts with 300-305, 3095, or 36/38
    };

    // Identify the card type based on the initial digits
    for (const cardType in cardPatterns) {
        if (cardPatterns[cardType].test(cardNumber))
            return cardType;
    }

    return undefined;  // Return undefined if no match is found
};

export const IS_VALID_CARD_LENGTH = (cardNumber: string): boolean => {
    // Identify the card type
    const cardType = IDENTIFY_CARD_TYPE(cardNumber);
    if (!cardType) return false; // Invalid card type

    // Define valid lengths for each card type
    const cardLengths: { [key: string]: number[] } = {
        "visa": [13, 16, 19],
        "mastercard": [16],
        "american-express": [15],
        "jcb": [15, 16],
        "discover": [16],
        "diners-club": [14],
    };

    // Get the length of the card number
    const length = cardNumber.replace(/[\s-]/g, "").length; // Remove spaces and dashes, then get length

    // Check if the length is valid for the identified card type
    return cardLengths[cardType].includes(length);
};

export const checkForProtectedRequests = async (req: any) => {
    try {
        const deviceid = await z.string().length(64).transform((val) => val.trim()).parseAsync(req.headers["deviceid"]);
        const token = await z.string().min(1).transform((val) => val.trim()).parseAsync(req.headers["authorization"]);
        const jwtToken = token.split(' ')[1];

        const jwtVerifyAsync = new Promise((resolve, reject) => {
            jwt.verify(jwtToken, ZERO_ENCRYPTION_KEY, (err: any, payload: any) => {
                if (err) {
                    reject(err);
                }
                else
                    resolve(payload);
            });
        });

        return await jwtVerifyAsync.then(async (data: any) => {
            const jwtData = await z.object({
                sid: z.string().min(1).transform((val) => val.trim())
            }).parseAsync(data);

            const cachedSession = await redis.get(`session@${jwtData.sid}`)

            if (cachedSession) {
                req.session = JSON.parse(cachedSession)
                return JSON.parse(cachedSession)
            }

            const session = await SessionModel.findOne({
                where: {
                    [Op.and]: [
                        { sid: jwtData.sid },
                        { verified: true }
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
                throw new GraphQLError("INVALID_SESSION: No session found")

            const sessionJSON = session.toJSON()
            if (jwtToken !== sessionJSON.jwt || deviceid !== sessionJSON.deviceId)
                throw new Error("INVALID_SESSION: Invalid token data")

            else
                req.session = session.toJSON()


            await redis.set(`session@${jwtData.sid}`, JSON.stringify(session.toJSON()), 'EX', 10)
            return session.toJSON()

        }).catch((error: any) => {
            console.log({ error });

            const message = error.message === "jwt expired" ? "INVALID_SESSION: Session expired" : error.message
            throw new GraphQLError(message, {
                extensions: {
                    code: "INVALID_SESSION",
                    http: {
                        status: 500
                    }
                }
            })
        })

    } catch (error: any) {
        throw error
    }
}

export const GET_LAST_SUNDAY_DATE = (): Date => {
    const now: Date = new Date();
    const dayOfWeek = now.getDay();
    const daysSinceLastSunday = dayOfWeek === 0 ? 7 : dayOfWeek;

    const lastSunday = new Date(now);
    lastSunday.setDate(now.getDate() - daysSinceLastSunday);
    lastSunday.setHours(0, 0, 0, 1);

    return lastSunday;
}

export const GENERATE_SIX_DIGIT_TOKEN = (): string => {
    const token = Math.floor(100000 + Math.random() * 900000);
    return token.toString();
}

export const formatError = (formattedError: any, _: any) => {
    return {
        message: formattedError.message
    }
}


export const toSnakeCase = (str: string) => {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}


