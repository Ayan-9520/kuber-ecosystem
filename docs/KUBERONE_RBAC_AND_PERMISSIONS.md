# KuberOne
## Role-Based Access Control (RBAC) & Permissions Matrix

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise Security BRD — RBAC & Permissions  
**Classification:** Board-Ready | Compliance-Ready | Investor-Ready | IAM Foundation  
**Version:** 1.0  
**Date:** June 2026  
**Related Documents:**
- [KUBERONE_VISION_AND_OBJECTIVES.md](./KUBERONE_VISION_AND_OBJECTIVES.md)
- [KUBERONE_USER_TYPES_AND_ROLES.md](./KUBERONE_USER_TYPES_AND_ROLES.md)
- [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | RBAC architecture, role catalog, permission matrices, API auth, audit, security controls |
| **Audience** | Board, CTO, Security, Engineering, Compliance, Product, Operations |
| **Purpose** | Foundation for Authentication, Authorization, API Security, Admin, CRM, Mobile Apps, Audit |
| **Status** | Authoritative Security Governance Document |

---

# 27. EXECUTIVE SUMMARY

*Presented first for board-level consumption.*

## Strategic Security Position

KuberOne operates in **regulated financial services**—handling customer PII, KYC documents, credit data, and commission flows across customers, partners, and 20+ internal roles. **Role-Based Access Control (RBAC)** is the **primary security control** ensuring every user accesses only what their role requires—nothing more.

## RBAC Architecture Summary

| Layer | Control |
|-------|---------|
| **Identity** | OTP (customers/partners), SSO+MFA (employees), IP-restricted (Super Admin) |
| **Authorization** | 19 permission types × 25 resource categories × 22 roles |
| **Data Scope** | Own → Assigned → Portfolio → Branch → Region → Organization → Aggregated |
| **Segregation** | Credit cannot disburse; Ops cannot approve credit; Sales cannot see commission config |
| **Audit** | Every PII access, permission change, and approval logged with 5–10 year retention |
| **Compliance** | DPDP, RBI fair practice, KYC/AML gates enforced at permission layer |

## Role Landscape

| Domain | Roles | Access Model |
|--------|-------|--------------|
| External — Customers | 1 | Self-service; own data only |
| External — Partners | 2 (+6 referral sub-types) | Isolated; own leads/commissions |
| Internal — Operations | 8 executive/manager roles | Scoped by assignment/branch/region |
| Internal — Functional | 5 support/compliance roles | Cross-cutting with audit |
| Internal — Platform | 2 (Admin, Super Admin) | Configuration; Super Admin unrestricted |
| Internal — Leadership | 6 management sub-roles | Aggregated analytics; no raw PII |
| External — Future | 1 (Lender User) | Application-scoped; no customer ownership |

## Key Security Decisions

1. **Least Privilege** — Default deny; explicit grant per role per resource
2. **No Permission Inheritance for External Users** — Customers and partners never inherit internal permissions
3. **Management Cannot Access Raw PII** — Aggregated/masked data only unless Compliance-authorized investigation
4. **Super Admin Maximum 3 Accounts** — Enhanced audit; dual-approval for destructive actions
5. **Product Module Extension** — Insurance, cards, MF added via permission modules—not role redesign

## Compliance & Audit Posture

- **100% consent capture** before lead/application creation
- **Enhanced audit** on all document downloads and PII field access
- **Segregation of Duties** — 12 enforced separation rules (see Section 1)
- **Quarterly access review** — Role-permission audit mandated
- **Incident response** — Super Admin kill switch; Compliance fraud hold

## Business Impact

| Benefit | Outcome |
|---------|---------|
| Regulatory readiness | Audit trails satisfy RBI/DPDP examination |
| Partner trust | DSA commission transparency with isolated data |
| Operational safety | Wrong-role actions blocked at API and UI |
| Scale without risk | New products = permission modules; hierarchy unchanged |
| Investor confidence | Enterprise IAM architecture from day one |

**Board Recommendation:** Approve this RBAC framework as mandatory governance for all KuberOne development—no feature ships without permission mapping to this document.

---

# 1. RBAC OVERVIEW

## 1.1 Purpose of RBAC

RBAC in KuberOne serves to:

| # | Purpose |
|---|---------|
| 1 | **Protect customer data** — PII, KYC, financial documents accessible only to authorized roles |
| 2 | **Enforce business rules** — Sales cannot approve credit; Ops cannot modify commission rules |
| 3 | **Enable partner economics** — DSAs see only their leads and commissions |
| 4 | **Support organizational hierarchy** — Branch/region scoping without manual filtering |
| 5 | **Satisfy regulatory requirements** — Audit, consent, segregation for RBI/DPDP compliance |
| 6 | **Scale securely** — New products and roles added without security regression |
| 7 | **Drive API security** — Every API endpoint mapped to role + permission + scope |

## 1.2 Security Principles

| Principle | Definition | KuberOne Implementation |
|-----------|------------|---------------------------|
| **Defense in Depth** | Multiple security layers | Network + Auth + RBAC + Encryption + Audit |
| **Default Deny** | No access unless explicitly granted | All permissions start as DENY |
| **Least Privilege** | Minimum access for job function | Role templates with scoped grants |
| **Separation of Duties** | Critical actions require different roles | 12 SoD rules enforced |
| **Accountability** | Every action attributable to identity | Actor ID on all mutations |
| **Data Minimization** | Show only required data fields | Field-level masking by role |
| **Fail Secure** | Errors deny access | Auth failures → 403, not fallback |
| **Zero Trust** | Verify every request | Token validation per API call |

## 1.3 Least Privilege Model

```
ACCESS GRANT FORMULA:
  Permission = Role × Resource × Action × Scope

Where Scope is the MINIMUM necessary:
  Customer     → OWN only
  DSA          → OWN leads + OWN commissions
  Sales Exec   → ASSIGNED leads/applications
  RM           → PORTFOLIO customers
  Branch Mgr   → BRANCH all records
  Regional Mgr → REGION all records
  Management   → AGGREGATED (no raw PII)
  Compliance   → ORGANIZATION (audited)
  Super Admin  → ALL (enhanced audit)
```

**Privilege Review Cadence:**

| Review Type | Frequency | Owner |
|-------------|-----------|-------|
| Role-permission audit | Quarterly | Compliance + Super Admin |
| User-role assignment audit | Monthly | Admin |
| Dormant account review | Monthly | Admin |
| Super Admin action review | Weekly | CEO/CTO |
| Partner access review | Quarterly | Compliance |

## 1.4 Data Ownership

| Data Entity | Primary Owner | Read Access | Write Access |
|-------------|--------------|-------------|--------------|
| Customer profile | Customer | Self + assigned/portfolio roles | Customer (limited) + Support (prefs) |
| Lead | Assignee (Sales) | Assignee + branch hierarchy | Assignee + Branch Mgr |
| Application | Operations (processing) | Processing chain + branch | Sales (create) + Credit + Ops |
| Documents | Customer (consent) | Role-scoped per matrix | Uploader + Credit (verify) |
| Commission | DSA (own) | DSA + Finance + Branch Mgr | System only (calculated) |
| Partner profile | Partner (self) | Partner + Branch + Compliance | Partner (limited) + Admin |
| Audit logs | Platform | Compliance + Super Admin | System only |
| Lender policies | Platform | All internal (read) | Admin + Super Admin |
| AI configuration | Platform | Admin (read) | Super Admin |

## 1.5 Permission Inheritance

### Internal Hierarchy Inheritance

| Parent Role | Inherits Visibility From | Does NOT Inherit |
|-------------|-------------------------|------------------|
| Branch Manager | Sales, RM, Credit, Ops (branch scope) | Ability to act as subordinate |
| Regional Manager | Branch Manager (region scope) | Branch-level write without approval |
| Sales Head | Regional (aggregated) | Raw PII export |
| Operations Head | Credit + Ops (functional, org-wide) | Commission configuration write |
| CEO | Management dashboards | System configuration |

### Inheritance Rules

| Rule ID | Rule |
|---------|------|
| INH-01 | Managers **see** subordinate data within scope; cannot **impersonate** subordinates |
| INH-02 | Functional roles (Credit, Ops, Compliance) have **cross-branch** access within function only |
| INH-03 | External users (Customer, DSA, Referral, Lender) **never inherit** internal permissions |
| INH-04 | Temporary elevation requires **time-bound grant** with enhanced audit (max 24 hours) |
| INH-05 | Permission denial at child scope **cannot be overridden** by parent visibility |

## 1.6 Segregation of Duties (SoD)

| SoD Rule | Role A (Cannot) | Role B (Must) | Rationale |
|----------|----------------|---------------|-----------|
| SoD-01 | Sales Executive approves credit | Credit Executive | Prevent self-approval |
| SoD-02 | Credit Executive submits to lender | Operations Executive | Processing separation |
| SoD-03 | Operations Executive modifies commission rules | Admin / Finance Head | Financial control |
| SoD-04 | DSA Partner verifies own documents | Credit Executive | Fraud prevention |
| SoD-05 | Support Executive exports bulk PII | Compliance Manager approval | Data protection |
| SoD-06 | Admin creates Super Admin | Super Admin only | Privilege escalation |
| SoD-07 | Branch Manager approves own commission dispute | Regional Manager (>₹10K) | Conflict of interest |
| SoD-08 | Compliance investigates own case | Separate Fraud Analyst | Independence |
| SoD-09 | Sales creates + approves application | Credit/Ops separation | Dual control |
| SoD-10 | Admin modifies RBAC | Super Admin only | Security integrity |
| SoD-11 | Management exports raw customer data | Compliance-authorized only | Privacy |
| SoD-12 | Lender User accesses other lender data | System-enforced isolation | Competitive data |

## 1.7 Compliance Requirements

| Regulation / Standard | RBAC Requirement |
|----------------------|------------------|
| **DPDP Act (India)** | Consent management permissions; data access/deletion rights for customers |
| **RBI Fair Practice Code** | Transparent process; no unauthorized fee/commission modification |
| **KYC/AML** | Partner KYC gates; Compliance fraud hold permissions |
| **IT Act 2000** | Reasonable security practices; access controls documented |
| **ISO 27001 (target)** | Access control policy (A.9); user access management (A.9.2) |
| **PCI-DSS (if payments)** | Restricted card data access (future) |

## 1.8 Audit Requirements

| Event Category | Audit Level | Retention | Reviewer |
|----------------|-------------|-----------|----------|
| Login/logout/failed auth | Standard | 2 years | Admin |
| PII field access | Enhanced | 5 years | Compliance |
| Document view/download | Enhanced | 5 years | Compliance |
| Permission grant/revoke | Enhanced | 7 years | Super Admin |
| Credit decision | Enhanced | 8 years | Compliance |
| Commission calculation/payout | Enhanced | 7 years | Finance |
| Configuration change | Enhanced | 7 years | Super Admin |
| Bulk data export | Enhanced | 7 years | Compliance + CEO |
| Fraud/compliance action | Maximum | 10 years | Board (annual) |
| Super Admin action | Maximum | 10 years | CEO (weekly) |

---

# 2. ROLE CATALOG

## 2.1 Role Classification

| Tier | Type | Roles |
|------|------|-------|
| T0 | Platform Governance | Super Admin |
| T1 | Platform Operations | Admin |
| T2 | Executive Leadership | CEO, Director, Business Head, Sales Head, Operations Head, Finance Head |
| T3 | Regional Leadership | Regional Manager |
| T4 | Branch Leadership | Branch Manager |
| T5 | Operational | Sales Executive, RM, Credit Executive, Ops Executive |
| T5 | Cross-Functional | Support Executive, Support Manager, Compliance Executive, Compliance Manager |
| T6 | External Partner | DSA Partner, Referral Partner |
| T7 | External Customer | Customer |
| T8 | External Institutional (Future) | Lender User |

## 2.2 Complete Role Definitions

### ROLE_CUSTOMER

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Self-service financial product discovery, application, tracking |
| **Responsibilities** | Apply, upload docs, track status, raise tickets, manage consent, refer |
| **Data Access** | Own profile, own applications, own documents, own referrals |
| **Business Scope** | Personal financial journey only |
| **Authority Level** | 0 — No internal or other-customer access |
| **Auth** | Mobile OTP; optional biometric |
| **Interface** | Customer App, Web, WhatsApp (limited) |

### ROLE_DSA

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Originate leads; earn commission on conversions |
| **Responsibilities** | Lead submission, document assist, pipeline tracking, training compliance |
| **Data Access** | Own leads, own commissions, own profile, product catalog (read) |
| **Business Scope** | Attributed branch; own partner network |
| **Authority Level** | 1 — External partner |
| **Auth** | Mobile OTP + KYC verification |
| **Interface** | DSA App |

### ROLE_REFERRAL_PARTNER

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Refer customers for reward; no full pipeline management |
| **Responsibilities** | Referral submission, reward tracking |
| **Data Access** | Own referrals (masked), own rewards, own profile |
| **Business Scope** | Campaign/branch attributed |
| **Authority Level** | 1 — External partner (restricted) |
| **Sub-types** | Builder, Property Dealer, CA, Broker, Channel, Corporate |
| **Auth** | Mobile OTP + business verification |

### ROLE_SALES_EXEC

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Convert leads to disbursed loans |
| **Responsibilities** | Lead contact, qualification, document collection, application creation |
| **Data Access** | Assigned leads/applications/customers; branch leaderboard |
| **Business Scope** | Branch-assigned; territory |
| **Authority Level** | 3 — Operational |
| **Reports to** | Branch Manager |

### ROLE_RM

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Post-disbursement retention and cross-sell |
| **Responsibilities** | Portfolio management, cross-sell, renewal, satisfaction |
| **Data Access** | Portfolio customers; cross-sell pipeline |
| **Business Scope** | Portfolio assignment (200–500 customers) |
| **Authority Level** | 3 — Operational |
| **Reports to** | Branch Manager |

### ROLE_CREDIT_EXEC

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Credit assessment and document verification |
| **Responsibilities** | Eligibility verification, risk assessment, approval recommendation |
| **Data Access** | Processing queue applications; full docs for assessment |
| **Business Scope** | Organization-wide processing queue (functional) |
| **Authority Level** | 4 — Processing (recommend, not final lender approve) |
| **Reports to** | Operations Head |

### ROLE_OPS_EXEC

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Lender submission and disbursement coordination |
| **Responsibilities** | Bank login, status sync, disbursement recording |
| **Data Access** | Processing queue; lender portals; disbursement records |
| **Business Scope** | Organization-wide (functional) |
| **Authority Level** | 4 — Processing |
| **Reports to** | Operations Head |

### ROLE_BRANCH_MGR

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Branch business performance ownership |
| **Responsibilities** | Team management, lead assignment, partner oversight, escalation |
| **Data Access** | All branch records; executive performance; partner data |
| **Business Scope** | Single branch |
| **Authority Level** | 6 — Branch authority; exception approval (limits) |
| **Reports to** | Regional Manager |

### ROLE_REGIONAL_MGR

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Multi-branch regional performance |
| **Responsibilities** | Branch manager coaching, regional targets, expansion |
| **Data Access** | All regional branches; comparative analytics |
| **Business Scope** | 3–15 branches |
| **Authority Level** | 7 — Regional authority |
| **Reports to** | Sales Head |

### ROLE_SUPPORT_EXEC (L1)

| Attribute | Definition |
|-----------|------------|
| **Purpose** | First-line customer and user support |
| **Responsibilities** | Ticket resolution, basic inquiries, complaint logging |
| **Data Access** | Tickets; limited customer status (no PII export) |
| **Business Scope** | Organization-wide support queue |
| **Authority Level** | 3 — Support |
| **Reports to** | Support Manager |

### ROLE_SUPPORT_MGR

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Support team leadership and SLA governance |
| **Responsibilities** | Escalation handling, team performance, process improvement |
| **Data Access** | All tickets; agent performance; complaint register |
| **Business Scope** | Support function |
| **Authority Level** | 5 — Support management |
| **Reports to** | Operations Head |

### ROLE_COMPLIANCE_EXEC

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Day-to-day compliance monitoring and audit execution |
| **Responsibilities** | Document audit, policy checks, access review support |
| **Data Access** | Audit samples; compliance status; document verification |
| **Business Scope** | Organization-wide (compliance function) |
| **Authority Level** | 5 — Compliance (hold/release) |
| **Reports to** | Compliance Manager |

### ROLE_COMPLIANCE_MGR

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Compliance program management and regulatory reporting |
| **Responsibilities** | Policy management, regulatory filings, fraud program oversight |
| **Data Access** | Full compliance dashboard; audit logs; partner compliance |
| **Business Scope** | Organization-wide |
| **Authority Level** | 8 — Compliance authority; partner suspend |
| **Reports to** | CEO / Compliance Officer |

### ROLE_ADMIN

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Platform operations and configuration (non-security) |
| **Responsibilities** | User provisioning, product config, campaigns, knowledge base |
| **Data Access** | Platform config; user management; aggregated operational data |
| **Business Scope** | Platform-wide |
| **Authority Level** | 8 — Platform admin (no RBAC/security) |
| **Reports to** | CTO / Operations Head |

### ROLE_SUPER_ADMIN

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Full system governance and security control |
| **Responsibilities** | RBAC, security, emergency controls, environment management |
| **Data Access** | Unrestricted (enhanced audit) |
| **Business Scope** | Entire platform |
| **Authority Level** | 10 — Maximum (max 3 accounts) |
| **Reports to** | CEO / Board |

### ROLE_CEO

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Strategic governance and board accountability |
| **Data Access** | Executive dashboards; aggregated analytics; compliance summary |
| **Authority Level** | 9 — Strategic approval (commission override, partner blacklist) |
| **Restrictions** | No system config; no raw PII |

### ROLE_DIRECTOR

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Strategic program oversight |
| **Data Access** | Strategic dashboards; initiative analytics |
| **Authority Level** | 8 — Strategic |
| **Restrictions** | No raw PII; no system config |

### ROLE_BUSINESS_HEAD

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Revenue, growth, product portfolio |
| **Data Access** | Revenue, growth, product, customer acquisition analytics |
| **Authority Level** | 8 — Business policy approval |
| **Restrictions** | Aggregated data; no individual employee PII |

### ROLE_SALES_HEAD

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Sales organization and partner network |
| **Data Access** | Sales performance, funnel, partner, regional analytics |
| **Authority Level** | 8 — Target setting; high-value commission override |
| **Restrictions** | No credit decisions; no system config |

### ROLE_OPS_HEAD

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Processing efficiency, compliance, support |
| **Data Access** | TAT, SLA, compliance, support, lender performance |
| **Authority Level** | 8 — Processing policy; SLA configuration propose |
| **Restrictions** | No commission config; no RBAC |

### ROLE_FINANCE_HEAD

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Revenue, commission, payout governance |
| **Data Access** | Commission, payout, P&L, revenue analytics |
| **Authority Level** | 8 — Payout approval; commission rule approval |
| **Restrictions** | No customer PII; no credit decisions |

### ROLE_LENDER_USER (Future)

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Lender portal access for application status updates |
| **Data Access** | Submitted applications only (lender-scoped); no KuberOne customer ownership |
| **Business Scope** | Single lender institution |
| **Authority Level** | 2 — External institutional (read + status update) |
| **Restrictions** | No other lender data; no commission; no partner data |

---

# 3. PERMISSION FRAMEWORK

## 3.1 Permission Categories (19 Types)

| Code | Permission | Description | Typical Roles |
|------|------------|-------------|---------------|
| **C** | Create | Create new records | Sales, DSA, Customer, Admin |
| **R** | Read | View records and fields | All (scoped) |
| **U** | Update | Modify existing records | Role-dependent |
| **D** | Delete | Remove/deactivate records | Admin, Super Admin (limited) |
| **A** | Approve | Approve workflows, exceptions, payouts | Credit, Branch Mgr, Finance, Compliance |
| **AS** | Assign | Assign records to users | Branch Mgr, Regional Mgr, Admin |
| **E** | Export | Export data to file/API | Managers, Compliance, Admin |
| **AU** | Audit | Access audit logs and trails | Compliance, Super Admin |
| **CF** | Configure | Modify system configuration | Admin, Super Admin |
| **M** | Manage | Full CRUD within resource category | Admin, Support Mgr |
| **UP** | Upload | Upload files/documents | Customer, DSA, Sales, Credit |
| **DL** | Download | Download files/documents | Scoped by role |
| **VF** | Verify | Verify document authenticity | Credit, Compliance |
| **RJ** | Reject | Reject applications/leads/docs | Credit, Compliance, Ops |
| **ES** | Escalate | Escalate to higher role | All operational roles |
| **CL** | Close | Close tickets/workflows | Support, Ops, Sales |
| **RO** | Reopen | Reopen closed records | Support Mgr, Branch Mgr, Admin |
| **GR** | Generate Reports | Run and schedule reports | Managers, Compliance, Admin |
| **GA** | Generate Analytics | Access analytics dashboards | Managers, Management |

## 3.2 Permission Grant Notation

```
PERMISSION STRING FORMAT:
  {resource}.{action}:{scope}

Examples:
  leads.read:assigned          → Sales Executive
  applications.update:branch   → Branch Manager
  commissions.read:own         → DSA Partner
  audit_logs.audit:organization → Compliance Manager
  rbac.configure:all           → Super Admin only
```

## 3.3 Scope Hierarchy (Lowest → Highest Access)

| Scope Code | Level | Description |
|------------|-------|-------------|
| `own` | 1 | User's own records only |
| `assigned` | 2 | Records assigned to user |
| `portfolio` | 3 | RM portfolio customers |
| `branch` | 4 | All records in user's branch |
| `region` | 5 | All records in user's region |
| `organization` | 6 | All records (functional roles) |
| `aggregated` | 7 | Summary data; no record-level PII |
| `all` | 8 | Unrestricted (Super Admin + system) |

## 3.4 Field-Level Permission Modifiers

| Modifier | Application |
|----------|-------------|
| `masked` | PII fields partially masked (e.g., mobile: 98XXX3210) |
| `summary` | Internal notes hidden; status only |
| `readonly` | View only; no mutation |
| `redacted` | Sensitive fields removed entirely |

## 3.5 Permission Evaluation Order

```
1. Authenticate identity (valid token/session)
2. Resolve active role(s) for user
3. Check resource.action permission for role
4. Apply scope filter (own/assigned/branch/etc.)
5. Apply field-level modifiers
6. Check SoD rules (deny if violation)
7. Log access (enhanced if PII)
8. Grant or deny (403)
```

---

# 4. RESOURCE CATALOG

## 4.1 Resource Registry

| Resource ID | Resource Name | Sensitivity | Primary Owner Role |
|-------------|---------------|-------------|-------------------|
| RES-01 | Users | High | Admin |
| RES-02 | Customers | Critical | Customer (self) |
| RES-03 | Partners | High | Admin |
| RES-04 | Employees | High | Admin |
| RES-05 | Branches | Medium | Admin |
| RES-06 | Products | Medium | Admin |
| RES-07 | Leads | High | Sales (assignee) |
| RES-08 | Applications | Critical | Ops (processing) |
| RES-09 | Documents | Critical | Customer (consent) |
| RES-10 | KYC | Critical | Compliance |
| RES-11 | Eligibility | High | System / Credit |
| RES-12 | EMI | Medium | Customer / RM |
| RES-13 | Referrals | Medium | Referral Engine |
| RES-14 | Commissions | High | Finance |
| RES-15 | Campaigns | Medium | Admin |
| RES-16 | Tickets | Medium | Support |
| RES-17 | Notifications | Low | System |
| RES-18 | Reports | Medium–High | Role-dependent |
| RES-19 | Analytics | Medium | Management |
| RES-20 | Knowledge Base | Low | Admin |
| RES-21 | Settings | High | Admin / Super Admin |
| RES-22 | Audit Logs | Critical | Compliance |
| RES-23 | Lender Policies | High | Admin |
| RES-24 | AI Configuration | High | Super Admin |
| RES-25 | Disbursements | Critical | Ops / Finance |

## 4.2 Master Resource Permission Matrix (Summary)

**Legend:** ● = Full | ◐ = Scoped | ○ = Read-only/Masked | — = Denied

| Resource | Cust | Ref | DSA | Sales | RM | Credit | Ops | Branch | Regional | Supp-E | Supp-M | Comp-E | Comp-M | Admin | Super | Mgmt |
|----------|------|-----|-----|-------|-----|--------|-----|--------|----------|--------|--------|--------|--------|-------|-------|------|
| Users | — | — | — | — | — | — | — | ○ | ○ | ○ | ○ | ○ | ◐ | ● | ● | — |
| Customers | ◐ | — | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ○ | ◐ | ◐ | ● | ◐ | ● | ○ |
| Partners | — | ◐ | ◐ | ○ | — | — | — | ◐ | ◐ | ○ | ◐ | ◐ | ● | ● | ● | ○ |
| Employees | — | — | — | — | — | — | — | ◐ | ◐ | — | ○ | — | ○ | ● | ● | ○ |
| Branches | — | — | — | — | — | — | — | ◐ | ◐ | — | — | — | ○ | ● | ● | ○ |
| Products | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ● | ● | ○ |
| Leads | ◐ | ◐ | ◐ | ◐ | ○ | ○ | ○ | ● | ● | ○ | ◐ | ◐ | ● | ● | ● | ○ |
| Applications | ◐ | — | ◐ | ◐ | ◐ | ◐ | ◐ | ● | ● | ○ | ◐ | ◐ | ● | ● | ● | ○ |
| Documents | ◐ | — | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ○ | ◐ | ● | ● | ◐ | ● | — |
| KYC | ◐ | ◐ | ◐ | ○ | ○ | ◐ | ○ | ◐ | ◐ | — | ○ | ◐ | ● | ◐ | ● | — |
| Eligibility | ○ | — | — | ○ | ○ | ● | ○ | ○ | ○ | — | — | ○ | ○ | ◐ | ● | ○ |
| EMI | ◐ | — | — | ○ | ◐ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ● | ○ |
| Referrals | ◐ | ◐ | — | — | ○ | — | — | ◐ | ◐ | — | — | ○ | ○ | ◐ | ● | ○ |
| Commissions | — | ◐ | ◐ | — | — | ○ | ◐ | ◐ | ◐ | — | — | ◐ | ● | ● | ● | ○ |
| Campaigns | — | — | — | — | — | — | — | ◐ | ◐ | — | — | — | ○ | ● | ● | ○ |
| Tickets | ◐ | ◐ | ◐ | ◐ | ◐ | ○ | ○ | ◐ | ○ | ● | ● | ◐ | ◐ | ● | ● | — |
| Notifications | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ● | ● | ◐ |
| Reports | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ● | ● | ◐ | ● | ● | ● | ● | ● | ● |
| Analytics | — | — | — | ○ | ○ | ○ | ○ | ◐ | ● | — | ○ | ○ | ◐ | ◐ | ● | ● |
| Knowledge Base | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ● | ● | ○ |
| Settings | — | — | — | — | — | — | — | — | — | — | — | ◐ | ◐ | ● | ● | — |
| Audit Logs | — | — | — | — | — | — | — | — | — | — | — | ◐ | ● | ◐ | ● | — |
| Lender Policies | — | — | — | ○ | — | ○ | ○ | ○ | ○ | — | — | ○ | ○ | ● | ● | ○ |
| AI Configuration | — | — | — | — | — | — | — | — | — | — | — | — | — | ○ | ● | — |
| Disbursements | ◐ | ◐ | ◐ | ◐ | ◐ | ○ | ● | ● | ● | ○ | ◐ | ◐ | ● | ● | ● | ○ |

---

# 5. CUSTOMER PERMISSIONS

## 5.1 Complete Customer Permission Matrix

| Resource | C | R | U | D | A | AS | E | UP | DL | VF | RJ | ES | CL | Notes |
|----------|---|---|---|---|---|----|----|----|----|----|----|----|----|-----|-------|
| **Profile** | ✓ | ✓ | ✓ | ✓* | ✗ | ✗ | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | *Deactivate only |
| **Applications** | ✓ | ✓ | ✓* | ✓* | ✗ | ✗ | ✓* | ✗ | ✓* | ✗ | ✗ | ✗ | ✓* | *Draft/withdraw |
| **Documents** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | Own only |
| **Tickets** | ✓ | ✓ | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | *Add comment |
| **Referrals** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Own referrals |
| **Notifications** | ✗ | ✓ | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | *Preferences |
| **Privacy/Consent** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | GDPR/DPDP |
| **EMI/Loan Servicing** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓* | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | Own loans |
| **Eligibility Check** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | AI Advisor |
| **Products (catalog)** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Read-only |
| **Commissions** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Denied |
| **Other customers** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Strict isolation |

## 5.2 Customer Privacy Controls

| Control | Permission |
|---------|------------|
| Marketing opt-in/out | `notifications.update:own` |
| Data processing consent | `privacy.update:own` |
| Data export request | `profile.export:own` |
| Account deactivation | `profile.delete:own` (soft) |
| Third-party sharing consent | `privacy.update:own` |

## 5.3 Customer Restrictions

- Cannot view internal notes, credit assessments, or lender codes
- Cannot access other customers' data
- Cannot modify post-submission application details (docs only for deficiency)
- Cannot approve, assign, or escalate internal workflows
- Cannot export bulk data
- Cannot access admin, partner, or employee interfaces

---

# 6. DSA PARTNER PERMISSIONS

## 6.1 Complete DSA Permission Matrix

| Resource | C | R | U | D | A | AS | E | UP | DL | VF | Notes |
|----------|---|---|---|---|---|----|----|----|----|----|-------|
| **Leads (own)** | ✓ | ✓ | ✓* | ✗ | ✗ | ✗ | ✓* | ✓ | ✗ | ✗ | *Pre-assignment |
| **Applications (own leads)** | ✗ | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Status only |
| **Documents (own leads)** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓* | ✗ | *Own submissions |
| **Commissions (own)** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | Statements |
| **Payouts (own)** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | |
| **Disputes (own)** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | |
| **Training** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | |
| **Products** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Certified only |
| **Knowledge Base** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | |
| **Leaderboard** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Anonymized |
| **Tickets (own)** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | |
| **Partner profile** | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | |
| **Campaigns** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Active only |

## 6.2 DSA Restrictions

| Restriction | Rationale |
|-------------|-----------|
| Cannot see other DSA leads or commissions | Partner isolation |
| Cannot verify documents (SoD-04) | Fraud prevention |
| Cannot assign leads | Not an internal role |
| Cannot approve credit or disbursement | Processing separation |
| Cannot access customer PII beyond own leads | Data minimization |
| Cannot export branch/organization data | Scope limit |
| Cannot modify commission rules | Financial control |
| Cannot access credit assessments or internal notes | Confidentiality |
| Product submission gated by certification | Compliance |
| Lead submission requires customer OTP consent | Regulatory |

---

# 7. REFERRAL PARTNER PERMISSIONS

## 7.1 Complete Referral Partner Permission Matrix

| Resource | C | R | U | D | A | E | Notes |
|----------|---|---|---|---|---|---|-------|
| **Referrals** | ✓ | ✓ | ✗ | ✗ | ✗ | ✓* | *Own summary |
| **Rewards** | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | Own only |
| **Payouts** | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | |
| **Referral link/QR** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | |
| **Partner profile** | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | |
| **Dashboard** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | Simplified |
| **Tickets** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | |
| **Products** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | Read-only |
| **Documents** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **Denied** |
| **Applications (detail)** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **Denied** |
| **Commissions (DSA)** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **Denied** |

## 7.2 Referral Partner Restrictions

- **No document upload** — Sales collects documents
- **Masked customer data** — First name + masked mobile only
- **Simplified status** — Referred / In Progress / Converted / Closed
- **No pipeline management** — Submit and track only
- **No commission engine access** — Reward tracking only
- **No lead update** after submission
- **No access to internal CRM**

---

# 8. SALES EXECUTIVE PERMISSIONS

## 8.1 Complete Sales Executive Permission Matrix

| Resource | C | R | U | D | A | AS | E | UP | DL | ES | CL | GR |
|----------|---|---|---|---|---|----|----|----|----|----|-----|-----|
| **Leads (assigned)** | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Applications (assigned)** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Documents (assigned)** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Customers (assigned)** | ✗ | ✓ | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| **Call logs** | ✓ | ✓ | ✓ | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Notes** | ✓ | ✓ | ✓ | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Tasks** | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **DSA leads (branch)** | ✗ | ✓ | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| **Credit assessment** | ✗ | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| **Disbursement** | ✗ | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Commissions** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **AI Copilot** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Reports (own)** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |

## 8.2 Sales Executive Restrictions

- Cannot assign/reassign leads (Branch Manager only)
- Cannot approve credit (SoD-01)
- Cannot submit to lender (Ops only)
- Cannot record disbursement
- Cannot view commission data (DSA or platform)
- Cannot access non-assigned leads/customers
- Cannot export branch/organization data
- Cannot modify products, campaigns, or settings
- Cannot access audit logs
- Cannot verify documents (Credit only)

---

# 9. RELATIONSHIP MANAGER PERMISSIONS

## 9.1 Complete RM Permission Matrix

| Resource | C | R | U | D | A | E | UP | ES | GR | GA |
|----------|---|---|---|---|---|---|----|----|-----|-----|
| **Portfolio customers** | ✗ | ✓ | ✓* | ✗ | ✗ | ✓* | ✗ | ✓ | ✓ | ✓ |
| **Cross-sell opportunities** | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| **Communication logs** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| **Applications (referral)** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **Documents** | ✗ | ✓ | ✗ | ✗ | ✗ | ✓* | ✗ | ✗ | ✗ | ✗ |
| **EMI/servicing** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Renewals** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **NPS/surveys** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Credit/ops detail** | ✗ | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| **Commissions** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Non-portfolio customers** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

## 9.2 RM Customer Ownership Rules

| Rule | Permission |
|------|------------|
| Auto-assigned at disbursement | System: `customers.assign:system` |
| Primary contact for portfolio | `customers.read:portfolio` |
| Cannot process new applications end-to-end | Creates → hands to Sales |
| Cross-sell attribution | `cross_sell.create:portfolio` |
| Cannot approve credit or disburse | SoD enforced |

---

# 10. CREDIT EXECUTIVE PERMISSIONS

## 10.1 Complete Credit Executive Permission Matrix

| Resource | C | R | U | A | RJ | VF | UP | E | ES | GR |
|----------|---|---|---|---|----|----|----|---|----|-----|
| **Credit assessments** | ✓ | ✓ | ✓ | ✓* | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Applications (queue)** | ✗ | ✓ | ✓* | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Documents** | ✗ | ✓ | ✓* | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| **Eligibility results** | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ |
| **Risk ratings** | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **KYC verification** | ✗ | ✓ | ✓* | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Fraud referrals** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **Lender submission** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Disbursement** | ✗ | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Commissions** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

*Approve = recommend only; not final lender approval*

## 10.2 Credit Executive Restrictions

- Cannot submit to lender (SoD-02) — Ops Executive only
- Cannot record disbursement
- Cannot assign leads
- Cannot modify commission or partner data
- Cannot access audit logs (read own actions only)
- Cannot configure products or lender policies
- Cannot export organization-wide PII
- High-value exception (>₹50L): escalate to Branch/Regional Manager

---

# 11. OPERATIONS EXECUTIVE PERMISSIONS

## 11.1 Complete Ops Executive Permission Matrix

| Resource | C | R | U | A | RJ | E | ES | CL | GR |
|----------|---|---|---|---|----|---|----|-----|-----|
| **Applications (queue)** | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Lender submissions** | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Disbursements** | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| **Documents (packaging)** | ✗ | ✓ | ✓* | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| **Lender portals** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| **Lender status sync** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Credit assessments** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Commission triggers** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Commissions (read)** | ✗ | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Leads** | ✗ | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

## 11.2 Ops Executive Restrictions

- Cannot create credit assessments (Credit only)
- Cannot approve credit recommendations
- Cannot modify commission rules or amounts
- Cannot assign leads or manage partners
- Cannot access audit logs (except own actions)
- Cannot configure system settings
- Cannot override Compliance hold without Compliance approval

---

# 12. BRANCH MANAGER PERMISSIONS

## 12.1 Complete Branch Manager Permission Matrix

| Resource | C | R | U | D | A | AS | E | ES | RO | GR | GA |
|----------|---|---|---|---|---|----|----|----|-----|-----|-----|
| **Branch leads** | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Branch applications** | ✗ | ✓ | ✓* | ✗ | ✓* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Branch customers** | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| **Branch employees** | ✗ | ✓ | ✓* | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| **DSA partners** | ✓* | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| **Referral partners** | ✓* | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| **Commission disputes** | ✗ | ✓ | ✓ | ✗ | ✓* | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| **Credit exceptions** | ✗ | ✓ | ✗ | ✗ | ✓* | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| **Branch reports** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| **Campaigns (branch)** | ✓* | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| **Settings** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Audit logs** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

*Approval within authority limits (₹25L credit exception; ₹10K commission dispute)*

## 12.2 Branch Manager Authority Limits

| Action | Limit | Above Limit |
|--------|-------|-------------|
| Credit exception approval | ₹25,00,000 | Regional Manager |
| Commission dispute resolution | ₹10,000 | Regional Manager |
| Partner suspension | Recommend only | Compliance + Management |
| Lead reassignment | Unlimited within branch | — |
| Target setting | Propose | Regional Manager approves |

---

# 13. REGIONAL MANAGER PERMISSIONS

## 13.1 Complete Regional Manager Permission Matrix

| Resource | R | U | A | AS | E | GR | GA |
|----------|---|---|---|----|----|-----|-----|
| **Regional branches** | ✓ | ✓* | ✓* | ✓ | ✓ | ✓ | ✓ |
| **Regional leads** | ✓ | ✓* | ✗ | ✓ | ✓ | ✓ | ✓ |
| **Regional applications** | ✓ | ✗ | ✓* | ✗ | ✓ | ✓ | ✓ |
| **Branch managers** | ✓ | ✓* | ✗ | ✗ | ✓ | ✓ | ✓ |
| **DSA partners (region)** | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| **Commission overrides** | ✓ | ✗ | ✓* | ✗ | ✓ | ✓ | ✓ |
| **Regional campaigns** | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Cross-branch assignment** | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| **Settings/RBAC/Audit** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

## 13.2 Regional Manager Restrictions

- Cannot modify system configuration
- Cannot access audit logs
- Cannot create Admin or Super Admin users
- High-value commission override: Finance Head
- Partner blacklist: Management only

---

# 14. SUPPORT TEAM PERMISSIONS

## 14.1 Support Executive (L1) Permissions

| Resource | C | R | U | A | ES | CL | Notes |
|----------|---|---|---|---|----|-----|-------|
| **Tickets** | ✓ | ✓ | ✓ | ✗ | ✓ | ✓* | *Resolve L1 |
| **Customer profile** | ✗ | ✓* | ✓* | ✗ | ✓ | ✗ | Masked; prefs only |
| **Application status** | ✗ | ✓* | ✗ | ✗ | ✓ | ✗ | Status only |
| **Documents** | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | **Denied** |
| **Commissions** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **Denied** |
| **Internal notes** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | Ticket only |
| **Knowledge base** | ✗ | ✓ | ✓* | ✗ | ✗ | ✗ | Suggest edits |

## 14.2 Support Manager Permissions

All L1 permissions plus:

| Resource | C | R | U | A | CL | RO | GR |
|----------|---|---|---|---|----|----|-----|
| **All tickets** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Agent performance** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Complaint register** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Escalation to Branch Mgr** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Bulk PII export** | ✗ | ✗ | ✗ | ✓* | ✗ | ✗ | ✗ |

*Requires Compliance approval (SoD-05)*

---

# 15. COMPLIANCE TEAM PERMISSIONS

## 15.1 Compliance Executive Permissions

| Resource | R | U | A | VF | RJ | AU | ES | GR |
|----------|---|---|---|----|----|----|----|-----|
| **Applications (sample)** | ✓ | ✓* | ✓* | ✓ | ✓ | ✗ | ✓ | ✓ |
| **Documents (audit)** | ✓ | ✓* | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| **Partners (compliance)** | ✓ | ✓* | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| **KYC records** | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| **Fraud cases** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Audit logs** | ✓ | ✗ | ✗ | ✗ | ✗ | ✓* | ✗ | ✓ |
| **Policies** | ✓ | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Users (suspend)** | ✓ | ✓* | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |

## 15.2 Compliance Manager Permissions

All Compliance Executive permissions plus:

| Resource | C | R | U | A | AU | CF | GR |
|----------|---|---|---|---|----|----|-----|
| **Fraud cases** | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Compliance policies** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓* | ✓ |
| **Partner suspension** | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Regulatory reports** | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Full audit logs** | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ |
| **Access review** | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| **RBAC/Settings** | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |

## 15.3 Compliance Investigation Rights

| Action | Compliance Executive | Compliance Manager |
|--------|---------------------|-------------------|
| Place compliance hold on application | ✓ | ✓ |
| Release compliance hold | ✗ | ✓ |
| Suspend partner | ✗ | ✓ |
| Access full document set | ✓ (case-scoped) | ✓ |
| Export audit data | ✗ | ✓ (with CEO notification) |
| Investigate own flagged case | ✗ (SoD-08) | Assign to other analyst |

---

# 16. ADMIN PERMISSIONS

## 16.1 Complete Admin Permission Matrix

| Resource | C | R | U | D | A | AS | E | CF | M | GR |
|----------|---|---|---|---|---|----|----|----|---|-----|
| **Internal users** | ✓ | ✓ | ✓ | ✓* | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| **Partners** | ✓ | ✓ | ✓ | ✓* | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ |
| **Products** | ✓ | ✓ | ✓ | ✓* | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| **Campaigns** | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| **Knowledge base** | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| **Settings (operational)** | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| **Commission rules** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| **Lender policies** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| **Branches** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| **Notifications templates** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| **Audit logs** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| **RBAC roles** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Security settings** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **AI configuration** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Customer PII (bulk)** | ✗ | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

## 16.2 Admin Restrictions

| Restriction | Rationale |
|-------------|-----------|
| Cannot create/modify RBAC roles (SoD-10) | Super Admin only |
| Cannot modify security policies | Super Admin only |
| Cannot create Super Admin accounts | Super Admin only |
| Cannot access raw customer PII at scale | Compliance path only |
| Cannot approve commission payouts | Finance Head |
| Cannot override Compliance hold | Compliance Manager |
| Cannot access production secrets | Super Admin only |
| Commission rule changes require Finance approval | Financial control |

---

# 17. SUPER ADMIN PERMISSIONS

## 17.1 Full Access Matrix

**Super Admin is granted ALL permissions on ALL resources at scope `all`**, subject to:

- Enhanced audit logging (every action)
- Dual-approval for destructive operations (configurable)
- IP restriction enforcement
- Session timeout 15 minutes
- Maximum 3 accounts platform-wide

## 17.2 Super Admin Exclusive Permissions

| Permission | Resource | Description |
|------------|----------|-------------|
| `rbac.configure:all` | RBAC | Create/modify roles and permissions |
| `security.configure:all` | Security | MFA, password, session, IP policies |
| `secrets.manage:all` | Secrets | API keys, integration credentials |
| `environment.manage:all` | Environments | Dev/staging/prod configuration |
| `super_admin.create:all` | Users | Create Super Admin (dual-approval) |
| `platform.kill_switch:all` | Platform | Emergency shutdown |
| `bulk_export.authorize:all` | Data | Authorize bulk PII export |
| `ai.configure:all` | AI | AI model and prompt configuration |
| `maintenance.activate:all` | Platform | Maintenance mode |
| `audit_logs.export:all` | Audit | Full audit export |

## 17.3 Emergency Access Protocol

| Scenario | Super Admin Action | Notification |
|----------|-------------------|--------------|
| Security breach | Kill switch, mass session invalidation | CEO, Board |
| Data breach | Export audit, isolate systems | CEO, Compliance, Regulatory |
| System compromise | Maintenance mode, credential rotation | All Admin users |
| Regulatory request | Bulk data export (authorized) | CEO, Compliance |
| Critical bug | Feature flag disable | Operations Head |

## 17.4 Super Admin Restrictions (Self-Imposed Governance)

- Cannot be combined with operational roles (Sales, Credit, etc.)
- Cannot process customer applications
- Cannot earn commission or partner rewards
- All actions reviewed weekly by CEO/CTO
- Dual-approval required for: role deletion, bulk export, kill switch

---

# 18. MANAGEMENT PERMISSIONS

## 18.1 Management Sub-Role Permission Matrix

| Resource / Action | CEO | Director | Business Head | Sales Head | Ops Head | Finance Head |
|-------------------|-----|----------|---------------|------------|----------|--------------|
| **Executive dashboards** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Revenue analytics** | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Disbursement analytics** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Funnel/conversion** | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| **Regional performance** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Partner analytics** | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Customer analytics (agg)** | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Operations TAT** | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **Compliance dashboard** | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| **Support metrics** | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **Commission/payout** | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ |
| **AI utilization** | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| **Forecast/scenario** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Board report pack** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Strategic targets** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Commission override (high)** | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Partner blacklist** | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| **Policy approval** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Budget allocation** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Raw customer PII** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **System configuration** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **RBAC management** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Audit logs** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Individual employee PII** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Export raw data** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

## 18.2 Management Dashboard Access

| Dashboard | CEO | Director | Biz Head | Sales Head | Ops Head | Finance Head |
|-----------|-----|----------|----------|------------|----------|--------------|
| D-14 Executive KPI | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| D-15 Revenue & Finance | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| D-16 Sales Performance | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| D-17 Operations TAT | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| D-18 Partner Network | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| D-19 AI Utilization | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| D-20 Lender Performance | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |
| D-11 Compliance | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |

## 18.3 Management Reporting Rights

| Report Category | Export | Schedule | Drill-Down |
|-----------------|--------|----------|------------|
| Board Report Pack | ✓ | ✓ | Summary only |
| Revenue Forecast | ✓ | ✓ | Region/product |
| Market Expansion | ✓ | ✓ | Region |
| Operational Efficiency | ✓ | ✓ | Branch (aggregated) |
| Compliance Summary | ✓ | ✓ | Category |
| AI ROI | ✓ | ✓ | Module |
| Individual performance | ✓ | ✗ | Aggregated metrics only |

---

# 19. DATA VISIBILITY MATRIX

## 19.1 Visibility Scope by Role

| Visibility Level | Roles | Data Shown | PII Treatment |
|------------------|-------|------------|---------------|
| **Own Records** | Customer, DSA, Referral | Self data only | Full (own) |
| **Assigned Records** | Sales Executive | Assigned leads/apps | Full PII |
| **Portfolio Records** | RM | Portfolio customers | Full PII |
| **Branch Records** | Branch Manager, branch-scoped roles | All branch data | Full PII |
| **Regional Records** | Regional Manager | All region data | Full PII |
| **Organization Records** | Credit, Ops, Compliance, Support | Function-scoped all branches | Full PII (audited) |
| **Aggregated Reports** | Management | Summary metrics | No record PII |
| **Masked Data** | Referral Partner, Support L1 | Partial records | Masked mobile/name |
| **Unmasked Data** | Credit, Compliance, Ops (processing) | Full for job function | Full (audit logged) |

## 19.2 Field Visibility Matrix

| Field | Cust | DSA | Ref | Sales | RM | Credit | Ops | Branch | Support-L1 | Mgmt |
|-------|------|-----|-----|-------|-----|--------|-----|--------|------------|------|
| Full name | Own | Lead | Mask | ✓ | ✓ | ✓ | ✓ | ✓ | Mask | ✗ |
| Mobile | Own | Lead | Mask | ✓ | ✓ | ✓ | ✓ | ✓ | Mask | ✗ |
| Email | Own | Lead | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | Mask | ✗ |
| PAN | Own | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Aadhaar | Own | ✗ | ✗ | Mask | Mask | ✓ | Mask | Mask | ✗ | ✗ |
| Income | Own | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| CIBIL score | Own | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | Agg |
| Bank account | Own | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Internal notes | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Commission amount | ✗ | Own | Own | ✗ | ✗ | ✗ | ✓* | ✓ | ✗ | Agg |
| Credit assessment | ✗ | ✗ | ✗ | Sum | Sum | ✓ | ✓* | ✓ | ✗ | ✗ |
| Lender internal codes | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ |

## 19.3 Data Isolation Rules

| Rule ID | Rule |
|---------|------|
| DV-01 | Customer A cannot access Customer B data under any circumstance |
| DV-02 | DSA A cannot access DSA B leads or commissions |
| DV-03 | Branch A manager cannot access Branch B records (unless Regional+) |
| DV-04 | Management views are aggregated — minimum cohort size 5 for display |
| DV-05 | Support L1 sees masked PII only; full PII requires Support Manager + reason |
| DV-06 | Lender User sees only applications submitted to their institution |
| DV-07 | All unmasked PII access logged with enhanced audit |
| DV-08 | Aadhaar stored masked; full visible only to Credit/Compliance (job function) |

---

# 20. DOCUMENT ACCESS MATRIX

## 20.1 Document Type Permissions

| Document | Cust | DSA | Sales | RM | Credit | Ops | Branch | Compliance | Admin | Mgmt |
|----------|------|-----|-------|-----|--------|-----|--------|------------|-------|------|
| **PAN** | RUD* | CRU | CRU | R | RU | R | R | RU | R | ✗ |
| **Aadhaar** | RUD* | CRU | R(m) | R(m) | RU | R(m) | R(m) | RU | R | ✗ |
| **Photo** | RU | CRU | CRU | R | RU | R | R | RU | R | ✗ |
| **Address proof** | RU | CRU | CRU | R | RU | R | R | RU | R | ✗ |
| **Salary slip** | RU | CRU | CRU | R | RU | R | R | RU | R | ✗ |
| **Form 16** | RU | CRU | CRU | R | RU | R | R | RU | R | ✗ |
| **ITR** | RU | CRU | CRU | R | RU | R | R | RU | R | ✗ |
| **Bank statement** | RUD* | CRU | CRU | R | RU | R | R | RU | R | ✗ |
| **GST certificate** | RU | CRU | CRU | R | RU | R | R | RU | R | ✗ |
| **GST returns** | RU | CRU | CRU | R | RU | R | R | RU | R | ✗ |
| **Business financials** | RU | CRU | CRU | R | RU | R | R | RU | R | ✗ |
| **Property deed** | RU | CRU | CRU | R | RU | R | R | RU | R | ✗ |
| **EC/title docs** | RU | CRU | CRU | R | RU | R | R | RU | R | ✗ |
| **Vehicle invoice** | RU | CRU | CRU | R | RU | R | R | RU | R | ✗ |
| **RC book** | RU | CRU | CRU | R | RU | R | R | RU | R | ✗ |
| **Sanction letter** | R | R | R | R | RU | RU | R | RU | R | ✗ |
| **Loan agreement** | R | ✗ | R | R | R | RU | R | RU | R | ✗ |
| **KYC verification record** | R | R | ✗ | ✗ | RU | ✗ | R | RU | R | ✗ |
| **Internal assessment** | ✗ | ✗ | Sum | Sum | CRU | R | R | CRU | R | ✗ |

*R=Read, C=Create/Upload, U=Update, D=Download, (m)=Masked, Sum=Summary only, *=own records*

## 20.2 Document Action Rules

| Action | Rule |
|--------|------|
| **Upload** | Customer (own), DSA (own leads), Sales (assigned) |
| **Re-upload** | Same as upload; previous version archived |
| **Verify** | Credit Executive, Compliance only |
| **Reject** | Credit (deficiency), Compliance (fraud) |
| **Download** | Role-scoped; every download audit-logged |
| **Delete** | Soft-delete only; Compliance retention policy applies |
| **Export bulk** | Compliance Manager + Super Admin only |
| **Share externally** | Ops (to lender, encrypted); no other external share |

## 20.3 Document Retention Permissions

| Action | Authorized Role |
|--------|----------------|
| View archived documents | Compliance, Super Admin |
| Purge per retention policy | Super Admin (automated system job) |
| Legal hold (block purge) | Compliance Manager |

---

# 21. API AUTHORIZATION MODEL

## 21.1 API Access Tiers

| Tier | Code | Authentication | Authorization |
|------|------|----------------|---------------|
| **Public** | T0 | None | Rate-limited; no PII |
| **Authenticated** | T1 | Valid token (any role) | Role check |
| **Role-Based** | T2 | Valid token | Role + permission + scope |
| **Admin** | T3 | SSO + MFA | Admin role permissions |
| **Super Admin** | T4 | SSO + MFA + IP | Unrestricted (audited) |
| **Service** | T5 | Service API key | System-to-system scoped |

## 21.2 API Endpoint Category Mapping

| API Category | Tier | Allowed Roles |
|--------------|------|---------------|
| `GET /public/products` | T0 | All (no auth) |
| `GET /public/eligibility-check` | T0 | Anonymous (limited) |
| `POST /auth/otp` | T0 | All |
| `POST /auth/login` | T1 | All registered |
| `GET /customer/profile` | T2 | Customer (own) |
| `POST /customer/applications` | T2 | Customer |
| `POST /dsa/leads` | T2 | DSA |
| `POST /referral/submit` | T2 | Referral Partner |
| `GET /crm/leads` | T2 | Sales, RM, Branch+, Credit, Ops |
| `PATCH /crm/leads/{id}` | T2 | Sales (assigned), Branch Mgr |
| `POST /crm/applications` | T2 | Sales, Customer |
| `POST /credit/assessments` | T2 | Credit Executive |
| `POST /ops/lender-submit` | T2 | Ops Executive |
| `POST /ops/disbursements` | T2 | Ops Executive |
| `GET /branch/dashboard` | T2 | Branch Manager |
| `GET /regional/dashboard` | T2 | Regional Manager |
| `POST /support/tickets` | T2 | All external + internal |
| `PATCH /support/tickets/{id}` | T2 | Support Executive+ |
| `GET /compliance/audit-logs` | T2 | Compliance Manager, Super Admin |
| `POST /admin/users` | T3 | Admin |
| `PATCH /admin/products` | T3 | Admin |
| `POST /admin/rbac/roles` | T4 | Super Admin |
| `POST /admin/security/policies` | T4 | Super Admin |
| `GET /management/executive-dashboard` | T2 | Management roles |
| `POST /lender/status-update` | T2 | Lender User (future) |
| `POST /webhooks/lender` | T5 | Lender systems (API key) |
| `POST /webhooks/whatsapp` | T5 | WhatsApp BSP (API key) |

## 21.3 Role-to-API Access Matrix

| API Domain | Cust | DSA | Ref | Sales | RM | Credit | Ops | Branch | Regional | Support | Compliance | Admin | Super | Mgmt | Lender |
|------------|------|-----|-----|-------|-----|--------|-----|--------|----------|---------|------------|-------|-------|------|--------|
| `/customer/*` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| `/dsa/*` | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| `/referral/*` | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| `/crm/*` | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `/credit/*` | ✗ | ✗ | ✗ | ○ | ○ | ✓ | ○ | ○ | ○ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `/ops/*` | ✗ | ✗ | ✗ | ○ | ✗ | ○ | ✓ | ○ | ○ | ✗ | ○ | ✗ | ✓ | ✗ | ✗ |
| `/branch/*` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| `/support/*` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ |
| `/compliance/*` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `/admin/*` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| `/management/*` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ○ | ✗ | ✓ | ✓ | ✗ |
| `/lender/*` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ○ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| `/public/*` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

*○ = Read-only subset*

## 21.4 API Security Controls

| Control | Implementation |
|---------|----------------|
| Rate limiting | Per tier: T0=100/hr, T1=1000/hr, T2=5000/hr, T3/T4=unlimited |
| Token expiry | Customer: 24hr; Employee: 8hr; Super Admin: 15min |
| Scope claims | JWT contains role + permissions + branch/region IDs |
| Request validation | Permission checked per endpoint per method |
| Response filtering | Field-level masking in API serializer by role |
| CORS | Customer/DSA apps: allowed origins only |
| API versioning | `/v1/` prefix; deprecation policy |

---

# 22. DASHBOARD ACCESS MATRIX

## 22.1 Dashboard-Role Access

| Dashboard | Roles with Access |
|-----------|-------------------|
| D-01 Customer Home | Customer |
| D-02 DSA Partner | DSA |
| D-03 Referral Partner | Referral Partner |
| D-04 Sales Executive | Sales Executive |
| D-05 RM Portfolio | RM |
| D-06 Credit Processing | Credit Executive, Compliance Executive |
| D-07 Ops Processing | Ops Executive |
| D-08 Branch Manager | Branch Manager |
| D-09 Regional Manager | Regional Manager |
| D-10 Support Console | Support Executive, Support Manager, Admin |
| D-11 Compliance | Compliance Executive, Compliance Manager, CEO, Director |
| D-12 Admin Operations | Admin, Super Admin |
| D-13 Super Admin Console | Super Admin |
| D-14 Executive KPI | All Management + Compliance Manager |
| D-15 Revenue & Finance | CEO, Business Head, Finance Head, Director |
| D-16 Sales Performance | CEO, Sales Head, Regional Mgr, Branch Mgr, Director |
| D-17 Operations TAT | CEO, Ops Head, Credit, Ops, Branch, Regional |
| D-18 Partner Network | Sales Head, Business Head, Branch, Regional, Compliance |
| D-19 AI Utilization | CEO, Business Head, Admin, Super Admin |
| D-20 Lender Performance | Ops Head, Finance Head, Credit, Ops, Management |

## 22.2 Widget-Level Permissions

| Widget | Cust | DSA | Sales | RM | Credit | Ops | Branch | Regional | Support | Compliance | Admin | Mgmt |
|--------|------|-----|-------|-----|--------|-----|--------|----------|---------|------------|-------|------|
| Application status | ✓ | ✓* | ✓* | ✓* | ✓ | ✓ | ✓ | ✓ | ✓* | ✓ | ✓ | ✓* |
| Lead pipeline funnel | ✗ | ✓* | ✓* | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Commission summary | ✗ | ✓* | ✗ | ✗ | ✗ | ✓* | ✓* | ✓* | ✗ | ✓ | ✓ | ✓ |
| Target progress | ✗ | ✓* | ✓* | ✓* | ✓* | ✓* | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| SLA alerts | ✗ | ✗ | ✓* | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| AI copilot panel | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| AI advisor | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Cross-sell opportunities | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓* | ✓* | ✗ | ✗ | ✗ | ✓ |
| Credit queue | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓* | ✓* | ✗ | ✓ | ✓ | ✓* |
| Disbursement tracker | ✓* | ✓* | ✓* | ✓* | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Partner leaderboard | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Branch comparison | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Fraud alert panel | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓* |
| Ticket queue | ✗ | ✓* | ✓* | ✓* | ✗ | ✗ | ✓* | ✗ | ✓ | ✗ | ✓ | ✗ |
| Revenue forecast | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| System health | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓* |
| Compliance scorecard | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |

## 22.3 Export Rights by Dashboard

| Dashboard | Export Roles | Format | Audit |
|-----------|-------------|--------|-------|
| D-04 Sales | Sales (own), Branch, Regional | CSV, PDF | Standard |
| D-08 Branch | Branch Mgr, Regional, Management | CSV, PDF, Excel | Standard |
| D-09 Regional | Regional, Sales Head, Management | CSV, PDF, Excel | Standard |
| D-11 Compliance | Compliance Manager, Super Admin | CSV, PDF | Enhanced |
| D-14 Executive | Management, CEO | PDF (board pack) | Enhanced |
| D-15 Revenue | Finance Head, CEO | Excel, PDF | Enhanced |
| D-02 DSA | DSA (own), Branch | PDF | Standard |

---

# 23. REPORT ACCESS MATRIX

## 23.1 Operational Reports

| Report | Sales | RM | Credit | Ops | Branch | Regional | Support | Compliance | Admin | Mgmt |
|--------|-------|-----|--------|-----|--------|----------|---------|------------|-------|------|
| Personal pipeline | ✓* | ✓* | ✓* | ✓* | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Activity report | ✓* | ✓* | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| Processing queue | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓* |
| SLA compliance | ✓* | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Document deficiency | ✓* | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ |
| Exception/rework | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓* |
| Daily operations summary | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## 23.2 Revenue Reports

| Report | DSA | Branch | Regional | Finance | Admin | CEO | Business Head |
|--------|-----|--------|----------|---------|-------|-----|---------------|
| Commission statement | ✓* | ✓* | ✓* | ✓ | ✓ | ✓ | ✓ |
| Payout history | ✓* | ✓* | ✓* | ✓ | ✓ | ✓ | ✓ |
| Revenue by product | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Revenue by channel | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Revenue forecast | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| P&L summary | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Commission clawback | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| TDS certificate | ✓* | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |

## 23.3 Partner Reports

| Report | DSA | Ref | Branch | Regional | Sales Head | Compliance |
|--------|-----|-----|--------|----------|------------|------------|
| Partner performance | ✓* | ✓* | ✓ | ✓ | ✓ | ✓ |
| Partner leaderboard | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Partner compliance | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Referral conversion | ✗ | ✓* | ✓ | ✓ | ✓ | ✓ |
| DSA tier status | ✓* | ✗ | ✓ | ✓ | ✓ | ✓ |
| Partner dispute register | ✓* | ✗ | ✓ | ✓ | ✓ | ✓ |

## 23.4 Branch & Regional Reports

| Report | Branch Mgr | Regional Mgr | Sales Head | Management |
|--------|------------|--------------|------------|------------|
| Branch performance | ✓ | ✓ | ✓ | ✓ |
| Executive comparison | ✓ | ✓ | ✓ | ✓ |
| Lead funnel (branch) | ✓ | ✓ | ✓ | ✓ |
| Branch ranking | ✗ | ✓ | ✓ | ✓ |
| Regional summary | ✗ | ✓ | ✓ | ✓ |
| Geographic heat map | ✓ | ✓ | ✓ | ✓ |
| Branch forecast | ✓ | ✓ | ✓ | ✓ |

## 23.5 Executive Reports

| Report | CEO | Director | Business Head | Sales Head | Ops Head | Finance Head |
|--------|-----|----------|---------------|------------|----------|--------------|
| Monthly business review | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Quarterly board pack | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Market expansion analysis | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Customer LTV report | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| AI ROI report | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Compliance summary | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| Lender performance | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Strategic initiative tracker | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

# 24. AUDIT & COMPLIANCE MODEL

## 24.1 Audit Log Categories

| Category | Events Captured | Retention |
|----------|----------------|-----------|
| **Authentication** | Login, logout, failed auth, MFA, password reset | 2 years |
| **Authorization** | Permission denied (403), role change | 5 years |
| **Data Access** | PII field read, document view/download | 5 years |
| **Data Mutation** | Create, update, delete on critical resources | 5 years |
| **Workflow** | Status change, approval, rejection, escalation | 8 years |
| **Financial** | Commission calc, payout, dispute, override | 7 years |
| **Configuration** | Settings, RBAC, product, lender policy change | 7 years |
| **Compliance** | Fraud hold, partner suspend, investigation | 10 years |
| **Security** | Super Admin action, kill switch, bulk export | 10 years |

## 24.2 Change Tracking

| Entity | Tracked Fields | Versioning |
|--------|---------------|------------|
| Application | Status, amount, lender, assignee | Full version history |
| Lead | Status, assignee, score, classification | Full version history |
| Commission | Amount, status, payout date | Immutable ledger |
| Partner | Tier, status, agreement | Version history |
| RBAC | Role permissions | Version history with diff |
| Lender policy | Eligibility rules, ROI | Version history |
| Document | Upload, verification status | Version per file |

## 24.3 Approval Tracking

| Approval Type | Approver Role | Audit Fields |
|---------------|--------------|--------------|
| Credit recommendation | Credit Executive | Assessor, score, recommendation, timestamp |
| Credit exception | Branch/Regional Manager | Exception reason, amount, approver |
| Commission payout | Finance Head | Batch ID, amount, approver |
| Commission dispute | Branch/Regional Manager | Dispute ID, resolution, amount |
| Partner activation | Branch Manager / Admin | Partner ID, verifier |
| Partner suspension | Compliance Manager | Reason, duration, approver |
| Bulk export | Compliance Manager + CEO | Export scope, record count, purpose |
| RBAC change | Super Admin | Role, permission diff, approver |

## 24.4 Access Logs

| Log Field | Description |
|-----------|-------------|
| `event_id` | Unique event identifier |
| `timestamp` | UTC timestamp |
| `actor_id` | User who performed action |
| `actor_role` | Role at time of action |
| `action` | Permission action (read, update, etc.) |
| `resource` | Resource type and ID |
| `scope` | Scope applied (own, branch, etc.) |
| `ip_address` | Client IP |
| `user_agent` | Client device/browser |
| `session_id` | Session identifier |
| `result` | Success / denied |
| `pii_accessed` | Boolean flag for enhanced review |
| `reason` | Justification (for elevated access) |

## 24.5 Fraud Monitoring Permissions

| Action | Role | Audit Level |
|--------|------|-------------|
| View fraud alerts | Compliance Executive+ | Standard |
| Create fraud case | Compliance Executive+ | Enhanced |
| Place application hold | Compliance Executive+ | Enhanced |
| Investigate case | Fraud Analyst (not own) | Enhanced |
| Close fraud case | Compliance Manager | Maximum |
| Report to authorities | Compliance Manager + CEO | Maximum |

---

# 25. SECURITY CONTROLS

## 25.1 Authentication Controls by Role

| Role | Auth Method | MFA | Session Timeout | IP Restriction |
|------|-------------|-----|-----------------|----------------|
| Customer | Mobile OTP | Optional (biometric) | 24 hours | No |
| DSA Partner | Mobile OTP + KYC | Optional | 12 hours | No |
| Referral Partner | Mobile OTP | Optional | 12 hours | No |
| Sales Executive | SSO (email) | **Required** | 8 hours | Optional (branch) |
| RM | SSO | **Required** | 8 hours | Optional |
| Credit Executive | SSO | **Required** | 8 hours | Optional |
| Ops Executive | SSO | **Required** | 8 hours | Optional |
| Branch Manager | SSO | **Required** | 8 hours | Optional |
| Regional Manager | SSO | **Required** | 8 hours | Optional |
| Support Executive | SSO | **Required** | 8 hours | No |
| Support Manager | SSO | **Required** | 8 hours | No |
| Compliance Executive | SSO | **Required** | 8 hours | Optional |
| Compliance Manager | SSO | **Required** | 8 hours | Optional |
| Admin | SSO | **Required** | 4 hours | **Recommended** |
| Super Admin | SSO | **Required** | **15 minutes** | **Required** |
| Management | SSO | **Required** | 8 hours | No |
| Lender User | API key + portal auth | **Required** | 4 hours | **Lender IP whitelist** |

## 25.2 MFA Requirements

| Scenario | MFA Required |
|----------|-------------|
| Employee first login | ✓ |
| Employee daily login | ✓ (TOTP or push) |
| Super Admin every action | ✓ |
| PII bulk export | ✓ + dual approval |
| RBAC modification | ✓ |
| Commission payout approval | ✓ |
| Password reset (employee) | ✓ |
| Customer high-value transaction | ✓ (OTP) |

## 25.3 OTP Controls (Customer / Partner)

| Control | Setting |
|---------|---------|
| OTP length | 6 digits |
| OTP expiry | 5 minutes |
| Max attempts | 3 per OTP |
| Rate limit | 5 OTPs per mobile per hour |
| OTP channels | SMS, WhatsApp (customer preference) |
| Consent OTP | Required per lead/application submission |

## 25.4 Session Management

| Control | Policy |
|---------|--------|
| Concurrent sessions | Employee: 2 max; Super Admin: 1 |
| Session invalidation | On role change, password reset, admin force |
| Idle timeout | Enforced per role table |
| Absolute timeout | Customer: 30 days (refresh token) |
| Session binding | Device fingerprint (optional for employees) |
| Logout | Invalidates all tokens for session |

## 25.5 Password Policies (Employee SSO)

| Policy | Requirement |
|--------|-------------|
| Minimum length | 12 characters |
| Complexity | Upper + lower + number + special |
| History | Last 12 passwords cannot reuse |
| Expiry | 90 days (Admin/Super Admin: 60 days) |
| Lockout | 5 failed attempts → 30 min lock |
| Breach detection | Checked against known breach databases |

## 25.6 Device Controls

| Control | Application |
|---------|-------------|
| Mobile app certificate pinning | Customer App, DSA App |
| Jailbreak/root detection | Mobile apps (warning + restrict) |
| Admin IP whitelist | Super Admin mandatory; Admin recommended |
| Geo-fencing | Optional for branch employees |
| Remote wipe | Employee mobile CRM app (MDM future) |

## 25.7 IP Restrictions

| Role | Policy |
|------|--------|
| Super Admin | Static IP whitelist only (office + VPN) |
| Admin | Recommended whitelist; alert on new IP |
| Lender User | Per-lender IP whitelist |
| All others | No restriction; anomaly alerting |

---

# 26. FUTURE EXPANSION

## 26.1 Product Module Permission Extension

New financial products extend RBAC via **Product Permission Modules** — no role hierarchy redesign.

```
PERMISSION MODULE STRUCTURE:
  {product_module}.{resource}.{action}:{scope}

Examples:
  insurance.policies.read:portfolio     → RM
  credit_card.applications.create:assigned → Sales
  mutual_fund.recommendations.read:portfolio → RM (certified)
  gold_loan.applications.read:branch  → Branch Manager
```

## 26.2 Future Product Permission Additions

| Product Module | New Resources | Roles Enabled | New Permissions |
|----------------|--------------|---------------|-----------------|
| **Insurance** | policies, premiums, claims | Sales, RM, Customer, DSA | ~12 |
| **Personal Loan** | pl_applications, pl_eligibility | Sales, DSA, Customer, Credit | ~10 |
| **Credit Card** | card_applications, card_offers | Sales, RM, Customer | ~10 |
| **Mutual Fund** | mf_portfolios, sip, risk_profile | RM (certified), Customer | ~15 |
| **Fixed Deposit** | fd_bookings, fd_rates | RM, Sales, Customer | ~8 |
| **Gold Loan** | gold_valuation, pledge_docs | Sales, DSA, Ops | ~10 |
| **Wealth Management** | aum, advisory, rebalancing | RM (RIA certified) | ~20 |

## 26.3 Certification-Gated Permissions

| Product Module | Certification Required | Gate Behavior |
|----------------|----------------------|---------------|
| Insurance | IRDAI module training | Permission denied until certified |
| Mutual Funds | AMFI module training | RM only; denied until ARN linked |
| Wealth Management | SEBI RIA module | RM only; senior certification |
| Gold Loan | Product module training | Sales + DSA |

## 26.4 Future Role: Lender User (No Hierarchy Change)

| Permission | Scope |
|------------|-------|
| `applications.read:lender` | Submitted to their lender only |
| `applications.update_status:lender` | Status fields only |
| `documents.read:lender` | Lender-required docs only |
| `queries.create:lender` | Lender queries on applications |
| All other resources | **Denied** |

## 26.5 RBAC Expansion Principles

| Principle | Rule |
|-----------|------|
| No new role types for products | Product modules on existing roles |
| Same scope hierarchy | own → assigned → portfolio → branch → region |
| Same SoD rules apply | Credit cannot disburse regardless of product |
| Same audit requirements | PII access logged per product module |
| Admin extends product catalog | Super Admin extends if new resource types |
| Management stays aggregated | No change to management visibility model |

## 26.6 Expansion Readiness Matrix

| Product | Roles Affected | Hierarchy Change | New Role Types | RBAC Redesign |
|---------|---------------|------------------|----------------|---------------|
| Insurance | +3 (Sales, RM, Customer) | None | 0 | No |
| Personal Loan | +5 (existing loan roles) | None | 0 | No |
| Credit Card | +3 (Sales, RM, Customer) | None | 0 | No |
| Mutual Fund | +2 (RM, Customer) | None | 0 | No |
| FD | +3 (Sales, RM, Customer) | None | 0 | No |
| Gold Loan | +4 (Sales, DSA, Ops, Customer) | None | 0 | No |
| Wealth Mgmt | +2 (RM, Customer) | None | 0 | No |
| Lender Portal | +1 (Lender User) | Additive external | 1 | No |

---

# APPENDIX A: ROLE CODE REFERENCE

| Role Code | Display Name | Tier |
|-----------|-------------|------|
| `ROLE_CUSTOMER` | Customer | T7 |
| `ROLE_DSA` | DSA Partner | T6 |
| `ROLE_REFERRAL_PARTNER` | Referral Partner | T6 |
| `ROLE_SALES_EXEC` | Sales Executive | T5 |
| `ROLE_RM` | Relationship Manager | T5 |
| `ROLE_CREDIT_EXEC` | Credit Executive | T5 |
| `ROLE_OPS_EXEC` | Operations Executive | T5 |
| `ROLE_BRANCH_MGR` | Branch Manager | T4 |
| `ROLE_REGIONAL_MGR` | Regional Manager | T3 |
| `ROLE_SUPPORT_EXEC` | Support Executive | T5 |
| `ROLE_SUPPORT_MGR` | Support Manager | T5 |
| `ROLE_COMPLIANCE_EXEC` | Compliance Executive | T5 |
| `ROLE_COMPLIANCE_MGR` | Compliance Manager | T5 |
| `ROLE_ADMIN` | Admin | T1 |
| `ROLE_SUPER_ADMIN` | Super Admin | T0 |
| `ROLE_CEO` | CEO | T2 |
| `ROLE_DIRECTOR` | Director | T2 |
| `ROLE_BUSINESS_HEAD` | Business Head | T2 |
| `ROLE_SALES_HEAD` | Sales Head | T2 |
| `ROLE_OPS_HEAD` | Operations Head | T2 |
| `ROLE_FINANCE_HEAD` | Finance Head | T2 |
| `ROLE_LENDER_USER` | Lender User (Future) | T8 |

---

# APPENDIX B: PERMISSION CODE REFERENCE

| Code | Permission | API HTTP Mapping |
|------|------------|------------------|
| C | Create | POST |
| R | Read | GET |
| U | Update | PATCH, PUT |
| D | Delete | DELETE |
| A | Approve | POST /approve |
| AS | Assign | POST /assign |
| E | Export | GET /export |
| AU | Audit | GET /audit-logs |
| CF | Configure | PUT /config |
| M | Manage | All methods (resource) |
| UP | Upload | POST /upload |
| DL | Download | GET /download |
| VF | Verify | POST /verify |
| RJ | Reject | POST /reject |
| ES | Escalate | POST /escalate |
| CL | Close | POST /close |
| RO | Reopen | POST /reopen |
| GR | Generate Reports | GET /reports |
| GA | Generate Analytics | GET /analytics |

---

# APPENDIX C: SOD RULE REFERENCE

| Rule | Blocked Action | Blocked Role | Required Role |
|------|---------------|--------------|---------------|
| SoD-01 | Approve credit | Sales Executive | Credit Executive |
| SoD-02 | Submit to lender | Credit Executive | Ops Executive |
| SoD-03 | Modify commission rules | Ops Executive | Admin + Finance |
| SoD-04 | Verify own lead docs | DSA Partner | Credit Executive |
| SoD-05 | Bulk PII export | Support Executive | Compliance Manager |
| SoD-06 | Create Super Admin | Admin | Super Admin |
| SoD-07 | Approve own dispute | Branch Manager (>₹10K) | Regional Manager |
| SoD-08 | Investigate own case | Compliance Executive | Other analyst |
| SoD-09 | Create + approve app | Sales Executive | Credit/Ops |
| SoD-10 | Modify RBAC | Admin | Super Admin |
| SoD-11 | Export raw customer data | Management | Compliance-authorized |
| SoD-12 | Cross-lender access | Lender User | System isolation |

---

# APPENDIX D: DOCUMENT APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO / Managing Director | | | |
| CTO / Technology Head | | | |
| Compliance Officer | | | |
| Head of Product | | | |
| CISO / Security Head | | | |
| Board Representative | | | |

---

# APPENDIX E: REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | Kuber Finserve Security & Product Team | Initial RBAC & Permissions document |

---

**© 2026 Kuber Finserve. Confidential — For Internal, Security, Engineering, and Compliance Use.**

*This document is the authoritative RBAC reference for KuberOne. All authentication, authorization, API, and UI access implementations must map to this matrix.*

*Related:*
- [KUBERONE_VISION_AND_OBJECTIVES.md](./KUBERONE_VISION_AND_OBJECTIVES.md)
- [KUBERONE_USER_TYPES_AND_ROLES.md](./KUBERONE_USER_TYPES_AND_ROLES.md)
- [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md)
