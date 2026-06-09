# KuberOne
## Enterprise QA Strategy Document

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise QA Strategy (B3)  
**Classification:** QA Ready | UAT Ready | Release Ready | Compliance Ready | Enterprise Ready  
**Version:** 1.0  
**Date:** June 2026  
**Related Documents:**
- [KUBERONE_TESTING_STRATEGY.md](./KUBERONE_TESTING_STRATEGY.md) — Technical test layers and tools
- [KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md) — §2 Environments, §13 CI/CD, §26 Operating Model
- [KUBERONE_RELEASE_MANAGEMENT_FRAMEWORK.md](./KUBERONE_RELEASE_MANAGEMENT_FRAMEWORK.md)
- [KUBERONE_PRODUCTION_READINESS_FRAMEWORK.md](./KUBERONE_PRODUCTION_READINESS_FRAMEWORK.md)
- [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md)
- [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md)
- [KUBERONE_VISION_AND_OBJECTIVES.md](./KUBERONE_VISION_AND_OBJECTIVES.md)
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | QA organization, test planning, test cycles, defect management, UAT, release certification, environment governance, sign-off matrix |
| **Audience** | QA Lead, QA Engineers, Product, Business, Compliance, CTO, DevOps, Engineering Leads |
| **Status** | Authoritative QA Master Blueprint |
| **Out of Scope** | Source code, test scripts, automation implementations |

---

## Strategy Statistics

| Metric | Value |
|--------|-------|
| **Environments** | 4 (Development, QA, UAT, Production) |
| **Release cadence** | Bi-weekly production; weekly UAT |
| **Regression tiers** | 4 (Smoke, Core, Full, Certification) |
| **UAT script categories** | 8 |
| **Defect severity levels** | 4 (S1–S4) |
| **Defect priority levels** | 4 (P0–P3) |
| **Sign-off roles** | 7 |
| **QA team (Phase 1)** | QA Lead + 1–2 QA Engineers |
| **UAT duration per release** | 3–5 business days |

---

# EXECUTIVE SUMMARY

Quality Assurance at KuberOne is the **governance layer** between engineering delivery and production release. While [KUBERONE_TESTING_STRATEGY.md](./KUBERONE_TESTING_STRATEGY.md) defines *how* to test technically, this document defines *how QA operates* — organization, planning, cycles, defects, environments, UAT, certification, and sign-off.

KuberOne is a regulated fintech platform. QA must ensure that every production release has **traceable evidence** of functional correctness, RBAC integrity, compliance adherence, and business acceptance — not merely passing CI.

## Strategic QA Principles

| # | Principle | Implementation |
|---|-----------|----------------|
| 1 | **Quality is a release gate, not a phase** | QA engaged from sprint planning through sign-off |
| 2 | **Risk-based prioritization** | P0 flows tested first; compliance never deferred |
| 3 | **Environment fidelity** | QA mirrors topology; UAT mirrors business reality |
| 4 | **Defect transparency** | Severity × priority matrix; no silent waivers |
| 5 | **Shift-left with shift-right** | Developers own unit tests; QA owns acceptance |
| 6 | **Single source of truth** | One defect tracker; one test management system |
| 7 | **No production without UAT sign-off** | Except CTO-documented hotfix waivers |

**Board Recommendation:** Approve QA Lead as release certification authority. Fund test management tooling and UAT participant time (Business, Compliance, DSA partners).

---

# 1. QA VISION AND MISSION

## 1.1 Vision

Build a **world-class QA function** for Indian fintech that combines automation-first regression with business-driven acceptance testing — enabling bi-weekly production releases with confidence.

## 1.2 Mission

| Objective | Measure |
|-----------|---------|
| Prevent defect escape to production | < 5% P1/P2 escape rate |
| Certify releases on schedule | UAT complete within 5 business days |
| Enable business confidence | 95%+ UAT script pass rate |
| Support compliance | 100% compliance script pass before prod |
| Reduce cost of quality | 40% regression automated by Week 40 |

## 1.3 QA Scope Boundaries

| In Scope | Out of Scope |
|----------|--------------|
| Test planning and execution | Feature development |
| UAT coordination and sign-off | Infrastructure provisioning (DevOps) |
| Defect management and triage | Security pen test execution (Security vendor) |
| Release certification | Production deployment execution (DevOps) |
| Test environment validation | AI model training |
| Regression coordination | Legal/compliance policy authoring |

---

# 2. QA ORGANIZATION

## 2.1 Team Structure (Phase 1)

| Role | Count | Reports To | Key Responsibilities |
|------|-------|------------|---------------------|
| **QA Lead** | 1 | CTO | Strategy, UAT sign-off, release certification, test planning |
| **QA Engineer** | 1–2 | QA Lead | Manual regression, mobile/CRM testing, defect reporting |
| **Developer (shared)** | All | Backend/Mobile Lead | Unit + integration tests in PRs |
| **Product Owner (shared)** | 1 | CTO | UAT scripts, acceptance criteria, business sign-off |
| **DevOps (shared)** | 1 | CTO | Environment deploy, CI test stages, k6/ZAP infra |

## 2.2 Team Structure (Phase 2 — Growth)

