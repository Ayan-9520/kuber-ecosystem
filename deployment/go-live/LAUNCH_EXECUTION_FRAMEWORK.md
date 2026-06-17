# KuberOne Go-Live Execution Framework

**Company:** Kuber Finserve  
**Module:** Go-Live Command Center  
**Objective:** Execute production launch safely and monitor launch in real time.

## Command Center Dashboards

| Dashboard | Purpose |
|-----------|---------|
| Launch Dashboard | 8-step workflow execution, smoke tests, business validation |
| War Room Dashboard | Team roster, bridge, communication matrix |
| Executive Dashboard | Readiness %, success %, go-live status |
| Incident Dashboard | SEV-1–SEV-4 incidents, runbooks, escalation |
| Release Dashboard | Quality gates, approvals, rollback readiness |

## Launch Workflow (8 Steps)

1. **Production Freeze** — halt config/deployment changes
2. **Database Backup** — verified pre-launch backup
3. **Release Deployment** — backend, CRM, mobile
4. **Health Validation** — API, workers, Redis, queues, monitoring
5. **Smoke Testing** — login, OTP, dashboard, lead, application, documents
6. **Business Validation** — lead, application, referral, commission, AI flows
7. **Launch Approval** — final authorization
8. **Traffic Enablement** — production traffic + live monitoring

## API Endpoints

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/v1/go-live/status` | launch.read |
| GET | `/api/v1/go-live/events` | launch.read |
| POST | `/api/v1/go-live/events` | launch.manage |
| GET | `/api/v1/go-live/incidents` | launch.read |
| POST | `/api/v1/go-live/incidents` | incident.manage |
| PATCH | `/api/v1/go-live/incidents/:id` | incident.manage |
| GET | `/api/v1/go-live/metrics` | launch.read |
| POST | `/api/v1/go-live/metrics/snapshot` | launch.manage |
| GET | `/api/v1/go-live/approvals` | launch.read |
| GET | `/api/v1/go-live/war-room` | launch.read |
| POST | `/api/v1/go-live/war-room/activate` | launch.manage |
| POST | `/api/v1/go-live/launch/advance` | launch.manage |
| GET | `/api/v1/go-live/reports/execution` | launch.read |

## RBAC

- `launch.read` — View command center dashboards
- `launch.manage` — Advance workflow, metrics, war room
- `launch.approve` — Start launch, approve steps
- `incident.manage` — Create/update launch incidents

## Success Criteria

- No critical errors
- No major outages (SEV-1)
- No security incidents
- Core business flows working
- Monitoring active

## Final Status

| Status | Criteria |
|--------|----------|
| FAILED | Rollback, abort, or SEV-1 open |
| PARTIAL SUCCESS | Launch in progress or gates pending |
| SUCCESSFUL GO-LIVE | Workflow complete, ≥90% success, zero open incidents |

## Scripts

```bash
pnpm go-live:execution:gate
pnpm go-live:execution:report
```

## Related

- Pre-launch validation: `deployment/go-live/GO_LIVE_FRAMEWORK.md`
- Incident workflow: `deployment/go-live/INCIDENT_WORKFLOW.md`
- Rollback: `deployment/go-live/ROLLBACK_PLAN.md`
- UAT signoff: `deployment/uat/UAT_SIGNOFF_FRAMEWORK.md`
