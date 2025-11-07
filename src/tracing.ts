// src/tracing.ts
import {NodeSDK} from '@opentelemetry/sdk-node';
import {getNodeAutoInstrumentations} from '@opentelemetry/auto-instrumentations-node';
import {Resource} from '@opentelemetry/resources';
import {ATTR_SERVICE_NAME} from '@opentelemetry/semantic-conventions';
import {JaegerExporter} from "@opentelemetry/exporter-jaeger";
import {PrometheusExporter} from "@opentelemetry/exporter-prometheus";
import {MeterProvider} from '@opentelemetry/sdk-metrics';
import {Counter} from '@opentelemetry/api';


const traceExporter = new JaegerExporter({
    endpoint: 'http://jaeger:14268/api/traces'
});

const metricReader = new PrometheusExporter({
    endpoint: 'http://prometheus:9090/metrics'
})

// Initialize MeterProvider separately (DO NOT pass metricReader to NodeSDK)
const meterProvider = new MeterProvider({
    resource: new Resource({
        [ATTR_SERVICE_NAME]: 'main-server',
    }),
});

// Attach the PrometheusExporter to the MeterProvider
meterProvider.addMetricReader(metricReader);

// Get meter instance
const meter = meterProvider.getMeter('binomia-metrics');

// Define a Counter metric
const httpRequestCounter: Counter = meter.createCounter('http_requests_total', {
    description: 'Total number of HTTP requests received',
});

// Function to increment the counter
export function recordHttpRequest(route: string, method: string) {
    httpRequestCounter.add(1, {route, method});
}

const sdk = new NodeSDK({
    resource: Resource.default().merge(
        new Resource({
            [ATTR_SERVICE_NAME]: 'main-server',
        })
    ),
    traceExporter,
    // metricReader,
    instrumentations: [
        getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-fs': {enabled: false},
            '@opentelemetry/instrumentation-graphql': {enabled: true},
            '@opentelemetry/instrumentation-http': {enabled: true},
            '@opentelemetry/instrumentation-express': {enabled: true},
            '@opentelemetry/instrumentation-grpc': {enabled: true}
        })
    ]
});


// Inicializa el SDK (async)
export async function initTracing(): Promise<void> {
    try {
        sdk.start();

        console.log('Tracing initialized');
    } catch (err) {
        console.error('Error initializing tracing', err);
    }
}

// (Opcional) para cuando quieras cerrar el proceso limpiamente
export async function shutdownTracing(): Promise<void> {
    try {
        await sdk.shutdown();

        console.log('Tracing shutdown complete');
    } catch (err) {
        console.error('Error shutting down tracing', err);
    }
}
