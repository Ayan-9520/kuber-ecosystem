# KuberOne
## Compliance Framework Specification (Document B4)

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise Compliance & Regulatory Governance Framework  
**Document ID:** B4  
**Classification:** Board-Ready | Compliance-Ready | Audit-Ready | Regulator-Ready  
**Version:** 1.0  
**Date:** June 2026  
**Status:** Authoritative — Mandatory for all KuberOne operations  
**Related Documents:**
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) — IAM, SoD, audit model
- [KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md) — Infrastructure security, retention, encryption
- [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md) — §17 Compliance Operating Controls
- [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md) — AI security, PII masking
- [KUBERONE_ENTITY_TABLE_CANONICAL_REGISTRY.md](./KUBERONE_ENTITY_TABLE_CANONICAL_REGISTRY.md) — Data entities
- [KUBERONE_LEAD_GRADING_CANONICAL_SPECIFICATION.md](./KUBERONE_LEAD_GRADING_CANONICAL_SPECIFICATION.md) — Document A3 (grading compliance)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Data privacy, PII, documents, audit, retention, access governance, security, operational compliance, RBI, KYC/AML, regulatory mapping |
| **Audience** | Board, Compliance, Legal, CTO, Security, Operations, Product, Engineering |
| **Jurisdiction** | India (primary); data residency within India |
| **Review Cadence** | Quarterly compliance review; annual framework revision |

---

# Executive Summary

KuberOne operates as a **regulated financial services technology platform** — originating and facilitating loan products while handling customer PII, KYC documents, credit bureau data, and partner commission flows. This Compliance Framework establishes the **governance, controls, and regulatory alignment** required to operate lawfully, protect customer data, and satisfy examination by RBI, DPDP authorities, and internal audit.

**Compliance pillars:**

| Pillar | Primary Controls |
|--------|------------------|
| **Data Privacy (DPDP)** | Consent gates, purpose limitation, data subject rights, breach notification |
| **PII Protection** | RBAC-scoped access, masking, enhanced audit on unmask |
| **Document Security** | S3 encryption, presigned URLs, 8-year retention, access logging |
| **Audit & Accountability** | Immutable audit logs, 5–10 year retention, quarterly access review |
| **Access Governance** | Least privilege RBAC, SoD, quarterly role-permission audit |
| **Security Governance** | Encryption everywhere, incident response, vulnerability management |
| **Operational Compliance** | Workflow gates, fair practice, complaint resolution SLAs |
| **KYC/AML** | Identity verification, fraud hold, partner KYC gates |
| **RBI Fair Practice** | Transparent process, no guaranteed approval, grievance redressal |

**Alignment statement:** Every control in this document maps to implementation in [RBAC & Permissions](./KUBERONE_RBAC_AND_PERMISSIONS.md) (authorization layer) and [DevOps Deployment Architecture](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md) (infrastructure layer). Business workflow gates are defined in [Business Workflow §17](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md).

**Board assurance:** KuberOne maintains defense-in-depth compliance — consent before processing, RBAC before data access, encryption before storage, audit after every action.

---

# 1. Regulatory Landscape & Applicability

## 1.1 Primary Regulations

| Regulation | Authority | Applicability to KuberOne |
|------------|-----------|---------------------------|
| **Digital Personal Data Protection Act (DPDP), 2023** | MeitY / Data Protection Board | All personal data processing — customers, partners, employees |
| **RBI Fair Practices Code for LSPs/REs** | Reserve Bank of India | Loan facilitation, transparency, grievance redressal |
| **RBI KYC Master Direction** | Reserve Bank of India | Customer and partner identity verification |
| **PMLA / AML Guidelines** | FIUID / RBI | Suspicious transaction monitoring, partner due diligence |
| **IT Act, 2000 (Section 43A)** | CERT-In | Reasonable security practices for sensitive data |
| **CERT-In Directions 2022** | CERT-In | Log retention (180 days), incident reporting (6 hours) |
| **Credit Information Companies (Regulation) Act** | RBI | CIBIL/bureau pull consent and purpose limitation |

## 1.2 KuberOne Regulatory Role

| Role | Description | Regulatory Obligation |
|------|-------------|----------------------|
| **Lending Service Provider (LSP)** | Technology platform facilitating loan origination | RBI LSP guidelines; fair practice; data sharing with REs |
| **Data Fiduciary (DPDP)** | Determines purpose and means of personal data processing | Consent, notice, security safeguards, breach notification |
| **Technology Service Provider** | Infrastructure for partners (DSA) and internal operations | Contractual data processing agreements with partners |

## 1.3 Data Residency

