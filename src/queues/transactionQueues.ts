import { Queue } from "bullmq";
import { connection } from "@/redis";


export default class TransactionsQueue {
    queue: Queue;
    constructor() {
        this.queue = new Queue("transactions", { connection });
    }


    addJob = async (jobName: string, data: string, pattern: string) => {
        const job = await this.queue.upsertJobScheduler(jobName, { tz: "EST", pattern }, { data });
        return job
    }
}