import axios from "axios";
import {JSONRPCClient, JSONRPCParams} from "json-rpc-2.0";
import {QUEUE_SERVER_URL, ZERO_ENCRYPTION_KEY} from "@/constants";
import {Client, LOAD_BALANCER} from "cromio"
import fs from 'fs';
import path from 'path';

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
        return await queueClient.request(method, params)

    } catch (error: any) {
        throw new Error(error);
    }
}


const key = fs.readFileSync(path.join(__dirname, '../certs/server/key.pem'))
const cert = fs.readFileSync(path.join(__dirname, '../certs/server/cert.pem'))
const ca = fs.readFileSync(path.join(__dirname, '../certs/ca.pem'))
export const queueServerClient: Client = new Client({
    loadBalancerStrategy: LOAD_BALANCER.BEST_BIASED,
    servers: [
        {
            url: "https://queues:8002",
            secretKey: ZERO_ENCRYPTION_KEY,
            tls: {
                key,
                cert,
                ca
            }
        }
    ]
});