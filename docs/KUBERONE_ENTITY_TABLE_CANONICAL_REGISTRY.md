# KuberOne
## Entity→Table Canonical Registry

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Canonical Data Registry  
**Classification:** Data Architecture | Prisma Ready | Backend Ready | CTO Ready  
**Version:** 1.0  
**Date:** June 2026  
**Tech Stack:** MySQL 8 · Prisma ORM · Node.js · Express.js · TypeScript  

**Related Documents:**
- [KUBERONE_ER_DIAGRAM_AND_DATA_MODEL.md](./KUBERONE_ER_DIAGRAM_AND_DATA_MODEL.md) — Logical entity model (131 entities)
- [KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md](./KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md) — Physical table specification (139 Phase-1 tables)
- [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md) — Workflow engine configuration (§19)
- [KUBERONE_ENTERPRISE_ARCHITECTURE_AUDIT_REPORT.md](./KUBERONE_ENTERPRISE_ARCHITECTURE_AUDIT_REPORT.md) — Cross-document conflict audit
- [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md) — RAG and AI table naming
- [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md) — Config persistence APIs
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) — Role and permission seeds

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Authoritative mapping of all logical entities to physical MySQL tables |
| **Audience** | Data Architects, Backend Engineers, DBA, AI Platform, Compliance |
| **Purpose** | Resolve ER↔DB drift; unblock Prisma schema generation and migrations |
| **Status** | Authoritative Canonical Registry |
| **Out of Scope** | SQL DDL, Prisma schema code, API implementation |

---

# 1. EXECUTIVE SUMMARY

KuberOne's enterprise data model is documented in two parallel artifacts: the **ER Diagram & Data Model** (131 logical entities) and the **Database Schema Specification** (139 Phase-1 physical tables plus 18 future tables). Prior to this registry, approximately **30 naming and structural conflicts** blocked Prisma migration, backend module scaffolding, and cross-team alignment.

**Authoritative resolution:** The **Database Schema Specification is the single source of truth for physical table names, column names, keys, and indexes.** The ER Diagram remains authoritative for **business semantics, relationships, lifecycles, and domain boundaries.** Where they diverge, this registry defines the canonical mapping.

| Metric | Count | Notes |
|--------|-------|-------|
| ER logical entities | 131 | Appendix A, ER Diagram |
| Phase-1 physical tables | 139 | Appendix A, DB Schema |
| New configuration tables (this registry) | 8 | Resolves Audit CONFLICT-05 |
| **Total canonical entity mappings** | **139** | 131 ER + 8 config |
| DB-only tables (no ER entity) | 12 | Master data extensions, cache, profile splits |
| Future Phase 2–4 tables | 18 | Reserved expansion slots |
| Conflicts resolved | 32 | See §3 Conflict Resolution Log |

**Key unifications applied:**
- Partner split (`dsa_partners`, `referral_partners`) → unified `partners` with `partner_type_id` FK
- Knowledge article monolith → typed tables (`policies`, `sops`, `faqs`, `training_materials`, `sales_scripts`)
- BL variant extensions (`working_capital_details`, `od_cc_details`) → `business_loan_details` + `business_financials` + `business_gst_profiles`
- AL BT/Top-Up child entities → `auto_loan_details.variant_code` (no separate BT/Top-Up tables in Phase 1)
- Analytics naming (`kpi_definitions`, `metric_snapshots`) → `kpis`, `metrics`
- Communication logs (`sms_messages`, `whatsapp_messages`) → `sms_logs`, `whatsapp_logs`

**Downstream actions:** Update ER Diagram Appendix A to reflect canonical table names; generate Prisma models using `@@map` per §8; deprecate legacy names in Backend Blueprint and AI RAG Architecture references (`kb_*`, `rag_sources` as logical alias only).

---

# 2. CANONICAL RESOLUTION RULES

| # | Rule | Description | Example |
|---|------|-------------|---------|
| **R-01** | **DB Schema wins on physical names** | Table and column names in MySQL follow DB Schema snake_case. ER logical table names are deprecated when they differ. | `addresses` → `customer_addresses` |
| **R-02** | **Singular junction, plural entity** | Junction tables use `{entity_a}_{entity_b}` pattern. Core entities use plural snake_case tables. | `role_permissions`, `user_roles` |
| **R-03** | **Partner unification** | All partner subtypes (DSA, Referral, Builder, CA) map to `partners.partner_type_id` → `partner_types.code`. ER entities `DsaPartner` and `ReferralPartner` are logical views, not separate tables. | `DsaPartner` + `ReferralPartner` → `partners` |
| **R-04** | **Customer sub-entity prefix** | Customer-owned child records use `customer_` table prefix in DB Schema. | `Employment` → `customer_employment` |
| **R-05** | **KB content-type split** | ER `KnowledgeArticle` splits by `articleType` / `content_type` discriminator into physical typed tables. Version history uses inline `content_version` column, not a separate versions table. | POLICY→`policies`, SOP→`sops` |
| **R-06** | **Product extension variant absorption** | When DB Schema uses `variant_code` on a parent extension table and omits child tables, ER child entities are deprecated and fields merge into parent or sibling tables. | `AutoLoanBtDetail` → `auto_loan_details` (variant_code=BT) |
| **R-07** | **BL financial decomposition** | Working capital metrics → `business_financials`. OD/CC facility fields → `business_gst_profiles`. Core business identity → `business_loan_details`. | WC + OD/CC ER entities → 3 DB tables |
| **R-08** | **KYC polymorphic profile** | ER `KycProfile` (customer) and `KycStatus` (polymorphic) unify to `kyc_profiles` with `entity_type` + `entity_id`. Audit trail → `kyc_audit_logs`. | `KycStatus` → absorbed into `kyc_profiles` |
| **R-09** | **AI/RAG naming bridge** | Physical table `knowledge_sources` is canonical. AI RAG doc term `rag_sources` is a **logical module alias** for indexed chunks; Phase 2 may add `rag_embeddings`. `AiInsight` with `insightType=RECOMMENDATION` routes to `ai_recommendations`; all other insight types → `ai_insights`. | `KnowledgeSource` → `knowledge_sources` |
| **R-10** | **Configuration as first-class tables** | Workflow, LMS, notification, and approval rules persist in dedicated versioned config tables (§5), not unversioned `system_settings` JSON blobs. `system_settings` retains only global feature flags. | `workflow_definitions` per product variant |

---

# 3. CONFLICT RESOLUTION LOG

