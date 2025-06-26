import { JSONRPCClient, JSONRPCParams } from "json-rpc-2.0";
import { NOTIFICATION_SERVER_URL } from "@/constants";
import axios from "axios";

const notificationClient = new JSONRPCClient(async (jsonRPCRequest) => {
    if (NOTIFICATION_SERVER_URL === undefined) {
        throw new Error("AUTH_SERVER_URL is not defined");
    }

    return axios.post("http://notification-server:8001", jsonRPCRequest).then((response) => {
        if (response.status === 200) {
            notificationClient.receive(response.data);

        } else if (jsonRPCRequest.id !== undefined) {
            return Promise.reject(new Error(response.statusText));
        }
    })
})

export const notificationServer = async (method: string, params: JSONRPCParams) => {
    try {
        const response = await notificationClient.request(method, params);
        return response

    } catch (error: any) {
        console.log({ error });
        throw new Error(error);
    }
}