| Role | Count | Trigger to Hire |
|------|-------|-----------------|
| QA Lead | 1 | — |
| Senior QA Engineer (Automation) | 1 | Week 30 — Playwright/Detox ownership |
| QA Engineer (Manual) | 2 | Week 35 — parallel mobile + CRM |
| QA Engineer (AI/Compliance) | 1 | Week 38 — AI eval + compliance scripts |
| Performance QA (shared DevOps) | 0.5 | Week 40 — k6 ownership |

## 2.3 RACI Matrix (QA Activities)

| Activity | Developer | QA Engineer | QA Lead | Product | DevOps | CTO |
|----------|-----------|-------------|---------|---------|--------|-----|
| Unit test authoring | **R/A** | I | I | I | I | I |
| Test plan creation | C | C | **R/A** | C | I | I |
| QA environment validation | I | **R** | A | I | C | I |
| Smoke regression (QA deploy) | I | **R** | A | I | C | I |
| Core/Full regression | C | **R** | **A** | I | I | I |
| UAT coordination | I | C | **R/A** | C | C | I |
| UAT execution (business) | I | C | C | **R** | I | I |
| Defect logging | C | **R** | A | C | I | I |
| Defect triage | C | C | **R/A** | C | I | I |
| Release certification | I | C | **R** | C | C | **A** |
| UAT sign-off | I | C | **R** | **A** | I | C |
| Production go/no-go | I | C | **R** | C | C | **A** |
| Hotfix verification | C | **R** | A | I | C | **A** |

*R = Responsible, A = Accountable, C = Consulted, I = Informed*

## 2.4 QA Onboarding Checklist

| # | Item | Owner |
|---|------|-------|
| 1 | Access to GitHub repository (read) | DevOps |
| 2 | Access to QA environment (`qa-api`, `qa-admin`) | DevOps |
| 3 | Access to UAT environment (Week 9+) | DevOps |
| 4 | Test user accounts per role (15+ roles) | Backend Lead |
| 5 | Test management tool access | QA Lead |
| 6 | Defect tracker access | QA Lead |
| 7 | QA strategy + testing strategy read-through | QA Lead |
| 8 | RBAC matrix orientation | QA Lead |
| 9 | Mobile preview build installation | Mobile Lead |
| 10 | Slack QA channel membership | QA Lead |

---

# 3. TEST PLANNING

## 3.1 Test Planning Hierarchy

```
Annual QA Plan
    └── Release Test Plan (per bi-weekly release)
            └── Sprint Test Plan (per 2-week sprint)
                    └── Test Cases / Scripts
```

## 3.2 Annual QA Plan

| Section | Contents | Owner | Review |
|---------|----------|-------|--------|
| Quality objectives | Escape rate, automation %, UAT pass rate | QA Lead | Q1 — CTO |
| Resource plan | Headcount, tooling budget | QA Lead | Q1 — CTO |
| Risk register | Top 10 quality risks | QA Lead | Quarterly |
| Compliance calendar | Audit dates, pen test, DR drill | QA Lead + Compliance | Quarterly |
| Automation roadmap | Playwright, Detox, RBAC matrix milestones | QA Lead | Quarterly |
| Training plan | Tool certifications, domain training | QA Lead | Semi-annual |

## 3.3 Release Test Plan Template

| Section | Description |
|---------|-------------|
| Release ID | e.g., `v1.4.0-rc.2` |
| Release scope | Features, bug fixes, migrations |
| Risk assessment | High-risk areas requiring extra testing |
| Test scope | In-scope / out-of-scope modules |
| Regression tier | Smoke / Core / Full / Certification |
| Environment | QA → UAT → Production |
| Entry criteria | Conditions to begin testing |
| Exit criteria | Conditions to approve sign-off |
| Resource allocation | QA engineer assignments |
| Schedule | Dates for regression, UAT, sign-off |
| Defect SLAs | Fix turnaround by severity |
| Rollback criteria | Conditions to abort release |

## 3.4 Sprint Test Plan

| Activity | Timing | Owner |
|----------|--------|-------|
| Review sprint stories for testability | Sprint planning Day 1 | QA Lead |
| Identify acceptance criteria gaps | Sprint planning Day 1 | QA + Product |
| Define new test cases for sprint features | Sprint Day 2–3 | QA Engineer |
| Execute exploratory testing on QA | Sprint Day 8–9 | QA Engineer |
| Defect triage with dev team | Daily standup | QA Lead |
| Sprint QA summary | Sprint review | QA Lead |

## 3.5 Test Case Standards

| Field | Required | Example |
|-------|----------|---------|
| Test ID | Yes | `TC-LOS-042` |
| Module | Yes | LOS — Application |
| Priority | Yes | P0 |
| Preconditions | Yes | Application at stage S03 |
| Steps | Yes | Numbered, reproducible |
| Expected result | Yes | Stage transitions to S04 |
| Test data reference | Yes | `los.fixtures.app-s03` |
| RBAC role | If applicable | Sales Executive |
| Automation status | Yes | Manual / Automated / Planned |
| Linked requirement | Yes | User story ID |

## 3.6 Test Case Repository Organization

| Folder | Contents | Count (Phase 1 Target) |
|--------|----------|------------------------|
| `auth/` | Login, OTP, MFA, session | 40 |
| `customer/` | Registration, profile, dashboard | 50 |
| `dsa/` | Partner onboarding, leads | 45 |
| `lms/` | Leads, assignment, scoring | 60 |
| `los/` | Application lifecycle S01–S09 | 120 |
| `documents/` | Upload, KYC, deficiency | 55 |
| `crm/` | Role-based admin flows | 100 |
| `ai/` | Advisor, copilot, safety | 40 |
| `commission/` | Rules, ledger, payout | 35 |
| `notifications/` | SMS, push, WA, email | 30 |
| `analytics/` | Dashboards, reports | 25 |
| `compliance/` | Consent, audit, DPDP | 25 |
| `security/` | RBAC, injection, rate limit | 50 |
| **Total** | | **675+** |

