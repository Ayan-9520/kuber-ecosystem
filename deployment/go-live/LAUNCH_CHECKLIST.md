# Launch Checklist

## Pre-Launch (T-24h)

- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm lint` — zero errors
- [ ] `pnpm build` — all packages
- [ ] `pnpm test` — unit tests pass
- [ ] `pnpm go-live:gate` — gate passed
- [ ] UAT signoffs — all 6 stakeholder types
- [ ] Backup restore drill validated (90 days)
- [ ] War room roster confirmed
- [ ] Rollback scripts tested in staging
- [ ] DNS / SSL certificates verified

## Launch Day

- [ ] Maintenance banner (if applicable)
- [ ] Deploy backend → api.kuberone.com
- [ ] Run `pnpm production:validate`
- [ ] Deploy CRM → admin.kuberone.com
- [ ] Submit mobile store releases
- [ ] Smoke test customer app (login, dashboard, apply)
- [ ] Smoke test DSA app (login, leads, commissions)
- [ ] Monitor error rate 30 minutes
- [ ] Monitor latency P95 < 500ms

## Post-Launch (T+24h)

- [ ] Disable maintenance banner
- [ ] Stakeholder launch communication
- [ ] Archive launch audit trail
- [ ] Schedule post-mortem (48h)
- [ ] Update runbooks

## War Room

- [ ] SRE lead on bridge
- [ ] Backend engineer on bridge
- [ ] QA monitoring smoke tests
- [ ] Product owner channel open
- [ ] Incident commander identified

## Incident Response

- [ ] Assess severity SEV1–SEV4
- [ ] Notify escalation matrix
- [ ] Fix forward vs rollback decision
- [ ] Rollback if SEV1 > 15 min unresolved
- [ ] Document in incident record
