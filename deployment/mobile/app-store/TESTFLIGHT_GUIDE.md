# TestFlight Guide — KuberOne

## Internal Testing

- Up to 100 team members (App Store Connect users)
- No Beta App Review
- Use for CI smoke + QA after each IPA upload

```bash
eas build --platform ios --profile testflight
eas submit --platform ios --profile testflight
```

## External Testing

- Up to 10,000 testers via email or public link
- Requires Beta App Review (first build)
- Create beta groups: `UAT-Customer`, `UAT-DSA`, `Partner-Pilot`

## Beta Groups (Management Teams)

| Team | TestFlight Group | Apps |
|------|------------------|------|
| Branch Managers | TF-Branch-Managers | Customer + Partner |
| Regional Managers | TF-Regional-Managers | Customer + Partner |
| Sales Team | TF-Sales-Customer | Customer |
| Credit Team | TF-Credit-Customer | Customer |
| Operations Team | TF-Operations | Customer + Partner |
| Compliance Team | TF-Compliance | Customer + Partner |
| Support Team | TF-Support | Customer + Partner |
| Admin Team | TF-Admin-Internal | Customer + Partner (internal) |

Create groups in App Store Connect → TestFlight → Groups. Add testers by team before external beta review.

## Release Notes Template

```
KuberOne v{version} (build {buildNumber})

What's New:
• Performance improvements
• Enhanced loan flows
• Bug fixes

Test Focus:
• Login/OTP
• Push notifications
• AI Advisor
• Document upload
```

## Feedback Collection

- TestFlight feedback + Crashlytics
- CRM ticket category: `mobile-beta-feedback`
- Weekly beta review meeting
