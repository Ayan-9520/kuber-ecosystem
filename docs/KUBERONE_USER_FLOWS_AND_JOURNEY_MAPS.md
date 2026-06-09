# KuberOne
## User Flows & Journey Maps Document

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** User Flows & Journey Maps (UFJM)  
**Classification:** Product-Ready | Operations-Ready | UX-Ready | Implementation-Ready  
**Version:** 1.0  
**Date:** June 2026  
**Related Documents:**
- [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md)
- [KUBERONE_USER_TYPES_AND_ROLES.md](./KUBERONE_USER_TYPES_AND_ROLES.md)
- [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md)
- [KUBERONE_SCREEN_PLANNING_AND_IA.md](./KUBERONE_SCREEN_PLANNING_AND_IA.md)
- [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md)
- [KUBERONE_VISION_AND_OBJECTIVES.md](./KUBERONE_VISION_AND_OBJECTIVES.md)
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | End-to-end user journeys, lifecycle flows, screen mappings, SLAs, KPIs, escalations |
| **Audience** | Product, UX, Engineering, Operations, Training, Compliance, Partners |
| **Status** | Master User Journey Blueprint |
| **Out of Scope** | Source code, API implementations, wireframe pixels |
| **Canonical References** | Lead grades (A+/A/B/C/Rejected), LOS stages (S01–S09), Screen IDs (C-*, D-*, CRM-*) |

---

## Document Statistics

| Metric | Value |
|--------|-------|
| **Persona journeys documented** | 14 (12 human roles + AI Advisor + Voice AI) |
| **Lifecycle flows documented** | 6 |
| **Lead grades (canonical)** | 5 (A+, A, B, C, Rejected) |
| **LOS stages** | 9 (S01–S09) |
| **Lead lifecycle states** | 10 |
| **Document lifecycle states** | 6 |
| **Commission lifecycle states** | 4 (+ clawback) |
| **Support ticket states** | 7 |
| **Screen ID references** | 200+ |
| **ASCII flow diagrams** | 40+ |

---

# EXECUTIVE SUMMARY

## Purpose

This document is the **single authoritative source** for how every KuberOne stakeholder moves through the platform—from first touch to disbursement, commission settlement, portfolio management, and support resolution. It translates the Business Workflow & Operating Model into **actionable, screen-mapped user journeys** suitable for product design, training, workflow engine configuration, and QA acceptance criteria.

## What This Document Delivers

| Deliverable | Description |
|-------------|-------------|
| **Persona journey maps** | Complete flows for Customer, DSA, Referral Partner, Sales Executive, RM, Credit, Ops, Branch/Regional Manager, Admin, Management, AI Advisor, Voice AI |
| **Lifecycle flows** | Lead, Application (S01–S09), Document, Referral, Commission, Support |
| **Per-journey specification** | Actors, Inputs, Outputs, States, Transitions, SLAs, KPIs, Escalations, Exception Handling |
| **Screen mapping** | Cross-reference to Customer App (C-*), DSA App (D-*), CRM Admin Panel (CRM-*) |
| **ASCII diagrams** | Swimlanes and state machines for every major flow |

## Journey Architecture at a Glance

```
EXTERNAL USERS                    KUBERONE PLATFORM                         INTERNAL USERS
──────────────                    ─────────────────                         ──────────────

Customer App (C-*)  ──┐
AI Advisor (C-AI-*)   ──┼──→  LMS (Lead Lifecycle)  ──→  LOS (S01–S09)  ──→  Sales Executive (CRM-LD-*)
DSA App (D-*)         ──┤              │                        │              Credit Executive (CRM-AP-15)
Referral (C-REF-*)    ──┤              │                        │              Operations (CRM-AP-16)
Voice AI (C-VOC-*)    ──┘              ▼                        ▼              Branch / Regional Manager
                                 AI Scoring (A+–C)         Document Lifecycle       Admin / Management
                                 Commission Engine         Referral Lifecycle       Support (SUP-*)
                                 Notification Engine       Support Lifecycle
```

## Canonical Operating Decisions (Inherited)

| Decision | Canonical Model | Source |
|----------|-----------------|--------|
| Lead grading | **A+** (Hot, 85–100), **A** (Warm, 70–84), **B** (Moderate, 50–69), **C** (Cold, 30–49), **Rejected** (0–29) | Business Workflow §6 |
| Lead scoring | 70% rule engine + 30% AI signal | Business Workflow §6.2 |
| Application lifecycle | Universal S01–S09 across all 20 product variants | Loan Products §11 |
| Commission trigger | Disbursement → PROVISIONAL → APPROVED → PAID | Business Workflow §11 |
| AI role | Advisory only — no auto-approve, auto-sanction, or auto-disburse | AI RAG Architecture §4.5 |
| Referral attribution | 90-day window; reward on disbursement | Business Workflow §3.2, §11.6 |

## How to Use This Document

| Role | Usage |
|------|-------|
| **Product / UX** | Journey steps → screen flows; validate IA completeness |
| **Engineering** | States/transitions → workflow engine config; screen IDs → route mapping |
| **Operations / Training** | SLA tables → monitoring dashboards; escalation paths → runbooks |
| **QA** | Acceptance criteria per transition guard and exception path |
| **Compliance** | Audit touchpoints at consent gates, document access, commission approval |

**Recommendation:** Adopt this document alongside the Business Workflow doc as the binding reference for user experience design, journey analytics instrumentation, and operational training.

---

# JOURNEY MAP INDEX

## Persona Journey Index

| # | Persona | Journey ID | Primary Interface | Key Screens | Primary Output |
|---|---------|------------|-------------------|-------------|----------------|
| 1 | Customer (Self-Serve + AI) | J-CUS-01 | Customer App | C-001–C-020, C-AI-*, C-HL-* | Application submitted; docs uploaded; status tracked |
| 2 | DSA Partner | J-DSA-01 | DSA App | D-001–D-028, D-LD-*, D-COM-* | Lead submitted; commission earned |
| 3 | Referral Partner | J-REF-01 | Referral Portal / DSA Lite | D-003, CRM-PT-05/06, C-REF-* (customer-as-referrer) | Referral attributed; reward paid |
| 4 | Sales Executive | J-SAL-01 | CRM Web + Mobile | CRM-DB-01, CRM-LD-*, CRM-AP-* | Lead converted; application advanced to S03+ |
| 5 | Relationship Manager | J-RM-01 | CRM Web + Mobile | CRM-DB-02, CRM-CU-* | Portfolio retained; cross-sell initiated |
| 6 | Credit Executive | J-CRD-01 | CRM Web | CRM-DB-03, CRM-AP-15, CRM-DOC-* | Eligibility assessed; credit recommendation |
| 7 | Operations Executive | J-OPS-01 | CRM Web | CRM-DB-04, CRM-AP-16, CRM-DOC-07 | Lender submission; sanction; disbursement recorded |
| 8 | Branch Manager | J-BM-01 | CRM Dashboard | CRM-DB-05, CRM-LD-10, CRM-PT-* | Branch SLA compliance; escalations resolved |
| 9 | Regional Manager | J-RM-02 | CRM Dashboard | CRM-DB-06 | Regional targets achieved; branch coaching |
| 10 | Admin | J-ADM-01 | Admin Console | CRM-DB-09, CRM-AD-*, CRM-CM-01 | Platform configured; users provisioned |
| 11 | Management (CEO/Director) | J-MGT-01 | Executive Dashboard | CRM-DB-10 | Strategic decisions from KPIs |
| 12 | AI Advisor (Conversational) | J-AI-01 | Customer App AI tab | C-AI-01–C-AI-10 | Guided eligibility; product recommendation; application assist |
| 13 | Voice AI | J-VOC-01 | Customer App Voice | C-VOC-01–C-VOC-07 | Spoken guidance; callback scheduled |

## Lifecycle Flow Index

| # | Lifecycle | Flow ID | States | Primary Actors | Document Section |
|---|-----------|---------|--------|----------------|------------------|
| 1 | Lead Lifecycle | LF-01 | NEW → SCORED → ASSIGNED → … → CONVERTED/REJECTED | System, Sales, Customer, DSA | §LF-01 |
| 2 | Application Lifecycle | LF-02 | S01 → S02 → … → S09 (+ REJECTED/WITHDRAWN/ON_HOLD) | All internal + Customer | §LF-02 |
| 3 | Document Lifecycle | LF-03 | PENDING → UPLOADED → VERIFIED/REJECTED/EXPIRED | Customer, DSA, Credit, Ops | §LF-03 |
| 4 | Referral Lifecycle | LF-04 | LINK_CLICKED → ATTRIBUTED → … → REWARD_PAID | Referral Partner, System, Finance | §LF-04 |
| 5 | Commission Lifecycle | LF-05 | PROVISIONAL → APPROVED → PAID (+ CLAWED_BACK) | System, DSA, Finance Head | §LF-05 |
| 6 | Support Lifecycle | LF-06 | OPEN → ASSIGNED → … → CLOSED/ESCALATED | Customer, Support, Branch Manager | §LF-06 |

## Screen ID Convention Quick Reference

| Prefix | Application | Example |
|--------|-------------|---------|
| `C-` | Customer App — core | C-008 Dashboard, C-013 Support Hub |
| `C-PR-` | Customer App — profile | C-PR-01 Profile Hub |
| `C-KYC-` | Customer App — KYC | C-KYC-01 KYC Center |
| `C-LP-` / `C-HL-` / `C-LAP-` / `C-BL-` / `C-AL-` | Product flows | C-HL-A05 Review & Submit |
| `C-AI-` | AI Advisor | C-AI-02 Conversation |
| `C-VOC-` | Voice AI | C-VOC-02 Active Session |
| `C-REF-` | Customer referral | C-REF-02 Share Link |
| `C-SUP-` | Customer support | C-SUP-03 Create Ticket |
| `D-` | DSA App — core | D-011 Dashboard |
| `D-LD-` | DSA lead management | D-LD-05 Review & Submit |
| `D-COM-` | DSA commission | D-COM-09 Raise Dispute |
| `CRM-DB-` | CRM dashboards | CRM-DB-01 Sales Dashboard |
| `CRM-LD-` | CRM leads | CRM-LD-12 Convert to Application |
| `CRM-AP-` | CRM applications | CRM-AP-10 Stage Action |
| `CRM-DOC-` | CRM documents | CRM-DOC-02 Verification Workspace |
| `CRM-PT-` | CRM partners | CRM-PT-07 Partner Activation |
| `CRM-CM-` | CRM commission | CRM-CM-05 Approval Queue |
| `SUP-` | Support Portal | SUP-01 Ticket Queue |

---

# CANONICAL REFERENCE TABLES

## Lead Grades (Canonical — Business Workflow §6.1)

| Grade | Display Alias | Score Range | First Contact SLA | Priority | Active Outreach |
|-------|---------------|-------------|-------------------|----------|-----------------|
| **A+** | Hot | 85–100 | **1 hour** | P1 | Yes — immediate |
| **A** | Warm | 70–84 | **4 hours** | P2 | Yes — priority |
| **B** | Moderate | 50–69 | **24 hours** | P3 | Yes — standard |
| **C** | Cold | 30–49 | **48 hours** | P4 | Yes — nurture cadence |
| **Rejected** | Rejected | 0–29 | No contact | — | No (nurture-eligible per reason code) |

**Scoring formula:** `combinedScore = (ruleScore × 0.70) + (aiScore × 0.30)`

## LOS Application Stages (Canonical — S01–S09)

| Stage | Code | Customer Label | CRM Label | Primary Actor | Exit Gate |
|-------|------|----------------|-----------|---------------|-----------|
| S01 | `LEAD_CREATED` | Application Initiated | Lead / New Application | System / Channel | Application record created |
| S02 | `QUALIFIED` | Under Review | Qualified | Sales Executive | Customer committed to proceed |
| S03 | `DOCUMENT_COLLECTION` | Documents Required | Documentation | Sales / Customer / DSA | All mandatory docs verified |
| S04 | `ELIGIBILITY_CHECK` | Eligibility Verified | Eligibility Check | System / Credit Exec | Eligibility pass or reject |
| S05 | `BANK_LOGIN` | Submitted to Bank | Bank Login | Operations Executive | Lender acknowledgment |
| S06 | `CREDIT_REVIEW` | Under Bank Review | Credit Review | Lender (+ Credit) | Lender decision |
| S07 | `SANCTION` | Approved | Sanctioned | Lender / Operations | Sanction letter; customer acceptance |
| S08 | `DISBURSEMENT` | Disbursed | Disbursement | Lender / Operations | Funds transferred |
| S09 | `CLOSURE` | Complete | Closed | System | RM assigned; case closed |

**Terminal states:** `REJECTED`, `WITHDRAWN`, `ON_HOLD`

---

# PART 1: PERSONA JOURNEY MAPS

---

## J-CUS-01: Customer Journey (App Self-Serve + AI)

### Journey Overview

The Customer journey spans **Aware → Engaged → Applicant → Customer (Disbursed) → Advocate**, primarily through the Customer App with optional AI Advisor and Voice AI assistance. Customers may enter via campaign, referral link, organic app install, or partner-assisted onboarding.

### Actors

| Actor | Role in Journey |
|-------|-----------------|
| **Customer** | Primary — discovers, applies, uploads docs, tracks status |
| **AI Advisor** | Guides eligibility, product selection, document requirements |
| **Sales Executive** | Assigned on lead creation; assists if customer escalates |
| **System** | Scoring, notifications, stage transitions, document OCR |
| **Support Team** | Resolves tickets escalated from app or AI |
| **Relationship Manager** | Post-disbursement (S09) portfolio owner |

### Inputs

| Input | Source | Required At |
|-------|--------|-------------|
| Mobile number + OTP | Customer | Registration (C-004, C-005) |
| DPDP consent | Customer | C-006, C-019 |
| Profile data (personal, employment, income) | Customer | C-PR-02–C-PR-05, application wizard |
| Product selection | Customer / AI | C-LP-*, C-HL-*, etc. |
| Eligibility parameters | Customer / AI | C-HL-E01–E04, C-AI-05 |
| Documents (PAN, Aadhaar, income, collateral) | Customer | C-KYC-*, C-*-D01–D03 |
| Bureau pull consent | Customer | S02 gate |
| Sanction acceptance | Customer | S07 gate (C-HL-S02) |

### Outputs

| Output | Consumer | Trigger |
|--------|----------|---------|
| Customer profile | CRM, AI context | Registration complete |
| Lead record (graded A+–C or Rejected) | LMS, Sales Executive | Application start or eligibility with contact |
| Application (S01+) | LOS, internal teams | Product application submitted |
| Document records | DMS, Credit/Ops | Upload complete |
| Support ticket | Support queue | C-SUP-03, C-AI-10 |
| Referral attribution | Referral engine | C-REF-02 link share |
| NPS/CSAT response | Analytics | Post-milestone survey |

### States (Customer Lifecycle)

