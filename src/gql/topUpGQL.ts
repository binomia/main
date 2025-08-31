import { TopUpController } from '@/controllers'


const type = () => {
    return `
        input TopUpLocationInput {
            latitude: Float
            longitude: Float
            neighbourhood: String
            sublocality: String
            municipality: String
            fullArea: String
            
        }
        input TopUpInput {
            fullName: String
            phone: String
            amount: Float
            companyId: Int
            location: TopUpLocationInput
        }

        input TopUpRecurrenceInput {
            title: String
            time: String
        }

        type TopUpLocationType {
            latitude: Float
            longitude: Float
            neighbourhood: String
            sublocality: String
            municipality: String
            fullArea: String
        } 


        type TopUpCompany {
            id: ID
            uuid: String
            status: String
            name: String
            logo: String
            createdAt: String
            updatedAt: String
        }

        type PhoneTopUpType {
            id: ID
            fullName: String
            phone: String
            createdAt: String
            updatedAt: String
        }

        type PhoneWithCompanyTopUpType {
            id: ID
            fullName: String
            phone: String
            createdAt: String
            updatedAt: String
            company: TopUpCompany
        }

        type TopUpsType {
            id: ID
            status: String
            amount: Float
            referenceId: String
            createdAt: String
            updatedAt: String
            phone: PhoneTopUpType
            user: OnlyUserType
            company: TopUpCompany
            location: TopUpLocationType
        }

        type OnlyTopUpsType {
            id: ID
            status: String
            amount: Float
            referenceId: String
            createdAt: String
            updatedAt: String  
            location: TopUpLocationType         
        }

        type SearchTopUpsType {
            type: String
            timestamp: String            
            data: TopUpsType
        }
    `
}


const query = () => {
    return `
        topUp(referenceId: String!): OnlyTopUpsType
        topUps(phoneId: Int!, page: Int!, pageSize: Int!): [TopUpsType]
        searchTopUps(page: Int!, pageSize: Int!, search: String!): [SearchTopUpsType]
        recentTopUps(page: Int!, pageSize: Int!): [TopUpsType]
        topUpPhones(page: Int!, pageSize: Int!): [PhoneWithCompanyTopUpType]
        topUpCompanies: [TopUpCompany]
    `
}

const mutation = () => {
    return `
        createTopUp(message: String!): TopUpsType
    `
}


const subscription = () => {
    return ``
}

const { topUps, topUp, searchTopUps, recentTopUps, topUpPhones, createTopUp, topUpCompanies } = TopUpController
const resolvers = {
    query: {
        topUp,
        topUps,
        recentTopUps,
        topUpPhones,
        topUpCompanies,
        searchTopUps
    },
    mutation: {
        createTopUp
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