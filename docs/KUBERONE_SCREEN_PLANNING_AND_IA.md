# KuberOne
## Screen Planning & Information Architecture (IA) Document

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise UX Architecture — Screen Planning & IA  
**Classification:** Wireframe-Ready | UI/UX Team Ready | Developer Ready | Investor Ready  
**Version:** 1.0  
**Date:** June 2026  
**Related Documents:**
- [KUBERONE_VISION_AND_OBJECTIVES.md](./KUBERONE_VISION_AND_OBJECTIVES.md)
- [KUBERONE_USER_TYPES_AND_ROLES.md](./KUBERONE_USER_TYPES_AND_ROLES.md)
- [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md)
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md)
- [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md)
- [KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md](./KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md)
- [KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md](./KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Information architecture, screen inventory, navigation, components, analytics events |
| **Audience** | UX/UI, Product, Engineering, QA, Analytics |
| **Purpose** | Foundation for wireframes, UI design, development sprints, API mapping, event tracking |
| **Status** | Authoritative UX Planning Document |
| **Out of Scope** | Visual design, color systems, code implementation |

---

## Screen ID Convention

| Prefix | Platform |
|--------|----------|
| `C-` | Customer App |
| `D-` | DSA App |
| `CRM-` | CRM Admin Panel |
| `CRM-AU-` | CRM Authentication |
| `CRM-AD-` | CRM Administration |
| `CRM-COMP-` | CRM Compliance Console |
| `MGT-` | Management Dashboard |
| `SUP-` | Support Portal |
| `KB-` | Knowledge Base (embedded) |
| `FUT-` | Future modules |

---

# 43. EXECUTIVE SUMMARY

*Board-level summary — presented first.*

## Strategic UX Position

KuberOne's information architecture spans **five primary digital surfaces** and **467 planned screens** (Phase 1: **409 screens**; Future modules: **58 screens**) organized into **clear user mental models** per persona:

| Surface | Primary Users | Phase 1 Screens | Total Planned | Core Mental Model |
|---------|--------------|-----------------|---------------|-------------------|
| **Customer App** | Borrowers | 191 | 226 | "Discover → Apply → Track → Grow" |
| **DSA App** | Partners | 55 | 57 | "Submit → Track → Earn" |
| **CRM Admin Panel** | Internal teams | 153 | 168 | "Convert → Process → Govern" |
| **Management Dashboards** | Leadership | 10 | 10 | "Monitor → Decide → Scale" |
| **Lender Portal** (Future) | Lender partners | — | 6 | "Review → Decide → Update" |

**MVP Launch Scope (P0):** ~125 screens across Customer, DSA, and CRM core flows — see Section 42.7.

## IA Design Principles

1. **Task-first navigation** — Users reach primary tasks in ≤3 taps/clicks
2. **Progressive disclosure** — Complex loan flows broken into guided steps
3. **Status transparency** — Application tracking visible at every level
4. **Role-adaptive CRM** — Single panel; navigation adapts to RBAC role
5. **AI embedded, not isolated** — Advisor/Copilot accessible contextually, not buried
6. **Partner isolation** — DSA app shows only partner-scoped data
7. **Future-ready modules** — Insurance, cards, MF slot into existing IA trees

## Business Impact

| Outcome | IA Enabler |
|---------|-----------|
| Higher application completion | Wizard-based application flows with save/resume |
| DSA productivity | Lead submit in <2 minutes from dashboard |
| Sales conversion | CRM priority queue + copilot sidebar on every lead |
| Management visibility | Role-specific dashboards with drill-down paths |
| Analytics fidelity | Screen-level event taxonomy defined per module |

## Development Planning Value

This document provides:
- **Sprint-ready screen backlog** with IDs for Jira/Linear
- **API mapping hints** per screen (domain endpoints)
- **Analytics event names** for product analytics (Mixpanel/Amplitude/Firebase)
- **Navigation spec** for React Navigation (mobile) and React Router (admin)
- **Wireframe scope** — designers can work module-by-module

**Board Recommendation:** Approve this IA as the UX foundation for all KuberOne interface development.

---

# 1. INFORMATION ARCHITECTURE OVERVIEW

## 1.1 Platform IA Map

```
KUBERONE DIGITAL PLATFORM
│
├── CUSTOMER APP (Mobile — React Native + Expo)
│   ├── Public Area
│   ├── Authentication Area
│   ├── Customer Home Area
│   ├── Loan Products Area
│   ├── AI Area (Advisor + Voice)
│   ├── Documents Area
│   ├── Applications Area
│   ├── Referral Area
│   ├── Support Area
│   └── Settings Area
│
├── DSA APP (Mobile — React Native + Expo)
│   ├── Authentication & Onboarding
│   ├── Partner Dashboard
│   ├── Lead Management
│   ├── Commission & Payouts
│   ├── Training & Knowledge
│   ├── Profile & Settings
│   └── Support
│
├── CRM ADMIN PANEL (Web — React + Vite)
│   ├── Authentication
│   ├── Role-Adaptive Dashboards
│   ├── Lead Management (LMS)
│   ├── Customer Management
│   ├── Application Management (LOS)
│   ├── Document Operations
│   ├── Partner Management
│   ├── Commission Management
│   ├── Campaign Management
│   ├── Knowledge Base Admin
│   ├── Analytics & Reports
│   ├── Support Console
│   ├── Compliance Console
│   └── System Admin
│
├── MANAGEMENT DASHBOARDS (Web — CRM subset)
│   ├── CEO Dashboard
│   ├── Director Dashboard
│   ├── Business Head Dashboard
│   ├── Sales Head Dashboard
│   ├── Operations Head Dashboard
│   └── Finance Head Dashboard
│
├── SUPPORT PORTAL (Web — CRM module)
│   ├── Ticket Management
│   ├── Complaint Register
│   ├── Escalation Queue
│   └── SLA Dashboard
│
├── KNOWLEDGE BASE (Embedded + Admin)
│   ├── Customer/DSA: Help & FAQs (in-app)
│   ├── CRM: Agent knowledge search
│   └── Admin: Content CMS
│
└── FUTURE: LENDER PORTAL (Web)
    ├── Application Queue
    ├── Status Updates
    └── Document Exchange
```

## 1.2 Parent-Child Relationship Summary

| Parent | Children |
|--------|----------|
| Customer App Root | Public, Auth, Main (Tab Navigator) |
| Main Tabs | Home, Products, Applications, AI, Profile |
| Products | Catalog → Product Family → Variant → Application Wizard |
| Applications | List → Detail → Timeline / Documents / Comms |
| DSA App Root | Auth, Main (Tab Navigator) |
| DSA Main Tabs | Dashboard, Leads, Commissions, More |
| CRM Root | Layout (sidebar) → Module routes |
| CRM Sidebar | Dashboard, Leads, Customers, Applications, Partners, Documents, Operations, Analytics, Admin |
| Management | Executive layout → Role-specific dashboard |

## 1.3 Cross-Platform Shared Concepts

| Concept | Customer | DSA | CRM |
|---------|----------|-----|-----|
| Application status | Milestone view | Simplified pipeline | Full stage codes |
| Documents | Upload checklist | Assist upload | Verification queue |
| Notifications | In-app center | In-app center | Bell + SLA alerts |
| AI | Advisor chat | — | Sales Copilot sidebar |
| Knowledge | Help center | Training | KB search + CMS |
| Support | Tickets | Tickets | Support console |

---

# 2. CUSTOMER APP INFORMATION ARCHITECTURE

## 2.1 IA Hierarchy Tree

```
Customer App
├── PUBLIC (unauthenticated)
│   ├── Splash
│   ├── Onboarding Carousel
│   ├── Language Selection
│   ├── Product Teaser / Landing
│   └── Guest Eligibility Preview
│
├── AUTHENTICATION
│   ├── Login (Mobile Entry)
│   ├── OTP Verification
│   ├── Registration
│   ├── Consent Capture
│   └── Profile Setup (first-time)
│
├── MAIN — TAB: HOME
│   ├── Dashboard
│   ├── Notifications Center
│   └── Quick Actions
│
├── MAIN — TAB: PRODUCTS
│   ├── Product Catalog
│   ├── Product Families (HL, LAP, BL, AL)
│   ├── Calculators
│   └── Offers & Recommendations
│
├── MAIN — TAB: APPLICATIONS
│   ├── Application List
│   ├── Application Detail
│   └── Application Tracking
│
├── MAIN — TAB: AI
│   ├── AI Advisor Home
│   ├── AI Chat
│   ├── AI Voice
│   └── AI History
│
├── MAIN — TAB: PROFILE
│   ├── Profile Hub
│   ├── KYC Center
│   ├── Document Vault
│   ├── Referral Program
│   ├── Support
│   └── Settings
│
└── MODAL / DEEP LINK OVERLAYS
    ├── Application Wizards (per product)
    ├── Document Upload Flows
    ├── EMI / Eligibility Results
    └── Callback / Appointment
```

## 2.2 Area Definitions

| Area | Purpose | Entry Points |
|------|---------|--------------|
| **Public** | Brand, education, guest eligibility | App launch (first time), deep links |
| **Authentication** | Identity establishment | Login, post-logout |
| **Customer Home** | Status-at-a-glance, next actions | Home tab |
| **Loan Area** | Product discovery and application | Products tab, AI recommendations |
| **Support Area** | Help and issue resolution | Profile → Support |
| **Referral Area** | Refer-and-earn | Profile → Referrals, post-disbursement prompt |
| **Settings Area** | Preferences and privacy | Profile → Settings |

---

# 3. CUSTOMER APP SCREEN INVENTORY

## 3.1 Core App Screens

| Screen ID | Screen Name | Parent | Purpose | Key Actions | API Domain |
|-----------|-------------|--------|---------|-------------|------------|
| C-001 | Splash | Root | Brand load, version check | Auto-navigate | `/public/health` |
| C-002 | Onboarding Carousel | Public | Value proposition (3–5 slides) | Skip, Next, Get Started | — |
| C-003 | Language Selection | Public/Settings | Hindi, English, regional | Select, Save | `/customer/preferences` |
| C-004 | Login — Mobile Entry | Auth | Enter mobile number | Send OTP | `/auth/otp/send` |
| C-005 | OTP Verification | Auth | Verify 6-digit OTP | Verify, Resend | `/auth/otp/verify` |
| C-006 | Registration | Auth | Name, email (optional), consent | Register | `/customer` |
| C-007 | Profile Setup — Basic | Auth | First-time profile completion | Save, Continue | `/customer/profile` |
| C-008 | Dashboard (Home) | Home | Status cards, quick actions, AI entry | Navigate, Apply, Track | `/customer/dashboard` |
| C-009 | Notifications Center | Home | All notifications list | Tap to deep link, Mark read | `/notifications` |
| C-010 | Notification Detail | Notifications | Single notification content | View linked entity | `/notifications/:id` |
| C-011 | Settings Hub | Profile | Settings menu | Navigate sub-settings | — |
| C-012 | Help Center | Support | FAQ categories, search | Search, View article | `/knowledge/faqs` |
| C-013 | Support Hub | Support | Tickets, chat, call | Create ticket, Chat | `/support/tickets` |
| C-014 | Terms & Conditions | Public/Settings | Legal terms | View, Accept | `/public/legal/terms` |
| C-015 | Privacy Policy | Public/Settings | Privacy policy | View | `/public/legal/privacy` |
| C-016 | About KuberOne | Settings | App version, company info | — | `/public/about` |
| C-017 | Guest Product Browse | Public | Browse products without login | Login to apply | `/public/products` |
| C-018 | Guest Eligibility Preview | Public | Basic eligibility without account | Login for full result | `/public/eligibility/preview` |
| C-019 | Consent Management | Auth/Settings | Data processing consents | Toggle, Save | `/customer/privacy/consent` |
| C-020 | App Update Required | Root | Force update gate | Open store | — |

---

# 4. CUSTOMER PROFILE MODULE

| Screen ID | Screen Name | Parent | Purpose | Key Fields/Actions | API Domain |
|-----------|-------------|--------|---------|-------------------|------------|
| C-PR-01 | Profile Hub | Profile tab | Profile completion %, section links | Edit sections | `/customer/profile` |
| C-PR-02 | Personal Details | Profile | Name, DOB, gender, marital status | Edit, Save | `/customer/profile/personal` |
| C-PR-03 | Address Details | Profile | Current + permanent address | Edit, Same as permanent | `/customer/profile/address` |
| C-PR-04 | Employment Details | Profile | Employment type, company, designation | Edit, Save | `/customer/profile/employment` |
| C-PR-05 | Income Details | Profile | Monthly income, other income | Edit, Save | `/customer/profile/income` |
| C-PR-06 | KYC Summary | Profile | KYC status overview | Navigate to KYC module | `/customer/kyc/status` |
| C-PR-07 | Document Vault | Profile | All uploaded documents | View, Download, Re-upload | `/documents` |
| C-PR-08 | Profile Completion | Profile | Gamified completion tracker | Complete missing | `/customer/profile/completion` |
| C-PR-09 | Contact Preferences | Profile | Preferred contact channel | Edit | `/customer/preferences` |
| C-PR-10 | Family / Co-applicant List | Profile | Manage co-applicants | Add, Edit, Remove | `/customer/co-applicants` |
| C-PR-11 | Co-applicant Detail | Profile | Co-applicant profile form | Save | `/customer/co-applicants/:id` |

---

# 5. CUSTOMER KYC MODULE

| Screen ID | Screen Name | Parent | Purpose | Flow | API Domain |
|-----------|-------------|--------|---------|------|------------|
| C-KYC-01 | KYC Center | Profile | Central KYC hub, status badges | Start/Continue KYC | `/customer/kyc` |
| C-KYC-02 | PAN Verification | KYC | PAN entry or upload | Enter PAN, Upload image, Verify | `/customer/kyc/pan` |
| C-KYC-03 | PAN Verification Status | KYC | PAN validation result | Retry, Continue | `/customer/kyc/pan/status` |
| C-KYC-04 | Aadhaar Verification | KYC | Aadhaar OTP or upload | OTP consent, Verify | `/customer/kyc/aadhaar` |
| C-KYC-05 | Aadhaar Verification Status | KYC | Aadhaar result | Retry | `/customer/kyc/aadhaar/status` |
| C-KYC-06 | Photo Upload (Selfie) | KYC | Live photo / selfie capture | Capture, Upload, Retake | `/customer/kyc/photo` |
| C-KYC-07 | Address Proof Upload | KYC | Address document selection | Select type, Upload | `/customer/kyc/address-proof` |
| C-KYC-08 | KYC Status Summary | KYC | Overall KYC state | View deficiencies | `/customer/kyc/status` |
| C-KYC-09 | KYC Consent & Declaration | KYC | Legal consent for KYC | Accept | `/customer/kyc/consent` |

---

# 6. LOAN PRODUCTS MODULE

| Screen ID | Screen Name | Parent | Purpose | Key Actions | API Domain |
|-----------|-------------|--------|---------|-------------|------------|
| C-LP-01 | Product Catalog | Products tab | All product families | Filter, Select | `/products` |
| C-LP-02 | Home Loan Family | Catalog | HL variants list | Select variant | `/products/HL` |
| C-LP-03 | LAP Family | Catalog | LAP variants | Select variant | `/products/LAP` |
| C-LP-04 | Business Loan Family | Catalog | BL variants | Select variant | `/products/BL` |
| C-LP-05 | Auto Loan Family | Catalog | AL variants | Select variant | `/products/AL` |
| C-LP-06 | Product Detail | Product family | Single product info, rates (indicative) | Check eligibility, Apply | `/products/:id` |
| C-CMP-01 | Product Comparison | Catalog | Side-by-side 2–3 products | Add/remove products | `/products/compare` |
| C-OFF-01 | Offers & Promotions | Products/Catalog | Active campaigns, special rates | View offer, Apply | `/campaigns/active` |
| C-REC-01 | AI Recommendations | Products/Home | Personalized product cards | View, Apply | `/ai/advisor/recommendations` |
| C-LP-07 | Product Search | Catalog | Search products | Search | `/products/search` |
| C-LP-08 | Product FAQ | Product detail | Product-specific FAQs | View | `/knowledge/products/:id/faqs` |

---

# 7. HOME LOAN SCREENS

## 7.1 Variant Landing Screens

| Screen ID | Screen Name | Product Code |
|-----------|-------------|--------------|
| C-HL-01 | Fresh Home Loan — Overview | HL-01 |
| C-HL-02 | Home Loan Balance Transfer — Overview | HL-02 |
| C-HL-03 | Home Loan Top-Up — Overview | HL-03 |
| C-HL-04 | Home Loan BT + Top-Up — Overview | HL-04 |

## 7.2 Shared HL Flow Screens (per variant)

| Screen ID | Screen Name | Step | Purpose | API Domain |
|-----------|-------------|------|---------|------------|
| C-HL-E01 | HL Eligibility — Income & Employment | 1 | Capture income inputs | `/eligibility/check` |
| C-HL-E02 | HL Eligibility — Property Details | 2 | Property type, location, value | `/eligibility/check` |
| C-HL-E03 | HL Eligibility — Existing Loan (BT/Top-Up) | 2b | Outstanding, lender, ROI | `/eligibility/check` |
| C-HL-E04 | HL Eligibility Results | 3 | Pass/fail, max amount, lenders | `/eligibility/results/:id` |
| C-HL-A01 | HL Application — Personal Info | 4 | Confirm personal details | `/applications` |
| C-HL-A02 | HL Application — Loan Requirements | 5 | Amount, tenure, purpose | `/applications/:id` |
| C-HL-A03 | HL Application — Property Details | 6 | Full property information | `/applications/:id` |
| C-HL-A04 | HL Application — Co-applicant | 7 | Add co-applicant (optional) | `/applications/:id/co-applicants` |
| C-HL-A05 | HL Application — Review & Submit | 8 | Summary, consent, submit | `/applications/:id/submit` |
| C-HL-D01 | HL Documents — Checklist | 9 | Required docs list with status | `/applications/:id/documents` |
| C-HL-D02 | HL Documents — Upload (per type) | 9b | Camera/gallery upload | `/documents/presign` |
| C-HL-D03 | HL Documents — Deficiency Detail | 9c | Rejection reason, re-upload | `/documents/:id/deficiency` |
| C-HL-S01 | HL Status Tracking | Ongoing | Milestone timeline | `/applications/:id/timeline` |
| C-HL-S02 | HL Sanction Letter View | Post-sanction | View/download sanction | `/applications/:id/sanction` |
| C-HL-S03 | HL Disbursement Confirmation | Post-disburse | Disbursement details | `/applications/:id/disbursement` |
| C-HL-W01 | HL Application Wizard — Saved Draft | Any | Resume incomplete application | `/applications/drafts` |

**HL Screen Count:** 4 overviews + 16 flow screens = **20 screens** (shared flows reused across variants with variant-specific copy)

---

# 8. LAP SCREENS

| Screen ID | Screen Name | Product Code | Notes |
|-----------|-------------|--------------|-------|
| C-LAP-01 | Fresh LAP — Overview | LAP-01 | |
| C-LAP-02 | LAP Balance Transfer — Overview | LAP-02 | |
| C-LAP-03 | LAP Top-Up — Overview | LAP-03 | |
| C-LAP-04 | LAP BT + Top-Up — Overview | LAP-04 | |

| Screen ID | Screen Name | Step | API Domain |
|-----------|-------------|------|------------|
| C-LAP-E01 | LAP Eligibility — Property Owned | 1 | `/eligibility/check` |
| C-LAP-E02 | LAP Eligibility — Income & End-use | 2 | `/eligibility/check` |
| C-LAP-E03 | LAP Eligibility — Existing LAP (BT/Top-Up) | 2b | `/eligibility/check` |
| C-LAP-E04 | LAP Eligibility Results | 3 | `/eligibility/results/:id` |
| C-LAP-A01 | LAP Application — Property Details | 4 | `/applications/:id` |
| C-LAP-A02 | LAP Application — Loan Amount & Tenure | 5 | `/applications/:id` |
| C-LAP-A03 | LAP Application — End-use Declaration | 6 | `/applications/:id` |
| C-LAP-A04 | LAP Application — Review & Submit | 7 | `/applications/:id/submit` |
| C-LAP-D01 | LAP Documents — Checklist | 8 | `/applications/:id/documents` |
| C-LAP-D02 | LAP Documents — Property Papers Upload | 8b | `/documents/presign` |
| C-LAP-D03 | LAP Documents — Income Upload | 8c | `/documents/presign` |
| C-LAP-S01 | LAP Status Tracking | Ongoing | `/applications/:id/timeline` |

**LAP Screen Count:** 4 overviews + 12 flow = **16 screens**

---

# 9. BUSINESS LOAN SCREENS

| Screen ID | Screen Name | Product Code |
|-----------|-------------|--------------|
| C-BL-01 | Business Loan — Overview | BL-01 |
| C-BL-02 | MSME Loan — Overview | BL-02 |
| C-BL-03 | Working Capital Loan — Overview | BL-03 |
| C-BL-04 | OD Assistance — Overview | BL-04 |
| C-BL-05 | CC Assistance — Overview | BL-05 |

| Screen ID | Screen Name | Step | API Domain |
|-----------|-------------|------|------------|
| C-BL-E01 | BL Eligibility — Business Profile | 1 | `/eligibility/check` |
| C-BL-E02 | BL Eligibility — Turnover & Vintage | 2 | `/eligibility/check` |
| C-BL-E03 | BL Eligibility Results | 3 | `/eligibility/results/:id` |
| C-BL-A01 | BL Application — Business Details | 4 | `/applications/:id` |
| C-BL-A02 | BL Application — Promoter Details | 5 | `/applications/:id` |
| C-BL-A03 | BL Application — Loan Purpose & Amount | 6 | `/applications/:id` |
| C-BL-A04 | BL Application — Review & Submit | 7 | `/applications/:id/submit` |
| C-BL-D01 | BL Documents — Business Checklist | 8 | `/applications/:id/documents` |
| C-BL-D02 | BL Documents — GST/ITR Upload | 8b | `/documents/presign` |
| C-BL-D03 | BL Documents — Bank Statement Upload | 8c | `/documents/presign` |
| C-BL-S01 | BL Status Tracking | Ongoing | `/applications/:id/timeline` |

**BL Screen Count:** 5 overviews + 11 flow = **16 screens**

---

# 10. AUTO LOAN SCREENS

| Screen ID | Screen Name | Product Code |
|-----------|-------------|--------------|
| C-AL-01 | New Car Loan — Overview | AL-01 |
| C-AL-02 | Used Car Loan — Overview | AL-02 |
| C-AL-03 | Commercial Vehicle — Overview | AL-03 |
| C-AL-04 | EV Loan — Overview | AL-04 |
| C-AL-05 | Auto BT — Overview | AL-05 |
| C-AL-06 | Auto Top-Up — Overview | AL-06 |
| C-AL-07 | Auto Refinance — Overview | AL-07 |

| Screen ID | Screen Name | Step | API Domain |
|-----------|-------------|------|------------|
| C-AL-E01 | AL Eligibility — Income | 1 | `/eligibility/check` |
| C-AL-E02 | AL Eligibility — Vehicle Details | 2 | `/eligibility/check` |
| C-AL-E03 | AL Eligibility Results | 3 | `/eligibility/results/:id` |
| C-AL-A01 | AL Application — Vehicle Selection | 4 | `/applications/:id` |
| C-AL-A02 | AL Application — Dealer/Invoice Details | 5 | `/applications/:id` |
| C-AL-A03 | AL Application — Loan Amount & Tenure | 6 | `/applications/:id` |
| C-AL-A04 | AL Application — Review & Submit | 7 | `/applications/:id/submit` |
| C-AL-D01 | AL Documents — Checklist | 8 | `/applications/:id/documents` |
| C-AL-D02 | AL Documents — Invoice/RC Upload | 8b | `/documents/presign` |
| C-AL-S01 | AL Status Tracking | Ongoing | `/applications/:id/timeline` |

**AL Screen Count:** 7 overviews + 10 flow = **17 screens**

---

# 11. CALCULATOR MODULE

| Screen ID | Screen Name | Parent | Purpose | API Domain |
|-----------|-------------|--------|---------|------------|
| C-CAL-01 | Calculator Hub | Products | List of calculators | — |
| C-CAL-02 | EMI Calculator | Calculators | Loan amount, rate, tenure → EMI | `/emi/calculate` |
| C-CAL-03 | EMI Results | EMI Calculator | Schedule, chart, apply CTA | `/emi/calculate` |
| C-CAL-04 | Eligibility Calculator | Calculators | Income → max loan | `/eligibility/quick-calc` |
| C-CAL-05 | Eligibility Calculator Results | Calculators | Max amount, FOIR | `/eligibility/quick-calc` |
| C-CAL-06 | BT Savings Calculator | Calculators | Current vs new ROI savings | `/emi/bt-savings` |
| C-CAL-07 | BT Savings Results | Calculators | Lifetime savings display | `/emi/bt-savings` |
| C-CAL-08 | Product Comparison Calculator | Calculators | Compare EMI across products | `/emi/compare` |

---

# 12. AI ADVISOR MODULE

| Screen ID | Screen Name | Parent | Purpose | API Domain |
|-----------|-------------|--------|---------|------------|
| C-AI-01 | AI Advisor Home | AI tab | Entry, suggested questions | `/ai/advisor` |
| C-AI-02 | AI Conversation | AI Advisor | Chat interface (SSE stream) | `/ai/advisor/chat` |
| C-AI-03 | AI Recommendations List | AI Advisor | Product recommendations | `/ai/advisor/recommendations` |
| C-AI-04 | AI Recommendation Detail | Recommendations | Why this product, apply CTA | `/ai/advisor/recommendations/:id` |
| C-AI-05 | AI Eligibility Results | AI Advisor | Conversational eligibility output | `/ai/advisor/eligibility` |
| C-AI-06 | AI Insights — Credit Tips | AI Advisor | Financial wellness tips | `/ai/advisor/insights` |
| C-AI-07 | Conversation History | AI Advisor | Past sessions list | `/ai/advisor/sessions` |
| C-AI-08 | Conversation History Detail | History | Replay session | `/ai/advisor/sessions/:id` |
| C-AI-09 | AI Feedback | Conversation | Rate response | `/ai/advisor/feedback` |
| C-AI-10 | Escalate to Human | Conversation | Create support ticket from chat | `/support/tickets` |

---

# 13. AI VOICE MODULE

| Screen ID | Screen Name | Parent | Purpose | API Domain |
|-----------|-------------|--------|---------|------------|
| C-VOC-01 | Voice AI — Start | AI tab / Home | Intro, mic permission | `/voice/session` |
| C-VOC-02 | Voice Session — Active | Voice | Live conversation UI | `/voice/session/stream` |
| C-VOC-03 | Voice Session — Results | Voice | Transcript summary, actions | `/voice/session/:id/summary` |
| C-VOC-04 | Callback Request | Voice / Support | Request human callback | `/voice/callback` |
| C-VOC-05 | Appointment Booking | Voice | Schedule sales call | `/voice/appointment` |
| C-VOC-06 | Appointment Confirmation | Booking | Confirmed date/time | `/voice/appointment/:id` |
| C-VOC-07 | Voice History | AI tab | Past voice sessions | `/voice/sessions` |

---

# 14. DOCUMENT MANAGEMENT MODULE

| Screen ID | Screen Name | Parent | Purpose | API Domain |
|-----------|-------------|--------|---------|------------|
| C-DOC-01 | Document Dashboard | Applications/Profile | All docs across applications | `/documents` |
| C-DOC-02 | Document Upload — Selector | Checklist | Choose upload method | `/documents/presign` |
| C-DOC-03 | Document Upload — Camera | Upload | Capture document | `/documents/confirm` |
| C-DOC-04 | Document Upload — Gallery | Upload | Pick from gallery | `/documents/confirm` |
| C-DOC-05 | Document Upload — Progress | Upload | Upload progress | `/documents/confirm` |
| C-DOC-06 | Document Verification Status | Document detail | Pending/verified/rejected | `/documents/:id/status` |
| C-DOC-07 | Document Deficiency | Status | What's wrong, how to fix | `/documents/:id/deficiency` |
| C-DOC-08 | Document History (versions) | Document detail | Version list | `/documents/:id/versions` |
| C-DOC-09 | Document Viewer | Document detail | View PDF/image | `/documents/:id/download` |
| C-DOC-10 | Document Vault | Profile | All customer documents | `/documents/vault` |

---

# 15. APPLICATION TRACKING MODULE

| Screen ID | Screen Name | Parent | Purpose | API Domain |
|-----------|-------------|--------|---------|------------|
| C-APP-01 | Application List | Applications tab | All applications filterable | `/applications` |
| C-APP-02 | Application Detail | List | Summary, status, actions | `/applications/:id` |
| C-APP-03 | Application Timeline | Detail | Visual milestone timeline | `/applications/:id/timeline` |
| C-APP-04 | Status History | Detail | Chronological status log | `/applications/:id/status-history` |
| C-APP-05 | Application Documents | Detail | Doc checklist for this app | `/applications/:id/documents` |
| C-APP-06 | Communication History | Detail | SMS/WhatsApp/push log | `/applications/:id/communications` |
| C-APP-07 | Withdraw Application | Detail | Cancel with reason | `/applications/:id/withdraw` |
| C-APP-08 | Post-Disbursement Summary | Detail | Loan terms, EMI, servicing | `/applications/:id/servicing` |
| C-APP-09 | Rate Application Experience | Detail | NPS/CSAT survey | `/applications/:id/feedback` |

---

# 16. REFERRAL MODULE

| Screen ID | Screen Name | Parent | Purpose | API Domain |
|-----------|-------------|--------|---------|------------|
| C-REF-01 | Referral Dashboard | Profile | Program overview, earnings | `/referrals/dashboard` |
| C-REF-02 | Share Referral Link | Dashboard | Copy link, share via WhatsApp | `/referrals/link` |
| C-REF-03 | Referral Tracking List | Dashboard | Referred contacts status | `/referrals` |
| C-REF-04 | Referral Detail | Tracking | Single referral status | `/referrals/:id` |
| C-REF-05 | Rewards Summary | Dashboard | Earned, pending rewards | `/referrals/rewards` |
| C-REF-06 | Payout History | Rewards | Reward payout log | `/referrals/payouts` |
| C-REF-07 | Referral Leaderboard | Dashboard | Top referrers (optional) | `/referrals/leaderboard` |
| C-REF-08 | Referral Terms | Dashboard | Program T&C | `/public/legal/referral-terms` |
| C-REF-09 | Invite Contacts | Dashboard | Contact picker (permission) | `/referrals/invite` |

---

# 17. SUPPORT MODULE

| Screen ID | Screen Name | Parent | Purpose | API Domain |
|-----------|-------------|--------|---------|------------|
| C-SUP-01 | Support Home | Profile | Ticket, chat, FAQ, call options | — |
| C-SUP-02 | Ticket List | Support | Open and closed tickets | `/support/tickets` |
| C-SUP-03 | Create Ticket | Support | Category, description, attach | `/support/tickets` |
| C-SUP-04 | Ticket Detail | Tickets | Thread, status, replies | `/support/tickets/:id` |
| C-SUP-05 | Ticket Reply | Ticket detail | Add comment | `/support/tickets/:id/reply` |
| C-SUP-06 | Chat Support | Support | In-app chat (human/AI) | `/support/chat` |
| C-SUP-07 | FAQ List | Help Center | Categorized FAQs | `/knowledge/faqs` |
| C-SUP-08 | FAQ Article | FAQ | Single article view | `/knowledge/faqs/:id` |
| C-SUP-09 | Knowledge Search Results | Help | Search across KB | `/knowledge/search` |
| C-SUP-10 | Complaint Registration | Support | Formal complaint form | `/support/complaints` |
| C-SUP-11 | Call Support — IVR Info | Support | Phone numbers, hours | `/public/support/contact` |

---

# 18. NOTIFICATION MODULE

| Screen ID | Screen Name | Parent | Purpose | API Domain |
|-----------|-------------|--------|---------|------------|
| C-NOT-01 | Push Notifications List | Notifications | In-app notification feed | `/notifications` |
| C-NOT-02 | Notification Preferences | Settings | Push on/off per category | `/notifications/preferences` |
| C-NOT-03 | SMS History | Settings/Notifications | SMS log (read-only) | `/notifications/sms-history` |
| C-NOT-04 | Email History | Settings/Notifications | Email log | `/notifications/email-history` |
| C-NOT-05 | WhatsApp History | Settings/Notifications | WhatsApp message log | `/notifications/whatsapp-history` |
| C-NOT-06 | Marketing Preferences | Settings | Opt-in/out marketing | `/customer/privacy/marketing` |

---

# 19. SETTINGS MODULE

| Screen ID | Screen Name | Parent | Purpose | API Domain |
|-----------|-------------|--------|---------|------------|
| C-SET-01 | Settings Hub | Profile | All settings categories | — |
| C-SET-02 | Profile Settings | Settings | Edit profile shortcut | `/customer/profile` |
| C-SET-03 | Security Settings | Settings | Biometric, session | `/customer/security` |
| C-SET-04 | Change Mobile Number | Security | Mobile update flow | `/customer/security/mobile` |
| C-SET-05 | Notification Preferences | Settings | Channel preferences | `/notifications/preferences` |
| C-SET-06 | Language Preferences | Settings | App language | `/customer/preferences/language` |
| C-SET-07 | Privacy Controls | Settings | Consent, data export, delete | `/customer/privacy` |
| C-SET-08 | Data Export Request | Privacy | Request my data | `/customer/privacy/export` |
| C-SET-09 | Account Deactivation | Privacy | Deactivate account | `/customer/privacy/deactivate` |
| C-SET-10 | Logout Confirmation | Settings | Sign out | `/auth/logout` |

---

# 20. DSA APP INFORMATION ARCHITECTURE

## 20.1 IA Hierarchy Tree

```
DSA App
├── PUBLIC / ONBOARDING
│   ├── Splash
│   ├── Partner Value Proposition
│   └── Apply to Become DSA
│
├── AUTHENTICATION
│   ├── Login (Mobile)
│   ├── OTP Verification
│   └── Agreement Gate (post-login block if inactive)
│
├── ONBOARDING (new partners)
│   ├── Registration Form
│   ├── KYC Upload
│   ├── Bank Details
│   ├── Agreement eSign
│   └── Training Gate
│
├── MAIN — TAB: DASHBOARD
│   ├── Partner Dashboard
│   ├── Notifications
│   └── Quick Lead Submit
│
├── MAIN — TAB: LEADS
│   ├── Lead List
│   ├── Lead Create Wizard
│   └── Lead Detail / Tracking
│
├── MAIN — TAB: COMMISSIONS
│   ├── Commission Summary
│   ├── Ledger & Statements
│   └── Payouts & Disputes
│
├── MAIN — TAB: MORE
│   ├── Training & Certification
│   ├── Campaigns & Offers
│   ├── Leaderboard
│   ├── Profile
│   ├── Settings
│   └── Support
│
└── DEEP LINKS
    ├── Lead status update
    ├── Commission payout notification
    └── Training due alert
```

---

# 21. DSA APP SCREEN INVENTORY

| Screen ID | Screen Name | Parent | Purpose | API Domain |
|-----------|-------------|--------|---------|------------|
| D-001 | Splash | Root | Load, auth check | — |
| D-002 | Partner Onboarding Carousel | Public | DSA value prop | — |
| D-003 | Apply to Become DSA | Public | Interest registration | `/partners/register-interest` |
| D-004 | Login — Mobile | Auth | Mobile entry | `/auth/otp/send` |
| D-005 | OTP Verification | Auth | Verify OTP | `/auth/otp/verify` |
| D-006 | Registration — Business Info | Onboarding | Name, type, PAN | `/partners/register` |
| D-007 | Registration — Bank Details | Onboarding | Account for payout | `/partners/bank` |
| D-008 | KYC Document Upload | Onboarding | PAN, Aadhaar, etc. | `/partners/kyc` |
| D-009 | Agreement Review & eSign | Onboarding | DSA agreement | `/partners/agreement` |
| D-010 | Onboarding Status | Onboarding | Pending approval tracker | `/partners/onboarding-status` |
| D-011 | Dashboard | Dashboard tab | Pipeline, commission, tier | `/dsa/dashboard` |
| D-012 | Notifications List | Dashboard | Partner notifications | `/notifications` |
| D-013 | Quick Lead Submit | Dashboard | Fast lead entry shortcut | → D-LD-01 |
| D-014 | Training Home | More | Certification modules | `/dsa/training` |
| D-015 | Training Module Detail | Training | Content + quiz | `/dsa/training/:id` |
| D-016 | Training Quiz | Training | Certification test | `/dsa/training/:id/quiz` |
| D-017 | Profile Hub | More | Partner profile | `/dsa/profile` |
| D-018 | Profile Edit | Profile | Update details | `/dsa/profile` |
| D-019 | Tier Status & Benefits | Profile | Bronze/Silver/Gold/Platinum | `/dsa/tier` |
| D-020 | Settings Hub | More | App settings | — |
| D-021 | Notification Preferences | Settings | Push preferences | `/notifications/preferences` |
| D-022 | Support Home | More | Tickets, contact | — |
| D-023 | Campaigns & Offers | More | Active campaigns | `/dsa/campaigns` |
| D-024 | Leaderboard | More | Partner ranking | `/dsa/leaderboard` |
| D-025 | Agreement Renewal | Profile | Annual renewal | `/partners/agreement/renew` |
| D-026 | KYC Renewal | Profile | Expired KYC re-upload | `/partners/kyc/renew` |
| D-027 | Language Selection | Settings | App language | `/dsa/preferences` |
| D-028 | Logout | Settings | Sign out | `/auth/logout` |

---

# 22. DSA LEAD MANAGEMENT SCREENS

| Screen ID | Screen Name | Parent | Purpose | API Domain |
|-----------|-------------|--------|---------|------------|
| D-LD-01 | Lead Create — Customer Mobile | Leads | Customer phone + OTP consent | `/dsa/leads` |
| D-LD-02 | Lead Create — Customer Details | Leads | Name, product interest | `/dsa/leads` |
| D-LD-03 | Lead Create — Product Selection | Leads | Select product family | `/products` |
| D-LD-04 | Lead Create — Preliminary Docs | Leads | Optional doc upload | `/dsa/documents` |
| D-LD-05 | Lead Create — Review & Submit | Leads | Consent confirm, submit | `/dsa/leads` |
| D-LD-06 | Lead Create — Success | Leads | Lead ID, tracking CTA | — |
| D-LD-07 | Lead List | Leads tab | All partner leads, filters | `/dsa/leads` |
| D-LD-08 | Lead Detail | List | Customer (masked), status | `/dsa/leads/:id` |
| D-LD-09 | Lead Status Timeline | Detail | Simplified pipeline | `/dsa/leads/:id/timeline` |
| D-LD-10 | Lead Documents | Detail | Upload/assist documents | `/dsa/leads/:id/documents` |
| D-LD-11 | Lead Document Upload | Documents | Upload for customer | `/documents/presign` |
| D-LD-12 | Lead Follow-up Notes | Detail | View only (exec notes hidden) | `/dsa/leads/:id/notes` |
| D-LD-13 | Lead Filter & Search | List | Status, product, date filters | `/dsa/leads` |
| D-LD-14 | Customer OTP Consent Capture | Lead create | On-device OTP for customer | `/dsa/leads/consent-otp` |

---

# 23. DSA COMMISSION SCREENS

| Screen ID | Screen Name | Parent | Purpose | API Domain |
|-----------|-------------|--------|---------|------------|
| D-COM-01 | Commission Dashboard | Commissions tab | MTD/YTD earnings, pending | `/dsa/commissions/summary` |
| D-COM-02 | Commission Ledger | Commissions | Transaction-level list | `/dsa/commissions/ledger` |
| D-COM-03 | Commission Detail | Ledger | Single commission record | `/dsa/commissions/:id` |
| D-COM-04 | Commission Statement (Monthly) | Commissions | PDF statement view | `/dsa/commissions/statements` |
| D-COM-05 | Statement Detail | Statements | Line items for month | `/dsa/commissions/statements/:month` |
| D-COM-06 | Payout History | Commissions | Paid payouts list | `/dsa/payouts` |
| D-COM-07 | Payout Detail | Payouts | UTR, amount, date | `/dsa/payouts/:id` |
| D-COM-08 | Pending Payouts | Commissions | Awaiting next cycle | `/dsa/payouts/pending` |
| D-COM-09 | Raise Dispute | Commission detail | Dispute form | `/dsa/disputes` |
| D-COM-10 | Dispute List | Commissions | Open/resolved disputes | `/dsa/disputes` |
| D-COM-11 | Dispute Detail | Disputes | Status, resolution | `/dsa/disputes/:id` |
| D-COM-12 | TDS Certificate | Commissions | Quarterly tax cert | `/dsa/commissions/tds` |
| D-COM-13 | Clawback Notice | Commission | Clawback explanation | `/dsa/commissions/:id/clawback` |

---

# 24. CRM INFORMATION ARCHITECTURE

## 24.1 CRM IA Hierarchy

```
CRM Admin Panel (Role-Adaptive)
├── AUTH
│   ├── Login
│   ├── MFA Verification
│   └── Forgot Password
│
├── DASHBOARDS (role-specific landing)
│   ├── Sales Dashboard
│   ├── RM Dashboard
│   ├── Credit Dashboard
│   ├── Operations Dashboard
│   ├── Branch Dashboard
│   ├── Regional Dashboard
│   ├── Support Console
│   ├── Compliance Console
│   ├── Admin Dashboard
│   └── Executive Dashboard
│
├── LEADS (LMS)
│   ├── Lead List / Queue
│   ├── Lead Detail
│   ├── Lead Assignment
│   ├── Lead Analytics
│   └── AI Copilot (sidebar — persistent)
│
├── CUSTOMERS
│   ├── Customer List
│   ├── Customer 360 Profile
│   └── Customer Interactions
│
├── APPLICATIONS (LOS)
│   ├── Application List / Queues
│   ├── Application Detail
│   ├── Eligibility Review
│   ├── Credit Assessment
│   ├── Lender Submission
│   ├── Sanction & Disbursement
│   └── Application Timeline
│
├── DOCUMENTS
│   ├── Document Queue
│   ├── Verification Workspace
│   ├── OCR Results Review
│   └── Deficiency Management
│
├── PARTNERS
│   ├── DSA List
│   ├── DSA Detail
│   ├── Referral Partners
│   ├── Partner Onboarding Queue
│   └── Partner Performance
│
├── COMMISSIONS
│   ├── Commission Rules
│   ├── Commission Ledger
│   ├── Approval Queue
│   ├── Payout Management
│   └── Dispute Resolution
│
├── CAMPAIGNS
│   ├── Campaign List
│   ├── Campaign Create/Edit
│   └── Campaign Analytics
│
├── KNOWLEDGE BASE
│   ├── Article CMS
│   ├── FAQ Management
│   ├── Training Content
│   ├── Sales Scripts
│   └── AI Knowledge Sources (RAG)
│
├── ANALYTICS & REPORTS
│   ├── Operational Reports
│   ├── Revenue Reports
│   ├── Partner Reports
│   ├── Branch/Regional Reports
│   ├── Executive Reports
│   └── AI Analytics
│
├── SUPPORT (Console)
│   ├── Ticket Queue
│   ├── Complaint Register
│   ├── Escalation Management
│   └── SLA Dashboard
│
├── COMPLIANCE (Console)
│   ├── Compliance Dashboard
│   ├── Audit Log Viewer
│   ├── Fraud Cases
│   └── Partner Compliance
│
└── ADMIN
    ├── User Management
    ├── Role Management (Super Admin)
    ├── Product Catalog
    ├── Lender Management
    ├── Branch/Region Setup
    ├── Workflow Configuration
    ├── Notification Templates
    ├── System Settings
    └── Integration Health
```

## 24.2 Role-to-Navigation Mapping

| CRM Module | Sales | RM | Credit | Ops | Branch | Regional | Support | Compliance | Admin | Mgmt |
|------------|-------|-----|--------|-----|--------|----------|---------|------------|-------|------|
| Sales Dashboard | ✓ | — | — | — | ✓ | ✓ | — | — | — | — |
| RM Dashboard | — | ✓ | — | — | ✓ | — | — | — | — | — |
| Credit Queue | — | — | ✓ | — | ✓ | — | — | ✓ | — | — |
| Ops Queue | — | — | — | ✓ | ✓ | — | — | — | — | — |
| Leads | ✓ | ○ | ○ | ○ | ✓ | ✓ | ○ | ○ | ✓ | ○ |
| Customers | ✓ | ✓ | ○ | ○ | ✓ | ✓ | ✓ | ✓ | ✓ | ○ |
| Applications | ✓ | ○ | ✓ | ✓ | ✓ | ✓ | ○ | ✓ | ✓ | ○ |
| Documents | ✓ | ○ | ✓ | ✓ | ✓ | — | — | ✓ | ✓ | — |
| Partners | ○ | — | — | — | ✓ | ✓ | — | ✓ | ✓ | ○ |
| Commissions | — | — | — | ○ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| Campaigns | — | — | — | — | ✓ | ✓ | — | — | ✓ | ✓ |
| Analytics | ○ | ○ | ○ | ○ | ✓ | ✓ | ○ | ✓ | ✓ | ✓ |
| Support Console | — | — | — | — | ○ | — | ✓ | — | ✓ | — |
| Compliance | — | — | — | — | ○ | ○ | — | ✓ | ○ | ✓ |
| Admin | — | — | — | — | — | — | — | — | ✓ | — |
| Executive | — | — | — | — | — | — | — | ○ | — | ✓ |

---

# 25. CRM DASHBOARD SCREENS

| Screen ID | Screen Name | Primary Role | Key Widgets | API Domain |
|-----------|-------------|--------------|-------------|------------|
| CRM-DB-01 | Sales Executive Dashboard | Sales | Priority queue, SLA, targets, copilot | `/crm/dashboard/sales` |
| CRM-DB-02 | RM Portfolio Dashboard | RM | Portfolio health, cross-sell, renewals | `/crm/dashboard/rm` |
| CRM-DB-03 | Credit Processing Dashboard | Credit | Assessment queue, SLA, doc verification | `/crm/dashboard/credit` |
| CRM-DB-04 | Operations Dashboard | Ops | Processing queue, lender pipeline, TAT | `/crm/dashboard/ops` |
| CRM-DB-05 | Branch Manager Dashboard | Branch Mgr | Branch funnel, team, partners, revenue | `/branch/dashboard` |
| CRM-DB-06 | Regional Manager Dashboard | Regional | Branch comparison, regional KPIs | `/regional/dashboard` |
| CRM-DB-07 | Support Console Dashboard | Support | Ticket queue, SLA, CSAT | `/support/dashboard` |
| CRM-DB-08 | Compliance Dashboard | Compliance | Audit queue, fraud alerts, partner compliance | `/compliance/dashboard` |
| CRM-DB-09 | Admin Operations Dashboard | Admin | System health, users, config changes | `/admin/dashboard` |
| CRM-DB-10 | Executive KPI Dashboard | Management | Company KPIs, trends | `/management/dashboard` |
| CRM-DB-11 | AI Copilot Sidebar | Sales, Branch | Contextual AI panel (overlay) | `/ai/copilot` |

---

# 26. LEAD MANAGEMENT SCREENS

| Screen ID | Screen Name | Purpose | Key Actions | API Domain |
|-----------|-------------|---------|-------------|------------|
| CRM-LD-01 | Lead List / Queue | All leads (scoped) | Filter, sort, bulk assign | `/crm/leads` |
| CRM-LD-02 | Lead Detail | Single lead 360 | Edit, assign, convert, notes | `/crm/leads/:id` |
| CRM-LD-03 | Lead Assignment Modal | Assign/reassign | Select executive | `/crm/leads/:id/assign` |
| CRM-LD-04 | Lead Scoring Panel | Score breakdown | View factors, AI insight | `/crm/leads/:id/score` |
| CRM-LD-05 | Lead Timeline | Activity history | Calls, notes, status | `/crm/leads/:id/timeline` |
| CRM-LD-06 | Lead Create (Manual) | Walk-in lead entry | Create lead | `/crm/leads` |
| CRM-LD-07 | Lead Qualification Form | Qualify/disqualify | Update classification | `/crm/leads/:id/qualify` |
| CRM-LD-08 | Lead Analytics | Funnel metrics | Charts, export | `/analytics/leads` |
| CRM-LD-09 | Lead Bulk Actions | Multi-select ops | Assign, export | `/crm/leads/bulk` |
| CRM-LD-10 | Lead SLA Alert Panel | SLA breaches | Escalate | `/crm/leads/sla-alerts` |
| CRM-LD-11 | Lead Source Analytics | Channel breakdown | View by source | `/analytics/leads/sources` |
| CRM-LD-12 | Convert Lead to Application | Conversion | Create application | `/crm/leads/:id/convert` |

---

# 27. CUSTOMER MANAGEMENT SCREENS

| Screen ID | Screen Name | Purpose | API Domain |
|-----------|-------------|---------|------------|
| CRM-CU-01 | Customer List | Searchable customer list | `/crm/customers` |
| CRM-CU-02 | Customer 360 Profile | Full profile overview | `/crm/customers/:id` |
| CRM-CU-03 | Customer Personal Tab | Personal details | `/crm/customers/:id/personal` |
| CRM-CU-04 | Customer KYC Tab | KYC status | `/crm/customers/:id/kyc` |
| CRM-CU-05 | Customer Applications Tab | All applications | `/crm/customers/:id/applications` |
| CRM-CU-06 | Customer Documents Tab | All documents | `/crm/customers/:id/documents` |
| CRM-CU-07 | Customer Interactions Tab | Calls, notes, emails | `/crm/customers/:id/interactions` |
| CRM-CU-08 | Customer Referrals Tab | Referral history | `/crm/customers/:id/referrals` |
| CRM-CU-09 | Add Interaction Note | Log call/meeting | `/crm/customers/:id/interactions` |
| CRM-CU-10 | Customer Cross-sell Panel | RM opportunities | `/crm/customers/:id/cross-sell` |
| CRM-CU-11 | Customer Communication Log | SMS/WhatsApp/email | `/crm/customers/:id/communications` |
| CRM-CU-12 | Customer Merge (Admin) | Duplicate merge | `/admin/customers/merge` |

---

# 28. APPLICATION MANAGEMENT SCREENS

| Screen ID | Screen Name | Purpose | API Domain |
|-----------|-------------|---------|------------|
| CRM-AP-01 | Application List | All applications (scoped queues) | `/crm/applications` |
| CRM-AP-02 | Application Detail — Summary | Overview, status, assignees | `/crm/applications/:id` |
| CRM-AP-03 | Application Eligibility Tab | Eligibility results | `/crm/applications/:id/eligibility` |
| CRM-AP-04 | Application Documents Tab | Document checklist | `/crm/applications/:id/documents` |
| CRM-AP-05 | Application Credit Tab | Credit assessment | `/credit/applications/:id` |
| CRM-AP-06 | Application Lender Tab | Lender submission status | `/ops/applications/:id/lender` |
| CRM-AP-07 | Application Sanction Tab | Sanction details | `/crm/applications/:id/sanction` |
| CRM-AP-08 | Application Disbursement Tab | Disbursement record | `/ops/applications/:id/disbursement` |
| CRM-AP-09 | Application Timeline | Full stage history | `/crm/applications/:id/timeline` |
| CRM-AP-10 | Application Stage Action | Advance/rework stage | `/crm/applications/:id/stage` |
| CRM-AP-11 | Application Lender Submit | Submit to lender | `/ops/applications/:id/submit` |
| CRM-AP-12 | Application Exception Request | Policy exception | `/crm/applications/:id/exception` |
| CRM-AP-13 | Application Rejection | Reject with reason | `/crm/applications/:id/reject` |
| CRM-AP-14 | Application Withdrawal | Process withdrawal | `/crm/applications/:id/withdraw` |
| CRM-AP-15 | Application Queue — Credit | Credit exec queue | `/credit/queue` |
| CRM-AP-16 | Application Queue — Operations | Ops processing queue | `/ops/queue` |

---

# 29. DOCUMENT MANAGEMENT SCREENS

| Screen ID | Screen Name | Purpose | API Domain |
|-----------|-------------|---------|------------|
| CRM-DOC-01 | Document Verification Queue | Pending verification | `/credit/documents/queue` |
| CRM-DOC-02 | Document Verification Workspace | View + verify/reject | `/credit/documents/:id/verify` |
| CRM-DOC-03 | OCR Results Review | AI extraction review | `/credit/documents/:id/ocr` |
| CRM-DOC-04 | Document Deficiency Manager | Send deficiency request | `/crm/documents/:id/deficiency` |
| CRM-DOC-05 | Document Viewer | Full-screen doc view | `/documents/:id/download` |
| CRM-DOC-06 | Document Version History | Version comparison | `/documents/:id/versions` |
| CRM-DOC-07 | Document Package Builder | Lender submission package | `/ops/documents/package` |
| CRM-DOC-08 | Document Analytics | Deficiency rates, TAT | `/analytics/documents` |
| CRM-DOC-09 | Bulk Document Review | Multi-doc approval | `/credit/documents/bulk` |

---

# 30. PARTNER MANAGEMENT SCREENS

| Screen ID | Screen Name | Purpose | API Domain |
|-----------|-------------|---------|------------|
| CRM-PT-01 | DSA Partner List | All DSAs (scoped) | `/crm/partners/dsa` |
| CRM-PT-02 | DSA Partner Detail | Profile, tier, performance | `/crm/partners/dsa/:id` |
| CRM-PT-03 | DSA Onboarding Queue | Pending activations | `/crm/partners/dsa/onboarding` |
| CRM-PT-04 | DSA Performance Dashboard | Metrics per DSA | `/crm/partners/dsa/:id/performance` |
| CRM-PT-05 | Referral Partner List | All referral partners | `/crm/partners/referral` |
| CRM-PT-06 | Referral Partner Detail | Profile, conversions | `/crm/partners/referral/:id` |
| CRM-PT-07 | Partner Activation | Approve partner | `/crm/partners/:id/activate` |
| CRM-PT-08 | Partner Suspension | Suspend/warn partner | `/crm/partners/:id/suspend` |
| CRM-PT-09 | Partner Commission Tab | Partner earnings | `/crm/partners/:id/commissions` |
| CRM-PT-10 | Partner Document Tab | KYC, agreement | `/crm/partners/:id/documents` |
| CRM-PT-11 | Partner Leaderboard (Admin) | Network ranking | `/analytics/partners/leaderboard` |
| CRM-PT-12 | Partner Dispute Queue | Open disputes | `/crm/partners/disputes` |

---

# 31. COMMISSION MANAGEMENT SCREENS

| Screen ID | Screen Name | Purpose | API Domain |
|-----------|-------------|---------|------------|
| CRM-CM-01 | Commission Rules List | All commission rules | `/admin/commission-rules` |
| CRM-CM-02 | Commission Rule Editor | Create/edit rule | `/admin/commission-rules/:id` |
| CRM-CM-03 | Commission Ledger | All commission records | `/crm/commissions/ledger` |
| CRM-CM-04 | Commission Detail | Single record | `/crm/commissions/:id` |
| CRM-CM-05 | Commission Approval Queue | Pending approvals | `/crm/commissions/approvals` |
| CRM-CM-06 | Payout Batch Management | Create/manage batches | `/finance/payouts` |
| CRM-CM-07 | Payout Batch Detail | Batch line items | `/finance/payouts/:id` |
| CRM-CM-08 | Payout Execution | Execute bank transfer | `/finance/payouts/:id/execute` |
| CRM-CM-09 | Commission Dispute Resolution | Resolve disputes | `/crm/commissions/disputes/:id` |
| CRM-CM-10 | Clawback Management | Process clawbacks | `/crm/commissions/clawbacks` |
| CRM-CM-11 | Commission Reports | Revenue reports | `/analytics/commissions` |
| CRM-CM-12 | TDS Management | TDS certificates batch | `/finance/commissions/tds` |

---

# 32. CAMPAIGN MANAGEMENT SCREENS

| Screen ID | Screen Name | Purpose | API Domain |
|-----------|-------------|---------|------------|
| CRM-CP-01 | Campaign List | All campaigns | `/admin/campaigns` |
| CRM-CP-02 | Campaign Create/Edit | Campaign configuration | `/admin/campaigns/:id` |
| CRM-CP-03 | Campaign Detail | Performance, attribution | `/admin/campaigns/:id/analytics` |
| CRM-CP-04 | SMS Campaign Builder | SMS template, audience | `/admin/campaigns/sms` |
| CRM-CP-05 | Email Campaign Builder | Email template, audience | `/admin/campaigns/email` |
| CRM-CP-06 | WhatsApp Campaign Builder | WA template, audience | `/admin/campaigns/whatsapp` |
| CRM-CP-07 | Push Campaign Builder | FCM push, audience | `/admin/campaigns/push` |
| CRM-CP-08 | Campaign Audience Selector | Segment selection | `/admin/campaigns/audience` |
| CRM-CP-09 | Campaign Schedule | Schedule/send | `/admin/campaigns/:id/schedule` |
| CRM-CP-10 | Campaign Analytics | Conversion, ROI | `/analytics/campaigns/:id` |

---

# 33. KNOWLEDGE BASE SCREENS

| Screen ID | Screen Name | Purpose | API Domain |
|-----------|-------------|---------|------------|
| CRM-KB-01 | Knowledge Base Home | CMS dashboard | `/admin/knowledge` |
| CRM-KB-02 | Article List | All articles | `/admin/knowledge/articles` |
| CRM-KB-03 | Article Editor | Create/edit article | `/admin/knowledge/articles/:id` |
| CRM-KB-04 | FAQ Management | FAQ CRUD | `/admin/knowledge/faqs` |
| CRM-KB-05 | Training Content Manager | Partner/employee training | `/admin/knowledge/training` |
| CRM-KB-06 | Sales Scripts Library | Scripts by product/stage | `/admin/knowledge/scripts` |
| CRM-KB-07 | AI Knowledge Sources | RAG source management | `/admin/knowledge/rag-sources` |
| CRM-KB-08 | RAG Index Status | Indexing jobs, status | `/admin/knowledge/rag-index` |
| CRM-KB-09 | Policy Document Upload | Lender/product policy docs | `/admin/knowledge/policies` |
| CRM-KB-10 | Knowledge Search (Agent) | Agent-facing search | `/knowledge/search` |
| CRM-KB-11 | Article Preview | Preview before publish | `/admin/knowledge/articles/:id/preview` |
| CRM-KB-12 | Content Version History | Article versions | `/admin/knowledge/articles/:id/versions` |

---

# 34. ANALYTICS SCREENS

| Screen ID | Screen Name | Primary Role | API Domain |
|-----------|-------------|--------------|------------|
| CRM-AN-01 | Analytics Hub | All managers | — |
| CRM-AN-02 | Revenue Dashboard | Finance, Mgmt | `/analytics/revenue` |
| CRM-AN-03 | Lead Funnel Analytics | Sales, Branch | `/analytics/leads/funnel` |
| CRM-AN-04 | Conversion Analytics | Sales Head | `/analytics/conversion` |
| CRM-AN-05 | Executive Analytics Summary | CEO, Directors | `/management/analytics/executive` |
| CRM-AN-06 | Branch Analytics | Branch, Regional | `/analytics/branches/:id` |
| CRM-AN-07 | Regional Comparison | Regional, Sales Head | `/analytics/regional` |
| CRM-AN-08 | Partner Analytics | Sales Head, Branch | `/analytics/partners` |
| CRM-AN-09 | Product Analytics | Business Head | `/analytics/products` |
| CRM-AN-10 | Lender Performance Analytics | Ops Head | `/analytics/lenders` |
| CRM-AN-11 | SLA Analytics | Ops, Branch | `/analytics/sla` |
| CRM-AN-12 | AI Analytics Dashboard | Admin, Mgmt | `/analytics/ai` |
| CRM-AN-13 | Report Builder | Admin, Managers | `/analytics/reports/builder` |
| CRM-AN-14 | Scheduled Reports | Admin | `/analytics/reports/scheduled` |
| CRM-AN-15 | Report Export History | Admin | `/analytics/reports/exports` |

---

# 35. MANAGEMENT DASHBOARD SCREENS

| Screen ID | Screen Name | Role | Key Widgets | API Domain |
|-----------|-------------|------|-------------|------------|
| MGT-01 | CEO Dashboard | CEO | Company KPIs, forecast, compliance summary | `/management/ceo` |
| MGT-02 | Director Dashboard | Director | Strategic initiatives, partnerships | `/management/director` |
| MGT-03 | Business Head Dashboard | Business Head | Revenue, growth, product mix, CLV | `/management/business` |
| MGT-04 | Sales Head Dashboard | Sales Head | Funnel, regional, partner, targets | `/management/sales` |
| MGT-05 | Operations Head Dashboard | Ops Head | TAT, SLA, lender, support, compliance | `/management/operations` |
| MGT-06 | Finance Head Dashboard | Finance Head | Revenue, commission, payout, P&L | `/management/finance` |
| MGT-07 | Board Report Pack Viewer | CEO, Finance | Monthly/quarterly board pack | `/management/board-pack` |
| MGT-08 | Forecast & Scenario Planner | CEO, Business | Pipeline forecast, scenarios | `/management/forecast` |
| MGT-09 | Market Expansion Dashboard | Business Head | Geographic penetration | `/management/expansion` |
| MGT-10 | Strategic Initiative Tracker | Director | Program ROI | `/management/initiatives` |

---

# 36. SUPPORT PORTAL SCREENS

| Screen ID | Screen Name | Purpose | API Domain |
|-----------|-------------|---------|------------|
| SUP-01 | Support Ticket Queue | All open tickets | `/support/tickets` |
| SUP-02 | Ticket Detail / Workspace | Resolve ticket | `/support/tickets/:id` |
| SUP-03 | Ticket Assignment | Assign to agent | `/support/tickets/:id/assign` |
| SUP-04 | Ticket Escalation | Escalate to branch/mgmt | `/support/tickets/:id/escalate` |
| SUP-05 | Complaint Register | Formal complaints | `/support/complaints` |
| SUP-06 | Complaint Detail | Investigation workspace | `/support/complaints/:id` |
| SUP-07 | Escalation Queue | Escalated items | `/support/escalations` |
| SUP-08 | SLA Dashboard | SLA compliance metrics | `/support/sla` |
| SUP-09 | Agent Performance | Support manager view | `/support/agents/performance` |
| SUP-10 | CSAT Dashboard | Satisfaction scores | `/support/csat` |
| SUP-11 | Canned Responses | Response templates | `/admin/support/templates` |
| SUP-12 | Support Analytics | Volume, resolution TAT | `/analytics/support` |

---

# 36A. CRM AUTHENTICATION SCREENS

| Screen ID | Screen Name | Purpose | API Domain |
|-----------|-------------|---------|------------|
| CRM-AU-01 | CRM Login | Email/mobile + password login | `/auth/crm/login` |
| CRM-AU-02 | MFA Verification | OTP or authenticator challenge | `/auth/crm/mfa` |
| CRM-AU-03 | Forgot Password | Password reset request | `/auth/crm/forgot-password` |
| CRM-AU-04 | Password Reset | Set new password | `/auth/crm/reset-password` |

---

# 36B. CRM ADMINISTRATION SCREENS

| Screen ID | Screen Name | Purpose | Key Actions | API Domain |
|-----------|-------------|---------|-------------|------------|
| CRM-AD-01 | User List | All internal users | Search, filter, create | `/admin/users` |
| CRM-AD-02 | User Create/Edit | Add or modify user | Assign role, branch | `/admin/users/:id` |
| CRM-AD-03 | User Detail | User profile + activity | Deactivate, reset MFA | `/admin/users/:id` |
| CRM-AD-04 | Role List | All RBAC roles | View permissions summary | `/admin/roles` |
| CRM-AD-05 | Role Permission Editor | Configure role permissions | Grant/revoke permissions | `/admin/roles/:id` |
| CRM-AD-06 | Product Catalog List | Loan product families | Activate/deactivate | `/admin/products` |
| CRM-AD-07 | Product Editor | Product configuration | Rates, eligibility rules | `/admin/products/:id` |
| CRM-AD-08 | Product Variant Config | Sub-product variants | HL BT, LAP Top-Up, etc. | `/admin/products/:id/variants` |
| CRM-AD-09 | Lender List | Partner lender registry | Search, onboard | `/admin/lenders` |
| CRM-AD-10 | Lender Editor | Lender profile + SLA | Product mapping, TAT | `/admin/lenders/:id` |
| CRM-AD-11 | Lender Product Mapping | Lender ↔ product matrix | Enable/disable products | `/admin/lenders/:id/products` |
| CRM-AD-12 | Branch List | Branch hierarchy | Search, create | `/admin/branches` |
| CRM-AD-13 | Branch Editor | Branch configuration | Assign manager, region | `/admin/branches/:id` |
| CRM-AD-14 | Region Setup | Regional hierarchy | Map branches to regions | `/admin/regions` |
| CRM-AD-15 | Workflow Configuration | LOS stage definitions | Edit S01–S09 rules | `/admin/workflows` |
| CRM-AD-16 | Notification Templates | SMS/Email/WA/Push templates | Edit, preview, test | `/admin/templates` |
| CRM-AD-17 | System Settings | Global platform config | Feature flags, limits | `/admin/settings` |
| CRM-AD-18 | Integration Health | Third-party service status | PAN, Aadhaar, lenders, AI | `/admin/integrations/health` |

---

# 36C. CRM COMPLIANCE CONSOLE SCREENS

| Screen ID | Screen Name | Purpose | Key Actions | API Domain |
|-----------|-------------|---------|-------------|------------|
| CRM-COMP-01 | Compliance Dashboard | Compliance KPIs, alerts | Drill-down to queues | `/compliance/dashboard` |
| CRM-COMP-02 | Audit Log Viewer | System audit trail | Filter by user, action, date | `/compliance/audit-logs` |
| CRM-COMP-03 | Audit Log Detail | Single audit event | View before/after diff | `/compliance/audit-logs/:id` |
| CRM-COMP-04 | Fraud Cases List | Open fraud investigations | Assign, escalate | `/compliance/fraud` |
| CRM-COMP-05 | Fraud Case Investigation | Case workspace | Notes, evidence, close | `/compliance/fraud/:id` |
| CRM-COMP-06 | Partner Compliance Monitor | DSA/referral compliance scores | Flag, warn, suspend | `/compliance/partners` |
| CRM-COMP-07 | Partner Compliance Detail | Partner compliance history | View violations, actions | `/compliance/partners/:id` |
| CRM-COMP-08 | Regulatory Reports | RBI/compliance report exports | Generate, download | `/compliance/reports` |

*Note: CRM-COMP-01 shares route with CRM-DB-08 (Compliance Dashboard) — counted once in Dashboard module; compliance console adds 7 operational screens.*

---

# 37. NAVIGATION ARCHITECTURE

## 37.1 Customer App — Bottom Navigation

| Tab | Icon Label | Root Screen | Stack Children |
|-----|------------|-------------|----------------|
| **Home** | Home | C-008 Dashboard | Notifications (C-009), Quick actions |
| **Products** | Products | C-LP-01 Catalog | Product families, calculators, wizards |
| **Applications** | My Loans | C-APP-01 List | Detail, timeline, documents |
| **AI** | Advisor | C-AI-01 Advisor Home | Chat, voice, history |
| **Profile** | Profile | C-PR-01 Profile Hub | KYC, vault, referral, support, settings |

**Tab bar visibility:** Hidden during application wizards and AI voice session.

## 37.2 Customer App — Drawer / Overflow Navigation

Accessible from Profile or hamburger (if used):

| Item | Destination |
|------|-------------|
| Help Center | C-SUP-07 FAQ |
| Refer & Earn | C-REF-01 |
| Calculators | C-CAL-01 |
| Notifications | C-009 |
| Settings | C-SET-01 |
| About | C-016 |

## 37.3 DSA App — Bottom Navigation

| Tab | Icon Label | Root Screen | Stack Children |
|-----|------------|-------------|----------------|
| **Dashboard** | Home | D-011 Dashboard | Notifications, quick submit |
| **Leads** | Leads | D-LD-07 Lead List | Create wizard, detail, docs |
| **Commissions** | Earnings | D-COM-01 Commission Dashboard | Ledger, payouts, disputes |
| **More** | More | More menu hub | Training, profile, support, settings |

## 37.4 CRM — Sidebar Navigation

```
┌─────────────────────────┐
│ KuberOne CRM            │
├─────────────────────────┤
│ ■ Dashboard (role-based)│
│ ── SALES ──             │
│   Leads                 │
│   Customers             │
│   Applications          │
│ ── PROCESSING ──        │
│   Credit Queue          │
│   Operations Queue      │
│   Documents             │
│ ── PARTNERS ──          │
│   DSA Partners          │
│   Referral Partners     │
│ ── FINANCE ──           │
│   Commissions           │
│   Payouts               │
│ ── GROWTH ──            │
│   Campaigns             │
│ ── INSIGHTS ──          │
│   Analytics             │
│   Reports               │
│ ── SUPPORT ──           │
│   Tickets               │
│   Complaints            │
│ ── GOVERNANCE ──        │
│   Compliance            │
│   Knowledge Base        │
│ ── ADMIN ──             │
│   Users                 │
│   Products              │
│   Lenders               │
│   Settings              │
└─────────────────────────┘
```

**Sidebar behavior:** Collapsible; role-filtered items; badge counts on queues.

## 37.5 Management — Top Navigation

| Nav Item | Dashboard |
|----------|-----------|
| Overview | MGT-01 to MGT-06 (role landing) |
| Revenue | CRM-AN-02 |
| Performance | CRM-AN-04, CRM-AN-07 |
| Board Pack | MGT-07 |
| Forecast | MGT-08 |

## 37.6 Breadcrumb Structure (CRM)

```
Dashboard > Leads > Lead Detail (#LD-12345)
Dashboard > Applications > Application Detail (#APP-67890) > Credit Tab
Dashboard > Partners > DSA > Partner Detail (Priya Sharma)
Dashboard > Admin > Commission Rules > Edit Rule
Dashboard > Analytics > Revenue Dashboard
```

**Pattern:** `{Section} > {List} > {Entity} > {Tab/Action}`

## 37.7 Deep Linking Strategy

| Platform | Scheme | Examples |
|----------|--------|----------|
| Customer App | `kuberone://` | `kuberone://applications/123`, `kuberone://ai/chat` |
| Customer App | Universal Links | `https://app.kuberone.kuberfinserve.com/...` |
| DSA App | `kuberonedsa://` | `kuberonedsa://leads/456`, `kuberonedsa://commissions` |
| Referral | HTTPS | `https://apply.kuberfinserve.com/r/{code}` |
| CRM | HTTPS routes | `https://crm.kuberfinserve.com/applications/123` |
| Push notification | Payload `deepLink` field | Maps to screen ID |
| WhatsApp | Link in template | Application status → C-APP-03 |

## 37.8 Navigation State Persistence

| Platform | Behavior |
|----------|----------|
| Customer App | Restore last tab on relaunch; wizard state in Zustand persist |
| DSA App | Restore Leads tab if pending lead draft |
| CRM | Remember last visited module; sidebar scroll position |
| Deep link | Override restored state when notification/link opened |

---

# 38. SEARCH ARCHITECTURE

## 38.1 Global Search

| Platform | Entry Point | Scope | Results |
|----------|-------------|-------|---------|
| CRM Header | `Ctrl+K` / search bar | Role-scoped: leads, customers, applications, partners | Unified result list with type icons |
| Customer App | Help Center | FAQs, articles only | C-SUP-09 |
| DSA App | Lead list search bar | Own leads only | D-LD-13 |
| Knowledge (CRM) | KB search | Articles, FAQs, scripts, policies | CRM-KB-10 |

## 38.2 Lead Search (CRM)

| Field | Searchable |
|-------|------------|
| Lead ID | ✓ exact |
| Customer name | ✓ partial |
| Mobile (last 4 digits) | ✓ masked search |
| Product | ✓ filter |
| Status | ✓ filter |
| Source (DSA, campaign) | ✓ filter |
| Assigned executive | ✓ filter |
| Date range | ✓ filter |
| Branch | ✓ auto-scoped |

## 38.3 Customer Search (CRM)

| Field | Searchable |
|-------|------------|
| Customer ID | ✓ |
| Name | ✓ |
| Mobile | ✓ (authorized roles) |
| PAN (last 4) | ✓ |
| Application ID | ✓ linked |

## 38.4 Application Search (CRM)

| Field | Searchable |
|-------|------------|
| Application ID | ✓ |
| Customer name | ✓ |
| Product | ✓ filter |
| Stage (S01–S09) | ✓ filter |
| Lender | ✓ filter |
| Amount range | ✓ filter |
| Branch / Region | ✓ scoped |

## 38.5 Document Search (CRM)

| Field | Searchable |
|-------|------------|
| Document ID | ✓ |
| Application ID | ✓ |
| Document type | ✓ filter |
| Verification status | ✓ filter |
| Upload date | ✓ filter |

## 38.6 Search UX Patterns

| Pattern | Application |
|---------|-------------|
| Instant search | Debounce 300ms; min 3 characters |
| Recent searches | CRM: last 5 (local storage) |
| Saved filters | CRM lead/application lists |
| Empty state | Guided "Try searching by mobile or ID" |
| No results | Suggest filters adjustment |

---

# 39. UI COMPONENT INVENTORY

*Component library for wireframe and design system planning — not visual specs.*

## 39.1 Buttons

| Component | Variants | Usage |
|-----------|----------|-------|
| Primary Button | Default, loading, disabled | CTA: Apply, Submit, Save |
| Secondary Button | Outline | Cancel, Back |
| Tertiary Button | Text only | Skip, Learn more |
| Destructive Button | Red | Withdraw, Delete, Reject |
| Icon Button | Circular | Share, notification bell |
| FAB | Floating | Quick lead submit (DSA), AI chat |
| Button Group | Segmented | Filter tabs, status toggle |
| Link Button | Underline | Terms, privacy links |

## 39.2 Cards

| Component | Usage |
|-----------|-------|
| Status Card | Dashboard application status |
| Product Card | Catalog product tile |
| Lead Card | CRM lead queue item |
| Commission Card | DSA earnings summary |
| KPI Card | Management dashboard metric |
| Document Card | Upload checklist item |
| AI Recommendation Card | Product suggestion |
| Partner Card | DSA list item |
| Notification Card | Notification list item |
| Insight Card | AI tip / cross-sell |

## 39.3 Tables (CRM)

| Component | Usage |
|-----------|-------|
| Data Table | Lead list, application list, commission ledger |
| Sortable Column Header | All list views |
| Row Selection Checkbox | Bulk actions |
| Expandable Row | Lead detail inline |
| Pagination Bar | Server-side pagination |
| Column Visibility Toggle | Admin tables |
| Inline Edit Cell | Quick status update |
| Empty Table State | No records illustration |
| Sticky Header | Long scroll lists |

## 39.4 Forms

| Component | Usage |
|-----------|-------|
| Text Input | Name, amount, general text |
| Mobile Input | Phone with +91 prefix |
| OTP Input | 6-box OTP entry |
| Currency Input | Loan amount with ₹ formatting |
| Dropdown Select | Product, lender, status |
| Multi-select | Document types, filters |
| Date Picker | DOB, appointment |
| Radio Group | Employment type, product variant |
| Checkbox | Consent, multi-select filters |
| Toggle Switch | Notification preferences |
| File Upload Zone | Drag-drop document upload |
| Stepper Form | Application wizard steps |
| Form Section Header | Grouped form fields |
| Inline Validation Message | Zod validation errors |
| Auto-save Indicator | Draft application saving |

## 39.5 Modals & Overlays

| Component | Usage |
|-----------|-------|
| Confirmation Modal | Logout, withdraw, reject |
| Assignment Modal | Lead/application assign |
| Document Viewer Modal | Full-screen doc preview |
| Filter Drawer | Mobile list filters |
| AI Copilot Drawer | CRM right sidebar |
| Bottom Sheet (mobile) | Quick actions, share |
| Toast / Snackbar | Success, error feedback |
| Loading Overlay | Full-screen processing |
| SLA Alert Banner | CRM top banner |

## 39.6 Timeline

| Component | Usage |
|-----------|-------|
| Application Milestone Timeline | Customer + CRM status tracking |
| Lead Activity Timeline | CRM lead history |
| Stage Progress Stepper | Application wizard progress |
| Vertical Timeline | Audit/history views |
| SLA Countdown Timer | CRM lead queue |

## 39.7 Charts (CRM / Management)

| Component | Usage |
|-----------|-------|
| Funnel Chart | Lead conversion |
| Line Chart | Revenue trend, TAT trend |
| Bar Chart | Branch comparison, product mix |
| Pie/Donut Chart | Channel mix, status distribution |
| KPI Trend Sparkline | Dashboard cards |
| Heatmap | SLA compliance by branch |
| Gauge Chart | Target achievement % |
| Leaderboard List | Partner ranking |

## 39.8 Widgets (Dashboard)

| Component | Usage |
|-----------|-------|
| Priority Queue Widget | Sales dashboard |
| SLA Alert Widget | Branch dashboard |
| Target Progress Widget | Sales, DSA tier |
| Quick Action Widget | Dashboard shortcuts |
| AI Copilot Widget | CRM sidebar |
| Commission Summary Widget | DSA dashboard |
| Document Pending Widget | Application detail |
| Partner Performance Widget | Branch dashboard |
| Notification Feed Widget | All dashboards |
| Weather-style Greeting | Dashboard header (optional) |

## 39.9 Lists (Mobile)

| Component | Usage |
|-----------|-------|
| Standard List Item | Notifications, settings menu |
| Lead List Item | DSA lead with status badge |
| Application List Item | Customer applications |
| Chat Message List | AI advisor conversation |
| Document List Item | Upload checklist |
| Swipe Actions | Archive notification, call lead |
| Pull-to-refresh | All mobile lists |
| Infinite Scroll | Long history lists |
| Section Header List | Grouped by date/status |

---

# 40. ANALYTICS EVENT TRACKING

## 40.1 Event Naming Convention

```
{platform}.{module}.{action}

Examples:
  customer.product.view
  customer.application.submit
  dsa.lead.create
  crm.lead.assign
```

## 40.2 Screen Tracking (Screen View Events)

| Platform | Event Name | Properties |
|----------|------------|------------|
| Customer | `customer.screen.view` | `screen_id`, `screen_name`, `previous_screen` |
| DSA | `dsa.screen.view` | `screen_id`, `screen_name` |
| CRM | `crm.screen.view` | `screen_id`, `role`, `module` |

**Auto-track:** All screens in inventory (C-*, D-*, CRM-*, MGT-*) on mount.

## 40.3 Click Tracking (Key Actions)

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `customer.auth.otp_sent` | OTP requested | `channel` |
| `customer.auth.login_success` | OTP verified | `is_new_user` |
| `customer.product.select` | Product tapped | `product_id`, `product_family` |
| `customer.eligibility.check` | Eligibility submitted | `product_id`, `result` |
| `customer.application.start` | Wizard step 1 | `product_id`, `variant` |
| `customer.application.step_complete` | Each wizard step | `step_number`, `application_id` |
| `customer.application.submit` | Final submit | `application_id`, `product_id` |
| `customer.document.upload` | Doc uploaded | `doc_type`, `application_id` |
| `customer.ai.chat_start` | AI conversation opened | `source` |
| `customer.ai.recommendation_apply` | Apply from AI | `product_id` |
| `customer.referral.share` | Share referral link | `channel` |
| `customer.support.ticket_create` | Ticket created | `category` |
| `dsa.lead.create` | Lead submitted | `product_id`, `has_docs` |
| `dsa.commission.view` | Commission detail viewed | `commission_id` |
| `dsa.dispute.raise` | Dispute raised | `commission_id` |
| `crm.lead.contact` | Call logged | `lead_id`, `disposition` |
| `crm.lead.convert` | Lead → application | `lead_id`, `application_id` |
| `crm.application.stage_advance` | Stage changed | `from_stage`, `to_stage` |
| `crm.copilot.query` | Copilot used | `context_type` |
| `crm.document.verify` | Doc verified | `document_id`, `result` |

## 40.4 Conversion Tracking

| Funnel Name | Steps (Events) |
|-------------|----------------|
| **Customer Acquisition** | `screen.view` (Catalog) → `product.select` → `auth.login_success` |
| **Application Completion** | `application.start` → `step_complete` (all) → `application.submit` |
| **Document Completion** | `document.upload` (first) → `document.upload` (all required) |
| **Disbursement** | `application.submit` → `application.disbursed` (server event) |
| **DSA Lead Conversion** | `dsa.lead.create` → `dsa.lead.converted` (server) |
| **Referral Conversion** | `referral.share` → `referral.converted` (server) |
| **AI to Application** | `ai.chat_start` → `ai.recommendation_apply` → `application.start` |

## 40.5 Funnel Tracking

| Funnel ID | Platform | Stages |
|-----------|----------|--------|
| F-001 | Customer | Visit → Register → Apply → Docs → Disburse |
| F-002 | Customer | AI Chat → Eligibility → Apply |
| F-003 | DSA | Login → Lead Create → Convert |
| F-004 | CRM | Lead Assigned → Contacted → Qualified → Submitted → Disbursed |
| F-005 | CRM | Application → Credit → Lender → Sanction → Disburse |

## 40.6 User Properties (Analytics Identity)

| Property | Platforms |
|----------|-----------|
| `user_id` | All |
| `role` | CRM, DSA |
| `branch_id` | CRM, DSA |
| `region_id` | CRM |
| `partner_tier` | DSA |
| `app_version` | Mobile |
| `language` | All |

## 40.7 Analytics Tools

| Tool | Usage |
|------|-------|
| Firebase Analytics | Mobile screen views, basic events |
| Mixpanel or Amplitude (Phase 2) | Funnels, cohorts, retention |
| Internal event bus | Server-side business events |
| CRM dashboard | Operational metrics from DB |

---

# 41. FUTURE MODULE SCREENS

## 41.1 Insurance Module (Phase 2)

| Screen ID | Screen Name | Platform |
|-----------|-------------|----------|
| FUT-INS-01 | Insurance Catalog | Customer |
| FUT-INS-02 | Life Insurance Detail | Customer |
| FUT-INS-03 | Health Insurance Detail | Customer |
| FUT-INS-04 | Insurance Eligibility | Customer |
| FUT-INS-05 | Insurance Application Wizard | Customer |
| FUT-INS-06 | Insurance Status Tracking | Customer |
| FUT-INS-07 | Insurance Cross-sell (CRM) | CRM |
| FUT-INS-08 | Insurance Commission Rules | CRM Admin |

## 41.2 Personal Loan Module (Phase 2)

| Screen ID | Screen Name | Platform |
|-----------|-------------|----------|
| FUT-PL-01 | Personal Loan Overview | Customer |
| FUT-PL-02 | PL Eligibility | Customer |
| FUT-PL-03 | PL Application Wizard | Customer |
| FUT-PL-04 | PL Status Tracking | Customer |
| FUT-PL-05 | PL Processing Queue | CRM |

## 41.3 Credit Card Module (Phase 2)

| Screen ID | Screen Name | Platform |
|-----------|-------------|----------|
| FUT-CC-01 | Credit Card Catalog | Customer |
| FUT-CC-02 | Card Comparison | Customer |
| FUT-CC-03 | Card Eligibility Check | Customer |
| FUT-CC-04 | Card Application | Customer |
| FUT-CC-05 | Card Application Status | Customer |
| FUT-CC-06 | Card Referral Tracking | CRM |

## 41.4 Mutual Fund Module (Phase 2–3)

| Screen ID | Screen Name | Platform |
|-----------|-------------|----------|
| FUT-MF-01 | MF Discovery | Customer |
| FUT-MF-02 | Risk Profiler Questionnaire | Customer |
| FUT-MF-03 | Fund Detail | Customer |
| FUT-MF-04 | SIP Calculator | Customer |
| FUT-MF-05 | SIP Setup Wizard | Customer |
| FUT-MF-06 | MF Portfolio View | Customer |
| FUT-MF-07 | RM MF Advisory Dashboard | CRM |

## 41.5 Fixed Deposit Module (Phase 2)

| Screen ID | Screen Name | Platform |
|-----------|-------------|----------|
| FUT-FD-01 | FD Rate Comparison | Customer |
| FUT-FD-02 | FD Booking Wizard | Customer |
| FUT-FD-03 | FD Portfolio | Customer |

## 41.6 Gold Loan Module (Phase 3)

| Screen ID | Screen Name | Platform |
|-----------|-------------|----------|
| FUT-GL-01 | Gold Loan Overview | Customer |
| FUT-GL-02 | Gold Valuation Estimator | Customer |
| FUT-GL-03 | Gold Loan Application | Customer |
| FUT-GL-04 | Pledge Document Upload | Customer/DSA |
| FUT-GL-05 | Gold Loan Processing | CRM |

## 41.7 Wealth Management Module (Phase 4)

| Screen ID | Screen Name | Platform |
|-----------|-------------|----------|
| FUT-WM-01 | Wealth Dashboard | Customer |
| FUT-WM-02 | Advisory Consultation Book | Customer |
| FUT-WM-03 | Portfolio Review | Customer |
| FUT-WM-04 | RM Wealth Advisory Console | CRM |

## 41.8 Video KYC Module (Phase 3)

| Screen ID | Screen Name | Platform |
|-----------|-------------|----------|
| FUT-VKYC-01 | Video KYC — Instructions | Customer |
| FUT-VKYC-02 | Video KYC — Session | Customer |
| FUT-VKYC-03 | Video KYC — Result | Customer |
| FUT-VKYC-04 | Video KYC Review Queue | CRM Compliance |

## 41.9 eSign Module (Phase 3)

| Screen ID | Screen Name | Platform |
|-----------|-------------|----------|
| FUT-ESIGN-01 | eSign — Document Review | Customer |
| FUT-ESIGN-02 | eSign — Signature Capture | Customer |
| FUT-ESIGN-03 | eSign — Completion Confirmation | Customer |
| FUT-ESIGN-04 | eSign Status (CRM) | CRM |

## 41.10 Future Lender Portal (Phase 3)

| Screen ID | Screen Name | Platform |
|-----------|-------------|----------|
| FUT-LEN-01 | Lender Login | Lender Portal |
| FUT-LEN-02 | Application Queue | Lender Portal |
| FUT-LEN-03 | Application Detail | Lender Portal |
| FUT-LEN-04 | Document Download | Lender Portal |
| FUT-LEN-05 | Status Update Form | Lender Portal |
| FUT-LEN-06 | Query / Clarification | Lender Portal |

---

# 42. SCREEN COUNT SUMMARY

## 42.1 Customer App Screen Count

| Module | Screen Count |
|--------|-------------|
| Core App (Splash, Auth, Settings, etc.) | 20 |
| Profile Module | 11 |
| KYC Module | 9 |
| Loan Products (Catalog, Compare, Offers) | 12 |
| Home Loan Screens | 20 |
| LAP Screens | 16 |
| Business Loan Screens | 16 |
| Auto Loan Screens | 17 |
| Calculator Module | 8 |
| AI Advisor Module | 10 |
| AI Voice Module | 7 |
| Document Management | 10 |
| Application Tracking | 9 |
| Referral Module | 9 |
| Support Module | 11 |
| Notification Module | 6 |
| Settings (detailed) | 10 |
| **Customer App Total** | **191** |

*Note: Shared wizard screens reused across HL/LAP/BL/AL variants with variant-specific content — counted per unique screen ID.*

## 42.2 DSA App Screen Count

| Module | Screen Count |
|--------|-------------|
| Core (Splash, Auth, Onboarding, Settings) | 28 |
| Lead Management | 14 |
| Commission & Payouts | 13 |
| **DSA App Total** | **55** |

## 42.3 CRM Screen Count

| Module | Screen Count |
|--------|-------------|
| Dashboards | 11 |
| Lead Management | 12 |
| Customer Management | 12 |
| Application Management | 16 |
| Document Management | 9 |
| Partner Management | 12 |
| Commission Management | 12 |
| Campaign Management | 10 |
| Knowledge Base | 12 |
| Analytics | 15 |
| Support Portal | 12 |
| Admin (Users, Products, Lenders, Settings) | 18 |
| Compliance Console | 8 |
| Auth (Login, MFA, Forgot) | 4 |
| **CRM Total** | **153** |

## 42.4 Management Dashboard Screen Count

| Module | Screen Count |
|--------|-------------|
| Management Dashboards | 10 |
| **Management Total** | **10** |

*Management screens are a subset of CRM routes with role-restricted access — counted separately for planning.*

## 42.5 Future Module Screen Count

| Module | Screen Count |
|--------|-------------|
| Insurance | 8 |
| Personal Loan | 5 |
| Credit Card | 6 |
| Mutual Fund | 7 |
| Fixed Deposit | 3 |
| Gold Loan | 5 |
| Wealth Management | 4 |
| Video KYC | 4 |
| eSign | 4 |
| Lender Portal | 6 |
| **Future Total** | **52** |

## 42.6 Grand Total Summary

| Platform | Phase 1 Screens | Future Screens | Total Planned |
|----------|----------------|----------------|---------------|
| **Customer App** | 191 | 35 | 226 |
| **DSA App** | 55 | 2 | 57 |
| **CRM Admin Panel** | 153 | 15 | 168 |
| **Management Dashboards** | 10 | 0 | 10 |
| **Lender Portal** | 0 | 6 | 6 |
| **GRAND TOTAL** | **409** | **58** | **467** |

## 42.7 Phase 1 MVP Screen Priority

| Priority | Customer | DSA | CRM | Count |
|----------|----------|-----|-----|-------|
| **P0 — Launch** | Auth, Dashboard, 1 product flow (HL), AI Advisor basic, App tracking, DSA lead+commission | 85 | 40 | 125 |
| **P1 — Month 2** | All product families, calculators, referral, voice AI | Full commission, training | Full LOS/LMS | +120 |
| **P2 — Month 3–6** | Polish, cross-sell, advanced AI | Leaderboard, campaigns | Analytics, campaigns, KB | +164 |

## 42.8 Wireframe Sprint Recommendation

| Sprint | Wireframe Focus | Screens |
|--------|----------------|---------|
| Sprint 1 | Customer auth + dashboard + HL wizard | ~35 |
| Sprint 2 | Customer tracking + DSA lead flow | ~30 |
| Sprint 3 | CRM sales dashboard + lead management | ~25 |
| Sprint 4 | CRM application + document processing | ~30 |
| Sprint 5 | DSA commission + CRM partner/commission | ~30 |
| Sprint 6 | AI advisor + copilot + analytics | ~25 |
| Sprint 7 | Management + support + admin | ~35 |

---

# APPENDIX A: SCREEN-TO-API QUICK REFERENCE

| API Domain | Primary Screens |
|------------|----------------|
| `/auth` | C-004–006, D-004–005, CRM login |
| `/customer` | C-PR-*, C-SET-*, C-KYC-* |
| `/products` | C-LP-*, C-HL/LAP/BL/AL overviews |
| `/eligibility` | C-HL-E*, C-CAL-04/05 |
| `/applications` | C-APP-*, C-HL-A*, CRM-AP-* |
| `/documents` | C-DOC-*, CRM-DOC-* |
| `/ai/advisor` | C-AI-* |
| `/voice` | C-VOC-* |
| `/dsa` | D-011, D-LD-*, D-COM-* |
| `/crm` | CRM-LD-*, CRM-CU-* |
| `/credit` | CRM-AP-15, CRM-DOC-01/02 |
| `/ops` | CRM-AP-07, CRM-AP-11 |
| `/admin` | CRM-AD-*, CRM-CM-01/02, CRM-CP-*, CRM-KB-* |
| `/compliance` | CRM-COMP-*, CRM-DB-08 |
| `/auth/crm` | CRM-AU-01–04 |
| `/management` | MGT-* |
| `/analytics` | CRM-AN-* |
| `/support` | C-SUP-*, SUP-* |

---

# APPENDIX B: WIREFRAME DELIVERABLE CHECKLIST

| Deliverable | Format | Owner |
|-------------|--------|-------|
| Customer App user flows | Figma FigJam | UX |
| Customer App screens (P0) | Figma | UI Design |
| DSA App screens | Figma | UI Design |
| CRM wireframes (low-fi) | Figma | UX |
| CRM dashboards | Figma | UI Design |
| Component library | Figma | UI Design |
| Mobile navigation prototype | Figma prototype | UX |
| CRM sidebar prototype | Figma prototype | UX |
| Accessibility annotations | Figma | UX |

---

# APPENDIX C: ACCESSIBILITY REQUIREMENTS (IA Level)

| Requirement | Application |
|-------------|-------------|
| Touch target minimum | 44×44pt (mobile) |
| Screen reader labels | All interactive elements |
| Color contrast | WCAG AA (design phase) |
| OTP input | Accessible digit boxes |
| Timeline | Screen reader milestone announcements |
| Tables | Keyboard navigable (CRM) |
| Error messages | Linked to form fields |
| Hindi localization | 30% longer text allowance in layouts |

---

# APPENDIX D: DOCUMENT APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Head of Product | | | |
| Head of UX/Design | | | |
| CTO | | | |
| CEO / Managing Director | | | |

---

# APPENDIX E: REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | Kuber Finserve Product & UX Team | Initial Screen Planning & IA document |

---

# APPENDIX F: RELATED DOCUMENT INDEX

| Document | Relationship |
|----------|-------------|
| [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md) | Technical architecture for each screen's backend |
| [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) | Role-based screen access |
| [KUBERONE_USER_TYPES_AND_ROLES.md](./KUBERONE_USER_TYPES_AND_ROLES.md) | Persona workflows driving screen design |
| [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md) | Product flows for loan wizards |

---

**© 2026 Kuber Finserve. Confidential — For Internal, UX, Product, and Engineering Use.**

*This document is the authoritative screen inventory and information architecture for KuberOne. Wireframes, UI design, and development sprints must reference screen IDs defined herein.*
