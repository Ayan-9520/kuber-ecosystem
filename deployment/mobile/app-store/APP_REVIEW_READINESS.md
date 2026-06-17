# App Review Readiness

## Reviewer Instructions (App Store Connect → App Review Information)

```
KuberOne is a financial services app for loan applications and eligibility.

LOGIN:
1. Tap "Login with Mobile"
2. Enter demo phone: +91 98765 43210
3. Enter OTP: 123456 (staging environment)

KEY FEATURES TO TEST:
- Dashboard: loan overview
- Eligibility: instant check
- EMI Calculator: adjust amount/tenure
- AI Advisor: tap chat icon, ask "best loan for me"
- Documents: upload sample PDF from Files

AI FEATURES:
AI Advisor uses OpenAI via KuberOne backend for loan recommendations.
Voice AI uses on-device speech + backend NLP. Microphone permission required.

FINANCIAL SERVICES:
App facilitates loan applications; final approval by partner banks/NBFCs.
Rates shown are indicative; not a guarantee of approval.

No real money movement in demo environment.
```

## Demo Accounts

| App | Phone | OTP | Environment |
|-----|-------|-----|-------------|
| Customer | +919876543210 | 123456 | staging-api |
| DSA Partner | +919876543211 | 123456 | staging-api |

Store in App Store Connect **Sign-in required** section.

## Contact

- Review contact: mobile-releases@kuberfinserve.com
- Phone: +91-XXXXXXXXXX (business hours IST)
