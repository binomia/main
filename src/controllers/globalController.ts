import { checkForProtectedRequests } from '@/helpers'
import { GraphQLError } from 'graphql';
import { ZERO_SIGN_PRIVATE_KEY, GOOGLE_PROJECT_NUMBER, ZERO_ENCRYPTION_KEY, GOOGLE_MAPS_API_KEY, GOOGLE_PLAY_INTENITY_URL } from '@/constants';
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

            const signature = await RSA.sign(hashData, ZERO_SIGN_PRIVATE_KEY)
            return signature

        } catch (error: any) {
            throw new GraphQLError(error.message);
        }
    }


    static verifyIntegrity = async (_: unknown, { token }: { token: string }, { req }: { req: any }) => {
        try {
            console.log({ token });
            await checkForProtectedRequests(req);


            const response = await fetch(GOOGLE_PLAY_INTENITY_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${GOOGLE_MAPS_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ integrity_token: token }),
            });

            const data = await response.json();

            return { valid: true, nonce: data }

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