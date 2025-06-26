import { z } from 'zod'


export class AccountZodSchema {
    static updateAccountPermissions = z.object({
        allowReceive: z.boolean().nullish().optional(),
        allowWithdraw: z.boolean().nullish().optional(),
        allowDeposit: z.boolean().nullish().optional(),
        allowSend: z.boolean().nullish().optional(),
        allowRequestMe: z.boolean().nullish().optional(),

        allowEmailNotification: z.boolean().nullish().optional(),
        allowPushNotification: z.boolean().nullish().optional(),
        allowSmsNotification: z.boolean().nullish().optional(),
        allowWhatsappNotification: z.boolean().nullish().optional()
    })

    static accountLimits = z.object({
        receivedAmount: z.number().nullable().transform((v) => v ?? 0),
        sentAmount: z.number().nullable().transform((v) => v ?? 0),
        depositAmount: z.number().nullable().transform((v) => v ?? 0),
        withdrawAmount: z.number().nullable().transform((v) => v ?? 0),
    })
}
