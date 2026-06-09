# KuberOne
## System Architecture Document (EAD)

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise Architecture Document (EAD)  
**Classification:** Board-Ready | Investor-Ready | CTO-Ready | Future Scale Ready  
**Version:** 1.0  
**Date:** June 2026  
**Related Documents:**
- [KUBERONE_VISION_AND_OBJECTIVES.md](./KUBERONE_VISION_AND_OBJECTIVES.md)
- [KUBERONE_USER_TYPES_AND_ROLES.md](./KUBERONE_USER_TYPES_AND_ROLES.md)
- [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md)
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md)
- [KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md](./KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md)
- [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md)
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
| **Scope** | Complete system architecture — mobile, admin, backend, AI, data, security, deployment |
| **Audience** | Board, CTO, Engineering, Security, DevOps, Product, Investors |
| **Status** | Master Technical Blueprint |

---

## Approved Technology Stack

| Layer | Technology |
|-------|------------|
| **Customer & DSA Mobile** | React Native, TypeScript, Expo |
| **Admin / CRM Panel** | React.js, TypeScript, Vite |
| **Backend API** | Node.js, Express.js, TypeScript |
| **Database** | MySQL |
| **ORM** | Prisma |
| **Object Storage** | AWS S3 |
| **Push Notifications** | Firebase Cloud Messaging (FCM) |
| **Messaging** | WhatsApp Business API |
| **AI (Text)** | OpenAI GPT + RAG Architecture |
| **Voice AI** | OpenAI Realtime API, Deepgram, ElevenLabs |
| **Deployment** | Ubuntu Server, AWS EC2, PM2, Nginx |
| **Containerization** | None (No Docker) |

---

# 32. EXECUTIVE SUMMARY

*Board-level technical summary — presented first.*

## Why This Architecture

KuberOne requires an architecture that simultaneously supports **multi-channel financial distribution** (customer app, DSA network, internal CRM), **AI-native intelligence** (advisor, copilot, voice, RAG), and **regulated data handling** (KYC, documents, commissions)—while remaining **cost-efficient** and **operationally simple** for a growth-stage fintech.

The chosen stack—**TypeScript end-to-end**, **modular Node.js monolith evolving to services**, **MySQL + Prisma**, **AWS S3**, **OpenAI + RAG**—balances:

- **Speed to market** — Single language (TypeScript) across mobile, web, and API
- **Team efficiency** — Prisma accelerates data modeling; Expo accelerates mobile delivery
- **Proven fintech patterns** — REST API, RBAC middleware, event-driven notifications
- **AI differentiation** — RAG over lender/product policies; copilot for sales; voice for engagement
- **Operational simplicity** — PM2 + Nginx on EC2 without Docker overhead for initial scale

## Architecture Benefits

| Benefit | How Architecture Delivers |
|---------|----------------------------|
| **Unified platform** | One API serves Customer App, DSA App, CRM, LOS, LMS |
| **Role-safe by design** | RBAC middleware at API layer per KUBERONE_RBAC_AND_PERMISSIONS.md |
| **AI at core** | Dedicated AI layer—not bolted-on chatbot |
| **Document compliance** | S3 + versioning + audit + OCR pipeline |
| **Partner scale** | Isolated partner tenancy in data and API scope |
| **Lender-ready** | Integration adapter pattern for future lender APIs |

## Scalability Posture

| Phase | Scale Target | Architecture Response |
|-------|-------------|----------------------|
| **Phase 1 (Launch)** | 10K users, 50K leads/year | Single EC2 app server + RDS MySQL + S3 |
| **Phase 2 (Growth)** | 100K users, 500K leads/year | Read replica, Redis cache, separate worker EC2 |
| **Phase 3 (Scale)** | 1M+ users | API horizontal scaling (multiple EC2 + load balancer), AI queue workers |
| **Phase 4 (Platform)** | Multi-product national | Extract high-load modules (notifications, AI, analytics) to dedicated services |

## Security Posture

- Encryption in transit (TLS 1.3) and at rest (S3 SSE, MySQL encryption)
- JWT + refresh token with role/scope claims
- RBAC enforcement at middleware layer (default deny)
- PII field masking in API responses by role
- Enhanced audit logging for document and PII access
- Rate limiting, input validation, WAF-ready Nginx configuration

## Cost Optimization

| Decision | Cost Benefit |
|----------|-------------|
| Modular monolith (not microservices day 1) | Single deployment unit; lower DevOps cost |
| MySQL on RDS (not multiple DB engines) | One database skill set; predictable licensing |
| S3 for documents (not DB blobs) | Cheaper storage; better performance |
| OpenAI API (not self-hosted LLM) | No GPU infrastructure; pay-per-use |
| PM2 on EC2 (not Kubernetes) | No orchestration complexity for Phase 1–2 |
| Expo (not native dual codebase) | One mobile codebase for iOS + Android |

## Future Readiness

- **Product modules** plug into LOS/LMS without architecture redesign
- **Lender integration adapter** interface defined for API portal expansion
- **RAG knowledge base** extensible per product (insurance, cards, MF policies)
- **Voice AI** channel-agnostic (callable from app, CRM, outbound campaigns)
- **Analytics layer** designed for warehouse export (future Redshift/BigQuery)

**Board Recommendation:** Approve this architecture as the master technical blueprint for all KuberOne engineering investment.

---

# 1. EXECUTIVE ARCHITECTURE OVERVIEW

## 1.1 Business Goals (Technology Enablement)

| Business Goal | Architectural Enabler |
|---------------|----------------------|
| Omnichannel customer acquisition | Customer App + WhatsApp + AI Advisor |
| DSA partner network scale | DSA App + Commission Engine + partner-isolated API scope |
| Lead-to-disbursement efficiency | LMS + LOS + Workflow Engine |
| AI-driven conversion improvement | AI Sales Copilot + Eligibility Engine + lead scoring |
| Multi-product lending | Modular product architecture on shared LOS |
| Management visibility | Analytics Platform + executive dashboards |
| Regulatory compliance | Audit layer + document governance + RBAC |

## 1.2 Technology Goals

| # | Goal | Target |
|---|------|--------|
| TG-01 | API response time (P95) | <300ms for standard CRUD |
| TG-02 | Mobile app cold start | <3 seconds |
| TG-03 | System availability | 99.9% uptime (Phase 1) |
| TG-04 | Document upload success | 99.5% |
| TG-05 | AI advisor response latency | <5 seconds (RAG query) |
| TG-06 | Notification delivery | <30 seconds (event to push/WhatsApp) |
| TG-07 | Codebase uniformity | 100% TypeScript across all application layers |
| TG-08 | Test coverage (critical paths) | 80%+ on auth, RBAC, commission, LOS transitions |

## 1.3 Scalability Goals

| Dimension | Phase 1 | Phase 3 |
|-----------|---------|---------|
| Concurrent API users | 500 | 10,000 |
| Daily lead ingestion | 500 | 10,000 |
| Document storage | 100 GB | 10 TB |
| DSA partners | 500 | 50,000 |
| Branches | 10 | 500 |
| AI queries/day | 1,000 | 100,000 |

## 1.4 Security Goals

| # | Goal |
|---|------|
| SG-01 | Zero unauthorized cross-tenant data access |
| SG-02 | 100% API endpoints protected by authentication |
| SG-03 | 100% mutating endpoints protected by RBAC |
| SG-04 | All document access audit-logged |
| SG-05 | PII encrypted at rest and in transit |
| SG-06 | SOC 2 readiness path documented |
| SG-07 | Incident response <1 hour detection target |

## 1.5 AI Goals

| # | Goal | Architecture |
|---|------|--------------|
| AG-01 | Product recommendation accuracy | RAG + eligibility rules fusion |
| AG-02 | Sales copilot adoption | Embedded in CRM with context injection |
| AG-03 | Document OCR automation | AI document intelligence pipeline |
| AG-04 | Voice engagement | OpenAI Realtime + Deepgram + ElevenLabs pipeline |
| AG-05 | Knowledge freshness | RAG re-indexing on policy updates |
| AG-06 | AI governance | Prompt audit, human-in-the-loop for credit-adjacent outputs |

## 1.6 Future Expansion Goals

| Product | Architecture Extension |
|---------|----------------------|
| Personal Loan | New product module in LOS + eligibility rules |
| Insurance | New catalog + referral commission type |
| Credit Cards | Lender adapter + application subtype |
| Mutual Funds | RM-certified module + RAG policy docs |
| Video KYC | Integration adapter + document module extension |
| eSign | Third-party integration service |
| Lender APIs | Integration gateway with adapter pattern |

---

# 2. HIGH LEVEL SYSTEM ARCHITECTURE

## 2.1 Ecosystem Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              KUBERONE ECOSYSTEM                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  PRESENTATION LAYER                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────────────────┐ │
│  │ Customer App │  │   DSA App    │  │  Admin Panel (CRM / Analytics / Mgmt)     │ │
│  │ RN + Expo    │  │  RN + Expo   │  │  React + Vite + TypeScript                │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┬───────────────────────┘ │
├─────────┼─────────────────┼─────────────────────────────┼─────────────────────────┤
│         │                 │         API GATEWAY (Nginx) │                          │
│         └─────────────────┼─────────────────────────────┘                          │
│                           ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                    BACKEND API LAYER (Node.js + Express + TS)                │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │    │
│  │  │  Auth   │ │  RBAC   │ │  LMS    │ │  LOS    │ │  CRM    │ │ Partner │  │    │
│  │  │ Module  │ │Middleware│ │ Module  │ │ Module  │ │ Module  │ │ Module  │  │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │    │
│  │  │Document │ │Workflow │ │Referral │ │Commission│ │Support  │ │Campaign │  │    │
│  │  │ Module  │ │ Engine  │ │ Engine  │ │ Engine  │ │ Module  │ │ Module  │  │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                            │    │
│  │  │Analytics│ │Knowledge│ │ Notif.  │ │  Audit  │                            │    │
│  │  │ Module  │ │  Base   │ │ Engine  │ │  Layer  │                            │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘                            │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  AI LAYER                                                                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │
│  │  AI Advisor  │ │Sales Copilot │ │  RAG Engine  │ │  Voice AI    │               │
│  │  (Customer)  │ │  (Internal)  │ │  (Knowledge) │ │  Gateway     │               │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘               │
│         └────────────────┼────────────────┼────────────────┘                          │
│                          ▼                ▼                                           │
│                    OpenAI GPT API    Vector Store (MySQL + embedding cache)          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  DATA LAYER                                                                          │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐             │
│  │   MySQL (Prisma)   │  │     AWS S3         │  │   Redis (Phase 2)  │             │
│  │   Primary + Replica│  │   Documents/Media  │  │   Cache + Sessions │             │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  ANALYTICS LAYER (Phase 2+)                                                          │
│  ┌────────────────────┐  ┌────────────────────┐                                     │
│  │  Analytics DB      │  │  Report Generator  │                                     │
│  │  (Read-optimized)  │  │  (Scheduled jobs)  │                                     │
│  └────────────────────┘  └────────────────────┘                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  EXTERNAL INTEGRATIONS                                                               │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│  │OpenAI  │ │WhatsApp│ │Firebase│ │  SMS   │ │ Email  │ │ Credit │ │ Lender │  │
│  │  API   │ │Business│ │  FCM   │ │Gateway │ │Provider│ │ Bureau │ │ APIs   │  │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘  │
│  │Deepgram│ │ElevenLabs│ Future                                                  │
│  └────────┘ └────────┘                                                              │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Request Flow (Simplified)

```
Client → Nginx (SSL termination, rate limit, static assets)
      → Express API (auth middleware → RBAC middleware → controller)
      → Service Layer (business logic)
      → Repository Layer (Prisma → MySQL)
      → Response (field masking by role)

Async: Service → Event Bus (in-process Phase 1) → Notification Worker / AI Worker
```

## 2.3 Deployment Topology (Phase 1)

```
                    Internet
                       │
                  ┌────▼────┐
                  │ Route53 │ (DNS)
                  └────┬────┘
                       │
              ┌────────▼────────┐
              │  AWS EC2 (App)  │
              │  Ubuntu + Nginx │
              │  PM2 (Node API) │
              │  PM2 (Workers)  │
              └────────┬────────┘
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │ RDS MySQL│ │  AWS S3  │ │ External │
   │ Primary  │ │ Buckets  │ │   APIs   │
   └──────────┘ └──────────┘ └──────────┘
```

## 2.4 Communication Patterns

| Pattern | Usage |
|---------|-------|
| **Synchronous REST** | Mobile/Admin ↔ API (CRUD, queries) |
| **Async in-process events** | Notification triggers, commission calculation, workflow transitions |
| **Webhook inbound** | WhatsApp, future lender status callbacks |
| **Webhook outbound** | Partner systems (future corporate integrations) |
| **Polling** | Mobile status check fallback |
| **WebSocket (Phase 2)** | Real-time dashboard updates, AI streaming responses |
| **SSE** | AI Advisor streaming text responses |

