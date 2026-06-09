# KuberOne
## User Types & Roles Document

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Business Requirements Document (BRD) — User Types & Roles  
**Classification:** Enterprise | Investor-Ready | Board Presentation | RBAC Foundation  
**Version:** 1.0  
**Date:** June 2026  
**Related Document:** KUBERONE_VISION_AND_OBJECTIVES.md  

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | User personas, role hierarchy, RBAC, dashboards, KPIs, notifications, security |
| **Audience** | Board, Product, Engineering, Security, Operations, HR, Compliance |
| **Purpose** | Drive database design, RBAC, mobile apps, CRM, API permissions, workflows, reporting |
| **Status** | Strategic Foundation Document |

---

# 23. EXECUTIVE SUMMARY

*Presented first for board-level consumption.*

## Purpose of This Document

This document defines the **complete user ecosystem** for KuberOne—the identities, roles, hierarchies, permissions, workflows, dashboards, KPIs, and security rules that govern how every stakeholder interacts with the platform.

It is the authoritative reference for:

- Role-Based Access Control (RBAC) implementation
- Mobile app role experiences (Customer App, DSA App, Internal CRM)
- API permission design and security architecture
- Workflow automation and escalation rules
- Dashboard and reporting structure
- Organizational design and future product expansion

## User Ecosystem at a Glance

KuberOne serves **five primary user domains**:

| Domain | User Types | Count (Design) |
|--------|-----------|----------------|
| **External — Customers** | Customer | Unlimited |
| **External — Partners** | DSA Partner, Referral Partner (6 sub-types) | Scalable network |
| **Internal — Sales & Service** | Sales Executive, Relationship Manager | Branch-assigned |
| **Internal — Processing** | Credit Executive, Operations Executive | Central + branch |
| **Internal — Leadership** | Branch Manager, Regional Manager, Management (6 sub-roles) | Hierarchical |
| **Internal — Platform** | Support Team, Compliance Team, Admin, Super Admin | Functional |
| **External — Future** | Lender / Bank User | Per-lender integration |

## Organizational Structure Summary

```
Super Admin
    └── Admin (Platform Operations)
            └── Management (CEO, Directors, Functional Heads)
                    └── Regional Manager
                            └── Branch Manager
                                    ├── Sales Executive
                                    ├── Relationship Manager
                                    ├── Credit Executive (dotted line to Ops)
                                    └── Operations Executive
            └── Compliance Team (functional, cross-cutting)
            └── Support Team (functional, cross-cutting)
    └── DSA Partner (external, branch-attributed)
    └── Referral Partner (external, campaign-attributed)
    └── Customer (external, self-service)
    └── Lender User (external, future — limited portal)
```

## Key Design Principles

1. **Least Privilege** — Every role receives minimum permissions required for responsibilities
2. **Data Ownership** — Clear ownership rules prevent unauthorized cross-access
3. **Hierarchical Inheritance** — Managers inherit visibility into subordinate data within scope
4. **Partner Isolation** — Partners see only their leads, commissions, and attributed customers
5. **Customer Privacy** — Customers control their data; internal access is role-governed and audited
6. **Product Agnostic Roles** — Role structure supports loans today; insurance, cards, MF tomorrow without redesign
7. **Audit Everything** — All sensitive actions logged with actor, timestamp, and context

## Scale Readiness

The role architecture supports:

- **Geographic scale** — Regional → Branch → Executive hierarchy replicates per territory
- **Partner scale** — DSA and Referral partner types onboard without new role categories
- **Product scale** — Product permissions layer on existing roles (e.g., Sales Executive + Insurance module)
- **Organizational scale** — Management sub-roles and functional teams expand without hierarchy change

**Board Recommendation:** Approve this user and role framework as the governance foundation for all KuberOne platform development.

---

# 1. USER ECOSYSTEM OVERVIEW

## 1.1 Ecosystem Diagram

```
                              ┌─────────────────────────────────────────┐
                              │           KUBERONE USER ECOSYSTEM        │
                              └─────────────────────────────────────────┘

    EXTERNAL USERS                                    INTERNAL USERS
    ──────────────                                    ──────────────

┌──────────────┐                              ┌──────────────────────────┐
│   CUSTOMER   │◄──── applies, tracks ────────│    SALES EXECUTIVE       │
│  (Self-serv) │      documents, support       │    (Lead conversion)     │
└──────┬───────┘                              └────────────┬─────────────┘
       │                                                   │
       │ refers                                   manages │ reports to
       ▼                                                   ▼
┌──────────────┐     submits leads              ┌──────────────────────────┐
│ REFERRAL     │───────────────────────────────►│    BRANCH MANAGER        │
│ PARTNER      │     earns rewards              │    (Branch operations)   │
└──────────────┘                                └────────────┬─────────────┘
       ▲                                                     │
       │ refers                                     reports to│
┌──────────────┐                                             ▼
│ DSA PARTNER  │──── submits leads, tracks ───►┌──────────────────────────┐
│ (Originator) │     commission, pipeline      │    REGIONAL MANAGER      │
└──────────────┘                                │    (Multi-branch)        │
                                                └────────────┬─────────────┘
                                                             │
       ┌─────────────────────────────────────────────────────┤
       │                                                     │
       ▼                                                     ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│ RELATIONSHIP │  │    CREDIT    │  │  OPERATIONS  │  │    MANAGEMENT    │
│   MANAGER    │  │  EXECUTIVE   │  │  EXECUTIVE   │  │  (CEO, Heads)    │
│ (Retention,  │  │ (Assessment, │  │ (Processing, │  │  (Strategy, KPIs)│
│  cross-sell) │  │  verification)│  │ disbursement)│  └──────────────────┘
└──────────────┘  └──────────────┘  └──────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐
│   SUPPORT    │  │  COMPLIANCE  │  │  ADMIN / SUPER ADMIN     │
│    TEAM      │  │     TEAM     │  │  (Platform governance)   │
└──────────────┘  └──────────────┘  └──────────────────────────┘

                              FUTURE
                              ──────
                    ┌──────────────────┐
                    │  LENDER / BANK   │
                    │  USER (Portal)   │
                    └──────────────────┘
```

## 1.2 User Domain Classification

| Domain | Type | Authentication | Primary Interface |
|--------|------|----------------|-----------------|
| Customer | External B2C | Mobile OTP / Email | Customer App, Web, WhatsApp |
| DSA Partner | External B2B | Mobile OTP + KYC | DSA App |
| Referral Partner | External B2B | Mobile OTP + Verification | Referral Portal / DSA App Lite |
| Sales Executive | Internal Employee | SSO / Email + MFA | CRM Web + Mobile |
| Relationship Manager | Internal Employee | SSO / Email + MFA | CRM Web + Mobile |
| Credit Executive | Internal Employee | SSO / Email + MFA | CRM Web |
| Operations Executive | Internal Employee | SSO / Email + MFA | CRM Web |
| Branch Manager | Internal Employee | SSO / Email + MFA | CRM Web + Dashboard |
| Regional Manager | Internal Employee | SSO / Email + MFA | CRM Web + Dashboard |
| Support Team | Internal Employee | SSO / Email + MFA | Support Console |
| Compliance Team | Internal Employee | SSO / Email + MFA | Compliance Console |
| Admin | Internal Platform | SSO / Email + MFA | Admin Console |
| Super Admin | Internal Platform | SSO + MFA + IP Restrict | Admin Console |
| Management | Internal Leadership | SSO / Email + MFA | Executive Dashboard |
| Lender User (Future) | External B2B | API + Portal Auth | Lender Portal |

## 1.3 Relationship Map

### Customer Relationships

| Relationship | Counterparty | Interaction |
|--------------|-------------|-------------|
| Applies for product | Sales Executive / DSA | Lead creation, document submission |
| Receives service | Relationship Manager | Post-disbursement engagement |
| Seeks support | Support Team | Ticket resolution |
| Refers others | Referral Engine | Referral rewards |
| Tracked by | Branch (attributed) | Reporting and SLA |

### DSA Partner Relationships

| Relationship | Counterparty | Interaction |
|--------------|-------------|-------------|
| Reports to (business) | Branch Manager | Performance, disputes, training |
| Submits leads to | Sales Executive / Operations | Lead handoff |
| Earns from | Commission Engine | Payouts |
| Supported by | Support Team | Technical and process issues |
| Governed by | Compliance Team | KYC, agreement compliance |

### Referral Partner Relationships

| Relationship | Counterparty | Interaction |
|--------------|-------------|-------------|
| Refers customers to | KuberOne Platform | Lead submission only |
| Earns from | Referral Engine | One-time or tiered rewards |
| Managed by | Branch / Campaign Owner | Attribution and verification |
| Distinct from DSA | No full pipeline access | Limited permissions |

### Sales Executive Relationships

| Relationship | Counterparty | Interaction |
|--------------|-------------|-------------|
| Reports to | Branch Manager | Targets, performance, escalations |
| Handles leads from | Customer, DSA, Referral, Campaigns | Conversion |
| Hands off to | Credit / Operations | Application processing |
| Collaborates with | Relationship Manager | Customer handoff post-disbursement |
| Supported by | Support Team | Issue resolution |

### Relationship Manager Relationships

| Relationship | Counterparty | Interaction |
|--------------|-------------|-------------|
| Reports to | Branch Manager | Retention and cross-sell targets |
| Owns portfolio | Disbursed Customers | Lifecycle management |
| Collaborates with | Sales Executive | Repeat applications |
| Identifies opportunities for | Cross-sell products | Revenue expansion |

### Credit Executive Relationships

| Relationship | Counterparty | Interaction |
|--------------|-------------|-------------|
| Reports to | Operations Head (functional) / Branch Manager (dotted) | Work allocation |
| Receives from | Sales Executive | Applications for assessment |
| Hands off to | Operations Executive | Approved applications for submission |
| Escalates to | Branch Manager / Compliance | Risk exceptions |

### Operations Executive Relationships

| Relationship | Counterparty | Interaction |
|--------------|-------------|-------------|
| Reports to | Operations Head (functional) / Branch Manager (dotted) | Processing SLAs |
| Receives from | Credit Executive | Verified applications |
| Coordinates with | Lender Systems (future: Lender User) | Submission, status |
| Updates | Customer, DSA, Sales Executive | Status notifications |

### Branch Manager Relationships

| Relationship | Counterparty | Interaction |
|--------------|-------------|-------------|
| Reports to | Regional Manager | Branch performance |
| Manages | Sales, RM, Credit, Ops executives | Team leadership |
| Oversees | DSA partners in territory | Partner performance |
| Escalates to | Regional Manager, Management | Critical issues |

### Regional Manager Relationships

| Relationship | Counterparty | Interaction |
|--------------|-------------|-------------|
| Reports to | Sales Head / Business Head | Regional performance |
| Manages | Branch Managers | Multi-branch oversight |
| Accountable for | Regional revenue and growth | P&L contribution |

### Support Team Relationships

| Relationship | Counterparty | Interaction |
|--------------|-------------|-------------|
| Serves | Customer, DSA, Internal users | Ticket resolution |
| Escalates to | Branch Manager, Admin | Unresolved issues |
| Reports to | Operations Head | SLA performance |

### Compliance Team Relationships

| Relationship | Counterparty | Interaction |
|--------------|-------------|-------------|
| Governs | All users and processes | Policy enforcement |
| Audits | Partners, applications, documents | Risk and fraud |
| Reports to | Management / Board | Regulatory compliance |

### Admin / Super Admin Relationships

| Relationship | Counterparty | Interaction |
|--------------|-------------|-------------|
| Manages | All platform configuration | System governance |
| Supports | All internal roles | User provisioning |
| Reports to | CTO / CEO | Platform health |

### Management Relationships

| Relationship | Counterparty | Interaction |
|--------------|-------------|-------------|
| Oversees | Entire organization via hierarchy | Strategic governance |
| Consumes | Analytics, reports, dashboards | Decision making |
| Sets | Targets, policies, product strategy | Business direction |

### Lender User (Future) Relationships

| Relationship | Counterparty | Interaction |
|--------------|-------------|-------------|
| Receives applications from | Operations Executive | Submission |
| Updates status to | KuberOne Platform | Approval/rejection |
| Limited visibility | Application data only | No customer PII beyond need |

## 1.4 Interaction Flow Summary

```
ACQUISITION FLOW:
Customer/DSA/Referral → Lead (LMS) → Sales Executive → Application (LOS)
    → Credit Executive → Operations Executive → Lender → Disbursement
    → Relationship Manager (retention) → Cross-sell → Repeat cycle

GOVERNANCE FLOW:
Compliance Team ← audits → All processes
Support Team ← tickets ← All users
Admin/Super Admin ← configures → Platform
Management ← dashboards ← Analytics
```

---

# 2. CUSTOMER PERSONA

## 2.1 Who Is the Customer?

The **Customer** is an individual or business entity seeking financial products through Kuber Finserve via KuberOne. Primary segments:

| Segment | Profile | Primary Need |
|---------|---------|--------------|
| **Salaried Borrower** | Age 25–45, stable income | Personal loan, home loan |
| **Self-Employed Borrower** | Business owner, freelancer | Business loan, working capital |
| **First-Time Borrower** | Limited credit history | Guided eligibility, education |
| **Repeat Customer** | Prior Kuber Finserve relationship | Faster re-application, cross-sell |
| **Referrer Customer** | Satisfied post-disbursement customer | Referral rewards |

**Authentication:** Mobile number + OTP (primary); optional email; biometric on mobile app.

## 2.2 Customer Objectives

| # | Objective |
|---|-----------|
| C-OBJ-01 | Discover suitable financial products for their needs |
| C-OBJ-02 | Check eligibility without commitment |
| C-OBJ-03 | Apply with minimal paperwork and hassle |
| C-OBJ-04 | Track application status in real time |
| C-OBJ-05 | Receive timely updates without chasing agents |
| C-OBJ-06 | Access documents and application history |
| C-OBJ-07 | Obtain post-disbursement support and financial guidance |
| C-OBJ-08 | Earn rewards by referring friends and family |
| C-OBJ-09 | Monitor credit health and financial wellness |
| C-OBJ-10 | Manage privacy and consent preferences |

## 2.3 Customer Pain Points

| Pain Point | KuberOne Response |
|------------|-------------------|
| Unclear eligibility | AI Advisor eligibility check |
| Repeated document requests | Guided upload with validation feedback |
| No status visibility | Real-time milestone tracking |
| Opaque timelines | SLA-based milestone estimates |
| Hidden charges | Transparent fee and charge disclosure |
| Poor follow-up | Proactive WhatsApp/push notifications |
| One-time transactional relationship | Lifecycle engagement post-disbursement |
| Privacy concerns | Consent management and data access controls |

## 2.4 Customer Expectations

- **Speed:** Application initiation in <10 minutes; status updates within hours
- **Transparency:** Clear milestones, charges, and rejection reasons
- **Guidance:** AI and human support when needed—not purely self-service
- **Omnichannel:** App, web, WhatsApp—consistent experience
- **Security:** Data protection, secure document handling
- **Respect:** No spam; purposeful, timely communication only
- **Control:** Ability to pause, withdraw, or update application

## 2.5 Customer Lifecycle

```
┌─────────┐   ┌──────────┐   ┌────────────┐   ┌─────────────┐   ┌────────────┐
│ AWARE   │──►│ ENGAGED  │──►│ APPLICANT  │──►│  CUSTOMER   │──►│  ADVOCATE  │
│         │   │          │   │            │   │ (Disbursed) │   │ (Referrer) │
└─────────┘   └──────────┘   └────────────┘   └─────────────┘   └────────────┘
     │              │               │                 │                  │
  Marketing      AI Advisor      Application       Servicing          Referral
  Campaigns      Eligibility     Processing        Cross-sell         Rewards
```

| Stage | Definition | Platform Touchpoints |
|-------|------------|-------------------|
| **Aware** | Knows Kuber Finserve exists | Ads, website, partner referral |
| **Engaged** | Registered, exploring products | App, AI Advisor, eligibility tools |
| **Applicant** | Active application in progress | App, document upload, status tracking |
| **Customer** | Disbursed / product active | RM engagement, cross-sell, wellness |
| **Advocate** | Refers others | Referral engine, rewards |
| **Dormant** | No activity >12 months | Re-engagement campaigns |
| **Churned** | Explicitly departed / closed | Win-back (limited) |

## 2.6 Customer Journey

| Step | Journey Stage | Customer Action | Platform Response |
|------|--------------|-----------------|-------------------|
| 1 | Discovery | Lands on app/web via campaign or referral | Personalized welcome, product catalog |
| 2 | Exploration | Uses AI Advisor for eligibility | Product recommendations, checklist preview |
| 3 | Registration | OTP verification, basic profile | Account created, consent captured |
| 4 | Application | Selects product, enters details | Application created in LOS |
| 5 | Documentation | Uploads required documents | Validation, deficiency alerts |
| 6 | Processing | Waits for assessment | Status milestones, proactive updates |
| 7 | Decision | Receives approval/rejection | Clear outcome, next steps |
| 8 | Disbursement | Loan credited | Confirmation, servicing information |
| 9 | Servicing | Ongoing relationship | RM outreach, cross-sell, credit health |
| 10 | Referral | Refers contacts | Referral link, reward tracking |

## 2.7 Customer Permissions

| Resource | Create | Read | Update | Delete | Notes |
|----------|--------|------|--------|--------|-------|
| Own profile | ✓ | ✓ | ✓ | ✓ (deactivate) | Cannot delete audit history |
| Own applications | ✓ | ✓ | ✓ (draft only) | ✓ (withdraw pre-submission) | Post-submission: update docs only |
| Own documents | ✓ (upload) | ✓ | ✓ (re-upload) | ✗ | Soft-delete via withdrawal |
| Own referrals | ✓ | ✓ | ✗ | ✗ | View referral status |
| Support tickets | ✓ | ✓ (own) | ✓ (add comment) | ✗ | Cannot close—support closes |
| Consent preferences | ✓ | ✓ | ✓ | ✗ | GDPR/DPDP-aligned |
| Product catalog | ✗ | ✓ | ✗ | ✗ | Read-only |
| Commission/pricing internals | ✗ | ✗ | ✗ | ✗ | No access |
| Other customers | ✗ | ✗ | ✗ | ✗ | Strict isolation |

