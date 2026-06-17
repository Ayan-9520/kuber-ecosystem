# Emergency Procedures

## Immediate Actions (First 15 Minutes)

1. Acknowledge alert in PagerDuty / monitoring
2. Open incident channel (#incident-response)
3. Assign Incident Commander (DevOps On-Call)
4. Assess: Is customer data at risk?
5. If security incident: invoke credential rotation + Compliance

## Database Emergency

See `deployment/backup/DR-PLAYBOOK-DATABASE-FAILURE.md`

- Stop writes if corruption suspected
- Initiate PITR to last known good state
- Validate with `pnpm db:migrate:deploy` on restored instance

## Ransomware / Security

1. Isolate affected systems (security group lockdown)
2. Preserve forensic evidence (snapshots, logs)
3. Rotate all credentials via SSM
4. Restore from immutable backups (pre-incident)
5. Notify Compliance within 1 hour

## Failed Deployment

```bash
bash deployment/scripts/rollback.sh backend <previous-version>
node scripts/production-deploy-validate.mjs
```
