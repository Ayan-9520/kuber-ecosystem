# Screenshot Requirements

## Customer — `com.kuberone.customer`

1. Login · 2. Dashboard · 3. Eligibility · 4. EMI Calculator · 5. Loan Application  
6. Documents · 7. Support · 8. AI Advisor · 9. Voice AI · 10. Profile

**Devices:** iPhone 15 Pro Max (6.7") + iPad Pro 12.9"

## DSA Partner — `com.kuberone.partner`

1. Login · 2. Dashboard · 3. Leads · 4. Applications · 5. Customers  
6. Commissions · 7. Referrals · 8. Analytics · 9. Support · 10. Profile

## Capture

```bash
# iOS Simulator
xcrun simctl io booted screenshot deployment/mobile/app-store/assets/customer/01-login.png
```

Status bar: use `xcrun simctl status_bar` for clean 9:41 display.
