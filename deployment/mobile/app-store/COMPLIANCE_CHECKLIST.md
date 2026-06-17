# Privacy & Compliance Checklist

## Privacy Nutrition Labels

| Data Type | Linked | Tracking | Purpose |
|-----------|--------|----------|---------|
| Contact Info (phone) | Yes | No | Account |
| Financial Info | Yes | No | Loan processing |
| User Content (documents) | Yes | No | KYC |
| Identifiers (device) | Yes | No | Crashlytics |
| Usage Data | Yes | No | Analytics |

## Disclosures

- [ ] Data collection disclosure complete
- [ ] Data usage disclosure complete
- [ ] Data tracking: **No** (ATT not used for tracking)
- [ ] User rights: access, deletion via support@kuberfinserve.com

## Apple Permissions

| Permission | Customer | DSA | Info.plist string |
|------------|----------|-----|-------------------|
| Camera | ✓ | ✓ | NSCameraUsageDescription |
| Photos | ✓ | ✓ | NSPhotoLibraryUsageDescription |
| Microphone | ✓ | Optional | NSMicrophoneUsageDescription |
| Notifications | ✓ | ✓ | UIBackgroundModes |
| Location | If used | If used | NSLocationWhenInUseUsageDescription |
| Contacts | No | No | — |

## Financial Compliance

- [ ] Loan information disclaimers in-app
- [ ] Privacy Policy URL in App Store Connect
- [ ] Terms & Conditions URL
- [ ] User consent flows (KYC, data processing)
- [ ] Export compliance: standard encryption exempt
