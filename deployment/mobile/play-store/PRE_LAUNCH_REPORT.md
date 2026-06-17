# Pre-Launch Report Validation

Google Play generates a pre-launch report after uploading to Internal/Closed track.

## Validate Categories

### Compatibility

- [ ] No crashes on top 20 devices
- [ ] Supports minSdk 24 devices
- [ ] Tablet layouts acceptable

### Performance

- [ ] Cold start < 3s on mid-tier device
- [ ] No ANRs in test period
- [ ] Memory within budget

### Security

- [ ] No exposed secrets in APK/AAB
- [ ] Network security config correct
- [ ] ProGuard/R8 applied (production)

### Accessibility

- [ ] TalkBack navigable login flow
- [ ] Sufficient contrast (WCAG AA)
- [ ] Touch targets ≥ 48dp

## Automated Checks

```bash
node scripts/play-store-readiness-report.mjs
pnpm android:gate
```

## Manual QA Matrix

| Device | OS | Customer | DSA |
|--------|-----|----------|-----|
| Pixel 6 | 14 | ✓ | ✓ |
| Samsung A54 | 13 | ✓ | ✓ |
| Tablet 10" | 14 | ✓ | ✓ |

## Failure Response

| Issue | Action |
|-------|--------|
| Crash on launch | Block release, fix, new versionCode |
| Permission crash | Update manifest + Data Safety |
| Security warning | Review network/security config |