---

# 4. TEST CYCLES

## 4.1 Test Cycle Overview

| Cycle | Environment | Trigger | Duration | Owner |
|-------|-------------|---------|----------|-------|
| **Developer Test** | Local | Feature development | Continuous | Developer |
| **CI Test** | CI (Docker) | Every PR | 10–15 min | Automated |
| **QA Smoke** | QA | `develop` merge deploy | 30 min | QA Engineer |
| **QA Regression** | QA | Sprint end / feature complete | 1–2 days | QA Team |
| **Release Regression** | UAT | `release/*` cut | 2–3 days | QA Team |
| **UAT Cycle** | UAT | Release regression pass | 3–5 days | QA + Business |
| **Certification** | UAT → Prod gate | UAT sign-off | 1 day | QA Lead |
| **Post-Deploy Smoke** | Production | Deploy complete | 15 min | QA + DevOps |
| **Hotfix Verification** | QA → Prod | Hotfix branch | 1–4 hours | QA Engineer |

## 4.2 QA Smoke Cycle (Every Deploy)

| Step | Action | Pass Criteria |
|------|--------|---------------|
| 1 | Verify deploy notification received | Slack/email confirm |
| 2 | Run 25-item smoke checklist (Testing Strategy Appendix B) | 25/25 pass |
| 3 | Verify no new S1/S2 defects from prior build | Defect tracker clean |
| 4 | Log smoke result in test management tool | Pass/Fail recorded |
| 5 | On fail: block further testing; notify DevOps + Backend Lead | Fail triggers triage |

**SLA:** Smoke complete within 30 minutes of deploy notification.

## 4.3 QA Regression Cycle

| Tier | When | Scope | Duration |
|------|------|-------|----------|
| **Core** | Sprint end | Auth, LMS, LOS, documents, RBAC smoke | 4 hours |
| **Full** | Pre-`release/*` cut | All 675+ test cases (automated + manual) | 2 days |
| **Targeted** | Hotfix | Affected module + smoke | 1–4 hours |

## 4.4 UAT Cycle

| Day | Activity | Participants |
|-----|----------|--------------|
| Day 0 | UAT kickoff; environment validation; test data confirmed | QA Lead, Product, Business |
| Day 1 | Customer + DSA journey scripts | Product, sample users |
| Day 2 | CRM operations + credit + finance scripts | Business, Ops, Finance |
| Day 3 | Compliance + AI + notification scripts | Compliance, Product |
| Day 4 | Defect retest; regression of fixes | QA Team |
| Day 5 | UAT sign-off meeting | QA Lead, Product, CTO (if escalations) |

## 4.5 Test Cycle Entry Criteria

| Cycle | Entry Criteria |
|-------|----------------|
| QA Smoke | Deploy to QA successful; health check 200 |
| QA Regression | Smoke pass; no open S1 from prior build |
| Release Regression | `release/*` branch cut; CI green; QA regression pass on last `develop` |
| UAT | Release regression pass; UAT environment deployed; test data loaded |
| Certification | UAT sign-off; no open P0/P1 defects |
| Post-Deploy Smoke | Production deploy complete; monitoring green |

## 4.6 Test Cycle Exit Criteria

| Cycle | Exit Criteria |
|-------|---------------|
| QA Smoke | 25/25 smoke pass OR S1 logged and dev notified |
| QA Regression | Core: 0 S1/S2 open; Full: < 3 S3 open |
| Release Regression | 0 S1/S2 open; automated suite 100% pass |
| UAT | ≥ 95% script pass; 0 P0; compliance 100% |
| Certification | Sign-off matrix complete |
| Post-Deploy Smoke | 25/25 production smoke pass |

---

# 5. DEFECT MANAGEMENT

## 5.1 Defect Lifecycle

```
New → Triaged → Assigned → In Progress → Fixed → Ready for Test → Verified → Closed
                                    ↓                              ↓
                               Rejected                        Reopened
```

## 5.2 Severity Definitions

| Severity | Code | Definition | Examples |
|----------|------|------------|----------|
| **Critical** | S1 | System unusable; data loss; security breach; financial incorrectness | Production down; commission double-paid; RBAC bypass exposing PII |
| **High** | S2 | Major feature broken; no acceptable workaround | Cannot submit application; OTP not delivered; LOS stuck at stage |
| **Medium** | S3 | Feature degraded; workaround exists | Report export wrong format; slow dashboard; AI response off-topic |
| **Low** | S4 | Cosmetic; minor inconvenience | Typo; alignment issue; non-critical tooltip wrong |

## 5.3 Priority Definitions

| Priority | Code | Definition | Fix SLA |
|----------|------|------------|---------|
| **Immediate** | P0 | Must fix before any release proceeds | 4 hours |
| **Urgent** | P1 | Must fix before target release | 1 business day |
| **Normal** | P2 | Fix in current or next sprint | 3 business days |
| **Deferred** | P3 | Backlog; fix when capacity allows | Next sprint+ |

## 5.4 Severity × Priority Matrix

