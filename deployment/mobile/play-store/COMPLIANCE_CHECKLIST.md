# Play Store Compliance Checklist

## Privacy & Legal

- [ ] Privacy Policy URL: https://kuberone.com/privacy
- [ ] Terms & Conditions: https://kuberone.com/terms
- [ ] Data collection disclosed (phone, financial info, documents)
- [ ] Data usage disclosed (app functionality, analytics, support)
- [ ] User data policy aligned with Google Play User Data policy
- [ ] Data deletion mechanism documented

## Data Safety Form

| Data type | Collected | Shared | Encrypted | Purpose |
|-----------|-----------|--------|-----------|---------|
| Phone number | Yes | No | Yes | Account, OTP |
| Financial info | Yes | No | Yes | Loan applications |
| Photos/Documents | Yes | No | Yes | KYC |
| App activity | Yes | No | Yes | Analytics |
| Device IDs | Yes | No | Yes | Crashlytics, FCM |

## App Content

- [ ] Target audience: 18+
- [ ] Ads declaration: No ads
- [ ] Financial services declaration completed
- [ ] Government apps: No
- [ ] Health: No

## Permissions Justification

| Permission | Customer | DSA | Justification |
|------------|----------|-----|---------------|
| Camera | ✓ | ✓ | KYC document capture |
| Microphone | ✓ | Optional | Voice AI |
| Storage/Photos | ✓ | ✓ | Document upload |
| Notifications | ✓ | ✓ | Application status, FCM |
| Location | If used | If used | Branch proximity only |

## Play Integrity

- [ ] Play Integrity API integrated (ready)
- [ ] Device validation on sensitive endpoints
- [ ] Fraud protection hooks documented

## Export Compliance

- [ ] Uses standard HTTPS encryption only (exempt)
