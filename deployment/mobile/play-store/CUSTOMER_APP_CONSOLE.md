# Play Console — KuberOne Customer App

**Package:** `com.kuberone.customer`  
**Category:** Finance (secondary: Business)

## Console Setup

1. **Create app** → App name: **KuberOne**
2. **App access** → All functionality available without restrictions (or declare login if required)
3. **Ads** → No, app does not contain ads
4. **Content rating** → Complete IARC questionnaire (Financial products)
5. **Target audience** → 18+ (financial services)
6. **News app** → No
7. **COVID-19 apps** → No
8. **Data safety** → Complete per [COMPLIANCE_CHECKLIST.md](./COMPLIANCE_CHECKLIST.md)
9. **Financial features** → Declare loan/banking features

## Store Listing

Copy from `listings/customer-listing.json` or [STORE_LISTING_TEMPLATES.md](./STORE_LISTING_TEMPLATES.md).

## App Signing

- Enable **Google Play App Signing**
- Upload key: release keystore (see `deployment/mobile/android/keystore/KEYSTORE_GUIDE.md`)
- App signing key: managed by Google

## Testing Tracks

| Track | Purpose |
|-------|---------|
| Internal | DevOps + QA (≤100 testers) |
| Closed | UAT stakeholders |
| Open | Public beta (optional) |
| Production | Live release |

## Release Checklist

- [ ] AAB uploaded to Internal track
- [ ] Pre-launch report reviewed
- [ ] Release notes added
- [ ] Staged rollout: 10% → 50% → 100%
- [ ] Crashlytics monitored 48h post-release
