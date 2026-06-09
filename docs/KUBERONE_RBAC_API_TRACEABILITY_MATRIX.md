# KuberOne
## RBAC → API Traceability Matrix

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise Security Traceability — RBAC to API Mapping  
**Classification:** Board-Ready | Compliance-Ready | Engineering-Ready | IAM Implementation  
**Version:** 1.0  
**Date:** June 2026  
**Related Documents:**
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md)
- [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md)
- [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md)
- [KUBERONE_USER_TYPES_AND_ROLES.md](./KUBERONE_USER_TYPES_AND_ROLES.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Complete mapping of 324 REST APIs to RBAC roles, permissions, scopes, SoD rules, and audit events |
| **Audience** | Security, Engineering, Compliance, QA, API Gateway, Backend, Mobile |
| **Purpose** | Authoritative traceability for API authorization middleware, penetration testing, and regulatory examination |
| **Status** | Authoritative Traceability Document |
| **API Coverage** | 312 APIs (Appendix A catalog) + 12 reconciliation APIs (DSH/SUP/TKT/KB/SET/AUD/ADM/LEN extended) |

---

# 1. EXECUTIVE SUMMARY

KuberOne exposes **324 REST API endpoints** across customer, partner, CRM, operations, compliance, admin, and management domains. Every authenticated endpoint is governed by the RBAC framework defined in [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md): **22 roles**, **19 permission types**, **25 resource categories**, and **7 data scope levels** (plus `all` for Super Admin).

This traceability matrix is the **implementation bridge** between security governance and API delivery. It answers, for every endpoint:

1. **Which permission** is required (`{resource}.{action}:{scope}`)
2. **Which roles** may invoke it
3. **What data scope** filters apply
4. **Whether approval rights** or SoD gates apply
5. **Whether export** is permitted
6. **What audit event** is emitted

## Strategic Position

| Dimension | KuberOne Posture |
|-----------|------------------|
| **Default deny** | All endpoints deny unless role × permission × scope passes |
| **External isolation** | Customer, DSA, Referral, Lender — never inherit internal permissions |
| **SoD enforcement** | 12 separation rules block conflicting role actions at API layer |
| **Management privacy** | Aggregated analytics only; no raw PII export (SoD-11) |
| **Audit completeness** | 100% PII access, approval, and configuration changes logged |
| **Workflow alignment** | API gates mirror LOS stages and commission lifecycle in [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md) |

## Coverage Summary

| Domain Group | API Count | Matrix Status |
|--------------|-----------|---------------|
| AUTH, USR | 21 | Complete table (§5.1–5.2) |
| CUS, PTR, DSA, REF | 66 | Complete table (§5.3–5.6) |
| EMP, BRN, PRD, ELG, EMI | 41 | Complete table (§5.7–5.11) |
| LED, LMS, LOS, APP | 55 | Complete table (§5.12–5.15) |
| DOC, OCR, KYC | 28 | Complete table (§5.16–5.18) |
| AI, VOC, CHT, NTF | 34 | Complete table (§5.19–5.22) |
| WA, CMP, COM, ANA | 47 | Complete table (§5.23–5.26) |
| DSH, SUP, TKT, KB, SET, AUD, ADM, LEN, WHK | 87 | Reconciliation + full tables (§5.27, §12) |

**Board Recommendation:** No API endpoint ships to production without a row in this matrix and passing RBAC integration tests.

---

# 2. TRACEABILITY MODEL

## 2.1 Chain: Role → Permission → Scope → Endpoint → Action → Audit

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────┐    ┌──────────────┐
│   ROLE      │───▶│   PERMISSION     │───▶│   SCOPE     │───▶│  ENDPOINT    │
│ (22 roles)  │    │ resource.action  │    │ own→all     │    │ Method+Path  │
└─────────────┘    └──────────────────┘    └─────────────┘    └──────┬───────┘
                                                                      │
                    ┌──────────────────┐    ┌─────────────┐           │
                    │   AUDIT EVENT    │◀───│   ACTION    │◀──────────┘
                    │ (9 categories)   │    │ HTTP verb   │
                    └──────────────────┘    └─────────────┘
                              ▲
                    ┌─────────┴────────┐
                    │  SoD CHECK (12)  │
                    │  Deny if violated│
                    └──────────────────┘
```

## 2.2 Evaluation Sequence (per request)

| Step | Check | Failure |
|------|-------|---------|
| 1 | Authenticate JWT / webhook signature | 401 |
| 2 | Resolve active role(s) from token | 403 |
| 3 | Map endpoint + method → required permission | 403 `RBAC_FORBIDDEN` |
| 4 | Verify role holds permission at required scope | 403 |
| 5 | Apply scope filter (SQL/ORM predicate) | 404 (no leak) |
| 6 | Apply field-level modifiers (masked/summary/redacted) | 200 (filtered) |
| 7 | Evaluate SoD rules for mutation endpoints | 403 `COMM_002_SOD_VIOLATION` |
| 8 | Emit audit event (enhanced if PII) | — |
| 9 | Execute handler | 2xx/4xx |

## 2.3 Traceability Artifact Links

| Artifact | Source Document | Matrix Column |
|----------|-----------------|---------------|
| Role codes | RBAC Appendix A | Allowed Roles |
| Permission strings | RBAC §3.2, Appendix B | Required Permission |
| Scope hierarchy | RBAC §3.3 | Data Scope |
| Endpoint catalog | API Spec Appendix A | API ID, Method, Endpoint |
| SoD rules | RBAC §1.6, Appendix C | Approval Right, §6 |
| Audit categories | RBAC §24.1 | Audit Event |
| Workflow stages | BWO §LOS | LOS/APP domain notes |

## 2.4 Role Code Legend (used in tables)

| Code | Role | Code | Role |
|------|------|------|------|
| `CUST` | ROLE_CUSTOMER | `BRANCH` | ROLE_BRANCH_MGR |
| `DSA` | ROLE_DSA | `REGIONAL` | ROLE_REGIONAL_MGR |
| `REF` | ROLE_REFERRAL_PARTNER | `SUPP-E` | ROLE_SUPPORT_EXEC |
| `SALES` | ROLE_SALES_EXEC | `SUPP-M` | ROLE_SUPPORT_MGR |
| `RM` | ROLE_RM | `COMP-E` | ROLE_COMPLIANCE_EXEC |
| `CREDIT` | ROLE_CREDIT_EXEC | `COMP-M` | ROLE_COMPLIANCE_MGR |
| `OPS` | ROLE_OPS_EXEC | `ADMIN` | ROLE_ADMIN |
| `CEO` | ROLE_CEO | `SUPER` | ROLE_SUPER_ADMIN |
| `DIR` | ROLE_DIRECTOR | `LENDER` | ROLE_LENDER_USER |
| `BIZ` | ROLE_BUSINESS_HEAD | `PUBLIC` | Unauthenticated |
| `SALES-H` | ROLE_SALES_HEAD | `ALL` | All authenticated (scope applies) |
| `OPS-H` | ROLE_OPS_HEAD | `SERVICE` | Service account (T5) |
| `FIN` | ROLE_FINANCE_HEAD | | |

---

# 3. PERMISSION CODE STANDARDS

Derived from RBAC §3.1 and Appendix B.

## 3.1 Permission String Format

```
{resource}.{action}:{scope}

Examples:
  leads.read:assigned
  applications.approve:assigned
  commissions.configure:all
  audit.export:organization
```

## 3.2 Permission Type Codes (19 Types)

| Code | Permission | HTTP Mapping | Typical Mutation |
|------|------------|--------------|------------------|
| **C** | Create | POST | New record |
| **R** | Read | GET | View/list |
| **U** | Update | PATCH, PUT | Modify fields |
| **D** | Delete | DELETE | Soft-delete |
| **A** | Approve | POST `/approve`, `/sanction`, `/disbursement` | Workflow approval |
| **AS** | Assign | POST `/assign` | Ownership change |
| **E** | Export | GET `/export`, POST `/export` | File download |
| **AU** | Audit | GET `/audit-logs` | Log access |
| **CF** | Configure | PUT `/config`, PATCH settings | System config |
| **M** | Manage | All methods on resource | Full CRUD |
| **UP** | Upload | POST `/presign`, `/confirm` | Document upload |
| **DL** | Download | GET `/download` | Document download |
| **VF** | Verify | POST `/verify` | KYC/doc verification |
| **RJ** | Reject | POST `/reject` | Rejection |
| **ES** | Escalate | POST `/escalate`, `/exception` | Escalation |
| **CL** | Close | POST `/resolve`, `/close` | Ticket/workflow close |
| **RO** | Reopen | POST `/reopen` | Reopen closed |
| **GR** | Generate Reports | GET `/reports`, POST `/generate` | Report jobs |
| **GA** | Generate Analytics | GET `/analytics`, `/dashboard` | Dashboard widgets |

## 3.3 Resource Registry (25 Categories)

| ID | Resource | API Domain Prefix | Sensitivity |
|----|----------|-------------------|-------------|
| RES-01 | Users | `/users`, `/auth` | High |
| RES-02 | Customers | `/customer`, `/crm/customers` | Critical |
| RES-03 | Partners | `/dsa`, `/crm/partners` | High |
| RES-04 | Employees | `/crm/employees`, `/admin/employees` | High |
| RES-05 | Branches | `/branch`, `/admin/branches` | Medium |
| RES-06 | Products | `/public/products`, `/admin/products` | Medium |
| RES-07 | Leads | `/crm/leads`, `/dsa/leads` | High |
| RES-08 | Applications | `/applications`, `/crm/applications` | Critical |
| RES-09 | Documents | `/documents` | Critical |
| RES-10 | KYC | `/customer/kyc`, `/compliance/kyc` | Critical |
| RES-11 | Eligibility | `/eligibility` | High |
| RES-12 | EMI | `/emi`, `/public/emi` | Medium |
| RES-13 | Referrals | `/referral`, `/crm/referrals` | Medium |
| RES-14 | Commissions | `/crm/commissions`, `/finance/payouts` | High |
| RES-15 | Campaigns | `/admin/campaigns` | Medium |
| RES-16 | Tickets | `/support/tickets` | Medium |
| RES-17 | Notifications | `/notifications` | Low |
| RES-18 | Reports | `/analytics/reports` | Medium–High |
| RES-19 | Analytics | `/analytics`, `/management` | Medium |
| RES-20 | Knowledge Base | `/knowledge` | Low |
| RES-21 | Settings | `/admin/settings` | High |
| RES-22 | Audit Logs | `/compliance/audit` | Critical |
| RES-23 | Lender Policies | `/admin/lenders` | High |
| RES-24 | AI Configuration | `/admin/settings/ai`, `/ai` | High |
| RES-25 | Disbursements | `/ops/applications/*/disbursement` | Critical |

---

# 4. SCOPE MODEL

## 4.1 Scope Hierarchy (Lowest → Highest)

| Scope Code | Level | Description | Typical Roles |
|------------|-------|-------------|---------------|
| `own` | 1 | User's own records only | CUST, DSA, REF |
| `assigned` | 2 | Records assigned to user | SALES, CREDIT, OPS |
| `portfolio` | 3 | RM portfolio customers | RM |
| `branch` | 4 | All records in user's branch | BRANCH, branch-scoped CRM |
| `region` | 5 | All records in user's region | REGIONAL |
| `organization` | 6 | All records (functional roles) | CREDIT, OPS, COMP-E, COMP-M |
| `aggregated` | 7 | Summary metrics; no record PII | CEO, DIR, BIZ, SALES-H, OPS-H, FIN |
| `all` | 8 | Unrestricted (Super Admin) | SUPER |

## 4.2 Scope Application Rules

| Rule ID | Rule | API Impact |
|---------|------|------------|
| SC-01 | Scope is minimum necessary per role template | JWT `scope` claim auto-filters queries |
| SC-02 | `scoped` = resolved at runtime to own/assigned/portfolio/branch/region | CRM endpoints use row-level security |
| SC-03 | Management roles receive `aggregated` only on `/management/*` and API-ANA-015 | Cohort minimum n=5 (DV-04) |
| SC-04 | Functional roles (CREDIT, OPS) use `organization` within function | Cross-branch queue access |
| SC-05 | External users never exceed `own` | DSA/REF/CUST isolation enforced |
| SC-06 | Super Admin uses `all` with enhanced audit | Every action logged SECURITY category |

## 4.3 Field-Level Modifiers (applied post-scope)

| Modifier | Roles | API Serializer Behavior |
|----------|-------|-------------------------|
| `masked` | REF, SUPP-E | Mobile `98XXX3210`; name partial |
| `summary` | SALES (credit tab), MGMT | Status only; no internal notes |
| `readonly` | CUST (post-submit APP) | PATCH returns 403 |
| `redacted` | MGMT, REF | PII fields omitted |

---

# 5. FULL DOMAIN MATRIX

**Table columns:** API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event

**Approval Right:** `Yes` = endpoint performs approval action; `SoD` = blocked for conflicting role; `—` = N/A  
**Export:** `Yes` = explicit export/download; `Masked` = aggregated export only; `No` = denied  
**Audit Event codes:** See §12.1

---

## 5.1 AUTH — Authentication (11 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
|--------|--------|----------|---------------------|---------------|------------|----------------|--------|-------------|
| API-AUTH-001 | POST | `/auth/otp/send` | `public` | PUBLIC | — | — | No | AUTH_OTP_SEND |
| API-AUTH-002 | POST | `/auth/otp/verify` | `public` | PUBLIC | — | — | No | AUTH_LOGIN_SUCCESS |
| API-AUTH-003 | POST | `/auth/login` | `public` | CRM employees | — | — | No | AUTH_LOGIN_ATTEMPT |
| API-AUTH-004 | POST | `/auth/mfa/verify` | `auth.mfa:partial` | CRM employees (MFA session) | — | — | No | AUTH_MFA_VERIFY |
| API-AUTH-005 | POST | `/auth/refresh` | `auth.refresh:own` | ALL | own | — | No | AUTH_TOKEN_REFRESH |
| API-AUTH-006 | POST | `/auth/logout` | `auth.logout:own` | ALL | own | — | No | AUTH_LOGOUT |
| API-AUTH-007 | POST | `/auth/forgot-password` | `public` | CRM employees | — | — | No | AUTH_PASSWORD_RESET_REQUEST |
| API-AUTH-008 | POST | `/auth/reset-password` | `auth.reset:token` | CRM employees (reset token) | — | — | No | AUTH_PASSWORD_RESET |
| API-AUTH-009 | GET | `/auth/me` | `auth.read:own` | ALL | own | — | No | AUTH_SESSION_READ |
| API-AUTH-010 | GET | `/auth/sessions` | `auth.read:own` | ALL; ADMIN (employee sessions) | own / organization | — | No | AUTH_SESSION_LIST |
| API-AUTH-011 | DELETE | `/auth/sessions/{id}` | `auth.delete:own` | ALL; ADMIN (employee) | own / organization | — | No | AUTH_SESSION_REVOKE |

---

## 5.2 USR — User Management (10 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
|--------|--------|----------|---------------------|---------------|------------|----------------|--------|-------------|
| API-USR-001 | GET | `/users/me` | `users.read:own` | ALL | own | — | No | DATA_ACCESS_USER |
| API-USR-002 | PATCH | `/users/me` | `users.update:own` | ALL | own | — | No | DATA_MUTATION_USER |
| API-USR-003 | GET | `/users/{id}` | `users.read:branch` | BRANCH, REGIONAL, ADMIN, SUPER | branch | — | No | DATA_ACCESS_USER |
| API-USR-004 | GET | `/users` | `users.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_USER |
| API-USR-005 | POST | `/users` | `users.create:all` | ADMIN, SUPER | organization | — | No | DATA_MUTATION_USER |
| API-USR-006 | PATCH | `/users/{id}` | `users.update:all` | ADMIN, SUPER | organization | — | No | DATA_MUTATION_USER |
| API-USR-007 | DELETE | `/users/{id}` | `users.delete:all` | ADMIN, SUPER | organization | — | No | DATA_MUTATION_USER |
| API-USR-008 | GET | `/users/{id}/roles` | `users.read:branch` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_USER |
| API-USR-009 | POST | `/users/{id}/roles` | `users.update:all` | ADMIN, SUPER | organization | SoD-06, SoD-10 | No | CONFIG_RBAC_ASSIGN |
| API-USR-010 | DELETE | `/users/{id}/roles/{roleId}` | `users.update:all` | ADMIN, SUPER | organization | SoD-10 | No | CONFIG_RBAC_REVOKE |

---

## 5.3 CUS — Customer (28 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
|--------|--------|----------|---------------------|---------------|------------|----------------|--------|-------------|
| API-CUS-001 | GET | `/customer/profile` | `customers.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_PII |
| API-CUS-002 | PATCH | `/customer/profile` | `customers.update:own` | CUST, SUPER | own | — | No | DATA_MUTATION_PII |
| API-CUS-003 | GET | `/customer/profile/completion` | `customers.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_USER |
| API-CUS-004 | GET | `/customer/addresses` | `customers.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_PII |
| API-CUS-005 | POST | `/customer/addresses` | `customers.update:own` | CUST, SUPER | own | — | No | DATA_MUTATION_PII |
| API-CUS-006 | PATCH | `/customer/addresses/{id}` | `customers.update:own` | CUST, SUPER | own | — | No | DATA_MUTATION_PII |
| API-CUS-007 | DELETE | `/customer/addresses/{id}` | `customers.update:own` | CUST, SUPER | own | — | No | DATA_MUTATION_PII |
| API-CUS-008 | GET | `/customer/employment` | `customers.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_PII |
| API-CUS-009 | POST | `/customer/employment` | `customers.update:own` | CUST, SUPER | own | — | No | DATA_MUTATION_PII |
| API-CUS-010 | GET | `/customer/income` | `customers.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_PII |
| API-CUS-011 | POST | `/customer/income` | `customers.update:own` | CUST, SUPER | own | — | No | DATA_MUTATION_PII |
| API-CUS-012 | GET | `/customer/preferences` | `customers.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_USER |
| API-CUS-013 | PATCH | `/customer/preferences` | `customers.update:own` | CUST, SUPER | own | — | No | DATA_MUTATION_USER |
| API-CUS-014 | GET | `/customer/consents` | `customers.read:own` | CUST, SUPER | own | — | No | COMPLIANCE_CONSENT_READ |
| API-CUS-015 | POST | `/customer/consents` | `customers.update:own` | CUST, SUPER | own | — | No | COMPLIANCE_CONSENT_GRANT |
| API-CUS-016 | POST | `/customer/consents/{type}/revoke` | `customers.update:own` | CUST, SUPER | own | — | No | COMPLIANCE_CONSENT_REVOKE |
| API-CUS-017 | GET | `/customer/dashboard` | `customers.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_USER |
| API-CUS-018 | GET | `/customer/applications/summary` | `customers.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_APPLICATION |
| API-CUS-019 | GET | `/crm/customers` | `customers.read:assigned` | SALES, RM, BRANCH, REGIONAL, COMP-E, COMP-M, ADMIN, SUPER | assigned/branch | — | No | DATA_ACCESS_PII |
| API-CUS-020 | GET | `/crm/customers/{id}` | `customers.read:scoped` | SALES, RM, CREDIT, OPS, BRANCH, REGIONAL, SUPP-E, SUPP-M, COMP-E, COMP-M, ADMIN, SUPER | scoped | — | No | DATA_ACCESS_PII |
| API-CUS-021 | GET | `/crm/customers/{id}/personal` | `customers.read:scoped` | SALES, RM, CREDIT, OPS, BRANCH, REGIONAL, SUPP-M, COMP-E, COMP-M, ADMIN, SUPER | scoped | — | No | DATA_ACCESS_PII |
| API-CUS-022 | GET | `/crm/customers/{id}/kyc` | `kyc.read:scoped` | SALES, RM, CREDIT, OPS, BRANCH, REGIONAL, COMP-E, COMP-M, ADMIN, SUPER | scoped | — | No | DATA_ACCESS_PII |
| API-CUS-023 | GET | `/crm/customers/{id}/applications` | `applications.read:scoped` | SALES, RM, CREDIT, OPS, BRANCH, REGIONAL, SUPP-E, SUPP-M, COMP-E, COMP-M, ADMIN, SUPER | scoped | — | No | DATA_ACCESS_APPLICATION |
| API-CUS-024 | GET | `/crm/customers/{id}/documents` | `documents.read:scoped` | SALES, RM, CREDIT, OPS, BRANCH, REGIONAL, COMP-E, COMP-M, ADMIN, SUPER | scoped | — | No | DATA_ACCESS_DOCUMENT |
| API-CUS-025 | GET | `/crm/customers/{id}/interactions` | `customers.read:scoped` | SALES, RM, BRANCH, REGIONAL, SUPP-E, SUPP-M, ADMIN, SUPER | scoped | — | No | DATA_ACCESS_USER |
| API-CUS-026 | POST | `/crm/customers/{id}/interactions` | `customers.update:assigned` | SALES, RM, BRANCH, SUPER | assigned | — | No | DATA_MUTATION_USER |
| API-CUS-027 | GET | `/crm/customers/{id}/cross-sell` | `customers.read:portfolio` | RM, BRANCH, REGIONAL, SUPER | portfolio | — | No | DATA_ACCESS_USER |
| API-CUS-028 | POST | `/crm/customers/merge` | `customers.update:all` | ADMIN, SUPER | organization | Yes | No | DATA_MUTATION_PII |

---

## 5.4 PTR — Partner CRM (10 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
|--------|--------|----------|---------------------|---------------|------------|----------------|--------|-------------|
| API-PTR-001 | GET | `/crm/partners` | `partners.read:branch` | BRANCH, REGIONAL, SALES-H, BIZ, COMP-M, ADMIN, SUPER | branch | — | No | DATA_ACCESS_PARTNER |
| API-PTR-002 | GET | `/crm/partners/{id}` | `partners.read:scoped` | BRANCH, REGIONAL, COMP-M, ADMIN, SUPER | scoped | — | No | DATA_ACCESS_PARTNER |
| API-PTR-003 | POST | `/crm/partners` | `partners.create:all` | ADMIN, SUPER | organization | — | No | DATA_MUTATION_PARTNER |
| API-PTR-004 | POST | `/crm/partners/{id}/activate` | `partners.approve:branch` | BRANCH, ADMIN, SUPER | branch | Yes | No | WORKFLOW_PARTNER_ACTIVATE |
| API-PTR-005 | POST | `/crm/partners/{id}/suspend` | `partners.update:branch` | COMP-M, BRANCH, ADMIN, SUPER | branch | Yes | No | COMPLIANCE_PARTNER_SUSPEND |
| API-PTR-006 | GET | `/crm/partners/{id}/performance` | `partners.read:branch` | BRANCH, REGIONAL, SALES-H, ADMIN, SUPER | branch | — | No | DATA_ACCESS_PARTNER |
| API-PTR-007 | GET | `/crm/partners/{id}/documents` | `documents.read:scoped` | BRANCH, REGIONAL, COMP-M, ADMIN, SUPER | scoped | — | No | DATA_ACCESS_DOCUMENT |
| API-PTR-008 | GET | `/crm/partners/{id}/commissions` | `commissions.read:branch` | BRANCH, REGIONAL, FIN, ADMIN, SUPER | branch | — | No | DATA_ACCESS_COMMISSION |
| API-PTR-009 | GET | `/crm/partners/onboarding-queue` | `partners.read:branch` | BRANCH, REGIONAL, ADMIN, SUPER | branch | — | No | DATA_ACCESS_PARTNER |
| API-PTR-010 | GET | `/crm/partners/disputes` | `commissions.read:branch` | BRANCH, REGIONAL, FIN, ADMIN, SUPER | branch | — | No | DATA_ACCESS_COMMISSION |

---

## 5.5 DSA — DSA Partner App (25 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
|--------|--------|----------|---------------------|---------------|------------|----------------|--------|-------------|
| API-DSA-001 | GET | `/dsa/dashboard` | `partners.read:own` | DSA, SUPER | own | — | No | DATA_ACCESS_PARTNER |
| API-DSA-002 | GET | `/dsa/profile` | `partners.read:own` | DSA, SUPER | own | — | No | DATA_ACCESS_PARTNER |
| API-DSA-003 | PATCH | `/dsa/profile` | `partners.update:own` | DSA, SUPER | own | — | No | DATA_MUTATION_PARTNER |
| API-DSA-004 | GET | `/dsa/kyc` | `kyc.read:own` | DSA, SUPER | own | — | No | DATA_ACCESS_PII |
| API-DSA-005 | POST | `/dsa/kyc/pan` | `kyc.update:own` | DSA, SUPER | own | — | No | DATA_MUTATION_PII |
| API-DSA-006 | GET | `/dsa/bank-accounts` | `partners.read:own` | DSA, SUPER | own | — | No | DATA_ACCESS_PII |
| API-DSA-007 | POST | `/dsa/bank-accounts` | `partners.update:own` | DSA, SUPER | own | — | No | DATA_MUTATION_PII |
| API-DSA-008 | GET | `/dsa/agreements` | `partners.read:own` | DSA, SUPER | own | — | No | DATA_ACCESS_PARTNER |
| API-DSA-009 | POST | `/dsa/agreements/{id}/sign` | `partners.update:own` | DSA, SUPER | own | — | No | WORKFLOW_AGREEMENT_SIGN |
| API-DSA-010 | GET | `/dsa/certifications` | `partners.read:own` | DSA, SUPER | own | — | No | DATA_ACCESS_PARTNER |
| API-DSA-011 | POST | `/dsa/leads` | `leads.create:own` | DSA, SUPER | own | — | No | DATA_MUTATION_LEAD |
| API-DSA-012 | GET | `/dsa/leads` | `leads.read:own` | DSA, SUPER | own | — | No | DATA_ACCESS_LEAD |
| API-DSA-013 | GET | `/dsa/leads/{id}` | `leads.read:own` | DSA, SUPER | own | — | No | DATA_ACCESS_LEAD |
| API-DSA-014 | POST | `/dsa/leads/{id}/documents` | `documents.upload:own` | DSA, SUPER | own | SoD-04 | No | DATA_MUTATION_DOCUMENT |
| API-DSA-015 | GET | `/dsa/leads/{id}/followups` | `leads.read:own` | DSA, SUPER | own | — | No | DATA_ACCESS_LEAD |
| API-DSA-016 | GET | `/dsa/commissions` | `commissions.read:own` | DSA, SUPER | own | — | Yes | DATA_ACCESS_COMMISSION |
| API-DSA-017 | GET | `/dsa/commissions/ledger` | `commissions.read:own` | DSA, SUPER | own | — | Yes | DATA_ACCESS_COMMISSION |
| API-DSA-018 | GET | `/dsa/commissions/{id}` | `commissions.read:own` | DSA, SUPER | own | — | No | DATA_ACCESS_COMMISSION |
| API-DSA-019 | POST | `/dsa/commissions/disputes` | `commissions.update:own` | DSA, SUPER | own | — | No | FINANCIAL_COMMISSION_DISPUTE |
| API-DSA-020 | GET | `/dsa/payouts` | `commissions.read:own` | DSA, SUPER | own | — | Yes | DATA_ACCESS_COMMISSION |
| API-DSA-021 | GET | `/dsa/payouts/{id}` | `commissions.read:own` | DSA, SUPER | own | — | No | DATA_ACCESS_COMMISSION |
| API-DSA-022 | GET | `/dsa/performance` | `partners.read:own` | DSA, SUPER | own | — | No | DATA_ACCESS_PARTNER |
| API-DSA-023 | GET | `/dsa/leaderboard` | `partners.read:own` | DSA, SUPER | own | — | No | DATA_ACCESS_PARTNER |
| API-DSA-024 | GET | `/dsa/training` | `knowledge.read:own` | DSA, SUPER | own | — | No | DATA_ACCESS_KB |
| API-DSA-025 | POST | `/dsa/training/{id}/complete` | `partners.update:own` | DSA, SUPER | own | — | No | DATA_MUTATION_PARTNER |

---

## 5.6 REF — Referral (15 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
|--------|--------|----------|---------------------|---------------|------------|----------------|--------|-------------|
| API-REF-001 | GET | `/referral/code` | `referrals.read:own` | CUST, REF, SUPER | own | — | No | DATA_ACCESS_REFERRAL |
| API-REF-002 | POST | `/referral/share` | `referrals.create:own` | CUST, REF, SUPER | own | — | No | DATA_MUTATION_REFERRAL |
| API-REF-003 | GET | `/referral/tracking` | `referrals.read:own` | CUST, REF, SUPER | own | — | No | DATA_ACCESS_REFERRAL |
| API-REF-004 | GET | `/referral/rewards` | `referrals.read:own` | CUST, REF, SUPER | own | — | No | DATA_ACCESS_REFERRAL |
| API-REF-005 | GET | `/referral/leaderboard` | `referrals.read:own` | CUST, REF, SUPER | own | — | No | DATA_ACCESS_REFERRAL |
| API-REF-006 | GET | `/public/referral/{code}` | `public` | PUBLIC | — | — | No | DATA_ACCESS_REFERRAL |
| API-REF-007 | POST | `/public/referral/{code}/register` | `public` | PUBLIC | — | — | No | DATA_MUTATION_REFERRAL |
| API-REF-008 | GET | `/crm/referrals` | `referrals.read:branch` | BRANCH, REGIONAL, ADMIN, SUPER | branch | — | No | DATA_ACCESS_REFERRAL |
| API-REF-009 | GET | `/crm/referrals/{id}` | `referrals.read:branch` | BRANCH, REGIONAL, ADMIN, SUPER | branch | — | No | DATA_ACCESS_REFERRAL |
| API-REF-010 | GET | `/crm/referral-rewards` | `referrals.read:branch` | BRANCH, REGIONAL, ADMIN, SUPER | branch | — | No | DATA_ACCESS_REFERRAL |
| API-REF-011 | POST | `/crm/referral-rewards/{id}/approve` | `referrals.approve:branch` | BRANCH, REGIONAL, ADMIN, SUPER | branch | Yes | No | FINANCIAL_REFERRAL_APPROVE |
| API-REF-012 | GET | `/admin/referral-rules` | `referrals.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_REFERRAL_RULES |
| API-REF-013 | PUT | `/admin/referral-rules` | `referrals.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_REFERRAL_RULES |
| API-REF-014 | GET | `/analytics/referrals` | `analytics.read:branch` | BRANCH, REGIONAL, BIZ, SALES-H, ADMIN, SUPER | branch | — | Masked | DATA_ACCESS_ANALYTICS |
| API-REF-015 | GET | `/referral/payouts` | `referrals.read:own` | CUST, REF, SUPER | own | — | Yes | DATA_ACCESS_REFERRAL |

---

## 5.7 EMP — Employee (10 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-EMP-001 | GET | `/crm/employees` | `employees.read:branch` | BRANCH, REGIONAL, ADMIN, SUPER | branch | — | No | DATA_ACCESS_EMPLOYEE |
| API-EMP-002 | GET | `/crm/employees/{id}` | `employees.read:branch` | BRANCH, REGIONAL, ADMIN, SUPER | branch | — | No | DATA_ACCESS_EMPLOYEE |
| API-EMP-003 | GET | `/crm/employees/me` | `employees.read:own` | ALL (employees) | own | — | No | DATA_ACCESS_EMPLOYEE |
| API-EMP-004 | POST | `/admin/employees` | `employees.create:all` | ADMIN, SUPER | organization | — | No | DATA_MUTATION_EMPLOYEE |
| API-EMP-005 | PATCH | `/admin/employees/{id}` | `employees.update:all` | ADMIN, SUPER | organization | — | No | DATA_MUTATION_EMPLOYEE |
| API-EMP-006 | POST | `/admin/employees/{id}/deactivate` | `employees.delete:all` | ADMIN, SUPER | organization | — | No | DATA_MUTATION_EMPLOYEE |
| API-EMP-007 | GET | `/crm/employees/{id}/reporting` | `employees.read:branch` | BRANCH, REGIONAL, ADMIN, SUPER | branch | — | No | DATA_ACCESS_EMPLOYEE |
| API-EMP-008 | GET | `/crm/employees/{id}/pipeline` | `employees.read:assigned` | SALES, RM, BRANCH, REGIONAL, SUPER | assigned | — | No | DATA_ACCESS_LEAD |
| API-EMP-009 | GET | `/crm/employees/{id}/targets` | `employees.read:branch` | BRANCH, REGIONAL, SALES-H, ADMIN, SUPER | branch | — | No | DATA_ACCESS_EMPLOYEE |
| API-EMP-010 | POST | `/admin/employees/bulk-import` | `employees.create:all` | ADMIN, SUPER | organization | — | No | DATA_MUTATION_EMPLOYEE |

---

## 5.8 BRN — Branch & Regional (11 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-BRN-001 | GET | `/branch/dashboard` | `analytics.generate:branch` | BRANCH, REGIONAL, SUPER | branch | — | No | DATA_ACCESS_ANALYTICS |
| API-BRN-002 | GET | `/branch/funnel` | `analytics.read:branch` | BRANCH, REGIONAL, SUPER | branch | — | No | DATA_ACCESS_ANALYTICS |
| API-BRN-003 | GET | `/branch/team` | `employees.read:branch` | BRANCH, REGIONAL, SUPER | branch | — | No | DATA_ACCESS_EMPLOYEE |
| API-BRN-004 | GET | `/branch/partners` | `partners.read:branch` | BRANCH, REGIONAL, SUPER | branch | — | No | DATA_ACCESS_PARTNER |
| API-BRN-005 | GET | `/regional/dashboard` | `analytics.generate:region` | REGIONAL, SUPER | region | — | No | DATA_ACCESS_ANALYTICS |
| API-BRN-006 | GET | `/regional/branches` | `analytics.read:region` | REGIONAL, SUPER | region | — | No | DATA_ACCESS_ANALYTICS |
| API-BRN-007 | GET | `/admin/branches` | `branches.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_BRANCH |
| API-BRN-008 | POST | `/admin/branches` | `branches.create:all` | ADMIN, SUPER | organization | — | No | CONFIG_BRANCH_CREATE |
| API-BRN-009 | PATCH | `/admin/branches/{id}` | `branches.update:all` | ADMIN, SUPER | organization | — | No | CONFIG_BRANCH_UPDATE |
| API-BRN-010 | GET | `/admin/regions` | `branches.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_BRANCH |
| API-BRN-011 | POST | `/admin/regions` | `branches.create:all` | ADMIN, SUPER | organization | — | No | CONFIG_BRANCH_CREATE |

---

## 5.9 PRD — Products & Lenders (14 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-PRD-001 | GET | `/public/products` | `public` | PUBLIC | — | — | No | DATA_ACCESS_PRODUCT |
| API-PRD-002 | GET | `/public/products/{code}` | `public` | PUBLIC | — | — | No | DATA_ACCESS_PRODUCT |
| API-PRD-003 | GET | `/public/products/{code}/variants` | `public` | PUBLIC | — | — | No | DATA_ACCESS_PRODUCT |
| API-PRD-004 | GET | `/public/products/families` | `public` | PUBLIC | — | — | No | DATA_ACCESS_PRODUCT |
| API-PRD-005 | POST | `/public/products/compare` | `public` | PUBLIC | — | — | No | DATA_ACCESS_PRODUCT |
| API-PRD-006 | GET | `/admin/products` | `products.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_PRODUCT |
| API-PRD-007 | POST | `/admin/products` | `products.create:all` | ADMIN, SUPER | organization | — | No | CONFIG_PRODUCT_CREATE |
| API-PRD-008 | PATCH | `/admin/products/{id}` | `products.update:all` | ADMIN, SUPER | organization | — | No | CONFIG_PRODUCT_UPDATE |
| API-PRD-009 | POST | `/admin/products/{id}/variants` | `products.create:all` | ADMIN, SUPER | organization | — | No | CONFIG_PRODUCT_UPDATE |
| API-PRD-010 | GET | `/admin/products/{id}/document-rules` | `products.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_PRODUCT |
| API-PRD-011 | GET | `/admin/products/{id}/eligibility-rules` | `products.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_PRODUCT |
| API-PRD-012 | GET | `/admin/lenders` | `lender_policies.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_LENDER |
| API-PRD-013 | GET | `/admin/lenders/{id}/policies` | `lender_policies.read:all` | ADMIN, SUPER, CREDIT, OPS | organization | — | No | DATA_ACCESS_LENDER |
| API-PRD-014 | POST | `/admin/lenders/{id}/policies` | `lender_policies.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_LENDER_POLICY |

---

## 5.10 ELG — Eligibility (6 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-ELG-001 | POST | `/public/eligibility/preview` | `public` | PUBLIC | — | — | No | DATA_ACCESS_ELIGIBILITY |
| API-ELG-002 | POST | `/eligibility/check` | `eligibility.create:scoped` | CUST, SALES, RM, DSA, SUPER | own/assigned | — | No | DATA_MUTATION_ELIGIBILITY |
| API-ELG-003 | GET | `/eligibility/check/{id}` | `eligibility.read:scoped` | CUST, SALES, RM, CREDIT, SUPER | scoped | — | No | DATA_ACCESS_ELIGIBILITY |
| API-ELG-004 | GET | `/applications/{id}/eligibility` | `eligibility.read:scoped` | ALL (scoped) | scoped | — | No | DATA_ACCESS_ELIGIBILITY |
| API-ELG-005 | POST | `/applications/{id}/eligibility/recheck` | `eligibility.update:assigned` | SALES, CREDIT, OPS, BRANCH, SUPER | assigned | — | No | DATA_MUTATION_ELIGIBILITY |
| API-ELG-006 | GET | `/credit/eligibility/queue` | `eligibility.read:organization` | CREDIT, COMP-E, COMP-M, SUPER | organization | — | No | DATA_ACCESS_ELIGIBILITY |

---

## 5.11 EMI — EMI Calculator (5 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-EMI-001 | POST | `/public/emi/calculate` | `public` | PUBLIC | — | — | No | DATA_ACCESS_EMI |
| API-EMI-002 | POST | `/emi/calculate` | `emi.read:scoped` | CUST, SALES, RM, SUPER | own/assigned | — | No | DATA_ACCESS_EMI |
| API-EMI-003 | POST | `/public/emi/eligibility` | `public` | PUBLIC | — | — | No | DATA_ACCESS_EMI |
| API-EMI-004 | POST | `/public/emi/compare` | `public` | PUBLIC | — | — | No | DATA_ACCESS_EMI |
| API-EMI-005 | POST | `/public/emi/savings` | `public` | PUBLIC | — | — | No | DATA_ACCESS_EMI |

---

## 5.12 LED — Leads (15 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-LED-001 | GET | `/crm/leads` | `leads.read:assigned` | SALES, RM, BRANCH, REGIONAL, ADMIN, SUPER | assigned/branch | — | No | DATA_ACCESS_LEAD |
| API-LED-002 | GET | `/crm/leads/{id}` | `leads.read:assigned` | SALES, RM, BRANCH, REGIONAL, ADMIN, SUPER | assigned | — | No | DATA_ACCESS_LEAD |
| API-LED-003 | POST | `/crm/leads` | `leads.create:branch` | SALES, BRANCH, ADMIN, SUPER | branch | — | No | DATA_MUTATION_LEAD |
| API-LED-004 | PATCH | `/crm/leads/{id}` | `leads.update:assigned` | SALES, BRANCH, SUPER | assigned | — | No | DATA_MUTATION_LEAD |
| API-LED-005 | POST | `/crm/leads/{id}/assign` | `leads.assign:branch` | BRANCH, REGIONAL, ADMIN, SUPER | branch | — | No | WORKFLOW_LEAD_ASSIGN |
| API-LED-006 | POST | `/crm/leads/{id}/qualify` | `leads.update:assigned` | SALES, BRANCH, SUPER | assigned | — | No | WORKFLOW_LEAD_QUALIFY |
| API-LED-007 | POST | `/crm/leads/{id}/convert` | `leads.update:assigned` | SALES, BRANCH, SUPER | assigned | — | No | WORKFLOW_LEAD_CONVERT |
| API-LED-008 | GET | `/crm/leads/{id}/activities` | `leads.read:assigned` | SALES, RM, BRANCH, SUPER | assigned | — | No | DATA_ACCESS_LEAD |
| API-LED-009 | POST | `/crm/leads/{id}/activities` | `leads.update:assigned` | SALES, BRANCH, SUPER | assigned | — | No | DATA_MUTATION_LEAD |
| API-LED-010 | GET | `/crm/leads/{id}/notes` | `leads.read:assigned` | SALES, RM, BRANCH, SUPER | assigned | — | No | DATA_ACCESS_LEAD |
| API-LED-011 | POST | `/crm/leads/{id}/notes` | `leads.update:assigned` | SALES, BRANCH, SUPER | assigned | — | No | DATA_MUTATION_LEAD |
| API-LED-012 | POST | `/crm/leads/{id}/followups` | `leads.update:assigned` | SALES, BRANCH, SUPER | assigned | — | No | DATA_MUTATION_LEAD |
| API-LED-013 | GET | `/crm/leads/{id}/score` | `leads.read:assigned` | SALES, RM, BRANCH, SUPER | assigned | — | No | DATA_ACCESS_LEAD |
| API-LED-014 | POST | `/crm/leads/bulk-assign` | `leads.assign:branch` | BRANCH, REGIONAL, ADMIN, SUPER | branch | — | No | WORKFLOW_LEAD_ASSIGN |
| API-LED-015 | GET | `/crm/leads/sla-alerts` | `leads.read:branch` | SALES, BRANCH, REGIONAL, OPS-H, SUPER | branch | — | No | DATA_ACCESS_LEAD |

---

## 5.13 LMS — Lead Management System (8 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-LMS-001 | GET | `/crm/lms/funnel` | `analytics.read:branch` | BRANCH, REGIONAL, SALES-H, ADMIN, SUPER | branch | — | No | DATA_ACCESS_ANALYTICS |
| API-LMS-002 | GET | `/crm/lms/sources` | `analytics.read:branch` | BRANCH, REGIONAL, ADMIN, SUPER | branch | — | No | DATA_ACCESS_ANALYTICS |
| API-LMS-003 | GET | `/crm/lms/sla` | `analytics.read:branch` | BRANCH, REGIONAL, OPS-H, ADMIN, SUPER | branch | — | No | DATA_ACCESS_ANALYTICS |
| API-LMS-004 | GET | `/crm/lms/assignment-rules` | `leads.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_LMS_RULES |
| API-LMS-005 | PUT | `/crm/lms/assignment-rules` | `leads.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_LMS_RULES |
| API-LMS-006 | GET | `/crm/lms/scoring-config` | `leads.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_LMS_RULES |
| API-LMS-007 | GET | `/crm/lms/conversion-rate` | `analytics.read:branch` | BRANCH, REGIONAL, ADMIN, SUPER | branch | — | No | DATA_ACCESS_ANALYTICS |
| API-LMS-008 | POST | `/crm/lms/export` | `leads.export:branch` | BRANCH, REGIONAL, ADMIN, SUPER | branch | — | Yes | SECURITY_BULK_EXPORT |

---

## 5.14 LOS — Loan Origination System (14 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-LOS-001 | GET | `/crm/los/stages` | `applications.read:branch` | SALES, RM, CREDIT, OPS, BRANCH, REGIONAL, ADMIN, SUPER | branch | — | No | DATA_ACCESS_APPLICATION |
| API-LOS-002 | GET | `/crm/los/queues/sales` | `applications.read:assigned` | SALES, RM, BRANCH, SUPER | assigned | — | No | DATA_ACCESS_APPLICATION |
| API-LOS-003 | GET | `/credit/queue` | `applications.read:organization` | CREDIT, COMP-E, BRANCH, REGIONAL, ADMIN, SUPER | organization | — | No | DATA_ACCESS_APPLICATION |
| API-LOS-004 | GET | `/ops/queue` | `applications.read:organization` | OPS, BRANCH, REGIONAL, ADMIN, SUPER | organization | — | No | DATA_ACCESS_APPLICATION |
| API-LOS-005 | POST | `/applications/{id}/stage` | `applications.update:assigned` | SALES, CREDIT, OPS, BRANCH, SUPER | assigned | — | No | WORKFLOW_STAGE_ADVANCE |
| API-LOS-006 | GET | `/applications/{id}/timeline` | `applications.read:scoped` | ALL (scoped) | scoped | — | No | DATA_ACCESS_APPLICATION |
| API-LOS-007 | POST | `/credit/applications/{id}/review` | `applications.approve:assigned` | CREDIT, SUPER | assigned | Yes | No | WORKFLOW_CREDIT_REVIEW |
| API-LOS-008 | POST | `/ops/applications/{id}/lender-submit` | `applications.update:assigned` | OPS, SUPER | assigned | SoD-02 | No | WORKFLOW_LENDER_SUBMIT |
| API-LOS-009 | POST | `/ops/applications/{id}/sanction` | `applications.update:assigned` | OPS, SUPER | assigned | Yes | No | WORKFLOW_SANCTION_RECORD |
| API-LOS-010 | POST | `/ops/applications/{id}/disbursement` | `applications.approve:assigned` | OPS, SUPER | assigned | Yes | No | WORKFLOW_DISBURSEMENT |
| API-LOS-011 | POST | `/applications/{id}/reject` | `applications.reject:assigned` | SALES, CREDIT, OPS, BRANCH, SUPER | assigned | Yes | No | WORKFLOW_APPLICATION_REJECT |
| API-LOS-012 | POST | `/applications/{id}/withdraw` | `applications.update:own` | CUST, SALES, SUPER | own/assigned | — | No | WORKFLOW_APPLICATION_WITHDRAW |
| API-LOS-013 | POST | `/applications/{id}/exception` | `applications.escalate:assigned` | SALES, CREDIT, BRANCH, SUPER | assigned | — | No | WORKFLOW_EXCEPTION_REQUEST |
| API-LOS-014 | GET | `/crm/los/sla` | `analytics.read:branch` | BRANCH, REGIONAL, OPS-H, ADMIN, SUPER | branch | — | No | DATA_ACCESS_ANALYTICS |

---

## 5.15 APP — Applications (20 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-APP-001 | GET | `/customer/applications` | `applications.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_APPLICATION |
| API-APP-002 | POST | `/customer/applications` | `applications.create:own` | CUST, SUPER | own | — | No | DATA_MUTATION_APPLICATION |
| API-APP-003 | GET | `/customer/applications/{id}` | `applications.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_APPLICATION |
| API-APP-004 | PATCH | `/customer/applications/{id}` | `applications.update:own` | CUST, SUPER | own | — | No | DATA_MUTATION_APPLICATION |
| API-APP-005 | POST | `/customer/applications/{id}/submit` | `applications.update:own` | CUST, SUPER | own | — | No | WORKFLOW_APPLICATION_SUBMIT |
| API-APP-006 | POST | `/customer/applications/{id}/withdraw` | `applications.update:own` | CUST, SUPER | own | — | No | WORKFLOW_APPLICATION_WITHDRAW |
| API-APP-007 | GET | `/customer/applications/{id}/timeline` | `applications.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_APPLICATION |
| API-APP-008 | GET | `/customer/applications/{id}/sanction` | `applications.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_APPLICATION |
| API-APP-009 | GET | `/customer/applications/{id}/disbursement` | `applications.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_APPLICATION |
| API-APP-010 | GET | `/crm/applications` | `applications.read:assigned` | SALES, RM, CREDIT, OPS, BRANCH, REGIONAL, ADMIN, SUPER | assigned/branch | — | No | DATA_ACCESS_APPLICATION |
| API-APP-011 | GET | `/crm/applications/{id}` | `applications.read:scoped` | SALES, RM, CREDIT, OPS, BRANCH, REGIONAL, COMP-E, COMP-M, ADMIN, SUPER | scoped | — | No | DATA_ACCESS_APPLICATION |
| API-APP-012 | GET | `/crm/applications/{id}/summary` | `applications.read:scoped` | SALES, RM, CREDIT, OPS, BRANCH, REGIONAL, ADMIN, SUPER | scoped | — | No | DATA_ACCESS_APPLICATION |
| API-APP-013 | GET | `/crm/applications/{id}/eligibility` | `eligibility.read:scoped` | SALES, RM, CREDIT, OPS, BRANCH, SUPER | scoped | — | No | DATA_ACCESS_ELIGIBILITY |
| API-APP-014 | GET | `/crm/applications/{id}/documents` | `documents.read:scoped` | SALES, RM, CREDIT, OPS, BRANCH, SUPER | scoped | — | No | DATA_ACCESS_DOCUMENT |
| API-APP-015 | GET | `/crm/applications/{id}/credit` | `applications.read:scoped` | SALES, RM, CREDIT, OPS, BRANCH, COMP-E, SUPER | scoped | — | No | DATA_ACCESS_APPLICATION |
| API-APP-016 | GET | `/crm/applications/{id}/lender` | `applications.read:scoped` | CREDIT, OPS, BRANCH, REGIONAL, ADMIN, SUPER | scoped | — | No | DATA_ACCESS_APPLICATION |
| API-APP-017 | POST | `/crm/applications/{id}/assign` | `applications.assign:branch` | BRANCH, REGIONAL, ADMIN, SUPER | branch | — | No | WORKFLOW_APP_ASSIGN |
| API-APP-018 | GET | `/applications/{id}/product-details` | `applications.read:scoped` | ALL (scoped) | scoped | — | No | DATA_ACCESS_APPLICATION |
| API-APP-019 | PATCH | `/applications/{id}/product-details` | `applications.update:scoped` | CUST, SALES, RM, SUPER | scoped | — | No | DATA_MUTATION_APPLICATION |
| API-APP-020 | GET | `/customer/applications/draft` | `applications.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_APPLICATION |

---

## 5.16 DOC — Documents (12 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-DOC-001 | POST | `/documents/presign` | `documents.upload:scoped` | CUST, DSA, SALES, RM, CREDIT, OPS, SUPER | scoped | — | No | DATA_MUTATION_DOCUMENT |
| API-DOC-002 | POST | `/documents/confirm` | `documents.upload:scoped` | CUST, DSA, SALES, RM, CREDIT, OPS, SUPER | scoped | — | No | DATA_MUTATION_DOCUMENT |
| API-DOC-003 | GET | `/documents/{id}` | `documents.read:scoped` | ALL (scoped) | scoped | — | No | DATA_ACCESS_DOCUMENT |
| API-DOC-004 | GET | `/documents/{id}/download` | `documents.download:scoped` | ALL (scoped) | scoped | — | Yes | DATA_ACCESS_DOCUMENT |
| API-DOC-005 | GET | `/documents/{id}/versions` | `documents.read:scoped` | CREDIT, OPS, COMP-E, COMP-M, ADMIN, SUPER | scoped | — | No | DATA_ACCESS_DOCUMENT |
| API-DOC-006 | GET | `/applications/{id}/documents` | `documents.read:scoped` | ALL (scoped) | scoped | — | No | DATA_ACCESS_DOCUMENT |
| API-DOC-007 | GET | `/applications/{id}/documents/status` | `documents.read:scoped` | ALL (scoped) | scoped | — | No | DATA_ACCESS_DOCUMENT |
| API-DOC-008 | GET | `/credit/documents/queue` | `documents.verify:assigned` | CREDIT, COMP-E, SUPER | organization | — | No | DATA_ACCESS_DOCUMENT |
| API-DOC-009 | POST | `/credit/documents/{id}/verify` | `documents.verify:assigned` | CREDIT, COMP-E, SUPER | assigned | Yes | No | WORKFLOW_DOCUMENT_VERIFY |
| API-DOC-010 | POST | `/crm/documents/{id}/deficiency` | `documents.update:assigned` | SALES, CREDIT, OPS, SUPER | assigned | — | No | WORKFLOW_DOC_DEFICIENCY |
| API-DOC-011 | POST | `/ops/documents/package` | `documents.download:assigned` | OPS, SUPER | assigned | — | Yes | DATA_ACCESS_DOCUMENT |
| API-DOC-012 | DELETE | `/documents/{id}` | `documents.delete:own` | CUST, DSA, SALES, SUPER | own | — | No | DATA_MUTATION_DOCUMENT |

---

## 5.17 OCR — Document OCR (4 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-OCR-001 | POST | `/documents/{id}/ocr` | `documents.verify:assigned` | CREDIT, SUPER | assigned | — | No | DATA_MUTATION_DOCUMENT |
| API-OCR-002 | GET | `/documents/{id}/ocr` | `documents.read:scoped` | SALES, RM, CREDIT, OPS, SUPER | scoped | — | No | DATA_ACCESS_DOCUMENT |
| API-OCR-003 | GET | `/credit/ocr/queue` | `documents.verify:assigned` | CREDIT, SUPER | organization | — | No | DATA_ACCESS_DOCUMENT |
| API-OCR-004 | POST | `/credit/ocr/{id}/review` | `documents.verify:assigned` | CREDIT, SUPER | assigned | Yes | No | WORKFLOW_OCR_REVIEW |

---

## 5.18 KYC — Know Your Customer (12 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-KYC-001 | GET | `/customer/kyc/status` | `kyc.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_PII |
| API-KYC-002 | POST | `/customer/kyc/pan` | `kyc.update:own` | CUST, SUPER | own | — | No | DATA_MUTATION_PII |
| API-KYC-003 | POST | `/customer/kyc/pan/verify` | `kyc.update:own` | CUST, SUPER | own | — | No | WORKFLOW_KYC_VERIFY |
| API-KYC-004 | POST | `/customer/kyc/aadhaar/send-otp` | `kyc.update:own` | CUST, SUPER | own | — | No | DATA_MUTATION_PII |
| API-KYC-005 | POST | `/customer/kyc/aadhaar/verify` | `kyc.update:own` | CUST, SUPER | own | — | No | WORKFLOW_KYC_VERIFY |
| API-KYC-006 | POST | `/customer/kyc/photo` | `kyc.update:own` | CUST, SUPER | own | — | No | DATA_MUTATION_PII |
| API-KYC-007 | POST | `/customer/kyc/address-proof` | `kyc.update:own` | CUST, SUPER | own | — | No | DATA_MUTATION_PII |
| API-KYC-008 | GET | `/crm/customers/{id}/kyc` | `kyc.read:scoped` | SALES, RM, CREDIT, COMP-E, COMP-M, ADMIN, SUPER | scoped | — | No | DATA_ACCESS_PII |
| API-KYC-009 | GET | `/compliance/kyc/queue` | `kyc.verify:organization` | COMP-E, COMP-M, SUPER | organization | — | No | DATA_ACCESS_PII |
| API-KYC-010 | POST | `/compliance/kyc/{id}/review` | `kyc.verify:organization` | COMP-E, COMP-M, SUPER | organization | Yes | No | WORKFLOW_KYC_REVIEW |
| API-KYC-011 | GET | `/compliance/kyc/audit-logs` | `kyc.audit:organization` | COMP-E, COMP-M, SUPER | organization | — | No | AUDIT_KYC_ACCESS |
| API-KYC-012 | POST | `/customer/kyc/video-kyc/schedule` | `kyc.update:own` | CUST, SUPER | own | — | No | WORKFLOW_KYC_SCHEDULE |

---

## 5.19 AI — AI Advisor & Copilot (10 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-AI-001 | POST | `/ai/advisor/sessions` | `ai.use:own` | CUST, SUPER | own | — | No | DATA_ACCESS_AI |
| API-AI-002 | GET | `/ai/advisor/sessions` | `ai.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_AI |
| API-AI-003 | GET | `/ai/advisor/sessions/{id}` | `ai.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_AI |
| API-AI-004 | POST | `/ai/advisor/sessions/{id}/messages` | `ai.use:own` | CUST, SUPER | own | — | No | DATA_MUTATION_AI |
| API-AI-005 | GET | `/ai/advisor/sessions/{id}/messages` | `ai.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_AI |
| API-AI-006 | GET | `/ai/advisor/recommendations` | `ai.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_AI |
| API-AI-007 | POST | `/ai/advisor/recommendations/{id}/apply` | `ai.use:own` | CUST, SUPER | own | — | No | WORKFLOW_AI_RECOMMENDATION |
| API-AI-008 | POST | `/ai/advisor/eligibility` | `ai.use:own` | CUST, SUPER | own | — | No | DATA_MUTATION_AI |
| API-AI-009 | GET | `/ai/advisor/insights` | `ai.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_AI |
| API-AI-010 | POST | `/ai/copilot` | `ai.use:assigned` | SALES, SUPER | assigned | — | No | DATA_MUTATION_AI |

---

## 5.20 VOC — AI Voice (8 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-VOC-001 | POST | `/voice/sessions` | `voice.use:own` | CUST, SUPER | own | — | No | DATA_MUTATION_AI |
| API-VOC-002 | GET | `/voice/sessions/{id}` | `voice.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_AI |
| API-VOC-003 | GET | `/voice/sessions/{id}/token` | `voice.use:own` | CUST, SUPER | own | — | No | DATA_ACCESS_AI |
| API-VOC-004 | POST | `/voice/sessions/{id}/end` | `voice.use:own` | CUST, SUPER | own | — | No | DATA_MUTATION_AI |
| API-VOC-005 | GET | `/voice/sessions/{id}/summary` | `voice.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_AI |
| API-VOC-006 | POST | `/voice/callback` | `voice.use:own` | CUST, SUPER | own | — | No | DATA_MUTATION_AI |
| API-VOC-007 | POST | `/voice/appointments` | `voice.use:own` | CUST, SUPER | own | — | No | DATA_MUTATION_AI |
| API-VOC-008 | GET | `/voice/sessions` | `voice.read:own` | CUST, SUPER | own | — | No | DATA_ACCESS_AI |

---

## 5.21 CHT — Chat (6 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-CHT-001 | POST | `/support/chat/sessions` | `support.create:own` | CUST, DSA, REF, SUPER | own | — | No | DATA_MUTATION_SUPPORT |
| API-CHT-002 | POST | `/support/chat/sessions/{id}/messages` | `support.update:scoped` | ALL (scoped) | scoped | — | No | DATA_MUTATION_SUPPORT |
| API-CHT-003 | GET | `/support/chat/sessions/{id}/messages` | `support.read:scoped` | ALL (scoped) | scoped | — | No | DATA_ACCESS_SUPPORT |
| API-CHT-004 | GET | `/crm/support/chat/queue` | `support.read:branch` | SUPP-E, SUPP-M, ADMIN, SUPER | branch | — | No | DATA_ACCESS_SUPPORT |
| API-CHT-005 | POST | `/crm/support/chat/sessions/{id}/accept` | `support.update:assigned` | SUPP-E, SUPP-M, SUPER | assigned | — | No | WORKFLOW_CHAT_ACCEPT |
| API-CHT-006 | POST | `/crm/support/chat/sessions/{id}/close` | `support.close:assigned` | SUPP-E, SUPP-M, SUPER | assigned | — | No | WORKFLOW_CHAT_CLOSE |

---

## 5.22 NTF — Notifications (10 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-NTF-001 | GET | `/notifications` | `notifications.read:own` | ALL | own | — | No | DATA_ACCESS_NOTIFICATION |
| API-NTF-002 | POST | `/notifications/{id}/read` | `notifications.update:own` | ALL | own | — | No | DATA_MUTATION_NOTIFICATION |
| API-NTF-003 | POST | `/notifications/read-all` | `notifications.update:own` | ALL | own | — | No | DATA_MUTATION_NOTIFICATION |
| API-NTF-004 | GET | `/notifications/unread-count` | `notifications.read:own` | ALL | own | — | No | DATA_ACCESS_NOTIFICATION |
| API-NTF-005 | GET | `/notifications/preferences` | `notifications.read:own` | ALL | own | — | No | DATA_ACCESS_NOTIFICATION |
| API-NTF-006 | PATCH | `/notifications/preferences` | `notifications.update:own` | ALL | own | — | No | DATA_MUTATION_NOTIFICATION |
| API-NTF-007 | GET | `/notifications/history/sms` | `notifications.read:own` | ALL | own | — | No | DATA_ACCESS_NOTIFICATION |
| API-NTF-008 | GET | `/notifications/history/email` | `notifications.read:own` | ALL | own | — | No | DATA_ACCESS_NOTIFICATION |
| API-NTF-009 | GET | `/notifications/history/whatsapp` | `notifications.read:own` | ALL | own | — | No | DATA_ACCESS_NOTIFICATION |
| API-NTF-010 | POST | `/notifications/devices` | `notifications.update:own` | CUST, DSA, REF, SUPER | own | — | No | DATA_MUTATION_NOTIFICATION |

---

## 5.23 WA — WhatsApp (6 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-WA-001 | POST | `/webhooks/whatsapp` | `webhook.whatsapp:service` | SERVICE | — | — | No | DATA_MUTATION_NOTIFICATION |
| API-WA-002 | POST | `/webhooks/whatsapp/status` | `webhook.whatsapp:service` | SERVICE | — | — | No | DATA_MUTATION_NOTIFICATION |
| API-WA-003 | GET | `/admin/whatsapp/templates` | `campaigns.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_CAMPAIGN |
| API-WA-004 | POST | `/admin/whatsapp/templates` | `campaigns.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_CAMPAIGN |
| API-WA-005 | POST | `/crm/comms/whatsapp/send` | `notifications.create:assigned` | SALES, RM, SUPP-E, SUPP-M, SUPER | assigned | — | No | DATA_MUTATION_NOTIFICATION |
| API-WA-006 | GET | `/crm/comms/whatsapp/logs` | `notifications.read:branch` | SALES, RM, BRANCH, SUPP-M, ADMIN, SUPER | branch | — | No | DATA_ACCESS_NOTIFICATION |

---

## 5.24 CMP — Campaigns (10 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-CMP-001 | GET | `/admin/campaigns` | `campaigns.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_CAMPAIGN |
| API-CMP-002 | POST | `/admin/campaigns` | `campaigns.create:all` | ADMIN, SUPER | organization | — | No | DATA_MUTATION_CAMPAIGN |
| API-CMP-003 | GET | `/admin/campaigns/{id}` | `campaigns.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_CAMPAIGN |
| API-CMP-004 | PATCH | `/admin/campaigns/{id}` | `campaigns.update:all` | ADMIN, SUPER | organization | — | No | DATA_MUTATION_CAMPAIGN |
| API-CMP-005 | POST | `/admin/campaigns/{id}/audience` | `campaigns.update:all` | ADMIN, SUPER | organization | — | No | DATA_MUTATION_CAMPAIGN |
| API-CMP-006 | POST | `/admin/campaigns/{id}/schedule` | `campaigns.approve:all` | ADMIN, SUPER | organization | Yes | No | WORKFLOW_CAMPAIGN_SCHEDULE |
| API-CMP-007 | POST | `/admin/campaigns/{id}/launch` | `campaigns.approve:all` | ADMIN, SUPER | organization | Yes | No | WORKFLOW_CAMPAIGN_LAUNCH |
| API-CMP-008 | POST | `/admin/campaigns/{id}/pause` | `campaigns.update:all` | ADMIN, SUPER | organization | — | No | WORKFLOW_CAMPAIGN_PAUSE |
| API-CMP-009 | GET | `/analytics/campaigns/{id}` | `analytics.read:branch` | BRANCH, REGIONAL, BIZ, ADMIN, SUPER | branch | — | Masked | DATA_ACCESS_ANALYTICS |
| API-CMP-010 | GET | `/analytics/campaigns` | `analytics.read:branch` | BRANCH, REGIONAL, BIZ, ADMIN, SUPER | branch | — | Masked | DATA_ACCESS_ANALYTICS |

---

## 5.25 COM — Commissions & Payouts (17 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-COM-001 | GET | `/crm/commissions/ledger` | `commissions.read:branch` | BRANCH, REGIONAL, FIN, ADMIN, SUPER | branch | — | No | DATA_ACCESS_COMMISSION |
| API-COM-002 | GET | `/crm/commissions/{id}` | `commissions.read:branch` | BRANCH, REGIONAL, FIN, ADMIN, SUPER | branch | — | No | DATA_ACCESS_COMMISSION |
| API-COM-003 | GET | `/crm/commissions/approvals` | `commissions.approve:branch` | BRANCH, REGIONAL, FIN, SUPER | branch | — | No | DATA_ACCESS_COMMISSION |
| API-COM-004 | POST | `/crm/commissions/{id}/approve` | `commissions.approve:branch` | BRANCH, REGIONAL, SUPER | branch | Yes | No | FINANCIAL_COMMISSION_APPROVE |
| API-COM-005 | POST | `/crm/commissions/{id}/reject` | `commissions.reject:branch` | BRANCH, REGIONAL, SUPER | branch | Yes | No | FINANCIAL_COMMISSION_REJECT |
| API-COM-006 | GET | `/crm/commissions/disputes` | `commissions.read:branch` | BRANCH, REGIONAL, FIN, SUPER | branch | — | No | DATA_ACCESS_COMMISSION |
| API-COM-007 | POST | `/crm/commissions/disputes/{id}/resolve` | `commissions.approve:branch` | BRANCH, REGIONAL, SUPER | branch | Yes | No | FINANCIAL_COMMISSION_DISPUTE |
| API-COM-008 | GET | `/finance/payouts` | `commissions.read:branch` | FIN, BRANCH, REGIONAL, ADMIN, SUPER | organization | — | No | DATA_ACCESS_COMMISSION |
| API-COM-009 | POST | `/finance/payouts` | `commissions.approve:all` | FIN, SUPER | organization | Yes | No | FINANCIAL_PAYOUT_CREATE |
| API-COM-010 | GET | `/finance/payouts/{id}` | `commissions.read:branch` | FIN, BRANCH, REGIONAL, ADMIN, SUPER | organization | — | No | DATA_ACCESS_COMMISSION |
| API-COM-011 | POST | `/finance/payouts/{id}/approve` | `commissions.approve:all` | FIN, SUPER | organization | Yes | No | FINANCIAL_PAYOUT_APPROVE |
| API-COM-012 | POST | `/finance/payouts/{id}/execute` | `commissions.approve:all` | FIN, SUPER | organization | Yes | No | FINANCIAL_PAYOUT_EXECUTE |
| API-COM-013 | GET | `/admin/commission-rules` | `commissions.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_COMMISSION_RULES |
| API-COM-014 | POST | `/admin/commission-rules` | `commissions.configure:all` | ADMIN, FIN, SUPER | organization | SoD-03 | No | CONFIG_COMMISSION_RULES |
| API-COM-015 | PATCH | `/admin/commission-rules/{id}` | `commissions.configure:all` | ADMIN, FIN, SUPER | organization | SoD-03 | No | CONFIG_COMMISSION_RULES |
| API-COM-016 | POST | `/crm/commissions/clawbacks` | `commissions.approve:all` | FIN, SUPER | organization | Yes | No | FINANCIAL_COMMISSION_CLAWBACK |
| API-COM-017 | GET | `/analytics/commissions` | `analytics.read:branch` | BRANCH, REGIONAL, FIN, BIZ, ADMIN, SUPER | branch | — | Masked | DATA_ACCESS_ANALYTICS |

---

## 5.26 ANA — Analytics (15 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-ANA-001 | GET | `/analytics/hub` | `analytics.read:scoped` | SALES, RM, BRANCH, REGIONAL, MGMT, ADMIN, SUPER | scoped | — | No | DATA_ACCESS_ANALYTICS |
| API-ANA-002 | GET | `/analytics/revenue` | `analytics.read:branch` | BRANCH, REGIONAL, FIN, BIZ, CEO, ADMIN, SUPER | branch/aggregated | — | Masked | DATA_ACCESS_ANALYTICS |
| API-ANA-003 | GET | `/analytics/leads/funnel` | `analytics.read:branch` | SALES, BRANCH, REGIONAL, SALES-H, ADMIN, SUPER | branch | — | Masked | DATA_ACCESS_ANALYTICS |
| API-ANA-004 | GET | `/analytics/conversion` | `analytics.read:branch` | BRANCH, REGIONAL, SALES-H, ADMIN, SUPER | branch | — | Masked | DATA_ACCESS_ANALYTICS |
| API-ANA-005 | GET | `/analytics/branches/{id}` | `analytics.read:branch` | BRANCH, REGIONAL, ADMIN, SUPER | branch | — | Masked | DATA_ACCESS_ANALYTICS |
| API-ANA-006 | GET | `/analytics/regional` | `analytics.read:region` | REGIONAL, SALES-H, CEO, ADMIN, SUPER | region | — | Masked | DATA_ACCESS_ANALYTICS |
| API-ANA-007 | GET | `/analytics/partners` | `analytics.read:branch` | BRANCH, REGIONAL, SALES-H, BIZ, ADMIN, SUPER | branch | — | Masked | DATA_ACCESS_ANALYTICS |
| API-ANA-008 | GET | `/analytics/products` | `analytics.read:branch` | BRANCH, REGIONAL, BIZ, ADMIN, SUPER | branch | — | Masked | DATA_ACCESS_ANALYTICS |
| API-ANA-009 | GET | `/analytics/lenders` | `analytics.read:branch` | OPS, OPS-H, CREDIT, BRANCH, ADMIN, SUPER | branch | — | Masked | DATA_ACCESS_ANALYTICS |
| API-ANA-010 | GET | `/analytics/sla` | `analytics.read:branch` | BRANCH, REGIONAL, OPS-H, ADMIN, SUPER | branch | — | Masked | DATA_ACCESS_ANALYTICS |
| API-ANA-011 | GET | `/analytics/ai` | `analytics.read:all` | ADMIN, CEO, BIZ, SUPER | organization | — | Masked | DATA_ACCESS_ANALYTICS |
| API-ANA-012 | GET | `/analytics/reports` | `reports.read:scoped` | BRANCH, REGIONAL, COMP-M, MGMT, ADMIN, SUPER | scoped | — | No | DATA_ACCESS_REPORT |
| API-ANA-013 | POST | `/analytics/reports/generate` | `reports.generate:scoped` | BRANCH, REGIONAL, COMP-M, MGMT, ADMIN, SUPER | scoped | — | Yes | DATA_MUTATION_REPORT |
| API-ANA-014 | GET | `/analytics/reports/{id}/download` | `reports.read:scoped` | BRANCH, REGIONAL, COMP-M, MGMT, ADMIN, SUPER | scoped | — | Yes | SECURITY_BULK_EXPORT |
| API-ANA-015 | GET | `/management/analytics/executive` | `analytics.read:aggregated` | CEO, DIR, BIZ, SALES-H, OPS-H, FIN, SUPER | aggregated | SoD-11 | Masked | DATA_ACCESS_ANALYTICS |


## 5.27 Extended Domain Reconciliation (DSH, SUP, TKT, KB, SET, AUD, ADM, LEN, WHK)

Appendix A catalog entries 313–324 are representative samples. API Specification §28–34 and Webhook sections define the **full extended catalog** below. All 87 extended endpoints are mapped here for complete 324-API coverage.

### 5.27.1 DSH — Dashboard APIs (20 APIs)

**Permission standard:** `analytics.generate:{scope}`

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-DSH-001 | GET | `/crm/dashboard/sales` | `analytics.generate:assigned` | SALES, SUPER | assigned | — | No | DATA_ACCESS_ANALYTICS |
| API-DSH-002 | GET | `/crm/dashboard/rm` | `analytics.generate:portfolio` | RM, SUPER | portfolio | — | No | DATA_ACCESS_ANALYTICS |
| API-DSH-003 | GET | `/crm/dashboard/credit` | `analytics.generate:organization` | CREDIT, COMP-E, SUPER | organization | — | No | DATA_ACCESS_ANALYTICS |
| API-DSH-004 | GET | `/crm/dashboard/ops` | `analytics.generate:organization` | OPS, SUPER | organization | — | No | DATA_ACCESS_ANALYTICS |
| API-DSH-005 | GET | `/branch/dashboard` | `analytics.generate:branch` | BRANCH, REGIONAL, SUPER | branch | — | No | DATA_ACCESS_ANALYTICS |
| API-DSH-006 | GET | `/regional/dashboard` | `analytics.generate:region` | REGIONAL, SUPER | region | — | No | DATA_ACCESS_ANALYTICS |
| API-DSH-007 | GET | `/support/dashboard` | `analytics.generate:organization` | SUPP-E, SUPP-M, ADMIN, SUPER | organization | — | No | DATA_ACCESS_ANALYTICS |
| API-DSH-008 | GET | `/compliance/dashboard` | `analytics.generate:organization` | COMP-E, COMP-M, CEO, DIR, SUPER | organization | — | No | DATA_ACCESS_ANALYTICS |
| API-DSH-009 | GET | `/admin/dashboard` | `analytics.generate:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_ANALYTICS |
| API-DSH-010 | GET | `/management/dashboard` | `analytics.generate:aggregated` | CEO, DIR, BIZ, SALES-H, OPS-H, FIN, SUPER | aggregated | SoD-11 | Masked | DATA_ACCESS_ANALYTICS |
| API-DSH-011 | GET | `/management/ceo` | `analytics.generate:aggregated` | CEO, DIR, SUPER | aggregated | SoD-11 | Masked | DATA_ACCESS_ANALYTICS |
| API-DSH-012 | GET | `/management/director` | `analytics.generate:aggregated` | DIR, CEO, SUPER | aggregated | SoD-11 | Masked | DATA_ACCESS_ANALYTICS |
| API-DSH-013 | GET | `/management/business` | `analytics.generate:aggregated` | BIZ, CEO, SUPER | aggregated | SoD-11 | Masked | DATA_ACCESS_ANALYTICS |
| API-DSH-014 | GET | `/management/sales` | `analytics.generate:aggregated` | SALES-H, CEO, SUPER | aggregated | SoD-11 | Masked | DATA_ACCESS_ANALYTICS |
| API-DSH-015 | GET | `/management/operations` | `analytics.generate:aggregated` | OPS-H, CEO, SUPER | aggregated | SoD-11 | Masked | DATA_ACCESS_ANALYTICS |
| API-DSH-016 | GET | `/management/finance` | `analytics.generate:aggregated` | FIN, CEO, SUPER | aggregated | SoD-11 | Masked | DATA_ACCESS_ANALYTICS |
| API-DSH-017 | GET | `/management/board-pack` | `analytics.generate:aggregated` | CEO, FIN, DIR, SUPER | aggregated | SoD-11 | Masked | DATA_ACCESS_ANALYTICS |
| API-DSH-018 | GET | `/management/forecast` | `analytics.generate:aggregated` | CEO, BIZ, SUPER | aggregated | SoD-11 | Masked | DATA_ACCESS_ANALYTICS |
| API-DSH-019 | GET | `/dsa/dashboard` | `analytics.generate:own` | DSA, SUPER | own | — | No | DATA_ACCESS_ANALYTICS |
| API-DSH-020 | GET | `/customer/dashboard` | `analytics.generate:own` | CUST, SUPER | own | — | No | DATA_ACCESS_ANALYTICS |

**Reconciliation note:** API-DSH-019 aliases API-DSA-001; API-DSH-020 aliases API-CUS-017. Same permission mapping applies.

### 5.27.2 SUP — Support APIs (8 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-SUP-001 | POST | `/support/tickets` | `support.create:own` | CUST, DSA, REF, SALES, RM, SUPER | own | — | No | DATA_MUTATION_SUPPORT |
| API-SUP-002 | GET | `/support/tickets` | `support.read:own` | CUST, DSA, REF, ALL (external) | own | — | No | DATA_ACCESS_SUPPORT |
| API-SUP-003 | GET | `/support/tickets/{id}` | `support.read:scoped` | ALL (scoped) | scoped | — | No | DATA_ACCESS_SUPPORT |
| API-SUP-004 | GET | `/support/faqs` | `knowledge.read:own` | PUBLIC, ALL | — | — | No | DATA_ACCESS_KB |
| API-SUP-005 | GET | `/support/faqs/{id}` | `public` | PUBLIC | — | — | No | DATA_ACCESS_KB |
| API-SUP-006 | GET | `/support/categories` | `public` | PUBLIC | — | — | No | DATA_ACCESS_KB |
| API-SUP-007 | POST | `/support/csat` | `support.update:own` | CUST, DSA, REF, SUPER | own | — | No | DATA_MUTATION_SUPPORT |
| API-SUP-008 | GET | `/crm/support/tickets` | `support.read:branch` | SUPP-E, SUPP-M, BRANCH, ADMIN, SUPER | branch | — | No | DATA_ACCESS_SUPPORT |

### 5.27.3 TKT — Ticket Management APIs (12 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-TKT-001 | PATCH | `/crm/support/tickets/{id}` | `support.update:assigned` | SUPP-E, SUPP-M, SUPER | assigned | — | No | DATA_MUTATION_SUPPORT |
| API-TKT-002 | POST | `/crm/support/tickets/{id}/assign` | `support.assign:branch` | SUPP-M, BRANCH, ADMIN, SUPER | branch | — | No | WORKFLOW_TICKET_ASSIGN |
| API-TKT-003 | POST | `/crm/support/tickets/{id}/messages` | `support.update:assigned` | SUPP-E, SUPP-M, SUPER | assigned | — | No | DATA_MUTATION_SUPPORT |
| API-TKT-004 | GET | `/crm/support/tickets/{id}/messages` | `support.read:scoped` | ALL (scoped) | scoped | — | No | DATA_ACCESS_SUPPORT |
| API-TKT-005 | POST | `/crm/support/tickets/{id}/escalate` | `support.escalate:assigned` | SUPP-E, SUPP-M, SUPER | assigned | — | No | WORKFLOW_TICKET_ESCALATE |
| API-TKT-006 | POST | `/crm/support/tickets/{id}/resolve` | `support.close:assigned` | SUPP-E, SUPP-M, SUPER | assigned | — | No | WORKFLOW_TICKET_RESOLVE |
| API-TKT-007 | POST | `/crm/support/tickets/{id}/reopen` | `support.reopen:branch` | SUPP-M, BRANCH, ADMIN, SUPER | branch | — | No | WORKFLOW_TICKET_REOPEN |
| API-TKT-008 | GET | `/crm/support/escalations` | `support.read:branch` | SUPP-M, BRANCH, ADMIN, SUPER | branch | — | No | DATA_ACCESS_SUPPORT |
| API-TKT-009 | GET | `/crm/support/sla` | `support.read:branch` | SUPP-M, BRANCH, OPS-H, ADMIN, SUPER | branch | — | No | DATA_ACCESS_ANALYTICS |
| API-TKT-010 | GET | `/crm/support/agents/performance` | `support.read:branch` | SUPP-M, BRANCH, ADMIN, SUPER | branch | — | Masked | DATA_ACCESS_ANALYTICS |
| API-TKT-011 | GET | `/admin/support/templates` | `support.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_SUPPORT |
| API-TKT-012 | POST | `/admin/support/templates` | `support.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_SUPPORT |

### 5.27.4 KB — Knowledge Base APIs (16 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-KB-001 | GET | `/knowledge/articles` | `knowledge.read:own` | PUBLIC, ALL | — | — | No | DATA_ACCESS_KB |
| API-KB-002 | GET | `/knowledge/articles/{slug}` | `knowledge.read:own` | PUBLIC, ALL | — | — | No | DATA_ACCESS_KB |
| API-KB-003 | GET | `/knowledge/faqs` | `knowledge.read:own` | PUBLIC, ALL | — | — | No | DATA_ACCESS_KB |
| API-KB-004 | GET | `/knowledge/search` | `knowledge.read:own` | PUBLIC, ALL | — | — | No | DATA_ACCESS_KB |
| API-KB-005 | GET | `/knowledge/categories` | `knowledge.read:own` | PUBLIC, ALL | — | — | No | DATA_ACCESS_KB |
| API-KB-006 | GET | `/dsa/knowledge/scripts` | `knowledge.read:own` | DSA, SUPER | own | — | No | DATA_ACCESS_KB |
| API-KB-007 | GET | `/dsa/knowledge/training` | `knowledge.read:own` | DSA, SUPER | own | — | No | DATA_ACCESS_KB |
| API-KB-008 | GET | `/admin/knowledge/articles` | `knowledge.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_KB |
| API-KB-009 | POST | `/admin/knowledge/articles` | `knowledge.create:all` | ADMIN, SUPER | organization | — | No | DATA_MUTATION_KB |
| API-KB-010 | PATCH | `/admin/knowledge/articles/{id}` | `knowledge.update:all` | ADMIN, SUPER | organization | — | No | DATA_MUTATION_KB |
| API-KB-011 | POST | `/admin/knowledge/articles/{id}/publish` | `knowledge.approve:all` | ADMIN, SUPER | organization | Yes | No | WORKFLOW_KB_PUBLISH |
| API-KB-012 | GET/POST/PATCH/DELETE | `/admin/knowledge/faqs` | `knowledge.manage:all` | ADMIN, SUPER | organization | — | No | DATA_MUTATION_KB |
| API-KB-013 | GET/POST/PATCH/DELETE | `/admin/knowledge/sops` | `knowledge.manage:all` | ADMIN, SUPER | organization | — | No | DATA_MUTATION_KB |
| API-KB-014 | GET/POST/PATCH/DELETE | `/admin/knowledge/policies` | `knowledge.manage:all` | ADMIN, SUPER | organization | — | No | DATA_MUTATION_KB |
| API-KB-015 | GET | `/admin/knowledge/rag-sources` | `knowledge.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_KB |
| API-KB-016 | POST | `/admin/knowledge/rag-sources/{id}/reindex` | `knowledge.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_AI_RAG |

### 5.27.5 SET — Settings APIs (12 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-SET-001 | GET | `/admin/settings/system` | `settings.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_SETTINGS |
| API-SET-002 | PATCH | `/admin/settings/system` | `settings.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_SETTINGS |
| API-SET-003 | GET | `/admin/settings/products/{id}` | `settings.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_SETTINGS |
| API-SET-004 | PATCH | `/admin/settings/products/{id}` | `settings.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_SETTINGS |
| API-SET-005 | GET | `/admin/settings/notifications` | `settings.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_SETTINGS |
| API-SET-006 | PATCH | `/admin/settings/notifications` | `settings.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_SETTINGS |
| API-SET-007 | GET | `/admin/settings/security` | `security.read:all` | SUPER | all | — | No | DATA_ACCESS_SETTINGS |
| API-SET-008 | PATCH | `/admin/settings/security` | `security.configure:all` | SUPER | all | — | No | CONFIG_SECURITY |
| API-SET-009 | GET | `/admin/settings/ai` | `ai.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_SETTINGS |
| API-SET-010 | PATCH | `/admin/settings/ai` | `ai.configure:all` | SUPER | all | — | No | CONFIG_AI |
| API-SET-011 | GET | `/admin/workflows` | `settings.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_SETTINGS |
| API-SET-012 | PUT | `/admin/workflows` | `settings.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_WORKFLOW |

**Business rule:** API-SET-007/008 (security) and API-SET-010 (AI config write) are **Super Admin exclusive** per RBAC §16.2, §17.2.

### 5.27.6 AUD — Audit APIs (8 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-AUD-001 | GET | `/compliance/audit-logs` | `audit.read:organization` | COMP-E, COMP-M, SUPER | organization | — | No | AUDIT_LOG_ACCESS |
| API-AUD-002 | GET | `/compliance/audit-logs/{id}` | `audit.read:organization` | COMP-E, COMP-M, SUPER | organization | — | No | AUDIT_LOG_ACCESS |
| API-AUD-003 | GET | `/compliance/access-logs` | `audit.read:organization` | COMP-E, COMP-M, SUPER | organization | — | No | AUDIT_PII_ACCESS |
| API-AUD-004 | GET | `/compliance/change-logs` | `audit.read:organization` | COMP-E, COMP-M, SUPER | organization | — | No | AUDIT_CHANGE_LOG |
| API-AUD-005 | GET | `/compliance/approval-logs` | `audit.read:organization` | COMP-E, COMP-M, SUPER | organization | — | No | AUDIT_APPROVAL_LOG |
| API-AUD-006 | GET | `/compliance/security-events` | `audit.read:organization` | COMP-E, COMP-M, SUPER | organization | — | No | AUDIT_SECURITY_EVENT |
| API-AUD-007 | POST | `/compliance/security-events/{id}/resolve` | `audit.update:organization` | COMP-M, SUPER | organization | Yes | No | AUDIT_SECURITY_RESOLVE |
| API-AUD-008 | POST | `/compliance/audit-logs/export` | `audit.export:organization` | COMP-M, SUPER | organization | Yes | Yes | SECURITY_BULK_EXPORT |

### 5.27.7 ADM — Admin Platform APIs (18 APIs)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-ADM-001 | GET | `/admin/roles` | `rbac.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_RBAC |
| API-ADM-002 | GET | `/admin/roles/{id}` | `rbac.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_RBAC |
| API-ADM-003 | PUT | `/admin/roles/{id}/permissions` | `rbac.configure:all` | SUPER | all | SoD-10 | No | CONFIG_RBAC_CHANGE |
| API-ADM-004 | GET | `/admin/permissions` | `rbac.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_RBAC |
| API-ADM-005 | GET | `/admin/users` | `users.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_USER |
| API-ADM-006 | GET | `/admin/integrations/health` | `settings.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_SETTINGS |
| API-ADM-007 | POST | `/admin/integrations/{name}/test` | `settings.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_INTEGRATION |
| API-ADM-008 | GET | `/admin/master-data/countries` | `settings.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_SETTINGS |
| API-ADM-009 | GET | `/admin/master-data/states` | `settings.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_SETTINGS |
| API-ADM-010 | GET | `/admin/master-data/banks` | `settings.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_SETTINGS |
| API-ADM-011 | GET | `/admin/master-data/vehicle-makes` | `settings.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_SETTINGS |
| API-ADM-012 | GET | `/admin/master-data/vehicle-models` | `settings.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_SETTINGS |
| API-ADM-013 | GET | `/admin/feature-flags` | `settings.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_SETTINGS |
| API-ADM-014 | PATCH | `/admin/feature-flags` | `settings.configure:all` | ADMIN, SUPER | organization | — | No | CONFIG_FEATURE_FLAG |
| API-ADM-015 | GET | `/admin/system/health` | `settings.read:all` | ADMIN, SUPER | organization | — | No | DATA_ACCESS_SETTINGS |
| API-ADM-016 | POST | `/admin/system/cache/clear` | `settings.configure:all` | SUPER | all | — | No | CONFIG_SYSTEM |
| API-ADM-017 | POST | `/admin/data/export` | `data.export:all` | SUPER | all | Yes | Yes | SECURITY_BULK_EXPORT |
| API-ADM-018 | POST | `/admin/data/import` | `data.create:all` | SUPER | all | — | No | CONFIG_DATA_IMPORT |

### 5.27.8 LEN — Lender Portal APIs (6 APIs, Phase 3)

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-LEN-001 | POST | `/lender/auth/login` | `public` | LENDER institutions | — | — | No | AUTH_LOGIN_ATTEMPT |
| API-LEN-002 | GET | `/lender/applications` | `applications.read:lender` | LENDER, SUPER | lender-scoped | — | No | DATA_ACCESS_APPLICATION |
| API-LEN-003 | GET | `/lender/applications/{id}` | `applications.read:lender` | LENDER, SUPER | lender-scoped | — | No | DATA_ACCESS_APPLICATION |
| API-LEN-004 | GET | `/lender/applications/{id}/documents` | `documents.download:lender` | LENDER, SUPER | lender-scoped | — | Yes | DATA_ACCESS_DOCUMENT |
| API-LEN-005 | POST | `/lender/applications/{id}/status` | `applications.update:lender` | LENDER, SUPER | lender-scoped | — | No | WORKFLOW_LENDER_STATUS |
| API-LEN-006 | POST | `/lender/applications/{id}/query` | `applications.update:lender` | LENDER, SUPER | lender-scoped | — | No | WORKFLOW_LENDER_QUERY |

**Isolation:** All LEN endpoints enforce SoD-12 — lender A cannot access lender B application data.

### 5.27.9 WHK — Webhook APIs (5 APIs) + Health

| API ID | Method | Endpoint | Required Permission | Allowed Roles | Data Scope | Approval Right | Export | Audit Event |
| -------- | -------- | ---------- | --------------------- | --------------- | ------------ | ---------------- | -------- | ------------- |
| API-WHK-001 | POST | `/webhooks/whatsapp` | `webhook.whatsapp:service` | SERVICE (BSP API key) | — | — | No | DATA_MUTATION_NOTIFICATION |
| API-WHK-002 | POST | `/webhooks/sms/delivery` | `webhook.sms:service` | SERVICE (SMS provider) | — | — | No | DATA_MUTATION_NOTIFICATION |
| API-WHK-003 | POST | `/webhooks/payment` | `webhook.payment:service` | SERVICE (payment gateway) | — | — | No | FINANCIAL_PAYOUT_CONFIRM |
| API-WHK-004 | POST | `/webhooks/kyc` | `webhook.kyc:service` | SERVICE (KYC provider) | — | — | No | WORKFLOW_KYC_VERIFY |
| API-WHK-005 | POST | `/webhooks/lender` | `webhook.lender:service` | SERVICE (lender systems) | — | — | No | WORKFLOW_LENDER_STATUS |
| API-HEALTH-001 | GET | `/health` | `public` | PUBLIC | — | — | No | — |

### 5.27.10 API Count Reconciliation

| Source | Count | Notes |
|--------|-------|-------|
| Appendix A (API-AUTH-001 → API-ANA-015) | 312 | Complete domain tables §5.1–5.26 |
| Extended (DSH 20 + SUP 8 + TKT 12 + KB 16 + SET 12 + AUD 8 + ADM 18 + LEN 6 + WHK 5 + HEALTH 1) | 106 | Overlap: DSH-019/020 alias DSA-001/CUS-017 |
| **Unique endpoints** | **324** | Per API Spec Appendix B total |
| Alias deduplication | −2 | DSH-019 = DSA-001; DSH-020 = CUS-017 |
| **Net catalog** | **324** | Includes Phase 3 lender + health |

---

# 6. SoD RULE → API MAPPING

| SoD Rule | Blocked Action | Blocked Role | Required Role | Affected API Endpoints |
|----------|---------------|--------------|---------------|------------------------|
| **SoD-01** | Approve credit | SALES | CREDIT | API-LOS-007 (`/credit/applications/{id}/review`) — SALES denied |
| **SoD-02** | Submit to lender | CREDIT | OPS | API-LOS-008 (`/ops/applications/{id}/lender-submit`) — CREDIT denied |
| **SoD-03** | Modify commission rules | OPS | ADMIN + FIN | API-COM-014, API-COM-015 — OPS denied; FIN + ADMIN required |
| **SoD-04** | Verify own lead docs | DSA | CREDIT | API-DOC-009 — DSA cannot verify; API-DSA-014 upload only |
| **SoD-05** | Bulk PII export | SUPP-E | COMP-M approval | API-LMS-008, API-ANA-014, API-AUD-008, API-ADM-017 — SUPP-E denied without COMP-M |
| **SoD-06** | Create Super Admin | ADMIN | SUPER | API-USR-005/009 with SUPER role — ADMIN blocked |
| **SoD-07** | Approve own commission dispute (>₹10K) | BRANCH | REGIONAL | API-COM-007 — BRANCH limited; REGIONAL required above threshold |
| **SoD-08** | Investigate own case | COMP-E (self) | Other analyst | API-KYC-010, fraud workflows — self-assignment blocked |
| **SoD-09** | Create + approve application | SALES | CREDIT/OPS | API-LOS-007 + API-APP-002 same actor — dual control enforced |
| **SoD-10** | Modify RBAC | ADMIN | SUPER | API-ADM-003, API-USR-009/010 (RBAC roles) — ADMIN read-only |
| **SoD-11** | Export raw customer data | MGMT | COMP-authorized | API-ANA-015, API-DSH-010–018, API-ANA-002–010 — aggregated/masked only |
| **SoD-12** | Cross-lender access | LENDER (other) | System isolation | API-LEN-002–006 — lender_id scope enforced |

---

# 7. ROLE SUMMARY MATRIX (22 Roles × Key Resources)

**Legend:** ● Full (scoped) | ◐ Read/Masked | ○ Aggregated only | — Denied

| Resource | CUST | REF | DSA | SALES | RM | CREDIT | OPS | BRANCH | REGIONAL | SUPP-E | SUPP-M | COMP-E | COMP-M | ADMIN | SUPER | MGMT |
|----------|------|-----|-----|-------|-----|--------|-----|--------|----------|--------|--------|--------|--------|-------|-------|------|
| Users | — | — | — | — | — | — | — | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ● | ● | — |
| Customers | ◐ | — | ◐ | ◐ | ◐ | ◐ | ◐ | ● | ● | ○ | ◐ | ◐ | ● | ◐ | ● | ○ |
| Partners | — | ◐ | ◐ | ○ | — | — | — | ● | ● | ○ | ◐ | ◐ | ● | ● | ● | ○ |
| Employees | — | — | — | — | — | — | — | ◐ | ◐ | — | ○ | — | ○ | ● | ● | ○ |
| Branches | — | — | — | — | — | — | — | ◐ | ◐ | — | — | — | ○ | ● | ● | ○ |
| Products | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ● | ● | ○ |
| Leads | ◐ | ◐ | ◐ | ● | ○ | ○ | ○ | ● | ● | ○ | ◐ | ◐ | ● | ● | ● | ○ |
| Applications | ◐ | — | ◐ | ● | ◐ | ● | ● | ● | ● | ○ | ◐ | ◐ | ● | ● | ● | ○ |
| Documents | ◐ | — | ◐ | ● | ◐ | ● | ● | ● | ● | ○ | ◐ | ● | ● | ◐ | ● | — |
| KYC | ◐ | ◐ | ◐ | ○ | ○ | ● | ○ | ● | ● | — | ○ | ● | ● | ◐ | ● | — |
| Eligibility | ○ | — | — | ○ | ○ | ● | ○ | ○ | ○ | — | — | ○ | ○ | ◐ | ● | ○ |
| EMI | ◐ | — | — | ○ | ◐ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ● | ○ |
| Referrals | ◐ | ● | — | — | ○ | — | — | ● | ● | — | — | ○ | ○ | ◐ | ● | ○ |
| Commissions | — | ◐ | ● | — | — | ○ | ◐ | ● | ● | — | — | ◐ | ● | ● | ● | ○ |
| Campaigns | — | — | — | — | — | — | — | ◐ | ◐ | — | — | — | ○ | ● | ● | ○ |
| Tickets | ◐ | ◐ | ◐ | ◐ | ◐ | ○ | ○ | ● | ○ | ● | ● | ◐ | ◐ | ● | ● | — |
| Notifications | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ● | ● | ◐ | ◐ | ◐ | ◐ | ● | ● | ◐ |
| Reports | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ● | ● | ◐ | ● | ● | ● | ● | ● | ● |
| Analytics | — | — | — | ○ | ○ | ○ | ○ | ● | ● | — | ○ | ○ | ◐ | ◐ | ● | ● |
| Knowledge Base | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ● | ● | ○ |
| Settings | — | — | — | — | — | — | — | — | — | — | — | ◐ | ◐ | ● | ● | — |
| Audit Logs | — | — | — | — | — | — | — | — | — | — | — | ◐ | ● | ◐ | ● | — |
| Lender Policies | — | — | — | ○ | — | ○ | ○ | ○ | ○ | — | — | ○ | ○ | ● | ● | ○ |
| AI (Advisor/Copilot) | ● | — | — | ◐ | — | — | — | — | — | — | — | — | — | ○ | ● | — |
| Disbursements | ◐ | ◐ | ◐ | ◐ | ◐ | ○ | ● | ● | ● | ○ | ◐ | ◐ | ● | ● | ● | ○ |

---

# 8. MANAGEMENT ROLE RESTRICTIONS (Aggregated-Only Endpoints)

Management roles (CEO, Director, Business Head, Sales Head, Ops Head, Finance Head) access **aggregated analytics only**. The following endpoints are explicitly restricted:

## 8.1 Allowed Management Endpoints (aggregated scope)

| API ID | Endpoint | Allowed Mgmt Roles |
|--------|----------|-------------------|
| API-DSH-010 | `/management/dashboard` | CEO, DIR, BIZ, SALES-H, OPS-H, FIN |
| API-DSH-011 | `/management/ceo` | CEO, DIR |
| API-DSH-012 | `/management/director` | DIR, CEO |
| API-DSH-013 | `/management/business` | BIZ, CEO |
| API-DSH-014 | `/management/sales` | SALES-H, CEO |
| API-DSH-015 | `/management/operations` | OPS-H, CEO |
| API-DSH-016 | `/management/finance` | FIN, CEO |
| API-DSH-017 | `/management/board-pack` | CEO, FIN, DIR |
| API-DSH-018 | `/management/forecast` | CEO, BIZ |
| API-ANA-015 | `/management/analytics/executive` | All MGMT roles |
| API-ANA-002 | `/analytics/revenue` | CEO, DIR, BIZ, FIN (aggregated response) |
| API-ANA-006 | `/analytics/regional` | CEO, SALES-H, DIR (aggregated) |
| API-ANA-011 | `/analytics/ai` | CEO, BIZ, DIR (aggregated) |
| API-ANA-012–014 | `/analytics/reports/*` | CEO, DIR (summary reports only) |

## 8.2 Denied Management Endpoints (raw PII / record-level)

| Category | Denied Endpoints | Rationale |
|----------|------------------|-----------|
| Customer PII | API-CUS-019–028, API-CUS-001–018 | No raw customer record access (RBAC §18.1) |
| CRM record detail | API-LED-*, API-APP-010–017 (record 360) | Record-level denied; use analytics |
| Documents | API-DOC-* | No document download (DV-04) |
| KYC | API-KYC-* | No KYC field access |
| Commission detail | API-COM-001–007 (record level) | Aggregated via API-ANA-017, API-DSH-016 only |
| Audit logs | API-AUD-* | Compliance function only |
| Admin/Settings | API-ADM-*, API-SET-* | No system configuration |
| RBAC | API-USR-004–010 | No user administration |

## 8.3 Management Export Rules

| Export Type | Allowed | Condition |
|-------------|---------|-----------|
| Board report pack | Yes | API-DSH-017; summary metrics only |
| Revenue forecast | Yes | API-DSH-018; region/product aggregates |
| Individual employee PII | **No** | Denied all MGMT roles |
| Raw customer export | **No** | SoD-11; requires COMP-M + CEO authorization |
| Drill-down to record | **No** | Cohort minimum n=5 enforced |

---

# 9. PARTNER ISOLATION RULES (DSA / Referral Scope)

## 9.1 DSA Partner Isolation (DV-02)

| Rule | Enforcement | APIs Affected |
|------|-------------|---------------|
| DSA sees only own leads | `leads.read:own` scope filter | API-DSA-011–015 |
| DSA sees only own commissions | `commissions.read:own` | API-DSA-016–021 |
| DSA cannot access CRM partner endpoints | Route guard `/crm/partners` denied | API-PTR-001–010 |
| DSA cannot verify documents (SoD-04) | `documents.verify` denied | API-DOC-009 blocked |
| DSA cannot see other DSA data | `partner_id = JWT.sub` predicate | All `/dsa/*` |
| DSA branch attribution | Leads tagged `source_partner_id` | API-DSA-011 create |

## 9.2 Referral Partner Isolation

| Rule | Enforcement | APIs Affected |
|------|-------------|---------------|
| Masked referral tracking | Field modifier `masked` on mobile/name | API-REF-003, API-REF-004 |
| Own rewards only | `referrals.read:own` | API-REF-001–005, API-REF-015 |
| No lead pipeline access | `/crm/leads` denied | API-LED-* blocked for REF |
| No commission config visibility | `/admin/commission-rules` denied | API-COM-013–015 blocked |
| Public registration isolated | Rate limit + branch attribution | API-REF-006, API-REF-007 |

## 9.3 Cross-Partner API Deny List

| Endpoint Pattern | DSA | REF | Rationale |
|------------------|-----|-----|-----------|
| `/crm/partners/{other}` | ✗ | ✗ | Partner 360 internal only |
| `/dsa/*` (other partner) | ✗ | ✗ | JWT partner scope |
| `/crm/commissions` (all) | ✗ | ✗ | Use own scope endpoints |
| `/crm/leads` (all) | ✗ | ✗ | REF has no lead mgmt; DSA uses `/dsa/leads` |

---

# 10. AI ENDPOINT PERMISSIONS

## 10.1 AI Advisor (Customer) — API-AI-001–009

| Permission | Scope | Roles | Business Rule |
|------------|-------|-------|---------------|
| `ai.use:own` | own | CUST | Advisory only — no auto-approve (BWO §AI) |
| `ai.read:own` | own | CUST | Session history own only |
| Rate limit | — | — | 50 req/hour/user |

**Restrictions:** PII not sent to LLM; RAG over published KB only; recommendations require explicit apply (API-AI-007).

## 10.2 AI Copilot (CRM) — API-AI-010

| Permission | Scope | Roles | Business Rule |
|------------|-------|-------|---------------|
| `ai.use:assigned` | assigned | SALES | Copilot for assigned leads/apps only |
| Rate limit | — | — | 200 req/hour/employee |

**Denied roles:** DSA, REF, MGMT, CUST (copilot is CRM-only).

## 10.3 AI Voice — API-VOC-001–008

| Permission | Scope | Roles | Feature Flag |
|------------|-------|-------|--------------|
| `voice.use:own` | own | CUST | `feature.voice_ai.enabled` |
| `voice.read:own` | own | CUST | Transcript stored; summary async |

## 10.4 AI Configuration & Analytics

| API | Permission | Roles |
|-----|------------|-------|
| API-SET-009 (read) | `ai.read:all` | ADMIN, SUPER |
| API-SET-010 (write) | `ai.configure:all` | SUPER only |
| API-ANA-011 | `analytics.read:all` | ADMIN, CEO, BIZ, SUPER |
| API-KB-016 | `knowledge.configure:all` | ADMIN, SUPER (RAG reindex) |

---

# 11. ADMIN / SUPER ADMIN ELEVATED PERMISSIONS

## 11.1 Admin (ROLE_ADMIN) — Elevated Access

| Capability | Permission | Key APIs |
|------------|------------|----------|
| User provisioning | `users.*:all` | API-USR-004–010, API-EMP-004–006, API-EMP-010 |
| Product catalog | `products.*:all` | API-PRD-006–014 |
| Campaign management | `campaigns.*:all` | API-CMP-001–008 |
| Commission rules (with FIN) | `commissions.configure:all` | API-COM-013–015 |
| Branch/region config | `branches.*:all` | API-BRN-007–011 |
| Knowledge CMS | `knowledge.*:all` | API-KB-008–016 |
| Operational settings | `settings.configure:all` | API-SET-001–006, API-SET-011–012 |
| RBAC read-only | `rbac.read:all` | API-ADM-001, 002, 004 |

## 11.2 Admin Restrictions (cannot)

| Restriction | SoD Rule | Blocked APIs |
|-------------|----------|--------------|
| Modify RBAC permissions | SoD-10 | API-ADM-003 |
| Security settings write | — | API-SET-007, API-SET-008 |
| AI config write | — | API-SET-010 |
| Create Super Admin | SoD-06 | API-USR-005/009 with SUPER role |
| Bulk PII export | — | API-ADM-017 (SUPER only) |
| Cache clear / data import | — | API-ADM-016, API-ADM-018 |

## 11.3 Super Admin (ROLE_SUPER_ADMIN) — Exclusive Permissions

| Permission | Resource | APIs |
|------------|----------|------|
| `rbac.configure:all` | RBAC | API-ADM-003 |
| `security.configure:all` | Security | API-SET-007, API-SET-008 |
| `ai.configure:all` | AI | API-SET-010 |
| `data.export:all` | Bulk export | API-ADM-017 |
| `data.create:all` | Data import | API-ADM-018 |
| `platform.kill_switch:all` | Emergency | (future admin endpoint) |
| `audit_logs.export:all` | Full audit | API-AUD-008 |
| `super_admin.create:all` | Privilege escalation | API-USR-005/009 |

**Governance:** Max 3 accounts; IP-restricted; 15-min session; enhanced audit on every call; weekly CEO/CTO review.

---

# 12. APPENDICES

## Appendix A: Audit Event Code Reference

| Event Code | Category | Retention | Trigger |
|------------|----------|-----------|---------|
| AUTH_OTP_SEND | Authentication | 2 yr | OTP requested |
| AUTH_LOGIN_SUCCESS | Authentication | 2 yr | Successful login |
| AUTH_LOGIN_ATTEMPT | Authentication | 2 yr | Login attempt |
| AUTH_MFA_VERIFY | Authentication | 2 yr | MFA completed |
| AUTH_TOKEN_REFRESH | Authentication | 2 yr | Token rotated |
| AUTH_LOGOUT | Authentication | 2 yr | Session ended |
| AUTH_SESSION_READ | Authentication | 2 yr | Session queried |
| AUTH_PASSWORD_RESET | Authentication | 2 yr | Password changed |
| AUTH_SESSION_REVOKE | Security | 10 yr | Session force-revoked |
| DATA_ACCESS_PII | Data Access | 5 yr | PII field read |
| DATA_ACCESS_DOCUMENT | Data Access | 5 yr | Document viewed |
| DATA_MUTATION_PII | Data Mutation | 5 yr | PII field changed |
| DATA_MUTATION_APPLICATION | Data Mutation | 5 yr | Application changed |
| WORKFLOW_STAGE_ADVANCE | Workflow | 8 yr | LOS stage transition |
| WORKFLOW_CREDIT_REVIEW | Workflow | 8 yr | Credit decision |
| WORKFLOW_DISBURSEMENT | Financial | 7 yr | Disbursement recorded |
| WORKFLOW_DOCUMENT_VERIFY | Workflow | 8 yr | Doc verified/rejected |
| FINANCIAL_COMMISSION_APPROVE | Financial | 7 yr | Commission approved |
| FINANCIAL_PAYOUT_EXECUTE | Financial | 7 yr | Payout executed |
| CONFIG_RBAC_CHANGE | Configuration | 7 yr | RBAC modified |
| CONFIG_SETTINGS | Configuration | 7 yr | Settings changed |
| COMPLIANCE_CONSENT_GRANT | Compliance | 10 yr | DPDP consent |
| COMPLIANCE_PARTNER_SUSPEND | Compliance | 10 yr | Partner suspended |
| SECURITY_BULK_EXPORT | Security | 10 yr | Bulk export executed |
| AUDIT_LOG_ACCESS | Authorization | 5 yr | Audit log queried |

## Appendix B: Permission String Quick Reference by Domain

| Domain | Common Permission Patterns |
|--------|---------------------------|
| AUTH | `public`, `auth.*:own` |
| CUS | `customers.*:own`, `customers.*:scoped` |
| DSA | `leads.*:own`, `commissions.*:own`, `partners.*:own` |
| CRM | `*.read:assigned`, `*.read:branch`, `*.update:assigned` |
| CREDIT | `applications.approve:assigned`, `documents.verify:assigned` |
| OPS | `applications.update:assigned`, `applications.approve:assigned` |
| COM | `commissions.*:branch`, `commissions.*:all` |
| MGMT | `analytics.read:aggregated`, `analytics.generate:aggregated` |
| ADMIN | `*.configure:all`, `*.read:all` |
| SUPER | `*.configure:all`, `*.*:all` |

## Appendix C: Workflow Stage → API Mapping (LOS)

| LOS Stage | Primary APIs | Approver Role |
|-----------|--------------|---------------|
| S01 Lead | API-LED-*, API-DSA-011 | SALES |
| S02 Application Created | API-APP-002, API-APP-005 | CUST, SALES |
| S03 Documents | API-DOC-*, API-KYC-* | CUST, SALES |
| S04 Eligibility | API-ELG-*, API-AI-008 | CREDIT (review) |
| S05 Credit Review | API-LOS-007 | CREDIT (SoD-01) |
| S06 Lender Submit | API-LOS-008 | OPS (SoD-02) |
| S07 Sanction | API-LOS-009 | OPS |
| S08 Disbursement | API-LOS-010 | OPS |
| S09 Closure | API-LOS-005, API-COM-* | System + FIN |

*Source: [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md)*

## Appendix D: JWT Permission Claims Example

```json
{
  "sub": "user-uuid",
  "userType": "EMPLOYEE",
  "roles": ["SALES_EXECUTIVE"],
  "permissions": [
    "leads.read:assigned",
    "leads.update:assigned",
    "applications.read:assigned",
    "applications.update:assigned",
    "customers.read:assigned",
    "ai.use:assigned"
  ],
  "scope": {
    "branchId": "uuid",
    "regionId": "uuid",
    "employeeId": "uuid"
  }
}
```

## Appendix E: Document Cross-Reference Index

| Document | Relationship |
|----------|-------------|
| [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) | Source of roles, permissions, SoD rules |
| [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md) | Source of endpoint catalog and permission hints |
| [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md) | Workflow stage and SoD business context |
| [KUBERONE_USER_TYPES_AND_ROLES.md](./KUBERONE_USER_TYPES_AND_ROLES.md) | Role personas and journey context |
| [KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md](./KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md) | Row-level security table mapping |

## Appendix F: Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | Kuber Finserve Security & Engineering | Initial RBAC→API Traceability Matrix — 324 APIs |

## Appendix G: Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CISO / Security Head | | | |
| Head of Engineering | | | |
| Compliance Officer | | | |
| CTO | | | |
| CEO / Managing Director | | | |

---

**© 2026 Kuber Finserve. Confidential — For Internal, Security, Engineering, and Compliance Use.**

*This document is the authoritative RBAC→API traceability matrix for KuberOne. All API authorization middleware, integration tests, and penetration test scopes must map to this document.*

*Related:*
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md)
- [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md)
- [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md)
