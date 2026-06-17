# KuberOne Go-Live Framework

**Company:** Kuber Finserve  
**Project:** KuberOne  
**Version:** 1.0.0

## Overview

The Go-Live Framework validates KuberOne across 15 audit sections before production launch. It integrates with existing Production, UAT, DR, Backend Deployment, and App Store readiness modules.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/go-live/readiness` | Aggregated readiness scores |
| GET | `/api/v1/go-live/dashboard` | Go-Live + Launch dashboards |
| GET | `/api/v1/go-live/checklist` | Paginated checklist items |
| PATCH | `/api/v1/go-live/checklist/:itemCode` | Update checklist item |
| GET | `/api/v1/go-live/approvals` | Approval workflow status |
| POST | `/api/v1/go-live/approvals/:launchId/:approvalType` | Submit approval decision |
| POST | `/api/v1/go-live/launch` | Start launch (requires all gates) |
| POST | `/api/v1/go-live/launch/complete` | Complete or rollback launch |
| GET | `/api/v1/go-live/reports` | Generate readiness reports |
| POST | `/api/v1/go-live/webhook` | CI/CD webhook integration |

## RBAC Permissions

| Permission | Purpose |
|------------|---------|
| `golive.read` | View dashboards and checklist |
| `golive.manage` | Update checklist items, complete launch |
| `golive.approve` | QA, Security, DevOps, Product, Management approvals |
| `release.approve` | Final release approval |

## Quality Gates (Block Go-Live)

1. Critical bugs = 0 (configurable via `ERROR_GATE_MAX_CRITICAL`)
2. Critical security findings = 0
3. UAT signed off (within 24h window)
4. Backup validation passed
5. Monitoring configured
6. Production validation passed (migrations)

## Approval Workflow

1. QA Approval
2. Security Approval
3. DevOps Approval
4. Product Approval
5. Management Approval
6. Final Release Approval (`release.approve`)

## CRM UI

Admin CRM → **Go-Live Checklist** (`/go-live`)

- Readiness Dashboard
- Launch Dashboard
- Go-Live Checklist
- Approval Dashboard
- Reports (Readiness, Approval, Release, Risk)

## Scripts

```bash
pnpm go-live:report   # Readiness report (JSON)
pnpm go-live:gate     # Full go-live gate (exit 1 if blocked)
pnpm production:gate  # Underlying production gate
```

## Database Models

- `GoLiveChecklist` — 45+ checklist items across 14 sections
- `GoLiveApproval` — 6 approval types per launch
- `LaunchExecution` — Active launch tracking
- `ReleaseGate` — 6 blocking quality gates
- `LaunchAudit` — Full audit trail
- `GoLiveReport` — Generated reports

## Thresholds

- Go-Live minimum: **85%**
- Section minimum: **70%**
- Gate pass required: **100%** of blocking gates

## Verdicts

| Score | Verdict |
|-------|---------|
| ≥ 85% + all gates + all approvals | READY FOR GO-LIVE |
| 70–84% | PARTIALLY READY |
| < 70% | NOT READY |