| Requirement | Implementation |
|-------------|----------------|
| Primary data location | AWS ap-south-1 (Mumbai) |
| Backup location | AWS ap-south-1 (same region) |
| Cross-border transfer | **Prohibited** without explicit consent and legal basis |
| Phase 2 DR | ap-southeast-1 (Singapore) — requires regulatory assessment before activation |

---

# 2. Data Privacy (DPDP Act)

## 2.1 DPDP Principles Applied

| Principle | KuberOne Implementation |
|-----------|------------------------|
| **Lawful purpose** | Data collected only for loan origination, servicing, and related financial services |
| **Consent** | Explicit, informed consent before collection; granular consent types |
| **Purpose limitation** | Data used only for stated purpose; no secondary use without re-consent |
| **Data minimization** | Collect only fields required for product eligibility and regulatory compliance |
| **Accuracy** | Customer self-service profile correction; re-verification triggers |
| **Storage limitation** | Retention schedules per §6; deletion after regulatory hold |
| **Security safeguards** | Encryption, RBAC, audit per §4–5 |
| **Accountability** | DPO appointment; compliance review cadence; breach response plan |

## 2.2 Consent Types & Capture Points

| Consent Type | Purpose | Capture Point | Withdrawal |
|--------------|---------|---------------|------------|
| **Data Processing** | Store and process personal data for loan services | Registration / lead capture | Account settings; blocks new applications |
| **Credit Bureau Pull** | CIBIL/credit report access | Application S02 (Qualified) | Cannot withdraw mid-application; blocks new pulls |
| **AI Advisory** | AI profile analysis and recommendations | First AI Advisor session | Disables AI features; rules-only scoring |
| **Marketing** | Promotional SMS/email/WhatsApp | Registration (opt-in) | Preference center; immediate effect |
| **Document Storage** | Store KYC/financial documents | KYC upload | Deletion request after regulatory hold |
| **WhatsApp Communication** | Transactional and service messages | OTP verification | Disables WhatsApp channel |
| **Call Recording** | Voice AI session recording | Voice session start (Phase 2) | Session cannot proceed without consent |

## 2.3 Consent Record Requirements

| Field | Mandatory |
|-------|-----------|
| `consentId` | Yes |
| `dataPrincipalId` (customer/partner) | Yes |
| `consentType` | Yes |
| `purposeDescription` | Yes |
| `grantedAt` | Yes |
| `withdrawnAt` | Nullable |
| `captureMethod` | APP, WEB, CRM, API |
| `version` | Consent text version |
| `ipAddress` | Yes |
| `deviceId` | If mobile |

## 2.4 Data Principal Rights

| Right | Implementation | SLA |
|-------|----------------|-----|
| **Right to access** | Customer app → Profile → Download My Data | 7 business days |
| **Right to correction** | Self-service profile edit; CRM correction workflow | Immediate (self-service) |
| **Right to erasure** | Deletion request → Compliance review → anonymize | 30 days (after regulatory hold check) |
| **Right to grievance redressal** | In-app complaint + support ticket | Per complaint SLA (§9) |
| **Right to nominate** | Phase 2 — account nominee designation | — |

## 2.5 Data Processing Agreements

| Counterparty | DPA Required | Key Terms |
|--------------|--------------|-----------|
| Regulated Entities (lenders/banks) | Yes | Purpose-limited sharing; RE security standards |
| DSA Partners | Yes | Data minimization; no independent processing |
| Cloud provider (AWS) | Yes | India region; sub-processor disclosure |
| AI provider (OpenAI) | Yes | PII masking; no training on KuberOne data |
| SMS/Email/WhatsApp providers | Yes | Transactional only; no marketing without consent |

## 2.6 Breach Notification

| Stage | Timeline | Actor |
|-------|----------|-------|
| Detection | Immediate | Security / DevOps |
| Internal assessment | Within 4 hours | CISO + Compliance |
| Board notification | Within 24 hours (if significant) | CEO + Compliance |
| Data Protection Board notification | As required by DPDP rules | Compliance + Legal |
| Data principal notification | As required by DPDP rules | Compliance |
| CERT-In notification | Within 6 hours (if applicable) | Security |

---

# 3. PII Handling

## 3.1 PII Classification

| Tier | Data Elements | Handling |
|------|---------------|----------|
| **T0 — Public** | Product names, branch locations, interest rate ranges | No restrictions |
| **T1 — Internal** | Lead status, application stage, aggregated metrics | RBAC scoped |
| **T2 — Confidential** | Name, mobile, email, address, income, employment | RBAC + audit |
| **T3 — Sensitive** | PAN, Aadhaar, CIBIL score, bank account, KYC documents | RBAC + enhanced audit + encryption |
| **T4 — Restricted** | Full bureau report, fraud investigation data | Compliance-only + maximum audit |

