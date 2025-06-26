import { checkForProtectedRequests } from '@/helpers'
import { GraphQLError } from 'graphql';
import { ZERO_SIGN_PRIVATE_KEY, ZERO_ENCRYPTION_KEY } from '@/constants';
import { seedDatabase } from '@/../seed';
import { HASH, RSA } from 'cryptografia';



export class GlobalController {
    static signData = async (_: unknown, { hash }: { hash: string }, context: any) => {
        try {
            await checkForProtectedRequests(context.req);
            const hashData = await HASH.sha256Async(JSON.stringify({
                hash,
                ZERO_ENCRYPTION_KEY,
                ZERO_SIGN_PRIVATE_KEY
            }))

            console.log({ hashData, ZERO_ENCRYPTION_KEY, hash });

            const signature = await RSA.sign(hashData, ZERO_SIGN_PRIVATE_KEY)
            return signature

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

    static test = async (_: unknown, { hash }: { hash: string }, { req }: { req: any }) => {
        try {
            await seedDatabase()
            // const session = await checkForProtectedRequests(req);

            return null;

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }

}