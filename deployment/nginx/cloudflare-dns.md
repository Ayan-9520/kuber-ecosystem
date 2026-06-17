# Cloudflare DNS Configuration — KuberOne

## Records (Production)

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | api | `<ALB_DNS_NAME>` | Proxied |
| CNAME | admin | `<ALB_DNS_NAME>` | Proxied |
| CNAME | customer | `<ALB_DNS_NAME>` | Proxied |
| CNAME | partner | `<ALB_DNS_NAME>` | Proxied |

## Security Settings

- SSL/TLS: **Full (strict)**
- Always Use HTTPS: **On**
- Minimum TLS: **1.2**
- HSTS: **Enabled** (max-age 31536000, includeSubDomains, preload)
- DDoS Protection: **Enabled** (automatic)
- WAF: **Managed rules** + rate limiting on `/api/auth/*`

## ACM Validation

For AWS ACM certificates, add DNS validation CNAME records provided by ACM to Cloudflare (DNS only, grey cloud).

## Auto Renewal

- **ACM**: Automatic renewal when DNS validation records exist
- **Let's Encrypt** (origin): Certbot cron `0 3 * * * certbot renew --nginx`