## 3.2 PII Access Model (RBAC Alignment)

| Data Scope | Roles | PII Treatment |
|------------|-------|---------------|
| Own | Customer, Partner (self) | Full own data |
| Assigned | Sales Executive | Full PII for assigned leads/apps |
| Portfolio | RM | Full PII for portfolio customers |
| Branch | Branch Manager, branch-scoped roles | Full PII for branch |
| Organization (function) | Credit, Ops, Compliance, Support | Full PII (audited) |
| Aggregated | Management | **No record-level PII** |
| Compliance investigation | Compliance (authorized) | Full PII with reason code |

## 3.3 PII Masking Rules

| Field | Default Display | Unmask Authority |
|-------|-----------------|------------------|
| Mobile | 98XXX3210 | Sales (assigned), Support L2+, Compliance |
| Email | j***@gmail.com | Same as mobile |
| PAN | XXXXX1234X | Credit, Compliance, Ops (document verify) |
| Aadhaar | XXXX-XXXX-5678 | Compliance only (or masked last 4 everywhere) |
| Bank account | XXXXXX7890 | Finance, Compliance |
| Full address | City + pincode only | Sales (assigned), Credit, Compliance |

## 3.4 PII Access Controls

| Control | Implementation (RBAC) |
|---------|----------------------|
| Default deny | No permission = no access |
| Enhanced audit on unmask | `pii_accessed` flag; 5-year retention |
| Bulk PII export | Compliance Manager approval + CEO (SoD-05) |
| Management PII prohibition | Aggregated scope enforced at API layer |
| Temporary elevation | Max 24 hours; enhanced audit; reason required (INH-04) |
| Support L1 masking | Full PII requires Support Manager + reason (DV-05) |

## 3.5 PII in AI Processing

| Rule | Detail |
|------|--------|
| Prompt masking | PII masked before LLM API call per AI Security Architecture |
| No PII in logs | Application logs redact T2+ fields |
| AI training prohibition | Customer data not used for model training |
| AI output review | Quarterly sample audit by Compliance + AI Lead |
| Customer opt-out | AI consent withdrawal disables AI scoring (rules-only) |

## 3.6 PII Retention & Deletion

| Event | Action |
|-------|--------|
| Customer deletion request | Compliance verifies no active applications/loans |
| Regulatory hold check | 8-year hold for KYC/application data |
| Anonymization | Replace PII with irreversible hash; retain non-PII analytics |
| Partner offboarding | Partner PII retained 7 years; then anonymize |
| Employee offboarding | Access revoked immediately; audit logs retained |

---

# 4. Document Security

## 4.1 Document Classification

| Class | Examples | Storage | Access |
|-------|----------|---------|--------|
| **KYC Identity** | PAN, Aadhaar, passport, photo | S3 `kuberone-documents-prod/kyc/` | Credit, Compliance, assigned Sales |
| **Financial** | ITR, salary slips, bank statements | S3 `.../financial/` | Credit, assigned Sales |
| **Property/Vehicle** | Sale deed, RC, valuation | S3 `.../collateral/` | Credit, Ops |
| **Legal** | Sanction letter, loan agreement | S3 `.../legal/` | Ops, Customer (own) |
| **Internal** | Credit notes, exception memos | S3 `.../internal/` | Credit, Compliance |
| **Commission** | Partner statements, invoices | S3 `.../commission/` | Finance, Partner (own) |

## 4.2 Storage Security (DevOps Alignment)

| Control | Implementation |
|---------|----------------|
| Encryption at rest | SSE-S3 AES-256 mandatory |
| Encryption in transit | TLS 1.3 only |
| Block public access | All buckets |
| Access method | Presigned URLs only; no direct bucket access |
| Upload | Presigned PUT; 15-minute expiry; customer/DSA/agent |
| Download | Presigned GET; 5-minute expiry; RBAC authorized |
| Admin browse | Backend proxy + enhanced audit; Super Admin, Compliance only |
| Versioning | All production document buckets |
| Virus scan | ClamAV on upload confirm (Phase 2) |
| IAM | EC2 instance role; no access keys in code |

## 4.3 Document Lifecycle Controls