| State | Description | Entry Trigger | Exit Trigger |
|-------|-------------|---------------|--------------|
| **Aware** | Knows Kuber Finserve | Marketing touch | App install / web visit |
| **Registered** | Account created | OTP verified (C-005) | Profile started |
| **Engaged** | Exploring products / AI | Dashboard visit (C-008) | Eligibility check or application start |
| **Applicant — Draft** | Incomplete application | Wizard started | Submit or abandon |
| **Applicant — Active** | Application in LOS S01–S08 | Submit (C-HL-A05) | Disbursement or terminal state |
| **Customer (Disbursed)** | Active loan relationship | S08→S09 | Cross-sell / renewal cycle |
| **Advocate** | Referring others | Post-disbursement satisfaction | Ongoing |
| **Dormant** | No activity >12 months | Inactivity timer | Re-engagement campaign |
| **Churned** | Account closed / departed | Explicit closure | Limited win-back |

### Transitions (Primary Happy Path)

```
Aware ──→ Registered ──→ Engaged ──→ Applicant(Draft) ──→ Applicant(Active S01)
    ──→ S02 Qualified ──→ S03 Docs ──→ S04 Eligibility ──→ S05 Bank Login
    ──→ S06 Credit Review ──→ S07 Sanction ──→ S08 Disbursement ──→ S09 Closure
    ──→ Customer(Disbursed) ──→ Advocate
```

| Transition | Guard | Screen(s) |
|------------|-------|-----------|
| Aware → Registered | Valid OTP; consent accepted | C-004 → C-005 → C-006 |
| Registered → Engaged | Dashboard loaded | C-008 |
| Engaged → Applicant(Draft) | Product selected | C-LP-06, C-HL-A01 |
| Draft → Active (S01) | Application submitted | C-HL-A05 |
| S01 → S02 | Sales contact confirmed | C-HL-S01 (status update) |
| S02 → S03 | Customer consent | C-HL-D01 checklist opens |
| S03 → S04 | All docs verified | C-HL-D02, C-DOC-06 |
| S04 → S08 | Internal processing (customer waits) | C-HL-S01 timeline |
| S07 → S08 | Sanction accepted | C-HL-S02 |
| S08 → S09 | Disbursement confirmed | C-HL-S03 |
| S09 → Advocate | Referral program engagement | C-REF-01 |

### SLAs (Customer-Visible Commitments)

| Milestone | SLA | Customer Communication |
|-----------|-----|------------------------|
| OTP delivery | < 30 seconds | SMS/WhatsApp |
| Eligibility result (self-serve) | < 2 minutes | C-HL-E04, C-AI-05 |
| First status update after submit | Within 24 hours | Push + WhatsApp (S01→S02) |
| Document deficiency notification | < 4 hours of detection | C-HL-D03, push |
| Stage transition notification | Within 1 hour of transition | C-009, C-HL-S01 |
| Support first response (P2) | 4 hours | C-SUP-02 ticket update |
| Support first response (status query) | 2 hours | C-SUP-02 |
| RM welcome call post-disbursement | Within 7 days | Phone (RM initiated) |

### KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Registration-to-application rate | ≥ 40% | Funnel analytics |
| Application completion rate | ≥ 70% | Started vs submitted |
| Document first-pass rate | ≥ 60% | DMS |
| Time to first application | < 24 hours | Registration timestamp delta |
| Status self-service rate | ≥ 80% | App views vs support tickets |
| Customer NPS | ≥ 50 | Post-disbursement survey |
| CSAT (support) | ≥ 4.5/5 | Ticket close survey |
| Referral rate (advocates) | ≥ 15% | C-REF-03 conversions |
| AI-assisted conversion lift | +15% vs non-AI | A/B cohort |

### Escalations

| Trigger | Escalate To | Customer Touchpoint |
|---------|-------------|---------------------|
| "Talk to advisor" in AI chat | Assigned Sales Executive | C-AI-10 → ticket |
| Support ticket unresolved 4h (P2) | Support Lead | C-SUP-02 status |
| Complaint registered | Support L2 + Branch Manager | C-SUP-10 |
| Application ON_HOLD > 5 days | Branch Manager (internal); customer proactive update | C-HL-S01 |
| Fraud flag | Compliance; customer notified of review | C-SUP-10 |

### Exception Handling

| Exception | Detection | Resolution | Screen |
|-----------|-----------|------------|--------|
| Duplicate application (same product) | System at lead create | Link to existing application | C-HL-W01 |
| OTP failure (3 attempts) | Auth service | Cooldown; retry or support | C-005 |
| Document rejected (quality) | OCR validation | Re-upload guide | C-HL-D03, C-DOC-06 |
| Eligibility fail | Eligibility engine | AI suggests alternatives | C-AI-05, C-HL-E04 |
| Lender reject (S06) | Ops records decision | Clear reason; nurture path | C-HL-S01 |
| Customer withdraws | Customer action | Confirmation; reason captured | Application detail |
| Non-serviceable pincode | Scoring cap → grade C/Rejected | Inform limited options | C-PR-03 |
| Bureau consent declined | Consent gate | Block S02→S03; explain requirement | C-019 |

### ASCII Flow — Customer Self-Serve Application (Home Loan Example)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ C-001    │───→│ C-004/05 │───→│ C-008    │───→│ C-LP-02  │───→│ C-HL-E01 │
│ Splash   │    │ Login    │    │ Dashboard│    │ HL Family│    │ Eligibility│
└──────────┘    └──────────┘    └────┬─────┘    └──────────┘    └────┬─────┘
                                     │                               │
                              ┌──────▼──────┐                 ┌──────▼──────┐
                              │ C-AI-02     │                 │ C-HL-E04    │
                              │ AI Advisor  │                 │ Results     │
                              └──────┬──────┘                 └──────┬──────┘
                                     │                               │
                                     └───────────┬───────────────────┘
                                                 ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ C-HL-S03 │←───│ C-HL-S02 │←───│ C-HL-S01 │←───│ C-HL-D02 │←───│ C-HL-A05 │
│ Disburse │    │ Sanction │    │ Tracking │    │ Upload   │    │ Submit   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │                                                                │
     ▼                                                                ▼
┌──────────┐                                                   [Lead Created]
│ C-REF-01 │                                                   [Grade A+–C]
│ Referral │                                                   [S01 → S09]
└──────────┘
```

### ASCII Flow — Customer + AI Advisor Parallel Path

```
Customer                    AI Advisor (C-AI-*)              Backend
────────                    ────────────────              ───────
Open C-AI-01 ─────────────→ Greeting + disclaimer
Ask eligibility ──────────→ Collect requirements ───────→ Eligibility API
                            Explain result (C-AI-05)
Accept recommendation ────→ "Start Application" ────────→ Create lead + app
                            Guide S03 docs ─────────────→ Document checklist
Status query ─────────────→ Fetch application stage ────→ LOS read
"Talk to someone" ────────→ Escalate (C-AI-10) ────────→ Ticket + Sales alert
```

---

## J-DSA-01: DSA Partner Journey

### Journey Overview

DSA Partners originate leads through the DSA App, track pipeline through disbursement, earn tier-based commissions, and manage disputes. Journey includes onboarding, certification, lead submission, document assistance, commission tracking, and payout.

### Actors

| Actor | Role |
|-------|------|
| **DSA Partner** | Lead origination, customer consent, doc assistance |
| **Branch Manager** | Partner approval, dispute mediation, performance review |
| **Sales Executive** | Lead conversion post-assignment |
| **System** | Scoring (+10 bonus for complete DSA leads), commission calc |
| **Finance Head** | Commission approval, dispute final decision |
| **Compliance** | AML/KYC on partner onboarding |

### Inputs

| Input | Source | Screen |
|-------|--------|--------|
| Business registration (PAN, type) | DSA | D-006 |
| Bank account for payout | DSA | D-007 |
| Partner KYC documents | DSA | D-008 |
| eSigned DSA agreement | DSA | D-009 |
| Customer mobile + OTP consent | DSA + Customer | D-LD-14, D-LD-01 |
| Customer details + product | DSA | D-LD-02, D-LD-03 |
| Preliminary documents (optional) | DSA | D-LD-04, D-LD-11 |
| Dispute evidence | DSA | D-COM-09 |

### Outputs

| Output | Consumer |
|--------|----------|
| Activated partner account | DSA App access |
| Lead with locked `partnerId` | LMS (immutable attribution) |
| Graded lead (with +10 scoring bonus if complete) | Assignment engine |
| Commission PROVISIONAL record | D-COM-01, Finance queue |
| Monthly statement PDF | D-COM-04 |
| NEFT payout confirmation | D-COM-07 |
| Dispute case | CRM-PT-12, CRM-CM-09 |

### States (DSA Partner Lifecycle)

| State | Description |
|-------|-------------|
| **Interest Registered** | D-003 submitted; pending review |
| **Pending Approval** | Branch Manager review (D-010) |
| **KYC In Progress** | Documents submitted; Compliance pending |
| **Active — Bronze** | Default tier on activation |
| **Active — Silver/Gold/Platinum** | Tier upgrade per performance |
| **Suspended** | KYC expiry, fraud, quality score < 50 |
| **Terminated** | Contract breach, blacklist |

### States (DSA Lead Tracking — Simplified View)

| DSA-Visible Status | Internal Mapping |
|--------------------|------------------|
| Submitted | NEW, SCORED, ASSIGNED |
| In Contact | CONTACTED |
| Documents Pending | S03 |
| Under Review | S04–S06 |
| Approved | S07 |
| Disbursed | S08 |
| Closed — No Reward | REJECTED, WITHDRAWN |
| Duplicate | DUPLICATE |

### Transitions

```
Interest(D-003) → Pending Approval → KYC Complete → Active(Bronze)
    → [Submit Lead D-LD-05] → Lead Assigned → ... → Disbursed
    → Commission PROVISIONAL → APPROVED → PAID
    → [Optional: Dispute D-COM-09] → Resolved
    → [Performance] → Tier Upgrade (D-019)
```

### SLAs

| Activity | SLA | Escalation |
|----------|-----|------------|
| Partner application review | 3 business days | Admin notify at day 3 |
| Partner KYC completion | 7 days from approval | Auto-reminder day 5 |
| AML check | 2 business days | Compliance queue |
| Lead assignment after submit | < 5 minutes | System alert if > 5 min |
| Commission PROVISIONAL notification | Immediate on disbursement | — |
| Dispute window | 15 days from PROVISIONAL | — |
| Dispute resolution | 10 business days | Finance Head at day 10 |
| Payout after approval | 2 business days | Finance Head |
| Tier review | Monthly batch | Branch Manager |

### KPIs

| KPI | Target |
|-----|--------|
| Lead submission volume | Per partner tier targets |
| A+ grade % of partner leads | ≥ 30% (quality indicator) |
| Lead-to-disbursement conversion | ≥ 12% |
| Commission dispute rate | < 2% |
| Document completeness at submission | ≥ 50% with pre-docs |
| Training certification completion | 100% mandatory modules |
| Partner NPS | ≥ 40 |

### Escalations

| Trigger | Escalate To |
|---------|-------------|
| Partner approval delayed > 3 days | Admin |
| Lead unassigned > 30 min | Branch Manager |
| Commission dispute > 10 days | Finance Head |
| Fraud flag on partner lead | Compliance (immediate) |
| Quality score < 50 | Branch Manager review |
| Clawback dispute | Finance Head + Branch Manager |

### Exception Handling

| Exception | Handling |
|-----------|----------|
| Duplicate lead (same phone + product < 30 days) | DUPLICATE state; no commission |
| Customer OTP consent refused | Block D-LD-05 submit |
| Partner suspended mid-pipeline | Leads continue; new submissions blocked |
| Disbursement reversal within clawback | CLAWED_BACK; D-COM-13 notice |
| KYC expiry | Auto-suspend D-026; leads rejected |
| Wrong bank account | Block payout; D-007 update required |

### ASCII Flow — DSA Lead Submission

```
┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ D-LD-01 │──→│ D-LD-14  │──→│ D-LD-02  │──→│ D-LD-03  │──→│ D-LD-04  │
│ Mobile  │   │ OTP Cons │   │ Cust Det │   │ Product  │   │ Pre-Docs │
└─────────┘   └──────────┘   └──────────┘   └──────────┘   └────┬─────┘
                                                                 │
                    ┌──────────┐   ┌──────────┐   ┌─────────────▼─────┐
                    │ D-LD-07  │←──│ D-LD-06  │←──│ D-LD-05 Submit    │
                    │ Lead List│   │ Success  │   │ Review            │
                    └────┬─────┘   └──────────┘   └───────────────────┘
                         │
         ┌───────────────▼───────────────────────────────────────────────┐
         │ SYSTEM: Validate → Score (+10 if complete) → Grade A+–C     │
         │         → Assign Sales Exec → Notify DSA (D-LD-08/09)       │
         └───────────────────────────────────────────────────────────────┘
```

### ASCII Flow — DSA Commission Journey

```
Disbursement (S08)
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ PROVISIONAL  │────→│ 15-day       │────→│  APPROVED    │────→│    PAID      │
│ D-COM-03     │     │  dispute win │     │  (Finance)   │     │  D-COM-07    │
└──────┬───────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       │              D-COM-09 Dispute
       │                    │
       ▼                    ▼
  D-COM-01 Dashboard   CRM-CM-09 Resolution
```

---

## J-REF-01: Referral Partner Journey

### Journey Overview

Referral Partners refer customers with **lighter onboarding and reward-based compensation** (not full DSA commission). Six sub-types: Builder, Property Dealer, CA, Broker, Channel Partner, Corporate Partner. Limited pipeline visibility.

### Actors

| Actor | Role |
|-------|------|
| **Referral Partner** | Submit referral; share link/QR |
| **Customer (as referrer)** | C-REF-* program (distinct from B2B referral partner) |
| **Branch Manager / Admin** | Partner approval |
| **Sales Executive** | Converts referred lead |
| **System** | 90-day attribution window; duplicate detection |
| **Finance** | Reward payout (monthly statement) |

### Inputs

| Input | Required | Channel |
|-------|----------|---------|
| Partner type + business details | ✓ | Online registration |
| Mobile OTP | ✓ | Verification |
| Business proof (type-specific) | ✓ | Upload |
| Bank account | ✓ | Reward payout |
| Referral agreement (eSign) | ✓ | Portal |
| Customer name + mobile | ✓ | Referral submit |
| Product interest | ✓ | Referral submit |
| Customer OTP consent | ✓ | On-device |
| Referral link click (UTM) | Auto | Link/QR (C-REF-02) |

### Outputs

| Output | Description |
|--------|-------------|
| Referral ID | Tracking reference |
| Attributed lead | `referralPartnerId` locked at creation |
| Simplified status | Referred → In Progress → Converted → Reward Paid |
| Reward PROVISIONAL | On disbursement |
| Monthly reward statement | PDF |

### States (Referral Partner View)

| State | Internal Mapping | Reward Eligible |
|-------|------------------|-----------------|
| **Referred** | Lead NEW/ASSIGNED | No |
| **In Progress** | S01–S07, CONTACTED, QUALIFIED | No |
| **Converted** | S08 Disbursed | Triggers reward calc |
| **Reward Pending** | PROVISIONAL | Pending approval |
| **Reward Paid** | PAID | Complete |
| **Closed — No Reward** | REJECTED, WITHDRAWN, DUPLICATE, EXPIRED | No |

### Transitions

```
Register → Verify → Approved → Share Link/Submit Referral
    → Referred → In Progress (90-day attribution window active)
    → Converted (disbursement) → Reward Pending → Reward Paid
    OR → Closed — No Reward