## 2.5 Layer Responsibilities

| Layer | Responsibility | Technology |
|-------|---------------|------------|
| Presentation | UX, offline cache, biometric auth | React Native / React |
| API Gateway | SSL, routing, rate limit, CORS | Nginx |
| Application | Business logic, orchestration | Node.js + Express |
| AI | Inference, RAG, voice orchestration | OpenAI + custom AI services |
| Data | Persistence, transactions | MySQL + Prisma |
| Storage | Binary documents, media | AWS S3 |
| Integration | External service adapters | Integration module |
| Observability | Logs, metrics, alerts | PM2 + CloudWatch (or equivalent) |

---

# 3. PLATFORM COMPONENTS

## 3.1 Component Registry

| Component ID | Component Name | Primary Users | Backend Module(s) |
|--------------|---------------|---------------|-------------------|
| PC-01 | Customer Platform | Customer | Customer, Loan, Document, AI Advisor |
| PC-02 | Partner Platform | DSA, Referral | Partner, Lead, Commission, Referral |
| PC-03 | CRM Platform | Sales, RM, Managers | Lead, Customer, CRM, Support |
| PC-04 | LOS Platform | Credit, Ops, Sales | Loan, Eligibility, Workflow, Document |
| PC-05 | LMS Platform | Sales, DSA, System | Lead, Campaign, Analytics |
| PC-06 | AI Platform | All (role-scoped) | AI Advisor, Copilot, RAG |
| PC-07 | Voice Platform | Customer, Sales | Voice AI Gateway |
| PC-08 | Analytics Platform | Management, Managers | Analytics |
| PC-09 | Knowledge Platform | All internal + AI | Knowledge Base, RAG |

## 3.2 Customer Platform

| Capability | App Module | API Domain |
|------------|-----------|------------|
| Registration / OTP login | Auth | `/api/v1/auth` |
| Product discovery | Products | `/api/v1/products` |
| AI Advisor chat | AI Advisor | `/api/v1/ai/advisor` |
| Eligibility check | Eligibility | `/api/v1/eligibility` |
| Application creation | Loans | `/api/v1/applications` |
| Document upload | Documents | `/api/v1/documents` |
| Status tracking | Applications | `/api/v1/applications` |
| Referrals | Referrals | `/api/v1/referrals` |
| Support tickets | Support | `/api/v1/tickets` |
| Notifications | Notifications | `/api/v1/notifications` |
| Privacy controls | Customer | `/api/v1/customer/privacy` |

## 3.3 Partner Platform (DSA App)

| Capability | API Domain |
|------------|------------|
| Partner onboarding / KYC | `/api/v1/partners` |
| Lead submission | `/api/v1/dsa/leads` |
| Lead pipeline tracking | `/api/v1/dsa/leads` |
| Document assist upload | `/api/v1/dsa/documents` |
| Commission dashboard | `/api/v1/dsa/commissions` |
| Training modules | `/api/v1/knowledge` |
| Payout statements | `/api/v1/dsa/payouts` |
| Dispute raise | `/api/v1/dsa/disputes` |

## 3.4 CRM Platform (Admin Panel)

| Capability | Panel Module |
|------------|-------------|
| Lead queue management | CRM → Leads |
| Application processing | CRM → Applications |
| Customer 360 view | CRM → Customers |
| Partner management | CRM → Partners |
| Branch dashboard | CRM → Branch |
| Executive performance | CRM → Team |
| AI Sales Copilot sidebar | CRM → Copilot |
| Support ticket console | CRM → Support |

## 3.5 LOS Platform

| Stage | System Component |
|-------|-----------------|
| Application creation | Loan Module + Workflow Engine |
| Document gate | Document Module + Eligibility Module |
| Credit review | Loan Module + AI Copilot (assist) |
| Lender submission | Loan Module + Integration Adapter |
| Sanction / disbursement | Loan Module + Commission Engine trigger |
| Closure | Loan Module + RM assignment trigger |

## 3.6 LMS Platform

| Capability | Component |
|------------|-----------|
| Multi-channel capture | Lead Module + Campaign Module |
| Deduplication | Lead Module (rules engine) |
| Scoring | Lead Module + AI Copilot |
| Assignment | Lead Module + Workflow Engine |
| SLA tracking | Workflow Engine + Notification Engine |
| Conversion analytics | Analytics Module |

## 3.7 AI Platform

| Service | Consumer | Model |
|---------|----------|-------|
| AI Advisor | Customer App, WhatsApp | GPT + RAG |
| AI Sales Copilot | CRM Panel | GPT + CRM context |
| Document OCR/Extract | Document Module | GPT Vision / dedicated OCR |
| Lead scoring assist | LMS | GPT + structured features |
| Eligibility narrative | Customer, Sales | GPT + rules engine output |
| Voice assistant | Customer App, outbound | Realtime API + Deepgram + ElevenLabs |

## 3.8 Voice Platform

| Function | Provider |
|----------|----------|
| Speech-to-text (batch) | Deepgram |
| Speech-to-text (realtime) | OpenAI Realtime / Deepgram streaming |
| LLM reasoning | OpenAI GPT / Realtime |
| Text-to-speech | ElevenLabs |
| Session management | Voice AI Gateway (internal) |
| Call scheduling | Workflow + Notification |

## 3.9 Analytics Platform

| Dashboard Type | Data Source |
|----------------|-------------|
| Operational | MySQL operational tables (aggregated queries) |
| Revenue | Commission Engine + disbursement data |
| Executive | Materialized summary tables (Phase 2) |
| Partner | Partner + lead + commission joins |
| AI | AI request logs + outcome correlation |

## 3.10 Knowledge Platform

| Content Type | Storage | RAG Index |
|--------------|---------|-----------|
| Product policies | MySQL + S3 source docs | Vector embeddings |
| Lender policies | MySQL + S3 | Vector embeddings |
| FAQs | MySQL CMS | Vector embeddings |
| SOPs | S3 PDFs | Vector embeddings |
| Training content | MySQL | Selective index |

---

# 4. MOBILE APP ARCHITECTURE

## 4.1 Application Split Strategy

| App | Bundle ID | Primary Users | Distinct Modules |
|-----|-----------|---------------|------------------|
| **KuberOne Customer** | `com.kuberfinserve.customer` | Customers | AI Advisor, applications, referrals, credit health |
| **KuberOne DSA** | `com.kuberfinserve.dsa` | DSA Partners | Lead submit, commission, training, leaderboard |

**Shared:** Authentication primitives, API client, UI design system, document upload, notification handling.

## 4.2 Shared Modules (Monorepo Packages)

```
packages/
├── shared-types/        # TypeScript interfaces (API contracts)
├── shared-api/          # Axios client, interceptors, token refresh
├── shared-ui/           # Design system components
├── shared-auth/         # OTP flow, token storage, biometric
├── shared-documents/    # Upload, compression, progress
├── shared-notifications/# FCM registration, deep links
└── shared-utils/        # Formatting, validation helpers
```

## 4.3 Customer App Architecture

```
app/
├── navigation/          # React Navigation (stack + tab)
├── screens/
│   ├── auth/            # OTP login, registration
│   ├── home/            # Dashboard, status cards
│   ├── products/        # Catalog, eligibility
│   ├── application/     # Multi-step application wizard
│   ├── documents/       # Upload checklist
│   ├── ai-advisor/      # Chat interface (SSE stream)
│   ├── referrals/       # Referral program
│   ├── support/         # Tickets
│   └── profile/         # Settings, privacy, consent
├── store/               # State management
├── services/            # API service wrappers
└── hooks/               # Custom hooks
```

## 4.4 DSA App Architecture

```
app/
├── navigation/
├── screens/
│   ├── auth/            # Partner login + KYC status gate
│   ├── dashboard/       # Pipeline, commission summary
│   ├── leads/           # Create, list, track leads
│   ├── documents/       # Assist customer doc upload
│   ├── commissions/     # Earnings, payouts, disputes
│   ├── training/        # Certification modules
│   ├── campaigns/       # Active offers
│   └── profile/         # Partner profile, agreement
├── store/
└── services/
```

## 4.5 State Management

| Layer | Technology | Scope |
|-------|------------|-------|
| **Server state** | TanStack Query (React Query) | API data, caching, refetch |
| **Client state** | Zustand | Auth session, UI state, wizard progress |
| **Form state** | React Hook Form + Zod | Application forms, validation |
| **Offline queue** | Zustand + AsyncStorage | Pending uploads, draft applications |

**Rationale:** TanStack Query handles cache invalidation on status changes; Zustand keeps bundle light vs. Redux.

## 4.6 Navigation Architecture

| Pattern | Usage |
|---------|-------|
| **Root navigator** | Auth stack vs. Main app (token check) |
| **Bottom tabs** | Home, Products, Applications, Profile (Customer) |
| **Bottom tabs** | Dashboard, Leads, Commissions, More (DSA) |
| **Stack navigators** | Deep flows (application wizard, document upload) |
| **Deep linking** | Notification tap → specific application/status |
| **Universal links** | Referral links → app install / registration |

## 4.7 Offline Strategy

| Feature | Offline Behavior |
|---------|-----------------|
| View cached applications | ✓ (TanStack Query persist) |
| View downloaded documents | ✓ (local secure cache) |
| Create draft application | ✓ (local storage) |
| Submit application | ✗ (requires network; queue for retry) |
| Upload documents | Queue locally; retry on reconnect |
| AI Advisor | ✗ (show offline message + cached FAQs) |
| OTP login | ✗ (requires network) |

## 4.8 Caching Strategy

| Data Type | Cache Duration | Invalidation |
|-----------|---------------|--------------|
| Product catalog | 24 hours | Manual pull-to-refresh |
| Application status | 5 minutes | Push notification / focus refresh |
| User profile | Session | On login/logout |
| Document list | 10 minutes | On upload |
| Commission summary (DSA) | 15 minutes | On disbursement notification |
| Knowledge/FAQs | 7 days | Version bump |

## 4.9 Authentication Flow (Mobile)

```
1. User enters mobile → POST /auth/otp/send
2. User enters OTP → POST /auth/otp/verify
3. API returns access_token (JWT, 24hr) + refresh_token (7d)
4. Tokens stored in Expo SecureStore
5. API client attaches Bearer token
6. On 401 → refresh token flow → retry
7. Optional: biometric unlock (local auth to access stored token)
8. DSA: additional KYC/agreement gate before lead submission
```

## 4.10 Mobile Security

| Control | Implementation |
|---------|---------------|
| Certificate pinning | Expo network security config |
| Secure token storage | Expo SecureStore |
| Screenshot prevention | Sensitive screens (documents, KYC) |
| Root/jailbreak detection | Warning + restricted mode |
| Biometric gate | Optional app unlock |
| Deep link validation | Signed referral parameters |

---

# 5. ADMIN PANEL ARCHITECTURE

## 5.1 Panel Structure

Single **React + Vite** SPA with role-based route guards:

```
admin-panel/
├── src/
│   ├── app/                 # Root, providers, router
│   ├── layouts/
│   │   ├── CrmLayout        # Sales, RM, Credit, Ops
│   │   ├── ManagerLayout    # Branch, Regional
│   │   ├── AdminLayout      # Admin, Super Admin
│   │   ├── SupportLayout    # Support team
│   │   ├── ComplianceLayout/# Compliance team
│   │   └── ExecutiveLayout  # Management dashboards
│   ├── modules/
│   │   ├── crm/             # Leads, applications, customers
│   │   ├── partners/        # DSA, referral management
│   │   ├── processing/      # Credit queue, ops queue
│   │   ├── branch/          # Branch dashboard
│   │   ├── regional/        # Regional dashboard
│   │   ├── support/         # Ticket console
│   │   ├── compliance/      # Audit, fraud
│   │   ├── admin/           # Users, products, campaigns
│   │   ├── analytics/       # Reports, charts
│   │   ├── executive/       # Management KPIs
│   │   └── settings/        # System settings
│   ├── components/          # Shared UI (tables, forms, charts)
│   ├── hooks/               # useAuth, usePermission, useRole
│   ├── services/            # API clients per domain
│   └── store/               # Zustand (auth, UI preferences)
```

## 5.2 CRM Dashboard Module

| View | Roles | Key Widgets |
|------|-------|-------------|
| Lead queue | Sales, Branch Mgr | Priority queue, SLA alerts, AI copilot panel |
| Application list | Sales, Credit, Ops | Status filters, assignment, bulk actions |
| Customer 360 | Sales, RM, Branch | Profile, history, documents, communications |
| Partner list | Branch, Regional | Activation, performance, disputes |
| Team performance | Branch Mgr | Executive cards, conversion, activity |

## 5.3 Analytics Dashboard Module