| Stage | Control |
|-------|---------|
| Upload | File type validation; max size 10 MB; MIME verification |
| Storage | Encrypted; metadata in DB; no document content in DB |
| View | RBAC check; audit log with document ID |
| Download | Enhanced audit; presigned URL; watermark (Phase 2) |
| Verify | Credit/Ops marks verified; immutable verification record |
| Deficiency | Customer notified; re-upload creates new version |
| Retention | 8 years per §6 |
| Deletion | Soft delete in DB; S3 lifecycle to Glacier; regulatory hold prevents purge |

## 4.4 Document Access Audit

| Event | Logged Fields | Retention |
|-------|---------------|-----------|
| Document upload | actor, documentId, type, applicationId | 8 years |
| Document view | actor, documentId, pii_accessed=true | 5 years |
| Document download | actor, documentId, ip, enhanced audit | 5 years |
| Document verify/reject | actor, documentId, outcome, reason | 8 years |
| Admin browse | actor, path, sessionId | 10 years |

---

# 5. Audit Requirements

## 5.1 Audit Architecture

| Layer | Mechanism |
|-------|-----------|
| Application | Structured audit_logs table; immutable insert-only |
| API | Middleware logs all mutations and PII reads |
| Infrastructure | CloudTrail, S3 access logs, RDS audit |
| CRM | Client-side action logging for critical operations |
| AI | Token usage, prompt hash (not content), session ID |

## 5.2 Audit Log Categories (RBAC §24.1)

| Category | Events | Retention | Reviewer |
|----------|--------|-----------|----------|
| Authentication | Login, logout, MFA, failed auth | 2 years | Security |
| Authorization | 403 denied, role change | 5 years | Compliance |
| Data Access | PII read, document view/download | 5 years | Compliance |
| Data Mutation | CRUD on critical resources | 5 years | Compliance |
| Workflow | Status change, approval, escalation | 8 years | Operations |
| Financial | Commission, payout, dispute | 7 years | Finance |
| Configuration | Settings, RBAC, workflow config | 7 years | Admin |
| Compliance | Fraud hold, partner suspend, investigation | 10 years | Compliance |
| Security | Super Admin action, kill switch, bulk export | 10 years | CISO |

## 5.3 Audit Log Schema (Minimum Fields)

| Field | Required | Description |
|-------|----------|-------------|
| `event_id` | Yes | UUID |
| `timestamp` | Yes | UTC ISO 8601 |
| `category` | Yes | From §5.2 |
| `action` | Yes | CREATE, READ, UPDATE, DELETE, APPROVE, etc. |
| `actor_id` | Yes | User UUID |
| `actor_role` | Yes | Role at time of action |
| `resource_type` | Yes | LEAD, APPLICATION, DOCUMENT, etc. |
| `resource_id` | Yes | Entity UUID |
| `scope` | Yes | own, branch, organization, etc. |
| `result` | Yes | SUCCESS, DENIED, ERROR |
| `ip_address` | Yes | Client IP |
| `user_agent` | Yes | Device/browser |
| `session_id` | Yes | Session reference |
| `pii_accessed` | Conditional | Boolean; true for T2+ access |
| `reason` | Conditional | Required for elevation, override, bulk export |
| `before_state` | Conditional | JSON diff for mutations |
| `after_state` | Conditional | JSON diff for mutations |

## 5.4 Audit Review Cadence

| Review | Frequency | Participants |
|--------|-----------|--------------|
| PII access anomaly detection | Automated daily | Security |
| Role-permission audit | Quarterly | Compliance + Super Admin |
| User-role assignment audit | Monthly | Admin |
| Partner access review | Quarterly | Compliance |
| Super Admin action review | Weekly | CISO + Compliance |
| AI output sample audit | Quarterly | Compliance + AI Lead |
| Full compliance audit | Annual | External auditor |

## 5.5 Audit Log Integrity

| Control | Implementation |
|---------|----------------|
| Immutability | Insert-only table; no UPDATE/DELETE on audit_logs |
| Partitioning | Monthly partitions (DevOps §DB) |
| Backup | Included in RDS backup; 35-day rolling |
| Tamper detection | Hash chain (Phase 2) |
| Access to audit logs | Compliance + Super Admin only |

---

# 6. Retention Policies

## 6.1 Master Retention Schedule

