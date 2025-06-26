import { connection } from "@/redis";
import { Queue } from "bullmq";
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import TransactionsQueue from "./transactionQueues";
import TopUpQueue from "./topUpQueues";

export const createQueue = (name: string): Queue => {
    const queue = new Queue(name, { connection });
    return queue
}

export const transactionsQueue = new TransactionsQueue()
export const topUpQueue = new TopUpQueue()

export const queuesBullAdapter = [
    new BullMQAdapter(transactionsQueue.queue),
    new BullMQAdapter(topUpQueue.queue)
];