| | P0 | P1 | P2 | P3 |
|---|-----|-----|-----|-----|
| **S1** | Stop all releases; hotfix | Hotfix | — | — |
| **S2** | Block UAT | Block release | Fix in release if time | Next sprint |
| **S3** | — | Fix before prod if in scope | Normal sprint | Backlog |
| **S4** | — | — | Backlog | Backlog |

## 5.5 Defect Fields (Mandatory)

| Field | Description |
|-------|-------------|
| Defect ID | Auto-generated |
| Title | Concise description |
| Severity | S1–S4 |
| Priority | P0–P3 |
| Environment | Dev / QA / UAT / Prod |
| Module | Auth, LOS, CRM, Mobile, AI, etc. |
| Steps to reproduce | Numbered |
| Expected vs actual | Clear comparison |
| Screenshots/logs | Attached |
| Build version | Git SHA or release tag |
| Assigned to | Developer |
| Found by | QA / Business / Customer |
| RBAC role (if applicable) | Role used during test |

## 5.6 Defect Triage Process

| Meeting | Frequency | Participants | Duration |
|---------|-----------|--------------|----------|
| Daily triage (during regression) | Daily | QA Lead, Backend Lead, Mobile Lead | 30 min |
| Release triage | Per release cycle | + Product Owner, CTO (if S1/S2) | 45 min |
| Post-mortem triage | After P1 production incident | All leads + CTO | 60 min |

**Triage rules:**
1. S1 → immediate notification to CTO + DevOps
2. S2 in UAT → blocks sign-off until fixed or waived
3. Duplicate defects merged; root cause tagged
4. "Won't fix" requires Product Owner + QA Lead approval
5. All production defects logged within 2 hours of discovery

## 5.7 Defect Metrics

| Metric | Target | Review |
|--------|--------|--------|
| Defect escape rate (S1/S2 to prod) | < 5% of releases | Per release |
| Mean time to fix (S2) | < 1 business day | Weekly |
| Defect rejection rate | < 10% | Monthly |
| Reopen rate | < 5% | Monthly |
| Defects per release | Trending down after Week 30 | Per release |
| UAT defect ratio (S1/S2) | < 3 per release at maturity | Per release |

---

# 6. RELEASE CERTIFICATION

## 6.1 Certification Purpose

Release certification is the **formal QA attestation** that a release candidate meets all exit criteria for production promotion. Certification is issued by the QA Lead and is a prerequisite for the production approval gate in DevOps §13.5.

## 6.2 Certification Process

| Step | Action | Owner | Output |
|------|--------|-------|--------|
| 1 | Confirm release scope and version tag | Product Owner | Release notes draft |
| 2 | Verify CI pipeline green on `release/*` | QA Lead | CI badge |
| 3 | Confirm release regression pass | QA Lead | Regression report |
| 4 | Confirm UAT sign-off received | QA Lead | Signed UAT form |
| 5 | Confirm 0 open P0/P1 defects | QA Lead | Defect dashboard |
| 6 | Confirm security scans pass (ZAP) | Security/DevOps | ZAP report |
| 7 | Confirm k6 load test pass (if scheduled) | DevOps | k6 report |
| 8 | Confirm database migration tested in UAT | Backend Lead | Migration log |
| 9 | Issue certification document | QA Lead | Certification PDF/form |
| 10 | Attach certification to production deploy request | QA Lead | GitHub approval comment |

## 6.3 Certification Document Contents

| Section | Details |
|---------|---------|
| Release version | e.g., `v1.4.0` |
| Release date | Planned production date |
| Scope summary | Features and fixes included |
| Test evidence | Regression report, UAT report, CI link |
| Defect summary | Open defects (S3/S4 only) with waivers |
| Security summary | ZAP result, npm audit status |
| Performance summary | k6 result (if applicable) |
| Migration summary | Prisma migrations included |
| Known issues | Documented limitations |
| Certification decision | **CERTIFIED** / **NOT CERTIFIED** |
| QA Lead signature | Name, date |
| Waivers | Any CTO-approved exceptions |

## 6.4 Certification Decision Rules

| Condition | Decision |
|-----------|----------|
| All exit criteria met | **CERTIFIED** |
| Open P0 or P1 | **NOT CERTIFIED** |
| Open S1 or S2 | **NOT CERTIFIED** |
| UAT not signed | **NOT CERTIFIED** |
| ZAP High vulnerability | **NOT CERTIFIED** |
| S3 with documented workaround + Product approval | **CERTIFIED** with known issues |
| CTO waiver for hotfix | **CERTIFIED** with waiver reference |

---

# 7. UAT PROCESS

## 7.1 UAT Objectives

| Objective | Description |
|-----------|-------------|
| Business validation | Features meet business requirements |
| Workflow validation | End-to-end loan journeys work for real users |
| Compliance validation | Regulatory flows pass Compliance review |
| Usability validation | Apps and CRM are usable by target personas |
| AI validation | AI responses are acceptable to Compliance |
| Partner validation | DSA partners can operate effectively |

## 7.2 UAT Governance

| Role | UAT Responsibility |
|------|-------------------|
| **Product Owner** | Owns UAT scripts; business acceptance authority |
| **QA Lead** | Coordinates UAT; documents results; issues sign-off recommendation |
| **Business (Sales)** | Executes sales and lead management scripts |
| **Business (Ops)** | Executes document and operations scripts |
| **Finance** | Executes commission and payout scripts |
| **Compliance** | Executes regulatory scripts; AI disclaimer review |
| **QA Engineer** | Supports UAT execution; logs defects; retests fixes |
| **DevOps** | UAT environment availability; deploy support |
| **CTO** | Escalation authority for waivers |