| Data Category | Retention Period | Storage Tier | After Retention |
|---------------|------------------|--------------|-----------------|
| KYC documents | **8 years** | S3 Standard → Glacier | Retain (regulatory) |
| Application documents | **8 years** | S3 Standard → Glacier | Retain |
| Application records (DB) | **8 years** | RDS | Anonymize PII |
| Lead records (DB) | **5 years** | RDS | Anonymize |
| Audit logs (workflow) | **8 years** | RDS partitioned | Archive to cold storage |
| Audit logs (PII access) | **5 years** | RDS partitioned | Delete |
| Audit logs (security) | **10 years** | RDS + archive | Retain |
| Commission records | **7 years** | RDS + S3 | Retain |
| Consent records | **8 years** | RDS | Retain |
| AI session metadata | **3 years** | RDS | Delete |
| AI session transcripts | **1 year** | RDS | Delete |
| Notification logs (SMS/email) | **3 years** | RDS | Delete |
| Analytics snapshots | **3 years** | S3 | Delete |
| Temp uploads | **24 hours** | S3 temp/ | Auto-delete |
| DB backup exports | **1 year** | S3 | Auto-delete |
| Chat/support tickets | **5 years** | RDS | Anonymize |

## 6.2 Retention Implementation

| Mechanism | Detail |
|-----------|--------|
| S3 lifecycle rules | Transition to Glacier at 365 days; retain 8 years |
| DB archival job | Monthly job moves aged records to archive tables |
| Anonymization | Replace PII with SHA-256 hash + salt; retain analytics keys |
| Regulatory hold | Compliance flag prevents deletion regardless of schedule |
| Legal hold | Legal counsel flag overrides all deletion |
| Customer deletion | Anonymize after hold period; confirm via Compliance |

## 6.3 DevOps Alignment

Per [DevOps §12.5](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md):

| Content | Retention | Post-Retention |
|---------|-----------|----------------|
| KYC documents | 8 years | Glacier → retain |
| Application documents | 8 years | Glacier → retain |
| Commission statements | 7 years | Glacier → retain |
| Analytics reports | 3 years | Glacier → delete |
| Temp uploads | 24 hours | Auto-delete |

---

# 7. Access Governance

## 7.1 Identity & Authentication

| User Type | Auth Method | MFA | Session Duration |
|-----------|-------------|-----|------------------|
| Customer | Mobile OTP | No | 30 days (refresh token) |
| DSA Partner | Mobile OTP + KYC | Optional | 12 hours |
| Employee (CRM) | SSO + MFA | **Required** | 8 hours |
| Super Admin | SSO + MFA + IP whitelist | **Required** | 4 hours |

## 7.2 Role-Based Access Control Summary

| Principle | Implementation |
|-----------|----------------|
| Least privilege | Default deny; explicit grant per role per resource |
| Separation of duties | 12 enforced SoD rules (RBAC §1) |
| No external inheritance | Customers/partners never inherit internal permissions |
| Management aggregation | Management roles see metrics only; no raw PII |
| Super Admin limit | Maximum 3 accounts; enhanced audit |
| Product module extension | Insurance/cards/MF via permission modules — no role redesign |

## 7.3 Segregation of Duties (Key Rules)

| Rule | Restriction | Enforcer |
|------|-------------|----------|
| SoD-01 | Sales cannot approve credit | RBAC + workflow gate |
| SoD-02 | Credit cannot disburse | RBAC + workflow gate |
| SoD-03 | Ops cannot approve credit | RBAC |
| SoD-04 | Commission submitter cannot approve own batch | approval_rule_configs |
| SoD-05 | Bulk PII export requires Compliance + CEO | RBAC + approval |
| SoD-06 | Credit cannot approve own recommendation | RBAC |
| SoD-08 | Compliance cannot investigate own case | Case assignment rule |
| SoD-11 | Management cannot export raw customer data | RBAC scope |

## 7.4 Access Review Program

| Review Type | Frequency | Owner | Output |
|-------------|-----------|-------|--------|
| User-role assignment | Monthly | Admin | Revocation list |
| Role-permission matrix | Quarterly | Compliance + Super Admin | Permission diff report |
| Partner access | Quarterly | Compliance | Partner audit certificate |
| Super Admin accounts | Quarterly | CISO | Account justification |
| Dormant accounts | Monthly (automated) | System | Auto-disable after 90 days |
| Privileged access | Monthly | Security | PAM report |

## 7.5 Access Termination

| Event | Timeline | Actions |
|-------|----------|---------|
| Employee resignation | Last working day | Disable SSO; revoke all tokens; reassign records |
| Partner termination | Immediate | Disable account; retain data per retention |
| Role change | Same day | Old permissions revoked; new permissions granted; audit logged |
| Super Admin removal | Immediate + dual approval | Enhanced audit; 30-day log review |

---

# 8. Security Governance

## 8.1 Security Framework Alignment

| Framework | KuberOne Alignment |
|-----------|-------------------|
| OWASP Top 10 | Addressed in API security, input validation, CSP |
| CIS AWS Benchmark | Security groups, IAM, encryption |
| ISO 27001 (target) | Phase 2 certification roadmap |
| RBI cybersecurity framework | Incident response, access control, encryption |

