# KuberOne
## Backend Development Blueprint

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise Backend Development Blueprint (BDB)  
**Classification:** Node.js Ready | Express Ready | Prisma Ready | MySQL Ready | Developer Ready | Production Ready  
**Version:** 1.0  
**Date:** June 2026  
**Tech Stack:** Node.js · Express.js · TypeScript · MySQL 8 · Prisma · JWT · OTP · AWS S3 · Firebase FCM · WhatsApp Business API · OpenAI GPT  
**Related Documents:**
- [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md)
- [KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md](./KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md)
- [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md)
- [KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md](./KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md)
- [KUBERONE_ER_DIAGRAM_AND_DATA_MODEL.md](./KUBERONE_ER_DIAGRAM_AND_DATA_MODEL.md)
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md)
- [KUBERONE_USER_TYPES_AND_ROLES.md](./KUBERONE_USER_TYPES_AND_ROLES.md)
- [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md)
- [KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md](./KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md)
- [KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md](./KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md)
- [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md)
- [KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md)
- [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Complete backend implementation blueprint — architecture, modules, engines, security, jobs, deployment |
| **Audience** | Backend Engineers, Tech Leads, Architects, Security, DevOps, QA |
| **Status** | Authoritative Backend Master Guide |
| **Out of Scope** | Source code, API endpoint implementations, SQL queries, OpenAPI YAML |

---

## Blueprint Statistics

| Metric | Count |
|--------|-------|
| **Backend modules** | 25 |
| **Domain engines** | 6 (Eligibility, EMI, Referral, Commission, Notification, AI) |
| **LOS stages** | 9 (S01–S09) |
| **LMS statuses** | 12 |
| **API domains** | 18 (per API Specification) |
| **Background workers** | 7 |
| **Scheduled jobs** | 8 |
| **Domain events** | 24 |
| **Development phases** | 8 |
| **Phase 1 tables** | 139 |

---

# 33. EXECUTIVE SUMMARY

*CTO-level backend blueprint summary — presented first.*

## Strategic Backend Position

KuberOne backend is a **modular monolith** built on **Node.js + Express + TypeScript**, serving four client surfaces (Customer App, DSA App, CRM Admin, Management) through a **single versioned REST API** (`/api/v1`). The architecture enforces **layered separation** (Routes → Controllers → Services → Repositories → Prisma → MySQL), **RBAC at middleware**, and **domain engines** for eligibility, EMI, referrals, commissions, notifications, and AI—enabling rapid fintech delivery without sacrificing regulatory posture.

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Modular monolith** | Single deploy unit; module boundaries enable future extraction |
| **Prisma ORM** | Type-safe queries; schema-as-code; migration discipline |
| **JWT + refresh rotation** | Stateless API; OTP for external users; MFA for employees |
| **Presigned S3 uploads** | Documents never transit API body; cost-efficient storage |
| **Event bus (in-process)** | Decouple notifications, analytics, AI triggers without message broker Phase 1 |
| **Zod validation** | Shared schemas across backend and all clients via `shared-validation` |
| **PM2 cluster mode** | Zero-downtime reload on EC2 without Kubernetes |
| **OpenAI + RAG** | AI advisor and sales copilot over knowledge base—not generic chatbot |

## Module Landscape

| Category | Modules |
|----------|---------|
| **Identity & Security** | Authentication, Authorization (RBAC), User, Role, Permission, Audit |
| **Party Management** | Customer, Partner, Employee, Branch |
| **Product & Pricing** | Product, Eligibility, EMI |
| **Sales Pipeline** | Lead (LMS), Application, LOS |
| **Compliance** | KYC, Document |
| **Economics** | Referral, Commission, Campaign |
| **Engagement** | Notification, Support, AI Advisor, AI Sales Copilot, Knowledge Base |
| **Operations** | Analytics, Settings |

## Development Phases (Summary)

| Phase | Focus | Duration (Est.) |
|-------|-------|-----------------|
| **Phase 1** | Authentication, sessions, RBAC foundation | Weeks 1–3 |
| **Phase 2** | Users, organization, customers, partners | Weeks 4–6 |
| **Phase 3** | LMS — leads, assignment, scoring | Weeks 7–9 |
| **Phase 4** | LOS — applications, stages, credit, disbursement | Weeks 10–14 |
| **Phase 5** | Documents, KYC, S3, OCR pipeline | Weeks 15–17 |
| **Phase 6** | AI advisor, copilot, knowledge base, RAG | Weeks 18–20 |
| **Phase 7** | Analytics, commissions, referrals, campaigns | Weeks 21–23 |
| **Phase 8** | Production hardening, monitoring, load testing | Weeks 24–26 |

## Security & Compliance Posture

- **Default deny** RBAC with 22 roles × 25 resource categories (per RBAC document)
- **Scope injection** from JWT — branchId/regionId never client-overridable
- **PII masking** in API responses by role; enhanced audit on document/PII access
- **Rate limiting** per IP, per user, per endpoint class (auth, AI, upload)
- **Idempotency-Key** on financial mutations (commission, disbursement)
- **DPDP/RBI alignment** — consent gates, audit retention 5–10 years

## Production Readiness Criteria

| Gate | Requirement |
|------|-------------|
| **Auth** | OTP + JWT rotation tested; token revocation verified |
| **RBAC** | 100% endpoint permission mapping complete |
| **LOS** | S01–S09 transitions with audit trail |
| **Documents** | S3 presign + virus scan + OCR queue operational |
| **Notifications** | FCM + SMS + WhatsApp delivery ≥ 99% |
| **AI** | Rate limits; prompt injection guards; RAG source attribution |
| **Observability** | Structured logs, health checks, PM2 monitoring |
| **DR** | RDS backup + S3 versioning + restore drill |

**CTO Recommendation:** Approve this Backend Development Blueprint as the mandatory implementation guide for all KuberOne backend engineering. No module ships without alignment to layered architecture, RBAC mapping, and audit requirements defined herein.

---

# 1. BACKEND OVERVIEW

## 1.1 Backend Goals

| # | Goal | Success Metric |
|---|------|----------------|
| 1 | **Unified API platform** | One API serves Customer, DSA, CRM, Management clients |
| 2 | **Regulatory compliance** | Audit trail on all PII/document/financial mutations |
| 3 | **Partner economics** | Isolated DSA data; transparent commission ledger |
| 4 | **AI differentiation** | Advisor + copilot integrated into LMS/LOS workflows |
| 5 | **Operational efficiency** | LOS stage automation; SLA alerts; deficiency tracking |
| 6 | **Developer velocity** | Modular structure; shared types; predictable patterns |
| 7 | **Cost efficiency** | Modular monolith on EC2; pay-per-use OpenAI |
| 8 | **Lender readiness** | Adapter interface for future lender API integrations |

## 1.2 Scalability Strategy

### Phase 1 — Launch (0–10K MAU)

| Component | Configuration |
|-----------|---------------|
| **API Server** | Single EC2 (t3.large) — PM2 cluster (2 instances) |
| **Database** | AWS RDS MySQL 8 (db.t3.medium) |
| **Storage** | S3 standard; CloudFront for public assets |
| **Workers** | Same EC2 — separate PM2 process for workers |
| **Cache** | In-memory (Node) for config/session blacklist |

### Phase 2 — Growth (10K–100K MAU)

| Component | Configuration |
|-----------|---------------|
| **API Server** | 2× EC2 behind ALB |
| **Database** | RDS primary + read replica |
| **Cache** | Redis (ElastiCache) — session blacklist, rate limits, config |
| **Workers** | Dedicated EC2 for notification + OCR + RAG workers |
| **Search** | MySQL FULLTEXT + dedicated search indexes |

### Phase 3 — Scale (100K+ MAU)

| Component | Configuration |
|-----------|---------------|
| **API** | Horizontal EC2 scaling (4–8 instances) |
| **Extracted services** | Notification service, AI queue service (optional) |
| **Analytics** | Warehouse export (Redshift/BigQuery) |
| **CDN** | CloudFront for document thumbnails |

### Scalability Principles

| Principle | Implementation |
|-----------|----------------|
| **Stateless API** | No server-side session; JWT + refresh in DB |
| **Async heavy work** | OCR, RAG indexing, bulk notifications via workers |
| **DB connection pooling** | Prisma connection pool; max 20 per instance |
| **Pagination mandatory** | All list endpoints paginated; max pageSize 100 |
| **N+1 prevention** | Repository layer uses Prisma `include`/`select` discipline |
| **Horizontal readiness** | Modules communicate via events—not direct cross-module DB writes |

## 1.3 Maintainability Strategy

| Practice | Standard |
|----------|----------|
| **Module boundaries** | Each domain in `modules/{name}/`; no cross-module repository imports |
| **Shared kernel** | `src/shared/` for middleware, errors, utils only |
| **DTO contracts** | Request/response shapes in module `dtos/` + `shared-types` |
| **Validation single source** | Zod schemas in `shared-validation`; backend re-exports |
| **Naming conventions** | `{entity}.controller.ts`, `{entity}.service.ts`, `{entity}.repository.ts` |
| **Transaction boundaries** | Services own `$transaction`; repositories never start transactions |
| **Error taxonomy** | Typed `AppError` hierarchy; no raw `throw new Error()` in services |
| **Documentation** | JSDoc on public service methods; README per module |
| **Dependency injection** | Manual DI via module `.module.ts` wiring (no heavy framework Phase 1) |
| **Code review gates** | RBAC mapping + audit logging checklist per PR |

## 1.4 Security Strategy

| Layer | Control |
|-------|---------|
| **Transport** | TLS 1.3 (Nginx termination); HSTS enabled |
| **Authentication** | JWT access (15 min) + refresh (7 days) rotation; OTP for external |
| **Authorization** | RBAC middleware; scope guards; SoD rules |
| **Input** | Zod validation; sanitization; max body size 1MB (except presign) |
| **Output** | PII masking by role; no stack traces in production |
| **Storage** | S3 SSE-S3; presigned URLs time-limited (15 min upload, 5 min download) |
| **Secrets** | AWS SSM Parameter Store; never in repo |
| **Audit** | All mutations + PII reads logged with actor, IP, user-agent |
| **Rate limiting** | Global + per-route limits; AI endpoints stricter |
| **Dependency scanning** | npm audit in CI; Dependabot enabled |

## 1.5 Performance Strategy

| Area | Target | Approach |
|------|--------|----------|
| **API latency (p95)** | < 300ms (non-AI) | Indexed queries; lean DTOs; connection pooling |
| **API latency (AI)** | < 5s (streaming) | Async where possible; timeout 30s |
| **List endpoints** | < 200ms (p95) | Pagination; selective `select`; avoid deep joins |
| **Document presign** | < 100ms | S3 SDK; no DB in hot path |
| **Eligibility check** | < 500ms | Rules engine in-memory; lender rules cached |
| **EMI calculation** | < 50ms | Pure computation; no DB |
| **Notification dispatch** | Async | Queue via worker; API returns 202 |
| **Cold start** | < 3s | PM2 keep-alive; lazy-load OpenAI client |

## 1.6 Future Expansion Strategy

| Expansion | Integration Point | Restructure Required |
|-----------|-------------------|---------------------|
| **Insurance** | New `modules/insurance/`; product codes INS-*; LOS stages extend | No |
| **Credit Cards** | `modules/cards/`; eligibility engine plugin | No |
| **Personal Loan** | Product module + eligibility rules PL-01 | No |
| **Mutual Funds** | `modules/wealth/`; separate application flow | No |
| **FD** | Product + calculator engine | No |
| **Gold Loan** | Product + collateral module | No |
| **Wealth Management** | Analytics + portfolio submodule | No |
| **Video KYC** | Document module + integration adapter | No |
| **eSign** | Document module + webhook handler | No |
| **Lender API portal** | `integrations/lender/` adapter per lender | No |

**Extension pattern:** New products register in `products` table, add eligibility rules, extend LOS checklist—the modular monolith absorbs new domains as new modules without architectural redesign.

---

# 2. BACKEND LAYERED ARCHITECTURE

## 2.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT APPLICATIONS                            │
│         Customer App · DSA App · CRM Admin · Management · Webhooks       │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ HTTPS /api/v1
┌───────────────────────────────────▼─────────────────────────────────────┐
│                         NGINX (Reverse Proxy)                            │
│              TLS · Rate Limit · Static · Health Check                    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│                      EXPRESS APPLICATION (app.ts)                          │
├─────────────────────────────────────────────────────────────────────────┤
│  MIDDLEWARE CHAIN (order matters)                                        │
│  1. request-id → 2. helmet → 3. cors → 4. body-parser →               │
│  5. rate-limit → 6. authenticate → 7. audit-context →                 │
│  8. authorize → 9. validate → 10. idempotency (conditional)             │
├─────────────────────────────────────────────────────────────────────────┤
│  ROUTES LAYER          modules/*/routes/*.routes.ts                      │
│       ↓                                                                  │
│  CONTROLLER LAYER      modules/*/controllers/*.controller.ts             │
│       ↓                                                                  │
│  VALIDATION LAYER      modules/*/validators/*.validator.ts (Zod)         │
│       ↓                                                                  │
│  SERVICE LAYER         modules/*/services/*.service.ts                   │
│       ↓                    ├── Event Bus (domain events)                 │
│       ↓                    ├── Integration Adapters (SMS, WA, OpenAI)      │
│  REPOSITORY LAYER      modules/*/repositories/*.repository.ts            │
│       ↓                                                                  │
│  PRISMA LAYER          @prisma/client (database package)                 │
│       ↓                                                                  │
│  DATABASE LAYER        MySQL 8 (RDS)                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  AUDIT LAYER           Cross-cutting — audit-context middleware +      │
│                        audit-writer service on mutations/PII reads       │
├─────────────────────────────────────────────────────────────────────────┤
│  ERROR HANDLER         Global — maps AppError → HTTP response            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              AWS S3          Firebase FCM     OpenAI API
              WhatsApp        SMS/Email        External KYC
```

## 2.2 Routes Layer

| Responsibility | Detail |
|----------------|--------|
| **HTTP mapping** | Define verb + path → controller method |
| **Middleware attachment** | Per-route auth, RBAC permission, validation schema |
| **Route grouping** | `/api/v1/{domain}` per module |
| **Versioning** | All routes under `/api/v1`; v2 mount parallel when needed |
| **No business logic** | Routes only wire middleware and controllers |

**Route registration pattern:**

| File | Role |
|------|------|
| `modules/{module}/routes/{entity}.routes.ts` | Entity-specific routes |
| `modules/{module}/{module}.module.ts` | Aggregates routes; exports Router |
| `src/routes/index.ts` | Mounts all module routers |

**Route naming rules (per API Specification):**

| Rule | Example |
|------|---------|
| kebab-case plural nouns | `/applications`, `/lead-assignments` |
| Nested resources | `/applications/{id}/documents` |
| Actions via POST sub-path | `POST /applications/{id}/submit` |
| UUID path params only | `/customers/{customerId}` |

## 2.3 Controller Layer

| Responsibility | Detail |
|----------------|--------|
| **Request parsing** | Extract params, query, body (already validated) |
| **Context assembly** | Build `RequestContext` from `req.user` (JWT claims) |
| **Service invocation** | Call exactly one service method per action |
| **Response formatting** | Use `successResponse()` / `paginatedResponse()` helpers |
| **HTTP status codes** | 200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500 |
| **No DB access** | Controllers never import Prisma or repositories |
| **No business rules** | Controllers never contain if/else business logic |

**Controller method signature pattern:**

| Input | Source |
|-------|--------|
| `req.params` | URL path parameters |
| `req.query` | Filter/pagination (validated) |
| `req.body` | Request body (validated) |
| `req.user` | JWT claims (id, role, branchId, regionId, permissions) |
| `req.requestId` | Correlation ID for logging |

## 2.4 Service Layer

| Responsibility | Detail |
|----------------|--------|
| **Business logic** | All domain rules, state transitions, calculations |
| **Transaction management** | `prisma.$transaction()` for multi-table writes |
| **Event emission** | Publish domain events after successful commits |
| **Orchestration** | Coordinate multiple repositories and integrations |
| **Authorization checks** | Business-level scope validation (record ownership) |
| **Idempotency** | Check idempotency keys for financial operations |
| **External calls** | Invoke integration adapters (S3, FCM, OpenAI, SMS) |
| **Error translation** | Throw typed `AppError` subclasses |

**Service rules:**

| Rule | Enforcement |
|------|-------------|
| One service per aggregate root | `ApplicationService`, `LeadService` |
| Cross-module via service interface | `LeadService` calls `NotificationService.notify()` |
| No HTTP concepts | Services unaware of req/res |
| Pure functions extracted | EMI calc, eligibility rules in dedicated engine classes |

## 2.5 Repository Layer

| Responsibility | Detail |
|----------------|--------|
| **Data access only** | Prisma queries encapsulated |
| **Query composition** | `findMany`, `findUnique`, `create`, `update`, `delete` |
| **Scope filters** | Accept `scope` parameter; apply branch/region/owner filters |
| **No business logic** | No status transition validation in repository |
| **Pagination helpers** | `skip`/`take` from pagination util |
| **Soft delete** | `deletedAt` filter on all reads where applicable |

**Repository naming:**

| Method Pattern | Purpose |
|----------------|---------|
| `findById(id, scope)` | Single record with scope |
| `findMany(filter, pagination, scope)` | List with filters |
| `create(data)` | Insert |
| `update(id, data)` | Update |
| `count(filter, scope)` | Total for pagination meta |

## 2.6 Prisma Layer

| Responsibility | Detail |
|----------------|--------|
| **Schema definition** | Split schema files in `database/prisma/schema/` |
| **Client generation** | `prisma generate` → `@kuberone/database` package |
| **Migrations** | `prisma migrate deploy` in CI/CD |
| **Type safety** | Prisma-generated types used in repositories only |
| **Connection management** | Singleton client in `config/database.ts` |
| **Middleware** | Prisma middleware for soft-delete, audit timestamps (optional) |

**Schema file organization:**

| File | Domain |
|------|--------|
| `schema/auth.prisma` | users, sessions, otp, refresh_tokens |
| `schema/organization.prisma` | branches, employees, regions |
| `schema/customer.prisma` | customers, profiles, addresses |
| `schema/partner.prisma` | partners, partner_kyc |
| `schema/product.prisma` | products, lenders, eligibility_rules |
| `schema/lms.prisma` | leads, assignments, scores, activities |
| `schema/los.prisma` | applications, timeline, sanctions, disbursements |
| `schema/document.prisma` | documents, versions, deficiencies |
| `schema/kyc.prisma` | kyc_profiles, verifications |
| `schema/economics.prisma` | referrals, commissions, campaigns |
| `schema/notification.prisma` | notifications, devices, preferences |
| `schema/support.prisma` | tickets, messages |
| `schema/ai.prisma` | chat_sessions, messages, recommendations |
| `schema/knowledge.prisma` | articles, faqs, rag_sources |
| `schema/analytics.prisma` | snapshots, metrics |
| `schema/audit.prisma` | audit_logs, security_logs |
| `schema/settings.prisma` | system_settings, feature_flags |

## 2.7 Database Layer (MySQL 8)

| Responsibility | Detail |
|----------------|--------|
| **Persistence** | All relational data in RDS MySQL 8 |
| **ACID transactions** | Financial records require serializable or repeatable read |
| **Indexing** | Per Database Schema Specification |
| **Charset** | `utf8mb4_unicode_ci` |
| **Timezone** | UTC storage; IST display in application layer |
| **Backup** | Automated RDS snapshots; daily; 35-day retention |
| **Read replica** | Phase 2 for analytics queries and reports |

## 2.8 Middleware Layer

| Middleware | Order | Responsibility |
|------------|-------|----------------|
| `request-id` | 1 | Generate `X-Request-Id` UUID; attach to `req` and logs |
| `helmet` | 2 | Security headers (CSP, X-Frame-Options, etc.) |
| `cors` | 3 | Whitelist origins per environment |
| `body-parser` | 4 | JSON body; limit 1MB |
| `rate-limit` | 5 | Global + route-specific limits |
| `authenticate` | 6 | JWT validation; attach `req.user` |
| `audit-context` | 7 | Attach actor, IP, user-agent to async context |
| `authorize` | 8 | RBAC permission check per route metadata |
| `validate` | 9 | Zod schema validation (params, query, body) |
| `idempotency` | 10 | Financial mutation idempotency (conditional) |
| `error-handler` | Last | Global error mapping |

## 2.9 Validation Layer

| Responsibility | Detail |
|----------------|--------|
| **Request validation** | Zod schemas validate params, query, body before controller |
| **Schema location** | `shared-validation` package; re-exported in module validators |
| **Error format** | `VALIDATION_ERROR` with field-level details array |
| **Business validation** | In service layer—not Zod (e.g., "lead already converted") |
| **Response validation** | Phase 2 — optional Zod output schemas in development |

## 2.10 Audit Layer

| Responsibility | Detail |
|----------------|--------|
| **Mutation audit** | Every CREATE, UPDATE, DELETE logged with before/after |
| **PII read audit** | Enhanced logging when PII fields returned |
| **Document access** | Download/presign generation logged |
| **Auth events** | Login, logout, failed auth, token refresh |
| **Permission changes** | Role assignment, permission grant/revoke |
| **Financial events** | Commission approval, disbursement, sanction |
| **Async write** | Audit writes non-blocking; queue on failure |

**Audit log fields:**

| Field | Description |
|-------|-------------|
| `id` | UUID |
| `actorId` | User who performed action |
| `actorRole` | Role at time of action |
| `action` | CREATE, READ, UPDATE, DELETE, LOGIN, etc. |
| `resourceType` | Entity type (APPLICATION, DOCUMENT, etc.) |
| `resourceId` | Entity UUID |
| `changes` | JSON diff (before/after) |
| `ipAddress` | Client IP |
| `userAgent` | Client user agent |
| `requestId` | Correlation ID |
| `metadata` | Additional context |
| `createdAt` | Timestamp UTC |

---

# 3. MODULE ARCHITECTURE

## 3.1 Complete Module Registry

| # | Module | Path | Primary Responsibility | API Prefix |
|---|--------|------|------------------------|------------|
| 1 | **Authentication** | `modules/auth` | OTP, JWT, sessions, devices | `/auth` |
| 2 | **User** | `modules/users` | User CRUD, profile, status | `/users` |
| 3 | **Role** | `modules/roles` | Role definitions, templates | `/admin/roles` |
| 4 | **Permission** | `modules/permissions` | Permission matrix, grants | `/admin/permissions` |
| 5 | **Customer** | `modules/customers` | Customer lifecycle, profile, 360 | `/customer`, `/crm/customers` |
| 6 | **Partner** | `modules/partners` | DSA, referral partners, onboarding | `/dsa`, `/crm/partners` |
| 7 | **Employee** | `modules/employees` | Internal staff management | `/admin/employees` |
| 8 | **Branch** | `modules/branches` | Branch, region hierarchy | `/admin/branches` |
| 9 | **Product** | `modules/products` | Loan products, lender policies | `/products`, `/admin/products` |
| 10 | **Lead** | `modules/leads` | LMS — lead lifecycle | `/crm/leads`, `/dsa/leads` |
| 11 | **Application** | `modules/applications` | Application CRUD, wizard | `/applications` |
| 12 | **Eligibility** | `modules/eligibility` | Eligibility engine | `/eligibility` |
| 13 | **EMI** | `modules/emi` | EMI calculator engine | `/emi` |
| 14 | **Document** | `modules/documents` | Upload, verify, vault | `/documents` |
| 15 | **KYC** | `modules/kyc` | PAN, Aadhaar, verification | `/kyc`, `/customer/kyc` |
| 16 | **Referral** | `modules/referrals` | Referral tracking, rewards | `/referrals` |
| 17 | **Commission** | `modules/commissions` | Commission ledger, payout | `/crm/commissions`, `/dsa/commissions` |
| 18 | **Campaign** | `modules/campaigns` | Marketing campaigns | `/admin/campaigns` |
| 19 | **Notification** | `modules/notifications` | Push, SMS, email, WA, in-app | `/notifications` |
| 20 | **Support** | `modules/support` | Tickets, escalation | `/support`, `/crm/support` |
| 21 | **Analytics** | `modules/analytics` | Dashboards, KPIs, reports | `/analytics` |
| 22 | **AI** | `modules/ai` | Advisor, copilot, voice | `/ai`, `/voice` |
| 23 | **Knowledge Base** | `modules/knowledge` | Policies, FAQs, RAG sources | `/knowledge` |
| 24 | **Settings** | `modules/settings` | System configuration | `/admin/settings` |
| 25 | **Audit** | `modules/audit` | Audit log queries, compliance | `/compliance/audit` |

## 3.2 Cross-Cutting Modules (Not in Primary List but Required)

| Module | Path | Responsibility |
|--------|------|----------------|
| **LOS** | `modules/los` | Stage management S01–S09, credit, ops, disbursement |
| **Organization** | `modules/organization` | Aggregates branch + employee + region |
| **Webhooks** | `modules/webhooks` | Inbound WhatsApp, SMS, KYC, lender callbacks |
| **Admin** | `modules/admin` | Platform admin operations, feature flags |
| **Public** | `modules/public` | Unauthenticated product catalog, calculators |

## 3.3 Module Dependency Matrix

| Module | Depends On |
|--------|------------|
| Authentication | User |
| User | Role, Permission |
| Customer | User, KYC, Document |
| Partner | User, KYC, Commission |
| Lead | Customer, Partner, Product, Notification |
| Application | Customer, Lead, Product, Document, LOS |
| LOS | Application, Document, KYC, Notification |
| Document | Customer, Application, S3 integration |
| Eligibility | Product, Customer |
| Commission | Partner, Application, Referral |
| Referral | Customer, Partner |
| Notification | User, FCM/SMS/Email/WA integrations |
| AI | Knowledge, Customer, Application, OpenAI |
| Analytics | All modules (read-only) |
| Audit | All modules (write-only cross-cutting) |

## 3.4 Standard Module Internal Structure

Every module implements:

```
modules/{module}/
├── {module}.module.ts           # Route registration + dependency wiring
├── controllers/                 # HTTP handlers
├── services/                    # Business logic
├── repositories/                # Prisma data access
├── routes/                      # Express routers
├── validators/                  # Zod schema bindings
├── dtos/                        # Request/response shapes
├── mappers/                     # Entity ↔ DTO
├── events/                      # Domain event definitions + handlers
├── constants/                   # Module-specific enums
└── types/                       # Module-specific TypeScript types
```

## 3.5 Module Communication Rules

| Pattern | When | Example |
|---------|------|---------|
| **Service → Service** | Cross-module business operation | `ApplicationService` → `NotificationService` |
| **Service → Event** | Async side effects | `LeadService` emits `LEAD_CREATED` |
| **Event → Handler** | Decoupled reactions | `LEAD_CREATED` → notification + analytics |
| **Repository → Repository** | ✗ Forbidden cross-module | Use service layer |
| **Direct Prisma in controller** | ✗ Forbidden | Always via service → repository |

---

# 4. AUTHENTICATION MODULE

## 4.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/auth` |
| **API Domain** | `/api/v1/auth` |
| **Primary Tables** | `users`, `otp_verifications`, `refresh_tokens`, `user_sessions`, `user_devices` |
| **Consumers** | Customer App, DSA App, CRM Admin |

## 4.2 Authentication Flows

### 4.2.1 Customer / DSA — OTP Login

| Step | Actor | Action |
|------|-------|--------|
| 1 | Client | `POST /auth/otp/send` — phone + userType (CUSTOMER \| DSA) |
| 2 | Backend | Validate phone format; rate-limit (3/hour/phone); generate 6-digit OTP |
| 3 | Backend | Hash OTP (bcrypt); store in `otp_verifications` with 5-min expiry |
| 4 | Backend | Dispatch OTP via SMS integration (primary) or WhatsApp (fallback) |
| 5 | Client | `POST /auth/otp/verify` — phone + OTP + deviceInfo |
| 6 | Backend | Verify OTP hash; check expiry; mark consumed |
| 7 | Backend | Find or create `users` record; link to customer/partner profile |
| 8 | Backend | Issue access token (15 min) + refresh token (7 days) |
| 9 | Backend | Register device in `user_devices`; create session in `user_sessions` |
| 10 | Client | Store tokens securely (Keychain/Keystore); attach Bearer header |

### 4.2.2 Employee — Email + Password + MFA

| Step | Actor | Action |
|------|-------|--------|
| 1 | Client | `POST /auth/login` — email + password |
| 2 | Backend | Validate credentials (bcrypt); check account status (ACTIVE) |
| 3 | Backend | If MFA enabled → return `mfaRequired: true` + `mfaToken` (short-lived) |
| 4 | Client | `POST /auth/mfa/verify` — mfaToken + TOTP code |
| 5 | Backend | Verify TOTP; issue tokens; create session |
| 6 | Backend | Log login event in audit |

### 4.2.3 Token Refresh

| Step | Actor | Action |
|------|-------|--------|
| 1 | Client | `POST /auth/refresh` — refresh token in body |
| 2 | Backend | Validate refresh token hash in `refresh_tokens` |
| 3 | Backend | Check not revoked; not expired; session still active |
| 4 | Backend | **Rotate** — revoke old refresh; issue new access + new refresh |
| 5 | Backend | Return new token pair |

## 4.3 JWT Access Token

| Claim | Type | Description |
|-------|------|-------------|
| `sub` | UUID | User ID |
| `userType` | enum | CUSTOMER, DSA, EMPLOYEE |
| `role` | string | Primary role code (e.g., SALES_EXECUTIVE) |
| `roles` | string[] | All assigned roles |
| `permissions` | string[] | Flattened permission codes (e.g., `LEAD_READ_ASSIGNED`) |
| `branchId` | UUID? | Scope — branch (employees) |
| `regionId` | UUID? | Scope — region (employees) |
| `partnerId` | UUID? | Scope — partner (DSA) |
| `customerId` | UUID? | Scope — customer (customer app) |
| `sessionId` | UUID | Active session reference |
| `iat` | number | Issued at |
| `exp` | number | Expiry (15 minutes from iat) |

| Configuration | Value |
|---------------|-------|
| Algorithm | RS256 (asymmetric) — public key for verification |
| Secret storage | Private key in AWS SSM |
| Issuer | `kuberone.kuberfinserve.com` |
| Audience | `kuberone-api` |

## 4.4 Refresh Token

| Attribute | Value |
|-----------|-------|
| Format | Opaque UUID (not JWT) |
| Storage | Hashed (SHA-256) in `refresh_tokens` table |
| Expiry | 7 days (configurable per userType) |
| Rotation | Single-use — old token invalidated on refresh |
| Family tracking | `tokenFamily` UUID — detect reuse → revoke all family tokens |
| Binding | Linked to `sessionId` + `deviceId` |

## 4.5 Device Registration

| Field | Source | Purpose |
|-------|--------|---------|
| `deviceId` | Client-generated UUID (persistent) | Device identification |
| `platform` | IOS \| ANDROID \| WEB | Push targeting |
| `pushToken` | FCM token | Push notifications |
| `appVersion` | Client header | Version gating |
| `osVersion` | Client | Support diagnostics |
| `model` | Client | Support diagnostics |
| `lastActiveAt` | Server | Dormant device cleanup |

**Device lifecycle:**

| Event | Action |
|-------|--------|
| Login | Upsert device record; update push token |
| Logout (single) | Mark device session ended |
| Logout (all) | Revoke all sessions for user |
| Token refresh | Update `lastActiveAt` |
| 90-day inactive | Soft-delete device; stop push |

## 4.6 Session Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/me` | GET | Current user profile + roles + permissions |
| `/auth/sessions` | GET | List active sessions for current user |
| `/auth/sessions/{id}` | DELETE | Revoke specific session |
| `/auth/logout` | POST | Revoke current session + refresh token |
| `/auth/logout-all` | POST | Revoke all sessions (password re-verify for employees) |

**Session record fields:**

| Field | Description |
|-------|-------------|
| `id` | Session UUID |
| `userId` | Owner |
| `deviceId` | Linked device |
| `ipAddress` | Login IP |
| `userAgent` | Client UA |
| `createdAt` | Login time |
| `lastActiveAt` | Last API call |
| `expiresAt` | Session expiry |
| `revokedAt` | Null if active |

## 4.7 Logout

| Type | Scope | Implementation |
|------|-------|----------------|
| **Single device** | Current session | Set `revokedAt` on session; delete refresh token |
| **All devices** | All user sessions | Bulk revoke sessions + refresh tokens |
| **Admin force** | Target user | Super Admin / Admin endpoint; enhanced audit |
| **Security event** | Compromised token | Revoke token family; force re-auth |

## 4.8 Token Revocation

| Mechanism | Use Case |
|-----------|----------|
| **DB revocation** | Refresh token deleted/expired in `refresh_tokens` |
| **Session revocation** | `user_sessions.revokedAt` set |
| **Blacklist (Phase 2)** | Redis set for access tokens before natural expiry |
| **Family invalidation** | Refresh token reuse detected → revoke entire family |
| **Role change** | Permission update → invalidate all sessions for user |
| **Account suspension** | `users.status = SUSPENDED` → reject all tokens |

## 4.9 Authentication Module Components

| Layer | Files |
|-------|-------|
| **Controllers** | `otp.controller`, `login.controller`, `mfa.controller`, `session.controller`, `token.controller` |
| **Services** | `otp.service`, `token.service`, `session.service`, `mfa.service`, `device.service` |
| **Repositories** | `otp.repository`, `session.repository`, `refresh-token.repository`, `device.repository` |
| **Validators** | `send-otp`, `verify-otp`, `login`, `refresh`, `mfa-verify` |
| **Integrations** | SMS provider, WhatsApp (OTP delivery fallback) |

## 4.10 Security Controls

| Control | Implementation |
|---------|----------------|
| OTP rate limit | 3 sends/hour/phone; 5 verify attempts then lockout 30 min |
| OTP entropy | 6-digit cryptographically random |
| OTP storage | bcrypt hash; plaintext never stored |
| Brute force | Progressive delay on failed login |
| Account lockout | 10 failed attempts → 1-hour lock |
| Password policy | Min 12 chars; complexity rules (employees) |
| MFA | TOTP (Google Authenticator compatible) for employees |
| IP logging | All auth events capture IP + geo (Phase 2) |

---

# 5. AUTHORIZATION MODULE

## 5.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/permissions` + `modules/roles` + `shared/middleware/authorize` |
| **Governance** | [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) |
| **Enforcement Point** | `authorize.middleware.ts` on every protected route |

## 5.2 RBAC Architecture

```
REQUEST → authenticate → authorize.middleware
                              │
                              ├── Load route permission metadata
                              ├── Compare req.user.permissions[]
                              ├── Check scope (branch/region/own)
                              ├── Apply SoD rules (if action)
                              └── PASS → controller | FAIL → 403
```

## 5.3 Permission Engine

| Component | Responsibility |
|-----------|----------------|
| **Permission Registry** | Static map: route → required permission code |
| **Permission Resolver** | Flatten role permissions at login → embed in JWT |
| **Scope Evaluator** | Post-query or query-filter scope enforcement |
| **SoD Guard** | Block conflicting role actions (e.g., credit + disburse) |
| **Field Masker** | Strip/mask PII fields based on role before response |

**Permission code format:**

```
{RESOURCE}_{ACTION}_{SCOPE}

Examples:
  LEAD_READ_ASSIGNED
  APPLICATION_UPDATE_BRANCH
  COMMISSION_APPROVE_ORGANIZATION
  DOCUMENT_DOWNLOAD_OWN
  ANALYTICS_READ_AGGREGATED
```

## 5.4 Permission Types (19)

| Type | Code Suffix | Description |
|------|-------------|-------------|
| CREATE | `_CREATE` | Create new records |
| READ | `_READ` | View records |
| UPDATE | `_UPDATE` | Modify records |
| DELETE | `_DELETE` | Soft/hard delete |
| APPROVE | `_APPROVE` | Approval actions |
| REJECT | `_REJECT` | Rejection actions |
| ASSIGN | `_ASSIGN` | Assignment actions |
| EXPORT | `_EXPORT` | Data export |
| DOWNLOAD | `_DOWNLOAD` | Document download |
| UPLOAD | `_UPLOAD` | Document upload |
| CONFIGURE | `_CONFIGURE` | System configuration |
| DISBURSE | `_DISBURSE` | Disbursement actions |
| SANCTION | `_SANCTION` | Sanction actions |
| LOGIN_AS | `_LOGIN_AS` | Impersonation (Super Admin) |
| AUDIT | `_AUDIT` | Audit log access |
| MASKED_READ | `_MASKED_READ` | Read with PII masked |
| AGGREGATED_READ | `_AGGREGATED_READ` | Analytics only |
| IMPERSONATE | `_IMPERSONATE` | View-as (support) |
| REVOKE | `_REVOKE` | Revoke access/tokens |

## 5.5 Data Visibility Rules

| Scope | Code | SQL Filter Pattern |
|-------|------|-------------------|
| **OWN** | `_OWN` | `WHERE owner_id = :userId` or `customer_id = :customerId` |
| **ASSIGNED** | `_ASSIGNED` | `WHERE assigned_to = :userId` |
| **PORTFOLIO** | `_PORTFOLIO` | `WHERE rm_id = :userId` |
| **BRANCH** | `_BRANCH` | `WHERE branch_id = :branchId` |
| **REGION** | `_REGION` | `WHERE region_id = :regionId` |
| **ORGANIZATION** | `_ORGANIZATION` | No scope filter (compliance/admin) |
| **AGGREGATED** | `_AGGREGATED` | Pre-aggregated views only; no row-level |
| **ALL** | `_ALL` | Super Admin — enhanced audit |

**Scope injection rule:** `branchId`, `regionId`, `partnerId`, `customerId` are extracted from JWT claims—**never** accepted from request body or query parameters.

## 5.6 Role Resolution

| Step | Process |
|------|---------|
| 1 | User authenticates → `users` record loaded |
| 2 | Query `user_roles` → all active role assignments |
| 3 | For each role → load `role_permissions` |
| 4 | Merge permissions (union); highest scope wins per resource+action |
| 5 | Embed flattened `permissions[]` in JWT access token |
| 6 | Embed primary `role`, `branchId`, `regionId` in JWT |
| 7 | On role change → force session invalidation |

## 5.7 Route Authorization Metadata

Every route definition includes:

| Metadata | Example |
|----------|---------|
| `permission` | `LEAD_READ_ASSIGNED` |
| `resource` | `LEAD` |
| `sodCheck` | `false` or SoD rule ID |
| `auditLevel` | `STANDARD` \| `ENHANCED` |
| `maskPii` | `true` for management roles |

## 5.8 Segregation of Duties (SoD) Rules

| Rule ID | Role A Cannot + Role B Cannot | Enforced Action |
|---------|-------------------------------|-----------------|
| SOD-01 | Credit Analyst approve + Ops disburse | Same user on same application |
| SOD-02 | Sales create commission + Finance approve | Same user |
| SOD-03 | Compliance audit + Sales modify | Cross-role on same record |
| SOD-04 | Admin assign role + User approve own request | Self-approval blocked |
| SOD-05 | DSA view commission config | DSA role blocked |
| SOD-06 | Management raw PII + without Compliance auth | PII access blocked |
| SOD-07 | Ops modify KYC + Compliance verify KYC | Same user |
| SOD-08 | Sales sanction + Credit sanction | Sales blocked from sanction |
| SOD-09 | Partner onboard + Partner approve KYC | Same partner admin |
| SOD-10 | Campaign send + Compliance block list | Blocked override |
| SOD-11 | Super Admin destructive + without dual approval | Dual approval required |
| SOD-12 | AI copilot auto-approve + Human approve | AI cannot auto-approve |

## 5.9 Authorization Module Components

| Layer | Files |
|-------|-------|
| **Middleware** | `authorize.middleware.ts`, `scope-guard.ts`, `sod-guard.ts` |
| **Services** | `permission.service`, `role.service`, `scope-evaluator.service` |
| **Repositories** | `role.repository`, `permission.repository`, `user-role.repository` |
| **Controllers** | `role.controller`, `permission.controller` (admin) |
| **Shared** | `mask.ts` (PII field masking utility) |

---

# 6. CUSTOMER MODULE

## 6.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/customers` |
| **API Prefixes** | `/customer/*` (self-service), `/crm/customers/*` (internal) |
| **Primary Tables** | `customers`, `customer_profiles`, `customer_addresses`, `customer_employment`, `customer_income`, `customer_preferences`, `customer_consents` |

## 6.2 Customer Registration

| Step | Trigger | Action |
|------|---------|--------|
| 1 | OTP verify (new phone) | Create `users` + `customers` records |
| 2 | Auto | Generate `customerCode` (CUS-{sequence}) |
| 3 | Auto | Create empty `customer_profiles` |
| 4 | Required | Capture DPDP consent via `customer_consents` |
| 5 | Optional | Referral code attribution if provided |
| 6 | Event | Emit `CUSTOMER_REGISTERED` |

**Registration data minimum:**

| Field | Required | Validation |
|-------|----------|------------|
| Phone | Yes | Indian mobile 10-digit |
| Full name | Yes (profile step) | 2–100 chars |
| Email | Optional | RFC 5322 format |
| Consent | Yes | Timestamp + version + IP |
| Referral code | Optional | Valid active code |

## 6.3 Profile Management

| Sub-resource | Endpoints | Fields |
|--------------|-----------|--------|
| **Profile** | GET/PUT `/customer/profile` | name, email, DOB, gender, marital status, photo |
| **Addresses** | CRUD `/customer/addresses` | type, line1, line2, city, state, pincode |
| **Employment** | CRUD `/customer/employment` | type, company, designation, experience |
| **Income** | CRUD `/customer/income` | source, amount, frequency |
| **Preferences** | GET/PUT `/customer/preferences` | language, notification prefs, product interests |
| **Dashboard** | GET `/customer/dashboard` | applications, notifications, quick actions |

**Profile completion score:**

| Section | Weight | Trigger |
|---------|--------|---------|
| Basic profile | 20% | Name, DOB filled |
| Address | 15% | Primary address |
| Employment | 20% | Employment details |
| Income | 20% | Income declared |
| KYC | 25% | PAN verified |

## 6.4 KYC (Customer Scope)

| Check | Endpoint | Integration |
|-------|----------|-------------|
| PAN submit | POST `/customer/kyc/pan` | PAN verification adapter |
| Aadhaar OTP | POST `/customer/kyc/aadhaar/send-otp` | Aadhaar adapter |
| Aadhaar verify | POST `/customer/kyc/aadhaar/verify` | Aadhaar adapter |
| KYC status | GET `/customer/kyc/status` | Aggregate from `kyc_profiles` |
| CKYC consent | POST `/customer/kyc/ckyc-consent` | Consent capture |

*Full KYC module detailed in Section 15 cross-reference; customer module orchestrates customer-facing KYC flow.*

## 6.5 Documents (Customer Scope)

| Action | Endpoint | Flow |
|--------|----------|------|
| List required | GET `/customer/documents/required` | Based on active applications |
| Request presign | POST `/customer/documents/presign` | Returns S3 presigned PUT URL |
| Confirm upload | POST `/customer/documents` | Register metadata after S3 upload |
| List uploaded | GET `/customer/documents` | Customer's document vault |
| Download | GET `/customer/documents/{id}/download` | Presigned GET URL (5 min) |

## 6.6 Applications (Customer Scope)

| Action | Endpoint | Description |
|--------|----------|-------------|
| List | GET `/customer/applications` | Own applications only |
| Create | POST `/customer/applications` | Start new application wizard |
| Get | GET `/customer/applications/{id}` | Application detail + timeline |
| Update step | PUT `/customer/applications/{id}/step` | Wizard step data |
| Submit | POST `/customer/applications/{id}/submit` | Submit for processing |
| Withdraw | POST `/customer/applications/{id}/withdraw` | Customer-initiated withdraw |

## 6.7 Referrals (Customer Scope)

| Action | Endpoint | Description |
|--------|----------|-------------|
| Get code | GET `/customer/referrals/code` | Personal referral code |
| Share | GET `/customer/referrals/share` | Share link + message template |
| Track | GET `/customer/referrals` | Referred users + reward status |
| Rewards | GET `/customer/referrals/rewards` | Earned/pending rewards |

## 6.8 CRM Customer 360 (Internal)

| Endpoint | Role | Data |
|----------|------|------|
| GET `/crm/customers` | Sales+ | Paginated list with scope filter |
| GET `/crm/customers/{id}` | Sales+ | Full 360 view |
| GET `/crm/customers/{id}/timeline` | Sales+ | Activity timeline |
| GET `/crm/customers/{id}/applications` | Sales+ | All applications |
| GET `/crm/customers/{id}/documents` | Sales+ (with permission) | Document list (metadata) |
| PUT `/crm/customers/{id}/assign` | RM+ | Assign RM |
| POST `/crm/customers/{id}/notes` | Sales+ | Internal notes |

## 6.9 Customer Module Components

| Layer | Components |
|-------|------------|
| **Controllers** | `customer-profile`, `customer-address`, `customer-employment`, `customer-income`, `customer-preference`, `customer-consent`, `customer-dashboard`, `crm-customer` |
| **Services** | `customer.service`, `profile-completion.service`, `customer-360.service` |
| **Repositories** | `customer`, `address`, `employment`, `income`, `preference`, `consent` |
| **Events** | `CUSTOMER_REGISTERED`, `CUSTOMER_PROFILE_UPDATED`, `CUSTOMER_KYC_COMPLETED` |

---

# 7. PARTNER MODULE

## 7.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/partners` |
| **API Prefixes** | `/dsa/*` (partner self-service), `/crm/partners/*` (internal) |
| **Primary Tables** | `partners`, `partner_profiles`, `partner_kyc`, `partner_bank_details`, `partner_agreements`, `partner_certifications` |
| **Partner Types** | DSA (Direct Selling Agent), REFERRAL_PARTNER |

## 7.2 DSA Management

| Lifecycle Stage | Status | Actions |
|-----------------|--------|---------|
| Registration | `PENDING_REGISTRATION` | Phone OTP → basic profile |
| KYC Submission | `KYC_PENDING` | PAN, Aadhaar, bank details |
| Agreement | `AGREEMENT_PENDING` | Digital agreement acceptance |
| Review | `UNDER_REVIEW` | Compliance review |
| Active | `ACTIVE` | Full DSA capabilities |
| Suspended | `SUSPENDED` | Login blocked; leads frozen |
| Terminated | `TERMINATED` | Archive; commission settlement |

**DSA onboarding endpoints:**

| Endpoint | Method | Step |
|----------|--------|------|
| `/dsa/register` | POST | Basic registration |
| `/dsa/profile` | GET/PUT | Profile management |
| `/dsa/kyc/pan` | POST | PAN verification |
| `/dsa/kyc/aadhaar` | POST | Aadhaar verification |
| `/dsa/bank-details` | POST/PUT | Bank account for commission |
| `/dsa/agreement` | GET/POST | Agreement view + accept |
| `/dsa/certification` | GET | Training certification status |

## 7.3 Referral Partner Management

| Attribute | DSA | Referral Partner |
|-----------|-----|------------------|
| Lead submission | ✓ Full LMS | ✗ Referral only |
| Commission | ✓ Per disbursement | ✓ Per conversion (flat/%) |
| KYC required | ✓ Full | ✓ Simplified |
| Agreement | ✓ DSA agreement | ✓ Referral agreement |
| Training | ✓ Required | Optional |
| App access | DSA App | Customer App (referral features) |

## 7.4 Partner KYC

| Document/Check | Required (DSA) | Required (Referral) |
|----------------|------------------|---------------------|
| PAN verification | Yes | Yes |
| Aadhaar verification | Yes | Optional |
| Bank proof | Yes | Yes (for payout) |
| Address proof | Yes | No |
| GST (if applicable) | Conditional | No |
| Agreement signed | Yes | Yes |

## 7.5 Performance Tracking

| Metric | Calculation | Endpoint |
|--------|-------------|----------|
| Leads submitted | COUNT leads WHERE partner_id | `/dsa/performance/summary` |
| Conversion rate | Converted / Total leads | `/dsa/performance/conversion` |
| Disbursement volume | SUM disbursement amounts | `/dsa/performance/volume` |
| Active leads | COUNT leads in active status | `/dsa/performance/pipeline` |
| SLA compliance | % leads contacted within SLA | `/dsa/performance/sla` |
| Ranking | Percentile among partners | `/dsa/performance/ranking` |

## 7.6 Commission Tracking (Partner View)

| Endpoint | Data |
|----------|------|
| `/dsa/commissions` | Paginated commission ledger |
| `/dsa/commissions/summary` | Earned, pending, paid totals |
| `/dsa/commissions/{id}` | Commission detail with application link |
| `/dsa/commissions/payouts` | Payout history |
| `/dsa/commissions/statements` | Monthly statements (PDF via S3) |

## 7.7 CRM Partner Management (Internal)

| Endpoint | Role | Action |
|----------|------|--------|
| GET `/crm/partners` | Admin, Compliance | List all partners |
| GET `/crm/partners/{id}` | Admin, Compliance | Partner 360 |
| PUT `/crm/partners/{id}/status` | Admin | Activate/suspend/terminate |
| PUT `/crm/partners/{id}/approve-kyc` | Compliance | KYC approval |
| GET `/crm/partners/{id}/performance` | Branch Mgr+ | Performance dashboard |
| PUT `/crm/partners/{id}/assign-rm` | Branch Mgr | Assign relationship manager |

## 7.8 Partner Module Components

| Layer | Components |
|-------|------------|
| **Controllers** | `dsa-profile`, `dsa-kyc`, `dsa-bank`, `dsa-agreement`, `dsa-performance`, `dsa-commission`, `crm-partner` |
| **Services** | `partner.service`, `partner-onboarding.service`, `partner-certification.service`, `partner-performance.service` |
| **Repositories** | `partner`, `partner-kyc`, `partner-bank`, `partner-agreement` |
| **Events** | `PARTNER_REGISTERED`, `PARTNER_KYC_SUBMITTED`, `PARTNER_ACTIVATED`, `PARTNER_SUSPENDED` |

---

# 8. LMS MODULE (Lead Management System)

## 8.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/leads` |
| **API Prefixes** | `/crm/leads/*`, `/dsa/leads/*` |
| **Primary Tables** | `leads`, `lead_assignments`, `lead_scores`, `lead_activities`, `lead_qualifications`, `lead_sla` |
| **Governance** | Lead is the entry point to LOS; one lead may convert to one application |

## 8.2 Lead Status Lifecycle

| Status | Code | Description | Next States |
|--------|------|-------------|-------------|
| New | `NEW` | Just created | CONTACTED, EXPIRED |
| Contacted | `CONTACTED` | First contact made | QUALIFIED, UNQUALIFIED, FOLLOW_UP |
| Follow Up | `FOLLOW_UP` | Scheduled follow-up | CONTACTED, QUALIFIED |
| Qualified | `QUALIFIED` | Meets basic criteria | CONVERTED, LOST |
| Unqualified | `UNQUALIFIED` | Does not meet criteria | REACTIVATED, CLOSED |
| Converted | `CONVERTED` | Application created | — (terminal) |
| Lost | `LOST` | Customer declined | REACTIVATED |
| Expired | `EXPIRED` | SLA breached | REACTIVATED |
| Reactivated | `REACTIVATED` | Re-opened | NEW, CONTACTED |
| Closed | `CLOSED` | Administratively closed | — (terminal) |
| On Hold | `ON_HOLD` | Temporarily paused | CONTACTED |
| Duplicate | `DUPLICATE` | Merged with existing | — (terminal) |

## 8.3 Lead Creation

| Source | Creator | Required Fields |
|--------|---------|-----------------|
| Customer App | System (inbound) | productCode, customerId, consent |
| DSA App | DSA partner | customerName, phone, productCode, source |
| CRM Manual | Sales Executive | customerName, phone, productCode, source |
| Website | System (webhook) | name, phone, productCode |
| Campaign | System (campaign) | campaignId, lead data |
| Referral | System | referralCode, customerId |
| Walk-in | Branch staff | branchId, customer data |

**Lead creation flow:**

| Step | Action |
|------|--------|
| 1 | Validate consent (DPDP) |
| 2 | Duplicate check (phone + product within 30 days) |
| 3 | Create `leads` record with status NEW |
| 4 | Calculate initial lead score |
| 5 | Auto-assign based on rules (or queue for manual) |
| 6 | Set SLA timer |
| 7 | Emit `LEAD_CREATED` event |
| 8 | Notify assigned sales executive |

## 8.4 Lead Assignment

| Assignment Rule | Priority | Logic |
|-----------------|----------|-------|
| DSA own lead | 1 | DSA-submitted leads stay with submitting DSA |
| Round-robin | 2 | Branch sales executives rotation |
| Product specialist | 3 | Route by productCode to certified executives |
| Load balancing | 4 | Assign to executive with fewest active leads |
| Manual override | 5 | Branch Manager manual assignment |
| RM portfolio | 6 | Existing customer → assigned RM |

**Assignment endpoints:**

| Endpoint | Method | Actor |
|----------|--------|-------|
| `/crm/leads/{id}/assign` | PUT | Branch Mgr, Admin |
| `/crm/leads/auto-assign` | POST | System (batch) |
| `/crm/leads/{id}/reassign` | PUT | Branch Mgr |
| `/crm/leads/queue` | GET | Sales Mgr — unassigned queue |

## 8.5 Lead Scoring

| Factor | Weight | Source |
|--------|--------|--------|
| Product match | 20% | Product interest vs profile |
| Income eligibility | 25% | Declared income vs product minimum |
| Profile completeness | 15% | Customer profile score |
| Engagement | 15% | App activity, response rate |
| Source quality | 10% | Historical conversion by source |
| Geographic match | 10% | Serviceable area |
| AI score (Phase 2) | 5% | Copilot prediction |

**Score ranges:**

| Range | Label | Action |
|-------|-------|--------|
| 80–100 | Hot | Priority contact within 1 hour |
| 60–79 | Warm | Contact within 4 hours |
| 40–59 | Moderate | Contact within 24 hours |
| 0–39 | Cold | Nurture campaign |

## 8.6 Lead Qualification

| Criterion | Check | Data Source |
|-----------|-------|-------------|
| Age | 21–65 | Customer profile |
| Income | ≥ product minimum | Customer income |
| Employment | Salaried/self-employed per product | Employment |
| Location | Serviceable pincode | Address |
| Existing relationship | No active duplicate application | Applications |
| Credit intent | Loan amount within product range | Lead details |
| Consent | Valid DPDP consent | Consents |

**Qualification endpoint:** `POST /crm/leads/{id}/qualify` → sets status QUALIFIED or UNQUALIFIED with reasons.

## 8.7 Lead Tracking

| Activity Type | Logged In | Trigger |
|---------------|-----------|---------|
| Status change | `lead_activities` | Any status transition |
| Call logged | `lead_activities` | Manual or CTI integration |
| Note added | `lead_activities` | Sales executive note |
| Document requested | `lead_activities` | Document request sent |
| Meeting scheduled | `lead_activities` | Calendar integration |
| SLA warning | `lead_activities` | SLA job trigger |
| Score updated | `lead_scores` | Score recalculation |

## 8.8 Lead Conversion

| Step | Action |
|------|--------|
| 1 | Validate lead status = QUALIFIED |
| 2 | Validate customer profile meets minimum |
| 3 | Create `applications` record linked to lead |
| 4 | Set lead status = CONVERTED |
| 5 | Set `leads.convertedApplicationId` |
| 6 | Transfer lead activities to application timeline |
| 7 | Emit `LEAD_CONVERTED` event |
| 8 | Notify customer, DSA (if applicable), assigned team |

**Endpoint:** `POST /crm/leads/{id}/convert` or `POST /dsa/leads/{id}/convert`

## 8.9 Lead Re-Activation

| Trigger | Condition | Action |
|---------|-----------|--------|
| Manual | Lost/Expired lead | Sales executive requests reactivation |
| Campaign | Marketing campaign targets lost leads | Bulk reactivation |
| Customer return | Customer re-engages in app | Auto-reactivation suggestion |
| SLA reset | Reactivated lead gets new SLA timer | New assignment if unassigned |

**Cooldown:** Minimum 7 days before reactivating a LOST lead.

**Endpoint:** `POST /crm/leads/{id}/reactivate`

## 8.10 LMS Module Components

| Layer | Components |
|-------|------------|
| **Controllers** | `lead`, `lead-assignment`, `lead-activity`, `lead-conversion`, `lead-qualification`, `dsa-lead`, `lead-analytics` |
| **Services** | `lead.service`, `lead-scoring.service`, `lead-assignment.service`, `lead-sla.service`, `lead-qualification.service` |
| **Repositories** | `lead`, `lead-score`, `lead-assignment`, `lead-activity` |
| **Jobs** | `lead-expiry.job`, `lead-sla-check.job` |
| **Events** | `LEAD_CREATED`, `LEAD_ASSIGNED`, `LEAD_QUALIFIED`, `LEAD_CONVERTED`, `LEAD_EXPIRED`, `LEAD_REACTIVATED` |

---

# 9. LOS MODULE (Loan Origination System)

## 9.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/los` (+ `modules/applications`) |
| **API Prefixes** | `/applications/*`, `/crm/los/*`, `/credit/*`, `/ops/*` |
| **Primary Tables** | `applications`, `application_timeline`, `application_stages`, `credit_reviews`, `sanctions`, `disbursements`, `bank_logins` |
| **Stages** | S01–S09 (defined below) |

## 9.2 LOS Stage Model (S01–S09)

| Stage | Code | Name | Owner Role | Entry Trigger |
|-------|------|------|------------|---------------|
| S01 | `DRAFT` | Application Draft | Customer/Sales | Application created |
| S02 | `SUBMITTED` | Submitted | Customer | Customer submits application |
| S03 | `DOCUMENTATION` | Documentation | Sales/Ops | Submitted + checklist generated |
| S04 | `VERIFICATION` | Verification | Ops | All required docs uploaded |
| S05 | `CREDIT_REVIEW` | Credit Review | Credit Analyst | Verification complete |
| S06 | `SANCTIONED` | Sanctioned | Credit Manager | Credit approved |
| S07 | `BANK_LOGIN` | Bank Login | Ops | Sanction issued |
| S08 | `DISBURSED` | Disbursed | Ops/Finance | Bank confirms disbursement |
| S09 | `CLOSED` | Closed | System | Loan tenure complete or rejected/withdrawn |

**Terminal states (not stages):** `REJECTED`, `WITHDRAWN`, `CANCELLED`

## 9.3 Application Creation

| Step | Action |
|------|--------|
| 1 | Validate customer consent + KYC status (minimum PAN) |
| 2 | Validate product is active |
| 3 | Create `applications` with stage S01 (DRAFT) |
| 4 | Create product-specific detail record (HL/LAP/BL/AL) |
| 5 | Generate document checklist |
| 6 | Create timeline entry: "Application created" |
| 7 | Emit `APPLICATION_CREATED` |
| 8 | Return application ID + wizard steps |

**Product-specific detail tables:**

| Product | Table | Key Fields |
|---------|-------|------------|
| Home Loan (HL-01) | `home_loan_details` | propertyValue, loanAmount, tenure, propertyType |
| LAP (LAP-01) | `lap_details` | propertyValue, loanAmount, occupancyType |
| Business Loan (BL-01) | `business_loan_details` | businessType, turnover, loanPurpose |
| Auto Loan (AL-01) | `auto_loan_details` | vehicleType, onRoadPrice, dealerName |

## 9.4 Eligibility (LOS Integration)

| Point | Integration |
|-------|-------------|
| Pre-application | Customer runs eligibility check (Section 11) |
| At submission (S02) | Re-validate eligibility; block if ineligible |
| At credit review (S05) | Credit analyst sees eligibility result + lender matches |
| Post-sanction | Eligibility result archived with application |

## 9.5 Credit Review

| Step | Actor | Action |
|------|-------|--------|
| 1 | Ops | Marks verification complete → advances to S05 |
| 2 | System | Assigns to credit queue (round-robin or product-based) |
| 3 | Credit Analyst | Reviews application, documents, eligibility |
| 4 | Credit Analyst | Adds credit notes, risk flags |
| 5 | Credit Analyst | Requests additional documents (if needed) |
| 6 | Credit Manager | Approves or rejects (SoD: analyst ≠ manager on same app) |
| 7 | System | Advances to S06 (SANCTIONED) or REJECTED |

**Credit review endpoints:**

| Endpoint | Method | Role |
|----------|--------|------|
| `/credit/applications/queue` | GET | Credit Analyst |
| `/credit/applications/{id}/review` | GET | Credit Analyst |
| `/credit/applications/{id}/notes` | POST | Credit Analyst |
| `/credit/applications/{id}/approve` | POST | Credit Manager |
| `/credit/applications/{id}/reject` | POST | Credit Manager |
| `/credit/applications/{id}/request-docs` | POST | Credit Analyst |

## 9.6 Sanction

| Field | Description |
|-------|-------------|
| `sanctionedAmount` | Approved loan amount |
| `sanctionedTenure` | Approved tenure (months) |
| `sanctionedRate` | Interest rate (%) |
| `processingFee` | Processing fee amount |
| `sanctionDate` | Date of sanction |
| `sanctionLetterUrl` | S3 path to sanction letter |
| `validUntil` | Sanction validity (typically 90 days) |
| `conditions` | JSON array of sanction conditions |
| `approvedBy` | Credit Manager user ID |

**Sanction flow:**

| Step | Action |
|------|--------|
| 1 | Credit Manager approves → create `sanctions` record |
| 2 | Generate sanction letter (template → PDF → S3) |
| 3 | Advance application to S06 |
| 4 | Notify customer + DSA + sales team |
| 5 | Emit `APPLICATION_SANCTIONED` |
| 6 | Trigger commission calculation (provisional) |

## 9.7 Disbursement

| Step | Actor | Action |
|------|-------|--------|
| 1 | Ops | Logs into lender portal (bank login — S07) |
| 2 | Ops | Submits application to lender |
| 3 | Lender | Processes and disburses |
| 4 | Ops | Records disbursement details |
| 5 | System | Advances to S08 (DISBURSED) |
| 6 | Finance | Confirms commission payout eligibility |
| 7 | System | Emit `APPLICATION_DISBURSED` |

**Disbursement record fields:**

| Field | Description |
|-------|-------------|
| `disbursedAmount` | Actual disbursed amount |
| `disbursementDate` | Date |
| `utrNumber` | Bank UTR reference |
| `lenderAccount` | Lender reference |
| `firstEmiDate` | EMI start date |
| `disbursedBy` | Ops user ID |

## 9.8 Closure

| Closure Type | Trigger | Stage |
|--------------|---------|-------|
| Successful tenure complete | Loan fully repaid (future LMS integration) | S09 |
| Rejected | Credit rejection | REJECTED |
| Withdrawn | Customer withdrawal | WITHDRAWN |
| Cancelled | Admin cancellation | CANCELLED |
| Sanction expired | Sanction validity passed | S06 → EXPIRED |

## 9.9 Application Timeline

Every stage transition, document event, note, and communication is recorded in `application_timeline`:

| Field | Description |
|-------|-------------|
| `applicationId` | Parent application |
| `eventType` | STAGE_CHANGE, DOCUMENT, NOTE, COMMUNICATION, SYSTEM |
| `fromStage` | Previous stage (if stage change) |
| `toStage` | New stage |
| `description` | Human-readable description |
| `actorId` | Who performed the action |
| `metadata` | JSON — additional context |
| `createdAt` | Timestamp |

**Timeline visibility:**

| Client | Scope |
|--------|-------|
| Customer App | Customer-safe events only (no internal notes) |
| DSA App | DSA-relevant events |
| CRM | Full timeline |

## 9.10 LOS Module Components

| Layer | Components |
|-------|------------|
| **Controllers** | `stage`, `credit-review`, `bank-login`, `sanction`, `disbursement`, `application-timeline` |
| **Services** | `stage-manager.service`, `credit.service`, `ops.service`, `sanction.service`, `disbursement.service`, `lender-router.service` |
| **Repositories** | `application`, `timeline`, `sanction`, `disbursement`, `credit-review` |
| **State Machine** | `stage-manager.service` — validates all transitions |
| **Events** | `APPLICATION_CREATED`, `APPLICATION_SUBMITTED`, `STAGE_CHANGED`, `APPLICATION_SANCTIONED`, `APPLICATION_DISBURSED`, `APPLICATION_REJECTED`, `APPLICATION_WITHDRAWN` |

## 9.11 Stage Transition Rules

| From | To | Allowed Actor | Preconditions |
|------|----|---------------|---------------|
| S01 | S02 | Customer | Wizard complete, consent valid |
| S02 | S03 | System | Auto on submission |
| S03 | S04 | System | All required docs uploaded |
| S04 | S05 | Ops | Verification checklist complete |
| S05 | S06 | Credit Manager | Credit approved (SoD) |
| S05 | REJECTED | Credit Manager | Rejection reason required |
| S06 | S07 | Ops | Bank login initiated |
| S07 | S08 | Ops | Disbursement confirmed |
| S08 | S09 | System | Loan closure event |
| Any | WITHDRAWN | Customer | Before S06 only |
| S01–S03 | CANCELLED | Admin | With reason |

---

# 10. DOCUMENT MODULE

## 10.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/documents` |
| **API Prefix** | `/documents`, `/customer/documents`, `/crm/documents` |
| **Primary Tables** | `documents`, `document_versions`, `document_checklists`, `document_deficiencies`, `document_verifications` |
| **Storage** | AWS S3 (per Section 21) |

## 10.2 Document Upload Flow (Presigned S3)

| Step | Actor | Action |
|------|-------|--------|
| 1 | Client | `POST /documents/presign` — documentType, fileName, mimeType, applicationId |
| 2 | Backend | Validate permission + checklist allows this document type |
| 3 | Backend | Generate S3 key (per naming convention) |
| 4 | Backend | Return presigned PUT URL (15-min expiry) + documentId (pre-created) |
| 5 | Client | Upload file directly to S3 (no API body) |
| 6 | Client | `POST /documents/{id}/confirm` — etag, fileSize |
| 7 | Backend | Verify S3 object exists; update document metadata |
| 8 | Backend | Queue OCR job (if applicable) |
| 9 | Backend | Emit `DOCUMENT_UPLOADED` |
| 10 | Backend | Update application checklist status |

## 10.3 Document Types

| Category | Types |
|----------|-------|
| **Identity** | PAN_CARD, AADHAAR_FRONT, AADHAAR_BACK, PASSPORT, VOTER_ID, DRIVING_LICENSE |
| **Income** | SALARY_SLIP, FORM_16, ITR, BANK_STATEMENT, PENSION_STATEMENT |
| **Employment** | EMPLOYMENT_LETTER, APPOINTMENT_LETTER, BUSINESS_PROOF |
| **Property** | SALE_DEED, PROPERTY_TAX, NOC, APPROVED_PLAN, RENT_AGREEMENT |
| **Business** | GST_CERTIFICATE, SHOP_ACT, PARTNERSHIP_DEED, BALANCE_SHEET |
| **Vehicle** | INVOICE, RC_BOOK, INSURANCE, QUOTATION |
| **Financial** | SANCTION_LETTER, DISBURSEMENT_LETTER, LOAN_AGREEMENT |
| **Partner** | DSA_AGREEMENT, PARTNER_PAN, PARTNER_BANK_PROOF |
| **Other** | PHOTO, SIGNATURE, UTILITY_BILL, OTHER |

## 10.4 Document Verification

| Verification Level | Method | Actor |
|--------------------|--------|-------|
| **Auto — Format** | MIME type, file size, dimensions | System |
| **Auto — OCR** | Extract text; match expected fields | OCR worker |
| **Auto — PAN** | OCR PAN number → verify with PAN API | Integration |
| **Manual — Review** | Ops reviews document image | Ops Executive |
| **Manual — Compliance** | Compliance reviews sensitive docs | Compliance |
| **External — KYC** | Third-party KYC verification | Integration |

**Verification statuses:**

| Status | Description |
|--------|-------------|
| `PENDING` | Uploaded; not yet reviewed |
| `AUTO_VERIFIED` | Passed automated checks |
| `MANUALLY_VERIFIED` | Approved by reviewer |
| `REJECTED` | Failed verification |
| `EXPIRED` | Document past validity date |

## 10.5 OCR Pipeline

| Step | Worker | Action |
|------|--------|--------|
| 1 | `ocr.worker` | Pick document from queue |
| 2 | OCR Service | Call OCR provider (AWS Textract / third-party) |
| 3 | OCR Service | Extract fields based on documentType template |
| 4 | OCR Service | Store extracted data in `document_verifications.extractedData` |
| 5 | OCR Service | Auto-validate extracted PAN/Aadhaar against profile |
| 6 | OCR Service | Set status AUTO_VERIFIED or flag for manual review |
| 7 | Event | Emit `DOCUMENT_OCR_COMPLETED` |

## 10.6 Deficiency Management

| Concept | Description |
|---------|-------------|
| **Checklist** | Per application stage — required documents list |
| **Deficiency** | Required document missing, rejected, or expired |
| **Deficiency notice** | Sent to customer with list of required actions |
| **Deficiency resolution** | Customer uploads → ops verifies → deficiency cleared |

**Deficiency endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/applications/{id}/checklist` | GET | Document checklist with status |
| `/applications/{id}/deficiencies` | GET | Active deficiencies |
| `/crm/documents/{id}/verify` | PUT | Ops verification decision |
| `/crm/documents/{id}/reject` | PUT | Reject with reason |
| `/applications/{id}/deficiency-notice` | POST | Send notice to customer |

## 10.7 Versioning

| Rule | Implementation |
|------|----------------|
| New upload of same type | Creates new version; previous marked superseded |
| Version history | `document_versions` table linked to parent |
| Latest version | `documents.isLatest = true` on current version |
| Audit | All versions retained; no hard delete |
| Download | Default returns latest; explicit version param for history |

## 10.8 Document Vault

| Concept | Implementation |
|---------|----------------|
| **Customer vault** | All customer documents across applications |
| **Application vault** | Documents linked to specific application |
| **Partner vault** | DSA KYC and agreement documents |
| **Access control** | RBAC + scope; download generates audit log |
| **Retention** | 10 years post application closure |
| **Encryption** | S3 SSE-S3 at rest; TLS in transit |

## 10.9 Document Module Components

| Layer | Components |
|-------|------------|
| **Controllers** | `presign`, `document`, `verification`, `deficiency`, `checklist` |
| **Services** | `document.service`, `s3-storage.service`, `document-checklist.service`, `document-verification.service` |
| **Repositories** | `document`, `document-version`, `document-checklist`, `deficiency` |
| **Workers** | `ocr.worker` |
| **Storage** | `s3-key-builder.ts` |
| **Events** | `DOCUMENT_UPLOADED`, `DOCUMENT_VERIFIED`, `DOCUMENT_REJECTED`, `DOCUMENT_OCR_COMPLETED`, `DEFICIENCY_RAISED`, `DEFICIENCY_CLEARED` |

---

# 11. ELIGIBILITY ENGINE

## 11.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/eligibility` |
| **API Prefix** | `/eligibility` |
| **Primary Tables** | `eligibility_rules`, `eligibility_results`, `lender_policies`, `lender_matches` |
| **Type** | Rules engine + lender matching |

## 11.2 Eligibility Check Flow

| Step | Action |
|------|--------|
| 1 | Client submits: productCode, income, employment, age, location, loanAmount |
| 2 | Engine loads product eligibility rules |
| 3 | Engine evaluates each rule (pass/fail/score) |
| 4 | Engine calculates overall eligibility score (0–100) |
| 5 | Engine runs lender matching algorithm |
| 6 | Engine stores result in `eligibility_results` |
| 7 | Return: eligible (yes/no), score, matched lenders, recommendations |

## 11.3 Product-Specific Rules

### 11.3.1 Home Loan (HL-01)

| Rule | Parameter | Default |
|------|-----------|---------|
| Min age | 21 years | — |
| Max age at maturity | 65 years | — |
| Min income (salaried) | ₹25,000/month | — |
| Min income (self-employed) | ₹3,00,000/year | — |
| Max LTV | 80% (90% for <₹30L) | — |
| Min loan amount | ₹5,00,000 | — |
| Max loan amount | ₹5,00,00,000 | — |
| Min tenure | 5 years | — |
| Max tenure | 30 years | — |
| Employment stability | 2 years (salaried) | — |
| Property type | Residential, commercial (limited) | — |
| CIBIL minimum | 650 (Phase 2) | — |

### 11.3.2 LAP (LAP-01)

| Rule | Parameter | Default |
|------|-----------|---------|
| Min age | 25 years | — |
| Max age at maturity | 70 years | — |
| Min property value | ₹10,00,000 | — |
| Max LTV | 60% (residential), 50% (commercial) | — |
| Min income | ₹20,000/month | — |
| Property age | Max 50 years | — |
| Occupancy | Self-occupied preferred | — |
| Min loan amount | ₹3,00,000 | — |
| Max loan amount | ₹3,00,00,000 | — |

### 11.3.3 Business Loan (BL-01)

| Rule | Parameter | Default |
|------|-----------|---------|
| Business vintage | Min 3 years | — |
| Min annual turnover | ₹10,00,000 | — |
| Min loan amount | ₹1,00,000 | — |
| Max loan amount | ₹1,00,00,000 | — |
| Business type | Proprietorship, partnership, Pvt Ltd | — |
| GST required | If turnover > ₹20L | — |
| Profitability | Positive net profit (last 2 years) | — |
| CIBIL minimum | 700 (Phase 2) | — |

### 11.3.4 Auto Loan (AL-01)

| Rule | Parameter | Default |
|------|-----------|---------|
| Min age | 21 years | — |
| Max age at maturity | 65 years | — |
| Min income | ₹15,000/month | — |
| Max LTV | 90% (new), 80% (used) | — |
| Vehicle age (used) | Max 5 years | — |
| Min loan amount | ₹1,00,000 | — |
| Max loan amount | ₹50,00,000 | — |
| Employment | Salaried or self-employed | — |

## 11.4 Rules Engine Architecture

| Component | Responsibility |
|-----------|----------------|
| **Rule Loader** | Load rules from `eligibility_rules` table (cached) |
| **Rule Evaluator** | Evaluate single rule against input parameters |
| **Score Calculator** | Weighted score from individual rule results |
| **Lender Matcher** | Match eligible lenders based on policies |
| **Result Persister** | Store result for audit and application linking |
| **AI Enhancer** (Phase 2) | AI suggests alternative products if ineligible |

**Rule structure (database):**

| Field | Type | Description |
|-------|------|-------------|
| `productCode` | string | HL-01, LAP-01, etc. |
| `ruleCode` | string | MIN_AGE, MAX_LTV, etc. |
| `ruleType` | enum | THRESHOLD, RANGE, ENUM, BOOLEAN, FORMULA |
| `parameter` | string | Field name to evaluate |
| `operator` | enum | GTE, LTE, EQ, IN, NOT_IN, BETWEEN |
| `value` | JSON | Threshold value(s) |
| `weight` | decimal | Score weight |
| `errorMessage` | string | Customer-facing message on fail |
| `isActive` | boolean | Enable/disable rule |

## 11.5 Lender Matching

| Factor | Weight | Source |
|--------|--------|--------|
| Product support | Required | `lender_policies.productCode` |
| Interest rate competitiveness | 25% | `lender_policies.rateRange` |
| LTV alignment | 20% | `lender_policies.maxLtv` |
| Turnaround time | 20% | `lender_policies.avgTat` |
| Approval rate | 15% | Historical data (Phase 2) |
| Geographic coverage | 10% | `lender_policies.serviceablePincodes` |
| Special programs | 10% | `lender_policies.programs` |

**Lender match output:**

| Field | Description |
|-------|-------------|
| `lenderId` | Matched lender |
| `lenderName` | Display name |
| `matchScore` | 0–100 match score |
| `estimatedRate` | Estimated interest rate |
| `estimatedEmi` | Calculated EMI |
| `estimatedTat` | Estimated turnaround (days) |
| `highlights` | Key advantages array |

## 11.6 Eligibility Engine Components

| Layer | Components |
|-------|------------|
| **Controllers** | `eligibility-check`, `eligibility-preview`, `eligibility-history` |
| **Services** | `eligibility-engine.service`, `rule-loader.service`, `rule-evaluator.service`, `lender-matcher.service` |
| **Repositories** | `eligibility-rule`, `eligibility-result`, `lender-policy` |
| **Cache** | Rules cached in memory (5-min TTL); invalidated on admin update |

---

# 12. EMI ENGINE

## 12.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/emi` |
| **API Prefix** | `/emi` |
| **Type** | Pure computation engine (stateless) |
| **Auth** | Public (calculator) + authenticated (save comparison) |

## 12.2 EMI Calculation

**Formula (reducing balance):**

```
EMI = P × r × (1+r)^n / ((1+r)^n - 1)

Where:
  P = Principal (loan amount)
  r = Monthly interest rate (annual rate / 12 / 100)
  n = Tenure in months
```

| Input | Type | Validation |
|-------|------|------------|
| `principal` | decimal | > 0, max per product |
| `annualRate` | decimal | > 0, ≤ 30% |
| `tenureMonths` | integer | ≥ 12, ≤ 360 |
| `productCode` | string? | Optional — applies product defaults |

| Output | Type | Description |
|--------|------|-------------|
| `emi` | decimal | Monthly EMI amount |
| `totalPayment` | decimal | Total amount paid |
| `totalInterest` | decimal | Total interest component |
| `principal` | decimal | Principal amount |
| `schedule` | array? | Amortization schedule (optional) |

## 12.3 Interest Calculation

| Method | Use Case |
|--------|----------|
| **Reducing balance** | Default for all term loans |
| **Flat rate** | Display comparison only (labeled) |
| **Floating rate** | Phase 2 — with rate reset periods |

**Amortization schedule entry:**

| Field | Description |
|-------|-------------|
| `month` | Month number |
| `emi` | EMI amount |
| `principal` | Principal component |
| `interest` | Interest component |
| `balance` | Outstanding balance |

## 12.4 Savings Calculation

| Scenario | Calculation |
|----------|-------------|
| **Balance transfer savings** | EMI difference × remaining tenure |
| **Prepayment savings** | Recalculate with reduced principal |
| **Tenure reduction** | Same EMI, shorter tenure — interest saved |
| **Rate negotiation** | EMI at current vs negotiated rate |

## 12.5 Loan Comparison

| Input | Description |
|-------|-------------|
| `scenarios[]` | Array of 2–5 loan scenarios |
| Each scenario | principal, rate, tenure, lenderName, processingFee |

| Output | Description |
|--------|-------------|
| `comparisons[]` | Side-by-side EMI, total interest, total cost |
| `recommendation` | Lowest total cost scenario highlighted |
| `savingsChart` | Data for bar chart (total cost comparison) |

## 12.6 EMI Engine Components

| Layer | Components |
|-------|------------|
| **Controllers** | `emi-calculator`, `emi-comparison`, `emi-schedule` |
| **Services** | `emi-calculator.service`, `interest-calculator.service`, `savings-calculator.service`, `comparison.service` |
| **Utilities** | `emi-formula.ts`, `amortization.ts` (pure functions) |
| **No database** | Stateless — no repositories (optional: save comparison history) |

---

# 13. REFERRAL ENGINE

## 13.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/referrals` |
| **API Prefix** | `/referrals`, `/customer/referrals` |
| **Primary Tables** | `referrals`, `referral_codes`, `referral_rewards`, `referral_rules` |

## 13.2 Referral Tracking

| Event | Trigger | Recorded |
|-------|---------|----------|
| Code generated | Customer/partner registration | `referral_codes` |
| Code shared | Customer shares via app | Activity log |
| Code applied | New user registers with code | `referrals` link created |
| Lead created | Referred user creates lead | `referrals.leadId` updated |
| Application created | Referred user applies | `referrals.applicationId` updated |
| Disbursement | Application disbursed | `referrals.status = CONVERTED` |

**Referral statuses:**

| Status | Description |
|--------|-------------|
| `PENDING` | Code applied; awaiting conversion |
| `QUALIFIED` | Referred user qualified but not disbursed |
| `CONVERTED` | Disbursement completed — reward triggered |
| `EXPIRED` | Referral window expired (90 days default) |
| `CANCELLED` | Referred application cancelled |

## 13.3 Reward Logic

| Rule Parameter | Default |
|----------------|---------|
| Referrer reward type | Flat amount or percentage |
| Referrer reward value | ₹500–₹2,000 per conversion (configurable) |
| Referee reward type | Processing fee discount or cashback |
| Referee reward value | 0.25% processing fee discount |
| Max referrals per month | 10 per customer |
| Reward trigger | On disbursement (not sanction) |
| Cooling period | 30 days post-disbursement before payout |
| Minimum loan amount | ₹5,00,000 for reward eligibility |

**Reward calculation flow:**

| Step | Action |
|------|--------|
| 1 | `APPLICATION_DISBURSED` event received |
| 2 | Check if application has referral link |
| 3 | Validate referral rules (amount, product, window) |
| 4 | Calculate reward amounts (referrer + referee) |
| 5 | Create `referral_rewards` records (status PENDING) |
| 6 | After cooling period → status APPROVED → payout queue |
| 7 | Emit `REFERRAL_CONVERTED` |

## 13.4 Referral Analytics

| Metric | Endpoint | Audience |
|--------|----------|----------|
| Total referrals | `/analytics/referrals/summary` | Admin |
| Conversion rate | `/analytics/referrals/conversion` | Admin |
| Top referrers | `/analytics/referrals/leaderboard` | Admin |
| Reward payout total | `/analytics/referrals/rewards` | Finance |
| Referral by source | `/analytics/referrals/sources` | Marketing |
| Customer referral stats | `/customer/referrals/stats` | Customer |

## 13.5 Referral Engine Components

| Layer | Components |
|-------|------------|
| **Controllers** | `referral`, `referral-code`, `referral-reward`, `crm-referral` |
| **Services** | `referral.service`, `referral-code.service`, `reward-calculator.service` |
| **Repositories** | `referral`, `referral-code`, `referral-reward`, `referral-rule` |
| **Events** | `REFERRAL_CODE_APPLIED`, `REFERRAL_CONVERTED`, `REFERRAL_REWARD_APPROVED` |

---

# 14. COMMISSION ENGINE

## 14.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/commissions` |
| **API Prefix** | `/crm/commissions`, `/dsa/commissions`, `/finance/commissions` |
| **Primary Tables** | `commission_rules`, `commission_ledger`, `commission_payouts`, `commission_clawbacks` |

## 14.2 Commission Rules

| Parameter | Description | Example |
|-----------|-------------|---------|
| `productCode` | Product-specific rate | HL-01: 0.5% of disbursement |
| `partnerTier` | Bronze/Silver/Gold/Platinum | Gold: +0.1% bonus |
| `loanAmountSlab` | Slab-based rates | ₹0–50L: 0.5%, ₹50L+: 0.4% |
| `lenderCode` | Lender-specific override | HDFC HL: 0.6% |
| `effectiveFrom` | Rule validity start | 2026-01-01 |
| `effectiveTo` | Rule validity end | 2026-12-31 |
| `payoutTrigger` | On disbursement (default) | DISBURSEMENT |
| `tdsRate` | Tax deducted at source | 5% (as per IT rules) |

## 14.3 Commission Ledger

| Field | Description |
|-------|-------------|
| `partnerId` | DSA partner |
| `applicationId` | Linked application |
| `disbursementId` | Linked disbursement |
| `productCode` | Product |
| `disbursedAmount` | Disbursement amount |
| `commissionRate` | Applied rate (%) |
| `grossCommission` | Calculated gross |
| `tdsAmount` | TDS deducted |
| `netCommission` | Net payable |
| `status` | PROVISIONAL, APPROVED, PAID, CLAWED_BACK |
| `ruleSnapshot` | JSON — rule at time of calculation |

**Ledger entry lifecycle:**

| Status | Trigger |
|--------|---------|
| `PROVISIONAL` | Created on disbursement event |
| `APPROVED` | Finance approves (batch or individual) |
| `PAID` | Payout processed |
| `CLAWED_BACK` | Disbursement reversed or fraud detected |

## 14.4 Commission Approval

| Step | Actor | Action |
|------|-------|--------|
| 1 | System | Creates PROVISIONAL entries on disbursement |
| 2 | Finance | Reviews commission batch (weekly/monthly) |
| 3 | Finance | Approves batch → status APPROVED |
| 4 | SoD | Approver ≠ commission rule configurator |
| 5 | System | Generates payout file |
| 6 | Audit | Full approval trail logged |

**Approval endpoints:**

| Endpoint | Method | Role |
|----------|--------|------|
| `/finance/commissions/pending` | GET | Finance |
| `/finance/commissions/approve` | POST | Finance Manager |
| `/finance/commissions/reject` | POST | Finance Manager |
| `/finance/commissions/batch` | POST | Create approval batch |

## 14.5 Commission Settlement

| Step | Action |
|------|--------|
| 1 | Approved commissions grouped by partner |
| 2 | Net amount calculated (gross - TDS - clawbacks) |
| 3 | Payout file generated (NEFT format) |
| 4 | Finance uploads to bank portal |
| 5 | On bank confirmation → status PAID |
| 6 | Partner notified via push + statement generated |
| 7 | Monthly statement PDF stored in S3 |

## 14.6 Commission Engine Components

| Layer | Components |
|-------|------------|
| **Controllers** | `commission-ledger`, `commission-approval`, `commission-payout`, `dsa-commission`, `commission-rules` |
| **Services** | `commission-calculator.service`, `commission-approval.service`, `payout.service`, `clawback.service` |
| **Repositories** | `commission-ledger`, `commission-rule`, `commission-payout` |
| **Workers** | `commission.worker` (batch processing) |
| **Events** | `COMMISSION_CALCULATED`, `COMMISSION_APPROVED`, `COMMISSION_PAID`, `COMMISSION_CLAWED_BACK` |

---

# 15. NOTIFICATION ENGINE

## 15.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/notifications` |
| **API Prefix** | `/notifications` |
| **Primary Tables** | `notifications`, `notification_templates`, `notification_preferences`, `notification_logs` |
| **Channels** | Push (FCM), SMS, Email, WhatsApp, In-App |

## 15.2 Channel Architecture

| Channel | Provider | Integration Path | Use Cases |
|---------|----------|------------------|-----------|
| **Push** | Firebase FCM | `integrations/fcm` | Real-time app notifications |
| **SMS** | MSG91 / Twilio | `integrations/sms` | OTP, transactional alerts |
| **Email** | AWS SES / SendGrid | `integrations/email` | Statements, reports, formal comms |
| **WhatsApp** | WhatsApp Business API | `integrations/whatsapp` | Rich messages, document sharing |
| **In-App** | Internal | `notifications` table | Notification center in apps |

## 15.3 Notification Dispatch Flow

| Step | Action |
|------|--------|
| 1 | Domain event triggers notification (e.g., `LEAD_ASSIGNED`) |
| 2 | `NotificationService` looks up template for event + channel |
| 3 | Resolve recipient(s) from event context |
| 4 | Check user notification preferences (opt-in/out per channel) |
| 5 | Render template with variables |
| 6 | Queue notification job per channel |
| 7 | Worker dispatches to channel integration |
| 8 | Log delivery status in `notification_logs` |
| 9 | In-app notification created regardless of push preference |

## 15.4 Notification Templates

| Field | Description |
|-------|-------------|
| `eventCode` | LEAD_ASSIGNED, APPLICATION_SANCTIONED, etc. |
| `channel` | PUSH, SMS, EMAIL, WHATSAPP, IN_APP |
| `language` | en, hi (Phase 2) |
| `title` | Template title with `{{variables}}` |
| `body` | Template body |
| `deepLink` | App deep link pattern |
| `isActive` | Enable/disable |

## 15.5 Key Notification Events

| Event | Channels | Recipients |
|-------|----------|------------|
| OTP | SMS, WhatsApp | User |
| Lead assigned | Push, In-App | Sales Executive |
| Application submitted | Push, In-App, Email | Customer, Sales |
| Document deficiency | Push, SMS, In-App | Customer |
| Sanction | Push, In-App, Email, WhatsApp | Customer, DSA, Sales |
| Disbursement | Push, In-App, Email, WhatsApp | Customer, DSA |
| Commission credited | Push, In-App | DSA |
| SLA warning | Push, In-App | Sales Executive, Manager |
| Ticket update | Push, In-App | Customer, Agent |
| Campaign | Push, SMS, WhatsApp | Campaign audience |

## 15.6 User Preferences

| Preference | Default | Configurable |
|------------|---------|--------------|
| Push enabled | Yes | Per category |
| SMS enabled | Yes | Per category |
| Email enabled | Yes | Per category |
| WhatsApp enabled | Yes | Per category |
| Marketing | Opt-in required | DPDP compliance |
| Quiet hours | 10 PM – 8 AM | User configurable |

## 15.7 Notification Engine Components

| Layer | Components |
|-------|------------|
| **Controllers** | `notification`, `notification-preference`, `device`, `notification-template` (admin) |
| **Services** | `notification.service`, `push.service`, `sms.service`, `email.service`, `whatsapp.service`, `template-renderer.service` |
| **Repositories** | `notification`, `notification-preference`, `notification-log`, `device` |
| **Workers** | `notification.worker` |
| **Integrations** | FCM, SMS, SES, WhatsApp Business API |

---

# 16. AI ADVISOR MODULE

## 16.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/ai` |
| **API Prefix** | `/ai/advisor` |
| **Primary Tables** | `chat_sessions`, `chat_messages`, `ai_recommendations`, `ai_feedback` |
| **Provider** | OpenAI GPT-4o (configurable) |

## 16.2 Chat Engine

| Component | Responsibility |
|-----------|----------------|
| **Session Manager** | Create/resume chat sessions per customer |
| **Message Handler** | Process user messages; maintain conversation history |
| **Context Builder** | Assemble customer profile, applications, products into context |
| **GPT Client** | Call OpenAI Chat Completions API |
| **Response Parser** | Parse GPT response; extract recommendations, actions |
| **Guard Rails** | Filter prohibited content; financial advice disclaimers |
| **Rate Limiter** | 20 messages/hour/customer; 100/day |

**Chat flow:**

| Step | Action |
|------|--------|
| 1 | Customer opens AI Advisor → create/resume session |
| 2 | Customer sends message |
| 3 | Context builder loads: profile, active applications, product catalog |
| 4 | RAG retrieval: relevant KB articles for query |
| 5 | Construct prompt: system + context + RAG + conversation history |
| 6 | Call OpenAI API (streaming response) |
| 7 | Parse response; extract structured recommendations |
| 8 | Store message pair in `chat_messages` |
| 9 | Stream response to client via SSE |
| 10 | Log AI interaction in audit (no PII in prompt logs) |

## 16.3 Context Management

| Context Source | Data | Refresh |
|----------------|------|---------|
| Customer profile | Name, income, employment, age | Per message |
| Active applications | Status, product, amount | Per message |
| Product catalog | Active products, rates, features | Cached 1 hour |
| Eligibility history | Recent checks | Per session |
| Conversation history | Last 20 messages | Per message |
| KB retrieval | Top 5 relevant articles | Per message |

**Context window budget:** Max 8K tokens for context; truncate oldest history first.

## 16.4 Knowledge Retrieval (RAG)

| Step | Action |
|------|--------|
| 1 | Embed user query (OpenAI embeddings) |
| 2 | Search `rag_sources` vector index (cosine similarity) |
| 3 | Retrieve top-K relevant chunks (K=5) |
| 4 | Inject chunks into prompt as reference material |
| 5 | Instruct GPT to cite sources |
| 6 | Include source attribution in response |

*Full RAG pipeline detailed in Section 18 (Knowledge Base).*

## 16.5 Recommendation Engine

| Recommendation Type | Trigger | Output |
|--------------------|---------|--------|
| Product suggestion | "What loan is best for me?" | Ranked product list with reasons |
| Eligibility guidance | "Am I eligible for home loan?" | Run eligibility engine; explain result |
| Document guidance | "What documents do I need?" | Checklist for product/stage |
| EMI suggestion | "What EMI can I afford?" | EMI at various amounts/tenures |
| Next step | Based on application stage | "Your next step is to upload..." |
| Lender comparison | "Which bank is best?" | Lender match results |

## 16.6 Eligibility Assistance

| Capability | Implementation |
|------------|----------------|
| Natural language input | GPT extracts structured params from conversation |
| Missing data prompt | AI asks for income, age, etc. if not in profile |
| Eligibility execution | Calls eligibility engine with extracted params |
| Result explanation | AI explains pass/fail in simple language |
| Alternative suggestions | If ineligible, suggest other products |

## 16.7 AI Advisor Components

| Layer | Components |
|-------|------------|
| **Controllers** | `advisor-chat`, `advisor-session`, `advisor-feedback` |
| **Services** | `chat-engine.service`, `context-builder.service`, `recommendation.service`, `rag-retrieval.service`, `guard-rails.service` |
| **Repositories** | `chat-session`, `chat-message`, `ai-recommendation`, `ai-feedback` |
| **Integrations** | OpenAI Chat Completions, OpenAI Embeddings |
| **Config** | Model selection, temperature, max tokens per environment |

## 16.8 AI Safety Controls

| Control | Implementation |
|---------|----------------|
| No PII in logs | Mask phone, PAN, Aadhaar in AI audit logs |
| Financial disclaimer | Every session starts with disclaimer |
| No auto-actions | AI cannot submit applications or make financial decisions |
| Prompt injection defense | System prompt hardened; user input sanitized |
| Content filter | OpenAI moderation API on input and output |
| Rate limiting | Per-user and global limits |
| Cost tracking | Token usage logged per session; budget alerts |
| Human escalation | "Talk to advisor" button → creates support ticket |

---

# 17. AI SALES COPILOT

## 17.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/ai` (sub-module) |
| **API Prefix** | `/ai/copilot` |
| **Consumers** | CRM Admin, DSA App (limited) |
| **Primary Tables** | `ai_copilot_insights`, `ai_predictions`, `ai_actions` |
| **Provider** | OpenAI GPT-4o + structured output |

## 17.2 Lead Scoring (AI-Enhanced)

| Input | Source |
|-------|--------|
| Lead data | `leads` record |
| Customer profile | Profile completeness, income |
| Historical patterns | Conversion rates by source/product |
| Engagement signals | App opens, document uploads, response time |
| Market context | Seasonal trends, campaign performance |

| Output | Description |
|--------|-------------|
| `aiScore` | 0–100 AI-enhanced score |
| `scoreFactors` | Array of {factor, impact, explanation} |
| `conversionProbability` | 0.0–1.0 probability |
| `recommendedAction` | Next best action |
| `urgency` | HIGH, MEDIUM, LOW |

**Integration:** AI score supplements rule-based score (Section 8.5); combined score = 70% rules + 30% AI (configurable).

## 17.3 Approval Prediction

| Input | Data |
|-------|------|
| Application data | Product, amount, tenure |
| Customer profile | Income, employment, age |
| Documents status | Uploaded, verified, deficient |
| Credit history | CIBIL score (Phase 2) |
| Lender policies | Matched lender requirements |

| Output | Description |
|--------|-------------|
| `approvalProbability` | 0.0–1.0 |
| `riskFactors` | Array of risk flags |
| `confidenceLevel` | HIGH, MEDIUM, LOW |
| `suggestedLender` | Best-match lender recommendation |
| `estimatedTat` | Predicted turnaround days |

**Usage:** Credit analyst sees prediction as advisory (not decision); SoD prevents AI auto-approval.

## 17.4 Risk Analysis

| Risk Category | Signals |
|---------------|---------|
| **Income risk** | Income vs EMI ratio > 60% |
| **Document risk** | Forged document flags from OCR |
| **Behavioral risk** | Multiple applications, rapid status changes |
| **Geographic risk** | Non-serviceable area |
| **Duplicate risk** | Similar applications across partners |
| **Compliance risk** | Missing consent, expired KYC |

| Output | Format |
|--------|--------|
| `riskScore` | 0–100 (higher = riskier) |
| `riskFlags` | Array of {category, severity, description} |
| `mitigation` | Suggested actions to reduce risk |

## 17.5 Next Best Action

| Context | Suggested Actions |
|---------|-------------------|
| New lead, not contacted | "Call customer within 1 hour" |
| Lead contacted, no docs | "Request income proof via WhatsApp" |
| Application S03, deficient | "Follow up on missing bank statement" |
| Application S05, credit queue | "Expedite — high approval probability" |
| Sanctioned, no bank login | "Initiate bank login with HDFC" |
| Dormant lead | "Send re-engagement campaign" |

**Delivery:** Copilot panel in CRM sidebar; push notification for urgent actions.

## 17.6 Missing Documents Detection

| Step | Action |
|------|--------|
| 1 | Load application checklist for current stage |
| 2 | Compare required vs uploaded vs verified |
| 3 | Identify gaps with priority (blocking vs optional) |
| 4 | Generate customer-friendly message listing missing docs |
| 5 | Suggest delivery channel (WhatsApp template, SMS, email) |
| 6 | One-click send via notification engine |

## 17.7 AI Sales Copilot Components

| Layer | Components |
|-------|------------|
| **Controllers** | `copilot-insights`, `copilot-predictions`, `copilot-actions` |
| **Services** | `copilot.service`, `lead-scoring-ai.service`, `approval-predictor.service`, `risk-analyzer.service`, `nba-engine.service` |
| **Repositories** | `ai-copilot-insight`, `ai-prediction`, `ai-action` |
| **Integrations** | OpenAI GPT (structured output / function calling) |

---

# 18. KNOWLEDGE BASE MODULE

## 18.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/knowledge` |
| **API Prefix** | `/knowledge`, `/admin/knowledge` |
| **Primary Tables** | `kb_articles`, `kb_faqs`, `kb_training_materials`, `kb_sales_scripts`, `rag_sources`, `rag_embeddings` |
| **Consumers** | AI Advisor (RAG), AI Copilot, CRM (training), Customer App (FAQs) |

## 18.2 Content Categories

| Category | Purpose | Audience |
|----------|---------|----------|
| **Policies** | Lender policies, product rules, compliance | AI RAG, Copilot, Compliance |
| **FAQs** | Customer-facing Q&A | Customer App, AI Advisor |
| **Training Materials** | DSA onboarding, product training | DSA App, CRM |
| **Sales Scripts** | Call scripts, objection handling | CRM, Copilot |
| **Product Guides** | Product features, eligibility, documents | All |
| **Process Guides** | LOS stages, LMS workflow, ops procedures | CRM, Ops |

## 18.3 RAG Sources

| Field | Description |
|-------|-------------|
| `sourceType` | ARTICLE, FAQ, POLICY, SCRIPT, EXTERNAL |
| `title` | Source title |
| `content` | Full text content |
| `productCode` | Product scope (nullable for general) |
| `category` | Content category |
| `tags` | Searchable tags array |
| `version` | Content version |
| `isActive` | Published/unpublished |
| `embedding` | Vector embedding (1536-dim for OpenAI) |
| `chunkIndex` | Chunk number (for long documents) |
| `metadata` | JSON — source URL, author, last reviewed |

## 18.4 RAG Ingestion Pipeline

| Step | Worker | Action |
|------|--------|--------|
| 1 | Admin | Creates/updates KB article |
| 2 | `rag-index.worker` | Picks up content change event |
| 3 | Chunker | Split content into 500-token chunks with overlap |
| 4 | Embedder | Generate embeddings via OpenAI Embeddings API |
| 5 | Indexer | Store chunks + embeddings in `rag_sources` |
| 6 | Validator | Test retrieval quality with sample queries |
| 7 | Event | Emit `RAG_SOURCE_INDEXED` |

## 18.5 Knowledge Base Admin (CMS)

| Endpoint | Method | Role |
|----------|--------|------|
| `/admin/knowledge/articles` | CRUD | Admin, Content Manager |
| `/admin/knowledge/faqs` | CRUD | Admin, Content Manager |
| `/admin/knowledge/training` | CRUD | Admin, Training Manager |
| `/admin/knowledge/scripts` | CRUD | Admin, Sales Manager |
| `/admin/knowledge/rag/reindex` | POST | Admin — trigger full reindex |
| `/admin/knowledge/rag/test` | POST | Admin — test retrieval query |

## 18.6 Knowledge Base Components

| Layer | Components |
|-------|------------|
| **Controllers** | `article`, `faq`, `training`, `script`, `admin-kb`, `rag-admin` |
| **Services** | `kb.service`, `rag-ingest.service`, `rag-search.service`, `content-chunker.service` |
| **Repositories** | `article`, `faq`, `training`, `script`, `rag-source` |
| **Workers** | `rag-index.worker` |

---

# 19. SUPPORT MODULE

## 19.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/support` |
| **API Prefix** | `/support`, `/crm/support` |
| **Primary Tables** | `tickets`, `ticket_messages`, `ticket_assignments`, `ticket_escalations`, `ticket_feedback` |

## 19.2 Ticket Lifecycle

| Status | Description | Next States |
|--------|-------------|-------------|
| `OPEN` | Created; awaiting assignment | ASSIGNED, CLOSED |
| `ASSIGNED` | Assigned to agent | IN_PROGRESS |
| `IN_PROGRESS` | Agent working | PENDING_CUSTOMER, RESOLVED |
| `PENDING_CUSTOMER` | Awaiting customer response | IN_PROGRESS |
| `RESOLVED` | Solution provided | CLOSED, REOPENED |
| `CLOSED` | Ticket closed | REOPENED |
| `REOPENED` | Customer reopened | IN_PROGRESS |
| `ESCALATED` | Escalated to higher tier | IN_PROGRESS |

## 19.3 Ticket Categories

| Category | Sub-categories |
|----------|----------------|
| **Application** | Status inquiry, document issue, withdrawal |
| **Technical** | App bug, login issue, upload failure |
| **Account** | Profile update, KYC issue |
| **Commission** | DSA commission query, payout issue |
| **General** | Product inquiry, feedback |
| **Complaint** | Service complaint, escalation |
| **AI Escalation** | Escalated from AI Advisor |

## 19.4 Ticket Creation

| Source | Creator | Auto-fields |
|--------|---------|-------------|
| Customer App | Customer | customerId, category |
| DSA App | DSA | partnerId, category |
| CRM | Agent (on behalf) | customerId, createdBy |
| AI Advisor | System | customerId, chatSessionId, AI context |
| Email (Phase 2) | System | Parsed from email |

## 19.5 Ticket Assignment

| Rule | Priority | Logic |
|------|----------|-------|
| Category-based | 1 | Route to specialized team |
| Load balancing | 2 | Agent with fewest open tickets |
| Customer RM | 3 | Existing RM if available |
| Manual | 4 | Supervisor assignment |
| Escalation | 5 | Senior agent on escalation |

## 19.6 Escalation

| Trigger | Action |
|---------|--------|
| SLA breach (4 hours no response) | Auto-escalate to supervisor |
| Customer request | Manual escalation |
| Agent request | Escalate to senior agent |
| Complaint category | Auto-escalate to compliance |
| 3+ reopenings | Escalate to manager |

**SLA targets:**

| Priority | First Response | Resolution |
|----------|---------------|------------|
| Critical | 1 hour | 4 hours |
| High | 4 hours | 24 hours |
| Medium | 8 hours | 48 hours |
| Low | 24 hours | 72 hours |

## 19.7 Resolution & Feedback

| Step | Action |
|------|--------|
| 1 | Agent marks ticket RESOLVED with resolution notes |
| 2 | Customer notified |
| 3 | Customer can accept or reopen |
| 4 | On accept → CLOSED |
| 5 | Feedback survey sent (1–5 rating + comment) |
| 6 | Feedback stored in `ticket_feedback` |

## 19.8 Support Module Components

| Layer | Components |
|-------|------------|
| **Controllers** | `ticket`, `ticket-message`, `ticket-escalation`, `ticket-feedback`, `crm-ticket` |
| **Services** | `ticket.service`, `ticket-assignment.service`, `ticket-sla.service`, `escalation.service` |
| **Repositories** | `ticket`, `ticket-message`, `ticket-assignment` |
| **Jobs** | `ticket-sla-check.job` |
| **Events** | `TICKET_CREATED`, `TICKET_ASSIGNED`, `TICKET_ESCALATED`, `TICKET_RESOLVED`, `TICKET_CLOSED` |

---

# 20. ANALYTICS MODULE

## 20.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/backend/src/modules/analytics` |
| **API Prefix** | `/analytics` |
| **Primary Tables** | `analytics_snapshots`, `analytics_metrics`, `analytics_reports` |
| **Pattern** | Event-driven snapshot generation + on-demand queries |

## 20.2 Lead Analytics

| Metric | Granularity | Audience |
|--------|-------------|----------|
| Leads created | Daily, weekly, monthly | Sales Mgr, Branch Mgr |
| Conversion rate | By source, product, executive | Sales Mgr |
| Lead aging | Average time in each status | Sales Mgr |
| SLA compliance | % within SLA | Branch Mgr |
| Source effectiveness | Conversion by source | Marketing |
| Pipeline value | Weighted pipeline | Sales Mgr |

## 20.3 Revenue Analytics

| Metric | Granularity | Audience |
|--------|-------------|----------|
| Disbursement volume | Daily, monthly, YTD | Finance, Management |
| Disbursement count | By product, lender, branch | Finance |
| Average ticket size | By product | Management |
| Revenue (commission) | Monthly, quarterly | Finance |
| Processing fee revenue | Monthly | Finance |
| Target vs actual | Monthly targets | Management |

## 20.4 Executive Analytics

| Dashboard | Metrics | Audience |
|-----------|---------|----------|
| **CEO Dashboard** | Disbursement, revenue, growth, partner count | CEO |
| **Growth** | MoM/YoY growth rates | Management |
| **Product mix** | Volume by product | Management |
| **Geographic** | Performance by region/branch | Regional Mgr |
| **Funnel** | Lead → Application → Sanction → Disbursement | Management |
| **NPA watch** | Early warning indicators (Phase 2) | Management |

*Management roles receive **aggregated/masked** data per RBAC — no raw PII.*

## 20.5 Partner Analytics

| Metric | Audience |
|--------|----------|
| Active partners | Admin |
| Partner leaderboard (volume) | Admin, Branch Mgr |
| Partner activation rate | Admin |
| Average partner productivity | Admin |
| Commission payout summary | Finance |
| Partner churn risk | Admin (Phase 2) |

## 20.6 Branch Analytics

| Metric | Audience |
|--------|----------|
| Branch disbursement volume | Branch Mgr, Regional Mgr |
| Branch lead conversion | Branch Mgr |
| Branch team performance | Branch Mgr |
| Branch vs target | Branch Mgr, Regional Mgr |
| Branch operational metrics | Ops Manager |

## 20.7 Analytics Architecture

| Component | Responsibility |
|-----------|----------------|
| **Event Collector** | Subscribe to domain events; update running counters |
| **Snapshot Generator** | Nightly job — compute daily snapshots |
| **Query Engine** | Serve dashboard queries from snapshots + live data |
| **Report Generator** | PDF/Excel report generation → S3 |
| **Cache Layer** | Dashboard data cached (15-min TTL) |

## 20.8 Analytics Components

| Layer | Components |
|-------|------------|
| **Controllers** | `dashboard`, `report`, `kpi`, `lead-analytics`, `revenue-analytics`, `partner-analytics`, `branch-analytics` |
| **Services** | `snapshot.service`, `report-generator.service`, `kpi-calculator.service`, `query-engine.service` |
| **Repositories** | `metric`, `snapshot`, `report` |
| **Jobs** | `snapshot.job`, `report-generation.job` |
| **Workers** | `report.worker` |

---

# 21. FILE STORAGE ARCHITECTURE

## 21.1 AWS S3 Overview

| Attribute | Value |
|-----------|-------|
| **Provider** | AWS S3 |
| **Region** | ap-south-1 (Mumbai) |
| **Encryption** | SSE-S3 (default) |
| **Versioning** | Enabled on all buckets |
| **Access** | Presigned URLs only — no public buckets |

## 21.2 Bucket Structure

| Bucket | Purpose | Access |
|--------|---------|--------|
| `kuberone-documents-prod` | KYC, application documents | Private — presigned only |
| `kuberone-documents-uat` | UAT documents | Private |
| `kuberone-assets-prod` | App assets, product images | CloudFront CDN |
| `kuberone-reports-prod` | Generated reports, statements | Private — presigned |
| `kuberone-backups-prod` | DB backups, exports | Private — admin only |
| `kuberone-ai-prod` | RAG source files, AI artifacts | Private |

## 21.3 Folder (Key) Structure

```
kuberone-documents-prod/
├── customers/
│   └── {customerId}/
│       ├── kyc/
│       │   ├── pan/{documentId}.pdf
│       │   └── aadhaar/{documentId}.pdf
│       ├── applications/
│       │   └── {applicationId}/
│       │       ├── income/{documentId}.pdf
│       │       ├── property/{documentId}.pdf
│       │       └── other/{documentId}.{ext}
│       └── profile/
│           └── photo/{documentId}.jpg
├── partners/
│   └── {partnerId}/
│       ├── kyc/
│       ├── agreements/
│       └── bank/
├── applications/
│   └── {applicationId}/
│       ├── sanction/
│       ├── disbursement/
│       └── correspondence/
├── reports/
│   ├── commission-statements/{year}/{month}/
│   └── analytics/{reportId}.pdf
└── temp/
    └── {uploadId}/          # Temporary staging; lifecycle rule deletes after 24h
```

## 21.4 S3 Key Naming Convention

| Pattern | Example |
|---------|---------|
| `{entity}/{entityId}/{category}/{documentId}.{ext}` | `customers/uuid/kyc/pan/doc-uuid.pdf` |
| Document ID in path | Enables lookup without DB query |
| Lowercase extensions | `.pdf`, `.jpg`, `.png` |
| No spaces or special chars | UUIDs only |

## 21.5 Security Controls

| Control | Implementation |
|---------|----------------|
| **No public access** | Block Public Access enabled on all buckets |
| **Presigned URLs** | PUT: 15-min expiry; GET: 5-min expiry |
| **IAM role** | EC2 instance role — no access keys in code |
| **Bucket policy** | Deny non-HTTPS; deny non-presigned direct access |
| **Encryption** | SSE-S3 mandatory |
| **Versioning** | All object versions retained |
| **Lifecycle** | Temp folder: delete after 24h; archive to Glacier after 2 years |
| **Access logging** | S3 access logs to separate logging bucket |
| **Virus scan** | ClamAV scan on confirm upload (Phase 2) |

## 21.6 Access Policies

| Operation | Who | Method |
|-----------|-----|--------|
| Upload | Customer, DSA, Agent (on behalf) | Presigned PUT |
| Download | Authorized roles per RBAC | Presigned GET + audit log |
| Delete | System only (soft delete in DB) | IAM role — no client delete |
| List | Backend service only | IAM role — never client |
| Admin browse | Super Admin, Compliance | Backend proxy with audit |

---

# 22. ERROR HANDLING FRAMEWORK

## 22.1 Error Hierarchy

| Error Class | HTTP Status | Code Prefix | When |
|-------------|-------------|-------------|------|
| `ValidationError` | 400 | `VALIDATION_` | Zod/schema validation failed |
| `AuthenticationError` | 401 | `AUTH_` | Missing/invalid/expired token |
| `AuthorizationError` | 403 | `RBAC_` | Permission denied, scope violation, SoD |
| `NotFoundError` | 404 | `RESOURCE_` | Entity not found or not visible |
| `ConflictError` | 409 | `RESOURCE_` | Duplicate, invalid state transition |
| `BusinessRuleError` | 422 | `BUSINESS_` | Domain rule violation |
| `RateLimitError` | 429 | `RATE_` | Throttled |
| `ExternalServiceError` | 502 | `EXTERNAL_` | Third-party service failure |
| `InternalError` | 500 | `INTERNAL_` | Unhandled server error |

## 22.2 Global Error Handler

| Responsibility | Detail |
|----------------|--------|
| Catch all errors | Express error middleware (4-arg) |
| Map to HTTP status | Based on error class |
| Standardize response | JSON envelope (see below) |
| Log error | Pino logger with requestId, stack (dev only) |
| Mask internals | Production: generic message for 500 errors |
| Report | Phase 2 — Sentry integration for 500s |

**Error response envelope:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `false` |
| `error.code` | string | Machine-readable code |
| `error.message` | string | Human-readable message |
| `error.details` | array? | Field-level validation errors |
| `error.requestId` | string | Correlation ID |
| `error.timestamp` | string | ISO 8601 |

## 22.3 Validation Errors

| Source | Format |
|--------|--------|
| Zod schema | `{ field, message, code }` per failed field |
| Custom validator | Same format |
| Multiple errors | All returned in `details[]` |

## 22.4 Business Errors

| Example | Code | HTTP |
|---------|------|------|
| Lead already converted | `BUSINESS_LEAD_ALREADY_CONVERTED` | 422 |
| Invalid stage transition | `BUSINESS_INVALID_STAGE_TRANSITION` | 422 |
| Insufficient eligibility | `BUSINESS_INELIGIBLE` | 422 |
| Commission already paid | `BUSINESS_COMMISSION_ALREADY_PAID` | 422 |
| Document type not in checklist | `BUSINESS_DOCUMENT_NOT_REQUIRED` | 422 |
| OTP expired | `BUSINESS_OTP_EXPIRED` | 422 |
| Account locked | `BUSINESS_ACCOUNT_LOCKED` | 422 |

## 22.5 System Errors

| Scenario | Handling |
|----------|----------|
| Unhandled exception | Log full stack; return 500 generic message |
| Prisma connection error | Log; return 500; PM2 auto-restart |
| Out of memory | PM2 memory limit restart |
| Timeout | 30s request timeout; return 504 |

## 22.6 External Service Errors

| Service | Fallback |
|---------|----------|
| OpenAI API down | Return cached response or graceful "AI unavailable" |
| SMS provider down | Queue for retry; try WhatsApp fallback |
| S3 unavailable | Return 502; retry with exponential backoff |
| PAN verification API | Queue for retry; allow manual verification |
| FCM push failure | Log; retry via worker; in-app notification still created |

---

# 23. LOGGING FRAMEWORK

## 23.1 Logger Configuration

| Attribute | Value |
|-----------|-------|
| **Library** | Pino |
| **Format** | JSON (production); pretty-print (development) |
| **Level** | `info` (production); `debug` (development) |
| **Correlation** | `requestId` on every log entry |
| **Output** | stdout (PM2 captures); file rotation (optional) |

## 23.2 Application Logs

| Level | Usage |
|-------|-------|
| `fatal` | Process crash; immediate alert |
| `error` | Handled errors; failed operations |
| `warn` | Degraded service; retry attempts |
| `info` | Request completed; business events |
| `debug` | Query details; integration responses (dev only) |
| `trace` | Full request/response (dev only) |

**Standard log fields:**

| Field | Description |
|-------|-------------|
| `timestamp` | ISO 8601 |
| `level` | Log level |
| `requestId` | Correlation ID |
| `userId` | Actor (if authenticated) |
| `module` | Backend module name |
| `action` | Operation performed |
| `duration` | Request duration (ms) |
| `statusCode` | HTTP status |
| `message` | Human-readable message |

## 23.3 Audit Logs

*Separate from application logs — stored in `audit_logs` table (Section 2.10).*

| Event Category | Examples |
|----------------|----------|
| Auth | Login, logout, failed auth, token refresh |
| Data mutation | Create, update, delete on any entity |
| PII access | Customer profile view, document download |
| Permission | Role assignment, permission change |
| Financial | Commission approval, disbursement, payout |
| Admin | Settings change, user suspension |
| AI | AI advisor session, copilot insight generated |

## 23.4 Security Logs

| Event | Log Level | Alert |
|-------|-----------|-------|
| Failed login (5+ in 10 min) | `warn` | Yes |
| Token reuse detected | `error` | Yes — revoke family |
| RBAC violation attempt | `warn` | Yes |
| Rate limit exceeded | `warn` | Threshold alert |
| Suspicious IP pattern | `error` | Yes |
| Admin destructive action | `info` | Enhanced audit |
| SoD violation attempt | `warn` | Yes |

## 23.5 API Logs

| Field | Captured |
|-------|----------|
| Request | Method, path, query params (no body PII) |
| Response | Status code, duration |
| Actor | userId, role, IP |
| Excluded | Request/response body (PII); only metadata logged |

**Log retention:**

| Log Type | Retention | Storage |
|----------|-----------|---------|
| Application logs | 30 days | PM2 logs / CloudWatch (Phase 2) |
| Audit logs | 10 years | MySQL `audit_logs` |
| Security logs | 2 years | MySQL `security_logs` |
| API access logs | 90 days | Nginx access logs |
| S3 access logs | 1 year | S3 logging bucket |

---

# 24. VALIDATION FRAMEWORK

## 24.1 Validation Layers

| Layer | When | Tool | Location |
|-------|------|------|----------|
| **Request validation** | Before controller | Zod | `validate.middleware` + `shared-validation` |
| **Business validation** | In service layer | Custom checks | Service methods |
| **Response validation** | After service (dev) | Zod (optional) | Controller (dev only) |
| **Security validation** | Middleware | Custom | `sanitize.middleware` |

## 24.2 Request Validation

| Target | Schema Location | Example |
|--------|-----------------|---------|
| Body | `shared-validation/src/{module}/{action}.schema.ts` | `createLeadSchema` |
| Query | Same pattern | `listLeadsQuerySchema` |
| Params | Same pattern | `uuidParamSchema` |
| Headers | `shared-validation/src/common/headers.schema.ts` | `appVersionHeader` |

**Validation middleware flow:**

| Step | Action |
|------|--------|
| 1 | Route specifies schema(s) for body/query/params |
| 2 | Middleware runs `schema.safeParse()` |
| 3 | On failure → throw `ValidationError` with field details |
| 4 | On success → replace req.body/query/params with parsed (typed) data |
| 5 | Controller receives validated, typed data |

## 24.3 Business Validation

| Rule Type | Example | Where |
|-----------|---------|-------|
| State machine | "Cannot convert unqualified lead" | `LeadService.convert()` |
| Uniqueness | "Phone already registered" | `CustomerService.register()` |
| Cross-entity | "Application product must match lead product" | `ApplicationService.create()` |
| Temporal | "OTP expired" | `OtpService.verify()` |
| Financial | "Commission already paid" | `CommissionService.approve()` |
| Scope | "Record not in user's branch" | Service scope check |

## 24.4 Security Validation

| Check | Implementation |
|-------|----------------|
| SQL injection | Prisma parameterized queries (no raw SQL) |
| XSS | Input sanitization; output encoding |
| Path traversal | S3 key validation; no `../` in paths |
| File upload | MIME type whitelist; max size 10MB |
| Phone format | Indian mobile regex |
| PAN format | `AAAAA9999A` regex |
| Email format | RFC 5322 simplified |
| UUID format | UUID v4 regex on all path params |
| Enum values | Zod enum validation |
| Max array length | Zod `.max()` on arrays |
| String length | Zod `.min()/.max()` on strings |

---

# 25. API SECURITY

## 25.1 Security Middleware Stack

| Control | Library/Method | Configuration |
|---------|----------------|---------------|
| **Helmet** | `helmet` npm | CSP, X-Frame-Options, HSTS, X-Content-Type-Options |
| **CORS** | `cors` npm | Whitelist: app domains + admin domain per env |
| **Rate limiting** | `express-rate-limit` | Global: 1000 req/15min; Auth: 20 req/15min |
| **Body size** | `express.json({ limit: '1mb' })` | 1MB max (presign endpoints excluded) |
| **Input sanitization** | Custom middleware | Strip HTML tags; trim whitespace |
| **JWT validation** | `jsonwebtoken` + RS256 | Public key verification |
| **Request ID** | Custom middleware | UUID per request |

## 25.2 JWT Security

| Control | Implementation |
|---------|----------------|
| Algorithm | RS256 (asymmetric) |
| Key rotation | Annual key rotation; support dual keys during transition |
| Short expiry | Access token: 15 minutes |
| Refresh rotation | Single-use refresh tokens |
| Claims validation | iss, aud, exp, sub verified |
| No sensitive data in JWT | No PII in claims; only IDs and role codes |

## 25.3 Rate Limiting

| Endpoint Class | Limit | Window |
|----------------|-------|--------|
| Global | 1000 requests | 15 minutes per IP |
| Auth (OTP send) | 3 requests | 1 hour per phone |
| Auth (login) | 10 requests | 15 minutes per IP |
| AI Advisor | 20 messages | 1 hour per user |
| AI Copilot | 50 requests | 1 hour per user |
| Document presign | 30 requests | 15 minutes per user |
| Public (EMI calc) | 60 requests | 15 minutes per IP |

## 25.4 Input Sanitization

| Input Type | Sanitization |
|------------|-------------|
| Strings | Trim; strip HTML/script tags |
| Phone | Extract digits only; validate format |
| Email | Lowercase; trim |
| Names | Allow unicode letters, spaces, dots, hyphens |
| JSON body | Max depth 5; max keys 50 |
| File names | Alphanumeric + dash + dot only |
| Query params | Type coercion via Zod; no raw string concatenation |

## 25.5 SQL Injection Protection

| Control | Implementation |
|---------|----------------|
| ORM only | All queries via Prisma — no raw SQL (except migrations) |
| Parameterized | Prisma auto-parameterizes all queries |
| Input validation | Zod types prevent unexpected input shapes |
| No dynamic table names | Repository methods use static model references |

## 25.6 CORS Configuration

| Environment | Allowed Origins |
|-------------|-----------------|
| Development | `localhost:*`, `exp://*` |
| UAT | `uat.kuberone.kuberfinserve.com`, UAT app domains |
| Production | `kuberone.kuberfinserve.com`, `admin.kuberone.kuberfinserve.com`, app deep links |

| Header | Value |
|--------|-------|
| `Access-Control-Allow-Methods` | GET, POST, PUT, PATCH, DELETE |
| `Access-Control-Allow-Headers` | Authorization, Content-Type, X-Request-Id, X-App-Version, Idempotency-Key |
| `Access-Control-Max-Age` | 86400 |

## 25.7 Additional Security Measures

| Measure | Phase | Description |
|---------|-------|-------------|
| WAF | Phase 2 | AWS WAF on ALB |
| IP allowlist | Phase 1 | Super Admin endpoints IP-restricted |
| API key | Phase 2 | Webhook endpoints use HMAC signature |
| Idempotency | Phase 1 | Financial mutations require `Idempotency-Key` header |
| mTLS | Phase 3 | Lender API integrations |
| Penetration test | Pre-production | Third-party pen test before go-live |

---

# 26. BACKGROUND JOBS

## 26.1 Job Architecture

| Component | Technology | Deployment |
|-----------|------------|------------|
| **Job queue** | In-process event bus (Phase 1) | Same EC2 |
| **Job queue (Phase 2)** | BullMQ + Redis | Worker EC2 |
| **Scheduler** | `node-cron` | PM2 process |
| **Workers** | Separate PM2 process | `workers/index.ts` |

## 26.2 Worker Processes

| Worker | File | Responsibility |
|--------|------|----------------|
| **Notification** | `notification.worker.ts` | Dispatch push, SMS, email, WhatsApp |
| **OCR** | `ocr.worker.ts` | Document OCR processing |
| **RAG Index** | `rag-index.worker.ts` | KB content embedding and indexing |
| **Commission** | `commission.worker.ts` | Batch commission calculation and payout |
| **Campaign** | `campaign.worker.ts` | Campaign audience processing and dispatch |
| **Report** | `report.worker.ts` | Analytics report generation |
| **WhatsApp** | `whatsapp.worker.ts` | WhatsApp message dispatch (rate-limited) |

## 26.3 Scheduled Jobs

| Job | Schedule | File | Action |
|-----|----------|------|--------|
| **SLA check** | Every 15 min | `sla-check.job.ts` | Check lead/ticket SLA breaches |
| **Lead expiry** | Daily 00:00 IST | `lead-expiry.job.ts` | Expire stale leads |
| **Analytics snapshot** | Daily 01:00 IST | `snapshot.job.ts` | Generate daily analytics snapshots |
| **Session cleanup** | Daily 02:00 IST | `session-cleanup.job.ts` | Purge expired sessions/tokens |
| **Device cleanup** | Weekly Sunday | `device-cleanup.job.ts` | Remove inactive devices (90 days) |
| **Commission batch** | Weekly Monday | `commission-batch.job.ts` | Generate weekly commission batch |
| **Report generation** | Monthly 1st | `report-generation.job.ts` | Monthly partner statements |
| **Archive** | Monthly 15th | `archive.job.ts` | Archive closed applications > 1 year |

## 26.4 Job Reliability

| Pattern | Implementation |
|---------|----------------|
| Retry | 3 retries with exponential backoff (1s, 5s, 30s) |
| Dead letter | Failed jobs after 3 retries logged as `FAILED` with error |
| Idempotency | Jobs check processing status before re-execution |
| Monitoring | Job completion/failure logged; alert on failure rate > 5% |
| Graceful shutdown | PM2 SIGINT handler completes in-progress jobs |

---

# 27. EVENT DRIVEN ARCHITECTURE

## 27.1 Event Bus

| Attribute | Value |
|-----------|-------|
| **Phase 1** | In-process EventEmitter (Node.js `EventEmitter`) |
| **Phase 2** | BullMQ + Redis pub/sub |
| **Phase 3** | AWS SNS/SQS for cross-service events |
| **Pattern** | Domain events — past tense naming |

## 27.2 Domain Events Registry

| Event | Publisher | Subscribers |
|-------|-----------|-------------|
| `CUSTOMER_REGISTERED` | CustomerService | Notification, Analytics |
| `PARTNER_ACTIVATED` | PartnerService | Notification, Analytics |
| `LEAD_CREATED` | LeadService | Notification, Analytics, AI Copilot |
| `LEAD_ASSIGNED` | LeadAssignmentService | Notification |
| `LEAD_QUALIFIED` | LeadQualificationService | Analytics |
| `LEAD_CONVERTED` | LeadService | Notification, Analytics |
| `LEAD_EXPIRED` | LeadSlaJob | Notification |
| `APPLICATION_CREATED` | ApplicationService | Notification, Analytics |
| `APPLICATION_SUBMITTED` | ApplicationService | Notification, Document (checklist) |
| `STAGE_CHANGED` | StageManagerService | Notification, Analytics, Timeline |
| `DOCUMENT_UPLOADED` | DocumentService | OCR Worker, Application (checklist) |
| `DOCUMENT_VERIFIED` | DocumentVerificationService | Application (checklist), Notification |
| `DOCUMENT_REJECTED` | DocumentVerificationService | Notification |
| `APPLICATION_SANCTIONED` | SanctionService | Notification, Commission (provisional) |
| `APPLICATION_DISBURSED` | DisbursementService | Notification, Commission, Referral |
| `APPLICATION_REJECTED` | CreditService | Notification |
| `COMMISSION_CALCULATED` | CommissionCalculatorService | Notification |
| `COMMISSION_APPROVED` | CommissionApprovalService | Notification |
| `COMMISSION_PAID` | PayoutService | Notification |
| `REFERRAL_CONVERTED` | ReferralService | Notification, Reward |
| `TICKET_CREATED` | TicketService | Notification |
| `TICKET_ESCALATED` | EscalationService | Notification |
| `AI_ADVISOR_SESSION_STARTED` | ChatEngineService | Analytics |
| `RAG_SOURCE_INDEXED` | RagIngestService | — (informational) |

## 27.3 Event Handler Pattern

| Component | Responsibility |
|-----------|----------------|
| **Event definition** | Typed event class in `modules/{module}/events/` |
| **Publisher** | Service emits event after successful DB commit |
| **Handler registration** | Module `.module.ts` registers handlers on startup |
| **Handler** | Async function; must not block publisher |
| **Error handling** | Handler failures logged; do not rollback publisher transaction |

## 27.4 Event Payload Structure

| Field | Type | Description |
|-------|------|-------------|
| `eventType` | string | Event name (e.g., `LEAD_CREATED`) |
| `eventId` | UUID | Unique event ID |
| `timestamp` | ISO 8601 | Event time |
| `actorId` | UUID? | Who triggered the event |
| `entityType` | string | Entity type (LEAD, APPLICATION, etc.) |
| `entityId` | UUID | Entity ID |
| `payload` | JSON | Event-specific data |
| `metadata` | JSON | Correlation ID, source module |

---

# 28. PERFORMANCE STRATEGY

## 28.1 Database Optimization

| Technique | Application |
|-----------|-------------|
| **Indexes** | Per Database Schema Specification — all FK, filter, sort columns |
| **Selective queries** | Prisma `select` — fetch only needed fields |
| **Pagination** | `skip`/`take` on all list endpoints; max 100 per page |
| **Connection pooling** | Prisma pool: min 2, max 20 per instance |
| **Read replica** | Phase 2 — analytics queries to replica |
| **Query timeout** | 10s max query execution |
| **N+1 prevention** | Prisma `include` with discipline; batch loading |
| **Soft delete filter** | `deletedAt IS NULL` on all queries (Prisma middleware) |

## 28.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Product catalog | In-memory | 1 hour | On admin product update |
| Eligibility rules | In-memory | 5 min | On rule update |
| System settings | In-memory | 5 min | On settings update |
| KB articles (list) | In-memory | 15 min | On content update |
| User permissions | JWT (embedded) | Token lifetime | On role change → force re-auth |
| Dashboard analytics | In-memory | 15 min | On snapshot generation |
| Rate limit counters | In-memory (Phase 1) | Window duration | Auto-expire |
| Rate limit counters | Redis (Phase 2) | Window duration | Auto-expire |
| Lender policies | In-memory | 1 hour | On policy update |

## 28.3 Pagination

| Parameter | Default | Max | Notes |
|-----------|---------|-----|-------|
| `page` | 1 | — | 1-indexed |
| `pageSize` | 20 | 100 | Enforced in validator |
| `sortBy` | `createdAt` | — | Whitelist of sortable fields per endpoint |
| `sortOrder` | `desc` | — | `asc` or `desc` |

**Phase 2:** Cursor-based pagination for high-volume endpoints (leads, notifications).

## 28.4 Search Optimization

| Search Type | Implementation |
|-------------|----------------|
| Customer name/phone | MySQL FULLTEXT index on `customers` |
| Lead search | Indexed on phone, name, leadCode |
| Application search | Indexed on applicationCode, customer phone |
| Partner search | Indexed on partnerCode, name, phone |
| Global CRM search (Phase 2) | Unified search endpoint with entity type filter |
| KB search | Vector similarity (RAG) for AI; FULLTEXT for admin |

---

# 29. TESTING STRATEGY

## 29.1 Test Pyramid

| Level | Tool | Coverage Target | Location |
|-------|------|-----------------|----------|
| **Unit** | Jest | 80% services + engines | `tests/unit/` |
| **Integration** | Jest + Supertest | All API endpoints | `tests/integration/` |
| **API contract** | Supertest | Request/response shapes | `tests/integration/api/` |
| **Security** | Custom + OWASP ZAP | Auth, RBAC, injection | `tests/security/` |
| **E2E** (Phase 2) | Playwright (admin) | Critical flows | Separate repo |

## 29.2 Unit Testing

| Target | Focus |
|--------|-------|
| Services | Business logic, state transitions, error cases |
| Engines | EMI calculation, eligibility rules, commission calc |
| Validators | Zod schema edge cases |
| Mappers | Entity ↔ DTO transformation |
| Utilities | PII masking, pagination, crypto |
| Guards | SoD rules, scope evaluation |

**Mocking strategy:**

| Dependency | Mock |
|------------|------|
| Prisma | jest.mock repository layer |
| External APIs | nock / msw |
| S3 | mock presigned URL generation |
| OpenAI | mock response fixtures |
| Event bus | spy on emit |

## 29.3 Integration Testing

| Target | Approach |
|--------|----------|
| API endpoints | Supertest against Express app |
| Database | Test MySQL (Docker or dedicated test DB) |
| Auth flow | Full OTP → token → authenticated request |
| RBAC | Test each role against protected endpoints |
| Stage transitions | Full application lifecycle S01→S08 |
| File upload | Mock S3; test presign → confirm flow |

## 29.4 API Testing

| Test Category | Examples |
|---------------|----------|
| Happy path | CRUD operations for each module |
| Validation | Invalid input → 400 with field errors |
| Auth | Missing token → 401; expired → 401 |
| RBAC | Wrong role → 403; wrong scope → 403 or 404 |
| Business rules | Invalid transition → 422 |
| Pagination | Page boundaries, empty results |
| Idempotency | Duplicate financial mutation → same result |

## 29.5 Security Testing

| Test | Tool | Frequency |
|------|------|-----------|
| SQL injection | Automated (all endpoints) | Every PR |
| XSS | Input fuzzing | Every PR |
| Auth bypass | Token manipulation tests | Every PR |
| RBAC matrix | Role × endpoint matrix | Weekly |
| Rate limiting | Burst request tests | Weekly |
| OWASP ZAP scan | ZAP automated scan | Pre-release |
| Penetration test | Third-party | Pre-production |
| Dependency audit | npm audit | Every PR |

---

# 30. DEPLOYMENT STRATEGY

## 30.1 Environment Pipeline

| Environment | Branch | EC2 | Database | S3 Bucket |
|-------------|--------|-----|----------|-----------|
| **Development** | `develop` | Local / dev EC2 | Local MySQL | Local / dev bucket |
| **Testing** | `test/*` | Test EC2 | Test RDS | Test bucket |
| **UAT** | `release/*` | UAT EC2 | UAT RDS | UAT bucket |
| **Production** | `main` | Prod EC2 (×2 Phase 2) | Prod RDS | Prod bucket |

## 30.2 PM2 Configuration

| Process | Name | Instances | Memory Limit |
|---------|------|-----------|--------------|
| API server | `kuberone-api` | 2 (cluster) | 512MB |
| Workers | `kuberone-workers` | 1 (fork) | 256MB |
| Scheduler | `kuberone-scheduler` | 1 (fork) | 128MB |

**PM2 features used:**

| Feature | Purpose |
|---------|---------|
| Cluster mode | Multi-core API utilization |
| Auto-restart | Crash recovery |
| Memory limit | Restart on leak |
| Log rotation | `pm2-logrotate` |
| Zero-downtime reload | `pm2 reload` on deploy |
| Startup script | `pm2 startup` + `pm2 save` |

## 30.3 Nginx Configuration

| Feature | Configuration |
|---------|---------------|
| Reverse proxy | `proxy_pass http://localhost:4000` |
| SSL termination | Let's Encrypt / ACM certificate |
| Rate limiting | `limit_req_zone` per IP |
| Gzip | Enabled for JSON responses |
| Client body size | 2MB (API); 0 for upload (presigned) |
| Health check | `GET /health` → 200 |
| Admin static | Serve `apps/admin/dist` on admin subdomain |
| Access logs | JSON format with requestId |

## 30.4 Deployment Process

| Step | Action |
|------|--------|
| 1 | CI pipeline passes (lint, test, build) |
| 2 | `prisma migrate deploy` on target database |
| 3 | `pnpm build` in `apps/backend` |
| 4 | Deploy build artifact to EC2 (rsync / GitHub Actions) |
| 5 | `pm2 reload kuberone-api` (zero-downtime) |
| 6 | `pm2 reload kuberone-workers` |
| 7 | Health check verification |
| 8 | Smoke test critical endpoints |
| 9 | Rollback plan: `pm2 resurrect` previous deployment |

## 30.5 Monitoring

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| API uptime | PM2 + health endpoint | < 99.9% |
| Response time (p95) | Application logs | > 500ms |
| Error rate | Application logs | > 1% of requests |
| CPU / Memory | CloudWatch / htop | > 80% sustained |
| DB connections | RDS monitoring | > 80% pool |
| Disk space | CloudWatch | > 85% |
| Queue depth | Worker logs | > 1000 pending jobs |
| SSL expiry | Certbot / ACM | < 14 days |

## 30.6 Backup & Recovery

| Asset | Backup | Frequency | Retention |
|-------|--------|-----------|-----------|
| MySQL (RDS) | Automated snapshots | Daily | 35 days |
| S3 documents | Cross-region replication (Phase 2) | Continuous | Indefinite |
| Application code | Git repository | Every commit | Indefinite |
| PM2 config | `ecosystem.config.js` in repo | Every deploy | Indefinite |
| Environment config | SSM Parameter Store | On change | Versioned |

**Recovery targets:**

| Metric | Target |
|--------|--------|
| RPO (Recovery Point Objective) | 1 hour |
| RTO (Recovery Time Objective) | 4 hours |

---

# 31. FUTURE EXPANSION

## 31.1 Expansion Without Restructuring

All future products integrate via the **module plugin pattern** — new module folder, new product codes, new eligibility rules, new LOS checklist templates. No changes to core architecture, folder structure, or existing modules.

## 31.2 Product Expansion Map

| Product | Module Path | Product Code | New Tables | LOS Impact |
|---------|-------------|--------------|------------|------------|
| **Insurance** | `modules/insurance` | INS-01, INS-02 | `insurance_policies`, `insurance_premiums` | New stages INS-S01–S06 |
| **Credit Cards** | `modules/cards` | CC-01 | `card_applications`, `card_details` | Simplified LOS (3 stages) |
| **Personal Loan** | `modules/products` (extend) | PL-01 | `personal_loan_details` | Standard LOS S01–S09 |
| **Mutual Funds** | `modules/wealth` | MF-01, MF-02 | `mf_orders`, `mf_portfolios` | Order flow (not LOS) |
| **Fixed Deposit** | `modules/wealth` | FD-01 | `fd_deposits` | Booking flow (not LOS) |
| **Gold Loan** | `modules/products` (extend) | GL-01 | `gold_loan_details`, `gold_valuations` | LOS + valuation stage |
| **Wealth Management** | `modules/wealth` | WM-01 | `portfolios`, `holdings` | Advisory flow |

## 31.3 Feature Expansion Map

| Feature | Integration Point | Module Impact |
|---------|-------------------|---------------|
| **Video KYC** | `integrations/video-kyc/` | KYC module — new verification type |
| **eSign** | `integrations/esign/` | Document module — new signing flow |
| **CIBIL integration** | `integrations/cibil/` | Eligibility + Credit modules |
| **Lender API portal** | `integrations/lender/` | LOS module — automated bank login |
| **Payment gateway** | `integrations/payment/` | Commission module — payout automation |
| **CKYC** | `integrations/ckyc/` | KYC module — centralized KYC |
| **Account Aggregator** | `integrations/aa/` | Document module — bank statement fetch |
| **Voice AI outbound** | `modules/ai/voice/` | AI module — campaign calls |

## 31.4 Scaling Path

| Trigger | Action |
|---------|--------|
| 100K+ users | Extract notification service |
| 500K+ leads/year | Extract analytics to warehouse |
| 50+ lender integrations | Extract lender adapter service |
| Multi-region | RDS read replicas per region; S3 cross-region |
| Real-time analytics | Redis Streams or Kafka for event bus |

---

# 32. DEVELOPMENT SEQUENCE

## 32.1 Phase Overview

| Phase | Name | Duration | Modules | Exit Criteria |
|-------|------|----------|---------|---------------|
| **1** | Authentication | Weeks 1–3 | Auth, User, Role, Permission, Audit | OTP login, JWT, RBAC middleware operational |
| **2** | Users & Parties | Weeks 4–6 | Customer, Partner, Employee, Branch, Settings | Registration, profiles, org hierarchy |
| **3** | LMS | Weeks 7–9 | Lead, Product, Campaign | Lead CRUD, assignment, scoring, conversion |
| **4** | LOS | Weeks 10–14 | Application, LOS, Eligibility, EMI | Full S01–S09 lifecycle |
| **5** | Documents & KYC | Weeks 15–17 | Document, KYC, S3 integration | Upload, verify, OCR, deficiency |
| **6** | AI | Weeks 18–20 | AI Advisor, Copilot, Knowledge Base | Chat, RAG, copilot insights |
| **7** | Analytics & Economics | Weeks 21–23 | Analytics, Commission, Referral, Notification, Support | Dashboards, commission, notifications |
| **8** | Production | Weeks 24–26 | Hardening, testing, deployment | Load test, pen test, go-live |

## 32.2 Phase 1: Authentication (Weeks 1–3)

| Week | Deliverables |
|------|-------------|
| **W1** | Project scaffold: Express app, Prisma setup, config, shared middleware (request-id, helmet, cors, error-handler), health endpoint |
| **W1** | Database: auth schema (users, otp_verifications, refresh_tokens, user_sessions, user_devices) |
| **W2** | OTP send/verify flow; SMS integration; rate limiting |
| **W2** | JWT issue/refresh/rotation; token service; session management |
| **W3** | Employee login (email + password); MFA setup (TOTP) |
| **W3** | RBAC middleware; permission registry; role/permission seed data |
| **W3** | Audit log infrastructure; auth event logging |
| **W3** | Integration tests: full auth flow |

**Phase 1 exit criteria:**
- [ ] Customer OTP login works end-to-end
- [ ] Employee login with MFA works
- [ ] JWT refresh rotation verified
- [ ] RBAC middleware blocks unauthorized access
- [ ] All auth events audited
- [ ] Rate limiting operational

## 32.3 Phase 2: Users & Parties (Weeks 4–6)

| Week | Deliverables |
|------|-------------|
| **W4** | User module: CRUD, role assignment, status management |
| **W4** | Customer module: registration (post-OTP), profile, addresses, employment, income |
| **W5** | Customer: consent management, dashboard, preferences |
| **W5** | Partner module: DSA registration, profile, KYC submission |
| **W6** | Partner: bank details, agreement, onboarding lifecycle |
| **W6** | Organization: branches, regions, employees |
| **W6** | Settings: system settings, feature flags |
| **W6** | CRM customer/partner list endpoints with scope filtering |

**Phase 2 exit criteria:**
- [ ] Customer registration and profile management complete
- [ ] DSA onboarding lifecycle (register → KYC → agreement → active)
- [ ] Branch/region/employee hierarchy operational
- [ ] CRM list endpoints with RBAC scope filtering
- [ ] PII masking verified per role

## 32.4 Phase 3: LMS (Weeks 7–9)

| Week | Deliverables |
|------|-------------|
| **W7** | Product module: product catalog, lender policies, public product endpoints |
| **W7** | Lead module: creation (all sources), listing, detail, status management |
| **W8** | Lead assignment: auto-assign rules, manual assign, reassignment |
| **W8** | Lead scoring: rule-based scoring engine |
| **W9** | Lead qualification, conversion, activities, SLA tracking |
| **W9** | DSA lead endpoints (submit, track, convert) |
| **W9** | Campaign module: basic campaign CRUD |
| **W9** | Lead expiry and SLA scheduled jobs |

**Phase 3 exit criteria:**
- [ ] Leads created from all sources (customer, DSA, CRM, campaign)
- [ ] Auto-assignment and manual assignment work
- [ ] Lead scoring and qualification operational
- [ ] Lead → application conversion path ready
- [ ] SLA jobs running

## 32.5 Phase 4: LOS (Weeks 10–14)

| Week | Deliverables |
|------|-------------|
| **W10** | Application module: creation, wizard steps, product-specific details (HL, LAP, BL, AL) |
| **W10** | Eligibility engine: rules engine, product rules, lender matching |
| **W11** | EMI engine: calculator, comparison, amortization schedule |
| **W11** | LOS stage manager: S01–S09 state machine, timeline |
| **W12** | Application submission (S01→S02→S03); customer and CRM endpoints |
| **W13** | Credit review module: queue, review, approve/reject (S05→S06) |
| **W13** | Sanction: sanction letter generation, notification |
| **W14** | Bank login (S07), disbursement (S08), closure (S09) |
| **W14** | Application timeline; customer/DSA/CRM views |

**Phase 4 exit criteria:**
- [ ] Full application lifecycle S01 through S09 tested
- [ ] Eligibility engine returns correct results for all 4 products
- [ ] EMI calculator accurate (verified against manual calculation)
- [ ] Credit review with SoD enforcement
- [ ] Sanction and disbursement recorded with audit trail
- [ ] Timeline visible per client type

## 32.6 Phase 5: Documents & KYC (Weeks 15–17)

| Week | Deliverables |
|------|-------------|
| **W15** | S3 integration: presigned URL generation, key builder, confirm upload |
| **W15** | Document module: upload flow, metadata, checklist |
| **W16** | KYC module: PAN verification, Aadhaar OTP, KYC status |
| **W16** | Document verification: manual review, auto format checks |
| **W17** | OCR worker: document OCR pipeline |
| **W17** | Deficiency management: checklist, deficiency notices |
| **W17** | Document versioning and vault |

**Phase 5 exit criteria:**
- [ ] Presigned S3 upload works end-to-end
- [ ] PAN and Aadhaar verification integrated
- [ ] Document checklist auto-generated per application stage
- [ ] OCR worker processes uploaded documents
- [ ] Deficiency notices sent to customers
- [ ] All document access audited

## 32.7 Phase 6: AI (Weeks 18–20)

| Week | Deliverables |
|------|-------------|
| **W18** | Knowledge base module: articles, FAQs, admin CMS |
| **W18** | RAG ingestion pipeline: chunking, embedding, indexing worker |
| **W19** | AI Advisor: chat engine, context builder, RAG retrieval, streaming |
| **W19** | AI Advisor: recommendation engine, eligibility assistance |
| **W20** | AI Sales Copilot: lead scoring, approval prediction, risk analysis |
| **W20** | AI Sales Copilot: next best action, missing documents |
| **W20** | AI safety controls: guard rails, rate limits, content filter |

**Phase 6 exit criteria:**
- [ ] KB articles indexed and retrievable via RAG
- [ ] AI Advisor answers product/eligibility questions accurately
- [ ] Copilot provides lead scores and next best actions in CRM
- [ ] AI rate limits and safety controls operational
- [ ] Token usage tracked and within budget

## 32.8 Phase 7: Analytics & Economics (Weeks 21–23)

| Week | Deliverables |
|------|-------------|
| **W21** | Notification engine: push (FCM), SMS, email, WhatsApp, in-app |
| **W21** | Notification templates, preferences, device management |
| **W22** | Referral engine: tracking, reward logic, analytics |
| **W22** | Commission engine: rules, ledger, approval, settlement |
| **W23** | Support module: tickets, assignment, escalation, SLA, feedback |
| **W23** | Analytics module: snapshots, dashboards (lead, revenue, partner, branch) |
| **W23** | Report generation worker; scheduled snapshot job |

**Phase 7 exit criteria:**
- [ ] Push notifications delivered to mobile apps
- [ ] WhatsApp and SMS notifications operational
- [ ] Referral tracking and rewards on disbursement
- [ ] Commission calculated, approved, and settled
- [ ] Support tickets with SLA enforcement
- [ ] Analytics dashboards serving aggregated data

## 32.9 Phase 8: Production (Weeks 24–26)

| Week | Deliverables |
|------|-------------|
| **W24** | Integration test suite complete (all modules) |
| **W24** | Security testing: RBAC matrix, OWASP ZAP scan |
| **W25** | Load testing: 500 concurrent users, 1000 req/min |
| **W25** | Production EC2 setup: Nginx, PM2, SSL, RDS, S3 |
| **W26** | UAT sign-off; production deployment |
| **W26** | Monitoring setup; backup verification; runbook documentation |
| **W26** | Penetration test (third-party) |

**Phase 8 exit criteria:**
- [ ] All integration tests pass
- [ ] Security scan clean (no critical/high vulnerabilities)
- [ ] Load test meets performance targets (p95 < 300ms)
- [ ] Production environment operational
- [ ] Monitoring and alerting configured
- [ ] Backup and restore verified
- [ ] Go-live approved by CTO

---

# APPENDIX A: MODULE-TO-API-TO-TABLE MAPPING

| Module | API Domain Prefix | Key Tables |
|--------|-------------------|------------|
| Authentication | `/auth` | users, otp_verifications, refresh_tokens, user_sessions, user_devices |
| User | `/users` | users, user_roles |
| Role | `/admin/roles` | roles, role_permissions |
| Permission | `/admin/permissions` | permissions, role_permissions |
| Customer | `/customer`, `/crm/customers` | customers, customer_profiles, customer_addresses, customer_employment, customer_income, customer_consents |
| Partner | `/dsa`, `/crm/partners` | partners, partner_profiles, partner_kyc, partner_bank_details, partner_agreements |
| Employee | `/admin/employees` | employees, user_roles |
| Branch | `/admin/branches` | branches, regions |
| Product | `/products`, `/admin/products` | products, lenders, lender_policies, eligibility_rules |
| Lead | `/crm/leads`, `/dsa/leads` | leads, lead_assignments, lead_scores, lead_activities |
| Application | `/applications` | applications, home_loan_details, lap_details, business_loan_details, auto_loan_details |
| LOS | `/crm/los`, `/credit`, `/ops` | application_timeline, application_stages, credit_reviews, sanctions, disbursements |
| Eligibility | `/eligibility` | eligibility_rules, eligibility_results, lender_matches |
| EMI | `/emi` | — (stateless) |
| Document | `/documents` | documents, document_versions, document_checklists, document_deficiencies, document_verifications |
| KYC | `/kyc`, `/customer/kyc` | kyc_profiles, pan_verifications, aadhaar_verifications |
| Referral | `/referrals` | referrals, referral_codes, referral_rewards, referral_rules |
| Commission | `/crm/commissions`, `/dsa/commissions` | commission_rules, commission_ledger, commission_payouts |
| Campaign | `/admin/campaigns` | campaigns, campaign_audiences |
| Notification | `/notifications` | notifications, notification_templates, notification_preferences, notification_logs |
| Support | `/support`, `/crm/support` | tickets, ticket_messages, ticket_assignments, ticket_escalations |
| Analytics | `/analytics` | analytics_snapshots, analytics_metrics, analytics_reports |
| AI | `/ai`, `/voice` | chat_sessions, chat_messages, ai_recommendations, ai_copilot_insights, ai_predictions |
| Knowledge | `/knowledge`, `/admin/knowledge` | kb_articles, kb_faqs, kb_training_materials, kb_sales_scripts, rag_sources |
| Settings | `/admin/settings` | system_settings, feature_flags |
| Audit | `/compliance/audit` | audit_logs, security_logs |

---

# APPENDIX B: TECHNOLOGY DEPENDENCY MAP

| Category | Package | Purpose |
|----------|---------|---------|
| **Runtime** | Node.js 20 LTS | Server runtime |
| **Framework** | Express 4.x | HTTP framework |
| **Language** | TypeScript 5.x | Type safety |
| **ORM** | Prisma 5.x | Database access |
| **Validation** | Zod | Schema validation |
| **Auth** | jsonwebtoken | JWT sign/verify |
| **Password** | bcrypt | Password/OTP hashing |
| **MFA** | otplib | TOTP generation/verification |
| **Logging** | Pino | Structured logging |
| **Security** | Helmet | HTTP security headers |
| **Rate limit** | express-rate-limit | Request throttling |
| **CORS** | cors | Cross-origin control |
| **AWS** | @aws-sdk/client-s3 | S3 operations |
| **Firebase** | firebase-admin | FCM push notifications |
| **AI** | openai | GPT + Embeddings |
| **Scheduling** | node-cron | Cron jobs |
| **Testing** | Jest, Supertest | Unit + integration tests |
| **HTTP client** | axios | External API calls |
| **UUID** | uuid | ID generation |
| **Date** | date-fns | Date manipulation |
| **Process** | PM2 | Process management |

---

# APPENDIX C: ENVIRONMENT VARIABLES

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | development, test, uat, production |
| `PORT` | Yes | API port (default 4000) |
| `DATABASE_URL` | Yes | MySQL connection string |
| `JWT_PRIVATE_KEY` | Yes | RS256 private key (PEM) |
| `JWT_PUBLIC_KEY` | Yes | RS256 public key (PEM) |
| `JWT_ACCESS_EXPIRY` | Yes | Access token TTL (default 15m) |
| `JWT_REFRESH_EXPIRY` | Yes | Refresh token TTL (default 7d) |
| `AWS_REGION` | Yes | ap-south-1 |
| `AWS_S3_BUCKET_DOCUMENTS` | Yes | Documents bucket name |
| `AWS_S3_BUCKET_ASSETS` | Yes | Assets bucket name |
| `FIREBASE_SERVICE_ACCOUNT` | Yes | FCM service account JSON path |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `OPENAI_MODEL` | Yes | Default model (gpt-4o) |
| `SMS_API_KEY` | Yes | SMS provider API key |
| `SMS_SENDER_ID` | Yes | SMS sender ID |
| `WHATSAPP_API_TOKEN` | Yes | WhatsApp Business API token |
| `WHATSAPP_PHONE_ID` | Yes | WhatsApp phone number ID |
| `EMAIL_FROM` | Yes | Transactional email from address |
| `EMAIL_API_KEY` | Yes | SES/SendGrid API key |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |
| `RATE_LIMIT_MAX` | No | Global rate limit (default 1000) |
| `LOG_LEVEL` | No | Pino log level (default info) |
| `REDIS_URL` | Phase 2 | Redis connection string |

---

# APPENDIX D: NAMING CONVENTIONS

| Element | Convention | Example |
|---------|------------|---------|
| Module folder | kebab-case singular | `modules/leads/` |
| Controller file | `{entity}.controller.ts` | `lead.controller.ts` |
| Service file | `{entity}.service.ts` | `lead-scoring.service.ts` |
| Repository file | `{entity}.repository.ts` | `lead.repository.ts` |
| Route file | `{entity}.routes.ts` | `crm-lead.routes.ts` |
| Validator file | `{action}.validator.ts` | `create-lead.validator.ts` |
| DTO file | `{entity}-{request\|response}.dto.ts` | `lead-response.dto.ts` |
| Event | SCREAMING_SNAKE past tense | `LEAD_CREATED` |
| Error code | SCREAMING_SNAKE | `BUSINESS_LEAD_ALREADY_CONVERTED` |
| Permission code | SCREAMING_SNAKE | `LEAD_READ_ASSIGNED` |
| API path | kebab-case plural | `/crm/leads` |
| DB table | snake_case plural | `lead_assignments` |
| DB column | snake_case | `created_at` |
| Enum value | SCREAMING_SNAKE | `QUALIFIED` |
| S3 key | lowercase path | `customers/{id}/kyc/pan/{docId}.pdf` |

---

# APPENDIX E: DOCUMENT APPROVAL

| Role | Name | Date | Signature |
|------|------|------|-----------|
| CTO | | | |
| Backend Lead | | | |
| Security Lead | | | |
| Product Owner | | | |

---

# APPENDIX F: REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | KuberOne Architecture Team | Initial release |

---

# APPENDIX G: RELATED DOCUMENT INDEX

| Document | Relationship |
|----------|-------------|
| [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md) | Parent architecture document |
| [KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md](./KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md) | Repository layout for backend code |
| [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md) | REST API contract (324 endpoints) |
| [KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md](./KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md) | Table/column definitions (139 tables) |
| [KUBERONE_ER_DIAGRAM_AND_DATA_MODEL.md](./KUBERONE_ER_DIAGRAM_AND_DATA_MODEL.md) | Entity relationships (131 entities) |
| [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) | Authorization governance |
| [KUBERONE_USER_TYPES_AND_ROLES.md](./KUBERONE_USER_TYPES_AND_ROLES.md) | Role catalog (22 roles) |
| [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md) | Product definitions (HL, LAP, BL, AL) |
| [KUBERONE_SCREEN_PLANNING_AND_IA.md](./KUBERONE_SCREEN_PLANNING_AND_IA.md) | Client screens consuming backend APIs |
| [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md) | AI Advisor, Copilot, RAG, Voice AI architecture |
| [KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md) | PM2, Nginx, CI/CD, deployment runbooks |

---

*End of Document — KuberOne Backend Development Blueprint v1.0*