| View | Roles | Charts |
|------|-------|--------|
| Funnel analytics | Branch, Regional, Management | Lead → disbursement funnel |
| Revenue dashboard | Finance, Management | Commission, disbursement value |
| Partner analytics | Sales Head, Branch | DSA contribution, tier distribution |
| Operations TAT | Ops Head, Credit | Stage-wise TAT, SLA heatmap |
| AI utilization | Admin, Management | Query volume, adoption, outcomes |

## 5.4 Management Dashboard Module

| View | Roles |
|------|-------|
| Executive KPI summary | CEO, Directors, Heads |
| Board report pack viewer | CEO, Finance |
| Forecast / scenario | Business Head, CEO |
| Compliance summary | CEO, Ops Head |
| Regional comparison | Sales Head, CEO |

## 5.5 Role Management Module (Admin)

| Capability | Role |
|------------|------|
| User CRUD | Admin |
| Role assignment | Admin |
| Branch/region assignment | Admin |
| Partner activation | Admin, Branch Mgr |
| RBAC matrix view | Super Admin |
| RBAC matrix edit | Super Admin only |

## 5.6 Settings Module

| Setting Category | Editor Role |
|------------------|-------------|
| SLA configuration | Admin |
| Notification templates | Admin |
| Product catalog | Admin |
| Lender policies | Admin |
| Commission rules | Admin + Finance approval |
| Workflow definitions | Admin |
| AI prompts (non-security) | Admin |
| Security policies | Super Admin |

## 5.7 Reporting Module

| Feature | Implementation |
|---------|---------------|
| On-demand reports | API → table/chart render → CSV/PDF export |
| Scheduled reports | Backend cron → email delivery |
| Report permissions | Per KUBERONE_RBAC report matrix |
| Drill-down | Role-scoped navigation to detail views |

## 5.8 Admin Panel Technical Patterns

| Pattern | Choice |
|---------|--------|
| Routing | React Router v6 with lazy-loaded modules |
| Permission guard | `<RequirePermission resource action>` wrapper |
| Data tables | TanStack Table + server-side pagination |
| Charts | Recharts or Chart.js |
| Forms | React Hook Form + Zod |
| API state | TanStack Query |
| Auth | SSO redirect (employees) + JWT in httpOnly cookie or secure storage |
| Real-time (Phase 2) | WebSocket for SLA alerts, queue updates |

---

# 6. BACKEND ARCHITECTURE

## 6.1 Architectural Style

**Modular Monolith** — Single Node.js deployable unit with clearly bounded modules. Extract to services only when scale demands (notifications, AI workers Phase 2+).

```
backend/
├── src/
│   ├── app.ts                 # Express app bootstrap
│   ├── server.ts              # HTTP server + PM2 entry
│   ├── config/                # Environment configuration
│   ├── modules/               # Feature modules (see Section 7)
│   ├── shared/
│   │   ├── middleware/        # Auth, RBAC, audit, validation, rate limit
│   │   ├── errors/            # Error classes, handler
│   │   ├── events/            # In-process event emitter
│   │   ├── utils/             # Helpers
│   │   └── types/             # Shared TypeScript types
│   ├── integrations/          # External service adapters
│   ├── workers/               # Background job processors (PM2 separate process)
│   └── prisma/                # Prisma schema + migrations
```

## 6.2 Layered Architecture

```
Request
   ↓
┌─────────────────────────────────────────┐
│ Middleware Layer                         │
│  Rate Limit → Auth → RBAC → Audit Start │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ Controller Layer                         │
│  HTTP handling, request parsing, response│
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ Validation Layer (Zod schemas)           │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ Service Layer                            │
│  Business logic, orchestration, events   │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ Repository Layer (Prisma)                │
│  Data access, transactions, queries      │
└─────────────────┬───────────────────────┘
                  ↓
              MySQL / S3
                  ↓
┌─────────────────────────────────────────┐
│ Audit Layer (on response / mutation)     │
└─────────────────────────────────────────┘
```

## 6.3 Controller Layer

| Responsibility | Rules |
|----------------|-------|
| Parse HTTP request | Params, query, body |
| Invoke validation | Zod schema validation |
| Call service method | No business logic in controller |
| Map to HTTP response | Standard response envelope |
| Handle errors | Delegate to global error handler |
| No direct Prisma access | Always through service/repository |

## 6.4 Service Layer

| Responsibility | Rules |
|----------------|-------|
| Business logic | All domain rules |
| Transaction boundaries | Prisma `$transaction` for multi-table ops |
| Event emission | Publish domain events (lead.assigned, disbursement.confirmed) |
| Integration calls | Via adapter interfaces |
| RBAC scope enforcement | Verify scope before operations |
| Idempotency | Commission calc, notification send |

## 6.5 Repository Layer

| Responsibility | Rules |
|----------------|-------|
| Prisma queries | CRUD, complex joins |
| Query optimization | Indexed fields, pagination |
| Data mapping | Entity ↔ DTO |
| No business logic | Pure data access |
| Soft deletes | `deletedAt` pattern where applicable |

## 6.6 Middleware Layer

| Middleware | Order | Function |
|------------|-------|----------|
| `requestId` | 1 | Correlation ID for tracing |
| `rateLimiter` | 2 | Per-IP and per-user limits |
| `cors` | 3 | Allowed origins |
| `bodyParser` | 4 | JSON parsing (size limits) |
| `authenticate` | 5 | JWT validation, user context |
| `authorize` | 6 | RBAC permission check |
| `auditContext` | 7 | Attach audit metadata |
| `errorHandler` | Last | Global error formatting |

## 6.7 Validation Layer

| Approach | Technology |
|----------|------------|
| Request validation | Zod schemas per endpoint |
| Shared schemas | `packages/shared-types` validation schemas |
| Sanitization | Strip HTML, trim strings, normalize phone |
| File validation | MIME type, size, extension whitelist |
| Business validation | Service layer (eligibility, state transitions) |

## 6.8 Authentication Layer

| Function | Detail |
|----------|--------|
| OTP generation | 6-digit, 5-min expiry, rate limited |
| JWT access token | 24hr (customer), 8hr (employee) |
| Refresh token | Rotating, stored hashed in DB |
| SSO integration | SAML/OAuth for employees (Phase 1.5) |
| Token claims | `userId`, `role`, `branchId`, `regionId`, `permissions[]` |

## 6.9 Authorization Layer

| Function | Detail |
|----------|--------|
| Permission resolver | Load role permissions from cache |
| Scope filter | Apply own/assigned/branch/region filter to queries |
| Field masker | Remove/mask PII fields per role in response |
| SoD checker | Block violating action pairs |
| Resource ownership | Verify assignee/branch before mutation |

## 6.10 Audit Layer

| Trigger | Log Level |
|---------|-----------|
| Any mutation on critical resource | Standard |
| PII field access | Enhanced |
| Document download | Enhanced |
| Permission denied | Standard |
| Auth failure | Standard |
| Super Admin action | Maximum |

## 6.11 Background Workers (PM2 Separate Processes)

| Worker | Responsibility |
|--------|---------------|
| `notification-worker` | FCM, SMS, email, WhatsApp dispatch |
| `commission-worker` | Commission calculation, payout batch |
| `ai-worker` | Async AI jobs (OCR, batch scoring) |
| `report-worker` | Scheduled report generation |
| `workflow-worker` | SLA checks, escalations, timers |

---

# 7. MODULE ARCHITECTURE

## 7.1 Module Overview

| Module | Primary Responsibility | Key Dependencies |
|--------|----------------------|------------------|
| Authentication | OTP, JWT, SSO, sessions | User |
| User | Internal user management | Auth, RBAC |
| Customer | Customer profiles, consent | Auth, Document |
| Partner | DSA/referral partner lifecycle | Auth, Commission |
| Lead | LMS — capture, score, assign | Campaign, Workflow, AI |
| Loan | LOS — applications, stages | Eligibility, Document, Workflow, Commission |
| Eligibility | Rule engine + AI assist | Loan, Product |
| EMI | Calculator, schedule display | Loan |
| Document | Upload, OCR, verify, store | S3, AI |
| Referral | Referral tracking, rewards | Lead, Commission |
| Commission | Calculate, approve, payout | Loan, Partner |
| Notification | Multi-channel dispatch | Event bus, FCM, WhatsApp |
| Campaign | Marketing attribution | Lead |
| Support | Ticket management | Customer, Notification |
| Knowledge Base | Content CMS | RAG |
| Analytics | Aggregations, reports | All modules (read) |

## 7.2 Authentication Module

```
auth/
├── controllers/     # login, otp, refresh, logout, sso
├── services/        # OtpService, TokenService, SessionService
├── repositories/    # SessionRepository, OtpRepository
├── validators/      # phone, otp schemas
└── events/            # user.logged_in, session.revoked
```

**Key flows:** OTP send/verify, JWT issue/refresh, employee SSO callback, partner KYC gate.

## 7.3 User Module

Internal employee and admin user management. Provisions roles, branch/region assignment, MFA status. Does not manage customer or partner identities (separate modules).

## 7.4 Customer Module

Customer profile, consent records, privacy preferences, data export requests. Links to applications, documents, referrals. DPDP compliance endpoints.

## 7.5 Partner Module

DSA and referral partner onboarding, KYC, agreement status, tier management, certification tracking. Partner-scoped API namespace (`/dsa/*`, `/referral/*`).

## 7.6 Lead Module (LMS)

| Sub-component | Function |
|---------------|----------|
| LeadCapture | Multi-channel ingestion |
| LeadDedup | Phone/email deduplication |
| LeadScoring | Rules + AI assist |
| LeadAssignment | Auto-assign + manual override |
| LeadNurture | Status tracking, SLA |
| LeadConversion | Lead → application linkage |

## 7.7 Loan Module (LOS)

| Sub-component | Function |
|---------------|----------|
| ApplicationFactory | Create from lead or direct |
| StageManager | S01–S09 lifecycle transitions |
| ProductResolver | HL, LAP, BL, AL variant logic |
| LenderRouter | Lender selection and submission |
| SanctionHandler | Sanction recording |
| DisbursementHandler | Disbursement + commission trigger |
| ClosureHandler | RM handoff, archive |

## 7.8 Eligibility Module

| Sub-component | Function |
|---------------|----------|
| RuleEngine | Hard gates (age, FOIR, LTV, CIBIL) |
| IncomeCalculator | Multi-income type logic |
| LenderMatcher | Policy profile matching |
| AIExplainer | Natural language eligibility explanation |
| ResultCache | Cache results per profile hash |

## 7.9 EMI Module

EMI calculation, amortization schedule generation, FOIR impact preview. Stateless calculation service used by eligibility and customer app.

## 7.10 Document Module

See Section 13 for full architecture. Module boundary: upload orchestration, metadata, verification status, S3 coordination.

## 7.11 Referral Module

Referral code generation, attribution, conversion tracking, reward calculation trigger, payout linkage.

## 7.12 Commission Module

See Section 24. Module boundary: rule evaluation, ledger entries, clawback, payout batches.

## 7.13 Notification Module

See Section 22. Event-driven multi-channel dispatcher.

## 7.14 Campaign Module

Campaign CRUD, UTM tracking, source attribution, performance metrics feed to analytics.

## 7.15 Support Module

Ticket CRUD, SLA tracking, escalation chains, CSAT collection, complaint register.

## 7.16 Knowledge Base Module

Article CMS, categorization, versioning, publish workflow, RAG index trigger on publish.

## 7.17 Analytics Module

Read-only aggregation service. Materialized summary tables (Phase 2). Report query builder. Export generation. No mutation of operational data.

## 7.18 Module Communication

| Pattern | When |
|---------|------|
| **Direct service call** | Synchronous within same transaction (lead → application create) |
| **Domain event** | Async side effects (disbursement → commission, notification) |
| **Shared repository** | Avoided — modules call through service interfaces |
| **Integration adapter** | External systems (WhatsApp, OpenAI, SMS) |

---

# 8. API ARCHITECTURE

## 8.1 REST API Design Standards

| Standard | Rule |
|----------|------|
| Protocol | HTTPS only (TLS 1.3) |
| Style | RESTful resource-oriented |
| Base URL | `https://api.kuberone.kuberfinserve.com/api/v1` |
| Content-Type | `application/json` (default) |
| File upload | `multipart/form-data` |
| Charset | UTF-8 |
| Timezone | UTC (ISO 8601 timestamps) |
| Idempotency | `Idempotency-Key` header for POST (commission, payment) |

## 8.2 Versioning

| Strategy | Implementation |
|----------|---------------|
| URL versioning | `/api/v1/`, `/api/v2/` |
| Breaking changes | New major version only |
| Deprecation | `Sunset` header + 6-month notice |
| Mobile compatibility | Min supported API version enforced |

## 8.3 Naming Standards

