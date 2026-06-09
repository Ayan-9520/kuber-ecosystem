# KuberOne
## Lead Grading Canonical Specification (Document A3)

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise Lead Management Specification — Canonical Grading Model  
**Document ID:** A3  
**Classification:** Board-Ready | Operations-Ready | Engineering-Ready  
**Version:** 1.0  
**Date:** June 2026  
**Status:** Authoritative — Resolves Enterprise Audit CONFLICT-03  
**Related Documents:**
- [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md) — §6 (authoritative source)
- [KUBERONE_WORKFLOW_LMS_CONFIGURATION_SPECIFICATION.md](./KUBERONE_WORKFLOW_LMS_CONFIGURATION_SPECIFICATION.md) — Document A4 (config persistence)
- [KUBERONE_ENTITY_TABLE_CANONICAL_REGISTRY.md](./KUBERONE_ENTITY_TABLE_CANONICAL_REGISTRY.md) — `lead_scores`, `lms_scoring_config`
- [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md) — AI scoring integration
- [KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md](./KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md) — CRM lead scoring UI
- [KUBERONE_USER_FLOWS_AND_JOURNEY_MAPS.md](./KUBERONE_USER_FLOWS_AND_JOURNEY_MAPS.md) — Journey SLAs and grade aliases

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Canonical lead grading taxonomy, scoring model, gates, routing, escalation, AI/CRM/analytics usage |
| **Audience** | Product, Operations, Sales Leadership, Engineering, Data, Compliance, Board |
| **Authority** | This document is the **single canonical reference** for lead grades across all channels, UIs, APIs, reports, and notifications |
| **Supersedes** | Hot/Warm/Cold-only taxonomies in legacy Loan Products references; AI RAG grade definitions where divergent |
| **Configuration Surface** | Weights and thresholds managed via `lms_scoring_config` (see Document A4) |

---

# Executive Summary

KuberOne qualifies every inbound lead using a **unified five-grade model** — **A+**, **A**, **B**, **C**, and **Rejected** — with human-readable display aliases **Hot**, **Warm**, **Moderate**, **Cold**, and **Rejected** respectively. This resolves prior documentation conflicts (Enterprise Audit CONFLICT-03) by establishing one grade code for systems and one alias layer for sales-facing language.

Scoring combines **70% deterministic rule factors** (15 weighted qualification signals) with **30% AI assessment** (engagement, intent, session behavior). Hard **gate rules** can cap or force grades regardless of raw score. Grades drive **first-contact SLAs**, **assignment priority**, **escalation triggers**, and **conversion probability estimates** used in CRM Copilot and management analytics.

**Key operating outcomes:**

| Outcome | Mechanism |
|---------|-----------|
| Revenue protection | A+ leads contacted within 1 hour; auto-escalation on breach |
| Sales efficiency | Grade-based queue ordering; rejected leads excluded from active outreach |
| Regulatory safety | Fraud and compliance gates force Rejected; audit trail on every score change |
| Configurability | Factor weights, thresholds, and gates versioned in `lms_scoring_config` without code deploy |
| AI augmentation | AI contributes 30% of score; human sales retains all contact and conversion decisions |

This specification aligns **exactly** with [Business Workflow §6](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md) and extends it with enterprise-grade operational detail for CRM, analytics, and governance teams.

---

# 1. Canonical Grade Taxonomy

## 1.1 Grade-to-Alias Unification

All systems **MUST** persist and transmit the **grade code**. Display aliases are **presentation-only** and MUST NOT be used as primary keys, API enums, or database values.

| Grade Code (Canonical) | Display Alias | Score Range | Business Label | First Contact SLA | Priority | Active Outreach |
|------------------------|---------------|-------------|----------------|-------------------|----------|-----------------|
| **A+** | Hot | 85–100 | High conversion — immediate action | **1 hour** | P1 | Yes — immediate |
| **A** | Warm | 70–84 | Good potential — priority | **4 hours** | P2 | Yes — priority |
| **B** | Moderate | 50–69 | Needs nurturing — standard | **24 hours** | P3 | Yes — standard |
| **C** | Cold | 30–49 | Low priority — campaign nurture | **48 hours** | P4 | Yes — nurture track |
| **Rejected** | Rejected | 0–29 | Unqualified — no active outreach | No contact SLA | — | No (unless nurture-eligible per reason code) |