```

**Attribution rules:**
- 90 days from link click to application creation
- Duplicate: same phone + product within 30 days → DUPLICATE flag → no reward
- Reward trigger: disbursement only (not sanction)

### SLAs

| Activity | SLA |
|----------|-----|
| Standard partner approval | < 48 hours |
| Corporate Partner approval | Management approval; < 5 days |
| Referral acknowledgment | Immediate on submit |
| Reward PROVISIONAL | Immediate on disbursement |
| Reward payout | Monthly cycle (with commission batch) |

### KPIs

| KPI | Target |
|-----|--------|
| Referral conversion (disbursed / referred) | ≥ 5% |
| Attribution window utilization | Track click-to-app time |
| Duplicate rate | < 5% |
| Partner activation rate | ≥ 80% of registrations |
| Reward dispute rate | < 1% |

### Escalations

| Trigger | Escalate To |
|---------|-------------|
| Approval > 48 hours | Admin |
| Attribution dispute (partner vs direct) | Branch Manager |
| Reward not paid post-disbursement | Finance Head |
| Corporate MOU exception | Management |

### Exception Handling

| Exception | Handling |
|-----------|----------|
| Attribution window expired (> 90 days) | No reward; partner notified |
| Customer applied via different channel | First valid attribution wins per rules |
| Partial name mismatch | Branch Manager manual attribution review |
| Disbursement reversal | Reward clawback |
| Partner type misclassified | Admin reclassification |

### ASCII Flow — Referral Attribution

```
Referral Partner                System                      Sales
────────────────                ──────                      ─────
Share link (C-REF-02) ────────→ LINK_CLICKED
                                Store UTM + partnerId
Customer clicks ────────────────→ ATTRIBUTED (90-day clock)
Submit referral form ─────────→ LEAD_CREATED (partnerId locked)
                                Grade A+–C → Assign ────────→ Contact
                                ... S01–S08 ...
Disbursement ─────────────────→ CONVERTED
                                Reward PROVISIONAL
Finance batch ────────────────→ REWARD_PAID
```

### Screen References

| Actor | Screens |
|-------|---------|
| B2B Referral Partner | CRM-PT-05, CRM-PT-06; D-003 (lite registration) |
| Customer-as-Referrer | C-REF-01 through C-REF-09 |
| Internal | CRM-PT-07 (activation), CRM-CM-* (reward ledger) |

## J-SAL-01: Sales Executive Journey

### Journey Overview

Sales Executives convert assigned leads through contact, qualification, document collection, and application advancement to S03+ handoff. Primary tools: CRM dashboard, AI Sales Copilot (CRM-DB-11), click-to-call, mobile field visits.

### Actors

| Actor | Role |
|-------|------|
| **Sales Executive** | Lead contact, qualification, doc collection, conversion |
| **AI Sales Copilot** | Lead insights, NBA, missing docs, approval probability |
| **Customer / DSA** | Document provision, consent |
| **Credit Executive** | Receives complete applications at S04 |
| **Branch Manager** | SLA escalation, reassignment, coaching |
| **System** | SLA timers, task automation, lead scoring display |

### Inputs

| Input | Source | Screen |
|-------|--------|--------|
| Assigned lead queue | LMS | CRM-DB-01, CRM-LD-01 |
| Lead score breakdown | Scoring engine | CRM-LD-04 |
| AI Copilot insights | AI service | CRM-DB-11 |
| Call disposition + notes | Executive | CRM-LD-02, CRM-CU-09 |
| Qualification form | Executive | CRM-LD-07 |
| Document uploads (customer) | Customer app / DSA | CRM-AP-04 |
| Conversion request | Executive | CRM-LD-12 |

### Outputs

| Output | Consumer |
|--------|----------|
| Lead status updates (CONTACTED, QUALIFIED, NURTURE, REJECTED) | LMS |
| Application (S01→S02→S03) | LOS |
| Interaction log | CRM-CU-07 |
| SLA compliance metrics | Branch Manager dashboard |
| Handoff to Credit | CRM-AP-15 queue |

### States (Lead Handling — Sales View)

| State | Sales Action Required |
|-------|----------------------|
| ASSIGNED | First contact within grade SLA |
| CONTACTED | Qualify or nurture |
| QUALIFIED | Create/ advance application |
| NURTURE | Scheduled follow-up |
| REJECTED | Record reason code (R-01–R-10) |
| CONVERTED | Close lead; monitor application |

### Transitions

```
Lead Assigned (CRM-LD-01) → Review (CRM-LD-02, CRM-LD-04, Copilot)
    → First Contact [SLA: A+=1h, A=4h, B=24h, C=48h]
    → Qualify (CRM-LD-07) → Convert (CRM-LD-12) → Application S01
    → S01→S02 (contact confirmed) → S02→S03 (consent + checklist)
    → Document follow-up until S03 complete → Handoff to Credit (S04)
```

### SLAs

| Activity | SLA | Escalation |
|----------|-----|------------|
| First contact — A+ | 1 hour | Branch Manager at 1h |
| First contact — A | 4 hours | Branch Manager at 4h |
| First contact — B | 24 hours | Weekly report |
| First contact — C | 48 hours | Nurture cadence |
| S01→S02 | 24 hours (48h escalate) | Branch Manager |
| S02→S03 start | 48 hours (72h escalate) | Branch Manager |
| Document deficiency follow-up | 24 hours | Sales manager |
| S03 complete | 5 business days | Sales manager at 7d |
| Lead reassignment (manager) | 1 hour | Regional if breached |

### KPIs

| KPI | Target |
|-----|--------|
| First contact SLA compliance | ≥ 95% |
| Conversion rate (lead → disbursement) | ≥ 12% |
| Monthly disbursement count | Per branch target |
| Document completeness first pass | ≥ 70% |
| Average time to submission (S03 complete) | < 5 days |
| Call attempts before disqualify | ≥ 5 |
| Copilot adoption rate | ≥ 80% |
| Customer satisfaction | ≥ 4.5/5 |

### Escalations

| Trigger | Escalate To |
|---------|-------------|
| A+ uncontacted > 1 hour | Branch Manager |
| A uncontacted > 4 hours | Branch Manager |
| S01→S02 > 48 hours | Branch Manager |
| S03 > 7 days | Sales manager |
| Customer complaint during sales | Support L2 + Branch Manager |
| Credit conditional return | Executive resolves conditions |
| VIP lead (A+, > ₹1 Cr) | Branch Manager + Senior Sales |

### Exception Handling

| Exception | Handling |
|-----------|----------|
| Wrong number | Disposition; 2 more attempts then R-09 |
| Customer not interested | AR-01 at S02; nurture eligible |
| DSA lead — partner dispute on ownership | Branch Manager; `partnerId` immutable |
| Unable to reach (5+ attempts) | R-09; NURTURE state |
| Competing application exists | Link; do not duplicate |
| Bureau consent refused | Explain; pause at S02 |

### ASCII Flow — Sales Executive Daily Loop

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ CRM-DB-01   │────→│ CRM-LD-01   │────→│ CRM-LD-02   │────→│ Call/Meet   │
│ Dashboard   │     │ Priority Q  │     │ Lead Detail │     │ + Copilot   │
└─────────────┘     └─────────────┘     └──────┬──────┘     └──────┬──────┘
                                               │                    │
                    ┌─────────────┐     ┌──────▼──────┐     ┌───────▼───────┐
                    │ CRM-AP-04   │←────│ CRM-LD-12   │←────│ CRM-LD-07     │
                    │ Documents   │     │ Convert     │     │ Qualify       │
                    └──────┬──────┘     └─────────────┘     └───────────────┘
                           │
                           ▼
                    S03 Complete ──→ Credit Queue (CRM-AP-15)
```

---

## J-RM-01: Relationship Manager Journey

### Journey Overview

RMs own **post-disbursement portfolio** (S09 handoff): retention, cross-sell, renewal, satisfaction monitoring. Portfolio size 200–500 customers; minimum quarterly touchpoint.

### Actors

| Actor | Role |
|-------|------|
| **Relationship Manager** | Portfolio owner post-S09 |
| **Customer** | Servicing, cross-sell recipient |
| **Sales Executive** | Handles new applications from RM referrals |
| **AI Advisor** | Cross-sell suggestions in customer app |
| **Branch Manager** | Portfolio rebalancing, escalation |
| **Support Team** | Second-line for unresolved issues |

### Inputs

| Input | Source | Screen |
|-------|--------|--------|
| Portfolio assignment (auto at S09) | System | CRM-DB-02 |
| Customer 360 summary | System | CRM-CU-02 |
| AI cross-sell recommendations | Analytics AI | CRM-CU-10 |
| NPS/CSAT scores | Surveys | CRM-CU-07 |
| Churn risk alerts | Analytics | CRM-DB-02 alerts |

### Outputs

| Output | Consumer |
|--------|----------|
| Welcome call (within 7 days) | Customer |
| Cross-sell opportunities | Sales Executive (handoff) |
| Retention interventions | Customer |
| Referral encouragement | C-REF-01 activation |
| Escalated tickets | Support (SUP-*) |

### States (Portfolio Customer)

| Segment | Cadence | RM Action |
|---------|---------|-----------|
| High-value | Monthly touch | Proactive cross-sell |
| Standard | Quarterly touch | Wellness check |
| At-risk (churn alert) | Weekly until stabilized | Retention outreach |
| Dormant (>12 months) | Campaign-driven | Re-engagement |
| Cross-sell in progress | Per opportunity | Coordinate with Sales |

### Transitions

```
S09 Closure → Auto-assign RM → Customer 360 generated (CRM-CU-02)
    → Welcome call (7 days) → Portfolio segment assigned
    → [Quarterly] Wellness check → [AI trigger] Cross-sell outreach
    → Handoff to Sales (new application) → RM tracks outcome
    → [Satisfied customer] Referral encouragement (C-REF-01)
```

### SLAs

| Activity | SLA |
|----------|-----|
| Welcome call post-disbursement | 7 days |
| Cross-sell outreach on AI trigger | 5 business days |
| First response to portfolio customer issue | 4 hours |
| Escalation to Support | Same day if unresolved |
| Top-up/renewal outreach | 90 days before eligibility |

### KPIs

| KPI | Target |
|-----|--------|
| Portfolio retention rate | ≥ 95% |
| Cross-sell conversion | ≥ 8% of portfolio |
| NPS (portfolio) | ≥ 55 |
| Quarterly touchpoint compliance | ≥ 90% |
| Referral generation from portfolio | ≥ 10% |
| Churn prevention success | ≥ 60% of at-risk saved |

### Escalations

| Trigger | Escalate To |
|---------|-------------|
| Customer complaint (portfolio) | Support L2 → Branch Manager |
| Cross-sell opportunity > ₹50L | Branch Manager co-call |
| Churn risk score critical | Branch Manager alert |
| Data access request | Compliance |

### Exception Handling

| Exception | Handling |
|-----------|----------|
| RM leave / absence | Branch Manager reassigns portfolio |
| Customer requests different RM | Branch Manager approval |
| Cross-sell product not yet launched | Log interest; campaign queue |
| Duplicate RM assignment | System dedup; Admin fix |

### ASCII Flow — RM Portfolio Loop

```
S08→S09 ──→ Assign RM ──→ CRM-DB-02 Portfolio Dashboard
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   Welcome Call         Cross-sell Review      Churn Alert
   (7-day SLA)          (CRM-CU-10)            (proactive)
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ▼
                    CRM-CU-09 Interaction Log
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
        Sales Handoff                    Support Escalation
        (new application)                (SUP-01)
```

---

## J-CRD-01: Credit Executive Journey

### Journey Overview

Credit Executives perform **S04 eligibility assessment**, document verification, risk evaluation, and credit recommendations before Operations submits to lenders.

### Actors

| Actor | Role |
|-------|------|
| **Credit Executive** | Assessment, verification, recommendation |
| **AI Sales Copilot** | Credit analysis summary, risk factors |
| **Operations Executive** | Receives approved applications (S05) |
| **Sales Executive** | Fulfills conditional requirements |
| **Branch Manager / Regional** | Policy exceptions |
| **Compliance** | Fraud holds |

### Inputs

| Input | Screen |
|-------|--------|
| Credit queue applications | CRM-AP-15 |
| Eligibility engine results | CRM-AP-03 |
| Document checklist + OCR | CRM-AP-04, CRM-DOC-03 |
| Exception request | CRM-AP-12 |
| FOIR/LTV/DSCR calculations | System-generated |

### Outputs

| Output | Next Step |
|--------|-----------|
| Approve for submission | → Ops queue (S05) |
| Conditional approve | → Sales for fulfillment |
| Refer (borderline) | → Senior Credit / Branch Manager |
| Reject (AR-03–AR-05) | → Sales with reason |
| Fraud hold | → Compliance |

### States (Credit Assessment)

| State | Description |
|-------|-------------|
| **Queued** | In CRM-AP-15 |
| **In Assessment** | Executive reviewing |
| **Pending Exception** | Awaiting manager approval |
| **Approved** | Ready for S05 |
| **Conditional** | Rework to S03 |
| **Rejected** | Terminal at S04 |
| **Fraud Hold** | Compliance review |

### Transitions

```
CRM-AP-15 Queue → CRM-AP-05 Credit Tab → Run/review eligibility (CRM-AP-03)
    → CRM-DOC-01/02 Document verification
    → Decision: Approve | Conditional | Refer | Reject | Fraud Hold
    → Approve: S04→S05 gate opens → CRM-AP-16 Ops queue
    → Conditional: Rework RW-01 to S03
    → Reject: AR-03/04/05 recorded
```

### SLAs

| Activity | SLA | Escalation |
|----------|-----|------------|
| S03→S04 assessment start | 24 hours | Ops Head at 48h |
| Document verification | Same day as queue entry | Credit manager |
| Exception approval (Credit Exec authority) | 4 hours | Branch Manager |
| Exception approval (FOIR 60–65%) | 24 hours | Regional Manager |
| Fraud hold triage | 4 hours | Compliance immediate |

### KPIs

| KPI | Target |
|-----|--------|
| S04 processing TAT | ≤ 24 hours avg |
| S04 eligibility pass rate | Per product benchmark |
| First-pass approval rate | ≥ 75% |
| Exception rate | < 10% |
| Fraud detection rate | 100% flagged cases reviewed |
| Rework rate (S04→S03) | < 15% |
| Document verification accuracy | ≥ 98% |