| Element | Convention | Example |
|---------|------------|---------|
| Resources | Plural nouns, kebab-case | `/applications`, `/lead-assignments` |
| Path params | camelCase ID | `/applications/:applicationId` |
| Query params | camelCase | `?branchId=123&status=active` |
| Actions | POST sub-resource | `/applications/:id/submit` |
| Namespaces | Role-scoped prefix | `/dsa/leads`, `/admin/users` |

## 8.4 Authentication Standards

| Client | Method |
|--------|--------|
| Customer App | `Authorization: Bearer <JWT>` |
| DSA App | `Authorization: Bearer <JWT>` |
| Admin Panel | `Authorization: Bearer <JWT>` or httpOnly cookie |
| Webhooks | `X-Webhook-Signature` HMAC validation |
| Service-to-service | `X-API-Key` (integration adapters) |

## 8.5 Response Standards

**Success envelope:**
```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "pageSize": 20, "total": 150 },
  "requestId": "uuid"
}
```

**Error envelope:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": []
  },
  "requestId": "uuid"
}
```

## 8.6 Error Handling Standards

| HTTP Code | Usage |
|-----------|-------|
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Unauthorized (RBAC) |
| 404 | Resource not found (or not visible in scope) |
| 409 | Conflict (duplicate lead, invalid state transition) |
| 422 | Business rule violation |
| 429 | Rate limit exceeded |
| 500 | Internal error (no sensitive detail exposed) |

| Error Code Prefix | Domain |
|-------------------|--------|
| `AUTH_` | Authentication |
| `RBAC_` | Authorization |
| `LEAD_` | LMS |
| `APP_` | LOS |
| `DOC_` | Documents |
| `COMM_` | Commission |
| `AI_` | AI services |

## 8.7 Pagination

| Parameter | Default | Max |
|-----------|---------|-----|
| `page` | 1 | — |
| `pageSize` | 20 | 100 |
| Response | `meta.total`, `meta.page`, `meta.pageSize`, `meta.totalPages` | |

**Cursor pagination** for high-volume feeds (activity logs, notifications) — Phase 2.

## 8.8 Filtering & Search

| Capability | Implementation |
|------------|---------------|
| Field filters | `?status=qualified&productId=HL-01` |
| Date range | `?from=2026-01-01&to=2026-06-01` |
| Scope auto-applied | branchId/regionId from JWT — not overridable by user |
| Full-text search | MySQL FULLTEXT (Phase 1); Elasticsearch (Phase 3) |
| Sort | `?sort=createdAt&order=desc` |

## 8.9 API Domain Map

| Domain Prefix | Modules | Primary Clients |
|---------------|---------|-----------------|
| `/auth` | Authentication | All |
| `/customer` | Customer | Customer App |
| `/dsa` | Partner, Lead, Commission | DSA App |
| `/referral` | Referral | Referral Portal |
| `/crm` | Lead, Loan, Customer | Admin Panel |
| `/credit` | Loan, Eligibility, Document | Admin Panel |
| `/ops` | Loan, Document | Admin Panel |
| `/branch` | Analytics, Lead | Admin Panel |
| `/support` | Support | All |
| `/compliance` | Audit, Document | Compliance Panel |
| `/admin` | User, Campaign, Settings | Admin Panel |
| `/management` | Analytics | Executive Panel |
| `/ai` | AI Advisor, Copilot, RAG | All |
| `/voice` | Voice AI | Customer App, CRM |
| `/webhooks` | Integrations | External |
| `/public` | Products, eligibility preview | Unauthenticated |

---

# 9. DATABASE ARCHITECTURE

## 9.1 MySQL Design Principles

| Principle | Application |
|-----------|-------------|
| **ACID compliance** | Financial transactions (commission, disbursement) |
| **Referential integrity** | Foreign keys with appropriate cascade rules |
| **Soft deletes** | `deletedAt` for audit trail on critical entities |
| **UUID primary keys** | External-facing IDs (security, no enumeration) |
| **Auto-increment internal** | Optional internal surrogate for join performance |
| **Timestamps** | `createdAt`, `updatedAt` on all tables |
| **Audit columns** | `createdBy`, `updatedBy` on mutable entities |
| **Tenant scoping** | `branchId`, `regionId` on operational records |
| **Status enums** | Defined in Prisma enum types |
| **JSON columns** | Flexible metadata only—not core query fields |

## 9.2 Normalization Strategy

| Normal Form | Application |
|-------------|-------------|
| **3NF (default)** | Operational tables — leads, applications, users |
| **Denormalized reads** | Analytics summary tables (Phase 2) |
| **JSON for config** | Workflow definitions, commission rules, lender policies |
| **Avoid over-normalization** | Document metadata co-located with application reference |

## 9.3 Schema Domain Groupings (Logical — No Table Definitions)

| Domain | Entity Groups |
|--------|--------------|
| **Identity** | Users, roles, permissions, sessions, OTP records |
| **Customer** | Customers, consents, privacy preferences |
| **Partner** | Partners, agreements, certifications, tiers |
| **LMS** | Leads, lead scores, assignments, sources |
| **LOS** | Applications, stages, stage history, lender submissions |
| **Eligibility** | Eligibility checks, rule results |
| **Documents** | Document metadata, versions, verification records |
| **Financial** | Commissions, payouts, disputes, referral rewards |
| **Workflow** | Workflow instances, tasks, SLA timers, escalations |
| **Support** | Tickets, messages, complaints |
| **Campaign** | Campaigns, attributions |
| **Knowledge** | Articles, categories, versions |
| **AI** | Conversation sessions, messages, RAG query logs |
| **Audit** | Audit logs, access logs |
| **Analytics** | Summary/materialized aggregates |
| **Config** | Products, lenders, branches, settings |

## 9.4 Indexing Strategy

| Index Type | Application |
|------------|-------------|
| **Primary key** | All tables |
| **Foreign keys** | All FK columns indexed |
| **Status + branchId** | Lead/application queue queries |
| **assignedToUserId + status** | Sales executive pipeline |
| **partnerId + createdAt** | DSA lead history |
| **customerId** | Customer application lookup |
| **phone (hashed)** | Dedup search |
| **createdAt** | Time-range reports |
| **Composite** | `(branchId, status, createdAt)` for branch dashboard |
| **FULLTEXT** | Customer name search (Phase 2) |

## 9.5 Partitioning Strategy (Phase 3)

| Table Category | Partition Strategy |
|----------------|-------------------|
| Audit logs | RANGE by month |
| Notification logs | RANGE by month |
| AI query logs | RANGE by month |
| Operational tables | No partition until >50M rows |

## 9.6 Archival Strategy

| Data Type | Active Retention | Archive |
|-----------|-----------------|---------|
| Applications (closed) | 3 years online | S3 cold + summary record |
| Documents | Per regulatory (8 years) | S3 Glacier after 3 years |
| Audit logs | 2–10 years per category | Partition drop or cold storage |
| AI conversations | 1 year | Anonymized aggregate retained |
| Notification logs | 1 year | Archive |

## 9.7 Backup Strategy

| Backup Type | Frequency | Retention |
|-------------|-----------|-----------|
| RDS automated snapshot | Daily | 35 days |
| RDS manual snapshot | Weekly | 90 days |
| Point-in-time recovery | Continuous | 7 days |
| Cross-region snapshot copy | Weekly | 90 days (Phase 2) |
| S3 versioning | Continuous | Lifecycle policy |
| Backup restore test | Monthly | Documented RTO/RPO |

## 9.8 Prisma ORM Usage

| Pattern | Usage |
|---------|-------|
| Schema as source of truth | `prisma/schema.prisma` |
| Migrations | `prisma migrate deploy` in CI/CD |
| Connection pooling | Prisma connection pool (or RDS Proxy Phase 2) |
| Transactions | `$transaction` for commission + status change |
| Read replica | `prisma.$extends` read routing (Phase 2) |
| Seeding | Product catalog, roles, permissions seed scripts |

---

# 10. STORAGE ARCHITECTURE

## 10.1 AWS S3 Overview

| Bucket | Purpose | Access |
|--------|---------|--------|
| `kuberone-docs-prod` | Customer/partner documents | Private; presigned URLs |
| `kuberone-docs-uat` | UAT documents | Private |
| `kuberone-docs-dev` | Development | Private |
| `kuberone-knowledge-prod` | Knowledge base source files | Private; RAG ingestion |
| `kuberone-exports-prod` | Report exports | Private; time-limited access |
| `kuberone-backups-prod` | DB/log backups | Private; cross-region |

## 10.2 Document Bucket Folder Structure

```
kuberone-docs-prod/
├── customers/
│   └── {customerId}/
│       └── applications/
│           └── {applicationId}/
│               ├── kyc/
│               │   ├── pan_{version}_{timestamp}.pdf
│               │   └── aadhaar_{version}_{timestamp}.pdf
│               ├── income/
│               ├── property/
│               ├── vehicle/
│               └── agreements/
├── partners/
│   └── {partnerId}/
│       └── kyc/
└── system/
    └── templates/
```

## 10.3 Upload Flow

```
Client → POST /documents/presign (metadata + type)
      → API validates permission + generates presigned PUT URL
      → Client uploads directly to S3
      → Client POST /documents/confirm (s3Key, checksum)
      → API records metadata in MySQL
      → Event: document.uploaded → OCR worker queue
```

**Benefit:** API server not burdened with file bytes; faster uploads.

## 10.4 Retention Policies

| Document Category | Retention | S3 Lifecycle |
|-------------------|-----------|--------------|
| KYC | 8 years post-closure | Standard → Glacier at year 3 |
| Income proof | 8 years | Standard → Glacier at year 3 |
| Property docs | 8 years | Standard |
| Loan agreements | 8 years | Standard |
| Partner KYC | Duration + 3 years | Standard |
| Temporary uploads | 30 days if unlinked | Auto-delete |

## 10.5 Security Controls

| Control | Implementation |
|---------|---------------|
| Encryption at rest | SSE-S3 or SSE-KMS |
| Encryption in transit | HTTPS only |
| Access | Presigned URLs (15-min expiry) |
| Bucket policy | Deny public access |
| IAM roles | EC2 instance role — least privilege |
| Virus scan | ClamAV Lambda or third-party (Phase 2) |
| MIME validation | Server-side on confirm |
| Checksum | SHA-256 verified on confirm |

## 10.6 Versioning

| Feature | Implementation |
|---------|---------------|
| S3 versioning | Enabled on document buckets |
| Application-level version | `version` column in document metadata |
| Re-upload | New S3 key + version increment; old retained |
| Download | Always latest unless specific version requested |

---

# 11. AUTHENTICATION ARCHITECTURE

## 11.1 Authentication Methods by Client

| Client | Primary Auth | Secondary |
|--------|-------------|-----------|
| Customer App | Mobile OTP | Biometric unlock |
| DSA App | Mobile OTP + KYC gate | Biometric |
| Referral Portal | Mobile OTP | — |
| Admin Panel | Email/password + MFA | SSO (Phase 1.5) |
| Lender Portal (future) | API key + portal login | IP whitelist |

## 11.2 OTP Login Flow

```
1. Client → POST /auth/otp/send { phone, channel: sms|whatsapp }
2. Server generates 6-digit OTP, stores hashed with expiry (5 min)
3. Server sends via SMS gateway or WhatsApp template
4. Rate limit: 5 OTPs/hour/phone
5. Client → POST /auth/otp/verify { phone, otp }
6. Max 3 attempts per OTP
7. On success: issue tokens, mark phone verified
8. New customer: create customer record + consent capture
9. DSA: verify partner status active + agreement valid
```

## 11.3 JWT Architecture

| Token | Lifetime | Claims |
|-------|----------|--------|
| **Access Token** | 24hr (customer/DSA), 8hr (employee) | `sub`, `role`, `branchId`, `regionId`, `permissions[]`, `scope` |
| **Refresh Token** | 7 days (customer), 30 days (employee) | `sub`, `tokenFamily` (rotation) |

| Property | Value |
|----------|-------|
| Algorithm | RS256 (asymmetric) |
| Key rotation | 90-day key rotation with overlap |
| Validation | Signature + expiry + issuer + audience |
| Revocation | Token blacklist in Redis (Phase 2) or DB session table |

## 11.4 Refresh Token Flow

```
1. Access token expires → 401
2. Client → POST /auth/refresh { refreshToken }
3. Server validates refresh token family (detect reuse → revoke all)
4. Issue new access + refresh token pair
5. Old refresh token invalidated (rotation)
```

## 11.5 Session Management

| Aspect | Policy |
|--------|--------|
| Storage (mobile) | Expo SecureStore |
| Storage (admin) | httpOnly secure cookie (optional) + memory |
| Concurrent sessions | Employee: 2 max; Super Admin: 1 |
| Session invalidation | On password change, role change, admin force logout |
| Idle timeout | Per role (see RBAC doc) |
| Session record | DB table: device info, IP, last active |

## 11.6 Password Policies (Employees)

| Policy | Value |
|--------|-------|
| Min length | 12 characters |
| Complexity | Upper + lower + number + special |
| History | Last 12 passwords |
| Expiry | 90 days (60 for Admin/Super Admin) |
| Lockout | 5 failures → 30 min lock |
| Hashing | bcrypt (cost factor 12) or Argon2id |

## 11.7 MFA Readiness

| Phase | MFA Method |
|-------|------------|
| Phase 1 | TOTP (Google Authenticator) for employees |
| Phase 1.5 | Push notification MFA |
| Phase 2 | Hardware key (FIDO2) for Super Admin |
| Customer | OTP sufficient; biometric as step-up |

---

# 12. AUTHORIZATION ARCHITECTURE

## 12.1 RBAC Integration

Authorization implements [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) at three layers:

```
Layer 1: API Middleware     → Block unauthorized endpoints
Layer 2: Service Layer       → Scope validation, SoD checks
Layer 3: Response Serializer → Field masking by role
```

## 12.2 Permission Resolution Flow

```
1. Extract JWT claims (role, permissions[], branchId, regionId)
2. Load permission cache (Redis Phase 2; in-memory Phase 1)
3. Match endpoint → required permission (resource.action)
4. Check permission grant for role
5. Apply scope filter to repository query
6. Execute SoD rule check for mutation
7. Allow or 403 RBAC_DENIED
```

## 12.3 Access Control Layers

| Layer | Control Point |
|-------|--------------|
| **Route guard (Admin)** | React `<RequirePermission>` — UI element visibility |
| **API middleware** | Express `authorize('leads','read')` |
| **Service scope** | `ScopeService.assertAssigned(userId, leadId)` |
| **Repository filter** | `where: { branchId: user.branchId }` auto-injected |
| **Field masker** | `maskPII(response, user.role)` |
| **S3 presign** | Document access validated before URL generation |

## 12.4 Data Visibility Rules (Technical Implementation)

| Scope | Repository Pattern |
|-------|-------------------|
| `own` | `where: { customerId: user.customerId }` |
| `assigned` | `where: { assignedToId: user.id }` |
| `portfolio` | `where: { rmId: user.id }` |
| `branch` | `where: { branchId: user.branchId }` |
| `region` | `where: { branch: { regionId: user.regionId } }` |
| `organization` | No filter (functional roles) |
| `aggregated` | Aggregate queries only; no entity detail endpoints |

## 12.5 Permission Cache Architecture

| Component | Function |
|-----------|----------|
| Role-Permission map | Loaded at startup; refreshed on RBAC change |
| User-Role assignment | DB lookup per auth (cached 5 min) |
| Invalidation | Event `rbac.updated` → cache flush |
| Super Admin | Bypass cache with enhanced audit |

---

# 13. DOCUMENT MANAGEMENT ARCHITECTURE

## 13.1 Document Lifecycle

```
Upload Request → Presign → S3 Upload → Confirm → OCR Queue
    → AI Extraction → Credit Verification Queue → Verified/Rejected
    → Lender Package (Ops) → Archive
