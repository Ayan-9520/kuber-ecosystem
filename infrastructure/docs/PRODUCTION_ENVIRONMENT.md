# KuberOne Production Environment

## Domains

| Domain | Service |
|--------|---------|
| `api.kuberone.com` | Backend API |
| `admin.kuberone.com` | CRM Admin |
| `customer.kuberone.com` | Customer mobile APIs |
| `partner.kuberone.com` | DSA/Partner mobile APIs |

## Go-Live Gates

Production deploy is **blocked** if:

- Critical unresolved bugs exceed threshold
- Critical security findings exist
- UAT not signed off
- Production validation failed
- Monitoring not configured
- Backup validation failed

Run: `node scripts/production-go-live-gate.mjs`

## Deployment

```bash
# Manual (with all gates)
DEPLOY_STRATEGY=blue-green bash deployment/scripts/deploy-production.sh

# GitHub Actions
gh workflow run deploy-production.yml -f strategy=blue-green
```

## API Endpoints

- `GET /api/v1/production/status`
- `GET /api/v1/production/health`
- `GET /api/v1/production/go-live-gates`
- `GET/POST /api/v1/production/releases`
- `GET /api/v1/production/deployments`
- `GET/POST /api/v1/production/incidents`
- `GET /api/v1/production/reports`
- `GET /api/v1/production/dashboard`

## CRM Dashboard

**Administration → Production** at `/production`

## Secrets (AWS Secrets Manager)

Path: `kuberone/production/*`

- JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
- DATABASE_URL, OPENAI_API_KEY
- SMTP_*, SMS_*, WHATSAPP_*, FCM_*
- AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

## High Availability

- 4+ API instances behind ALB
- Multi-AZ RDS PostgreSQL with PITR
- Redis cluster with failover
- S3 versioning + CRR-ready
- Blue-green / rolling / canary-ready deploys

## Compliance

- Audit logging via `production_audits`
- Encryption at rest (RDS, S3, Redis)
- Encryption in transit (TLS 1.2+)
- Data retention policies via backup module
- Monitoring compliance via Prometheus/Grafana

## Incident Management

Create incidents via `POST /api/v1/production/incidents`. Critical incidents set environment status to `INCIDENT`.
