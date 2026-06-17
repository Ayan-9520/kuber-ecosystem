# Missing Endpoint Report

Generated: 2026-06-13T10:09:17.977Z

## Unmounted Route Files (not in production router)
- `modules/ai/routes/ai.routes.ts` — 1 route(s), **not mounted**
- `modules/audit/routes/audit.routes.ts` — 1 route(s), **not mounted**
- `modules/products/routes/product.routes.ts` — 1 route(s), **not mounted**
- `modules/emi/routes/emi.routes.ts` — 1 route(s), **not mounted**
- `modules/eligibility/routes/eligibility.routes.ts` — 1 route(s), **not mounted**

## Stub Endpoints (mounted, health-only)
| Prefix | Status |
|--------|--------|
| /campaigns | GET /health only |
| /partners | GET /health only |
| /employees | GET /health only |
| /branches | GET /health only |
| /settings | GET /health only |

## Notes
- Legacy `/audit-logs` and new `/audit` both documented.
- Finance engine routes power `/eligibility`, `/emi`, `/savings`, etc.