### 1.1.1 Mapping Resolution (CONFLICT-03)

| Legacy Reference | Resolution |
|------------------|------------|
| Loan Products "Hot / Warm / Cold" | Mapped to A+ / A / B+C respectively; **A+–C/Rejected is canonical** |
| AI RAG "A+/A/B/C" | Aligned — same grade codes |
| CRM UI "Hot/Warm/Moderate/Cold" labels | Display aliases only; badge shows grade code in tooltip |
| Partner reports "quality tier" | Translate: Hot=A+, Warm=A, Moderate=B, Cold=C |

### 1.1.2 UI Display Convention

| Surface | Primary Display | Secondary Display |
|---------|-----------------|-------------------|
| CRM Lead List | Grade badge (A+, A, B, C, Rejected) | Alias in parentheses: `A+ (Hot)` |
| Mobile DSA App | Alias for readability | Grade code in detail view |
| Management Dashboard | Grade code in tables | Alias in chart legends |
| Customer-facing | **Never display grades** | Status labels only (e.g., "Under Review") |
| Notifications to Sales | Grade + alias: `New A+ (Hot) lead assigned` | SLA countdown included |

## 1.2 Grade Lifecycle States

| State | Description | Grade Behavior |
|-------|-------------|----------------|
| `NEW` | Lead captured; scoring pending | Grade assigned within 60 seconds |
| `SCORED` | Grade assigned | Grade locked until rescore trigger |
| `ASSIGNED` | Owner assigned post-score | Grade determines queue priority |
| `CONTACTED` | First contact logged | SLA clock stops |
| `QUALIFIED` | Sales confirmed eligibility | Grade retained for analytics |
| `NURTURE` | Low-touch campaign track | Typically B/C; may include Rejected with nurture flag |
| `DUPLICATE` | Duplicate detected | **No scoring** — excluded from grade metrics |
| `REJECTED` | Terminal unqualified | Grade = Rejected; reason code required |
| `CONVERTED` | Application created | Final grade snapshot retained |

## 1.3 Grade Change Rules

| Trigger | Rescore Behavior |
|---------|------------------|
| Material profile update (income, CIBIL, product) | Immediate rescore |
| Document upload ≥ threshold | Rescore within 5 minutes |
| AI session completed | Rescore on session close |
| Manual override by Branch Manager | Override logged; original score retained in history |
| Re-activated nurture lead | Full rescore after 7-day cooldown |
| Fraud flag raised | Force Rejected; block rescore until Compliance clears |

---

# 2. Scoring Model Architecture

## 2.1 Combined Score Formula

```
combinedScore = (ruleScore × ruleWeight) + (aiScore × aiWeight)

Default weights:
  ruleWeight = 0.70 (70%)
  aiWeight   = 0.30 (30%)

Where:
  ruleScore = weighted sum of 15 qualification factors, normalized 0–100
  aiScore   = AI assessment of engagement, intent, profile quality, 0–100
```

Both `ruleWeight` and `aiWeight` are configurable per product family via `lms_scoring_config`. Weights MUST sum to 1.0. Grade assignment uses `combinedScore` after gate rules are applied.

## 2.2 Scoring Pipeline

| Step | Actor | Action | SLA |
|------|-------|--------|-----|
| 1 | Channel / System | Lead created or updated | — |
| 2 | Scoring Engine | Load active `lms_scoring_config` for product family | < 100 ms |
| 3 | Scoring Engine | Evaluate 15 rule factors → `ruleScore` | < 500 ms |
| 4 | AI Scoring Service | Compute `aiScore` from session + profile signals | < 3 s (async acceptable) |
| 5 | Scoring Engine | Apply gate rules (caps, force-reject) | < 50 ms |
| 6 | Scoring Engine | Compute `combinedScore`; map to grade | < 50 ms |
| 7 | System | Persist `lead_scores` record + grade | < 200 ms |
| 8 | System | Trigger assignment, notifications, analytics | < 1 min total E2E |

## 2.3 Score Persistence