## 2.8 Customer Dashboard Access

**Dashboard Name:** Customer Home Dashboard

| Widget | Access | Description |
|--------|--------|-------------|
| Application Status Card | ✓ | Active application milestone tracker |
| Document Checklist | ✓ | Required docs with upload status |
| Product Recommendations | ✓ | AI Advisor suggestions |
| Credit Health Score | ✓ | Score and factors (when available) |
| Referral Summary | ✓ | Referrals sent, rewards earned |
| Notification Center | ✓ | All alerts and messages |
| Support Tickets | ✓ | Open and closed tickets |
| Application History | ✓ | Past applications and outcomes |
| Financial Wellness Tips | ✓ | Educational content |
| Branch/Agent Contact | ✓ | Assigned executive contact (if assigned) |

**Restricted from Customer Dashboard:**
- Internal notes, credit assessments, commission data
- Other customer data
- Lender-internal status codes (shown as customer-friendly milestones)

## 2.9 Customer Actions

| Action | Trigger | System Effect |
|--------|---------|---------------|
| Register account | OTP verification | Customer profile created |
| Check eligibility | AI Advisor query | Eligibility result logged |
| Start application | Product selection | Lead + application created |
| Upload document | File upload | Document queued for verification |
| Track status | Dashboard view | Audit log entry |
| Withdraw application | Pre-disbursement | Application cancelled, reason captured |
| Raise support ticket | Help request | Ticket created in support queue |
| Submit referral | Referral form/link | Referral lead created with attribution |
| Update consent | Privacy settings | Consent record updated |
| Rate experience | Post-milestone survey | NPS/CSAT captured |

## 2.10 Customer KPIs

| KPI | Definition | Target | Measured By |
|-----|------------|--------|-------------|
| Registration-to-Application Rate | Applications / registrations | 40%+ | Platform analytics |
| Application Completion Rate | Submitted / started | 70%+ | LOS |
| Document First-Pass Rate | Complete docs on first upload | 60%+ | DMS |
| Customer NPS | Net Promoter Score | 50+ | Surveys |
| CSAT (Support) | Support satisfaction | 4.5/5 | Ticket surveys |
| App Engagement (MAU) | Monthly active users | Growth tracked | App analytics |
| Referral Rate | Customers who refer | 15%+ | Referral engine |
| Time to First Application | Registration to application start | <24 hours | Funnel analytics |
| Status Self-Service Rate | Status checks without calling | 80%+ | Support vs. app analytics |

## 2.11 Customer Notifications

| Event | SMS | Email | Push | WhatsApp | In-App |
|-------|-----|-------|------|----------|--------|
| Registration welcome | ✓ | ✓ | ✓ | ✓ | ✓ |
| OTP / security | ✓ | ✗ | ✗ | ✓ | ✓ |
| Application created | ✓ | ✓ | ✓ | ✓ | ✓ |
| Document deficiency | ✓ | ✓ | ✓ | ✓ | ✓ |
| Status milestone change | ✓ | ✓ | ✓ | ✓ | ✓ |
| Approval / rejection | ✓ | ✓ | ✓ | ✓ | ✓ |
| Disbursement confirmation | ✓ | ✓ | ✓ | ✓ | ✓ |
| Referral reward earned | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cross-sell offer | ✗ | ✓ | ✓ | ✓ | ✓ |
| Support ticket update | ✓ | ✓ | ✓ | ✓ | ✓ |
| Credit score update | ✗ | ✓ | ✓ | ✗ | ✓ |
| Marketing (opt-in) | ✗ | ✓ | ✓ | ✓ | ✓ |

*Customer controls marketing channel preferences via consent settings.*

## 2.12 Customer Support Interactions

| Channel | Availability | Scope |
|---------|-------------|-------|
| In-app chat | Business hours + AI after hours | Application help, status |
| WhatsApp | Business hours | Document help, status |
| Phone (IVR + agent) | Business hours | Escalated issues |
| Email | 24h response SLA | Formal complaints |
| AI Advisor | 24/7 | FAQ, eligibility, guidance |

**Support Scope for Customers:**
- Application status inquiries
- Document upload assistance
- Complaint registration
- Dispute on charges or process
- Data access requests
- Account deactivation requests

**Escalation Path:** Support Agent → Support Lead → Branch Manager → Regional Manager

## 2.13 Customer Referral Capabilities

| Capability | Detail |
|------------|--------|
| Referral link generation | Unique link per customer |
| Referral code | Shareable code for manual attribution |
| Referral tracking | View referred lead status (name masked until conversion) |
| Reward visibility | Earned, pending, paid rewards |
| Referral limits | Configurable (e.g., max 50 active referrals) |
| Reward types | Cash, voucher, fee waiver—configurable by campaign |
| Terms acceptance | Must accept referral program T&C |

## 2.14 Customer Document Access

| Document Type | Upload | View | Download | Delete |
|---------------|--------|------|----------|--------|
| Identity (Aadhaar, PAN) | ✓ | ✓ | ✓ | ✗ |
| Address proof | ✓ | ✓ | ✓ | ✗ |
| Income proof | ✓ | ✓ | ✓ | ✗ |
| Bank statements | ✓ | ✓ | ✓ | ✗ |
| Property documents | ✓ | ✓ | ✓ | ✗ |
| Sanction letter | ✗ | ✓ | ✓ | ✗ |
| Loan agreement | ✗ | ✓ | ✓ | ✗ |
| Disbursement proof | ✗ | ✓ | ✓ | ✗ |

*Documents stored encrypted; access logged; retention per regulatory policy.*

## 2.15 Customer Application Access

| Application State | View | Edit Details | Upload Docs | Withdraw |
|-------------------|------|--------------|-------------|----------|
| Draft | ✓ | ✓ | ✓ | ✓ |
| Submitted | ✓ | ✗ | ✓ (deficiency) | ✓ (with reason) |
| Under Review | ✓ | ✗ | ✓ (if requested) | ✓ (with reason) |
| Approved | ✓ | ✗ | ✗ | ✗ |
| Disbursed | ✓ | ✗ | ✗ | ✗ |
| Rejected | ✓ | ✗ | ✗ | ✗ (may re-apply as new) |
| Withdrawn | ✓ | ✗ | ✗ | ✗ |

## 2.16 Customer Privacy Rights

| Right | Implementation |
|-------|----------------|
| Right to know | Privacy policy accessible in app |
| Consent management | Granular marketing and data processing consent |
| Data access request | Export own profile and application data |
| Data correction | Update profile fields |
| Data deletion request | Account deactivation workflow (regulatory retention applies) |
| Communication opt-out | Per-channel preferences |
| Third-party sharing disclosure | Listed in privacy policy; lender sharing with consent |

---

# 3. DSA PARTNER PERSONA

## 3.1 Who Is a DSA?

A **Direct Selling Agent (DSA)** is an independent business partner authorized by Kuber Finserve to originate loan and financial product leads. DSAs are not employees—they operate under a formal DSA agreement and earn commission on successful conversions.

| Attribute | Detail |
|-----------|--------|
| **Legal Status** | Independent contractor / business partner |
| **Onboarding** | KYC, agreement signing, training certification |
| **Attribution** | Assigned to branch/region for management |
| **Tier System** | Bronze → Silver → Gold → Platinum (performance-based) |
| **Interface** | DSA Mobile App (primary), Web portal (secondary) |

## 3.2 Business Goals

| # | Goal |
|---|------|
| DSA-G01 | Maximize lead submission volume |
| DSA-G02 | Achieve high lead-to-disbursement conversion |
| DSA-G03 | Earn predictable, transparent commissions |
| DSA-G04 | Build sustainable referral business |
| DSA-G05 | Grow tier status for higher commission rates |
| DSA-G06 | Minimize administrative burden |

## 3.3 Revenue Model

| Component | Description |
|-----------|-------------|
| **Commission per disbursement** | Percentage or flat fee per product/lender |
| **Tier multiplier** | Higher tiers earn 5–20% bonus on base commission |
| **Volume bonus** | Monthly/quarterly bonus for disbursement thresholds |
| **Campaign bonus** | Special incentives for targeted products |
| **Clawback policy** | Commission reversal if loan cancelled within clawback period |
| **TDS deduction** | Tax deducted at source per Indian regulations |
| **Payout cycle** | Monthly (configurable: bi-weekly for Platinum) |

## 3.4 Lead Generation Process

```
DSA identifies prospect → Qualifies basic eligibility → Registers in DSA App
    → Collects preliminary documents → Submits lead → Lead enters LMS
    → Auto-assigned to Sales Executive (or self-managed if DSA-certified)
```

| Step | DSA Action | System Action |
|------|-----------|---------------|
| 1 | Identify customer need | — |
| 2 | Check product eligibility (app tool) | Eligibility API call |
| 3 | Create lead with customer consent | Lead created, consent logged |
| 4 | Upload preliminary documents | Documents queued |
| 5 | Submit lead | Assignment triggered, notification sent |

## 3.5 Lead Submission Workflow

| Stage | Actor | Action | SLA |
|-------|-------|--------|-----|
| Lead creation | DSA | Enter customer details + product | — |
| Consent capture | DSA | Customer OTP consent on device | Required before submit |
| Document attach | DSA | Upload available documents | Optional at creation |
| Submit | DSA | Final submission | — |
| Validation | System | Duplicate check, completeness | Instant |
| Assignment | System | Route to Sales Executive / branch | <5 minutes |
| Acknowledgment | DSA | Receives lead ID and status | Instant notification |

## 3.6 Lead Tracking Workflow

| Status | DSA Visibility | Update Frequency |
|--------|---------------|------------------|
| New | ✓ | Real-time |
| Assigned | ✓ (executive name) | Real-time |
| Contacted | ✓ | On update |
| Documents Pending | ✓ (deficiency list) | Real-time |
| Under Review | ✓ | On milestone |
| Submitted to Lender | ✓ | On submission |
| Approved | ✓ | On lender response |
| Disbursed | ✓ | On disbursement |
| Rejected | ✓ (reason category) | On rejection |
| Withdrawn | ✓ | On withdrawal |

**DSA Cannot See:** Internal credit notes, lender-internal codes, other DSA leads, executive commission.

## 3.7 Commission Workflow

```
Disbursement confirmed → Commission rule engine calculates → Commission record created
    → Cooling/clawback period → Commission approved → Payout batch → DSA notified
```

| Step | Detail |
|------|--------|
| Trigger | Loan disbursement event |
| Calculation | Product × Lender × Tier × Campaign rules |
| Status: Pending | Clawback period active (typically 30–90 days) |
| Status: Approved | Eligible for next payout cycle |
| Status: Paid | Funds transferred, receipt available |
| Status: Clawed Back | Reversal with reason |
| Dispute | DSA raises dispute → Branch Manager review → Resolution |

## 3.8 Payout Process

| Element | Detail |
|---------|--------|
| Payout frequency | Monthly (default) |
| Minimum payout threshold | ₹500 (configurable) |
| Payment method | Bank transfer to registered account |
| Statement | Monthly commission statement in app |
| Tax | TDS certificate provided quarterly |
| Dispute window | 15 days from statement date |

## 3.9 Training Requirements

| Training Module | Mandatory | Recertification |
|-----------------|-----------|-----------------|
| Platform onboarding | ✓ | — |
| Product knowledge — Personal Loan | ✓ | Annual |
| Product knowledge — Business Loan | Optional | Annual |
| Consent and compliance | ✓ | Annual |
| Document collection standards | ✓ | Annual |
| Anti-fraud awareness | ✓ | Annual |
| New product modules | On launch | At launch |

**Gate:** DSA cannot submit leads for a product until certified for that product.

## 3.10 Document Requirements (DSA Onboarding)

| Document | Purpose |
|----------|---------|
| PAN card | Tax identity |
| Aadhaar | Identity verification |
| Bank account proof | Payout destination |
| Address proof | Correspondence |
| DSA Agreement (eSign) | Legal authorization |
| GST certificate (if applicable) | Tax compliance |
| Passport photo | Profile |

## 3.11 Performance Metrics

| Metric | Description | Benchmark |
|--------|-------------|-----------|
| Leads submitted (monthly) | Volume | Tier-dependent |
| Lead-to-disbursement rate | Conversion | 12%+ target |
| Document completeness rate | First-submission quality | 70%+ |
| Average days to disbursement | Pipeline velocity | <10 days |
| Commission earned | Revenue | Growth tracked |
| Dispute rate | Commission disputes | <2% |
| Training compliance | Certifications current | 100% |
| App engagement | Weekly active usage | 80%+ |

## 3.12 DSA Permissions

| Resource | Create | Read | Update | Delete | Approve |
|----------|--------|------|--------|--------|---------|
| Own profile | ✗ | ✓ | ✓ | ✗ | ✗ |
| Leads (own) | ✓ | ✓ | ✓ (pre-assignment) | ✗ | ✗ |
| Documents (own leads) | ✓ | ✓ | ✓ (re-upload) | ✗ | ✗ |
| Commission records (own) | ✗ | ✓ | ✗ | ✗ | ✗ |
| Payout statements (own) | ✗ | ✓ | ✗ | ✗ | ✗ |
| Disputes (own) | ✓ | ✓ | ✓ | ✗ | ✗ |
| Training modules | ✗ | ✓ | ✗ | ✗ | ✗ |
| Product catalog | ✗ | ✓ | ✗ | ✗ | ✗ |
| Knowledge base | ✗ | ✓ | ✗ | ✗ | ✗ |
| Other DSA data | ✗ | ✗ | ✗ | ✗ | ✗ |
| Customer PII (beyond own leads) | ✗ | ✗ | ✗ | ✗ | ✗ |

## 3.13 DSA Dashboard Access

**Dashboard Name:** DSA Partner Dashboard

| Widget | Access |
|--------|--------|
| Lead Pipeline Summary | ✓ |
| Lead List (own) | ✓ |
| Commission Summary (MTD/YTD) | ✓ |
| Pending Payouts | ✓ |
| Tier Status & Progress | ✓ |
| Performance Leaderboard (anonymized ranking) | ✓ |
| Training Status | ✓ |
| Product Catalog | ✓ |
| Campaign Offers | ✓ |
| Notifications | ✓ |
| Support Tickets (own) | ✓ |
| Document Templates | ✓ |

## 3.14 DSA Reports

| Report | Frequency | Format |
|--------|-----------|--------|
| Lead Pipeline Report | Real-time | Dashboard |
| Commission Statement | Monthly | PDF + in-app |
| Payout History | On-demand | In-app |
| Performance Summary | Weekly | In-app |
| Tax (TDS) Certificate | Quarterly | PDF |
| Annual Commission Summary | Annual | PDF |

## 3.15 DSA Notifications

| Event | SMS | Email | Push | WhatsApp | In-App |
|-------|-----|-------|------|----------|--------|
| Lead assigned/acknowledged | ✓ | ✓ | ✓ | ✓ | ✓ |
| Lead status change | ✓ | ✓ | ✓ | ✓ | ✓ |
| Document deficiency | ✓ | ✓ | ✓ | ✓ | ✓ |
| Disbursement (commission trigger) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Commission approved | ✓ | ✓ | ✓ | ✓ | ✓ |
| Payout processed | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tier upgrade/downgrade | ✓ | ✓ | ✓ | ✓ | ✓ |
| Training due | ✗ | ✓ | ✓ | ✗ | ✓ |
| Campaign launch | ✗ | ✓ | ✓ | ✓ | ✓ |
| Agreement renewal | ✓ | ✓ | ✓ | ✓ | ✓ |

## 3.16 DSA Compliance Requirements

| Requirement | Enforcement |
|-------------|-------------|
| Valid DSA agreement | System gate — no submissions without active agreement |
| KYC renewal | Annual; blocks payout if expired |
| Customer consent | OTP mandatory per lead |
| No mis-selling | Compliance audit; violation → suspension |
| Data confidentiality | Agreement clause; access logged |
| Anti-money laundering | Suspicious activity reporting to Compliance |
| Product certification | Training gate per product |

---

# 4. REFERRAL PARTNER PERSONA

## 4.1 Overview

**Referral Partners** are specialized external partners who refer customers to KuberOne without full DSA responsibilities. They have **lighter onboarding, limited platform access, and reward-based compensation** (vs. commission-based for DSAs).

## 4.2 Referral Partner Sub-Types

| Sub-Type | Profile | Typical Referral Context |
|----------|---------|-------------------------|
| **Builder** | Real estate developer / builder | Home loan for property buyers |
| **Property Dealer** | Real estate agent / broker | Home loan, property-linked credit |
| **CA (Chartered Accountant)** | Professional advisor | Business loan, personal loan for clients |
| **Broker** | Financial product broker | Multi-product referrals |
| **Channel Partner** | Business with customer footfall | Co-branded referral (e.g., car dealer) |
| **Corporate Partner** | Company HR / corporate tie-up | Employee loan programs |

## 4.3 Registration

| Step | Requirement |
|------|-------------|
| 1 | Online registration form (type, business details) |
| 2 | Mobile OTP verification |
| 3 | Business proof (varies by type) |
| 4 | Bank account for rewards |
| 5 | Referral agreement (eSign) |
| 6 | Approval by Branch Manager or Admin |

**Processing Time:** <48 hours for standard types; Corporate Partner requires Management approval.

## 4.4 Verification

| Sub-Type | Verification Documents |
|----------|----------------------|
| Builder | RERA registration, company incorporation |
| Property Dealer | RERA/agent license, ID proof |
| CA | ICAI membership certificate |
| Broker | Business registration, ID proof |
| Channel Partner | Business agreement, GST (if applicable) |
| Corporate Partner | Company authorization letter, MOU |

## 4.5 Lead Submission

| Field | Required |
|-------|----------|
| Customer name | ✓ |
| Customer mobile | ✓ |
| Product interest | ✓ |
| Referral context/notes | Optional |
| Customer consent (OTP) | ✓ |
| Documents | ✗ (collected by Sales Executive) |

**Submission Channels:** Referral Portal (web), DSA App Lite mode, API (Corporate Partner future).

**Referral Partner CANNOT:** Upload documents, track detailed pipeline, manage customer relationship, access credit/ops data.

