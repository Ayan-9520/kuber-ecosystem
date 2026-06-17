# Cloudflare Production Configuration — KuberOne

## DNS Records

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | api | `<ALB_DNS>` | Proxied |
| CNAME | admin | `<ALB_DNS>` | Proxied |
| CNAME | customer | `<ALB_DNS>` | Proxied |
| CNAME | partner | `<ALB_DNS>` | Proxied |

## SSL/TLS

- Mode: **Full (strict)**
- Always Use HTTPS: **On**
- Minimum TLS: **1.2**
- HSTS: max-age=31536000, includeSubDomains, preload
- Automatic HTTPS Rewrites: **On**

## Security Headers (Transform Rules)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Caching Rules

| Path | Cache |
|------|-------|
| `/api/*` | Bypass |
| `/health*` | Bypass |
| `admin/*.js`, `admin/*.css` | Cache 30d |
| Static assets | Cache 7d |

## DDoS & WAF

- DDoS protection: Automatic (L3/L4/L7)
- WAF: OWASP Core Ruleset + rate limit on `/api/auth/*` (10 req/min/IP)
- Bot Fight Mode: On for admin

## Page Rules (legacy) / Rulesets

- `api.kuberone.com/api/auth/*` → Rate Limit 100/min
- `admin.kuberone.com` → Security Level High
