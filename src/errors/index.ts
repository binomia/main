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


export const errorCode: any = {
    [ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED]: 400,
    [ApolloServerErrorCode.INTERNAL_SERVER_ERROR]: 500,
    [ApolloServerErrorCode.BAD_USER_INPUT]: 400,
    [ApolloServerErrorCode.PERSISTED_QUERY_NOT_SUPPORTED]: 400,
    [ApolloServerErrorCode.BAD_REQUEST]: 400,
    [ApolloServerErrorCode.PERSISTED_QUERY_NOT_FOUND]: 400,
    [ApolloServerErrorCode.GRAPHQL_PARSE_FAILED]: 400,
}