## 4.6 Reward Model

| Model | Applicability | Payout |
|-------|--------------|--------|
| **Flat referral fee** | All types | Fixed ₹ per disbursement |
| **Tiered by product** | Builder, Property Dealer | Higher for home loans |
| **Volume bonus** | Channel Partner, Corporate | Monthly threshold bonus |
| **Revenue share** | Corporate Partner | Percentage per MOU |
| **Non-monetary** | Optional | Vouchers, co-marketing |

**Key Difference from DSA:** Referral Partners earn on **referral event (disbursement)** only—not ongoing commission on customer lifecycle.

## 4.7 Tracking Model

| Data Point | Referral Partner Sees |
|------------|----------------------|
| Referral ID | ✓ |
| Customer name | Partial (first name + masked mobile) |
| Product | ✓ |
| Status | Simplified (Referred → In Progress → Converted → Reward Paid) |
| Reward amount | ✓ (on conversion) |
| Reward status | Pending / Approved / Paid |
| Conversion date | ✓ |

**Masked Status Mapping:**

| Internal Status | Referral Partner View |
|-----------------|----------------------|
| Lead created | Referred |
| In processing | In Progress |
| Disbursed | Converted |
| Rejected/Withdrawn | Closed (no reward) |

## 4.8 Referral Partner Permissions

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Own profile | ✗ | ✓ | ✓ | ✗ |
| Referrals (own) | ✓ | ✓ | ✗ | ✗ |
| Rewards (own) | ✗ | ✓ | ✗ | ✗ |
| Lead details (beyond own) | ✗ | ✗ | ✗ | ✗ |
| Documents | ✗ | ✗ | ✗ | ✗ |
| Commission engine | ✗ | ✗ | ✗ | ✗ |

## 4.9 Referral Partner Reports

| Report | Access |
|--------|--------|
| Referral Summary | ✓ |
| Conversion Report | ✓ |
| Reward Statement | ✓ |
| Payout History | ✓ |

## 4.10 Referral Partner Dashboard

| Widget | Access |
|--------|--------|
| Referral Count (MTD/YTD) | ✓ |
| Conversion Rate | ✓ |
| Rewards Earned | ✓ |
| Pending Rewards | ✓ |
| Referral Link / QR Code | ✓ |
| Simplified Pipeline | ✓ |
| Program Terms | ✓ |

---

# 5. SALES EXECUTIVE PERSONA

## 5.1 Role Definition

The **Sales Executive** is an internal Kuber Finserve employee responsible for **lead conversion**—contacting prospects, qualifying needs, collecting documents, and driving applications to submission.

| Attribute | Detail |
|-----------|--------|
| **Employment** | Full-time / contract employee |
| **Assignment** | Branch-assigned; may cover territory |
| **Reports to** | Branch Manager |
| **Tools** | CRM Web + Mobile, AI Sales Copilot |
| **Quota** | Monthly lead conversion and disbursement targets |

## 5.2 Lead Handling Workflow

```
Lead assigned → Review lead details → AI Copilot priority suggestion → First contact (SLA: 15 min)
    → Qualify (BANT: Budget, Authority, Need, Timeline) → Schedule follow-up → Convert or disqualify
```

| Step | Action | SLA |
|------|--------|-----|
| Lead received | Review profile, source, documents | 15 min to first contact |
| Qualification | Assess eligibility, need, intent | Same day |
| Disqualification | Record reason, release lead | If unqualified |
| Active pursuit | Follow-up per cadence | Per lead stage |
| Handoff to Credit/Ops | Submit complete application | Within 3 days of qualification |

## 5.3 Call Workflow

| Step | Detail |
|------|--------|
| Pre-call | AI Copilot provides script, customer history, talking points |
| Call initiation | Click-to-call from CRM (logged automatically) |
| During call | Capture notes, disposition, next action |
| Post-call | System schedules follow-up; updates lead status |
| Call recording | With customer consent; stored for QA |
| Dispositions | Connected, No answer, Callback, Not interested, Wrong number, Qualified |

## 5.4 Follow-Up Workflow

| Lead Stage | Follow-Up Cadence | Channel Priority |
|------------|-------------------|------------------|
| New | Day 0, 1, 3 | Call → WhatsApp → SMS |
| Contacted | Every 2 days | Call → WhatsApp |
| Documents pending | Daily until complete | WhatsApp → Call |
| Qualified | Every 3 days | Call |
| Submitted | On status change only | WhatsApp notification |
| Stalled (7+ days) | Escalation to Branch Manager | — |

**Automation:** System auto-schedules tasks; executive marks complete or reschedules.

## 5.5 Meeting Workflow

| Step | Detail |
|------|--------|
| Schedule | In-app calendar with customer confirmation |
| Preparation | AI Copilot briefing, document checklist |
| Check-in | GPS check-in (field visits) |
| Meeting notes | Captured in CRM |
| Document collection | On-site upload via mobile |
| Outcome | Status update, next action scheduled |

## 5.6 Document Collection Workflow

```
Review checklist → Request missing docs (WhatsApp/app link) → Receive uploads
    → Validate completeness → Re-request if deficient → Mark complete → Handoff to Credit
```

| Responsibility | Detail |
|----------------|--------|
| Guide customer | Explain required documents |
| Quality check | Pre-verify before ops submission |
| Deficiency follow-up | Within 24 hours of deficiency alert |
| DSA-assisted collection | Coordinate with DSA if partner-sourced |

## 5.7 Lead Conversion Workflow

| Milestone | Criteria | System State |
|-----------|----------|--------------|
| Contacted | Successful customer contact | Lead status updated |
| Qualified | Eligibility confirmed, intent verified | Application created |
| Documents complete | All required docs uploaded | Ready for credit |
| Submitted | Handed to Credit/Ops | Application submitted |
| Converted | Disbursement confirmed | Lead closed-won |

## 5.8 Daily Activities

| Time Block | Activity |
|------------|----------|
| Start of day | Review dashboard, AI priority queue, planned follow-ups |
| Morning | High-priority calls and follow-ups |
| Midday | Document collection, field visits |
| Afternoon | New lead contact (SLA), pipeline updates |
| End of day | Update CRM notes, schedule next-day tasks, review targets |

## 5.9 Targets

| Target Type | Example (Configurable) |
|-------------|------------------------|
| Monthly leads handled | 80–120 |
| Monthly disbursements | 8–15 |
| Conversion rate | 12–18% |
| First contact SLA | 95%+ within 15 min |
| Document completeness | 70%+ first pass |
| Call attempts per lead | 5+ before disqualify |
| Customer satisfaction | 4.5/5 |

## 5.10 Sales Executive KPIs

| KPI | Target | Frequency |
|-----|--------|-----------|
| Leads assigned | Per quota | Daily |
| First contact SLA compliance | 95%+ | Daily |
| Conversion rate | 12%+ | Monthly |
| Disbursement count | Per target | Monthly |
| Disbursement value | Per target | Monthly |
| Average time to submission | <5 days | Monthly |
| Document completeness rate | 70%+ | Monthly |
| Activity score (calls, meetings) | Per benchmark | Weekly |
| AI Copilot utilization | 80%+ | Weekly |
| Customer CSAT | 4.5/5 | Monthly |

## 5.11 Sales Executive Permissions

| Resource | Create | Read | Update | Delete | Assign | Approve |
|----------|--------|------|--------|--------|--------|---------|
| Leads (assigned) | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Applications (assigned) | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Documents (assigned) | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Customer profile (assigned) | ✗ | ✓ | ✓ (limited) | ✗ | ✗ | ✗ |
| Call logs | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Notes | ✓ | ✓ | ✓ | ✓ (own) | ✗ | ✗ |
| Tasks (own) | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| DSA leads (branch) | ✗ | ✓ | ✓ (assigned) | ✗ | ✗ | ✗ |
| Commission data | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Credit assessments | ✗ | ✓ (summary) | ✗ | ✗ | ✗ | ✗ |
| Reports (own performance) | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Lead reassignment | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

## 5.12 Sales Executive Dashboard

| Widget | Access |
|--------|--------|
| Today's Priority Queue (AI-ranked) | ✓ |
| Lead Pipeline (assigned) | ✓ |
| SLA Alerts | ✓ |
| Follow-up Calendar | ✓ |
| Target Progress (MTD) | ✓ |
| Activity Summary (calls, meetings) | ✓ |
| Document Pending List | ✓ |
| AI Copilot Panel | ✓ |
| Team Leaderboard (branch) | ✓ |
| Notifications | ✓ |

## 5.13 Sales Executive Reports

| Report | Access |
|--------|--------|
| Personal Pipeline Report | ✓ |
| Activity Report | ✓ |
| Conversion Report | ✓ |
| Target vs. Actual | ✓ |
| Lead Source Analysis (assigned) | ✓ |
| Disbursement Report | ✓ |

## 5.14 Sales Executive Notifications

| Event | SMS | Email | Push | WhatsApp | In-App |
|-------|-----|-------|------|----------|--------|
| New lead assigned | ✓ | ✓ | ✓ | ✗ | ✓ |
| SLA breach warning | ✓ | ✓ | ✓ | ✗ | ✓ |
| Document uploaded by customer | ✗ | ✓ | ✓ | ✗ | ✓ |
| Application status change | ✗ | ✓ | ✓ | ✗ | ✓ |
| Disbursement confirmed | ✓ | ✓ | ✓ | ✗ | ✓ |
| Target milestone (50%, 80%, 100%) | ✗ | ✓ | ✓ | ✗ | ✓ |
| Escalation from manager | ✗ | ✓ | ✓ | ✗ | ✓ |
| AI Copilot insight | ✗ | ✗ | ✓ | ✗ | ✓ |

## 5.15 Escalation Matrix

| Scenario | Escalate To | SLA |
|----------|-------------|-----|
| Lead not contacted within 30 min | Branch Manager | Auto-escalation |
| Customer complaint | Support Team + Branch Manager | 2 hours |
| Document verification dispute | Operations Executive | 4 hours |
| DSA lead conflict | Branch Manager | 4 hours |
| Credit rejection appeal | Credit Executive + Branch Manager | 24 hours |
| System/access issue | Admin via Support | 4 hours |
| Fraud suspicion | Compliance Team | Immediate |

---

# 6. RELATIONSHIP MANAGER PERSONA

## 6.1 Role Definition

The **Relationship Manager (RM)** owns **post-disbursement customer relationships**—retention, satisfaction, cross-selling, and repeat business. RMs transform one-time borrowers into long-term Kuber Finserve customers.

| Attribute | Detail |
|-----------|--------|
| **Employment** | Full-time employee |
| **Assignment** | Portfolio of disbursed customers (branch/region) |
| **Reports to** | Branch Manager |
| **Handoff from** | Sales Executive (at disbursement) |
| **Tools** | CRM, AI Advisor insights, communication tools |

## 6.2 Customer Relationship Ownership

| Responsibility | Detail |
|----------------|--------|
| Portfolio assignment | Auto-assigned at disbursement (round-robin or rules-based) |
| Relationship depth | Primary point of contact post-disbursement |
| Interaction cadence | Minimum quarterly touchpoint; monthly for high-value |
| Health scoring | Monitor engagement, satisfaction, churn risk |
| Escalation ownership | First responder for portfolio customer issues |

## 6.3 Cross-Selling Responsibilities

| Activity | Detail |
|----------|--------|
| Propensity review | AI-generated cross-sell recommendations weekly |
| Outreach | Proactive contact for suitable products |
| Needs assessment | Periodic financial wellness check-in |
| Product presentation | Insurance, credit card, MF, FD (as modules launch) |
| Handoff to Sales | New application initiated → Sales Executive for processing |
| Conversion tracking | RM attributed for cross-sell conversions |

## 6.4 Portfolio Management

| Element | Detail |
|---------|--------|
| Portfolio size | 200–500 customers (configurable) |
| Segmentation | High-value, standard, dormant, at-risk |
| Portfolio dashboard | Health score, engagement, revenue, opportunities |
| Rebalancing | Periodic portfolio redistribution by Branch Manager |
| Dormant reactivation | Campaign-driven outreach for inactive customers |

## 6.5 Renewal Opportunities

| Opportunity Type | RM Action |
|------------------|-----------|
| Top-up loan | Proactive offer at eligibility |
| Loan renewal (business) | 90-day advance outreach |
| Insurance renewal | Reminder and assistance |
| Credit card upgrade | AI-triggered outreach |
| FD maturity | Reinvestment guidance |

## 6.6 Retention Responsibilities

| Activity | Detail |
|----------|--------|
| Satisfaction monitoring | Post-disbursement NPS at 30/90/180 days |
| Churn prevention | AI churn alerts → proactive outreach |
| Complaint resolution (first line) | Resolve or escalate to Support |
| Loyalty programs | Inform customers of benefits |
| Referral encouragement | Promote referral program to satisfied customers |

## 6.7 Customer Service Responsibilities

| Scope | Detail |
|-------|--------|
| Account inquiries | Balance, EMI, servicing questions |
| Document requests | Sanction letter, SOA re-download |
| Process guidance | Repeat application assistance |
| Escalation | Unresolved issues → Support Team |
| Out of scope | Credit decisions, operational processing |

## 6.8 Relationship Manager KPIs

| KPI | Target | Frequency |
|-----|--------|-----------|
| Portfolio size (active) | Per assignment | Monthly |
| Customer touchpoint compliance | 95%+ quarterly | Quarterly |
| Cross-sell conversion rate | 8%+ | Monthly |
| Cross-sell revenue | Per target | Monthly |
| Customer retention rate | 85%+ | Quarterly |
| NPS (portfolio) | 55+ | Quarterly |
| Churn rate (portfolio) | <10% annual | Quarterly |
| Referral generation (portfolio) | 5%+ customers refer | Quarterly |
| Repeat loan rate | 15%+ | Annual |
| Response time (customer query) | <4 hours | Daily |

## 6.9 Relationship Manager Reports

| Report | Access |
|--------|--------|
| Portfolio Health Report | ✓ |
| Cross-sell Pipeline | ✓ |
| Customer Engagement Report | ✓ |
| Retention/Churn Report | ✓ |
| NPS Report (portfolio) | ✓ |
| Revenue Attribution Report | ✓ |
| Renewal Calendar | ✓ |

## 6.10 Relationship Manager Permissions

| Resource | Create | Read | Update | Delete | Assign | Approve |
|----------|--------|------|--------|--------|--------|---------|
| Portfolio customers | ✗ | ✓ | ✓ (notes, tags) | ✗ | ✗ | ✗ |
| Cross-sell opportunities | ✓ | ✓ | ✓ | ✓ (own) | ✗ | ✗ |
| Communication logs | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Applications (referral to sales) | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Documents (customer) | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Credit/ops data | ✗ | ✓ (summary) | ✗ | ✗ | ✗ | ✗ |
| Commission data | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Non-portfolio customers | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

## 6.11 Relationship Manager Dashboard

| Widget | Access |
|--------|--------|
| Portfolio Summary | ✓ |
| Health Score Distribution | ✓ |
| Cross-sell Opportunities (AI) | ✓ |
| Renewal Calendar | ✓ |
| Churn Risk Alerts | ✓ |
| Engagement Tracker | ✓ |
| NPS Summary | ✓ |
| Target Progress | ✓ |
| Customer Communication History | ✓ |

---

# 7. CREDIT EXECUTIVE PERSONA

## 7.1 Role Definition

The **Credit Executive** performs **credit assessment, eligibility verification, document authentication, and risk evaluation** before applications proceed to lender submission.

| Attribute | Detail |
|-----------|--------|
| **Employment** | Full-time employee |
| **Assignment** | Central pool and/or branch-assigned |
| **Reports to** | Operations Head (functional); Branch Manager (dotted line) |
| **Authority** | Recommend approve/reject/conditional; cannot final-approve lender decisions |

## 7.2 Eligibility Verification

| Check | Method |
|-------|--------|
| Age criteria | Rule engine |
| Income requirements | Document + rule validation |
| Employment type | Document verification |
| Existing obligations | FOIR calculation |
| Product-specific rules | Lender product matrix |
| Geographic eligibility | Pin code / branch mapping |
| Credit bureau (future) | API integration |

## 7.3 Credit Assessment

| Assessment Area | Detail |
|-----------------|--------|
| Income assessment | Salary slips, ITR, bank statement analysis |
| Stability assessment | Employment tenure, business vintage |
| Repayment capacity | FOIR, DTI calculations |
| Banking conduct | Statement analysis (bounce, balance) |
| Profile consistency | Cross-document validation |
| Assessment output | Score, recommendation, conditions |

## 7.4 Risk Assessment

| Risk Factor | Evaluation |
|-------------|------------|
| Identity risk | Document authenticity |
| Income misrepresentation | Cross-verification |
| Over-leveraging | Obligation vs. income |
| Geographic risk | Branch/lender policy |
| Fraud indicators | Compliance flags |
| Risk rating | Low / Medium / High / Critical |

## 7.5 Document Verification

| Document | Verification Method |
|----------|-------------------|
| PAN | Format + cross-match with name |
| Aadhaar | Masked storage; authenticity check |
| Salary slip | OCR + manual review |
| Bank statement | OCR analysis + manual |
| ITR | OCR + manual |
| Property docs | Legal checklist (home loan) |
| Business docs | Registration, GST validation |

**AI Assistance:** OCR pre-validation; executive confirms or overrides.

## 7.6 Approval Recommendations

| Recommendation | Meaning | Next Step |
|----------------|---------|-----------|
| **Approve** | Meets criteria; ready for lender submission | → Operations Executive |
| **Conditional Approve** | Approve with conditions (co-applicant, additional docs) | → Sales Executive for fulfillment |
| **Refer** | Borderline; needs senior review | → Senior Credit / Branch Manager |
| **Reject** | Does not meet criteria | → Sales Executive with reason |
| **Fraud Hold** | Suspicious activity | → Compliance Team |

## 7.7 Escalation Process

| Scenario | Escalate To | SLA |
|----------|-------------|-----|
| High-value application (>₹50L) | Senior Credit / Branch Manager | 24 hours |
| Policy exception | Branch Manager + Operations Head | 24 hours |
| Fraud suspicion | Compliance Team | Immediate |
| Document authenticity doubt | Compliance Team | 4 hours |
| Lender-specific query | Operations Executive | 4 hours |

