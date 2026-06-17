# Production Launch Checklist

## T-14 Days

- [ ] Store listings complete (both apps)
- [ ] All screenshots uploaded
- [ ] Data Safety forms submitted
- [ ] Content rating certificates received
- [ ] Internal track builds validated

## T-7 Days

- [ ] Closed testing sign-off (UAT)
- [ ] Pre-launch report: no critical issues
- [ ] Play Integrity API verified
- [ ] Marketing assets ready
- [ ] Support team briefed

## T-1 Day

- [ ] Production AAB uploaded
- [ ] Release notes finalized
- [ ] Staged rollout plan approved
- [ ] Monitoring dashboards ready (Crashlytics, Analytics, CRM)
- [ ] Rollback runbook reviewed

## Launch Day

- [ ] Start 10% staged rollout
- [ ] Monitor crash-free users (target ≥99.5%)
- [ ] Monitor API error rates
- [ ] Record release in CRM Play Store dashboard
- [ ] Announce via approved channels

## T+48 Hours

- [ ] Increase rollout to 50% if stable
- [ ] Full rollout or hotfix decision
- [ ] Launch report generated

## Rollback Strategy

1. Halt rollout in Play Console
2. Previous version remains for installed users
3. Ship hotfix AAB with incremented versionCode
4. Document incident in production module
