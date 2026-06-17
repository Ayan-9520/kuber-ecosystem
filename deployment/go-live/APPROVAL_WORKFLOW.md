# Go-Live Approval Workflow

## Approval Chain

| Order | Type | Approver Role | Permission |
|-------|------|---------------|------------|
| 1 | QA | QA Lead | `golive.approve` |
| 2 | SECURITY | Security Architect | `golive.approve` |
| 3 | DEVOPS | DevOps Lead | `golive.approve` |
| 4 | PRODUCT | Product Owner | `golive.approve` |
| 5 | MANAGEMENT | CTO / Management | `golive.approve` |
| 6 | FINAL_RELEASE | Release Manager | `release.approve` |

## Process

1. All checklist blocking items must be `PASSED`
2. All 6 quality gates must pass
3. Readiness score ≥ 85%
4. Each approver submits via CRM or API:
   `POST /api/v1/go-live/approvals/:launchId/:approvalType`
5. Final approver triggers launch:
   `POST /api/v1/go-live/launch`

## Rejection

- Any `REJECTED` approval blocks launch
- Resolve blockers and re-submit approval

## Audit

All decisions recorded in `LaunchAudit` with actor, timestamp, and compliance tag `go-live`.