## 7.8 Credit Executive Reports

| Report | Access |
|--------|--------|
| Assessment Queue | ✓ |
| Daily Processing Report | ✓ |
| Approval/Rejection Ratio | ✓ |
| Turnaround Time Report | ✓ |
| Risk Distribution Report | ✓ |
| Document Deficiency Report | ✓ |
| Exception Report | ✓ |

## 7.9 Credit Executive KPIs

| KPI | Target | Frequency |
|-----|--------|-----------|
| Applications processed | Per quota | Daily |
| Turnaround time (TAT) | <24 hours | Daily |
| First-pass approval rate | 70%+ | Weekly |
| Rejection accuracy (no rework) | 95%+ | Monthly |
| Document verification accuracy | 98%+ | Monthly |
| Fraud detection rate | Track | Monthly |
| Exception rate | <10% | Monthly |
| SLA compliance | 95%+ | Daily |

## 7.10 Credit Executive Permissions

| Resource | Create | Read | Update | Delete | Assign | Approve |
|----------|--------|------|--------|--------|--------|---------|
| Credit assessments | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ (recommend) |
| Applications (in queue) | ✗ | ✓ | ✓ (status) | ✗ | ✗ | ✗ |
| Documents | ✗ | ✓ | ✓ (verification status) | ✗ | ✗ | ✓ (verify) |
| Risk ratings | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Customer PII | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Lender submission | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Compliance cases | ✓ (refer) | ✓ | ✗ | ✗ | ✗ | ✗ |
| Credit policies | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |

## 7.11 Credit Executive Dashboard

| Widget | Access |
|--------|--------|
| Assessment Queue (priority-sorted) | ✓ |
| SLA Alerts | ✓ |
| Daily Processing Summary | ✓ |
| Approval/Rejection Trends | ✓ |
| Document Verification Queue | ✓ |
| Risk Alert Panel | ✓ |
| AI Document Analysis Results | ✓ |

---

# 8. OPERATIONS EXECUTIVE PERSONA

## 8.1 Role Definition

The **Operations Executive** manages **application processing post-credit-approval**—lender coordination, submission, status tracking, sanction, and disbursement.

| Attribute | Detail |
|-----------|--------|
| **Employment** | Full-time employee |
| **Assignment** | Central operations pool; branch support |
| **Reports to** | Operations Head (functional); Branch Manager (dotted line) |
| **Authority** | Submit to lenders; coordinate disbursement; cannot override credit decisions |

## 8.2 Application Processing

| Step | Action |
|------|--------|
| Receive approved application | From Credit Executive |
| Pre-submission check | Completeness, lender selection |
| Lender routing | Rule-based or manual selection |
| Application packaging | Format per lender requirements |
| Submit to lender | Portal/API/manual |
| Acknowledge submission | Update status, notify stakeholders |

## 8.3 Bank Login Coordination

| Activity | Detail |
|----------|--------|
| Lender portal access | Credential management per lender |
| Application login | Create/login application on lender system |
| Data entry | Transfer KuberOne data to lender portal |
| Query response | Respond to lender queries within SLA |
| Document upload (lender) | Upload to lender portal |

## 8.4 Sanction Coordination

| Step | Detail |
|------|--------|
| Sanction notification | Receive from lender |
| Sanction review | Verify terms match application |
| Customer communication | Trigger sanction letter to customer |
| Acceptance tracking | Customer acceptance (if required) |
| Exception handling | Term mismatches → Credit/Sales escalation |

## 8.5 Disbursement Tracking

| Step | Detail |
|------|--------|
| Disbursement trigger | Lender confirms disbursement |
| Record disbursement | Amount, date, UTR in system |
| Commission trigger | Notify commission engine |
| Stakeholder notification | Customer, DSA, Sales, RM |
| Handoff to RM | Portfolio assignment triggered |
| Closure | Application marked disbursed |

## 8.6 Document Management

| Responsibility | Detail |
|----------------|--------|
| Document completeness gate | Final check before lender submission |
| Document packaging | Compile per lender format |
| Secure transfer | Encrypted transfer to lender |
| Version control | Track document versions |
| Archival | Post-disbursement archival per retention policy |

## 8.7 Workflow Management

| Workflow | Ops Role |
|----------|----------|
| Application queue management | Prioritize by SLA, value, lender |
| Exception routing | Route exceptions to appropriate role |
| Status synchronization | Update KuberOne from lender status |
| Rejection handling | Process rejection, notify, close or re-route |
| Rework management | Return to Sales/Credit for deficiencies |

## 8.8 Operations Executive Reports

| Report | Access |
|--------|--------|
| Processing Queue | ✓ |
| Lender-wise Pipeline | ✓ |
| TAT Report (submission to disbursement) | ✓ |
| Disbursement Report | ✓ |
| Lender Performance Report | ✓ |
| Exception/Rework Report | ✓ |
| Daily Operations Summary | ✓ |

## 8.9 Operations Executive KPIs

| KPI | Target | Frequency |
|-----|--------|-----------|
| Applications processed | Per quota | Daily |
| Submission TAT (from credit approval) | <4 hours | Daily |
| Disbursement TAT (from submission) | Per lender SLA | Weekly |
| Disbursement count | Per target | Monthly |
| Disbursement value | Per target | Monthly |
| Rework rate | <5% | Weekly |
| Lender query response time | <4 hours | Daily |
| SLA compliance | 95%+ | Daily |
| Error rate (submission) | <2% | Monthly |

## 8.10 Operations Executive Permissions

| Resource | Create | Read | Update | Delete | Assign | Approve |
|----------|--------|------|--------|--------|--------|---------|
| Applications (processing queue) | ✗ | ✓ | ✓ (status) | ✗ | ✗ | ✗ |
| Lender submissions | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Disbursement records | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Documents | ✗ | ✓ | ✓ (packaging status) | ✗ | ✗ | ✗ |
| Lender configuration | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Commission triggers | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Customer PII | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Credit assessments | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |

## 8.11 Operations Executive Dashboard

| Widget | Access |
|--------|--------|
| Processing Queue | ✓ |
| Lender Pipeline View | ✓ |
| SLA Alerts | ✓ |
| Disbursement Tracker (today/week) | ✓ |
| Exception Queue | ✓ |
| Lender Response Times | ✓ |
| Rework Items | ✓ |

---

# 9. BRANCH MANAGER PERSONA

## 9.1 Role Definition

The **Branch Manager** owns **branch-level business performance**—team management, lead distribution, partner oversight, revenue accountability, and escalation resolution.

| Attribute | Detail |
|-----------|--------|
| **Employment** | Full-time employee |
| **Scope** | Single branch (all executives, DSAs in territory) |
| **Reports to** | Regional Manager |
| **Authority** | Lead reassignment, target setting (within policy), partner activation, exception approval (within limits) |

## 9.2 Branch Ownership

| Dimension | Accountability |
|-----------|---------------|
| Revenue | Branch disbursement volume and commission |
| Conversion | Branch funnel performance |
| Team | Executive productivity and development |
| Partners | DSA and referral partner performance |
| Customer satisfaction | Branch NPS and complaint rates |
| Compliance | Branch adherence to policies |
| Operations | SLA compliance across functions |

## 9.3 Executive Management

| Responsibility | Detail |
|----------------|--------|
| Team composition | Sales, RM, Credit (dotted), Ops (dotted) |
| Target allocation | Distribute monthly targets to executives |
| Performance review | Weekly 1:1s, monthly formal review |
| Coaching | Use analytics for coaching conversations |
| Leave/backup | Reassign leads during absence |
| Hiring input | Recommend hiring needs to Regional Manager |

## 9.4 Lead Distribution

| Rule | Detail |
|------|--------|
| Auto-assignment | Default: round-robin or skill-based |
| Manual override | Branch Manager can reassign |
| DSA leads | Priority routing to available executive |
| Campaign leads | Route per campaign rules |
| Escalation leads | Assign to senior executive |
| Reassignment SLA | Within 1 hour of request |

## 9.5 Performance Monitoring

| Monitor | Cadence |
|---------|---------|
| Lead funnel (branch) | Real-time dashboard |
| Executive performance | Daily |
| SLA compliance | Daily |
| DSA partner performance | Weekly |
| Conversion trends | Weekly |
| Revenue vs. target | Daily |
| Customer complaints | Real-time alerts |

## 9.6 Revenue Tracking

| Metric | Visibility |
|--------|------------|
| MTD disbursements (count + value) | ✓ |
| MTD commission revenue | ✓ |
| Target achievement % | ✓ |
| Product mix | ✓ |
| Channel mix (DSA, direct, referral) | ✓ |
| Revenue forecast (AI-assisted) | ✓ |

## 9.7 Escalation Handling

| Escalation Type | Branch Manager Action |
|-----------------|----------------------|
| SLA breach (lead contact) | Reassign or coach executive |
| Customer complaint | Review, resolve, or escalate to Support |
| DSA dispute | Mediate commission/process disputes |
| Credit exception | Approve within authority or escalate |
| Partner violation | Warning, suspension recommendation |
| System issue | Escalate to Admin via Support |

## 9.8 Branch Analytics

| Analytics | Access |
|-----------|--------|
| Funnel conversion by stage | ✓ |
| Executive comparison | ✓ |
| Lead source effectiveness | ✓ |
| Product performance | ✓ |
| Partner contribution | ✓ |
| Geographic heat map (territory) | ✓ |
| Trend analysis (WoW, MoM) | ✓ |
| AI insights (anomalies, opportunities) | ✓ |

## 9.9 Branch Manager KPIs

| KPI | Target | Frequency |
|-----|--------|-----------|
| Branch disbursement volume | Per target | Monthly |
| Branch revenue | Per target | Monthly |
| Branch conversion rate | 15%+ | Monthly |
| Team SLA compliance | 90%+ | Weekly |
| Customer NPS (branch) | 50+ | Quarterly |
| DSA partner activation rate | 80%+ active | Monthly |
| Executive productivity (avg) | Per benchmark | Monthly |
| Complaint resolution rate | 95%+ | Monthly |
| Partner dispute rate | <3% | Monthly |
| Target achievement | 100% | Monthly |

## 9.10 Branch Manager Permissions

| Resource | Create | Read | Update | Delete | Assign | Approve | Export |
|----------|--------|------|--------|--------|--------|---------|--------|
| Branch leads | ✗ | ✓ (all branch) | ✓ | ✗ | ✓ | ✗ | ✓ |
| Branch applications | ✗ | ✓ (all branch) | ✓ (limited) | ✗ | ✓ | ✓ (exceptions) | ✓ |
| Branch customers | ✗ | ✓ (all branch) | ✗ | ✗ | ✓ (RM) | ✗ | ✓ |
| Branch executives | ✗ | ✓ | ✓ (targets) | ✗ | ✓ (leads) | ✗ | ✓ |
| DSA partners (branch) | ✓ (recommend) | ✓ | ✓ (status) | ✗ | ✗ | ✓ (activation) | ✓ |
| Referral partners (branch) | ✓ (recommend) | ✓ | ✓ | ✗ | ✗ | ✓ (activation) | ✓ |
| Commission disputes | ✗ | ✓ | ✓ (resolve) | ✗ | ✗ | ✓ (within limit) | ✓ |
| Branch reports | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Credit exceptions | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ (within limit) | ✗ |
| Campaigns (branch) | ✓ (request) | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |

## 9.11 Branch Manager Reports

| Report | Access |
|--------|--------|
| Branch Performance Dashboard | ✓ |
| Executive Performance Report | ✓ |
| Lead Funnel Report | ✓ |
| Revenue Report | ✓ |
| DSA Partner Report | ✓ |
| SLA Compliance Report | ✓ |
| Customer Satisfaction Report | ✓ |
| Exception Report | ✓ |
| Forecast Report | ✓ |

## 9.12 Branch Manager Dashboard

| Widget | Access |
|--------|--------|
| Branch Target Progress | ✓ |
| Live Lead Funnel | ✓ |
| Executive Performance Cards | ✓ |
| SLA Alert Panel | ✓ |
| DSA Partner Summary | ✓ |
| Revenue Tracker | ✓ |
| Complaint Queue | ✓ |
| AI Insights | ✓ |
| Escalation Queue | ✓ |

---

# 10. REGIONAL MANAGER PERSONA

## 10.1 Role Definition

The **Regional Manager** oversees **multiple branches** within a geographic region—accountable for regional revenue, branch performance, and strategic execution.

| Attribute | Detail |
|-----------|--------|
| **Employment** | Full-time employee |
| **Scope** | 3–15 branches (configurable) |
| **Reports to** | Sales Head / Business Head |
| **Direct Reports** | Branch Managers |

## 10.2 Multi-Branch Management

| Responsibility | Detail |
|----------------|--------|
| Branch oversight | Monitor all branches in region |
| Branch Manager coaching | Monthly reviews, quarterly plans |
| Resource allocation | Distribute targets across branches |
| Best practice sharing | Cross-branch learning |
| Underperforming branch intervention | Action plans for struggling branches |
| New branch launch | Setup playbook execution |

## 10.3 Regional Reporting

| Report | Frequency |
|--------|-----------|
| Regional performance summary | Daily (dashboard), Weekly (formal) |
| Branch comparison report | Weekly |
| Regional funnel analysis | Weekly |
| Partner network report | Monthly |
| Regional forecast | Monthly |
| Quarterly business review pack | Quarterly |

## 10.4 Revenue Accountability

| Dimension | Accountability |
|-----------|---------------|
| Regional disbursement target | Primary KPI |
| Regional commission revenue | Primary KPI |
| Regional cost efficiency | Secondary KPI |
| Product mix optimization | Strategic |
| Channel mix (DSA vs. direct) | Strategic |
| New partner acquisition | Growth KPI |

## 10.5 Branch Performance Analysis

| Analysis | Purpose |
|----------|---------|
| Branch ranking (within region) | Identify leaders and laggards |
| Conversion comparison | Diagnose funnel issues |
| Executive productivity comparison | Resource optimization |
| SLA comparison | Operational discipline |
| Partner density analysis | Territory opportunity |
| Market penetration analysis | Expansion planning |

## 10.6 Team Management

| Activity | Detail |
|----------|--------|
| Branch Manager performance reviews | Monthly |
| Regional team meetings | Weekly |
| Target setting (regional → branch) | Monthly/quarterly |
| Hiring approvals | Branch Manager recommendations |
| Training coordination | Regional training calendar |
| Succession planning | Identify high-potential Branch Managers |

## 10.7 Regional Manager KPIs

| KPI | Target | Frequency |
|-----|--------|-----------|
| Regional disbursement volume | Per target | Monthly |
| Regional revenue | Per target | Monthly |
| Regional conversion rate | 15%+ | Monthly |
| Branch target achievement (avg) | 90%+ branches at 100% | Monthly |
| Partner growth (regional) | +20% YoY | Quarterly |
| Customer NPS (regional) | 50+ | Quarterly |
| Regional SLA compliance | 90%+ | Weekly |
| Branch Manager retention | 90%+ | Annual |
| Cost per disbursement | Decreasing trend | Quarterly |

## 10.8 Regional Manager Permissions

| Resource | Create | Read | Update | Delete | Assign | Approve | Export |
|----------|--------|------|--------|--------|--------|---------|--------|
| Regional branches (all) | ✗ | ✓ | ✓ (targets) | ✗ | ✓ (cross-branch) | ✓ (exceptions) | ✓ |
| Regional leads | ✗ | ✓ | ✓ (limited) | ✗ | ✓ | ✗ | ✓ |
| Regional applications | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ (high-value) | ✓ |
| Branch Managers | ✗ | ✓ | ✓ (targets, notes) | ✗ | ✗ | ✗ | ✓ |
| DSA partners (regional) | ✓ (recommend) | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Regional campaigns | ✓ (propose) | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Commission overrides | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ (within policy) | ✓ |
| Regional reports | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |

## 10.9 Regional Manager Dashboard

| Widget | Access |
|--------|--------|
| Regional Target Progress | ✓ |
| Branch Comparison Grid | ✓ |
| Regional Funnel | ✓ |
| Revenue by Branch | ✓ |
| Partner Network Map | ✓ |
| SLA Heatmap (branches) | ✓ |
| Top/Bottom Performers | ✓ |
| Regional Forecast | ✓ |
| Escalation Summary | ✓ |

---

# 11. SUPPORT TEAM PERSONA

## 11.1 Role Definition

The **Support Team** provides **multi-channel customer and user support**—ticket management, issue resolution, complaint handling, and SLA-driven service.

| Sub-Role | Focus |
|----------|-------|
| **Support Agent (L1)** | Customer and DSA queries, basic troubleshooting |
| **Support Lead (L2)** | Escalated issues, internal user support, complex cases |
| **Support Manager** | Team performance, SLA governance, process improvement |

**Reports to:** Operations Head

## 11.2 Ticket Management

| Ticket Type | Source | Priority |
|-------------|--------|----------|
| Customer inquiry | App, WhatsApp, phone, email | Medium |
| Customer complaint | App, phone, email | High |
| DSA support | DSA App | Medium |
| Internal user support | CRM help | Medium |
| Technical issue | Any | High |
| Data request | Customer (privacy) | Medium |
| Escalation | From any role | Per escalation level |

**Ticket Lifecycle:** Created → Assigned → In Progress → Pending (customer) → Resolved → Closed

## 11.3 Customer Issue Resolution

| Issue Category | Resolution Approach |
|----------------|-------------------|
| Application status | Lookup and communicate; no internal data exposure |
| Document upload help | Guide through process |
| Account access | OTP reset, account recovery |
| Complaint (process) | Investigate, resolve, compensate if applicable |
| Complaint (staff behavior) | Investigate, escalate to Branch Manager |
| Data request | Process per privacy policy |
| Technical bug | Log, escalate to Admin/tech |

## 11.4 Complaint Handling

| Severity | Definition | SLA | Escalation |
|----------|------------|-----|------------|
| Critical | Legal threat, media, regulatory | 2 hours | Management |
| High | Service failure, financial impact | 4 hours | Branch Manager |
| Medium | Process dissatisfaction | 24 hours | Support Lead |
| Low | General feedback | 48 hours | Support Agent |