| ID | ER Entity / Concept | ER Logical Table | Canonical Physical Table | Resolution | Status |
|----|---------------------|------------------|--------------------------|------------|--------|
| C-01 | DsaPartner | dsa_partners | partners | Unified partner model; filter `partner_type_id` where code=DSA | Mapped |
| C-02 | ReferralPartner | referral_partners | partners | Unified partner model; filter `partner_type_id` where code=REFERRAL | Mapped |
| C-03 | Address | addresses | customer_addresses | Customer prefix convention (R-04) | Mapped |
| C-04 | Employment | employments | customer_employment | Singular employment record table name in DB | Mapped |
| C-05 | IncomeDetail | income_details | customer_income | Customer prefix convention (R-04) | Mapped |
| C-06 | DeviceRegistration | device_registrations | devices | DB Schema canonical name | Mapped |
| C-07 | LeadFollowUp | lead_follow_ups | lead_followups | Underscore removed per DB Schema | Mapped |
| C-08 | ApplicationStatus | application_statuses | application_status | Singular status record per application (1:1) | Mapped |
| C-09 | ApplicationTimeline | application_timelines | application_timeline | Singular timeline event stream table | Mapped |
| C-10 | WorkingCapitalDetail | working_capital_details | business_loan_details + business_financials | WC fields absorbed; variant_code=WORKING_CAPITAL | Deprecated |
| C-11 | OdCcDetail | od_cc_details | business_loan_details + business_gst_profiles | OD/CC fields in gst profile; variant_code=OD or CC | Deprecated |
| C-12 | AutoLoanBtDetail | auto_loan_bt_details | auto_loan_details | variant_code=BT; BT columns on parent or metadata JSON | Deprecated |
| C-13 | AutoLoanTopUpDetail | auto_loan_topup_details | auto_loan_details | variant_code=TOP_UP; top-up columns on parent | Deprecated |
| C-14 | KnowledgeArticle | knowledge_articles | policies \| sops \| training_materials | Split by articleType/content_type (R-05) | Mapped |
| C-15 | KnowledgeArticleVersion | knowledge_article_versions | policies.content_version / sops.content_version | Inline versioning; no separate table Phase 1 | Deprecated |
| C-16 | KpiDefinition | kpi_definitions | kpis | DB Schema canonical name | Mapped |
| C-17 | MetricSnapshot | metric_snapshots | metrics | Time-series KPI values per DB Schema §23.2 | Mapped |
| C-18 | PartnerBankDetail | partner_bank_details | partner_bank_accounts | DB Schema canonical name | Mapped |
| C-19 | Sms | sms_messages | sms_logs | Channel delivery log naming convention | Mapped |
| C-20 | WhatsApp | whatsapp_messages | whatsapp_logs | Channel delivery log naming convention | Mapped |
| C-21 | AiInsight | ai_insights | ai_insights | CRM Copilot insights; distinct from ai_recommendations (product recs) | Canonical |
| C-22 | KnowledgeSource | knowledge_sources | knowledge_sources | rag_sources is logical/RAG-layer alias only (R-09) | Canonical |
| C-23 | KycProfile (Customer) | kyc_profiles | kyc_profiles | Polymorphic entity_type=CUSTOMER; customers.kyc_status is denormalized cache | Canonical |
| C-24 | KycStatus | kyc_statuses | kyc_profiles | Polymorphic status absorbed into kyc_profiles.overall_status | Deprecated |
| C-25 | KycAudit | kyc_audits | kyc_audit_logs | DB Schema canonical name | Mapped |
| C-26 | ReportingStructure | reporting_structures | employee_reporting | Historical reporting lines; employees.reports_to_id holds current manager | Mapped |
| C-27 | Escalation (Support) | escalations | ticket_escalations | Ticket-scoped prefix convention | Mapped |
| C-28 | Resolution (Support) | resolutions | ticket_resolutions | Ticket-scoped prefix convention | Mapped |
| C-29 | Lead grading taxonomy | Hot/Warm/Cold (Loan Products) | A+/A/B/C/Rejected (AI + Workflow) | Business Workflow §Lead Grading authoritative; Hot/Warm/Cold are display aliases | Mapped |
| C-30 | AI RAG KB tables | kb_articles, kb_faqs | policies, faqs, sops, training_materials, sales_scripts | DB Schema typed tables; kb_* prefix deprecated | Mapped |
| C-31 | Workflow/LMS config | (no ER entity) | workflow_definitions, lms_* tables | New config tables per §5; resolves CONFLICT-05 | New |
| C-32 | analytics_snapshots vs metrics | metric_snapshots (ER only) | metrics + analytics_snapshots | metrics = KPI time-series; analytics_snapshots = denormalized dashboard cache (DB-only) | Split |

---

# 4. MASTER REGISTRY TABLE

**Legend — Status:**
- **Canonical** — ER entity name matches physical table (1:1, no rename)
- **Mapped** — ER entity maps to physical table with different name or split
- **Deprecated** — ER entity retired; data lives in another canonical table
- **New** — Entity introduced by this registry; no ER Appendix A entry

**Legend — Source Doc:** ER = ER Diagram; DB = Database Schema; WF = Business Workflow; REG = This Registry

---

## 4.1 Identity & Access (10 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| User | Platform login identity for all user types | Identity | users | — | Customer, Employee, Partner (via user_id), Session, OtpVerification, DeviceRegistration, LoginHistory, RefreshToken, UserRole | ER, DB | — | Canonical |
| Role | RBAC role definition | Identity | roles | — | RolePermission, UserRole | ER, DB | permissions (via junction) | Canonical |
| Permission | Atomic authorization grant | Identity | permissions | — | RolePermission | ER, DB | — | Canonical |
| RolePermission | Role↔Permission junction | Identity | role_permissions | Role, Permission | — | ER, DB | roles, permissions | Canonical |
| UserRole | User↔Role junction with scope | Identity | user_roles | User, Role | — | ER, DB | users, roles, branches, regions | Canonical |
| Session | Active authenticated session | Identity | sessions | User | RefreshToken, LoginHistory | ER, DB | users | Canonical |
| OtpVerification | OTP generation and verification audit | Identity | otp_verifications | User | — | ER, DB | users | Canonical |
| DeviceRegistration | Mobile device fingerprint and FCM token | Identity | devices | User | PushNotification | ER, DB | users | Mapped |
| LoginHistory | Immutable login attempt log | Identity | login_history | User, Session | — | ER, DB | users, sessions | Canonical |
| RefreshToken | JWT refresh token rotation chain | Identity | refresh_tokens | User, Session | — | ER, DB | users, sessions | Canonical |

---

