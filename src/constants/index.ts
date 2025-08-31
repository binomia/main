import { GlobalZodSchema } from "@/auth"

const evironmentVariables = GlobalZodSchema.evironmentVariables.parse(process.env)
export const {
    PORT,
    REDIS_HOST,
    REDIS_PORT,
    SESSION_SECRET_SECRET_KEY,
    ZERO_ENCRYPTION_KEY,
    NOTIFICATION_SERVER_URL,
    ZERO_SIGN_PRIVATE_KEY,
    ZERO_SIGN_PUBLIC_KEY,
    QUEUE_SERVER_URL,
    LOKI_URL,
    LOKI_USERNAME,
    LOKI_PASSWORD

} = evironmentVariables


export const NOTIFICATION_REDIS_SUBSCRIPTION_CHANNEL = {
    NOTIFICATION_TRANSACTION_CREATED: "NOTIFICATION_TRANSACTION_CREATED",
    NOTIFICATION_TRANSACTION_REQUEST_PAIED: "NOTIFICATION_TRANSACTION_REQUEST_PAIED",
    NOTIFICATION_BANKING_TRANSACTION_CREATED: "NOTIFICATION_BANKING_TRANSACTION_CREATED",
    NOTIFICATION_LOGIN_VERIFICATION_CODE: "NOTIFICATION_LOGIN_VERIFICATION_CODE",
    NOTIFICATION_TRANSACTION_CREATED_FROM_QUEUE: "NOTIFICATION_TRANSACTION_CREATED_FROM_QUEUE",
    NOTIFICATION_TRANSACTION_REQUEST_CANCELED: "NOTIFICATION_TRANSACTION_REQUEST_CANCELED",
    NOTIFICATION_QUEUE_TRANSACTION_CREATED: "NOTIFICATION_QUEUE_TRANSACTION_CREATED"
}


export const REDIS_SUBSCRIPTION_CHANNEL = {
    TRANSACTION_CREATED: "TRANSACTION_CREATED",
    TRANSACTION_REQUEST_PAIED: "TRANSACTION_REQUEST_PAIED",
    TRANSACTION_REQUEST_CANCELED: "TRANSACTION_REQUEST_CANCELED",
    BANKING_TRANSACTION_CREATED: "BANKING_TRANSACTION_CREATED",
    LOGIN_VERIFICATION_CODE: "LOGIN_VERIFICATION_CODE",
    PROMETHEUS_METRICS: "PROMETHEUS_METRICS",
}


export const QUEUE_JOBS_NAME = {
    CREATE_TRANSACTION: "CREATE_TRANSACTION",
    QUEUE_REQUEST_TRANSACTION: "QUEUE_REQUEST_TRANSACTION",
    PENDING_TRANSACTION: "PENDING_TRANSACTION",
    QUEUE_TRANSACTION: "QUEUE_TRANSACTION",
    QUEUE_TOPUP: "QUEUE_TOPUP",
    PENDING_TOPUP: "PENDING_TOPUP",
    CREATE_TOPUP: "CREATE_TOPUP",
    REMOVE_TRANSACTION_FROM_QUEUE: "REMOVE_TRANSACTION_FROM_QUEUE",
}




export const CRON_JOB_EVERY_HALF_HOUR_PATTERN = '0 */30 * * *' // every 30 minutes
export const CRON_JOB_BIWEEKLY_PATTERN = '0 0 1,16 * *' // every 1st and 16th of the month
export const CRON_JOB_WEEKLY_PATTERN = {
    everySunday: '0 1 0 * * 0',    // Every Sunday at 12:01 AM
    everyMonday: '0 1 0 * * 1',    // Every Monday at 12:01 AM
    everyTuesday: '0 1 0 * * 2',   // Every Tuesday at 12:01 AM
    everyWednesday: '0 1 0 * * 3', // Every Wednesday at 12:01 AM
    everyThursday: '0 1 0 * * 4',  // Every Thursday at 12:01 AM
    everyFriday: '0 1 0 * * 5',    // Every Friday at 12:01 AM
    everySaturday: '0 1 0 * * 6',  // Every Saturday at 12:01 AM
};

export const CRON_JOB_MONTHLY_PATTERN = {
    everyFirst: '0 1 0 1 * *',       // 1st day of every month at 12:01 AM
    everySecond: '0 1 0 2 * *',         // 2nd day of every month at 12:01 AM
    everyThird: '0 1 0 3 * *',          // 3rd day of every month at 12:01 AM
    everyFourth: '0 1 0 4 * *',         // 4th day of every month at 12:01 AM
    everyFifth: '0 1 0 5 * *',          // 5th day of every month at 12:01 AM
    everySixth: '0 1 0 6 * *',          // 6th day of every month at 12:01 AM
    everySeventh: '0 1 0 7 * *',        // 7th day of every month at 12:01 AM
    everyEighth: '0 1 0 8 * *',         // 8th day of every month at 12:01 AM
    everyNinth: '0 1 0 9 * *',          // 9th day of every month at 12:01 AM
    everyTenth: '0 1 0 10 * *',         // 10th day of every month at 12:01 AM
    everyEleventh: '0 1 0 11 * *',      // 11th day of every month at 12:01 AM
    everyTwelfth: '0 1 0 12 * *',       // 12th day of every month at 12:01 AM
    everyThirteenth: '0 1 0 13 * *',    // 13th day of every month at 12:01 AM
    everyFourteenth: '0 1 0 14 * *',    // 14th day of every month at 12:01 AM
    everyFifteenth: '0 1 0 15 * *',     // 15th day of every month at 12:01 AM
    everySixteenth: '0 1 0 16 * *',     // 16th day of every month at 12:01 AM
    everySeventeenth: '0 1 0 17 * *',   // 17th day of every month at 12:01 AM
    everyEighteenth: '0 1 0 18 * *',    // 18th day of every month at 12:01 AM
    everyNineteenth: '0 1 0 19 * *',    // 19th day of every month at 12:01 AM
    everyTwentieth: '0 1 0 20 * *',     // 20th day of every month at 12:01 AM
    everyTwentyFirst: '0 1 0 21 * *',   // 21st day of every month at 12:01 AM
    everyTwentySecond: '0 1 0 22 * *',  // 22nd day of every month at 12:01 AM
    everyTwentyThird: '0 1 0 23 * *',   // 23rd day of every month at 12:01 AM
    everyTwentyFourth: '0 1 0 24 * *',  // 24th day of every month at 12:01 AM
    everyTwentyFifth: '0 1 0 25 * *',   // 25th day of every month at 12:01 AM
    everyTwentySixth: '0 1 0 26 * *',   // 26th day of every month at 12:01 AM
    everyTwentySeventh: '0 1 0 27 * *', // 27th day of every month at 12:01 AM
    everyTwentyEighth: '0 1 0 28 * *',  // 28th day of every month at 12:01 AM
    everyTwentyNinth: '0 1 0 L * *',    // Last day of every month at 12:01 AM
    everyThirtieth: '0 1 0 L * *',      // Last day of every month at 12:01 AM
    everyThirtyFirst: '0 1 0 L * *'     // Last day of every month at 12:01 AM
};

