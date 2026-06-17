# KuberOne Staging Environment

## Purpose

Production-like staging for:

- Integration & regression testing
- UAT with business users
- Release validation before production
- Performance & security smoke tests
- Deployment pipeline validation

## Domains

| Domain | Purpose |
|--------|---------|
| `staging-api.kuberone.com` | Backend API |
| `staging-admin.kuberone.com` | CRM Admin |
| `staging-customer.kuberone.com` | Customer app API/deep links |
| `staging-partner.kuberone.com` | DSA/Partner app API/deep links |

## CI/CD Triggers

| Branch | Pipeline |
|--------|----------|
| `staging` | `deploy-staging.yml` → full validation + deploy |
| `release/*` | `staging-validation.yml` + `staging-release-validation.yml` |

## Deployment

```bash
# Manual
bash deployment/scripts/deploy-staging.sh staging

# Docker Compose (local staging stack)
docker compose -f deployment/docker/docker-compose.staging.yml up -d

# Masked seed data
node scripts/staging-seed-masked.mjs
```

## Release Checklists

### Pre-Deployment
- PR validation passed
- Security scan clean
- Database backup completed
- Migration gate passed
- OpenAPI validation passed
- Staging branch up to date

### Post-Deployment
- `/health`, `/health/live`, `/health/ready` OK
- Deep health check passed
- CRM login verified
- API smoke tests passed
- Monitoring dashboards green
- Error rate within threshold

### Rollback
- Rollback target version identified
- Database backup verified
- Rollback script tested on staging
- Stakeholders notified
- Post-rollback health verified

## UAT Support

- Demo accounts: `admin@kuberfinserve.com`, `customer.demo@kuberone.com`, `dsa.demo@kuberone.com`
- UAT module: `/uat` in CRM
- Masked PII: `SEED_MASK_PII=true`

## API Endpoints

- `GET /api/v1/staging/status`
- `GET /api/v1/staging/health`
- `GET /api/v1/staging/releases`
- `POST /api/v1/staging/releases`
- `GET /api/v1/staging/deployments`
- `GET /api/v1/staging/reports`
- `GET /api/v1/staging/dashboard`

## CRM Dashboard

Navigate to **Administration → Staging** at `/staging`.