## 4.2 Customer (8 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| Customer | Borrower master record and KYC summary | Customer | customers | User | CustomerProfile, Address, Employment, IncomeDetail, KycProfile, CustomerPreference, CustomerConsent, Application, Lead, Referral | ER, DB | users, branches, employees | Canonical |
| CustomerProfile | Extended profile, language, contact prefs | Customer | customer_profiles | Customer | — | ER, DB | customers | Canonical |
| Address | Customer address book (current, permanent, office, property) | Customer | customer_addresses | Customer | Employment (officeAddressId) | ER, DB | customers | Mapped |
| Employment | Employment history and current job | Customer | customer_employment | Customer | IncomeDetail | ER, DB | customers, customer_addresses | Mapped |
| IncomeDetail | Declared and verified income records | Customer | customer_income | Customer, Employment | — | ER, DB | customers, customer_employment | Mapped |
| KycProfile | Central KYC state (PAN, Aadhaar, CKYC) | Customer / KYC | kyc_profiles | Customer | PanVerification, AadhaarVerification, KycAudit | ER, DB | customers (entity_type=CUSTOMER) | Canonical |
| CustomerPreference | Notification and AI feature toggles | Customer | customer_preferences | Customer | — | ER, DB | customers | Canonical |
| CustomerConsent | Versioned regulatory consents (DPDP, credit check) | Customer | customer_consents | Customer | — | ER, DB | customers | Canonical |

---

## 4.3 Partner (7 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| DsaPartner | Direct Selling Agent partner profile | Partner | partners | User | PartnerKyc, PartnerBankDetail, PartnerDocument, PartnerPerformance, PartnerAgreement, Lead, CommissionLedger | ER, DB | users, partner_types (code=DSA), branches, regions | Mapped |
| ReferralPartner | Referral channel partner profile | Partner | partners | User | PartnerKyc, Referral, Lead | ER, DB | users, partner_types (code=REFERRAL) | Mapped |
| PartnerKyc | Partner KYC verification state | Partner | partner_kyc | DsaPartner / ReferralPartner → partners | — | ER, DB | partners | Canonical |
| PartnerBankDetail | Partner payout bank accounts | Partner | partner_bank_accounts | DsaPartner → partners | CommissionPayment | ER, DB | partners, banks | Mapped |
| PartnerDocument | Partner onboarding documents | Partner | partner_documents | DsaPartner → partners | PartnerAgreement | ER, DB | partners | Canonical |
| PartnerPerformance | Periodic partner KPI snapshots | Partner | partner_performance | DsaPartner → partners | — | ER, DB | partners | Canonical |
| PartnerAgreement | DSA agreements and certifications | Partner | partner_agreements | DsaPartner → partners | — | ER, DB | partners, partner_documents | Canonical |

---

## 4.4 Organization (5 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| Employee | Internal staff record | Organization | employees | User | ReportingStructure, LeadAssignment, TicketAssignment | ER, DB | users, departments, branches, regions | Canonical |
| Branch | Operating branch location | Organization | branches | Region | Employee, Lead, Application, Partner, Customer | ER, DB | regions, cities | Canonical |
| Region | Geographic region hierarchy | Organization | regions | — | Branch, Employee | ER, DB | — | Canonical |
| Department | Functional department (Sales, Credit, Ops) | Organization | departments | — | Employee | ER, DB | — | Canonical |
| ReportingStructure | Employee↔Manager reporting history | Organization | employee_reporting | Employee | — | ER, DB | employees | Mapped |

---

## 4.5 Product (7 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| ProductFamily | Loan product family (HL, LAP, BL, AL) | Product | product_families | — | Product, TrainingMaterial | ER, DB | — | Canonical |
| Product | Sellable loan product | Product | products | ProductFamily | ProductVariant, EligibilityRule, DocumentRule, Application, Campaign | ER, DB | product_families | Canonical |
| ProductVariant | Product variant (Fresh, BT, Top-Up, etc.) | Product | product_variants | Product | WorkflowDefinition (config) | ER, DB | products | Canonical |
| EligibilityRule | Product eligibility rule definitions | Product | eligibility_rules | Product | EligibilityResult, WorkflowDefinition (ref) | ER, DB | products | Canonical |
| DocumentRule | Mandatory document checklist per product | Product | document_rules | Product, DocumentType | DocumentRequest | ER, DB | products, document_types | Canonical |
| Lender | Lending institution master | Product / Master Data | lenders | — | LenderPolicy, BankLogin, Sanction, KnowledgeSource | ER, DB | — | Canonical |
| LenderPolicy | Lender-specific product policies and rates | Product | lender_policies | Lender, Product | — | ER, DB | lenders, products | Canonical |

---

## 4.6 LMS — Lead Management (8 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| Lead | Sales lead pipeline record | LMS | leads | Customer, Branch, Partner | LeadScore, LeadAssignment, LeadActivity, LeadStatusHistory, LeadNote, LeadFollowUp, Application | ER, DB | customers, branches, partners, lead_sources, campaigns | Canonical |
| LeadSource | Lead ingestion channel catalog | LMS | lead_sources | — | Lead | ER, DB | — | Canonical |
| LeadScore | Lead scoring result (A+–Rejected) | LMS | lead_scores | Lead | — | ER, DB | leads, lms_scoring_config | Canonical |
| LeadAssignment | Lead ownership assignment history | LMS | lead_assignments | Lead, Employee | — | ER, DB | leads, employees, lms_assignment_rules | Canonical |
| LeadActivity | Lead interaction activity log | LMS | lead_activities | Lead | — | ER, DB | leads, users | Canonical |
| LeadStatusHistory | Immutable lead status transition log | LMS | lead_status_history | Lead | — | ER, DB | leads | Canonical |
| LeadNote | Internal notes on leads | LMS | lead_notes | Lead | — | ER, DB | leads, users | Canonical |
| LeadFollowUp | Scheduled follow-up tasks | LMS | lead_followups | Lead | — | ER, DB | leads, employees | Mapped |

---

## 4.7 LOS — Loan Origination (9 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| Application | Loan application master (S01–S09) | LOS | applications | Customer, Lead, Product, Branch | ApplicationStatus, ApplicationTimeline, EligibilityResult, BankLogin, CreditReview, Sanction, Disbursement, Closure, product extension details, Document, CommissionLedger | ER, DB | customers, products, branches, leads, workflow_definitions | Canonical |
| ApplicationStatus | Current application status snapshot (1:1) | LOS | application_status | Application | — | ER, DB | applications | Mapped |
| ApplicationTimeline | Stage transition event stream | LOS | application_timeline | Application | — | ER, DB | applications | Mapped |
| EligibilityResult | Eligibility check outcome per application | LOS | eligibility_results | Application | — | ER, DB | applications, eligibility_rules | Canonical |
| BankLogin | Lender submission tracking | LOS | bank_logins | Application, Lender | CreditReview | ER, DB | applications, lenders | Canonical |
| CreditReview | Internal/lender credit review record | LOS | credit_reviews | Application, BankLogin | — | ER, DB | applications, bank_logins | Canonical |
| Sanction | Lender sanction terms (1:1) | LOS | sanctions | Application, Lender | Disbursement | ER, DB | applications, lenders | Canonical |
| Disbursement | Disbursement event triggering commission | LOS | disbursements | Application, Sanction | CommissionLedger, Closure | ER, DB | applications, sanctions | Canonical |
| Closure | Application closure and portfolio handoff | LOS | closures | Application | — | ER, DB | applications | Canonical |

