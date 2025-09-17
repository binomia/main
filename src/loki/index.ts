import { LOKI_PASSWORD, LOKI_URL, LOKI_USERNAME } from "@/constants";
import axios from "axios";


export class Loki {
    static push = async (message: string, labels: Record<string, any>) => {
        try {
            const streams = [
                {
                    stream: labels,
                    values: [
                        [
                            (Date.now() * 1_000_000).toString(), // Loki expects nanosecond timestamp
                            message,
                        ],
                    ],
                },
            ];

            const res = await axios.post(
                LOKI_URL,
                { streams },
                {
                    auth: {
                        username: LOKI_USERNAME,
                        password: LOKI_PASSWORD,
                    },
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Log sent:", res.data);
        } catch (error: any) {
            console.error({Loki: error?.toString()});
        }
    }
}