## 8.2 Encryption Standards

| Layer | Standard | DevOps Reference |
|-------|----------|------------------|
| In transit | TLS 1.3 | DevOps §5.3 |
| At rest (DB) | RDS AES-256 | DevOps §4 |
| At rest (S3) | SSE-S3 AES-256 | DevOps §12.4 |
| Secrets | AWS Secrets Manager | DevOps §8 |
| PII in DB | Application-level encryption for T3 fields (Phase 2) | — |
| Backup | Encrypted; same standard as source | DevOps §11 |

## 8.3 Network Security

| Control | Implementation |
|---------|----------------|
| VPC isolation | Private subnets for DB, backend |
| Security groups | Deny all default; allow specific |
| Admin IP whitelist | Super Admin CRM access |
| Rate limiting | Nginx + API middleware |
| WAF | AWS WAF on ALB (Phase 2) |
| DDoS | AWS Shield Standard |

## 8.4 Vulnerability Management

| Activity | Frequency | Owner |
|----------|-----------|-------|
| npm audit in CI | Every PR | DevOps |
| OS patching | Monthly | DevOps |
| Penetration test | Annual | External vendor |
| Dependency update | Monthly | Engineering |
| Security headers | CSP, X-Frame-Options, HSTS | DevOps §9 |

## 8.5 Incident Response

| Severity | Response Time | Escalation |
|----------|---------------|------------|
| P1 — Data breach / system down | 1 hour | CISO + CEO + Board |
| P2 — Security vulnerability exploited | 4 hours | CISO + CTO |
| P3 — Suspicious activity | 24 hours | Security team |
| P4 — Policy violation | 48 hours | Compliance |

| Phase | Actions |
|-------|---------|
| Detect | Monitoring alerts, audit anomaly, user report |
| Contain | Kill switch (Super Admin); isolate affected systems |
| Investigate | Forensic analysis; audit log review |
| Notify | Per §2.6 breach notification |
| Recover | Patch, restore from backup, verify integrity |
| Review | Post-incident report within 14 days |

---

# 9. Operational Compliance

## 9.1 Workflow Compliance Gates (Business Workflow §17)

| Gate | Trigger | Block |
|------|---------|-------|
| Consent missing | Any data processing | Lead capture, application creation |
| KYC incomplete | S03 → S04 transition | Eligibility check |
| Fraud flag active | Any workflow action | All transitions; Compliance review |
| Credit consent missing | Bureau pull request | CIBIL fetch |
| AI consent missing | AI scoring session | AI score = neutral fallback |
| Fair practice check | Outbound communication | Block "guaranteed approval" language |

## 9.2 Fair Practice Code (RBI)

| Requirement | KuberOne Implementation |
|-------------|------------------------|
| Transparent pricing | Fee schedule in app; no hidden charges |
| No guaranteed approval | AI and marketing copy audited; prohibited phrases blocked |
| Clear rejection reasons | Structured reason codes (Document A3 §5.3) |
| Grievance redressal | Complaint workflow; 21-day regulatory response |
| Privacy of customer data | DPDP controls per §2 |
| Non-discrimination | No scoring factors based on prohibited attributes |
| Collection practice | No harassment; contact attempt limits enforced |

## 9.3 Complaint & Grievance Management

| Type | SLA | Escalation |
|------|-----|------------|
| General inquiry | 4 hours first response | Support L1 |
| Application status | 2 hours | Support L1 |
| Complaint | 1 hour acknowledge; 48 hours resolve | Branch Manager → Regional |
| Regulatory complaint | 24 hours acknowledge; **21 days** formal response | Compliance Manager |
| Fraud report | 1 hour | Fraud Analyst |

## 9.4 Communication Compliance

| Channel | Rules |
|---------|-------|
| SMS | DND compliance; transactional vs promotional separation |
| Email | Unsubscribe link for marketing; CAN-SPAM alignment |
| WhatsApp | Template-approved messages only; consent required |
| Push | Preference-respecting; no promotional without consent |
| AI chat | Advisory disclaimer on every session |

## 9.5 Lead Grading Compliance (Document A3)

| Requirement | Control |
|-------------|---------|
| Explainability | Factor breakdown available to authorized roles |
| Non-discrimination | No gender, religion, caste factors in scoring |
| Fraud override | GATE_FRAUD forces Rejected; Compliance review |
| Rejection reason | Mandatory reason code for Rejected grade |
| Customer transparency | Grades not shown to customers |

---

# 10. KYC / AML Compliance

## 10.1 Customer KYC Requirements

