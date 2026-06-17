# Screenshot Requirements

## Customer App — `com.kuberone.customer`

| # | Screen | Priority | Notes |
|---|--------|----------|-------|
| 1 | Login | Required | OTP flow, brand splash |
| 2 | Dashboard | Required | Loan overview, quick actions |
| 3 | Eligibility | Required | Instant check results |
| 4 | EMI Calculator | Required | Slider + amortization |
| 5 | Application | Required | Wizard step |
| 6 | Documents | Required | Upload/KYC |
| 7 | Support | Required | Ticket creation |
| 8 | AI Advisor | Required | Chat recommendations |
| 9 | Voice AI | Optional | Microphone UI |

**Devices:** Capture on Pixel 6 (phone) + Pixel Tablet or 10" emulator.

## DSA Partner App — `com.kuberone.partner`

| # | Screen | Priority | Notes |
|---|--------|----------|-------|
| 1 | Login | Required | Partner auth |
| 2 | Dashboard | Required | KPIs, pipeline |
| 3 | Leads | Required | Lead list/detail |
| 4 | Applications | Required | Pipeline status |
| 5 | Commissions | Required | Ledger view |
| 6 | Referrals | Required | Referral tracking |
| 7 | Analytics | Required | Branch/regional |
| 8 | Support | Required | Partner tickets |

## Capture Commands

```bash
# Android emulator screenshots
adb exec-out screencap -p > deployment/mobile/play-store/assets/customer/01-login.png
```

## Marketing Overlays

Optional: add caption overlays in Figma using brand template before upload.