**Complaint Register:** All complaints logged with unique ID, tracked to resolution, reported to Compliance monthly.

## 11.5 SLA Management

| SLA Metric | Target |
|------------|--------|
| First response time | <1 hour (business hours) |
| Resolution time (L1) | <24 hours |
| Resolution time (L2) | <48 hours |
| Customer satisfaction (post-resolution) | 4.5/5 |
| Ticket backlog | <50 open at any time |
| Escalation rate | <15% |

## 11.6 Support Team KPIs

| KPI | Target | Frequency |
|-----|--------|-----------|
| Tickets resolved | Per quota | Daily |
| First response SLA | 95%+ | Daily |
| Resolution SLA | 90%+ | Daily |
| CSAT (post-ticket) | 4.5/5 | Weekly |
| Escalation rate | <15% | Weekly |
| Reopen rate | <5% | Monthly |
| Average handling time | Per benchmark | Weekly |
| Complaint resolution rate | 95%+ | Monthly |

## 11.7 Support Team Permissions

| Resource | Create | Read | Update | Delete | Assign | Approve |
|----------|--------|------|--------|--------|--------|---------|
| Support tickets | ✓ | ✓ (all) | ✓ | ✗ | ✓ | ✓ (close) |
| Customer profile | ✗ | ✓ (limited—no PII export) | ✓ (contact prefs) | ✗ | ✗ | ✗ |
| Application status | ✗ | ✓ (status only) | ✗ | ✗ | ✗ | ✗ |
| Internal notes | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Escalations | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| Knowledge base | ✗ | ✓ | ✓ (suggest edits) | ✗ | ✗ | ✗ |
| User accounts | ✗ | ✓ (status) | ✓ (reset triggers) | ✗ | ✗ | ✗ |
| Financial data | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Commission data | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

## 11.8 Support Team Reports

| Report | Access |
|--------|--------|
| Ticket Queue Report | ✓ |
| SLA Compliance Report | ✓ |
| CSAT Report | ✓ |
| Complaint Register | ✓ |
| Escalation Report | ✓ |
| Agent Performance Report | ✓ (Manager) |
| Category Analysis Report | ✓ |

---

# 12. COMPLIANCE TEAM PERSONA

## 12.1 Role Definition

The **Compliance Team** ensures **regulatory adherence, fraud prevention, audit readiness, and policy enforcement** across all KuberOne operations.

| Sub-Role | Focus |
|----------|-------|
| **Compliance Analyst** | Day-to-day monitoring, document audits |
| **Compliance Manager** | Policy management, regulatory reporting |
| **Fraud Analyst** | Fraud detection, investigation |

**Reports to:** Management (CEO / designated Compliance Officer)

## 12.2 Audit Responsibilities

| Audit Type | Frequency | Scope |
|------------|-----------|-------|
| DSA partner audit | Quarterly | KYC, agreements, conduct |
| Application audit | Monthly (sample) | Consent, documentation, process |
| Document audit | Monthly (sample) | Authenticity, completeness |
| Commission audit | Quarterly | Calculation accuracy, payout |
| Access audit | Monthly | RBAC compliance, unauthorized access |
| Data privacy audit | Quarterly | Consent, retention, access logs |

## 12.3 Policy Compliance

| Policy Area | Enforcement |
|-------------|-------------|
| Customer consent | System-enforced OTP; audit trail |
| KYC/AML | Partner and customer KYC gates |
| Fair practice code | Mis-selling detection and penalties |
| Data protection (DPDP) | Privacy controls, consent management |
| RBI guidelines | Lending process compliance |
| Internal code of conduct | Employee and partner adherence |

## 12.4 Document Validation

| Validation | Method |
|------------|--------|
| Document authenticity | AI + manual review |
| Consent documentation | System-generated consent records |
| Agreement validity | DSA/referral agreement status |
| Retention compliance | Automated retention policies |
| PII handling | Masking, access controls |

## 12.5 Fraud Detection

| Fraud Type | Detection Method |
|------------|----------------|
| Identity fraud | Document cross-verification, bureau check |
| Income fraud | Statement analysis, consistency checks |
| Duplicate applications | Deduplication engine |
| Partner fraud | Pattern analysis, velocity checks |
| Commission fraud | Disbursement verification |
| Account takeover | Anomaly detection on login |

## 12.6 Risk Monitoring

| Monitor | Cadence |
|---------|---------|
| High-risk application queue | Real-time |
| Partner risk scores | Weekly |
| Complaint trends | Weekly |
| Regulatory update tracking | Ongoing |
| Policy violation incidents | Real-time alerts |

## 12.7 Regulatory Reporting

| Report | Recipient | Frequency |
|--------|-----------|-----------|
| Compliance summary | Management / Board | Quarterly |
| Fraud incident report | Management | Per incident |
| Partner compliance status | Operations Head | Monthly |
| Data breach notification | Regulatory authority | Per incident (as required) |
| Audit findings report | Management | Per audit |

## 12.8 Compliance Team KPIs

| KPI | Target | Frequency |
|-----|--------|-----------|
| Audit completion rate | 100% on schedule | Per audit cycle |
| Fraud detection rate | Track and improve | Monthly |
| Policy violation resolution | <48 hours | Per incident |
| Partner compliance rate | 95%+ | Quarterly |
| Consent compliance rate | 100% | Continuous |
| Regulatory reporting timeliness | 100% | Per deadline |
| False positive rate (fraud) | <10% | Monthly |

## 12.9 Compliance Team Permissions

| Resource | Create | Read | Update | Delete | Assign | Approve | Audit | Configure |
|----------|--------|------|--------|--------|--------|---------|-------|-----------|
| All applications | ✗ | ✓ | ✓ (compliance status) | ✗ | ✗ | ✓ (hold/release) | ✓ | ✗ |
| All documents | ✗ | ✓ | ✓ (verification) | ✗ | ✗ | ✓ | ✓ | ✗ |
| All partners | ✗ | ✓ | ✓ (compliance status) | ✗ | ✗ | ✓ (suspend) | ✓ | ✗ |
| All customers | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Fraud cases | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |
| Audit logs | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Compliance policies | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ |
| User access | ✗ | ✓ | ✓ (suspend) | ✗ | ✗ | ✓ | ✓ | ✗ |
| Reports (all) | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |

## 12.10 Compliance Team Reports

| Report | Access |
|--------|--------|
| Compliance Dashboard | ✓ |
| Audit Findings Report | ✓ |
| Fraud Case Report | ✓ |
| Partner Compliance Report | ✓ |
| Policy Violation Report | ✓ |
| Consent Compliance Report | ✓ |
| Regulatory Filing Status | ✓ |

---

# 13. ADMIN PERSONA

## 13.1 Role Definition

The **Admin** manages **day-to-day platform operations**—user provisioning, product configuration, campaign setup, knowledge base, and operational settings. Admins do not have security-critical or role-design authority (reserved for Super Admin).

| Attribute | Detail |
|-----------|--------|
| **Employment** | Internal platform/operations team |
| **Reports to** | CTO / Operations Head |
| **Scope** | Platform configuration (non-security) |
| **Separation** | Cannot modify RBAC roles or security policies |

## 13.2 Platform Management

| Area | Responsibility |
|------|---------------|
| System health monitoring | Dashboard review, alert response |
| Integration monitoring | Lender API, WhatsApp, SMS, payment gateway status |
| Feature flag management | Enable/disable features per environment |
| Maintenance coordination | Schedule and communicate maintenance windows |
| Version management | Track deployments and release notes |

## 13.3 User Management

| Action | Scope |
|--------|-------|
| Create internal users | All employee roles (not Super Admin) |
| Deactivate users | All except Super Admin |
| Reset passwords / MFA | All users |
| Assign roles | Within predefined role templates |
| Assign branch/region | Geographic assignment |
| Partner activation | DSA and Referral partner approval (or delegate to Branch Manager) |
| Bulk import | CSV import for users and partners |

**Cannot:** Create new roles, modify permission matrices, access Super Admin functions.

## 13.4 Product Management

| Action | Detail |
|--------|--------|
| Product catalog | Add/edit/deactivate products |
| Lender mapping | Map products to lenders |
| Eligibility rules | Configure rule parameters (not override credit policy) |
| Document checklists | Define per-product document requirements |
| Commission rules | Configure commission structures (subject to Finance approval) |
| Referral reward rules | Configure referral program parameters |

## 13.5 Campaign Management

| Action | Detail |
|--------|--------|
| Create campaigns | Lead generation campaigns with attribution |
| Campaign targeting | Geography, product, channel |
| Campaign tracking | UTM, referral codes, partner attribution |
| Campaign reporting | Performance analytics |
| Campaign lifecycle | Activate, pause, close campaigns |

## 13.6 Knowledge Base Management

| Action | Detail |
|--------|--------|
| Create/edit articles | Product guides, process docs, FAQs |
| Categorize content | By product, role, topic |
| Version control | Track article versions |
| Publish/unpublish | Content lifecycle |
| Training module management | Link to partner/employee training |

## 13.7 Settings Management

| Setting Category | Examples |
|------------------|----------|
| SLA configuration | Lead contact, processing, support SLAs |
| Notification templates | SMS, email, WhatsApp, push templates |
| Workflow configuration | Stage definitions, auto-transitions |
| Branch/region setup | Organizational structure |
| Holiday calendar | Business day calculations for SLAs |
| Commission payout cycles | Schedule configuration |

## 13.8 Reporting Responsibilities

| Report | Admin Access |
|--------|-------------|
| Platform usage report | ✓ |
| User activity report | ✓ |
| Integration health report | ✓ |
| Campaign performance report | ✓ |
| System error report | ✓ |
| Configuration change log | ✓ |

## 13.9 Admin Permissions

| Resource | Create | Read | Update | Delete | Assign | Approve | Export | Configure | Manage |
|----------|--------|------|--------|--------|--------|---------|--------|-----------|--------|
| Internal users | ✓ | ✓ | ✓ | ✓ (deactivate) | ✓ (roles) | ✓ (partner) | ✓ | ✗ | ✓ |
| Partners | ✓ | ✓ | ✓ | ✓ (deactivate) | ✗ | ✓ | ✓ | ✗ | ✓ |
| Products | ✓ | ✓ | ✓ | ✓ (deactivate) | ✗ | ✗ | ✓ | ✓ | ✓ |
| Campaigns | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Knowledge base | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ |
| System settings | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Commission rules | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| Reports (platform) | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Audit logs | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| RBAC roles | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Security settings | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

## 13.10 Admin Dashboard

| Widget | Access |
|--------|--------|
| Platform Health Status | ✓ |
| Active Users (by role) | ✓ |
| Integration Status | ✓ |
| Pending Partner Activations | ✓ |
| Recent Configuration Changes | ✓ |
| Error/Alert Queue | ✓ |
| Campaign Performance Summary | ✓ |
| Support Escalation Queue | ✓ |

---

# 14. SUPER ADMIN PERSONA

## 14.1 Role Definition

The **Super Admin** has **full system control**—security, RBAC design, audit access, and business-critical configuration. Limited to 1–3 individuals (CEO, CTO, designated platform owner).

| Attribute | Detail |
|-----------|--------|
| **Count** | Maximum 3 accounts |
| **Authentication** | SSO + MFA + IP restriction |
| **Session** | Short timeout (15 min); re-auth for critical actions |
| **Audit** | All actions logged with enhanced audit trail |
| **Separation** | Cannot be combined with operational roles |

## 14.2 Full System Control

| Capability | Detail |
|------------|--------|
| All Admin capabilities | ✓ (superset) |
| Security configuration | ✓ (exclusive) |
| RBAC management | ✓ (exclusive) |
| Environment management | ✓ (dev/staging/prod) |
| Data management | ✓ (with audit; no casual access) |
| Emergency controls | ✓ (system lockdown, mass notification) |
| API key management | ✓ |
| Third-party integration credentials | ✓ |

## 14.3 Role Creation

| Action | Detail |
|--------|--------|
| Create custom roles | Define new role types for future needs |
| Clone existing roles | Duplicate and modify |
| Deprecate roles | Deactivate unused roles |
| Role versioning | Track permission changes over time |

## 14.4 Permission Management

| Action | Detail |
|--------|--------|
| Modify permission matrix | Add/remove permissions per role |
| Permission inheritance rules | Configure hierarchical inheritance |
| Temporary permission grants | Time-bound elevated access |
| Permission audit | Review all role permissions |

## 14.5 Security Management

| Area | Control |
|------|---------|
| Authentication policies | MFA, password, session rules |
| IP whitelisting | Admin/Super Admin access restriction |
| Encryption settings | Key rotation policies |
| API security | Rate limits, OAuth configuration |
| Data retention policies | Configure retention periods |
| Breach response | Initiate incident response protocol |

## 14.6 Audit Access

| Access | Detail |
|--------|--------|
| Full audit log | All user actions across platform |
| Security event log | Login attempts, permission changes |
| Data access log | Who accessed what customer data |
| Configuration change log | All system configuration changes |
| Export audit data | For external audit/compliance |

## 14.7 Configuration Management

| Configuration | Super Admin Only |
|---------------|-----------------|
| RBAC matrix | ✓ |
| Security policies | ✓ |
| Environment variables (secrets) | ✓ |
| Database connection settings | ✓ |
| Feature flags (production) | ✓ |
| System-wide maintenance mode | ✓ |

## 14.8 Business Controls

| Control | Detail |
|---------|--------|
| Commission override (unlimited) | Final authority on disputes |
| Partner blacklisting | Permanent partner ban |
| User emergency suspension | Immediate account lockdown |
| System-wide announcement | Emergency communications |
| Data export (bulk) | Regulatory/legal requests |
| Platform kill switch | Emergency shutdown capability |

## 14.9 Super Admin Permissions

**Super Admin has ALL permissions across ALL resources:**

| Permission | All Resources |
|------------|---------------|
| Create | ✓ |
| Read | ✓ |
| Update | ✓ |
| Delete | ✓ |
| Approve | ✓ |
| Assign | ✓ |
| Export | ✓ |
| Audit | ✓ |
| Configure | ✓ |
| Manage | ✓ |

*Subject to enhanced audit logging and dual-approval for destructive actions (configurable).*

---

# 15. MANAGEMENT PERSONA

## 15.1 Management Sub-Roles

| Sub-Role | Primary Focus | Reports |
|----------|--------------|---------|
| **CEO** | Overall strategy, investor relations, board reporting | Board |
| **Director** | Strategic initiatives, key partnerships | CEO |
| **Business Head** | Revenue, market expansion, product strategy | CEO |
| **Sales Head** | Sales performance, regional growth | CEO / Business Head |
| **Operations Head** | Processing efficiency, compliance, support | CEO |
| **Finance Head** | Revenue, commission, payouts, P&L | CEO |

## 15.2 CEO

| Responsibility | Platform Usage |
|----------------|---------------|
| Strategic vision and direction | Executive dashboard, quarterly reviews |
| Board and investor reporting | Automated board packs |
| Key partnership decisions | Lender/partner analytics |
| Risk oversight | Compliance and fraud dashboards |
| Organizational design | Headcount and productivity analytics |

**Dashboard Priority:** Company-wide KPIs, revenue trend, market position, strategic initiative progress.

## 15.3 Director

| Responsibility | Platform Usage |
|----------------|---------------|
| Strategic program oversight | Program dashboards |
| Cross-functional alignment | Multi-department analytics |
| Key account relationships | Partner and lender performance |
| Expansion decisions | Geographic and product analytics |

**Dashboard Priority:** Strategic KPIs, initiative ROI, partnership pipeline.

## 15.4 Business Head

| Responsibility | Platform Usage |
|----------------|---------------|
| Revenue accountability | Revenue dashboard |
| Market expansion | Geographic analytics |
| Product portfolio strategy | Product mix analytics |
| Competitive positioning | Market share indicators |
| Growth planning | Forecast and scenario models |

**Dashboard Priority:** Revenue, growth, product mix, market expansion, customer acquisition cost.

## 15.5 Sales Head

| Responsibility | Platform Usage |
|----------------|---------------|
| Sales organization performance | Regional/branch comparison |
| Target setting and allocation | Target management module |
| Channel strategy (DSA vs. direct) | Channel analytics |
| Sales process optimization | Funnel and conversion analytics |
| Partner network growth | Partner analytics |

**Dashboard Priority:** Disbursement volume, conversion funnel, regional performance, partner contribution, executive productivity.

## 15.6 Operations Head

| Responsibility | Platform Usage |
|----------------|---------------|
| Processing efficiency | Operations TAT dashboard |
| Compliance oversight | Compliance dashboard |
| Support quality | Support SLA dashboard |
| Lender relationship management | Lender performance analytics |
| Cost optimization | Cost per disbursement analytics |

**Dashboard Priority:** Processing TAT, SLA compliance, support metrics, compliance status, lender performance.

## 15.7 Finance Head

| Responsibility | Platform Usage |
|----------------|---------------|
| Revenue recognition | Commission and revenue reports |
| Commission and payout governance | Commission engine reports |
| P&L analysis | Financial analytics |
| Budget vs. actual | Budget tracking |
| Partner payout approval | Payout approval workflow |

**Dashboard Priority:** Revenue, commission liability, payout status, product profitability, branch P&L.

## 15.8 Executive Dashboards

| Dashboard | CEO | Director | Business Head | Sales Head | Ops Head | Finance Head |
|-----------|-----|----------|---------------|------------|----------|--------------|
| Company KPI Summary | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Revenue Dashboard | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Disbursement Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Funnel/Conversion | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Regional Performance | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Partner Network | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Customer Analytics | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Operations TAT | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Compliance Status | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| Support Metrics | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Commission/Payout | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ |
| AI Utilization | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Forecast/Scenario | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Board Report Pack | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## 15.9 Strategic Reports