| Field | Type | Description |
|-------|------|-------------|
| `leadId` | UUID | Lead reference |
| `ruleScore` | Decimal (0–100) | Pre-gate rule score |
| `aiScore` | Decimal (0–100) | AI component |
| `combinedScore` | Decimal (0–100) | Post-weight, pre-gate |
| `finalScore` | Decimal (0–100) | After gates; used for grade |
| `grade` | Enum | A+, A, B, C, Rejected |
| `gradeAlias` | String | Hot, Warm, Moderate, Cold, Rejected |
| `factorBreakdown` | JSON | Per-factor score and weight |
| `aiFactorBreakdown` | JSON | Per AI signal score |
| `gatesApplied` | JSON Array | Gate rules that modified outcome |
| `conversionProbability` | Decimal (0–1) | Estimated disbursement probability |
| `configVersion` | Integer | `lms_scoring_config.version` used |
| `scoredAt` | Timestamp | Score timestamp |
| `scoredBy` | Enum | SYSTEM, AI, MANUAL_OVERRIDE |

---

# 3. Rule Scoring Factors (70% Weight — 15 Factors)

Each factor contributes to `ruleScore` as: `factorScore × factorWeight`, where `factorScore` is 0–100 per factor's scoring rubric. Sum of factor weights = 100% (1.0).

| # | Factor Code | Factor Name | Default Weight | Full Marks (100) When | Zero Marks (0) When | Partial Scoring |
|---|-------------|-------------|----------------|----------------------|---------------------|-----------------|
| 1 | `INCOME_ELIGIBILITY` | Income eligibility | **15%** | Declared income ≥ product minimum | Unknown or below 50% of minimum | Linear scale 50%–100% of minimum |
| 2 | `CIBIL_SCORE` | CIBIL score | **12%** | CIBIL ≥ 700 | CIBIL < 650 or unknown | 650–699: proportional |
| 3 | `PRODUCT_NEED_MATCH` | Product-need match | **10%** | Exact product + amount + purpose stated | Vague/exploratory inquiry | Alternate product fit: 40–70 |
| 4 | `TIMELINE_URGENCY` | Timeline urgency | **10%** | Need within 30 days | Need beyond 90 days | 31–90 days: linear decay |
| 5 | `DOCUMENT_READINESS` | Document readiness | **8%** | ≥ 50% mandatory docs available | None uploaded | Per-doc proportional |
| 6 | `COLLATERAL_IDENTIFIED` | Collateral identified | **10%** | Property/vehicle confirmed with value | Not identified (HL/LAP/AL) | N/A products: factor excluded, weight redistributed |
| 7 | `DOWN_PAYMENT_READINESS` | Down payment readiness | **8%** | Funds arranged or savings confirmed | Not arranged | Partial arrangement: 50 |
| 8 | `EMPLOYMENT_STABILITY` | Employment/business stability | **7%** | ≥ 3 years in current role/business | < 1 year | 1–3 years: proportional |
| 9 | `FOIR_HEADROOM` | FOIR headroom | **7%** | FOIR < 40% | FOIR > 55% | 40–55%: linear penalty |
| 10 | `LEAD_SOURCE_QUALITY` | Lead source quality | **5%** | DSA/referral (trusted source) | Unknown/cold campaign | Web/direct: 60; campaign: 40 |
| 11 | `ENGAGEMENT_LEVEL` | Engagement level | **5%** | Multi-touch engaged (≥ 3 interactions) | Single touch only | 2 touches: 50 |
| 12 | `GEOGRAPHIC_ELIGIBILITY` | Geographic eligibility | **3%** | Approved serviceable pincode | Restricted/non-serviceable area | Tier-2 partial service: 30 |
| 13 | `EXISTING_CUSTOMER` | Existing customer | **3%** | Repeat customer with good history | New unknown customer | Prior lead only: 50 |
| 14 | `CO_APPLICANT_AVAILABILITY` | Co-applicant availability | **3%** | Co-applicant ready (when required) | Needed but unavailable | Optional co-applicant: N/A excluded |
| 15 | `PROFILE_COMPLETENESS` | Profile completeness | **2%** | ≥ 80% required fields filled | < 40% filled | 40–79%: proportional |

### 3.1 Product-Specific Factor Exclusions

| Product Family | Excluded Factors | Weight Redistribution |
|----------------|------------------|----------------------|
| Business Loan (BL) | Collateral identified, Down payment | Split evenly across income, FOIR, employment |
| Personal Loan (PL) | Collateral identified | Split to income, CIBIL |
| Auto Loan (AL) | — | All factors apply |
| Home Loan (HL) / LAP | — | All factors apply |