## 7.3 UAT Preparation Checklist

| # | Item | Owner | Timing |
|---|------|-------|--------|
| 1 | UAT environment deployed with release candidate | DevOps | Day -2 |
| 2 | Database migrated and seeded | Backend Lead | Day -2 |
| 3 | UAT test data loaded (masked, realistic) | QA Lead | Day -1 |
| 4 | Mobile preview builds distributed | Mobile Lead | Day -1 |
| 5 | UAT scripts reviewed and updated for release scope | Product Owner | Day -1 |
| 6 | UAT participants confirmed and briefed | QA Lead | Day -1 |
| 7 | Defect tracker UAT project created | QA Lead | Day -1 |
| 8 | UAT kickoff meeting scheduled | QA Lead | Day 0 |
| 9 | OpenAI UAT budget confirmed | AI Lead | Day -1 |
| 10 | Rollback plan documented | DevOps | Day -1 |

## 7.4 UAT Script Execution

| Category | Script Count | Pass Threshold | Sign-off Required From |
|----------|-------------|----------------|------------------------|
| Customer journeys | 12 | 100% P0 scripts; 95% overall | Product Owner |
| DSA partner journeys | 8 | 100% P0; 95% overall | Product Owner |
| CRM operations | 15 | 95% overall | Business (Ops) |
| Credit & finance | 8 | 100% (financial accuracy) | Finance |
| Compliance | 6 | 100% | Compliance Head |
| AI advisor | 10 | 90% (linguistic tolerance) | Product + Compliance |
| Notifications | 5 | 100% delivery verification | QA Lead |
| Reporting | 5 | 95% | Business (Sales Mgr) |

## 7.5 UAT Defect Handling During Cycle

| Severity | Action During UAT |
|----------|-------------------|
| S1 | Stop UAT; hotfix to UAT; restart affected scripts |
| S2 | Continue other scripts; fix required before sign-off |
| S3 | Log; fix if time permits; else defer with waiver |
| S4 | Log; defer to backlog |

## 7.6 UAT Sign-Off Form

| Field | Value |
|-------|-------|
| Release version | |
| UAT period | Start — End |
| Scripts executed | X / Y |
| Pass rate | X% |
| Open S1/S2 defects | Count (must be 0) |
| Open S3 defects | Count + waiver references |
| Compliance approval | Yes / No |
| Business approval | Yes / No |
| QA Lead recommendation | Sign-off / No sign-off |
| Product Owner sign-off | Name, date, signature |
| QA Lead sign-off | Name, date, signature |
| Compliance sign-off | Name, date, signature |
| CTO approval (if waivers) | Name, date, signature |

---

# 8. TEST ENVIRONMENTS

## 8.1 Environment Overview

Per DevOps §2, KuberOne operates four environments with distinct purposes, access controls, and data policies.

| Environment | Purpose | Branch | Deploy | Data |
|-------------|---------|--------|--------|------|
| **Development** | Feature development; local + shared | `feature/*` | Local / optional shared EC2 | Synthetic; developer-owned |
| **QA** | Automated + manual integration testing | `develop` | Auto on merge | Generated test data |
| **UAT** | Business acceptance; stakeholder demo | `release/*` | Semi-auto | Masked production-like |
| **Production** | Live customer traffic | `main` | Manual approval | Real customer data |

## 8.2 Development Environment

| Attribute | Value |
|-----------|-------|
| Infrastructure | Local machines + optional shared dev EC2 |
| Database | Local Docker MySQL or shared dev RDS |
| API URL | `http://localhost:4000` or dev EC2 |
| Mobile flavor | `development` |
| Access | All developers |
| QA involvement | None (unless paired testing) |
| Data policy | Synthetic only; no production data |

**Exit criteria (feature ready for QA):** Developer self-test pass; unit tests pass; PR approved.

## 8.3 QA Environment

| Attribute | Value |
|-----------|-------|
| Infrastructure | EC2 `kuberone-qa-app` (t3.medium) |
| Database | RDS `kuberone-qa-db` (db.t3.micro) |
| Storage | `kuberone-documents-qa` S3 |
| API URL | `https://qa-api.kuberone.in/v1` |
| Admin URL | `https://qa-admin.kuberone.in` |
| Mobile flavor | `qa` |
| Branch | `develop`, `release/*` (pre-UAT) |
| Deploy | Auto on `develop` merge |
| Access | Developers, QA team |
| Cost control | EC2 stopped nights/weekends |
| Data policy | Generated; refreshed weekly |

**Exit criteria (ready for UAT cut):**
- [ ] Smoke pass on latest `develop`
- [ ] Core regression pass
- [ ] 0 open S1/S2 defects
- [ ] CI pipeline green
- [ ] QA Lead approval to cut `release/*`

## 8.4 UAT Environment

| Attribute | Value |
|-----------|-------|
| Infrastructure | EC2 `kuberone-uat-app` (t3.large) |
| Database | RDS `kuberone-uat-db` (db.t3.small) |
| Storage | `kuberone-documents-uat` S3 |
| API URL | `https://uat-api.kuberone.in/v1` |
| Admin URL | `https://uat-admin.kuberone.in` |
| Mobile flavor | `preview` / `uat` |
| Branch | `release/*` |
| Deploy | Semi-auto on `release/*` |
| Access | QA, Product, Business, Compliance (read); DevOps (deploy) |
| Data policy | Masked production-like; never raw production PII |