---

## 4.8 Home Loan Extensions (3 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| HomeLoanDetail | Home loan application extension | HL | home_loan_details | Application | HomeLoanBalanceTransferDetail, HomeLoanTopUpDetail | ER, DB | applications | Canonical |
| HomeLoanBalanceTransferDetail | HL balance transfer specifics | HL | home_loan_bt_details | HomeLoanDetail | — | ER, DB | home_loan_details | Canonical |
| HomeLoanTopUpDetail | HL top-up loan specifics | HL | home_loan_topup_details | HomeLoanDetail | — | ER, DB | home_loan_details | Canonical |

---

## 4.9 LAP Extensions (3 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| LapDetail | Loan Against Property extension | LAP | lap_details | Application | LapBalanceTransferDetail, LapTopUpDetail | ER, DB | applications | Canonical |
| LapBalanceTransferDetail | LAP balance transfer specifics | LAP | lap_bt_details | LapDetail | — | ER, DB | lap_details | Canonical |
| LapTopUpDetail | LAP top-up specifics | LAP | lap_topup_details | LapDetail | — | ER, DB | lap_details | Canonical |

---

## 4.10 Business Loan Extensions (3 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| BusinessLoanDetail | Business/MSME/WC/OD/CC loan extension | BL | business_loan_details | Application | WorkingCapitalDetail→business_financials, OdCcDetail→business_gst_profiles | ER, DB | applications, industries | Canonical |
| WorkingCapitalDetail | WC-specific financial metrics | BL | business_financials | BusinessLoanDetail | — | ER, DB | business_loan_details (variant_code=WORKING_CAPITAL) | Deprecated |
| OdCcDetail | Overdraft/Cash Credit facility details | BL | business_gst_profiles | BusinessLoanDetail | — | ER, DB | business_loan_details (variant_code=OD or CC) | Deprecated |

---

## 4.11 Auto Loan Extensions (3 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| AutoLoanDetail | Auto loan extension all variants | AL | auto_loan_details | Application | vehicle_profiles, vehicle_valuations (DB-only children) | ER, DB | applications, vehicle_manufacturers, vehicle_models | Canonical |
| AutoLoanBtDetail | Auto loan balance transfer fields | AL | auto_loan_details | AutoLoanDetail | — | ER, DB | variant_code=BT; BT fields in parent columns/metadata | Deprecated |
| AutoLoanTopUpDetail | Auto loan top-up fields | AL | auto_loan_details | AutoLoanDetail | — | ER, DB | variant_code=TOP_UP; top-up fields in parent columns/metadata | Deprecated |

---

## 4.12 Document Management (7 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| Document | Uploaded document with S3 reference | Document | documents | Customer, Application, Partner | DocumentVersion, OcrResult, VerificationResult | ER, DB | document_types, users | Canonical |
| DocumentType | Document type catalog and OCR rules | Document | document_types | — | Document, DocumentRule | ER, DB | — | Canonical |
| DocumentRequest | Outstanding document checklist item | Document | document_requests | Application, DocumentType | DocumentDeficiency | ER, DB | applications, document_types | Canonical |
| OcrResult | OCR extraction result per document version | Document | ocr_results | Document, DocumentVersion | — | ER, DB | documents, document_versions | Canonical |
| VerificationResult | Human/AI document verification outcome | Document | verification_results | Document | — | ER, DB | documents, users | Canonical |
| DocumentDeficiency | Document deficiency tracking and rework | Document | document_deficiencies | Application, DocumentRequest | — | ER, DB | applications | Canonical |
| DocumentVersion | Document version history | Document | document_versions | Document | OcrResult | ER, DB | documents | Canonical |

---

## 4.13 KYC (4 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| PanVerification | PAN verification attempt log | KYC | pan_verifications | KycProfile | — | ER, DB | kyc_profiles | Canonical |
| AadhaarVerification | Aadhaar verification attempt log | KYC | aadhaar_verifications | KycProfile | — | ER, DB | kyc_profiles | Canonical |
| KycStatus | Polymorphic KYC completion tracker | KYC | kyc_profiles | Customer, Partner | KycAudit | ER, DB | Absorbed into kyc_profiles.overall_status | Deprecated |
| KycAudit | Immutable KYC state change audit | KYC | kyc_audit_logs | KycProfile / KycStatus | — | ER, DB | kyc_profiles, users | Mapped |

---

## 4.14 Referral (4 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| Referral | Referral link and conversion tracking | Referral | referrals | Customer, ReferralPartner→partners | ReferralReward | ER, DB | referral_sources, customers, partners, applications | Canonical |
| ReferralSource | Referral channel catalog | Referral | referral_sources | — | Referral | ER, DB | — | Canonical |
| ReferralReward | Referral reward entitlement | Referral | referral_rewards | Referral | ReferralTransaction | ER, DB | referrals, employees | Canonical |
| ReferralTransaction | Referral reward payout transaction | Referral | referral_transactions | ReferralReward | — | ER, DB | referral_rewards | Canonical |

---

## 4.15 Commission (7 entities — includes junction)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| CommissionRule | Commission calculation rule | Commission | commission_rules | Product | CommissionLedger | ER, DB | products | Canonical |
| CommissionLedger | Immutable commission accrual record | Commission | commission_ledger | Application, Partner, CommissionRule | CommissionApproval, CommissionAdjustment, CommissionRecovery, CommissionPaymentLine | ER, DB | applications, partners, commission_rules, disbursements | Canonical |
| CommissionApproval | Multi-level commission approval | Commission | commission_approvals | CommissionLedger | — | ER, DB | commission_ledger, employees, approval_rule_configs | Canonical |
| CommissionPayment | Partner payout batch | Commission | commission_payments | Partner | CommissionPaymentLine | ER, DB | partners, partner_bank_accounts | Canonical |
| CommissionAdjustment | Post-calculation bonus/penalty/correction | Commission | commission_adjustments | CommissionLedger | — | ER, DB | commission_ledger, employees | Canonical |
| CommissionRecovery | Clawback and recovery tracking | Commission | commission_recoveries | CommissionLedger | — | ER, DB | commission_ledger | Canonical |
| CommissionPaymentLine | CommissionPayment↔CommissionLedger junction | Commission | commission_payment_lines | CommissionPayment, CommissionLedger | — | ER, DB | commission_payments, commission_ledger | Canonical |