### Escalations

| Scenario | Escalate To |
|----------|-------------|
| High-value (> ₹50L) | Senior Credit / Branch Manager |
| FOIR > 65% | Regional Manager |
| Fraud suspicion | Compliance (immediate) |
| Document authenticity doubt | Compliance (4h) |
| Lender-specific query | Operations Executive |

### Exception Handling

| Exception | Authority | Code |
|-----------|-----------|------|
| FOIR 50–60% (product max 55%) | Credit Executive | Manual override |
| FOIR 60–65% | Branch Manager + Credit | Dual approval |
| FOIR > 65% | Regional Manager | Business case |
| CIBIL 600–650 (min 650) | Credit Executive | Compensating factors |
| CIBIL < 600 | Auto-reject | AR-04 |
| LTV > max by < 5% | Credit Executive | Additional collateral |
| Name mismatch PAN vs app | Credit Executive | Manual override + audit |

### ASCII Flow — Credit Assessment (S04)

```
CRM-AP-15          CRM-AP-05/03        CRM-DOC-02         Decision
─────────          ─────────────        ────────────         ────────
Queue ───────────→ Eligibility ───────→ Doc Verify ───────→ ┌─ Approve → S05
         Copilot   Review               OCR Review          ├─ Conditional → S03
         insights                                            ├─ Refer → Manager
                                                             ├─ Reject → Sales
                                                             └─ Fraud → Compliance
```

---

## J-OPS-01: Operations Executive Journey

### Journey Overview

Operations Executives manage **S05 bank login through S08 disbursement**: lender submission, query response, sanction coordination, disbursement recording, commission trigger.

### Actors

| Actor | Role |
|-------|------|
| **Operations Executive** | Lender coordination, status sync |
| **Lender** | Underwriting, sanction, disbursement |
| **Credit Executive** | Pre-submission source |
| **Sales Executive** | Customer communication support |
| **Customer / DSA** | Query response, condition fulfillment |
| **System** | Commission trigger on disbursement |

### Inputs

| Input | Screen |
|-------|--------|
| Ops processing queue | CRM-AP-16 |
| Approved application package | CRM-AP-02, CRM-DOC-07 |
| Lender portal credentials | Ops secure vault |
| Lender acknowledgment | CRM-AP-06 |
| Sanction letter | CRM-AP-07 |
| Disbursement confirmation | CRM-AP-08 |

### Outputs

| Output | Trigger |
|--------|---------|
| S05 BANK_LOGIN complete | Lender ACK |
| S06 status updates | Lender decision recorded |
| S07 sanction stored (S3) | Customer notified (C-HL-S02) |
| S08 disbursement record | Commission PROVISIONAL |
| S09 closure + RM assignment | Portfolio handoff |
| Stakeholder notifications | Customer, DSA, Sales, RM |

### States (Ops Processing)

| State | LOS Stage |
|-------|-----------|
| Ready for Submission | S04 approved |
| Submitted to Lender | S05 |
| Awaiting Lender Decision | S06 |
| Sanction Processing | S07 |
| Disbursement Processing | S08 |
| Closed | S09 |
| On Hold | Lender query, legal, valuation |
| Rework | RW-02 through RW-06 |

### Transitions

```
CRM-AP-16 → CRM-AP-11 Lender Submit → S05 (ACK received)
    → S06 track lender → Record decision
    → S07 sanction → Customer acceptance → S08 disbursement
    → Record UTR → Commission trigger → S09 closure
```

### SLAs

| Transition | SLA | Escalation |
|------------|-----|------------|
| S04→S05 | 24 hours (48h) | Ops Head |
| S05→S06 | 48 hours (72h) | Ops Executive manager |
| S06→S07 | Lender SLA 5–15 days (SLA+2d) | Ops Head |
| S07→S08 | 3 business days (5d) | Ops Head |
| S08→S09 | 24 hours | Automatic |
| Lender query response | 24 hours | Ops Head |
| Disbursement recording | Same day as lender confirmation | — |

### KPIs

| KPI | Target |
|-----|--------|
| S05 submission TAT | ≤ 24 hours |
| S06 lender TAT | Per lender SLA |
| S06→S07 conversion | ≥ 60% |
| S07→S08 conversion | ≥ 85% |
| Lender query response rate | ≥ 95% within SLA |
| Disbursement recording accuracy | 100% |
| Rework rate from lender | < 10% |

### Escalations

| Trigger | Escalate To |
|---------|-------------|
| S06 lender SLA + 2 days | Ops Head |
| S07 terms mismatch | Sales Executive (RW-04) |
| S08 pre-disbursement hold | Branch Manager |
| Legal/valuation issue (RW-06) | Branch Manager + Compliance |
| Lender portal outage | Admin + DevOps |

### Exception Handling

| Exception | Rework Code | Return To |
|-----------|-------------|-----------|
| Lender document query | RW-02 | S03 or S04 |
| Lender conditional approval | RW-03 | S03 |
| Sanction terms mismatch | RW-04 | S06 |
| Pre-disbursement condition | RW-05 | S03 or S07 |
| Legal/valuation issue | RW-06 | S03 |
| Disbursement failed | AR-08 | Ops investigation |
| Lender reject | AR-06 | Sales notify customer |

### ASCII Flow — Operations S05–S09

```
Credit Approved (S04)
        │
        ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ S05 Bank Login│───→│ S06 Lender    │───→│ S07 Sanction  │
│ CRM-AP-11     │    │ Review        │    │ CRM-AP-07     │
└───────────────┘    └───────┬───────┘    └───────┬───────┘
                             │ Query?             │
                             ▼                    ▼
                        RW-02/03 → S03      Customer Accept
                                                  │
                                                  ▼
                                          ┌───────────────┐
                                          │ S08 Disburse  │
                                          │ CRM-AP-08     │
                                          └───────┬───────┘
                                                  │
                              ┌───────────────────┼───────────────────┐
                              ▼                   ▼                   ▼
                        Commission          Notify all           S09 → RM
                        PROVISIONAL         stakeholders         assign
```

## J-BM-01: Branch Manager Journey

### Journey Overview

Branch Managers own **branch-level performance**: team management, lead distribution, partner oversight, SLA compliance, escalation resolution, and exception approval within authority limits.

### Actors

| Actor | Role |
|-------|------|
| **Branch Manager** | Team lead, escalation resolver, partner approver |
| **Sales / RM / Credit / Ops** | Direct reports (dotted for Credit/Ops) |
| **DSA / Referral Partners** | Territory partners |
| **Regional Manager** | Reports to; escalations up |
| **Finance Head** | Commission disputes |
| **Compliance** | Partner fraud, policy violations |

### Inputs

| Input | Screen |
|-------|--------|
| Branch dashboard KPIs | CRM-DB-05 |
| SLA breach alerts | CRM-LD-10 |
| Team performance data | CRM-DB-05, CRM-LD-08 |
| Partner onboarding queue | CRM-PT-03 |
| Exception requests | CRM-AP-12 |
| Customer complaints | SUP-*, CRM-CU-07 |

### Outputs

| Output | Effect |
|--------|--------|
| Lead reassignment | CRM-LD-03 |
| Target allocation | Team quotas |
| Partner activation/suspension | CRM-PT-07, CRM-PT-08 |
| Exception approval/denial | S04→S05 gate |
| Escalation resolution | Ticket/complaint closure |
| Coaching actions | 1:1 documentation |

### States (Branch Operating Mode)

| Mode | Trigger |
|------|---------|
| **Normal Operations** | SLA compliance ≥ 90% |
| **SLA Alert** | Any A+/A breach or S03 > 7d |
| **Escalation Active** | Complaint, dispute, fraud |
| **Partner Review** | Quality score drop, dispute pattern |
| **Month-End Close** | Target reconciliation |

### Transitions

```
CRM-DB-05 Daily Review → Monitor SLA (CRM-LD-10)
    → [Breach] Reassign/Coach → Resolve
    → [Partner] CRM-PT-03 Approve → CRM-PT-07 Activate
    → [Exception] CRM-AP-12 Review → Approve/Escalate to Regional
    → [Complaint] Investigate → Resolve or escalate Regional
    → Weekly: Team 1:1, DSA performance review
```

### SLAs

| Activity | SLA |
|----------|-----|
| Lead reassignment on request | 1 hour |
| A+ uncontacted escalation response | 30 minutes |
| Partner onboarding approval | 3 business days |
| Customer complaint first response | 1 hour |
| Exception decision (within authority) | 4 hours |
| DSA dispute mediation | 3 business days |
| Escalation from executive | Same business day |

### KPIs

| KPI | Target |
|-----|--------|
| Branch disbursement vs target | ≥ 100% |
| Branch conversion rate | ≥ 15% |
| SLA compliance (all functions) | ≥ 90% |
| Customer NPS (branch) | ≥ 50 |
| DSA partner quality (A+ % ) | ≥ 25% |
| Commission dispute rate | < 2% |
| Team productivity (disb/exec/month) | Per benchmark |
| Complaint resolution within 48h | ≥ 95% |

### Escalations

| Trigger | Escalate To |
|---------|-------------|
| Credit exception beyond BM authority | Regional Manager |
| Complaint unresolved 48h | Regional Manager |
| Fraud flag | Compliance Manager |
| System outage affecting branch | Admin via Support |
| Partner blacklist recommendation | Regional + Compliance |
| VIP customer (A+, > ₹1 Cr) | BM direct ownership |

### Exception Handling

| Exception | BM Authority |
|-----------|--------------|
| FOIR 60–65% | Dual approve with Credit |
| Lead reassignment dispute between execs | BM decides |
| DSA commission dispute | Mediate; escalate Finance if > threshold |
| Partner suspension | Warn/suspend per policy |
| Resource shortage | Request hiring from Regional |

### ASCII Flow — Branch Manager Escalation Hub

```
                    ┌─────────────────────────────────┐
                    │         CRM-DB-05               │
                    │      Branch Dashboard           │
                    └───────────┬─────────────────────┘
                                │
        ┌───────────┬───────────┼───────────┬───────────┐
        ▼           ▼           ▼           ▼           ▼
   CRM-LD-10   CRM-PT-03   CRM-AP-12   SUP Escal.  Team KPI
   SLA Alerts  Partner Q   Exceptions  Complaints  Review
        │           │           │           │           │
        └───────────┴───────────┴───────────┴───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Resolve / Coach /    │
                    │  Approve / Escalate   │
                    │  to Regional Manager  │
                    └───────────────────────┘
```

---

## J-RM-02: Regional Manager Journey

### Journey Overview

Regional Managers oversee **3–15 branches**: regional revenue accountability, Branch Manager coaching, resource allocation, cross-branch best practices, and escalations from Branch Managers.

### Actors

| Actor | Role |
|-------|------|
| **Regional Manager** | Multi-branch oversight |
| **Branch Managers** | Direct reports |
| **Sales Head / Business Head** | Reports to |
| **Finance Head** | Regional commission review |
| **Management** | Quarterly business reviews |

### Inputs

| Input | Screen |
|-------|--------|
| Regional dashboard | CRM-DB-06 |
| Branch comparison reports | Analytics |
| Escalations from Branch Managers | CRM-LD-10, SUP-* |
| FOIR > 65% exception requests | CRM-AP-12 |
| Partner network data | CRM-PT-11 |

### Outputs

| Output | Effect |
|--------|--------|
| Regional target allocation | Branch targets |
| Branch intervention plans | Underperforming branches |
| FOIR > 65% exception decisions | Credit path |
| Hiring recommendations | HR pipeline |
| Quarterly business review pack | Management |

### States

| State | Description |
|-------|-------------|
| **On Track** | ≥ 90% branches at target |
| **At Risk** | 1–2 branches below 80% |
| **Intervention** | Action plan active |
| **Expansion** | New branch launch in region |

### SLAs

| Activity | SLA |
|----------|-----|
| Branch Manager monthly review | Monthly |
| Escalation from Branch Manager | 4 hours |
| FOIR > 65% exception decision | 24 hours |
| Regional forecast submission | Monthly by day 5 |
| Underperforming branch action plan | 5 business days from trigger |

### KPIs

| KPI | Target |
|-----|--------|
| Regional disbursement volume | Per target |
| Regional revenue | Per target |
| Regional conversion rate | ≥ 15% |
| Branch target achievement (avg) | ≥ 90% branches at 100% |
| Partner growth YoY | +20% |
| Regional NPS | ≥ 50 |
| Regional SLA compliance | ≥ 90% |
| Branch Manager retention | ≥ 90% |

### Escalations

| Trigger | Escalate To |
|---------|-------------|
| Regional target at risk (< 80% MTD) | Sales Head |
| Compliance breach in region | Compliance + CEO |
| Multi-branch system failure | Admin + CTO |
| Lender relationship issue | Ops Head + Business Head |

### Exception Handling

| Exception | Handling |
|-----------|----------|
| Cross-branch lead reassignment | Regional approval logged |
| Branch Manager underperformance (3 months) | Performance plan; possible replacement |
| Territory overlap dispute | Regional boundary decision |
| Corporate partner MOU | Management approval |

### ASCII Flow — Regional Oversight

```
CRM-DB-06 Regional Dashboard
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
 Branch A  Branch B  Branch C  ... Branch N
 CRM-DB-05  CRM-DB-05 CRM-DB-05
    │         │        │
    └────┬────┴────────┘
         ▼
  Weekly Regional Meeting
  Monthly Target Review
  Quarterly BRR → Management (CRM-DB-10)
```

---

## J-ADM-01: Admin Journey

### Journey Overview

Admins manage **platform configuration**: user provisioning, product/lender setup, campaigns, knowledge base, SLA settings, commission rules (Finance-approved), partner activation support.

### Actors

| Actor | Role |
|-------|------|
| **Admin** | Day-to-day platform operations |
| **Super Admin** | RBAC, security policies (Admin cannot modify) |
| **Branch Manager** | Partner approval (may delegate) |
| **Finance Head** | Commission rule approval |
| **Compliance** | Knowledge/compliance content |
| **All internal users** | Supported by Admin |

### Inputs

| Input | Screen / Module |
|-------|-----------------|
| User creation requests | CRM-AD-* user management |
| Product configuration changes | Admin product module |
| Campaign definitions | CRM-CP-01/02 |
| Knowledge articles | CRM-KB-01 |
| SLA parameter updates | Admin settings |
| Commission rule proposals | CRM-CM-01/02 |
| System health alerts | CRM-DB-09 |

### Outputs

| Output | Effect |
|--------|--------|
| Provisioned users | CRM access |
| Active products/lenders | Customer catalog (C-LP-*) |
| Running campaigns | Lead attribution |
| Published KB content | C-012, AI RAG ingestion |
| Configured SLAs | Workflow engine |
| Approved commission rules | Commission engine |

### States (Admin Task Types)

