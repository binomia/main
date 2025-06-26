import { AccountController } from '@/controllers'


const type = () => {
    return `
        input AccountInput {
            balance: Float
            status: String
            sendLimit: Float
            receiveLimit: Float
            withdrawLimit: Float
            hash: String
            currency: String
        }

        input AccountPermissionsInput {
            allowReceive: Boolean
            allowWithdraw: Boolean
            allowSend: Boolean
            allowRequestMe: Boolean
            allowDeposit: Boolean

            allowWhatsappNotification: Boolean
            allowEmailNotification: Boolean
            allowSmsNotification: Boolean
            allowPushNotification: Boolean
        }

        type OnlyAccountType {
            id:  Int
            balance: Float
            allowReceive: Boolean
            allowWithdraw: Boolean
            allowSend: Boolean
            allowRequestMe: Boolean
            allowDeposit: Boolean
            allowWhatsappNotification: Boolean
            allowEmailNotification: Boolean
            allowSmsNotification: Boolean
            allowPushNotification: Boolean
            status: String
            sendLimit: Float
            receiveLimit: Float
            withdrawLimit: Float
            depositLimit: Float
            hash: String
            currency: String
            createdAt: String
            updatedAt: String
        }

        type AccountPermissionsType {            
            allowReceive: Boolean
            allowWithdraw: Boolean
            allowSend: Boolean
            allowRequestMe: Boolean
            allowDeposit: Boolean  
        }
       
        type AccountTypeWithTransactions {
            id:  Int
            balance: Float
            allowReceive: Boolean
            allowWithdraw: Boolean
            allowSend: Boolean
            allowRequestMe: Boolean
            allowDeposit: Boolean
            status: String
            sendLimit: Float
            receiveLimit: Float
            withdrawLimit: Float
            depositLimit: Float
            hash: String
            currency: String
            createdAt: String
            updatedAt: String

            transactions: [OnlyTransactionType]
        }

        type AccountTypeWithUser {
            id:  Int
            balance: Float
            allowReceive: Boolean
            allowWithdraw: Boolean
            allowSend: Boolean
            allowRequestMe: Boolean
            allowDeposit: Boolean
            status: String
            sendLimit: Float
            receiveLimit: Float
            withdrawLimit: Float
            depositLimit: Float
            hash: String
            currency: String
            createdAt: String
            updatedAt: String

            user: OnlyUserType
        }

        type AccountType {
            id:  Int
            balance: Float
            allowReceive: Boolean
            allowWithdraw: Boolean
            allowSend: Boolean
            allowRequestMe: Boolean
            allowDeposit: Boolean
            status: String
            sendLimit: Float
            receiveLimit: Float
            withdrawLimit: Float
            depositLimit: Float
            hash: String
            currency: String
            createdAt: String
            updatedAt: String

            user: OnlyUserType
            transactions: [TransactionType]
        }

        type AccountLimitsType {
            receivedAmount: Float
            withdrawAmount: Float
            sentAmount: Float
            depositAmount: Float
        }
    `
}

const query = () => {
    return `
        account: OnlyAccountType
        accounts(page: Int!, pageSize: Int!): [AccountType]
        accountPermissions: AccountPermissionsType
        searchAccounts(search: AccountInput!, limit: Int): [AccountType]
        accountLimit: AccountLimitsType
    `
}

const mutation = () => {
    return `
        updateAccountPermissions(data: AccountPermissionsInput): OnlyAccountType
    `
}
const subscription = () => { }

const { accounts, account, accountPermissions, updateAccountPermissions, accountLimit } = AccountController
const resolvers = {
    query: {
        accounts,
        account,
        accountPermissions,
        accountLimit
    },

    mutation: {
        updateAccountPermissions
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