### 3.2 Bonus Rules (Applied to ruleScore Before Weighting)

| Bonus Rule | Condition | Effect |
|------------|-----------|--------|
| DSA complete data bonus | DSA-sourced lead with ≥ 90% profile completeness | +10 to `ruleScore` (cap 100) |
| Referral trust bonus | Verified referral code from active referrer | +5 to `ruleScore` (cap 100) |
| AI pre-check pass bonus | Customer passed AI eligibility pre-check in session | +5 to `ruleScore` (cap 100) |

---

# 4. AI Scoring Factors (30% Weight)

AI score is computed independently (0–100) then weighted at 30% in the combined formula. AI **cannot** override gate rules or force a grade above gate caps.

| # | Signal Code | Signal Name | Weight Within AI | Scoring Rubric |
|---|-------------|-------------|------------------|----------------|
| 1 | `AI_ENGAGEMENT_QUALITY` | AI Advisor engagement quality | **30%** | Depth of conversation, relevant questions asked, session duration 5–20 min optimal |
| 2 | `INTENT_CLARITY` | Intent clarity | **25%** | Specific product + amount + timeline stated in session |
| 3 | `RESPONSE_VELOCITY` | Response velocity | **20%** | Customer response time in AI chat (< 5 min = full; > 30 min = zero) |
| 4 | `ELIGIBILITY_PRECHECK` | Eligibility pre-check result | **15%** | Passed structured pre-check vs failed/partial |
| 5 | `SESSION_DOC_UPLOAD` | Document upload in session | **10%** | Customer uploaded ≥ 1 document during AI session |

### 4.1 AI Score Fallback

| Condition | Fallback Behavior |
|-----------|-------------------|
| No AI session | `aiScore` = 50 (neutral); flag `aiScoreEstimated: true` |
| AI service unavailable | `aiScore` = ruleScore × 0.5; retry async within 15 min |
| Customer opted out of AI | `aiScore` excluded; `ruleWeight` temporarily 1.0 |

### 4.2 AI Operating Constraints

| Rule | Detail |
|------|--------|
| No auto-contact | AI score triggers notifications only; sales executes contact |
| PII masking | AI prompts use masked identifiers per AI Security Architecture |
| Human override | Branch Manager may override grade; AI score retained in history |
| Feedback loop | Thumbs up/down on AI qualification captured for model tuning |

---

# 5. Scoring Gates (Business Rules)

Gates are evaluated **after** combined score calculation. The most restrictive gate wins.

## 5.1 Universal Gates

| Gate Code | Condition | Effect |
|-----------|-----------|--------|
| `GATE_INCOME_FLOOR` | Income < 50% of product minimum | Cap `finalScore` at 29 → **Rejected** |
| `GATE_PINCODE` | Non-serviceable pincode | Cap `finalScore` at 39 → **C** maximum |
| `GATE_AGE` | Age outside product range | Cap `finalScore` at 29 → **Rejected** |
| `GATE_FRAUD` | Active fraud flag | Force **Rejected**; Compliance review required |
| `GATE_DUPLICATE` | Same phone + product within 30 days | State = DUPLICATE; **no scoring** |
| `GATE_ACTIVE_APP` | Active application exists (same product) | Do not create new lead; link to existing |
| `GATE_NURTURE_COOLDOWN` | Re-activated nurture lead | 7-day cooldown before rescore allowed |

## 5.2 Product-Specific Auto-Reject Gates

| Product | Auto-Reject Condition | Reason Code |
|---------|----------------------|-------------|
| Home Loan (HL) | Age out of range | R-03 |
| Home Loan (HL) | CIBIL < 600 | R-02 |
| Home Loan (HL) | No income proof path | R-01 |
| LAP | No property ownership | R-05 |
| LAP | Title dispute flagged | R-05 |
| Business Loan (BL) | Business vintage < 1 year | R-01 |
| Business Loan (BL) | No business bank account | R-01 |
| Auto Loan (AL) | Income < ₹15,000/month | R-01 |
| Auto Loan (AL) | Vehicle not identified (for A+ grade only) | Cap at A, not Rejected |

