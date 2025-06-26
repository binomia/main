// // open-telemetry.js
// import { Resource } from "@opentelemetry/resources";
// import { SimpleSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";
// import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
// import { Instrumentation, InstrumentationConfig, registerInstrumentations } from "@opentelemetry/instrumentation";
// import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
// import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
// // **DELETE IF SETTING UP A GATEWAY, UNCOMMENT OTHERWISE**
// import { GraphQLInstrumentation } from "@opentelemetry/instrumentation-graphql";
// import { ZipkinExporter } from "@opentelemetry/exporter-zipkin";
// import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";



// // Register server-related instrumentation
// registerInstrumentations({
//     instrumentations: [
//         new HttpInstrumentation() as unknown as Instrumentation<InstrumentationConfig>,
//         new ExpressInstrumentation() as unknown as Instrumentation<InstrumentationConfig>,
//         new GraphQLInstrumentation() as unknown as Instrumentation<InstrumentationConfig>,
//     ],
// })
// // Initialize provider and identify this particular service
// // (in this case, we're implementing a federated gateway)
// const zipkinExporter = new ZipkinExporter({
//     url: 'http://zipkin:9411/',
// });

// const jaegerExporter = new OTLPTraceExporter({
//     // URL of the Collector's OTLP gRPC endpoint
//     url: 'http://jaeger:16686',
// })

// const provider = new NodeTracerProvider({
//     resource: Resource.default().merge(
//         new Resource({

//             // Replace with any string to identify this service in your system
//             "service.name": "apollo-newrelic-otel",
//         })
//     ),
//     spanProcessors: [
//         new SimpleSpanProcessor(zipkinExporter),
//         new SimpleSpanProcessor(jaegerExporter),
//         new SimpleSpanProcessor(new ConsoleSpanExporter())
//     ]
// });



// // Register the provider to begin tracing
// provider.register();