---

## 4.16 Support (5 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| Ticket | Customer/partner support ticket | Support | tickets | Customer, Partner, Application | TicketMessage, TicketAssignment, Escalation, Resolution | ER, DB | customers, partners, applications | Canonical |
| TicketMessage | Ticket conversation thread | Support | ticket_messages | Ticket | — | ER, DB | tickets, users | Canonical |
| TicketAssignment | Ticket agent assignment history | Support | ticket_assignments | Ticket, Employee | — | ER, DB | tickets, employees | Canonical |
| Escalation | Ticket escalation event | Support | ticket_escalations | Ticket, Employee | — | ER, DB | tickets, employees, lms_escalation_rules | Mapped |
| Resolution | Ticket resolution record (1:1) | Support | ticket_resolutions | Ticket, Employee | — | ER, DB | tickets, employees | Mapped |

---

## 4.17 Communication (6 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| Notification | In-app notification inbox | Communication | notifications | User | — | ER, DB | users | Canonical |
| Email | Email delivery log | Communication | emails | User | CommunicationLog | ER, DB | users | Canonical |
| Sms | SMS delivery log | Communication | sms_logs | User | CommunicationLog | ER, DB | users, notification_rule_configs | Mapped |
| WhatsApp | WhatsApp delivery log | Communication | whatsapp_logs | User | CommunicationLog | ER, DB | users, notification_rule_configs | Mapped |
| PushNotification | FCM push delivery log | Communication | push_notifications | User, DeviceRegistration | CommunicationLog | ER, DB | users, devices | Canonical |
| CommunicationLog | Unified cross-channel communication index | Communication | communication_logs | User | — | ER, DB | emails, sms_logs, whatsapp_logs, push_notifications | Canonical |

---

## 4.18 Campaign (4 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| Campaign | Marketing campaign definition | Campaign | campaigns | Product | CampaignAudience, CampaignActivity, CampaignResult, Lead | ER, DB | products, users | Canonical |
| CampaignAudience | Campaign target segment definition | Campaign | campaign_audiences | Campaign | — | ER, DB | campaigns | Canonical |
| CampaignActivity | Per-recipient campaign event log | Campaign | campaign_activities | Campaign | — | ER, DB | campaigns, users, leads | Canonical |
| CampaignResult | Campaign performance summary (1:1) | Campaign | campaign_results | Campaign | — | ER, DB | campaigns | Canonical |

---

## 4.19 AI (7 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| ChatSession | AI chat session (Advisor, Copilot, DSA) | AI | chat_sessions | Customer, Employee | ChatMessage, AiRecommendation | ER, DB | customers, employees | Canonical |
| ChatMessage | Ordered chat messages with RAG citations | AI | chat_messages | ChatSession | — | ER, DB | chat_sessions, knowledge_sources | Canonical |
| AiRecommendation | Product/lender/amount recommendations | AI | ai_recommendations | Customer, ChatSession | — | ER, DB | customers, chat_sessions, products | Canonical |
| AiInsight | Contextual AI insights (score, risk, next action) | AI | ai_insights | Lead, Application, Customer, Partner | — | ER, DB | Polymorphic entity_type+entity_id; distinct from ai_recommendations | Canonical |
| VoiceSession | Voice AI call session and transcript | AI | voice_sessions | Customer | — | ER, DB | customers | Canonical |
| KnowledgeSource | RAG-indexable knowledge source registry | AI / Knowledge | knowledge_sources | Product, Lender | — (RAG chunks: logical rag_sources) | ER, DB, AI RAG | policies, faqs, sops, training_materials, sales_scripts | Canonical |
| PromptTemplate | Versioned LLM prompt templates | AI | prompt_templates | — | ChatSession (via config ref) | ER, DB | — | Canonical |

---

## 4.20 Knowledge Base (6 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| KnowledgeArticle | Published policy, SOP, training, guide content | KB | policies \| sops \| training_materials | KnowledgeCategory | KnowledgeArticleVersion→inline | ER, DB | Split by articleType: POLICY→policies, SOP→sops, TRAINING→training_materials, GUIDE/PRODUCT_INFO→policies | Mapped |
| Faq | Frequently asked questions | KB | faqs | KnowledgeCategory | — | ER, DB | knowledge_categories, products | Canonical |
| SalesScript | Stage-specific sales scripts | KB | sales_scripts | Product | — | ER, DB | products | Canonical |
| KnowledgeCategory | Hierarchical KB taxonomy | KB | knowledge_categories | KnowledgeCategory (self) | KnowledgeArticle, Faq | ER, DB | — | Canonical |
| KnowledgeArticleVersion | Article version history | KB | policies.content_version / sops.content_version | KnowledgeArticle | — | ER, DB | Inline versioning; no separate table Phase 1 | Deprecated |
| TrainingMaterial | Partner certification training content | KB | training_materials | ProductFamily | — | ER, DB | product_families | Canonical |

---

## 4.21 Analytics (5 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| KpiDefinition | KPI definition and formula | Analytics | kpis | — | MetricSnapshot→metrics | ER, DB | — | Mapped |
| MetricSnapshot | Time-series KPI actual vs target | Analytics | metrics | KpiDefinition→kpis | — | ER, DB | kpis | Mapped |
| Dashboard | Role-based dashboard layout | Analytics | dashboards | — | KpiDefinition (via layout JSON) | ER, DB | kpis, analytics_snapshots (cache) | Canonical |
| Report | Scheduled/ondemand report definition | Analytics | reports | — | ReportExecution | ER, DB | — | Canonical |
| ReportExecution | Report generation run history | Analytics | report_executions | Report | — | ER, DB | reports, users | Canonical |

---

## 4.22 Audit (5 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| AuditLog | Entity-level action audit trail | Audit | audit_logs | User | — | ER, DB | users | Canonical |
| AccessLog | PII and resource access tracking | Audit | access_logs | User | — | ER, DB | users | Canonical |
| ChangeLog | Field-level change history | Audit | change_logs | User | — | ER, DB | users | Canonical |
| ApprovalLog | SoD-compliant approval decisions | Audit | approval_logs | User | — | ER, DB | users, approval_rule_configs | Canonical |
| SecurityEvent | Security incident and anomaly log | Audit | security_events | User | — | ER, DB | users | Canonical |

