import { CardsController, GlobalController } from '@/controllers'


const type = () => {
    return `
        type Integrity {
            valid: Boolean
            nonce: String
        }
    `
}


const query = () => {
    return `
        test: String
    `
}

const mutation = () => {
    // /integrity/verify(hash: String): String  
    return `  
        signData(hash: String): String  
        verifyIntegrity(token: String!): Integrity
    `
}

const subscription = () => {
    return ``
}

const { signData, test, verifyIntegrity } = GlobalController
const resolvers = {
    query: {
        test
    },
    mutation: {
        signData,
        verifyIntegrity
    },
    subscription: {}
}

export default {
    type,
    query,
    mutation,
    subscription,
    resolvers
}