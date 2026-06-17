# Backend Production Security

## Enabled Controls

| Control | Implementation |
|---------|----------------|
| HTTPS | ACM + Cloudflare Full Strict |
| Security Headers | Helmet middleware |
| Rate Limiting | Redis-backed per-route limits |
| RBAC | Session + permission middleware |
| Data Scope | Branch/region/customer scope filters |
| JWT | Short-lived access + refresh rotation |
| Encryption | TLS in transit, AES for sensitive fields |
| Secrets | GitHub Environments + SSM |

## Auth Rate Limits

- OTP: 10 per phone per window
- Login: 20 attempts per window
- API: 100 requests per 15 min (configurable)

## Pre-Deploy Security Gate

```bash
pnpm security:test
pnpm security:gate
```

## Audit

All deployment actions recorded in `backend_deployment_audits` table.
