import axios from "axios";
import { JSONRPCClient, JSONRPCParams } from "json-rpc-2.0";
import {  QUEUE_SERVER_URL } from "@/constants";

const queueClient = new JSONRPCClient(async (jsonRPCRequest) => {
    if (QUEUE_SERVER_URL === undefined) {
        throw new Error("QUEUE_SERVER_URL is not defined");
    }

    return axios.post("http://queue-server:8002", jsonRPCRequest).then((response) => {
        if (response.status === 200) {
            queueClient.receive(response.data);

        } else if (jsonRPCRequest.id !== undefined) {
            return Promise.reject(new Error(response.statusText));
        }
    })
})

export const queueServer = async (method: string, params: JSONRPCParams) => {
    try {
        const response = await queueClient.request(method, params);
        return response

    } catch (error: any) {
        throw new Error(error);
    }
}
