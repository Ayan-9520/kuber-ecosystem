# KuberOne DR Playbook — Database Failure

## Scenario
Primary MySQL/RDS database unavailable or corrupted.

## RPO / RTO
- **RPO:** 15 minutes (hourly incremental + PITR)
- **RTO:** 60 minutes

## Procedure
1. Declare P1 incident and notify DevOps Lead + CTO
2. Confirm scope via `/api/v1/monitoring/database` and error tracking
3. Identify latest verified backup via `/api/v1/backups/history`
4. Execute restore via `/api/v1/backups/restore` (scope: DATABASE)
5. Validate schema integrity and row counts
6. Resume application traffic; monitor `/health/ready`
7. Post-incident review within 24 hours

## Contacts
DevOps Lead, DBA, Compliance Officer