| Report | Available To |
|--------|-------------|
| Monthly Business Review Pack | All Management |
| Quarterly Board Report | CEO, Director, Finance Head |
| Revenue Forecast Report | CEO, Business Head, Finance Head |
| Market Expansion Analysis | CEO, Business Head, Sales Head |
| Partner Network Report | CEO, Business Head, Sales Head |
| Customer Lifetime Value Report | CEO, Business Head |
| Operational Efficiency Report | CEO, Operations Head |
| Compliance Summary | CEO, Operations Head |
| AI ROI Report | CEO, Business Head |
| Product Performance Report | CEO, Business Head, Sales Head |

## 15.10 Decision Support Reports

| Decision | Report Required |
|----------|----------------|
| Enter new city | Market analysis, partner density, projected ROI |
| Launch new product | Product readiness, pipeline impact, revenue projection |
| Lender partnership | Lender performance comparison, volume projection |
| Partner program change | Partner economics, retention impact |
| Pricing/commission change | Revenue impact model |
| Headcount planning | Productivity analytics, volume forecast |
| Technology investment | AI ROI, automation impact |

## 15.11 Management Permissions

| Resource | Create | Read | Update | Delete | Assign | Approve | Export | Audit |
|----------|--------|------|--------|--------|--------|---------|--------|-------|
| All dashboards | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| All reports | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Strategic targets | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ |
| Commission overrides (high) | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Partner blacklisting | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Policy approval | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Budget allocation | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ |
| Operational data | ✗ | ✓ (aggregated) | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Customer PII | ✗ | ✗ (masked only) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Individual employee data | ✗ | ✓ (aggregated) | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| System configuration | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

*Management has read access to aggregated/anonymized data; no direct customer PII access unless Compliance-authorized investigation.*

---

# 16. ROLE HIERARCHY

## 16.1 Complete Hierarchy Tree

```
LEVEL 0 — PLATFORM GOVERNANCE
└── Super Admin (1–3 individuals)

LEVEL 1 — PLATFORM OPERATIONS
└── Admin (Platform team)

LEVEL 2 — EXECUTIVE LEADERSHIP
└── Management
    ├── CEO
    ├── Director
    ├── Business Head
    ├── Sales Head
    ├── Operations Head
    └── Finance Head

LEVEL 3 — REGIONAL LEADERSHIP
└── Regional Manager (1 per region, reports to Sales Head)

LEVEL 4 — BRANCH LEADERSHIP
└── Branch Manager (1 per branch, reports to Regional Manager)

LEVEL 5 — FUNCTIONAL TEAMS (Branch-Assigned + Central)
├── Sales Executive (reports to Branch Manager)
├── Relationship Manager (reports to Branch Manager)
├── Credit Executive (functional: Operations Head; dotted: Branch Manager)
└── Operations Executive (functional: Operations Head; dotted: Branch Manager)

LEVEL 5 — CROSS-CUTTING FUNCTIONAL (Central)
├── Support Team (reports to Operations Head)
│   ├── Support Agent (L1)
│   ├── Support Lead (L2)
│   └── Support Manager
└── Compliance Team (reports to CEO / Compliance Officer)
    ├── Compliance Analyst
    ├── Compliance Manager
    └── Fraud Analyst

LEVEL 6 — EXTERNAL PARTNERS
├── DSA Partner (business relationship: Branch Manager)
└── Referral Partner (business relationship: Branch Manager / Campaign Owner)
    ├── Builder
    ├── Property Dealer
    ├── CA
    ├── Broker
    ├── Channel Partner
    └── Corporate Partner

LEVEL 7 — EXTERNAL CUSTOMERS
└── Customer (self-service)

LEVEL FUTURE — EXTERNAL INSTITUTIONAL
└── Lender / Bank User (portal access, per-lender)
```

## 16.2 Reporting Relationships

| Role | Reports To (Primary) | Reports To (Dotted/Functional) |
|------|---------------------|-------------------------------|
| Super Admin | CEO / Board | — |
| Admin | CTO / Operations Head | — |
| CEO | Board | — |
| Director | CEO | — |
| Business Head | CEO | — |
| Sales Head | CEO / Business Head | — |
| Operations Head | CEO | — |
| Finance Head | CEO | — |
| Regional Manager | Sales Head | Business Head |
| Branch Manager | Regional Manager | Sales Head |
| Sales Executive | Branch Manager | — |
| Relationship Manager | Branch Manager | — |
| Credit Executive | Operations Head | Branch Manager |
| Operations Executive | Operations Head | Branch Manager |
| Support Agent/Lead/Manager | Operations Head | — |
| Compliance Analyst/Manager/Fraud | CEO / Compliance Officer | — |
| DSA Partner | Branch Manager (business) | — |
| Referral Partner | Branch Manager (business) | — |
| Customer | — (self-service) | — |
| Lender User (Future) | — (external) | Operations Head (relationship) |

## 16.3 Authority Matrix

| Decision | Super Admin | Management | Regional Mgr | Branch Mgr | Executive |
|----------|-------------|------------|--------------|------------|-----------|
| System configuration | ✓ | ✗ | ✗ | ✗ | ✗ |
| Role/permission design | ✓ | ✗ | ✗ | ✗ | ✗ |
| Strategic targets | ✓ | ✓ | ✗ | ✗ | ✗ |
| Regional targets | ✗ | ✓ | ✓ (propose) | ✗ | ✗ |
| Branch targets | ✗ | ✓ | ✓ | ✓ (propose) | ✗ |
| Executive targets | ✗ | ✓ | ✓ | ✓ | ✗ |
| Lead reassignment | ✗ | ✗ | ✓ | ✓ | ✗ |
| Credit exception (<₹25L) | ✗ | ✗ | ✗ | ✓ | ✗ |
| Credit exception (>₹25L) | ✗ | ✓ | ✓ | ✓ (recommend) | ✗ |
| Commission dispute (<₹10K) | ✗ | ✗ | ✓ | ✓ | ✗ |
| Commission dispute (>₹10K) | ✗ | ✓ | ✓ | ✓ (recommend) | ✗ |
| Partner activation | ✗ | ✓ | ✓ | ✓ | ✗ |
| Partner suspension | ✗ | ✓ | ✓ | ✓ (recommend) | ✗ |
| Partner blacklist | ✗ | ✓ | ✗ | ✗ | ✗ |

---

# 17. ROLE-BASED ACCESS CONTROL (RBAC)

## 17.1 Permission Types

| Permission | Code | Description |
|------------|------|-------------|
| Create | C | Create new records |
| Read | R | View records |
| Update | U | Modify existing records |
| Delete | D | Remove/deactivate records |
| Approve | A | Approve workflows, exceptions |
| Assign | AS | Assign records to users |
| Export | E | Export data to file |
| Audit | AU | Access audit logs |
| Configure | CF | Modify system configuration |
| Manage | M | Full management of resource category |

## 17.2 Master Permission Matrix

**Legend:** ✓ = Granted | ✓* = Scoped (own/assigned/branch/region) | ✗ = Denied | — = Not applicable

### Customer & Lead Resources

| Resource | Customer | Referral Partner | DSA | Sales Exec | RM | Credit Exec | Ops Exec | Branch Mgr | Regional Mgr | Support | Compliance | Admin | Super Admin | Management |
|----------|----------|-----------------|-----|------------|-----|-------------|----------|------------|--------------|---------|------------|-------|-------------|------------|
| **Leads — C** | ✓* | ✓* | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **Leads — R** | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓ | ✓ | ✓ | ✓* |
| **Leads — U** | ✓* | ✗ | ✓* | ✓* | ✗ | ✗ | ✗ | ✓* | ✓* | ✗ | ✓ | ✓ | ✓ | ✗ |
| **Leads — D** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **Leads — AS** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ |
| **Leads — E** | ✗ | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ |

### Application & Processing Resources

| Resource | Customer | Referral Partner | DSA | Sales Exec | RM | Credit Exec | Ops Exec | Branch Mgr | Regional Mgr | Support | Compliance | Admin | Super Admin | Management |
|----------|----------|-----------------|-----|------------|-----|-------------|----------|------------|--------------|---------|------------|-------|-------------|------------|
| **Applications — C** | ✓* | ✗ | ✗ | ✓* | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **Applications — R** | ✓* | ✗ | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓ | ✓ | ✓ | ✓* |
| **Applications — U** | ✓* | ✗ | ✗ | ✓* | ✗ | ✓* | ✓* | ✓* | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| **Applications — A** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓* | ✗ | ✓* | ✓* | ✗ | ✓ | ✗ | ✓ | ✓ |
| **Applications — E** | ✓* | ✗ | ✓* | ✓* | ✓* | ✓* | ✓* | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ |
| **Credit Assessment — C** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ |
| **Credit Assessment — R** | ✗ | ✗ | ✗ | ✓* | ✓* | ✓ | ✓* | ✓* | ✓* | ✗ | ✓ | ✓ | ✓ | ✓* |
| **Credit Assessment — A** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓* | ✓* | ✗ | ✓ | ✗ | ✓ | ✓ |
| **Disbursement — C** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **Disbursement — R** | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓ | ✓* | ✓* | ✓* | ✓ | ✓ | ✓ | ✓ |

### Document Resources

| Resource | Customer | Referral Partner | DSA | Sales Exec | RM | Credit Exec | Ops Exec | Branch Mgr | Regional Mgr | Support | Compliance | Admin | Super Admin | Management |
|----------|----------|-----------------|-----|------------|-----|-------------|----------|------------|--------------|---------|------------|-------|-------------|------------|
| **Documents — C** | ✓* | ✗ | ✓* | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **Documents — R** | ✓* | ✗ | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓ | ✓ | ✓ | ✗ |
| **Documents — U** | ✓* | ✗ | ✓* | ✓* | ✗ | ✓* | ✓* | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| **Documents — A** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ |
| **Documents — E** | ✓* | ✗ | ✗ | ✓* | ✓* | ✓* | ✓* | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |

### Partner & Commission Resources

| Resource | Customer | Referral Partner | DSA | Sales Exec | RM | Credit Exec | Ops Exec | Branch Mgr | Regional Mgr | Support | Compliance | Admin | Super Admin | Management |
|----------|----------|-----------------|-----|------------|-----|-------------|----------|------------|--------------|---------|------------|-------|-------------|------------|
| **Commission — R** | ✗ | ✓* | ✓* | ✗ | ✗ | ✗ | ✓* | ✓* | ✓* | ✗ | ✓ | ✓ | ✓ | ✓ |
| **Commission — A** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓* | ✓* | ✗ | ✓ | ✗ | ✓ | ✓ |
| **Commission — CF** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| **Partner Mgmt — C** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓* | ✓* | ✗ | ✗ | ✓ | ✓ | ✗ |
| **Partner Mgmt — R** | ✗ | ✓* | ✓* | ✓* | ✗ | ✗ | ✗ | ✓* | ✓* | ✓* | ✓ | ✓ | ✓ | ✓ |
| **Partner Mgmt — U** | ✗ | ✓* | ✓* | ✗ | ✗ | ✗ | ✗ | ✓* | ✓* | ✗ | ✓ | ✓ | ✓ | ✗ |
| **Partner Mgmt — A** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ |
| **Referral Rewards — R** | ✓* | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✓* | ✓* | ✗ | ✓ | ✓ | ✓ | ✓ |

### Platform & System Resources

| Resource | Customer | Referral Partner | DSA | Sales Exec | RM | Credit Exec | Ops Exec | Branch Mgr | Regional Mgr | Support | Compliance | Admin | Super Admin | Management |
|----------|----------|-----------------|-----|------------|-----|-------------|----------|------------|--------------|---------|------------|-------|-------------|------------|
| **Users — M** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓* | ✓ | ✓ | ✗ |
| **Products — CF** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| **Campaigns — CF** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓* | ✓* | ✗ | ✗ | ✓ | ✓ | ✓* |
| **Settings — CF** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓* | ✓ | ✓ | ✗ |
| **RBAC — CF** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **Audit Logs — AU** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| **Reports — R** | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓ | ✓ | ✓ | ✓ |
| **Reports — E** | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓ | ✓ | ✓* | ✓ | ✓ | ✓ | ✓ |
| **Support Tickets — C** | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓ | ✓ | ✓ | ✓ | ✗ |
| **Support Tickets — M** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✗ |
| **Knowledge Base — R** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Knowledge Base — U** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓* | ✗ | ✓ | ✓ | ✗ |

## 17.3 Scope Definitions

| Scope Code | Meaning |
|------------|---------|
| ✓* (own) | User's own records only |
| ✓* (assigned) | Records assigned to the user |
| ✓* (portfolio) | RM's customer portfolio |
| ✓* (branch) | All records within user's branch |
| ✓* (region) | All records within user's region |
| ✓* (aggregated) | Summary/aggregated data only; no PII |
| ✓* (status) | Status fields only; no internal notes |
| ✓* (masked) | Partially masked customer data |

---

# 18. DASHBOARD ACCESS MATRIX

## 18.1 Dashboard Catalog

| Dashboard ID | Dashboard Name | Primary Audience |
|--------------|-----------------|------------------|
| D-01 | Customer Home Dashboard | Customer |
| D-02 | DSA Partner Dashboard | DSA Partner |
| D-03 | Referral Partner Dashboard | Referral Partner |
| D-04 | Sales Executive Dashboard | Sales Executive |
| D-05 | Relationship Manager Dashboard | Relationship Manager |
| D-06 | Credit Processing Dashboard | Credit Executive |
| D-07 | Operations Processing Dashboard | Operations Executive |
| D-08 | Branch Manager Dashboard | Branch Manager |
| D-09 | Regional Manager Dashboard | Regional Manager |
| D-10 | Support Console Dashboard | Support Team |
| D-11 | Compliance Dashboard | Compliance Team |
| D-12 | Admin Operations Dashboard | Admin |
| D-13 | Super Admin Console | Super Admin |
| D-14 | Executive KPI Dashboard | Management (all) |
| D-15 | Revenue & Finance Dashboard | Finance Head, CEO |
| D-16 | Sales Performance Dashboard | Sales Head, Regional/Branch Managers |
| D-17 | Operations TAT Dashboard | Operations Head |
| D-18 | Partner Network Dashboard | Sales Head, Business Head |
| D-19 | AI Utilization Dashboard | Management, Admin |
| D-20 | Lender Performance Dashboard | Operations Head, Management |

## 18.2 Dashboard Access by Role

| Dashboard | Cust | Ref | DSA | Sales | RM | Credit | Ops | Branch | Regional | Support | Compliance | Admin | Super | Mgmt |
|-----------|------|-----|-----|-------|-----|--------|-----|--------|----------|---------|------------|-------|-------|------|
| D-01 Customer Home | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| D-02 DSA Partner | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| D-03 Referral Partner | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| D-04 Sales Executive | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| D-05 RM Portfolio | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| D-06 Credit Processing | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ |
| D-07 Ops Processing | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| D-08 Branch Manager | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| D-09 Regional Manager | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| D-10 Support Console | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✗ |
| D-11 Compliance | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| D-12 Admin Operations | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| D-13 Super Admin Console | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| D-14 Executive KPI | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| D-15 Revenue & Finance | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓* |
| D-16 Sales Performance | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓* |
| D-17 Operations TAT | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓* |
| D-18 Partner Network | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ |
| D-19 AI Utilization | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| D-20 Lender Performance | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |

*Mgmt ✓* = Subset by management role (see Section 15.8).

## 18.3 Widget Access Matrix (Key Widgets)

| Widget | Cust | DSA | Sales | RM | Credit | Ops | Branch | Regional | Support | Compliance | Admin | Mgmt |
|--------|------|-----|-------|-----|--------|-----|--------|----------|---------|------------|-------|------|
| Application Status Tracker | ✓ | ✓* | ✓* | ✓* | ✓ | ✓ | ✓* | ✓* | ✓* | ✓ | ✓ | ✓* |
| Lead Pipeline Funnel | ✗ | ✓* | ✓* | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Commission Summary | ✗ | ✓* | ✗ | ✗ | ✗ | ✓* | ✓* | ✓* | ✗ | ✓ | ✓ | ✓ |
| Target Progress | ✗ | ✓* | ✓* | ✓* | ✓* | ✓* | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| SLA Alert Panel | ✗ | ✗ | ✓* | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| AI Copilot Panel | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| AI Advisor | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Cross-sell Opportunities | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓* | ✓* | ✗ | ✗ | ✗ | ✓ |
| Credit Assessment Queue | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓* | ✓* | ✗ | ✓ | ✓ | ✓* |
| Disbursement Tracker | ✓* | ✓* | ✓* | ✓* | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Partner Leaderboard | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Branch Comparison Grid | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Fraud Alert Panel | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓* |
| Ticket Queue | ✗ | ✓* | ✓* | ✓* | ✗ | ✗ | ✓* | ✗ | ✓ | ✗ | ✓ | ✗ |
| Revenue Forecast | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ |
| System Health | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓* |
| Customer PII (unmasked) | ✓* | ✗ | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓* | ✓ | ✓ | ✗ |

## 18.4 Report Access Matrix

| Report | Cust | Ref | DSA | Sales | RM | Credit | Ops | Branch | Regional | Support | Compliance | Admin | Mgmt |
|--------|------|-----|-----|-------|-----|--------|-----|--------|----------|---------|------------|-------|------|
| Personal Pipeline | ✗ | ✗ | ✓* | ✓* | ✓* | ✓* | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Commission Statement | ✗ | ✓* | ✓* | ✗ | ✗ | ✗ | ✗ | ✓* | ✓* | ✗ | ✓ | ✓ | ✓ |
| Branch Performance | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Regional Performance | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Executive Productivity | ✗ | ✗ | ✗ | ✓* | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Conversion Funnel | ✗ | ✗ | ✓* | ✓* | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Disbursement Report | ✓* | ✓* | ✓* | ✓* | ✓* | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Partner Network Report | ✗ | ✗ | ✓* | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| SLA Compliance | ✗ | ✗ | ✓* | ✓* | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Compliance Audit | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| Fraud Report | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓* |
| Support Ticket Report | ✗ | ✓* | ✓* | ✓* | ✓* | ✗ | ✗ | ✓* | ✗ | ✓ | ✗ | ✓ | ✓* |
| Revenue Forecast | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Board Report Pack | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| AI ROI Report | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Lender Performance | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Customer NPS Report | ✗ | ✗ | ✗ | ✗ | ✓* | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Tax/TDS Certificate | ✗ | ✓* | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |

