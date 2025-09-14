import { NOTIFICATION_SERVER_URL, ZERO_ENCRYPTION_KEY } from "@/constants";
import { Client, LOAD_BALANCER } from "cromio"

const client = new Client({
    loadBalancerStrategy: LOAD_BALANCER.BEST_BIASED,
    servers: [
        {
            url: NOTIFICATION_SERVER_URL,
            secretKey: ZERO_ENCRYPTION_KEY,
        }
    ]
});

export const notificationServer = async (trigger: string, params: any) => {
    try {
        const response = await client.trigger(trigger, params);
        return response

    } catch (error: any) {
        throw new Error(error);
    }
}