## 5.3 Rejected Lead Reason Codes

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

# 6. Grade Thresholds

Grade assignment uses `finalScore` (post-gates):

| Grade | Minimum Score (Inclusive) | Maximum Score (Inclusive) |
|-------|---------------------------|---------------------------|
| A+ | 85 | 100 |
| A | 70 | 84 |
| B | 50 | 69 |
| C | 30 | 49 |
| Rejected | 0 | 29 |

Thresholds are configurable via `lms_scoring_config.grade_thresholds` but default values above are **canonical** unless Operations Head + Admin approve a change.

### 6.1 Threshold Change Governance

| Requirement | Detail |
|-------------|--------|
| Approval | Operations Head + Admin dual approval |
| Versioning | New `lms_scoring_config` version; applies to new leads only |
| Audit | Full diff logged in approval_logs |
| Rollback | Previous version restorable within 24 hours |
| A/B testing | Phase 2: shadow scoring without grade exposure |

---

# 7. Conversion Probability by Grade

Conversion probability estimates the likelihood that a lead at current grade **disburses** (reaches S08 Disbursement) within 90 days. Used for CRM Copilot prioritization, funnel forecasting, and partner quality scoring. Values are **baseline targets** calibrated quarterly from historical data.

## 7.1 Baseline Conversion Probability

| Grade | Alias | Lead → Application | Application → Disbursement | **Lead → Disbursement (Combined)** | Confidence Band |
|-------|-------|--------------------|-----------------------------|-----------------------------------|-----------------|
| **A+** | Hot | 55–65% | 45–55% | **25–35%** | High |
| **A** | Warm | 40–50% | 35–45% | **15–22%** | High |
| **B** | Moderate | 25–35% | 25–35% | **8–12%** | Medium |
| **C** | Cold | 10–18% | 20–30% | **3–5%** | Medium |
| **Rejected** | Rejected | < 5% | < 10% | **< 1%** | Low (nurture track only) |

### 7.1.1 Default Point Estimates (System Configuration)

| Grade | Default `conversionProbability` | Use Case |
|-------|--------------------------------|----------|
| A+ | 0.30 (30%) | Queue sorting, Copilot NBA |
| A | 0.18 (18%) | Priority dashboards |
| B | 0.10 (10%) | Nurture vs active balance |
| C | 0.04 (4%) | Campaign targeting |
| Rejected | 0.005 (0.5%) | Excluded from active pipeline value |

### 7.2 Probability Adjustment Factors

| Adjustment | Effect on Probability |
|------------|------------------------|
| DSA-sourced A+ with complete docs | +5 percentage points |
| Campaign-sourced C | −2 percentage points |
| Existing customer any grade | +8 percentage points |
| VIP (A+, amount > ₹1 Cr) | Use dedicated VIP model; floor 35% |
| Product mismatch (R-10 nurture) | Recalculate on alternate product |

### 7.3 Calibration Cadence

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Historical backtest vs actuals | Monthly | Data / Analytics |
| Threshold and probability update | Quarterly | Operations Head |
| Partner quality SLA (A+ % ) | Weekly | Branch Manager |
| Model drift alert | Automated weekly | AI Lead |

---

# 8. Routing Rules

Routing executes immediately after grade assignment. Priority-ordered rules from [Business Workflow §7.1](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md).

## 8.1 Assignment Rule Priority

| Priority | Rule Code | Condition | Assign To |
|----------|-----------|-----------|-----------|
| 1 | `PARTNER_AFFINITY` | Lead has `partnerId` (DSA) | Partner's mapped Sales Executive |
| 2 | `EXISTING_RELATIONSHIP` | Customer has assigned RM | RM (portfolio products) |
| 3 | `PRODUCT_SPECIALIST` | Product requires certification | Certified executive in branch |
| 4 | `GRADE_PRIORITY` | Grade = A+ | Senior executive or Branch Manager designated |
| 5 | `GEOGRAPHIC` | Customer pincode | Branch covering pincode |
| 6 | `LOAD_BALANCE` | No specific rule match | Round-robin within branch pool |
| 7 | `CAMPAIGN_OVERRIDE` | Campaign config specifies pool | Campaign target executives |

## 8.2 Grade-Modified Routing Behavior

