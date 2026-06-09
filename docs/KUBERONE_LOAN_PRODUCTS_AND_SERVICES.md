# KuberOne
## Loan Products & Services Document

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Business Requirements Document (BRD) — Loan Products & Services  
**Classification:** Enterprise | Investor-Ready | Board Presentation | LOS Foundation  
**Version:** 1.0  
**Date:** June 2026  
**Related Documents:**
- [KUBERONE_VISION_AND_OBJECTIVES.md](./KUBERONE_VISION_AND_OBJECTIVES.md)
- [KUBERONE_USER_TYPES_AND_ROLES.md](./KUBERONE_USER_TYPES_AND_ROLES.md)
- [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Loan product catalog, eligibility, documents, workflows, lender mapping, revenue, KPIs |
| **Audience** | Board, Product, Operations, Credit, Sales, Engineering, Partners |
| **Purpose** | Foundation for Customer App, DSA App, CRM, LOS, LMS, AI Advisor, Eligibility Engine |
| **Status** | Strategic Product Foundation Document |

---

# 17. EXECUTIVE SUMMARY

*Presented first for board-level consumption.*

## Strategic Product Position

KuberOne's loan product portfolio transforms Kuber Finserve from a **single-product loan distributor** into a **multi-product secured and unsecured lending platform** serving retail, SME, and commercial customers across India's tier 1–3 markets.

The portfolio comprises **four primary product families** and **20 launch-ready loan variants**:

| Product Family | Variants | Market Position |
|----------------|----------|-----------------|
| **Home Loan** | 4 | Flagship secured product; highest ticket, longest tenure |
| **Loan Against Property (LAP)** | 4 | High-value secured; business + personal use |
| **Business Loan** | 5 | MSME growth engine; working capital focus |
| **Auto Loan** | 7 | Volume driver; new/used/commercial/EV |

## Business Impact

| Dimension | Expected Contribution |
|-----------|----------------------|
| **Revenue** | 70% of Year 1 commission revenue from Home Loan + LAP; 20% Business; 10% Auto |
| **Volume** | Home Loan and Auto drive application volume; Business drives ticket diversity |
| **Partner Network** | DSA partners enabled across all products with certification gates |
| **AI Differentiation** | Eligibility Engine + AI Advisor reduce rejection rates by 15–20% |
| **Cross-Sell** | Insurance, credit cards, top-up, BT drive 25%+ incremental revenue by Year 3 |

## Platform Foundation

This document defines the **business rules layer** that powers:

- **Customer App** — product discovery, eligibility, application
- **DSA App** — lead submission with product-specific checklists
- **CRM / LOS / LMS** — workflow stages, qualification, processing
- **Eligibility Engine** — rule-based + AI-augmented pre-qualification
- **AI Advisor** — product, variant, amount, lender recommendations
- **AI Sales Copilot** — lead scoring, script, cross-sell prompts
- **Lender Mapping** — multi-lender routing and commission optimization
- **Analytics** — product-wise funnel, revenue, and risk KPIs

## Risk & Compliance Posture

All products operate under:
- RBI fair practice and lending guidelines
- KYC/AML compliance via platform gates
- Lender-specific policy adherence (no universal approval guarantee)
- FOIR/LTV caps enforced by Eligibility Engine before submission
- Document authenticity verification (AI + manual)

## Future Expansion Path

Loan portfolio extends to **Personal Loan, Gold Loan, Credit Cards, Insurance, MF, FD, Wealth** via modular product architecture—without redesigning core LOS workflows.

**Board Recommendation:** Approve this product catalog as KuberOne's launch portfolio and authorize phased lender onboarding per product family.

---

# 1. PRODUCT PORTFOLIO OVERVIEW

## 1.1 Portfolio Architecture

```
KUBERONE LOAN PORTFOLIO
├── SECURED — REAL ESTATE
│   ├── Home Loan Suite (4 variants)
│   └── LAP Suite (4 variants)
├── SECURED — BUSINESS ASSET
│   └── Business Loan Suite (5 variants)
└── SECURED — VEHICLE
    └── Auto Loan Suite (7 variants)
```

## 1.2 Master Product Catalog

| Product ID | Product Name | Family | Secured | Priority |
|------------|-------------|--------|---------|----------|
| HL-01 | Fresh Home Loan | Home Loan | Yes | P1 — Launch |
| HL-02 | Home Loan Balance Transfer | Home Loan | Yes | P1 — Launch |
| HL-03 | Home Loan Top-Up | Home Loan | Yes | P1 — Launch |
| HL-04 | Home Loan BT + Top-Up | Home Loan | Yes | P2 — Month 3 |
| LAP-01 | Fresh LAP | LAP | Yes | P1 — Launch |
| LAP-02 | LAP Balance Transfer | LAP | Yes | P1 — Launch |
| LAP-03 | LAP Top-Up | LAP | Yes | P2 — Month 3 |
| LAP-04 | LAP BT + Top-Up | LAP | Yes | P2 — Month 6 |
| BL-01 | Business Loan | Business | Yes/No* | P1 — Launch |
| BL-02 | MSME Loan | Business | Yes/No* | P1 — Launch |
| BL-03 | Working Capital Loan | Business | Yes/No* | P1 — Launch |
| BL-04 | OD Assistance | Business | No | P2 — Month 4 |
| BL-05 | CC Assistance | Business | No | P2 — Month 4 |
| AL-01 | New Car Loan | Auto | Yes | P1 — Launch |
| AL-02 | Used Car Loan | Auto | Yes | P1 — Launch |
| AL-03 | Commercial Vehicle Loan | Auto | Yes | P2 — Month 3 |
| AL-04 | EV Loan | Auto | Yes | P2 — Month 6 |
| AL-05 | Auto Loan Balance Transfer | Auto | Yes | P3 — Month 9 |
| AL-06 | Auto Loan Top-Up | Auto | Yes | P3 — Month 9 |
| AL-07 | Auto Refinancing | Auto | Yes | P3 — Month 12 |

*Collateral depends on ticket size and lender policy.

## 1.3 Product Summary Matrix

| Product Family | Purpose | Target Audience | Primary Use Cases | Revenue Opportunity | Risk Level | Avg Ticket | Lifecycle |
|----------------|---------|-----------------|-------------------|---------------------|------------|------------|-----------|
| **Home Loan** | Property purchase/construction financing | Salaried, self-employed, NRIs | Buy home, construct, plot + build | High commission per disbursement; cross-sell insurance | Medium | ₹25L–₹2Cr | 15–30 years |
| **LAP** | Liquidity against owned property | Business owners, HNI, self-employed | Business expansion, debt consolidation, personal | High ticket; repeat top-up/BT | Medium-High | ₹10L–₹5Cr | 5–20 years |
| **Business Loan** | Business growth and working capital | MSME, SMEs, proprietors | Expansion, inventory, machinery, WC | Volume + relationship; OD/CC recurring | Medium-High | ₹5L–₹2Cr | 1–7 years |
| **Auto Loan** | Vehicle acquisition financing | Salaried, self-employed | Personal car, commercial fleet, EV | High volume; manufacturer tie-ups | Low-Medium | ₹3L–₹50L | 1–7 years |

## 1.4 Cross-Portfolio Principles

| Principle | Application |
|-----------|-------------|
| **Lender-agnostic origination** | KuberOne originates; lender provides sanction |
| **Eligibility before effort** | Engine pre-qualifies before document collection |
| **Product certification for partners** | DSA must certify per product family |
| **Unified application lifecycle** | Same 9-stage lifecycle; product-specific sub-stages |
| **AI-first recommendation** | Advisor suggests product before customer/applicant chooses |
| **Cross-sell at every milestone** | Insurance at sanction; top-up at 12-month post-disbursement |

---

# 2. HOME LOAN PRODUCT SUITE

## 2.1 Suite Overview

Home loans are Kuber Finserve's **anchor product**—highest average ticket size, strongest lender relationships, and primary driver of DSA and builder/referral partner channel.

| Variant | Code | Definition |
|---------|------|------------|
| Fresh Home Loan | HL-01 | New loan for property purchase or construction |
| Home Loan Balance Transfer | HL-02 | Transfer existing home loan from another lender |
| Home Loan Top-Up | HL-03 | Additional loan on existing home loan with same lender |
| Home Loan BT + Top-Up | HL-04 | Combined balance transfer with additional top-up amount |

---

## 2.2 HL-01: Fresh Home Loan

### Business Overview

Finance purchase of ready-to-move, under-construction, or self-construction residential property. Primary revenue driver for builder and property dealer referral channels.

### Target Customers

| Segment | Profile | Priority |
|---------|---------|----------|
| Salaried (P1) | Age 25–55, stable employment, CIBIL 700+ | High |
| Self-Employed (P1) | Business/professional income, 3+ years vintage | High |
| NRI (P2) | Indian property purchase, NRE/NRO repatriation | Medium |
| First-time buyer (P1) | Subsidy-eligible (PMAY where applicable) | High |

### Eligibility Factors

| Factor | Rule (Typical) | Engine Check |
|--------|----------------|--------------|
| Age at application | 21–65 (max 70 at maturity) | ✓ |
| Minimum income | ₹25,000/month (metro); ₹20,000 (tier 2/3) | ✓ |
| Employment stability | Salaried: 1 year current; SE: 3 years business | ✓ |
| CIBIL score | 700+ preferred; 650+ with conditions | ✓ |
| FOIR | ≤50–60% (lender-specific) | ✓ |
| Co-applicant | Allowed; income clubbing permitted | ✓ |
| Property approval | Lender-approved project or legal clear title | Manual + checklist |

### Income Types Accepted

| Income Type | Documents | Weighting |
|-------------|-----------|-----------|
| Salaried (fixed) | Salary slips, Form 16, bank statement | 100% |
| Salaried (variable) | Salary + bonus history (2 years) | 80% variable component |
| Self-employed (proprietor) | ITR, P&L, bank statement | 100% (avg 2 years) |
| Self-employed (professional) | ITR, professional practice proof | 100% |
| Rental income | Lease agreement + bank credits | 50–75% |
| Pension | Pension certificate | 100% |

### Loan Parameters

| Parameter | Range |
|-----------|-------|
| Loan amount | ₹5,00,000 – ₹5,00,00,000 |
| Tenure | 5 – 30 years |
| LTV (ready property) | Up to 80–90% |
| LTV (under-construction) | Up to 75–80% |
| LTV (plot) | Up to 70–75% |
| Interest rate | Lender-dependent (typically 8.5%–10.5% p.a.) |
| Processing fee | 0.25%–1% of loan amount |

### Property Types

| Type | Eligible | LTV Adjustment |
|------|----------|----------------|
| Ready-to-move apartment | ✓ | Standard |
| Under-construction (RERA) | ✓ | -5% LTV |
| Independent house/villa | ✓ | Standard |
| Builder floor | ✓ | Standard |
| Plot + construction | ✓ | Staged disbursement |
| Plot only | ✓ (select lenders) | Lower LTV |
| Commercial property | ✗ (LAP instead) | — |
| Agricultural land | ✗ | — |

### Required Documents

*See Section 7 for full framework. Summary:*

| Category | Documents |
|----------|-----------|
| KYC | PAN, Aadhaar, photo, address proof |
| Income (salaried) | 3 months salary slip, 6 months bank statement, Form 16 |
| Income (self-employed) | 2 years ITR, 6 months bank statement, business proof |
| Property | Sale agreement, allotment letter, payment receipts, chain of title |
| Application | Loan application form, consent, property details form |

### Lead Qualification Criteria

| Criterion | Hot | Warm | Cold |
|-----------|-----|------|------|
| Income confirmed | ✓ | Partial | Unknown |
| CIBIL known | 700+ | 650–699 | <650 or unknown |
| Property identified | ✓ | Shortlisted | Not identified |
| Down payment ready | ✓ | Partial | No |
| Timeline | <30 days | 30–90 days | >90 days |

### Approval Factors

| Factor | Weight | Source |
|--------|--------|--------|
| Credit score | High | Bureau |
| Income stability | High | Documents |
| FOIR | High | Calculation |
| Property legal status | Critical | Legal report |
| LTV | High | Valuation |
| Employment/business vintage | Medium | Documents |
| Banking conduct | Medium | Bank statement |

### Disbursement Workflow

```
Application approved → Legal verification → Property valuation → Sanction letter
    → Customer acceptance → Agreement execution → Registration (if purchase)
    → Disbursement request → Lender fund transfer → Seller/builder payment
    → EMI commencement → Handoff to RM
```

**Disbursement Types:**
- **Full disbursement** — Ready property
- **Staged disbursement** — Under-construction (linked to construction milestones)
- **Partial disbursement** — Plot + construction

### Cross-Sell Opportunities

| Product | Trigger | Timing |
|---------|---------|--------|
| Home Insurance | Sanction | Pre-disbursement |
| Life Insurance (credit-linked) | Sanction | Pre-disbursement |
| Personal Loan | Post-disbursement | 6+ months |
| Top-Up | Post-disbursement | 12+ months, 12+ EMIs paid |
| Balance Transfer (competitor poaching defense) | Post-disbursement | 18+ months |

### Risk Indicators

| Indicator | Severity | Action |
|-----------|----------|--------|
| CIBIL <650 | High | Conditional or reject |
| High FOIR (>65%) | High | Co-applicant or lower amount |
| Property legal defect | Critical | Hold until resolved |
| Income mismatch (stated vs. documented) | High | Compliance review |
| Builder project non-RERA | High | Lender-specific rejection |
| Recent delinquency (12 months) | Medium | Additional scrutiny |

### KPIs

| KPI | Target |
|-----|--------|
| Lead-to-application rate | 35%+ |
| Application-to-sanction rate | 65%+ |
| Sanction-to-disbursement rate | 90%+ |
| Average TAT (application to disbursement) | <21 days |
| Average ticket size | ₹35L+ |
| Document first-pass rate | 65%+ |
| Builder channel contribution | 25%+ |

---

## 2.3 HL-02: Home Loan Balance Transfer

### Business Overview

Transfer customer's existing home loan from another lender to a new lender offering better ROI, service, or top-up capability. High conversion when rate differential >0.5%.

### Target Customers

| Segment | Profile |
|---------|---------|
| Existing home loan borrowers | 12+ months EMI track record |
| Rate-sensitive borrowers | Current ROI > market rate by 0.5%+ |
| Service-dissatisfied borrowers | Poor service from current lender |
| Top-up seekers | Need additional funds; BT+Top-Up variant |

### Eligibility Factors

| Factor | Rule |
|--------|------|
| Existing loan vintage | Minimum 12 months (lender: 6–24) |
| EMI track record | Zero DPD preferred; max 1 DPD in 12 months |
| Outstanding principal | ₹10L minimum |
| Property | Same property; clear title maintained |
| CIBIL | 700+ preferred |
| FOIR (post-BT) | Within lender limits including new EMI |

### Income Types, Loan Amount, Tenure, LTV

Same as HL-01, with additional:

| Parameter | BT-Specific |
|-----------|-------------|
| Loan amount | Outstanding principal + foreclosure charges (if financed) |
| Maximum tenure | Remaining tenure or fresh 20 years (lender-specific) |
| LTV | Based on current property value re-valuation; typically ≤70% of market value |
| BT savings threshold | Minimum 0.25% ROI reduction or ₹50,000 lifetime savings |

### Property Types

Same as HL-01; property already mortgaged with existing lender.

### Required Documents (Additional to HL-01)

| Document | Purpose |
|----------|---------|
| Existing loan statement (12 months) | Track record |
| Foreclosure letter | Outstanding amount |
| List of documents (LOD) from existing lender | Transfer process |
| Existing sanction letter | Reference |
| Property documents (copy held by existing lender) | LOD retrieval |

### Lead Qualification Criteria

| Criterion | Hot | Warm | Cold |
|-----------|-----|------|------|
| ROI differential | >0.75% | 0.25–0.75% | <0.25% |
| EMI track record | Clean 12+ months | 1 minor DPD | Multiple DPD |
| Foreclosure amount known | ✓ | Approximate | Unknown |
| Switch intent | Confirmed | Considering | Exploring |

### Approval Factors

BT-specific weight on **EMI track record** and **ROI savings justification**.

### Disbursement Workflow

```
BT application → Credit assessment → Sanction → Foreclosure letter from existing lender
    → New lender disbursement → Direct payment to existing lender → NOC from existing lender
    → New EMI commencement → LOD transfer
```

### Cross-Sell, Risk, KPIs

Same as HL-01 plus:

| KPI | Target |
|-----|--------|
| BT conversion rate | 20%+ of HL leads |
| Average savings communicated | ₹1.5L+ lifetime |
| BT TAT | <18 days |

---

## 2.4 HL-03: Home Loan Top-Up

### Business Overview

Additional loan amount on existing home loan (same lender or new lender) without full BT. Used for renovation, business, education, or personal needs.

### Target Customers

| Segment | Profile |
|---------|---------|
| Existing home loan customers | 12+ months clean EMI |
| Kuber Finserve disbursed customers | Priority (retention) |
| Renovation/expansion needs | Identified purpose |

### Eligibility Factors

| Factor | Rule |
|--------|------|
| Existing loan vintage | 12+ months |
| EMI track record | Clean (0 DPD in 12 months) |
| Property value appreciation | Re-valuation supports higher LTV |
| Combined LTV (outstanding + top-up) | ≤70–75% of market value |
| Purpose | Renovation, business, personal (lender-specific) |

### Loan Parameters

| Parameter | Range |
|-----------|-------|
| Top-up amount | ₹2,00,000 – ₹50,00,000 (typical) |
| Tenure | Up to remaining original tenure or 15 years |
| LTV (combined) | ≤75% of current market value |
| Interest rate | Typically 25–75 bps above base home loan rate |

### Required Documents (Additional)

| Document | Purpose |
|----------|---------|
| Existing loan account statement | Track record |
| Top-up purpose declaration | End-use |
| Renovation estimate (if applicable) | Purpose validation |

### Lead Qualification, Approval, Disbursement

Simplified vs. fresh HL—no property re-purchase documentation. Disbursement typically **single tranche** to customer account.

### Cross-Sell

Insurance (top-up cover), personal loan (if top-up insufficient), wealth products.

### KPIs

| KPI | Target |
|-----|--------|
| Top-up offer acceptance (existing customers) | 10%+ |
| Top-up average ticket | ₹8L+ |

---

## 2.5 HL-04: Home Loan BT + Top-Up

### Business Overview

Combined product: transfer existing loan to new lender **and** obtain additional top-up amount in single transaction. Highest complexity; highest revenue per customer.

### Target Customers

Borrowers seeking **both** rate reduction and additional funds.

### Eligibility Factors

Combination of HL-02 and HL-03 rules. Combined FOIR must include BT EMI + top-up EMI.

### Loan Parameters

| Parameter | Rule |
|-----------|------|
| Total loan | Outstanding + top-up amount |
| LTV (combined) | ≤70% of re-valued property |
| Minimum top-up | ₹2,00,000 (to justify combined processing) |

### Disbursement Workflow

```
BT + Top-Up sanction → Foreclosure payment (outstanding) → Top-up disbursed to customer
    → Single new EMI (combined) → NOC from previous lender
```

### Risk Indicators

Higher risk due to larger exposure—enhanced income verification and property re-valuation mandatory.

### KPIs

| KPI | Target |
|-----|--------|
| BT+Top-Up as % of BT leads | 30%+ |
| Combined average ticket | ₹45L+ |

---

# 3. LOAN AGAINST PROPERTY (LAP) PRODUCT SUITE

## 3.1 Suite Overview

LAP unlocks liquidity from **already-owned residential or commercial property**. Higher LTV flexibility for business use; typically faster processing than home loan for existing property owners.

| Variant | Code | Definition |
|---------|------|------------|
| Fresh LAP | LAP-01 | New loan against owned property |
| LAP Balance Transfer | LAP-02 | Transfer existing LAP from another lender |
| LAP Top-Up | LAP-03 | Additional amount on existing LAP |
| LAP BT + Top-Up | LAP-04 | Combined BT with top-up |

---

## 3.2 LAP-01: Fresh LAP

### Business Overview

Secured loan against residential, commercial, or mixed-use property for business expansion, debt consolidation, medical, education, or personal needs.

### Target Customers

| Segment | Profile |
|---------|---------|
| Business owners | Need capital without selling property |
| Self-employed professionals | Doctors, CAs, lawyers |
| HNI individuals | Liquidity for investments or needs |
| Debt consolidators | Paying off expensive unsecured debt |
| Property-rich, cash-poor | Asset leverage |

### Eligibility Factors

| Factor | Rule (Typical) |
|--------|----------------|
| Age | 25–65 (max 70 at maturity) |
| Property ownership | Clear title; single or joint owner (all owners as co-applicants) |
| Minimum income | ₹30,000/month (personal); ₹50,000/month (business use) |
| CIBIL | 650+ (700+ preferred) |
| FOIR | ≤60–65% |
| Property vintage | Minimum 3 years old (lender-specific) |
| End-use declaration | Required (business, personal, debt consolidation) |

### Income Types

Same as Home Loan plus:

| Income Type | Additional Requirement |
|-------------|----------------------|
| Business income | 3 years ITR, GST returns (if registered) |
| Rental income from other properties | Lease + bank credits (50–75% considered) |
| Multiple income sources | Clubbing permitted with co-applicant |

### Loan Parameters

| Parameter | Range |
|-----------|-------|
| Loan amount | ₹5,00,000 – ₹5,00,00,000 |
| Tenure | 3 – 20 years |
| LTV (residential) | Up to 60–75% |
| LTV (commercial) | Up to 50–65% |
| LTV (industrial) | Up to 40–55% |
| Interest rate | 9.5%–12.5% p.a. |
| Processing fee | 0.5%–2% |

### Property Types

| Type | Eligible | Max LTV |
|------|----------|---------|
| Self-occupied residential | ✓ | 70–75% |
| Rented residential | ✓ | 65–70% |
| Commercial (shop/office) | ✓ | 55–65% |
| Industrial | ✓ (select lenders) | 40–50% |
| Plot (with construction) | ✓ | 50–60% |
| Vacant land | ✗ (most lenders) | — |
| Agricultural | ✗ | — |
| Property under dispute | ✗ | — |

### Required Documents

| Category | Documents |
|----------|-----------|
| KYC | PAN, Aadhaar, photo, address proof (all owners) |
| Income | ITR (2 years), bank statement (12 months), salary slips if salaried |
| Business (if business use) | GST, business registration, 2 years financials |
| Property | Sale deed, property tax receipts, encumbrance certificate (30 years), approved plan, OC/CC |
| Legal | Title search report (platform-coordinated) |
| Application | LAP application, end-use declaration, insurance consent |

### Lead Qualification Criteria

| Criterion | Hot | Warm | Cold |
|-----------|-----|------|------|
| Property owned (clear title) | ✓ | Under verification | No/disputed |
| Income documented | ✓ | Partial | No |
| CIBIL | 700+ | 650–699 | <650 |
| Loan amount clarity | ✓ | Approximate | Unknown |
| End-use defined | ✓ | General | Unknown |

### Approval Factors

| Factor | Weight |
|--------|--------|
| Property valuation | Critical |
| Legal clear title | Critical |
| LTV post-valuation | High |
| Income vs. EMI | High |
| End-use (business preferred by some lenders) | Medium |
| CIBIL | High |
| Property location (metro/tier 1 preferred) | Medium |

### Disbursement Workflow

```
Application → Legal + technical valuation → Credit assessment → Sanction
    → MOD (Memorandum of Deposit) registration → Insurance → Disbursement to account
    → EMI commencement
```

### Cross-Sell Opportunities

| Product | Trigger |
|---------|---------|
| Property insurance | Pre-disbursement |
| Business loan (if business use insufficient) | Post 6 months |
| Top-up | 12+ months clean EMI |
| Life insurance | Sanction |
| Mutual funds / FD | HNI customers |

### Risk Indicators

| Indicator | Severity |
|-----------|----------|
| Title dispute / litigation | Critical — reject |
| LTV >70% residential | High — lender limit |
| End-use mismatch (stated vs. actual) | High — compliance |
| Property in negative area list | High |
| Multiple existing loans on property | Medium — FOIR impact |
| Cash income dominant (unverifiable) | High |

### KPIs

| KPI | Target |
|-----|--------|
| LAP lead-to-sanction | 55%+ |
| Average ticket | ₹25L+ |
| TAT (application to disbursement) | <14 days |
| Commercial LAP % | 20%+ of LAP volume |
| Cross-sell (insurance) attach rate | 60%+ |

---

## 3.3 LAP-02: LAP Balance Transfer

### Business Overview

Transfer existing LAP to new lender for better rate, higher amount, or service improvement.

### Business Rules

| Rule | Detail |
|------|--------|
| Minimum vintage | 12 months on existing LAP |
| EMI track record | Clean 12 months |
| Re-valuation | Mandatory; may unlock higher eligibility |
| Foreclosure | Existing lender NOC + foreclosure letter |
| Savings threshold | ROI reduction ≥0.5% or top-up access |

### Eligibility, Documents, Workflow

Inherits LAP-01 with additions: existing loan statement, foreclosure letter, LOD from existing lender.

### KPIs

| KPI | Target |
|-----|--------|
| LAP BT conversion | 15%+ of LAP leads |
| BT TAT | <12 days |

---

## 3.4 LAP-03: LAP Top-Up

### Business Overview

Additional loan on existing LAP without full BT.

### Business Rules

| Rule | Detail |
|------|--------|
| Vintage | 12+ months |
| Combined LTV | ≤70% of re-valued property |
| Top-up range | ₹2L – ₹30L typical |
| Re-valuation | Required if last valuation >24 months |

### KPIs

| KPI | Target |
|-----|--------|
| Top-up acceptance (existing LAP customers) | 12%+ |

---

## 3.5 LAP-04: LAP BT + Top-Up

### Business Overview

Combined BT and top-up for LAP—mirrors HL-04 logic.

### Business Rules

| Rule | Detail |
|------|--------|
| Combined loan | Outstanding + top-up |
| Max combined LTV | 65% of market value |
| Enhanced verification | Mandatory for amounts >₹50L |

---

# 4. BUSINESS LOAN SUITE

## 4.1 Suite Overview

Business loans serve **MSME and SME segments**—critical for tier 2/3 expansion and DSA channel volume.

| Variant | Code | Definition |
|---------|------|------------|
| Business Loan | BL-01 | Term loan for business expansion, machinery, capex |
| MSME Loan | BL-02 | Government-scheme aligned MSME financing |
| Working Capital Loan | BL-03 | Short-term operational funding |
| OD Assistance | BL-04 | Overdraft facility setup assistance |
| CC Assistance | BL-05 | Cash credit facility setup assistance |

---

## 4.2 BL-01: Business Loan

### Business Overview

Term loan for business expansion, equipment purchase, office setup, or general business needs.

### Target Customers

| Segment | Profile |
|---------|---------|
| Proprietorship | Single-owner businesses |
| Partnership | 2+ partners |
| Private Limited | Incorporated companies |
| LLP | Professional services firms |

### Business Types Supported

| Type | Eligible | Notes |
|------|----------|-------|
| Trading | ✓ | Inventory financing |
| Manufacturing | ✓ | Machinery, raw material |
| Services | ✓ | Office, equipment |
| Retail | ✓ | Shop setup, inventory |
| Restaurant/Hospitality | ✓ (select lenders) | Higher risk tier |
| Real estate developer | ✗ | Separate product |
| Speculative trading | ✗ | Policy exclusion |

### Vintage Requirements

| Business Type | Minimum Vintage |
|---------------|-----------------|
| Proprietorship | 3 years |
| Partnership | 3 years |
| Pvt Ltd / LLP | 2 years |
| Startup (with GST) | 1 year (select lenders, lower ticket) |

### Turnover Requirements

| Ticket Size | Minimum Annual Turnover |
|-------------|------------------------|
| Up to ₹25L | ₹10L+ |
| ₹25L – ₹1Cr | ₹50L+ |
| ₹1Cr – ₹2Cr | ₹2Cr+ |

### GST Requirements

| Rule | Detail |
|------|--------|
| GST registration | Mandatory if turnover >₹40L (goods) / ₹20L (services) |
| GST returns | 12 months filing history (6 months minimum) |
| GST turnover vs. stated | Variance <20% |

### Cash Flow Assessment

| Metric | Calculation | Threshold |
|--------|-------------|-----------|
| DSCR | Net cash flow / EMI | ≥1.25 |
| Bank credit turnover | Total credits / loan amount | ≥1.5x annually |
| Average monthly balance | AMB in business account | Positive trend |
| Bounce rate | Cheque/EMI bounces | <2% in 12 months |

### Eligibility

| Factor | Rule |
|--------|------|
| Age (promoter) | 25–65 |
| CIBIL (promoter) | 680+ |
| Business CIBIL (if applicable) | No default |
| Profitability | Positive PAT in 1 of last 2 years (preferred both) |
| Existing debt | FOIR/DSCR within limits |

### Loan Parameters

| Parameter | Range |
|-----------|-------|
| Loan amount | ₹5,00,000 – ₹2,00,00,000 |
| Tenure | 1 – 7 years |
| Collateral | Unsecured up to ₹50L; collateral above (lender-specific) |
| Interest rate | 14%–22% p.a. |
| Processing fee | 1%–3% |

### Approval Logic

```
Stage 1: Eligibility Engine — vintage, turnover, GST, CIBIL gate
Stage 2: Cash flow analysis — bank statement AI analysis
Stage 3: Credit assessment — DSCR, FOIR, business financials
Stage 4: Lender routing — ticket size, industry, geography
Stage 5: Lender decision — sanction/reject/conditional
```

| Score Component | Weight |
|-----------------|--------|
| Promoter CIBIL | 25% |
| Business cash flow | 30% |
| Turnover trend | 20% |
| Vintage + stability | 15% |
| Banking conduct | 10% |

### Risk Logic

| Risk Tier | Criteria | Action |
|-----------|----------|--------|
| Low | CIBIL 750+, 5yr vintage, positive cash flow | Fast-track lenders |
| Medium | CIBIL 700+, 3yr vintage, stable turnover | Standard processing |
| High | CIBIL 650–699, 2yr vintage, thin margins | Senior credit review |
| Critical | CIBIL <650, negative cash flow, GST default | Reject or secured only |

### Cross-Sell

| Product | Trigger |
|---------|---------|
| OD/CC | Business loan insufficient for WC needs |
| LAP | Higher ticket with property collateral |
| Insurance (business) | Sanction |
| GST filing services | Value-added |
| Current account | Bank tie-up |

### KPIs

| KPI | Target |
|-----|--------|
| BL lead-to-sanction | 45%+ |
| Average ticket | ₹15L+ |
| TAT | <10 days |
| Unsecured % | 40%+ of BL volume |
| DSCR pass rate | 80%+ at application |

---

## 4.3 BL-02: MSME Loan

### Business Overview

Aligned with MSME classification and government schemes (CGTMSE, MUDRA where applicable). Lower ticket; higher volume.

### Business Rules

| Rule | Detail |
|------|--------|
| MSME classification | Micro: <₹5Cr investment; Small: <₹10Cr; Medium: <₹50Cr |
| Scheme mapping | CGTMSE coverage for collateral-free up to ₹2Cr |
| MUDRA mapping | Shishu/Kishore/Tarun tiers |
| Priority sector | Platform flags for lender routing |

### Eligibility

Inherits BL-01 with lower vintage (2 years) and ticket (₹1L–₹50L typical for micro).

### Approval Logic

Scheme eligibility check → lender scheme mapping → standard credit assessment.

### KPIs

| KPI | Target |
|-----|--------|
| MSME scheme utilization | 30%+ of BL-02 |
| Micro enterprise % | 50%+ |

---

## 4.4 BL-03: Working Capital Loan

### Business Overview

Short-term loan (12–36 months) for inventory, receivables, operational expenses.

### Business Rules

| Rule | Detail |
|------|--------|
| Purpose | Inventory, receivables, seasonal needs |
| Tenure | 12 – 36 months |
| Ticket | ₹5L – ₹1Cr |
| Assessment focus | Cash conversion cycle, inventory turnover |
| Collateral | Stock hypothecation (lender-specific) |

### Cash Flow Logic

| Metric | Focus |
|--------|-------|
| Inventory turnover | Higher = better |
| Receivable days | Lower = better |
| Seasonal pattern | Acknowledged in assessment |

### KPIs

| KPI | Target |
|-----|--------|
| WC loan repeat rate | 25%+ (renewal) |

---

## 4.5 BL-04: OD Assistance

### Business Overview

**Assistance product**—Kuber Finserve facilitates overdraft facility setup with partner banks, not direct lending.

### Business Rules

| Rule | Detail |
|------|--------|
| Product type | Facility arrangement (not term loan) |
| Limit | ₹5L – ₹2Cr |
| Assessment | CC/OD specific cash flow analysis |
| Revenue model | Arrangement fee + trail commission |
| Lender | Bank partners only |

### Eligibility

Strong banking relationship, 3+ years vintage, consistent credits, existing CA relationship preferred.

---

## 4.6 BL-05: CC Assistance

### Business Overview

Cash Credit facility assistance for inventory-backed working capital.

### Business Rules

| Rule | Detail |
|------|--------|
| Product type | Revolving credit against stock |
| Limit | ₹10L – ₹5Cr |
| Stock audit | Lender requirement for limits >₹25L |
| Revenue model | Arrangement fee + annual trail |

---

# 5. AUTO LOAN SUITE

## 5.1 Suite Overview

Auto loans drive **application volume** and **manufacturer/dealer partnerships**.

| Variant | Code | Definition |
|---------|------|------------|
| New Car Loan | AL-01 | Finance new passenger vehicle |
| Used Car Loan | AL-02 | Finance pre-owned vehicle |
| Commercial Vehicle Loan | AL-03 | Trucks, buses, taxis, fleet |
| EV Loan | AL-04 | Electric vehicle financing |
| Auto Loan Balance Transfer | AL-05 | Transfer existing auto loan |
| Auto Loan Top-Up | AL-06 | Additional on existing auto loan |
| Auto Refinancing | AL-07 | Re-finance paid-off vehicle |

---

## 5.2 AL-01: New Car Loan

### Business Overview

Finance purchase of new passenger cars through dealers or direct manufacturer programs.

### Target Customers

| Segment | Profile |
|---------|---------|
| Salaried | Stable income, first car or upgrade |
| Self-employed | Business income, vehicle for personal/business use |
| Corporate | Employee car programs (future) |

### Vehicle Types

| Type | Eligible |
|------|----------|
| Hatchback | ✓ |
| Sedan | ✓ |
| SUV/MUV | ✓ |
| Luxury | ✓ (select lenders, higher down payment) |
| Commercial (personal use) | ✓ (AL-03 if commercial registration) |

### Manufacturer Categories

| Category | LTV | Special Programs |
|----------|-----|------------------|
| Mass market (Maruti, Hyundai, Tata) | Up to 90% on-road | Dealer subvention |
| Mid-range (Honda, Toyota, MG) | Up to 85% | Manufacturer rate offers |
| Premium (BMW, Mercedes, Audi) | Up to 80% | Higher income requirement |
| EV (Tata, MG, Hyundai) | Up to 90% | AL-04 sub-type |

### Eligibility

| Factor | Rule |
|--------|------|
| Age | 21–60 |
| Income | ₹20,000/month minimum |
| CIBIL | 700+ (650+ with higher down payment) |
| Employment | 1 year (salaried); 2 years (self-employed) |
| Down payment | 10–25% of on-road price |

### Loan Parameters

| Parameter | Range |
|-----------|-------|
| Loan amount | ₹1,00,000 – ₹50,00,000 |
| Tenure | 1 – 7 years |
| LTV | Up to 90% on-road (ex-showroom + RTO + insurance) |
| Interest rate | 8.5%–14% p.a. |
| Processing fee | ₹2,000 – ₹10,000 or 0.5% |

### Loan Logic

```
On-road price → Down payment → Loan amount = On-road - Down payment
    → EMI calculation → FOIR check → LTV check → Lender routing
```

### Risk Logic

| Risk | Mitigation |
|------|------------|
| High LTV (>85%) | Higher CIBIL requirement |
| Long tenure (>5 years) | Vehicle age at maturity check |
| Self-employed income | Enhanced bank statement review |
| Negative area | Dealer verification |

### Required Documents

KYC + income (salary slip/ITR) + vehicle proforma invoice + driving license.

### KPIs

| KPI | Target |
|-----|--------|
| Dealer channel % | 60%+ |
| Lead-to-disbursement TAT | <5 days |
| Average ticket | ₹8L+ |

---

## 5.3 AL-02: Used Car Loan

### Business Overview

Finance pre-owned vehicles through dealers or peer-to-peer (verified sellers).

### Business Rules

| Rule | Detail |
|------|--------|
| Vehicle age at loan start | Max 8–10 years (lender-specific) |
| Vehicle age at loan end | Max 12–15 years |
| Valuation | Third-party valuation mandatory |
| LTV | Up to 70–80% of valuation (lower than new) |
| Ownership | Max 2 previous owners (lender-specific) |

### Age Rules

| Vehicle Age | Max Tenure | Max LTV |
|-------------|------------|---------|
| 0–3 years | 5 years | 80% |
| 3–5 years | 4 years | 75% |
| 5–8 years | 3 years | 70% |
| 8+ years | Case-by-case | 60% |

### Risk Logic

Higher depreciation risk; mandatory vehicle inspection report; insurance (comprehensive) required.

### KPIs

| KPI | Target |
|-----|--------|
| Used car % of auto portfolio | 25%+ |
| Valuation-to-price variance | <10% |

---

## 5.4 AL-03: Commercial Vehicle Loan

### Business Overview

Finance trucks, buses, taxis, light commercial vehicles for business/fleet operators.

### Business Rules

| Rule | Detail |
|------|--------|
| Vehicle types | HCV, LCV, buses, taxis, ambulances |
| Borrower | Business entity or individual with commercial use |
| Income assessment | Business cash flow + vehicle earning potential |
| LTV | 70–85% |
| Tenure | 3 – 5 years |
| Insurance | Comprehensive + passenger liability (if applicable) |

### Eligibility

Business vintage 2+ years; commercial license; route permit (if applicable).

### KPIs

| KPI | Target |
|-----|--------|
| CV loan average ticket | ₹15L+ |

---

## 5.5 AL-04: EV Loan

### Business Overview

Dedicated electric vehicle financing with potential subsidy awareness and green lender programs.

### Business Rules

| Rule | Detail |
|------|--------|
| Eligible vehicles | BEV, PHEV on lender-approved list |
| Subsidy | Platform displays applicable FAME/subsidy (informational) |
| LTV | Up to 90% (incentivized by select lenders) |
| Battery warranty | Minimum 5 years (lender check) |
| Residual value | Enhanced depreciation model in risk assessment |

### Cross-Sell

Home charging installation loan (future), green insurance.

---

## 5.6 AL-05: Auto Loan Balance Transfer

### Business Rules

| Rule | Detail |
|------|--------|
| Vintage | 12+ months |
| Track record | Clean EMI |
| Savings | ROI reduction ≥0.5% |
| Vehicle age | Within lender limits at BT completion |

---

## 5.7 AL-06: Auto Loan Top-Up

### Business Rules

| Rule | Detail |
|------|--------|
| Vintage | 12+ months |
| Top-up purpose | Repair, insurance, personal |
| Max top-up | 50% of outstanding or ₹2L (lower) |
| Combined LTV | Vehicle re-valuation based |

---

## 5.8 AL-07: Auto Refinancing

### Business Overview

Loan against fully paid vehicle (no existing loan) for liquidity.

### Business Rules

| Rule | Detail |
|------|--------|
| Ownership | Fully paid; RC in borrower name |
| Vehicle age | Max 5 years |
| LTV | 50–70% of valuation |
| Tenure | 1 – 3 years |

---

# 6. ELIGIBILITY FRAMEWORK

## 6.1 Framework Architecture

```
ELIGIBILITY ENGINE INPUTS
├── Customer Profile (age, employment, location)
├── Income Data (type, amount, stability)
├── Credit Data (CIBIL, existing obligations)
├── Asset Data (property, vehicle)
├── Business Data (vintage, turnover, GST)
└── Product Selection (variant, amount, tenure)
        ↓
RULE ENGINE (hard gates) → SCORE ENGINE (soft ranking) → LENDER MATCHER
        ↓
OUTPUT: Eligible / Conditional / Ineligible + Recommended lenders + Max amount
```

## 6.2 Universal Eligibility Gates (All Products)

| Gate | Rule | Failure Action |
|------|------|----------------|
| Age minimum | ≥21 years | Reject |
| Age maximum | ≤65 at application (70 at maturity for HL/LAP) | Reject |
| Indian resident | Resident Indian (NRI: HL only) | Reject |
| KYC complete | PAN + Aadhaar verified | Block application |
| CIBIL minimum | Product-specific floor | Reject or conditional |
| Active default | Any active write-off/NPA | Reject |
| Fraud list | On internal/partner fraud list | Reject |
| Sanctioned geography | Pin code in lender approved list | Reject or alternate lender |

## 6.3 Home Loan Eligibility Rules

### Income Rules

| Rule ID | Rule | Calculation |
|---------|------|-------------|
| HL-INC-01 | Minimum gross income | ₹25,000/month (metro); ₹20,000 (tier 2/3) |
| HL-INC-02 | Income clubbing | Co-applicant income: 100% add |
| HL-INC-03 | Variable income haircut | Bonus: 50%; OT: 75% |
| HL-INC-04 | Rental income | 50–75% of documented rent |
| HL-INC-05 | Maximum eligible loan | 60x monthly net income (indicative) |
| HL-INC-06 | FOIR limit | ≤50% (salaried); ≤55% (self-employed) |

### Age Rules

| Rule ID | Rule |
|---------|------|
| HL-AGE-01 | Min age: 21 |
| HL-AGE-02 | Max age at maturity: 70 (salaried); 65 (self-employed) |
| HL-AGE-03 | Co-applicant max age at maturity: 70 |

### Employment Rules

| Type | Minimum Stability |
|------|-------------------|
| Salaried (private) | 2 years total; 1 year current employer |
| Salaried (government) | 1 year |
| Self-employed | 3 years business |
| Professional | 3 years practice |
| NRI | 2 years overseas employment |

### Location Rules

| Location Type | Eligibility |
|---------------|-------------|
| Metro cities | Full lender access |
| Tier 2 | Most lenders; reduced LTV for some |
| Tier 3 | Select lenders; builder project focus |
| Negative pin code list | Per-lender block |

## 6.4 LAP Eligibility Rules

### Income Rules

| Rule ID | Rule |
|---------|------|
| LAP-INC-01 | Minimum income: ₹30,000/month |
| LAP-INC-02 | Business income: 3-year average ITR |
| LAP-INC-03 | FOIR limit: ≤60% |
| LAP-INC-04 | Max loan: Lesser of (LTV × value) or (income multiple) |

### Age, Employment, Location

Inherits HL rules with LAP-AGE-02 max maturity 65 for self-employed business use.

### Property Rules (LAP-Specific)

| Rule ID | Rule |
|---------|------|
| LAP-PROP-01 | Property must be 3+ years old |
| LAP-PROP-02 | All owners must be co-applicants |
| LAP-PROP-03 | No existing lien (except BT) |
| LAP-PROP-04 | Minimum property value: ₹15,00,000 |
| LAP-PROP-05 | LTV caps by property type (see Section 3) |

## 6.5 Business Loan Eligibility Rules

### Income Rules

| Rule ID | Rule |
|---------|------|
| BL-INC-01 | Turnover-to-loan ratio: ≥2x |
| BL-INC-02 | DSCR: ≥1.25 |
| BL-INC-03 | Minimum monthly business credits: ₹2x proposed EMI |
| BL-INC-04 | PAT positive in latest year (preferred) |

### Age Rules

| Rule ID | Rule |
|---------|------|
| BL-AGE-01 | Promoter age: 25–65 |
| BL-AGE-02 | Business vintage: 3 years (2 for Pvt Ltd) |

### Employment Rules (Business)

| Rule ID | Rule |
|---------|------|
| BL-BUS-01 | Valid business registration |
| BL-BUS-02 | GST registered (if threshold met) |
| BL-BUS-03 | Business bank account: 12+ months |
| BL-BUS-04 | No business CIBIL default |

### Location Rules

| Rule ID | Rule |
|---------|------|
| BL-LOC-01 | Business operating address verified |
| BL-LOC-02 | Industry restrictions by geography (lender-specific) |

## 6.6 Auto Loan Eligibility Rules

### Income Rules

| Rule ID | Rule |
|---------|------|
| AL-INC-01 | Minimum income: ₹20,000/month |
| AL-INC-02 | FOIR: ≤50% |
| AL-INC-03 | Loan amount: Up to 10x monthly income (indicative) |

### Age Rules

| Rule ID | Rule |
|---------|------|
| AL-AGE-01 | Applicant: 21–60 |
| AL-AGE-02 | Vehicle age at end of tenure: ≤12 years (used) |

### Employment Rules

| Type | Stability |
|------|-----------|
| Salaried | 1 year |
| Self-employed | 2 years |

### Location Rules

Dealer/service center availability in location for new cars; valuation partner coverage for used.

## 6.7 Eligibility Output Schema

| Field | Description |
|-------|-------------|
| `eligibility_status` | ELIGIBLE / CONDITIONAL / INELIGIBLE |
| `max_loan_amount` | Calculated maximum |
| `recommended_tenure` | Optimal tenure |
| `recommended_lenders` | Ranked lender list |
| `conditions` | Array of conditions (co-applicant, collateral, etc.) |
| `rejection_reasons` | Array if ineligible |
| `confidence_score` | 0–100 (AI-augmented) |
| `foir` | Calculated FOIR |
| `ltv` | Calculated LTV (if applicable) |
| `dscr` | Calculated DSCR (if business) |

---

# 7. DOCUMENT FRAMEWORK

## 7.1 Document Category Definitions

| Category | Code | Description |
|----------|------|-------------|
| KYC | DOC-KYC | Identity and address verification |
| Income | DOC-INC | Earnings proof |
| Business | DOC-BUS | Business existence and performance |
| Property | DOC-PROP | Real estate documentation |
| Vehicle | DOC-VEH | Vehicle purchase and ownership |
| Banking | DOC-BNK | Bank account conduct |
| Application | DOC-APP | Forms and declarations |
| Legal | DOC-LEG | Title, valuation, legal reports |
| Existing Loan | DOC-EXIST | BT/top-up existing loan docs |

## 7.2 Master Document Matrix

| Document | HL | LAP | BL | AL | Mandatory/Optional |
|----------|----|----|----|----|-------------------|
| **KYC DOCUMENTS** |
| PAN Card | ✓ | ✓ | ✓ | ✓ | Mandatory |
| Aadhaar Card | ✓ | ✓ | ✓ | ✓ | Mandatory |
| Passport size photo | ✓ | ✓ | ✓ | ✓ | Mandatory |
| Address proof (current) | ✓ | ✓ | ✓ | ✓ | Mandatory |
| Address proof (permanent) | ✓ | ✓ | ✓ | ✗ | Mandatory (HL/LAP/BL) |
| **INCOME DOCUMENTS** |
| Salary slip (3 months) | ✓ | ✓ | ✗ | ✓ | Mandatory (salaried) |
| Form 16 (2 years) | ✓ | ✓ | ✗ | ✓ | Mandatory (salaried) |
| ITR (2 years) | ✓* | ✓ | ✓ | ✓* | Mandatory (SE/Business) |
| Bank statement (6 months) | ✓ | ✓ | ✓ | ✓ | Mandatory |
| Bank statement (12 months) | ✓* | ✓ | ✓ | ✗ | Mandatory (SE/Business) |
| Employment certificate | ✓ | ✓ | ✗ | ✓ | Optional |
| **BUSINESS DOCUMENTS** |
| Business registration | ✗ | ✓* | ✓ | ✗ | Mandatory (business) |
| GST certificate | ✗ | ✓* | ✓ | ✗ | Mandatory (if registered) |
| GST returns (12 months) | ✗ | ✓* | ✓ | ✗ | Mandatory (if registered) |
| Partnership deed / MOA | ✗ | ✓* | ✓ | ✗ | Mandatory (entity) |
| Business financials (2 years) | ✗ | ✓* | ✓ | ✗ | Mandatory (BL) |
| **PROPERTY DOCUMENTS** |
| Sale agreement / allotment | ✓ | ✗ | ✗ | ✗ | Mandatory (HL purchase) |
| Sale deed (owned property) | ✗ | ✓ | ✗ | ✗ | Mandatory (LAP) |
| Property tax receipts | ✓ | ✓ | ✗ | ✗ | Mandatory |
| Encumbrance certificate | ✓ | ✓ | ✗ | ✗ | Mandatory |
| Approved building plan | ✓ | ✓ | ✗ | ✗ | Mandatory |
| Occupancy certificate | ✓ | ✓ | ✗ | ✗ | Mandatory (ready) |
| Chain of title (30 years) | ✓ | ✓ | ✗ | ✗ | Mandatory |
| **VEHICLE DOCUMENTS** |
| Proforma invoice (new) | ✗ | ✗ | ✗ | ✓ | Mandatory |
| Quotation / valuation (used) | ✗ | ✗ | ✗ | ✓* | Mandatory (used) |
| Driving license | ✗ | ✗ | ✗ | ✓ | Mandatory |
| RC book (used/refinance) | ✗ | ✗ | ✗ | ✓* | Mandatory |
| Insurance (comprehensive) | ✗ | ✗ | ✗ | ✓ | Mandatory (disbursement) |
| **EXISTING LOAN DOCUMENTS** |
| Loan account statement (12M) | ✓* | ✓* | ✗ | ✓* | Mandatory (BT/top-up) |
| Foreclosure letter | ✓* | ✓* | ✗ | ✓* | Mandatory (BT) |
| Existing sanction letter | ✓* | ✓* | ✗ | ✓* | Optional |
| **APPLICATION DOCUMENTS** |
| Loan application form | ✓ | ✓ | ✓ | ✓ | Mandatory |
| Customer consent (OTP) | ✓ | ✓ | ✓ | ✓ | Mandatory |
| End-use declaration | ✓ | ✓ | ✓ | ✗ | Mandatory |
| ACH/ECS mandate | ✓ | ✓ | ✓ | ✓ | Mandatory (pre-disbursement) |

*✓ = required when applicable to applicant type or product variant*

## 7.3 Product-Specific Document Checklists

### HL-01 Fresh Home Loan — Salaried

1. PAN, Aadhaar, photo, address proof
2. 3 months salary slip
3. 6 months salary-credited bank statement
4. Form 16 (latest 2 years)
5. Employment certificate / appointment letter
6. Property sale agreement / allotment letter
7. Property payment receipts
8. Property tax receipt
9. Approved plan, OC/CC (if ready)
10. Loan application + consent

### HL-02 BT — Additional

11. Existing loan statement (12 months)
12. Foreclosure letter
13. List of documents from existing lender

### LAP-01 Fresh — Self-Employed Business Use

1. PAN, Aadhaar (all owners), photo
2. ITR (2 years) — personal + business
3. 12 months business bank statement
4. GST certificate + returns (if applicable)
5. Business registration proof
6. Sale deed, EC, property tax, approved plan
7. End-use declaration (business)
8. Loan application + consent

### BL-01 Business Loan — Pvt Ltd

1. PAN (company + directors), Aadhaar, photo
2. MOA, AOA, COI, board resolution
3. ITR (company, 2 years)
4. GST returns (12 months)
5. 12 months business bank statement
6. Financials (P&L, balance sheet, 2 years)
7. Director CIBIL consent
8. Loan application + business profile

### AL-01 New Car — Salaried

1. PAN, Aadhaar, photo, address proof
2. 3 months salary slip
3. 6 months bank statement
4. Driving license
5. Dealer proforma invoice
6. Loan application + consent

## 7.4 Document Validation Rules

| Validation | Method | Failure Action |
|------------|--------|----------------|
| PAN format + name match | OCR + API | Reject document |
| Aadhaar masked storage | OCR + vault | Reject if unreadable |
| Salary slip continuity | OCR date check | Request missing months |
| Bank statement continuity | OCR page analysis | Request complete statement |
| ITR assessment year | OCR year check | Request correct years |
| Property deed party names | OCR name match | Flag for legal review |
| Invoice amount vs. loan | Cross-check | Flag mismatch |
| Document freshness | Date rules (e.g., bank stmt <30 days) | Request updated |

---

# 8. LEAD QUALIFICATION MODEL

## 8.1 Qualification Framework

```
LEAD INGESTION → ENRICHMENT → SCORING → CLASSIFICATION → ROUTING
```

| Stage | Input | Output |
|-------|-------|--------|
| Enrichment | Mobile, product interest, source | Profile + bureau (if consented) |
| Scoring | 15 factors (weighted) | Score 0–100 |
| Classification | Score + gates | Hot / Warm / Cold / Rejected |
| Routing | Classification + product | Executive assignment + priority |

## 8.2 Lead Classification Definitions

| Class | Score Range | Definition | SLA | Routing |
|-------|-------------|------------|-----|---------|
| **Hot Lead** | 80–100 | High intent, qualified, ready to proceed | 15 min contact | Senior executive / immediate |
| **Warm Lead** | 50–79 | Interest confirmed, partial qualification | 2 hour contact | Standard assignment |
| **Cold Lead** | 20–49 | Early stage, incomplete data, long timeline | 24 hour contact | Nurture queue |
| **Rejected Lead** | 0–19 or gate fail | Ineligible, fraud risk, or explicit disqualification | No contact (auto) | Rejection notification |

## 8.3 Qualification Factors (15 Factors)

| # | Factor | Weight | Hot Signal | Cold Signal |
|---|--------|--------|------------|-------------|
| 1 | Income eligibility | 15% | Meets threshold | Unknown/below |
| 2 | CIBIL score | 12% | 700+ | <650 or unknown |
| 3 | Product-need match | 10% | Exact product fit | Vague/exploratory |
| 4 | Timeline | 10% | <30 days | >90 days |
| 5 | Document readiness | 8% | 50%+ ready | None |
| 6 | Property/vehicle identified | 10% | Confirmed | Not identified |
| 7 | Down payment readiness | 8% | Ready | Not arranged |
| 8 | Employment/business stability | 7% | 3+ years | <1 year |
| 9 | FOIR headroom | 7% | <40% | >55% |
| 10 | Lead source quality | 5% | DSA/referral (trusted) | Unknown/cold campaign |
| 11 | Engagement level | 5% | Multi-touch engaged | Single touch |
| 12 | Geographic eligibility | 3% | Approved location | Restricted |
| 13 | Existing customer | 3% | Repeat customer | New unknown |
| 14 | Co-applicant availability | 3% | Co-applicant ready | Needed but unavailable |
| 15 | AI intent score | 2% | High (conversation analysis) | Low |

## 8.4 Product-Specific Qualification Gates

| Product | Auto-Reject Gates |
|---------|-------------------|
| Home Loan | Age out of range; CIBIL <600; no income proof path |
| LAP | No property ownership; title dispute flagged |
| Business Loan | Vintage <1 year; no business bank account |
| Auto Loan | Income <₹15,000; vehicle not identified (for hot) |

## 8.5 Lead Qualification Workflow

| Step | Actor | Action |
|------|-------|--------|
| 1 | System | Lead captured; initial score calculated |
| 2 | System | Classification assigned |
| 3 | System | Routing per classification SLA |
| 4 | Sales Executive | Contact; validate factors; update score |
| 5 | AI Copilot | Suggest qualification questions |
| 6 | Sales Executive | Promote/demote classification |
| 7 | System | Qualified lead → application creation |
| 8 | System | Rejected lead → reason captured; nurture or close |

## 8.6 Rejected Lead Reasons

| Code | Reason | Nurture Eligible |
|------|--------|------------------|
| R-01 | Below minimum income | ✓ (6 months) |
| R-02 | CIBIL too low | ✓ (credit improvement) |
| R-03 | Age ineligible | ✗ |
| R-04 | Geographic restriction | ✓ (if expansion) |
| R-05 | Property/legal issue | ✓ (if resolvable) |
| R-06 | Fraud suspected | ✗ |
| R-07 | Customer not interested | ✓ (3 months) |
| R-08 | Duplicate lead | ✗ |
| R-09 | Unable to contact (5+ attempts) | ✓ (1 month) |
| R-10 | Product mismatch | ✓ (alternate product) |

---

# 9. AI PRODUCT RECOMMENDATION ENGINE

## 9.1 Engine Architecture

```
CUSTOMER INPUTS                    AI RECOMMENDATION ENGINE                    OUTPUTS
───────────────                    ────────────────────────                    ───────
Profile (age, employment)    →     Product Matcher           →              Recommended Product
Income (stated/uploaded)     →     Variant Selector          →              Recommended Variant
Need/purpose                 →     Amount Calculator         →              Recommended Amount
CIBIL (if available)         →     Lender Ranker             →              Ranked Lenders (1–5)
Property/vehicle data        →     Cross-sell Identifier     →              Cross-sell Offers
Behavioral signals           →     Confidence Scorer         →              Confidence + Explanation
```

## 9.2 Product Recommendation Logic

| Customer Signal | Recommended Product | Rationale |
|-----------------|--------------------|-----------|
| "Buy home/apartment" | HL-01 Fresh Home Loan | Direct need match |
| "Have home loan, high rate" | HL-02 BT | Savings opportunity |
| "Need money, own house" | LAP-01 Fresh LAP | Asset leverage |
| "Business expansion" | BL-01 Business Loan | Business use |
| "Buy car" | AL-01 New Car Loan | Vehicle purchase |
| "Buy used car" | AL-02 Used Car Loan | Age-adjusted product |
| "Need working capital" | BL-03 WC Loan or BL-04 OD | Short-term need |
| "Have LAP, need more" | LAP-03 Top-Up | Existing relationship |
| High FOIR + property owner | LAP instead of personal | Secured lower rate |
| Low ticket + salaried | AL or BL (not HL) | Ticket-size match |

## 9.3 Variant Recommendation Logic

| Base Product | Variant Selection Rule |
|--------------|----------------------|
| Home Loan | Existing loan? → BT. Need more funds + existing? → BT+Top-Up. Need more only? → Top-Up. Else → Fresh |
| LAP | Same logic as HL |
| Business Loan | WC need <36 months? → BL-03. MSME micro? → BL-02. OD need? → BL-04. Default → BL-01 |
| Auto Loan | New car? → AL-01. Used? → AL-02. Commercial reg? → AL-03. EV model? → AL-04 |

## 9.4 Loan Amount Recommendation

| Calculation Step | Formula |
|------------------|---------|
| Income-based max | Net monthly income × multiplier (product-specific) |
| FOIR-based max | (Income × FOIR limit) - existing EMIs → max EMI → reverse calculate loan |
| LTV-based max (secured) | Asset value × LTV - down payment |
| **Recommended amount** | Minimum of applicable caps × 90% (conservative buffer) |

| Product | Income Multiplier | FOIR Limit |
|---------|-------------------|------------|
| Home Loan | 60x monthly | 50% |
| LAP | 50x monthly | 60% |
| Business Loan | DSCR-based | N/A |
| Auto Loan | 10x monthly | 50% |

## 9.5 Lender Recommendation Logic

| Ranking Factor | Weight |
|----------------|--------|
| Eligibility match (hard gates) | Elimination (must pass) |
| Approval rate (historical, similar profile) | 25% |
| ROI competitiveness | 20% |
| Processing TAT | 15% |
| Commission yield | 15% |
| Customer preference (if stated) | 10% |
| Geographic coverage | 10% |
| Product specialization | 5% |

**Output:** Top 3–5 lenders with probability of approval score and expected TAT.

## 9.6 Cross-Sell Recommendation Logic

| Trigger | Cross-Sell | Timing |
|---------|------------|--------|
| HL sanction | Home insurance + life insurance | Pre-disbursement |
| LAP sanction (business use) | Business insurance, GST services | Pre-disbursement |
| AL sanction | Motor insurance, extended warranty | Pre-disbursement |
| BL sanction | OD/CC, business insurance | Post-disbursement |
| 12 months post-HL disbursement | Top-up, personal loan | Proactive outreach |
| 12 months post-any disbursement | BT (competitive defense) | Monitoring trigger |
| High CIBIL + salaried | Credit card | Post-disbursement |
| HNI (LAP >₹50L) | MF, FD, wealth | RM engagement |
| Any disbursement | Customer referral program | 30 days post |

## 9.7 AI Advisor vs. AI Sales Copilot

| Capability | AI Advisor (Customer) | AI Sales Copilot (Internal) |
|------------|----------------------|----------------------------|
| Product recommendation | ✓ (customer language) | ✓ (with commission insight) |
| Eligibility check | ✓ (simplified) | ✓ (detailed) |
| Lender recommendation | ✓ (top 3, no commission data) | ✓ (with approval probability) |
| Cross-sell | ✓ (customer benefit framing) | ✓ (revenue framing) |
| Objection handling | ✓ (FAQ) | ✓ (scripts) |
| Document guidance | ✓ (checklist) | ✓ (deficiency resolution) |

## 9.8 Explanation & Transparency

Every recommendation includes:
- **Why this product** (1–2 sentences, customer-friendly)
- **Why this amount** (income/LTV basis)
- **Why these lenders** (rate, speed, approval likelihood)
- **What to prepare next** (document checklist)
- **Confidence level** (High / Medium / Low)

---

# 10. LENDER MAPPING FRAMEWORK

## 10.1 Lender Categories

| Category | Examples | Typical Products | Integration |
|----------|----------|------------------|-------------|
| **Public Sector Banks** | SBI, BoB, PNB | HL, LAP, BL, AL | Portal + API (future) |
| **Private Banks** | HDFC, ICICI, Axis, Kotak | HL, LAP, BL, AL | Portal + API |
| **NBFCs (Housing)** | LIC HFL, PNB HFL, DHFL successors | HL, LAP | Portal |
| **NBFCs (General)** | Bajaj, Tata Capital, Fullerton | BL, AL, LAP | Portal + API |
| **Fintech Lenders** | Digital-first lenders | BL (small), AL | API-first |

## 10.2 Lender Master Schema

| Field | Description |
|-------|-------------|
| `lender_id` | Unique identifier |
| `lender_name` | Display name |
| `lender_type` | Bank / NBFC / Fintech |
| `products_supported` | Array of product IDs |
| `geographies` | Approved states/cities/pin codes |
| `min_ticket` / `max_ticket` | Per product |
| `roi_range` | Min–max ROI per product |
| `processing_fee` | Structure (flat / %) |
| `typical_tat` | Days to sanction/disbursement |
| `ltv_limits` | Per property/vehicle type |
| `foir_limits` | Per employment type |
| `commission_structure` | % or flat per product |
| `integration_type` | Portal / API / Manual |
| `approval_rate` | Historical (updated monthly) |
| `status` | Active / Suspended / Onboarding |

## 10.3 Product-Lender Mapping Matrix (Indicative)

| Product | PSU Banks | Private Banks | Housing NBFCs | General NBFCs | Fintech |
|---------|-----------|---------------|---------------|---------------|---------|
| HL-01 Fresh | ✓ | ✓ | ✓ | ✗ | ✗ |
| HL-02 BT | ✓ | ✓ | ✓ | ✗ | ✗ |
| HL-03 Top-Up | ✓ | ✓ | ✓ | ✗ | ✗ |
| LAP-01 | ✓ | ✓ | ✓ | ✓ | ✗ |
| BL-01 | ✓ | ✓ | ✗ | ✓ | ✓ |
| BL-02 MSME | ✓ | ✓ | ✗ | ✓ | ✓ |
| BL-03 WC | ✓ | ✓ | ✗ | ✓ | ✗ |
| AL-01 New | ✓ | ✓ | ✗ | ✓ | ✗ |
| AL-02 Used | ✗ | ✓ | ✗ | ✓ | ✓ |

## 10.4 Eligibility Policy Mapping

Each lender maintains **policy profiles** per product:

| Policy Parameter | Example (HL — Lender A) | Example (BL — Lender B) |
|------------------|------------------------|------------------------|
| Min CIBIL | 700 | 680 |
| Max FOIR | 50% | N/A (DSCR 1.25) |
| Min income | ₹25,000 | ₹30,000 turnover |
| Max LTV | 80% | N/A |
| Max tenure | 30 years | 5 years |
| Age range | 21–60 | Promoter 25–65 |
| Negative industries | None | Real estate, gambling |
| Geographic | Pan-India | Metro + tier 1 |

**Engine behavior:** Hard gate on policy mismatch → lender excluded from recommendation.

## 10.5 ROI & Fee Mapping

| Product | Typical ROI Range | Processing Fee | Prepayment Charges |
|---------|-------------------|----------------|-------------------|
| Home Loan | 8.50%–10.50% | 0.25%–1% | Nil–2% (lender) |
| LAP | 9.50%–12.50% | 0.5%–2% | 2–4% (first 1–3 years) |
| Business Loan | 14%–22% | 1%–3% | 2–4% |
| Auto Loan (new) | 8.50%–12% | ₹2K–10K | 2–5% |
| Auto Loan (used) | 10%–15% | ₹3K–15K | 2–5% |

**Platform displays:** Indicative range at eligibility; final rate at lender sanction.

## 10.6 Lender Routing Logic

```
1. Filter: Product support + geography + ticket size
2. Filter: Hard eligibility (CIBIL, FOIR, LTV, age)
3. Rank: Approval rate + ROI + TAT + commission
4. Apply: Customer preference (if any)
5. Apply: Load balancing (avoid single-lender concentration >40%)
6. Output: Primary lender + 2 alternates
```

## 10.7 Lender Onboarding Phases

| Phase | Lenders | Products | Timeline |
|-------|---------|----------|----------|
| Phase 1 | 3–5 (1 PSU, 2 private, 1 NBFC) | HL, LAP, BL, AL | Launch |
| Phase 2 | +5–8 | All variants | Month 3–6 |
| Phase 3 | +10–15 | Full coverage + BT/top-up | Month 6–12 |
| Phase 4 | API integrations | Straight-through processing | Month 12+ |

---

# 11. APPLICATION LIFECYCLE

## 11.1 Universal Lifecycle Stages

```
┌──────────┐   ┌───────────┐   ┌──────────────┐   ┌─────────────┐   ┌───────────┐
│  LEAD    │──►│ QUALIFIED │──►│  DOCUMENT    │──►│ ELIGIBILITY │──►│ BANK      │
│ CREATED  │   │           │   │  COLLECTION  │   │  CHECK      │   │ LOGIN     │
└──────────┘   └───────────┘   └──────────────┘   └─────────────┘   └───────────┘
                                                                        │
┌──────────┐   ┌───────────┐   ┌──────────────┐   ┌─────────────┐       │
│ CLOSURE  │◄──│DISBURSEMENT│◄──│  SANCTION    │◄──│  CREDIT       │◄──────┘
│          │   │           │   │              │   │  REVIEW      │
└──────────┘   └───────────┘   └──────────────┘   └─────────────┘
```

## 11.2 Stage Definitions

| Stage | Code | Definition | Primary Actor | Entry Criteria | Exit Criteria |
|-------|------|------------|---------------|----------------|---------------|
| **Lead Created** | S01 | Lead captured in LMS | System / DSA / Customer | Contact info + product interest | Lead assigned |
| **Qualified** | S02 | Lead validated as pursue-worthy | Sales Executive | Contact made; basic eligibility | Application created |
| **Document Collection** | S03 | Required documents gathered | Sales Executive / Customer | Application created | All mandatory docs uploaded |
| **Eligibility Check** | S04 | Engine + credit pre-assessment | System / Credit Executive | Documents complete | Eligibility confirmed or rejected |
| **Bank Login** | S05 | Application submitted to lender | Operations Executive | Credit approved for submission | Lender acknowledgment |
| **Credit Review** | S06 | Lender underwriting | Lender (+ Credit Executive support) | Bank login complete | Lender decision |
| **Sanction** | S07 | Lender sanction issued | Lender / Operations | Credit approved by lender | Sanction letter issued |
| **Disbursement** | S08 | Funds released | Lender / Operations | Sanction accepted; pre-disbursement conditions met | Funds transferred |
| **Closure** | S09 | Application complete; handoff to RM | System | Disbursement confirmed | Portfolio assigned to RM |

## 11.3 Stage SLA Targets

| Stage | SLA | Escalation |
|-------|-----|------------|
| S01 → S02 (Lead to Qualified) | 24 hours | Branch Manager at 48h |
| S02 → S03 (Qualified to Docs started) | 48 hours | Branch Manager at 72h |
| S03 → S04 (Docs complete) | 5 days | Sales Executive manager at 7d |
| S04 → S05 (Eligibility to Bank login) | 24 hours | Operations Head at 48h |
| S05 → S06 (Bank login to lender review) | 48 hours | Operations at 72h |
| S06 → S07 (Credit review to sanction) | Lender SLA (5–15 days) | Operations at SLA+2d |
| S07 → S08 (Sanction to disbursement) | 3 days | Operations at 5d |
| S08 → S09 (Disbursement to closure) | 24 hours | Automatic |

## 11.4 Stage Status Codes (Customer-Facing)

| Internal Stage | Customer Milestone |
|----------------|-------------------|
| S01 Lead Created | "Application Initiated" |
| S02 Qualified | "Under Review" |
| S03 Document Collection | "Documents Required" / "Documents Under Review" |
| S04 Eligibility Check | "Eligibility Verified" |
| S05 Bank Login | "Submitted to Bank" |
| S06 Credit Review | "Under Bank Review" |
| S07 Sanction | "Approved" / "Conditionally Approved" |
| S08 Disbursement | "Disbursement in Progress" → "Disbursed" |
| S09 Closure | "Complete" |
| Rejected (any stage) | "Not Approved" (with reason category) |
| Withdrawn | "Withdrawn" |

## 11.5 Rejection Points

| Stage | Rejection Type | Reason Examples |
|-------|---------------|-----------------|
| S02 | Qualification reject | Not interested, unqualified |
| S04 | Eligibility reject | FOIR, CIBIL, LTV fail |
| S06 | Lender reject | Underwriting decline |
| S07 | Sanction decline | Terms not accepted |
| S08 | Disbursement hold | Legal/valuation issue |

## 11.6 Rework Loops

| From Stage | Rework Trigger | Return To |
|------------|---------------|-----------|
| S04 | Document deficiency | S03 |
| S05 | Lender query | S03 or S04 |
| S06 | Lender conditional | S03 |
| S07 | Sanction terms mismatch | S06 |
| S08 | Pre-disbursement condition | S03 or S07 |

---

# 12. PRODUCT WORKFLOW MATRIX

## 12.1 Stage Participation by Product

| Stage | HL | LAP | BL | AL | Sub-Stages Vary |
|-------|----|----|----|----|-----------------|
| S01 Lead Created | ✓ | ✓ | ✓ | ✓ | — |
| S02 Qualified | ✓ | ✓ | ✓ | ✓ | — |
| S03 Document Collection | ✓ | ✓ | ✓ | ✓ | Product checklist |
| S04 Eligibility Check | ✓ | ✓ | ✓ | ✓ | FOIR vs. DSCR |
| S05 Bank Login | ✓ | ✓ | ✓ | ✓ | Portal per lender |
| S06 Credit Review | ✓ | ✓ | ✓ | ✓ | Lender TAT varies |
| S07 Sanction | ✓ | ✓ | ✓ | ✓ | — |
| S08 Disbursement | ✓ | ✓ | ✓ | ✓ | Staged vs. single |
| S09 Closure | ✓ | ✓ | ✓ | ✓ | RM handoff |

## 12.2 Product-Specific Sub-Stages

### Home Loan Sub-Stages

| Sub-Stage | Stage | Description |
|-----------|-------|-------------|
| S03a | Document Collection | Property documents |
| S04a | Eligibility | Property approval check |
| S06a | Credit Review | Legal verification initiated |
| S06b | Credit Review | Technical valuation |
| S07a | Sanction | Sanction letter issued |
| S08a | Disbursement | Registration (if purchase) |
| S08b | Disbursement | Staged disbursement (UC property) |

### LAP Sub-Stages

| Sub-Stage | Stage | Description |
|-----------|-------|-------------|
| S04a | Eligibility | Property valuation |
| S04b | Eligibility | Legal title verification |
| S07a | Sanction | MOD registration |
| S08a | Disbursement | Single tranche to account |

### Business Loan Sub-Stages

| Sub-Stage | Stage | Description |
|-----------|-------|-------------|
| S03a | Document Collection | Business financials |
| S04a | Eligibility | Cash flow analysis (AI) |
| S04b | Eligibility | DSCR calculation |
| S06a | Credit Review | Business visit (if required) |
| S08a | Disbursement | Single tranche |

### Auto Loan Sub-Stages

| Sub-Stage | Stage | Description |
|-----------|-------|-------------|
| S03a | Document Collection | Vehicle invoice/valuation |
| S04a | Eligibility | LTV calculation |
| S07a | Sanction | Dealer payment authorization |
| S08a | Disbursement | Direct to dealer |
| S08b | Disbursement | RC hypothecation |

## 12.3 BT/Top-Up Workflow Variations

| Variant | Additional Stages | Skipped Stages |
|---------|-------------------|----------------|
| HL-02 BT | Foreclosure letter, LOD transfer | Property purchase docs |
| HL-03 Top-Up | Existing loan statement | Full property re-verification |
| HL-04 BT+Top-Up | Combined foreclosure + top-up | — |
| LAP-02/03/04 | Same pattern as HL | — |
| AL-05/06/07 | Vehicle re-valuation; existing loan stmt | Dealer invoice (if refinance) |

## 12.4 Workflow Duration Matrix (Target TAT in Days)

| Product | S01→S03 | S03→S05 | S05→S07 | S07→S08 | **Total** |
|---------|---------|---------|---------|---------|-----------|
| HL-01 Fresh | 3 | 5 | 10 | 3 | **21** |
| HL-02 BT | 2 | 3 | 8 | 5 | **18** |
| HL-03 Top-Up | 1 | 2 | 5 | 2 | **10** |
| LAP-01 Fresh | 2 | 4 | 6 | 2 | **14** |
| LAP-02 BT | 2 | 3 | 5 | 3 | **13** |
| BL-01 | 2 | 3 | 4 | 1 | **10** |
| BL-03 WC | 1 | 2 | 3 | 1 | **7** |
| AL-01 New | 1 | 1 | 2 | 1 | **5** |
| AL-02 Used | 2 | 2 | 3 | 1 | **8** |
| AL-03 CV | 2 | 3 | 5 | 2 | **12** |

## 12.5 Actor-Stage Responsibility Matrix

| Stage | Customer | DSA | Sales Exec | Credit Exec | Ops Exec | Lender | RM |
|-------|----------|-----|------------|-------------|----------|--------|-----|
| S01 | Initiate | Submit | Receive | — | — | — | — |
| S02 | Cooperate | Support | Qualify | — | — | — | — |
| S03 | Upload | Assist | Collect/verify | — | — | — | — |
| S04 | — | — | Support | Assess | — | — | — |
| S05 | — | — | — | — | Submit | Receive | — |
| S06 | Query response | — | Coordinate | Support | Coordinate | Underwrite | — |
| S07 | Accept terms | — | Communicate | — | Process | Issue | — |
| S08 | Complete conditions | — | — | — | Coordinate | Release | — |
| S09 | — | — | — | — | Close | — | Receive |

---

# 13. CROSS-SELL FRAMEWORK

## 13.1 Cross-Sell Architecture

```
PRIMARY PRODUCT DISBURSEMENT
        ↓
TRIGGER ENGINE (rules + AI propensity)
        ↓
CROSS-SELL RECOMMENDATION → RM/Sales/AI Advisor outreach
        ↓
SECONDARY APPLICATION (linked to primary customer)
        ↓
ATTRIBUTION (RM/Sales/AI) → Commission tracking
```

## 13.2 Cross-Sell Product Matrix

| Cross-Sell Product | Trigger Product | Trigger Event | Propensity Factor | Channel |
|-------------------|-----------------|---------------|-------------------|---------|
| **Home Insurance** | HL | Sanction | Property value >₹30L | AI Advisor + Sales |
| **Life Insurance (credit-linked)** | HL, LAP | Sanction | Loan >₹20L | Sales |
| **Motor Insurance** | AL | Sanction | All auto loans | Automated + DSA |
| **Business Insurance** | BL | Sanction | Ticket >₹10L | RM |
| **Credit Card** | HL, AL, BL | 3 months post-disbursement | CIBIL 750+, salaried | AI Advisor + RM |
| **Personal Loan** | HL | 6 months post-disbursement | FOIR headroom >20% | RM |
| **HL Top-Up** | HL | 12 months, 12 EMIs clean | Property appreciation | RM + AI |
| **HL Balance Transfer** | HL (competitor) | Rate monitoring alert | ROI diff >0.5% | AI outbound |
| **LAP Top-Up** | LAP | 12 months clean EMI | Re-valuation gain | RM |
| **BL OD/CC** | BL | Post BL disbursement | WC need indicators | Sales |
| **Mutual Funds** | LAP, HL (HNI) | Disbursement >₹50L | HNI profile | RM (certified) |
| **Fixed Deposit** | Any | Surplus funds identified | Liquidity preference | AI Advisor |
| **Gold Loan** | Any (future) | Rejected/unsecured need | Has gold assets | AI Advisor |
| **Customer Referral** | Any | 30 days post-disbursement | NPS 8+ | AI + RM |

## 13.3 Cross-Sell Timing Rules

| Window | Action |
|--------|--------|
| Pre-disbursement | Insurance (mandatory offer, not mandatory purchase) |
| 0–30 days post | Thank you + referral program introduction |
| 30–90 days post | Credit card, personal loan (if propensity) |
| 90–180 days post | Cross-product needs assessment (RM call) |
| 12 months post | Top-up, BT defense, renewal products |
| Annual | Portfolio review, wealth products (HNI) |

## 13.4 Cross-Sell Attribution

| Role | Attribution % | Condition |
|------|--------------|-----------|
| RM | 70% | RM-initiated or RM-portfolio customer |
| Sales Executive | 70% | Sales-initiated within 90 days of primary |
| AI Advisor (self-serve) | 100% platform | Customer self-converted via AI |
| DSA | 50% | DSA referred cross-sell (negotiable) |

## 13.5 Future Cross-Sell Products

| Product | Timeline | Trigger |
|---------|----------|---------|
| Health Insurance | Year 2 | HL/LAP disbursement |
| Term Insurance | Year 2 | Any loan sanction |
| Demat + MF | Year 2 | HNI, RM certified |
| Credit Score Monitor | Year 1 | All customers (engagement hook) |
| Will/Estate Planning | Year 3 | HNI, LAP >₹1Cr |

---

# 14. REVENUE MODEL

## 14.1 Revenue Streams

| Stream | Description | % of Revenue (Y1 Target) |
|--------|-------------|--------------------------|
| **Commission** | Lender-paid commission on disbursement | 75% |
| **Referral fees** | Builder, dealer, corporate referral arrangements | 8% |
| **Processing fees** | Customer-facing processing fee share (where applicable) | 5% |
| **Value-added services** | Insurance referral, credit report, document services | 7% |
| **Renewal revenue** | BT, top-up, repeat loan commissions | 5% |

## 14.2 Commission Structure by Product

| Product | Commission Type | Typical Range | Clawback Period |
|---------|----------------|---------------|-----------------|
| HL Fresh | % of disbursement | 0.5%–1.5% | 6–12 months |
| HL BT | % of disbursement or flat | 0.3%–1% or ₹10K–50K | 6 months |
| HL Top-Up | % of top-up amount | 0.5%–1.5% | 6 months |
| LAP Fresh | % of disbursement | 0.75%–2% | 6–12 months |
| LAP BT/Top-Up | % or flat | 0.5%–1.5% | 6 months |
| BL | % of disbursement | 1%–3% | 3–6 months |
| BL MSME (scheme) | % (lower) + govt incentive | 0.5%–2% | 3 months |
| AL New | % of disbursement or flat | 0.5%–2% or ₹3K–15K | 3–6 months |
| AL Used | % of disbursement | 1%–2.5% | 3 months |
| OD/CC Assistance | Arrangement fee + trail | ₹5K–25K + 0.1% trail | N/A |

## 14.3 DSA Commission Sharing

| DSA Tier | Share of Kuber Commission | Example (HL ₹50L @ 1%) |
|----------|--------------------------|------------------------|
| Bronze | 60% | Kuber: ₹20K; DSA: ₹30K (of ₹50K total) |
| Silver | 70% | DSA: ₹35K |
| Gold | 75% | DSA: ₹37.5K |
| Platinum | 80% | DSA: ₹40K |

*Exact splits configurable per product and campaign.*

## 14.4 Referral Partner Rewards

| Partner Type | Reward Model | Typical Amount |
|--------------|-------------|----------------|
| Builder | Per disbursement | ₹5,000–₹25,000 |
| Property Dealer | Per disbursement | ₹3,000–₹15,000 |
| CA / Broker | Per disbursement | ₹2,000–₹10,000 |
| Channel Partner | Per disbursement or revenue share | Negotiated |
| Corporate Partner | Revenue share | 10–25% of commission |
| Customer Referral | Flat or voucher | ₹500–₹2,000 |

## 14.5 Processing Fee Revenue

| Product | Customer Fee (Indicative) | Kuber Share |
|---------|----------------------------|-------------|
| HL | 0.5%–1% (often lender-collected) | 20–50% of collected |
| LAP | 0.5%–2% | 20–50% |
| BL | 1%–3% | 30–60% |
| AL | ₹2K–10K flat | 30–50% |

## 14.6 Value-Added Services

| Service | Revenue Model |
|---------|--------------|
| Insurance referral | 15–25% of premium (first year) |
| CIBIL report | ₹50–100 per report (customer or platform) |
| Document attestation | ₹200–500 per document |
| Legal/title search | Markup on vendor cost |
| GST filing (future) | Subscription or per-filing fee |

## 14.7 Renewal Revenue

| Renewal Type | Expected Contribution | Timeline |
|--------------|----------------------|----------|
| Top-up | 10% of HL/LAP commission | 12+ months post |
| Balance Transfer | 8% of HL commission | Ongoing competitive |
| Repeat business loan | 5% of BL commission | Annual WC cycle |
| Auto upgrade (new car) | 5% of AL commission | 3–5 year cycle |

## 14.8 Revenue Forecast Framework (Directional)

| Product | Avg Ticket | Commission % | Commission/Avg Deal | Y1 Volume Target | Y1 Revenue |
|---------|------------|--------------|---------------------|------------------|------------|
| HL | ₹35L | 1% | ₹35,000 | 1,500 | ₹5.25 Cr |
| LAP | ₹25L | 1.5% | ₹37,500 | 800 | ₹3.0 Cr |
| BL | ₹15L | 2% | ₹30,000 | 1,200 | ₹3.6 Cr |
| AL | ₹8L | 1.5% | ₹12,000 | 2,000 | ₹2.4 Cr |
| Cross-sell/VA | — | — | ₹5,000 avg | 1,000 | ₹0.5 Cr |
| **Total** | — | — | — | **6,500** | **₹14.75 Cr** |

*Illustrative; actual targets set during business planning.*

---

# 15. KPI FRAMEWORK

## 15.1 KPI Hierarchy

```
COMPANY KPIs (Management)
    ├── Product Family KPIs (Business Head)
    │   ├── Product Variant KPIs (Product Owner)
    │   │   ├── Channel KPIs (Sales Head)
    │   │   └── Lender KPIs (Operations Head)
    │   └── Geographic KPIs (Regional Manager)
    └── Operational KPIs (Operations Head)
```

## 15.2 Application KPIs

| KPI ID | KPI | Formula | Target (Y1) | Frequency |
|--------|-----|---------|-------------|-----------|
| A-K01 | Total applications | Count all submitted | 15,000+ | Monthly |
| A-K02 | Applications by product | Count per product ID | Per product plan | Monthly |
| A-K03 | Application growth rate | (This month - Last) / Last | 10%+ MoM | Monthly |
| A-K04 | Digital application % | Digital / Total | 70%+ | Monthly |
| A-K05 | DSA-sourced application % | DSA channel / Total | 40%+ | Monthly |
| A-K06 | Application abandonment rate | Abandoned / Started | <20% | Weekly |
| A-K07 | Rework rate | Rework / Submitted | <8% | Weekly |

## 15.3 Approval KPIs

| KPI ID | KPI | Formula | Target | Frequency |
|--------|-----|---------|--------|-----------|
| AP-K01 | Eligibility pass rate | Eligible / Checked | 60%+ | Weekly |
| AP-K02 | Lender approval rate | Approved / Submitted | 65%+ | Weekly |
| AP-K03 | Conditional approval rate | Conditional / Approved | <15% | Monthly |
| AP-K04 | Rejection rate by reason | Count per reason code | Track | Monthly |
| AP-K05 | Approval rate by lender | Per lender_id | Track | Monthly |
| AP-K06 | Approval rate by product | Per product_id | HL 65%, BL 55%, AL 75% | Monthly |
| AP-K07 | AI recommendation accuracy | AI lender match approved / Total AI recommendations | 70%+ | Monthly |

## 15.4 Disbursement KPIs

| KPI ID | KPI | Formula | Target (Y1) | Frequency |
|--------|-----|---------|-------------|-----------|
| D-K01 | Total disbursements | Count disbursed | 6,500+ | Monthly |
| D-K02 | Disbursement value | Sum disbursed amount | ₹1,500+ Cr | Annual |
| D-K03 | Disbursement by product | Count per product | Per plan | Monthly |
| D-K04 | Sanction-to-disbursement rate | Disbursed / Sanctioned | 90%+ | Monthly |
| D-K05 | Average ticket size | Total value / Count | Per product target | Monthly |
| D-K06 | Disbursement growth | MoM growth | 8%+ | Monthly |
| D-K07 | Staged disbursement compliance | On-schedule / Total staged | 95%+ | Monthly |

## 15.5 Revenue KPIs

| KPI ID | KPI | Formula | Target (Y1) | Frequency |
|--------|-----|---------|-------------|-----------|
| R-K01 | Gross commission revenue | Sum commissions | ₹14+ Cr | Monthly |
| R-K02 | Revenue per disbursement | Revenue / Disbursements | ₹22,000+ avg | Monthly |
| R-K03 | Revenue by product | Per product family | HL 35%, LAP 20%, BL 25%, AL 15% | Monthly |
| R-K04 | Revenue by channel | DSA / Direct / Referral | DSA 50%+ | Monthly |
| R-K05 | Cross-sell revenue % | Cross-sell / Total | 5%+ Y1 | Quarterly |
| R-K06 | Commission clawback rate | Clawed back / Paid | <3% | Monthly |
| R-K07 | DSA payout cycle compliance | On-time / Total | 98%+ | Monthly |

## 15.6 Conversion KPIs

| KPI ID | KPI | Formula | Target | Frequency |
|--------|-----|---------|--------|-----------|
| C-K01 | Lead-to-application rate | Applications / Leads | 35%+ | Weekly |
| C-K02 | Application-to-submission rate | Submitted / Applications | 80%+ | Weekly |
| C-K03 | Submission-to-approval rate | Approved / Submitted | 65%+ | Weekly |
| C-K04 | Approval-to-disbursement rate | Disbursed / Approved | 90%+ | Weekly |
| C-K05 | End-to-end conversion | Disbursed / Leads | 15%+ | Monthly |
| C-K06 | Hot lead conversion | Disbursed / Hot leads | 35%+ | Weekly |
| C-K07 | Product switch rate | Switched product / Total | Track (AI optimization) | Monthly |

## 15.7 Turnaround Time KPIs

| KPI ID | KPI | Formula | Target | Frequency |
|--------|-----|---------|--------|-----------|
| T-K01 | Lead-to-contact TAT | First contact - Lead creation | <15 min | Daily |
| T-K02 | Application-to-submission TAT | Submission - Application | <5 days | Weekly |
| T-K03 | Submission-to-sanction TAT | Sanction - Submission | Per lender SLA | Weekly |
| T-K04 | Sanction-to-disbursement TAT | Disbursement - Sanction | <3 days | Weekly |
| T-K05 | End-to-end TAT | Disbursement - Lead | <21 days (HL) | Monthly |
| T-K06 | Document collection TAT | Complete docs - Application | <5 days | Weekly |
| T-K07 | TAT by product | Per product matrix (Section 12.4) | Per target | Monthly |
| T-K08 | TAT by lender | Per lender_id | Track | Monthly |

## 15.8 Product-Specific KPI Summary

| Product | Primary Volume KPI | Primary Quality KPI | Primary TAT KPI |
|---------|-------------------|--------------------|--------------------|
| HL-01 | 1,200 disbursements | 65% approval rate | 21 days E2E |
| HL-02 BT | 300 BT conversions | 70% BT approval | 18 days |
| LAP-01 | 600 disbursements | 55% approval | 14 days |
| BL-01 | 900 disbursements | 50% approval | 10 days |
| AL-01 | 1,500 disbursements | 75% approval | 5 days |

---

# 16. FUTURE PRODUCT EXPANSION

## 16.1 Expansion Roadmap

```
PHASE 1 (Launch)          PHASE 2 (Month 6–12)       PHASE 3 (Year 2)          PHASE 4 (Year 3+)
───────────────           ────────────────────       ────────────────          ────────────────
Home Loan Suite           Personal Loan              Gold Loan                 Wealth Management
LAP Suite                 Credit Cards               Credit Score Monitor      Digital Banking
Business Loan Suite       Insurance (Life, Health)   Video KYC                 International remittance
Auto Loan Suite           Fixed Deposits             eSign                     NRI Services
                          Mutual Funds (basic)       Property Search
```

## 16.2 Future Product Definitions

### Personal Loan (PL) — Phase 2

| Attribute | Detail |
|-----------|--------|
| Purpose | Unsecured personal needs |
| Ticket | ₹50K – ₹25L |
| Tenure | 1 – 5 years |
| Eligibility | CIBIL 750+, salaried, FOIR <50% |
| Cross-sell from | HL/LAP customers with FOIR headroom |
| LOS impact | New product module; same lifecycle |

### Insurance — Phase 2

| Type | Integration |
|------|-------------|
| Life (term, credit-linked) | Cross-sell at HL/LAP sanction |
| Health | Customer app marketplace |
| Motor | Auto loan mandatory offer |
| Property | HL/LAP sanction |
| Revenue | Referral commission from insurer |

### Credit Cards — Phase 2

| Attribute | Detail |
|-----------|--------|
| Type | Referral/partnership model (not issuer) |
| Eligibility | CIBIL 750+, income ₹30K+ |
| Cross-sell | Post-loan disbursement |
| Revenue | Per-approval referral fee |

### Mutual Funds — Phase 2–3

| Attribute | Detail |
|-----------|--------|
| Type | MF distribution (ARN required) |
| Products | SIP, lump sum, tax-saving ELSS |
| Eligibility | KYC compliant; risk profiling |
| Channel | RM (certified), Customer app |
| Revenue | Trail commission |

### Fixed Deposits — Phase 2

| Attribute | Detail |
|-----------|--------|
| Type | Bank FD referral |
| Ticket | ₹10K – ₹1Cr |
| Revenue | Referral fee from bank |
| Cross-sell | HNI LAP/HL customers |

### Gold Loan — Phase 3

| Attribute | Detail |
|-----------|--------|
| Type | Secured against gold ornaments |
| Ticket | ₹10K – ₹50L |
| LTV | Up to 75% of gold value |
| Processing | Branch/partner assisted |
| Revenue | 1–2% commission |

### Credit Score Monitoring — Phase 3

| Attribute | Detail |
|-----------|--------|
| Type | Subscription service |
| Features | Monthly score, factors, improvement tips |
| Revenue | ₹99–299/month subscription |
| Engagement | Retention hook for all customers |

### Wealth Management — Phase 4

| Attribute | Detail |
|-----------|--------|
| Type | Advisory for HNI (AUM >₹50L) |
| Products | MF, bonds, PMS referral, estate planning |
| Channel | Certified RM advisors |
| Revenue | Advisory fee + AUM trail |
| Compliance | SEBI RIA regulations |

## 16.3 Expansion Integration Principles

| Principle | Application |
|-----------|-------------|
| Same lifecycle | All loan products use S01–S09 |
| Product module | New products = new catalog entry + eligibility rules + document checklist |
| Lender mapping | Extend lender master with new product support |
| AI recommendation | Extend recommendation engine with new product signals |
| Cross-sell links | New products added to cross-sell matrix |
| No LOS rebuild | Workflow engine parameterized by product |

## 16.4 Regulatory Considerations for Expansion

| Product | Regulatory Requirement |
|---------|----------------------|
| Insurance | IRDAI corporate agent license |
| Mutual Funds | AMFI ARN registration |
| Credit Cards | Bank partnership (not independent issuer) |
| Wealth Management | SEBI RIA registration (if advisory) |
| Gold Loan | NBFC partnership or own license |

---

# APPENDIX A: PRODUCT CODE REFERENCE

| Code | Product Name | Family |
|------|-------------|--------|
| HL-01 | Fresh Home Loan | Home Loan |
| HL-02 | Home Loan Balance Transfer | Home Loan |
| HL-03 | Home Loan Top-Up | Home Loan |
| HL-04 | Home Loan BT + Top-Up | Home Loan |
| LAP-01 | Fresh LAP | LAP |
| LAP-02 | LAP Balance Transfer | LAP |
| LAP-03 | LAP Top-Up | LAP |
| LAP-04 | LAP BT + Top-Up | LAP |
| BL-01 | Business Loan | Business |
| BL-02 | MSME Loan | Business |
| BL-03 | Working Capital Loan | Business |
| BL-04 | OD Assistance | Business |
| BL-05 | CC Assistance | Business |
| AL-01 | New Car Loan | Auto |
| AL-02 | Used Car Loan | Auto |
| AL-03 | Commercial Vehicle Loan | Auto |
| AL-04 | EV Loan | Auto |
| AL-05 | Auto Loan Balance Transfer | Auto |
| AL-06 | Auto Loan Top-Up | Auto |
| AL-07 | Auto Refinancing | Auto |

---

# APPENDIX B: LIFECYCLE STATUS CODE REFERENCE

| Code | Internal Status | Customer Status | Terminal |
|------|----------------|-----------------|----------|
| S01 | LEAD_CREATED | Application Initiated | No |
| S02 | QUALIFIED | Under Review | No |
| S03 | DOCUMENT_COLLECTION | Documents Required | No |
| S04 | ELIGIBILITY_CHECK | Eligibility Verified | No |
| S05 | BANK_LOGIN | Submitted to Bank | No |
| S06 | CREDIT_REVIEW | Under Bank Review | No |
| S07 | SANCTIONED | Approved | No |
| S08 | DISBURSED | Disbursed | No |
| S09 | CLOSED | Complete | Yes |
| S10 | REJECTED | Not Approved | Yes |
| S11 | WITHDRAWN | Withdrawn | Yes |
| S12 | ON_HOLD | On Hold | No |

---

# APPENDIX C: GLOSSARY

| Term | Definition |
|------|------------|
| **LTV** | Loan-to-Value ratio — loan amount as % of asset value |
| **FOIR** | Fixed Obligation to Income Ratio — total EMIs as % of income |
| **DSCR** | Debt Service Coverage Ratio — cash flow / debt obligations |
| **BT** | Balance Transfer — moving loan between lenders |
| **Top-Up** | Additional loan on existing secured loan |
| **MOD** | Memorandum of Deposit — property charge registration |
| **LOD** | List of Documents — from existing lender (BT) |
| **OC/CC** | Occupancy Certificate / Completion Certificate |
| **EC** | Encumbrance Certificate — property lien check |
| **CIBIL** | Credit bureau score (300–900) |
| **DPD** | Days Past Due — EMI delay measure |
| **NPA** | Non-Performing Asset |
| **CGTMSE** | Credit Guarantee Fund Trust for Micro and Small Enterprises |
| **MUDRA** | Micro Units Development and Refinance Agency |
| **RERA** | Real Estate Regulatory Authority |
| **ON-ROAD PRICE** | Ex-showroom + RTO + insurance (auto) |
| **Clawback** | Commission reversal if loan cancelled early |

---

# APPENDIX D: DOCUMENT APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO / Managing Director | | | |
| Business Head | | | |
| Head of Operations / Credit | | | |
| Head of Product | | | |
| Compliance Officer | | | |
| Board Representative | | | |

---

# APPENDIX E: REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | Kuber Finserve Product & Strategy Team | Initial Loan Products & Services document |

---

**© 2026 Kuber Finserve. Confidential — For Internal, Product, and Investor Use.**

*This document defines the loan product catalog and business rules foundation for KuberOne. Subsequent documents (PRD, Eligibility Engine Spec, LOS Workflow Spec, Lender Integration Spec) will implement these business rules.*

*Related:*
- [KUBERONE_VISION_AND_OBJECTIVES.md](./KUBERONE_VISION_AND_OBJECTIVES.md)
- [KUBERONE_USER_TYPES_AND_ROLES.md](./KUBERONE_USER_TYPES_AND_ROLES.md)
