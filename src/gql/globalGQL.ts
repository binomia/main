import { CardsController, GlobalController } from '@/controllers'


const type = () => {
    return `
    `
}


const query = () => {
    return `
        test: String
    `
}

const mutation = () => {
    return `  
        signData(hash: String): String  
    `
}

const subscription = () => {
    return ``
}

const { signData, test } = GlobalController
const resolvers = {
    query: {
        test
    },
    mutation: {
        signData
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