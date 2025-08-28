import Joi from 'joi'
import { z } from 'zod'


export class GlobalZodSchema {
    static cresteCard = Joi.object({
        cardNumber: Joi.string().length(16).required(),
        cvv: Joi.string().min(3).max(4).required(),
        expirationDate: Joi.date().required(),
        cardHolderName: Joi.string().required()
    })

    static header = z.object({
        "deviceid": z.string().length(64, 'base64').transform((val) => val.trim()),
        authorization: z.string(),
        device: z.object({}).passthrough().optional().default({}),
    })
    static registerHeader = z.object({
        "deviceid": z.string().length(64, 'base64').transform((val) => val.trim()),
        device: z.string(),
    })

    static evironmentVariables = z.object({
        SESSION_SECRET_SECRET_KEY: z.string(),
        ZERO_ENCRYPTION_KEY: z.string(),
        QUEUE_SERVER_URL: z.string(),
        NOTIFICATION_SERVER_URL: z.string(),
        ZERO_SIGN_PRIVATE_KEY: z.string(),
        ZERO_SIGN_PUBLIC_KEY: z.string(),
        REDIS_HOST: z.string(),
        REDIS_PORT: z.string(),
        PORT: z.string(),
        LOKI_USERNAME: z.string(),
        LOKI_PASSWORD: z.string(),
        LOKI_URL: z.string(),
    })
}
