import { TransactionsController } from '@/controllers'


const type = () => {
    return `
        input TransactionLocationInput {
            latitude: Float
            longitude: Float
            neighbourhood: String
            sublocality: String
            municipality: String
            fullArea: String            
        }  

        input TransactionInput {
            receiver: String
            amount: Float
            transactionType: String
            currency: String
            location: TransactionLocationInput
        }
            
        input TransactionRecurrenceInput {
            title: String
            time: String
        }

        input UpdateQueuedTransactionInput {
            repeatJobKey: String
            queueType: String
            jobName: String
            jobTime: String
        }

        input BankingTransactionInput {
            amount: Float
            transactionType: String
            currency: String
            location: TransactionLocationInput
        }

        type TransactionType {
            id: Int
            transactionId: String
            amount: Float
            deliveredAmount: Float         
            voidedAmount: Float
            transactionType: String
            currency: String
            status: String
            location: TransactionLocationType
            createdAt: String
            updatedAt: String
            from: AccountTypeWithUser
            to: AccountTypeWithUser
        }

        type TransactionLocationType {
            latitude: Float
            longitude: Float
            uri: String
            neighbourhood: String
            sublocality: String
            municipality: String
            fullArea: String
        } 

        type TransactionCreatedType {
            transactionId: String
            amount: Float
            deliveredAmount: Float
            voidedAmount: Float
            transactionType: String
            currency: String
            status: String
            location: TransactionLocationType
            createdAt: String
            updatedAt: String
            receiver: OnlyUserType
        }  
            
        type BankingTransactionType {
            transactionId: String
            amount: Float
            deliveredAmount: Float         
            voidedAmount: Float
            transactionType: String
            currency: String
            status: String
            location: TransactionLocationType
            createdAt: String
            updatedAt: String
            account: AccountTypeWithUser
            card: OnlyCardType
            data: JSON
        }

        type BankingTransactionCreatedType {
            transactionId: String
            amount: Float
            deliveredAmount: Float
            voidedAmount: Float
            transactionType: String
            currency: String
            status: String
            location: TransactionLocationType
            createdAt: String
            updatedAt: String
            account: AccountTypeWithUser
            card: OnlyCardType
            data: JSON
        }   

        type OnlyTransactionType {
            id: Int
            transactionId: String
            amount: Float
            deliveredAmount: Float
            voidedAmount: Float
            transactionType: String
            currency: String
            status: String
            location: TransactionLocationType
            createdAt: String
            updatedAt: String
        }

        type TransactionsWithAccountType {
            id: Int
            transactionId: String
            amount: Float
            deliveredAmount: Float
            voidedAmount: Float
            transactionType: String
            currency: String
            status: String
            location: TransactionLocationType
            fromAccount: OnlyAccountType
            toAccount: OnlyAccountType
            createdAt: String
            updatedAt: String            
        }

        type RecurrentTransactionType {
            jobId: String
            repeatJobKey: String
            jobTime: String
            jobName: String
            status: String
            repeatedCount: Float
            amount: Float
            data: JSON
            referenceData: JSON
            signature: String
            receiver: AccountTypeWithUser
            sender: AccountTypeWithUser
            createdAt: String
            updatedAt: String
        }
       
        type OnlyRecurrentTransactionType {
            jobId: String
            repeatJobKey: String
            jobTime: String
            queueType: String
            jobName: String
            status: String
            repeatedCount: Float
            amount: Float
            data: JSON
            user: OnlyUserType
            referenceData: JSON
            signature: String          
            createdAt: String
            updatedAt: String
        }

        type RecentTransactionsType {
            type: String
            data: JSON
        }
    `
}


const query = () => {
    return `
        transaction(transactionId: String!): TransactionType
        accountTransactions(page: Int!, pageSize: Int!): [TransactionType]
        searchAccountTransactions(page: Int!, pageSize: Int!, fullName: String!): [TransactionType]
        accountRecurrentTransactions(page: Int!, pageSize: Int!): [OnlyRecurrentTransactionType]
        accountBankingTransactions(page: Int!, pageSize: Int!): [BankingTransactionType]
    `
}

const mutation = () => {
    return `
        deleteRecurrentTransactions(repeatJobKey: String!, queueType: String): OnlyRecurrentTransactionType
        updateRecurrentTransactions(data: UpdateQueuedTransactionInput!): OnlyRecurrentTransactionType
        createTransaction(message: String!): TransactionType
        payRequestTransaction(transactionId: String!, paymentApproved: Boolean!): TransactionType
        createRequestTransaction(message: String!): TransactionType
        cancelRequestedTransaction(transactionId: String!): TransactionType
        createBankingTransaction(cardId: Int!, data: BankingTransactionInput!): BankingTransactionCreatedType
    `
}

const subscription = () => {
    return ``
}

const { createTransaction, transaction, cancelRequestedTransaction, searchAccountTransactions, updateRecurrentTransactions, payRequestTransaction, createRequestTransaction, deleteRecurrentTransactions, accountBankingTransactions, accountRecurrentTransactions, accountTransactions, createBankingTransaction } = TransactionsController
const resolvers = {
    query: {
        transaction,
        accountTransactions,
        searchAccountTransactions,
        accountBankingTransactions,
        accountRecurrentTransactions
    },
    mutation: {
        createTransaction,
        createRequestTransaction,
        cancelRequestedTransaction,
        payRequestTransaction,
        createBankingTransaction,
        deleteRecurrentTransactions,
        updateRecurrentTransactions
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