# Launch Incident Workflow

## Severity Levels

| Level | Description | Response Time | War Room |
|-------|-------------|---------------|----------|
| SEV-1 | Complete outage, data loss risk | Immediate | ACTIVE — all teams |
| SEV-2 | Major feature degraded | 15 minutes | ACTIVE — eng + ops |
| SEV-3 | Minor degradation | 1 hour | Standby |
| SEV-4 | Cosmetic / low impact | Next business day | Log only |

## Incident Lifecycle

```
OPEN → INVESTIGATING → MITIGATED → RESOLVED → CLOSED
```

## Escalation Workflow

1. Incident detected (monitoring alert or manual report)
2. Assign severity and owner
3. Notify per communication matrix
4. Execute runbook
5. Decide: fix forward vs rollback
6. SEV-1 > 15 min → assess immediate rollback
7. Resolve and document post-mortem

## Rollback Readiness

- Immediate Rollback
- Application Rollback
- Database Recovery
- Traffic Rollback
- Feature Rollback

See `ROLLBACK_PLAN.md` for procedures.

## Alert Channels

Email · SMS · WhatsApp · Webhook

## Communication Templates

- `launch_incident_sev_1` — executive + customer comms
- `launch_incident_sev_2` — internal stakeholder update
- `launch_incident_sev_3` — team notification
- `launch_incident_sev_4` — ticket log
