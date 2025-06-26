export type SessionModelType = {
    id?: number
    jwt: string
    createdAt: Date
    updatedAt: Date
    userId: number
    expires: Date
    data: string
}