---

## 4.23 Settings (5 entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| SystemSetting | Global system configuration key-value | Settings | system_settings | — | — | ER, DB | Non-workflow flags only per R-10 | Canonical |
| ProductSetting | Per-product configuration overrides | Settings | product_settings | Product | — | ER, DB | products | Canonical |
| NotificationSetting | Legacy event→channel notification mapping | Settings | notification_settings | — | — | ER, DB | Superseded by notification_rule_configs for new rules; retained for backward compat | Canonical |
| SecuritySetting | Security policy configuration | Settings | security_settings | — | — | ER, DB | — | Canonical |
| AiSetting | AI model and feature configuration | Settings | ai_settings | — | — | ER, DB | prompt_templates | Canonical |

---

## 4.24 Workflow & Rules Configuration (8 new entities)

| Entity Name | Purpose | Owning Module | Canonical Table | Parent Entity | Child Entities | Source Doc | Dependencies | Status |
|-------------|---------|---------------|-----------------|---------------|----------------|------------|--------------|--------|
| WorkflowDefinition | Per product-variant LOS stage sequence and gates | Workflow Engine | workflow_definitions | ProductVariant | WorkflowStageConfig | WF §19, REG | product_variants, eligibility_rules | New |
| WorkflowStageConfig | Per-stage SLA, mandatory docs, approval gates | Workflow Engine | workflow_stage_configs | WorkflowDefinition | — | WF §19, REG | workflow_definitions, document_rules | New |
| LmsAssignmentRule | Lead auto-assignment rule set | LMS | lms_assignment_rules | — | — | WF §19, REG | branches, employees, roles | New |
| LmsScoringConfig | Lead scoring weights, grade thresholds, AI weight | LMS | lms_scoring_config | — | — | WF §19, REG | — | New |
| LmsSlaRule | Domain SLA targets and measurement rules | LMS / LOS | lms_sla_rules | — | — | WF §19, REG Appendix B | workflow_stage_configs | New |
| LmsEscalationRule | SLA breach escalation routing | LMS / Support | lms_escalation_rules | — | — | WF §19, REG | lms_sla_rules, employees, roles | New |
| NotificationRuleConfig | Event-driven multi-channel notification rules | Communication | notification_rule_configs | — | — | REG | emails, sms_logs, whatsapp_logs, push_notifications | New |
| ApprovalRuleConfig | Multi-level approval gate definitions (SoD) | Audit / LOS | approval_rule_configs | — | — | REG | roles, approval_logs | New |

---

# 5. NEW CONFIGURATION TABLES (DETAIL)

*Introduced to resolve Enterprise Audit CONFLICT-05. Managed via Admin Console → Settings → Workflow Config. APIs: `PUT /admin/workflows`, `PUT /crm/lms/assignment-rules`, `GET /crm/lms/scoring-config`.*

## 5.1 workflow_definitions

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Versioned workflow template per product variant |
| **Parent** | product_variants (FK product_variant_id) |
| **Key columns** | id, product_variant_id, workflow_code, version, effective_from, effective_to, is_active, stage_sequence JSON, approval_gates JSON, rework_rules JSON, mandatory_document_codes JSON, created_by, created_at |
| **Versioning** | New version on every config change; applies to new applications only (WF §19.3) |
| **Prisma model** | `WorkflowDefinition` → `@@map("workflow_definitions")` |

## 5.2 workflow_stage_configs

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Per-stage overrides within a workflow definition |
| **Parent** | workflow_definitions (FK workflow_definition_id) |
| **Key columns** | id, workflow_definition_id, stage_code (S01–S09), sla_days, sla_business_days_only, mandatory_role_code, auto_transition_rules JSON, handler_module, is_skippable, metadata JSON |
| **Example** | HL-01 S03: sla_days=5; BL-01 S03: sla_days=7 (WF §19.2) |
| **Prisma model** | `WorkflowStageConfig` → `@@map("workflow_stage_configs")` |

## 5.3 lms_assignment_rules

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Priority-ordered lead assignment rule engine config |
| **Parent** | — (scoped by branch_id, region_id nullable) |
| **Key columns** | id, name, version, branch_id, region_id, rules JSON [{priority, condition, assignToRole, assignToEmployeeId}], effective_from, effective_to, is_active, created_by |
| **API** | `GET/PUT /crm/lms/assignment-rules` |
| **Prisma model** | `LmsAssignmentRule` → `@@map("lms_assignment_rules")` |

## 5.4 lms_scoring_config

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Lead scoring factor weights and grade thresholds |
| **Parent** | — (global or per product_family_id) |
| **Key columns** | id, product_family_id (nullable), version, factor_weights JSON, grade_thresholds JSON {A+:85, A:70, B:50, C:30}, ai_weight DECIMAL, gate_rules JSON, effective_from, effective_to, is_active |
| **Grades** | A+, A, B, C, Rejected canonical; Hot/Warm/Cold are UI aliases (C-29) |
| **Prisma model** | `LmsScoringConfig` → `@@map("lms_scoring_config")` |

## 5.5 lms_sla_rules

| Attribute | Description |
|-----------|-------------|
| **Purpose** | SLA master targets by domain and stage |
| **Parent** | — (may reference workflow_stage_configs optionally) |
| **Key columns** | id, domain ENUM (LMS, LOS, SUPPORT, COMMISSION), sla_name, target_value, target_unit ENUM (MINUTES, HOURS, DAYS, PERCENT), measurement_formula, effective_from, effective_to, is_active |
| **Source** | WF Appendix B SLA Master Table |
| **Prisma model** | `LmsSlaRule` → `@@map("lms_sla_rules")` |

## 5.6 lms_escalation_rules

| Attribute | Description |
|-----------|-------------|
| **Purpose** | SLA breach and event-triggered escalation routing |
| **Parent** | lms_sla_rules (FK sla_rule_id, nullable) |
| **Key columns** | id, sla_rule_id, trigger_event, escalation_level, escalate_to_role, escalate_to_employee_id, notify_channels JSON, cooldown_minutes, is_active |
| **Prisma model** | `LmsEscalationRule` → `@@map("lms_escalation_rules")` |

## 5.7 notification_rule_configs

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Event-driven notification routing replacing ad-hoc notification_settings for new events |
| **Parent** | — |
| **Key columns** | id, event_code, channels JSON, template_codes JSON per channel, delay_minutes, conditions JSON, audience_type ENUM, is_enabled, version, effective_from |
| **Relationship** | Complements legacy `notification_settings`; new events use this table only |
| **Prisma model** | `NotificationRuleConfig` → `@@map("notification_rule_configs")` |

