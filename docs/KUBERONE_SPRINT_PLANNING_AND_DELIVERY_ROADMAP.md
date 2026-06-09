# KuberOne
## Sprint Planning & Delivery Roadmap

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise Sprint Planning & Delivery Roadmap (B7)  
**Classification:** Roadmap Ready | Board Ready | Investor Ready | Enterprise Ready  
**Version:** 1.0  
**Date:** June 2026  
**Related Documents:**
- [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md) — §32 Development Sequence (backend Weeks 1–26)
- [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md) — AI Development Phases (Weeks 1–20 relative to AI track)
- [KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md) — §29 Development to Production Roadmap
- [KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md](./KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md)
- [KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md](./KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md)
- [KUBERONE_VISION_AND_OBJECTIVES.md](./KUBERONE_VISION_AND_OBJECTIVES.md)
- [KUBERONE_TESTING_STRATEGY.md](./KUBERONE_TESTING_STRATEGY.md)
- [KUBERONE_QA_STRATEGY.md](./KUBERONE_QA_STRATEGY.md)
- [KUBERONE_PRODUCTION_READINESS_FRAMEWORK.md](./KUBERONE_PRODUCTION_READINESS_FRAMEWORK.md)
- [KUBERONE_RELEASE_MANAGEMENT_FRAMEWORK.md](./KUBERONE_RELEASE_MANAGEMENT_FRAMEWORK.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | 10-phase, 52-week delivery roadmap — milestones, deliverables, dependencies, risks, team sizing |
| **Audience** | Board, CTO, Product, Engineering Leads, QA, DevOps, Investors |
| **Status** | Authoritative Delivery Master Roadmap |
| **Out of Scope** | Source code, sprint-level task assignments, individual developer schedules |

---

## Roadmap Statistics

| Metric | Value |
|--------|-------|
| **Total duration** | 52 weeks (~12 months) |
| **Delivery phases** | 10 |
| **Parallel workstreams** | Up to 4 (backend, mobile, CRM, AI) |
| **Backend modules** | 24 |
| **Mobile apps** | 2 (Customer, DSA) |
| **Loan products (Phase 1)** | 4 (HL, LAP, BL, AL) |
| **Production go-live** | Week 52 |
| **Team size (peak)** | 12–15 (Weeks 24–40) |
| **Estimated effort** | ~85 person-months |

---

# EXECUTIVE SUMMARY

This roadmap defines the **52-week path from zero to production** for KuberOne — an AI-powered Indian fintech platform with customer mobile app, DSA partner app, CRM admin panel, modular monolith backend, and AI advisor with voice capabilities.

The roadmap synthesizes three authoritative sequences:
1. **Backend Blueprint §32** — 8 backend phases (Weeks 1–26)
2. **AI RAG Architecture** — 5 AI phases (Advisor → Voice → Management AI)
3. **DevOps §29** — Infrastructure maturity (Dev → QA → UAT → Prod)

## 10-Phase Overview

| Phase | Name | Calendar Weeks | Duration | Primary Deliverable |
|-------|------|----------------|----------|-------------------|
| **1** | Foundation | 1–4 | 4 weeks | Monorepo, CI/CD, auth scaffold, QA environment |
| **2** | Backend Core | 5–18 | 14 weeks | Auth, users, LMS, LOS, documents, KYC |
| **3** | Customer App | 12–24 | 13 weeks | Customer mobile app (191 screens) |
| **4** | DSA App | 20–28 | 9 weeks | DSA partner mobile app (55 screens) |
| **5** | CRM Admin | 22–34 | 13 weeks | CRM admin panel (role-based) |
| **6** | AI Advisor | 26–36 | 11 weeks | RAG, AI Advisor, Sales Copilot |
| **7** | Voice AI | 34–42 | 9 weeks | Voice assistant (STT/TTS, in-app voice) |
| **8** | Analytics & Economics | 32–42 | 11 weeks | Dashboards, commission, referrals, notifications |
| **9** | Testing & Hardening | 40–50 | 11 weeks | Full regression, security, performance, UAT |
| **10** | Production | 48–52 | 5 weeks | Go-live, store release, monitoring, DR |

**Note:** Phases 3–8 overlap intentionally. Calendar week ranges indicate primary activity; teams work in parallel where dependencies allow.

**Board Recommendation:** Approve this 52-week roadmap with ₹45K–65K/month infrastructure budget (Phase 1), 12–15 person peak team, and Gate 5 go-live at Week 52.

---

# 1. ROADMAP PRINCIPLES

| # | Principle | Application |
|---|-----------|---------------|
| 1 | **API-first** | Backend APIs ready before client features that consume them |
| 2 | **Parallel client development** | Mobile and CRM start when backend APIs stabilize per module |
| 3 | **AI after core LOS** | AI Advisor requires application + product + KB data |
| 4 | **Voice after text AI** | Voice AI builds on Advisor chat pipeline |
| 5 | **Test continuously** | QA engaged from Week 5; not a Phase 9 surprise |
| 6 | **Infra matures early** | QA at Week 5; UAT at Week 22; Prod at Week 48 |
| 7 | **Bi-weekly releases from Week 10** | `develop` → QA continuous integration |

---

# 2. TEAM COMPOSITION BY PHASE

| Role | Ph 1–2 | Ph 3–5 | Ph 6–8 | Ph 9–10 |
|------|--------|--------|--------|---------|
| CTO / Architect | 1 | 1 | 1 | 1 |
| Backend Engineers | 2–3 | 3–4 | 2–3 | 2 |
| Mobile Engineers | 0–1 | 2–3 | 2 | 1 |
| Frontend (CRM) Engineers | 0 | 1–2 | 2 | 1 |
| AI/ML Engineer | 0 | 0–1 | 1–2 | 1 |
| DevOps / SRE | 1 | 1 | 1 | 1 |
| QA Lead + Engineers | 0–1 | 1–2 | 2–3 | 2–3 |
| Product Owner | 1 | 1 | 1 | 1 |
| UX Designer | 0–1 | 1 | 0–1 | 0 |
| **Total** | **5–8** | **10–14** | **12–15** | **10–12** |

---

# 3. ENVIRONMENT MATURITY TIMELINE

| Week | Environment | Milestone |
|------|-------------|-----------|
| 1–4 | Development (local + shared) | Monorepo, CI, local dev guide |
| 5 | QA | Auto-deploy on `develop` merge |
| 22 | UAT | `release/*` deploy; business testing begins |
| 48 | Production | Infrastructure provisioned |
| 52 | Production | Go-live |

*Aligned with DevOps §29 Development to Production Roadmap*

---

# 4. PHASE 1 — FOUNDATION

## 4.1 Overview

| Attribute | Value |
|-----------|-------|
| **Calendar weeks** | 1–4 |
| **Duration** | 4 weeks |
| **Objective** | Establish monorepo, CI/CD, development standards, auth scaffold, QA environment |
| **Gate** | Gate 1 — Foundation Ready (Week 4, re-certified Week 8) |

## 4.2 Milestones

| # | Milestone | Week |
|---|-----------|------|
| M1.1 | Monorepo scaffold with pnpm workspaces | 1 |
| M1.2 | GitHub branch protection + Git workflow | 1 |
| M1.3 | CI pipeline (lint, typecheck, test, build) | 2 |
| M1.4 | Backend Express scaffold + Prisma + health endpoint | 2 |
| M1.5 | Auth schema migration (users, OTP, sessions) | 3 |
| M1.6 | OTP send/verify prototype | 3 |
| M1.7 | QA environment provisioned | 4 |
| M1.8 | Developer onboarding documentation | 4 |

## 4.3 Weekly Deliverables

| Week | Backend | DevOps | QA |
|------|---------|--------|-----|
| **W1** | Express app, Prisma setup, shared middleware (request-id, helmet, cors, error-handler), health endpoint | GitHub repo, branch protection, monorepo structure | — |
| **W2** | Auth DB schema; OTP service stub; JWT service stub | GitHub Actions CI: lint, typecheck, test, build; Prisma local setup | — |
| **W3** | OTP send/verify flow; SMS integration stub; rate limiting | Pre-commit hooks; secret scanning; shared dev EC2 (optional) | Test plan template |
| **W4** | JWT issue/refresh; RBAC middleware skeleton; audit log infrastructure | QA EC2 + RDS + S3 provisioned; CD to QA pipeline start | QA environment validation |

## 4.4 Dependencies

| Dependency | Required By | Source |
|------------|-------------|--------|
| GitHub organization + repo | W1 | Business |
| AWS account (non-prod) | W4 | Business |
| Domain `kuberone.in` | W4 | Business |
| SMS provider account | W3 | Business |
| OpenAI API key (dev) | W4 | Business |

## 4.5 Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| AWS account delay | QA env slips to W5 | Use local Docker for W4; parallel account setup |
| Monorepo tooling issues | CI instability | Pin pnpm + Node 20 LTS; follow Folder Structure doc |
| Team onboarding delay | W1 scaffold slow | Pre-read architecture docs; pair programming Week 1 |
| SMS provider KYC delay | OTP testing blocked | Mock SMS in dev; test provider early |

## 4.6 Exit Criteria

- [ ] CI pipeline runs on every PR (lint + test + build)
- [ ] All developers can run full stack locally
- [ ] Git workflow documented and followed
- [ ] No secrets in repository (verified by scanning)
- [ ] QA environment health check returns 200
- [ ] Auth OTP flow works end-to-end in dev

---

# 5. PHASE 2 — BACKEND CORE

## 5.1 Overview

| Attribute | Value |
|-----------|-------|
| **Calendar weeks** | 5–18 |
| **Duration** | 14 weeks |
| **Objective** | Complete modular monolith backend — auth, users, LMS, LOS, documents, KYC |
| **Aligns with** | Backend Blueprint §32 Phases 1–5 (Weeks 1–17) + buffer |

## 5.2 Milestones

| # | Milestone | Week |
|---|-----------|------|
| M2.1 | Auth + RBAC complete | 7 |
| M2.2 | Customer + DSA registration APIs | 9 |
| M2.3 | LMS (leads, assignment, scoring) | 12 |
| M2.4 | LOS (S01–S09 lifecycle) | 16 |
| M2.5 | Documents + KYC + S3 + OCR | 18 |

## 5.3 Sub-Phase Mapping (Backend Blueprint §32)

### Weeks 5–7: Authentication (Blueprint Phase 1)

| Week | Deliverables |
|------|-------------|
| **W5** | OTP production flow; SMS integration; rate limiting; JWT issue/refresh/rotation; session management |
| **W6** | Employee login (email + password); MFA (TOTP); RBAC middleware; permission registry; role seed data |
| **W7** | Audit log infrastructure; auth event logging; integration tests: full auth flow |

**Exit:** OTP login, JWT refresh, RBAC middleware, rate limiting, audit events.

### Weeks 8–10: Users & Parties (Blueprint Phase 2)

| Week | Deliverables |
|------|-------------|
| **W8** | User module CRUD; customer registration + profile + addresses + employment + income |
| **W9** | Customer consent, dashboard, preferences; partner (DSA) registration + profile + KYC |
| **W10** | Partner bank details, agreement, onboarding; organization (branches, regions, employees); settings; CRM list endpoints with scope filtering |

**Exit:** Customer + DSA onboarding; org hierarchy; PII masking; CRM list APIs.

### Weeks 11–13: LMS (Blueprint Phase 3)

| Week | Deliverables |
|------|-------------|
| **W11** | Product catalog, lender policies, public product endpoints; lead creation (all sources) |
| **W12** | Lead assignment (auto + manual); lead scoring engine |
| **W13** | Lead qualification, conversion, activities, SLA; DSA lead endpoints; campaign CRUD; SLA jobs |

**Exit:** Leads from all sources; assignment; scoring; lead → application conversion path.

### Weeks 14–17: LOS (Blueprint Phase 4)

| Week | Deliverables |
|------|-------------|
| **W14** | Application creation, wizard, product-specific details (HL, LAP, BL, AL); eligibility engine |
| **W15** | EMI engine; LOS stage manager S01–S09; application submission S01→S03 |
| **W16** | Credit review queue; approve/reject S05→S06; sanction letter generation |
| **W17** | Bank login S07; disbursement S08; closure S09; timeline views (customer, DSA, CRM) |

**Exit:** Full S01–S09 for all 4 products; eligibility; EMI; SoD on credit; audit trail.

### Weeks 17–18: Documents & KYC (Blueprint Phase 5)

| Week | Deliverables |
|------|-------------|
| **W17–18** | S3 presigned upload; document module; KYC (PAN, Aadhaar); verification; OCR worker; deficiency management; versioning |

**Exit:** Presigned S3 upload; PAN/Aadhaar verification; checklist per stage; OCR; deficiency notices.

## 5.4 Dependencies

| Dependency | Required By |
|------------|-------------|
| Phase 1 complete (CI, QA env) | W5 |
| KYC provider (PAN/Aadhaar) | W17 |
| AWS S3 buckets | W17 |
| Product rules seeded (HL, LAP, BL, AL) | W14 |
| RBAC seed data (15+ roles) | W6 |

## 5.5 Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| LOS complexity (S01–S09) | 2-week slip | Prioritize HL first; LAP/BL/AL follow |
| KYC provider integration delay | Document phase blocked | Mock KYC; parallel contract negotiation |
| Eligibility rule disputes | Rework | Product sign-off on rules by W13 |
| OCR accuracy | Manual review fallback | Human-in-the-loop verification |

## 5.6 Exit Criteria

- [ ] All Backend Blueprint Phase 1–5 exit criteria met (§32.2–32.6)
- [ ] Integration test suite covers all modules
- [ ] API published in OpenAPI spec
- [ ] QA regression core pass
- [ ] CRM list + LOS APIs ready for client consumption

---

# 6. PHASE 3 — CUSTOMER APP

## 6.1 Overview

| Attribute | Value |
|-----------|-------|
| **Calendar weeks** | 12–24 |
| **Duration** | 13 weeks |
| **Objective** | Customer React Native app — 191 Phase 1 screens |
| **Starts** | W12 (when auth + customer APIs ready) |

## 6.2 Milestones

| # | Milestone | Week |
|---|-----------|------|
| M3.1 | App scaffold + design system + navigation | 14 |
| M3.2 | Auth (OTP login) + home dashboard | 16 |
| M3.3 | Product browse + eligibility + EMI | 18 |
| M3.4 | Application wizard (HL complete) | 21 |
| M3.5 | Documents + KYC upload | 23 |
| M3.6 | AI Advisor chat integration | 24 |
| M3.7 | UAT-ready customer app build | 24 |

## 6.3 Weekly Deliverables

| Week | Deliverables |
|------|-------------|
| **W12–13** | Expo scaffold; design system tokens; navigation architecture; Redux + React Query setup; API client layer |
| **W14–15** | Auth screens (OTP, onboarding); home dashboard; profile; settings; push notification registration |
| **W16–17** | Product listing; product detail; eligibility check; EMI calculator + comparison; lender comparison |
| **W18–19** | Application wizard framework; HL wizard (all steps); LAP wizard |
| **W20–21** | BL + AL wizards; application status tracking; timeline view; notifications center |
| **W22–23** | Document upload (presign camera/gallery); KYC flow; deficiency notices; consent management |
| **W24** | AI Advisor chat UI; referral module; support ticket; polish + UAT build (preview flavor) |

## 6.4 Dependencies

| Dependency | Required By |
|------------|-------------|
| Auth APIs (Phase 2, W7) | W14 |
| Customer profile APIs (W10) | W15 |
| Product + eligibility APIs (W11–14) | W16 |
| Application APIs (W14–17) | W18 |
| Document presign APIs (W17–18) | W22 |
| AI chat API (Phase 6, W30) | W24 (stub earlier; integrate W30) |
| Firebase FCM project | W15 |
| EAS build pipeline | W16 |

## 6.5 Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| 191 screens — scope creep | 3-week slip | MVP subset for UAT; polish in Phase 9 |
| iOS/Android parity issues | Store delay | Weekly device matrix testing from W16 |
| App Store review delay | Go-live slip | Submit W48; 2-week buffer |
| API changes break mobile | Rework | OpenAPI contract tests; MSW mocks |

## 6.6 Exit Criteria

- [ ] OTP login works on iOS + Android
- [ ] HL application wizard completable end-to-end
- [ ] Document upload works against QA/UAT API
- [ ] Push notifications received
- [ ] Maestro smoke suite pass (8 critical journeys)
- [ ] Preview build distributed to UAT testers

---

# 7. PHASE 4 — DSA APP

## 7.1 Overview

| Attribute | Value |
|-----------|-------|
| **Calendar weeks** | 20–28 |
| **Duration** | 9 weeks |
| **Objective** | DSA partner mobile app — 55 Phase 1 screens |
| **Starts** | W20 (when partner APIs + lead APIs ready) |

## 7.2 Milestones

| # | Milestone | Week |
|---|-----------|------|
| M4.1 | DSA app scaffold (shared platform) | 21 |
| M4.2 | Partner onboarding + KYC | 23 |
| M4.3 | Lead creation + tracking | 25 |
| M4.4 | Commission view + application conversion | 27 |
| M4.5 | UAT-ready DSA build | 28 |

## 7.3 Weekly Deliverables

| Week | Deliverables |
|------|-------------|
| **W20–21** | DSA app scaffold (reuse shared packages); navigation; auth; partner registration screens |
| **W22–23** | KYC submission; bank details; agreement acceptance; partner dashboard |
| **W24–25** | Lead creation form; lead list; lead detail; activity log; push on assignment |
| **W26–27** | Lead → application conversion; application status view; commission ledger; payout history |
| **W28** | AI lead qualification assistance; notifications; polish; UAT preview build |

## 7.4 Dependencies

| Dependency | Required By |
|------------|-------------|
| Partner APIs (W10) | W21 |
| DSA lead APIs (W13) | W24 |
| Commission APIs (W32–36, parallel) | W27 |
| Customer app shared packages | W20 |
| DSA agreement template (legal) | W23 |

## 7.5 Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Partner onboarding legal delay | KYC flow blocked | Legal review by W18 |
| Commission API not ready | W27 feature slips | Phase 8 parallel; stub UI |
| Low DSA tester availability | UAT quality | Recruit 3 pilot DSAs by W22 |

## 7.6 Exit Criteria

- [ ] DSA registration → KYC → agreement → active lifecycle works
- [ ] Lead submit + track + convert to application
- [ ] Commission ledger displays correctly
- [ ] Maestro smoke pass (6 critical journeys)
- [ ] Preview build on UAT

---

# 8. PHASE 5 — CRM ADMIN PANEL

## 8.1 Overview

| Attribute | Value |
|-----------|-------|
| **Calendar weeks** | 22–34 |
| **Duration** | 13 weeks |
| **Objective** | CRM admin panel — role-based SPA for sales, credit, ops, finance, compliance |
| **Starts** | W22 (when CRM APIs + LOS APIs ready) |

## 8.2 Milestones

| # | Milestone | Week |
|---|-----------|------|
| M5.1 | Admin scaffold + auth + layout | 24 |
| M5.2 | Lead management module | 27 |
| M5.3 | LOS operations (stages, credit, disbursement) | 30 |
| M5.4 | Document verification + KYC review | 32 |
| M5.5 | Commission + finance module | 33 |
| M5.6 | Compliance + audit + UAT-ready | 34 |

## 8.3 Weekly Deliverables

| Week | Deliverables |
|------|-------------|
| **W22–23** | Vite + React scaffold; auth (employee login + MFA); layout (sidebar, header); permission guard hooks |
| **W24–25** | Dashboard (role-specific); customer list + detail; partner list + detail; branch/region views |
| **W26–27** | Lead list + detail + assignment + scoring view; lead activities; campaign management |
| **W28–29** | Application list + detail; LOS stage controls; timeline; eligibility view; EMI tools |
| **W30–31** | Credit review queue; approve/reject; sanction generation; bank login; disbursement recording |
| **W32–33** | Document verification queue; deficiency management; KYC review; commission rules + ledger + batch approval |
| **W34** | Support tickets; analytics dashboards; audit log viewer; settings; Playwright E2E per role |

## 8.4 Dependencies

| Dependency | Required By |
|------------|-------------|
| Employee auth API (W6) | W23 |
| CRM customer/partner APIs (W10) | W25 |
| Lead APIs (W11–13) | W27 |
| LOS/credit APIs (W14–17) | W30 |
| Document APIs (W17–18) | W32 |
| Commission APIs (Phase 8) | W33 |
| Analytics APIs (Phase 8) | W34 |

## 8.5 Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| 46 Playwright E2E flows — time | Phase 9 pressure | Prioritize P0 roles first (credit, ops, sales) |
| RBAC complexity | Security defects | RBAC traceability matrix as test oracle |
| SoD not enforced in UI | Compliance risk | Server-side SoD primary; UI mirrors |
| Scope overlap with Phase 8 analytics | Dashboard slips | MVP dashboards; enrich post-go-live |

## 8.6 Exit Criteria

- [ ] All 9 CRM role personas can login and access scoped data
- [ ] Full LOS operations completable (S01–S09) from CRM
- [ ] Credit review with SoD enforced
- [ ] Document verification queue operational
- [ ] Playwright smoke pass (15 flows); P0 role E2E complete
- [ ] UAT admin build on `uat-admin.kuberone.in`

---

# 9. PHASE 6 — AI ADVISOR

## 9.1 Overview

| Attribute | Value |
|-----------|-------|
| **Calendar weeks** | 26–36 |
| **Duration** | 11 weeks |
| **Objective** | AI Advisor (customer chat), RAG knowledge base, Sales Copilot (CRM) |
| **Aligns with** | AI RAG Architecture Phases 1–3 (Advisor + Lead Scoring + Copilot) |

## 9.2 Milestones

| # | Milestone | Week |
|---|-----------|------|
| M6.1 | Knowledge base CMS + ingestion pipeline | 28 |
| M6.2 | RAG retrieval (embed, index, search) | 30 |
| M6.3 | AI Advisor chat (English + Hindi) | 32 |
| M6.4 | Sales Copilot (lead score, NBA, approval prediction) | 34 |
| M6.5 | AI safety controls + eval harness | 36 |

## 9.3 Weekly Deliverables

| Week | Deliverables |
|------|-------------|
| **W26–27** | KB module: articles, FAQs, admin CMS; content ingestion API |
| **W28–29** | RAG pipeline: chunking, embedding (OpenAI), indexing worker; vector store (MySQL Phase 1) |
| **W30–31** | AI Advisor: chat engine, context builder, RAG retrieval, streaming; recommendation engine; eligibility assistance |
| **W32–33** | AI Sales Copilot: lead scoring; approval prediction; risk analysis; next best action; missing documents |
| **W34–35** | Guard rails; rate limits; content filter; PII redaction; token usage tracking; AI audit logging |
| **W36** | AI eval harness; golden question set (150); Compliance review of AI responses |

## 9.4 Dependencies

| Dependency | Required By |
|------------|-------------|
| Backend core (products, eligibility, LOS) | W30 |
| OpenAI API production budget | W28 |
| KB content (100+ articles) | W28 |
| CRM copilot UI (Phase 5, W30+) | W33 |
| Customer app AI chat UI (Phase 3, W24+) | W31 |
| Compliance AI disclaimer approval | W34 |

## 9.5 Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenAI cost overrun | Budget breach | Token limits; caching; model selection |
| RAG retrieval quality | Poor AI answers | 100+ curated articles; eval harness from W30 |
| Hindi response quality | UAT failure | Native speaker review; tolerance bands |
| AI regulatory concern | Go-live block | Human-in-the-loop; disclaimer; Compliance sign-off |
| Hallucination on financial advice | Reputational harm | Guard rails; cite sources; escalate to human |

## 9.6 Exit Criteria

- [ ] KB articles indexed and retrievable via RAG
- [ ] AI Advisor answers product/eligibility questions (90%+ eval pass)
- [ ] Copilot provides lead scores and NBAs in CRM
- [ ] AI rate limits and safety controls operational
- [ ] Token usage within budget
- [ ] Compliance approves AI disclaimer and sample responses

---

# 10. PHASE 7 — VOICE AI

## 10.1 Overview

| Attribute | Value |
|-----------|-------|
| **Calendar weeks** | 34–42 |
| **Duration** | 9 weeks |
| **Objective** | In-app voice assistant — STT, TTS, voice-to-chat pipeline |
| **Aligns with** | AI RAG Architecture Phase 4 (Voice AI, Weeks 14–17 relative) |

## 10.2 Milestones

| # | Milestone | Week |
|---|-----------|------|
| M7.1 | Voice module backend scaffold | 35 |
| M7.2 | STT integration (Deepgram/Whisper) | 37 |
| M7.3 | TTS integration (OpenAI TTS) | 38 |
| M7.4 | Voice → Advisor pipeline → voice response | 40 |
| M7.5 | Customer app voice UI + Hindi voice | 42 |

## 10.3 Weekly Deliverables

| Week | Deliverables |
|------|-------------|
| **W34–35** | Voice module: session management; audio upload endpoint; voice audit logging |
| **W36–37** | STT integration (Deepgram streaming + Whisper batch); language detection (EN/HI) |
| **W38–39** | TTS integration (OpenAI TTS — `nova` voice EN); text → audio response endpoint |
| **W40–41** | Voice → text → Advisor chat pipeline → TTS output; guard rails on voice path |
| **W42** | Customer app voice UI (push-to-talk); Hindi TTS (Phase 2 voice); voice eval fixtures (20 audio samples) |

## 10.4 Dependencies

| Dependency | Required By |
|------------|-------------|
| AI Advisor chat pipeline (Phase 6, W31) | W40 |
| Deepgram / OpenAI API keys | W36 |
| Customer app (Phase 3) | W42 |
| Microphone permissions (mobile) | W42 |

## 10.5 Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Voice latency > 3s | Poor UX | Streaming STT; edge caching |
| Hindi STT accuracy | Failed UAT | Deepgram Hindi model; fallback to text |
| Voice cost (STT+TTS+LLM) | Budget | Session limits; max duration cap |
| Background noise (India market) | Recognition errors | Push-to-talk; confirmation prompts |

## 10.6 Exit Criteria

- [ ] Voice session completes end-to-end in customer app (EN)
- [ ] STT WER < 10% on golden audio fixtures
- [ ] TTS response generated within 2s of LLM completion
- [ ] Voice path uses same guard rails as text AI
- [ ] Voice sessions audited in `chat_sessions`
- [ ] Hindi voice (minimum viable) tested

---

# 11. PHASE 8 — ANALYTICS & ECONOMICS

## 11.1 Overview

| Attribute | Value |
|-----------|-------|
| **Calendar weeks** | 32–42 |
| **Duration** | 11 weeks (overlaps Voice AI) |
| **Objective** | Notifications, referrals, commission, support, analytics dashboards |
| **Aligns with** | Backend Blueprint Phase 7 (Weeks 21–23) + AI RAG Phase 5 (Management AI) |

## 11.2 Milestones

| # | Milestone | Week |
|---|-----------|------|
| M8.1 | Notification engine (FCM, SMS, WA, email) | 34 |
| M8.2 | Referral engine | 36 |
| M8.3 | Commission engine (rules, ledger, payout) | 38 |
| M8.4 | Support module (tickets, SLA) | 39 |
| M8.5 | Analytics dashboards + scheduled snapshots | 42 |

## 11.3 Weekly Deliverables

| Week | Deliverables |
|------|-------------|
| **W32–33** | Notification engine: FCM push, SMS, email, WhatsApp, in-app; templates; preferences; device management |
| **W34–35** | Referral engine: tracking, reward logic, analytics; referral codes; reward on disbursement |
| **W36–37** | Commission engine: rules, ledger, approval workflow, settlement; weekly batch job |
| **W38–39** | Support module: tickets, assignment, escalation, SLA, feedback |
| **W40–41** | Analytics module: snapshots, dashboards (lead, revenue, partner, branch); report generation worker |
| **W42** | Management AI weekly digest (AI RAG Phase 5); scheduled snapshot job; CRM dashboard integration |

## 11.4 Dependencies

| Dependency | Required By |
|------------|-------------|
| Disbursement events (LOS, W17) | W36 (referral rewards) |
| FCM project (mobile, W15) | W34 |
| WhatsApp Business API | W34 |
| Partner commission rules (Finance) | W36 |
| CRM dashboard UI (Phase 5) | W42 |

## 11.5 Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| WhatsApp template approval delay | Notification channel missing | Apply templates by W30 |
| Commission rule complexity | Finance disputes | Finance sign-off by W36 |
| Analytics performance | Slow dashboards | Snapshot pre-aggregation; indexes |
| Referral fraud | Revenue loss | Idempotency; device fingerprint (Phase 2) |

## 11.6 Exit Criteria

- [ ] Push notifications delivered to mobile apps
- [ ] WhatsApp and SMS notifications operational
- [ ] Referral tracking and rewards on disbursement
- [ ] Commission calculated, approved, and settled (test payout)
- [ ] Support tickets with SLA enforcement
- [ ] Analytics dashboards serving aggregated data in CRM

---

# 12. PHASE 9 — TESTING & HARDENING

## 12.1 Overview

| Attribute | Value |
|-----------|-------|
| **Calendar weeks** | 40–50 |
| **Duration** | 11 weeks |
| **Objective** | Full regression automation, security testing, performance testing, UAT cycles, readiness scoring |
| **Gate** | Gate 2 (W40), Gate 3 (W46), Gate 4 (W50) |

## 12.2 Milestones

| # | Milestone | Week |
|---|-----------|------|
| M9.1 | Integration test suite complete (all modules) | 42 |
| M9.2 | Playwright CRM E2E (P0 roles) + Detox mobile E2E | 44 |
| M9.3 | RBAC matrix 95% automated | 45 |
| M9.4 | OWASP ZAP + pen test complete | 46 |
| M9.5 | k6 load test pass (500 concurrent) | 47 |
| M9.6 | UAT cycle 1 + sign-off | 48 |
| M9.7 | UAT cycle 2 (final) + certification | 50 |

## 12.3 Weekly Deliverables

| Week | Deliverables |
|------|-------------|
| **W40–41** | Integration test gap closure; API contract 100%; security test suite (injection, auth bypass) |
| **W42–43** | Playwright E2E P0 roles (credit, ops, sales, finance); Detox customer + DSA critical paths |
| **W44–45** | RBAC matrix automation (500+ cells); AI eval golden set execution; Maestro daily smoke operational |
| **W46** | OWASP ZAP full scan; third-party penetration test begins; UAT environment ready (Gate 3) |
| **W47** | k6 peak load (500 VU); performance regression baseline; pen test report remediation |
| **W48** | UAT cycle 1 execution (5 days); defect fixes; readiness score ≥ 90% |
| **W49** | UAT cycle 2 (final); release certification; readiness score ≥ 93% (Gate 4) |
| **W50** | Full certification regression; mobile store preview builds validated; production rehearsal on UAT |

## 12.4 Dependencies

| Dependency | Required By |
|------------|-------------|
| All feature phases substantially complete | W40 |
| UAT environment (DevOps W22+) | W46 |
| Security vendor contracted | W46 |
| k6 test EC2 | W47 |
| Business UAT participants scheduled | W48 |
| Pilot DSA partners + beta customers | W48 |

## 12.5 Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Pen test findings — critical | 2-week slip | Schedule pen test W46; buffer to W50 |
| UAT participant no-show | Sign-off delay | Confirm participants W44; backup pool |
| Flaky E2E tests | CI noise | Quarantine policy; fix or replace by W44 |
| Load test fails | Performance rework | Weekly k6 from W40; optimize early |

## 12.6 Exit Criteria

- [ ] All integration tests pass
- [ ] Security scan clean (no critical/high)
- [ ] Load test meets targets (p95 < 300ms at 500 VU)
- [ ] UAT sign-off form signed
- [ ] Release certification issued
- [ ] Readiness score ≥ 93% (Gate 4)
- [ ] All 13 non-negotiable readiness items complete

---

# 13. PHASE 10 — PRODUCTION

## 13.1 Overview

| Attribute | Value |
|-----------|-------|
| **Calendar weeks** | 48–52 |
| **Duration** | 5 weeks |
| **Objective** | Production infrastructure, go-live, store releases, monitoring, DR |
| **Gate** | Gate 5 — Go-Live (Week 52) |
| **Aligns with** | Backend Blueprint Phase 8 (Weeks 24–26) + DevOps §28 Go-Live |

## 13.2 Milestones

| # | Milestone | Week |
|---|-----------|------|
| M10.1 | Production infrastructure provisioned | 49 |
| M10.2 | Production deploy rehearsal | 50 |
| M10.3 | Mobile store submissions | 50 |
| M10.4 | Production deploy + smoke | 51 |
| M10.5 | Go-live + 30-day monitoring plan | 52 |

## 13.3 Weekly Deliverables

| Week | Deliverables |
|------|-------------|
| **W48–49** | Production VPC, EC2, RDS Multi-AZ, S3, Nginx, PM2, SSL; SSM secrets; monitoring + alerting; backup verification |
| **W49–50** | Production seed data (products, roles, config); readiness scorecard ≥ 95%; all 90 DevOps §28 items checked |
| **W50** | Mobile store submissions (Customer + DSA, iOS + Android); production deploy rehearsal on UAT; rollback test |
| **W51** | Production deploy (`main`); smoke tests; 30-minute monitoring; Gate 5 sign-offs |
| **W52** | Go-live announcement; on-call active; DR drill scheduled; post-go-live retrospective plan; Board briefing |

## 13.4 Dependencies

| Dependency | Required By |
|------------|-------------|
| Phase 9 UAT sign-off + certification | W51 |
| Production AWS account | W48 |
| App Store / Play Store developer accounts | W50 |
| Privacy policy + terms published | W50 |
| Board go-live approval | W52 |
| On-call rotation | W51 |

## 13.5 Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| App Store rejection | 1–2 week delay | Submit W50; expedited review request |
| Production infra misconfiguration | Go-live delay | Rehearsal W50; DevOps §28 checklist |
| Go-live with open S2 defect | Customer impact | Zero S1/S2 policy; no waivers on non-negotiables |
| Team burnout at crunch | Quality drop | Scope freeze W48; no new features |

## 13.6 Exit Criteria

- [ ] All Backend Blueprint Phase 8 exit criteria (§32.9)
- [ ] All DevOps §28 items (90) complete
- [ ] All Production Readiness Framework items (135) ≥ 95%
- [ ] Gate 5 sign-offs (CTO, DevOps, Backend, QA, Product, Compliance, Board)
- [ ] Customer + DSA apps live in stores (or approved pending release)
- [ ] Monitoring and alerting configured
- [ ] Backup and restore verified
- [ ] DR drill scheduled within 30 days
- [ ] Go-live approved by CTO

---

# 14. MASTER TIMELINE (GANTT SUMMARY)

```
Week:  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52
       ├──┤ Ph1 Foundation
             ├──────────────────────────────────┤ Ph2 Backend Core
                               ├─────────────────────────────────┤ Ph3 Customer App
                                                 ├──────────────────┤ Ph4 DSA App
                                                       ├─────────────────────────────┤ Ph5 CRM
                                                             ├───────────────────────────┤ Ph6 AI Advisor
                                                                       ├──────────────────────┤ Ph7 Voice AI
                                                                             ├──────────────────────────┤ Ph8 Analytics
                                                                                       ├─────────────────────────────┤ Ph9 Testing
                                                                                                         ├──────────────┤ Ph10 Production
       G1──┤    G1────┤                                                         G2────────┤        G3────┤  G4──┤ G5┤
       QA env─┤  UAT env─────────────────────────────────────────────────────────────────────────────┤  Prod env─┤
```

**Gates:** G1 = Foundation (W4/8) · G2 = Platform Test Ready (W38) · G3 = UAT Ready (W46) · G4 = Release Candidate (W50) · G5 = Go-Live (W52)

---

# 15. SPRINT PLANNING FRAMEWORK

## 15.1 Sprint Cadence

| Attribute | Value |
|-----------|-------|
| Sprint length | 2 weeks |
| Total sprints (52 weeks) | 26 |
| Sprint planning | Monday Week 1 of sprint (2 hours) |
| Sprint review | Friday Week 2 of sprint (1 hour) |
| Retrospective | Friday Week 2 of sprint (45 min) |
| Daily standup | 15 min |

## 15.2 Sprint Planning Inputs

| Input | Source |
|-------|--------|
| Phase milestones | This roadmap |
| Prioritized backlog | Product Owner |
| Technical dependencies | Engineering Leads |
| QA capacity | QA Lead |
| Defect backlog | Defect tracker |
| Readiness score | Production Readiness Framework |

## 15.3 Definition of Ready (Story)

| Criterion | Required |
|-----------|----------|
| User story with acceptance criteria | Yes |
| API spec exists (if backend) | Yes |
| Design reference (if UI) | Yes |
| Dependencies identified | Yes |
| Test approach noted | Yes |
| RBAC impact assessed | Yes (if applicable) |
| Estimated (story points) | Yes |

## 15.4 Definition of Done (Sprint)

| Criterion | Required |
|-----------|----------|
| Code merged to `develop` | Yes |
| CI pass (lint + test + build) | Yes |
| Unit tests for new logic | Yes |
| Code review approved | Yes |
| Deployed to QA | Yes |
| QA smoke pass | Yes |
| Documentation updated (if API change) | Yes |
| OpenAPI spec updated (if API change) | Yes |
| Audit logging (if mutation endpoint) | Yes |
| RBAC middleware (if protected endpoint) | Yes |

---

# 16. CROSS-PHASE DEPENDENCY MATRIX

| Phase | Depends On | Blocks |
|-------|------------|--------|
| 1 Foundation | Business (AWS, repo) | All phases |
| 2 Backend | Phase 1 | 3, 4, 5, 6, 8 |
| 3 Customer App | Phase 2 (auth, customer, product, apply APIs) | Phase 9 UAT |
| 4 DSA App | Phase 2 (partner, lead APIs); Phase 3 (shared pkgs) | Phase 9 UAT |
| 5 CRM | Phase 2 (CRM, LOS APIs) | Phase 9 UAT |
| 6 AI Advisor | Phase 2 (products, LOS); Phase 5 (CRM copilot UI) | Phase 7, 3 (AI chat) |
| 7 Voice AI | Phase 6 (Advisor pipeline); Phase 3 (mobile) | Phase 9 |
| 8 Analytics | Phase 2 (disbursement events); Phase 5 (CRM dashboards) | Phase 9 |
| 9 Testing | Phases 2–8 substantially complete | Phase 10 |
| 10 Production | Phase 9 certification | — |

---

# 17. PROGRAM-LEVEL RISKS

| # | Risk | Probability | Impact | Mitigation | Owner |
|---|------|-------------|--------|------------|-------|
| 1 | 52-week timeline slips to 60+ weeks | Medium | High | Parallel tracks; MVP scope lock W40 | CTO |
| 2 | Key hire delay (mobile, AI) | Medium | High | Contract resources; cross-train backend | CTO |
| 3 | Regulatory change (RBI, DPDP) | Low | High | Compliance engaged from W1; quarterly review | Compliance |
| 4 | OpenAI API pricing change | Medium | Medium | Budget buffer 20%; model fallback plan | AI Lead |
| 5 | KYC/SMS provider integration failure | Medium | Medium | Dual provider strategy; mocks for dev | Backend Lead |
| 6 | Scope creep (new loan products) | High | Medium | Phase 1 locked to HL/LAP/BL/AL only | Product |
| 7 | Security pen test failure | Medium | High | Early ZAP scans from W30; security review per PR | Security |
| 8 | Team attrition | Medium | High | Documentation culture; pair programming; competitive comp | CTO |

---

# 18. SUCCESS METRICS (WEEK 52)

| Metric | Target |
|--------|--------|
| Production availability (first 30 days) | ≥ 99.9% |
| Customer app crash-free sessions | ≥ 99.5% |
| API p95 latency | < 300ms |
| UAT script pass rate (final) | ≥ 95% |
| P1 production incidents (first 30 days) | ≤ 1 |
| AI Advisor eval pass rate | ≥ 90% |
| Commission calculation accuracy | 100% (finance verified) |
| Store rating (first 30 days) | ≥ 4.0 |
| Lead-to-application conversion (pilot) | Baseline established |
| Readiness score at go-live | ≥ 95% |

---

# APPENDIX A: SPRINT-TO-PHASE MAPPING

| Sprint | Weeks | Primary Phase(s) | Key Deliverable |
|--------|-------|------------------|-----------------|
| S1 | 1–2 | 1 | Monorepo + CI |
| S2 | 3–4 | 1 | Auth scaffold + QA env |
| S3 | 5–6 | 2 | OTP + JWT + RBAC |
| S4 | 7–8 | 2 | Auth complete + customer APIs start |
| S5 | 9–10 | 2 | Customer + DSA registration |
| S6 | 11–12 | 2, 3 | LMS + mobile scaffold |
| S7 | 13–14 | 2, 3 | Lead module + mobile auth |
| S8 | 15–16 | 2, 3 | LOS start + mobile products |
| S9 | 17–18 | 2, 3 | LOS S01–S09 + app wizard |
| S10 | 19–20 | 2, 3, 4 | Documents + DSA scaffold |
| S11 | 21–22 | 3, 4, 5 | Mobile docs + CRM scaffold + UAT env |
| S12 | 23–24 | 3, 4, 5 | Customer UAT build + CRM auth |
| S13 | 25–26 | 4, 5, 6 | DSA leads + CRM leads + AI KB |
| S14 | 27–28 | 4, 5, 6 | DSA UAT build + CRM LOS + RAG |
| S15 | 29–30 | 5, 6 | CRM credit + AI Advisor |
| S16 | 31–32 | 5, 6, 7, 8 | CRM docs + Copilot + notifications |
| S17 | 33–34 | 5, 6, 7, 8 | CRM commission + voice start + referral |
| S18 | 35–36 | 6, 7, 8 | AI safety + voice STT + commission |
| S19 | 37–38 | 7, 8 | Voice TTS + support module |
| S20 | 39–40 | 7, 8, 9 | Voice UI + analytics + test start |
| S21 | 41–42 | 8, 9 | Analytics dashboards + E2E automation |
| S22 | 43–44 | 9 | Playwright + Detox + RBAC matrix |
| S23 | 45–46 | 9 | ZAP + pen test + UAT ready (G3) |
| S24 | 47–48 | 9, 10 | k6 load + UAT cycle 1 + prod infra |
| S25 | 49–50 | 9, 10 | UAT final + store submit + G4 |
| S26 | 51–52 | 10 | Production deploy + go-live (G5) |

---

# APPENDIX B: LOAN PRODUCT DELIVERY SEQUENCE

| Product | Code | Backend (Phase 2) | Customer App (Phase 3) | CRM (Phase 5) |
|---------|------|-------------------|------------------------|---------------|
| Home Loan | HL-01 | W14–17 | W18–19 | W28–30 |
| Loan Against Property | LAP-01 | W14–17 | W19 | W28–30 |
| Business Loan | BL-01 | W14–17 | W20 | W28–30 |
| Auto Loan | AL-01 | W14–17 | W20 | W28–30 |

---

# APPENDIX C: AI DELIVERY SEQUENCE (CROSS-REFERENCE)

| AI RAG Phase | AI RAG Weeks | Roadmap Phase | Calendar Weeks |
|--------------|-------------|---------------|----------------|
| Phase 1: Advisor + RAG | 1–6 | Phase 6 | W26–31 |
| Phase 2: Lead scoring AI | 7–9 | Phase 6 | W32–33 |
| Phase 3: Sales Copilot | 10–13 | Phase 6 | W33–35 |
| Phase 4: Voice AI | 14–17 | Phase 7 | W34–42 |
| Phase 5: Management AI | 18–20 | Phase 8 | W42 |

---

# APPENDIX D: INFRASTRUCTURE DELIVERY SEQUENCE (CROSS-REFERENCE)

| DevOps Roadmap Phase | DevOps Weeks | Calendar Weeks | Deliverable |
|---------------------|-------------|----------------|-------------|
| Development Infrastructure | 1–4 | 1–4 | CI, Git, local dev |
| QA Environment | 5–8 | 5–8 | QA auto-deploy |
| UAT Environment | 9–16 | 22–24 | UAT deploy + mobile preview |
| Production Go-Live | 17–26 | 48–52 | Production infra + go-live |

---

# APPENDIX E: DOCUMENT CROSS-REFERENCE INDEX

| Topic | Document |
|-------|----------|
| Backend module sequence | Backend Blueprint §32 |
| AI feature sequence | AI RAG Architecture — Development Phases |
| Infrastructure sequence | DevOps §29 |
| Testing approach | Testing Strategy |
| QA process | QA Strategy |
| Go-live gates | Production Readiness Framework |
| Release process | Release Management Framework |
| Mobile screens | React Native Mobile Architecture |
| CRM modules | CRM Admin Panel Architecture |
| Business vision | Vision and Objectives |

---

**Document Status:** Authoritative Sprint Planning & Delivery Roadmap (B7)  
**Next Review:** Monthly during execution; update on scope changes  
**Approval:** CTO · Product Owner · Board