| Grade | Routing Modifier |
|-------|------------------|
| A+ | Skip load-balance delay; assign within 60 seconds; prefer senior/certified |
| A | Standard priority queue; assign within 2 minutes |
| B | Standard pool; may batch assign every 15 minutes |
| C | Nurture pool or junior executive pool (branch config) |
| Rejected | No assignment; route to nurture automation if eligible |

## 8.3 VIP Routing Override

| Condition | Action |
|-----------|--------|
| A+ AND requested amount > ₹1 Cr | Branch Manager + Senior Sales dual notification |
| A+ AND existing HNI customer | Direct RM assignment bypass round-robin |

## 8.4 Assignment SLA

| Action | SLA | Escalation |
|--------|-----|------------|
| Auto-assignment after scoring | Immediate (< 1 min) | System alert if > 5 min |
| Manual reassignment request | 1 hour | Branch Manager |
| Unassigned lead in pool | 30 minutes | Branch Manager auto-notify |
| A+ lead uncontacted | 1 hour | Branch Manager |
| A lead uncontacted | 4 hours | Branch Manager |
| B lead uncontacted | 24 hours | Sales Head (weekly report) |

---

# 9. Escalation Rules

Escalations align with [Business Workflow §15](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md) and `lms_escalation_rules` configuration.

## 9.1 Grade-Based Auto-Escalation

| Trigger | Grade Context | Escalate To | Channels |
|---------|---------------|-------------|----------|
| Uncontacted > SLA | A+ | Branch Manager | Push + SMS |
| Uncontacted > SLA | A | Branch Manager | Push + email |
| Uncontacted > 48h | B | Sales Head | Weekly digest + CRM alert |
| Uncontacted > 72h | C | Sales Head | Weekly digest |
| Unassigned > 30 min | A+ or A | Branch Manager | Push |
| Fraud flag on scored lead | Any | Compliance Manager | Immediate SMS |
| Score override without reason | Any | Operations Head | Audit alert |

## 9.2 Manual Escalation Paths

| Scenario | Escalate To | Authority |
|----------|-------------|-----------|
| VIP lead (A+, > ₹1 Cr) | Branch Manager + Senior Sales | Priority handling |
| Repeated failed contact (5+) | Branch Manager | Reassign or nurture (R-09) |
| Grade dispute (partner) | Branch Manager → Regional | Resolution within 24h |
| AI unable to qualify | Sales Executive | Human qualification required |

## 9.3 Escalation Data Package

Every grade-related escalation MUST include:

| Field | Source |
|-------|--------|
| Lead ID + grade + alias | `lead_scores` |
| Final score + factor breakdown | `lead_scores.factorBreakdown` |
| Conversion probability | `lead_scores.conversionProbability` |
| SLA breached (duration) | SLA engine |
| Assigned executive | `lead_assignments` |
| AI session summary | AI session record |
| Recommended next action | Copilot NBA |
| Contact attempt history | Lead activities |

---

# 10. AI Usage in Lead Grading

## 10.1 AI Products and Roles

| AI Product | Grading Role | Human Oversight |
|------------|--------------|-----------------|
| **Lead Scoring AI** | 30% of combined score | Grade thresholds are rules-based |
| **AI Advisor** | Enriches profile; feeds engagement signals | Customer-initiated |
| **AI Copilot** | Surfaces score breakdown, NBA, conversion probability | Sales decides action |
| **Document AI** | Document readiness factor input | Ops reviews flagged items |

## 10.2 AI-Triggered Actions by Grade

| Event | Grade | Business Action | Actor |
|-------|-------|-----------------|-------|
| Lead scored | A+ | Push notification to assigned Sales Exec | System |
| Lead scored | A | Priority queue notification | System |
| Lead scored | Rejected (nurture eligible) | Schedule nurture campaign | Marketing automation |
| Eligibility pre-check completed | Any | "Start Application" CTA to customer | Customer |
| Copilot: conversion probability < 10% | B/C | Suggest nurture path | Sales Executive |
| AI session escalated | Any | Create ticket; attach transcript | Support / Sales |

## 10.3 AI Prohibitions

| Prohibition | Rationale |
|-------------|-----------|
| AI cannot auto-contact customer based on grade | RBI fair practice; human sales relationship |
| AI cannot override fraud gate | Compliance requirement |
| AI cannot assign leads | Assignment is rules engine + optional manager override |
| AI cannot delete or archive leads | Audit retention |

