import { z } from 'zod'

export class TransactionJoiSchema {
    static transaction = z.object({
        transactionId: z.string(),
        amount: z.number(),
        deliveredAmount: z.number(),
        voidedAmount: z.number(),
        transactionType: z.string(),
        currency: z.string(),
        status: z.string(),
        location: z.object({}).passthrough(),
        senderFullName: z.string(),
        receiverFullName: z.string(),
        signature: z.string(),
        deviceId: z.string(),
        ipAddress: z.string(),
        previousBalance: z.number(),
        isRecurring: z.boolean(),
        fraudScore: z.number(),
        platform: z.string(),
        speed: z.number()
    })

    static transactionLocation = z.object({
        latitude: z.number().default(0).transform(v => v ?? 0),
        longitude: z.number().default(0).transform(v => v ?? 0),
        neighbourhood: z.string().nullish().transform(v => v ?? ""),
        sublocality: z.string().nullish().transform(v => v ?? ""),
        municipality: z.string().nullish().transform(v => v ?? ""),
        fullArea: z.string().nullish().transform(v => v ?? ""),
        uri: z.string().nullish().transform(v => v ?? "")
    })

    static createTransaction = z.object({
        amount: z.number().gt(0),
        currency: z.enum(["DOP"]),
        receiver: z.string(),
        transactionType: z.enum(["transfer", "request"]),
        location: TransactionJoiSchema.transactionLocation
    })


    static recurrenceTransaction = z.object({
        title: z.string(),
        time: z.string()
    })

    // extende the create transaction schema but forbid the receiver
    static bankingCreateTransaction = TransactionJoiSchema.createTransaction.omit({ receiver: true }).extend({
        transactionType: z.enum(["deposit", "withdraw"])
    })

    static recurrenceQueueTransaction = TransactionJoiSchema.createTransaction.extend({
        id: z.number(),
        transactionId: z.string(),
        sender: z.string()
    })

    static weeklyQueueTitle = z.enum(["everySunday", "everyMonday", "everyTuesday", "everyWednesday", "everyThursday", "everyFriday", "everySaturday"])


    static validateTransaction = z.object({
        amount: z.number(),
        currency: z.string(),
        transactionType: z.string(),
        sender: z.object({}).passthrough(),
        receiver: z.object({}).passthrough(),
        location: z.object({
            latitude: z.number(),
            longitude: z.number()
        })
    })

    static monthlyQueueTitle = z.enum([
        'everyFirst',
        'everySecond',
        'everyThird',
        'everyFourth',
        'everyFifth',
        'everySixth',
        'everySeventh',
        'everyEighth',
        'everyNinth',
        'everyTenth',
        'everyEleventh',
        'everyTwelfth',
        'everyThirteenth',
        'everyFourteenth',
        'everyFifteenth',
        'everySixteenth',
        'everySeventeenth',
        'everyEighteenth',
        'everyNineteenth',
        'everyTwentieth',
        'everyTwentyFirst',
        'everyTwentySecond',
        'everyTwentyThird',
        'everyTwentyFourth',
        'everyTwentyFifth',
        'everyTwentySixth',
        'everyTwentySeventh',
        'everyTwentyEighth',
    ])
}
