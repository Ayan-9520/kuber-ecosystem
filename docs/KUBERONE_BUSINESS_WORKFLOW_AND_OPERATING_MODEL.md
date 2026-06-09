# KuberOne
## Business Workflow & Operating Model Document

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise Business Workflow & Operating Model (BWO)  
**Classification:** Board-Ready | Operations-Ready | Compliance-Ready | Implementation-Ready  
**Version:** 1.0  
**Date:** June 2026  
**Related Documents:**
- [KUBERONE_VISION_AND_OBJECTIVES.md](./KUBERONE_VISION_AND_OBJECTIVES.md)
- [KUBERONE_USER_TYPES_AND_ROLES.md](./KUBERONE_USER_TYPES_AND_ROLES.md)
- [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md)
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md)
- [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md)
- [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md)
- [KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md](./KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md)
- [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md)
- [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md)
- [KUBERONE_ENTERPRISE_ARCHITECTURE_AUDIT_REPORT.md](./KUBERONE_ENTERPRISE_ARCHITECTURE_AUDIT_REPORT.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Authoritative business operating model — workflows, SLAs, handoffs, escalations, commission, referral, compliance |
| **Audience** | Board, CEO, Operations, Sales, Product, Compliance, Engineering, Partners |
| **Status** | Master Business Operations Blueprint |
| **Out of Scope** | Source code, API implementations, UI wireframes |
| **Resolves** | Enterprise Audit P1-1 (missing Business Workflow doc); lead grading canonical model (Audit CONFLICT-03) |

---

## Operating Model Statistics

| Metric | Value |
|--------|-------|
| **Primary value chain stages** | 12 (Capture → Portfolio) |
| **LOS stages** | 9 (S01–S09) |
| **Lead grades** | 5 (A+, A, B, C, Rejected) |
| **Lead capture channels** | 8 |
| **Internal roles in workflows** | 22 |
| **SLA definitions** | 40+ |
| **Escalation paths** | 15 |
| **Commission lifecycle states** | 4 |
| **Rejection reason codes** | 10+ |
| **Rework loops** | 6 |

---

# 30. EXECUTIVE SUMMARY

*Board-level operating model summary — presented first.*

## Purpose

This document is the **single authoritative source** for how KuberOne operates as a fintech loan marketplace — from lead capture through disbursement, commission settlement, and portfolio management. It consolidates workflow content previously fragmented across Vision, User Types, Loan Products, RBAC, Backend, CRM, and AI architecture documents.

## Operating Model at a Glance

KuberOne operates as a **multi-channel loan distribution platform** connecting customers, DSA/referral partners, and internal teams with lender products through an AI-assisted, SLA-driven workflow engine.

```
PARTNERS & CUSTOMERS          KUBERONE PLATFORM              LENDERS
─────────────────────         ───────────────────            ───────
Customer App  ──┐
DSA App       ──┼──→  LMS (Lead)  ──→  LOS (Application)  ──→  Bank Login
Referral      ──┤         │                    │                    │
Campaign/Web  ──┘         ▼                    ▼                    ▼
                    AI Advisor/Copilot    Document/KYC         Sanction
                    Commission Engine     Credit Review        Disbursement
                    Notification Engine   Operations           Closure
```

## Key Operating Decisions (Canonical)

| Decision | Model |
|----------|-------|
| **Lead grading** | A+, A, B, C, Rejected (display aliases: Hot, Warm, Moderate, Cold) |
| **Lead scoring** | 70% rule engine + 30% AI signal (combined score 0–100) |
| **Application lifecycle** | Universal 9-stage LOS (S01–S09) across all 20 product variants |
| **Commission trigger** | On disbursement confirmation (PROVISIONAL → APPROVED → PAID) |
| **AI role** | Advisory only — no auto-approve, auto-sanction, or auto-disburse |
| **Escalation** | SLA breach → auto-escalation → human resolution with audit trail |
| **Data ownership** | Lead owned by assigned executive; application owned by processing chain |

## Business Impact

| Impact Area | How Operating Model Delivers |
|-------------|------------------------------|
| **Revenue** | SLA-driven lead contact → higher conversion; commission engine on every disbursement |
| **Partner trust** | Transparent commission ledger, referral attribution, DSA performance visibility |
| **Customer experience** | Predictable timelines, AI guidance, proactive deficiency alerts |
| **Compliance** | SoD-enforced workflows, audit at every stage transition, DPDP consent gates |
| **Scale** | Parameterized workflow engine — new products plug in without process redesign |

**Board Recommendation:** Adopt this document as the binding operating model for all KuberOne business operations, training, SLA monitoring, and workflow engine configuration.

---

# 1. OPERATING MODEL VISION

## 1.1 What KuberOne Operates

KuberOne is not a lender. KuberOne is a **loan origination and distribution operating system** that:

1. **Captures** demand from customers, DSAs, referrals, and campaigns
2. **Qualifies** leads using rules + AI scoring
3. **Originates** loan applications across 20 product variants
4. **Collects** documents and runs eligibility/credit assessment
5. **Submits** applications to partner lenders (bank login)
6. **Tracks** lender underwriting through sanction and disbursement
7. **Settles** commissions with DSAs and referral partners
8. **Manages** customer portfolio for cross-sell, renewal, and servicing handoff

## 1.2 Operating Model Goals

| # | Goal | Metric | Target |
|---|------|--------|--------|
| 1 | Fast lead response | First contact SLA compliance | ≥ 95% |
| 2 | High conversion | Lead-to-application rate | ≥ 30% |
| 3 | Efficient processing | Lead-to-disbursement TAT | ≤ 28 days (HL avg) |
| 4 | Partner satisfaction | DSA commission dispute rate | < 2% |
| 5 | Customer transparency | Status update within SLA | 100% stage transitions |
| 6 | Compliance | Audit trail completeness | 100% mutations logged |
| 7 | AI leverage | AI-assisted conversion lift | +15% vs non-AI |
| 8 | Revenue growth | Disbursement volume YoY | Per business plan |

## 1.3 Operating Boundaries

| KuberOne Does | KuberOne Does NOT |
|---------------|-------------------|
| Originate and process loan applications | Lend money directly (Phase 1) |
| Recommend products and lenders (AI + rules) | Guarantee loan approval |
| Collect KYC and income documents | Make final credit decisions |
| Submit applications to lenders | Override lender underwriting |
| Calculate and track commissions | Disburse commissions without Finance approval |
| Provide AI guidance to customers and sales | Auto-approve credit or disburse funds |
| Manage lead pipeline and SLAs | Contact rejected/fraud-flagged leads |

---

# 2. OPERATING PRINCIPLES

| # | Principle | Implementation |
|---|-----------|----------------|
| 1 | **SLA-first operations** | Every workflow step has a defined SLA, owner, and escalation |
| 2 | **Single source of truth** | Application stage (S01–S09) is the canonical status for all channels |
| 3 | **Human-in-the-loop for decisions** | AI advises; humans approve credit, commission, and exceptions |
| 4 | **Separation of duties** | Sales cannot approve commission; Finance cannot originate applications |
| 5 | **Audit everything** | Stage transitions, document access, commission changes — all logged |
| 6 | **Channel-agnostic processing** | Same LOS regardless of whether lead came from DSA, customer, or referral |
| 7 | **Partner transparency** | DSAs see their leads, commissions, and performance in real time |
| 8 | **Customer consent** | DPDP consent before bureau pull, AI profile use, or marketing outreach |
| 9 | **Fail forward** | Rejections capture reason codes; nurture-eligible leads enter re-engagement |
| 10 | **Parameterized by product** | Workflow engine configures stages, docs, and gates per product variant |

---

# 3. CHANNEL OPERATING MODEL

## 3.1 Channel Overview

| Channel | Actor | Entry Point | Lead Owner | Commission Eligible |
|---------|-------|-------------|------------|---------------------|
| **Customer App (self-serve)** | Customer | App wizard / AI Advisor | Auto-assigned Sales Exec | No (direct) |
| **Customer App (assisted)** | Customer + Sales | App + CRM co-browse | Assigned Sales Exec | No |
| **DSA App** | DSA Partner | DSA lead submission | DSA (attributed) + assigned exec | Yes — DSA share |
| **Referral Link** | Referral Partner | Referral code/link | Referral (attributed) + assigned exec | Yes — referral reward |
| **CRM (manual)** | Sales Executive | CRM lead create | Creating executive | No |
| **Campaign Landing** | Anonymous/Customer | Web form with UTM | Campaign-assigned pool | Per campaign rules |
| **WhatsApp** | Customer | WhatsApp inbound | Support → Sales handoff | No |
| **AI Voice** | Customer | Voice session callback | Scheduled Sales Exec | No |

## 3.2 Channel-Specific Operating Rules

### Customer App (Self-Serve)

| Rule | Detail |
|------|--------|
| Lead creation | Auto on application start OR explicit eligibility check with contact |
| Assignment | Round-robin within customer's pincode branch |
| AI role | Advisor guides product selection, eligibility, document list |
| SLA | A+ if complete profile + high intent; standard grading otherwise |
| Escalation | In-app "Talk to advisor" → ticket to assigned Sales Exec |

### DSA App

| Rule | Detail |
|------|--------|
| Lead creation | DSA submits lead with customer consent confirmation |
| Attribution | `partnerId` locked at lead creation; immutable |
| Data visibility | DSA sees only own leads and commissions (RBAC scoped) |
| SLA | DSA-submitted complete leads get +10 scoring bonus → higher grade |
| Commission | DSA tier (Bronze/Silver/Gold/Platinum) determines share % |
| Dispute | DSA raises dispute within 15 days of commission PROVISIONAL |

### Referral Channel

| Rule | Detail |
|------|--------|
| Attribution window | 90 days from referral link click to application creation |
| Reward trigger | On disbursement (not on application or sanction) |
| Reward type | Fixed amount or % of commission (per referral campaign config) |
| Duplicate handling | Same phone + same product within 30 days → DUPLICATE flag |

### Campaign Landing

| Rule | Detail |
|------|--------|
| UTM tracking | Source, medium, campaign stored on lead |
| Assignment | Campaign config defines target branch or executive pool |
| SLA | Per campaign config (default: Warm — 4-hour contact) |
| Nurture | Unconverted campaign leads enter 30-day nurture sequence |

---

# 4. END-TO-END VALUE CHAIN

## 4.1 Master Value Chain

```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ CAPTURE │ → │QUALIFY  │ → │ORIGINATE│ → │PROCESS  │ → │DISBURSE │ → │PORTFOLIO│
│  (LMS)  │   │  (LMS)  │   │  (LOS)  │   │  (LOS)  │   │  (LOS)  │   │  (RM)   │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
     │              │              │              │              │              │
  8 channels    Rule+AI score   S01-S02       S03-S06        S07-S08        S09+
  Lead created  Grade A+-C    Application    Docs/Credit    Sanction/      RM handoff
                Assignment    created        Lender login   Disbursement   Cross-sell
```

## 4.2 Value Chain Stage Detail

| Stage | System | Primary Output | Success Criteria |
|-------|--------|----------------|------------------|
| **Capture** | LMS | Lead record with source attribution | Valid phone + product interest |
| **Qualify** | LMS + AI | Graded lead (A+ to C) or Rejected | Score calculated; SLA clock starts |
| **Originate** | LOS | Application (S01→S02) | Application created; customer linked |
| **Process** | LOS | Docs complete + lender submitted (S03→S05) | Eligibility passed; bank login done |
| **Underwrite** | LOS + Lender | Lender decision (S06) | Sanction or rejection from lender |
| **Disburse** | LOS | Funds released (S07→S08) | Disbursement recorded; commission triggered |
| **Portfolio** | CRM/RM | Customer in portfolio (S09) | RM assigned; cross-sell eligible |

## 4.3 Operating Hours

| Function | Hours (IST) | Coverage |
|----------|-------------|----------|
| Lead contact (A+/A) | 09:00–21:00 | Sales executives |
| Lead contact (B/C) | 09:00–18:00 | Sales executives |
| Operations processing | 09:00–18:00 (Mon–Sat) | Ops executives |
| Credit review | 09:00–17:00 (Mon–Fri) | Credit executives |
| Customer support | 09:00–21:00 | Support L1/L2 |
| AI Advisor | 24/7 | Automated |
| System/commission batch | 02:00–04:00 | Automated jobs |

---

# 5. LMS OPERATING MODEL

## 5.1 Lead Lifecycle States

| State | Code | Description | Next States |
|-------|------|-------------|-------------|
| **New** | `NEW` | Just captured; scoring pending | `SCORED` |
| **Scored** | `SCORED` | Grade assigned; awaiting assignment | `ASSIGNED` |
| **Assigned** | `ASSIGNED` | Executive assigned; SLA clock running | `CONTACTED`, `NURTURE`, `REJECTED` |
| **Contacted** | `CONTACTED` | First contact made | `QUALIFIED`, `NURTURE`, `REJECTED` |
| **Qualified** | `QUALIFIED` | Ready for application | `CONVERTED` |
| **Converted** | `CONVERTED` | Application created; lead closed | Terminal |
| **Nurture** | `NURTURE` | Scheduled follow-up | `CONTACTED`, `REJECTED`, `EXPIRED` |
| **Rejected** | `REJECTED` | Disqualified | `NURTURE` (if eligible) |
| **Expired** | `EXPIRED` | No activity beyond retention window | Terminal |
| **Duplicate** | `DUPLICATE` | Same customer+product within window | Terminal |

## 5.2 Lead Capture Workflow

```
TRIGGER (any channel)
    │
    ▼
┌─────────────────────────────────────┐
│ 1. VALIDATE                         │
│    ├── Phone format (10-digit IN)   │
│    ├── Product code valid           │
│    ├── Source attribution captured  │
│    └── Duplicate check (30-day)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. ENRICH                           │
│    ├── Match existing customer      │
│    ├── Pre-fill profile if found    │
│    ├── Attach partner attribution   │
│    └── Bureau pull (if consented)   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. SCORE (Rule 70% + AI 30%)       │
│    └── See Section 6                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. CLASSIFY & ROUTE                 │
│    ├── Assign grade (A+ to C)       │
│    ├── Route per assignment rules   │
│    ├── Start SLA timer              │
│    └── Notify assigned executive    │
└─────────────────────────────────────┘
```

## 5.3 Lead Capture API Canonical Mapping

*Resolves Enterprise Audit CONFLICT-04.*

| Channel | Canonical API | Legacy Reference (deprecated) |
|---------|---------------|----------------------------|
| Customer App | `POST /v1/customer/applications` (auto-creates lead) | `/customer/leads` |
| DSA App | `POST /v1/dsa/leads` | — |
| Referral | `POST /v1/referrals/submit` | `/referral/submit` |
| CRM Manual | `POST /v1/crm/leads` | — |
| Campaign/Public | `POST /v1/crm/leads` with `source=CAMPAIGN` | `/public/leads` |
| AI Advisor | Lead created on qualification completion | — |

---

# 6. CANONICAL LEAD QUALIFICATION & GRADING

*Resolves Enterprise Audit CONFLICT-03. This section is authoritative for all systems.*

## 6.1 Grading Model (Canonical)

| Grade | Display Alias | Score Range | Label | First Contact SLA | Priority |
|-------|---------------|-------------|-------|-------------------|----------|
| **A+** | Hot | 85–100 | High conversion — immediate action | **1 hour** | P1 |
| **A** | Warm | 70–84 | Good potential — priority | **4 hours** | P2 |
| **B** | Moderate | 50–69 | Needs nurturing — standard | **24 hours** | P3 |
| **C** | Cold | 30–49 | Low priority — campaign nurture | **48 hours** | P4 |
| **Rejected** | Rejected | 0–29 | Unqualified — no active outreach | No contact | — |

**Mapping note:** Loan Products doc "Hot/Warm/Cold" and AI RAG doc "A+/A/B/C" refer to the **same canonical grades** above. All UIs, reports, and notifications use grade code (A+) with alias shown in parentheses where helpful.

## 6.2 Scoring Formula

```
combinedScore = (ruleScore × 0.70) + (aiScore × 0.30)

Where:
  ruleScore = weighted sum of 15 qualification factors (0–100)
  aiScore   = AI assessment of engagement, intent, profile quality (0–100)
```

## 6.3 Rule Scoring Factors (15 Factors — 70% Weight)

| # | Factor | Weight | Full Marks When | Zero Marks When |
|---|--------|--------|-----------------|-----------------|
| 1 | Income eligibility | 15% | Meets product minimum | Unknown or below minimum |
| 2 | CIBIL score | 12% | ≥ 700 | < 650 or unknown |
| 3 | Product-need match | 10% | Exact product fit | Vague/exploratory |
| 4 | Timeline urgency | 10% | < 30 days | > 90 days |
| 5 | Document readiness | 8% | ≥ 50% docs available | None |
| 6 | Collateral identified | 10% | Property/vehicle confirmed | Not identified |
| 7 | Down payment readiness | 8% | Funds arranged | Not arranged |
| 8 | Employment/business stability | 7% | ≥ 3 years | < 1 year |
| 9 | FOIR headroom | 7% | FOIR < 40% | FOIR > 55% |
| 10 | Lead source quality | 5% | DSA/referral (trusted) | Unknown/cold campaign |
| 11 | Engagement level | 5% | Multi-touch engaged | Single touch |
| 12 | Geographic eligibility | 3% | Approved pincode | Restricted area |
| 13 | Existing customer | 3% | Repeat customer | New unknown |
| 14 | Co-applicant availability | 3% | Co-applicant ready | Needed but unavailable |
| 15 | Profile completeness | 2% | ≥ 80% fields filled | < 40% filled |

## 6.4 AI Scoring Factors (30% Weight)

| Signal | Weight within AI | Scoring |
|--------|------------------|---------|
| AI Advisor engagement quality | 30% | Depth of conversation, questions asked |
| Intent clarity | 25% | Specific product + amount + timeline stated |
| Response velocity | 20% | Customer response time in AI chat |
| Eligibility pre-check result | 15% | Passed pre-check vs failed |
| Document upload in session | 10% | Uploaded during AI session |

## 6.5 Scoring Business Rules (Gates)

| Rule | Effect |
|------|--------|
| Income < 50% of product minimum | Cap combined score at 29 → Rejected |
| Non-serviceable pincode | Cap combined score at 39 → C |
| Age outside product range | Cap combined score at 29 → Rejected |
| Fraud flag active | Force Rejected; Compliance review |
| DSA lead with complete data | +10 bonus to ruleScore (max 100) |
| Active application exists (same product) | Do not create new lead; link to existing |
| Duplicate (same phone + product < 30 days) | State = DUPLICATE; no scoring |
| Re-activated nurture lead | Reset score; 7-day cooldown before rescore |

## 6.6 Product-Specific Auto-Reject Gates

| Product | Auto-Reject If |
|---------|----------------|
| Home Loan (HL) | Age out of range; CIBIL < 600; no income proof path |
| LAP | No property ownership; title dispute flagged |
| Business Loan (BL) | Business vintage < 1 year; no business bank account |
| Auto Loan (AL) | Income < ₹15,000/month; vehicle not identified (for A+ grade) |

## 6.7 Rejected Lead Reason Codes

| Code | Reason | Nurture Eligible | Re-engage After |
|------|--------|------------------|-----------------|
| R-01 | Below minimum income | Yes | 6 months |
| R-02 | CIBIL too low | Yes | Credit improvement program |
| R-03 | Age ineligible | No | — |
| R-04 | Geographic restriction | Yes | If territory expands |
| R-05 | Property/legal issue | Yes | If resolvable |
| R-06 | Fraud suspected | No | Compliance hold |
| R-07 | Customer not interested | Yes | 3 months |
| R-08 | Duplicate lead | No | — |
| R-09 | Unable to contact (5+ attempts) | Yes | 1 month |
| R-10 | Product mismatch | Yes | Alternate product outreach |

---

# 7. LEAD ASSIGNMENT & ROUTING

## 7.1 Assignment Rules (Priority Order)

| Priority | Rule | Condition | Assign To |
|----------|------|-----------|-----------|
| 1 | Partner affinity | Lead has `partnerId` (DSA) | Partner's mapped Sales Executive |
| 2 | Existing relationship | Customer has assigned RM | RM (for portfolio products) |
| 3 | Product specialist | Product requires certification | Certified executive in branch |
| 4 | Grade-based priority | Grade A+ | Senior executive or Branch Manager designated |
| 5 | Geographic | Customer pincode | Branch covering pincode |
| 6 | Load balancing | No specific rule match | Round-robin within branch pool |
| 7 | Campaign override | Campaign config specifies pool | Campaign target executives |

## 7.2 Assignment SLA

| Action | SLA | Escalation |
|--------|-----|------------|
| Auto-assignment after scoring | Immediate (< 1 min) | System alert if > 5 min |
| Manual reassignment request | 1 hour | Branch Manager |
| Unassigned lead in pool | 30 minutes | Branch Manager auto-notify |
| A+ lead uncontacted | 1 hour | Branch Manager |
| A lead uncontacted | 4 hours | Branch Manager |
| B lead uncontacted | 24 hours | Sales Head (weekly report) |

## 7.3 Assignment Override

| Actor | Can Override | Constraint |
|-------|-------------|------------|
| Branch Manager | Reassign any lead in branch | Log reason; notify previous and new executive |
| Regional Manager | Reassign across branches | Log reason; Branch Manager notified |
| Sales Head | Reassign within region | Audit logged |
| System | Auto-reassign on SLA breach (A+/A only) | Configurable per branch |

---

# 8. LOS OPERATING MODEL (S01–S09)

## 8.1 Universal Application Lifecycle

*Authoritative stage definitions — all 20 product variants follow this lifecycle with product-specific sub-checks.*

| Stage | Code | Name | Primary Actor | Entry Gate | Exit Gate |
|-------|------|------|---------------|------------|-----------|
| S01 | `LEAD_CREATED` | Lead Created | System / Channel | Lead qualified OR direct application | Application record created |
| S02 | `QUALIFIED` | Qualified | Sales Executive | Contact made; basic eligibility confirmed | Customer committed to proceed |
| S03 | `DOCUMENT_COLLECTION` | Document Collection | Sales / Customer / DSA | Application created | All mandatory docs uploaded & verified |
| S04 | `ELIGIBILITY_CHECK` | Eligibility Check | System / Credit Exec | Documents complete | Eligibility pass or structured reject |
| S05 | `BANK_LOGIN` | Bank Login | Operations Executive | Credit pre-approved for submission | Lender acknowledgment received |
| S06 | `CREDIT_REVIEW` | Credit Review | Lender (+ Credit support) | Bank login complete | Lender decision (sanction/reject/conditional) |
| S07 | `SANCTION` | Sanction | Lender / Operations | Credit approved by lender | Sanction letter issued; customer acceptance |
| S08 | `DISBURSEMENT` | Disbursement | Lender / Operations | Sanction accepted; pre-disb conditions met | Funds transferred; disbursement recorded |
| S09 | `CLOSURE` | Closure | System | Disbursement confirmed | Portfolio assigned to RM; case closed |

**Terminal states (outside S01–S09):**

| State | Code | Trigger |
|-------|------|---------|
| Rejected | `REJECTED` | Fail at S02, S04, S06, or S07 |
| Withdrawn | `WITHDRAWN` | Customer withdraws at any stage |
| On Hold | `ON_HOLD` | Ops/Credit hold (legal, valuation, lender query) |

## 8.2 Customer-Facing Status Labels

| Internal Stage | Customer App Label | CRM Label |
|----------------|-------------------|-----------|
| S01 | Application Initiated | Lead / New Application |
| S02 | Under Review | Qualified |
| S03 | Documents Required / Under Review | Documentation |
| S04 | Eligibility Verified | Eligibility Check |
| S05 | Submitted to Bank | Bank Login |
| S06 | Under Bank Review | Credit Review |
| S07 | Approved / Conditionally Approved | Sanctioned |
| S08 | Disbursement in Progress → Disbursed | Disbursement |
| S09 | Complete | Closed |
| Rejected | Not Approved | Rejected |
| On Hold | On Hold — We're Working on It | On Hold |

## 8.3 Stage Transition SLAs

| Transition | SLA | Escalation Trigger | Escalation Target |
|------------|-----|-------------------|-------------------|
| S01 → S02 | 24 hours | 48 hours | Branch Manager |
| S02 → S03 (docs started) | 48 hours | 72 hours | Branch Manager |
| S03 → S04 (docs complete) | 5 business days | 7 days | Sales Executive manager |
| S04 → S05 | 24 hours | 48 hours | Operations Head |
| S05 → S06 | 48 hours | 72 hours | Operations Executive |
| S06 → S07 | Lender SLA (5–15 days) | SLA + 2 days | Operations Head |
| S07 → S08 | 3 business days | 5 days | Operations Head |
| S08 → S09 | 24 hours | Automatic | — |

## 8.4 LOS Swimlane (Primary Path)

```
CUSTOMER/DSA     SALES EXEC        OPERATIONS        CREDIT           LENDER          SYSTEM
────────────     ──────────        ──────────        ──────           ──────          ──────
Apply/Submit ──→ Review lead  ──→                                  ──→              Create S01
                 Contact (SLA)──→                                  ──→              Score lead
                 Qualify      ──→                                  ──→              S01→S02
                 Collect docs ──→                                  ──→              S02→S03
Upload docs   ──→ Verify docs  ──→                                  ──→              Doc check
                                  ──→ Pre-check    ──→              ──→              S03→S04
                                  ──→ Submit bank ──→              ──→ Login       S04→S05
                                  ──→ Track       ──→ Support ──→  Underwrite     S05→S06
Accept terms  ──→                                  ──→              Sanction       S06→S07
                                  ──→ Record disb ──→              Disburse       S07→S08
                 RM handoff    ←──                                  ←──              S08→S09
                                                    Commission calc ──→              Ledger entry
```

## 8.5 Stage Guards (Transition Preconditions)

| Transition | Guard | Validator |
|------------|-------|-----------|
| S01 → S02 | Customer contact confirmed | `contactMade = true` |
| S02 → S03 | Customer consent to proceed | `customerConsent = true` |
| S03 → S04 | All mandatory documents uploaded | Document checklist engine |
| S03 → S04 | No pending document rejections | OCR validation pass |
| S04 → S05 | Eligibility engine pass | Eligibility result = PASS |
| S04 → S05 | Credit executive pre-approval (if required) | Credit sign-off per product |
| S05 → S06 | Lender acknowledgment received | Bank login status = ACKNOWLEDGED |
| S06 → S07 | Lender sanction issued | Sanction record exists |
| S07 → S08 | Customer accepts sanction terms | `sanctionAccepted = true` |
| S07 → S08 | Pre-disbursement conditions met | Condition checklist complete |
| S08 → S09 | Disbursement amount confirmed | Disbursement record exists |

## 8.6 Rejection Points

| Stage | Rejection Type | Reason Categories | Actor |
|-------|---------------|-------------------|-------|
| S02 | Qualification reject | Not interested, unqualified, unable to contact | Sales Executive |
| S04 | Eligibility reject | FOIR fail, CIBIL fail, LTV fail, income insufficient | System / Credit Executive |
| S06 | Lender reject | Underwriting decline, policy mismatch | Lender (recorded by Ops) |
| S07 | Sanction decline | Customer rejects terms, terms unacceptable | Customer / Sales Executive |
| S08 | Disbursement hold | Legal issue, valuation mismatch, lender hold | Operations Executive |

## 8.7 Rework Loops

| From Stage | Rework Trigger | Return To | Actor |
|------------|---------------|-----------|-------|
| S04 | Document deficiency detected | S03 | System (auto) + Sales notify |
| S05 | Lender document query | S03 or S04 | Operations Executive |
| S06 | Lender conditional approval | S03 | Operations + Sales |
| S07 | Sanction terms mismatch | S06 | Sales Executive (negotiate) |
| S08 | Pre-disbursement condition pending | S03 or S07 | Operations Executive |

---

# 9. DOCUMENT COLLECTION OPERATING WORKFLOW

## 9.1 Document Collection Process

| Step | Actor | Action | SLA |
|------|-------|--------|-----|
| 1 | System | Generate product-specific checklist on S02→S03 | Immediate |
| 2 | System | Notify customer (push + WhatsApp + email) | Immediate |
| 3 | AI Advisor | Explain each document requirement | On customer request |
| 4 | Customer / DSA | Upload via presigned S3 URL | Per S03 SLA (5 days) |
| 5 | System | OCR extract + validate document type | < 5 min after upload |
| 6 | System / Ops | Flag deficiencies; notify sales | Daily batch |
| 7 | Sales Executive | Follow up on missing docs | Daily until complete |
| 8 | Operations | Final completeness check before S04 | On S03→S04 transition |

## 9.2 Document Status Lifecycle

| Status | Meaning | Next Action |
|--------|---------|-------------|
| `PENDING` | Required but not uploaded | Customer upload |
| `UPLOADED` | Uploaded; pending verification | OCR + manual review |
| `VERIFIED` | Passed validation | None |
| `REJECTED` | Failed validation | Re-upload with reason |
| `WAIVED` | Waived by Credit/Ops (exception) | Audit logged |
| `EXPIRED` | Document age exceeds validity | Re-upload required |

## 9.3 Deficiency Handling

| Deficiency Type | Notification | Escalation |
|-----------------|-------------|------------|
| Missing mandatory doc | Customer push + Sales CRM alert | Sales daily follow-up |
| Rejected doc (poor quality) | Customer with re-upload guide | 48h then Sales call |
| Expired doc (e.g., bank stmt > 3 months) | Customer + Sales | Block S04 transition |
| Name mismatch (PAN vs application) | Credit Executive review | Manual override with audit |

---

# 10. CREDIT & UNDERWRITING OPERATING WORKFLOW

## 10.1 Internal Credit Pre-Assessment (S04)

| Step | Actor | Action |
|------|-------|--------|
| 1 | System | Run eligibility engine (FOIR, LTV, DSCR, CIBIL gates) |
| 2 | System | Generate eligibility result with pass/fail per lender |
| 3 | AI Copilot | Provide credit analysis summary to Credit Executive |
| 4 | Credit Executive | Review exceptions; approve or reject for bank submission |
| 5 | System | Record eligibility result; gate S04→S05 |

## 10.2 Credit Exception Workflow

| Exception Type | Authority | Approval |
|----------------|-----------|----------|
| FOIR 50–60% (product allows up to 55%) | Credit Executive | Credit Executive sign-off |
| FOIR 60–65% | Branch Manager + Credit Executive | Dual approval |
| FOIR > 65% | Regional Manager | Escalation with business case |
| CIBIL 600–650 (product min 650) | Credit Executive | Exception with compensating factors |
| CIBIL < 600 | Auto-reject | No exception path (Phase 1) |
| LTV > product max by < 5% | Credit Executive | With additional collateral docs |
| Income verification alternative | Credit Executive | Bank stmt vs ITR substitution |

## 10.3 Lender Underwriting (S06)

| Activity | KuberOne Role | Lender Role |
|----------|---------------|-------------|
| Application submission | Operations (S05 bank login) | Receives application |
| Document sharing | Operations (via lender portal/API) | Reviews documents |
| Queries | Operations responds within SLA | Issues queries |
| Decision | Records decision in system | Makes credit decision |
| Sanction letter | Stores in S3; notifies customer | Issues sanction |
| Conditions | Tracks pre-disbursement conditions | Sets conditions |

---

# 11. COMMISSION OPERATING MODEL

## 11.1 Commission Lifecycle

```
DISBURSEMENT CONFIRMED
        │
        ▼
┌───────────────────┐
│ PROVISIONAL       │  System calculates per commission_rules
│ (auto-created)    │  Ledger entry with rule snapshot
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ APPROVED          │  Finance Head reviews batch (weekly/monthly)
│ (Finance approval)│  SoD: approver ≠ rule configurator
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ PAID              │  NEFT payout file → bank → confirmation
│ (settlement)      │  DSA notified; statement generated
└────────┬──────────┘
         │
         ▼ (if applicable)
┌───────────────────┐
│ CLAWED_BACK       │  Disbursement reversal or fraud detected
│ (recovery)        │  Deducted from next payout
└───────────────────┘
```

## 11.2 Commission Calculation Rules

| Parameter | Description | Example |
|-----------|-------------|---------|
| `productCode` | Product-specific base rate | HL-01: 0.5% of disbursement |
| `lenderCode` | Lender override | HDFC HL: 0.6% |
| `partnerTier` | DSA tier bonus | Gold: +0.1% |
| `loanAmountSlab` | Slab-based rates | ₹0–50L: 0.5%; ₹50L+: 0.4% |
| `payoutTrigger` | Event triggering calculation | DISBURSEMENT (default) |
| `tdsRate` | Tax deducted at source | 5% per IT rules |
| `clawbackPeriod` | Days after disbursement | HL: 90 days; LAP: 60 days |

## 11.3 DSA Commission Sharing

| DSA Tier | Share of Kuber Commission | Qualification |
|----------|--------------------------|---------------|
| Bronze | 60% | New partner (< 3 months) |
| Silver | 70% | 3+ months; 5+ disbursements |
| Gold | 80% | 12+ months; 20+ disbursements; quality score > 80 |
| Platinum | 85% | 24+ months; 50+ disbursements; quality score > 90 |

## 11.4 Commission Operating Workflow

| Step | Actor | Action | SLA |
|------|-------|--------|-----|
| 1 | System | Create PROVISIONAL on disbursement event | Immediate |
| 2 | System | Notify DSA of provisional commission | Immediate |
| 3 | DSA | Review in DSA App (15-day dispute window) | 15 days |
| 4 | Finance Head | Review and approve weekly batch | Weekly (Friday) |
| 5 | System | Generate NEFT payout file | On approval |
| 6 | Finance | Upload to bank; confirm transfer | 2 business days |
| 7 | System | Mark PAID; generate monthly statement PDF | On bank confirmation |
| 8 | DSA | Acknowledge receipt in app | 7 days |

## 11.5 Commission Dispute Workflow

| Step | Actor | Action | SLA |
|------|-------|--------|-----|
| 1 | DSA | Raise dispute with reason + evidence | Within 15 days of PROVISIONAL |
| 2 | Finance | Review dispute | 5 business days |
| 3 | Branch Manager | Mediate if amount dispute | 3 business days |
| 4 | Finance Head | Final decision | 2 business days |
| 5 | System | Adjust ledger or confirm original | Immediate on decision |

## 11.6 Referral Reward Operating Model

| Parameter | Rule |
|-----------|------|
| Attribution window | 90 days from referral click to application creation |
| Reward trigger | Disbursement (same as commission trigger) |
| Reward calculation | Per referral campaign config (fixed ₹ or % of commission) |
| Payout | Included in referral partner statement (monthly) |
| Duplicate | No reward if DUPLICATE lead flag |

---

# 12. PARTNER ECOSYSTEM OPERATING MODEL

## 12.1 Partner Onboarding Workflow

| Step | Actor | Action | SLA |
|------|-------|--------|-----|
| 1 | DSA/Referral | Submit registration via app/portal | — |
| 2 | System | Validate PAN, mobile, basic KYC | Immediate |
| 3 | Branch Manager | Review and approve partner application | 3 business days |
| 4 | DSA/Referral | Complete full KYC (PAN, Aadhaar, bank, agreement) | 7 days |
| 5 | Compliance | AML/sanctions check | 2 business days |
| 6 | Admin | Activate partner; assign tier (Bronze default) | On KYC complete |
| 7 | System | Send welcome kit + training materials | Immediate |

## 12.2 Partner Suspension Workflow

| Trigger | Actor | Action |
|---------|-------|--------|
| KYC expiry | System | Auto-suspend; notify partner |
| Quality score < 50 | Branch Manager | Review; warn or suspend |
| Fraud flag | Compliance | Immediate suspension |
| Commission dispute pattern | Finance Head | Review; possible downgrade |
| Contract breach | Branch Manager + Compliance | Suspend pending investigation |
| Blacklist | Management | Permanent termination |

## 12.3 Partner Performance Management

| Metric | Measurement | Review |
|--------|-------------|--------|
| Lead volume | Leads submitted/month | Monthly |
| Lead quality | A+ grade % of partner leads | Monthly |
| Conversion rate | Disbursed / Submitted | Monthly |
| Document completeness | % leads with complete docs at submission | Monthly |
| Commission dispute rate | Disputes / Total commissions | Quarterly |
| Tier progression | Auto-upgrade when thresholds met | Quarterly |

---

# 13. AI-ASSISTED OPERATING MODEL

## 13.1 AI in Business Operations

| AI Product | Operating Role | Human Oversight |
|------------|---------------|-----------------|
| **AI Advisor** | Customer self-serve guidance; lead enrichment; eligibility explanation | Escalation to Sales on request |
| **AI Copilot** | Sales/Credit insights; NBA; approval probability; missing docs | Sales Executive decides action |
| **Lead Scoring AI** | 30% of combined lead score | Grade thresholds are rules-based |
| **Document AI** | Classification, deficiency detection, OCR | Ops reviews flagged items |
| **Voice AI** | In-app voice sessions; callback scheduling | Transcript review (Phase 2) |
| **Support AI** | FAQ auto-resolution | Escalation to Support L1 |

## 13.2 AI Operating Rules

| Rule | Detail |
|------|--------|
| No auto-approve | AI cannot advance LOS stage without human action (except system guards) |
| No auto-sanction | AI cannot issue or accept sanction |
| No auto-disburse | AI cannot record disbursement |
| Disclaimer required | Every AI session displays advisory disclaimer |
| PII in prompts | Masked per AI Security Architecture |
| Escalation | 3 failed resolutions or user request → human handoff |
| Feedback | Thumbs up/down captured for AI analytics |

## 13.3 AI-Triggered Business Actions

| AI Event | Business Action | Actor |
|----------|----------------|-------|
| A+ lead scored | Push notification to assigned Sales Exec | System |
| Eligibility check completed | Offer "Start Application" CTA | Customer |
| Document deficiency detected | Notify Sales + Customer | System |
| Copilot NBA: "Call customer" | One-click call from CRM | Sales Executive |
| Copilot: approval probability < 30% | Flag for Branch Manager review | System |
| AI session escalated | Create ticket; attach transcript | Support / Sales |

---

# 14. CUSTOMER SUPPORT & COMPLAINT OPERATING MODEL

## 14.1 Support Ticket Workflow

| State | Description | SLA |
|-------|-------------|-----|
| `OPEN` | Ticket created | — |
| `ASSIGNED` | Agent assigned | 4 hours (P3); 1 hour (P1) |
| `IN_PROGRESS` | Agent working | Per priority |
| `PENDING_CUSTOMER` | Awaiting customer response | Paused SLA |
| `RESOLVED` | Solution provided | — |
| `CLOSED` | Customer confirmed or auto-close 48h | — |
| `ESCALATED` | Escalated to L2/manager | Per escalation matrix |

## 14.2 Ticket Categories & Routing

| Category | Route To | SLA (first response) |
|----------|----------|---------------------|
| General inquiry | Support L1 | 4 hours |
| Application status | Support L1 (with app lookup) | 2 hours |
| Document issue | Support L1 → Sales if needed | 4 hours |
| Complaint | Support L2 + Branch Manager | 1 hour |
| Technical (app bug) | Support L2 → DevOps | 4 hours |
| Compliance | Compliance Analyst | 24 hours |
| Fraud | Fraud Analyst | 1 hour |

## 14.3 Complaint Resolution Workflow

| Step | Actor | Action | SLA |
|------|-------|--------|-----|
| 1 | Customer | Submit complaint (app, phone, email) | — |
| 2 | Support L1 | Acknowledge; categorize | 1 hour |
| 3 | Support L2 / Branch Manager | Investigate; propose resolution | 24 hours |
| 4 | Branch Manager | Resolve or escalate to Regional | 48 hours |
| 5 | Compliance | Review if regulatory nature | 72 hours |
| 6 | System | Record resolution; CSAT survey | On close |

---

# 15. ESCALATION OPERATING FRAMEWORK

## 15.1 SLA-Based Auto-Escalation

| Trigger | Escalate To | Notification |
|---------|-------------|-------------|
| A+ lead uncontacted > 1 hour | Branch Manager | Push + SMS |
| A lead uncontacted > 4 hours | Branch Manager | Push + email |
| S01→S02 breach > 48 hours | Branch Manager | CRM alert |
| S03 doc collection > 7 days | Sales Executive manager | CRM alert |
| S06 lender SLA + 2 days | Operations Head | Dashboard + email |
| Support P1 unresolved > 1 hour | Support Lead | Phone |
| Commission dispute unresolved > 10 days | Finance Head | Email |
| Fraud flag on lead/application | Compliance Manager | Immediate SMS |

## 15.2 Manual Escalation Paths

| Scenario | Escalate To | Authority |
|----------|-------------|-----------|
| Credit exception > executive authority | Branch Manager → Regional | Per §10.2 matrix |
| Customer complaint | Branch Manager → Regional → CEO (if unresolved 7 days) | Resolution |
| Partner dispute | Branch Manager → Finance Head | Commission adjustment |
| AI unable to resolve | Sales Executive / Support L1 | Per AI Escalation Framework |
| VIP lead (A+, > ₹1 Cr) | Branch Manager + Senior Sales | Priority handling |
| Regulatory query | Compliance Manager | Formal response |

## 15.3 Escalation Data Package

Every escalation includes:

| Field | Source |
|-------|--------|
| Entity type + ID | Lead / Application / Ticket |
| Current stage/status | LOS / LMS state |
| SLA breached (duration) | SLA engine |
| Assigned actor | Assignment record |
| AI conversation summary (if any) | AI session |
| Recommended next action | Copilot NBA (if available) |
| Customer contact history | Lead activities |

---

# 16. CROSS-SELL, RENEWAL & PORTFOLIO OPERATING MODEL

## 16.1 Portfolio Handoff (S09)

| Step | Actor | Action |
|------|-------|--------|
| 1 | System | On S08→S09: assign RM based on branch/customer segment |
| 2 | System | Generate Customer 360 summary for RM |
| 3 | RM | Welcome call within 7 days of disbursement |
| 4 | RM | Identify cross-sell opportunities from portfolio |
| 5 | AI Advisor | Proactive cross-sell suggestions in customer app |

## 16.2 Cross-Sell Triggers

| Trigger | Product Suggested | Actor |
|---------|-------------------|-------|
| HL disbursed | Home insurance, life insurance | RM / AI Advisor |
| BL disbursed | Working capital top-up (12 months) | RM |
| AL disbursed | Vehicle insurance, new car upgrade (3–5 yr) | RM |
| LAP disbursed | Top-up (12+ months post) | RM |
| CIBIL improved | Better rate BT offer | AI Advisor |
| Customer engagement drop | Re-engagement campaign | Marketing |

## 16.3 Renewal & Top-Up Workflow (Phase 2)

| Step | Actor | Action |
|------|-------|--------|
| 1 | System | Identify renewal candidates (12+ months post-disbursement) |
| 2 | AI Renewal Assistant | Generate outreach recommendation |
| 3 | RM | Review and approve outreach |
| 4 | System | Send personalized offer (app + WhatsApp) |
| 5 | Customer | Express interest → new lead created (linked to original) |
| 6 | Standard LMS → LOS flow | From Section 5 and 8 |

---

# 17. COMPLIANCE OPERATING CONTROLS

## 17.1 Consent Gates

| Action | Consent Required | Capture Point |
|--------|-----------------|---------------|
| Bureau (CIBIL) pull | Credit check consent | Application S02 |
| AI profile use | AI advisory consent | First AI session |
| Marketing outreach | Marketing consent | Registration / lead capture |
| Document storage | Data processing consent | KYC upload |
| WhatsApp messaging | Communication consent | OTP verification |
| Call recording (voice AI) | Recording consent | Voice session start |

## 17.2 Regulatory Workflow Controls

| Control | Implementation |
|---------|----------------|
| Fair practice | No guaranteed approval language in any workflow communication |
| KYC before processing | KYC incomplete → block S04 transition |
| SoD enforcement | Sales cannot approve own commission; Credit cannot disburse |
| Audit trail | Every stage transition, document view, commission change logged |
| Data retention | 8-year application/document retention per regulatory norms |
| Right to deletion | Customer deletion request → anonymize after regulatory hold period |
| Fraud hold | Compliance flag → freeze all workflows on entity |

## 17.3 Compliance Review Triggers

| Trigger | Reviewer | Action |
|---------|----------|--------|
| Fraud flag | Fraud Analyst | Investigate; freeze or clear |
| Complaint (regulatory) | Compliance Manager | Formal response within 21 days |
| Unusual commission pattern | Compliance Analyst | Review partner activity |
| PII access anomaly | Security | Access review |
| AI response audit (quarterly) | Compliance + AI Lead | Sample review of AI outputs |

---

# 18. MANAGEMENT & GOVERNANCE OPERATING MODEL

## 18.1 Management Cadence

| Cadence | Meeting | Participants | Data Source |
|---------|---------|-------------|-------------|
| Daily | Operations standup | Ops Head, Ops Execs, Branch Mgrs | SLA dashboard |
| Daily | Sales huddle | Sales Head, Branch Mgrs | Lead pipeline, A+ uncontacted |
| Weekly | Branch review | Regional Mgr, Branch Mgrs | Branch KPIs |
| Weekly | Commission review | Finance Head, Finance | Pending approvals |
| Monthly | Business review | CEO, Directors, Heads | Management dashboards |
| Monthly | Compliance review | Compliance Mgr, CTO | Audit logs, complaints |
| Quarterly | Board pack | CEO, Finance | Board pack API + narrative |

## 18.2 Decision Authority Matrix

| Decision | Authority | Escalation |
|----------|-----------|------------|
| Lead reassignment | Branch Manager | Regional Manager |
| Credit exception (minor) | Credit Executive | Branch Manager |
| Credit exception (major) | Regional Manager | Business Head |
| Commission rule change | Finance Head | CEO |
| Partner suspension | Branch Manager + Compliance | Management (blacklist) |
| Product launch | Business Head | CEO |
| Workflow config change | Operations Head + Admin | CTO |
| AI prompt change | AI Lead + Compliance | CTO |
| Production deployment | CTO / DevOps | — |

---

# 19. WORKFLOW ENGINE CONFIGURATION MODEL

*Resolves Enterprise Audit CONFLICT-05 — how products parameterize workflows.*

## 19.1 Configuration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ WORKFLOW ENGINE CONFIGURATION                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  workflow_definitions (per product variant)                  │
│  ├── stageSequence: [S01, S02, ..., S09]                    │
│  ├── stageOverrides: { S03: { slaDays: 7 } }               │
│  ├── mandatoryDocuments: [PAN, AADHAAR, ITR, ...]           │
│  ├── eligibilityRules: ref → eligibility_rules table        │
│  ├── approvalGates: { S04: { role: CREDIT_EXEC } }        │
│  └── reworkRules: { S04→S03: { auto: true } }              │
│                                                              │
│  lms_assignment_rules                                        │
│  ├── rules: [{ priority, condition, assignTo }]             │
│  └── effectiveFrom / effectiveTo                             │
│                                                              │
│  lms_scoring_config                                          │
│  ├── factorWeights: { income: 0.15, cibil: 0.12, ... }      │
│  ├── gradeThresholds: { A+: 85, A: 70, B: 50, C: 30 }      │
│  ├── aiWeight: 0.30                                          │
│  └── gateRules: [{ condition, capScore }]                    │
│                                                              │
│  Stored in: dedicated tables OR system_settings (JSON)       │
│  Managed via: Admin Console → Settings → Workflow Config     │
│  API: PUT /admin/workflows, PUT /crm/lms/assignment-rules   │
└─────────────────────────────────────────────────────────────┘
```

## 19.2 Product Workflow Parameterization Example

| Parameter | HL-01 (Salaried) | BL-01 (WC) | AL-01 (New) |
|-----------|------------------|------------|-------------|
| S03 SLA (days) | 5 | 7 | 3 |
| Mandatory docs | PAN, Aadhaar, ITR, salary slips, property docs | PAN, Aadhaar, ITR, GST, bank stmt | PAN, Aadhaar, salary, quotation |
| S04 credit gate | Credit Executive | Credit Executive | Auto (if eligibility pass) |
| FOIR max | 55% | 50% (DSCR for BL) | 50% |
| LTV max | 80% | N/A | 85% |
| Min CIBIL | 650 | 700 | 650 |
| Co-applicant | Optional | N/A | Optional |

## 19.3 Workflow Versioning

| Rule | Detail |
|------|--------|
| Version on change | Every config change creates new version |
| Effective date | Changes apply to new applications only (not in-flight) |
| Audit | Who changed, when, what (old vs new JSON diff) |
| Rollback | Admin can revert to previous version |
| Approval | Workflow config changes require Operations Head + Admin |

---

# 20. OPERATING KPIs

## 20.1 LMS KPIs

| KPI | Formula | Target | Review |
|-----|---------|--------|--------|
| Lead volume | Count new leads | Per business plan | Daily |
| A+ lead % | A+ leads / Total leads | ≥ 15% | Weekly |
| First contact SLA | Contacted within SLA / Total | ≥ 95% | Daily |
| Lead-to-application | Applications / Qualified leads | ≥ 30% | Weekly |
| Lead-to-disbursement | Disbursements / Leads | ≥ 8% | Monthly |
| Nurture conversion | Nurture → Converted / Nurture total | ≥ 10% | Monthly |
| Duplicate rate | Duplicates / Total leads | < 5% | Weekly |
| AI scoring lift | AI-assisted conversion / Non-AI | +15% | Monthly |

## 20.2 LOS KPIs

| KPI | Formula | Target | Review |
|-----|---------|--------|--------|
| Stage SLA compliance | On-time transitions / Total | ≥ 90% | Weekly |
| S03 doc collection TAT | Avg days in S03 | ≤ 5 days | Weekly |
| S04 eligibility pass rate | Passed / Checked | Per product benchmark | Weekly |
| S06 lender TAT | Avg days in S06 | Per lender SLA | Weekly |
| S06→S07 conversion | Sanctioned / Submitted to lender | ≥ 60% | Monthly |
| S07→S08 conversion | Disbursed / Sanctioned | ≥ 85% | Monthly |
| End-to-end TAT | Lead created → Disbursement | ≤ 28 days (HL) | Monthly |
| Rejection rate | Rejected / Total applications | < 25% | Monthly |
| Rework rate | Rework events / Applications | < 15% | Monthly |

## 20.3 Partner & Revenue KPIs

| KPI | Formula | Target | Review |
|-----|---------|--------|--------|
| DSA active partners | Partners with ≥ 1 lead/month | Growth target | Monthly |
| DSA disbursement/partner | Total disbursed / Active DSAs | Per tier target | Monthly |
| Commission payout TAT | Paid date - Disbursement date | ≤ 30 days | Monthly |
| Commission dispute rate | Disputes / Total commissions | < 2% | Monthly |
| Referral conversion | Disbursed referrals / Total referrals | ≥ 5% | Monthly |
| Gross commission revenue | Sum commissions | Per business plan | Monthly |
| Clawback rate | Clawed back / Paid | < 3% | Monthly |

## 20.4 AI & Support KPIs

| KPI | Formula | Target | Review |
|-----|---------|--------|--------|
| AI session volume | Sessions/day | Growth | Daily |
| AI escalation rate | Escalated / Total sessions | < 10% | Weekly |
| AI satisfaction | Thumbs up / Total feedback | ≥ 80% | Weekly |
| Support auto-resolution | AI-resolved / Total support queries | ≥ 60% | Weekly |
| Complaint resolution TAT | Avg hours to resolve | ≤ 48 hours | Weekly |
| CSAT | Customer satisfaction score | ≥ 4.0/5.0 | Monthly |

---

# 21. RACI MATRIX (KEY WORKFLOWS)

| Workflow Step | Customer | DSA | Sales Exec | Credit Exec | Ops Exec | Branch Mgr | Finance | System | AI |
|---------------|----------|-----|------------|-------------|----------|------------|---------|--------|-----|
| Lead capture | C | R | I | — | — | I | — | R | C |
| Lead scoring | — | — | I | — | — | — | — | R | R |
| Lead assignment | — | — | I | — | — | A | — | R | — |
| First contact | C | C | R/A | — | — | I | — | I | C |
| Application create | C | C | R | — | — | — | — | R | C |
| Document upload | R | R | C | — | I | — | — | R | C |
| Eligibility check | — | — | I | R | — | — | — | R | C |
| Credit exception | — | — | C | R | — | A | — | — | C |
| Bank login | — | — | — | I | R | — | — | R | — |
| Lender tracking | I | I | C | C | R | I | — | R | — |
| Sanction acceptance | R | — | C | — | R | — | — | R | — |
| Disbursement record | I | I | I | — | R | — | — | R | — |
| Commission calc | — | I | — | — | — | — | I | R | — |
| Commission approve | — | — | — | — | — | — | R/A | R | — |
| Portfolio handoff | I | — | C | — | — | I | — | R | — |
| Cross-sell | C | — | C | — | — | I | — | I | R |
| Support ticket | R | C | C | — | — | A | — | R | C |
| Complaint | R | — | C | — | — | R/A | — | R | — |

*R = Responsible, A = Accountable, C = Consulted, I = Informed*

---

# 22. FUTURE PRODUCT WORKFLOW EXTENSION

## 22.1 Extension Principle

New products (insurance, credit cards, MF, FD, gold loan, wealth) **do not require new workflow engine architecture**. Each product adds:

1. New `workflow_definitions` entry (may simplify stages — e.g., credit card = 3 stages)
2. New document checklist template
3. New eligibility rules
4. New commission rules
5. New CRM screens (per Screen Planning §41)

## 22.2 Future Product Workflow Summary

| Product | Workflow Type | Stages | Differs From Loan LOS |
|---------|--------------|--------|----------------------|
| Insurance | Policy issuance | INS-S01 to S06 | Premium, not disbursement |
| Credit Card | Card application | CC-S01 to S03 | Simplified (3 stages) |
| Mutual Funds | Order flow | MF-O01 to O04 | Order, not LOS |
| Fixed Deposit | Booking flow | FD-B01 to B03 | Rate lock, booking |
| Gold Loan | LOS + valuation | GL-S01 to S10 | Extra valuation stage |
| Wealth Advisory | Advisory flow | WM-A01 to A05 | Portfolio, not loan |
| Video KYC | Verification sub-flow | VKYC-01 to 03 | Plugs into S03 |
| eSign | Signing sub-flow | ESIGN-01 to 02 | Plugs into S07 |

---

# APPENDIX A: WORKFLOW-ROLE PARTICIPATION MATRIX

*Consolidated from User Types Appendix B — authoritative reference.*

| Workflow Stage | Primary Actor | Supporting Actors | Approver |
|----------------|--------------|-------------------|----------|
| Lead capture | Customer / DSA / Referral | System (auto) | — |
| Lead scoring | System | AI Scoring Engine | — |
| Lead assignment | System | Branch Manager (override) | — |
| Lead qualification | Sales Executive | AI Copilot | — |
| Application creation | Sales Executive / Customer | AI Advisor | — |
| Document collection | Sales Executive / Customer / DSA | System (reminders), Document AI | — |
| Eligibility check | System | Credit Executive (exceptions) | — |
| Credit exception | Credit Executive | Branch Manager | Branch Manager / Regional |
| Lender submission | Operations Executive | — | — |
| Credit review (lender) | Lender | Credit Executive (support) | Lender |
| Sanction processing | Operations Executive | Customer (acceptance) | — |
| Disbursement recording | Operations Executive | System (commission trigger) | — |
| Commission calculation | System | Finance Head (approval) | Finance Head |
| Commission payout | System / Finance | DSA (acknowledge) | Finance Head |
| Customer handoff to RM | System | Sales Executive | — |
| Cross-sell outreach | RM | AI Advisor | — |
| Support ticket resolution | Support Agent | Support Lead (escalation) | Support Lead |
| Complaint resolution | Support Agent | Branch Manager | Branch Manager |
| Fraud investigation | Fraud Analyst | Compliance Manager | Compliance Manager |
| Partner onboarding | DSA / Referral | Branch Manager / Admin | Branch Manager |
| Partner suspension | Compliance / Branch Manager | Management (blacklist) | Management |
| Campaign launch | Admin / Marketing | Branch Manager | Business Head |
| Product launch | Admin | Management | Business Head |

---

# APPENDIX B: SLA MASTER TABLE

| Domain | SLA Name | Target | Escalation | Target Role |
|--------|----------|--------|------------|-------------|
| LMS | A+ first contact | 1 hour | 1 hour | Branch Manager |
| LMS | A first contact | 4 hours | 4 hours | Branch Manager |
| LMS | B first contact | 24 hours | 48 hours | Sales Head |
| LMS | C first contact | 48 hours | 72 hours | Sales Head |
| LMS | Lead assignment | 1 min | 5 min | System alert |
| LMS | Lead reassignment | 1 hour | 2 hours | Branch Manager |
| LOS | S01→S02 | 24 hours | 48 hours | Branch Manager |
| LOS | S02→S03 start | 48 hours | 72 hours | Branch Manager |
| LOS | S03→S04 complete | 5 days | 7 days | Sales manager |
| LOS | S04→S05 | 24 hours | 48 hours | Ops Head |
| LOS | S05→S06 | 48 hours | 72 hours | Ops Executive |
| LOS | S06→S07 | Lender SLA | SLA+2d | Ops Head |
| LOS | S07→S08 | 3 days | 5 days | Ops Head |
| LOS | S08→S09 | 24 hours | Auto | — |
| Commission | Dispute resolution | 10 days | 15 days | Finance Head |
| Commission | Payout after approval | 2 days | 5 days | Finance Head |
| Support | P1 first response | 1 hour | 2 hours | Support Lead |
| Support | P2 first response | 4 hours | 8 hours | Support Lead |
| Support | Complaint resolution | 48 hours | 72 hours | Branch Manager |
| Partner | Onboarding approval | 3 days | 7 days | Branch Manager |
| Portfolio | RM welcome call | 7 days | 14 days | Branch Manager |

---

# APPENDIX C: REJECTION & REWORK CODE REFERENCE

## Rejection Codes (Application)

| Code | Stage | Reason | Customer Notified |
|------|-------|--------|-------------------|
| AR-01 | S02 | Customer not interested | Yes |
| AR-02 | S02 | Unable to qualify | Yes |
| AR-03 | S04 | FOIR exceeds limit | Yes (with guidance) |
| AR-04 | S04 | CIBIL below minimum | Yes (with improvement tips) |
| AR-05 | S04 | LTV exceeds limit | Yes |
| AR-06 | S06 | Lender declined | Yes |
| AR-07 | S07 | Customer rejected terms | Yes |
| AR-08 | S08 | Disbursement failed | Yes |
| AR-09 | Any | Customer withdrawn | Yes |
| AR-10 | Any | Fraud detected | No (Compliance handles) |

## Rework Codes

| Code | From → To | Reason |
|------|-----------|--------|
| RW-01 | S04 → S03 | Document deficiency |
| RW-02 | S05 → S03 | Lender document query |
| RW-03 | S06 → S03 | Lender conditional (docs) |
| RW-04 | S07 → S06 | Terms renegotiation |
| RW-05 | S08 → S07 | Pre-disbursement condition |
| RW-06 | S08 → S03 | Legal/valuation issue |

---

# APPENDIX D: DOCUMENT APPROVAL

| Role | Name | Date | Signature |
|------|------|------|-----------|
| CEO | | | |
| Business Head | | | |
| Operations Head | | | |
| Compliance Head | | | |
| Product Owner | | | |

---

# APPENDIX E: REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | KuberOne Architecture Team | Initial release; resolves Audit P1-1 and CONFLICT-03, -04, -05 |

---

# APPENDIX F: RELATED DOCUMENT INDEX

| Document | Relationship |
|----------|-------------|
| [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md) | Product rules, eligibility, lender routing (§6, §10) |
| [KUBERONE_USER_TYPES_AND_ROLES.md](./KUBERONE_USER_TYPES_AND_ROLES.md) | Personas, role journeys (deduplicated — workflows here) |
| [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) | Permissions enforce workflow access |
| [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md) | AI scoring (§6.4), Advisor journey, escalation |
| [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md) | LMS §8, LOS §9, Commission §14 implementation |
| [KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md](./KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md) | CRM screens for workflow execution |
| [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md) | APIs referenced in §5.3 canonical mapping |
| [KUBERONE_ENTERPRISE_ARCHITECTURE_AUDIT_REPORT.md](./KUBERONE_ENTERPRISE_ARCHITECTURE_AUDIT_REPORT.md) | Audit that identified this document as P1-1 |

---

*End of Document — KuberOne Business Workflow & Operating Model v1.0*
