import "dotenv/config"
import cluster from "cluster";
import os from "os";
import express from 'express';
import http from 'http';
import cors from 'cors';
import PrometheusMetrics from "@/metrics/PrometheusMetrics";
import { ApolloServer, ApolloServerPlugin } from '@apollo/server';
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import { typeDefs } from './src/gql'
import { resolvers } from './src/gql'
import { db } from './src/config';
import { keyvRedis } from "@/redis";
import { checkForProtectedRequests, formatError } from "@/helpers";
import { MAIN_SERVER_PORT } from "@/constants";
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { collectDefaultMetrics, register } from 'prom-client';
// import { initTracing } from "@/tracing";
import { Span, trace } from '@opentelemetry/api'
import { seedDatabase } from "seed";

// Define the Context Type
interface Context {
    span: Span;
}

const tracer = trace.getTracer("graphql-request");
const app = express();
const httpServer = http.createServer(app);

// Collect default Node.js metrics

// initTracing();
const metrics = new PrometheusMetrics()


const errorHandlingPlugin: ApolloServerPlugin = {
    async requestDidStart() {
        return {
            async willSendResponse({ response, errors }: any) {
                if (errors && errors.length > 0) {
                    const errorCode = errors[0]?.extensions?.http?.status || 500;
                    response.http.status = errorCode; // Set HTTP status correctly
                }
            }
        }
    }
};

const tracingPlugin: ApolloServerPlugin<Context> = {
    async requestDidStart(requestContext) {
        const { request } = requestContext;
        if (request.operationName) {
            const span: Span = tracer.startSpan(request.operationName);

            return {
                async didResolveOperation({ request }) {
                    span.setAttribute("graphql.query", request.operationName || "");
                },
                async willSendResponse({ errors, request }) {
                    if (request.operationName)
                        span.addEvent(request.operationName);

                    span.setAttribute("graphql.response", JSON.stringify({
                        errors,
                        status: errors ? 500 : 200
                    }));

                    span.end();
                },
            };
        }
    },
};


(async () => {
    if (cluster.isPrimary) {
        os.cpus().forEach(() => {
            cluster.fork()
        })

    } else {
        await db.authenticate({ logging: false }).then(() => {
            console.log('\nDatabase connection has been established successfully.');
            db.sync()

        }).catch((err) => {
            console.log('\nUnable to connect to the database:', err);
        })

        const server = new ApolloServer<any>({
            typeDefs,
            resolvers,
            csrfPrevention: false,
            cache: new KeyvAdapter(keyvRedis),
            formatError,

            plugins: [
                tracingPlugin,
                errorHandlingPlugin,
                ApolloServerPluginDrainHttpServer({ httpServer })
            ]
        });

        await server.start();

        //  2) Create a custom /metrics endpoint
        app.get('/seed', async (req, res) => {
            await seedDatabase();
            res.end('Database seeded');
        });

        app.get('/metrics', async (req, res) => {
            res.set('Content-Type', register.contentType);
            res.end(await register.metrics());
        });

        app.use('/graphql',
            cors<cors.CorsRequest>({
                origin: "*",
            }),
            express.json(),
            expressMiddleware(server, {
                context: async ({ req, res }) => {
                    return { req, res, tracer, metrics };
                }
            })
        );

        httpServer.listen(MAIN_SERVER_PORT || 8000, () => {
            console.log(`[Main-Server]: worker ${cluster.worker?.id} is running on http://localhost:${MAIN_SERVER_PORT}`);
        })
    }
})()