**Exit criteria (ready for production):**
- [ ] UAT sign-off form signed
- [ ] Release certification issued
- [ ] 0 open P0/P1 defects
- [ ] ZAP scan clean
- [ ] Migration tested successfully
- [ ] k6 load test pass (pre-production releases)
- [ ] Product Owner + QA Lead + Compliance sign-off

## 8.5 Production Environment

| Attribute | Value |
|-----------|-------|
| Infrastructure | EC2 `kuberone-prod-app` (t3.large; ×2 Phase 2) |
| Database | RDS Multi-AZ (db.t3.medium) |
| API URL | `https://api.kuberone.in/v1` |
| Admin URL | `https://admin.kuberone.in` |
| Branch | `main` |
| Deploy | Manual approval (CTO/DevOps) |
| Access | DevOps only (no developer SSH) |
| QA involvement | Post-deploy smoke only |

**Exit criteria (post-deploy validation):**
- [ ] 25-item production smoke pass
- [ ] 30-minute monitoring window green
- [ ] No P1 alerts triggered
- [ ] Release announcement sent

## 8.6 Environment Comparison Matrix

| Dimension | Development | QA | UAT | Production |
|-----------|-------------|-----|-----|------------|
| **Purpose** | Build | Test | Accept | Serve |
| **Fidelity to prod** | Low | Medium | High | Authoritative |
| **Auto-deploy** | No | Yes | Semi | No |
| **UAT required** | No | No | Self | Yes (before entry) |
| **PII** | Synthetic | Synthetic | Masked | Real (encrypted) |
| **AI key** | Dev key | QA key | UAT key | Prod key |
| **SSL** | Optional | ACM | ACM | ACM |
| **Monitoring** | Local | Basic | Full | Full + alerting |
| **Backup** | None | Daily RDS | Daily RDS | Daily + pre-deploy |
| **QA test cycle** | None | Smoke + regression | UAT + certification | Post-deploy smoke |

## 8.7 Environment Health Checks (QA Responsibility)

| Check | QA | QA | UAT | Prod |
|-------|-----|-----|-----|------|
| Health endpoint 200 | Daily | Daily | Pre-UAT | Post-deploy |
| Auth flow works | Weekly | Per deploy | Pre-UAT | Post-deploy |
| Test accounts valid | Weekly | Per regression | Pre-UAT | N/A |
| Seed data current | N/A | Weekly refresh | Per release | N/A |
| Mobile build connects | Per sprint | Per deploy | Pre-UAT | Post-deploy |

---

# 9. EXIT CRITERIA PER ENVIRONMENT

## 9.1 Summary Table

| Transition | Exit Criteria Gate | Approver |
|------------|-------------------|----------|
| Dev → QA (merge to `develop`) | CI pass; unit tests; code review | Backend/Mobile Lead |
| QA → UAT (cut `release/*`) | Smoke + core regression; 0 S1/S2 | QA Lead |
| UAT → Production (merge to `main`) | UAT sign-off + certification + 0 P0/P1 | QA Lead + CTO |
| Production → Live (deploy) | Manual approval + smoke pass | CTO/DevOps |
| Hotfix → Production | CI pass + targeted regression + CTO waiver | CTO |

## 9.2 Detailed Exit Criteria: Dev → QA

| # | Criterion |
|---|-----------|
| 1 | All CI stages pass on PR |
| 2 | Code review approved (RBAC + audit checklist) |
| 3 | Unit tests for changed modules |
| 4 | No secrets in diff |
| 5 | OpenAPI updated if API changed |
| 6 | Developer self-test documented in PR |

## 9.3 Detailed Exit Criteria: QA → UAT

| # | Criterion |
|---|-----------|
| 1 | QA smoke pass on latest `develop` build |
| 2 | Core regression pass (0 S1/S2) |
| 3 | Feature-specific test cases pass for sprint scope |
| 4 | `release/*` branch created with release notes draft |
| 5 | Database migrations included and tested in QA |
| 6 | QA Lead written approval to proceed |

## 9.4 Detailed Exit Criteria: UAT → Production

| # | Criterion |
|---|-----------|
| 1 | UAT script pass rate ≥ 95% |
| 2 | Compliance scripts 100% pass |
| 3 | 0 open P0/P1 defects |
| 4 | 0 open S1/S2 defects |
| 5 | UAT sign-off form signed (Product, QA, Compliance) |
| 6 | Release certification issued by QA Lead |
| 7 | OWASP ZAP baseline pass (no High) |
| 8 | k6 load test pass (scheduled releases) |
| 9 | Mobile preview builds validated |
| 10 | Rollback procedure confirmed by DevOps |
| 11 | Go-live checklist progress ≥ 90% (Production Readiness Framework) |

## 9.5 Detailed Exit Criteria: Production Deploy

| # | Criterion |
|---|-----------|
| 1 | GitHub manual approval granted (CTO/DevOps) |
| 2 | RDS pre-deploy snapshot taken |
| 3 | `prisma migrate deploy` success |
| 4 | Backend + admin deploy success |
| 5 | 25-item production smoke pass |
| 6 | 30-minute monitoring window — no P1 alerts |
| 7 | Release announcement published |