---

# 19. NOTIFICATION MATRIX

## 19.1 Notification Channels

| Channel | Code | Primary Use |
|---------|------|-------------|
| SMS | SMS | OTP, critical alerts, disbursement |
| Email | EM | Statements, reports, formal communication |
| Push Notification | PN | Real-time app alerts |
| WhatsApp | WA | Status updates, document requests, engagement |
| In-App Alert | IA | All events; universal fallback |

## 19.2 Event-Role Notification Matrix

### Lead & Application Events

| Event | Cust | Ref | DSA | Sales | RM | Credit | Ops | Branch | Regional | Support | Compliance | Admin |
|-------|------|-----|-----|-------|-----|--------|-----|--------|----------|---------|------------|-------|
| Lead created | — | IA | PN,WA,IA | PN,IA | — | — | — | IA | — | — | — | — |
| Lead assigned | — | — | PN,IA | PN,WA,IA | — | — | — | IA | — | — | — | — |
| First contact SLA warning | — | — | — | PN,SMS,IA | — | — | — | PN,IA | — | — | — | — |
| First contact SLA breach | — | — | IA | PN,SMS,IA | — | — | — | PN,SMS,IA | PN,IA | — | — | — |
| Application created | PN,WA,IA | — | PN,IA | PN,IA | — | — | — | IA | — | — | — | — |
| Document deficiency | PN,WA,IA | — | PN,WA,IA | PN,WA,IA | — | — | — | — | — | — | — | — |
| Document uploaded | — | — | IA | PN,IA | — | PN,IA | PN,IA | — | — | — | — | — |
| Credit assessment complete | PN,WA,IA | — | PN,IA | PN,IA | — | — | PN,IA | IA | — | — | IA | — |
| Submitted to lender | PN,WA,IA | — | PN,WA,IA | PN,IA | — | — | IA | IA | — | — | — | — |
| Approved | PN,SMS,WA,IA | IA | PN,SMS,WA,IA | PN,IA | PN,IA | — | IA | IA | — | — | — | — |
| Rejected | PN,WA,IA | IA | PN,WA,IA | PN,IA | — | — | IA | IA | — | — | — | — |
| Disbursed | PN,SMS,WA,IA | IA | PN,SMS,WA,IA | PN,SMS,IA | PN,IA | — | IA | PN,IA | IA | — | — | — |

### Commission & Partner Events

| Event | Cust | Ref | DSA | Sales | RM | Credit | Ops | Branch | Regional | Support | Compliance | Admin | Mgmt |
|-------|------|-----|-----|-------|-----|--------|-----|--------|----------|---------|------------|-------|------|
| Commission accrued | — | — | PN,IA | — | — | — | — | IA | — | — | — | — | — |
| Commission approved | — | — | PN,WA,IA | — | — | — | — | IA | — | — | IA | — | — |
| Payout processed | — | IA | PN,SMS,WA,IA | — | — | — | — | IA | — | — | — | — | IA |
| Referral reward earned | IA | PN,WA,IA | — | — | — | — | — | IA | — | — | — | — | — |
| Tier upgrade | — | — | PN,WA,IA | — | — | — | — | IA | IA | — | — | — | — |
| Partner agreement expiry | — | — | PN,SMS,WA,IA | — | — | — | — | PN,IA | IA | — | IA | IA | — |
| Commission dispute raised | — | — | PN,IA | — | — | — | — | PN,IA | IA | — | — | — | — |
| Commission dispute resolved | — | — | PN,WA,IA | — | — | — | — | IA | — | — | — | — | — |

### Customer Service Events

| Event | Cust | Ref | DSA | Sales | RM | Credit | Ops | Branch | Regional | Support | Compliance | Admin |
|-------|------|-----|-----|-------|-----|--------|-----|--------|----------|---------|------------|-------|
| Support ticket created | PN,IA | IA | IA | IA | IA | — | — | — | — | PN,IA | — | — |
| Support ticket updated | PN,WA,IA | IA | IA | IA | IA | — | — | — | — | IA | — | — |
| Support ticket resolved | PN,WA,IA | IA | IA | IA | IA | — | — | — | — | IA | — | — |
| Complaint escalated | PN,IA | — | — | PN,IA | PN,IA | — | — | PN,SMS,IA | PN,IA | PN,IA | PN,IA | — |
| Customer NPS survey | PN,IA | — | — | — | IA | — | — | IA | — | — | — | — |

### Cross-Sell & Retention Events

| Event | Cust | Ref | DSA | Sales | RM | Credit | Ops | Branch | Regional | Support | Compliance | Admin |
|-------|------|-----|-----|-------|-----|--------|-----|--------|----------|---------|------------|-------|
| Cross-sell opportunity | PN,WA,IA | — | — | PN,IA | PN,IA | — | — | — | — | — | — | — |
| Renewal reminder | PN,WA,IA | — | — | — | PN,IA | — | — | — | — | — | — | — |
| Churn risk alert | — | — | — | — | PN,IA | — | — | IA | — | — | — | — |
| Credit score update | PN,IA | — | — | — | IA | — | — | — | — | — | — | — |
| Referral prompt | PN,WA,IA | — | — | — | IA | — | — | — | — | — | — | — |

### Compliance & Security Events

| Event | Cust | Ref | DSA | Sales | RM | Credit | Ops | Branch | Regional | Support | Compliance | Admin | Super | Mgmt |
|-------|------|-----|-----|-------|-----|--------|-----|--------|----------|---------|------------|-------|-------|------|
| Fraud alert | — | — | — | — | — | PN,IA | — | PN,IA | IA | — | PN,SMS,IA | — | PN,IA | PN,IA |
| Compliance hold | PN,IA | IA | IA | IA | IA | PN,IA | PN,IA | PN,IA | IA | — | IA | — | IA | IA |
| Policy violation | — | — | PN,IA | PN,IA | — | — | — | PN,IA | IA | — | PN,IA | — | IA | PN,IA |
| KYC expiry warning | IA | IA | PN,SMS,WA,IA | — | — | — | — | IA | — | — | IA | IA | — | — |
| Account suspended | PN,SMS,IA | PN,IA | PN,SMS,IA | PN,IA | — | — | — | IA | IA | — | IA | IA | IA | IA |
| Security alert | IA | — | — | — | — | — | — | — | — | — | PN,IA | PN,SMS,IA | PN,SMS,IA | PN,IA |
| Audit finding | — | — | — | — | — | — | — | IA | IA | — | IA | IA | IA | PN,IA |

### System & Management Events

| Event | Cust | Ref | DSA | Sales | RM | Credit | Ops | Branch | Regional | Support | Compliance | Admin | Super | Mgmt |
|-------|------|-----|-----|-------|-----|--------|-----|--------|----------|---------|------------|-------|-------|------|
| Target milestone (50/80/100%) | — | — | IA | PN,IA | PN,IA | IA | IA | PN,IA | PN,IA | — | — | — | — | IA |
| Daily branch summary | — | — | — | — | — | — | — | EM,IA | — | — | — | — | — | — |
| Weekly regional summary | — | — | — | — | — | — | — | — | EM,IA | — | — | — | — | IA |
| Monthly board pack ready | — | — | — | — | — | — | — | — | — | — | — | — | — | EM,IA |
| System maintenance | PN,IA | IA | PN,IA | PN,IA | PN,IA | PN,IA | PN,IA | PN,IA | PN,IA | PN,IA | PN,IA | PN,IA | PN,IA | PN,IA |
| Integration failure | — | — | — | — | — | — | PN,IA | — | — | — | — | PN,SMS,IA | PN,SMS,IA | — |
| Campaign launch | PN,WA | IA | PN,WA,IA | PN,IA | — | — | — | PN,IA | PN,IA | — | — | IA | — | IA |

## 19.3 Notification Preferences

| Role | Configurable Preferences |
|------|-------------------------|
| Customer | Marketing opt-in/out per channel; transactional cannot opt-out |
| DSA Partner | Campaign and training notifications configurable |
| Internal roles | Non-critical notifications configurable; SLA/security mandatory |
| Management | Summary digest frequency (daily/weekly) configurable |

---

# 20. KPI MATRIX

## 20.1 Customer KPIs

| KPI ID | KPI Name | Formula | Target | Frequency | Owner |
|--------|----------|---------|--------|-----------|-------|
| C-K01 | Registration-to-Application Rate | Applications / Registrations | 40%+ | Monthly | Business Head |
| C-K02 | Application Completion Rate | Submitted / Started | 70%+ | Monthly | Sales Head |
| C-K03 | Document First-Pass Rate | Complete first upload / Total | 60%+ | Monthly | Operations Head |
| C-K04 | Customer NPS | Promoters - Detractors | 50+ | Quarterly | Business Head |
| C-K05 | CSAT (Support) | Avg satisfaction score | 4.5/5 | Monthly | Operations Head |
| C-K06 | App MAU | Monthly active users | Growth 10%+ MoM | Monthly | Business Head |
| C-K07 | Referral Rate | Customers who refer / Total | 15%+ | Quarterly | Sales Head |
| C-K08 | Status Self-Service Rate | App checks / Total status inquiries | 80%+ | Monthly | Operations Head |
| C-K09 | Time to First Application | Avg hours registration → application | <24 hrs | Monthly | Sales Head |
| C-K10 | Customer Retention Rate | Active at 12mo / Total disbursed | 70%+ | Annual | Business Head |

## 20.2 DSA Partner KPIs

| KPI ID | KPI Name | Formula | Target | Frequency | Owner |
|--------|----------|---------|--------|-----------|-------|
| D-K01 | Active DSA Count | DSAs with ≥1 lead/month | 500+ Y1 | Monthly | Sales Head |
| D-K02 | Leads per DSA | Total DSA leads / Active DSAs | 10+/month | Monthly | Branch Manager |
| D-K03 | DSA Conversion Rate | Disbursements / DSA leads | 12%+ | Monthly | Sales Head |
| D-K04 | DSA Document Completeness | First-pass complete / Total | 70%+ | Monthly | Operations Head |
| D-K05 | Commission Dispute Rate | Disputes / Total payouts | <2% | Monthly | Finance Head |
| D-K06 | DSA App WAU | Weekly active / Total active | 80%+ | Weekly | Sales Head |
| D-K07 | DSA Retention Rate | Active QoQ / Previous Q active | 85%+ | Quarterly | Sales Head |
| D-K08 | Avg Days to Disbursement (DSA) | Disbursement date - Lead date | <10 days | Monthly | Operations Head |
| D-K09 | DSA-Sourced Revenue % | DSA channel revenue / Total | 40%+ | Monthly | Business Head |
| D-K10 | Training Compliance | Certified / Total active | 100% | Monthly | Admin |

## 20.3 Sales Executive KPIs

| KPI ID | KPI Name | Formula | Target | Frequency | Owner |
|--------|----------|---------|--------|-----------|-------|
| S-K01 | Leads Handled | Total leads assigned | Per quota | Monthly | Branch Manager |
| S-K02 | First Contact SLA | Contacted within 15min / Total | 95%+ | Daily | Branch Manager |
| S-K03 | Conversion Rate | Disbursements / Leads handled | 12%+ | Monthly | Branch Manager |
| S-K04 | Disbursement Count | Total disbursements | Per target | Monthly | Branch Manager |
| S-K05 | Disbursement Value | Total disbursed amount | Per target | Monthly | Branch Manager |
| S-K06 | Avg Time to Submission | Submission - Lead creation | <5 days | Monthly | Operations Head |
| S-K07 | Document Completeness | First-pass / Total submissions | 70%+ | Monthly | Operations Head |
| S-K08 | Activity Score | Calls + meetings + follow-ups | Per benchmark | Weekly | Branch Manager |
| S-K09 | AI Copilot Adoption | Copilot sessions / Active days | 80%+ | Weekly | Sales Head |
| S-K10 | Customer CSAT | Avg satisfaction (handled) | 4.5/5 | Monthly | Branch Manager |

## 20.4 Relationship Manager KPIs

| KPI ID | KPI Name | Formula | Target | Frequency | Owner |
|--------|----------|---------|--------|-----------|-------|
| R-K01 | Portfolio Size (Active) | Active customers in portfolio | 200–500 | Monthly | Branch Manager |
| R-K02 | Touchpoint Compliance | Customers touched / Due for touch | 95%+ | Quarterly | Branch Manager |
| R-K03 | Cross-sell Conversion | Cross-sell conversions / Opportunities | 8%+ | Monthly | Business Head |
| R-K04 | Cross-sell Revenue | Revenue from cross-sell | Per target | Monthly | Business Head |
| R-K05 | Portfolio Retention Rate | Retained / Total portfolio | 85%+ | Quarterly | Business Head |
| R-K06 | Portfolio NPS | NPS for portfolio customers | 55+ | Quarterly | Business Head |
| R-K07 | Churn Rate | Churned / Portfolio | <10% annual | Quarterly | Business Head |
| R-K08 | Referral Generation | Portfolio customers who refer | 5%+ | Quarterly | Sales Head |
| R-K09 | Repeat Loan Rate | Repeat applications / Portfolio | 15%+ | Annual | Sales Head |
| R-K10 | Query Response Time | Avg hours to first response | <4 hrs | Daily | Branch Manager |

## 20.5 Credit Executive KPIs

| KPI ID | KPI Name | Formula | Target | Frequency | Owner |
|--------|----------|---------|--------|-----------|-------|
| CR-K01 | Applications Processed | Total assessments completed | Per quota | Daily | Operations Head |
| CR-K02 | Assessment TAT | Completion - Receipt | <24 hrs | Daily | Operations Head |
| CR-K03 | First-Pass Approval Rate | Approved first time / Total | 70%+ | Weekly | Operations Head |
| CR-K04 | Rejection Accuracy | Rejections not overturned / Total rejections | 95%+ | Monthly | Operations Head |
| CR-K05 | Document Verification Accuracy | Correct verifications / Total | 98%+ | Monthly | Compliance |
| CR-K06 | Fraud Detection Rate | Frauds caught / Total assessed | Track | Monthly | Compliance |
| CR-K07 | Exception Rate | Exceptions / Total processed | <10% | Monthly | Operations Head |
| CR-K08 | SLA Compliance | Within SLA / Total | 95%+ | Daily | Operations Head |
| CR-K09 | Rework Rate | Returned for rework / Total | <5% | Weekly | Operations Head |
| CR-K10 | AI Document AI Adoption | AI-assisted / Total docs | 80%+ | Monthly | Operations Head |

## 20.6 Operations Executive KPIs

| KPI ID | KPI Name | Formula | Target | Frequency | Owner |
|--------|----------|---------|--------|-----------|-------|
| O-K01 | Applications Processed | Submissions + disbursements | Per quota | Daily | Operations Head |
| O-K02 | Submission TAT | Lender submission - Credit approval | <4 hrs | Daily | Operations Head |
| O-K03 | Disbursement TAT | Disbursement - Submission | Per lender SLA | Weekly | Operations Head |
| O-K04 | Disbursement Count | Total disbursements processed | Per target | Monthly | Operations Head |
| O-K05 | Disbursement Value | Total value disbursed | Per target | Monthly | Operations Head |
| O-K06 | Rework Rate | Rework items / Total processed | <5% | Weekly | Operations Head |
| O-K07 | Lender Query Response | Responded within 4hrs / Total queries | 95%+ | Daily | Operations Head |
| O-K08 | SLA Compliance | Within SLA / Total | 95%+ | Daily | Operations Head |
| O-K09 | Submission Error Rate | Errors / Total submissions | <2% | Monthly | Operations Head |
| O-K10 | Lender Approval Rate | Lender approvals / Submissions | Track per lender | Monthly | Operations Head |

## 20.7 Branch Manager KPIs

| KPI ID | KPI Name | Formula | Target | Frequency | Owner |
|--------|----------|---------|--------|-----------|-------|
| B-K01 | Branch Disbursement Volume | Total disbursements | Per target | Monthly | Regional Manager |
| B-K02 | Branch Revenue | Total commission revenue | Per target | Monthly | Regional Manager |
| B-K03 | Branch Conversion Rate | Disbursements / Leads | 15%+ | Monthly | Regional Manager |
| B-K04 | Team SLA Compliance | Team SLA met / Total | 90%+ | Weekly | Regional Manager |
| B-K05 | Branch NPS | Customer NPS (branch) | 50+ | Quarterly | Regional Manager |
| B-K06 | DSA Activation Rate | Active DSAs / Total DSAs | 80%+ | Monthly | Regional Manager |
| B-K07 | Executive Productivity (Avg) | Avg disbursements per executive | Per benchmark | Monthly | Regional Manager |
| B-K08 | Complaint Resolution Rate | Resolved within SLA / Total | 95%+ | Monthly | Operations Head |
| B-K09 | Partner Dispute Rate | Disputes / Total partner payouts | <3% | Monthly | Regional Manager |
| B-K10 | Target Achievement | Actual / Target | 100% | Monthly | Regional Manager |

## 20.8 Regional Manager KPIs

| KPI ID | KPI Name | Formula | Target | Frequency | Owner |
|--------|----------|---------|--------|-----------|-------|
| RG-K01 | Regional Disbursement Volume | Total regional disbursements | Per target | Monthly | Sales Head |
| RG-K02 | Regional Revenue | Total regional revenue | Per target | Monthly | Business Head |
| RG-K03 | Regional Conversion Rate | Disbursements / Leads | 15%+ | Monthly | Sales Head |
| RG-K04 | Branch Target Achievement | Branches at 100% / Total branches | 90%+ | Monthly | Sales Head |
| RG-K05 | Partner Growth | New partners / Total | +20% YoY | Quarterly | Sales Head |
| RG-K06 | Regional NPS | Customer NPS (region) | 50+ | Quarterly | Business Head |
| RG-K07 | Regional SLA Compliance | Region SLA met / Total | 90%+ | Weekly | Operations Head |
| RG-K08 | Branch Manager Retention | Retained BMs / Total | 90%+ | Annual | Sales Head |
| RG-K09 | Cost per Disbursement | Regional cost / Disbursements | Decreasing | Quarterly | Finance Head |
| RG-K10 | Regional Market Share | KuberOne volume / Market estimate | Track | Quarterly | Business Head |