## 5.8 approval_rule_configs

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Configurable approval gates with SoD enforcement |
| **Parent** | — (scoped by entity_type, stage_code) |
| **Key columns** | id, entity_type, stage_code, approval_type, required_role_codes JSON, min_approvers, sod_rules JSON, escalation_after_hours, version, effective_from, is_active |
| **Consumers** | CommissionApproval, ApprovalLog, workflow stage gates |
| **Prisma model** | `ApprovalRuleConfig` → `@@map("approval_rule_configs")` |

---

# 6. MASTER DATA & JUNCTION TABLES

## 6.1 Master Data Tables (no dedicated ER entity — DB-only)

| Table | Purpose | Owning Module | Parent Entity | Referenced By | Phase | Status |
|-------|---------|---------------|---------------|---------------|-------|--------|
| partner_types | Partner type discriminator (DSA, REFERRAL, BUILDER, CA) | Partner | — | partners.partner_type_id | 1 | DB-only |
| countries | Country reference | Master Data | — | states | 1 | DB-only |
| states | State/province reference | Master Data | countries | cities, branches | 1 | DB-only |
| cities | City reference with pincode ranges | Master Data | states | branches, customer_addresses | 1 | DB-only |
| occupations | Customer occupation catalog | Master Data | — | customer_employment | 1 | DB-only |
| industries | Business industry sector catalog | Master Data | — | business_loan_details | 1 | DB-only |
| banks | Bank IFSC prefix catalog | Master Data | — | partner_bank_accounts | 1 | DB-only |
| lenders | Lending institution master (also ER entity Lender) | Product / Master Data | — | lender_policies, bank_logins, sanctions, knowledge_sources | 1 | Canonical (dual-listed) |
| vehicle_manufacturers | Auto OEM catalog | Master Data | — | vehicle_models, auto_loan_details | 1 | DB-only |
| vehicle_models | Vehicle model catalog | Master Data | vehicle_manufacturers | auto_loan_details | 1 | DB-only |

## 6.2 Profile & Extension Tables (no ER entity)

| Table | Purpose | Owning Module | Parent Table | ER Absorption Notes | Phase | Status |
|-------|---------|---------------|--------------|---------------------|-------|--------|
| partner_profiles | Extended partner contact and address | Partner | partners | Fields from DsaPartner/ReferralPartner not on partners row | 1 | DB-only |
| business_financials | BL financial year metrics incl. WC fields | BL | business_loan_details | Absorbs WorkingCapitalDetail entity | 1 | DB-only |
| business_gst_profiles | BL GST and OD/CC facility profile | BL | business_loan_details | Absorbs OdCcDetail entity | 1 | DB-only |
| vehicle_profiles | Auto chassis, fuel, odometer details | AL | auto_loan_details | AL extension decomposition | 1 | DB-only |
| vehicle_valuations | Multi-type vehicle valuation history | AL | auto_loan_details | AL extension decomposition | 1 | DB-only |
| analytics_snapshots | Denormalized dashboard cache blobs | Analytics | — | Complements metrics; not MetricSnapshot entity | 1 | DB-only |

## 6.3 Junction Tables

| Table | Entity A | Entity B | Purpose | ER Entity | Phase |
|-------|----------|----------|---------|-----------|-------|
| role_permissions | Role | Permission | RBAC permission grants | RolePermission | 1 |
| user_roles | User | Role | RBAC role assignment with branch/region scope | UserRole | 1 |
| commission_payment_lines | CommissionPayment | CommissionLedger | Payout batch line items | CommissionPaymentLine | 1 |

## 6.4 Knowledge Content-Type Routing (KB Split Reference)

| ER articleType | Canonical Table | content_type / article_type Column | RAG Source Type |
|--------------|-----------------|-----------------------------------|-----------------|
| POLICY | policies | POLICY | POLICY_DOC |
| SOP | sops | — (implicit SOP) | SOP |
| TRAINING | training_materials | material_type | PRODUCT_GUIDE |
| GUIDE | policies | GUIDE | PRODUCT_GUIDE |
| PRODUCT_INFO | policies | PRODUCT_INFO | PRODUCT_GUIDE |
| FAQ (entity Faq) | faqs | — | FAQ |
| SALES_SCRIPT (entity SalesScript) | sales_scripts | script_type | SALES_SCRIPT |

---

# 7. FUTURE PHASE 2–4 TABLES

