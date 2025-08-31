import { AccountModelType } from "./accountTypes";
import { CardModelType } from "./cardTypes";
import { SessionModelType } from "./sessionTypes";
import { UserModelType } from "./userTypes";
import { TransactionModelType,RecurrenceTransactionType, TransactionCreateType, BankingTransactionCreateType,  TransactionAuthorizationType } from "./transactionTypes";
import { z } from "zod";
import { TransactionJoiSchema } from "@/auth/transactionJoiSchema";


type CurrencyType = "DOP" | "USD" | "EUR"

export type WeeklyQueueTitleType = z.infer<typeof TransactionJoiSchema.weeklyQueueTitle>
export type MonthlyQueueTitleType = z.infer<typeof TransactionJoiSchema.monthlyQueueTitle>
export type CreateTransactionType = z.infer<typeof TransactionJoiSchema.createTransaction>


export type VerificationDataType = {
    token: string
    signature: string,
}

export type EmailMessageType = {
    subject: string
    message: string
    html: string
}


export {
    UserModelType,
    AccountModelType,
    TransactionModelType,
    TransactionCreateType,
    TransactionAuthorizationType,
    BankingTransactionCreateType,
    RecurrenceTransactionType,
    CardModelType,
    SessionModelType,
    CurrencyType
}