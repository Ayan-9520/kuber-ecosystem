# Health Checks — api.kuberone.com

## Endpoints

| Path | Type | Auth | Purpose |
|------|------|------|---------|
| `/health` | Basic | No | Service info |
| `/health/live` | Liveness | No | Process alive (K8s/ALB) |
| `/health/ready` | Readiness | No | DB + dependencies ready |
| `/deep-health` | Deep | No | DB, queues, workers, system |
| `/metrics` | Prometheus | No | Scraping endpoint |

## Validation

```bash
curl -sf https://api.kuberone.com/health/live
curl -sf https://api.kuberone.com/health/ready
curl -sf https://api.kuberone.com/deep-health
```

Post-deploy: `node scripts/production-deploy-validate.mjs`

## Docker HEALTHCHECK

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:4000/health/live || exit 1
```

## CRM Monitoring

- `/deployment/health` — aggregated dashboard
- `/monitoring` — Prometheus metrics
- `/observability` — logs, traces
- `/errors` — error tracking
