# KuberOne Hypercare Support Phase

**Company:** Kuber Finserve  
**Objective:** Stabilize production after launch, monitor users, resolve incidents rapidly, ensure adoption.

## Duration

| Phase | Focus |
|-------|-------|
| Week 1 | Intensive monitoring, rapid incident response |
| Week 2 | Stabilization, bug queue reduction |
| Week 3 | Performance tuning, adoption optimization |
| Week 4 | Handover to BAU support |
| Extension | Optional extended hypercare |

## Monitoring

### Production
System Health, API, Database, Queue, AI, Notification

### Business
Registrations, Logins, Leads, Applications, Documents, Referrals, Commissions, Support Tickets

### Adoption
DAU, WAU, Feature Usage, AI Usage, Voice AI, Drop-off Analysis

## SLA Management

| Severity | Response Time |
|----------|---------------|
| SEV-1 | 15 minutes |
| SEV-2 | 30 minutes |
| SEV-3 | 4 hours |
| SEV-4 | 1 business day |

## API Endpoints

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/v1/hypercare/status` | hypercare.read |
| GET/POST/PATCH | `/api/v1/hypercare/incidents` | hypercare.read / hypercare.resolve |
| GET/POST/PATCH | `/api/v1/hypercare/issues` | hypercare.read / hypercare.manage |
| GET | `/api/v1/hypercare/metrics` | hypercare.read |
| POST | `/api/v1/hypercare/metrics/snapshot` | hypercare.manage |
| GET | `/api/v1/hypercare/reports` | hypercare.read |
| POST | `/api/v1/hypercare/rca` | hypercare.resolve |

## RBAC

- `hypercare.read` — View dashboards
- `hypercare.manage` — Manage issues, metrics
- `hypercare.resolve` — Resolve incidents, create RCA
- `incident.manage` — Shared with go-live incident management

## Final Status

| Status | Criteria |
|--------|----------|
| UNSTABLE | SEV-1 open |
| STABILIZING | Success score 50–74% |
| STABLE | Success score ≥75% |
| PRODUCTION STABILIZED | Success score ≥90%, zero open incidents |

## Scripts

```bash
pnpm hypercare:gate
pnpm hypercare:report
```
