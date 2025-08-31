import { CardsController } from '@/controllers'


const type = () => {
    return `        
        type KYCTypeResponse {
            id:  Int
            data: String
            user: OnlyUserType
            createdAt: String
            updatedAt: String
        }

        type OnlyKYCType {
            id:  Int
            dniNumber: String
            dob: String
            status: String
            expiration: String
            occupation: String
            gender: String
            maritalStatus: String
            bloodType: String
            createdAt: String
            updatedAt: String
        }
    `
}


const query = () => {
    return `
    `
}

const mutation = () => {
    return `        
    `
}

const subscription = () => {
    return ``
}

const {  } = CardsController
const resolvers = {
    query: {
      
    },
    mutation: {
       
    },
    subscription: {
        // 
    }
}

export default {
    type,
    query,
    mutation,
    subscription,
    resolvers
}