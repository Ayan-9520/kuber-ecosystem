# KuberOne — Apple App Store Release Documentation

**Company:** Kuber Finserve  
**Apps:** KuberOne Customer (`com.kuberone.customer`) · KuberOne Partner (`com.kuberone.partner`)  
**Last updated:** 2026-06-12

---

## Versioning

| Field | Source | Notes |
|-------|--------|-------|
| Marketing version | `app.config.ts` → `version` | Semantic: `MAJOR.MINOR.PATCH` |
| Build number | `VERSION_CODE[APP_ENV]` | Monotonic integer per upload |
| Bundle ID (prod) | `com.kuberone.customer` / `com.kuberone.partner` | Non-prod suffixes: `.debug`, `.qa`, `.staging` |

Increment **build number** for every App Store Connect upload, even hotfixes.

---

## Release Channels

| Channel | EAS Profile | Distribution | Audience |
|---------|-------------|--------------|----------|
| Internal TestFlight | `testflight` | App Store Connect | ≤100 Apple team members |
| External TestFlight | `testflight` + external group | App Store Connect | UAT, pilot partners |
| Production | `production` | App Store | Public |

---

## Release Types

### Phased Release (recommended)

1. Submit for review with **Phased Release** enabled (7-day rollout).
2. Monitor Crashlytics, error tracking, and CRM `/app-store` dashboards.
3. Pause phased release if crash-free rate drops below 99% or P1 incidents occur.

### Immediate Release

Use for critical hotfixes after TestFlight sign-off. Disable phased release in App Store Connect before approval.

---

## Rollback Strategy

1. **Halt phased release** in App Store Connect (no new users receive the build).
2. **Remove from sale** only if regulatory or security issue — requires leadership approval.
3. Ship **hotfix IPA** with incremented build number via EAS `production` profile.
4. Document incident in governance audit center; update release notes.

---

## CI/CD Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `app-store-release.yml` | Tag `app-store-v*`, manual | Gate → approval → EAS submit |
| `app-store-testflight.yml` | Tag `testflight-v*`, manual | TestFlight build + submit |
| `app-store-ipa-upload.yml` | Manual | Prebuild validation, artifact upload |

### Required Secrets

- `EXPO_TOKEN`
- `APPLE_TEAM_ID`
- `ASC_APP_ID_CUSTOMER`
- `ASC_APP_ID_DSA`
- `APP_STORE_CONNECT_API_KEY` (recommended for CI submit)

---

## Pre-Submission Gate

```bash
pnpm app-store:gate
pnpm app-store:report
```

Gate validates: deployment docs, listings, privacy manifests, workflows, readiness threshold.

---

## Release Notes Template

```
What's New in v{version}

• Improved loan eligibility experience
• Faster document upload and verification
• AI Advisor enhancements
• Bug fixes and performance improvements
```

Partner app variant: replace customer-facing copy with DSA/partner features (leads, commissions, referrals).

---

## CRM Dashboards

| Route | Purpose |
|-------|---------|
| `/app-store` | App Store readiness, compliance, assets |
| `/mobile-releases` | Cross-platform build tracking |
| `/play-store` | Google Play parity |

**RBAC:** `mobile.release`, `mobile.publish`, `release.manage`

---

## Post-Launch Monitoring

- Firebase Crashlytics — crash-free users ≥ 99.5%
- Firebase Analytics — retention D1/D7, conversion funnels
- Backend error tracking — P0/P1 alert routing
- App Store Connect — ratings, reviews, conversion rate

---

## Contacts

| Role | Contact |
|------|---------|
| App Review | review@kuberfinserve.com |
| Release Manager | release@kuberfinserve.com |
| Security | security@kuberfinserve.com |
