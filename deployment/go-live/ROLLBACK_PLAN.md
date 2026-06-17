# Rollback Plan

## Triggers

- SEV1 incident unresolved > 15 minutes
- Error rate > 5% for 10 minutes
- Critical data integrity issue
- Failed health checks on api.kuberone.com

## Backend Rollback

```bash
# GitHub Actions
gh workflow run backend-production-rollback.yml

# Or manual
pnpm production:validate  # verify current state
# Deploy previous version tag via deployment module
```

## Database Rollback

- **Never** rollback migrations in production without DBA approval
- Restore from latest backup if data corruption detected
- See `deployment/backup/DR-PLAYBOOK-DATABASE-FAILURE.md`

## CRM Rollback

- Redeploy previous admin build from CI artifacts
- Vite env: revert `VITE_API_BASE_URL` if changed

## Mobile Rollback

- App Store: expedited review not available — use phased release pause
- Play Store: halt staged rollout in Play Console

## Communication

1. Notify war room
2. Update status page
3. Email stakeholders within 30 minutes
4. Post-mortem within 48 hours

## Validation After Rollback

- [ ] `/health` and `/deep-health` green
- [ ] Smoke tests pass
- [ ] Error rate normalized
- [ ] Launch execution marked `ROLLED_BACK` in Go-Live dashboard