```

## 13.2 Upload Architecture

| Step | Component |
|------|-----------|
| Client-side compression | Images → max 2MB before upload |
| Presigned URL generation | Document Service + S3 |
| MIME validation | Whitelist: pdf, jpg, png |
| Size limit | 10MB per file; 50MB per application |
| Virus scan | Async worker (Phase 2) |
| Metadata record | MySQL document table |

## 13.3 Verification Architecture

| Stage | Actor | System |
|-------|-------|--------|
| Auto validation | System | OCR + rule checks (format, date, name match) |
| Credit verification | Credit Executive | CRM verification UI |
| Compliance audit | Compliance | Sample audit queue |
| Rejection | Credit/Compliance | Deficiency notification triggered |

## 13.4 OCR Architecture

```
document.uploaded event
    → AI Worker picks job
    → Send to GPT Vision / dedicated OCR
    → Extract structured fields (name, PAN, amount, date)
    → Store extraction result in document metadata
    → Confidence score → auto-pass if >95% else manual queue
```

## 13.5 Access Control

| Action | Authorization Check |
|--------|-------------------|
| Presign upload | `documents.create:scope` |
| Presign download | `documents.read:scope` + audit log |
| Verify | `documents.verify:organization` (Credit) |
| Reject | `documents.reject:organization` |
| Delete (soft) | `documents.delete:scope` (limited) |

## 13.6 Audit Trails

Every document action logged: `uploaded`, `viewed`, `downloaded`, `verified`, `rejected`, `shared_to_lender` with actor, timestamp, IP, application context.

---

# 14. LOS ARCHITECTURE

## 14.1 LOS State Machine

```
S01_LEAD_CREATED → S02_QUALIFIED → S03_DOCUMENT_COLLECTION
    → S04_ELIGIBILITY → S05_BANK_LOGIN → S06_CREDIT_REVIEW
    → S07_SANCTION → S08_DISBURSEMENT → S09_CLOSURE

Terminal: S10_REJECTED, S11_WITHDRAWN
Rework loops: Any stage → S03 (document deficiency)
```

## 14.2 Stage Transition Engine

| Component | Function |
|-----------|----------|
| `StageValidator` | Validates transition allowed (state machine rules) |
| `StageGuard` | Checks prerequisites (docs complete, eligibility pass) |
| `StageHandler` | Executes side effects per transition |
| `StageHistory` | Immutable transition log |
| `StageNotifier` | Triggers notifications on milestone |

## 14.3 Stage Handlers

| Transition | Handler Actions |
|------------|----------------|
| → S02 Qualified | Create application; assign sales owner |
| → S03 Doc Collection | Generate checklist; send WhatsApp |
| → S04 Eligibility | Run eligibility engine; credit queue |
| → S05 Bank Login | Ops queue; lender router |
| → S06 Credit Review | Lender submission record |
| → S07 Sanction | Sanction letter storage; customer notify |
| → S08 Disbursement | Commission trigger; RM assignment |
| → S09 Closure | Archive; analytics update |

## 14.4 Product-Specific LOS Extensions

| Product | Additional Sub-states |
|---------|----------------------|
| Home Loan | `LEGAL_VERIFICATION`, `PROPERTY_VALUATION`, `STAGED_DISBURSEMENT` |
| LAP | `MOD_REGISTRATION` |
| Business Loan | `CASH_FLOW_ANALYSIS`, `BUSINESS_VISIT` |
| Auto Loan | `DEALER_PAYMENT`, `RC_HYPOTHECATION` |
| BT variants | `FORECLOSURE_PENDING`, `LOD_TRANSFER` |

## 14.5 LOS Integration Points

| Integration | Direction |
|-------------|-----------|
| LMS | Lead → Application creation |
| Eligibility | Gate before S05 |
| Document | Gate before S04 |
| Workflow | SLA timers per stage |
| Commission | Trigger on S08 |
| AI Copilot | Context on every stage |
| Lender Adapter | S05, S06, S07, S08 |

---

# 15. LMS ARCHITECTURE

## 15.1 Lead Capture Architecture

| Channel | Ingestion Point |
|---------|----------------|
| Customer App | `POST /customer/leads` or application auto-create |
| DSA App | `POST /dsa/leads` |
| Referral | `POST /referral/submit` |
| Campaign landing | `POST /public/leads` with UTM params |
| Walk-in (CRM) | `POST /crm/leads` |
| WhatsApp | Webhook → lead parser (Phase 2) |

## 15.2 Lead Assignment Architecture

```
Lead created
    → Dedup check (phone hash)
    → Source attribution (DSA, campaign, referral)
    → Scoring engine (rules + AI)
    → Classification (hot/warm/cold/rejected)
    → Assignment rule engine:
        - DSA lead → branch of DSA → round-robin sales exec
        - Campaign → campaign branch mapping
        - Hot → priority queue
    → SLA timer started
    → Notification: sales exec + customer acknowledgment
```

## 15.3 Lead Scoring Architecture

| Input | Weight |
|-------|--------|
| Income eligibility | 15% |
| CIBIL (if consented) | 12% |
| Product match | 10% |
| Timeline | 10% |
| Document readiness | 8% |
| Property/vehicle identified | 10% |
| Source quality | 5% |
| AI intent score | 2% |
| + 8 more factors | Per KUBERONE_LOAN_PRODUCTS doc |

**Output:** Score 0–100 → classification → routing priority.

## 15.4 Lead Tracking

| Status | Tracked By |
|--------|-----------|
| New → Contacted → Qualified → Converted | Sales updates + system |
| SLA compliance | Workflow engine |
| Activity log | Calls, meetings, notes (immutable append) |
| Conversion | Link to application ID |

## 15.5 Lead Conversion

```
Qualified lead → Application created (LOS S01/S02)
    → Lead status = CONVERTED
    → Attribution locked (DSA, referral, campaign)
    → Commission attribution chain established
```

---

# 16. WORKFLOW ENGINE ARCHITECTURE

## 16.1 Workflow Engine Design

| Component | Function |
|-----------|----------|
| `WorkflowDefinition` | JSON-configured stage definitions per product |
| `WorkflowInstance` | Running workflow bound to lead/application |
| `TaskManager` | Human tasks (follow-up, document request) |
| `SLAMonitor` | Cron worker checks SLA breaches |
| `EscalationEngine` | Auto-escalate on SLA breach |
| `ApprovalChain` | Multi-step approval routing |
| `AutomationRule` | If-this-then-that rules |

## 16.2 Workflow Definitions

Stored as versioned JSON configuration (Admin-managed):

```json
{
  "workflowId": "LOS_HOME_LOAN",
  "stages": ["S01", "S02", "..."],
  "transitions": [{ "from": "S03", "to": "S04", "guard": "documents_complete" }],
  "sla": { "S02": { "hours": 24, "escalateTo": "branch_manager" } },
  "automations": [{ "on": "S03.deficiency", "action": "send_whatsapp_reminder" }]
}
```

## 16.3 State Management

| Pattern | Implementation |
|---------|---------------|
| Current state | `currentStage` on application record |
| History | Append-only `stage_history` records |
| Concurrent updates | Optimistic locking (`version` column) |
| Invalid transitions | Rejected with `APP_INVALID_TRANSITION` error |

## 16.4 Escalation Rules

| Trigger | Escalation Target | Channel |
|---------|------------------|---------|
| Lead not contacted 30 min | Branch Manager | Push + email |
| SLA breach (any stage) | Configured role | Push + dashboard alert |
| Complaint critical | Management | Email |
| Fraud hold | Compliance Manager | Immediate alert |

## 16.5 Approval Chains

| Approval Type | Chain |
|---------------|-------|
| Credit exception <₹25L | Credit Exec → Branch Manager |
| Credit exception >₹25L | Credit Exec → Branch Manager → Regional Manager |
| Commission dispute <₹10K | Branch Manager |
| Commission dispute >₹10K | Branch Manager → Regional → Finance Head |
| Partner activation | Branch Manager → Admin |
| Bulk export | Compliance Manager → CEO |

## 16.6 Automation Rules

| Rule | Action |
|------|--------|
| Lead assigned | Notify sales exec |
| Document deficiency | WhatsApp reminder (Day 0, 1, 3) |
| Application submitted to lender | Notify customer + DSA |
| Disbursement confirmed | Commission calc + RM assign |
| 12-month post-disbursement | Top-up offer trigger |
| Churn risk score > threshold | RM alert |

---

# 17. AI ADVISOR ARCHITECTURE

## 17.1 AI Advisor Overview

Customer-facing conversational AI for product discovery, eligibility guidance, FAQ, and application assistance.

```
Customer Message
    → AI Advisor Gateway
    → Context Builder (profile, applications, products)
    → Intent Classifier
    → RAG Retrieval (if knowledge needed)
    → Prompt Composer
    → OpenAI GPT API (streaming)
    → Response Filter (no internal data leak)
    → Customer Response (SSE stream)
```

## 17.2 Conversation Engine

| Component | Function |
|-----------|----------|
| `SessionManager` | Conversation sessions per customer |
| `MessageStore` | Message history (MySQL) |
| `IntentClassifier` | Product inquiry, eligibility, status, FAQ, complaint |
| `ContextBuilder` | Inject customer profile, active applications |
| `ResponseFilter` | Strip commission, internal notes, lender codes |
| `StreamHandler` | SSE to mobile app |

## 17.3 Context Management

| Context Source | Included |
|----------------|----------|
| Customer profile | Name, product interests |
| Active applications | Status milestones (customer-friendly) |
| Eligibility results | Recent checks |
| Product catalog | Relevant products |
| **Excluded** | Commission, internal notes, credit assessment, other customers |

## 17.4 Recommendation Engine

| Input | Output |
|-------|--------|
| Stated need + income + employment | Product recommendation (HL/LAP/BL/AL) |
| Existing loan flag | BT/Top-up variant |
| FOIR headroom | Suggested loan amount |
| Location | Lender suggestions (top 3, no commission data) |

**Fusion:** Rules engine output + GPT narrative explanation.

## 17.5 Eligibility Assistance

```
Customer provides income, age, employment
    → Eligibility Module runs rules
    → AI Advisor explains result in plain language
    → Suggests documents to prepare
    → Offers to start application