| KYC Element | Verification Method | Stage Gate |
|-------------|---------------------|------------|
| Identity (PAN) | OCR + manual verify | Before S04 |
| Identity (Aadhaar) | eKYC / masked storage | Before S04 |
| Address | Document + pincode validation | Before S04 |
| Photograph | Liveness check (Phase 2) | Before S04 |
| Income | Document-based verification | Before S05 |
| Bank account | Penny drop / cancelled cheque | Before S08 |

## 10.2 Partner KYC (DSA)

| Requirement | Gate |
|-------------|------|
| Identity verification | Partner activation blocked until complete |
| Bank account verification | Required for commission payout |
| Agreement signing | Digital agreement with version tracking |
| Recertification | Annual KYC refresh |
| Suspension | Compliance flag → immediate deactivation |

## 10.3 AML Controls

| Control | Implementation |
|---------|----------------|
| Customer screening | Name screening against sanctions list (Phase 2) |
| Transaction monitoring | Unusual application patterns flagged |
| STR filing | Compliance Manager authority; audit trail |
| Partner due diligence | Enhanced DD for high-volume partners |
| Record keeping | 5-year minimum for AML records |
| Training | Annual AML training for relevant roles |

## 10.4 Fraud Detection & Response

| Signal | Action | Role |
|--------|--------|------|
| Duplicate identity | Block; merge records | System |
| Document forgery (OCR) | Flag; manual review | Credit/Ops |
| Velocity (multiple apps) | Flag; Compliance review | Compliance |
| Unusual commission pattern | Partner review | Compliance Analyst |
| Fraud flag on lead/app | Freeze all workflows | Compliance Manager |

---

# 11. Regulatory Mapping Matrix

## 11.1 DPDP → KuberOne Controls

| DPDP Requirement | KuberOne Control | Document Section |
|------------------|------------------|------------------|
| Consent | Consent gates at capture points | §2.2 |
| Notice | Privacy policy; in-app consent text | §2.2 |
| Purpose limitation | RBAC scope + data model design | §3.2 |
| Security safeguards | Encryption, RBAC, audit | §4, §5, §8 |
| Data breach notification | Breach response plan | §2.6 |
| Data principal rights | Access, correction, erasure workflows | §2.4 |
| Data Protection Officer | Appointed; contact in privacy policy | §12 |
| Cross-border transfer | Prohibited (India residency) | §1.3 |

## 11.2 RBI Fair Practice → KuberOne Controls

| RBI Requirement | KuberOne Control | Document Section |
|-----------------|------------------|------------------|
| Transparency | Fee disclosure; process visibility | §9.2 |
| Grievance redressal | Complaint workflow + SLAs | §9.3 |
| Privacy | DPDP framework | §2 |
| Non-coercive collection | Contact attempt limits | §9.2 |
| Fair rejection | Reason codes; no guaranteed approval | §9.2, A3 |

## 11.3 KYC Master Direction → KuberOne Controls

| Requirement | KuberOne Control | Document Section |
|-------------|------------------|------------------|
| CDD for customers | KYC document workflow S03 | §10.1 |
| CDD for partners | Partner onboarding KYC | §10.2 |
| Record keeping | 8-year retention | §6 |
| Periodic updation | Re-KYC triggers (Phase 2) | §10.1 |
| Video KYC | VKYC sub-flow (Phase 2) | WF §22 |

## 11.4 RBAC → Compliance Mapping

| RBAC Control | Compliance Purpose | RBAC Section |
|--------------|-------------------|--------------|
| Permission matrices | Least privilege | §6–8 |
| SoD rules | Prevent fraud/collusion | §1.6 |
| Audit model | Accountability | §24 |
| PII masking | Data minimization | §19 |
| Management aggregation | Privacy by design | §1.5 |
| Super Admin limits | Privileged access control | §1.5 |

## 11.5 DevOps → Compliance Mapping

| DevOps Control | Compliance Purpose | DevOps Section |
|----------------|-------------------|----------------|
| Encryption at rest/transit | Security safeguards | §4, §5, §12 |
| S3 access policies | Document security | §12.3 |
| Retention lifecycle | Storage limitation | §12.5 |
| Backup & DR | Business continuity | §11 |
| Audit logging | Accountability | §7 |
| CI/CD security gates | Secure development | §13 |
| Incident response | Breach containment | §14 |

---

# 12. Governance Structure

## 12.1 Compliance Roles

