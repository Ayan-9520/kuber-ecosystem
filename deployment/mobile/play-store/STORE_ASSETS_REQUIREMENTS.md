# Store Assets Requirements

## Required Assets (Both Apps)

| Asset | Spec | Customer | DSA |
|-------|------|----------|-----|
| **App icon** | 512×512 PNG, 32-bit, no alpha | ✓ | ✓ |
| **Adaptive icon** | Foreground 432×432, background #071A1F | ✓ | ✓ |
| **Feature graphic** | 1024×500 PNG/JPEG | ✓ | ✓ |
| **Promo graphic** | 180×120 (optional, deprecated in some views) | Optional | Optional |
| **Splash screen** | In-app (Expo splash #071A1F) | ✓ | ✓ |
| **Phone screenshots** | Min 2, max 8; 16:9 or 9:16; min 320px short side | 8 screens | 8 screens |
| **7-inch tablet** | Min 1 screenshot | ✓ | ✓ |
| **10-inch tablet** | Min 1 screenshot | ✓ | ✓ |

## File Locations (source)

```
apps/mobile-customer/assets/icon.png
apps/mobile-customer/assets/adaptive-icon.png
apps/mobile-customer/assets/splash.png
apps/mobile-dsa/assets/icon.png
...
```

## Play Console Upload Paths

```
deployment/mobile/play-store/assets/customer/
deployment/mobile/play-store/assets/dsa/
```

Create these folders and place exported PNGs before submission.

## Brand Guidelines

- Primary background: `#071A1F`
- Dark UI theme consistent with admin/customer apps
- No misleading financial claims in graphics
- Include Kuber Finserve attribution where required