| Task Category | Examples |
|---------------|----------|
| **User Lifecycle** | Create, deactivate, reset MFA |
| **Product Lifecycle** | Add HL-05, map lenders |
| **Campaign Lifecycle** | Create, schedule, pause, close |
| **Content Lifecycle** | Draft, review, publish, archive |
| **Config Change** | SLA, templates, workflow |
| **Incident Response** | Integration outage, maintenance |

### SLAs

| Activity | SLA |
|----------|-----|
| User provisioning request | 4 hours |
| P1 system incident acknowledgment | 30 minutes |
| Campaign launch (scheduled) | Per schedule; no slip > 1h |
| KB publish request | 24 hours |
| Commission rule deployment | After Finance approval; 24 hours |

### KPIs

| KPI | Target |
|-----|--------|
| User provisioning TAT | ≥ 95% within 4h |
| System uptime | ≥ 99.5% |
| Config change error rate | < 0.1% |
| Campaign delivery success | ≥ 98% |
| KB freshness (reviewed annually) | 100% mandatory articles |
| Admin ticket resolution | ≥ 90% within SLA |

### Escalations

| Trigger | Escalate To |
|---------|-------------|
| Security incident | Super Admin + CTO |
| RBAC change request | Super Admin |
| Commission rule without Finance sign-off | Finance Head block |
| Data breach suspicion | Compliance + CEO |

### Exception Handling

| Exception | Handling |
|-----------|----------|
| Bulk user import failure | Rollback; fix CSV; retry |
| Feature flag misconfiguration | Immediate rollback |
| Lender API credential expiry | Ops notify; emergency rotation |
| Accidental product deactivation | Restore from config backup |

### ASCII Flow — Admin Configuration Cycle

```
Request → CRM-DB-09 Triage → ┌─ User → CRM-AD-* Provision
                              ├─ Product → Catalog update → C-LP-*
                              ├─ Campaign → CRM-CP-* → Lead attribution
                              ├─ KB → CRM-KB-* → RAG ingest → C-012/C-AI-*
                              ├─ Commission → CRM-CM-02 → Finance approve → Engine
                              └─ SLA → Workflow engine → SLA monitors
```

---

## J-MGT-01: Management Journey (CEO / Director / Functional Heads)

### Journey Overview

Management consumes **executive dashboards and board packs** for strategic governance—no operational processing. Sub-roles: CEO, Director, Business Head, Sales Head, Operations Head, Finance Head.

### Actors

| Actor | Focus | Primary Dashboard |
|-------|-------|-------------------|
| **CEO** | Company strategy, board reporting | CRM-DB-10 |
| **Director** | Strategic programs, partnerships | CRM-DB-10 |
| **Business Head** | Revenue, market expansion | CRM-DB-10 + revenue analytics |
| **Sales Head** | Sales org, channels, partners | CRM-DB-10 + regional views |
| **Operations Head** | Processing TAT, compliance, support | CRM-DB-10 + ops analytics |
| **Finance Head** | Commission, payouts, P&L | CRM-CM-*, finance analytics |

### Inputs

| Input | Source |
|-------|--------|
| Company KPI dashboard | CRM-DB-10 |
| Regional/branch rollups | Analytics |
| Commission approval queue | CRM-CM-05 |
| Compliance/fraud dashboards | CRM-DB-08 |
| AI performance metrics | Admin AI dashboard |
| Board pack (automated) | Monthly/quarterly generation |

### Outputs

| Output | Effect |
|--------|--------|
| Strategic decisions | Policy changes |
| Target setting | Cascaded to regions/branches |
| Commission rule approval | Finance Head → Admin deploy |
| Partner/lender partnerships | Business/Dev |
| Exception policy updates | Workflow engine config |
| Investment priorities | Product roadmap |

### States (Management Review Cadence)

| Cadence | Activity |
|---------|----------|
| Daily | CEO/Business Head dashboard glance |
| Weekly | Commission review (Finance); ops SLA (Ops Head) |
| Monthly | Regional performance; target adjustment |
| Quarterly | Business review; board pack |
| Ad-hoc | Fraud, compliance, major escalation |

### SLAs

| Activity | SLA |
|----------|-----|
| Commission batch approval (Finance Head) | Weekly Friday |
| Regulatory inquiry response | Compliance-led; CEO informed 24h |
| Strategic decision on escalation | 48 hours |
| Board pack distribution | 5 days before board meeting |

### KPIs (Company-Level)

| KPI | Target |
|-----|--------|
| Disbursement volume YoY | Per business plan |
| Lead-to-application rate | ≥ 30% |
| Lead-to-disbursement TAT | ≤ 28 days (HL avg) |
| DSA commission dispute rate | < 2% |
| Customer NPS | ≥ 50 |
| AI conversion lift | +15% |
| Audit trail completeness | 100% |
| SLA compliance (company) | ≥ 90% |

### Escalations

| Scenario | Path |
|----------|------|
| Customer complaint unresolved 7 days | CEO office |
| Regulatory examination | CEO + Compliance |
| Major fraud incident | CEO + Board notification |
| Lender partnership termination | Business Head + CEO |
| System outage > 4 hours | CTO + CEO |

### Exception Handling

| Exception | Authority |
|-----------|-----------|
| Commission policy exception | Finance Head + CEO |
| New product launch go/no-go | Business Head + CEO |
| Market expansion | CEO + Board |
| Partner blacklist | Management + Compliance |

### ASCII Flow — Management Governance

```
┌─────────────────────────────────────────────────────────────┐
│                    CRM-DB-10 Executive KPI Dashboard         │
└───────────┬─────────────┬─────────────┬─────────────────────┘
            │             │             │
     ┌──────▼──────┐ ┌────▼────┐ ┌──────▼──────┐
     │ Sales Head  │ │ Ops Head│ │Finance Head │
     │ Funnel/DSA  │ │ TAT/SLA │ │ Commission  │
     └──────┬──────┘ └────┬────┘ └──────┬──────┘
            │             │             │
            └─────────────┼─────────────┘
                          ▼
              Quarterly Business Review
              Board Pack → Strategic Actions
                          │
                          ▼
              Policy / Target / Investment Decisions
```

---

## J-AI-01: AI Advisor Conversational Journey

### Journey Overview

The AI Advisor provides **24/7 advisory-only guidance** through conversational chat (C-AI-*). Journey stages align with AI RAG Architecture §5: Greeting → Requirement Collection → Qualification → Eligibility → Product/Lender Recommendation → Application Assistance → Follow-Up → Escalation.

### Actors

| Actor | Role |
|-------|------|
| **Customer** | Conversational participant |
| **AI Advisor Agent** | LLM + RAG responses |
| **Knowledge Base (RAG)** | Product, policy, FAQ retrieval |
| **Eligibility Engine** | Pass/fail calculations |
| **Sales Executive / Support** | Human escalation targets |
| **System** | Lead creation on qualification completion |

### Inputs

| Input | Processing |
|-------|------------|
| User utterance (text) | Intent detection (§6.1 AI RAG) |
| Customer profile (if logged in) | Context pre-fill |
| Session history | Multi-turn context |
| Product catalog | RAG retrieval |
| Application state (if active) | Status-aware responses |
| Consent flags | Gate bureau/PII use |

### Outputs

| Output | Consumer |
|--------|----------|
| Conversational responses | Customer (C-AI-02) |
| Eligibility result card | C-AI-05 |
| Product recommendations | C-AI-03, C-AI-04 |
| Lead (on qualification complete) | LMS with AI score component |
| Application draft assistance | LOS S01 wizard |
| Escalation ticket | Support/Sales (C-AI-10) |
| Session transcript | Audit, escalation attach |

### States (Conversation State Machine — AI RAG §6.4)

| State | Description |
|-------|-------------|
| **INIT** | Session started |
| **GREETING** | Welcome, disclaimer, language |
| **REQUIREMENT_COLLECTION** | Product, amount, income, collateral |
| **QUALIFICATION** | Age, income, location gates |
| **ELIGIBILITY** | Engine call; explain results |
| **RECOMMENDATION** | Product + lender ranking |
| **APPLICATION_ASSIST** | Wizard guidance per S01–S03 |
| **STATUS_QUERY** | Application timeline fetch |
| **FOLLOW_UP** | Proactive re-engagement |
| **ESCALATED** | Human handoff |
| **CLOSED** | Session ended |

### Transitions

```
C-AI-01 → C-AI-02 INIT → GREETING
    → REQUIREMENT_COLLECTION [intents: PRODUCT_INQUIRY, ELIGIBILITY_CHECK]
    → QUALIFICATION [gates: age, income, location, existing app]
    → ELIGIBILITY [API call] → pass: RECOMMENDATION | fail: alternatives
    → RECOMMENDATION → APPLICATION_ASSIST [Apply CTA → C-HL-A01]
    → [Any state] STATUS_QUERY if APPLICATION_STATUS intent
    → [Any state] ESCALATED if ESCALATION/COMPLAINT intent
    → FOLLOW_UP [24h/48h triggers] → CLOSED
```

### SLAs

| Activity | SLA |
|----------|-----|
| First response (streaming start) | < 2 seconds |
| Eligibility API round-trip in chat | < 5 seconds |
| Escalation ticket creation | < 30 seconds |
| Human callback scheduling | Next business slot |
| Session persistence | 30 days history (C-AI-07) |

### KPIs

| KPI | Target |
|-----|--------|
| Conversation completion rate | ≥ 60% |
| Eligibility check conversion to application | ≥ 25% |
| Recommendation acceptance rate | ≥ 40% |
| Escalation rate | < 15% |
| AI resolution rate (no human) | ≥ 60% |
| Customer satisfaction (AI feedback C-AI-09) | ≥ 4.0/5 |
| Lead grade lift (AI-sourced vs non-AI) | +10% A/A+ rate |
| Hallucination incident rate | 0 (blocked by RAG + guardrails) |

### Escalations (AI RAG §4.6, §26)

| Trigger | Target |
|---------|--------|
| Customer requests human | Sales Exec (hours) or Support |
| 3 failed intent recognitions | Support L1 |
| Complaint intent | Support L2 + Branch Manager |
| Credit-specific dispute | Schedule sales callback |
| Fraud/legal mention | Compliance flag |
| Prompt injection detected | Block + log; Support if customer confused |

### Exception Handling

| Exception | Handling |
|-----------|----------|
| Off-topic query | Polite redirect (OFF_TOPIC intent) |
| Missing profile data | Ask; never invent |
| Eligibility API failure | Apologize; offer human or retry |
| Unauthorized data request | Refuse; explain privacy |
| Active application conflict | Inform; link to C-HL-S01 |
| Non-serviceable pincode | Explain; suggest alternate products or human |

### Hard Limitations (AI RAG §4.5)

- No auto-approve, auto-sanction, or auto-disburse
- No guaranteed approval language
- No commission/pricing internals
- No other customer data
- Advisory disclaimer on every eligibility/recommendation

### ASCII Flow — AI Advisor Full Journey

```
Customer (C-AI-02)
    │
    ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Greeting │──→│ Collect  │──→│ Qualify  │──→│ Eligibility│
│ + chips  │   │ Req'ments│   │ Gates    │   │ Engine API │
└──────────┘   └──────────┘   └──────────┘   └─────┬─────┘
                                                   │
                     ┌─────────────────────────────┤
                     ▼                             ▼
              ┌──────────┐                  ┌──────────┐
              │ Product  │                  │ Alternatives│
              │ Recommend│                  │ + tips   │
              │ C-AI-03  │                  └──────────┘
              └────┬─────┘
                   ▼
              ┌──────────┐   ┌──────────┐   ┌──────────┐
              │ Lender   │──→│ App Assist│──→│ Follow-up│
              │ Recommend│   │ S01–S03  │   │ 24h/48h  │
              └──────────┘   └────┬─────┘   └──────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
              C-HL-A01 Apply              C-AI-10 Escalate
              → Lead + App created        → Ticket + Transcript
```

---

## J-VOC-01: Voice AI Journey

### Journey Overview

Voice AI delivers the **same advisory capabilities as chat** via speech (C-VOC-*), using STT → LLM (Advisor pipeline) → TTS. Phase 1: in-app voice sessions; Phase 3: inbound/outbound telephony.

### Actors

| Actor | Role |
|-------|------|
| **Customer** | Speaker |
| **Voice AI Agent** | STT/TTS wrapper on Advisor logic |
| **Sales Executive** | Warm transfer target |
| **Support Team** | Escalation target |
| **System** | Session logging, callback scheduling |

### Inputs

| Input | Processing |
|-------|------------|
| Audio stream (16kHz) | STT (Deepgram/Whisper) |
| Caller ID / SIM match | Authentication (registered user) |
| DTMF OTP (Phase 3) | Guest/authenticated gate |
| Voice-specific intents | CALLBACK_REQUEST, APPOINTMENT, REPEAT, SPEAK_SLOWER |

### Outputs

| Output | Screen / Artifact |
|--------|-------------------|
| Spoken responses (TTS) | C-VOC-02 |
| Text transcript | C-VOC-02 side panel, C-VOC-03 summary |
| Callback request | C-VOC-04 → Sales queue |
| Appointment | C-VOC-05, C-VOC-06 |
| Lead (on qualification) | LMS (same as chat) |
| Session log | C-VOC-07 history |

### States

| State | Description |
|-------|-------------|
| **PERMISSION** | Mic permission (C-VOC-01) |
| **SESSION_INIT** | API session created |
| **LISTENING** | STT active |
| **PROCESSING** | Intent + LLM + RAG |
| **SPEAKING** | TTS playback |
| **CLARIFYING** | Low confidence retry |
| **TRANSFER** | Warm handoff to human |
| **CALLBACK_SCHEDULED** | Async human follow-up |
| **CLOSED** | Summary + feedback |

### Transitions

```
C-VOC-01 Tap Voice → Mic permission granted → C-VOC-02 SESSION_INIT
    → TTS Greeting → LISTENING → STT → PROCESSING → SPEAKING
    → [loop] or CLARIFYING (low confidence × 3 → TRANSFER)
    → CALLBACK_SCHEDULED (C-VOC-04) or TRANSFER (warm)
    → CLOSED → C-VOC-03 Summary → C-VOC-07 History
```

### SLAs

| Activity | SLA |
|----------|-----|
| STT first partial transcript | < 500ms |
| Response start (TTS) | < 3 seconds after utterance end |
| Callback scheduling confirmation | Immediate |
| Warm transfer connection | < 60 seconds (business hours) |
| Session summary generation | < 10 seconds |

### KPIs

| KPI | Target |
|-----|--------|
| Voice session completion rate | ≥ 50% |
| Intent recognition accuracy | ≥ 85% |
| Transfer rate | < 20% |
| Callback show-rate | ≥ 70% |
| Voice CSAT | ≥ 4.0/5 |
| Average session duration | 3–8 minutes |
| Cost per voice session | Within Phase 4 budget |

### Escalations

