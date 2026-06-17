# Google Play Testing Tracks

## Track Overview

| Track | Testers | Review | Use Case |
|-------|---------|--------|----------|
| **Internal** | ≤100 | None | CI/CD smoke, QA |
| **Closed** | Email list / Google Groups | None | UAT, stakeholders |
| **Open** | Public opt-in | Optional | Public beta |
| **Production** | All users | Full review | Live release |

## Internal Testing

1. Upload AAB to Internal track
2. Add testers: `devops@kuberfinserve.com`, QA team
3. Validate: login, push, Crashlytics symbol upload
4. Duration: 1–2 days minimum

## Closed Testing

1. Promote from Internal or upload new AAB
2. Create list: UAT testers, product owners
3. Customer app: 20+ testers across devices
4. DSA app: partner pilot group (10–50 DSAs)
5. Collect feedback via support channel

## Open Testing (Optional)

- Use for soft launch in select regions
- Monitor crash-free rate > 99%
- Limit countries if needed (India first)

## Production Release

1. Promote tested release to Production
2. **Staged rollout:** 10% → 25% → 50% → 100%
3. Halt rollout if Crashlytics critical spike
4. Rollback: halt rollout + hotfix AAB

## Release Notes Template

```
Version {versionName} ({versionCode})

• Performance improvements
• Enhanced loan application flow
• Bug fixes and stability updates

Thank you for using KuberOne!
```
