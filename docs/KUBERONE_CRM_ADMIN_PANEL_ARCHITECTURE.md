# KuberOne
## CRM Admin Panel Architecture Document

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise CRM Admin Panel Architecture (CAP)  
**Classification:** React Ready | Node.js Ready | Developer Ready | Production Ready | Future Scale Ready  
**Version:** 1.0  
**Date:** June 2026  
**Tech Stack:** React.js · TypeScript · Vite · Redux Toolkit · React Query · Material UI · Node.js · Express · MySQL · Prisma  
**Related Documents:**
- [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md)
- [KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md](./KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md)
- [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md)
- [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md)
- [KUBERONE_SCREEN_PLANNING_AND_IA.md](./KUBERONE_SCREEN_PLANNING_AND_IA.md)
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md)
- [KUBERONE_USER_TYPES_AND_ROLES.md](./KUBERONE_USER_TYPES_AND_ROLES.md)
- [KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md](./KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md)
- [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md)
- [KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne CRM — Central Operating System for Kuber Finserve |
| **Scope** | Complete CRM admin panel architecture — LMS, LOS, partners, commissions, AI, analytics, management |
| **Audience** | Frontend Engineers, Backend Engineers, Product, Operations, Management, QA |
| **Status** | Authoritative CRM Master Guide |
| **Out of Scope** | Source code, UI mockups, wireframes, OpenAPI YAML |

---

## Architecture Statistics

| Metric | Count |
|--------|-------|
| **CRM modules** | 14 |
| **Internal roles** | 20 |
| **CRM screens (Phase 1)** | 153 |
| **Management dashboards** | 10 |
| **API domains consumed** | 18 |
| **LOS stages** | 9 (S01–S09) |
| **LMS statuses** | 12 |
| **Document queues** | 4 |
| **Report types** | 24 |
| **Development phases** | 8 |

---

# 30. EXECUTIVE SUMMARY

*CTO-level CRM architecture summary — presented first.*

## Strategic CRM Position

The KuberOne CRM Admin Panel (`apps/admin`) is the **central operating system** for Kuber Finserve — unifying **Lead Management (LMS)**, **Loan Origination (LOS)**, **partner economics**, **document compliance**, **AI-assisted sales**, and **executive intelligence** in a single **role-adaptive web application**. Built on **React + Vite + TypeScript + Material UI**, it consumes the same versioned REST API (`/api/v1`) as mobile apps, with **RBAC-enforced navigation**, **scope-safe data tables**, and **AI Sales Copilot** embedded across sales workflows.

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Single CRM, role-adaptive UI** | One codebase; sidebar + routes adapt per JWT role |
| **Material UI (MUI)** | Enterprise data tables, forms, charts; accessibility built-in |
| **Redux Toolkit + React Query** | Redux for auth/UI/copilot; React Query for server cache |
| **Feature-based modules** | 14 CRM modules map to business domains |
| **Queue-centric operations** | Credit, ops, support work from prioritized queues |
| **Copilot drawer** | Persistent AI sidebar on lead/application screens |
| **Management isolation** | Aggregated dashboards; no raw PII for leadership |
| **Shared monorepo packages** | `shared-api`, `shared-types`, `shared-validation` with backend/mobile |

## CRM Module Landscape

| Category | Modules |
|----------|---------|
| **Sales Pipeline** | Dashboard, Leads (LMS), Customers, Applications (LOS) |
| **Operations** | Documents, Partners, Commissions, Referrals, Campaigns |
| **Intelligence** | AI Advisor (CRM view), AI Sales Copilot, Analytics, Management |
| **Support & Knowledge** | Support, Knowledge Base |
| **Governance** | Settings, Audit & Compliance |

## Development Timeline (Summary)

| Phase | Focus | Duration |
|-------|-------|----------|
| **1** | Scaffold, auth, layout, MUI theme | Weeks 1–3 |
| **2** | Dashboards + lead management (LMS) | Weeks 4–6 |
| **3** | Customers + applications (LOS) | Weeks 7–10 |
| **4** | Documents + partners + commissions | Weeks 11–14 |
| **5** | AI copilot + campaigns + support | Weeks 15–17 |
| **6** | Analytics + management dashboards | Weeks 18–20 |
| **7** | Knowledge base + settings + compliance | Weeks 21–23 |
| **8** | Production hardening + UAT | Weeks 24–26 |

## Production Readiness Criteria

| Gate | Requirement |
|------|-------------|
| **RBAC** | 100% routes guarded; role-specific sidebar |
| **LMS** | Lead queue, assign, qualify, convert operational |
| **LOS** | S01–S09 stage actions with SoD enforcement |
| **Documents** | Verification queue + OCR review + deficiency |
| **Commissions** | Ledger, approval batch, payout workflow |
| **Copilot** | Lead score + NBA on lead/application screens |
| **Management** | CEO dashboard aggregated; no PII export |
| **Performance** | 10K-row tables paginated; p95 < 500ms |

**CTO Recommendation:** Approve this CRM Admin Panel Architecture as the mandatory implementation guide for all KuberOne CRM engineering.

---

# 1. CRM VISION

## 1.1 Business Goals

| # | Goal | Success Metric |
|---|------|----------------|
| 1 | **Unified operations platform** | 100% internal workflows in CRM (no spreadsheets) |
| 2 | **Lead-to-disbursement velocity** | 25% reduction in average TAT |
| 3 | **Partner network scale** | 500+ active DSAs managed via CRM |
| 4 | **Credit quality** | 15% reduction in rejection rate via eligibility + copilot |
| 5 | **Commission transparency** | Zero commission disputes unresolved > 7 days |
| 6 | **Regulatory compliance** | 100% audit trail on PII/document access |
| 7 | **AI-augmented sales** | 60%+ sales executives use copilot daily |
| 8 | **Executive visibility** | Real-time KPI dashboards for leadership |

## 1.2 Operational Goals

| Goal | CRM Enabler |
|------|-------------|
| Single view of customer | Customer 360 with tabs |
| Prioritized work queues | Role-specific dashboard queues |
| SLA enforcement | SLA alerts on leads, tickets, processing |
| Document turnaround | Verification queue with OCR assist |
| Stage-gated LOS | Stage action panel with preconditions |
| Partner onboarding | Partner activation workflow |
| Bulk operations | Bulk assign, bulk verify, bulk export |
| Cross-team handoff | Application tabs per function (credit, ops) |

## 1.3 Automation Goals

| Automation | Trigger | Action |
|------------|---------|--------|
| Lead auto-assignment | Lead created | Round-robin / rules engine |
| SLA escalation | SLA breach | Notify manager; flag in queue |
| Document OCR | Upload confirmed | Queue OCR job; surface in review |
| Deficiency notice | Doc rejected | Auto-notify customer via notification engine |
| Commission calculation | Disbursement recorded | Provisional ledger entry |
| Copilot insights | Lead/application opened | Fetch AI score + NBA |
| Campaign dispatch | Campaign scheduled | Audience builder → channel jobs |
| Report generation | Schedule | Nightly snapshot → PDF export |

## 1.4 Management Goals

| Goal | Dashboard |
|------|-----------|
| Company performance at a glance | CEO Dashboard |
| Regional comparison | Regional Manager Dashboard |
| Branch accountability | Branch Manager Dashboard |
| Revenue tracking | Finance Head Dashboard |
| Pipeline health | Sales Head Dashboard |
| Processing efficiency | Operations Head Dashboard |
| Board reporting | Board Pack export |
| Forecast accuracy | Forecast dashboard (Phase 2) |

## 1.5 Revenue Goals

| Revenue Stream | CRM Module |
|----------------|------------|
| Disbursement commission | Commission Management |
| Processing fees | Application + Analytics |
| Partner network growth | Partner Management |
| Cross-sell conversion | Customer 360 + RM Dashboard |
| Campaign-driven leads | Campaign Management |
| Referral program ROI | Referral Management + Analytics |

---

# 2. CRM OVERVIEW

## 2.1 CRM as Central Operating System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    KUBERONE CRM ADMIN PANEL (apps/admin)                 │
│                         https://admin.kuberone.kuberfinserve.com         │
├─────────────────────────────────────────────────────────────────────────┤
│  SALES CRM          │  OPS CRM           │  PARTNER CRM    │  MGMT CRM   │
│  Leads · Customers  │  Applications ·    │  Partners ·     │  Executive  │
│  Applications       │  Documents ·       │  Commissions ·  │  Dashboards │
│  AI Copilot         │  Credit · Ops      │  Campaigns      │  Reports    │
├─────────────────────────────────────────────────────────────────────────┤
│  ANALYTICS CRM      │  SUPPORT CRM       │  COMPLIANCE     │  ADMIN      │
│  Funnels · Revenue  │  Tickets · SLA     │  Audit · Fraud  │  Settings   │
│  Partner · Branch   │  Escalations       │  KYC Review     │  Users/RBAC │
└─────────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   Customer App          DSA App            External Integrations
   (self-service)        (partner)          (Lenders, KYC, SMS)
```

## 2.2 Sales CRM

| Capability | Users | Core Screens |
|------------|-------|--------------|
| Lead pipeline | Sales Executive, Branch Mgr | Lead list, detail, assign, qualify, convert |
| Customer 360 | Sales, RM | Customer list, profile tabs |
| Application initiation | Sales | Create from lead; wizard assist |
| AI Copilot | Sales, Branch Mgr | Sidebar on lead/application |
| Performance | Sales, Branch Mgr | Targets, leaderboard, SLA |

**Mental model:** "Convert → Collect → Submit"

## 2.3 Operations CRM

| Capability | Users | Core Screens |
|------------|-------|--------------|
| Processing queue | Ops Executive | Application list (ops filter) |
| Document verification | Credit, Ops | Verification queue, OCR review |
| Credit review | Credit Executive | Credit tab, approve/reject |
| Bank login | Ops Executive | Lender tab, submit |
| Disbursement | Ops, Finance | Disbursement tab, record |
| Deficiency management | Ops, Sales | Deficiency form, notices |

**Mental model:** "Verify → Process → Disburse"

## 2.4 Partner CRM

| Capability | Users | Core Screens |
|------------|-------|--------------|
| DSA onboarding | Admin, Compliance | Partner list, activation queue |
| Performance tracking | Branch Mgr, Admin | Partner detail, charts |
| Commission visibility | Finance, Branch Mgr | Ledger, approval, payout |
| Campaign targeting | Admin, Marketing | Audience builder (partner segment) |
| Training compliance | Admin | Certification status |

**Mental model:** "Onboard → Enable → Measure"

## 2.5 Management CRM

| Capability | Users | Core Screens |
|------------|-------|--------------|
| Executive KPIs | CEO, Directors | Management dashboards |
| Regional oversight | Regional Mgr | Branch comparison |
| Financial summary | Finance Head | Revenue, commission, payout |
| Board reporting | CEO, Directors | Board pack export |
| Aggregated analytics | All management | No raw PII; masked data |

**Mental model:** "Monitor → Decide → Scale"

## 2.6 Analytics CRM

| Capability | Users | Core Screens |
|------------|-------|--------------|
| Lead funnel | Sales Head, Branch Mgr | Lead analytics |
| Revenue dashboard | Finance, Management | Revenue analytics |
| Partner analytics | Admin, Branch Mgr | Partner leaderboard |
| Branch comparison | Regional Mgr | Branch analytics |
| AI usage | Admin | AI analytics (Phase 2) |
| Custom reports | Admin, Compliance | Report builder |

**Mental model:** "Measure → Diagnose → Optimize"

---

# 3. CRM INFORMATION ARCHITECTURE

## 3.1 Primary Navigation Hierarchy

```
KUBERONE CRM
│
├── 🏠 Dashboard (role-specific landing)
│
├── 📋 Leads (LMS)
│   ├── Lead Queue / List
│   ├── Lead Detail (360)
│   ├── Lead Analytics
│   └── SLA Alerts
│
├── 👤 Customers
│   ├── Customer List
│   └── Customer 360
│       ├── Personal · KYC · Applications · Documents
│       ├── Interactions · Communications · Referrals
│       └── Cross-sell (RM)
│
├── 📄 Applications (LOS)
│   ├── Application Queues (by stage/role)
│   ├── Application Detail
│   │   ├── Summary · Eligibility · Documents
│   │   ├── Credit · Lender · Sanction · Disbursement
│   │   └── Timeline · Stage Actions
│   └── Bulk Stage Actions (Admin)
│
├── 📁 Documents
│   ├── Verification Queue
│   ├── OCR Review Queue
│   ├── Deficiency Queue
│   └── Document Analytics
│
├── 🤝 Partners
│   ├── Partner List
│   ├── Onboarding Queue
│   └── Partner Detail (performance, commissions)
│
├── 💰 Commissions
│   ├── Commission Ledger
│   ├── Approval Queue
│   ├── Payout Batches
│   └── Disputes / Clawbacks
│
├── 📣 Campaigns
│   ├── Campaign List
│   ├── Campaign Editor
│   └── Campaign Analytics
│
├── 📊 Analytics
│   ├── Analytics Hub
│   ├── Lead Funnel · Revenue · Partner · Branch
│   └── Report Builder
│
├── 🎫 Support
│   ├── Ticket Queue
│   └── Ticket Workspace
│
├── 📚 Knowledge Base
│   ├── Articles · FAQs · SOPs · Scripts
│   └── RAG Index Status
│
├── ⚙️ Settings (Admin)
│   ├── System · Products · Notifications · Security · AI
│   ├── Users · Roles · Branches · Lenders · Workflows
│   └── Feature Flags
│
├── 🛡️ Compliance (Compliance roles)
│   ├── Audit Logs · Fraud Cases · KYC Review
│   └── Compliance Reports
│
└── 📈 Management (Leadership)
    ├── CEO · Director · Business · Sales · Ops · Finance
    └── Board Pack · Forecast
```

## 3.2 Module-to-API Mapping

| CRM Module | API Prefixes | Backend Module |
|------------|--------------|----------------|
| Dashboard | `/crm/dashboard`, `/analytics` | analytics, leads, applications |
| Leads | `/crm/leads` | leads (LMS) |
| Customers | `/crm/customers` | customers |
| Applications | `/crm/applications`, `/credit`, `/ops` | applications, los |
| Documents | `/crm/documents`, `/credit/documents` | documents |
| Partners | `/crm/partners` | partners |
| Commissions | `/crm/commissions`, `/finance` | commissions |
| Referrals | `/crm/referrals` | referrals |
| Campaigns | `/admin/campaigns` | campaigns |
| Analytics | `/analytics` | analytics |
| Support | `/crm/support` | support |
| Knowledge | `/admin/knowledge`, `/knowledge` | knowledge |
| Settings | `/admin/settings`, `/admin/roles` | settings, admin |
| Compliance | `/compliance/audit` | audit, kyc |

## 3.3 Breadcrumb Pattern

| Level | Example |
|-------|---------|
| L1 Module | Leads |
| L2 List/Queue | Lead Queue |
| L3 Entity | Lead #LD-2026-004521 |
| L4 Tab/Action | Timeline |

## 3.4 URL Structure

| Pattern | Example |
|---------|---------|
| Base | `https://admin.kuberone.kuberfinserve.com` |
| Dashboard | `/dashboard` (role redirect) |
| Module list | `/crm/leads` |
| Entity detail | `/crm/leads/{uuid}` |
| Entity tab | `/crm/applications/{uuid}/credit` |
| Management | `/management/ceo` |
| Admin | `/admin/settings` |

---

# 4. CRM ROLE ARCHITECTURE

*Governed by [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md)*

## 4.1 Role Summary Matrix

| Role | Scope | Primary CRM Areas | Dashboard |
|------|-------|-------------------|-----------|
| **Sales Executive** | ASSIGNED | Leads, Customers, Applications (create) | Sales Dashboard |
| **Relationship Manager** | PORTFOLIO | Customers, Cross-sell | RM Dashboard |
| **Credit Executive** | ORGANIZATION (functional) | Applications (credit), Documents (verify) | Credit Dashboard |
| **Operations Executive** | ORGANIZATION (functional) | Applications (ops), Documents, Lender | Ops Dashboard |
| **Branch Manager** | BRANCH | All branch modules | Branch Dashboard |
| **Regional Manager** | REGION | All regional modules + branch compare | Regional Dashboard |
| **Support Executive** | ORGANIZATION (tickets) | Support, Customers (read) | Support Dashboard |
| **Support Manager** | ORGANIZATION | Support + escalation | Support Dashboard |
| **Compliance Executive** | ORGANIZATION | Compliance, Documents, Partners (KYC) | Compliance Dashboard |
| **Compliance Manager** | ORGANIZATION | Compliance + audit + fraud | Compliance Dashboard |
| **Admin** | ORGANIZATION | Settings, Users, Campaigns, Knowledge | Admin Dashboard |
| **Super Admin** | ALL | Everything + RBAC + destructive | Admin Dashboard |
| **CEO** | AGGREGATED | Management dashboards | CEO Dashboard |
| **Director** | AGGREGATED | Management dashboards | Director Dashboard |
| **Business Head** | AGGREGATED | Business dashboard | Business Head Dashboard |
| **Sales Head** | AGGREGATED | Sales analytics, funnel | Sales Head Dashboard |
| **Operations Head** | AGGREGATED | Ops analytics, TAT | Ops Head Dashboard |
| **Finance Head** | AGGREGATED | Commissions, revenue, payouts | Finance Dashboard |

## 4.2 Sales Executive

| Dimension | Definition |
|-----------|------------|
| **Access** | Assigned leads, applications, customers only |
| **Permissions** | `LEAD_*_ASSIGNED`, `APPLICATION_CREATE_ASSIGNED`, `CUSTOMER_READ_ASSIGNED`, `DOCUMENT_UPLOAD_ASSIGNED` |
| **Dashboard** | Priority lead queue, SLA alerts, today's tasks, copilot |
| **Reports** | Personal conversion, pipeline, activity log |
| **Cannot** | Approve credit, disburse, modify commission, see other executives' leads |

## 4.3 Relationship Manager

| Dimension | Definition |
|-----------|------------|
| **Access** | Portfolio customers (200–500) |
| **Permissions** | `CUSTOMER_READ_PORTFOLIO`, `APPLICATION_READ_PORTFOLIO`, cross-sell actions |
| **Dashboard** | Portfolio health, renewal due, cross-sell opportunities |
| **Reports** | Portfolio performance, satisfaction, cross-sell conversion |
| **Cannot** | Create leads (unless dual-role), credit decisions |

## 4.4 Credit Executive

| Dimension | Definition |
|-----------|------------|
| **Access** | Credit processing queue (all branches) |
| **Permissions** | `APPLICATION_READ_ORGANIZATION`, `DOCUMENT_VERIFY_ORGANIZATION`, `CREDIT_RECOMMEND` |
| **Dashboard** | Assessment queue, SLA, document verification backlog |
| **Reports** | Approval rate, TAT, deficiency rates |
| **Cannot** | Final sanction (SoD), disburse, modify application financials |

## 4.5 Operations Executive

| Dimension | Definition |
|-----------|------------|
| **Access** | Ops processing queue (all branches) |
| **Permissions** | `APPLICATION_UPDATE_ORGANIZATION`, `LENDER_SUBMIT`, `DISBURSEMENT_RECORD` |
| **Dashboard** | Processing pipeline, lender TAT, disbursement pending |
| **Reports** | Processing TAT, lender-wise performance |
| **Cannot** | Credit approve/reject (SoD), commission approval |

## 4.6 Branch Manager

| Dimension | Definition |
|-----------|------------|
| **Access** | All records in branch |
| **Permissions** | `*_BRANCH` scope on all sales/ops modules |
| **Dashboard** | Branch funnel, team performance, partner summary, revenue |
| **Reports** | Branch monthly report, team leaderboard, partner activation |
| **Can** | Assign/reassign leads, approve exceptions (limits), partner oversight |

## 4.7 Regional Manager

| Dimension | Definition |
|-----------|------------|
| **Access** | All records in region (multi-branch) |
| **Permissions** | `*_REGION` scope |
| **Dashboard** | Branch comparison, regional KPIs, growth trends |
| **Reports** | Regional performance, branch ranking, forecast |
| **Can** | Override branch assignments, commission dispute > ₹10K |

## 4.8 Support Team

| Dimension | Definition |
|-----------|------------|
| **Access** | All tickets; customer read (masked PII per policy) |
| **Permissions** | `TICKET_*_ORGANIZATION`, `CUSTOMER_READ_MASKED` |
| **Dashboard** | Ticket queue, SLA breaches, CSAT |
| **Reports** | Resolution TAT, category breakdown, agent performance |
| **Cannot** | Export bulk PII without Compliance approval |

## 4.9 Compliance Team

| Dimension | Definition |
|-----------|------------|
| **Access** | Audit logs, fraud cases, partner KYC, document audit |
| **Permissions** | `AUDIT_READ_ORGANIZATION`, `COMPLIANCE_*`, `FRAUD_*` |
| **Dashboard** | Audit queue, fraud alerts, partner compliance |
| **Reports** | Compliance monthly, audit summary, regulatory export |
| **Can** | Fraud hold, partner suspension, PII investigation access |

## 4.10 Admin

| Dimension | Definition |
|-----------|------------|
| **Access** | System configuration, users, campaigns, knowledge |
| **Permissions** | `CONFIGURE_*`, `USER_*`, `CAMPAIGN_*` (not RBAC modify) |
| **Dashboard** | System health, user activity, config changes |
| **Reports** | User audit, system usage |
| **Cannot** | Modify RBAC (Super Admin only), raw PII export |

## 4.11 Super Admin

| Dimension | Definition |
|-----------|------------|
| **Access** | Unrestricted (max 3 accounts) |
| **Permissions** | `ALL` with enhanced audit |
| **Dashboard** | Admin dashboard + security events |
| **Reports** | All reports; security weekly |
| **Constraints** | Dual approval for destructive actions; IP-restricted |

## 4.12 Management (CEO, Directors, Heads)

| Dimension | Definition |
|-----------|------------|
| **Access** | Aggregated dashboards only — **no raw PII** |
| **Permissions** | `ANALYTICS_READ_AGGREGATED`, `REPORT_EXPORT_AGGREGATED` |
| **Dashboards** | Role-specific management dashboard |
| **Reports** | Executive, board pack, forecast |
| **Cannot** | Individual customer/lead detail, document download, operational actions |

## 4.13 Role-Based Sidebar Configuration

| Nav Item | Sales | Credit | Ops | Branch Mgr | Compliance | Admin | Management |
|----------|-------|--------|-----|------------|------------|-------|------------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Leads | ✓ | — | — | ✓ | — | ✓ | — |
| Customers | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Applications | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Documents | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Partners | — | — | — | ✓ | ✓ | ✓ | — |
| Commissions | — | — | — | ✓ | — | ✓ | ✓ (Finance) |
| Campaigns | — | — | — | — | — | ✓ | — |
| Analytics | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Support | ✓ | — | — | ✓ | — | ✓ | — |
| Knowledge | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Compliance | — | — | — | — | ✓ | — | — |
| Management | — | — | — | — | — | — | ✓ |
| Settings | — | — | — | — | — | ✓ | — |

---

# 5. DASHBOARD ARCHITECTURE

## 5.1 Dashboard Routing

| Role | Landing Route | Component |
|------|---------------|-----------|
| Sales Executive | `/dashboard` → `/crm/dashboard/sales` | `SalesDashboard` |
| RM | `/crm/dashboard/rm` | `RmDashboard` |
| Credit Executive | `/crm/dashboard/credit` | `CreditDashboard` |
| Ops Executive | `/crm/dashboard/ops` | `OpsDashboard` |
| Branch Manager | `/branch/dashboard` | `BranchDashboard` |
| Regional Manager | `/regional/dashboard` | `RegionalDashboard` |
| Support | `/support/dashboard` | `SupportDashboard` |
| Compliance | `/compliance/dashboard` | `ComplianceDashboard` |
| Admin | `/admin/dashboard` | `AdminDashboard` |
| Management | `/management/dashboard` | `ExecutiveKpiDashboard` |

## 5.2 Sales Dashboard Widgets

| Widget | Data | Refresh |
|--------|------|---------|
| Priority Lead Queue | Top 10 hot leads by score | 30s |
| SLA Alerts | Breached / at-risk leads | 1 min |
| Today's Tasks | Follow-ups, callbacks due | 5 min |
| Target Progress | MTD vs target (leads, conversions) | 15 min |
| Application Pipeline | Active applications by stage | 1 min |
| AI Copilot Summary | Top 3 NBAs | On load |
| Quick Actions | Create lead, view queue | Static |

## 5.3 Operations Dashboard Widgets

| Widget | Data |
|--------|------|
| Processing Queue | Applications by stage (S03–S08) |
| Document Backlog | Pending verification count |
| Lender Pipeline | Submitted vs sanctioned vs disbursed |
| TAT Metrics | Avg days per stage |
| Disbursement Pending | Awaiting confirmation |
| Deficiency Alerts | Applications with open deficiencies |

## 5.4 Branch Dashboard Widgets

| Widget | Data |
|--------|------|
| Branch Funnel | Lead → App → Sanction → Disbursement |
| Team Leaderboard | Sales executives by conversion |
| Partner Summary | Active DSAs, top performers |
| Revenue MTD | Disbursement volume + commission |
| SLA Compliance | % within SLA |
| Exception Queue | Pending branch manager approvals |

## 5.5 Regional Dashboard Widgets

| Widget | Data |
|--------|------|
| Branch Comparison | Side-by-side KPIs |
| Regional Funnel | Aggregated conversion |
| Growth Trend | MoM disbursement chart |
| Partner Network | Regional partner count + activation |
| Risk Indicators | Rejection rate, deficiency rate |

## 5.6 Management Dashboard Widgets

| Widget | Data | PII |
|--------|------|-----|
| Company KPI Grid | Disbursement, revenue, growth | Aggregated |
| Product Mix Chart | Volume by product family | Aggregated |
| Funnel Overview | Company-wide conversion | Aggregated |
| Partner Count | Active partners trend | Count only |
| Geographic Heatmap | Performance by region | Aggregated |
| NPA Watch | Early indicators (Phase 2) | Aggregated |

## 5.7 Dashboard Technical Pattern

| Concern | Implementation |
|---------|----------------|
| Data fetching | React Query per widget; parallel fetch |
| Layout | MUI Grid v2; responsive 12-column |
| Widget shell | `KpiCard`, `ChartCard`, `QueueCard` components |
| Drill-down | Widget click → filtered list page |
| Date range | Global date picker in dashboard header |
| Export | Per-widget PNG; dashboard PDF (Phase 2) |
| Copilot | `AiCopilotWidget` + drawer toggle in top bar |

---

# 6. LEAD MANAGEMENT MODULE

## 6.1 Module Overview

| Attribute | Value |
|-----------|-------|
| **Path** | `apps/admin/src/features/leads` |
| **API** | `/crm/leads` |
| **Screen IDs** | CRM-LD-01 through CRM-LD-12 |
| **Backend** | LMS module (Section 8 of Backend Blueprint) |

## 6.2 Lead List / Queue

| Feature | Implementation |
|---------|----------------|
| **DataTable** | MUI DataGrid Pro — server-side pagination |
| **Columns** | Code, customer name, phone (masked), product, source, status, score, assignee, SLA, created |
| **Filters** | Status, product, source, assignee, branch, date range, score range |
| **Sort** | Default: score DESC; configurable |
| **Views** | My Leads, Team Leads, Unassigned Queue, SLA Breached |
| **Bulk actions** | Assign, export, reactivate (permission-gated) |
| **Quick filters** | Chips: Hot, Warm, New Today, Expiring |
| **Row click** | Navigate to Lead Detail |

## 6.3 Lead Detail (360)

| Panel | Content |
|-------|---------|
| **Header** | Lead code, status badge, score, assignee, SLA timer |
| **Customer info** | Name, phone, email, source |
| **Product** | Product family + variant |
| **Actions** | Assign, Qualify, Convert, Add Note, Log Call, Reactivate |
| **Tabs** | Overview, Timeline, Activities, Documents, AI Insights |
| **Copilot** | Copilot drawer auto-loads on open |

## 6.4 Lead Timeline

| Event Type | Display |
|------------|---------|
| Status change | From → To with actor |
| Call logged | Duration, outcome, notes |
| Note added | Text + author |
| Assignment | From assignee → To assignee |
| Document requested | Document type |
| SLA warning | Auto-generated |
| Score update | Old → New score |

**Component:** `LeadTimeline` — vertical MUI timeline

## 6.5 Lead Assignment

| Method | UI |
|--------|-----|
| Manual | `LeadAssignmentModal` — select executive |
| Bulk | Multi-select → assign dialog |
| Auto | Admin trigger batch assign |
| Reassign | Branch Manager override with reason |

| Rules displayed | DSA own, round-robin, product specialist, load balance |

## 6.6 Lead Activities

| Activity | Form |
|----------|------|
| Log call | Outcome, duration, notes, next follow-up date |
| Add note | Free text |
| Schedule follow-up | Date/time picker |
| Send document request | Multi-select doc types → triggers notification |
| Log meeting | Date, location, notes |

## 6.7 Lead Scoring

| Panel | Content |
|-------|---------|
| **Score gauge** | 0–100 circular progress |
| **Factor breakdown** | Bar chart per factor with weight |
| **AI score** | Separate AI-enhanced score (Phase 2) |
| **History** | Score changes over time |
| **Label** | Hot / Warm / Moderate / Cold |

## 6.8 Lead Analytics

| Chart | Type |
|-------|------|
| Funnel | Lead → Qualified → Converted |
| Source breakdown | Pie chart |
| Conversion by executive | Bar chart |
| Aging analysis | Histogram by status duration |
| SLA compliance | Gauge |
| Export | CSV, PDF |

## 6.9 Lead Conversion

| Step | UI |
|------|-----|
| 1 | Validate qualified status |
| 2 | `LeadConvertDialog` — confirm customer profile |
| 3 | Create application (select product variant) |
| 4 | Navigate to new application detail |
| 5 | Lead status → CONVERTED (locked) |

---

# 7. LMS ARCHITECTURE

## 7.1 LMS in CRM Context

LMS (Lead Management System) is the **sales pipeline engine** surfaced through the Lead Management module. CRM provides the **operational interface**; backend enforces business rules.

## 7.2 Lead Capture Sources (CRM Visibility)

| Source | CRM Entry Point |
|--------|-----------------|
| Customer App | Auto-created; appears in queue |
| DSA App | Auto-created; DSA-attributed |
| CRM Manual | `Lead Create` form (walk-in) |
| Website | Auto-created; web source tag |
| Campaign | Campaign ID tagged |
| Referral | Referral code attributed |
| Import | Bulk CSV import (Admin Phase 2) |

## 7.3 Lead Routing

| Rule | CRM Display |
|------|-------------|
| DSA own | Badge: "DSA Lead" — locked assignee |
| Round-robin | Auto-assigned; visible in timeline |
| Product specialist | Routed to certified executive |
| Load balancing | Lowest active lead count |
| Manual | "Unassigned" queue for Branch Manager |

**Admin config:** Settings → Workflows → Lead Routing Rules

## 7.4 Lead Qualification

| UI | `LeadQualificationForm` |
|----|-------------------------|
| Criteria checklist | Age, income, location, consent — auto-checked |
| Override | Branch Manager can qualify with reason |
| Disqualify | Reason required; suggest reactivation date |
| Result | Status → QUALIFIED or UNQUALIFIED |

## 7.5 Lead Distribution

| Queue | Audience |
|-------|----------|
| Unassigned | Branch Manager |
| Team pool | All branch sales executives |
| My queue | Assigned executive |
| SLA breached | Manager escalation |

## 7.6 Lead Tracking

| Dimension | CRM Surface |
|-----------|-------------|
| Status | Badge on list + detail |
| Aging | Days in current status column |
| SLA | Countdown timer; red when breached |
| Activities | Activity log tab |
| Engagement | Last contact date |

## 7.7 Lead Conversion (LMS → LOS Handoff)

```
Lead (QUALIFIED) → Convert Action → Application (S01 DRAFT) → LOS takes over
```

| Data transferred | Lead ID, customer ID, product code, activities, source attribution |
|------------------|-------------------------------------------------------------------|

---

# 8. CUSTOMER MANAGEMENT MODULE

## 8.1 Customer List

| Feature | Detail |
|---------|--------|
| **DataGrid** | Server-side pagination; 50 rows default |
| **Columns** | Code, name, phone (masked), email, KYC status, applications count, RM, branch |
| **Search** | Name, phone, code — debounced 300ms |
| **Filters** | KYC status, branch, RM, has active application |
| **Scope** | Auto-filtered by role (assigned/portfolio/branch/region) |
| **PII masking** | Phone masked for roles without full PII permission |
| **Export** | CSV (permission-gated; audit logged) |

## 8.2 Customer 360 Profile

| Tab | Content | Primary User |
|-----|---------|--------------|
| **Personal** | Profile fields; edit (permission-gated) | Sales, Support |
| **KYC** | PAN, Aadhaar status; verification dates | Credit, Compliance |
| **Applications** | All applications with status | Sales, Ops |
| **Documents** | Document vault (metadata + viewer) | Credit, Ops |
| **Interactions** | Notes, calls, meetings | Sales, RM |
| **Communications** | SMS, email, WhatsApp, push log | Support |
| **Referrals** | Referral history as referrer/referee | Sales |
| **Cross-sell** | RM opportunities; product suggestions | RM |

## 8.3 Customer Applications Tab

| Display | Link to application detail |
|---------|---------------------------|
| Columns | Code, product, amount, stage, created, assignee |
| Actions | View, create new (if eligible) |

## 8.4 Customer Documents Tab

| Feature | Detail |
|---------|--------|
| Grouping | By application + standalone KYC |
| Viewer | `DocumentViewer` — inline PDF/image |
| Download | Presigned URL; audit logged |
| Upload on behalf | Sales can upload for customer (permission) |

## 8.5 Customer Communication History

| Channel | Log display |
|---------|-------------|
| SMS | Message, timestamp, status |
| Email | Subject, timestamp, status |
| WhatsApp | Message preview, timestamp |
| Push | Notification title, timestamp |
| In-app | Notification content |

## 8.6 Customer Merge (Admin)

| Screen | `/admin/customers/merge` |
|--------|--------------------------|
| Flow | Select primary + duplicate → preview → merge |
| Audit | Enhanced audit on merge action |

---

# 9. LOS ARCHITECTURE

## 9.1 LOS in CRM Context

LOS (Loan Origination System) manages the **application lifecycle S01–S09**. CRM Applications module is the **primary LOS interface** for internal teams.

## 9.2 LOS Stage Model in CRM

| Stage | Code | CRM Queue | Primary Actor |
|-------|------|-----------|---------------|
| S01 | DRAFT | — (customer-created) | Customer/Sales |
| S02 | SUBMITTED | Submission queue | System |
| S03 | DOCUMENTATION | Documentation queue | Sales |
| S04 | VERIFICATION | Verification queue | Ops |
| S05 | CREDIT_REVIEW | Credit queue | Credit |
| S06 | SANCTIONED | Sanctioned queue | Credit Mgr |
| S07 | BANK_LOGIN | Bank login queue | Ops |
| S08 | DISBURSED | Disbursement queue | Ops/Finance |
| S09 | CLOSED | Archive | System |

## 9.3 Application Creation

| Source | CRM Flow |
|--------|----------|
| Lead conversion | Auto from lead convert dialog |
| Walk-in | Sales creates from customer 360 |
| Customer app | Appears in queue on submission |

## 9.4 Eligibility (LOS Integration)

| CRM Surface | Tab: Eligibility |
|-------------|------------------|
| Pre-submit check | Run eligibility from application |
| Result display | Score, pass/fail, lender matches |
| Block submit | If ineligible — show reasons |

## 9.5 Document Collection (S03)

| CRM Surface | Documents tab + deficiency manager |
|-------------|-----------------------------------|
| Checklist | Required docs per product + stage |
| Status | Uploaded, verified, rejected, missing |
| Actions | Request deficiency notice, upload on behalf |

## 9.6 Bank Login (S07)

| CRM Surface | Lender tab |
|-------------|------------|
| Actions | Record bank login, lender reference |
| Status | Submitted, in-process, query raised |

## 9.7 Credit Review (S05)

| CRM Surface | Credit tab |
|-------------|------------|
| Queue | `/credit/applications/queue` |
| Actions | Recommend approve/reject, request docs, add notes |
| SoD | Credit Executive recommends; Credit Manager sanctions |

## 9.8 Sanction (S06)

| CRM Surface | Sanction tab |
|-------------|--------------|
| Fields | Amount, tenure, rate, conditions, validity |
| Actions | Credit Manager approve (SoD) |
| Output | Sanction letter generated (S3) |

## 9.9 Disbursement (S08)

| CRM Surface | Disbursement tab |
|-------------|------------------|
| Fields | Amount, date, UTR, lender reference |
| Actions | Ops records disbursement |
| Trigger | Commission calculation, referral reward |

## 9.10 Closure (S09)

| Type | CRM Action |
|------|------------|
| Successful | Auto on loan closure event (future) |
| Rejected | Credit reject with reason |
| Withdrawn | Customer/sales withdraw |
| Cancelled | Admin cancel with reason |

---

# 10. APPLICATION MANAGEMENT

## 10.1 Application List / Queues

| Queue View | Filter | Role |
|------------|--------|------|
| All Applications | — | Branch Mgr+ |
| My Applications | assignedTo = me | Sales |
| Credit Queue | stage = S05 | Credit |
| Ops Queue | stage IN (S04, S07, S08) | Ops |
| Documentation | stage = S03 | Sales |
| Sanctioned | stage = S06 | Ops |
| SLA Breached | processing SLA exceeded | Manager |

| DataGrid columns | Code, customer, product, amount, stage, assignee, lender, TAT, updated |

## 10.2 Application Detail

| Layout | Split: header + tab content + copilot drawer |
|--------|-----------------------------------------------|

**Header:** Application code, product, amount, stage badge, customer link, assignees, SLA

**Tabs:**

| Tab | Component | Users |
|-----|-----------|-------|
| Summary | `SummaryTab` | All |
| Eligibility | `EligibilityTab` | Sales, Credit |
| Documents | `DocumentsTab` | Sales, Credit, Ops |
| Credit | `CreditTab` | Credit |
| Lender | `LenderTab` | Ops |
| Sanction | `SanctionTab` | Credit Mgr |
| Disbursement | `DisbursementTab` | Ops, Finance |
| Timeline | `ApplicationTimeline` | All |

## 10.3 Application Timeline

| Event | Source |
|-------|--------|
| Stage transitions | LOS stage manager |
| Document events | Document module |
| Credit notes | Credit module |
| Communications | Notification engine |
| System events | Auto-generated |

**Component:** `ApplicationTimeline` — shared with mobile (read-only on customer app)

## 10.4 Status Tracking

| UI Element | Behavior |
|------------|----------|
| Stage stepper | Horizontal MUI Stepper S01–S09 |
| Current stage | Highlighted #22D3A6 |
| Completed | Checkmark #18C964 |
| Rejected/Withdrawn | Red terminal state |
| TAT badge | Days in current stage |

## 10.5 Activity Tracking

| Activity | Logged via |
|----------|------------|
| Stage action | `StageActionPanel` |
| Notes | Credit/ops note forms |
| Document verify | Document module |
| Assignment change | Application assign modal |
| Lender submission | Lender tab action |

## 10.6 Stage Action Panel

| Action | Preconditions | Actor |
|--------|---------------|-------|
| Advance stage | Current stage rules met | Role per stage |
| Request documents | — | Credit, Ops |
| Reject | Reason required | Credit Manager |
| Withdraw | Before S06 | Sales, Customer |
| Rework | Send back to previous stage | Credit Mgr, Ops Mgr |

---

# 11. DOCUMENT MANAGEMENT

## 11.1 Document Queues

| Queue | Route | Role | Filter |
|-------|-------|------|--------|
| **Verification Queue** | `/credit/documents/queue` | Credit, Ops | status = PENDING |
| **OCR Review Queue** | `/credit/documents/ocr-queue` | Credit | OCR completed, needs review |
| **Deficiency Queue** | `/crm/documents/deficiency-queue` | Sales, Ops | Open deficiencies |
| **Bulk Review** | `/credit/documents/bulk` | Credit Mgr | Multi-select verify |

## 11.2 Verification Workspace

| Panel | Content |
|-------|---------|
| Document viewer | Left: `DocumentViewer` (PDF/image zoom) |
| Metadata | Right: type, application, customer, upload date |
| OCR extracted | Parsed fields with confidence scores |
| Actions | Verify, Reject (reason), Request re-upload |
| Comparison | PAN/Aadhaar vs profile match indicators |

## 11.3 OCR Queue

| Display | OCR extracted JSON alongside document |
|---------|--------------------------------------|
| Auto-match | Green highlight on matching fields |
| Mismatch | Red flag for manual review |
| Actions | Accept OCR, override, reject |

## 11.4 Deficiency Queue

| Feature | Detail |
|---------|--------|
| List | Applications with open deficiencies |
| Action | Send deficiency notice (multi-channel) |
| Track | Customer upload triggers auto-refresh |
| Resolve | Auto-resolve when all docs verified |

## 11.5 Document Vault

| Scope | All documents in organization (scoped by role) |
|-------|-----------------------------------------------|
| Search | By customer, application, type, status |
| Viewer | Full-screen `DocumentViewer` |
| Download | Audit-logged presigned URL |
| Version history | Side-by-side version comparison |
| Package builder | Select docs for lender submission package |

## 11.6 Document Analytics

| Metric | Chart |
|--------|-------|
| Verification TAT | Average hours to verify |
| Deficiency rate | % applications with deficiencies |
| Rejection rate | By document type |
| OCR accuracy | Auto-verify success rate |
| Queue depth | Trend over time |

---

# 12. PARTNER MANAGEMENT

## 12.1 Partner List

| Columns | Code, name, type (DSA/Referral), status, branch, RM, leads MTD, conversion %, tier |
|---------|-----------------------------------------------------------------------------------|
| Filters | Status, type, branch, tier, certification |
| Actions | View, activate, suspend (permission-gated) |

## 12.2 DSA Management

| Lifecycle | CRM Screens |
|-----------|-------------|
| Registration | Onboarding queue |
| KYC review | Partner KYC tab |
| Agreement | Agreement status |
| Activation | `PartnerActivationDialog` |
| Suspension | Status change with reason |
| Termination | Archive + commission settlement flag |

## 12.3 Referral Partner Management

| Difference from DSA | Simplified KYC; no lead pipeline; referral-only metrics |
|----------------------|--------------------------------------------------------|

## 12.4 Partner Detail

| Tab | Content |
|-----|---------|
| Profile | Business info, contact, bank details |
| KYC | Documents, verification status |
| Performance | Leads, conversion, volume charts |
| Commissions | Ledger summary |
| Training | Certification status |
| Agreements | Signed agreements list |

## 12.5 Performance Tracking

| Chart | Data |
|-------|------|
| Lead volume trend | Monthly leads submitted |
| Conversion rate | Converted / total |
| Disbursement volume | ₹ volume trend |
| Ranking | Percentile among partners |
| SLA compliance | % leads contacted in SLA |

## 12.6 Commission Tracking (Partner View)

| Display | Partner's commission ledger (read in CRM) |
|---------|------------------------------------------|
| Summary | Earned, pending, paid MTD |
| Link | Navigate to commission module filtered by partner |

## 12.7 Payout Tracking

| Display | Payout history per partner |
|---------|---------------------------|
| Statement | Download monthly PDF statement |

---

# 13. COMMISSION MANAGEMENT

## 13.1 Commission Rules (Admin)

| UI | `CommissionRuleEditor` |
|----|------------------------|
| Fields | Product, partner tier, amount slab, rate, lender override, effective dates |
| Validation | No overlapping rules for same scope |
| SoD | Finance configures; Ops cannot modify |

## 13.2 Commission Ledger

| DataGrid | Partner, application, disbursement, amount, rate, gross, TDS, net, status |
|----------|---------------------------------------------------------------------------|
| Filters | Status, partner, product, date range, branch |
| Statuses | PROVISIONAL, APPROVED, PAID, CLAWED_BACK |
| Drill-down | Click → commission detail with rule snapshot |

## 13.3 Commission Approval

| Queue | `/finance/commissions/pending` |
|-------|-------------------------------|
| Batch | Select multiple → approve batch |
| SoD | Approver ≠ rule configurator |
| Actions | Approve, reject (with reason), hold |
| Audit | Full approval trail |

## 13.4 Commission Settlement

| Flow | Payout batch builder |
|------|---------------------|
| 1 | Group approved commissions by partner |
| 2 | Calculate net (gross - TDS - clawbacks) |
| 3 | Generate NEFT file |
| 4 | Mark PAID on bank confirmation |
| 5 | Generate partner statements |

## 13.5 Commission Reports

| Report | Audience |
|--------|----------|
| Monthly commission summary | Finance Head |
| Partner-wise payout | Finance, Branch Mgr |
| Product-wise commission | Management |
| TDS report | Finance (statutory) |
| Dispute report | Branch Mgr, Finance |
| Clawback report | Finance, Compliance |

---

# 14. REFERRAL MANAGEMENT

## 14.1 Referral Tracking

| List | Referrer, referee (masked), code, status, dates, reward |
|------|------------------------------------------------------|
| Filters | Status, date range, product |
| Statuses | PENDING, QUALIFIED, CONVERTED, EXPIRED |

## 14.2 Referral Rewards

| Display | Reward amount, status, cooling period |
|---------|--------------------------------------|
| Actions | Approve reward (Finance), cancel (Admin) |
| Trigger | Auto on disbursement + cooling period |

## 14.3 Referral Analytics

| Chart | Data |
|-------|------|
| Conversion funnel | Code applied → converted |
| Top referrers | Leaderboard |
| Reward payout trend | Monthly |
| Channel effectiveness | Share method breakdown |
| ROI | Reward cost vs disbursement value |

---

# 15. CAMPAIGN MANAGEMENT

## 15.1 Campaign Types

| Channel | CRM Editor |
|---------|------------|
| SMS | Template + audience + schedule |
| Email | HTML template + audience + schedule |
| WhatsApp | WA template (approved) + audience |
| Push | Title + body + deep link + audience |

## 15.2 Campaign Editor

| Step | UI Component |
|------|--------------|
| 1 — Basics | Name, channel, product, dates |
| 2 — Audience | `AudienceBuilder` — filters (status, product, branch, inactive days) |
| 3 — Content | Template editor per channel |
| 4 — Schedule | Immediate or scheduled |
| 5 — Review | Preview + audience count + test send |

## 15.3 Audience Builder

| Filter | Options |
|--------|---------|
| Customer segment | Active, dormant, new |
| Product interest | HL, LAP, BL, AL |
| Branch | Multi-select |
| Lead status | For lead campaigns |
| Partner tier | For DSA campaigns |
| Custom | SQL-like rule builder (Phase 2) |

## 15.4 Campaign Analytics

| Metric | Display |
|--------|---------|
| Sent / delivered / failed | Funnel |
| Open rate (email) | % |
| Click rate | % |
| Leads generated | Count |
| Conversion | Count + ₹ value |
| ROI | Revenue vs campaign cost |

---

# 16. AI ADVISOR CRM

## 16.1 CRM Role in AI Advisor

CRM provides **read-only oversight** of customer AI Advisor conversations — not the chat interface itself (that lives in Customer App).

## 16.2 Customer Conversations (CRM View)

| Screen | `/crm/ai/conversations` |
|--------|-------------------------|
| List | Customer, session date, message count, topics, outcome |
| Detail | Full conversation transcript (read-only) |
| Filters | Date, product discussed, escalated to ticket |
| Privacy | PII masked in transcript logs per policy |
| Access | Support, Compliance, Admin |

## 16.3 AI Recommendations (CRM View)

| Display | Recommendations made during sessions |
|---------|-------------------------------------|
| Data | Product suggested, eligibility run, action taken |
| Link | Jump to related application if created |

## 16.4 Eligibility Guidance (CRM View)

| Use | Support/compliance reviews AI eligibility advice |
|-----|------------------------------------------------|
| Audit | Eligibility API calls triggered by AI logged |

## 16.5 Document Guidance (CRM View)

| Use | Review AI document advice given to customers |
|-----|---------------------------------------------|
| Quality | Flag incorrect guidance for KB update |

---

# 17. AI SALES COPILOT

## 17.1 Copilot Architecture in CRM

| Component | Location |
|-----------|----------|
| `CopilotDrawer` | Right-side MUI Drawer — persistent on lead/application screens |
| `copilot.slice` | Redux — open/closed, context entity, insights cache |
| Top bar toggle | Global copilot button |
| `AiCopilotWidget` | Dashboard widget — top 3 NBAs |

## 17.2 Lead Score (Copilot)

| Display | Panel in copilot drawer on lead detail |
|---------|---------------------------------------|
| Data | Rule score + AI score + combined |
| Factors | Expandable factor list with impact |
| Urgency | HIGH/MEDIUM/LOW badge |
| Refresh | On lead data change |

## 17.3 Approval Probability

| Display | On application detail copilot |
|---------|------------------------------|
| Data | 0–100% probability gauge |
| Factors | Risk flags list |
| Confidence | HIGH/MEDIUM/LOW |
| Disclaimer | "Advisory only — not a credit decision" |

## 17.4 Disbursal Probability

| Display | Extends approval prediction with disbursement likelihood |
|---------|--------------------------------------------------------|
| Factors | Lender TAT, document completeness, historical lender rate |

## 17.5 Risk Analysis

| Display | Risk score + categorized flags |
|---------|-------------------------------|
| Categories | Income, document, behavioral, geographic, duplicate, compliance |
| Mitigation | Suggested actions per flag |

## 17.6 Next Best Action (NBA)

| Display | Primary CTA card at top of copilot |
|---------|-----------------------------------|
| Examples | "Call within 1 hour", "Request bank statement via WhatsApp" |
| Action | One-click execute (log call, send doc request, assign) |
| Priority | Sorted by urgency |

## 17.7 Missing Documents

| Display | Checklist diff in copilot |
|---------|--------------------------|
| Action | "Send deficiency notice" one-click |
| Channel | Suggest WhatsApp/SMS based on customer preference |

## 17.8 Copilot API Integration

| Endpoint | When Called |
|----------|-------------|
| GET `/ai/copilot/leads/{id}/insights` | Lead detail open |
| GET `/ai/copilot/applications/{id}/insights` | Application detail open |
| GET `/ai/copilot/leads/{id}/nba` | On demand refresh |
| POST `/ai/copilot/feedback` | User rates copilot suggestion |

## 17.9 Copilot UX Rules

| Rule | Detail |
|------|--------|
| Default state | Closed; opens on toggle or auto on detail pages |
| Width | 380px drawer; resizable (Phase 2) |
| Loading | Skeleton while fetching insights |
| Error | Graceful "Copilot unavailable" — no block on workflow |
| SoD | Copilot cannot auto-approve or auto-disburse |

---

# 18. SUPPORT CRM

## 18.1 Ticket Queue

| View | Filter |
|------|--------|
| My Tickets | assignedTo = me |
| Team Queue | Unassigned + team |
| SLA Breached | Response/resolution SLA exceeded |
| Escalated | Status = ESCALATED |
| By category | Application, technical, account, complaint |

| DataGrid | ID, customer, category, priority, status, assignee, SLA, created |

## 18.2 Ticket Workspace

| Layout | Three-column: list | thread | context |
|--------|----------------------------------------|

| Panel | Content |
|-------|---------|
| Thread | `TicketMessageThread` — messages + reply box |
| Customer context | Customer 360 mini-panel |
| Application context | Linked application summary |
| AI context | AI session link (if escalated from advisor) |
| Actions | Assign, escalate, resolve, close |
| Canned responses | `CannedResponsePicker` — templates |

## 18.3 Complaints

| Handling | Category = COMPLAINT auto-escalates to compliance |
|----------|------------------------------------------------|
| SLA | Critical priority — 1hr response |
| Tracking | Separate complaint report |

## 18.4 Escalation

| Trigger | Action |
|---------|--------|
| SLA breach | Auto-escalate to supervisor |
| Manual | Agent escalates with reason |
| 3+ reopens | Auto-escalate to manager |
| Complaint | Auto-escalate to compliance |

**Component:** `EscalationPanel` — select tier, add notes

## 18.5 SLA Monitoring

| Dashboard widget | Open tickets by SLA status |
|------------------|---------------------------|
| Alerts | Real-time toast on breach |
| Report | SLA compliance % by agent, category |

## 18.6 Resolution Tracking

| Metric | Report |
|--------|--------|
| First response time | Avg by priority |
| Resolution time | Avg by category |
| CSAT | Post-resolution survey score |
| Reopen rate | % tickets reopened |
| Agent performance | Tickets resolved per agent |

---

# 19. KNOWLEDGE BASE

## 19.1 Content Types

| Type | Manager | Consumers |
|------|---------|-----------|
| **Policies** | Admin, Compliance | Credit, Copilot RAG |
| **FAQs** | Admin, Content Mgr | Support, Customer App |
| **SOPs** | Ops Head, Admin | Credit, Ops |
| **Training Materials** | Training Mgr | DSA App, CRM |
| **Sales Scripts** | Sales Head | Sales, Copilot |
| **AI Knowledge Sources** | Admin | RAG pipeline |

## 19.2 CMS Features

| Feature | Component |
|---------|-----------|
| Article editor | `RichTextEditor` (TinyMCE or similar) |
| FAQ manager | `FaqManagerPage` — category + Q&A |
| Version control | Version history per article |
| Publish workflow | Draft → Review → Published |
| Product tagging | Tag articles by product code |
| Search | Full-text search within KB |

## 19.3 RAG Index Status

| Display | `RagIndexStatus` panel in KB admin |
|---------|-----------------------------------|
| Metrics | Total chunks, last indexed, failed chunks |
| Actions | Reindex all, reindex single article, test retrieval |
| Quality | Sample query → retrieved chunks preview |

## 19.4 KB Access in CRM

| Context | Integration |
|---------|-------------|
| Support workspace | Search KB sidebar while replying |
| Copilot | RAG sources power copilot responses |
| Sales | Scripts accessible from lead detail |
| Credit | Policies accessible from credit tab |

---

# 20. ANALYTICS ARCHITECTURE

## 20.1 Analytics Hub

| Screen | `/analytics` — landing with module cards |
|--------|------------------------------------------|
| Cards | Lead, Revenue, Partner, Branch, Document, AI |
| Date range | Global filter applies to all sub-dashboards |
| Export | Per-module export buttons |

## 20.2 Lead Analytics

| Chart | Data |
|-------|------|
| Funnel | New → Contacted → Qualified → Converted → Disbursed |
| Source performance | Conversion by source |
| Executive performance | Conversion by sales executive |
| Aging heatmap | Time in each status |
| SLA compliance | % within SLA trend |
| Product breakdown | Leads by product family |

## 20.3 Revenue Analytics

| Chart | Data |
|-------|------|
| Disbursement volume | ₹ trend daily/monthly |
| Disbursement count | By product, lender, branch |
| Average ticket size | Trend |
| Commission revenue | Monthly |
| Processing fee revenue | Monthly |
| Target vs actual | Gauge per branch/region |

## 20.4 Executive Analytics

| Audience | Management roles |
|----------|-----------------|
| Data | Pre-aggregated snapshots only |
| PII | None — counts and amounts only |
| Drill-down | Region → Branch → Product (no individual records) |

## 20.5 Partner Analytics

| Chart | Data |
|-------|------|
| Leaderboard | Top partners by volume |
| Activation trend | New activations monthly |
| Productivity | Avg leads per partner |
| Churn risk | Inactive partners (Phase 2) |

## 20.6 Branch Analytics

| Chart | Data |
|-------|------|
| Branch comparison | Side-by-side bar charts |
| Funnel by branch | Conversion comparison |
| Team performance | Executive ranking per branch |

## 20.7 AI Analytics (Phase 2)

| Metric | Data |
|--------|------|
| Copilot usage | Sessions per role per day |
| NBA acceptance | % NBAs acted upon |
| Prediction accuracy | Approval prediction vs actual |
| Advisor engagement | Customer sessions per day |
| Token cost | OpenAI spend trend |

---

# 21. MANAGEMENT DASHBOARDS

## 21.1 Dashboard Registry

| Dashboard | Route | Primary User | Key KPIs |
|-----------|-------|--------------|----------|
| **CEO** | `/management/ceo` | CEO | Disbursement, revenue, growth, partners, funnel |
| **Director** | `/management/director` | Directors | Strategic KPIs, product mix, regional |
| **Business Head** | `/management/business` | Business Head | Volume, product performance, market |
| **Sales Head** | `/management/sales` | Sales Head | Pipeline, conversion, team performance |
| **Operations Head** | `/management/ops` | Ops Head | TAT, processing efficiency, lender performance |
| **Finance Head** | `/management/finance` | Finance Head | Revenue, commission, payout, TDS |

## 21.2 CEO Dashboard

| KPI Card | Metric |
|----------|--------|
| Disbursement MTD | ₹ total |
| Disbursement YoY | % growth |
| Active applications | Count in pipeline |
| Active partners | DSA count |
| Conversion rate | Lead → disbursement % |
| Revenue MTD | Commission + fees |
| Product mix | Donut chart |
| Regional performance | Map/table |

## 21.3 Director Dashboard

| Focus | Strategic trends, board-level metrics |
|-------|--------------------------------------|
| Additional | NPA watch, market share proxy, partner growth |

## 21.4 Business Dashboard

| Focus | Product-wise volume, new product adoption, campaign ROI |
|-------|--------------------------------------------------------|

## 21.5 Sales Dashboard (Management)

| Focus | Company-wide pipeline, conversion trends, top branches |
|-------|-------------------------------------------------------|
| Drill-down | Region → Branch (aggregated) |

## 21.6 Operations Dashboard (Management)

| Focus | Processing TAT, lender turnaround, deficiency rates |
|-------|---------------------------------------------------|

## 21.7 Finance Dashboard

| Focus | Commission accrued, approved, paid; payout schedule; TDS |
|-------|--------------------------------------------------------|
| Reports | Monthly financial summary export |

## 21.8 Board Pack

| Screen | `/management/board-pack` |
|--------|--------------------------|
| Content | Auto-generated monthly PDF: KPIs, trends, risks |
| Export | PDF download; email to board (Phase 2) |

## 21.9 Management Layout

| Layout | `ManagementLayout` — simplified sidebar; no operational modules |
|--------|----------------------------------------------------------------|
| Theme | Same MUI theme; emphasis on charts |
| Navigation | Dashboard picker dropdown |

---

# 22. REPORTING FRAMEWORK

## 22.1 Report Categories

| Category | Reports | Audience |
|----------|---------|----------|
| **Operational** | Daily processing, SLA, queue depth | Ops Head, Branch Mgr |
| **Revenue** | Disbursement, commission, fees | Finance, Management |
| **Lead** | Funnel, source, executive performance | Sales Head, Branch Mgr |
| **Partner** | Partner performance, payout, activation | Admin, Branch Mgr |
| **Executive** | Monthly business review, board pack | CEO, Directors |
| **Branch** | Branch monthly report | Branch Mgr, Regional Mgr |

## 22.2 Report Generation

| Method | Detail |
|--------|--------|
| On-demand | User clicks Export → API generates → S3 → download |
| Scheduled | Cron → generate → email to recipients (Phase 2) |
| Format | PDF (primary), CSV (data), Excel (Phase 2) |
| Template | Report templates in `assets/report-templates/` |

## 22.3 Operational Reports

| Report | Frequency | Content |
|--------|-----------|---------|
| Daily Processing Summary | Daily | Applications processed, staged, TAT |
| SLA Compliance | Weekly | Lead + ticket SLA % |
| Document Queue Depth | Daily | Pending verification count |
| Credit Queue Aging | Daily | Applications in S05 > X days |

## 22.4 Revenue Reports

| Report | Frequency | Content |
|--------|-----------|---------|
| Disbursement Report | Monthly | Volume by product, lender, branch |
| Commission Accrual | Monthly | Accrued vs approved vs paid |
| Revenue Summary | Monthly | Total revenue breakdown |
| TDS Report | Quarterly | Statutory TDS summary |

## 22.5 Lead Reports

| Report | Frequency | Content |
|--------|-----------|---------|
| Lead Funnel | Weekly | Stage conversion rates |
| Source Effectiveness | Monthly | Conversion by source |
| Executive Activity | Weekly | Calls, notes, conversions per executive |

## 22.6 Partner Reports

| Report | Frequency | Content |
|--------|-----------|---------|
| Partner Performance | Monthly | Volume, conversion per partner |
| Payout Statement | Monthly | Per-partner commission statement |
| Activation Report | Monthly | New vs churned partners |

## 22.7 Executive Reports

| Report | Frequency | Content |
|--------|-----------|---------|
| Monthly Business Review | Monthly | Company KPIs, trends, commentary |
| Board Pack | Monthly | Board-ready summary |
| Forecast | Quarterly | Projected disbursement + revenue |

## 22.8 Branch Reports

| Report | Frequency | Content |
|--------|-----------|---------|
| Branch Monthly | Monthly | Branch KPIs, team, partners |
| Branch Comparison | Monthly | Regional ranking |

## 22.9 Report Builder (Phase 2)

| Feature | Custom report with drag-drop metrics |
|---------|-------------------------------------|
| Save | Saved reports per user |
| Share | Share report config with team |

---

# 23. SEARCH ARCHITECTURE

## 23.1 Global Search

| UI | Top bar search input (Ctrl+K shortcut) |
|----|----------------------------------------|
| Scope | Leads, customers, applications, partners, documents |
| Results | Grouped by entity type; top 5 per type |
| Keyboard | Arrow navigate; Enter to open |
| Recent | Last 10 searches cached locally |

## 23.2 Entity Search Endpoints

| Entity | API | Fields searched |
|--------|-----|-----------------|
| Lead | GET `/crm/leads/search` | Code, name, phone |
| Customer | GET `/crm/customers/search` | Code, name, phone, email |
| Application | GET `/crm/applications/search` | Code, customer phone |
| Document | GET `/crm/documents/search` | Type, application code |
| Partner | GET `/crm/partners/search` | Code, name, phone |

## 23.3 Search UX Rules

| Rule | Detail |
|------|--------|
| Min chars | 3 characters to trigger |
| Debounce | 300ms |
| Scope | Results filtered by RBAC scope |
| PII | Phone partially masked in results per role |
| No results | Suggest create lead/customer |

---

# 24. NOTIFICATION CENTER

## 24.1 In-App Notification Center

| UI | Top bar bell icon + dropdown panel |
|----|-----------------------------------|
| List | Last 50 notifications |
| Actions | Mark read, mark all read, click to navigate |
| Badge | Unread count |
| Real-time | WebSocket or polling (30s) for new notifications |

## 24.2 Outbound Notification Management (Admin)

| Screen | Settings → Notification Templates |
|--------|----------------------------------|
| Manage | Template CRUD per event + channel |
| Test | Send test notification |
| Logs | Notification delivery log viewer |

## 24.3 Channel Visibility in CRM

| Channel | CRM Surface |
|---------|-------------|
| SMS | Customer communication tab; notification log |
| Email | Customer communication tab; notification log |
| WhatsApp | Customer communication tab; notification log |
| Push | Notification log (mobile-targeted) |
| In-app | CRM notification center |

## 24.4 CRM-Triggered Notifications

| Action | Auto-notification |
|--------|-------------------|
| Lead assigned | Push/email to sales executive |
| SLA breach | Push to manager |
| Document deficiency | SMS/WhatsApp to customer |
| Sanction | Multi-channel to customer + DSA |
| Commission approved | Push to DSA |
| Ticket assigned | Email to support agent |

---

# 25. AUDIT & COMPLIANCE

## 25.1 Audit Logs

| Screen | `/compliance/audit-logs` |
|--------|--------------------------|
| DataGrid | Timestamp, actor, action, resource, resource ID, IP |
| Filters | Actor, action, resource type, date range |
| Detail | Before/after diff view |
| Export | CSV (Compliance permission; enhanced audit) |
| Retention | 10 years (backend) |

## 25.2 Access Logs

| Focus | PII access, document download, login events |
|-------|---------------------------------------------|
| Enhanced audit | Separate flag on sensitive reads |

## 25.3 Approval Logs

| Focus | Credit decisions, commission approvals, partner activations |
|-------|-------------------------------------------------------------|
| SoD | Display approver vs submitter |

## 25.4 Security Events

| Event | Alert |
|-------|-------|
| Failed login burst | Admin dashboard |
| RBAC violation | Compliance dashboard |
| Bulk export | Compliance notification |
| Super Admin action | CEO weekly review |

## 25.5 Compliance Reports

| Report | Content |
|--------|---------|
| Monthly compliance summary | Audit events, fraud cases, KYC pending |
| Regulatory export | Formatted for RBI/DPDP examination |
| Access review | Users with elevated permissions |
| PII access report | Who accessed what PII |

## 25.6 Fraud Case Management

| Screen | `/compliance/fraud` |
|--------|---------------------|
| Workflow | Open → Investigate → Resolve → Close |
| Actions | Fraud hold on customer/partner/application |
| Evidence | Document attachments, notes |

---

# 26. SETTINGS MODULE

## 26.1 Settings Navigation

```
Settings
├── System Settings        — General config, feature flags
├── Product Settings       — Product catalog, eligibility rules
├── Notification Settings  — Templates, channel config
├── Security Settings      — Session timeout, MFA policy, IP allowlist
├── AI Settings            — Model, rate limits, prompt templates
├── User Management        — Users CRUD, role assignment
├── Role Management        — Role-permission matrix (Super Admin)
├── Branch Setup           — Branches, regions hierarchy
├── Lender Management      — Lender catalog, policies
├── Workflow Config        — LOS stages, LMS routing, SLA rules
└── Product Catalog        — Product variants, launch flags
```

## 26.2 System Settings

| Setting | Type |
|---------|------|
| Company name | Text |
| Default branch | Select |
| Session timeout | Minutes |
| Maintenance mode | Toggle |
| Feature flags | Per-feature toggles |

## 26.3 Product Settings

| Setting | Detail |
|---------|--------|
| Product activation | Enable/disable product variants |
| Eligibility rules | Link to rule editor |
| Document checklists | Per product + stage |
| Rate ranges | Display ranges |

## 26.4 Notification Settings

| Setting | Detail |
|---------|--------|
| Channel enablement | SMS, email, WA, push on/off |
| Provider config | API keys (masked); test buttons |
| Template management | Link to template editor |
| Quiet hours default | System-wide default |

## 26.5 Security Settings

| Setting | Detail |
|---------|--------|
| MFA enforcement | Required for employees |
| Password policy | Length, complexity |
| IP allowlist | Super Admin IPs |
| Session limits | Max concurrent sessions |
| Export restrictions | Roles allowed to export |

## 26.6 AI Settings

| Setting | Detail |
|---------|--------|
| Model selection | GPT-4o default |
| Rate limits | Per user/hour |
| Prompt templates | System prompts for advisor/copilot |
| RAG config | Chunk size, top-K, embedding model |
| Cost budget | Monthly token budget alert |

## 26.7 Workflow Configuration

| Config | Editor |
|--------|--------|
| LOS stages | `WorkflowStageEditor` — stage names, owners, TAT |
| LMS routing | Lead assignment rules |
| SLA rules | Per status/stage SLA hours |
| SoD rules | View-only (defined in RBAC doc) |

---

# 27. PERFORMANCE STRATEGY

## 27.1 Large Data Tables

| Technique | Implementation |
|-----------|----------------|
| Server-side pagination | MUI DataGrid server mode — never client-load all |
| Default page size | 50 rows |
| Max page size | 100 rows |
| Virtual scrolling | DataGrid Pro virtualisation |
| Column pinning | Pin code + name columns left |
| Lazy column render | Defer expensive cell renderers |
| Row height | Compact mode (48px) default |

## 27.2 Pagination

| Parameter | Value |
|-----------|-------|
| `page` | 0-indexed (MUI) → 1-indexed (API) conversion in hook |
| `pageSize` | 50 default; user-selectable 25/50/100 |
| `total` | From API meta.total |
| URL sync | Page/filter state in URL query params (shareable) |

## 27.3 Filtering

| Pattern | Implementation |
|---------|----------------|
| Quick filters | Chip bar above table |
| Advanced filters | Collapsible filter panel |
| Date range | MUI DateRangePicker |
| Multi-select | MUI Autocomplete multi |
| Debounce | 300ms on text filters |
| Persist | Filters in URL params + sessionStorage |

## 27.4 Caching

| Data | staleTime | gcTime |
|------|-----------|--------|
| Dashboard widgets | 30s | 5 min |
| List queries | 0 | 5 min |
| Detail queries | 10s | 30 min |
| Settings/config | 5 min | 1 hour |
| Analytics | 15 min | 30 min |
| Copilot insights | 60s | 5 min |

## 27.5 Export Optimization

| Technique | Detail |
|-----------|--------|
| Server-side export | API generates CSV/PDF — not client-side for large sets |
| Async export | > 1000 rows → job queue → download link |
| Progress | MUI LinearProgress during export |
| Audit | All exports logged |

## 27.6 Frontend Performance Targets

| Metric | Target |
|--------|--------|
| Initial load (LCP) | < 2.5s |
| Route transition | < 300ms |
| DataGrid render (50 rows) | < 500ms |
| Dashboard full load | < 3s |
| Copilot drawer open | < 1s |
| Bundle size (gzip) | < 500KB initial |

## 27.7 Code Splitting

| Route | Lazy load |
|-------|-----------|
| Analytics | `React.lazy` per analytics page |
| Management | `React.lazy` per management dashboard |
| Settings | `React.lazy` per settings page |
| Knowledge editor | `React.lazy` (heavy editor) |
| Report builder | `React.lazy` (Phase 2) |

---

# 28. FUTURE EXPANSION

## 28.1 Expansion Principle

New product CRM modules plug into existing **navigation**, **queue patterns**, and **DataGrid** components — no CRM redesign required.

## 28.2 Product CRM Modules

| Product | CRM Module Path | Queue Pattern |
|---------|-----------------|---------------|
| **Insurance** | `features/insurance/` | Policy application queue |
| **Credit Cards** | `features/cards/` | Card application queue |
| **Mutual Funds** | `features/wealth/mf/` | Order queue |
| **FD** | `features/wealth/fd/` | Booking queue |
| **Gold Loan** | `features/gold-loan/` | Valuation + application queue |
| **Wealth CRM** | `features/wealth/` | Portfolio dashboard |

## 28.3 CRM Additions Per Product

| Addition | Insurance Example |
|----------|-------------------|
| Sidebar item | "Insurance" nav entry |
| Product settings | INS-01, INS-02 in product catalog |
| Eligibility rules | Insurance-specific rules |
| Application wizard | Simplified LOS (INS-S01–S06) |
| Document checklist | Insurance-specific docs |
| Commission rules | Insurance commission rates |
| Analytics | Insurance funnel chart |
| Copilot | Insurance-aware NBA |

## 28.4 Feature Expansions (No Redesign)

| Feature | Integration |
|---------|-------------|
| Video KYC review | New tab in document verification |
| eSign status | Document tab status column |
| Lender API portal | Lender tab auto-sync (Phase 3) |
| Account Aggregator | Document auto-fetch indicator |
| Workflow automation | Settings → automation rules (Phase 2) |
| Custom dashboards | User-configurable widgets (Phase 3) |

---

# 29. DEVELOPMENT ROADMAP

## 29.1 Phase Overview

| Phase | Name | Weeks | Exit Criteria |
|-------|------|-------|---------------|
| **1** | Foundation | 1–3 | Auth, layout, MUI theme, routing, RBAC guards |
| **2** | Dashboards + LMS | 4–6 | Role dashboards, lead module complete |
| **3** | Customers + LOS | 7–10 | Customer 360, application module, stage actions |
| **4** | Documents + Partners + Commissions | 11–14 | Queues, partner mgmt, commission workflow |
| **5** | AI + Campaigns + Support | 15–17 | Copilot drawer, campaigns, ticket workspace |
| **6** | Analytics + Management | 18–20 | Analytics hub, management dashboards |
| **7** | Knowledge + Settings + Compliance | 21–23 | KB CMS, settings, audit viewer |
| **8** | Production | 24–26 | UAT, performance, security, go-live |

## 29.2 Phase 1: Foundation (Weeks 1–3)

| Week | Deliverables |
|------|-------------|
| W1 | Vite + React + TS scaffold; MUI theme (Dark Luxury CRM variant); `DashboardLayout` |
| W1 | Redux store (auth, ui, sidebar, copilot); React Query client |
| W2 | Auth pages (login, MFA); `ProtectedRoute`, `RoleGuard` |
| W2 | Sidebar (role-adaptive); top bar (search, notifications, copilot toggle) |
| W3 | `shared-api` integration; token refresh; route config |
| W3 | `DataTable` wrapper (MUI DataGrid); `PageHeader`, `Breadcrumb` |

## 29.3 Phase 2: Dashboards + LMS (Weeks 4–6)

| Week | Deliverables |
|------|-------------|
| W4 | Sales, Credit, Ops dashboards + widgets |
| W4 | Branch, Regional dashboards |
| W5 | Lead list (DataGrid, filters, bulk actions) |
| W5 | Lead detail (360, timeline, activities) |
| W6 | Lead assignment, qualification, conversion |
| W6 | Lead analytics page; SLA alerts |

## 29.4 Phase 3: Customers + LOS (Weeks 7–10)

| Week | Deliverables |
|------|-------------|
| W7 | Customer list + search |
| W7 | Customer 360 (all tabs) |
| W8 | Application list (role-based queues) |
| W8 | Application detail (summary, eligibility, documents tabs) |
| W9 | Credit tab + credit queue; stage action panel |
| W9 | Application timeline; stage stepper |
| W10 | Lender tab, sanction tab, disbursement tab |
| W10 | Ops dashboard integration; LOS S01–S09 complete |

## 29.5 Phase 4: Documents + Partners + Commissions (Weeks 11–14)

| Week | Deliverables |
|------|-------------|
| W11 | Document verification queue + workspace |
| W11 | OCR review queue |
| W12 | Deficiency queue + notice sender |
| W12 | Partner list + detail + onboarding queue |
| W13 | Commission ledger + approval queue |
| W13 | Payout batch builder |
| W14 | Referral management; document analytics |

## 29.6 Phase 5: AI + Campaigns + Support (Weeks 15–17)

| Week | Deliverables |
|------|-------------|
| W15 | Copilot drawer + lead/application insights |
| W15 | NBA panel + missing documents |
| W16 | Campaign list + editor + audience builder |
| W16 | Support ticket queue + workspace |
| W17 | AI conversation viewer (CRM); escalation panel |

## 29.7 Phase 6: Analytics + Management (Weeks 18–20)

| Week | Deliverables |
|------|-------------|
| W18 | Analytics hub; lead funnel; revenue dashboard |
| W18 | Partner + branch analytics |
| W19 | CEO, Director, Business Head dashboards |
| W19 | Sales Head, Ops Head, Finance dashboards |
| W20 | Board pack export; report export framework |

## 29.8 Phase 7: Knowledge + Settings + Compliance (Weeks 21–23)

| Week | Deliverables |
|------|-------------|
| W21 | KB article editor + FAQ manager |
| W21 | RAG index status panel |
| W22 | Settings: system, product, notification, security, AI |
| W22 | User management + role permission matrix |
| W23 | Audit log viewer; fraud case management |
| W23 | Compliance dashboard + reports |

## 29.9 Phase 8: Production (Weeks 24–26)

| Week | Deliverables |
|------|-------------|
| W24 | E2E tests (Playwright) — critical flows per role |
| W24 | RBAC matrix test — all roles × routes |
| W25 | Performance optimization; load test 50 concurrent users |
| W25 | Security review; OWASP scan |
| W26 | UAT with operations team; bug fixes |
| W26 | Production deployment; monitoring; go-live |

---

# APPENDIX A: MUI THEME CONFIGURATION

## CRM Theme (Dark Luxury — Web Variant)

| Token | Value | MUI Mapping |
|-------|-------|-------------|
| Primary | #22D3A6 | `palette.primary.main` |
| Primary dark | #18C964 | `palette.success.main` |
| Background default | #071A1F | `palette.background.default` |
| Background paper | #102B2E | `palette.background.paper` |
| Text primary | #FFFFFF | `palette.text.primary` |
| Text secondary | #C7D2D9 | `palette.text.secondary` |
| Error | #EF4444 | `palette.error.main` |
| Warning | #F59E0B | `palette.warning.main` |
| Info | #3B82F6 | `palette.info.main` |
| Divider | rgba(255,255,255,0.06) | `palette.divider` |
| Font | Inter | `typography.fontFamily` |
| Border radius | 12px | `shape.borderRadius` |
| Mode | dark | `palette.mode` |

## MUI Component Overrides

| Component | Override |
|-----------|----------|
| `MuiButton` | Border radius 12px; no text transform |
| `MuiCard` | Background #102B2E; border 1px rgba(255,255,255,0.06) |
| `MuiDataGrid` | Dark theme; row hover #0A2226 |
| `MuiTextField` | Outlined; focused border #22D3A6 |
| `MuiAppBar` | Background #071A1F; elevation 0 |
| `MuiDrawer` | Sidebar background #071A1F |
| `MuiChip` | Rounded; status color variants |
| `MuiTab` | Selected color #22D3A6 |

---

# APPENDIX B: REDUX + REACT QUERY STRUCTURE

```
store/
├── index.ts
├── slices/
│   ├── auth.slice.ts         # user, roles, permissions, tokens
│   ├── ui.slice.ts           # theme mode, loading overlays
│   ├── sidebar.slice.ts      # collapsed, active module, badges
│   └── copilot.slice.ts      # open, entity context, insights
├── selectors/
│   ├── auth.selectors.ts
│   └── permission.selectors.ts
└── middleware/
    └── logger.middleware.ts  # Dev only

hooks/queries/
├── useLeads.ts               # React Query hooks per module
├── useCustomers.ts
├── useApplications.ts
├── useDocuments.ts
├── usePartners.ts
├── useCommissions.ts
├── useDashboard.ts
└── useAnalytics.ts
```

---

# APPENDIX C: KEY DEPENDENCIES

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI framework |
| `typescript` | Type safety |
| `vite` | Build tool |
| `@mui/material` | UI components |
| `@mui/x-data-grid-pro` | Data tables |
| `@mui/x-date-pickers` | Date filters |
| `@mui/icons-material` | Icons |
| `@emotion/react` + `@emotion/styled` | MUI styling |
| `@reduxjs/toolkit` | State management |
| `react-redux` | Redux bindings |
| `@tanstack/react-query` | Server state |
| `react-router-dom` | Routing |
| `axios` (via shared-api) | HTTP client |
| `formik` + `yup` | Forms |
| `recharts` | Charts |
| `@kuberone/shared-api` | API client |
| `@kuberone/shared-types` | Types |
| `@kuberone/shared-validation` | Validation |
| `date-fns` | Date formatting |

---

# APPENDIX D: ENVIRONMENT VARIABLES

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API base URL |
| `VITE_APP_ENV` | Yes | development, uat, production |
| `VITE_APP_NAME` | Yes | KuberOne CRM |
| `VITE_DEEP_LINK_DOMAIN` | No | For notification links |
| `VITE_SENTRY_DSN` | Phase 2 | Error tracking |
| `VITE_MUI_DATAGRID_LICENSE` | Yes (prod) | DataGrid Pro license key |

---

# APPENDIX E: NAMING CONVENTIONS

| Element | Convention | Example |
|---------|------------|---------|
| Page file | `{Name}Page.tsx` | `LeadListPage.tsx` |
| Feature component | `{Name}.tsx` | `LeadTimeline.tsx` |
| Hook | `use{Name}.ts` | `useLeadActions.ts` |
| API file | `{module}.api.ts` | `leads.api.ts` |
| Redux slice | `{name}.slice.ts` | `copilot.slice.ts` |
| Route path | kebab-case | `/crm/leads` |
| Screen ID | CRM-{MODULE}-{NN} | CRM-LD-01 |

---

# APPENDIX F: DOCUMENT APPROVAL

| Role | Name | Date | Signature |
|------|------|------|-----------|
| CTO | | | |
| CRM Lead | | | |
| Product Owner | | | |
| Operations Head | | | |

---

# APPENDIX G: REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | KuberOne Architecture Team | Initial release |

---

# APPENDIX H: RELATED DOCUMENT INDEX

| Document | Relationship |
|----------|-------------|
| [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md) | API modules CRM consumes |
| [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md) | 128 CRM endpoints |
| [KUBERONE_SCREEN_PLANNING_AND_IA.md](./KUBERONE_SCREEN_PLANNING_AND_IA.md) | 153 CRM screens |
| [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) | Role permissions |
| [KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md](./KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md) | `apps/admin` layout |
| [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md) | Sales Copilot, Management AI, KB admin |
| [KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md) | Admin static deploy, Nginx, CDN |

---

*End of Document — KuberOne CRM Admin Panel Architecture v1.0*

