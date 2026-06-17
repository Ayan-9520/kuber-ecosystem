# Pre-Submission Checklist

## Build & Signing

- [ ] CFBundleVersion incremented
- [ ] Distribution certificate valid
- [ ] App Store provisioning profile matches bundle ID
- [ ] IPA archived and uploaded via Transporter/EAS
- [ ] dSYM uploaded to Crashlytics

## Store Assets

- [ ] All screenshots per SCREENSHOT_REQUIREMENTS.md
- [ ] App icon 1024×1024
- [ ] Preview video (optional)

## Compliance

- [ ] Privacy nutrition labels complete
- [ ] Age rating questionnaire (17+)
- [ ] Export compliance answered
- [ ] Content rights confirmed

## App Review

- [ ] Reviewer notes + demo account
- [ ] AI feature explanation
- [ ] Financial services explanation

## Validation

```bash
pnpm app-store:gate
pnpm app-store:report
```
