# War Room Checklist

## Roles

| Role | Name | Contact | Backup |
|------|------|---------|--------|
| Incident Commander | TBD | — | — |
| SRE Lead | TBD | — | — |
| Backend Engineer | TBD | — | — |
| QA Lead | TBD | — | — |
| Product Owner | TBD | — | — |
| Security | TBD | — | — |

## Bridge

- Primary: Microsoft Teams / Slack `#kuberone-launch`
- Secondary: Phone bridge TBD

## Monitoring Dashboards

- CRM → Go-Live Checklist → Readiness Dashboard
- CRM → Production Monitoring
- CRM → Error Tracking
- Grafana: api.kuberone.com metrics

## Escalation

| Severity | Response | Escalate To |
|----------|----------|-------------|
| SEV1 | 5 min | CTO + Management |
| SEV2 | 15 min | DevOps Lead |
| SEV3 | 1 hour | On-call engineer |
| SEV4 | Next business day | Team lead |

## Go/No-Go Decision

- **Go:** readiness ≥ 85%, all approvals, gates green
- **No-Go:** any blocker, rollback plan activated
