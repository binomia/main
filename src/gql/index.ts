import { GraphQLJSON } from 'graphql-type-json';
import userGQL from "./userGQL";
import accountGQL from "./accountGQL";
import cardGQL from "./cardGQL";
import transactionGQL from "./transactionGQL";
import globalGQL from "./globalGQL";
import kycGQL from "./kycGQL";
import topUpsGQL from "./topUpGQL";


export const typeDefs = `
    scalar JSON
    scalar JSONObject
    ${userGQL.type()}
    ${accountGQL.type()}
    ${cardGQL.type()}
    ${transactionGQL.type()}
    ${globalGQL.type()}
    ${kycGQL.type()}
    ${topUpsGQL.type()}
    


    type Query {
        ${userGQL.query()}
        ${accountGQL.query()}
        ${cardGQL.query()}
        ${transactionGQL.query()}
        ${globalGQL.query()}
        ${kycGQL.query()}
        ${topUpsGQL.query()}
    }


    type Mutation {
        ${userGQL.mutation()}
        ${cardGQL.mutation()}
        ${accountGQL.mutation()}
        ${transactionGQL.mutation()}
        ${globalGQL.mutation()}
        ${kycGQL.mutation()}
        ${topUpsGQL.mutation()}
    }


    type Subscription {
        ${userGQL.subscription()}
        ${cardGQL.subscription()}
        ${topUpsGQL.subscription()}
    }
`;


export const resolvers = {
    JSON: GraphQLJSON,
    Query: {
        ...userGQL.resolvers.query,
        ...accountGQL.resolvers.query,
        ...cardGQL.resolvers.query,
        ...transactionGQL.resolvers.query,
        ...globalGQL.resolvers.query,
        ...kycGQL.resolvers.query,
        ...topUpsGQL.resolvers.query,

    },

    Mutation: {
        ...userGQL.resolvers.mutation,
        ...accountGQL.resolvers.mutation,
        ...cardGQL.resolvers.mutation,
        ...transactionGQL.resolvers.mutation,
        ...globalGQL.resolvers.mutation,
        ...kycGQL.resolvers.mutation,
        ...topUpsGQL.resolvers.mutation,

    },

    Subscription: {
        ...userGQL.resolvers.subscription,
        ...accountGQL.resolvers.subscription,
        ...cardGQL.resolvers.subscription,
        ...transactionGQL.resolvers.subscription,
        ...globalGQL.resolvers.subscription,
        ...kycGQL.resolvers.subscription,
        ...topUpsGQL.resolvers.subscription,
    }
}

