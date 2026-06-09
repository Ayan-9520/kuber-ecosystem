# KuberOne
## Folder Structure & Monorepo Architecture Document

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise Monorepo & Folder Structure Architecture  
**Classification:** Developer Ready | React Native Ready | Node.js Ready | Prisma Ready | Future Scale Ready  
**Version:** 1.0  
**Date:** June 2026  
**Tech Stack:** React Native · Expo · React.js · Vite · Node.js · Express · TypeScript · MySQL · Prisma · AWS S3 · OpenAI · EC2 · PM2 · Nginx  
**Related Documents:**
- [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md)
- [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md)
- [KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md](./KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md)
- [KUBERONE_SCREEN_PLANNING_AND_IA.md](./KUBERONE_SCREEN_PLANNING_AND_IA.md)
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md)
- [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md)
- [KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md](./KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md)
- [KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md](./KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Complete monorepo layout, folder conventions, module boundaries, deployment structure |
| **Audience** | Engineering, DevOps, Mobile, Frontend, Backend, QA |
| **Status** | Authoritative Repository Blueprint |
| **Out of Scope** | Source code, package.json contents, CI YAML implementation |

---

## Repository Statistics

| Metric | Count |
|--------|-------|
| **Applications** | 4 (backend, admin, mobile-customer, mobile-dsa) |
| **Shared packages** | 8 |
| **Backend modules** | 18 |
| **Customer app features** | 14 |
| **DSA app features** | 9 |
| **CRM admin features** | 11 |
| **Estimated top-level folders** | 120+ |

---

# 21. EXECUTIVE SUMMARY

*Board-level monorepo summary — presented first.*

KuberOne uses a **pnpm-workspace monorepo** (`kuberone/`) housing **four deployable applications** and **eight shared packages**, enabling **single-language TypeScript** development across mobile, web, and API with **maximum code reuse** and **controlled deployment independence**.

| Application | Path | Deploy Target |
|-------------|------|---------------|
| **Backend API** | `apps/backend` | AWS EC2 + PM2 |
| **CRM Admin Panel** | `apps/admin` | AWS EC2 + Nginx (static) |
| **Customer Mobile App** | `apps/mobile-customer` | App Store / Play Store (Expo EAS) |
| **DSA Mobile App** | `apps/mobile-dsa` | App Store / Play Store (Expo EAS) |

| Package | Purpose |
|---------|---------|
| `shared-types` | API contracts, DTOs, enums |
| `shared-validation` | Zod schemas (API + forms) |
| `shared-api` | Axios client, interceptors |
| `shared-utils` | Formatting, helpers |
| `shared-constants` | Product codes, stage enums |
| `shared-config` | Environment config types |
| `shared-ui` | Cross-platform design tokens |
| `database` | Prisma schema, migrations, seeds |

**Key decisions:** Modular monolith backend (not microservices); feature-based folders in all apps; database package at repo root; deployment configs in `deployment/`; docs remain in `docs/`.

**Board Recommendation:** Approve this monorepo structure as the standard for all KuberOne engineering work.

---

# 1. MONOREPO OVERVIEW

## 1.1 Why Monorepo

| Benefit | KuberOne Application |
|---------|-------------------|
| **Single source of truth** | API types, validation, constants shared across 4 apps |
| **Atomic changes** | API + mobile + admin updated in one PR |
| **Consistent tooling** | ESLint, Prettier, TypeScript config unified |
| **Faster onboarding** | One clone, one install, full platform |
| **Type safety end-to-end** | Prisma → shared-types → API → clients |
| **Reduced duplication** | Auth, document upload, EMI calc once in packages |

## 1.2 Monorepo Tooling

| Tool | Purpose |
|------|---------|
| **pnpm workspaces** | Package linking, disk-efficient installs |
| **Turborepo** (optional Phase 2) | Build cache, parallel tasks |
| **TypeScript project references** | Cross-package type checking |
| **ESLint + Prettier** | Root config, per-app overrides |
| **Husky + lint-staged** | Pre-commit hooks |
| **Changesets** (optional) | Version management for packages |

## 1.3 Dependency Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    apps/* (deployables)                  │
│  backend · admin · mobile-customer · mobile-dsa         │
└──────────────────────────┬──────────────────────────────┘
                           │ depends on
┌──────────────────────────▼──────────────────────────────┐
│                    packages/* (libraries)                │
│  shared-types · shared-validation · shared-api · ...     │
└──────────────────────────┬──────────────────────────────┘
                           │ depends on
┌──────────────────────────▼──────────────────────────────┐
│                    database (Prisma)                     │
│  schema · migrations · seeds                             │
└─────────────────────────────────────────────────────────┘
```

| Rule | Policy |
|------|--------|
| Apps → Packages | ✓ Allowed |
| Packages → Packages | ✓ Allowed (acyclic) |
| Packages → Apps | ✗ Forbidden |
| database → Apps | ✗ Forbidden (apps import database) |
| Circular deps | ✗ Forbidden — enforced by dependency-cruiser |

## 1.4 Code Sharing Strategy

| Shared Concern | Package | Consumers |
|----------------|---------|-----------|
| API request/response types | `shared-types` | All apps |
| Zod validation schemas | `shared-validation` | Backend + all frontends |
| HTTP client + auth refresh | `shared-api` | mobile-*, admin |
| Product codes, LOS stages | `shared-constants` | All |
| Date/currency/phone format | `shared-utils` | All |
| Design tokens | `shared-ui` | mobile-*, admin (web components subset) |
| Prisma client | `database` | backend only |
| Mobile UI components | `apps/mobile-*/src/components` + `shared-ui` | mobile apps only |

## 1.5 Environment Strategy

| Environment | Branch | API URL | Database |
|-------------|--------|---------|----------|
| **development** | `develop` | localhost:4000 | Local MySQL |
| **testing** | `test/*` | test.api.kuberone... | Test RDS |
| **uat** | `release/*` | uat.api.kuberone... | UAT RDS |
| **production** | `main` | api.kuberone... | Prod RDS |

| File Pattern | Location |
|--------------|----------|
| `.env.example` | Each app + root (template only) |
| `.env.local` | Gitignored — developer local |
| `.env.development` | Gitignored — optional defaults |
| Secrets | AWS SSM Parameter Store / EC2 env (production) |

---

# 2. ROOT PROJECT STRUCTURE

## 2.1 Complete Root Tree

```
kuberone/
├── .github/                          # GitHub Actions workflows
│   ├── workflows/
│   │   ├── ci-backend.yml
│   │   ├── ci-admin.yml
│   │   ├── ci-mobile-customer.yml
│   │   ├── ci-mobile-dsa.yml
│   │   ├── deploy-backend-uat.yml
│   │   ├── deploy-backend-prod.yml
│   │   └── deploy-admin-prod.yml
│   └── CODEOWNERS
│
├── apps/                             # Deployable applications
│   ├── backend/                      # Node.js Express API
│   ├── admin/                        # React + Vite CRM panel
│   ├── mobile-customer/              # Expo Customer app
│   └── mobile-dsa/                   # Expo DSA Partner app
│
├── packages/                         # Shared libraries
│   ├── shared-types/
│   ├── shared-validation/
│   ├── shared-api/
│   ├── shared-utils/
│   ├── shared-constants/
│   ├── shared-config/
│   └── shared-ui/
│
├── database/                         # Prisma + data layer
│   ├── prisma/
│   │   ├── schema/                   # Split schema files
│   │   ├── migrations/
│   │   └── seeds/
│   ├── scripts/
│   └── backups/
│
├── docs/                             # Enterprise documentation
│   ├── KUBERONE_VISION_AND_OBJECTIVES.md
│   ├── KUBERONE_API_SPECIFICATION.md
│   └── ... (all BRD/EAD docs)
│
├── deployment/                       # Infrastructure configs
│   ├── nginx/
│   ├── pm2/
│   ├── ec2/
│   └── scripts/
│
├── scripts/                          # Monorepo utility scripts
│   ├── setup.sh
│   ├── migrate.sh
│   ├── seed.sh
│   └── generate-openapi.sh
│
├── .vscode/                          # Editor settings (optional)
├── package.json                      # Root workspace config
├── pnpm-workspace.yaml
├── turbo.json                        # Turborepo config (Phase 2)
├── tsconfig.base.json                # Base TypeScript config
├── .eslintrc.cjs                     # Root ESLint
├── .prettierrc
├── .gitignore
├── .nvmrc                            # Node version (e.g., 20)
└── README.md
```

## 2.2 Root File Purposes

| File | Purpose |
|------|---------|
| `pnpm-workspace.yaml` | Declares `apps/*`, `packages/*`, `database` |
| `tsconfig.base.json` | Shared compiler options, path aliases |
| `package.json` | Root scripts: `dev`, `build`, `test`, `lint`, `db:migrate` |
| `turbo.json` | Pipeline: build depends on ^build, test parallel |
| `README.md` | Clone, install, run instructions |

## 2.3 Workspace Scripts (Root)

| Script | Command | Description |
|--------|---------|-------------|
| `pnpm dev` | turbo run dev | Start all apps in dev mode |
| `pnpm dev:backend` | filter backend | API only |
| `pnpm dev:admin` | filter admin | CRM panel only |
| `pnpm dev:mobile-customer` | filter mobile-customer | Expo customer |
| `pnpm build` | turbo run build | Production builds |
| `pnpm test` | turbo run test | All tests |
| `pnpm lint` | turbo run lint | ESLint all packages |
| `pnpm db:migrate` | database package | Prisma migrate deploy |
| `pnpm db:seed` | database package | Seed master data |
| `pnpm db:studio` | database package | Prisma Studio |

---

# 3. BACKEND STRUCTURE

## 3.1 Complete Backend Tree

```
apps/backend/
├── src/
│   ├── app.ts                        # Express app factory
│   ├── server.ts                     # HTTP server entry (PM2)
│   │
│   ├── config/
│   │   ├── index.ts                  # Config aggregator
│   │   ├── env.ts                    # Zod-validated env vars
│   │   ├── database.ts               # Prisma client singleton
│   │   ├── s3.ts                     # AWS S3 client
│   │   ├── redis.ts                  # Redis (Phase 2)
│   │   ├── openai.ts                 # OpenAI client
│   │   ├── fcm.ts                    # Firebase admin
│   │   └── cors.ts                   # CORS origins
│   │
│   ├── modules/                      # Feature modules (Section 4)
│   │   ├── auth/
│   │   ├── users/
│   │   ├── customers/
│   │   └── ... (18 modules)
│   │
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── request-id.middleware.ts
│   │   │   ├── rate-limit.middleware.ts
│   │   │   ├── authenticate.middleware.ts
│   │   │   ├── authorize.middleware.ts
│   │   │   ├── audit-context.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   └── error-handler.middleware.ts
│   │   ├── errors/
│   │   │   ├── app-error.ts
│   │   │   ├── error-codes.ts
│   │   │   └── error-handler.ts
│   │   ├── events/
│   │   │   ├── event-bus.ts
│   │   │   └── domain-events.ts
│   │   ├── responses/
│   │   │   ├── success-response.ts
│   │   │   └── paginated-response.ts
│   │   ├── decorators/               # Optional metadata
│   │   ├── guards/                   # SoD, scope guards
│   │   ├── interceptors/
│   │   ├── utils/
│   │   │   ├── crypto.ts             # PII encryption
│   │   │   ├── mask.ts               # PII masking
│   │   │   ├── pagination.ts
│   │   │   └── uuid.ts
│   │   ├── helpers/
│   │   │   ├── phone.helper.ts
│   │   │   └── date.helper.ts
│   │   ├── constants/
│   │   │   └── http-status.ts
│   │   └── types/
│   │       ├── express.d.ts          # Request user augmentation
│   │       └── context.ts            # RequestContext type
│   │
│   ├── integrations/
│   │   ├── pan/                      # PAN verification adapter
│   │   ├── aadhaar/                  # Aadhaar adapter
│   │   ├── sms/                      # SMS provider
│   │   ├── whatsapp/                 # WA Business API
│   │   ├── email/                    # SES/SendGrid
│   │   ├── cibil/                    # Credit bureau (Phase 2)
│   │   └── lender/                   # Lender adapter interface
│   │
│   ├── workers/                      # Background jobs (separate PM2 process)
│   │   ├── index.ts
│   │   ├── ocr.worker.ts
│   │   ├── notification.worker.ts
│   │   ├── campaign.worker.ts
│   │   ├── rag-index.worker.ts
│   │   ├── commission.worker.ts
│   │   └── report.worker.ts
│   │
│   ├── jobs/                         # Scheduled cron jobs
│   │   ├── sla-check.job.ts
│   │   ├── lead-expiry.job.ts
│   │   ├── snapshot.job.ts
│   │   └── archive.job.ts
│   │
│   └── routes/
│       └── index.ts                  # Mount all module routes → /api/v1
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── .env.example
├── package.json
├── tsconfig.json
├── nodemon.json                      # Dev hot reload
└── ecosystem.config.js               # PM2 config (or ref deployment/pm2)
```

## 3.2 Standard Module Internal Structure

Every backend module follows this pattern:

```
modules/{module-name}/
├── {module-name}.module.ts           # Route registration + DI wiring
├── controllers/
│   └── {entity}.controller.ts
├── services/
│   └── {entity}.service.ts
├── repositories/
│   └── {entity}.repository.ts
├── routes/
│   └── {entity}.routes.ts
├── validators/
│   └── {action}.validator.ts         # Zod schemas (re-export shared-validation)
├── dtos/
│   ├── {entity}-request.dto.ts
│   └── {entity}-response.dto.ts
├── mappers/
│   └── {entity}.mapper.ts            # Prisma entity → DTO
├── events/
│   └── {entity}.events.ts            # Domain event definitions
├── constants/
│   └── {module}.constants.ts
└── types/
    └── {module}.types.ts
```

## 3.3 Layer Responsibilities

| Layer | Folder | Rules |
|-------|--------|-------|
| **Routes** | `routes/` | HTTP verb + path → controller method |
| **Controllers** | `controllers/` | Parse request, call service, return response |
| **Validators** | `validators/` | Zod schemas; use `shared-validation` |
| **Services** | `services/` | Business logic, transactions, events |
| **Repositories** | `repositories/` | Prisma queries only |
| **DTOs** | `dtos/` | Request/response shapes |
| **Mappers** | `mappers/` | Entity ↔ DTO transformation |

---

# 4. BACKEND MODULE STRUCTURE

## 4.1 Module Registry

| Module | Path | API Domain | Key Tables |
|--------|------|------------|------------|
| Authentication | `modules/auth` | `/auth` | users, sessions, otp_verifications |
| Users | `modules/users` | `/users` | users, user_roles |
| Customers | `modules/customers` | `/customer`, `/crm/customers` | customers, customer_profiles |
| Partners | `modules/partners` | `/dsa`, `/crm/partners` | partners, partner_kyc |
| Leads | `modules/leads` | `/crm/leads`, `/dsa/leads` | leads, lead_assignments |
| Applications | `modules/applications` | `/applications` | applications, application_timeline |
| LOS | `modules/los` | `/crm/los`, `/ops`, `/credit` | sanctions, disbursements |
| Products | `modules/products` | `/public/products`, `/admin/products` | products, eligibility_rules |
| Eligibility | `modules/eligibility` | `/eligibility` | eligibility_results |
| Documents | `modules/documents` | `/documents` | documents, document_versions |
| KYC | `modules/kyc` | `/customer/kyc`, `/compliance/kyc` | kyc_profiles, pan_verifications |
| Referrals | `modules/referrals` | `/referral` | referrals, referral_rewards |
| Commissions | `modules/commissions` | `/crm/commissions`, `/finance` | commission_ledger |
| Notifications | `modules/notifications` | `/notifications` | notifications, push |
| Campaigns | `modules/campaigns` | `/admin/campaigns` | campaigns |
| Support | `modules/support` | `/support`, `/crm/support` | tickets, ticket_messages |
| Analytics | `modules/analytics` | `/analytics` | metrics, analytics_snapshots |
| AI | `modules/ai` | `/ai`, `/voice` | chat_sessions, ai_recommendations |
| Knowledge | `modules/knowledge` | `/knowledge` | policies, faqs |
| Settings | `modules/settings` | `/admin/settings` | system_settings |
| Organization | `modules/organization` | `/branch`, `/admin/branches` | branches, employees |
| Audit | `modules/audit` | `/compliance/audit` | audit_logs |
| Admin | `modules/admin` | `/admin` | roles, permissions |
| Webhooks | `modules/webhooks` | `/webhooks` | — |

---

## 4.2 Authentication Module

```
modules/auth/
├── auth.module.ts
├── controllers/
│   ├── otp.controller.ts             # send, verify
│   ├── login.controller.ts           # employee login
│   ├── mfa.controller.ts
│   ├── session.controller.ts           # me, sessions, logout
│   └── password.controller.ts          # forgot, reset
├── services/
│   ├── otp.service.ts
│   ├── token.service.ts              # JWT issue, refresh rotation
│   ├── session.service.ts
│   └── mfa.service.ts
├── repositories/
│   ├── otp.repository.ts
│   ├── session.repository.ts
│   └── refresh-token.repository.ts
├── routes/
│   └── auth.routes.ts
├── validators/
│   ├── send-otp.validator.ts
│   ├── verify-otp.validator.ts
│   └── login.validator.ts
└── dtos/
    ├── token-response.dto.ts
    └── auth-user.dto.ts
```

---

## 4.3 Users Module

```
modules/users/
├── controllers/     user.controller.ts
├── services/        user.service.ts, role-assignment.service.ts
├── repositories/    user.repository.ts, user-role.repository.ts
├── routes/          user.routes.ts
├── validators/      create-user, update-user, assign-role
└── dtos/            user-response, user-list
```

---

## 4.4 Customers Module

```
modules/customers/
├── controllers/
│   ├── customer-profile.controller.ts    # /customer/profile
│   ├── customer-address.controller.ts
│   ├── customer-employment.controller.ts
│   ├── customer-income.controller.ts
│   ├── customer-preference.controller.ts
│   ├── customer-consent.controller.ts
│   ├── customer-dashboard.controller.ts
│   └── crm-customer.controller.ts        # /crm/customers
├── services/
│   ├── customer.service.ts
│   ├── profile-completion.service.ts
│   └── customer-360.service.ts
├── repositories/
│   ├── customer.repository.ts
│   ├── address.repository.ts
│   └── employment.repository.ts
├── routes/
│   ├── customer.routes.ts
│   └── crm-customer.routes.ts
└── validators/      (8 validators)
```

---

## 4.5 Partners Module

```
modules/partners/
├── controllers/
│   ├── dsa-profile.controller.ts       # /dsa/*
│   ├── dsa-kyc.controller.ts
│   ├── dsa-bank.controller.ts
│   ├── dsa-agreement.controller.ts
│   ├── dsa-performance.controller.ts
│   └── crm-partner.controller.ts       # /crm/partners
├── services/
│   ├── partner.service.ts
│   ├── partner-onboarding.service.ts
│   └── partner-certification.service.ts
├── repositories/
│   └── partner.repository.ts
└── routes/
    ├── dsa.routes.ts
    └── crm-partner.routes.ts
```

---

## 4.6 Leads Module

```
modules/leads/
├── controllers/
│   ├── lead.controller.ts              # CRUD, list
│   ├── lead-assignment.controller.ts
│   ├── lead-activity.controller.ts
│   ├── lead-conversion.controller.ts
│   ├── dsa-lead.controller.ts          # /dsa/leads
│   └── lead-analytics.controller.ts
├── services/
│   ├── lead.service.ts
│   ├── lead-scoring.service.ts
│   ├── lead-assignment.service.ts
│   └── lead-sla.service.ts
├── repositories/
│   ├── lead.repository.ts
│   ├── lead-score.repository.ts
│   └── lead-assignment.repository.ts
└── routes/
    ├── crm-lead.routes.ts
    └── dsa-lead.routes.ts
```

---

## 4.7 Applications Module

```
modules/applications/
├── controllers/
│   ├── customer-application.controller.ts
│   ├── crm-application.controller.ts
│   └── product-details.controller.ts   # HL/LAP/BL/AL extensions
├── services/
│   ├── application.service.ts
│   ├── application-wizard.service.ts
│   └── product-detail.service.ts
├── repositories/
│   ├── application.repository.ts
│   ├── home-loan-detail.repository.ts
│   ├── lap-detail.repository.ts
│   ├── business-loan-detail.repository.ts
│   └── auto-loan-detail.repository.ts
└── routes/
    └── application.routes.ts
```

---

## 4.8 LOS Module

```
modules/los/
├── controllers/
│   ├── stage.controller.ts
│   ├── credit-review.controller.ts
│   ├── bank-login.controller.ts
│   ├── sanction.controller.ts
│   └── disbursement.controller.ts
├── services/
│   ├── stage-manager.service.ts      # S01–S09 transitions
│   ├── credit.service.ts
│   ├── ops.service.ts
│   └── lender-router.service.ts
├── repositories/
│   ├── timeline.repository.ts
│   ├── sanction.repository.ts
│   └── disbursement.repository.ts
└── routes/
    ├── los.routes.ts
    ├── credit.routes.ts
    └── ops.routes.ts
```

---

## 4.9 Documents Module

```
modules/documents/
├── controllers/
│   ├── presign.controller.ts
│   ├── document.controller.ts
│   ├── verification.controller.ts
│   └── deficiency.controller.ts
├── services/
│   ├── document.service.ts
│   ├── s3-storage.service.ts
│   └── document-checklist.service.ts
├── repositories/
│   └── document.repository.ts
└── storage/
    └── s3-key-builder.ts             # S3 path conventions
```

---

## 4.10 Remaining Modules (Summary)

| Module | Controllers | Services | Repositories | Routes |
|--------|-------------|----------|--------------|--------|
| **Referrals** | referral, reward, crm-referral | referral, reward-calc | referral, reward | referral.routes |
| **Commissions** | ledger, approval, payout, dsa-commission | commission-calc, payout, clawback | ledger, payment | commission.routes |
| **Notifications** | notification, preference, device | notification, push, sms, email, wa | notification | notification.routes |
| **Campaigns** | campaign, audience, analytics | campaign, audience-builder | campaign | campaign.routes |
| **Support** | ticket, message, escalation | ticket, sla | ticket | support.routes |
| **Analytics** | dashboard, report, kpi | snapshot, report-gen | metric, snapshot | analytics.routes |
| **AI** | advisor, copilot, voice, rag | chat, recommendation, rag, voice | chat-session | ai.routes, voice.routes |
| **Knowledge** | article, faq, script, admin-cms | kb, rag-ingest | article, faq | knowledge.routes |
| **Settings** | system, product, notification, ai | settings | setting | settings.routes |
| **KYC** | customer-kyc, compliance-kyc | pan-verify, aadhaar-verify | kyc-profile | kyc.routes |
| **Products** | public-product, admin-product, lender | product-catalog, lender-policy | product | product.routes |
| **Eligibility** | check, preview, queue | eligibility-engine | eligibility-result | eligibility.routes |
| **Organization** | branch, region, employee | org-hierarchy | branch, employee | org.routes |
| **Audit** | audit-log, access-log, security | audit-writer | audit-log | audit.routes |
| **Admin** | role, permission, feature-flag | rbac | role | admin.routes |
| **Webhooks** | whatsapp, sms, kyc, lender | webhook-verify | — | webhook.routes |

---

# 5. REACT NATIVE STRUCTURE

## 5.1 Shared Mobile Conventions

Both `mobile-customer` and `mobile-dsa` share identical top-level structure. Differences are in `features/` and `app.config.ts`.

```
apps/mobile-{customer|dsa}/
├── app/                              # Expo Router (file-based routing) OR src/
│   ├── _layout.tsx                   # Root layout
│   └── (tabs)/                       # Tab navigator group
├── src/
│   ├── assets/
│   ├── components/
│   ├── features/
│   ├── navigation/
│   ├── services/
│   ├── store/
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   ├── types/
│   ├── theme/
│   └── layouts/
├── app.config.ts                     # Expo config (bundle ID, name)
├── eas.json                          # EAS Build profiles
├── .env.example
├── package.json
└── tsconfig.json
```

## 5.2 Complete Mobile `src/` Tree

```
src/
├── assets/
│   ├── images/
│   │   ├── logo/
│   │   ├── onboarding/
│   │   ├── products/
│   │   └── empty-states/
│   ├── icons/
│   │   ├── tab/                      # Tab bar icons
│   │   └── product/                  # Product family icons
│   ├── fonts/
│   │   └── Inter/                    # Custom fonts
│   ├── animations/
│   │   └── lottie/                   # Lottie JSON files
│   └── documents/                    # Static PDF templates (optional)
│
├── components/
│   ├── ui/                           # Atomic UI (from shared-ui mobile)
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Badge/
│   │   ├── Modal/
│   │   ├── BottomSheet/
│   │   ├── Loading/
│   │   └── EmptyState/
│   ├── forms/
│   │   ├── OtpInput/
│   │   ├── PhoneInput/
│   │   ├── CurrencyInput/
│   │   ├── DatePicker/
│   │   └── FormField/
│   ├── layout/
│   │   ├── ScreenContainer/
│   │   ├── Header/
│   │   ├── TabBar/
│   │   └── SafeAreaWrapper/
│   ├── data-display/
│   │   ├── StatusBadge/
│   │   ├── Timeline/
│   │   ├── ProgressStepper/
│   │   └── ApplicationCard/
│   └── feedback/
│       ├── Toast/
│       ├── ErrorBoundary/
│       └── NetworkStatus/
│
├── features/                         # Feature modules (Section 6/7)
│
├── navigation/
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── MainTabNavigator.tsx
│   ├── linking.config.ts             # Deep link config
│   └── navigation.types.ts
│
├── services/
│   ├── api/                          # Feature API wrappers (uses shared-api)
│   │   ├── auth.api.ts
│   │   ├── customer.api.ts
│   │   └── ...
│   ├── storage/
│   │   ├── secure-storage.ts         # expo-secure-store (tokens)
│   │   └── async-storage.ts          # Preferences cache
│   ├── notifications/
│   │   └── fcm.service.ts
│   ├── analytics/
│   │   └── firebase-analytics.ts
│   └── biometrics/
│       └── biometric-auth.ts
│
├── store/                            # Zustand + TanStack Query
│   ├── index.ts
│   ├── auth.store.ts
│   ├── ui.store.ts
│   └── query-client.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useApi.ts
│   ├── useDebounce.ts
│   ├── useDocumentUpload.ts
│   └── useDeepLink.ts
│
├── utils/
│   ├── format/
│   │   ├── currency.ts
│   │   ├── date.ts
│   │   └── phone.ts
│   ├── validation/
│   └── permissions/
│
├── constants/
│   ├── routes.ts                     # Screen name constants
│   └── config.ts                     # App-specific config
│
├── types/
│   ├── navigation.ts
│   └── env.d.ts
│
├── theme/
│   ├── index.ts
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── shadows.ts
│   └── components.ts                 # Component style overrides
│
└── layouts/
    ├── AuthLayout.tsx
    ├── MainLayout.tsx
    └── WizardLayout.tsx              # Application wizard shell
```

---

# 6. CUSTOMER APP FEATURE STRUCTURE

**App path:** `apps/mobile-customer/src/features/`

## 6.1 Feature Module Pattern

```
features/{feature-name}/
├── screens/
│   └── {ScreenName}Screen.tsx
├── components/
│   └── {FeatureSpecificComponent}.tsx
├── hooks/
│   └── use{Feature}.ts
├── services/
│   └── {feature}.api.ts              # Thin wrapper over shared-api
├── types/
│   └── {feature}.types.ts
├── constants/
│   └── {feature}.constants.ts
└── index.ts                          # Public exports
```

## 6.2 Customer Features Tree

```
features/
├── auth/
│   ├── screens/
│   │   ├── SplashScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── LanguageSelectionScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── OtpVerificationScreen.tsx
│   │   └── RegistrationScreen.tsx
│   ├── components/
│   │   └── OtpResendTimer.tsx
│   └── hooks/
│       └── useOtpAuth.ts
│
├── dashboard/
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   └── NotificationsScreen.tsx
│   └── components/
│       ├── ApplicationStatusCard.tsx
│       ├── QuickActionsGrid.tsx
│       └── AiInsightCard.tsx
│
├── profile/
│   ├── screens/
│   │   ├── ProfileHubScreen.tsx
│   │   ├── PersonalDetailsScreen.tsx
│   │   ├── AddressDetailsScreen.tsx
│   │   ├── EmploymentDetailsScreen.tsx
│   │   ├── IncomeDetailsScreen.tsx
│   │   └── ProfileCompletionScreen.tsx
│   └── components/
│       └── ProfileProgressBar.tsx
│
├── kyc/
│   ├── screens/
│   │   ├── KycHubScreen.tsx
│   │   ├── PanVerificationScreen.tsx
│   │   ├── AadhaarVerificationScreen.tsx
│   │   ├── PhotoUploadScreen.tsx
│   │   ├── AddressProofScreen.tsx
│   │   └── KycStatusScreen.tsx
│   └── hooks/
│       └── useKycFlow.ts
│
├── loan-products/
│   ├── screens/
│   │   ├── ProductCatalogScreen.tsx
│   │   ├── ProductDetailScreen.tsx
│   │   ├── HomeLoanOverviewScreen.tsx
│   │   ├── LapOverviewScreen.tsx
│   │   ├── BusinessLoanOverviewScreen.tsx
│   │   ├── AutoLoanOverviewScreen.tsx
│   │   ├── ProductComparisonScreen.tsx
│   │   ├── OffersScreen.tsx
│   │   └── RecommendationsScreen.tsx
│   └── components/
│       ├── ProductCard.tsx
│       └── ProductFilterSheet.tsx
│
├── eligibility/
│   ├── screens/
│   │   ├── EligibilityCheckScreen.tsx
│   │   └── EligibilityResultScreen.tsx
│   └── hooks/
│       └── useEligibility.ts
│
├── emi/
│   ├── screens/
│   │   ├── EmiCalculatorScreen.tsx
│   │   ├── EligibilityCalculatorScreen.tsx
│   │   ├── SavingsCalculatorScreen.tsx
│   │   └── ComparisonCalculatorScreen.tsx
│   └── components/
│       └── AmortizationTable.tsx
│
├── applications/
│   ├── screens/
│   │   ├── ApplicationListScreen.tsx
│   │   ├── ApplicationDetailScreen.tsx
│   │   ├── ApplicationTimelineScreen.tsx
│   │   └── wizard/
│   │       ├── WizardContainerScreen.tsx
│   │       ├── steps/                  # Per-product wizard steps
│   │       │   ├── HomeLoanSteps/
│   │       │   ├── LapSteps/
│   │       │   ├── BusinessLoanSteps/
│   │       │   └── AutoLoanSteps/
│   │       └── WizardReviewScreen.tsx
│   ├── store/
│   │   └── wizard.store.ts             # Zustand persist — save/resume
│   └── hooks/
│       └── useApplicationWizard.ts
│
├── documents/
│   ├── screens/
│   │   ├── DocumentDashboardScreen.tsx
│   │   ├── DocumentUploadScreen.tsx
│   │   ├── VerificationStatusScreen.tsx
│   │   ├── DeficiencyScreen.tsx
│   │   └── DocumentVaultScreen.tsx
│   └── hooks/
│       └── useDocumentUpload.ts
│
├── ai-advisor/
│   ├── screens/
│   │   ├── AdvisorHomeScreen.tsx
│   │   ├── ConversationScreen.tsx
│   │   ├── RecommendationsScreen.tsx
│   │   ├── EligibilityResultsScreen.tsx
│   │   ├── AiInsightsScreen.tsx
│   │   └── ConversationHistoryScreen.tsx
│   └── components/
│       ├── ChatBubble.tsx
│       ├── RecommendationCard.tsx
│       └── TypingIndicator.tsx
│
├── voice-ai/
│   ├── screens/
│   │   ├── VoiceStartScreen.tsx
│   │   ├── VoiceSessionScreen.tsx
│   │   ├── VoiceResultsScreen.tsx
│   │   ├── CallbackRequestScreen.tsx
│   │   └── AppointmentBookingScreen.tsx
│   └── services/
│       └── voice.service.ts
│
├── referrals/
│   ├── screens/
│   │   ├── ReferralDashboardScreen.tsx
│   │   ├── ReferralTrackingScreen.tsx
│   │   ├── RewardsScreen.tsx
│   │   ├── PayoutHistoryScreen.tsx
│   │   └── LeaderboardScreen.tsx
│   └── components/
│       └── ShareReferralSheet.tsx
│
├── support/
│   ├── screens/
│   │   ├── HelpCenterScreen.tsx
│   │   ├── TicketListScreen.tsx
│   │   ├── CreateTicketScreen.tsx
│   │   ├── TicketDetailScreen.tsx
│   │   ├── ChatSupportScreen.tsx
│   │   ├── FaqScreen.tsx
│   │   └── KnowledgeBaseScreen.tsx
│   └── components/
│       └── FaqAccordion.tsx
│
├── notifications/
│   ├── screens/
│   │   ├── NotificationListScreen.tsx
│   │   ├── SmsHistoryScreen.tsx
│   │   ├── EmailHistoryScreen.tsx
│   │   └── WhatsAppHistoryScreen.tsx
│   └── hooks/
│       └── useNotifications.ts
│
└── settings/
    ├── screens/
    │   ├── SettingsScreen.tsx
    │   ├── ProfileSettingsScreen.tsx
    │   ├── SecuritySettingsScreen.tsx
    │   ├── NotificationPreferencesScreen.tsx
    │   ├── LanguagePreferencesScreen.tsx
    │   ├── PrivacyControlsScreen.tsx
    │   ├── TermsScreen.tsx
    │   ├── PrivacyScreen.tsx
    │   └── AboutScreen.tsx
    └── components/
        └── SettingsMenuItem.tsx
```

---

# 7. DSA APP FEATURE STRUCTURE

**App path:** `apps/mobile-dsa/src/features/`

```
features/
├── auth/
│   ├── screens/
│   │   ├── SplashScreen.tsx
│   │   ├── PartnerLoginScreen.tsx
│   │   ├── OtpVerificationScreen.tsx
│   │   └── OnboardingGateScreen.tsx    # KYC/agreement gate
│   └── hooks/
│       └── usePartnerAuth.ts
│
├── registration/
│   ├── screens/
│   │   ├── RegistrationScreen.tsx
│   │   ├── PartnerProfileSetupScreen.tsx
│   │   └── AgreementSignScreen.tsx
│   └── components/
│       └── CertificationChecklist.tsx
│
├── kyc/
│   ├── screens/
│   │   ├── PartnerKycHubScreen.tsx
│   │   ├── PanUploadScreen.tsx
│   │   ├── BankDetailsScreen.tsx
│   │   └── DocumentUploadScreen.tsx
│   └── hooks/
│       └── usePartnerKyc.ts
│
├── dashboard/
│   ├── screens/
│   │   └── DashboardScreen.tsx
│   └── components/
│       ├── EarningsSummaryCard.tsx
│       ├── LeadPipelineWidget.tsx
│       ├── QuickSubmitFab.tsx
│       └── TargetProgressWidget.tsx
│
├── lead-submission/
│   ├── screens/
│   │   ├── LeadCreateScreen.tsx
│   │   ├── LeadProductSelectScreen.tsx
│   │   └── LeadDocumentAttachScreen.tsx
│   ├── components/
│   │   └── LeadSubmitForm.tsx
│   └── hooks/
│       └── useLeadSubmit.ts
│
├── lead-tracking/
│   ├── screens/
│   │   ├── LeadListScreen.tsx
│   │   ├── LeadDetailScreen.tsx
│   │   ├── LeadDocumentsScreen.tsx
│   │   ├── LeadStatusScreen.tsx
│   │   └── FollowUpsScreen.tsx
│   └── components/
│       └── LeadStatusBadge.tsx
│
├── commission/
│   ├── screens/
│   │   ├── CommissionDashboardScreen.tsx
│   │   ├── CommissionLedgerScreen.tsx
│   │   ├── CommissionDetailScreen.tsx
│   │   ├── PayoutReportsScreen.tsx
│   │   ├── PayoutDetailScreen.tsx
│   │   └── DisputeScreen.tsx
│   └── components/
│       └── CommissionCard.tsx
│
├── reports/
│   ├── screens/
│   │   ├── PerformanceReportScreen.tsx
│   │   └── LeaderboardScreen.tsx
│   └── hooks/
│       └── usePerformance.ts
│
├── training/
│   ├── screens/
│   │   ├── TrainingListScreen.tsx
│   │   ├── TrainingDetailScreen.tsx
│   │   └── CertificationScreen.tsx
│   └── components/
│       └── TrainingProgressCard.tsx
│
├── profile/
│   ├── screens/
│   │   ├── ProfileScreen.tsx
│   │   ├── BankAccountsScreen.tsx
│   │   └── AgreementsScreen.tsx
│   └── components/
│       └── TierBadge.tsx
│
└── settings/
    ├── screens/
    │   ├── SettingsScreen.tsx
    │   └── SupportScreen.tsx
    └── ...
```

**DSA Tab Navigation:** Dashboard · Leads · Earnings · More

---

# 8. REACT ADMIN STRUCTURE

## 8.1 Complete Admin Tree

```
apps/admin/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── main.tsx                      # Vite entry
│   ├── App.tsx
│   ├── vite-env.d.ts
│   │
│   ├── pages/                        # Route-level page components
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── MfaPage.tsx
│   │   ├── dashboard/
│   │   ├── leads/
│   │   ├── customers/
│   │   ├── applications/
│   │   ├── documents/
│   │   ├── partners/
│   │   ├── commissions/
│   │   ├── campaigns/
│   │   ├── support/
│   │   ├── analytics/
│   │   ├── knowledge/
│   │   ├── compliance/
│   │   ├── management/
│   │   └── admin/
│   │
│   ├── features/                     # Feature modules (Section 9)
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui or custom
│   │   ├── data-table/
│   │   │   ├── DataTable.tsx
│   │   │   ├── ColumnHeader.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── BulkActions.tsx
│   │   ├── forms/
│   │   ├── charts/
│   │   │   ├── FunnelChart.tsx
│   │   │   ├── LineChart.tsx
│   │   │   └── KpiCard.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── ai/
│   │   │   └── CopilotDrawer.tsx
│   │   └── feedback/
│   │       ├── LoadingOverlay.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── layouts/
│   │   ├── AuthLayout.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── ManagementLayout.tsx
│   │   └── BlankLayout.tsx
│   │
│   ├── routes/
│   │   ├── index.tsx                 # Router config
│   │   ├── ProtectedRoute.tsx
│   │   ├── RoleGuard.tsx
│   │   └── route-config.ts
│   │
│   ├── services/
│   │   └── api/                      # Feature API wrappers
│   │
│   ├── store/
│   │   ├── index.ts                  # Redux store
│   │   ├── slices/
│   │   │   ├── auth.slice.ts
│   │   │   ├── ui.slice.ts
│   │   │   ├── sidebar.slice.ts
│   │   │   └── copilot.slice.ts
│   │   ├── selectors/
│   │   └── middleware/
│   │       └── api.middleware.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePermission.ts
│   │   ├── useDebounce.ts
│   │   └── useTableState.ts
│   │
│   ├── theme/
│   │   ├── index.css                 # Tailwind / CSS variables
│   │   ├── tokens.ts
│   │   └── components.ts
│   │
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── utils/
│   ├── constants/
│   └── types/
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── .env.example
└── package.json
```

---

# 9. CRM MODULE STRUCTURE

**Path:** `apps/admin/src/features/`

## 9.1 CRM Feature Pattern

```
features/{module}/
├── pages/                            # Re-export or thin wrappers
├── components/
│   ├── {Module}List.tsx
│   ├── {Module}Detail.tsx
│   ├── {Module}Form.tsx
│   └── {Module}Filters.tsx
├── hooks/
│   └── use{Module}.ts
├── services/
│   └── {module}.api.ts
├── store/
│   └── {module}.slice.ts             # If Redux needed
└── types/
    └── {module}.types.ts
```

## 9.2 CRM Features Tree

```
features/
├── dashboard/
│   ├── components/
│   │   ├── SalesDashboard.tsx
│   │   ├── RmDashboard.tsx
│   │   ├── CreditDashboard.tsx
│   │   ├── OpsDashboard.tsx
│   │   ├── BranchDashboard.tsx
│   │   ├── RegionalDashboard.tsx
│   │   ├── SupportDashboard.tsx
│   │   ├── ComplianceDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── widgets/
│   │       ├── PriorityQueueWidget.tsx
│   │       ├── SlaAlertWidget.tsx
│   │       ├── TargetProgressWidget.tsx
│   │       └── AiCopilotWidget.tsx
│   └── hooks/
│       └── useDashboard.ts
│
├── leads/
│   ├── pages/
│   │   ├── LeadListPage.tsx
│   │   └── LeadDetailPage.tsx
│   ├── components/
│   │   ├── LeadQueue.tsx
│   │   ├── LeadAssignmentModal.tsx
│   │   ├── LeadScoringPanel.tsx
│   │   ├── LeadTimeline.tsx
│   │   ├── LeadQualificationForm.tsx
│   │   ├── LeadActivityLog.tsx
│   │   └── LeadConvertDialog.tsx
│   └── hooks/
│       └── useLeadActions.ts
│
├── customers/
│   ├── pages/
│   │   ├── CustomerListPage.tsx
│   │   └── Customer360Page.tsx
│   └── components/
│       ├── CustomerTabs/
│       │   ├── PersonalTab.tsx
│       │   ├── KycTab.tsx
│       │   ├── ApplicationsTab.tsx
│       │   ├── DocumentsTab.tsx
│       │   ├── InteractionsTab.tsx
│       │   └── CrossSellTab.tsx
│       └── CustomerSearchBar.tsx
│
├── applications/
│   ├── pages/
│   │   ├── ApplicationListPage.tsx
│   │   └── ApplicationDetailPage.tsx
│   └── components/
│       ├── ApplicationTabs/
│       │   ├── SummaryTab.tsx
│       │   ├── EligibilityTab.tsx
│       │   ├── DocumentsTab.tsx
│       │   ├── CreditTab.tsx
│       │   ├── LenderTab.tsx
│       │   ├── SanctionTab.tsx
│       │   └── DisbursementTab.tsx
│       ├── ApplicationTimeline.tsx
│       ├── StageActionPanel.tsx
│       └── ProductDetailPanel.tsx
│
├── documents/
│   ├── pages/
│   │   ├── DocumentQueuePage.tsx
│   │   └── DocumentVerifyPage.tsx
│   └── components/
│       ├── DocumentViewer.tsx
│       ├── OcrReviewPanel.tsx
│       ├── DeficiencyForm.tsx
│       └── DocumentPackageBuilder.tsx
│
├── partners/
│   ├── pages/
│   │   ├── PartnerListPage.tsx
│   │   └── PartnerDetailPage.tsx
│   └── components/
│       ├── PartnerOnboardingQueue.tsx
│       ├── PartnerPerformanceChart.tsx
│       └── PartnerActivationDialog.tsx
│
├── commissions/
│   ├── pages/
│   │   ├── CommissionLedgerPage.tsx
│   │   ├── ApprovalQueuePage.tsx
│   │   └── PayoutBatchPage.tsx
│   └── components/
│       ├── CommissionRuleEditor.tsx
│       ├── PayoutBatchBuilder.tsx
│       └── DisputeResolver.tsx
│
├── campaigns/
│   ├── pages/
│   │   ├── CampaignListPage.tsx
│   │   └── CampaignEditorPage.tsx
│   └── components/
│       ├── AudienceBuilder.tsx
│       ├── ChannelSelector.tsx
│       └── CampaignAnalytics.tsx
│
├── support/
│   ├── pages/
│   │   ├── TicketQueuePage.tsx
│   │   └── TicketWorkspacePage.tsx
│   └── components/
│       ├── TicketMessageThread.tsx
│       ├── EscalationPanel.tsx
│       └── CannedResponsePicker.tsx
│
├── analytics/
│   ├── pages/
│   │   ├── AnalyticsHubPage.tsx
│   │   ├── RevenueDashboardPage.tsx
│   │   ├── LeadFunnelPage.tsx
│   │   └── ReportBuilderPage.tsx
│   └── components/
│       ├── ReportScheduler.tsx
│       └── ExportButton.tsx
│
├── knowledge/
│   ├── pages/
│   │   ├── ArticleListPage.tsx
│   │   ├── ArticleEditorPage.tsx
│   │   └── FaqManagerPage.tsx
│   └── components/
│       ├── RichTextEditor.tsx
│       └── RagIndexStatus.tsx
│
├── compliance/
│   ├── pages/
│   │   ├── AuditLogPage.tsx
│   │   ├── KycReviewPage.tsx
│   │   └── FraudCasesPage.tsx
│   └── components/
│       └── AuditLogViewer.tsx
│
├── management/
│   ├── pages/
│   │   ├── CeoDashboardPage.tsx
│   │   ├── DirectorDashboardPage.tsx
│   │   ├── BusinessHeadPage.tsx
│   │   ├── SalesHeadPage.tsx
│   │   ├── OpsHeadPage.tsx
│   │   ├── FinanceHeadPage.tsx
│   │   ├── BoardPackPage.tsx
│   │   └── ForecastPage.tsx
│   └── components/
│       └── ExecutiveKpiGrid.tsx
│
└── settings/
    ├── pages/
    │   ├── SystemSettingsPage.tsx
    │   ├── ProductSettingsPage.tsx
    │   ├── NotificationSettingsPage.tsx
    │   ├── SecuritySettingsPage.tsx
    │   ├── AiSettingsPage.tsx
    │   ├── UserManagementPage.tsx
    │   ├── RoleManagementPage.tsx
    │   ├── ProductCatalogPage.tsx
    │   ├── LenderManagementPage.tsx
    │   ├── BranchSetupPage.tsx
    │   └── WorkflowConfigPage.tsx
    └── components/
        ├── RolePermissionMatrix.tsx
        └── WorkflowStageEditor.tsx
```

---

# 10. SHARED PACKAGE STRUCTURE

## 10.1 Package Overview

```
packages/
├── shared-types/
├── shared-validation/
├── shared-api/
├── shared-utils/
├── shared-constants/
├── shared-config/
└── shared-ui/
```

## 10.2 shared-types

**Purpose:** TypeScript interfaces and types for API contracts — no runtime code.

```
packages/shared-types/
├── src/
│   ├── index.ts
│   ├── api/
│   │   ├── common.ts                 # PaginatedResponse, ApiError
│   │   ├── auth.types.ts
│   │   ├── customer.types.ts
│   │   ├── lead.types.ts
│   │   ├── application.types.ts
│   │   └── ... (per domain)
│   ├── enums/
│   │   ├── user-type.enum.ts
│   │   ├── application-stage.enum.ts
│   │   ├── lead-status.enum.ts
│   │   └── document-status.enum.ts
│   └── entities/
│       └── ... (optional domain entities)
├── package.json
└── tsconfig.json
```

**Consumers:** backend (DTO mapping), admin, mobile-customer, mobile-dsa

## 10.3 shared-validation

**Purpose:** Zod schemas — single validation source for API and forms.

```
packages/shared-validation/
├── src/
│   ├── index.ts
│   ├── auth/
│   │   ├── send-otp.schema.ts
│   │   └── verify-otp.schema.ts
│   ├── customer/
│   ├── lead/
│   ├── application/
│   └── common/
│       ├── phone.schema.ts
│       ├── pagination.schema.ts
│       └── uuid.schema.ts
└── package.json
```

**Consumers:** backend validators, mobile forms (React Hook Form), admin forms

## 10.4 shared-api

**Purpose:** HTTP client, interceptors, token management.

```
packages/shared-api/
├── src/
│   ├── index.ts
│   ├── client/
│   │   ├── axios-client.ts
│   │   ├── create-api-client.ts
│   │   └── api-config.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts       # Attach Bearer token
│   │   ├── refresh.interceptor.ts    # 401 → refresh → retry
│   │   ├── error.interceptor.ts
│   │   └── request-id.interceptor.ts
│   ├── token/
│   │   ├── token-manager.ts
│   │   └── token-storage.interface.ts
│   ├── retry/
│   │   └── retry-strategy.ts
│   └── endpoints/
│       └── index.ts                  # Endpoint path constants
└── package.json
```

## 10.5 shared-utils

```
packages/shared-utils/
├── src/
│   ├── format/                       # currency, date, phone, percent
│   ├── mask/                         # PII masking for display
│   ├── parse/                        # phone normalize, amount parse
│   ├── calculate/                    # EMI, FOIR, LTV helpers
│   └── guards/                       # isUuid, isPhone
```

## 10.6 shared-constants

```
packages/shared-constants/
├── src/
│   ├── products.ts                   # HL-01, LAP-02, etc.
│   ├── los-stages.ts                 # S01–S09
│   ├── lead-status.ts
│   ├── permissions.ts                # Permission code constants
│   ├── routes.ts                     # API path constants
│   └── config-defaults.ts
```

## 10.7 shared-config

```
packages/shared-config/
├── src/
│   ├── env.schema.ts                 # Zod env validation
│   ├── app-config.ts
│   └── feature-flags.ts
```

## 10.8 shared-ui

```
packages/shared-ui/
├── src/
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   ├── web/                          # React components (admin)
│   │   └── ...
│   └── native/                       # React Native components
│       └── ...
```

---

# 11. DATABASE STRUCTURE

```
database/
├── package.json                      # @kuberone/database
├── src/
│   └── index.ts                      # Export PrismaClient
├── prisma/
│   ├── schema/
│   │   ├── schema.prisma             # Main datasource + generator
│   │   ├── identity.prisma
│   │   ├── customer.prisma
│   │   ├── partner.prisma
│   │   ├── organization.prisma
│   │   ├── product.prisma
│   │   ├── lms.prisma
│   │   ├── los.prisma
│   │   ├── product-extensions.prisma
│   │   ├── document.prisma
│   │   ├── kyc.prisma
│   │   ├── referral.prisma
│   │   ├── commission.prisma
│   │   ├── support.prisma
│   │   ├── communication.prisma
│   │   ├── campaign.prisma
│   │   ├── ai.prisma
│   │   ├── knowledge.prisma
│   │   ├── analytics.prisma
│   │   ├── audit.prisma
│   │   ├── settings.prisma
│   │   └── master-data.prisma
│   ├── migrations/
│   │   └── {timestamp}_{name}/
│   └── seeds/
│       ├── index.ts
│       ├── roles.seed.ts
│       ├── permissions.seed.ts
│       ├── products.seed.ts
│       ├── document-types.seed.ts
│       ├── lead-sources.seed.ts
│       ├── master-data.seed.ts
│       └── system-settings.seed.ts
├── scripts/
│   ├── migrate-deploy.sh
│   ├── seed-all.sh
│   ├── reset-dev.sh
│   └── generate-client.sh
└── backups/
    └── .gitkeep
```

| Script | Command | Purpose |
|--------|---------|---------|
| Migrate | `pnpm db:migrate` | Apply migrations |
| Seed | `pnpm db:seed` | Load master data |
| Studio | `pnpm db:studio` | Prisma Studio GUI |
| Generate | `prisma generate` | Regenerate client |

---

# 12. API CLIENT STRUCTURE

## 12.1 Client Architecture (shared-api)

```
┌─────────────────────────────────────────┐
│           Feature API Service            │
│  apps/*/src/services/api/customer.api.ts │
└────────────────────┬────────────────────┘
                     │ uses
┌────────────────────▼────────────────────┐
│         shared-api/createApiClient()     │
│  ┌─────────────────────────────────────┐│
│  │ Axios Instance                       ││
│  │  → auth interceptor (Bearer)         ││
│  │  → refresh interceptor (401 retry) ││
│  │  → error interceptor (normalize)    ││
│  │  → request-id interceptor           ││
│  └─────────────────────────────────────┘│
└────────────────────┬────────────────────┘
                     │
              KuberOne REST API
```

## 12.2 Token Management

| Platform | Storage | Refresh Strategy |
|----------|---------|------------------|
| **Mobile** | expo-secure-store | Body refresh token; rotate on 401 |
| **Admin (web)** | httpOnly cookie (refresh) + memory (access) | Silent refresh via interceptor |
| **Backend** | N/A | Issues tokens |

## 12.3 Error Handling

| Error Type | Handler |
|------------|---------|
| 400 Validation | Map `details[]` to form fields |
| 401 Unauthorized | Trigger refresh or redirect login |
| 403 Forbidden | Show permission denied toast |
| 404 Not Found | Navigate to 404 page |
| 422 Business | Show domain-specific message |
| 429 Rate Limit | Exponential backoff retry |
| 500 Server | Generic error + support link |

## 12.4 Retry Strategy

| Condition | Retries | Backoff |
|-----------|---------|---------|
| Network error | 3 | 1s, 2s, 4s |
| 429 Rate limit | 1 | Respect Retry-After header |
| 5xx Server | 2 | 2s, 4s |
| 4xx Client | 0 | No retry |

---

# 13. STATE MANAGEMENT STRUCTURE

## 13.1 Strategy by App

| App | Server State | Client State | Form State |
|-----|-------------|--------------|------------|
| **mobile-customer** | TanStack Query | Zustand | React Hook Form + Zod |
| **mobile-dsa** | TanStack Query | Zustand | React Hook Form + Zod |
| **admin** | TanStack Query + Redux (UI) | Redux slices | React Hook Form + Zod |

## 13.2 Redux Toolkit (Admin)

```
store/
├── index.ts
├── slices/
│   ├── auth.slice.ts           # user, roles, permissions, token
│   ├── ui.slice.ts             # sidebar collapsed, theme, modals
│   ├── sidebar.slice.ts        # active module, badges
│   └── copilot.slice.ts        # AI copilot open, context
├── selectors/
│   ├── auth.selectors.ts
│   └── permission.selectors.ts
└── middleware/
    └── logger.middleware.ts    # Dev only
```

## 13.3 Zustand (Mobile)

```
store/
├── auth.store.ts               # Persist: user, tokens
├── ui.store.ts                 # Transient UI state
└── wizard.store.ts             # Persist: application wizard progress
```

## 13.4 TanStack Query Caching

| Query Key Pattern | Stale Time | Cache Time |
|-------------------|------------|------------|
| `['products']` | 1 hour | 24 hours |
| `['dashboard']` | 30 seconds | 5 minutes |
| `['leads', filters]` | 0 | 5 minutes |
| `['application', id]` | 10 seconds | 30 minutes |
| `['notifications']` | 0 | 1 minute |

---

# 14. THEME SYSTEM

## 14.1 Design Token Structure

```
theme/
├── tokens/
│   ├── colors.ts
│   │   ├── primary: { 50–900 }
│   │   ├── secondary
│   │   ├── success, warning, error, info
│   │   ├── neutral: { 50–900 }
│   │   └── product: { hl, lap, bl, al }
│   ├── typography.ts
│   │   ├── fontFamily: { sans, mono }
│   │   ├── fontSize: { xs–4xl }
│   │   └── fontWeight
│   ├── spacing.ts                  # 4px base scale
│   ├── borderRadius.ts
│   ├── shadows.ts
│   └── breakpoints.ts              # Admin web only
│
├── components/
│   ├── button.ts                   # Variants: primary, secondary, ghost
│   ├── card.ts
│   ├── input.ts
│   ├── table.ts
│   └── chart.ts
│
└── icons/
    ├── icon-map.ts                 # Icon name → component
    └── sizes.ts
```

## 14.2 Component Categories

| Category | Mobile | Admin |
|----------|--------|-------|
| **Buttons** | shared-ui/native | shared-ui/web + shadcn |
| **Cards** | StatusCard, ProductCard | KpiCard, DataCard |
| **Forms** | OtpInput, CurrencyInput | FormField, Select |
| **Tables** | — | DataTable, Pagination |
| **Charts** | — | FunnelChart, LineChart |
| **Timeline** | ApplicationTimeline | LeadTimeline |

## 14.3 Brand Colors (Reference)

| Token | Usage |
|-------|-------|
| `primary.600` | CTAs, active nav |
| `primary.50` | Backgrounds |
| `success.500` | Verified, approved |
| `warning.500` | Pending, SLA warning |
| `error.500` | Rejected, deficient |
| `neutral.900` | Primary text |
| `neutral.500` | Secondary text |

---

# 15. ASSET MANAGEMENT

## 15.1 Asset Organization

| Asset Type | Location | Format | Optimization |
|------------|----------|--------|--------------|
| **App icons** | `assets/images/logo/` | PNG, SVG | @1x @2x @3x |
| **Product icons** | `assets/icons/product/` | SVG | Vector |
| **Onboarding** | `assets/images/onboarding/` | PNG/WebP | Compressed |
| **Empty states** | `assets/images/empty-states/` | SVG | — |
| **Fonts** | `assets/fonts/Inter/` | TTF/OTF | Subset |
| **Lottie** | `assets/animations/lottie/` | JSON | — |
| **Admin illustrations** | `admin/src/assets/images/` | SVG | — |

## 15.2 Document Assets

| Type | Storage | Access |
|------|---------|--------|
| User uploads | AWS S3 | Presigned URLs |
| Sanction letters | AWS S3 | Presigned download |
| Knowledge base PDFs | AWS S3 | RAG ingestion |
| Static templates | S3 `system/templates/` | API reference |

## 15.3 Naming Conventions

```
{category}/{name}.{variant}.{ext}
Examples:
  images/logo/kuberone-logo-dark.svg
  icons/product/home-loan.svg
  animations/lottie/success-check.json
```

---

# 16. ENVIRONMENT STRUCTURE

## 16.1 Environment Files

```
# Per app
apps/backend/.env.example
apps/admin/.env.example
apps/mobile-customer/.env.example
apps/mobile-dsa/.env.example

# Gitignored runtime
.env.local
.env.development.local
.env.test.local
```

## 16.2 Backend Environment Variables

| Variable | dev | uat | prod | Secret |
|----------|-----|-----|------|--------|
| NODE_ENV | development | uat | production | No |
| PORT | 4000 | 4000 | 4000 | No |
| DATABASE_URL | local | RDS UAT | RDS Prod | Yes |
| JWT_SECRET | dev-key | SSM | SSM | Yes |
| JWT_REFRESH_SECRET | dev-key | SSM | SSM | Yes |
| AWS_S3_BUCKET | dev bucket | uat bucket | prod bucket | No |
| AWS_ACCESS_KEY_ID | local | IAM role | IAM role | Yes |
| OPENAI_API_KEY | dev key | SSM | SSM | Yes |
| FCM_SERVER_KEY | dev | SSM | SSM | Yes |
| CORS_ORIGINS | localhost | uat domains | prod domains | No |

## 16.3 Mobile Environment (Expo)

| Variable | Prefix | Example |
|----------|--------|---------|
| API URL | EXPO_PUBLIC_ | EXPO_PUBLIC_API_URL |
| App env | EXPO_PUBLIC_ | EXPO_PUBLIC_APP_ENV |
| FCM sender | EXPO_PUBLIC_ | EXPO_PUBLIC_FCM_SENDER_ID |

## 16.4 Secrets Management

| Environment | Method |
|-------------|--------|
| Local dev | `.env.local` (gitignored) |
| CI/CD | GitHub Secrets |
| UAT/Prod EC2 | AWS SSM Parameter Store → PM2 env |
| Never | Commit secrets to repo |

---

# 17. TESTING STRUCTURE

## 17.1 Test Organization

```
# Backend
apps/backend/tests/
├── unit/
│   ├── services/
│   ├── utils/
│   └── validators/
├── integration/
│   ├── auth/
│   ├── leads/
│   └── applications/
├── fixtures/
│   ├── users.fixture.ts
│   └── leads.fixture.ts
└── setup.ts

# Admin
apps/admin/src/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   └── pages/
└── e2e/                              # Playwright
    ├── auth.spec.ts
    ├── leads.spec.ts
    └── applications.spec.ts

# Mobile
apps/mobile-customer/
├── __tests__/
│   ├── components/
│   └── hooks/
└── e2e/                              # Detox (Phase 2)
    └── auth.e2e.ts
```

## 17.2 Test Types

| Type | Tool | Location | Coverage Target |
|------|------|----------|-----------------|
| **Unit** | Vitest/Jest | `tests/unit/` | Services, utils 80% |
| **Integration** | Vitest + Supertest | `tests/integration/` | API routes 70% |
| **Component** | React Testing Library | `__tests__/` | Critical UI 60% |
| **E2E Web** | Playwright | `e2e/` | Critical paths |
| **E2E Mobile** | Detox | `e2e/` (Phase 2) | Auth, lead submit |
| **API contract** | OpenAPI diff | CI | Schema drift detection |

---

# 18. LOGGING STRUCTURE

## 18.1 Backend Logging

```
apps/backend/src/
├── shared/
│   └── logging/
│       ├── logger.ts                 # Winston/Pino instance
│       ├── request-logger.middleware.ts
│       └── formats/
│           ├── json.format.ts        # Production
│           └── pretty.format.ts      # Development
```

| Log Type | Level | Destination | Retention |
|----------|-------|-------------|-----------|
| **Application** | info, warn, error | stdout → PM2 logs | 30 days |
| **Access** | info | stdout + file | 90 days |
| **Audit** | info | MySQL audit_logs | 7 years |
| **Security** | warn, error | MySQL security_events | 3 years |
| **PII access** | info | MySQL access_logs | 3 years |

## 18.2 Log Format (JSON)

```json
{
  "timestamp": "ISO8601",
  "level": "info",
  "requestId": "uuid",
  "userId": "uuid",
  "module": "leads",
  "action": "create",
  "duration_ms": 45,
  "message": "Lead created",
  "metadata": {}
}
```

## 18.3 Client Logging

| App | Tool | Production |
|-----|------|------------|
| Mobile | Sentry + console | Sentry only |
| Admin | Sentry | Sentry only |
| Backend | Pino → PM2 | JSON to CloudWatch (Phase 2) |

---

# 19. DEPLOYMENT STRUCTURE

```
deployment/
├── nginx/
│   ├── nginx.conf                    # Main config
│   ├── sites-available/
│   │   ├── api.kuberone.conf         # API reverse proxy
│   │   ├── crm.kuberone.conf          # Admin static + API proxy
│   │   └── default.conf
│   ├── ssl/                          # Cert paths (not committed)
│   └── snippets/
│       ├── ssl-params.conf
│       ├── security-headers.conf
│       └── rate-limit.conf
│
├── pm2/
│   ├── ecosystem.config.js           # Main API process
│   ├── ecosystem.workers.config.js    # Background workers
│   └── ecosystem.uat.config.js
│
├── ec2/
│   ├── setup-server.sh               # Initial EC2 provisioning
│   ├── deploy-backend.sh
│   ├── deploy-admin.sh
│   └── health-check.sh
│
├── scripts/
│   ├── backup-db.sh
│   ├── restore-db.sh
│   └── rotate-logs.sh
│
└── monitoring/
    ├── cloudwatch-config.json        # Phase 2
    └── uptime-check.sh
```

## 19.1 Nginx Routing

| Domain | Upstream | Static |
|--------|----------|--------|
| `api.kuberone.kuberfinserve.com` | `localhost:4000` | — |
| `crm.kuberone.kuberfinserve.com` | `localhost:4000` (API) | `/var/www/admin` |
| `uat.api...` | UAT port | — |

## 19.2 PM2 Processes

| Process | Script | Instances |
|---------|--------|-----------|
| `kuberone-api` | `dist/server.js` | 2 (cluster) |
| `kuberone-workers` | `dist/workers/index.js` | 1 |
| `kuberone-jobs` | `dist/jobs/index.js` | 1 |

## 19.3 SSL

| Method | Tool |
|--------|------|
| Certificate | AWS ACM or Let's Encrypt |
| Renewal | Certbot auto-renew cron |
| Termination | Nginx |

## 19.4 Backups

| Asset | Frequency | Tool |
|-------|-----------|------|
| RDS MySQL | Daily automated | AWS RDS snapshot |
| S3 documents | Versioning enabled | S3 lifecycle |
| Application logs | Weekly archive | `deployment/scripts/rotate-logs.sh` |

---

# 20. FUTURE SCALABILITY

## 20.1 Extension Strategy (No Folder Restructure)

New products plug into **existing module folders** via extension pattern:

| Future Product | Backend Addition | Mobile Addition | Admin Addition |
|----------------|-----------------|-----------------|----------------|
| **Personal Loan** | `repositories/personal-loan-detail.repository.ts` | `features/loan-products/` (new variant) | `ProductDetailPanel` tab |
| **Insurance** | `modules/insurance/` (new module) | `features/insurance/` | `features/insurance/` |
| **Credit Cards** | `modules/credit-cards/` | `features/credit-cards/` | `features/credit-cards/` |
| **Mutual Funds** | `modules/wealth/mf/` | `features/wealth/` | `features/wealth/` |
| **FD** | `modules/fd/` | `features/fd/` | `features/fd/` |
| **Gold Loan** | `modules/gold-loan/` | `features/gold-loan/` | `features/gold-loan/` |
| **Video KYC** | `modules/kyc/video-kyc/` | `features/kyc/VideoKycScreen` | `features/compliance/VideoKycQueue` |
| **eSign** | `modules/documents/esign/` | `features/documents/EsignScreen` | existing documents |
| **Lender Portal** | `apps/lender-portal/` (new app) | — | — |

## 20.2 Scale-Out Paths (Phase 2–4)

| Component | Phase 2 | Phase 3 | Phase 4 |
|-----------|---------|---------|---------|
| API | PM2 cluster | Multiple EC2 + ALB | Extract AI service |
| Workers | Separate EC2 | SQS queue | Dedicated worker fleet |
| Database | Read replica | Partition logs | Warehouse export |
| Cache | Redis on EC2 | ElastiCache | ElastiCache cluster |
| Mobile | EAS Build | OTA updates | Feature flags |
| Admin | CDN static | CloudFront | Micro-frontend (optional) |

## 20.3 New App Addition Checklist

1. Create `apps/{new-app}/` following existing app template
2. Add to `pnpm-workspace.yaml`
3. Add CI workflow in `.github/workflows/`
4. Add deployment config in `deployment/`
5. Extend `shared-types` and `shared-validation` only — no app-to-app imports

---

# APPENDIX A: IMPORT ALIASES (TypeScript Paths)

| Alias | Path | Used In |
|-------|------|---------|
| `@kuberone/shared-types` | `packages/shared-types/src` | All |
| `@kuberone/shared-validation` | `packages/shared-validation/src` | All |
| `@kuberone/shared-api` | `packages/shared-api/src` | Frontends |
| `@kuberone/shared-utils` | `packages/shared-utils/src` | All |
| `@kuberone/shared-constants` | `packages/shared-constants/src` | All |
| `@kuberone/database` | `database/src` | Backend only |
| `@/` | `apps/admin/src` | Admin internal |
| `@/` | `apps/mobile-*/src` | Mobile internal |
| `@modules/` | `apps/backend/src/modules` | Backend internal |

---

# APPENDIX B: NAMING CONVENTIONS

| Element | Convention | Example |
|---------|------------|---------|
| Folders | kebab-case | `lead-submission/` |
| React components | PascalCase file | `LeadListScreen.tsx` |
| Hooks | camelCase, `use` prefix | `useLeadSubmit.ts` |
| Services | camelCase, `.service.ts` | `lead.service.ts` |
| API files | camelCase, `.api.ts` | `lead.api.ts` |
| Constants | SCREAMING_SNAKE | `MAX_FILE_SIZE_MB` |
| Redux slices | camelCase, `.slice.ts` | `auth.slice.ts` |
| Tests | `*.test.ts` or `*.spec.ts` | `lead.service.test.ts` |

---

# APPENDIX C: GIT BRANCH STRATEGY

| Branch | Purpose | Deploy |
|--------|---------|--------|
| `main` | Production | Prod EC2 |
| `release/*` | UAT staging | UAT EC2 |
| `develop` | Integration | Dev environment |
| `feature/*` | Feature work | — |
| `fix/*` | Bug fixes | — |

---

# APPENDIX D: DOCUMENT APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Head of Engineering | | | |
| CTO | | | |
| Mobile Lead | | | |
| DevOps Lead | | | |
| CEO / Managing Director | | | |

---

# APPENDIX E: REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | Kuber Finserve Engineering | Initial Folder Structure & Monorepo Architecture |

---

# APPENDIX F: RELATED DOCUMENT INDEX

| Document | Relationship |
|----------|-------------|
| [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md) | Technical architecture alignment |
| [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md) | API routes → backend modules |
| [KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md](./KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md) | Prisma schema files |
| [KUBERONE_SCREEN_PLANNING_AND_IA.md](./KUBERONE_SCREEN_PLANNING_AND_IA.md) | Screens → feature folders |
| [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) | Admin RoleGuard, middleware |

---

**© 2026 Kuber Finserve. Confidential — For Internal Engineering Use.**

*This document is the authoritative folder structure and monorepo blueprint for KuberOne. All repository scaffolding must conform to paths and conventions defined herein.*
