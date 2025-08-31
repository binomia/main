import { z } from 'zod'


export class TopUpSchema {
    static topUpLocation = z.object({
        latitude: z.number().default(0).transform(v => v ?? 0),
        longitude: z.number().default(0).transform(v => v ?? 0),
        neighbourhood: z.string().nullish().transform(v => v ?? ""),
        sublocality: z.string().nullish().transform(v => v ?? ""),
        municipality: z.string().nullish().transform(v => v ?? ""),
        fullArea: z.string().nullish().transform(v => v ?? ""),
    })
    static createTopUp = z.object({
        fullName: z.string(),
        phone: z.string(),
        amount: z.number().positive(),
        companyId: z.number(),
        location: TopUpSchema.topUpLocation,
        response: z.object({
            userId: z.number(),
            amount: z.number().positive(),
            status: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
            user: z.object({
                fullName: z.string(),
            }),
            company: z.object({
                logo: z.string(),
            }),
            phone: z.object({
                fullName: z.string(),
                phone: z.string(),
                lastUpdated: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
                companyId: z.number(),
                userId: z.number()
            })
        })
    })

    static recurrenceTopUp = z.object({
        title: z.string(),
        time: z.string()
    })
}
