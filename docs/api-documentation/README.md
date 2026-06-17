# KuberOne API Documentation Portal

Enterprise API documentation for **Kuber Finserve KuberOne** platform.

## Sources

| Asset | Path |
|-------|------|
| OpenAPI 3.1 | `openapi/kuberone-v1.yaml` |
| Postman Collection | `postman/KuberOne.postman_collection.json` |
| In-app Portal | Admin CRM → **Developer Portal** (`/developer-portal`) |

## Portal Sections

1. **Home** — Overview, architecture, environments, quick start
2. **Authentication** — JWT, OTP, refresh, sessions, RBAC
3. **API Reference** — All endpoints by module with permissions and examples
4. **Error Catalog** — 400–500 errors and recovery guidance
5. **RBAC Guide** — Roles, permissions, data scope
6. **Workflows** — Lead, application, document, referral, commission, support
7. **AI Platform** — Copilot, RAG, scoring, recommendations
8. **SDK Examples** — JS/TS/React/React Native/Node.js
9. **Postman** — Collection import and environments
10. **API Testing** — Auth, RBAC, error, rate limit testing
11. **Swagger UI** — Interactive explorer
12. **Redoc** — Readable reference
13. **Analytics** — Documentation usage tracking

## Access Control

Developer Portal requires `settings.read` or `audit.read` permission (ADMIN/SUPER_ADMIN have full access).

## Local Development

```bash
pnpm dev:admin   # http://localhost:5173/developer-portal
pnpm dev:backend # API at http://localhost:4000/api/v1
```

OpenAPI and Postman assets are copied to `apps/admin/public/` on dev server start.