| Trigger | Target |
|---------|--------|
| Customer requests human | Sales (hours) or callback |
| 3 failed recognitions | Support |
| Complex complaint | Support + ticket |
| Authentication failure | Support |
| Credit-specific query | Sales callback |

### Exception Handling

| Exception | Handling |
|-----------|----------|
| Background noise | Prompt to speak clearly |
| Silence > 5s | "Are you still there?" |
| Language switch request | Switch TTS/STT language |
| Guest user limits | Product info + EMI only; prompt registration |
| Call drop | Save partial transcript; outbound callback offer |

### ASCII Flow — In-App Voice Session (AI RAG §21.1)

```
C-VOC-01                C-VOC-02 Active Session
────────                ──────────────────────
Tap Voice ────────────→ Mic Permission
                        TTS: "Hello, I'm KuberOne AI Advisor"
Customer speaks ──────→ STT stream → Intent → RAG+LLM → TTS
                        [Transcript displayed alongside audio]
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
    Continue       C-VOC-04       Warm Transfer
    conversation   Callback       to Sales/Support
          │             │             │
          └─────────────┴─────────────┘
                        ▼
                  C-VOC-03 Summary
                  C-VOC-07 History
                  Feedback prompt
```

### ASCII Flow — Phase 3 Inbound Call

```
Inbound Call → IVR Greeting → Language Select
    → Auth (Caller ID / OTP)
    → Intent from speech → Advisor logic → Spoken response
    → [Escalation] Warm transfer + AI summary to agent
    → Call recording (consent) → Ticket if needed → Closure summary
```

---

# PART 2: LIFECYCLE FLOWS

---

## LF-01: Lead Lifecycle

### Overview

The Lead Lifecycle governs all demand capture from **8 channels** through qualification, assignment, contact, conversion, or terminal states. Canonical states from Business Workflow §5.1.

### Actors

| Actor | Participation |
|-------|---------------|
| Customer, DSA, Referral Partner | Capture |
| System | Validate, enrich, score, assign |
| AI Advisor | AI score component (30%) |
| Sales Executive | Contact, qualify, convert |
| Branch Manager | Reassignment, SLA escalation |

### Inputs

| Input | Validation |
|-------|------------|
| Phone (10-digit IN) | Format check |
| Product code | Catalog validation |
| Source attribution | Channel, UTM, partnerId |
| Consent | DPDP for outreach |
| Profile enrichment | Existing customer match |
| Bureau pull | If consented |

### Outputs

| Output | Trigger State |
|--------|---------------|
| Graded lead (A+–C / Rejected) | SCORED |
| Assigned executive | ASSIGNED |
| Application (LOS S01) | CONVERTED |
| Nurture schedule | NURTURE |
| Rejection record + reason | REJECTED |

### States

| State | Code | Terminal | Next States |
|-------|------|----------|-------------|
| New | `NEW` | No | SCORED |
| Scored | `SCORED` | No | ASSIGNED |
| Assigned | `ASSIGNED` | No | CONTACTED, NURTURE, REJECTED |
| Contacted | `CONTACTED` | No | QUALIFIED, NURTURE, REJECTED |
| Qualified | `QUALIFIED` | No | CONVERTED |
| Converted | `CONVERTED` | **Yes** | — |
| Nurture | `NURTURE` | No | CONTACTED, REJECTED, EXPIRED |
| Rejected | `REJECTED` | No* | NURTURE (if eligible) |
| Expired | `EXPIRED` | **Yes** | — |
| Duplicate | `DUPLICATE` | **Yes** | — |

*Rejected may re-enter nurture per reason code R-01–R-10.

### Transitions

```
NEW ──→ SCORED ──→ ASSIGNED ──→ CONTACTED ──→ QUALIFIED ──→ CONVERTED
  │        │           │            │             │
  │        │           ├─→ NURTURE ←─┤             │
  │        │           │            │             │
  │        │           └─→ REJECTED ←┴─────────────┘
  │        │
  └──→ DUPLICATE (30-day window)
  
NURTURE ──→ CONTACTED | REJECTED | EXPIRED
REJECTED ──→ NURTURE (eligible codes only)
```

### SLAs

| Grade | First Contact SLA | Escalation |
|-------|-------------------|------------|
| A+ | 1 hour | Branch Manager at 1h |
| A | 4 hours | Branch Manager at 4h |
| B | 24 hours | Sales Head weekly |
| C | 48 hours | Nurture campaign |
| Rejected | No contact | — |
| Auto-assignment | < 1 minute | System alert at 5 min |
| Unassigned in pool | 30 minutes | Branch Manager |

### KPIs

| KPI | Target |
|-----|--------|
| First contact SLA compliance | ≥ 95% |
| Lead-to-application rate | ≥ 30% |
| A+ grade % of total leads | Track by channel |
| Duplicate rate | < 3% |
| Nurture re-activation conversion | ≥ 5% |
| Average score accuracy (conversion correlation) | Model review quarterly |

### Escalations

| Trigger | Target |
|---------|--------|
| A+ uncontacted > 1h | Branch Manager |
| A uncontacted > 4h | Branch Manager |
| Unassigned > 30 min | Branch Manager |
| Fraud flag | Compliance (immediate) |
| VIP (A+, > ₹1 Cr) | Branch Manager + Senior Sales |

### Exception Handling

| Exception | Handling |
|-----------|----------|
| Income < 50% product minimum | Cap score 29 → Rejected |
| Non-serviceable pincode | Cap score 39 → C |
| Fraud flag | Force Rejected; Compliance |
| DSA complete data | +10 ruleScore bonus |
| Active application exists | Link; no new lead |
| Duplicate phone+product < 30d | DUPLICATE |
| Re-activated nurture | Reset score; 7-day cooldown |

### ASCII State Diagram — Lead Lifecycle

```
                    ┌─────────┐
                    │   NEW   │
                    └────┬────┘
                         │
                    ┌────▼────┐
              ┌─────│ SCORED  │───── DUPLICATE (terminal)
              │     └────┬────┘
              │          │
              │     ┌────▼─────┐
              │     │ ASSIGNED │
              │     └────┬─────┘
              │    ┌─────┼─────┐
              │    ▼     ▼     ▼
              │ CONTACT NURTURE REJECTED
              │    │     │     │
              │    ▼     │     └──→ (nurture eligible)
              │ QUALIFIED│
              │    │     │
              │    ▼     ▼
              │ CONVERTED EXPIRED
              │ (terminal) (terminal)
              └──────────┘
```

### Screen References

| Stage | Customer | DSA | CRM |
|-------|----------|-----|-----|
| Capture | C-HL-A05, C-AI-02 | D-LD-05 | CRM-LD-06 |
| Track | C-HL-S01 | D-LD-08/09 | CRM-LD-02, CRM-LD-05 |
| Assign | — | D-LD-08 | CRM-LD-03 |
| Convert | C-HL-A05 | — | CRM-LD-12 |
| SLA alerts | — | — | CRM-LD-10 |

## LF-02: Application Lifecycle (S01–S09)

### Overview

Universal **9-stage LOS lifecycle** applies to all 20 product variants (HL, LAP, BL, AL). Sub-stages (S03a, S04a, etc.) vary by product per Loan Products §11.

### Actors

| Stage | Primary Actor | Supporting |
|-------|---------------|------------|
| S01 | System / Channel | Customer, DSA |
| S02 | Sales Executive | Customer |
| S03 | Sales / Customer / DSA | AI Advisor |
| S04 | System / Credit Executive | AI Copilot |
| S05 | Operations Executive | Lender |
| S06 | Lender | Credit, Ops |
| S07 | Lender / Operations | Customer, Sales |
| S08 | Lender / Operations | Finance (commission) |
| S09 | System | RM |

### Inputs / Outputs by Stage

| Stage | Key Inputs | Key Outputs |
|-------|------------|-------------|
| S01 | Lead qualified OR direct apply | Application record, customer link |
| S02 | Contact confirmed, basic eligibility | Customer consent flag |
| S03 | Consent, checklist generated | Verified documents |
| S04 | Complete docs | Eligibility pass/fail |
| S05 | Credit pre-approval | Lender ACK |
| S06 | Submitted package | Lender decision |
| S07 | Lender approval | Sanction letter |
| S08 | Sanction accepted, conditions met | Disbursement record, commission trigger |
| S09 | Disbursement confirmed | RM assignment, case closed |

### States

| State | Code | Customer Label | Terminal |
|-------|------|----------------|----------|
| S01 | `LEAD_CREATED` | Application Initiated | No |
| S02 | `QUALIFIED` | Under Review | No |
| S03 | `DOCUMENT_COLLECTION` | Documents Required | No |
| S04 | `ELIGIBILITY_CHECK` | Eligibility Verified | No |
| S05 | `BANK_LOGIN` | Submitted to Bank | No |
| S06 | `CREDIT_REVIEW` | Under Bank Review | No |
| S07 | `SANCTION` | Approved | No |
| S08 | `DISBURSEMENT` | Disbursed | No |
| S09 | `CLOSURE` | Complete | **Yes** |
| Rejected | `REJECTED` | Not Approved | **Yes** |
| Withdrawn | `WITHDRAWN` | Withdrawn | **Yes** |
| On Hold | `ON_HOLD` | On Hold | No |

### Transitions (Happy Path)

```
S01 → S02 → S03 → S04 → S05 → S06 → S07 → S08 → S09
```

### Transition Guards

| Transition | Guard |
|------------|-------|
| S01 → S02 | `contactMade = true` |
| S02 → S03 | `customerConsent = true` |
| S03 → S04 | All mandatory docs VERIFIED; no pending rejections |
| S04 → S05 | Eligibility PASS; credit sign-off if required |
| S05 → S06 | Bank login ACKNOWLEDGED |
| S06 → S07 | Sanction record exists |
| S07 → S08 | `sanctionAccepted = true`; pre-disb conditions met |
| S08 → S09 | Disbursement record exists |

### SLAs

| Transition | SLA | Escalation Trigger | Target |
|------------|-----|-------------------|--------|
| S01 → S02 | 24 hours | 48 hours | Branch Manager |
| S02 → S03 | 48 hours | 72 hours | Branch Manager |
| S03 → S04 | 5 business days | 7 days | Sales manager |
| S04 → S05 | 24 hours | 48 hours | Ops Head |
| S05 → S06 | 48 hours | 72 hours | Ops Executive |
| S06 → S07 | Lender SLA 5–15d | SLA + 2 days | Ops Head |
| S07 → S08 | 3 business days | 5 days | Ops Head |
| S08 → S09 | 24 hours | Auto | — |

### KPIs

| KPI | Target |
|-----|--------|
| S03 doc collection TAT | ≤ 5 days avg |
| S04 eligibility pass rate | Per product benchmark |
| S06 lender TAT | Per lender SLA |
| S06→S07 conversion | ≥ 60% |
| S07→S08 conversion | ≥ 85% |
| End-to-end S01→S08 | ≤ 28 days (HL avg) |
| Rework rate (any RW code) | < 12% |
| Withdrawal rate | < 5% |

### Escalations

| Trigger | Target |
|---------|--------|
| S01→S02 > 48h | Branch Manager |
| S03 > 7 days | Sales manager |
| S06 > lender SLA + 2d | Ops Head |
| ON_HOLD > 5 days | Branch Manager |
| Rejection at S06 (high value) | Branch Manager review |

### Exception Handling — Rejection Points

| Stage | Type | Reason Codes | Actor |
|-------|------|--------------|-------|
| S02 | Qualification reject | AR-01, AR-02 | Sales Executive |
| S04 | Eligibility reject | AR-03, AR-04, AR-05 | System / Credit |
| S06 | Lender reject | AR-06 | Lender via Ops |
| S07 | Sanction decline | AR-07 | Customer / Sales |
| S08 | Disbursement hold | AR-08 | Operations |

### Exception Handling — Rework Loops

| Code | From | Trigger | Return To | Actor |
|------|------|---------|-----------|-------|
| RW-01 | S04 | Document deficiency | S03 | System + Sales |
| RW-02 | S05 | Lender doc query | S03/S04 | Ops |
| RW-03 | S06 | Lender conditional | S03 | Ops + Sales |
| RW-04 | S07 | Terms mismatch | S06 | Sales |
| RW-05 | S08 | Pre-disb condition | S03/S07 | Ops |
| RW-06 | S08 | Legal/valuation | S03 | Ops |

### ASCII Flow — Application Lifecycle Swimlane

```
CUSTOMER/DSA     SALES           CREDIT          OPS             LENDER       SYSTEM
────────────     ─────           ──────          ───             ──────       ──────
Apply ──────────→ Contact ─────────────────────────────────────────────────→ S01
                  Qualify ──────────────────────────────────────────────────→ S02
Upload docs ─────→ Collect ─────────────────────────────────────────────────→ S03
                                  Assess ──────→                                S04
                                                 Submit ───────────────────────→ S05
                                                                Underwrite ───→ S06
Accept terms ─────────────────────────────────── Sanction ─────────────────→ S07
                                                 Disburse ────────────────────→ S08
                                                               Close/R M ─────→ S09
```

### Product-Specific Sub-Stages (Reference)

| Product | Notable Sub-Stages |
|---------|-------------------|
| Home Loan | S03a property docs; S06a legal; S06b valuation; S08a registration; S08b staged disb |
| LAP | S04a valuation; S04b legal title; S07a MOD |
| Business Loan | S04a cash flow AI; S04b DSCR; S06a business visit |
| Auto Loan | S04a LTV; S07a dealer payment; S08a dealer disb; S08b RC hypothecation |

### Screen References

| Stage | Customer | CRM |
|-------|----------|-----|
| S01–S02 | C-HL-A*, C-HL-S01 | CRM-LD-12, CRM-AP-02 |
| S03 | C-HL-D01–D03, C-DOC-* | CRM-AP-04, CRM-DOC-* |
| S04 | C-HL-S01 | CRM-AP-03, CRM-AP-15 |
| S05–S08 | C-HL-S01–S03 | CRM-AP-06–08, CRM-AP-10 |
| S09 | C-HL-S03 | CRM-AP-02 (closed), CRM-CU-02 (RM) |

---

## LF-03: Document Lifecycle

### Overview

Documents flow from **checklist generation at S02→S03** through upload, OCR validation, manual verification, and lender packaging. Status lifecycle from Business Workflow §9.2.

### Actors

| Actor | Role |
|-------|------|
| **System** | Checklist generation, OCR, deficiency detection |
| **Customer** | Primary uploader |
| **DSA Partner** | Assisted upload (D-LD-11) |
| **Sales Executive** | Follow-up on missing docs |
| **Credit Executive** | Verification (CRM-DOC-02) |
| **Operations Executive** | Package builder (CRM-DOC-07) |
| **AI Advisor** | Document guidance (C-AI-02, C-HL-D03) |

### Inputs