---

# 10. SIGN-OFF MATRIX

## 10.1 Sign-Off Authority Matrix

| Gate | QA Lead | Product Owner | Compliance | Finance | Business (Ops) | Backend Lead | DevOps | CTO |
|------|---------|---------------|------------|---------|----------------|--------------|--------|-----|
| QA regression pass | **A** | I | I | I | I | C | I | I |
| UAT completion | **R** | **A** | **A** | C | C | I | C | I |
| Release certification | **A** | C | C | I | I | C | C | I |
| Production deploy approval | C | I | I | I | I | C | **R** | **A** |
| Hotfix production deploy | C | I | I | I | I | C | **R** | **A** |
| Go-live (initial launch) | **A** | **A** | **A** | C | C | **A** | **A** | **A** |
| AI feature release | C | **A** | **A** | I | I | C | I | C |
| Mobile store release | C | **A** | I | I | I | I | C | **A** |
| Database migration (prod) | I | I | I | I | I | **A** | **R** | **A** |

*A = Accountable (sign-off authority), R = Responsible (executes), C = Consulted, I = Informed*

## 10.2 Sign-Off Documentation Requirements

| Gate | Document | Retention |
|------|----------|-----------|
| UAT sign-off | Signed UAT form (§7.6) | 3 years |
| Release certification | Certification document (§6.3) | 3 years |
| Production deploy | GitHub approval + deployment log | 2 years |
| Go-live | Go-live approval table (DevOps §28.8 + PRF) | Permanent |
| Hotfix waiver | CTO written waiver email/ticket | 2 years |
| Compliance AI approval | Compliance sign-off on AI scripts | 3 years |

## 10.3 Escalation Path

| Situation | Escalation |
|-----------|------------|
| S1 defect in UAT | QA Lead → CTO within 1 hour |
| UAT sign-off blocked | QA Lead → Product Owner → CTO |
| Compliance rejects AI responses | Compliance → AI Lead → CTO |
| Production smoke fail | DevOps → CTO → rollback decision |
| Waiver request | Requestor → QA Lead → CTO |
| Environment down during UAT | DevOps → QA Lead → CTO |

## 10.4 Go-Live Sign-Off (Initial Production Launch)

Extends DevOps §28.8:

| Role | Sign-Off Scope | Required |
|------|----------------|----------|
| CTO | Overall go-live authority | Yes |
| DevOps Lead | Infrastructure, monitoring, backup | Yes |
| Backend Lead | Application, RBAC, migrations | Yes |
| QA Lead | Testing, UAT, certification | Yes |
| Product Owner | Business readiness, app store | Yes |
| Compliance Head | Regulatory readiness | Yes |
| Mobile Lead | Store submissions, mobile config | Yes |
| Finance Head | Commission rules verified | Recommended |

*Full go-live governance: [KUBERONE_PRODUCTION_READINESS_FRAMEWORK.md](./KUBERONE_PRODUCTION_READINESS_FRAMEWORK.md)*

---

# 11. QA METRICS AND REPORTING

## 11.1 Weekly QA Dashboard

| Metric | Source |
|--------|--------|
| Smoke pass rate (QA deploys) | Test management tool |
| Open defects by severity | Defect tracker |
| Regression progress (% automated) | Test management tool |
| UAT readiness (if in cycle) | UAT tracker |
| Test case count (new vs executed) | Test management tool |
| CI test failure rate | GitHub Actions |

## 11.2 Release QA Report

| Section | Contents |
|---------|----------|
| Release summary | Version, scope, dates |
| Test execution summary | Cases run, pass/fail, blocked |
| Defect summary | Found, fixed, open, escaped |
| UAT results | Script pass rate, sign-off status |
| Certification status | Certified / not certified |
| Recommendations | Go / no-go with rationale |

## 11.3 Monthly Quality Review (with CTO)

| Topic | Data |
|-------|------|
| Defect trends | Severity distribution, module hotspots |
| Escape analysis | Production defects root cause |
| Automation progress | % regression automated |
| Environment issues | Downtime, data problems |
| UAT efficiency | Cycle duration, participant feedback |
| Training needs | Skill gaps identified |

---

# 12. QA RISK REGISTER

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | QA team understaffed for 52-week roadmap | UAT delays; escape rate rises | Hire automation QA at Week 30; prioritize P0 scripts |
| 2 | UAT participants unavailable | Sign-off delays | Schedule UAT windows 2 weeks ahead; backup participants |
| 3 | QA environment instability | False defects; lost time | DevOps SLA for QA uptime; smoke before regression |
| 4 | Test data stale/incorrect | Invalid test results | Weekly QA data refresh; versioned seed scripts |
| 5 | AI non-determinism blocks UAT | Subjective failures | Semantic eval bands; Compliance pre-approved tolerance |
| 6 | Mobile device fragmentation | Missed defects | Device matrix per Testing Strategy §6.5 |
| 7 | Regulatory change mid-release | Compliance script failure | Compliance reviews scripts each release |
| 8 | Over-reliance on manual regression | Cycle time exceeds 3 days | Automation roadmap; nightly suites |

---

# APPENDIX A: UAT SCRIPT CATALOG (PHASE 1)

