# Apple App Store Deployment Guide — KuberOne

## Apps

| App | Bundle ID | Guide |
|-----|-----------|-------|
| KuberOne Customer | `com.kuberone.customer` | [Customer Connect](./CUSTOMER_APP_CONNECT.md) |
| KuberOne Partner | `com.kuberone.partner` | [DSA Connect](./DSA_APP_CONNECT.md) |

## Prerequisites

- Apple Developer Program (Kuber Finserve org)
- App Store Connect access with Admin / App Manager roles
- Distribution certificate + App Store provisioning profile
- EAS credentials or Xcode signing
- Firebase (Crashlytics + Analytics)
- Privacy Policy & Terms live

## Flow

```
IPA Build → TestFlight Internal → TestFlight External → App Store Review → Phased Release
```

## Commands

```bash
pnpm app-store:report
pnpm app-store:gate
cd apps/mobile-customer && eas build --platform ios --profile production
eas submit --platform ios --profile production
```

## Documentation

- [TestFlight Guide](./TESTFLIGHT_GUIDE.md)
- [Store Listing Templates](./STORE_LISTING_TEMPLATES.md)
- [Store Assets](./STORE_ASSETS_REQUIREMENTS.md)
- [Screenshots](./SCREENSHOT_REQUIREMENTS.md)
- [Compliance](./COMPLIANCE_CHECKLIST.md)
- [App Review](./APP_REVIEW_READINESS.md)
- [Submission](./SUBMISSION_CHECKLIST.md)
- [Launch](./LAUNCH_CHECKLIST.md)
- [Marketing](./MARKETING_READINESS.md)
- [Developer Account](./DEVELOPER_ACCOUNT_GUIDE.md)

## CRM

Admin → **App Store** (`/app-store`)
