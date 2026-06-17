# Deployment Runbook — KuberOne Production

## Pre-Deploy Checklist

- [ ] PR validation passed
- [ ] Security scan clean (no critical CVEs)
- [ ] Database backup triggered (`POST /api/v1/backups` scope=DATABASE)
- [ ] Migration gate passed (`pnpm db:migration:gate`)
- [ ] Error deployment gate passed (`node scripts/error-deployment-gate.mjs`)
- [ ] Staging deploy verified

## Blue-Green Deployment

1. Deploy new version to **green** target group (inactive)
2. Run smoke tests against green endpoints
3. Switch ALB listener to green target group
4. Monitor Grafana dashboards for 15 minutes
5. Drain blue target group after validation
6. Record deployment: `POST /api/v1/devops/deployments`

## Rolling Deployment

1. ASG rolling update: `MaxBatchSize=1`, `MinInstancesInService=2`
2. Health check: `/health/live` + `/health/ready`
3. PM2 cluster reload: `pm2 reload kuberone-api --update-env`

## Zero-Downtime Requirements

- Minimum 2 healthy instances behind ALB
- Database migrations must be backward-compatible
- Feature flags for breaking API changes

## Rollback

```bash
# Automatic via GitHub Actions
gh workflow run rollback.yml -f component=backend -f target_version=v1.0.0 -f environment=production

# Manual
bash deployment/scripts/rollback.sh backend v1.0.0 production
```

## Post-Deploy Verification

| Check | Endpoint |
|-------|----------|
| Liveness | `GET /health/live` |
| Readiness | `GET /health/ready` |
| Metrics | `GET /metrics` (internal) |
| CRM login | `https://admin.kuberone.com` |
| Error rate | Grafana errors-backend dashboard |
| Infrastructure | CRM `/infrastructure` dashboard |

## Incident Escalation

1. Check `/infrastructure` and `/monitoring` dashboards
2. Review Loki logs filtered by `level=error`
3. Check error tracking `/errors` for new groups
4. Execute DR playbook if database failure: `deployment/backup/DR-PLAYBOOK-DATABASE-FAILURE.md`