*Reserved in DB Schema Appendix A (#140–157). No Phase-1 ER entity. Folder and module slots pre-provisioned.*

| # | Table | Purpose | Target Phase | Anticipated Parent | Product Domain |
|---|-------|---------|--------------|-------------------|----------------|
| 140 | personal_loan_details | Personal loan application extension | 2 | applications | PL |
| 141 | insurance_details | Insurance application header | 2 | applications | Insurance |
| 142 | insurance_policies | Issued insurance policy records | 2 | insurance_details | Insurance |
| 143 | credit_card_details | Credit card application extension | 2 | applications | Credit Card |
| 144 | mf_application_details | Mutual fund application/order header | 3 | applications | Mutual Funds |
| 145 | mf_holdings | MF holding positions | 3 | mf_application_details | Mutual Funds |
| 146 | fd_booking_details | Fixed deposit booking | 3 | applications | Fixed Deposit |
| 147 | gold_loan_details | Gold loan application extension | 3 | applications | Gold Loan |
| 148 | gold_pledge_items | Gold ornament pledge line items | 3 | gold_loan_details | Gold Loan |
| 149 | wealth_advisory_details | Wealth advisory engagement | 4 | applications | Wealth |
| 150 | wealth_portfolios | Portfolio holdings under advisory | 4 | wealth_advisory_details | Wealth |
| 151 | video_kyc_sessions | Video KYC sub-flow (plugs S03) | 2 | kyc_profiles | KYC |
| 152 | esign_sessions | eSign sub-flow (plugs S07) | 2 | applications | LOS |
| 153 | lender_users | Lender portal user accounts | 3 | lenders | Lender Portal |
| 154 | lender_submissions | Lender API submission tracking | 3 | bank_logins | Lender Portal |
| 155 | loyalty_points | Customer loyalty point balance | 3 | customers | Loyalty |
| 156 | loyalty_transactions | Loyalty point credit/debit log | 3 | loyalty_points | Loyalty |
| 157 | partner_certifications | Partner product certification records | 2 | partners | Partner |
| — | rag_embeddings | Vector embedding storage (if not in knowledge_sources JSON) | 2 | knowledge_sources | AI RAG |

**Extension principle (WF §22):** New products add `workflow_definitions` entry + product extension table + document rules + commission rules. No workflow engine redesign required.

---

# 8. PRISMA @@map GUIDANCE

## 8.1 General Rules

| Pattern | Rule | Example |
|---------|------|---------|
| Model name | PascalCase singular matching ER entity (or unified logical name) | `Customer`, `DsaPartner` (logical), `Partner` (unified Prisma model) |
| Table name | snake_case per DB Schema | `@@map("customer_addresses")` |
| Column name | camelCase in Prisma, snake_case in DB via `@map` | `customerId` → `@map("customer_id")` |
| Primary key | `@id @default(uuid())` on all entities | `id String @id @default(uuid())` |
| Timestamps | `createdAt`, `updatedAt` with `@map`; `@updatedAt` on updatedAt | Standard on mutable entities |
| Soft delete | `deletedAt DateTime?` with middleware | customers, partners, applications, leads |
| Enums | Prisma `enum` matching DB ENUM values exactly | `ApplicationStage`, `LeadStatus` |
| JSON fields | `Json` type for metadata, rules, layout | `metadata`, `ruleDefinition`, `layout` |
| Relations | Explicit `@relation(fields: [...], references: [...])` with named relations | `PartnerKycPartner` |

## 8.2 Unified Partner Model (Recommended Prisma Pattern)

```
// Logical ER entities DsaPartner + ReferralPartner collapse to:
model Partner {
  id              String      @id @default(uuid())
  userId          String      @unique @map("user_id")
  partnerTypeId   String      @map("partner_type_id")
  partnerCode     String      @unique @map("partner_code")
  // ... all partners columns
  partnerType     PartnerType @relation(...)
  profile         PartnerProfile?
  kyc             PartnerKyc?
  @@map("partners")
}

// Optional: type-safe views via Prisma Client extensions or repository filters
// DsaPartnerRepository → partners WHERE partnerType.code = 'DSA'
```

## 8.3 Mapped Entity Examples

| Prisma Model | @@map Value | Notes |
|--------------|-------------|-------|
| DeviceRegistration | devices | Keep ER entity name; map to DB table |
| Address | customer_addresses | Customer domain prefix |
| Employment | customer_employment | Singular table name |
| IncomeDetail | customer_income | Singular table name |
| LeadFollowUp | lead_followups | No underscore |
| ApplicationStatus | application_status | Singular 1:1 child |
| ApplicationTimeline | application_timeline | Singular event table |
| PartnerBankDetail | partner_bank_accounts | Semantic rename |
| Sms | sms_logs | Channel log convention |
| WhatsApp | whatsapp_logs | Channel log convention |
| KpiDefinition | kpis | Short form |
| MetricSnapshot | metrics | Time-series table |
| KycAudit | kyc_audit_logs | Audit suffix |
| Escalation | ticket_escalations | Ticket scope prefix |
| Resolution | ticket_resolutions | Ticket scope prefix |
| ReportingStructure | employee_reporting | Historical reporting |

## 8.4 Split Entity Examples (No Single @@map)

| Prisma Approach | ER Entity | Physical Target |
|-----------------|-----------|-----------------|
| Discriminated union repository | KnowledgeArticle | `policies` \| `sops` \| `training_materials` based on `articleType` |
| Absorbed fields | WorkingCapitalDetail | `business_financials` via `businessLoanDetailId` |
| Absorbed fields | OdCcDetail | `business_gst_profiles` via `businessLoanDetailId` |
| Variant column | AutoLoanBtDetail | `auto_loan_details` WHERE `variant_code = 'BT'` |
| Variant column | AutoLoanTopUpDetail | `auto_loan_details` WHERE `variant_code = 'TOP_UP'` |
| Inline version | KnowledgeArticleVersion | `policies.content_version` / `sops.content_version` |

## 8.5 Schema File Organization

Per DB Schema Appendix B, organize `schema.prisma` (or split prisma files) with domain comment blocks:

```
// ── Identity & Access ──
// ── Master Data ──
// ── Organization ──
// ── Customer ──
// ── Partner ──
// ── Products ──
// ── LMS ──
// ── LOS ──
// ── Workflow Configuration ──  ← NEW (§5 tables)
// ── Product Extensions ──
// ── Documents ──
// ── KYC ──
// ── Referrals ──
// ── Commissions ──
// ── Support ──
// ── Communications ──
// ── Campaigns ──
// ── AI ──
// ── Knowledge Base ──
// ── Analytics ──
// ── Audit ──
// ── Settings ──
```

## 8.6 Index and Constraint Preservation

All `@@index`, `@@unique`, and FK `onDelete` behaviors must match DB Schema Specification exactly. Critical queue indexes (per ER Appendix C):

| Table | Index | Purpose |
|-------|-------|---------|
| leads | (branch_id, status, created_at) | Branch queue |
| applications | (branch_id, current_stage) | LOS pipeline |
| commission_ledger | (partner_id, status) | Partner earnings |
| documents | (application_id, document_type_id) | Checklist |
| audit_logs | (entity_type, entity_id) | Entity audit lookup |
| workflow_definitions | (product_variant_id, is_active) | Active workflow resolution |
| lms_assignment_rules | (branch_id, is_active) | Assignment engine |

---

# APPENDIX A: DOCUMENT APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Chief Data Architect | | | |
| CTO | | | |
| Head of Engineering | | | |
| Compliance Officer | | | |
| CEO / Managing Director | | | |

---

# APPENDIX B: REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | KuberOne Architecture Team | Initial canonical registry; maps 131 ER entities + 8 config entities; resolves Audit CONFLICT-01, -02, -05; 32 conflict resolutions |

---

# APPENDIX C: RELATED DOCUMENTS

| Document | Relationship |
|----------|-------------|
| [KUBERONE_ER_DIAGRAM_AND_DATA_MODEL.md](./KUBERONE_ER_DIAGRAM_AND_DATA_MODEL.md) | Logical entity source — Appendix A requires update to canonical table names |
| [KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md](./KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md) | Physical schema authority — add §Workflow Configuration tables from this registry |
| [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md) | Workflow config semantics — §19, Appendix B SLA |
| [KUBERONE_ENTERPRISE_ARCHITECTURE_AUDIT_REPORT.md](./KUBERONE_ENTERPRISE_ARCHITECTURE_AUDIT_REPORT.md) | Conflict source — CONFLICT-01 through CONFLICT-05 |
| [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md) | Update `kb_*` and `rag_sources` references to canonical names |
| [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md) | Module→table mapping update required |
| [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md) | Config APIs now backed by §5 tables |
| [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) | Role seeds for approval_rule_configs |

---

*End of KuberOne Entity→Table Canonical Registry v1.0*
