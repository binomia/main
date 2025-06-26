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
        location: TopUpSchema.topUpLocation
    })

    static recurrenceTopUp = z.object({
        title: z.string(),
        time: z.string()
    })
}
