# Recovery Checklist

## Pre-Recovery

- [ ] Incident declared and severity assigned
- [ ] Escalation matrix notified
- [ ] Recovery runbook selected
- [ ] Approval obtained (if required)
- [ ] Backups validated before restore

## During Recovery

- [ ] Affected systems isolated
- [ ] Restore initiated (DB / S3 / app)
- [ ] RPO tracked (data loss window)
- [ ] RTO clock running

## Post-Recovery

- [ ] `/health/live` — 200
- [ ] `/health/ready` — 200
- [ ] `/deep-health` — all checks pass
- [ ] Smoke test: login, lead create, document upload
- [ ] Monitoring dashboards green
- [ ] Stakeholders notified
- [ ] Recovery audit log created
- [ ] Post-incident review scheduled
