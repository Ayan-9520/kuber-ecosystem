# KuberOne
## API Catalog Reconciliation & OpenAPI Governance

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** API Governance — Catalog Reconciliation & OpenAPI Standards  
**Classification:** Board-Ready | Engineering Authoritative | CI/CD Enforceable  
**Version:** 1.0  
**Date:** June 2026  
**Base URL:** `https://api.kuberone.kuberfinserve.com/api/v1`  
**Related Documents:**
- [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md) — Source API definitions
- [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md) — §5.3 lead canonical mapping
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) — Permission framework
- [KUBERONE_ENTERPRISE_ARCHITECTURE_AUDIT_REPORT.md](./KUBERONE_ENTERPRISE_ARCHITECTURE_AUDIT_REPORT.md) — Audit findings P1 API gaps

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | API catalog reconciliation, deprecation policy, OpenAPI governance, RBAC alignment |
| **Audience** | API Architect, Backend, Mobile, CRM, QA, Security, DevOps |
| **Status** | Authoritative Governance Document |
| **Out of Scope** | OpenAPI YAML artifacts, source code, route implementation |

---

# 1. EXECUTIVE SUMMARY

The [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md) claims **324 total endpoints** with **312 Phase 1** entries in Appendix A and **12 sample rows** in Appendix B (entries #313–324). Enterprise audit and this reconciliation confirm a **material catalog gap**: Appendix B collapsed **106 domain-defined APIs** (Dashboard, Support, Ticket, Knowledge Base, Settings, Audit, Admin, Lender, Webhooks, Health) into **12 representative samples**, omitting **94 numbered catalog rows**.

| Metric | API Spec Claim | Reconciled Reality |
|--------|----------------|-------------------|
| Appendix A rows | 312 (complete) | **312 — verified complete** |
| Appendix B rows | 12 (samples) | **106 required** (DSH 20 + SUP 8 + TKT 12 + KB 16 + SET 12 + AUD 8 + ADM 18 + LEN 6 + WHK 5 + HEALTH 1) |
| Missing config APIs | Not listed | **+3 net-new** (scoring-config PUT, referrals submit, workflow POST) |
| Alias / duplicate IDs | Undocumented | **5** (4 dashboard + 1 webhook) |
| Deprecated legacy paths | Referenced externally | **3** (customer/leads, public/leads, referral/submit) |
| **Authoritative catalog total** | **324** | **421 API IDs** (#1–421) |

**Reconciliation policy:** The **324 headline statistic is retired**. The authoritative catalog is **421 API IDs** with explicit **Active**, **Alias**, and **Deprecated** status. Alias entries retain IDs for backward-compatible routing but are excluded from OpenAPI primary path documentation. Deprecated legacy paths are **not** assigned catalog IDs; they redirect to canonical endpoints per [Business Workflow §5.3](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md).

**Board recommendation:** Adopt this document as the API catalog authority. All OpenAPI generation, RBAC middleware mapping, client SDK contracts, and CI route validation must conform to the reconciled catalog in §3 and Appendix A.

---

# 2. RECONCILIATION FINDINGS

## 2.1 Missing from Appendix (Critical)

| Domain | API IDs | Count | Appendix A/B Status |
|--------|---------|-------|---------------------|
| DSH — Dashboard | API-DSH-001–020 | 20 | Body §28 defined; only 3 samples in Appendix B |
| SUP — Support | API-SUP-001–008 | 8 | Body §29 defined; 1 sample in Appendix B |
| TKT — Ticket | API-TKT-001–012 | 12 | Body §30 defined; 1 sample in Appendix B |
| KB — Knowledge Base | API-KB-001–016 | 16 | Body §31 defined; 1 sample in Appendix B |
| SET — Settings | API-SET-001–012 | 12 | Body §32 defined; 1 sample in Appendix B |
| AUD — Audit | API-AUD-001–008 | 8 | Body §33 defined; 1 sample in Appendix B |
| ADM — Admin | API-ADM-001–018 | 18 | Body §34 defined; 1 sample in Appendix B |
| LEN — Lender Portal | API-LEN-001–006 | 6 | Phase 3; 1 sample in Appendix B |
| WHK — Webhooks | API-WHK-001–005 | 5 | Body defined; 1 sample in Appendix B |
| HEALTH | API-HEALTH-001 | 1 | Appendix B only; not in body sections |
| **Subtotal omitted from numbered appendix** | | **106** | **94 rows missing beyond 12 samples** |

## 2.2 Duplicates (Same Path, Multiple API IDs)

| Duplicate API ID | Canonical API ID | Path | Resolution |
|------------------|------------------|------|------------|
| API-DSH-005 | API-BRN-001 (#106) | `GET /branch/dashboard` | DSH-005 → **Alias**; OpenAPI documents BRN-001 |
| API-DSH-006 | API-BRN-005 (#110) | `GET /regional/dashboard` | DSH-006 → **Alias** |
| API-DSH-019 | API-DSA-001 (#60) | `GET /dsa/dashboard` | DSH-019 → **Alias** |
| API-DSH-020 | API-CUS-017 (#38) | `GET /customer/dashboard` | DSH-020 → **Alias** |
| API-WA-001 | API-WHK-001 (#413) | `POST /webhooks/whatsapp` | WA-001 → **Alias**; WHK-001 canonical for webhooks domain |

## 2.3 Naming Conflicts

| Conflict | Documents | Resolution |
|----------|-----------|------------|
| `POST /referral/submit` vs `POST /referrals/submit` | RBAC, System Architecture vs Business Workflow §5.3 | Canonical: **`POST /referrals/submit`** (API-REF-016); legacy path **Deprecated** |
| `POST /customer/leads` vs `POST /customer/applications` | System Architecture vs API Spec + Workflow §5.3 | Canonical: **applications** (auto-creates lead); `/customer/leads` **Deprecated** |
| `POST /public/leads` vs `POST /crm/leads` | System Architecture vs Workflow §5.3 | Canonical: **`POST /crm/leads`** with `source=CAMPAIGN`; `/public/leads` **Deprecated** |
| Partner domain code `PTR` vs convention `DSA` | API ID uses PTR; domain list uses DSA for partner app | **PTR** = CRM partner management; **DSA** = partner self-service app |
| `GET /public/health` vs `GET /health` | Screen Planning C-001 references `/public/health` | Canonical: **`GET /health`** (API-HEALTH-001); screen client updated |

## 2.4 Deprecated Endpoints (Legacy, No Catalog ID)

| Legacy Path | Canonical Replacement | Channel | Sunset |
|-------------|----------------------|---------|--------|
| `POST /customer/leads` | `POST /customer/applications` | Customer App | v1.0 launch + 6 months |
| `POST /public/leads` | `POST /crm/leads` (`source=CAMPAIGN`) | Campaign/Public | v1.0 launch + 6 months |
| `POST /referral/submit` | `POST /referrals/submit` | Referral | v1.0 launch + 6 months |

Legacy paths return `301` with `Sunset` header during deprecation window; removed in **v2**.

## 2.5 Configuration API Gaps (Audit CONFLICT-05)

| Gap | Current State | Reconciled Addition |
|-----|---------------|---------------------|
| Scoring config write | API-LMS-006 GET only | **API-LMS-009** `PUT /crm/lms/scoring-config` |
| Referral submit canonical | Not in API spec body | **API-REF-016** `POST /referrals/submit` |
| Workflow config create | API-SET-011/012 GET+PUT only | **API-SET-013** `POST /admin/workflows` |

---

# 3. CANONICAL API CATALOG (#1–421)

*Complete reconciled catalog. Phase: **P1** = Phase 1, **P2** = Phase 2, **P3** = Phase 3. Status: **Active**, **Alias**, **Deprecated** (legacy paths in §2.4 have no ID).*

## 3.1 AUTH — Authentication (#1–11)

| # | API ID | Method | Path | Domain | Phase | Status |
|---|--------|--------|------|--------|-------|--------|
| 1 | API-AUTH-001 | POST | /auth/otp/send | AUTH | P1 | Active |
| 2 | API-AUTH-002 | POST | /auth/otp/verify | AUTH | P1 | Active |
| 3 | API-AUTH-003 | POST | /auth/login | AUTH | P1 | Active |
| 4 | API-AUTH-004 | POST | /auth/mfa/verify | AUTH | P1 | Active |
| 5 | API-AUTH-005 | POST | /auth/refresh | AUTH | P1 | Active |
| 6 | API-AUTH-006 | POST | /auth/logout | AUTH | P1 | Active |
| 7 | API-AUTH-007 | POST | /auth/forgot-password | AUTH | P1 | Active |
| 8 | API-AUTH-008 | POST | /auth/reset-password | AUTH | P1 | Active |
| 9 | API-AUTH-009 | GET | /auth/me | AUTH | P1 | Active |
| 10 | API-AUTH-010 | GET | /auth/sessions | AUTH | P1 | Active |
| 11 | API-AUTH-011 | DELETE | /auth/sessions/{id} | AUTH | P1 | Active |

## 3.2 USR — Users (#12–21)

| # | API ID | Method | Path | Domain | Phase | Status |
|---|--------|--------|------|--------|-------|--------|
| 12 | API-USR-001 | GET | /users/me | USR | P1 | Active |
| 13 | API-USR-002 | PATCH | /users/me | USR | P1 | Active |
| 14 | API-USR-003 | GET | /users/{id} | USR | P1 | Active |
| 15 | API-USR-004 | GET | /users | USR | P1 | Active |
| 16 | API-USR-005 | POST | /users | USR | P1 | Active |
| 17 | API-USR-006 | PATCH | /users/{id} | USR | P1 | Active |
| 18 | API-USR-007 | DELETE | /users/{id} | USR | P1 | Active |
| 19 | API-USR-008 | GET | /users/{id}/roles | USR | P1 | Active |
| 20 | API-USR-009 | POST | /users/{id}/roles | USR | P1 | Active |
| 21 | API-USR-010 | DELETE | /users/{id}/roles/{roleId} | USR | P1 | Active |

## 3.3 CUS — Customer (#22–49)

| # | API ID | Method | Path | Domain | Phase | Status |
|---|--------|--------|------|--------|-------|--------|
| 22 | API-CUS-001 | GET | /customer/profile | CUS | P1 | Active |
| 23 | API-CUS-002 | PATCH | /customer/profile | CUS | P1 | Active |
| 24 | API-CUS-003 | GET | /customer/profile/completion | CUS | P1 | Active |
| 25 | API-CUS-004 | GET | /customer/addresses | CUS | P1 | Active |
| 26 | API-CUS-005 | POST | /customer/addresses | CUS | P1 | Active |
| 27 | API-CUS-006 | PATCH | /customer/addresses/{id} | CUS | P1 | Active |
| 28 | API-CUS-007 | DELETE | /customer/addresses/{id} | CUS | P1 | Active |
| 29 | API-CUS-008 | GET | /customer/employment | CUS | P1 | Active |
| 30 | API-CUS-009 | POST | /customer/employment | CUS | P1 | Active |
| 31 | API-CUS-010 | GET | /customer/income | CUS | P1 | Active |
| 32 | API-CUS-011 | POST | /customer/income | CUS | P1 | Active |
| 33 | API-CUS-012 | GET | /customer/preferences | CUS | P1 | Active |
| 34 | API-CUS-013 | PATCH | /customer/preferences | CUS | P1 | Active |
| 35 | API-CUS-014 | GET | /customer/consents | CUS | P1 | Active |
| 36 | API-CUS-015 | POST | /customer/consents | CUS | P1 | Active |
| 37 | API-CUS-016 | POST | /customer/consents/{type}/revoke | CUS | P1 | Active |
| 38 | API-CUS-017 | GET | /customer/dashboard | CUS | P1 | Active |
| 39 | API-CUS-018 | GET | /customer/applications/summary | CUS | P1 | Active |
| 40 | API-CUS-019 | GET | /crm/customers | CUS | P1 | Active |
| 41 | API-CUS-020 | GET | /crm/customers/{id} | CUS | P1 | Active |
| 42 | API-CUS-021 | GET | /crm/customers/{id}/personal | CUS | P1 | Active |
| 43 | API-CUS-022 | GET | /crm/customers/{id}/kyc | CUS | P1 | Active |
| 44 | API-CUS-023 | GET | /crm/customers/{id}/applications | CUS | P1 | Active |
| 45 | API-CUS-024 | GET | /crm/customers/{id}/documents | CUS | P1 | Active |
| 46 | API-CUS-025 | GET | /crm/customers/{id}/interactions | CUS | P1 | Active |
| 47 | API-CUS-026 | POST | /crm/customers/{id}/interactions | CUS | P1 | Active |
| 48 | API-CUS-027 | GET | /crm/customers/{id}/cross-sell | CUS | P1 | Active |
| 49 | API-CUS-028 | POST | /crm/customers/merge | CUS | P1 | Active |

## 3.4 PTR — Partner CRM (#50–59) · DSA — Partner App (#60–84) · REF — Referral (#85–96, 280–283, 421)

| # | API ID | Method | Path | Domain | Phase | Status |
|---|--------|--------|------|--------|-------|--------|
| 50 | API-PTR-001 | GET | /crm/partners | PTR | P1 | Active |
| 51 | API-PTR-002 | GET | /crm/partners/{id} | PTR | P1 | Active |
| 52 | API-PTR-003 | POST | /crm/partners | PTR | P1 | Active |
| 53 | API-PTR-004 | POST | /crm/partners/{id}/activate | PTR | P1 | Active |
| 54 | API-PTR-005 | POST | /crm/partners/{id}/suspend | PTR | P1 | Active |
| 55 | API-PTR-006 | GET | /crm/partners/{id}/performance | PTR | P1 | Active |
| 56 | API-PTR-007 | GET | /crm/partners/{id}/documents | PTR | P1 | Active |
| 57 | API-PTR-008 | GET | /crm/partners/{id}/commissions | PTR | P1 | Active |
| 58 | API-PTR-009 | GET | /crm/partners/onboarding-queue | PTR | P1 | Active |
| 59 | API-PTR-010 | GET | /crm/partners/disputes | PTR | P1 | Active |
| 60 | API-DSA-001 | GET | /dsa/dashboard | DSA | P1 | Active |
| 61 | API-DSA-002 | GET | /dsa/profile | DSA | P1 | Active |
| 62 | API-DSA-003 | PATCH | /dsa/profile | DSA | P1 | Active |
| 63 | API-DSA-004 | GET | /dsa/kyc | DSA | P1 | Active |
| 64 | API-DSA-005 | POST | /dsa/kyc/pan | DSA | P1 | Active |
| 65 | API-DSA-006 | GET | /dsa/bank-accounts | DSA | P1 | Active |
| 66 | API-DSA-007 | POST | /dsa/bank-accounts | DSA | P1 | Active |
| 67 | API-DSA-008 | GET | /dsa/agreements | DSA | P1 | Active |
| 68 | API-DSA-009 | POST | /dsa/agreements/{id}/sign | DSA | P1 | Active |
| 69 | API-DSA-010 | GET | /dsa/certifications | DSA | P1 | Active |
| 70 | API-DSA-011 | POST | /dsa/leads | DSA | P1 | Active |
| 71 | API-DSA-012 | GET | /dsa/leads | DSA | P1 | Active |
| 72 | API-DSA-013 | GET | /dsa/leads/{id} | DSA | P1 | Active |
| 73 | API-DSA-014 | POST | /dsa/leads/{id}/documents | DSA | P1 | Active |
| 74 | API-DSA-015 | GET | /dsa/leads/{id}/followups | DSA | P1 | Active |
| 75 | API-DSA-016 | GET | /dsa/commissions | DSA | P1 | Active |
| 76 | API-DSA-017 | GET | /dsa/commissions/ledger | DSA | P1 | Active |
| 77 | API-DSA-018 | GET | /dsa/commissions/{id} | DSA | P1 | Active |
| 78 | API-DSA-019 | POST | /dsa/commissions/disputes | DSA | P1 | Active |
| 79 | API-DSA-020 | GET | /dsa/payouts | DSA | P1 | Active |
| 80 | API-DSA-021 | GET | /dsa/payouts/{id} | DSA | P1 | Active |
| 81 | API-DSA-022 | GET | /dsa/performance | DSA | P1 | Active |
| 82 | API-DSA-023 | GET | /dsa/leaderboard | DSA | P1 | Active |
| 83 | API-DSA-024 | GET | /dsa/training | DSA | P1 | Active |
| 84 | API-DSA-025 | POST | /dsa/training/{id}/complete | DSA | P1 | Active |
| 85 | API-REF-001 | GET | /referral/code | REF | P1 | Active |
| 86 | API-REF-002 | POST | /referral/share | REF | P1 | Active |
| 87 | API-REF-003 | GET | /referral/tracking | REF | P1 | Active |
| 88 | API-REF-004 | GET | /referral/rewards | REF | P1 | Active |
| 89 | API-REF-005 | GET | /referral/leaderboard | REF | P1 | Active |
| 90 | API-REF-006 | GET | /public/referral/{code} | REF | P1 | Active |
| 91 | API-REF-007 | POST | /public/referral/{code}/register | REF | P1 | Active |
| 92 | API-REF-008 | GET | /crm/referrals | REF | P1 | Active |
| 93 | API-REF-009 | GET | /crm/referrals/{id} | REF | P1 | Active |
| 94 | API-REF-010 | GET | /crm/referral-rewards | REF | P1 | Active |
| 95 | API-REF-011 | POST | /crm/referral-rewards/{id}/approve | REF | P1 | Active |

## 3.5 EMP — Employee (#96–105) · BRN — Branch (#107–117) · PRD — Product (#118–131)

| # | API ID | Method | Path | Domain | Phase | Status |
|---|--------|--------|------|--------|-------|--------|
| 96 | API-EMP-001 | GET | /crm/employees | EMP | P1 | Active |
| 97 | API-EMP-002 | GET | /crm/employees/{id} | EMP | P1 | Active |
| 98 | API-EMP-003 | GET | /crm/employees/me | EMP | P1 | Active |
| 99 | API-EMP-004 | POST | /admin/employees | EMP | P1 | Active |
| 100 | API-EMP-005 | PATCH | /admin/employees/{id} | EMP | P1 | Active |
| 101 | API-EMP-006 | POST | /admin/employees/{id}/deactivate | EMP | P1 | Active |
| 102 | API-EMP-007 | GET | /crm/employees/{id}/reporting | EMP | P1 | Active |
| 103 | API-EMP-008 | GET | /crm/employees/{id}/pipeline | EMP | P1 | Active |
| 104 | API-EMP-009 | GET | /crm/employees/{id}/targets | EMP | P1 | Active |
| 105 | API-EMP-010 | POST | /admin/employees/bulk-import | EMP | P1 | Active |
| 106 | API-BRN-001 | GET | /branch/dashboard | BRN | P1 | Active |
| 108 | API-BRN-002 | GET | /branch/funnel | BRN | P1 | Active |
| 109 | API-BRN-003 | GET | /branch/team | BRN | P1 | Active |
| 110 | API-BRN-004 | GET | /branch/partners | BRN | P1 | Active |
| 111 | API-BRN-005 | GET | /regional/dashboard | BRN | P1 | Active |
| 112 | API-BRN-006 | GET | /regional/branches | BRN | P1 | Active |
| 113 | API-BRN-007 | GET | /admin/branches | BRN | P1 | Active |
| 114 | API-BRN-008 | POST | /admin/branches | BRN | P1 | Active |
| 115 | API-BRN-009 | PATCH | /admin/branches/{id} | BRN | P1 | Active |
| 116 | API-BRN-010 | GET | /admin/regions | BRN | P1 | Active |
| 117 | API-BRN-011 | POST | /admin/regions | BRN | P1 | Active |
| 118 | API-PRD-001 | GET | /public/products | PRD | P1 | Active |
| 119 | API-PRD-002 | GET | /public/products/{code} | PRD | P1 | Active |
| 120 | API-PRD-003 | GET | /public/products/{code}/variants | PRD | P1 | Active |
| 121 | API-PRD-004 | GET | /public/products/families | PRD | P1 | Active |
| 122 | API-PRD-005 | POST | /public/products/compare | PRD | P1 | Active |
| 123 | API-PRD-006 | GET | /admin/products | PRD | P1 | Active |
| 124 | API-PRD-007 | POST | /admin/products | PRD | P1 | Active |
| 125 | API-PRD-008 | PATCH | /admin/products/{id} | PRD | P1 | Active |
| 126 | API-PRD-009 | POST | /admin/products/{id}/variants | PRD | P1 | Active |
| 127 | API-PRD-010 | GET | /admin/products/{id}/document-rules | PRD | P1 | Active |
| 128 | API-PRD-011 | GET | /admin/products/{id}/eligibility-rules | PRD | P1 | Active |
| 129 | API-PRD-012 | GET | /admin/lenders | PRD | P1 | Active |
| 130 | API-PRD-013 | GET | /admin/lenders/{id}/policies | PRD | P1 | Active |
| 130 | API-PRD-014 | POST | /admin/lenders/{id}/policies | PRD | P1 | Active |

## 3.6 ELG — Eligibility (#132–137) · EMI (#138–142) · LED — Lead (#143–157) · LMS (#158–166)

| # | API ID | Method | Path | Domain | Phase | Status |
|---|--------|--------|------|--------|-------|--------|
| 131 | API-ELG-001 | POST | /public/eligibility/preview | ELG | P1 | Active |
| 132 | API-ELG-002 | POST | /eligibility/check | ELG | P1 | Active |
| 133 | API-ELG-003 | GET | /eligibility/check/{id} | ELG | P1 | Active |
| 134 | API-ELG-004 | GET | /applications/{id}/eligibility | ELG | P1 | Active |
| 135 | API-ELG-005 | POST | /applications/{id}/eligibility/recheck | ELG | P1 | Active |
| 136 | API-ELG-006 | GET | /credit/eligibility/queue | ELG | P1 | Active |
| 137 | API-EMI-001 | POST | /public/emi/calculate | EMI | P1 | Active |
| 138 | API-EMI-002 | POST | /emi/calculate | EMI | P1 | Active |
| 139 | API-EMI-003 | POST | /public/emi/eligibility | EMI | P1 | Active |
| 140 | API-EMI-004 | POST | /public/emi/compare | EMI | P1 | Active |
| 141 | API-EMI-005 | POST | /public/emi/savings | EMI | P1 | Active |
| 142 | API-LED-001 | GET | /crm/leads | LED | P1 | Active |
| 143 | API-LED-002 | GET | /crm/leads/{id} | LED | P1 | Active |
| 144 | API-LED-003 | POST | /crm/leads | LED | P1 | Active |
| 145 | API-LED-004 | PATCH | /crm/leads/{id} | LED | P1 | Active |
| 146 | API-LED-005 | POST | /crm/leads/{id}/assign | LED | P1 | Active |
| 147 | API-LED-006 | POST | /crm/leads/{id}/qualify | LED | P1 | Active |
| 148 | API-LED-007 | POST | /crm/leads/{id}/convert | LED | P1 | Active |
| 149 | API-LED-008 | GET | /crm/leads/{id}/activities | LED | P1 | Active |
| 150 | API-LED-009 | POST | /crm/leads/{id}/activities | LED | P1 | Active |
| 151 | API-LED-010 | GET | /crm/leads/{id}/notes | LED | P1 | Active |
| 152 | API-LED-011 | POST | /crm/leads/{id}/notes | LED | P1 | Active |
| 153 | API-LED-012 | POST | /crm/leads/{id}/followups | LED | P1 | Active |
| 154 | API-LED-013 | GET | /crm/leads/{id}/score | LED | P1 | Active |
| 155 | API-LED-014 | POST | /crm/leads/bulk-assign | LED | P1 | Active |
| 156 | API-LED-015 | GET | /crm/leads/sla-alerts | LED | P1 | Active |
| 157 | API-LMS-001 | GET | /crm/lms/funnel | LMS | P1 | Active |
| 158 | API-LMS-002 | GET | /crm/lms/sources | LMS | P1 | Active |
| 159 | API-LMS-003 | GET | /crm/lms/sla | LMS | P1 | Active |
| 160 | API-LMS-004 | GET | /crm/lms/assignment-rules | LMS | P1 | Active |
| 161 | API-LMS-005 | PUT | /crm/lms/assignment-rules | LMS | P1 | Active |
| 162 | API-LMS-006 | GET | /crm/lms/scoring-config | LMS | P1 | Active |
| 163 | API-LMS-007 | GET | /crm/lms/conversion-rate | LMS | P1 | Active |
| 164 | API-LMS-008 | POST | /crm/lms/export | LMS | P1 | Active |

## 3.7 LOS — Loan Origination (#165–178) · APP — Application (#179–198)

| # | API ID | Method | Path | Domain | Phase | Status |
|---|--------|--------|------|--------|-------|--------|
| 165 | API-LOS-001 | GET | /crm/los/stages | LOS | P1 | Active |
| 166 | API-LOS-002 | GET | /crm/los/queues/sales | LOS | P1 | Active |
| 167 | API-LOS-003 | GET | /credit/queue | LOS | P1 | Active |
| 168 | API-LOS-004 | GET | /ops/queue | LOS | P1 | Active |
| 169 | API-LOS-005 | POST | /applications/{id}/stage | LOS | P1 | Active |
| 170 | API-LOS-006 | GET | /applications/{id}/timeline | LOS | P1 | Active |
| 171 | API-LOS-007 | POST | /credit/applications/{id}/review | LOS | P1 | Active |
| 172 | API-LOS-008 | POST | /ops/applications/{id}/lender-submit | LOS | P1 | Active |
| 173 | API-LOS-009 | POST | /ops/applications/{id}/sanction | LOS | P1 | Active |
| 174 | API-LOS-010 | POST | /ops/applications/{id}/disbursement | LOS | P1 | Active |
| 175 | API-LOS-011 | POST | /applications/{id}/reject | LOS | P1 | Active |
| 176 | API-LOS-012 | POST | /applications/{id}/withdraw | LOS | P1 | Active |
| 177 | API-LOS-013 | POST | /applications/{id}/exception | LOS | P1 | Active |
| 178 | API-LOS-014 | GET | /crm/los/sla | LOS | P1 | Active |
| 179 | API-APP-001 | GET | /customer/applications | APP | P1 | Active |
| 180 | API-APP-002 | POST | /customer/applications | APP | P1 | Active |
| 181 | API-APP-003 | GET | /customer/applications/{id} | APP | P1 | Active |
| 182 | API-APP-004 | PATCH | /customer/applications/{id} | APP | P1 | Active |
| 183 | API-APP-005 | POST | /customer/applications/{id}/submit | APP | P1 | Active |
| 184 | API-APP-006 | POST | /customer/applications/{id}/withdraw | APP | P1 | Active |
| 185 | API-APP-007 | GET | /customer/applications/{id}/timeline | APP | P1 | Active |
| 186 | API-APP-008 | GET | /customer/applications/{id}/sanction | APP | P1 | Active |
| 187 | API-APP-009 | GET | /customer/applications/{id}/disbursement | APP | P1 | Active |
| 188 | API-APP-010 | GET | /crm/applications | APP | P1 | Active |
| 189 | API-APP-011 | GET | /crm/applications/{id} | APP | P1 | Active |
| 190 | API-APP-012 | GET | /crm/applications/{id}/summary | APP | P1 | Active |
| 191 | API-APP-013 | GET | /crm/applications/{id}/eligibility | APP | P1 | Active |
| 192 | API-APP-014 | GET | /crm/applications/{id}/documents | APP | P1 | Active |
| 193 | API-APP-015 | GET | /crm/applications/{id}/credit | APP | P1 | Active |
| 194 | API-APP-016 | GET | /crm/applications/{id}/lender | APP | P1 | Active |
| 195 | API-APP-017 | POST | /crm/applications/{id}/assign | APP | P1 | Active |
| 196 | API-APP-018 | GET | /applications/{id}/product-details | APP | P1 | Active |
| 197 | API-APP-019 | PATCH | /applications/{id}/product-details | APP | P1 | Active |
| 198 | API-APP-020 | GET | /customer/applications/draft | APP | P1 | Active |

## 3.8 DOC — Document (#199–210) · OCR (#211–214) · KYC (#215–226) · AI (#227–236) · VOC (#237–244)

| # | API ID | Method | Path | Domain | Phase | Status |
|---|--------|--------|------|--------|-------|--------|
| 199 | API-DOC-001 | POST | /documents/presign | DOC | P1 | Active |
| 200 | API-DOC-002 | POST | /documents/confirm | DOC | P1 | Active |
| 201 | API-DOC-003 | GET | /documents/{id} | DOC | P1 | Active |
| 202 | API-DOC-004 | GET | /documents/{id}/download | DOC | P1 | Active |
| 203 | API-DOC-005 | GET | /documents/{id}/versions | DOC | P1 | Active |
| 204 | API-DOC-006 | GET | /applications/{id}/documents | DOC | P1 | Active |
| 205 | API-DOC-007 | GET | /applications/{id}/documents/status | DOC | P1 | Active |
| 206 | API-DOC-008 | GET | /credit/documents/queue | DOC | P1 | Active |
| 207 | API-DOC-009 | POST | /credit/documents/{id}/verify | DOC | P1 | Active |
| 208 | API-DOC-010 | POST | /crm/documents/{id}/deficiency | DOC | P1 | Active |
| 209 | API-DOC-011 | POST | /ops/documents/package | DOC | P1 | Active |
| 210 | API-DOC-012 | DELETE | /documents/{id} | DOC | P1 | Active |
| 211 | API-OCR-001 | POST | /documents/{id}/ocr | OCR | P1 | Active |
| 212 | API-OCR-002 | GET | /documents/{id}/ocr | OCR | P1 | Active |
| 213 | API-OCR-003 | GET | /credit/ocr/queue | OCR | P1 | Active |
| 214 | API-OCR-004 | POST | /credit/ocr/{id}/review | OCR | P1 | Active |
| 215 | API-KYC-001 | GET | /customer/kyc/status | KYC | P1 | Active |
| 216 | API-KYC-002 | POST | /customer/kyc/pan | KYC | P1 | Active |
| 217 | API-KYC-003 | POST | /customer/kyc/pan/verify | KYC | P1 | Active |
| 218 | API-KYC-004 | POST | /customer/kyc/aadhaar/send-otp | KYC | P1 | Active |
| 219 | API-KYC-005 | POST | /customer/kyc/aadhaar/verify | KYC | P1 | Active |
| 220 | API-KYC-006 | POST | /customer/kyc/photo | KYC | P1 | Active |
| 221 | API-KYC-007 | POST | /customer/kyc/address-proof | KYC | P1 | Active |
| 222 | API-KYC-008 | GET | /crm/customers/{id}/kyc | KYC | P1 | Active |
| 223 | API-KYC-009 | GET | /compliance/kyc/queue | KYC | P1 | Active |
| 224 | API-KYC-010 | POST | /compliance/kyc/{id}/review | KYC | P1 | Active |
| 225 | API-KYC-011 | GET | /compliance/kyc/audit-logs | KYC | P1 | Active |
| 226 | API-KYC-012 | POST | /customer/kyc/video-kyc/schedule | KYC | P3 | Active |
| 227 | API-AI-001 | POST | /ai/advisor/sessions | AI | P1 | Active |
| 228 | API-AI-002 | GET | /ai/advisor/sessions | AI | P1 | Active |
| 229 | API-AI-003 | GET | /ai/advisor/sessions/{id} | AI | P1 | Active |
| 230 | API-AI-004 | POST | /ai/advisor/sessions/{id}/messages | AI | P1 | Active |
| 231 | API-AI-005 | GET | /ai/advisor/sessions/{id}/messages | AI | P1 | Active |
| 232 | API-AI-006 | GET | /ai/advisor/recommendations | AI | P1 | Active |
| 233 | API-AI-007 | POST | /ai/advisor/recommendations/{id}/apply | AI | P1 | Active |
| 234 | API-AI-008 | POST | /ai/advisor/eligibility | AI | P1 | Active |
| 235 | API-AI-009 | GET | /ai/advisor/insights | AI | P1 | Active |
| 236 | API-AI-010 | POST | /ai/copilot | AI | P1 | Active |
| 237 | API-VOC-001 | POST | /voice/sessions | VOC | P1 | Active |
| 238 | API-VOC-002 | GET | /voice/sessions/{id} | VOC | P1 | Active |
| 239 | API-VOC-003 | GET | /voice/sessions/{id}/token | VOC | P1 | Active |
| 240 | API-VOC-004 | POST | /voice/sessions/{id}/end | VOC | P1 | Active |
| 241 | API-VOC-005 | GET | /voice/sessions/{id}/summary | VOC | P1 | Active |
| 242 | API-VOC-006 | POST | /voice/callback | VOC | P1 | Active |
| 243 | API-VOC-007 | POST | /voice/appointments | VOC | P1 | Active |
| 244 | API-VOC-008 | GET | /voice/sessions | VOC | P1 | Active |

## 3.9 CHT — Chat (#245–250) · NTF — Notification (#251–260) · WA — WhatsApp (#261–266)

| # | API ID | Method | Path | Domain | Phase | Status |
|---|--------|--------|------|--------|-------|--------|
| 245 | API-CHT-001 | POST | /support/chat/sessions | CHT | P1 | Active |
| 246 | API-CHT-002 | POST | /support/chat/sessions/{id}/messages | CHT | P1 | Active |
| 247 | API-CHT-003 | GET | /support/chat/sessions/{id}/messages | CHT | P1 | Active |
| 248 | API-CHT-004 | GET | /crm/support/chat/queue | CHT | P1 | Active |
| 249 | API-CHT-005 | POST | /crm/support/chat/sessions/{id}/accept | CHT | P1 | Active |
| 250 | API-CHT-006 | POST | /crm/support/chat/sessions/{id}/close | CHT | P1 | Active |
| 251 | API-NTF-001 | GET | /notifications | NTF | P1 | Active |
| 252 | API-NTF-002 | POST | /notifications/{id}/read | NTF | P1 | Active |
| 253 | API-NTF-003 | POST | /notifications/read-all | NTF | P1 | Active |
| 254 | API-NTF-004 | GET | /notifications/unread-count | NTF | P1 | Active |
| 255 | API-NTF-005 | GET | /notifications/preferences | NTF | P1 | Active |
| 256 | API-NTF-006 | PATCH | /notifications/preferences | NTF | P1 | Active |
| 257 | API-NTF-007 | GET | /notifications/history/sms | NTF | P1 | Active |
| 258 | API-NTF-008 | GET | /notifications/history/email | NTF | P1 | Active |
| 259 | API-NTF-009 | GET | /notifications/history/whatsapp | NTF | P1 | Active |
| 260 | API-NTF-010 | POST | /notifications/devices | NTF | P1 | Active |
| 261 | API-WA-001 | POST | /webhooks/whatsapp | WA | P1 | Alias |
| 262 | API-WA-002 | POST | /webhooks/whatsapp/status | WA | P1 | Active |
| 263 | API-WA-003 | GET | /admin/whatsapp/templates | WA | P1 | Active |
| 264 | API-WA-004 | POST | /admin/whatsapp/templates | WA | P1 | Active |
| 265 | API-WA-005 | POST | /crm/comms/whatsapp/send | WA | P1 | Active |
| 266 | API-WA-006 | GET | /crm/comms/whatsapp/logs | WA | P1 | Active |

## 3.10 CMP — Campaign (#267–276) · COM — Commission (#281–297) · ANA — Analytics (#298–312)

| # | API ID | Method | Path | Domain | Phase | Status |
|---|--------|--------|------|--------|-------|--------|
| 267 | API-CMP-001 | GET | /admin/campaigns | CMP | P1 | Active |
| 268 | API-CMP-002 | POST | /admin/campaigns | CMP | P1 | Active |
| 269 | API-CMP-003 | GET | /admin/campaigns/{id} | CMP | P1 | Active |
| 270 | API-CMP-004 | PATCH | /admin/campaigns/{id} | CMP | P1 | Active |
| 271 | API-CMP-005 | POST | /admin/campaigns/{id}/audience | CMP | P1 | Active |
| 272 | API-CMP-006 | POST | /admin/campaigns/{id}/schedule | CMP | P1 | Active |
| 273 | API-CMP-007 | POST | /admin/campaigns/{id}/launch | CMP | P1 | Active |
| 274 | API-CMP-008 | POST | /admin/campaigns/{id}/pause | CMP | P1 | Active |
| 275 | API-CMP-009 | GET | /analytics/campaigns/{id} | CMP | P1 | Active |
| 276 | API-CMP-010 | GET | /analytics/campaigns | CMP | P1 | Active |
| 277 | API-REF-012 | GET | /admin/referral-rules | REF | P1 | Active |
| 278 | API-REF-013 | PUT | /admin/referral-rules | REF | P1 | Active |
| 279 | API-REF-014 | GET | /analytics/referrals | REF | P1 | Active |
| 280 | API-REF-015 | GET | /referral/payouts | REF | P1 | Active |
| 281 | API-COM-001 | GET | /crm/commissions/ledger | COM | P1 | Active |
| 282 | API-COM-002 | GET | /crm/commissions/{id} | COM | P1 | Active |
| 283 | API-COM-003 | GET | /crm/commissions/approvals | COM | P1 | Active |
| 284 | API-COM-004 | POST | /crm/commissions/{id}/approve | COM | P1 | Active |
| 285 | API-COM-005 | POST | /crm/commissions/{id}/reject | COM | P1 | Active |
| 286 | API-COM-006 | GET | /crm/commissions/disputes | COM | P1 | Active |
| 287 | API-COM-007 | POST | /crm/commissions/disputes/{id}/resolve | COM | P1 | Active |
| 288 | API-COM-008 | GET | /finance/payouts | COM | P1 | Active |
| 289 | API-COM-009 | POST | /finance/payouts | COM | P1 | Active |
| 290 | API-COM-010 | GET | /finance/payouts/{id} | COM | P1 | Active |
| 291 | API-COM-011 | POST | /finance/payouts/{id}/approve | COM | P1 | Active |
| 292 | API-COM-012 | POST | /finance/payouts/{id}/execute | COM | P1 | Active |
| 293 | API-COM-013 | GET | /admin/commission-rules | COM | P1 | Active |
| 294 | API-COM-014 | POST | /admin/commission-rules | COM | P1 | Active |
| 295 | API-COM-015 | PATCH | /admin/commission-rules/{id} | COM | P1 | Active |
| 296 | API-COM-016 | POST | /crm/commissions/clawbacks | COM | P1 | Active |
| 297 | API-COM-017 | GET | /analytics/commissions | COM | P1 | Active |
| 298 | API-ANA-001 | GET | /analytics/hub | ANA | P1 | Active |
| 299 | API-ANA-002 | GET | /analytics/revenue | ANA | P1 | Active |
| 300 | API-ANA-003 | GET | /analytics/leads/funnel | ANA | P1 | Active |
| 301 | API-ANA-004 | GET | /analytics/conversion | ANA | P1 | Active |
| 302 | API-ANA-005 | GET | /analytics/branches/{id} | ANA | P1 | Active |
| 303 | API-ANA-006 | GET | /analytics/regional | ANA | P1 | Active |
| 304 | API-ANA-007 | GET | /analytics/partners | ANA | P1 | Active |
| 305 | API-ANA-008 | GET | /analytics/products | ANA | P1 | Active |
| 306 | API-ANA-009 | GET | /analytics/lenders | ANA | P1 | Active |
| 307 | API-ANA-010 | GET | /analytics/sla | ANA | P1 | Active |
| 308 | API-ANA-011 | GET | /analytics/ai | ANA | P1 | Active |
| 309 | API-ANA-012 | GET | /analytics/reports | ANA | P1 | Active |
| 310 | API-ANA-013 | POST | /analytics/reports/generate | ANA | P1 | Active |
| 311 | API-ANA-014 | GET | /analytics/reports/{id}/download | ANA | P1 | Active |
| 312 | API-ANA-015 | GET | /management/analytics/executive | ANA | P1 | Active |

## 3.11 DSH — Dashboard (#313–332) · *Full Appendix B expansion*

| # | API ID | Method | Path | Domain | Phase | Status |
|---|--------|--------|------|--------|-------|--------|
| 313 | API-DSH-001 | GET | /crm/dashboard/sales | DSH | P1 | Active |
| 314 | API-DSH-002 | GET | /crm/dashboard/rm | DSH | P1 | Active |
| 315 | API-DSH-003 | GET | /crm/dashboard/credit | DSH | P1 | Active |
| 316 | API-DSH-004 | GET | /crm/dashboard/ops | DSH | P1 | Active |
| 317 | API-DSH-005 | GET | /branch/dashboard | DSH | P1 | Alias |
| 318 | API-DSH-006 | GET | /regional/dashboard | DSH | P1 | Alias |
| 319 | API-DSH-007 | GET | /support/dashboard | DSH | P1 | Active |
| 320 | API-DSH-008 | GET | /compliance/dashboard | DSH | P1 | Active |
| 321 | API-DSH-009 | GET | /admin/dashboard | DSH | P1 | Active |
| 322 | API-DSH-010 | GET | /management/dashboard | DSH | P1 | Active |
| 323 | API-DSH-011 | GET | /management/ceo | DSH | P1 | Active |
| 324 | API-DSH-012 | GET | /management/director | DSH | P1 | Active |
| 325 | API-DSH-013 | GET | /management/business | DSH | P1 | Active |
| 326 | API-DSH-014 | GET | /management/sales | DSH | P1 | Active |
| 327 | API-DSH-015 | GET | /management/operations | DSH | P1 | Active |
| 328 | API-DSH-016 | GET | /management/finance | DSH | P1 | Active |
| 329 | API-DSH-017 | GET | /management/board-pack | DSH | P1 | Active |
| 330 | API-DSH-018 | GET | /management/forecast | DSH | P1 | Active |
| 331 | API-DSH-019 | GET | /dsa/dashboard | DSH | P1 | Alias |
| 332 | API-DSH-020 | GET | /customer/dashboard | DSH | P1 | Alias |

## 3.12 SUP — Support (#333–340) · TKT — Ticket (#341–352)

| # | API ID | Method | Path | Domain | Phase | Status |
|---|--------|--------|------|--------|-------|--------|
| 333 | API-SUP-001 | POST | /support/tickets | SUP | P1 | Active |
| 334 | API-SUP-002 | GET | /support/tickets | SUP | P1 | Active |
| 335 | API-SUP-003 | GET | /support/tickets/{id} | SUP | P1 | Active |
| 336 | API-SUP-004 | GET | /support/faqs | SUP | P1 | Active |
| 337 | API-SUP-005 | GET | /support/faqs/{id} | SUP | P1 | Active |
| 338 | API-SUP-006 | GET | /support/categories | SUP | P1 | Active |
| 339 | API-SUP-007 | POST | /support/csat | SUP | P1 | Active |
| 340 | API-SUP-008 | GET | /crm/support/tickets | SUP | P1 | Active |
| 341 | API-TKT-001 | PATCH | /crm/support/tickets/{id} | TKT | P1 | Active |
| 342 | API-TKT-002 | POST | /crm/support/tickets/{id}/assign | TKT | P1 | Active |
| 343 | API-TKT-003 | POST | /crm/support/tickets/{id}/messages | TKT | P1 | Active |
| 344 | API-TKT-004 | GET | /crm/support/tickets/{id}/messages | TKT | P1 | Active |
| 345 | API-TKT-005 | POST | /crm/support/tickets/{id}/escalate | TKT | P1 | Active |
| 346 | API-TKT-006 | POST | /crm/support/tickets/{id}/resolve | TKT | P1 | Active |
| 347 | API-TKT-007 | POST | /crm/support/tickets/{id}/reopen | TKT | P1 | Active |
| 348 | API-TKT-008 | GET | /crm/support/escalations | TKT | P1 | Active |
| 349 | API-TKT-009 | GET | /crm/support/sla | TKT | P1 | Active |
| 350 | API-TKT-010 | GET | /crm/support/agents/performance | TKT | P1 | Active |
| 351 | API-TKT-011 | GET | /admin/support/templates | TKT | P1 | Active |
| 352 | API-TKT-012 | POST | /admin/support/templates | TKT | P1 | Active |

## 3.13 KB — Knowledge Base (#353–368) · SET — Settings (#369–381)

| # | API ID | Method | Path | Domain | Phase | Status |
|---|--------|--------|------|--------|-------|--------|
| 353 | API-KB-001 | GET | /knowledge/articles | KB | P1 | Active |
| 354 | API-KB-002 | GET | /knowledge/articles/{slug} | KB | P1 | Active |
| 355 | API-KB-003 | GET | /knowledge/faqs | KB | P1 | Active |
| 356 | API-KB-004 | GET | /knowledge/search | KB | P1 | Active |
| 357 | API-KB-005 | GET | /knowledge/categories | KB | P1 | Active |
| 358 | API-KB-006 | GET | /dsa/knowledge/scripts | KB | P1 | Active |
| 359 | API-KB-007 | GET | /dsa/knowledge/training | KB | P1 | Active |
| 360 | API-KB-008 | GET | /admin/knowledge/articles | KB | P1 | Active |
| 361 | API-KB-009 | POST | /admin/knowledge/articles | KB | P1 | Active |
| 362 | API-KB-010 | PATCH | /admin/knowledge/articles/{id} | KB | P1 | Active |
| 363 | API-KB-011 | POST | /admin/knowledge/articles/{id}/publish | KB | P1 | Active |
| 364 | API-KB-012 | CRUD | /admin/knowledge/faqs | KB | P1 | Active |
| 365 | API-KB-013 | CRUD | /admin/knowledge/sops | KB | P1 | Active |
| 366 | API-KB-014 | CRUD | /admin/knowledge/policies | KB | P1 | Active |
| 367 | API-KB-015 | GET | /admin/knowledge/rag-sources | KB | P1 | Active |
| 368 | API-KB-016 | POST | /admin/knowledge/rag-sources/{id}/reindex | KB | P1 | Active |
| 369 | API-SET-001 | GET | /admin/settings/system | SET | P1 | Active |
| 370 | API-SET-002 | PATCH | /admin/settings/system | SET | P1 | Active |
| 371 | API-SET-003 | GET | /admin/settings/products/{id} | SET | P1 | Active |
| 372 | API-SET-004 | PATCH | /admin/settings/products/{id} | SET | P1 | Active |
| 373 | API-SET-005 | GET | /admin/settings/notifications | SET | P1 | Active |
| 374 | API-SET-006 | PATCH | /admin/settings/notifications | SET | P1 | Active |
| 375 | API-SET-007 | GET | /admin/settings/security | SET | P1 | Active |
| 376 | API-SET-008 | PATCH | /admin/settings/security | SET | P1 | Active |
| 377 | API-SET-009 | GET | /admin/settings/ai | SET | P1 | Active |
| 378 | API-SET-010 | PATCH | /admin/settings/ai | SET | P1 | Active |
| 379 | API-SET-011 | GET | /admin/workflows | SET | P1 | Active |
| 380 | API-SET-012 | PUT | /admin/workflows | SET | P1 | Active |
| 381 | API-SET-013 | POST | /admin/workflows | SET | P1 | Active |

## 3.14 AUD — Audit (#382–389) · ADM — Admin (#390–407) · LEN (#408–413) · WHK (#414–418) · HEALTH (#419–421 net-new)

| # | API ID | Method | Path | Domain | Phase | Status |
|---|--------|--------|------|--------|-------|--------|
| 382 | API-AUD-001 | GET | /compliance/audit-logs | AUD | P1 | Active |
| 383 | API-AUD-002 | GET | /compliance/audit-logs/{id} | AUD | P1 | Active |
| 384 | API-AUD-003 | GET | /compliance/access-logs | AUD | P1 | Active |
| 385 | API-AUD-004 | GET | /compliance/change-logs | AUD | P1 | Active |
| 386 | API-AUD-005 | GET | /compliance/approval-logs | AUD | P1 | Active |
| 387 | API-AUD-006 | GET | /compliance/security-events | AUD | P1 | Active |
| 388 | API-AUD-007 | POST | /compliance/security-events/{id}/resolve | AUD | P1 | Active |
| 389 | API-AUD-008 | POST | /compliance/audit-logs/export | AUD | P1 | Active |
| 390 | API-ADM-001 | GET | /admin/roles | ADM | P1 | Active |
| 391 | API-ADM-002 | GET | /admin/roles/{id} | ADM | P1 | Active |
| 392 | API-ADM-003 | PUT | /admin/roles/{id}/permissions | ADM | P1 | Active |
| 393 | API-ADM-004 | GET | /admin/permissions | ADM | P1 | Active |
| 394 | API-ADM-005 | GET | /admin/users | ADM | P1 | Active |
| 395 | API-ADM-006 | GET | /admin/integrations/health | ADM | P1 | Active |
| 396 | API-ADM-007 | POST | /admin/integrations/{name}/test | ADM | P1 | Active |
| 397 | API-ADM-008 | GET | /admin/master-data/countries | ADM | P1 | Active |
| 398 | API-ADM-009 | GET | /admin/master-data/states | ADM | P1 | Active |
| 399 | API-ADM-010 | GET | /admin/master-data/banks | ADM | P1 | Active |
| 400 | API-ADM-011 | GET | /admin/master-data/vehicle-makes | ADM | P1 | Active |
| 401 | API-ADM-012 | GET | /admin/master-data/vehicle-models | ADM | P1 | Active |
| 402 | API-ADM-013 | GET | /admin/feature-flags | ADM | P1 | Active |
| 403 | API-ADM-014 | PATCH | /admin/feature-flags | ADM | P1 | Active |
| 404 | API-ADM-015 | GET | /admin/system/health | ADM | P1 | Active |
| 405 | API-ADM-016 | POST | /admin/system/cache/clear | ADM | P1 | Active |
| 406 | API-ADM-017 | POST | /admin/data/export | ADM | P1 | Active |
| 407 | API-ADM-018 | POST | /admin/data/import | ADM | P1 | Active |
| 408 | API-LEN-001 | POST | /lender/auth/login | LEN | P3 | Active |
| 409 | API-LEN-002 | GET | /lender/applications | LEN | P3 | Active |
| 410 | API-LEN-003 | GET | /lender/applications/{id} | LEN | P3 | Active |
| 411 | API-LEN-004 | GET | /lender/applications/{id}/documents | LEN | P3 | Active |
| 412 | API-LEN-005 | POST | /lender/applications/{id}/status | LEN | P3 | Active |
| 413 | API-LEN-006 | POST | /lender/applications/{id}/query | LEN | P3 | Active |
| 414 | API-WHK-001 | POST | /webhooks/whatsapp | WHK | P1 | Active |
| 415 | API-WHK-002 | POST | /webhooks/sms/delivery | WHK | P1 | Active |
| 416 | API-WHK-003 | POST | /webhooks/payment | WHK | P2 | Active |
| 417 | API-WHK-004 | POST | /webhooks/kyc | WHK | P1 | Active |
| 418 | API-WHK-005 | POST | /webhooks/lender | WHK | P3 | Active |
| 419 | API-HEALTH-001 | GET | /health | HEALTH | P1 | Active |
| 420 | API-LMS-009 | PUT | /crm/lms/scoring-config | LMS | P1 | Active |
| 421 | API-REF-016 | POST | /referrals/submit | REF | P1 | Active |

**Catalog total: 421 API IDs** (312 original Appendix A + 106 tail-domain + 3 net-new additions).

# 4. DEPRECATED / LEGACY ENDPOINT MAPPING

Per [Business Workflow §5.3](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md) and Enterprise Audit CONFLICT-04:

| Channel | Canonical API | Legacy Path (Deprecated) | Permission | Migration |
|---------|---------------|--------------------------|------------|-----------|
| Customer App | `POST /api/v1/customer/applications` (API-APP-002) | `POST /api/v1/customer/leads` | `applications.create:own` | Auto-creates lead on application start |
| DSA App | `POST /api/v1/dsa/leads` (API-DSA-011) | — | `leads.create:own` | No legacy path |
| Referral | `POST /api/v1/referrals/submit` (API-REF-016) | `POST /api/v1/referral/submit` | `referrals.create:own` | RBAC doc updated to canonical path |
| CRM Manual | `POST /api/v1/crm/leads` (API-LED-003) | — | `leads.create:branch` | No legacy path |
| Campaign/Public | `POST /api/v1/crm/leads` + `source=CAMPAIGN` (API-LED-003) | `POST /api/v1/public/leads` | `leads.create:branch` (system) | UTM params in body metadata |
| AI Advisor | Lead on qualification completion | — | System-internal | No public endpoint |

**Deprecation middleware:** Legacy paths return `301 Moved Permanently` with `Link` header to canonical path and `Sunset: Sat, 01 Jan 2028 00:00:00 GMT` (6 months post v1 GA).

---

# 5. MISSING APIs IDENTIFIED & ADDED

| API ID | Method | Path | Rationale | Permission |
|--------|--------|------|-----------|------------|
| API-LMS-009 | PUT | /crm/lms/scoring-config | Audit CONFLICT-05: GET-only scoring config; PUT required for Admin LMS configuration | `leads.configure:all` |
| API-REF-016 | POST | /referrals/submit | Workflow §5.3 canonical referral capture; RBAC references this path | `referrals.create:own` |
| API-SET-013 | POST | /admin/workflows | Workflow config CRUD gap: create new workflow definition version | `settings.configure:all` |

**Persistence note:** Scoring config, assignment rules, and workflow definitions persist via `system_settings` versioned JSON keys until dedicated tables ship (see Database Schema reconciliation).

---

# 6. DUPLICATE API RESOLUTION

| Resolution ID | Duplicate(s) | Canonical | OpenAPI | Router |
|---------------|-------------|-----------|---------|--------|
| DUP-01 | API-DSH-005 | API-BRN-001 | Document BRN-001 only | Single handler; DSH-005 tagged `aliasOf: API-BRN-001` |
| DUP-02 | API-DSH-006 | API-BRN-005 | Document BRN-005 only | Single handler |
| DUP-03 | API-DSH-019 | API-DSA-001 | Document DSA-001 only | Single handler |
| DUP-04 | API-DSH-020 | API-CUS-017 | Document CUS-017 only | Single handler |
| DUP-05 | API-WA-001 | API-WHK-001 | Document WHK-001 under `webhooks` tag | WhatsApp domain references WHK |

**Rule:** Alias endpoints remain routable for backward compatibility but are **excluded** from OpenAPI `paths` primary documentation and CI route-count validation.

---

# 7. API NAMING STANDARDS

| Rule | Standard | Example | Anti-pattern |
|------|----------|---------|--------------|
| Version prefix | `/api/v1` required on all routes | `/api/v1/crm/leads` | `/crm/leads` (missing version) |
| Path casing | kebab-case | `/lead-assignments` | `/leadAssignments` |
| Resource nouns | Plural nouns for collections | `/applications`, `/customers` | `/application-list` |
| Nested resources | Parent UUID → child collection | `/applications/{id}/documents` | Flat `/application-documents` |
| Actions | POST + verb sub-path for non-CRUD | `POST .../convert` | `GET /convertLead` |
| IDs | UUID v4 in path params | `/leads/{id}` | Integer IDs |
| Business codes | Query params only | `?productCode=HL-01` | `/products/HL-01` (use `{code}` for public catalog only) |
| Domain prefixes | Client-scoped roots | `/customer/*`, `/crm/*`, `/dsa/*` | Mixed scopes in one path |

---

# 8. API VERSIONING STANDARDS

| Strategy | Rule |
|----------|------|
| Current version | `/api/v1` — all Phase 1–2 endpoints |
| Future version | `/api/v2` — breaking changes only (field removals, semantic changes) |
| Non-breaking changes | Same version; optional fields only |
| Deprecation notice | `Sunset` HTTP header + 6-month minimum notice |
| Mobile enforcement | `X-App-Version` header; force-upgrade for critical security APIs |
| Alias sunset | Alias routes removed one version after canonical stabilization |
| OpenAPI | One spec file per major version: `openapi/v1/openapi.json` |

---

# 9. OPENAPI GOVERNANCE STANDARDS

## 9.1 Generation Pipeline (Zod → OpenAPI)

| Step | Owner | Artifact |
|------|-------|----------|
| 1 | Backend | Zod schemas in `packages/shared-types/src/schemas/{domain}/` |
| 2 | Backend | `@asteasolutions/zod-to-openapi` registry per domain router |
| 3 | CI | `pnpm openapi:generate` produces `openapi/v1/openapi.json` |
| 4 | CI | `pnpm openapi:validate-catalog` compares routes ↔ this catalog |
| 5 | QA | Schemathesis/contract tests against generated spec |

## 9.2 Review Process

| Gate | Requirement |
|------|-------------|
| PR — new endpoint | API ID assigned in this catalog; RBAC permission documented; Zod schema |
| PR — breaking change | v2 proposal; Sunset header plan; mobile/client impact assessment |
| PR — alias only | No OpenAPI path addition; catalog `status: Alias` |
| Release | OpenAPI artifact versioned; changelog diff published |
| Quarterly | Catalog ↔ implementation reconciliation audit |

## 9.3 CI Validation Rules

| Check | Failure Action |
|-------|----------------|
| Every Express route has catalog API ID | Block merge |
| Every catalog Active API has route + OpenAPI path | Block merge |
| Alias routes excluded from OpenAPI path count | Warn only |
| Permission string exists in RBAC matrix | Block merge |
| Zod schema coverage ≥ 90% Phase 1 mutations | Block merge (Phase 1 GA) |
| No undocumented `/api/v1` routes | Block merge |

---

# 10. PERMISSION ALIGNMENT REQUIREMENTS

Every **Active** catalog API must map to `{resource}.{action}:{scope}` per [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) §3.

| Requirement | Rule |
|-------------|------|
| Default deny | No route without explicit permission middleware |
| Scope from JWT | `branchId`, `regionId` never accepted from client body/query |
| SoD enforcement | 12 SoD rules (RBAC §1.6) evaluated after permission grant |
| PII reads | Enhanced audit log (`pii_accessed: true`) |
| External users | `own` scope maximum; no inheritance |
| Management | `aggregated` scope; dashboards mask PII |
| Super Admin | `all` scope with enhanced audit |
| Webhooks | HMAC signature verification; no JWT; IP allowlist per provider |
| Public endpoints | Rate-limited; no sensitive data in response |
| Config APIs | `settings.configure:all` or `leads.configure:all`; Super Admin for security/AI |

**RBAC sync:** `packages/api/src/middleware/permissions/catalog-map.ts` generated from this document's API ID → permission table.

---

# 11. RATE LIMIT PER DOMAIN

| Domain / Tier | Limit | Scope | APIs |
|---------------|-------|-------|------|
| Public (`/public/*`) | 120 req/min | Per IP | PRD, ELG preview, EMI, REF-006/007 |
| Auth OTP | 5 req/hour | Per phone | AUTH-001 |
| Auth login | 10 req/15min | Per IP | AUTH-003 |
| Customer JWT | 300 req/min | Per user | CUS, APP, KYC, AI, VOC, NTF |
| DSA JWT | 300 req/min | Per user | DSA, partner leads/docs |
| CRM Employee | 600 req/min | Per user | CRM, credit, ops, analytics |
| Admin JWT | 300 req/min | Per user | ADM, SET, CMP, KB admin |
| AI Advisor | 50 req/hour | Per user | AI-001–009 |
| AI Copilot | 200 req/hour | Per user | AI-010 |
| Voice | 10 sessions/day | Per user | VOC-001–008 |
| Documents presign | 30 req/hour | Per user | DOC-001 |
| Financial ops | 10 req/min | Per user | COM payout execute, LOS disbursement |
| OCR trigger | 30 req/hour | Per document | OCR-001 |
| KYC PAN verify | 5 req/day | Per customer | KYC-003 |
| Audit export | 30 req/min | Per user | AUD-008 |
| Webhooks | 1000 req/min | Per provider IP | WHK-* |
| Health | Unlimited | Per IP | HEALTH-001 (monitoring exempt) |

**Response headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`; `429 RATE_LIMIT_EXCEEDED` on breach.

---

# 12. WEBHOOK CATALOG

| API ID | Method | Path | Provider | Phase | Security |
|--------|--------|------|----------|-------|----------|
| API-WHK-001 | POST | /webhooks/whatsapp | Meta WhatsApp Business | P1 | HMAC-SHA256 `X-Webhook-Signature` |
| API-WHK-002 | POST | /webhooks/sms/delivery | SMS gateway (DLT) | P1 | HMAC + provider IP allowlist |
| API-WHK-003 | POST | /webhooks/payment | Payment/payout provider | P2 | HMAC + idempotency key |
| API-WHK-004 | POST | /webhooks/kyc | PAN/Aadhaar verification provider | P1 | HMAC + timestamp tolerance 5min |
| API-WHK-005 | POST | /webhooks/lender | Lender status integration | P3 | HMAC + lender IP whitelist |

**Note:** API-WA-001 (`/webhooks/whatsapp`) is an **Alias** of API-WHK-001. API-WA-002 (`/webhooks/whatsapp/status`) is a distinct delivery-status callback documented under WA domain for admin tooling cross-reference.

**Inbound processing:** All webhooks enqueue to worker queue; respond `200` within 3s; retry policy on provider side.

---

# 13. CLIENT GROUP MAPPING

*Endpoints may appear in multiple groups when shared across clients. Counts are primary-consumer attribution per API Specification statistics, reconciled.*

| Client Group | Count | Primary Domains | Auth |
|--------------|-------|---------------|------|
| **Customer App** | 98 | AUTH, CUS, APP, KYC, DOC, ELG, EMI, AI, VOC, REF, NTF, SUP, KB (read), CHT | Customer JWT |
| **DSA App** | 52 | AUTH, DSA, DOC, KB (scripts/training), NTF, SUP | DSA JWT |
| **CRM** | 128 | EMP, LED, LMS, LOS, APP (crm), CUS (crm), PTR, DOC, OCR, KYC (crm), CHT (agent), WA (send), COM, ANA, DSH (crm), SUP (queue), TKT, CMP (analytics) | Employee JWT + MFA |
| **Management** | 18 | DSH (management/*), ANA-015, MGT analytics | Management JWT |
| **Admin** | 42 | USR, EMP (admin), BRN (admin), PRD, CMP, COM (rules), SET, ADM, KB (cms), WA (templates), TKT (templates) | Admin JWT |
| **Public / Unauthenticated** | 14 | AUTH (otp), PRD (public), ELG preview, EMI (public), REF-006/007, SUP (faqs/categories), KB (published), HEALTH | None / partial |
| **Lender Portal** | 6 | LEN-001–006 | Lender JWT (Phase 3) |
| **Webhooks / External** | 5 | WHK-001–005 | HMAC signature |

**Validation:** `pnpm catalog:validate-client-groups` ensures union covers all Active APIs; overlap documented in catalog `Client` column (Appendix).

---

# 14. APPENDIX: FULL RECONCILED CATALOG TABLE

*Authoritative machine-readable reference. Entries #1–312 match API Specification Appendix A. Entries #313–421 expand Appendix B to full domain coverage plus net-new APIs.*

**Summary by domain:**

| Domain | API ID Range | Count | # Range |
|--------|-------------|-------|---------|
| AUTH | 001–011 | 11 | 1–11 |
| USR | 001–010 | 10 | 12–21 |
| CUS | 001–028 | 28 | 22–49 |
| PTR | 001–010 | 10 | 50–59 |
| DSA | 001–025 | 25 | 60–84 |
| REF | 001–016 | 16 | 85–95, 277–280, 421 |
| EMP | 001–010 | 10 | 96–105 |
| BRN | 001–011 | 11 | 106–116 |
| PRD | 001–014 | 14 | 117–130 |
| ELG | 001–006 | 6 | 131–136 |
| EMI | 001–005 | 5 | 137–141 |
| LED | 001–015 | 15 | 142–156 |
| LMS | 001–009 | 9 | 157–165, 420 |
| LOS | 001–014 | 14 | 166–179 |
| APP | 001–020 | 20 | 180–199 |
| DOC | 001–012 | 12 | 200–211 |
| OCR | 001–004 | 4 | 212–215 |
| KYC | 001–012 | 12 | 216–227 |
| AI | 001–010 | 10 | 228–237 |
| VOC | 001–008 | 8 | 238–245 |
| CHT | 001–006 | 6 | 245–250 |
| NTF | 001–010 | 10 | 251–260 |
| WA | 001–006 | 6 | 261–266 |
| CMP | 001–010 | 10 | 267–276 |
| COM | 001–017 | 17 | 281–297 |
| ANA | 001–015 | 15 | 298–312 |
| DSH | 001–020 | 20 | 313–332 |
| SUP | 001–008 | 8 | 333–340 |
| TKT | 001–012 | 12 | 341–352 |
| KB | 001–016 | 16 | 353–368 |
| SET | 001–013 | 13 | 369–381 |
| AUD | 001–008 | 8 | 382–389 |
| ADM | 001–018 | 18 | 390–407 |
| LEN | 001–006 | 6 | 408–413 |
| WHK | 001–005 | 5 | 414–418 |
| HEALTH | 001 | 1 | 419 |
| **Total** | | **421** | **1–421** |

*Full row-level catalog: see §3 (sections 3.1–3.14) for complete Method, Path, Phase, and Status per entry.*

---

# 15. OPENAPI FILE STRUCTURE SPECIFICATION

*Specification only — no YAML artifacts in this document.*

## 15.1 Repository Layout

```
openapi/
├── v1/
│   ├── openapi.json              # Generated artifact (CI output)
│   ├── openapi.bundled.json      # CI-bundled for codegen
│   └── catalog-manifest.json     # API ID → path hash (from this doc)
├── v2/                           # Future breaking version
└── README.md
```

## 15.2 Root Document Structure

| Section | Required Content |
|---------|------------------|
| `openapi` | `3.1.0` |
| `info` | title, version, description, contact, `x-kuberone-catalog-version: "1.0"` |
| `servers` | `[{ url: "https://api.kuberone.kuberfinserve.com/api/v1" }]` |
| `tags` | One tag per domain (AUTH, USR, CUS, … WHK, HEALTH) |
| `paths` | Active endpoints only; Alias paths in `x-aliases` extension |
| `components` | See §15.3 |
| `security` | Global default `[{ bearerAuth: [] }]` with per-path overrides |
| `x-catalog` | Array of `{ apiId, catalogNumber, status, phase }` |

## 15.3 Components Structure

| Component | Purpose |
|-----------|---------|
| `components.schemas` | Zod-generated request/response models; `{Resource}Create`, `{Resource}Update`, `{Resource}Response` |
| `components.parameters` | Shared: `PageParam`, `PageSizeParam`, `SortParam`, `UuidPathParam` |
| `components.responses` | `SuccessEnvelope`, `ErrorEnvelope`, `ValidationError`, `RbacForbidden`, `RateLimited` |
| `components.securitySchemes` | See §15.4 |
| `components.headers` | `X-Request-Id`, `X-RateLimit-Limit`, `Sunset`, `Idempotency-Key` |

## 15.4 Security Schemes

| Scheme Name | Type | Usage |
|-------------|------|-------|
| `bearerAuth` | HTTP Bearer JWT | All authenticated Active APIs |
| `refreshCookie` | API Key (cookie) | CRM web refresh (document only) |
| `mfaSession` | API Key (header) | AUTH-004 MFA challenge |
| `resetToken` | API Key (body) | AUTH-008 password reset |
| `webhookHmac` | API Key (header `X-Webhook-Signature`) | WHK-001–005 |
| `lenderApiKey` | API Key + JWT | LEN Phase 3 |
| `{}` (empty) | None | Public, HEALTH, AUTH otp/login |

## 15.5 Path Item Conventions

| Field | Requirement |
|-------|-------------|
| `operationId` | Matches API ID: `API_LED_003_createLead` |
| `summary` | ≤ 80 chars |
| `tags` | Domain tag |
| `security` | Override global per endpoint |
| `parameters` | Path, query, header refs |
| `requestBody` | Required for POST/PUT/PATCH |
| `responses` | 200/201 success envelope + 4xx/5xx error refs |
| `x-permission` | RBAC string e.g. `leads.create:branch` |
| `x-catalog-id` | API ID |
| `x-phase` | P1/P2/P3 |
| `x-idempotent` | true for financial mutations |

## 15.6 Alias Documentation Pattern

Alias endpoints documented under canonical path `x-aliases`:

```json
"x-aliases": [
  { "apiId": "API-DSH-005", "path": "/branch/dashboard", "canonical": "API-BRN-001" }
]
```

---

# DOCUMENT APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| API Architect | | | |
| Head of Engineering | | | |
| CISO | | | |
| CTO | | | |

---

# REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | Kuber Finserve Engineering | Initial catalog reconciliation; Appendix B expanded; 324→421 correction |

---

**© 2026 Kuber Finserve. Confidential — For Internal, Engineering, and Integration Use.**

*This document is the authoritative API catalog and OpenAPI governance reference for KuberOne. It supersedes incomplete Appendix B in the API Specification and must be updated with every catalog change.*