| Input | Source |
|-------|--------|
| Product + employment type | Checklist engine |
| Presigned S3 URL | Upload API |
| Document image/PDF | Customer/DSA camera/gallery |
| OCR extraction | AI pipeline |
| Manual verification decision | Credit Executive |

### Outputs

| Output | Consumer |
|--------|----------|
| Document record with status | DMS, application checklist |
| OCR structured data | Credit assessment |
| Deficiency notification | Customer, Sales |
| Lender submission package | Ops → Lender |
| Audit log | Compliance |

### States

| State | Code | Meaning | Next |
|-------|------|---------|------|
| Pending | `PENDING` | Required; not uploaded | UPLOADED |
| Uploaded | `UPLOADED` | Awaiting verification | VERIFIED, REJECTED |
| Verified | `VERIFIED` | Passed validation | Terminal (until expiry) |
| Rejected | `REJECTED` | Failed validation | UPLOADED (re-upload) |
| Waived | `WAIVED` | Exception waiver | Terminal (audited) |
| Expired | `EXPIRED` | Age exceeds validity | UPLOADED (refresh) |

### Transitions

```
PENDING ──→ UPLOADED ──→ VERIFIED
                │
                └──→ REJECTED ──→ UPLOADED (re-upload)
                
VERIFIED ──→ EXPIRED ──→ UPLOADED (refresh required)
                
PENDING ──→ WAIVED (Credit/Ops exception + audit)
```

### SLAs

| Activity | SLA |
|----------|-----|
| Checklist generation (S02→S03) | Immediate |
| Customer notification | Immediate |
| OCR processing post-upload | < 5 minutes |
| Deficiency batch to Sales | Daily |
| Sales follow-up on missing | Daily until complete |
| Credit verification queue | Same day entry |
| Re-upload after rejection | Customer: 48h; Sales call at 48h |
| Expired doc blocks S04 | Immediate block |

### KPIs

| KPI | Target |
|-----|--------|
| Document first-pass rate | ≥ 60% |
| OCR auto-pass rate | ≥ 70% |
| S03 duration (doc complete) | ≤ 5 days |
| Deficiency rate at S04 | < 10% |
| Re-upload success rate | ≥ 85% |
| Verification TAT | ≤ 24 hours |

### Escalations

| Trigger | Target |
|---------|--------|
| Missing mandatory > 3 days | Sales Executive alert |
| Missing mandatory > 5 days | Sales manager |
| Name mismatch unresolved > 24h | Credit manager |
| Fraudulent document suspected | Compliance immediate |

### Exception Handling

| Deficiency | Notification | Block |
|------------|--------------|-------|
| Missing mandatory | Customer push + Sales CRM | S04 transition |
| Poor quality scan | Re-upload guide (C-HL-D03) | S04 transition |
| Expired bank statement (> 3 months) | Customer + Sales | S04 transition |
| PAN name mismatch | Credit review | Manual override with audit |
| Waived document | Audit log required | S04 allowed |

### ASCII Flow — Document Lifecycle

```
S02→S03: System generates checklist
              │
              ▼
         ┌─────────┐     ┌──────────┐     ┌───────────┐
         │ PENDING │────→│ UPLOADED │────→│  OCR/AI   │
         └─────────┘     └────┬─────┘     └─────┬─────┘
                              │                 │
                    ┌─────────┴─────────┐       │
                    ▼                   ▼       ▼
              ┌──────────┐       ┌──────────┐  Manual Review
              │ VERIFIED │       │ REJECTED │  CRM-DOC-02
              └────┬─────┘       └────┬─────┘
                   │                  │
                   ▼                  └──→ Re-upload
              All verified?
                   │
                   ▼
              S03→S04 gate opens
                   │
                   ▼
              CRM-DOC-07 Lender Package (S05)
```

### Screen References

| Action | Customer | DSA | CRM |
|--------|----------|-----|-----|
| Checklist | C-HL-D01 | D-LD-10 | CRM-AP-04 |
| Upload | C-HL-D02, C-DOC-02–05 | D-LD-11 | — |
| Deficiency | C-HL-D03 | D-LD-10 | CRM-DOC-04 |
| Status | C-DOC-06 | D-LD-10 | CRM-DOC-02 |
| Verify | — | — | CRM-DOC-01/02/03 |
| Package | — | — | CRM-DOC-07 |

---

## LF-04: Referral Lifecycle

### Overview

Tracks **referral attribution from link click through reward payout**. Distinct from DSA commission—uses referral campaign config and 90-day attribution window.

### Actors

| Actor | Role |
|-------|------|
| **Referral Partner / Customer referrer** | Share link, submit referral |
| **Referred Customer** | Applies through attributed journey |
| **System** | Attribution, duplicate detection, reward calc |
| **Sales Executive** | Converts referred lead |
| **Finance** | Reward approval and payout |
| **Branch Manager** | Attribution disputes |

### Inputs

| Input | When |
|-------|------|
| Referral link click | LINK_CLICKED |
| UTM + referralPartnerId / referralCode | ATTRIBUTED |
| Referral form submit | LEAD_CREATED |
| Application creation (within 90 days) | Attribution locked |
| Disbursement event | CONVERTED |
| Campaign reward rules | Reward calculation |

### Outputs

| Output | When |
|--------|------|
| Attribution record | Click or submit |
| Lead with referral lock | LEAD_CREATED |
| Simplified partner status | Throughout processing |
| Reward PROVISIONAL | Disbursement |
| Reward PAID | Monthly batch |
| Partner statement | Monthly PDF |

### States

| State | Code | Partner View | Terminal |
|-------|------|--------------|----------|
| Link Clicked | `LINK_CLICKED` | — (tracking only) | No |
| Attributed | `ATTRIBUTED` | Referred | No |
| Lead Created | `LEAD_CREATED` | Referred | No |
| In Progress | `IN_PROGRESS` | In Progress | No |
| Converted | `CONVERTED` | Converted | No |
| Reward Provisional | `REWARD_PROVISIONAL` | Reward Pending | No |
| Reward Approved | `REWARD_APPROVED` | Reward Pending | No |
| Reward Paid | `REWARD_PAID` | Reward Paid | **Yes** |
| Expired | `EXPIRED` | Closed | **Yes** |
| Duplicate | `DUPLICATE` | Closed | **Yes** |
| Closed No Reward | `CLOSED_NO_REWARD` | Closed | **Yes** |

### Transitions

```
LINK_CLICKED → ATTRIBUTED (90-day window starts)
    → LEAD_CREATED (referralPartnerId locked)
    → IN_PROGRESS (S01–S07)
    → CONVERTED (S08 disbursement)
    → REWARD_PROVISIONAL → REWARD_APPROVED → REWARD_PAID

LINK_CLICKED → EXPIRED (> 90 days without application)
LEAD_CREATED → DUPLICATE (same phone+product < 30d)
IN_PROGRESS → CLOSED_NO_REWARD (reject/withdraw)
```

### SLAs

| Activity | SLA |
|----------|-----|
| Referral acknowledgment | Immediate |
| Attribution window | 90 days (click to application) |
| Reward PROVISIONAL on disbursement | Immediate |
| Reward payout | Monthly cycle |
| Attribution dispute resolution | 5 business days |

### KPIs

| KPI | Target |
|-----|--------|
| Referral conversion (disbursed/referred) | ≥ 5% |
| Click-to-application rate | ≥ 15% |
| Attribution dispute rate | < 1% |
| Duplicate referral rate | < 5% |
| Reward payout TAT | ≤ 30 days post-disbursement |
| Customer referral program participation | ≥ 15% of disbursed |

### Escalations

| Trigger | Target |
|---------|--------|
| Attribution dispute | Branch Manager |
| Reward not provisioned post-disb | Finance Head |
| Corporate partner MOU exception | Management |
| Fraudulent referral pattern | Compliance |

### Exception Handling

| Exception | Handling |
|-----------|----------|
| Multiple attribution candidates | First valid click wins; audit |
| Customer used direct channel after click | Attribution if within window |
| Disbursement reversal | Reward clawback |
| Wrong partner type reward calc | Admin campaign config fix |
| Customer-as-referrer vs B2B partner | Separate rule engines |

### ASCII Flow — Referral Lifecycle

```
Partner shares C-REF-02 / referral link
         │
         ▼
    LINK_CLICKED ──→ ATTRIBUTED [90-day timer]
         │
         ▼
    LEAD_CREATED (partnerId/referralCode locked)
         │
         ├──→ DUPLICATE ──→ terminal (no reward)
         │
         ▼
    IN_PROGRESS (S01–S07 internal processing)
         │
         ├──→ CLOSED_NO_REWARD (reject/withdraw)
         │
         ▼
    CONVERTED (S08 disbursement)
         │
         ▼
    REWARD_PROVISIONAL → REWARD_APPROVED → REWARD_PAID
```

### Screen References

| Actor | Screens |
|-------|---------|
| Customer referrer | C-REF-01–C-REF-09 |
| B2B Referral Partner | CRM-PT-05/06; portal |
| Internal | CRM-CP-* (campaigns), CRM-CM-* (rewards) |

---

## LF-05: Commission Lifecycle

### Overview

DSA commission lifecycle: **PROVISIONAL → APPROVED → PAID**, with optional **CLAWED_BACK**. Triggered on disbursement confirmation. Referral rewards follow parallel path with campaign rules.

### Actors

| Actor | Role |
|-------|------|
| **System** | Auto-calc on disbursement |
| **DSA Partner** | Review, dispute |
| **Finance Head** | Batch approval (SoD) |
| **Finance** | NEFT execution |
| **Branch Manager** | Dispute mediation |
| **Admin** | Rule configuration (Finance-approved) |

### Inputs

| Input | Source |
|-------|--------|
| Disbursement event | S08 completion |
| Commission rules snapshot | productCode, lenderCode, tier, slab |
| DSA tier | Partner profile (D-019) |
| TDS rate | Tax rules |
| Clawback period | Product config |
| Dispute evidence | D-COM-09 |

### Outputs

| Output | Consumer |
|--------|----------|
| PROVISIONAL ledger entry | D-COM-03, CRM-CM-03 |
| DSA notification | Push, D-COM-01 |
| Approval batch | CRM-CM-05 |
| NEFT file | Bank |
| PAID confirmation | D-COM-07, statement D-COM-04 |
| CLAWED_BACK notice | D-COM-13 |
| TDS certificate | D-COM-12 |

### States

| State | Code | Description |
|-------|------|-------------|
| Provisional | `PROVISIONAL` | Auto-created on disbursement |
| Approved | `APPROVED` | Finance Head batch approval |
| Paid | `PAID` | Bank transfer confirmed |
| Clawed Back | `CLAWED_BACK` | Reversal/recovery |
| Disputed | `DISPUTED` | Overlay during PROVISIONAL window |

### Transitions

```
DISBURSEMENT ──→ PROVISIONAL ──→ [15-day dispute window]
                      │
                      ├──→ DISPUTED ──→ resolved → PROVISIONAL adjusted
                      │
                      ▼
                 APPROVED (Finance weekly batch)
                      │
                      ▼
                    PAID (NEFT + 2 days)
                      │
                      └──→ CLAWED_BACK (if reversal within clawback period)
```

### SLAs

| Activity | SLA | Escalation |
|----------|-----|------------|
| PROVISIONAL creation | Immediate | — |
| DSA notification | Immediate | — |
| Dispute window | 15 days | — |
| Dispute resolution | 10 business days | Finance Head at 10d |
| Finance batch approval | Weekly (Friday) | — |
| NEFT execution | 2 business days post-approval | Finance Head |
| Payout total TAT (disb → paid) | ≤ 30 days | Monthly review |
| DSA acknowledgment | 7 days post-PAID | — |

### KPIs

| KPI | Target |
|-----|--------|
| Commission payout TAT | ≤ 30 days |
| Commission dispute rate | < 2% |
| Dispute resolution TAT | ≤ 10 days |
| Clawback rate | < 1% |
| Calculation accuracy | 100% (zero manual calc) |
| DSA acknowledgment rate | ≥ 95% |

### Escalations

| Trigger | Target |
|---------|--------|
| Dispute unresolved > 10 days | Finance Head |
| Dispute pattern (partner) | Branch Manager + Finance |
| Clawback dispute | Finance Head |
| Rule config error | Admin + Finance Head |
| SoD violation attempt | Block + Super Admin alert |

### Exception Handling

| Exception | Handling |
|-----------|----------|
| Wrong disbursement amount recorded | Recalc PROVISIONAL; dispute path |
| Partner tier upgrade mid-cycle | Tier at disbursement snapshot |
| Multiple partners attributed | Immutable partnerId at lead — no split |
| Disbursement reversal < clawback days | CLAWED_BACK from next payout |
| Minimum payout < ₹500 | Roll to next cycle |
| Bank account invalid | Hold PAID; D-007 update |

### DSA Tier Sharing (Reference)

| Tier | Share of Kuber Commission |
|------|--------------------------|
| Bronze | 60% |
| Silver | 70% |
| Gold | 80% |
| Platinum | 85% |

### ASCII Flow — Commission Lifecycle

```
S08 Disbursement Confirmed
         │
         ▼
┌─────────────────┐
│  PROVISIONAL    │──── Notify DSA (D-COM-03)
│  Rule snapshot  │
└────────┬────────┘
         │ ◄──── 15-day dispute window (D-COM-09)
         ▼
┌─────────────────┐
│   APPROVED      │──── Finance Head (CRM-CM-05)
│   Weekly batch  │
└────────┬────────┘
         ▼
┌─────────────────┐
│     PAID        │──── NEFT (CRM-CM-08) → D-COM-07
│   Statement     │
└────────┬────────┘
         │
         └──→ CLAWED_BACK (D-COM-13) if reversal in clawback period
```

### Screen References

| Actor | Screens |
|-------|---------|
| DSA | D-COM-01 through D-COM-13 |
| Finance | CRM-CM-01–CRM-CM-12 |
| Branch Manager | CRM-PT-12, CRM-PT-09 |

---

## LF-06: Support Lifecycle

### Overview

Support tickets manage **customer, DSA, and internal user issues** from creation through resolution. Integrates with AI Support, Voice escalation, and complaint workflow.

### Actors

| Actor | Role |
|-------|------|
| **Customer / DSA / Internal user** | Ticket creator |
| **Support L1** | First response, categorization |
| **Support L2** | Complex issues, complaints |
| **Support Lead** | Escalation target |
| **Sales Executive** | Document/status issues (routed) |
| **Branch Manager** | Complaint resolution authority |
| **DevOps** | Technical bugs |
| **Compliance** | Regulatory, fraud |
| **AI Support** | Auto-resolution before ticket |

### Inputs

| Input | Channel |
|-------|---------|
| Ticket form | C-SUP-03, D-022 |
| AI escalation | C-AI-10 |
| Voice escalation | C-VOC-04 |
| Complaint form | C-SUP-10 |
| Email/phone | Support console SUP-* |
| Chat | C-SUP-06 |

### Outputs

