# Google Play Store Deployment Guide — KuberOne

## Apps

| App | Package | Play Console |
|-----|---------|--------------|
| KuberOne Customer | `com.kuberone.customer` | [Customer Console Guide](./CUSTOMER_APP_CONSOLE.md) |
| KuberOne Partner (DSA) | `com.kuberone.partner` | [DSA Console Guide](./DSA_APP_CONSOLE.md) |

## Deployment Flow

```
AAB Build → Internal Testing → Closed Testing → Open Testing → Production (Staged Rollout)
```

## Prerequisites

- [ ] Google Play Developer account (Kuber Finserve org)
- [ ] App created in Play Console for each package
- [ ] Play App Signing enabled
- [ ] Service account with Release Manager role
- [ ] Signed production AAB (`android-aab-build.yml`)
- [ ] Firebase project linked (Crashlytics + Analytics)
- [ ] Privacy Policy & Terms live at kuberone.com

## Quick Commands

```bash
# Readiness report
node scripts/play-store-readiness-report.mjs

# Upload via EAS
cd apps/mobile-customer
eas submit --platform android --profile production

# Release gate
node scripts/play-store-release-gate.mjs
```

## Documentation Index

- [Store Listing Templates](./STORE_LISTING_TEMPLATES.md)
- [Store Assets Requirements](./STORE_ASSETS_REQUIREMENTS.md)
- [Screenshot Requirements](./SCREENSHOT_REQUIREMENTS.md)
- [Compliance Checklist](./COMPLIANCE_CHECKLIST.md)
- [Testing Tracks Guide](./TESTING_TRACKS_GUIDE.md)
- [Launch Checklist](./LAUNCH_CHECKLIST.md)
- [Marketing Readiness](./MARKETING_READINESS.md)
- [Play Integrity](./PLAY_INTEGRITY.md)
- [Pre-Launch Report](./PRE_LAUNCH_REPORT.md)

## CRM Dashboard

Admin → **Play Store** (`/play-store`) — readiness scores, release tracking, compliance reports.
