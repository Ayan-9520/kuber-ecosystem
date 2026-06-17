import { env } from '../../config/env.js';

import { appLogger } from './logger.js';

const OTEL_ENABLED = process.env.OTEL_ENABLED === 'true';
const OTEL_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4317';
const TRACE_SAMPLE_RATE = Number(process.env.TRACE_SAMPLE_RATE ?? (env.APP_ENV === 'production' ? '0.1' : '1'));

let initialized = false;

export function getTraceSampleRate(): number {
  return TRACE_SAMPLE_RATE;
}

export function shouldSampleTrace(): boolean {
  return Math.random() < TRACE_SAMPLE_RATE;
}

/** Initialize OpenTelemetry SDK when OTEL_ENABLED=true and SDK packages are installed. */
export async function initOtel(): Promise<void> {
  if (initialized || !OTEL_ENABLED) {
    if (!OTEL_ENABLED) {
      appLogger.debug('OpenTelemetry SDK disabled — correlation/trace headers active', {
        module: 'otel',
        category: 'SYSTEM',
        metadata: { collector: OTEL_ENDPOINT },
      });
    }
    return;
  }

  try {
    // Dynamic import keeps OTel SDK optional; install @opentelemetry/sdk-node to enable
    const sdkModule = '@opentelemetry/sdk-node';
    const autoModule = '@opentelemetry/auto-instrumentations-node';
    const exporterModule = '@opentelemetry/exporter-trace-otlp-grpc';

    const [{ NodeSDK }, { getNodeAutoInstrumentations }, { OTLPTraceExporter }] = await Promise.all([
      import(sdkModule),
      import(autoModule),
      import(exporterModule),
    ]);

    const sdk = new NodeSDK({
      serviceName: 'kuberone-api',
      traceExporter: new OTLPTraceExporter({ url: OTEL_ENDPOINT }),
      instrumentations: [getNodeAutoInstrumentations({ '@opentelemetry/instrumentation-fs': { enabled: false } })],
    });

    await sdk.start();
    initialized = true;
    appLogger.info('OpenTelemetry SDK initialized', {
      module: 'otel',
      category: 'SYSTEM',
      metadata: { endpoint: OTEL_ENDPOINT, sampleRate: TRACE_SAMPLE_RATE },
    });
    process.on('SIGTERM', () => void sdk.shutdown());
  } catch (err) {
    appLogger.warn('OpenTelemetry SDK unavailable — install OTel packages or use correlation headers + DB traces', {
      module: 'otel',
      category: 'SYSTEM',
      metadata: { error: err instanceof Error ? err.message : String(err) },
    });
  }
}
