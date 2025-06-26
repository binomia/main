import { z } from 'zod'

export class CardAuthSchema {
    static createCard = z.object({
        cardHolderName: z.string(),
        cardNumber: z.string(),
        cvv: z.string(),
        expirationDate: z.string(),
        alias: z.string(),
        isPrimary: z.boolean().default(false)
    })
    
    static updateCard = CardAuthSchema.createCard.extend({})
}