---

# 11. CRM Usage

## 11.1 CRM Surfaces by Grade

| CRM Feature | A+ / A Behavior | B / C Behavior | Rejected Behavior |
|-------------|-----------------|----------------|-------------------|
| Lead queue sort | Top of queue | Standard order | Hidden from active queue |
| SLA indicator | Red at 45 min (A+) | Yellow at 80% SLA | N/A |
| Score panel | Full breakdown + AI factors | Summary view | Reason code + nurture option |
| Copilot insights | NBA + conversion probability | Nurture suggestions | Alternate product suggestion |
| Bulk actions | Excluded from bulk reassign without BM approval | Included | Nurture campaign only |

## 11.2 CRM Role Permissions (Grading)

| Role | View Scores | Override Grade | Configure Weights |
|------|-------------|----------------|-------------------|
| Sales Executive | Assigned leads only | No | No |
| Branch Manager | Branch leads | Yes (with reason) | No |
| Sales Head | Regional aggregated | No | No |
| Admin | Organization | No | Yes (via settings) |
| Compliance | Audit view (masked where required) | Fraud flag only | No |
| Management | Aggregated grade distribution | No | No |

## 11.3 CRM Screen Requirements

| Screen | Grade-Related Elements |
|--------|------------------------|
| Lead List (CRM-LMS-01) | Grade badge, alias tooltip, SLA clock, sort by grade |
| Lead Detail (CRM-LMS-02) | Score gauge, 15-factor breakdown, AI score panel, grade history |
| Lead Scoring Config (CRM-SET-03) | Weight editors, threshold sliders, gate toggles |
| LMS Dashboard (CRM-LMS-DASH) | A+ % , grade funnel, SLA compliance by grade |
| Assignment Rules (CRM-SET-04) | Grade-based routing rules |

---

# 12. Analytics Usage

## 12.1 Grade Metrics (LMS KPIs)

| KPI | Formula | Target | Review |
|-----|---------|--------|--------|
| A+ lead % | A+ leads / Total scored leads | ≥ 15% | Weekly |
| Grade distribution | Count by A+–Rejected | Balanced funnel | Weekly |
| First contact SLA by grade | Contacted within SLA / Total per grade | ≥ 95% | Daily |
| Lead-to-application by grade | Applications / Leads per grade | A+ ≥ 55% | Weekly |
| Lead-to-disbursement by grade | Disbursements / Leads per grade | A+ ≥ 25% | Monthly |
| Conversion probability accuracy | Predicted vs actual (Brier score) | < 0.15 | Quarterly |
| Score override rate | Manual overrides / Total scores | < 2% | Monthly |
| Nurture conversion | Nurture → Converted / Nurture total | ≥ 10% | Monthly |

## 12.2 Analytics Dimensions

| Dimension | Grade Analytics Use |
|-----------|---------------------|
| Channel (App, DSA, Web, Campaign) | Source quality vs grade outcome |
| Product family | Grade distribution by HL, BL, AL, LAP, PL |
| Branch / Region | SLA compliance by grade |
| Partner (DSA) | A+ % partner quality (target ≥ 25–30%) |
| Campaign ID | Campaign ROI by grade mix |
| Time (daily/weekly/monthly) | Seasonal grade trends |

## 12.3 Reporting Artifacts

| Report | Audience | Grade Content |
|--------|----------|---------------|
| Daily LMS Pulse | Branch Manager | A+/A uncontacted count, SLA breaches |
| Weekly Grade Funnel | Sales Head | Conversion by grade, source quality |
| Monthly Partner Scorecard | Admin | Partner A+ % , rejection reasons |
| Quarterly Calibration | Operations + Data | Probability model accuracy |
| Board Dashboard | Management | Aggregated grade mix; no PII |

## 12.4 API Analytics Endpoints

| API ID | Endpoint | Grade Data Returned |
|--------|----------|---------------------|
| API-LMS-001 | GET /crm/lms/funnel | Funnel by grade stage |
| API-LMS-003 | GET /crm/lms/sla | SLA compliance by grade |
| API-LMS-007 | GET /crm/lms/conversion-rate | Conversion by grade |
| API-LMS-008 | POST /crm/lms/export | Grade-filtered export (RBAC scoped) |