| ID | Category | Script Name | Priority |
|----|----------|-------------|----------|
| UAT-C01 | Customer | OTP login → product browse → eligibility | P0 |
| UAT-C02 | Customer | HL application wizard S01–S03 | P0 |
| UAT-C03 | Customer | Document upload (PAN + Aadhaar) | P0 |
| UAT-C04 | Customer | Application status tracking | P1 |
| UAT-C05 | Customer | AI Advisor — product recommendation (EN) | P1 |
| UAT-C06 | Customer | AI Advisor — eligibility (HI) | P1 |
| UAT-C07 | Customer | EMI calculator + comparison | P1 |
| UAT-C08 | Customer | Referral code apply | P2 |
| UAT-C09 | Customer | Profile update + consent | P1 |
| UAT-C10 | Customer | Push notification on stage change | P1 |
| UAT-C11 | Customer | LAP application full journey | P0 |
| UAT-C12 | Customer | Support ticket creation | P2 |
| UAT-D01 | DSA | Partner registration + KYC | P0 |
| UAT-D02 | DSA | Lead submission + tracking | P0 |
| UAT-D03 | DSA | Lead → application conversion | P0 |
| UAT-D04 | DSA | Commission ledger view | P0 |
| UAT-D05 | DSA | Document deficiency notification | P1 |
| UAT-D06 | DSA | Agreement acceptance | P1 |
| UAT-D07 | DSA | Push on lead assignment | P1 |
| UAT-D08 | DSA | AI assistance for lead qualification | P2 |
| UAT-R01 | CRM | Sales exec — lead CRUD + activity | P0 |
| UAT-R02 | CRM | Sales mgr — assignment + dashboard | P0 |
| UAT-R03 | CRM | Credit analyst — review + SoD | P0 |
| UAT-R04 | CRM | Ops — document verification | P0 |
| UAT-R05 | CRM | Finance — commission batch approval | P0 |
| UAT-R06 | CRM | Admin — product configuration | P1 |
| UAT-R07 | CRM | Compliance — audit log search | P0 |
| UAT-R08 | CRM | Support — ticket escalation | P1 |
| UAT-R09 | CRM | Branch scope filtering | P1 |
| UAT-R10 | CRM | Sanction letter generation | P0 |
| UAT-R11 | CRM | Disbursement recording | P0 |
| UAT-R12 | CRM | Campaign creation + tracking | P2 |
| UAT-R13 | CRM | PII masking per role | P0 |
| UAT-R14 | CRM | Report export (scoped) | P1 |
| UAT-R15 | CRM | Super admin — role management | P1 |
| UAT-X01 | Compliance | DPDP consent capture + withdrawal | P0 |
| UAT-X02 | Compliance | AI disclaimer on all sessions | P0 |
| UAT-X03 | Compliance | Audit trail on financial mutation | P0 |
| UAT-X04 | Compliance | PII access logging | P0 |
| UAT-X05 | Compliance | Data retention job execution | P1 |
| UAT-X06 | Compliance | No guaranteed approval language in AI | P0 |
| UAT-A01 | AI | 10 conversational golden scenarios | P1 |
| UAT-N01 | Notification | SMS OTP delivery | P0 |
| UAT-N02 | Notification | WhatsApp status update | P1 |
| UAT-N03 | Notification | Email sanction letter | P1 |
| UAT-N04 | Notification | Push notification E2E | P1 |
| UAT-N05 | Notification | In-app notification center | P2 |
| UAT-F01 | Finance | Commission calculation accuracy | P0 |
| UAT-F02 | Finance | Payout batch generation | P0 |
| UAT-F03 | Finance | Referral reward on disbursement | P1 |
| UAT-F04 | Finance | Commission dispute workflow | P2 |
| UAT-B01 | Reporting | Lead funnel dashboard | P1 |
| UAT-B02 | Reporting | Revenue dashboard | P1 |
| UAT-B03 | Reporting | Partner performance report | P1 |
| UAT-B04 | Reporting | Branch comparison report | P2 |
| UAT-B05 | Reporting | SLA compliance report | P1 |

---

# APPENDIX B: DEFECT REPORT TEMPLATE

| Field | Value |
|-------|-------|
| **Defect ID** | |
| **Title** | |
| **Severity** | S1 / S2 / S3 / S4 |
| **Priority** | P0 / P1 / P2 / P3 |
| **Environment** | Dev / QA / UAT / Prod |
| **Build** | Git SHA or version |
| **Module** | |
| **Role** | (if RBAC-related) |
| **Preconditions** | |
| **Steps to Reproduce** | 1. … 2. … 3. … |
| **Expected Result** | |
| **Actual Result** | |
| **Attachments** | Screenshots, logs, video |
| **Found By** | |
| **Assigned To** | |
| **Status** | New / Triaged / … |

---

# APPENDIX C: CROSS-REFERENCE INDEX

| Topic | Document | Section |
|-------|----------|---------|
| Test layers and tools | Testing Strategy | Full |
| CI pipeline | DevOps | §13 |
| Environments | DevOps | §2 |
| Approval process | DevOps | §13.5 |
| Release types | Release Management Framework | §2 |
| Go-live checklist | DevOps | §28 |
| Production readiness scoring | Production Readiness Framework | §4 |
| RBAC testing | RBAC API Traceability Matrix | Full |
| Business workflows | Business Workflow & Operating Model | Full |

---

**Document Status:** Authoritative QA Strategy (B3)  
**Next Review:** Quarterly  
**Approval:** CTO · QA Lead · Product Owner · Compliance Head
