# Monitoring Integration — Backend Production

## Stack

| Component | Path | Purpose |
|-----------|------|---------|
| Prometheus | `/metrics` | Request latency, queue depth, business metrics |
| Grafana | `deployment/monitoring/grafana/` | Dashboards |
| OpenTelemetry | `OTEL_EXPORTER_OTLP_ENDPOINT` | Distributed traces |
| Error Tracking | `/api/v1/errors` | Exception grouping |
| Observability | `/api/v1/observability` | Logs, traces, search |

## Business Monitoring

- Lead SLA breaches
- Application pipeline TAT
- Queue backlog depth
- AI token usage / cost
- Notification delivery rates

## Alerts

Configured in `deployment/monitoring/prometheus/alerts/` — routed to on-call.

## Post-Deploy

Verify Grafana dashboards show fresh data within 5 minutes of deploy.