## 20.9 Support Team KPIs

| KPI ID | KPI Name | Formula | Target | Frequency | Owner |
|--------|----------|---------|--------|-----------|-------|
| SU-K01 | Tickets Resolved | Total resolved | Per quota | Daily | Operations Head |
| SU-K02 | First Response SLA | Responded <1hr / Total | 95%+ | Daily | Operations Head |
| SU-K03 | Resolution SLA | Resolved within SLA / Total | 90%+ | Daily | Operations Head |
| SU-K04 | CSAT (Post-Ticket) | Avg satisfaction | 4.5/5 | Weekly | Operations Head |
| SU-K05 | Escalation Rate | Escalated / Total tickets | <15% | Weekly | Operations Head |
| SU-K06 | Reopen Rate | Reopened / Resolved | <5% | Monthly | Operations Head |
| SU-K07 | Avg Handling Time | Total handle time / Tickets | Per benchmark | Weekly | Operations Head |
| SU-K08 | Complaint Resolution Rate | Complaints resolved / Total | 95%+ | Monthly | Operations Head |
| SU-K09 | Backlog Size | Open tickets at EOD | <50 | Daily | Operations Head |
| SU-K10 | Channel Distribution | Tickets by channel | Balanced | Monthly | Operations Head |

## 20.10 Management KPIs

| KPI ID | KPI Name | Formula | Target | Frequency | Owner |
|--------|----------|---------|--------|-----------|-------|
| M-K01 | Total Disbursement Volume | Company-wide disbursements | Per target | Monthly | CEO |
| M-K02 | Total Revenue | Gross commission revenue | Per target | Monthly | CEO |
| M-K03 | Company Conversion Rate | Disbursements / Leads | 15%+ | Monthly | Business Head |
| M-K04 | Customer Growth Rate | New customers / Month | 5,000+ | Monthly | Business Head |
| M-K05 | Partner Network Size | Active partners | 500+ Y1 | Monthly | Sales Head |
| M-K06 | Company NPS | Overall NPS | 50+ | Quarterly | CEO |
| M-K07 | Cost per Acquisition | Acquisition cost / New customers | -25% YoY | Quarterly | Finance Head |
| M-K08 | Customer Lifetime Value | Avg revenue per customer lifetime | +25% YoY | Annual | Business Head |
| M-K09 | AI Utilization Rate | AI-assisted actions / Total actions | 50%+ | Monthly | CTO |
| M-K10 | Platform Uptime | Uptime / Total time | 99.9%+ | Monthly | CTO |
| M-K11 | Cross-sell Revenue % | Non-primary product revenue / Total | 20% by Y3 | Quarterly | Business Head |
| M-K12 | Geographic Coverage | Cities with active operations | +5 Y1 | Annual | Business Head |
| M-K13 | Compliance Score | Audit pass rate | 100% | Quarterly | CEO |
| M-K14 | Employee Productivity | Disbursements / FTE | +20% YoY | Annual | Sales Head |
| M-K15 | Digital Channel % | Digital leads / Total leads | 40%+ | Monthly | Business Head |

---

# 21. SECURITY & DATA ACCESS

## 21.1 Data Visibility Rules

| Data Category | Customer | Partner | Executive | Manager | Support | Compliance | Admin | Mgmt |
|---------------|----------|---------|-----------|---------|---------|------------|-------|------|
| Customer PII (full) | Own | Lead-scoped | Assigned/branch | Branch/region | Ticket-scoped | All (audited) | All | Masked/none |
| Customer PII (masked) | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Financial details | Own | ✗ | Assigned | Branch | ✗ | ✓ | ✓ | Aggregated |
| Credit assessment | ✗ | ✗ | Summary | Summary | ✗ | ✓ | ✓ | Aggregated |
| Internal notes | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Commission data | ✗ | Own | ✗ | Branch/region | ✗ | ✓ | ✓ | Aggregated |
| Partner KYC | ✗ | Own | ✗ | Branch | ✗ | ✓ | ✓ | ✗ |
| Audit logs | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| System config | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Aggregated analytics | ✗ | Own stats | Own/team | Team/branch/region | ✗ | ✓ | ✓ | ✓ |

## 21.2 Document Access Rules

| Document Type | Customer | DSA | Sales | Credit | Ops | Compliance | Retention |
|---------------|----------|-----|-------|--------|-----|------------|-----------|
| Identity documents | Own RUD | Lead CRU | Assigned CRU | Assigned RU | Assigned R | All RU | 8 years post-closure |
| Income documents | Own RUD | Lead CRU | Assigned CRU | Assigned RU | Assigned R | All RU | 8 years |
| Property documents | Own RUD | Lead CRU | Assigned CRU | Assigned RU | Assigned R | All RU | 8 years |
| Sanction letter | Own R | Lead R | Assigned R | R | RU | RU | 8 years |
| Loan agreement | Own R | ✗ | Assigned R | R | R | RU | 8 years |
| Internal assessment | ✗ | ✗ | Summary | CRU | R | CRU | 8 years |
| Partner KYC | ✗ | Own RU | ✗ | ✗ | ✗ | CRU | Duration + 3 years |
| Compliance reports | ✗ | ✗ | ✗ | ✗ | ✗ | CRUD | 10 years |

*R=Read, C=Create, U=Update, D=Delete*

## 21.3 Customer Privacy Rules

| Rule | Implementation |
|------|----------------|
| Consent before data collection | OTP + explicit consent checkbox per lead/application |
| Purpose limitation | Data used only for stated financial service purpose |
| Data minimization | Collect only required fields per product |
| Right to access | Customer can export own data via app |
| Right to correction | Customer can update profile; audit trail maintained |
| Right to deletion | Deactivation workflow; regulatory retention overrides deletion |
| Third-party sharing | Lender sharing only with explicit consent; logged |
| Marketing consent | Separate opt-in; per-channel control |
| Data breach notification | Within regulatory timeframe; customer notification if PII affected |
| Children's data | Platform 18+ only; age verification at registration |

## 21.4 Audit Requirements

| Action Category | Audit Level | Retention |
|-----------------|-------------|-----------|
| Login/logout | Standard | 2 years |
| Customer PII access | Enhanced (who, what, when, why) | 5 years |
| Document access/download | Enhanced | 5 years |
| Permission changes | Enhanced | 7 years |
| Credit decisions | Enhanced | 8 years |
| Commission calculations | Enhanced | 7 years |
| Configuration changes | Enhanced | 7 years |
| Data export | Enhanced | 7 years |
| Fraud/compliance actions | Enhanced | 10 years |
| Super Admin actions | Maximum | 10 years |

## 21.5 Permission Inheritance

| Hierarchy Level | Inherits From | Scope |
|-----------------|--------------|-------|
| Regional Manager | Branch Manager permissions | Aggregated across all branches in region |
| Branch Manager | Sales Executive permissions | All data within branch |
| Sales Executive | — (base) | Assigned leads/applications only |
| Admin | — (functional) | Platform-wide config; no customer PII by default |
| Super Admin | All | Unrestricted with enhanced audit |
| Compliance | — (functional) | Cross-cutting read/audit; write limited to compliance actions |

**Inheritance Rules:**
- Managers see aggregated + detail within their scope
- Managers cannot act on behalf of subordinates without explicit delegation
- Functional roles (Credit, Ops, Compliance) have cross-branch access within their function
- Partners and customers never inherit any internal permissions

## 21.6 Data Ownership

| Data Entity | Primary Owner | Secondary Access |
|-------------|--------------|------------------|
| Customer profile | Customer (self) | RM (portfolio), Sales (assigned), Compliance |
| Lead | Sales Executive (assigned) | Branch Manager, DSA (source) |
| Application | Operations Executive (processing) | Credit (assessment), Sales (origin) |
| Documents | Customer (consent) | Credit (verify), Ops (process), Compliance (audit) |
| Commission record | DSA Partner (own) | Finance (approve), Branch Manager (dispute) |
| Partner profile | DSA/Referral Partner (self) | Branch Manager, Compliance |
| Audit log | Platform (system) | Compliance, Super Admin |
| Analytics aggregates | Management | All managers (scoped) |

---

# 22. FUTURE EXPANSION

## 22.1 Product-Role Extension Model

KuberOne's role hierarchy is **product-agnostic**. New financial products extend via **Product Permission Modules** layered on existing roles—not new role types.

```
EXISTING ROLE + PRODUCT MODULE = PRODUCT-ENABLED ROLE

Example:
  Sales Executive + Insurance Module = Sales Executive (Loans + Insurance)
  RM + Wealth Module = RM (Full Portfolio)
  DSA + CreditCard Module = DSA (Multi-Product)
```

## 22.2 Product Module Permissions

| Product Module | Roles Enabled | Additional Permissions |
|----------------|--------------|----------------------|
| **Personal Loans** | All (launch) | Base permissions (current document) |
| **Insurance** | Sales, RM, DSA, Customer | Policy comparison, premium calc, renewal tracking |
| **Credit Cards** | Sales, RM, DSA, Customer | Card comparison, eligibility, application |
| **Mutual Funds** | RM, Sales (trained), Customer | Risk profiling, fund comparison, SIP setup |
| **Fixed Deposits** | RM, Sales, DSA, Customer | Rate comparison, FD booking |
| **Gold Loans** | Sales, DSA, Ops, Customer | Gold valuation, pledge documentation |
| **Wealth Management** | RM (certified), Customer | Portfolio view, advisory, rebalancing |
| **Credit Score Monitor** | Customer, RM | Score tracking, improvement tips |

## 22.3 New Roles Required: NONE

Future products do **not** require new role types. Instead:

| Need | Solution |
|------|----------|
| Insurance processing | Existing Credit/Ops executives + Insurance product module |
| MF advisory | Existing RM + MF certification + Wealth module |
| Card operations | Existing Ops executives + Card product module |
| Wealth advisory | Existing RM + Wealth certification (RIA compliance) |
| Gold valuation | Existing Ops + Gold module (or partner API) |

## 22.4 Future Role: Lender / Bank User

| Attribute | Detail |
|-----------|--------|
| **Timeline** | Phase 2 (post core platform) |
| **Type** | External B2B portal user |
| **Access** | Lender-scoped application data only |
| **Permissions** | Read applications, update status, upload queries |
| **Cannot** | Access customer directly, other lender data, commission, partners |
| **Hierarchy** | Outside KuberOne hierarchy; institutional relationship |

## 22.5 Scalability Design Principles

| Principle | Implementation |
|-----------|----------------|
| Role templates | New branches clone standard role set |
| Product toggles | Enable/disable product modules per branch/region |
| Certification gates | Product-specific training before permission activation |
| Commission rule extension | New product = new commission rule set (same engine) |
| Dashboard extension | New product widgets added to existing dashboards |
| KPI extension | New product KPIs added to existing KPI matrix |
| Notification extension | New product events added to notification matrix |
| No hierarchy change | Regional → Branch → Executive remains constant |

## 22.6 Expansion Readiness Checklist

| Product | Role Impact | New Permissions | New Dashboards | New KPIs | Hierarchy Change |
|---------|------------|-----------------|----------------|----------|------------------|
| Personal Loans | None (base) | Base set | Base set | Base set | None |
| Insurance | Module add | +12 permissions | +2 widgets | +8 KPIs | None |
| Credit Cards | Module add | +10 permissions | +2 widgets | +6 KPIs | None |
| Mutual Funds | Module add | +15 permissions | +3 widgets | +10 KPIs | None |
| Fixed Deposits | Module add | +8 permissions | +1 widget | +5 KPIs | None |
| Gold Loans | Module add | +10 permissions | +2 widgets | +6 KPIs | None |
| Wealth Management | Module add | +20 permissions | +4 widgets | +12 KPIs | None |
| Credit Score | Feature add | +5 permissions | +1 widget | +3 KPIs | None |
| Video KYC | Feature add | +3 permissions | +1 widget | +2 KPIs | None |
| eSign | Feature add | +4 permissions | 0 | +2 KPIs | None |
| Lender Portal | New external role | +8 permissions | +1 dashboard | +4 KPIs | Additive only |

---

# APPENDIX A: ROLE QUICK REFERENCE

| Role | Code | Type | Interface | Auth |
|------|------|------|-----------|------|
| Customer | `ROLE_CUSTOMER` | External | Customer App | OTP |
| Referral Partner | `ROLE_REFERRAL_PARTNER` | External | Referral Portal | OTP + KYC |
| DSA Partner | `ROLE_DSA` | External | DSA App | OTP + KYC |
| Sales Executive | `ROLE_SALES_EXEC` | Internal | CRM | SSO + MFA |
| Relationship Manager | `ROLE_RM` | Internal | CRM | SSO + MFA |
| Credit Executive | `ROLE_CREDIT_EXEC` | Internal | CRM | SSO + MFA |
| Operations Executive | `ROLE_OPS_EXEC` | Internal | CRM | SSO + MFA |
| Branch Manager | `ROLE_BRANCH_MGR` | Internal | CRM + Dashboard | SSO + MFA |
| Regional Manager | `ROLE_REGIONAL_MGR` | Internal | CRM + Dashboard | SSO + MFA |
| Support Agent | `ROLE_SUPPORT_L1` | Internal | Support Console | SSO + MFA |
| Support Lead | `ROLE_SUPPORT_L2` | Internal | Support Console | SSO + MFA |
| Support Manager | `ROLE_SUPPORT_MGR` | Internal | Support Console | SSO + MFA |
| Compliance Analyst | `ROLE_COMPLIANCE_ANALYST` | Internal | Compliance Console | SSO + MFA |
| Compliance Manager | `ROLE_COMPLIANCE_MGR` | Internal | Compliance Console | SSO + MFA |
| Fraud Analyst | `ROLE_FRAUD_ANALYST` | Internal | Compliance Console | SSO + MFA |
| Admin | `ROLE_ADMIN` | Internal | Admin Console | SSO + MFA |
| Super Admin | `ROLE_SUPER_ADMIN` | Internal | Admin Console | SSO + MFA + IP |
| CEO | `ROLE_CEO` | Internal | Executive Dashboard | SSO + MFA |
| Director | `ROLE_DIRECTOR` | Internal | Executive Dashboard | SSO + MFA |
| Business Head | `ROLE_BUSINESS_HEAD` | Internal | Executive Dashboard | SSO + MFA |
| Sales Head | `ROLE_SALES_HEAD` | Internal | Executive Dashboard | SSO + MFA |
| Operations Head | `ROLE_OPS_HEAD` | Internal | Executive Dashboard | SSO + MFA |
| Finance Head | `ROLE_FINANCE_HEAD` | Internal | Executive Dashboard | SSO + MFA |
| Lender User (Future) | `ROLE_LENDER_USER` | External | Lender Portal | API + Portal Auth |

---

# APPENDIX B: WORKFLOW-ROLE PARTICIPATION MATRIX

| Workflow Stage | Primary Actor | Supporting Actors | Approver |
|----------------|--------------|-------------------|----------|
| Lead capture | Customer/DSA/Referral | System (auto) | — |
| Lead assignment | System | Branch Manager (override) | — |
| Lead qualification | Sales Executive | AI Copilot | — |
| Application creation | Sales Executive / Customer | — | — |
| Document collection | Sales Executive / Customer / DSA | System (reminders) | — |
| Credit assessment | Credit Executive | AI Document AI | Credit Executive |
| Credit exception | Credit Executive | Branch Manager | Branch Manager / Regional |
| Lender submission | Operations Executive | — | — |
| Sanction processing | Operations Executive | Customer (acceptance) | — |
| Disbursement recording | Operations Executive | System (commission trigger) | — |
| Commission calculation | System | Finance Head (approval) | Finance Head |
| Commission payout | System / Finance | DSA (acknowledge) | Finance Head |
| Customer handoff to RM | System | Sales Executive | — |
| Cross-sell outreach | RM | AI Advisor | — |
| Support ticket resolution | Support Agent | Support Lead (escalation) | Support Lead |
| Complaint resolution | Support Agent | Branch Manager | Branch Manager |
| Fraud investigation | Fraud Analyst | Compliance Manager | Compliance Manager |
| Partner onboarding | DSA/Referral | Branch Manager / Admin | Branch Manager |
| Partner suspension | Compliance / Branch Manager | Management (blacklist) | Management |
| User provisioning | Admin | — | Admin |
| Role/permission change | Super Admin | — | Super Admin |
| Campaign launch | Admin / Marketing | Branch Manager | Business Head |
| Product launch | Admin | Management | Business Head |

---

# APPENDIX C: GLOSSARY

| Term | Definition |
|------|------------|
| **RBAC** | Role-Based Access Control — permissions assigned by role |
| **DSA** | Direct Selling Agent — commission-based loan originator partner |
| **Referral Partner** | Reward-based referrer with limited platform access |
| **LOS** | Loan Origination System |
| **LMS** | Lead Management System |
| **CRM** | Customer Relationship Management |
| **PII** | Personally Identifiable Information |
| **SLA** | Service Level Agreement |
| **TAT** | Turnaround Time |
| **FOIR** | Fixed Obligation to Income Ratio |
| **NPS** | Net Promoter Score |
| **CSAT** | Customer Satisfaction Score |
| **KYC** | Know Your Customer |
| **AML** | Anti-Money Laundering |
| **DPDP** | Digital Personal Data Protection Act (India) |
| **Product Module** | Permission layer enabling role access to specific product |
| **Scope** | Data boundary limiting permission (own, branch, region, all) |

---

# APPENDIX D: DOCUMENT APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO / Managing Director | | | |
| CTO / Technology Head | | | |
| Head of Operations | | | |
| Head of Product | | | |
| Compliance Officer | | | |
| Board Representative | | | |

---

# APPENDIX E: REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | Kuber Finserve Product & Strategy Team | Initial User Types & Roles document |

---

**© 2026 Kuber Finserve. Confidential — For Internal, Engineering, and Investor Use.**

*This document defines the user ecosystem foundation for KuberOne. Subsequent documents (Technical Architecture, API Specification, Database Design, UI/UX Design) will derive permissions, workflows, and access patterns from this BRD.*

*Related: [KUBERONE_VISION_AND_OBJECTIVES.md](./KUBERONE_VISION_AND_OBJECTIVES.md)*
