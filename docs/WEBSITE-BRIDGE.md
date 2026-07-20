# Website ↔ KuberOne bridge (ops note)

Marketing site lives in **sibling** folder `E:\Projects\kuberfinserve` (not inside this monorepo).

Public intake API (this repo):

- `POST /api/v1/public/website/leads`
- `POST /api/v1/public/website/partners`
- `POST /api/v1/public/website/visitors`
- `POST /api/v1/public/website/partner-auth`
- `GET /api/v1/public/website/health`

Config (Docker `.env` / `.env.docker`):

```env
WEBSITE_INTAKE_API_KEY=kuber-website-intake-local-key
CORS_ORIGINS=...,https://kuberfinserve.com,https://www.kuberfinserve.com,http://localhost:5175
```

Website Hostinger setup + SMTP + upload list:  
`E:\Projects\kuberfinserve\FULL-FLOW-SETUP.md` and `HOSTINGER-SETUP.md`.