| Output | Effect |
|--------|--------|
| Assigned ticket | Agent queue SUP-01 |
| Resolution | Customer notified |
| CSAT survey | Analytics |
| Escalation record | SUP escalation matrix |
| Linked application/lead update | CRM cross-reference |

### States

| State | Code | SLA Impact |
|-------|------|------------|
| Open | `OPEN` | Clock starts |
| Assigned | `ASSIGNED` | P1: 1h; P3: 4h |
| In Progress | `IN_PROGRESS` | Active work |
| Pending Customer | `PENDING_CUSTOMER` | SLA paused |
| Resolved | `RESOLVED` | Solution delivered |
| Closed | `CLOSED` | Auto-close 48h post-resolve |
| Escalated | `ESCALATED` | L2/manager path |

### Transitions

```
OPEN ──→ ASSIGNED ──→ IN_PROGRESS ──→ RESOLVED ──→ CLOSED
              │              │
              │              ├──→ PENDING_CUSTOMER ──→ IN_PROGRESS
              │              │
              └──→ ESCALATED ──→ IN_PROGRESS (L2/Manager)
```

### SLAs

| Priority | First Response | Resolution Target |
|----------|----------------|-------------------|
| P1 (complaint, fraud) | 1 hour | 24 hours |
| P2 (status query) | 2 hours | 24 hours |
| P3 (general) | 4 hours | 48 hours |
| P4 (low) | 8 hours | 72 hours |
| Technical (bug) | 4 hours | Per severity |
| Compliance | 24 hours | 72 hours |
| Complaint formal | 1 hour ack | 48 hours resolve |

### Category Routing

| Category | Route | First Response SLA |
|----------|-------|------------------|
| General inquiry | Support L1 | 4 hours |
| Application status | Support L1 + app lookup | 2 hours |
| Document issue | L1 → Sales if needed | 4 hours |
| Complaint | L2 + Branch Manager | 1 hour |
| Technical (app bug) | L2 → DevOps | 4 hours |
| Compliance | Compliance Analyst | 24 hours |
| Fraud | Fraud Analyst | 1 hour |

### KPIs

| KPI | Target |
|-----|--------|
| First response SLA compliance | ≥ 95% |
| Resolution SLA compliance | ≥ 90% |
| CSAT | ≥ 4.5/5 |
| AI auto-resolution rate | ≥ 60% |
| Escalation rate | < 10% |
| Complaint resolution within 48h | ≥ 95% |
| Reopen rate | < 5% |

### Escalations

| Trigger | Target |
|---------|--------|
| P1 unresolved > 1 hour | Support Lead (phone) |
| Complaint unresolved 24h | Branch Manager |
| Complaint unresolved 48h | Regional Manager |
| Complaint unresolved 7 days | CEO office |
| Fraud ticket | Compliance Manager immediate |
| Technical P1 outage | DevOps + Admin |

### Exception Handling

| Exception | Handling |
|-----------|----------|
| Customer unresponsive | PENDING_CUSTOMER; auto-close 7 days |
| Sales routing loop | Support Lead assigns fixed owner |
| Duplicate tickets | Merge; single SLA |
| AI resolved but customer dissatisfied | Reopen; human assign |
| Regulatory complaint | Compliance owns; BM informed |
| Data access request (DPDP) | Compliance process; 30-day SLA |

### ASCII Flow — Support Lifecycle

```
C-SUP-03 / C-AI-10 / C-VOC-04
         │
         ▼
    ┌────────┐
    │  OPEN  │
    └────┬───┘
         │
    ┌────▼─────┐     ┌─────────────┐
    │ ASSIGNED │────→│ IN_PROGRESS │
    └──────────┘     └──────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        PENDING_CUST    RESOLVED      ESCALATED
              │             │             │
              └─────────────┼─────────────┘
                            ▼
                       ┌─────────┐
                       │ CLOSED  │──→ CSAT survey
                       └─────────┘
```

### Complaint Sub-Workflow

```
C-SUP-10 Complaint → P1 OPEN → L1 Acknowledge (1h)
    → L2 + Branch Manager Investigate (24h)
    → Branch Manager Resolve (48h)
    → Compliance review if regulatory (72h)
    → CLOSED + CSAT
```

### Screen References

| Actor | Screens |
|-------|---------|
| Customer | C-SUP-01–C-SUP-11, C-013, C-AI-10 |
| DSA | D-022 |
| Support Agent | SUP-01–SUP-12, CRM-DB-07 |
| Branch Manager | CRM-DB-05 (complaint alerts) |

---

# APPENDICES

---

## Appendix A: Journey-to-Screen Master Matrix

| Journey | Entry Screen | Conversion Screen | Tracking Screen | Exit/Outcome Screen |
|---------|--------------|-------------------|-----------------|---------------------|
| J-CUS-01 | C-001, C-004 | C-HL-A05 | C-HL-S01 | C-HL-S03, C-REF-01 |
| J-DSA-01 | D-003, D-004 | D-LD-05 | D-LD-08 | D-COM-07 |
| J-REF-01 | C-REF-02 | Referral submit | C-REF-04 | C-REF-06 |
| J-SAL-01 | CRM-DB-01 | CRM-LD-12 | CRM-AP-04 | CRM-AP-15 handoff |
| J-RM-01 | CRM-DB-02 | CRM-CU-10 | CRM-CU-09 | CRM-CU-02 |
| J-CRD-01 | CRM-AP-15 | CRM-AP-05 | CRM-DOC-02 | S05 queue |
| J-OPS-01 | CRM-AP-16 | CRM-AP-11 | CRM-AP-06 | CRM-AP-08 |
| J-BM-01 | CRM-DB-05 | CRM-LD-03 | CRM-LD-10 | — |
| J-RM-02 | CRM-DB-06 | — | Analytics | CRM-DB-10 pack |
| J-ADM-01 | CRM-DB-09 | CRM-CP-02 | CRM-DB-09 | — |
| J-MGT-01 | CRM-DB-10 | — | CRM-DB-10 | Board pack |
| J-AI-01 | C-AI-01 | C-AI-03 | C-AI-02 | C-AI-10 or C-HL-A01 |
| J-VOC-01 | C-VOC-01 | — | C-VOC-02 | C-VOC-03 |

---

## Appendix B: Lead Grade-to-SLA Quick Reference

| Grade | Score | Alias | Contact SLA | Sales Priority | CRM Queue Sort |
|-------|-------|-------|-------------|----------------|----------------|
| A+ | 85–100 | Hot | 1 hour | P1 | 1 (top) |
| A | 70–84 | Warm | 4 hours | P2 | 2 |
| B | 50–69 | Moderate | 24 hours | P3 | 3 |
| C | 30–49 | Cold | 48 hours | P4 | 4 |
| Rejected | 0–29 | Rejected | None | — | Nurture pool only |

---

## Appendix C: LOS Stage-to-Actor RACI Summary

| Stage | Customer | DSA | Sales | Credit | Ops | Lender | System |
|-------|----------|-----|-------|--------|-----|--------|--------|
| S01 | C | C | R | — | — | — | A |
| S02 | C | I | R | — | — | — | I |
| S03 | R | C | R | — | — | — | I |
| S04 | I | — | C | R | — | — | A |
| S05 | — | — | I | C | R | I | I |
| S06 | I | — | C | C | R | R | I |
| S07 | R | — | C | — | R | A | I |
| S08 | C | — | I | — | R | R | I |
| S09 | I | — | I | — | C | — | R |

*R = Responsible, A = Accountable, C = Consulted, I = Informed*

---

## Appendix D: Rejection & Rework Code Cross-Reference

### Application Rejection Codes (AR-*)

| Code | Stage | Reason | Nurture |
|------|-------|--------|---------|
| AR-01 | S02 | Customer not interested | Yes |
| AR-02 | S02 | Unable to qualify | Yes |
| AR-03 | S04 | FOIR exceeds limit | Yes (guidance) |
| AR-04 | S04 | CIBIL below minimum | Yes (tips) |
| AR-05 | S04 | LTV exceeds limit | Yes |
| AR-06 | S06 | Lender declined | Yes |
| AR-07 | S07 | Customer rejected terms | Yes |
| AR-08 | S08 | Disbursement failed | Yes |

### Lead Rejection Codes (R-*)

| Code | Reason | Nurture Eligible | Re-engage After |
|------|--------|------------------|-----------------|
| R-01 | Below minimum income | Yes | 6 months |
| R-02 | CIBIL too low | Yes | Credit program |
| R-03 | Age ineligible | No | — |
| R-04 | Geographic restriction | Yes | Territory expand |
| R-05 | Property/legal issue | Yes | If resolvable |
| R-06 | Fraud suspected | No | Compliance hold |
| R-07 | Customer not interested | Yes | 3 months |
| R-08 | Duplicate lead | No | — |
| R-09 | Unable to contact | Yes | 1 month |
| R-10 | Product mismatch | Yes | Alternate product |

### Rework Codes (RW-*)

| Code | From → To | Trigger |
|------|-----------|---------|
| RW-01 | S04 → S03 | Document deficiency |
| RW-02 | S05 → S03/S04 | Lender document query |
| RW-03 | S06 → S03 | Lender conditional |
| RW-04 | S07 → S06 | Terms renegotiation |
| RW-05 | S08 → S03/S07 | Pre-disbursement condition |
| RW-06 | S08 → S03 | Legal/valuation issue |

---

## Appendix E: Escalation Matrix Summary

| Domain | Trigger | L1 | L2 | L3 |
|--------|---------|----|----|-----|
| Lead SLA | A+ > 1h uncontacted | Sales manager | Branch Manager | Regional |
| LOS SLA | S03 > 7 days | Sales manager | Branch Manager | Ops Head |
| Lender SLA | S06 > SLA+2d | Ops Executive | Ops Head | Business Head |
| Commission | Dispute > 10d | Branch Manager | Finance Head | CEO |
| Support P1 | Unresolved > 1h | Support Lead | Branch Manager | Regional |
| Complaint | Unresolved > 48h | Branch Manager | Regional | CEO (7d) |
| Credit exception | FOIR > 65% | Credit Exec | Branch Manager | Regional |
| AI/Voice | Human request | Sales/Support | Support Lead | Branch Manager |
| Fraud | Any flag | Compliance | Compliance Mgr | CEO |
| Partner | Quality < 50 | Branch Manager | Finance | Management |

---

## Appendix F: Channel Entry Point Map

| Channel | Entry API / Action | Lead Owner | Commission | Primary Journey |
|---------|-------------------|------------|------------|-----------------|
| Customer App self-serve | POST /v1/customer/applications | Auto Sales Exec | No | J-CUS-01 |
| Customer App + AI | AI qualification completion | Auto Sales Exec | No | J-AI-01 → J-CUS-01 |
| DSA App | POST /v1/dsa/leads | DSA attributed + Exec | Yes | J-DSA-01 |
| Referral Link | POST /v1/referrals/submit | Referral + Exec | Reward | J-REF-01 |
| CRM Manual | POST /v1/crm/leads | Creating Exec | No | J-SAL-01 |
| Campaign Landing | POST /v1/crm/leads (CAMPAIGN) | Campaign pool | Per campaign | J-CUS-01 |
| WhatsApp | Inbound → Support → Sales | Support handoff | No | J-CUS-01 |
| AI Voice | Voice session callback | Scheduled Exec | No | J-VOC-01 |

---

## Appendix G: Instrumentation & Analytics Events

| Event Name | Journey | Payload Keys |
|------------|---------|--------------|
| `journey_started` | All | journeyId, persona, channel |
| `screen_viewed` | All | screenId, previousScreenId |
| `lead_created` | LF-01 | leadId, grade, channel, partnerId |
| `lead_state_changed` | LF-01 | fromState, toState, slaRemaining |
| `application_stage_changed` | LF-02 | applicationId, fromStage, toStage |
| `document_uploaded` | LF-03 | documentType, ocrResult |
| `document_verified` | LF-03 | documentId, status |
| `referral_attributed` | LF-04 | referralId, partnerId, windowExpiry |
| `commission_provisional` | LF-05 | commissionId, amount, partnerId |
| `commission_paid` | LF-05 | commissionId, utr |
| `support_ticket_created` | LF-06 | ticketId, category, priority |
| `ai_session_started` | J-AI-01 | sessionId, entryPoint |
| `ai_escalated` | J-AI-01 | sessionId, reason, targetRole |
| `voice_session_completed` | J-VOC-01 | sessionId, duration, transferFlag |
| `sla_breached` | All | entityType, entityId, slaType, breachDuration |
| `escalation_triggered` | All | fromRole, toRole, reason |

---

## Appendix H: Glossary

| Term | Definition |
|------|------------|
| **A+ / A / B / C / Rejected** | Canonical lead grades (display: Hot/Warm/Moderate/Cold/Rejected) |
| **LOS** | Loan Origination System — application processing (S01–S09) |
| **LMS** | Lead Management System — lead lifecycle |
| **DMS** | Document Management System — document lifecycle |
| **DSA** | Direct Selling Agent — commission-based partner |
| **Referral Partner** | Reward-based partner with limited pipeline access |
| **FOIR** | Fixed Obligation to Income Ratio |
| **LTV** | Loan to Value ratio |
| **DSCR** | Debt Service Coverage Ratio |
| **Bank Login** | S05 — application submission to lender system |
| **PROVISIONAL** | Initial commission state post-disbursement |
| **Clawback** | Commission reversal within defined period post-disbursement |
| **Rework** | Return application to earlier stage (RW codes) |
| **SoD** | Separation of Duties |
| **NBA** | Next Best Action (AI Copilot suggestion) |
| **RAG** | Retrieval-Augmented Generation — AI knowledge backbone |

---

## Appendix I: Related Document Index

| Document | Relationship |
|----------|--------------|
| KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md | Authoritative SLAs, states, escalations — parent of this doc |
| KUBERONE_USER_TYPES_AND_ROLES.md | Persona definitions, KPIs, permissions |
| KUBERONE_AI_RAG_ARCHITECTURE.md | AI Advisor §5 customer journey; Voice §20–21 |
| KUBERONE_SCREEN_PLANNING_AND_IA.md | Screen ID registry (C-*, D-*, CRM-*) |
| KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md | S01–S09 definitions; product sub-stages |
| KUBERONE_RBAC_AND_PERMISSIONS.md | Role permissions per journey action |
| KUBERONE_API_SPECIFICATION.md | API endpoints referenced in flows |
| KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md | Entity models for state persistence |

---

## Appendix J: Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | KuberOne Product Team | Initial release — all persona journeys, 6 lifecycle flows, screen mappings, appendices |

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Head | | | |
| Operations Head | | | |
| CTO | | | |
| CEO | | | |

---

*End of KUBERONE_USER_FLOWS_AND_JOURNEY_MAPS.md*

*This document is the operational companion to KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md. For canonical SLA numbers, state codes, and escalation authority, the Business Workflow document prevails in case of conflict. Screen IDs are defined in KUBERONE_SCREEN_PLANNING_AND_IA.md.*