---

# 13. Governance & Compliance

## 13.1 Configuration Change Authority

| Change Type | Approver |
|-------------|----------|
| Factor weight adjustment | Operations Head + Admin |
| Grade threshold change | Operations Head + Admin |
| Gate rule addition/removal | Operations Head + Compliance |
| AI weight change | AI Lead + Compliance |
| Conversion probability defaults | Operations Head |

## 13.2 Audit Requirements

| Event | Retention | Audit Level |
|-------|-----------|-------------|
| Score computed | 5 years | Standard |
| Grade override | 5 years | Enhanced |
| Gate triggered (fraud) | 10 years | Enhanced |
| Config version change | 10 years | Enhanced |
| PII accessed in score detail | 5 years | Enhanced |

## 13.3 Regulatory Alignment

| Regulation | Grading Relevance |
|------------|-------------------|
| DPDP | Consent before scoring; explainability on customer request |
| RBI Fair Practice | No discriminatory factors; transparent rejection reasons |
| KYC/AML | Fraud gate; Compliance review on R-06 |

---

# Appendix A: Grade Quick Reference Card

| Grade | Alias | Score | SLA | Priority | Conversion (Lead→Disbursement) |
|-------|-------|-------|-----|----------|-------------------------------|
| A+ | Hot | 85–100 | 1 hour | P1 | 25–35% |
| A | Warm | 70–84 | 4 hours | P2 | 15–22% |
| B | Moderate | 50–69 | 24 hours | P3 | 8–12% |
| C | Cold | 30–49 | 48 hours | P4 | 3–5% |
| Rejected | Rejected | 0–29 | — | — | < 1% |

---

# Appendix B: Factor Weight Summary Table

| # | Factor | Weight |
|---|--------|--------|
| 1 | Income eligibility | 15% |
| 2 | CIBIL score | 12% |
| 3 | Product-need match | 10% |
| 4 | Timeline urgency | 10% |
| 5 | Document readiness | 8% |
| 6 | Collateral identified | 10% |
| 7 | Down payment readiness | 8% |
| 8 | Employment/business stability | 7% |
| 9 | FOIR headroom | 7% |
| 10 | Lead source quality | 5% |
| 11 | Engagement level | 5% |
| 12 | Geographic eligibility | 3% |
| 13 | Existing customer | 3% |
| 14 | Co-applicant availability | 3% |
| 15 | Profile completeness | 2% |
| | **Total** | **100%** |

---

# Appendix C: AI Factor Weight Summary

| # | Signal | Weight (within AI) |
|---|--------|-------------------|
| 1 | AI Advisor engagement quality | 30% |
| 2 | Intent clarity | 25% |
| 3 | Response velocity | 20% |
| 4 | Eligibility pre-check result | 15% |
| 5 | Document upload in session | 10% |
| | **Total** | **100%** |

---

# Appendix D: Cross-Document Traceability

| Topic | Authoritative Doc | Section |
|-------|-------------------|---------|
| Grade definitions | Business Workflow | §6.1 |
| Scoring formula | Business Workflow | §6.2 |
| 15 rule factors | Business Workflow | §6.3 |
| AI factors | Business Workflow | §6.4 |
| Gates | Business Workflow | §6.5–6.7 |
| Assignment | Business Workflow | §7 |
| Escalation | Business Workflow | §15 |
| Config tables | Entity Registry | §5.4 |
| CRM UI | CRM Admin Panel | §6.7 |
| API IDs | API Catalog | LMS §158–166, 420 |

---

# Appendix E: Glossary

| Term | Definition |
|------|------------|
| **Grade Code** | Canonical system value: A+, A, B, C, Rejected |
| **Display Alias** | Human label: Hot, Warm, Moderate, Cold, Rejected |
| **ruleScore** | Deterministic 0–100 score from 15 factors |
| **aiScore** | AI 0–100 score from 5 signals |
| **combinedScore** | Weighted blend before gates |
| **finalScore** | Score after gates; determines grade |
| **Gate** | Business rule that caps or forces grade |
| **Conversion Probability** | Estimated P(disbursement within 90 days) |
| **Nurture Eligible** | Rejected lead eligible for automated re-engagement |

---

*End of Document A3 — Lead Grading Canonical Specification*