```

## 17.6 Loan Guidance

Step-by-step application guidance, document checklist explanation, status milestone interpretation, rejection reason explanation (customer-friendly categories).

## 17.7 AI Advisor Guardrails

| Guardrail | Implementation |
|-----------|---------------|
| No guaranteed approval | Prompt instruction + response filter |
| No specific rate promises | Indicative ranges only |
| No internal data | Response filter |
| No legal advice | Disclaimer in system prompt |
| Escalation to human | Intent detection → support ticket creation |
| Conversation logging | Full audit for compliance review |

---

# 18. AI SALES COPILOT ARCHITECTURE

## 18.1 Copilot Overview

Internal AI assistant embedded in CRM sidebar for Sales, Branch Managers, and optionally DSA.

```
CRM User Action (view lead)
    → Copilot Context Builder
    → Inject: lead data, history, product rules, RAG policies
    → Copilot Engine (GPT)
    → Suggestions: priority, script, next action, cross-sell
    → Display in CRM sidebar
```

## 18.2 Lead Scoring (AI-Assisted)

| Feature | Implementation |
|---------|---------------|
| Rule-based score | LMS scoring engine (primary) |
| AI intent analysis | Call/note sentiment analysis |
| Score adjustment | ±5 points based on AI signals |
| Explanation | Copilot explains why lead is hot/cold |

## 18.3 Approval Prediction

| Input Features | Output |
|----------------|--------|
| CIBIL, income, FOIR, LTV, product, lender history | Probability of approval (0–100%) |
| Model | GPT with structured feature injection + historical approval rates |
| Use | Lender routing suggestion; manage customer expectations |

## 18.4 Disbursal Prediction

| Input | Output |
|-------|--------|
| Stage, doc completeness, lender TAT history | Estimated disbursement date |
| Use | Sales sets customer expectations; SLA management |

## 18.5 Next Best Action

| Context | Suggested Action |
|---------|-----------------|
| New hot lead | "Call within 15 min — script attached" |
| Document deficiency 3 days | "WhatsApp reminder — template attached" |
| Stalled 7 days | "Escalate to manager" or "Offer alternate product" |
| Post-disbursement | "Cross-sell insurance" (for RM) |

## 18.6 Risk Analysis

| Signal | Copilot Alert |
|--------|--------------|
| Income inconsistency | "Verify salary vs. bank credits" |
| Recent DPD | "Request explanation letter" |
| High FOIR | "Suggest co-applicant" |
| Fraud pattern match | "Refer to compliance" |

## 18.7 Copilot Data Access

| Data | Access |
|------|--------|
| Assigned leads/applications | ✓ Full |
| Commission data | ✓ (Sales Head+ only) |
| Credit assessment | ✓ Summary |
| Other exec's leads | ✗ |
| Customer PII beyond assigned | ✗ |

---

# 19. RAG ARCHITECTURE

## 19.1 RAG Overview

```
User Query
    → Query Embedding (OpenAI embedding API)
    → Vector Search (top-K chunks)
    → Context Assembly
    → Prompt = System + Context + Query
    → GPT Generation
    → Response
```

## 19.2 Knowledge Sources

| Source | Format | Update Trigger |
|--------|--------|---------------|
| Product policies | Markdown/PDF in S3 | Admin product update |
| Lender policies | PDF/structured JSON | Admin lender update |
| FAQs | MySQL knowledge base | KB publish |
| SOPs | PDF documents | Compliance upload |
| Training content | MySQL | Admin publish |
| Regulatory guidelines | Curated documents | Compliance upload |

## 19.3 Document Indexing Pipeline

```
Source updated
    → Index Worker triggered
    → Document chunking (500-token chunks, 50-token overlap)
    → Embedding generation (OpenAI text-embedding-3-small)
    → Store: chunk text + embedding vector + metadata in MySQL
    → Phase 3: Dedicated vector DB if scale requires
```

## 19.4 Vector Storage Strategy

| Phase | Storage |
|-------|---------|
| Phase 1 | MySQL JSON column for embeddings + cosine similarity in application |
| Phase 2 | Redis vector search or pgvector if migrated |
| Phase 3 | Pinecone/Weaviate if >1M chunks |

## 19.5 Retrieval Strategy

| Parameter | Value |
|-----------|-------|
| Top-K | 5 chunks |
| Similarity threshold | 0.75 |
| Reranking | GPT rerank top 3 (Phase 2) |
| Metadata filter | Product ID, lender ID, document type |
| Freshness | Prefer latest version chunks |

## 19.6 Prompt Strategy

| Element | Content |
|---------|---------|
| System prompt | Role, guardrails, no approval guarantees |
| Context injection | Retrieved chunks with source citation |
| User query | Original question |
| Response format | Structured when eligibility; narrative when FAQ |
| Citation | "Based on [Product Policy v2.1]" — builds trust |

## 19.7 RAG Governance

| Control | Implementation |
|---------|---------------|
| Source versioning | Only latest published version indexed |
| Access control | RAG queries logged; customer RAG excludes internal SOPs |
| Hallucination mitigation | "I don't have information on that" fallback; confidence threshold |
| Re-indexing | Nightly sync + on-publish trigger |
| Evaluation | Monthly sample review by product team |

---

# 20. VOICE AI ARCHITECTURE

## 20.1 Voice AI Overview

```
Audio Input (Customer)
    → Speech-to-Text (Deepgram / OpenAI Realtime)
    → Text → Voice AI Gateway
    → Context + RAG (if needed)
    → LLM (OpenAI GPT / Realtime)
    → Text Response
    → Text-to-Speech (ElevenLabs)
    → Audio Output
```

## 20.2 Speech-to-Text

| Mode | Provider | Use Case |
|------|----------|----------|
| Batch | Deepgram pre-recorded | Voicemail analysis |
| Realtime streaming | OpenAI Realtime API | Live conversation |
| Realtime alt | Deepgram streaming | Fallback |

## 20.3 LLM Layer

| Mode | Provider | Use Case |
|------|----------|----------|
| Realtime conversation | OpenAI Realtime API | Interactive voice session |
| Turn-based | OpenAI GPT-4o | Async voice note processing |

## 20.4 Text-to-Speech

| Provider | Configuration |
|----------|--------------|
| ElevenLabs | Natural Indian English voice; Hindi (Phase 2) |
| Fallback | OpenAI TTS |
| Caching | Common responses cached as audio |

## 20.5 Voice Sessions

| Session Type | Initiator |
|--------------|-----------|
| Inbound (customer calls) | Customer via app "Talk to AI" |
| Outbound (follow-up) | System-triggered campaign |
| Agent assist | Sales exec initiates for practice script |

**Session record:** Duration, transcript, outcome, satisfaction — stored for audit.

## 20.6 Call Back Requests

Customer requests human callback → creates support ticket with priority → assigns sales exec → notification.

## 20.7 Appointment Scheduling

Voice AI extracts preferred date/time → creates calendar task for sales exec → WhatsApp confirmation to customer.

---

# 21. WHATSAPP ARCHITECTURE

## 21.1 WhatsApp Business API Integration

```
KuberOne API ←→ WhatsApp BSP (Business Solution Provider) ←→ Meta WhatsApp Cloud API
```

| Integration Pattern | Use |
|--------------------|-----|
| Template messages | Proactive notifications (approved templates) |
| Session messages | 24-hour window replies |
| Webhook inbound | Customer replies → parser → lead/ticket |
| Media messages | Document request links |

## 21.2 Message Types

| Type | Template Example | Trigger |
|------|-----------------|---------|
| Lead follow-up | `lead_assigned_ack` | Lead created |
| Status update | `application_status_update` | Stage transition |
| Document request | `document_reminder` | Deficiency detected |
| Appointment reminder | `meeting_reminder` | Scheduled meeting |
| Cross-sell offer | `cross_sell_insurance` | Post-sanction |
| OTP | `otp_verification` | Auth (if WhatsApp channel) |
| Disbursement | `disbursement_confirm` | S08 |

## 21.3 WhatsApp Architecture Components

| Component | Function |
|-----------|----------|
| `WhatsAppAdapter` | BSP API wrapper |
| `TemplateManager` | Template ID mapping, variable injection |
| `InboundParser` | Webhook message → intent/action |
| `OutboundQueue` | Rate-limited send queue |
| `ConsentChecker` | Verify WhatsApp marketing consent |

## 21.4 Inbound Message Handling

```
Webhook received
    → Validate signature
    → Identify customer/partner by phone
    → Parse intent (status query, document upload link click, opt-out)
    → Route: AI Advisor (FAQ) | Support ticket | Status API
    → Respond within session window
```

---

# 22. NOTIFICATION ARCHITECTURE

## 22.1 Event-Driven Notification Model

```
Domain Event (e.g., application.sanctioned)
    → Notification Service
    → Rule Engine (who gets what channel per KUBERONE_USER_TYPES notification matrix)
    → Template Resolver
    → Channel Dispatchers (parallel)
    → Delivery Log
```

## 22.2 Channel Architecture

| Channel | Provider | Dispatcher |
|---------|----------|------------|
| **Push** | Firebase FCM | `FcmDispatcher` |
| **SMS** | SMS Gateway (MSG91/Twilio) | `SmsDispatcher` |
| **Email** | SES / SendGrid | `EmailDispatcher` |
| **WhatsApp** | WhatsApp Business API | `WhatsAppDispatcher` |
| **In-App** | MySQL notification table | `InAppDispatcher` (polling/WS) |

## 22.3 Notification Preferences

| Level | Control |
|-------|---------|
| Customer | Per-channel marketing opt-in/out |
| DSA | Campaign notification toggle |
| Employee | Non-critical notification preferences |
| Mandatory | SLA alerts, security, disbursement — cannot opt out |

## 22.4 Event Catalog (Key Events)

| Event | Channels (default) |
|-------|-------------------|
| `lead.assigned` | Push (sales), In-app |
| `lead.sla_breach` | Push, SMS (sales), Push (manager) |
| `document.deficiency` | WhatsApp, Push (customer) |
| `application.submitted` | WhatsApp, Push (customer, DSA) |
| `application.sanctioned` | SMS, WhatsApp, Push (customer, DSA) |
| `disbursement.confirmed` | SMS, WhatsApp, Push (all stakeholders) |
| `commission.approved` | Push, WhatsApp (DSA) |
| `payout.processed` | SMS, WhatsApp (DSA) |
| `ticket.updated` | Push, In-app |
| `fraud.alert` | Push, SMS (compliance) |

## 22.5 Delivery Guarantees

| Guarantee | Implementation |
|-----------|---------------|
| At-least-once delivery | Retry queue (3 attempts, exponential backoff) |
| Idempotency | Event ID dedup |
| Delivery log | Status: pending, sent, delivered, failed |
| Fallback | Push fail → SMS for critical events |

---

# 23. REFERRAL ENGINE ARCHITECTURE

## 23.1 Referral Sources

| Source Type | Attribution Method |
|-------------|-------------------|
| Customer referral | Unique referral code/link |
| DSA | Partner ID on lead |
| Referral partner | Partner type + ID |
| Builder/Property dealer | Partner sub-type + project ID |
| Corporate | Corporate partner MOU code |
| Campaign | UTM + campaign ID |

## 23.2 Tracking Architecture

```
Referral event (link click / code used / partner submit)
    → Referral record created (REF-{id})
    → Linked to lead on creation
    → Status sync: lead status → referral status (simplified for partners)
    → Conversion on disbursement
    → Reward calculation triggered
```

## 23.3 Reward Model

| Partner Type | Calculation |
|--------------|-------------|
| Customer | Flat ₹ per conversion (configurable) |
| Referral partner | Flat fee per product type |
| Builder | Tiered by loan amount |
| Corporate | Revenue share % per MOU |

## 23.4 Approval & Payout

```
Disbursement event
    → Referral reward calculated
    → Status: PENDING (clawback period)
    → Auto-approve after clawback
    → Added to payout batch (monthly)
    → Notification to referrer
```

---

# 24. COMMISSION ENGINE ARCHITECTURE

## 24.1 Commission Architecture

```
Disbursement event
    → Commission Engine
    → Rule Resolver (product × lender × partner tier × campaign)
    → Calculate gross commission
    → Split: Kuber share + DSA share (per tier)
    → Create commission record (PENDING)
    → Clawback timer started
    → After clawback period → APPROVED
    → Finance approval (batch)
    → Payout processor
    → PAID
