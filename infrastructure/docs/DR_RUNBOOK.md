# Disaster Recovery Runbook — KuberOne

## Scenarios

| Scenario | RTO | RPO | Playbook |
|----------|-----|-----|----------|
| Database failure | 1h | 15m | `deployment/backup/DR-PLAYBOOK-DATABASE-FAILURE.md` |
| Region outage | 4h | 15m | Promote read replica + DNS failover |
| S3 data loss | 2h | 0 | S3 versioning restore / CRR bucket |
| Full region loss | 8h | 15m | Secondary region Terraform apply |

## Recovery Steps (Database)

1. **Detect**: Prometheus `kuberone-database-down` alert
2. **Assess**: Check RDS console, `/health/ready` database check
3. **Stop writes**: Scale API to 0 or enable maintenance mode
4. **Restore**: Use Backup & Recovery CRM (`/backup`) → Restore Center
5. **Verify**: `SELECT 1`, spot-check critical tables
6. **Resume**: Scale API back, monitor error rates
7. **Audit**: Record in `/infrastructure` and `/devops` dashboards

## Cross-Region Failover (when enabled)

1. Promote RDS read replica in `ap-southeast-1`
2. Update Route 53 / Cloudflare to secondary ALB
3. Update `DATABASE_URL` and `REDIS_URL` in Secrets Manager
4. Redeploy application tier in secondary region

## DR Drill Schedule

- Monthly: Backup restore verification
- Quarterly: Full DR drill via `/disaster-recovery` CRM module
- Annually: Cross-region failover test

## Contacts

Configure in `infrastructure_configs` and PagerDuty integration via Grafana alerting.
