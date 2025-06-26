import { GraphQLError } from "graphql";
import { ApolloServerErrorCode } from '@apollo/server/errors'

export const graphQLError = (callBack: Function) => {
    const { GRAPHQL_VALIDATION_FAILED } = ApolloServerErrorCode
    console.log({ GRAPHQL_VALIDATION_FAILED });

    if (GRAPHQL_VALIDATION_FAILED) {
        throw new GraphQLError('You are not authorized to perform this action.',);
    }

    return callBack
}


export class CustomError extends Error {
    private extensions: any
    constructor(message: string, code: number) {
        super(message);

        this.stack = new Error().stack
        this.message = message
        // this.extensions = {
        //     code,
        //     http: {
        //         status: errorCode[code]
        //     },
        //     stacktrace: null
        // }
        // this.extensions.code = 'INTERNAL_SERVER_ERROR_Hello_Hello'
    }
}


export const errorCode: any = {
    [ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED]: 400,
    [ApolloServerErrorCode.INTERNAL_SERVER_ERROR]: 500,
    [ApolloServerErrorCode.BAD_USER_INPUT]: 400,
    [ApolloServerErrorCode.PERSISTED_QUERY_NOT_SUPPORTED]: 400,
    [ApolloServerErrorCode.BAD_REQUEST]: 400,
    [ApolloServerErrorCode.PERSISTED_QUERY_NOT_FOUND]: 400,
    [ApolloServerErrorCode.GRAPHQL_PARSE_FAILED]: 400,
}