```

## 24.2 Calculation

| Input | Source |
|-------|--------|
| Disbursement amount | LOS disbursement record |
| Product commission rate | Commission rule config |
| DSA tier multiplier | Partner record |
| Campaign bonus | Campaign rule (if applicable) |
| Clawback period | Product-specific config |

## 24.3 Approval

| Stage | Approver |
|-------|----------|
| Auto-approve (<₹10K, standard) | System after clawback |
| Branch review (dispute) | Branch Manager |
| High-value override | Finance Head |
| Payout batch | Finance Head |

## 24.4 Settlement & Payout

| Step | Detail |
|------|--------|
| Batch creation | Monthly (configurable) |
| Minimum threshold | ₹500 |
| TDS calculation | Per Indian tax rules |
| Bank transfer | Partner registered account |
| Statement generation | PDF + in-app |

## 24.5 Recovery (Clawback)

```
Loan cancelled within clawback period
    → Commission status: CLAWED_BACK
    → DSA notified
    → Deducted from next payout or recovery invoice
    → Audit log
```

---

# 25. ANALYTICS ARCHITECTURE

## 25.1 Analytics Layer Design

```
Operational Data (MySQL)
    → Analytics Service (aggregation queries)
    → Summary Tables (Phase 2: materialized)
    → Report API
    → Admin Dashboard Charts
    → Scheduled PDF/Excel export
```

## 25.2 Operational Analytics

| Metric Domain | Consumers | Refresh |
|---------------|-----------|---------|
| Lead funnel | Sales, Branch, Regional | Real-time |
| SLA compliance | Branch, Ops Head | Real-time |
| Processing queue depth | Credit, Ops | Real-time |
| Document deficiency rate | Sales, Ops | Daily |
| Activity scores | Branch Manager | Daily |

## 25.3 Revenue Analytics

| Metric | Source |
|--------|--------|
| Disbursement volume/value | LOS disbursement records |
| Commission revenue | Commission engine ledger |
| Revenue by product/channel/branch | Aggregated joins |
| Commission clawback rate | Commission status tracking |
| Payout liability | Approved unpaid commissions |

## 25.4 Executive Analytics

| Dashboard | Metrics |
|-----------|---------|
| Company KPI | Disbursements, revenue, conversion, NPS |
| Regional comparison | Branch ranking, target achievement |
| Forecast | AI-assisted projection based on pipeline |
| Board pack | Monthly automated compilation |

**Access:** Aggregated only — no record-level PII per RBAC.

## 25.5 Partner Analytics

| Metric | Consumer |
|--------|----------|
| DSA performance leaderboard | DSA (anonymized rank), Branch, Sales Head |
| Partner activation/retention | Regional, Sales Head |
| Channel mix (DSA vs. direct) | Management |
| Referral conversion | Referral partners, Branch |

## 25.6 AI Analytics

| Metric | Purpose |
|--------|---------|
| AI Advisor query volume | Adoption tracking |
| Copilot usage rate | Sales productivity correlation |
| RAG retrieval accuracy | Knowledge gap identification |
| Voice session volume | Channel effectiveness |
| AI-influenced conversion | ROI justification |

## 25.7 Analytics Scaling Path

| Phase | Architecture |
|-------|-------------|
| Phase 1 | Direct MySQL aggregation queries with indexes |
| Phase 2 | Materialized summary tables + nightly refresh job |
| Phase 3 | Read replica dedicated to analytics; ETL to warehouse |
| Phase 4 | Redshift/BigQuery for historical analysis |

---

# 26. SECURITY ARCHITECTURE

## 26.1 Defense in Depth

```
Internet → Nginx (SSL, rate limit, headers) → Express (auth, RBAC)
    → Service (validation, SoD) → Prisma (parameterized) → MySQL (encrypted)
    → S3 (SSE, presigned) → Audit log
```

## 26.2 Encryption

| Layer | Method |
|-------|--------|
| In transit | TLS 1.3 (Nginx termination) |
| MySQL at rest | RDS encryption (AES-256) |
| S3 at rest | SSE-S3 or SSE-KMS |
| Sensitive fields | Application-level encryption (AES-256-GCM) for Aadhaar, PAN |
| JWT | RS256 asymmetric signing |
| Passwords | bcrypt/Argon2id |
| OTP | Hashed storage (SHA-256) |

## 26.3 Audit Logs

| Implementation | Detail |
|----------------|--------|
| Storage | Dedicated `audit_logs` table (partitioned Phase 3) |
| Write | Async (non-blocking) via audit middleware |
| PII access flag | `piiAccessed: true` triggers enhanced review |
| Immutability | Append-only; no update/delete |
| Export | Compliance Manager + Super Admin only |

## 26.4 Fraud Monitoring

| Signal | Detection | Action |
|--------|-----------|--------|
| Duplicate applications | Dedup engine | Block + alert |
| Velocity (leads/hour) | Rate anomaly | Partner hold |
| Document tampering | OCR confidence low | Manual review |
| Income inconsistency | Cross-doc validation | Credit flag |
| Commission anomaly | Payout pattern | Finance review |
| Login anomaly | New IP + new device | MFA challenge |

## 26.5 Rate Limiting

| Scope | Limit |
|-------|-------|
| Public API | 100 req/hour/IP |
| Authenticated API | 1000 req/hour/user |
| OTP send | 5/hour/phone |
| Document upload | 20/hour/user |
| AI queries | 50/hour/customer; 200/hour/employee |
| Admin API | 5000/hour/user |

**Implementation:** Nginx `limit_req` + Express `express-rate-limit` + Redis (Phase 2).

## 26.6 Input Validation

| Vector | Protection |
|--------|-----------|
| SQL injection | Prisma parameterized queries |
| XSS | Output encoding; CSP headers |
| CSRF | SameSite cookies; CSRF token (admin) |
| File upload | MIME whitelist, size limit, virus scan |
| JSON depth | Body size limit (1MB default) |
| Phone/email | Format validation + normalization |

## 26.7 PII Protection

| Control | Implementation |
|---------|---------------|
| Field masking | API response serializer by role |
| Aadhaar | Store masked; full access Credit/Compliance only |
| PAN | Encrypted at rest |
| Phone | Hash for dedup; mask in partner views |
| Consent | Required before bureau pull |
| Data export | Customer self-service; bulk requires Compliance |
| Right to deletion | Soft delete + retention policy |

## 26.8 Document Security

| Control | Implementation |
|---------|---------------|
| Access | Presigned URLs only; no public S3 |
| Download audit | Every presign logged |
| Watermark | Optional on sanction letters |
| Lender transfer | Encrypted channel; minimal data |
| Retention | Lifecycle policy; legal hold support |

## 26.9 Security Headers (Nginx)

```
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

---

# 27. PERFORMANCE ARCHITECTURE

## 27.1 Caching Strategy

| Cache Layer | Technology | Content |
|-------------|------------|---------|
| **Application cache** | In-memory (Phase 1) / Redis (Phase 2) | RBAC permissions, product catalog, lender policies |
| **API response cache** | Redis | Eligibility results (5 min), product catalog (1 hr) |
| **Mobile cache** | TanStack Query | API responses per cache policy |
| **CDN** | CloudFront (Phase 2) | Admin panel static assets |
| **DB query cache** | MySQL query cache / Prisma accelerate (Phase 3) | Read-heavy dashboards |

## 27.2 Query Optimization

| Technique | Application |
|-----------|-------------|
| Indexed queries | All queue/list endpoints |
| Pagination | Mandatory for list endpoints |
| Select only needed fields | Prisma `select` projection |
| Eager loading | Prisma `include` for known joins |
| Summary tables | Dashboard aggregates (Phase 2) |
| Read replica | Analytics queries off primary (Phase 2) |
| Slow query log | >500ms logged and reviewed |

## 27.3 API Optimization

| Technique | Application |
|-----------|-------------|
| Response compression | Nginx gzip |
| Field projection | `?fields=id,status,name` (Phase 2) |
| Batch endpoints | `POST /crm/leads/batch-update` |
| Async processing | Heavy ops (OCR, reports) via workers |
| Connection pooling | Prisma pool size tuned per instance |
| Keep-alive | Nginx ↔ Node persistent connections |

## 27.4 File Optimization

| Technique | Application |
|-----------|-------------|
| Client-side image compression | Before upload (mobile) |
| PDF size limit | 10MB |
| Thumbnail generation | Async for image previews (Phase 2) |
| Direct S3 upload | Bypass API server for bytes |
| CDN for public assets | Marketing images (Phase 2) |

## 27.5 Scaling Strategy

| Trigger | Action |
|---------|--------|
| API CPU >70% sustained | Add EC2 instance behind ALB |
| MySQL connections maxed | RDS Proxy + connection pool tuning |
| Notification backlog | Scale notification worker PM2 instances |
| AI queue depth | Scale AI worker instances |
| S3 request rate | S3 scales automatically |
| Storage >1TB | S3 lifecycle to Glacier |

---

# 28. INTEGRATION ARCHITECTURE

## 28.1 Integration Adapter Pattern

```
Service Layer
    → Integration Interface (abstract)
    → Concrete Adapter (per provider)
    → External API
```

| Benefit | Description |
|---------|-------------|
| Swappable providers | Change SMS gateway without business logic change |
| Testability | Mock adapters in test environment |
| Resilience | Circuit breaker per adapter |
| Observability | Per-integration metrics |

## 28.2 OpenAI Integration

| Use Case | API | Adapter |
|----------|-----|---------|
| AI Advisor chat | Chat Completions (stream) | `OpenAIChatAdapter` |
| Sales Copilot | Chat Completions | `OpenAIChatAdapter` |
| Document OCR | GPT-4o Vision | `OpenAIVisionAdapter` |
| Embeddings (RAG) | text-embedding-3-small | `OpenAIEmbeddingAdapter` |
| Voice realtime | Realtime API | `OpenAIRealtimeAdapter` |

| Resilience | Configuration |
|------------|--------------|
| Timeout | 30s (chat), 60s (vision) |
| Retry | 2 retries with backoff |
| Circuit breaker | Open after 5 failures in 60s |
| Fallback | Cached FAQ response (Advisor) |
| Cost control | Token budget per user/day |

## 28.3 WhatsApp Integration

| Component | Detail |
|-----------|--------|
| Provider | BSP (e.g., Gupshup, Interakt, or direct Cloud API) |
| Adapter | `WhatsAppAdapter` |
| Webhook endpoint | `POST /webhooks/whatsapp` |
| Template management | Admin panel → template ID mapping |
| Media handling | Download media → S3 for document replies |

## 28.4 Firebase Integration

| Component | Detail |
|-----------|--------|
| FCM | Push notification delivery |
| Adapter | `FcmDispatcher` |
| Device registration | `POST /notifications/register-device` |
| Topic subscriptions | Branch-level topics (Phase 2) |
| Deep linking | Notification payload → app screen |

## 28.5 SMS Gateway Integration

| Component | Detail |
|-----------|--------|
| Provider | MSG91 / Twilio / AWS SNS |
| Adapter | `SmsAdapter` |
| Use cases | OTP, critical alerts, disbursement |
| DLT compliance | India DLT template registration |
| Fallback | Secondary provider (Phase 2) |

## 28.6 Email Provider Integration

| Component | Detail |
|-----------|--------|
| Provider | AWS SES / SendGrid |
| Adapter | `EmailAdapter` |
| Templates | HTML templates stored in system |
| Use cases | Employee auth, reports, formal complaints |
| Bounce handling | Webhook → suppress list |

## 28.7 Future Lender API Integration

| Component | Detail |
|-----------|--------|
| Adapter interface | `LenderAdapter` with `submitApplication`, `getStatus`, `uploadDocument` |
| Implementations | Per-lender concrete adapters |
| Lender portal | `LenderUser` role API (future) |
| Webhook | Lender status callback → `POST /webhooks/lender/{lenderId}` |
| Queue | Lender submission retry queue |
| Mapping | Lender status codes → KuberOne milestone codes |

## 28.8 Future Integrations (Roadmap)

| Integration | Phase | Adapter |
|-------------|-------|---------|
| Credit Bureau (CIBIL) | Phase 2 | `CreditBureauAdapter` |
| Video KYC (Hyperverge/DigiLocker) | Phase 3 | `VideoKycAdapter` |
| eSign (Digio/Leegality) | Phase 3 | `ESignAdapter` |
| Payment Gateway | Phase 3 | `PaymentAdapter` |
| Insurance API | Phase 2 | `InsuranceAdapter` |

---

# 29. DEPLOYMENT ARCHITECTURE

## 29.1 Environments

| Environment | Purpose | Infrastructure |
|-------------|---------|---------------|
| **Development** | Local developer machines | Local MySQL, local S3 (MinIO optional), mock integrations |
| **UAT** | QA, business acceptance | EC2 (small), RDS (small), S3 UAT bucket |
| **Production** | Live system | EC2 (scaled), RDS (Multi-AZ), S3 prod buckets |

