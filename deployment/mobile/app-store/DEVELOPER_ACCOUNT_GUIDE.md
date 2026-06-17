# Apple Developer Account — Kuber Finserve

## Apple Developer Program

- **Entity:** Kuber Finserve Private Limited
- **D-U-N-S:** Required for organization enrollment
- **Team ID:** Store in `APPLE_TEAM_ID` secret

## App Store Connect Roles

| Role | Users | Permissions |
|------|-------|-------------|
| Account Holder | CEO/CTO | Full access |
| Admin | DevOps Lead | Certificates, users, apps |
| App Manager | Mobile Lead | Metadata, TestFlight, releases |
| Developer | Engineers | Builds, certificates |
| Marketing | Product | Store listing, screenshots |
| Customer Support | Support Lead | Reviews, crash data |

## Team Management Checklist

- [ ] 2FA enabled for all users
- [ ] API keys created for CI (`APPLE_KEY_ID`, `APPLE_ISSUER_ID`)
- [ ] Separate apps: KuberOne + KuberOne Partner
- [ ] Bundle IDs registered
- [ ] Push Notifications capability enabled
- [ ] Associated Domains for deep links

## Secrets (GitHub / Vault)

`APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_ISSUER_ID`, `APPLE_API_KEY_BASE64`, `EXPO_TOKEN`
