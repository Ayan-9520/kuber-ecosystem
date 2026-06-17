import { collectDefaultMetrics, Counter, Gauge, Histogram, Registry } from 'prom-client';

export const metricsRegistry = new Registry();

collectDefaultMetrics({ register: metricsRegistry, prefix: 'kuberone_' });

export const httpRequestDuration = new Histogram({
  name: 'kuberone_http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
  registers: [metricsRegistry],
});

export const httpRequestsTotal = new Counter({
  name: 'kuberone_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'] as const,
  registers: [metricsRegistry],
});

export const httpErrorsTotal = new Counter({
  name: 'kuberone_http_errors_total',
  help: 'Total HTTP error responses (4xx/5xx)',
  labelNames: ['method', 'route', 'status_code'] as const,
  registers: [metricsRegistry],
});

export const concurrentUsersGauge = new Gauge({
  name: 'kuberone_concurrent_users',
  help: 'Approximate concurrent authenticated users',
  registers: [metricsRegistry],
});

export const businessMetricsCounter = new Counter({
  name: 'kuberone_business_events_total',
  help: 'Business event counters',
  labelNames: ['event'] as const,
  registers: [metricsRegistry],
});

let activeSessions = 0;

export const metricsRegistryService = {
  incrementActiveSessions() {
    activeSessions += 1;
    concurrentUsersGauge.set(activeSessions);
  },

  decrementActiveSessions() {
    activeSessions = Math.max(0, activeSessions - 1);
    concurrentUsersGauge.set(activeSessions);
  },

  recordHttpRequest(method: string, route: string, statusCode: number, durationSec: number) {
    const labels = { method, route, status_code: String(statusCode) };
    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, durationSec);
    if (statusCode >= 400) {
      httpErrorsTotal.inc(labels);
    }
  },

  async getMetrics(): Promise<string> {
    return metricsRegistry.metrics();
  },

  getContentType(): string {
    return metricsRegistry.contentType;
  },
};
