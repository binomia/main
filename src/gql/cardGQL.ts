import { CardsController } from '@/controllers'


const type = () => {
    return `
        input CardInput {
            isPrimary: Boolean
            cardNumber: String
            cvv: String
            alias: String
            expirationDate: String
            cardHolderName: String
        }

        type DecryptedCardType {
            isPrimary: Boolean
            cardNumber: String
            cvv: String
            alias: String
            expirationDate: String
            cardHolderName: String
            createdAt: String
            updatedAt: String
        }

        
        type CardType {
            id:  Int
            last4Number: String
            hash: String
            isPrimary: Boolean
            brand: String
            alias: String
            data: String
            user: OnlyUserType
            createdAt: String
            updatedAt: String
        }
      
        type OnlyCardType {
            id:  Int
            last4Number: String
            isPrimary: Boolean
            hash: String
            brand: String
            alias: String
            data: String
            user: OnlyUserType
            createdAt: String
            updatedAt: String
        }
    `
}


const query = () => {
    return `
        card(cardId: Int!): DecryptedCardType
        cards: [CardType]
    `
}

const mutation = () => {
    return `  
        createCard(data: CardInput!): CardType       
        deleteCard(hash: String!): CardType
        updateCard(cardId: Int!, data: CardInput!): CardType       
    `
}

const subscription = () => {
    return ``
}

const { createCard, deleteCard,updateCard, card, cards } = CardsController
const resolvers = {
    query: {
        card,
        cards
    },
    mutation: {
        createCard,
        deleteCard,
        updateCard
    },
    subscription: {

    }
}

export default {
    type,
    query,
    mutation,
    subscription,
    resolvers
}