| Role | Responsibility |
|------|----------------|
| **Board of Directors** | Oversight; approve compliance policy |
| **CEO** | Accountable for compliance posture |
| **Chief Compliance Officer / Compliance Manager** | Day-to-day compliance; regulatory liaison |
| **Data Protection Officer** | DPDP compliance; data principal requests |
| **CISO** | Security governance; incident response |
| **CTO** | Technical control implementation |
| **Fraud Analyst** | Fraud investigation (independent of Compliance submitter) |
| **DevOps Lead** | Infrastructure security; retention implementation |

## 12.2 Compliance Cadence

| Activity | Frequency | Output |
|----------|-----------|--------|
| Compliance standup | Weekly | Open issues tracker |
| Compliance review meeting | Monthly | Compliance dashboard |
| Board compliance report | Quarterly | Board pack section |
| Regulatory filing | As required | Filed returns/reports |
| Policy review | Annual | Updated framework |
| External audit | Annual | Audit report |
| Penetration test | Annual | Remediation plan |

## 12.3 Policy Exception Process

| Step | Actor | Action |
|------|-------|--------|
| 1 | Requestor | Submit exception request with business justification |
| 2 | Compliance | Risk assessment |
| 3 | CISO / CTO | Technical feasibility |
| 4 | Compliance Manager | Approve/reject |
| 5 | CEO | Approve if high-risk |
| 6 | System | Time-bound exception with enhanced audit |

---

# 13. Training & Awareness

## 13.1 Mandatory Training

| Audience | Training | Frequency |
|----------|----------|-----------|
| All employees | Data privacy basics (DPDP) | Onboarding + annual |
| Customer-facing roles | PII handling, fair practice | Onboarding + annual |
| Credit/Ops | KYC/AML, document verification | Onboarding + annual |
| Compliance team | Regulatory updates | Quarterly |
| Developers | Secure coding, OWASP | Onboarding + annual |
| Partners (DSA) | Data handling agreement, KYC | Onboarding |

## 13.2 Training Records

| Field | Retention |
|-------|-----------|
| Employee ID, training module, completion date, score | 5 years |

---

# Appendix A: Consent Text Version Registry

| Version | Effective Date | Changes |
|---------|----------------|---------|
| CONSENT-v1.0 | Launch | Initial consent framework |
| CONSENT-v1.1 | TBD | AI advisory consent addition |

---

# Appendix B: Prohibited Communication Phrases

| Phrase | Reason |
|--------|--------|
| "Guaranteed approval" | RBI fair practice violation |
| "100% loan approval" | Misleading claim |
| "No credit check required" | Regulatory misrepresentation |
| "Instant sanction" | Overpromise (unless technically true with disclosure) |
| "Lowest interest rate in India" | Unverifiable claim |

---

# Appendix C: Retention Quick Reference

| Data Type | Years |
|-----------|-------|
| KYC / Application docs | 8 |
| Application DB records | 8 |
| Workflow audit | 8 |
| Commission | 7 |
| Config audit | 7 |
| Lead records | 5 |
| PII access audit | 5 |
| Security audit | 10 |
| Compliance investigation | 10 |
| Temp uploads | 24 hours |

---

# Appendix D: Regulatory Contact & Escalation

| Authority | Contact Trigger | Internal Owner |
|-----------|-----------------|----------------|
| Data Protection Board | Personal data breach | DPO + Compliance |
| RBI (Ombudsman) | Customer escalation | Compliance Manager |
| CERT-In | Cybersecurity incident | CISO |
| FIU-IND | Suspicious transaction | Compliance Manager |
| Police/Cyber Cell | Criminal fraud | CEO + Legal |

---

# Appendix E: Cross-Document Traceability

| Topic | Authoritative Doc | Section |
|-------|-------------------|---------|
| RBAC & SoD | RBAC & Permissions | §1, §24 |
| Encryption & S3 | DevOps Architecture | §4, §12 |
| Consent gates | Business Workflow | §17.1 |
| Workflow compliance | Business Workflow | §17.2–17.3 |
| Lead grading compliance | Document A3 | §13 |
| AI PII masking | AI RAG Architecture | Security |
| Audit API | API Catalog | API-AUD-005 |

---

# Appendix F: Glossary

| Term | Definition |
|------|------------|
| **DPDP** | Digital Personal Data Protection Act, 2023 (India) |
| **PII** | Personally Identifiable Information |
| **KYC** | Know Your Customer |
| **AML** | Anti-Money Laundering |
| **SoD** | Segregation of Duties |
| **LSP** | Lending Service Provider |
| **RE** | Regulated Entity (lender/bank) |
| **DPO** | Data Protection Officer |
| **STR** | Suspicious Transaction Report |
| **CDD** | Customer Due Diligence |

---

*End of Document B4 — Compliance Framework Specification*