## 29.2 Production Server Layout

```
┌─────────────────────────────────────────────────────────┐
│ EC2 Instance 1: APP SERVER                              │
│ Ubuntu 22.04 LTS                                        │
│ ├── Nginx (reverse proxy, SSL, static admin build)      │
│ ├── PM2: kuberone-api (2 instances, cluster mode)       │
│ └── PM2: kuberone-workers (notification, commission)    │
├─────────────────────────────────────────────────────────┤
│ EC2 Instance 2: WORKER SERVER (Phase 2)                 │
│ ├── PM2: ai-worker                                      │
│ ├── PM2: report-worker                                  │
│ └── PM2: workflow-worker                                │
├─────────────────────────────────────────────────────────┤
│ RDS MySQL (Multi-AZ)                                    │
│ ├── Primary                                             │
│ └── Standby (automatic failover)                        │
├─────────────────────────────────────────────────────────┤
│ AWS S3 (document buckets)                               │
├─────────────────────────────────────────────────────────┤
│ Route 53 (DNS)                                          │
│ ACM (SSL certificates)                                  │
└─────────────────────────────────────────────────────────┘
```

## 29.3 PM2 Configuration

| Process | Instances | Mode |
|---------|-----------|------|
| `kuberone-api` | 2 (Phase 1) → N (Phase 3) | Cluster |
| `notification-worker` | 1 → 2 | Fork |
| `commission-worker` | 1 | Fork |
| `ai-worker` | 1 → 2 | Fork |
| `workflow-worker` | 1 | Fork |
| `report-worker` | 1 | Fork |

| PM2 Feature | Usage |
|-------------|-------|
| Auto-restart | On crash |
| Memory limit | 512MB per process (restart if exceeded) |
| Log rotation | `pm2-logrotate` |
| Startup script | `pm2 startup` + `pm2 save` |
| Zero-downtime reload | `pm2 reload` on deploy |

## 29.4 Nginx Configuration

| Function | Configuration |
|----------|--------------|
| SSL termination | ACM certificate |
| Reverse proxy | `proxy_pass http://localhost:3000` |
| Admin static files | `root /var/www/kuberone-admin` (Vite build) |
| Rate limiting | `limit_req_zone` per IP |
| Gzip | Enabled for JSON, JS, CSS |
| Client max body size | 1MB (API); direct S3 for files |
| Security headers | Per Section 26.9 |
| Health check | `/health` endpoint (no auth) |

## 29.5 SSL/TLS

| Component | Certificate |
|-----------|-------------|
| API domain | AWS ACM (auto-renew) |
| Admin domain | AWS ACM |
| Mobile apps | Certificate pinning (app config) |

## 29.6 Deployment Pipeline

```
Developer → Git push → CI (GitHub Actions / similar)
    → Lint + TypeScript check + tests
    → Build admin panel (Vite)
    → UAT deploy (SSH + PM2 reload)
    → UAT smoke tests
    → Manual approval
    → Production deploy (SSH + PM2 reload)
    → Prisma migrate deploy
    → Health check verification
    → Rollback plan: PM2 reload previous build
```

## 29.7 Monitoring

| Tool | Monitors |
|------|----------|
| PM2 monitoring | Process health, memory, CPU |
| CloudWatch (or equivalent) | EC2, RDS metrics |
| Uptime monitor | `/health` endpoint (external) |
| Error tracking | Sentry (Phase 1.5) |
| Log aggregation | CloudWatch Logs or Loki (Phase 2) |
| Alerts | CPU >80%, error rate >1%, disk >85% |

| Alert Channel | Recipient |
|---------------|-----------|
| P1 (down) | CTO, DevOps — SMS |
| P2 (degraded) | DevOps — email |
| P3 (warning) | DevOps — dashboard |

---

# 30. DISASTER RECOVERY ARCHITECTURE

## 30.1 Recovery Objectives

| Metric | Target |
|--------|--------|
| **RPO** (Recovery Point Objective) | 1 hour (max data loss) |
| **RTO** (Recovery Time Objective) | 4 hours (max downtime) |
| **Availability** | 99.9% (8.7 hours downtime/year) |

## 30.2 Backup Architecture

| Component | Backup Method | Frequency |
|-----------|--------------|-----------|
| MySQL (RDS) | Automated snapshots + PITR | Continuous PITR; daily snapshot |
| S3 documents | Versioning + cross-region replication (Phase 2) | Continuous |
| Application config | Git repository (secrets in env) | Every deploy |
| PM2 ecosystem config | Git + server backup | Every change |

## 30.3 Recovery Process

| Scenario | Recovery Steps |
|----------|---------------|
| **App server failure** | Launch new EC2 from AMI; PM2 start; update DNS if needed |
| **Database failure** | RDS Multi-AZ automatic failover (<2 min) |
| **Database corruption** | Restore from snapshot to new RDS; update connection string |
| **S3 bucket issue** | Restore from versioned object or cross-region replica |
| **Region failure** | Restore RDS snapshot in secondary region; S3 replica; update DNS (Phase 2 DR plan) |
| **Complete disaster** | Runbook: new EC2 + restore RDS + S3 + deploy latest build |

## 30.4 Data Retention

Per regulatory and [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) audit requirements:

| Data | Retention |
|------|-----------|
| Application records | 8 years |
| Documents | 8 years |
| Audit logs | 2–10 years (category-dependent) |
| Commission records | 7 years |
| AI conversations | 1 year (then anonymize) |

## 30.5 Business Continuity

| Scenario | Continuity Plan |
|----------|----------------|
| API down | Status page; WhatsApp manual updates (interim) |
| AI services down | Fallback to rule-based eligibility; cached FAQs |
| WhatsApp down | SMS fallback for critical notifications |
| Partner onboarding pause | Manual Excel backup (48-hour emergency) |
| DR drill | Quarterly restore test documented |

---

# 31. FUTURE SCALABILITY ARCHITECTURE

## 31.1 Product Module Extension Pattern

```
Core Platform (unchanged)
    └── Product Module Plugin
            ├── Product catalog entry
            ├── Eligibility rules extension
            ├── Document checklist extension
            ├── LOS workflow variant
            ├── Commission rule extension
            ├── RAG knowledge pack
            └── Analytics metrics extension
```

## 31.2 Future Product Technical Additions

| Product | Architecture Extension |
|---------|----------------------|
| **Personal Loan** | PL product module; unsecured eligibility rules; PL lender adapters |
| **Insurance** | Insurance catalog; IRDAI compliance module; premium calculator; referral commission type |
| **Credit Cards** | Card application subtype; bank referral API; card-specific RAG |
| **Mutual Funds** | MF module; risk profiler; ARN compliance; RM certification gate |
| **Fixed Deposits** | FD rate engine; bank referral tracking |
| **Gold Loan** | Gold valuation adapter; pledge document workflow |
| **Wealth Management** | Portfolio view; advisory workflow; SEBI compliance |
| **Video KYC** | `VideoKycAdapter` (Hyperverge/DigiLocker); session recording to S3 |
| **eSign** | `ESignAdapter` (Digio/Leegality); webhook for completion |

## 31.3 Architecture Evolution Roadmap

| Phase | Architecture Change |
|-------|-------------------|
| Phase 1 (Launch) | Modular monolith; single EC2; direct MySQL |
| Phase 2 (Growth) | Redis cache; worker EC2; read replica; WebSocket |
| Phase 3 (Scale) | ALB + multi-EC2; vector DB; Elasticsearch; lender APIs |
| Phase 4 (Platform) | Extract notification service; extract AI service; analytics warehouse |
| Phase 5 (National) | Multi-region; CDN; dedicated integration gateway |

## 31.4 Scalability Principles

| Principle | Rule |
|-----------|------|
| **Monolith first** | Extract services only with proven scale need |
| **Product plugins** | New products = modules, not architecture changes |
| **Adapter pattern** | All external integrations through adapters |
| **Event-driven** | Side effects via events for future queue extraction |
| **Stateless API** | Horizontal scaling ready from day one |
| **Scope in token** | Branch/region in JWT — no server affinity |

## 31.5 Technology Evolution Options

| Component | Current | Future Option |
|-----------|---------|---------------|
| Cache | In-memory | Redis → ElastiCache |
| Search | MySQL FULLTEXT | Elasticsearch |
| Vector store | MySQL embeddings | Pinecone/Weaviate |
| Queue | In-process events | AWS SQS |
| Analytics | MySQL aggregates | Redshift/BigQuery |
| Real-time | Polling | WebSocket + SSE |
| Deployment | PM2 on EC2 | PM2 cluster + ALB (no Docker per policy) |

---

# APPENDIX A: TECHNOLOGY DECISION RECORDS

| Decision | Choice | Rationale |
|----------|--------|-----------|
| TDR-01 | TypeScript everywhere | Type safety; shared types across mobile/web/API |
| TDR-02 | Modular monolith | Simpler ops for Phase 1; clear module boundaries for future extraction |
| TDR-03 | MySQL over PostgreSQL | Team familiarity; RDS maturity; Prisma excellent support |
| TDR-04 | Prisma ORM | Type-safe queries; migration management |
| TDR-05 | Expo for mobile | Faster development; OTA updates; single codebase |
| TDR-06 | Vite for admin | Fast builds; modern React tooling |
| TDR-07 | OpenAI over self-hosted LLM | No GPU ops; best model quality; pay-per-use |
| TDR-08 | S3 over DB blobs | Cost; performance; lifecycle policies |
| TDR-09 | PM2 over Docker | User requirement; simpler for team; proven on Ubuntu |
| TDR-10 | Presigned S3 upload | API server not burdened with file bytes |
| TDR-11 | JWT over sessions | Stateless API; mobile-friendly |
| TDR-12 | In-process events (Phase 1) | Simplicity; migrate to SQS when needed |

---

# APPENDIX B: ENVIRONMENT VARIABLE CATEGORIES

| Category | Examples (not values) |
|----------|----------------------|
| Database | `DATABASE_URL` |
| JWT | `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` |
| AWS | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET` |
| OpenAI | `OPENAI_API_KEY` |
| WhatsApp | `WHATSAPP_API_KEY`, `WHATSAPP_WEBHOOK_SECRET` |
| Firebase | `FCM_SERVER_KEY` |
| SMS | `SMS_API_KEY`, `SMS_SENDER_ID` |
| Email | `SES_REGION`, `EMAIL_FROM` |
| Deepgram | `DEEPGRAM_API_KEY` |
| ElevenLabs | `ELEVENLABS_API_KEY` |
| App | `NODE_ENV`, `PORT`, `API_BASE_URL` |

*All secrets stored in environment variables on server — never in codebase.*

---

# APPENDIX C: HEALTH CHECK ENDPOINTS

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `GET /health` | API alive | None |
| `GET /health/db` | MySQL connectivity | Internal/monitoring |
| `GET /health/s3` | S3 connectivity | Internal/monitoring |
| `GET /health/integrations` | External API status | Admin |

---

# APPENDIX D: GLOSSARY

| Term | Definition |
|------|------------|
| **LOS** | Loan Origination System |
| **LMS** | Lead Management System |
| **RAG** | Retrieval-Augmented Generation |
| **RBAC** | Role-Based Access Control |
| **PM2** | Process Manager for Node.js |
| **FCM** | Firebase Cloud Messaging |
| **Presigned URL** | Time-limited S3 access URL |
| **Modular Monolith** | Single deployable with clear module boundaries |
| **Adapter Pattern** | Swappable external integration interface |
| **SSE** | Server-Sent Events (streaming) |
| **PITR** | Point-in-Time Recovery |
| **RPO/RTO** | Recovery Point/Time Objectives |

---

# APPENDIX E: DOCUMENT APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |
| CEO / Managing Director | | | |
| Head of Engineering | | | |
| CISO / Security Head | | | |
| Head of Product | | | |
| Board Representative | | | |

---

# APPENDIX F: REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | Kuber Finserve Architecture Team | Initial System Architecture Document |

---

# APPENDIX G: RELATED DOCUMENT INDEX

| Document | Relationship |
|----------|-------------|
| [KUBERONE_VISION_AND_OBJECTIVES.md](./KUBERONE_VISION_AND_OBJECTIVES.md) | Business vision driving architecture |
| [KUBERONE_USER_TYPES_AND_ROLES.md](./KUBERONE_USER_TYPES_AND_ROLES.md) | Personas and workflows |
| [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md) | Product rules for LOS/Eligibility |
| [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) | Authorization implementation spec |
| [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md) | AI platform, RAG, Voice AI, governance |
| [KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md) | Infrastructure, CI/CD, monitoring, DR |

---

**© 2026 Kuber Finserve. Confidential — For Internal, Engineering, and Investor Use.**

*This document is the master technical blueprint for KuberOne. All engineering decisions must align with this architecture. Deviations require CTO approval and architecture decision record.*
