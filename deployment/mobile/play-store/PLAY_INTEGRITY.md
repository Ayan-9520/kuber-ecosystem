# Play Integrity API — KuberOne

## Overview

Play Integrity API validates app authenticity, device integrity, and licensing status before sensitive operations.

## Integration Readiness

| Check | Status | Notes |
|-------|--------|-------|
| Play Integrity API dependency | Ready | Configure in Play Console → App integrity |
| Server-side verification | Ready | Backend endpoint pattern documented |
| Device validation | Ready | Hook on login, loan submission |
| Fraud protection | Ready | Rate limit + integrity token |

## Setup

1. Play Console → **App integrity** → Enable Integrity API
2. Link Google Cloud project
3. Create service account for server verification
4. Add `PLAY_INTEGRITY_CLOUD_PROJECT_NUMBER` to backend secrets

## Client Flow (when enabled)

```
App → requestIntegrityToken() → Backend verifyIntegrityToken() → Allow/Deny
```

## Sensitive Actions to Protect

- OTP login
- Loan application submission
- Document upload
- Commission withdrawal (DSA)

## Testing

Use Play Console **Integrity API test** page with test tokens before production.
