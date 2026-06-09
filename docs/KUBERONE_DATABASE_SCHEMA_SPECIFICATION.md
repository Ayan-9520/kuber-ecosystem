# KuberOne
## Database Schema Specification Document

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise Database Schema Specification  
**Classification:** MySQL Ready | Prisma Ready | Backend Ready | CTO Ready | Future Scale Ready  
**Version:** 1.0  
**Date:** June 2026  
**Tech Stack:** MySQL 8 · Prisma ORM · Node.js · Express.js · TypeScript  
**Related Documents:**
- [KUBERONE_ER_DIAGRAM_AND_DATA_MODEL.md](./KUBERONE_ER_DIAGRAM_AND_DATA_MODEL.md)
- [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md)
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md)
- [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md)
- [KUBERONE_SCREEN_PLANNING_AND_IA.md](./KUBERONE_SCREEN_PLANNING_AND_IA.md)
- [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Complete MySQL table specifications — columns, types, keys, indexes, relationships |
| **Audience** | DBA, Backend Engineers, Data Architects, Security, QA |
| **Purpose** | Single source of truth for Prisma schema generation and backend implementation |
| **Status** | Authoritative Schema Specification |
| **Out of Scope** | SQL DDL statements, Prisma schema code, API implementation |

---

## Schema Statistics

| Metric | Count |
|--------|-------|
| **Database modules** | 24 |
| **Phase 1 tables** | 139 |
| **Master data tables** | 9 |
| **Junction tables** | 3 |
| **Future expansion tables** | 18 |
| **Total planned tables** | 157 |
| **Estimated enums** | 68 |

---

## Global Column Standards

| Standard | Rule |
|----------|------|
| **Primary key** | `id` CHAR(36) — UUID v4, generated application-side or `UUID()` |
| **Foreign keys** | `{entity}_id` CHAR(36), indexed, `ON DELETE RESTRICT` default |
| **Timestamps** | `created_at` DATETIME(3) NOT NULL; `updated_at` DATETIME(3) NOT NULL |
| **Audit actors** | `created_by` CHAR(36) NULL FK→users; `updated_by` CHAR(36) NULL FK→users |
| **Soft delete** | `deleted_at` DATETIME(3) NULL; `deleted_by` CHAR(36) NULL FK→users |
| **Optimistic lock** | `version` INT NOT NULL DEFAULT 1 — on high-contention tables |
| **Money** | DECIMAL(15,2) + `currency` CHAR(3) DEFAULT 'INR' |
| **Enums** | MySQL ENUM or VARCHAR(50) — Prisma enum preferred |
| **JSON** | JSON type — metadata, rules, layouts only; not primary query fields |
| **PII encrypted** | TEXT — application-layer AES-256; companion `*_masked` VARCHAR |
| **Boolean** | TINYINT(1) NOT NULL DEFAULT 0 |
| **Codes** | VARCHAR(20) UNIQUE — human-readable business codes |

---

# 35. EXECUTIVE SUMMARY

*Board-level database architecture summary — presented first.*

## Strategic Database Position

KuberOne's database schema comprises **139 Phase-1 tables** across **24 modules** in a **single MySQL 8 database**, designed for ACID-compliant financial operations, RBAC-enforced multi-role access, and modular product expansion without schema redesign.

| Dimension | Specification |
|-----------|---------------|
| **Engine** | InnoDB — row-level locking, FK constraints, transactions |
| **Charset** | utf8mb4 / utf8mb4_unicode_ci — full Unicode + emoji |
| **Primary keys** | UUID CHAR(36) — opaque, non-sequential |
| **Normalization** | 3NF operational; denormalized analytics snapshots |
| **Multi-product** | Core `applications` + family extension tables (HL/LAP/BL/AL) |
| **Partner model** | Unified `partners` table with `partner_types` discriminator |
| **Audit** | Immutable log tables + standard audit columns on mutable tables |
| **Scale path** | Single RDS → read replica → partition logs → warehouse export |

## Module Landscape

| Module | Tables | Critical Path |
|--------|--------|---------------|
| Identity & Access | 10 | Authentication, RBAC |
| Customer | 7 | Customer 360 |
| Partner | 8 | DSA network |
| Organization | 5 | Branch/region tenancy |
| Products | 6 | Product catalog + rules |
| LMS | 8 | Lead pipeline |
| LOS | 9 | Application lifecycle S01–S09 |
| Product Extensions | 12 | HL/LAP/BL/AL details |
| Documents | 7 | S3 metadata + verification |
| KYC | 4 | Regulatory compliance |
| Commissions | 7 | Revenue + payouts |
| **Phase 1 Total** | **139** | — |

## Capacity Outlook

| Year | Users | Applications | DB Size | Strategy |
|------|-------|-------------|---------|----------|
| Year 1 | 50K | 100K | ~50 GB | Single RDS db.r6g.large |
| Year 3 | 500K | 1M | ~300 GB | Read replica + log partitioning |
| Year 5 | 2M+ | 5M+ | ~1.2 TB | Partitioned audit/logs + archival |

**Board Recommendation:** Approve this schema specification as the implementation authority for all KuberOne database and Prisma development.

---

# 1. DATABASE OVERVIEW

## 1.1 Database Design Philosophy

| # | Principle | Implementation |
|---|-----------|----------------|
| 1 | **Single database, logical modules** | One MySQL schema `kuberone_prod`; tables prefixed by module grouping in Prisma |
| 2 | **UUID everywhere external** | All API-exposed IDs are UUID; no auto-increment exposure |
| 3 | **Referential integrity** | FK constraints on all relationships; RESTRICT on delete for financial records |
| 4 | **Append-only financials** | `commission_ledger`, `disbursements` — no hard delete; adjustments via child tables |
| 5 | **Config as data** | Rules in `eligibility_rules`, `commission_rules` — JSON definitions, versioned |
| 6 | **Documents in S3** | DB stores metadata only; `s3_key`, `checksum`, `mime_type` |
| 7 | **Tenant scoping** | `branch_id`, `region_id` on operational tables for RBAC data isolation |
| 8 | **Enum-driven lifecycles** | All status fields typed; no free-text status |
| 9 | **Audit by default** | `created_at/by`, `updated_at/by` on all mutable tables |
| 10 | **Soft delete selective** | Applied to customers, leads, applications, partners — not logs |

## 1.2 Naming Standards

| Element | Convention | Example |
|---------|------------|---------|
| Database | snake_case | `kuberone_prod` |
| Table | snake_case plural | `customer_addresses` |
| Column | snake_case | `application_code` |
| Primary key | `id` | — |
| Foreign key column | `{table_singular}_id` | `customer_id` |
| Foreign key constraint | `fk_{child}_{parent}` | `fk_leads_customers` |
| Index | `idx_{table}_{columns}` | `idx_leads_branch_status` |
| Unique constraint | `uq_{table}_{columns}` | `uq_users_phone` |
| Enum type (Prisma) | PascalCase | `ApplicationStage` |
| Business code | `{PREFIX}-{number}` | `KFA-000001` |

## 1.3 Primary Key Standards

| Rule | Detail |
|------|--------|
| Type | CHAR(36) storing UUID v4 string |
| Generation | Application-side `uuid.v4()` or MySQL `UUID()` on insert |
| Clustered | InnoDB clustered on PK — UUID v4 causes fragmentation; acceptable at projected scale |
| Alternative (Phase 3) | BINARY(16) `UUID_TO_BIN()` for storage efficiency |
| Master data | CHAR(36) UUID or INT auto-increment internal for seed tables (countries use ISO codes as natural key) |

## 1.4 Foreign Key Standards

| Rule | Detail |
|------|--------|
| Type | CHAR(36) matching parent PK |
| ON DELETE | RESTRICT (default) — prevent orphan violations |
| ON DELETE CASCADE | Only on pure child tables: `chat_messages`→`chat_sessions`, `document_versions`→`documents` |
| ON DELETE SET NULL | Optional references: `lead_id` on applications, `rm_employee_id` |
| Nullable FK | Explicit NULL allowed for optional relationships |
| Index | Every FK column indexed automatically |

## 1.5 Audit Standards

| Column | Tables | Rule |
|--------|--------|------|
| `created_at` | All | NOT NULL, DEFAULT CURRENT_TIMESTAMP(3) |
| `updated_at` | Mutable | NOT NULL, ON UPDATE CURRENT_TIMESTAMP(3) |
| `created_by` | Mutable business | FK → users.id, NULL for system |
| `updated_by` | Mutable business | FK → users.id |
| `deleted_at` | Soft-delete tables | NULL = active |
| `deleted_by` | Soft-delete tables | FK → users.id |
| `version` | High-contention | Optimistic locking: applications, leads, commission_ledger |

## 1.6 Soft Delete Standards

| Applies To | Query Pattern |
|------------|---------------|
| users, customers, partners, employees, leads, applications | `WHERE deleted_at IS NULL` |
| Prisma middleware | Global filter on soft-delete models |
| Unique constraints | Use partial unique indexes (Phase 2) or include `deleted_at` in composite |
| Financial records | **Never** soft-deleted — use status enums |
| Audit/logs | **Never** deleted — archival only |

## 1.7 Versioning Standards

| Version Type | Implementation |
|--------------|----------------|
| Optimistic lock | `version` INT column — increment on update |
| Document versions | `document_versions` child table with `version_number` |
| Knowledge articles | `knowledge_article_versions` (via policies/sops content_version) |
| Commission rules | `effective_from` / `effective_to` date range |
| Consent | `consent_version` VARCHAR per acceptance record |

## 1.8 Multi-Product Strategy

```
applications (core)
  ├── home_loan_details      [product_family = HL]
  ├── lap_details            [product_family = LAP]
  ├── business_loan_details  [product_family = BL]
  └── auto_loan_details      [product_family = AL]
```

- `applications.product_id` → `products.id`
- `products.family_id` → `product_families.id`
- Application service joins correct extension table based on `family_id`
- Shared LOS tables (timeline, sanctions, disbursements) unchanged across products

## 1.9 Future Expansion Strategy

1. Add `product_families` row
2. Add `products` + `product_variants` rows
3. Create `{product}_details` extension table (1:1 with applications)
4. Add `eligibility_rules` + `document_rules`
5. Add `lender_policies` mappings
6. **Zero changes** to applications, leads, documents, commissions core schema

---

# 2. DATABASE MODULES

## 2.1 Complete Module Map

| # | Module | Schema Prefix (Logical) | Table Count | Phase |
|---|--------|------------------------|-------------|-------|
| 1 | Identity & Access | `iam_` / core | 10 | 1 |
| 2 | Customer | `cust_` / core | 7 | 1 |
| 3 | Partner | `ptr_` / core | 8 | 1 |
| 4 | Organization | `org_` / core | 5 | 1 |
| 5 | Products | `prd_` / core | 6 | 1 |
| 6 | LMS (Lead Management) | `lms_` / core | 8 | 1 |
| 7 | LOS (Loan Origination) | `los_` / core | 9 | 1 |
| 8 | Home Loan Extensions | `hl_` | 3 | 1 |
| 9 | LAP Extensions | `lap_` | 3 | 1 |
| 10 | Business Loan Extensions | `bl_` | 3 | 1 |
| 11 | Auto Loan Extensions | `al_` | 3 | 1 |
| 12 | Documents | `doc_` / core | 7 | 1 |
| 13 | KYC | `kyc_` / core | 4 | 1 |
| 14 | Referrals | `ref_` / core | 4 | 1 |
| 15 | Commissions | `com_` / core | 7 | 1 |
| 16 | Support | `sup_` / core | 5 | 1 |
| 17 | Communications | `comms_` / core | 6 | 1 |
| 18 | Campaigns | `cmp_` / core | 4 | 1 |
| 19 | AI | `ai_` / core | 7 | 1 |
| 20 | Knowledge Base | `kb_` / core | 6 | 1 |
| 21 | Analytics | `an_` / core | 5 | 1 |
| 22 | Audit | `aud_` / core | 5 | 1 |
| 23 | Settings | `cfg_` / core | 5 | 1 |
| 24 | Master Data | `md_` / core | 9 | 1 |
| 25 | Future Expansion | `fut_` | 18 | 2–4 |

## 2.2 Module Dependency Order (Migration Sequence)

```
1. Master Data (countries, banks, lenders, ...)
2. Identity (users, roles, permissions)
3. Organization (regions, branches, departments, employees)
4. Products (families, products, variants, rules)
5. Customer + KYC
6. Partners
7. LMS (leads)
8. LOS (applications) + Product Extensions
9. Documents
10. Commissions + Referrals
11. Support + Communications + Campaigns
12. AI + Knowledge Base
13. Analytics + Audit + Settings
```

---

# 3. IDENTITY & ACCESS TABLES

## 3.1 users

| Attribute | Value |
|-----------|-------|
| **Purpose** | Central authentication identity for all user types |
| **Module** | Identity & Access |

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK, UUID v4 |
| user_type | ENUM | NO | — | CUSTOMER, DSA, REFERRAL, EMPLOYEE |
| phone | VARCHAR(15) | NO | — | E.164 format, primary login |
| phone_verified | TINYINT(1) | NO | 0 | OTP verified |
| email | VARCHAR(255) | YES | NULL | Secondary identifier |
| email_verified | TINYINT(1) | NO | 0 | — |
| password_hash | VARCHAR(255) | YES | NULL | bcrypt hash; NULL for OTP-only |
| status | ENUM | NO | PENDING_VERIFICATION | ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION |
| last_login_at | DATETIME(3) | YES | NULL | — |
| mfa_enabled | TINYINT(1) | NO | 0 | Employees default 1 |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| deleted_at | DATETIME(3) | YES | NULL | Soft delete |
| deleted_by | CHAR(36) | YES | NULL | FK → users.id |

**Primary Key:** `id`  
**Foreign Keys:** `deleted_by` → `users.id`  
**Unique Constraints:** `uq_users_phone` (phone), `uq_users_email` (email, where not null)  
**Indexes:** `idx_users_status` (status), `idx_users_user_type` (user_type), `idx_users_deleted_at` (deleted_at)  
**Relationships:** 1:1 customers, partners, employees; 1:N sessions, user_roles, login_history

---

## 3.2 roles

| Attribute | Value |
|-----------|-------|
| **Purpose** | RBAC role definitions (22 system roles) |
| **Module** | Identity & Access |

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| code | VARCHAR(50) | NO | — | SALES_EXECUTIVE, ADMIN, etc. |
| name | VARCHAR(100) | NO | — | Display name |
| description | TEXT | YES | NULL | — |
| role_type | ENUM | NO | — | INTERNAL, PARTNER, CUSTOMER, SYSTEM |
| is_system | TINYINT(1) | NO | 1 | Cannot delete system roles |
| hierarchy_level | INT | YES | NULL | Permission inheritance order |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**Primary Key:** `id`  
**Unique Constraints:** `uq_roles_code` (code)  
**Indexes:** `idx_roles_role_type` (role_type)  
**Relationships:** N:M permissions via role_permissions; N:M users via user_roles

---

## 3.3 permissions

| Attribute | Value |
|-----------|-------|
| **Purpose** | Atomic permission grants mapped to RBAC resources |
| **Module** | Identity & Access |

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| code | VARCHAR(100) | NO | — | leads:read:branch |
| resource | VARCHAR(50) | NO | — | RES-01 to RES-25 |
| action | ENUM | NO | — | CREATE, READ, UPDATE, DELETE, APPROVE, EXPORT, EXECUTE |
| scope | ENUM | NO | — | OWN, ASSIGNED, BRANCH, REGION, ALL |
| description | TEXT | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**Primary Key:** `id`  
**Unique Constraints:** `uq_permissions_code` (code)  
**Indexes:** `idx_permissions_resource_action` (resource, action)  
**Relationships:** N:M roles via role_permissions

---

## 3.4 role_permissions

| Attribute | Value |
|-----------|-------|
| **Purpose** | Junction: roles ↔ permissions with grant/deny |
| **Module** | Identity & Access |

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| role_id | CHAR(36) | NO | — | FK → roles.id |
| permission_id | CHAR(36) | NO | — | FK → permissions.id |
| granted | TINYINT(1) | NO | 1 | 0 = explicit deny |
| conditions | JSON | YES | NULL | Field-level modifiers |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**Primary Key:** `id`  
**Foreign Keys:** `role_id` → `roles.id` RESTRICT; `permission_id` → `permissions.id` RESTRICT  
**Unique Constraints:** `uq_role_permissions_role_permission` (role_id, permission_id)  
**Indexes:** `idx_role_permissions_role_id` (role_id), `idx_role_permissions_permission_id` (permission_id)

---

## 3.5 user_roles

| Attribute | Value |
|-----------|-------|
| **Purpose** | Junction: users ↔ roles with scope overrides |
| **Module** | Identity & Access |

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| user_id | CHAR(36) | NO | — | FK → users.id |
| role_id | CHAR(36) | NO | — | FK → roles.id |
| scope_branch_id | CHAR(36) | YES | NULL | FK → branches.id |
| scope_region_id | CHAR(36) | YES | NULL | FK → regions.id |
| assigned_by | CHAR(36) | YES | NULL | FK → users.id |
| valid_from | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| valid_to | DATETIME(3) | YES | NULL | Temporary role expiry |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**Primary Key:** `id`  
**Foreign Keys:** user_id → users; role_id → roles; scope_branch_id → branches; scope_region_id → regions  
**Unique Constraints:** `uq_user_roles_user_role_scope` (user_id, role_id, scope_branch_id)  
**Indexes:** `idx_user_roles_user_id` (user_id), `idx_user_roles_role_id` (role_id)

---

## 3.6 sessions

| Attribute | Value |
|-----------|-------|
| **Purpose** | Active user sessions across clients |
| **Module** | Identity & Access |

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| user_id | CHAR(36) | NO | — | FK → users.id |
| token_hash | VARCHAR(255) | NO | — | SHA-256 of access token |
| client_type | ENUM | NO | — | CUSTOMER_APP, DSA_APP, CRM_WEB |
| ip_address | VARCHAR(45) | YES | NULL | IPv4/IPv6 |
| user_agent | VARCHAR(500) | YES | NULL | — |
| expires_at | DATETIME(3) | NO | — | Session expiry |
| revoked_at | DATETIME(3) | YES | NULL | Manual logout |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**Primary Key:** `id`  
**Foreign Keys:** `user_id` → `users.id` RESTRICT  
**Indexes:** `idx_sessions_user_id` (user_id), `idx_sessions_expires_at` (expires_at), `idx_sessions_token_hash` (token_hash)  
**Relationships:** 1:N refresh_tokens

---

## 3.7 refresh_tokens

| Attribute | Value |
|-----------|-------|
| **Purpose** | JWT refresh token rotation chain |
| **Module** | Identity & Access |

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| user_id | CHAR(36) | NO | — | FK → users.id |
| session_id | CHAR(36) | NO | — | FK → sessions.id |
| token_hash | VARCHAR(255) | NO | — | SHA-256 |
| expires_at | DATETIME(3) | NO | — | Default 30 days |
| revoked_at | DATETIME(3) | YES | NULL | — |
| replaced_by_id | CHAR(36) | YES | NULL | FK → refresh_tokens.id (rotation) |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**Primary Key:** `id`  
**Foreign Keys:** user_id → users; session_id → sessions CASCADE; replaced_by_id → refresh_tokens  
**Indexes:** `idx_refresh_tokens_session_id` (session_id), `idx_refresh_tokens_token_hash` (token_hash), `idx_refresh_tokens_expires_at` (expires_at)

---

## 3.8 otp_verifications

| Attribute | Value |
|-----------|-------|
| **Purpose** | OTP generation and verification tracking |
| **Module** | Identity & Access |

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| user_id | CHAR(36) | YES | NULL | FK → users.id |
| phone | VARCHAR(15) | NO | — | Target phone |
| otp_hash | VARCHAR(255) | NO | — | bcrypt/SHA-256 hash |
| purpose | ENUM | NO | — | LOGIN, REGISTRATION, KYC, TRANSACTION |
| attempts | INT | NO | 0 | Failed attempts |
| max_attempts | INT | NO | 3 | — |
| expires_at | DATETIME(3) | NO | — | 5-minute expiry |
| verified_at | DATETIME(3) | YES | NULL | Success timestamp |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**Primary Key:** `id`  
**Foreign Keys:** `user_id` → `users.id` SET NULL  
**Indexes:** `idx_otp_phone_purpose` (phone, purpose, created_at), `idx_otp_expires_at` (expires_at)

---

## 3.9 devices

| Attribute | Value |
|-----------|-------|
| **Purpose** | Mobile device registration for push and fraud detection |
| **Module** | Identity & Access |

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| user_id | CHAR(36) | NO | — | FK → users.id |
| device_id | VARCHAR(255) | NO | — | Device fingerprint |
| platform | ENUM | NO | — | IOS, ANDROID, WEB |
| fcm_token | VARCHAR(500) | YES | NULL | Firebase token |
| app_version | VARCHAR(20) | YES | NULL | — |
| is_trusted | TINYINT(1) | NO | 0 | — |
| last_active_at | DATETIME(3) | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**Primary Key:** `id`  
**Foreign Keys:** `user_id` → `users.id` RESTRICT  
**Unique Constraints:** `uq_devices_user_device` (user_id, device_id)  
**Indexes:** `idx_devices_fcm_token` (fcm_token)

---

## 3.10 login_history

| Attribute | Value |
|-----------|-------|
| **Purpose** | Immutable login attempt audit trail |
| **Module** | Identity & Access |

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| user_id | CHAR(36) | NO | — | FK → users.id |
| session_id | CHAR(36) | YES | NULL | FK → sessions.id |
| login_method | ENUM | NO | — | OTP, PASSWORD, MFA |
| ip_address | VARCHAR(45) | YES | NULL | — |
| user_agent | VARCHAR(500) | YES | NULL | — |
| location | VARCHAR(100) | YES | NULL | Geo-derived |
| success | TINYINT(1) | NO | — | — |
| failure_reason | VARCHAR(100) | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**Primary Key:** `id`  
**Foreign Keys:** user_id → users; session_id → sessions SET NULL  
**Indexes:** `idx_login_history_user_id` (user_id, created_at), `idx_login_history_success` (success, created_at)

---

# 4. CUSTOMER TABLES

## 4.1 customers

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| user_id | CHAR(36) | NO | — | FK → users.id, UNIQUE |
| customer_code | VARCHAR(20) | NO | — | KFC-000001 |
| first_name | VARCHAR(100) | NO | — | — |
| last_name | VARCHAR(100) | YES | NULL | — |
| full_name | VARCHAR(200) | NO | — | Computed display |
| date_of_birth | DATE | YES | NULL | — |
| gender | ENUM | YES | NULL | MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY |
| marital_status | ENUM | YES | NULL | SINGLE, MARRIED, DIVORCED, WIDOWED |
| profile_completion_pct | INT | NO | 0 | 0–100 |
| kyc_status | ENUM | NO | NOT_STARTED | NOT_STARTED, IN_PROGRESS, VERIFIED, REJECTED, EXPIRED |
| rm_employee_id | CHAR(36) | YES | NULL | FK → employees.id |
| branch_id | CHAR(36) | YES | NULL | FK → branches.id |
| source | ENUM | NO | DIRECT | DIRECT, DSA, REFERRAL, CAMPAIGN, WALK_IN |
| metadata | JSON | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| created_by | CHAR(36) | YES | NULL | FK → users.id |
| updated_by | CHAR(36) | YES | NULL | FK → users.id |
| deleted_at | DATETIME(3) | YES | NULL | Soft delete |
| deleted_by | CHAR(36) | YES | NULL | FK → users.id |
| version | INT | NO | 1 | Optimistic lock |

**PK:** `id` | **UQ:** `uq_customers_user_id`, `uq_customers_code`  
**Indexes:** `idx_customers_branch_id`, `idx_customers_kyc_status`, `idx_customers_full_name`, `idx_customers_deleted_at`  
**Relationships:** 1:1 user; 1:1 profile, preferences; 1:N addresses, employment, income, consents, applications

---

## 4.2 customer_profiles

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| customer_id | CHAR(36) | NO | — | FK → customers.id, UNIQUE |
| photo_s3_key | VARCHAR(500) | YES | NULL | Profile photo |
| alternate_phone | VARCHAR(15) | YES | NULL | — |
| alternate_email | VARCHAR(255) | YES | NULL | — |
| preferred_language | ENUM | NO | EN | EN, HI, TA, TE, MR, BN, GU, KN, ML |
| preferred_contact_channel | ENUM | NO | WHATSAPP | SMS, WHATSAPP, EMAIL, PUSH, CALL |
| nationality | VARCHAR(50) | NO | INDIA | — |
| residential_status | ENUM | YES | NULL | RESIDENT, NRI, PIO |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **FK:** customer_id → customers CASCADE  
**UQ:** `uq_customer_profiles_customer_id`

---

## 4.3 customer_addresses

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| customer_id | CHAR(36) | NO | — | FK → customers.id |
| address_type | ENUM | NO | — | CURRENT, PERMANENT, OFFICE, PROPERTY |
| line1 | VARCHAR(255) | NO | — | — |
| line2 | VARCHAR(255) | YES | NULL | — |
| landmark | VARCHAR(100) | YES | NULL | — |
| city | VARCHAR(100) | NO | — | — |
| state_id | CHAR(36) | YES | NULL | FK → states.id |
| state_name | VARCHAR(100) | NO | — | Denormalized |
| pincode | VARCHAR(10) | NO | — | — |
| country_id | CHAR(36) | NO | — | FK → countries.id |
| is_primary | TINYINT(1) | NO | 0 | — |
| verified_at | DATETIME(3) | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **FK:** customer_id → customers CASCADE  
**Indexes:** `idx_customer_addresses_customer_id`, `idx_customer_addresses_pincode`

---

## 4.4 customer_employment

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| customer_id | CHAR(36) | NO | — | FK → customers.id |
| employment_type | ENUM | NO | — | SALARIED, SELF_EMPLOYED, BUSINESS_OWNER, PROFESSIONAL, RETIRED, OTHER |
| employer_name | VARCHAR(200) | YES | NULL | — |
| designation | VARCHAR(100) | YES | NULL | — |
| industry_id | CHAR(36) | YES | NULL | FK → industries.id |
| occupation_id | CHAR(36) | YES | NULL | FK → occupations.id |
| years_in_current_job | DECIMAL(4,1) | YES | NULL | — |
| total_experience_years | DECIMAL(4,1) | YES | NULL | — |
| office_address_id | CHAR(36) | YES | NULL | FK → customer_addresses.id |
| is_current | TINYINT(1) | NO | 1 | — |
| start_date | DATE | YES | NULL | — |
| end_date | DATE | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_customer_employment_customer_id`, `idx_customer_employment_is_current`

---

## 4.5 customer_income

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| customer_id | CHAR(36) | NO | — | FK → customers.id |
| employment_id | CHAR(36) | YES | NULL | FK → customer_employment.id |
| income_type | ENUM | NO | — | MONTHLY_SALARY, ANNUAL_INCOME, BUSINESS_INCOME, RENTAL, OTHER |
| gross_amount | DECIMAL(15,2) | NO | — | — |
| net_amount | DECIMAL(15,2) | YES | NULL | — |
| frequency | ENUM | NO | MONTHLY | MONTHLY, ANNUAL |
| currency | CHAR(3) | NO | INR | — |
| declared_at | DATETIME(3) | NO | — | — |
| verified_at | DATETIME(3) | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_customer_income_customer_id`

---

## 4.6 customer_preferences

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| customer_id | CHAR(36) | NO | — | FK → customers.id, UNIQUE |
| push_enabled | TINYINT(1) | NO | 1 | — |
| sms_enabled | TINYINT(1) | NO | 1 | — |
| email_enabled | TINYINT(1) | NO | 1 | — |
| whatsapp_enabled | TINYINT(1) | NO | 1 | — |
| marketing_opt_in | TINYINT(1) | NO | 0 | — |
| ai_advisor_enabled | TINYINT(1) | NO | 1 | — |
| voice_ai_enabled | TINYINT(1) | NO | 0 | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **UQ:** `uq_customer_preferences_customer_id`

---

## 4.7 customer_consents

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| customer_id | CHAR(36) | NO | — | FK → customers.id |
| consent_type | ENUM | NO | — | TERMS, PRIVACY, KYC, CREDIT_CHECK, MARKETING, DATA_SHARING |
| consent_version | VARCHAR(20) | NO | — | Policy version |
| granted | TINYINT(1) | NO | — | — |
| granted_at | DATETIME(3) | YES | NULL | — |
| revoked_at | DATETIME(3) | YES | NULL | — |
| ip_address | VARCHAR(45) | YES | NULL | — |
| user_agent | VARCHAR(500) | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_customer_consents_customer_type` (customer_id, consent_type)

---

# 5. PARTNER TABLES

## 5.1 partner_types

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| code | VARCHAR(20) | NO | — | DSA, REFERRAL, BUILDER, CA |
| name | VARCHAR(100) | NO | — | — |
| description | TEXT | YES | NULL | — |
| is_active | TINYINT(1) | NO | 1 | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **UQ:** `uq_partner_types_code`

---

## 5.2 partners

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| user_id | CHAR(36) | NO | — | FK → users.id, UNIQUE |
| partner_type_id | CHAR(36) | NO | — | FK → partner_types.id |
| partner_code | VARCHAR(20) | NO | — | KFP-DSA-00001 |
| display_name | VARCHAR(200) | NO | — | — |
| business_name | VARCHAR(200) | YES | NULL | Registered name |
| tier | ENUM | YES | NULL | BRONZE, SILVER, GOLD, PLATINUM (DSA only) |
| referral_code | VARCHAR(20) | YES | NULL | Unique shareable code |
| status | ENUM | NO | PENDING | PENDING, ACTIVE, SUSPENDED, TERMINATED |
| branch_id | CHAR(36) | YES | NULL | FK → branches.id |
| region_id | CHAR(36) | YES | NULL | FK → regions.id |
| onboarding_completed_at | DATETIME(3) | YES | NULL | — |
| certified_products | JSON | YES | NULL | Product family codes array |
| performance_score | DECIMAL(5,2) | YES | NULL | 0–100 |
| total_referrals | INT | NO | 0 | Referral partners |
| total_conversions | INT | NO | 0 | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| deleted_at | DATETIME(3) | YES | NULL | — |
| deleted_by | CHAR(36) | YES | NULL | — |
| version | INT | NO | 1 | — |

**PK:** `id` | **UQ:** `uq_partners_code`, `uq_partners_referral_code`  
**Indexes:** `idx_partners_type_status`, `idx_partners_branch_id`, `idx_partners_region_id`

---

## 5.3 partner_profiles

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| partner_id | CHAR(36) | NO | — | FK → partners.id, UNIQUE |
| contact_person | VARCHAR(200) | YES | NULL | — |
| alternate_phone | VARCHAR(15) | YES | NULL | — |
| alternate_email | VARCHAR(255) | YES | NULL | — |
| address_line1 | VARCHAR(255) | YES | NULL | — |
| city | VARCHAR(100) | YES | NULL | — |
| state_name | VARCHAR(100) | YES | NULL | — |
| pincode | VARCHAR(10) | YES | NULL | — |
| photo_s3_key | VARCHAR(500) | YES | NULL | — |
| bio | TEXT | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **FK:** partner_id → partners CASCADE

---

## 5.4 partner_kyc

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| partner_id | CHAR(36) | NO | — | FK → partners.id, UNIQUE |
| pan_encrypted | TEXT | YES | NULL | AES-256 |
| pan_masked | VARCHAR(10) | YES | NULL | — |
| pan_verified | TINYINT(1) | NO | 0 | — |
| aadhaar_encrypted | TEXT | YES | NULL | — |
| aadhaar_masked | VARCHAR(12) | YES | NULL | — |
| aadhaar_verified | TINYINT(1) | NO | 0 | — |
| gst_number | VARCHAR(15) | YES | NULL | GSTIN |
| kyc_status | ENUM | NO | PENDING | PENDING, VERIFIED, REJECTED |
| verified_by | CHAR(36) | YES | NULL | FK → employees.id |
| verified_at | DATETIME(3) | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id`

---

## 5.5 partner_bank_accounts

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| partner_id | CHAR(36) | NO | — | FK → partners.id |
| account_holder_name | VARCHAR(200) | NO | — | — |
| account_number_encrypted | TEXT | NO | — | AES-256 |
| account_number_masked | VARCHAR(20) | NO | — | — |
| ifsc_code | VARCHAR(11) | NO | — | — |
| bank_id | CHAR(36) | YES | NULL | FK → banks.id |
| bank_name | VARCHAR(100) | NO | — | — |
| account_type | ENUM | NO | SAVINGS | SAVINGS, CURRENT |
| is_primary | TINYINT(1) | NO | 0 | Payout account |
| verified_at | DATETIME(3) | YES | NULL | Penny drop |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_partner_bank_accounts_partner_id`

---

## 5.6 partner_documents

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| partner_id | CHAR(36) | NO | — | FK → partners.id |
| document_type | ENUM | NO | — | PAN, AADHAAR, AGREEMENT, GST, CANCELLED_CHEQUE, PHOTO |
| s3_key | VARCHAR(500) | NO | — | — |
| file_name | VARCHAR(255) | NO | — | — |
| mime_type | VARCHAR(100) | NO | — | — |
| file_size_bytes | BIGINT | NO | — | — |
| checksum | VARCHAR(64) | NO | — | SHA-256 |
| status | ENUM | NO | UPLOADED | UPLOADED, VERIFIED, REJECTED |
| verified_by | CHAR(36) | YES | NULL | FK → employees.id |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_partner_documents_partner_id`

---

## 5.7 partner_performance

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| partner_id | CHAR(36) | NO | — | FK → partners.id |
| period_type | ENUM | NO | — | DAILY, WEEKLY, MONTHLY, QUARTERLY |
| period_start | DATE | NO | — | — |
| period_end | DATE | NO | — | — |
| leads_submitted | INT | NO | 0 | — |
| leads_converted | INT | NO | 0 | — |
| applications_submitted | INT | NO | 0 | — |
| disbursements | INT | NO | 0 | — |
| disbursement_amount | DECIMAL(15,2) | NO | 0 | — |
| commission_earned | DECIMAL(15,2) | NO | 0 | — |
| conversion_rate | DECIMAL(5,2) | YES | NULL | — |
| rank_position | INT | YES | NULL | Leaderboard |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **UQ:** `uq_partner_performance_partner_period` (partner_id, period_type, period_start)  
**Indexes:** `idx_partner_performance_period` (period_start, period_end)

---

## 5.8 partner_agreements

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| partner_id | CHAR(36) | NO | — | FK → partners.id |
| agreement_type | ENUM | NO | — | DSA_AGREEMENT, NDA, PRODUCT_CERTIFICATION |
| agreement_version | VARCHAR(20) | NO | — | — |
| document_id | CHAR(36) | YES | NULL | FK → partner_documents.id |
| signed_at | DATETIME(3) | YES | NULL | eSign timestamp |
| valid_from | DATE | NO | — | — |
| valid_to | DATE | YES | NULL | — |
| status | ENUM | NO | DRAFT | DRAFT, PENDING_SIGNATURE, ACTIVE, EXPIRED, TERMINATED |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_partner_agreements_partner_id`

---

# 6. ORGANIZATION TABLES

## 6.1 regions

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| region_code | VARCHAR(20) | NO | — | REG-WEST |
| name | VARCHAR(100) | NO | — | — |
| manager_employee_id | CHAR(36) | YES | NULL | FK → employees.id |
| is_active | TINYINT(1) | NO | 1 | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **UQ:** `uq_regions_code`

---

## 6.2 branches

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| branch_code | VARCHAR(20) | NO | — | BR-MUM-01 |
| name | VARCHAR(100) | NO | — | — |
| region_id | CHAR(36) | NO | — | FK → regions.id |
| address | TEXT | YES | NULL | — |
| city_id | CHAR(36) | YES | NULL | FK → cities.id |
| city_name | VARCHAR(100) | NO | — | — |
| state_name | VARCHAR(100) | NO | — | — |
| pincode | VARCHAR(10) | YES | NULL | — |
| manager_employee_id | CHAR(36) | YES | NULL | FK → employees.id |
| is_active | TINYINT(1) | NO | 1 | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **UQ:** `uq_branches_code` | **Indexes:** `idx_branches_region_id`

---

## 6.3 departments

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| code | VARCHAR(20) | NO | — | SALES, CREDIT, OPS, etc. |
| name | VARCHAR(100) | NO | — | — |
| head_employee_id | CHAR(36) | YES | NULL | FK → employees.id |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **UQ:** `uq_departments_code`

---

## 6.4 employees

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| user_id | CHAR(36) | NO | — | FK → users.id, UNIQUE |
| employee_code | VARCHAR(20) | NO | — | KFE-00001 |
| first_name | VARCHAR(100) | NO | — | — |
| last_name | VARCHAR(100) | YES | NULL | — |
| designation | VARCHAR(100) | NO | — | — |
| department_id | CHAR(36) | NO | — | FK → departments.id |
| branch_id | CHAR(36) | NO | — | FK → branches.id |
| region_id | CHAR(36) | NO | — | FK → regions.id |
| reports_to_id | CHAR(36) | YES | NULL | FK → employees.id |
| joining_date | DATE | NO | — | — |
| status | ENUM | NO | ACTIVE | ACTIVE, ON_LEAVE, RESIGNED, TERMINATED |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| deleted_at | DATETIME(3) | YES | NULL | — |

**PK:** `id` | **UQ:** `uq_employees_code`  
**Indexes:** `idx_employees_branch_id`, `idx_employees_department_id`, `idx_employees_reports_to`

---

## 6.5 employee_reporting

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| employee_id | CHAR(36) | NO | — | FK → employees.id |
| manager_id | CHAR(36) | NO | — | FK → employees.id |
| relationship_type | ENUM | NO | DIRECT | DIRECT, DOTTED, FUNCTIONAL |
| effective_from | DATE | NO | — | — |
| effective_to | DATE | YES | NULL | Historical |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_employee_reporting_employee_id`, `idx_employee_reporting_manager_id`

---

# 7. PRODUCT TABLES

## 7.1 product_families

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| code | VARCHAR(10) | NO | — | HL, LAP, BL, AL |
| name | VARCHAR(100) | NO | — | — |
| description | TEXT | YES | NULL | — |
| is_secured | TINYINT(1) | NO | 1 | — |
| display_order | INT | NO | 0 | — |
| is_active | TINYINT(1) | NO | 1 | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **UQ:** `uq_product_families_code`

---

## 7.2 products

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| family_id | CHAR(36) | NO | — | FK → product_families.id |
| code | VARCHAR(10) | NO | — | HL-01, LAP-02 |
| name | VARCHAR(200) | NO | — | — |
| description | TEXT | YES | NULL | — |
| min_amount | DECIMAL(15,2) | NO | — | — |
| max_amount | DECIMAL(15,2) | NO | — | — |
| min_tenure_months | INT | NO | — | — |
| max_tenure_months | INT | NO | — | — |
| min_interest_rate | DECIMAL(5,2) | YES | NULL | Indicative |
| max_interest_rate | DECIMAL(5,2) | YES | NULL | — |
| priority | ENUM | NO | P1 | P0, P1, P2, P3 |
| is_active | TINYINT(1) | NO | 1 | — |
| launch_date | DATE | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **UQ:** `uq_products_code` | **Indexes:** `idx_products_family_id`

---

## 7.3 product_variants

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| product_id | CHAR(36) | NO | — | FK → products.id |
| variant_code | VARCHAR(20) | NO | — | FRESH, BT, TOP_UP, BT_TOP_UP |
| name | VARCHAR(100) | NO | — | — |
| description | TEXT | YES | NULL | — |
| is_active | TINYINT(1) | NO | 1 | — |
| config | JSON | YES | NULL | Variant parameters |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **UQ:** `uq_product_variants_product_code` (product_id, variant_code)

---

## 7.4 eligibility_rules

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| product_id | CHAR(36) | NO | — | FK → products.id |
| variant_id | CHAR(36) | YES | NULL | FK → product_variants.id |
| rule_name | VARCHAR(100) | NO | — | — |
| rule_type | ENUM | NO | — | AGE, INCOME, FOIR, LTV, CIBIL, EMPLOYMENT, CUSTOM |
| rule_definition | JSON | NO | — | Rule logic |
| priority | INT | NO | 0 | Evaluation order |
| is_active | TINYINT(1) | NO | 1 | — |
| effective_from | DATE | NO | — | — |
| effective_to | DATE | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_eligibility_rules_product_id`

---

## 7.5 document_rules

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| product_id | CHAR(36) | NO | — | FK → products.id |
| variant_id | CHAR(36) | YES | NULL | FK → product_variants.id |
| document_type_id | CHAR(36) | NO | — | FK → document_types.id |
| is_mandatory | TINYINT(1) | NO | 1 | — |
| stage | ENUM | NO | S03 | S03, S04, S05, S07 |
| employment_type | ENUM | YES | NULL | Conditional |
| description | TEXT | YES | NULL | Instructions |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_document_rules_product_id`

---

## 7.6 lender_policies

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| lender_id | CHAR(36) | NO | — | FK → lenders.id |
| product_id | CHAR(36) | NO | — | FK → products.id |
| min_amount | DECIMAL(15,2) | NO | — | — |
| max_amount | DECIMAL(15,2) | NO | — | — |
| max_ltv | DECIMAL(5,2) | YES | NULL | — |
| max_foir | DECIMAL(5,2) | YES | NULL | — |
| min_cibil | INT | YES | NULL | — |
| processing_fee_pct | DECIMAL(5,2) | YES | NULL | — |
| commission_rate | DECIMAL(5,2) | YES | NULL | Kuber % |
| turnaround_days | INT | YES | NULL | — |
| policy_s3_key | VARCHAR(500) | YES | NULL | Policy PDF |
| is_active | TINYINT(1) | NO | 1 | — |
| effective_from | DATE | NO | — | — |
| effective_to | DATE | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **UQ:** `uq_lender_policies_lender_product` (lender_id, product_id, effective_from)  
**Indexes:** `idx_lender_policies_product_id`

---

# 8. LMS TABLES

## 8.1 lead_sources

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| code | VARCHAR(20) | NO | — | DSA, CUSTOMER_APP, REFERRAL, etc. |
| name | VARCHAR(100) | NO | — | — |
| channel | ENUM | NO | — | DIGITAL, PARTNER, DIRECT, INBOUND |
| is_active | TINYINT(1) | NO | 1 | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **UQ:** `uq_lead_sources_code`

---

## 8.2 leads

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| lead_code | VARCHAR(20) | NO | — | KFL-000001 |
| customer_id | CHAR(36) | YES | NULL | FK → customers.id |
| prospect_name | VARCHAR(200) | NO | — | — |
| prospect_phone | VARCHAR(15) | NO | — | — |
| prospect_email | VARCHAR(255) | YES | NULL | — |
| product_id | CHAR(36) | NO | — | FK → products.id |
| variant_id | CHAR(36) | YES | NULL | FK → product_variants.id |
| source_id | CHAR(36) | NO | — | FK → lead_sources.id |
| partner_id | CHAR(36) | YES | NULL | FK → partners.id |
| campaign_id | CHAR(36) | YES | NULL | FK → campaigns.id |
| branch_id | CHAR(36) | NO | — | FK → branches.id |
| region_id | CHAR(36) | NO | — | FK → regions.id |
| requested_amount | DECIMAL(15,2) | YES | NULL | — |
| status | ENUM | NO | NEW | NEW, CONTACTED, QUALIFIED, UNQUALIFIED, CONVERTED, LOST, EXPIRED |
| priority | ENUM | NO | MEDIUM | LOW, MEDIUM, HIGH, URGENT |
| sla_deadline | DATETIME(3) | YES | NULL | — |
| converted_application_id | CHAR(36) | YES | NULL | FK → applications.id |
| converted_at | DATETIME(3) | YES | NULL | — |
| lost_reason | VARCHAR(200) | YES | NULL | — |
| metadata | JSON | YES | NULL | UTM, device |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| created_by | CHAR(36) | YES | NULL | FK → users.id |
| updated_by | CHAR(36) | YES | NULL | — |
| deleted_at | DATETIME(3) | YES | NULL | — |
| version | INT | NO | 1 | — |

**PK:** `id` | **UQ:** `uq_leads_code`  
**Indexes:** `idx_leads_branch_status_created` (branch_id, status, created_at), `idx_leads_partner_created` (partner_id, created_at), `idx_leads_prospect_phone`, `idx_leads_sla_deadline`

---

## 8.3 lead_scores

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| lead_id | CHAR(36) | NO | — | FK → leads.id |
| score | INT | NO | — | 0–100 |
| score_band | ENUM | NO | — | COLD, WARM, HOT |
| factors | JSON | NO | — | Breakdown |
| model_version | VARCHAR(20) | NO | — | — |
| calculated_at | DATETIME(3) | NO | — | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_lead_scores_lead_id` (lead_id, calculated_at DESC)

---

## 8.4 lead_assignments

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| lead_id | CHAR(36) | NO | — | FK → leads.id |
| assigned_to_id | CHAR(36) | NO | — | FK → employees.id |
| assigned_by_id | CHAR(36) | YES | NULL | FK → employees.id |
| assignment_type | ENUM | NO | — | AUTO, MANUAL, ROUND_ROBIN, ESCALATION |
| assigned_at | DATETIME(3) | NO | — | — |
| unassigned_at | DATETIME(3) | YES | NULL | — |
| is_current | TINYINT(1) | NO | 1 | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_lead_assignments_lead_current` (lead_id, is_current), `idx_lead_assignments_assigned_to` (assigned_to_id, is_current)

---

## 8.5 lead_status_history

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| lead_id | CHAR(36) | NO | — | FK → leads.id |
| from_status | ENUM | YES | NULL | — |
| to_status | ENUM | NO | — | — |
| changed_by_id | CHAR(36) | NO | — | FK → users.id |
| reason | VARCHAR(200) | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_lead_status_history_lead_id` (lead_id, created_at)

---

## 8.6 lead_activities

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| lead_id | CHAR(36) | NO | — | FK → leads.id |
| activity_type | ENUM | NO | — | CALL, SMS, EMAIL, WHATSAPP, MEETING, NOTE, STATUS_CHANGE |
| performed_by_id | CHAR(36) | NO | — | FK → users.id |
| description | TEXT | YES | NULL | — |
| disposition | ENUM | YES | NULL | CONNECTED, NO_ANSWER, CALLBACK, etc. |
| duration_seconds | INT | YES | NULL | — |
| scheduled_at | DATETIME(3) | YES | NULL | — |
| completed_at | DATETIME(3) | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_lead_activities_lead_id` (lead_id, created_at)

---

## 8.7 lead_notes

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| lead_id | CHAR(36) | NO | — | FK → leads.id |
| author_id | CHAR(36) | NO | — | FK → users.id |
| content | TEXT | NO | — | — |
| is_pinned | TINYINT(1) | NO | 0 | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_lead_notes_lead_id`

---

## 8.8 lead_followups

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| lead_id | CHAR(36) | NO | — | FK → leads.id |
| assigned_to_id | CHAR(36) | NO | — | FK → employees.id |
| followup_type | ENUM | NO | — | CALL, MEETING, DOCUMENT_REQUEST |
| scheduled_at | DATETIME(3) | NO | — | — |
| completed_at | DATETIME(3) | YES | NULL | — |
| status | ENUM | NO | PENDING | PENDING, COMPLETED, MISSED, CANCELLED |
| notes | TEXT | YES | NULL | — |
| reminder_sent | TINYINT(1) | NO | 0 | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_lead_followups_assigned_scheduled` (assigned_to_id, scheduled_at), `idx_lead_followups_lead_id`

---

# 9. LOS TABLES

## 9.1 applications

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| application_code | VARCHAR(20) | NO | — | KFA-000001 |
| customer_id | CHAR(36) | NO | — | FK → customers.id |
| product_id | CHAR(36) | NO | — | FK → products.id |
| variant_id | CHAR(36) | YES | NULL | FK → product_variants.id |
| lead_id | CHAR(36) | YES | NULL | FK → leads.id |
| partner_id | CHAR(36) | YES | NULL | FK → partners.id |
| branch_id | CHAR(36) | NO | — | FK → branches.id |
| region_id | CHAR(36) | NO | — | FK → regions.id |
| current_stage | ENUM | NO | S01_LEAD_CREATED | S01–S09 |
| status | ENUM | NO | DRAFT | DRAFT, IN_PROGRESS, ON_HOLD, APPROVED, REJECTED, WITHDRAWN, DISBURSED, CLOSED |
| requested_amount | DECIMAL(15,2) | NO | — | — |
| requested_tenure_months | INT | NO | — | — |
| purpose | VARCHAR(200) | YES | NULL | — |
| assigned_sales_id | CHAR(36) | YES | NULL | FK → employees.id |
| assigned_credit_id | CHAR(36) | YES | NULL | FK → employees.id |
| assigned_ops_id | CHAR(36) | YES | NULL | FK → employees.id |
| selected_lender_id | CHAR(36) | YES | NULL | FK → lenders.id |
| submitted_at | DATETIME(3) | YES | NULL | — |
| metadata | JSON | YES | NULL | Wizard state |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| created_by | CHAR(36) | YES | NULL | FK → users.id |
| updated_by | CHAR(36) | YES | NULL | — |
| deleted_at | DATETIME(3) | YES | NULL | — |
| version | INT | NO | 1 | Optimistic lock |

**PK:** `id` | **UQ:** `uq_applications_code`  
**Indexes:** `idx_applications_customer_id`, `idx_applications_branch_stage` (branch_id, current_stage), `idx_applications_sales_status` (assigned_sales_id, status), `idx_applications_partner_id`, `idx_applications_submitted_at`

---

## 9.2 application_status

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| application_id | CHAR(36) | NO | — | FK → applications.id, UNIQUE |
| stage | ENUM | NO | — | S01–S09 |
| sub_status | VARCHAR(50) | YES | NULL | Stage-specific |
| status_reason | VARCHAR(200) | YES | NULL | Hold/reject reason |
| sla_deadline | DATETIME(3) | YES | NULL | — |
| is_sla_breached | TINYINT(1) | NO | 0 | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_application_status_sla` (is_sla_breached, sla_deadline)

---

## 9.3 application_timeline

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| application_id | CHAR(36) | NO | — | FK → applications.id |
| stage | ENUM | NO | — | S01–S09 |
| event_type | ENUM | NO | — | STAGE_ENTERED, STAGE_COMPLETED, REWORK, HOLD, ESCALATION |
| from_stage | ENUM | YES | NULL | — |
| to_stage | ENUM | YES | NULL | — |
| performed_by_id | CHAR(36) | YES | NULL | FK → users.id |
| notes | TEXT | YES | NULL | — |
| metadata | JSON | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_application_timeline_app_created` (application_id, created_at)

---

## 9.4 eligibility_results

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| application_id | CHAR(36) | NO | — | FK → applications.id |
| customer_id | CHAR(36) | NO | — | FK → customers.id |
| product_id | CHAR(36) | NO | — | FK → products.id |
| result | ENUM | NO | — | ELIGIBLE, CONDITIONAL, INELIGIBLE |
| max_eligible_amount | DECIMAL(15,2) | YES | NULL | — |
| recommended_tenure | INT | YES | NULL | Months |
| recommended_emi | DECIMAL(15,2) | YES | NULL | — |
| foir | DECIMAL(5,2) | YES | NULL | — |
| ltv | DECIMAL(5,2) | YES | NULL | — |
| rule_results | JSON | NO | — | Per-rule detail |
| engine_version | VARCHAR(20) | NO | — | — |
| checked_at | DATETIME(3) | NO | — | — |
| checked_by_id | CHAR(36) | YES | NULL | FK → users.id |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_eligibility_results_application_id`

---

## 9.5 bank_logins

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| application_id | CHAR(36) | NO | — | FK → applications.id |
| lender_id | CHAR(36) | NO | — | FK → lenders.id |
| login_reference | VARCHAR(100) | YES | NULL | Lender ref |
| login_date | DATETIME(3) | NO | — | — |
| submitted_by_id | CHAR(36) | NO | — | FK → employees.id |
| acknowledgment_received | TINYINT(1) | NO | 0 | — |
| acknowledgment_at | DATETIME(3) | YES | NULL | — |
| status | ENUM | NO | SUBMITTED | SUBMITTED, ACKNOWLEDGED, QUERY_RAISED, REJECTED |
| notes | TEXT | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_bank_logins_application_id`, `idx_bank_logins_lender_id`

---

## 9.6 credit_reviews

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| application_id | CHAR(36) | NO | — | FK → applications.id |
| reviewer_id | CHAR(36) | NO | — | FK → employees.id |
| review_type | ENUM | NO | — | INTERNAL, LENDER_QUERY, REWORK |
| decision | ENUM | NO | PENDING | APPROVED, REJECTED, QUERY, PENDING |
| cibil_score | INT | YES | NULL | — |
| risk_grade | ENUM | YES | NULL | LOW, MEDIUM, HIGH |
| conditions | TEXT | YES | NULL | — |
| rejection_reason | VARCHAR(200) | YES | NULL | — |
| reviewed_at | DATETIME(3) | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_credit_reviews_application_id`

---

## 9.7 sanctions

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| application_id | CHAR(36) | NO | — | FK → applications.id, UNIQUE |
| lender_id | CHAR(36) | NO | — | FK → lenders.id |
| sanctioned_amount | DECIMAL(15,2) | NO | — | — |
| sanctioned_tenure_months | INT | NO | — | — |
| interest_rate | DECIMAL(5,2) | NO | — | ROI % |
| processing_fee | DECIMAL(15,2) | YES | NULL | — |
| emi_amount | DECIMAL(15,2) | YES | NULL | — |
| sanction_letter_s3_key | VARCHAR(500) | YES | NULL | — |
| sanction_date | DATE | NO | — | — |
| validity_date | DATE | YES | NULL | — |
| conditions | TEXT | YES | NULL | — |
| status | ENUM | NO | ISSUED | ISSUED, ACCEPTED, EXPIRED, CANCELLED |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id`

---

## 9.8 disbursements

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| application_id | CHAR(36) | NO | — | FK → applications.id |
| lender_id | CHAR(36) | NO | — | FK → lenders.id |
| disbursed_amount | DECIMAL(15,2) | NO | — | — |
| disbursement_date | DATE | NO | — | — |
| utr_number | VARCHAR(50) | YES | NULL | — |
| disbursement_mode | ENUM | NO | FULL | FULL, PARTIAL, TRANCHE |
| tranche_number | INT | YES | NULL | — |
| commission_triggered | TINYINT(1) | NO | 0 | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id` | **Indexes:** `idx_disbursements_application_id`, `idx_disbursements_date` (disbursement_date)

---

## 9.9 closures

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| application_id | CHAR(36) | NO | — | FK → applications.id, UNIQUE |
| closure_type | ENUM | NO | — | DISBURSED_COMPLETE, REJECTED, WITHDRAWN, CANCELLED |
| closure_date | DATE | NO | — | — |
| closure_reason | VARCHAR(200) | YES | NULL | — |
| rm_assigned_id | CHAR(36) | YES | NULL | FK → employees.id |
| archived_at | DATETIME(3) | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id`

---

# 10. HOME LOAN TABLES

## 10.1 home_loan_details

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| application_id | CHAR(36) | NO | — | FK → applications.id, UNIQUE |
| variant_code | ENUM | NO | — | FRESH, BT, TOP_UP, BT_TOP_UP |
| property_type | ENUM | NO | — | READY, UNDER_CONSTRUCTION, PLOT, RESALE |
| property_value | DECIMAL(15,2) | NO | — | — |
| property_address_id | CHAR(36) | YES | NULL | FK → customer_addresses.id |
| builder_name | VARCHAR(200) | YES | NULL | — |
| project_name | VARCHAR(200) | YES | NULL | RERA project |
| rera_number | VARCHAR(50) | YES | NULL | — |
| occupancy_type | ENUM | NO | — | SELF_OCCUPIED, RENTED, VACANT |
| loan_purpose | ENUM | NO | — | PURCHASE, CONSTRUCTION, RENOVATION, PLOT_PURCHASE |
| down_payment_amount | DECIMAL(15,2) | YES | NULL | — |
| ltv | DECIMAL(5,2) | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |
| updated_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id`

---

## 10.2 home_loan_bt_details

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| home_loan_detail_id | CHAR(36) | NO | — | FK → home_loan_details.id, UNIQUE |
| existing_lender_name | VARCHAR(200) | NO | — | — |
| existing_loan_amount | DECIMAL(15,2) | NO | — | Outstanding |
| existing_emi | DECIMAL(15,2) | YES | NULL | — |
| existing_interest_rate | DECIMAL(5,2) | YES | NULL | — |
| existing_tenure_remaining | INT | YES | NULL | Months |
| existing_loan_start_date | DATE | YES | NULL | — |
| bt_savings_estimate | DECIMAL(15,2) | YES | NULL | — |
| foreclosure_charges | DECIMAL(15,2) | YES | NULL | — |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id`

---

## 10.3 home_loan_topup_details

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | CHAR(36) | NO | — | PK |
| home_loan_detail_id | CHAR(36) | NO | — | FK → home_loan_details.id, UNIQUE |
| existing_loan_account | VARCHAR(50) | YES | NULL | — |
| existing_sanction_amount | DECIMAL(15,2) | YES | NULL | — |
| outstanding_balance | DECIMAL(15,2) | NO | — | — |
| topup_amount | DECIMAL(15,2) | NO | — | — |
| topup_purpose | ENUM | NO | — | PERSONAL, BUSINESS, EDUCATION, MEDICAL, OTHER |
| created_at | DATETIME(3) | NO | CURRENT_TIMESTAMP(3) | — |

**PK:** `id`

---

# 11. LAP TABLES

## 11.1 lap_details — PK: id | application_id UNIQUE FK→applications

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| variant_code | ENUM | NO | FRESH, BT, TOP_UP, BT_TOP_UP |
| property_type | ENUM | NO | RESIDENTIAL, COMMERCIAL, INDUSTRIAL, MIXED |
| property_ownership | ENUM | NO | SELF, JOINT, COMPANY |
| property_value | DECIMAL(15,2) | NO | — |
| property_address_id | CHAR(36) | YES | FK → customer_addresses |
| property_age_years | INT | YES | — |
| occupancy_status | ENUM | NO | SELF_OCCUPIED, RENTED, VACANT |
| loan_purpose | ENUM | NO | BUSINESS, PERSONAL, DEBT_CONSOLIDATION, WORKING_CAPITAL |
| existing_mortgage | TINYINT(1) | NO | 0 |
| ltv | DECIMAL(5,2) | YES | — |
| created_at / updated_at | DATETIME(3) | NO | — |

## 11.2 lap_bt_details — PK: id | lap_detail_id UNIQUE FK→lap_details

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| existing_lender_name | VARCHAR(200) | NO | — |
| existing_outstanding | DECIMAL(15,2) | NO | — |
| existing_interest_rate | DECIMAL(5,2) | YES | — |
| bt_savings_estimate | DECIMAL(15,2) | YES | — |
| created_at | DATETIME(3) | NO | — |

## 11.3 lap_topup_details — PK: id | lap_detail_id UNIQUE FK→lap_details

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| outstanding_balance | DECIMAL(15,2) | NO | — |
| topup_amount | DECIMAL(15,2) | NO | — |
| topup_purpose | ENUM | NO | BUSINESS, PERSONAL, OTHER |
| created_at | DATETIME(3) | NO | — |

---

# 12. BUSINESS LOAN TABLES

## 12.1 business_loan_details — PK: id | application_id UNIQUE

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| variant_code | ENUM | NO | BUSINESS, MSME, WORKING_CAPITAL, OD, CC |
| business_name | VARCHAR(200) | NO | — |
| business_type | ENUM | NO | PROPRIETORSHIP, PARTNERSHIP, PVT_LTD, LLP |
| industry_id | CHAR(36) | YES | FK → industries |
| gst_number | VARCHAR(15) | YES | — |
| udyam_number | VARCHAR(20) | YES | — |
| incorporation_date | DATE | YES | — |
| annual_turnover | DECIMAL(15,2) | YES | — |
| years_in_business | DECIMAL(4,1) | YES | — |
| loan_purpose | ENUM | NO | EXPANSION, MACHINERY, INVENTORY, WORKING_CAPITAL, DEBT_CONSOLIDATION |
| collateral_offered | TINYINT(1) | NO | 0 |
| collateral_description | TEXT | YES | — |
| created_at / updated_at | DATETIME(3) | NO | — |

## 12.2 business_financials — PK: id | business_loan_detail_id FK

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| financial_year | VARCHAR(10) | NO | FY2024-25 |
| revenue | DECIMAL(15,2) | YES | — |
| net_profit | DECIMAL(15,2) | YES | — |
| ebitda | DECIMAL(15,2) | YES | — |
| total_assets | DECIMAL(15,2) | YES | — |
| total_liabilities | DECIMAL(15,2) | YES | — |
| wc_requirement | DECIMAL(15,2) | YES | Working capital need |
| peak_wc_requirement | DECIMAL(15,2) | YES | — |
| stock_value | DECIMAL(15,2) | YES | — |
| debtor_days | INT | YES | — |
| creditor_days | INT | YES | — |
| existing_wc_limit | DECIMAL(15,2) | YES | — |
| created_at | DATETIME(3) | NO | — |

**Indexes:** `idx_business_financials_detail_year` (business_loan_detail_id, financial_year)

## 12.3 business_gst_profiles — PK: id | business_loan_detail_id UNIQUE

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| gstin | VARCHAR(15) | NO | — |
| gst_registration_date | DATE | YES | — |
| gst_filing_status | ENUM | YES | COMPLIANT, DEFAULT, UNKNOWN |
| annual_gst_turnover | DECIMAL(15,2) | YES | — |
| facility_type | ENUM | YES | OVERDRAFT, CASH_CREDIT (OD/CC variants) |
| existing_bank_name | VARCHAR(200) | YES | — |
| existing_limit | DECIMAL(15,2) | YES | — |
| existing_utilization | DECIMAL(15,2) | YES | — |
| requested_limit | DECIMAL(15,2) | YES | — |
| security_type | ENUM | YES | STOCK, BOOK_DEBTS, PROPERTY, NONE |
| created_at | DATETIME(3) | NO | — |

---

# 13. AUTO LOAN TABLES

## 13.1 auto_loan_details — PK: id | application_id UNIQUE

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| variant_code | ENUM | NO | NEW_CAR, USED_CAR, COMMERCIAL, EV, BT, TOP_UP, REFINANCE |
| vehicle_category | ENUM | NO | HATCHBACK, SEDAN, SUV, MUV, LCV, HCV, TWO_WHEELER |
| make_id | CHAR(36) | YES | FK → vehicle_manufacturers |
| model_id | CHAR(36) | YES | FK → vehicle_models |
| make_name | VARCHAR(100) | NO | Denormalized |
| model_name | VARCHAR(100) | NO | — |
| trim_variant | VARCHAR(100) | YES | — |
| manufacturing_year | INT | YES | — |
| registration_number | VARCHAR(20) | YES | Used/commercial |
| ex_showroom_price | DECIMAL(15,2) | YES | — |
| on_road_price | DECIMAL(15,2) | YES | — |
| vehicle_value | DECIMAL(15,2) | NO | — |
| dealer_name | VARCHAR(200) | YES | — |
| is_electric | TINYINT(1) | NO | 0 |
| battery_capacity_kwh | DECIMAL(6,2) | YES | EV |
| ltv | DECIMAL(5,2) | YES | — |
| created_at / updated_at | DATETIME(3) | NO | — |

## 13.2 vehicle_profiles — PK: id | auto_loan_detail_id UNIQUE

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| chassis_number | VARCHAR(50) | YES | — |
| engine_number | VARCHAR(50) | YES | — |
| fuel_type | ENUM | YES | PETROL, DIESEL, CNG, ELECTRIC, HYBRID |
| transmission | ENUM | YES | MANUAL, AUTOMATIC |
| color | VARCHAR(50) | YES | — |
| odometer_km | INT | YES | Used cars |
| insurance_valid_till | DATE | YES | — |
| hypothecation_status | ENUM | YES | NONE, EXISTING |
| created_at | DATETIME(3) | NO | — |

## 13.3 vehicle_valuations — PK: id | auto_loan_detail_id FK

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| valuation_type | ENUM | NO | EX_SHOWROOM, MARKET, INSURANCE_IDV, LENDER_ASSESSED |
| valued_amount | DECIMAL(15,2) | NO | — |
| valued_by | VARCHAR(200) | YES | Agency/dealer |
| valuation_date | DATE | NO | — |
| valuation_report_s3_key | VARCHAR(500) | YES | — |
| created_at | DATETIME(3) | NO | — |

**Indexes:** `idx_vehicle_valuations_detail_id`

---

# 14. DOCUMENT TABLES

## 14.1 document_types — PK: id | code UNIQUE

| Column | Data Type | Description |
|--------|-----------|-------------|
| code | VARCHAR(30) | PAN_CARD, SALARY_SLIP, ITR, etc. |
| name | VARCHAR(100) | Display name |
| category | ENUM | KYC, INCOME, PROPERTY, VEHICLE, BUSINESS, AGREEMENT |
| allowed_mime_types | JSON | ["application/pdf","image/jpeg"] |
| max_size_mb | INT | Upload limit |
| requires_ocr | TINYINT(1) | OCR pipeline flag |
| is_active | TINYINT(1) | — |
| created_at | DATETIME(3) | — |

## 14.2 documents — PK: id | document_code UNIQUE

| Column | Data Type | Description |
|--------|-----------|-------------|
| owner_type | ENUM | CUSTOMER, PARTNER, APPLICATION |
| customer_id | CHAR(36) FK | Nullable |
| application_id | CHAR(36) FK | Nullable |
| partner_id | CHAR(36) FK | Nullable |
| document_type_id | CHAR(36) FK | → document_types |
| s3_key | VARCHAR(500) | S3 path |
| file_name | VARCHAR(255) | — |
| mime_type | VARCHAR(100) | — |
| file_size_bytes | BIGINT | — |
| checksum | VARCHAR(64) | SHA-256 |
| current_version | INT | Latest version |
| status | ENUM | UPLOADED, PENDING_VERIFICATION, VERIFIED, REJECTED, DEFICIENT |
| uploaded_by_id | CHAR(36) FK | → users |
| created_at / updated_at | DATETIME(3) | — |

**Indexes:** `idx_documents_application_type`, `idx_documents_customer_id`, `idx_documents_status`

## 14.3 document_versions — PK: id | (document_id, version_number) UNIQUE

| Column | Data Type | Description |
|--------|-----------|-------------|
| document_id | CHAR(36) FK | CASCADE delete |
| version_number | INT | 1, 2, 3... |
| s3_key | VARCHAR(500) | — |
| checksum | VARCHAR(64) | — |
| uploaded_by_id | CHAR(36) FK | — |
| upload_reason | ENUM | INITIAL, REUPLOAD, CORRECTION |
| created_at | DATETIME(3) | — |

## 14.4 document_requests — PK: id

| Column | Data Type | Description |
|--------|-----------|-------------|
| application_id | CHAR(36) FK | — |
| document_type_id | CHAR(36) FK | — |
| requested_by_id | CHAR(36) FK | → users |
| status | ENUM | PENDING, FULFILLED, WAIVED, EXPIRED |
| due_date | DATE | Nullable |
| reminder_count | INT | Default 0 |
| fulfilled_document_id | CHAR(36) FK | → documents |
| created_at | DATETIME(3) | — |

## 14.5 ocr_results — PK: id

| Column | Data Type | Description |
|--------|-----------|-------------|
| document_id | CHAR(36) FK | — |
| document_version_id | CHAR(36) FK | — |
| extracted_fields | JSON | Structured data |
| confidence_score | DECIMAL(5,2) | 0–100 |
| raw_response | JSON | Provider payload |
| provider | ENUM | INTERNAL, AWS_TEXTRACT, THIRD_PARTY |
| processed_at | DATETIME(3) | — |
| created_at | DATETIME(3) | — |

## 14.6 verification_results — PK: id

| Column | Data Type | Description |
|--------|-----------|-------------|
| document_id | CHAR(36) FK | — |
| verified_by_id | CHAR(36) FK | → users |
| result | ENUM | APPROVED, REJECTED, NEEDS_REVIEW |
| rejection_reason | VARCHAR(200) | Nullable |
| notes | TEXT | Nullable |
| verified_at | DATETIME(3) | — |
| created_at | DATETIME(3) | — |

## 14.7 document_deficiencies — PK: id

| Column | Data Type | Description |
|--------|-----------|-------------|
| application_id | CHAR(36) FK | — |
| document_request_id | CHAR(36) FK | Nullable |
| deficiency_type | ENUM | MISSING, ILLEGIBLE, EXPIRED, MISMATCH, INSUFFICIENT |
| description | TEXT | — |
| raised_by_id | CHAR(36) FK | — |
| status | ENUM | OPEN, RESOLVED, WAIVED |
| resolved_at | DATETIME(3) | Nullable |
| notification_sent | TINYINT(1) | — |
| created_at | DATETIME(3) | — |

---

# 15. KYC TABLES

## 15.1 kyc_profiles — PK: id | entity_type + entity_id UNIQUE

| Column | Data Type | Description |
|--------|-----------|-------------|
| entity_type | ENUM | CUSTOMER, PARTNER |
| entity_id | CHAR(36) | Polymorphic FK |
| pan_encrypted | TEXT | AES-256 |
| pan_masked | VARCHAR(10) | — |
| pan_verified | TINYINT(1) | — |
| pan_verified_at | DATETIME(3) | Nullable |
| aadhaar_encrypted | TEXT | — |
| aadhaar_masked | VARCHAR(12) | — |
| aadhaar_verified | TINYINT(1) | — |
| aadhaar_verified_at | DATETIME(3) | Nullable |
| ckyc_number | VARCHAR(20) | Nullable |
| photo_s3_key | VARCHAR(500) | Nullable |
| address_proof_status | ENUM | NOT_SUBMITTED, SUBMITTED, VERIFIED, REJECTED |
| overall_status | ENUM | NOT_STARTED, IN_PROGRESS, COMPLETE, REJECTED, EXPIRED |
| completion_pct | INT | 0–100 |
| expires_at | DATETIME(3) | Re-KYC due |
| last_reviewed_at | DATETIME(3) | Nullable |
| created_at / updated_at | DATETIME(3) | — |

## 15.2 pan_verifications — PK: id (append-only audit)

| Column | Data Type | Description |
|--------|-----------|-------------|
| kyc_profile_id | CHAR(36) FK | — |
| pan_encrypted | TEXT | — |
| pan_masked | VARCHAR(10) | — |
| name_on_pan | VARCHAR(200) | Nullable |
| verification_status | ENUM | PENDING, VERIFIED, FAILED, NAME_MISMATCH |
| verification_provider | ENUM | NSDL, KARZA, MANUAL |
| provider_reference | VARCHAR(100) | Nullable |
| verified_at | DATETIME(3) | Nullable |
| failure_reason | VARCHAR(200) | Nullable |
| created_at | DATETIME(3) | — |

## 15.3 aadhaar_verifications — PK: id (append-only)

| Column | Data Type | Description |
|--------|-----------|-------------|
| kyc_profile_id | CHAR(36) FK | — |
| aadhaar_encrypted | TEXT | — |
| aadhaar_masked | VARCHAR(12) | — |
| verification_method | ENUM | OTP, OFFLINE_XML, VIDEO_KYC |
| verification_status | ENUM | PENDING, VERIFIED, FAILED |
| provider_reference | VARCHAR(100) | Nullable |
| verified_at | DATETIME(3) | Nullable |
| created_at | DATETIME(3) | — |

## 15.4 kyc_audit_logs — PK: id (immutable)

| Column | Data Type | Description |
|--------|-----------|-------------|
| kyc_profile_id | CHAR(36) FK | — |
| action | ENUM | VERIFY, REJECT, EXPIRE, RE_VERIFY, OVERRIDE |
| performed_by_id | CHAR(36) FK | → users |
| previous_status | ENUM | Nullable |
| new_status | ENUM | — |
| reason | TEXT | Nullable |
| ip_address | VARCHAR(45) | Nullable |
| created_at | DATETIME(3) | — |

**Indexes:** `idx_kyc_audit_logs_profile_created` (kyc_profile_id, created_at)

---

# 16. REFERRAL TABLES

## 16.1 referral_sources — PK: id | code UNIQUE (APP_SHARE, WHATSAPP, SMS, QR_CODE, SOCIAL)

## 16.2 referrals — PK: id | referral_code indexed

| Column | Data Type | Description |
|--------|-----------|-------------|
| referral_code | VARCHAR(20) | Unique shareable |
| referrer_customer_id | CHAR(36) FK | Nullable |
| referrer_partner_id | CHAR(36) FK | Nullable |
| referee_customer_id | CHAR(36) FK | Nullable |
| referee_phone | VARCHAR(15) | Nullable |
| referee_name | VARCHAR(200) | Nullable |
| source_id | CHAR(36) FK | → referral_sources |
| status | ENUM | PENDING, REGISTERED, APPLIED, DISBURSED, EXPIRED, INVALID |
| converted_application_id | CHAR(36) FK | Nullable |
| converted_at | DATETIME(3) | Nullable |
| reward_eligible | TINYINT(1) | — |
| expires_at | DATETIME(3) | Nullable |
| created_at | DATETIME(3) | — |

**Indexes:** `idx_referrals_referrer_customer`, `idx_referrals_code`, `idx_referrals_status`

## 16.3 referral_rewards — PK: id

| Column | Data Type | Description |
|--------|-----------|-------------|
| referral_id | CHAR(36) FK | — |
| reward_type | ENUM | CASH, VOUCHER, POINTS |
| reward_amount | DECIMAL(15,2) | — |
| recipient_type | ENUM | REFERRER, REFEREE, BOTH |
| status | ENUM | PENDING, APPROVED, PAID, CANCELLED |
| trigger_event | ENUM | REGISTRATION, APPLICATION, DISBURSEMENT |
| approved_by_id | CHAR(36) FK | Nullable |
| created_at | DATETIME(3) | — |

## 16.4 referral_transactions — PK: id

| Column | Data Type | Description |
|--------|-----------|-------------|
| referral_reward_id | CHAR(36) FK | — |
| transaction_type | ENUM | CREDIT, DEBIT, REVERSAL |
| amount | DECIMAL(15,2) | — |
| payout_reference | VARCHAR(100) | UTR/voucher |
| status | ENUM | PENDING, COMPLETED, FAILED |
| processed_at | DATETIME(3) | Nullable |
| created_at | DATETIME(3) | — |

---

# 17. COMMISSION TABLES

## 17.1 commission_rules — PK: id

| Column | Data Type | Description |
|--------|-----------|-------------|
| name | VARCHAR(100) | — |
| product_id | CHAR(36) FK | Nullable = all products |
| partner_tier | ENUM | Nullable |
| rule_type | ENUM | PERCENTAGE, FLAT, SLAB, OVERRIDE |
| rule_definition | JSON | Rate slabs |
| effective_from / effective_to | DATE | — |
| is_active | TINYINT(1) | — |
| created_by | CHAR(36) FK | — |
| created_at | DATETIME(3) | — |

## 17.2 commission_ledger — PK: id | ledger_code UNIQUE | IMMUTABLE

| Column | Data Type | Description |
|--------|-----------|-------------|
| application_id | CHAR(36) FK | — |
| partner_id | CHAR(36) FK | — |
| commission_rule_id | CHAR(36) FK | — |
| disbursement_id | CHAR(36) FK | Nullable |
| base_amount | DECIMAL(15,2) | Disbursement amount |
| commission_rate | DECIMAL(5,2) | % |
| commission_amount | DECIMAL(15,2) | Gross |
| tds_amount | DECIMAL(15,2) | Nullable |
| net_amount | DECIMAL(15,2) | Payable |
| status | ENUM | PENDING, APPROVED, PAID, DISPUTED, CLAWED_BACK |
| calculated_at | DATETIME(3) | — |
| version | INT | Optimistic lock |
| created_at | DATETIME(3) | — |

**Indexes:** `idx_commission_ledger_partner_status`, `idx_commission_ledger_application_id`

## 17.3 commission_approvals — PK: id

| Column | Data Type | Description |
|--------|-----------|-------------|
| commission_ledger_id | CHAR(36) FK | — |
| approver_id | CHAR(36) FK | → employees |
| approval_level | INT | 1, 2 |
| decision | ENUM | APPROVED, REJECTED, ESCALATED |
| comments | TEXT | Nullable |
| decided_at | DATETIME(3) | — |
| created_at | DATETIME(3) | — |

## 17.4 commission_payments — PK: id | payout_batch_code UNIQUE

| Column | Data Type | Description |
|--------|-----------|-------------|
| partner_id | CHAR(36) FK | — |
| total_amount | DECIMAL(15,2) | — |
| tds_total | DECIMAL(15,2) | Nullable |
| net_payable | DECIMAL(15,2) | — |
| bank_account_id | CHAR(36) FK | → partner_bank_accounts |
| status | ENUM | DRAFT, PENDING_APPROVAL, APPROVED, PROCESSING, PAID, FAILED |
| utr_number | VARCHAR(50) | Nullable |
| paid_at | DATETIME(3) | Nullable |
| created_at | DATETIME(3) | — |

## 17.5 commission_payment_lines — PK: id | Junction

| Column | Data Type | Description |
|--------|-----------|-------------|
| payment_id | CHAR(36) FK | → commission_payments |
| ledger_id | CHAR(36) FK | → commission_ledger |
| amount | DECIMAL(15,2) | Line amount |
| created_at | DATETIME(3) | — |

## 17.6 commission_adjustments — PK: id | IMMUTABLE

| Column | Data Type | Description |
|--------|-----------|-------------|
| commission_ledger_id | CHAR(36) FK | — |
| adjustment_type | ENUM | BONUS, PENALTY, CORRECTION, OVERRIDE |
| amount | DECIMAL(15,2) | +/- |
| reason | TEXT | — |
| approved_by_id | CHAR(36) FK | — |
| created_at | DATETIME(3) | — |

## 17.7 commission_recoveries — PK: id

| Column | Data Type | Description |
|--------|-----------|-------------|
| commission_ledger_id | CHAR(36) FK | — |
| recovery_type | ENUM | CLAWBACK, CANCELLATION, FRAUD |
| recovery_amount | DECIMAL(15,2) | — |
| reason | TEXT | — |
| status | ENUM | PENDING, RECOVERED, WAIVED, DISPUTED |
| recovered_at | DATETIME(3) | Nullable |
| created_at | DATETIME(3) | — |

---

# 18. SUPPORT TABLES

## 18.1 tickets — PK: id | ticket_code UNIQUE

| Column | Data Type | Description |
|--------|-----------|-------------|
| customer_id | CHAR(36) FK | Nullable |
| partner_id | CHAR(36) FK | Nullable |
| application_id | CHAR(36) FK | Nullable |
| category | ENUM | APPLICATION, DOCUMENT, COMMISSION, TECHNICAL, COMPLAINT, OTHER |
| priority | ENUM | LOW, MEDIUM, HIGH, CRITICAL |
| subject | VARCHAR(200) | — |
| status | ENUM | OPEN, IN_PROGRESS, PENDING_CUSTOMER, RESOLVED, CLOSED, ESCALATED |
| channel | ENUM | APP, EMAIL, PHONE, WHATSAPP, CRM |
| sla_deadline | DATETIME(3) | Nullable |
| csat_score | INT | 1–5 Nullable |
| created_at / updated_at | DATETIME(3) | — |
| closed_at | DATETIME(3) | Nullable |

**Indexes:** `idx_tickets_status_priority`, `idx_tickets_customer_id`, `idx_tickets_sla`

## 18.2 ticket_messages — PK: id | FK ticket_id CASCADE

## 18.3 ticket_assignments — PK: id | FK ticket_id, assigned_to_id

## 18.4 ticket_escalations — PK: id | FK ticket_id, escalated_from/to

## 18.5 ticket_resolutions — PK: id | ticket_id UNIQUE FK

---

# 19. COMMUNICATION TABLES

## 19.1 notifications — PK: id | FK user_id | Indexes: user_id+is_read, created_at

## 19.2 emails — PK: id | status ENUM | Indexes: recipient, status, created_at

## 19.3 sms_logs — PK: id | template_code (DLT) | Indexes: phone, created_at

## 19.4 whatsapp_logs — PK: id | status includes READ | Indexes: phone, created_at

## 19.5 push_notifications — PK: id | FK user_id, device_id | Indexes: status

## 19.6 communication_logs — PK: id | Unified index across channels

| Column | Data Type | Description |
|--------|-----------|-------------|
| channel | ENUM | EMAIL, SMS, WHATSAPP, PUSH, IN_APP |
| channel_record_id | CHAR(36) | FK to channel table |
| user_id | CHAR(36) FK | Nullable |
| direction | ENUM | OUTBOUND, INBOUND |
| purpose | ENUM | OTP, TRANSACTIONAL, MARKETING, REMINDER |
| reference_type | VARCHAR(50) | Nullable |
| reference_id | CHAR(36) | Nullable |
| status | ENUM | — |
| created_at | DATETIME(3) | PARTITION key Phase 3 |

---

# 20. CAMPAIGN TABLES

## 20.1 campaigns — PK: id | campaign_code UNIQUE | status, dates, budget

## 20.2 campaign_audiences — PK: id | FK campaign_id | segment_definition JSON

## 20.3 campaign_activities — PK: id | FK campaign_id | activity_type, user_id, lead_id

## 20.4 campaign_results — PK: id | campaign_id UNIQUE | sent/delivered/open/click/conversion counts

---

# 21. AI TABLES

## 21.1 chat_sessions — PK: id | Indexes: customer_id+started_at, employee_id

## 21.2 chat_messages — PK: id | FK session_id CASCADE | Indexes: session_id+created_at

## 21.3 ai_recommendations — PK: id | FK customer_id, session_id

## 21.4 ai_insights — PK: id | entity_type+entity_id | Indexes: entity, valid_until

## 21.5 voice_sessions — PK: id | FK customer_id | Indexes: started_at

## 21.6 knowledge_sources — PK: id | index_status | FK product_id, lender_id

## 21.7 prompt_templates — PK: id | code UNIQUE | version INT

---

# 22. KNOWLEDGE BASE TABLES

## 22.1 knowledge_categories — PK: id | parent_id self-ref | slug UNIQUE

## 22.2 policies — PK: id | category_id FK | article_type=POLICY | status, audience, product_id

| Column | Data Type | Description |
|--------|-----------|-------------|
| title | VARCHAR(300) | — |
| slug | VARCHAR(300) UNIQUE | — |
| content | LONGTEXT | Markdown/HTML |
| product_id | CHAR(36) FK | Nullable |
| audience | ENUM | CUSTOMER, PARTNER, INTERNAL, ALL |
| status | ENUM | DRAFT, PUBLISHED, ARCHIVED |
| published_at | DATETIME(3) | Nullable |
| author_id | CHAR(36) FK | — |
| view_count | INT | — |
| content_version | INT | — |
| created_at / updated_at | DATETIME(3) | — |

## 22.3 faqs — PK: id | category_id FK | product_id optional

## 22.4 sops — PK: id | category_id FK | stage ENUM S01–S09

## 22.5 training_materials — PK: id | product_family_id FK | material_type, s3_key, is_mandatory

## 22.6 sales_scripts — PK: id | product_id FK | stage, script_type

---

# 23. ANALYTICS TABLES

## 23.1 kpis — PK: id | code UNIQUE | category, formula, unit, refresh_frequency

## 23.2 metrics — PK: id | kpi_id FK | scope_type, scope_id, period, actual_value, target_value

*Note: `metrics` table implements time-series KPI values (equivalent to metric_snapshots in ER doc).*

| Column | Data Type | Description |
|--------|-----------|-------------|
| kpi_id | CHAR(36) FK | → kpis |
| scope_type | ENUM | COMPANY, REGION, BRANCH, PARTNER, PRODUCT, EMPLOYEE |
| scope_id | CHAR(36) | Nullable polymorphic |
| period_type | ENUM | DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY |
| period_start / period_end | DATE | — |
| actual_value | DECIMAL(15,4) | — |
| target_value | DECIMAL(15,4) | Nullable |
| variance | DECIMAL(15,4) | Nullable |
| calculated_at | DATETIME(3) | — |
| created_at | DATETIME(3) | — |

**UQ:** `uq_metrics_kpi_scope_period` (kpi_id, scope_type, scope_id, period_type, period_start)

## 23.3 dashboards — PK: id | code UNIQUE | layout JSON, role_code

## 23.4 reports — PK: id | report_code UNIQUE | definition JSON, schedule JSON

## 23.5 analytics_snapshots — PK: id | Denormalized dashboard cache

| Column | Data Type | Description |
|--------|-----------|-------------|
| snapshot_type | ENUM | DAILY_OPS, MONTHLY_REVENUE, BRANCH_PERFORMANCE, EXECUTIVE |
| scope_type | ENUM | COMPANY, REGION, BRANCH |
| scope_id | CHAR(36) | Nullable |
| snapshot_date | DATE | — |
| data | JSON | Pre-computed metrics blob |
| created_at | DATETIME(3) | — |

**Indexes:** `idx_analytics_snapshots_type_date` (snapshot_type, snapshot_date)

---

# 24. AUDIT TABLES

## 24.1 audit_logs — PK: id | IMMUTABLE | PARTITION BY RANGE(created_at) monthly Phase 3

| Column | Data Type | Description |
|--------|-----------|-------------|
| actor_id | CHAR(36) FK | Nullable |
| actor_type | ENUM | USER, SYSTEM, API |
| action | ENUM | CREATE, UPDATE, DELETE, VIEW, EXPORT, APPROVE, REJECT |
| entity_type | VARCHAR(50) | Table name |
| entity_id | CHAR(36) | — |
| description | TEXT | Nullable |
| ip_address | VARCHAR(45) | Nullable |
| user_agent | VARCHAR(500) | Nullable |
| created_at | DATETIME(3) | — |

**Indexes:** `idx_audit_logs_entity` (entity_type, entity_id), `idx_audit_logs_actor_created` (actor_id, created_at)

## 24.2 access_logs — PK: id | pii_accessed flag | Retention 3 years

## 24.3 change_logs — PK: id | field-level old/new values | PII encrypted in values

## 24.4 approval_logs — PK: id | sod_validated flag | SoD compliance

## 24.5 security_events — PK: id | severity ENUM | resolved flag

---

# 25. SETTINGS TABLES

## 25.1 system_settings — PK: id | setting_key UNIQUE | setting_value JSON

## 25.2 product_settings — PK: id | (product_id, setting_key, effective_from) UNIQUE

## 25.3 notification_settings — PK: id | event_code UNIQUE | channels JSON

## 25.4 security_settings — PK: id | setting_key UNIQUE | Super Admin only

## 25.5 ai_settings — PK: id | setting_key UNIQUE | model config

---

# 26. MASTER DATA TABLES

## 26.1 countries

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| id | CHAR(36) | NO | PK |
| iso_code | CHAR(2) | NO | IN, US |
| name | VARCHAR(100) | NO | — |
| phone_code | VARCHAR(5) | NO | +91 |
| is_active | TINYINT(1) | NO | 1 |
| created_at | DATETIME(3) | NO | — |

**UQ:** `uq_countries_iso_code`

---

## 26.2 states

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| id | CHAR(36) | NO | PK |
| country_id | CHAR(36) | NO | FK → countries.id |
| code | VARCHAR(10) | NO | MH, DL |
| name | VARCHAR(100) | NO | — |
| is_active | TINYINT(1) | NO | 1 |
| created_at | DATETIME(3) | NO | — |

**UQ:** `uq_states_country_code` | **Indexes:** `idx_states_country_id`

---

## 26.3 cities

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| id | CHAR(36) | NO | PK |
| state_id | CHAR(36) | NO | FK → states.id |
| name | VARCHAR(100) | NO | — |
| tier | ENUM | YES | TIER_1, TIER_2, TIER_3 |
| is_active | TINYINT(1) | NO | 1 |
| created_at | DATETIME(3) | NO | — |

**Indexes:** `idx_cities_state_id`, `idx_cities_name`

---

## 26.4 occupations

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| id | CHAR(36) | NO | PK |
| code | VARCHAR(20) | NO | — |
| name | VARCHAR(100) | NO | — |
| category | ENUM | NO | SALARIED, SELF_EMPLOYED, PROFESSIONAL |
| is_active | TINYINT(1) | NO | 1 |
| created_at | DATETIME(3) | NO | — |

**UQ:** `uq_occupations_code`

---

## 26.5 industries

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| id | CHAR(36) | NO | PK |
| code | VARCHAR(20) | NO | — |
| name | VARCHAR(100) | NO | — |
| sector | VARCHAR(50) | YES | — |
| is_active | TINYINT(1) | NO | 1 |
| created_at | DATETIME(3) | NO | — |

**UQ:** `uq_industries_code`

---

## 26.6 banks

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| id | CHAR(36) | NO | PK |
| code | VARCHAR(20) | NO | — |
| name | VARCHAR(200) | NO | — |
| ifsc_prefix | VARCHAR(4) | YES | — |
| is_active | TINYINT(1) | NO | 1 |
| created_at | DATETIME(3) | NO | — |

**UQ:** `uq_banks_code`

---

## 26.7 lenders

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| id | CHAR(36) | NO | PK |
| code | VARCHAR(20) | NO | LND-HDFC |
| name | VARCHAR(200) | NO | — |
| lender_type | ENUM | NO | BANK, NBFC, HFC |
| contact_email | VARCHAR(255) | YES | — |
| integration_type | ENUM | NO | MANUAL, API, EMAIL |
| is_active | TINYINT(1) | NO | 1 |
| created_at | DATETIME(3) | NO | — |
| updated_at | DATETIME(3) | NO | — |

**UQ:** `uq_lenders_code`  
**Relationships:** 1:N lender_policies, bank_logins, sanctions

---

## 26.8 vehicle_manufacturers

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| id | CHAR(36) | NO | PK |
| code | VARCHAR(20) | NO | — |
| name | VARCHAR(100) | NO | Maruti, Hyundai |
| country_of_origin | VARCHAR(50) | YES | — |
| is_active | TINYINT(1) | NO | 1 |
| created_at | DATETIME(3) | NO | — |

**UQ:** `uq_vehicle_manufacturers_code`

---

## 26.9 vehicle_models

| Column | Data Type | Nullable | Description |
|--------|-----------|----------|-------------|
| id | CHAR(36) | NO | PK |
| manufacturer_id | CHAR(36) | NO | FK → vehicle_manufacturers.id |
| code | VARCHAR(20) | NO | — |
| name | VARCHAR(100) | NO | Swift, Creta |
| category | ENUM | NO | HATCHBACK, SEDAN, SUV, etc. |
| fuel_types | JSON | YES | ["PETROL","CNG"] |
| is_electric | TINYINT(1) | NO | 0 |
| ex_showroom_price_min | DECIMAL(15,2) | YES | — |
| ex_showroom_price_max | DECIMAL(15,2) | YES | — |
| is_active | TINYINT(1) | NO | 1 |
| created_at | DATETIME(3) | NO | — |

**UQ:** `uq_vehicle_models_mfr_code` (manufacturer_id, code)  
**Indexes:** `idx_vehicle_models_manufacturer_id`

---

# 27. RELATIONSHIP MATRIX

## 27.1 One-to-One

| Parent Table | Child Table | FK Column | Constraint |
|--------------|-------------|-----------|------------|
| users | customers | customers.user_id | UNIQUE |
| users | partners | partners.user_id | UNIQUE |
| users | employees | employees.user_id | UNIQUE |
| customers | customer_profiles | customer_profiles.customer_id | UNIQUE |
| customers | customer_preferences | customer_preferences.customer_id | UNIQUE |
| partners | partner_profiles | partner_profiles.partner_id | UNIQUE |
| partners | partner_kyc | partner_kyc.partner_id | UNIQUE |
| applications | application_status | application_status.application_id | UNIQUE |
| applications | sanctions | sanctions.application_id | UNIQUE |
| applications | closures | closures.application_id | UNIQUE |
| applications | home_loan_details | home_loan_details.application_id | UNIQUE |
| applications | lap_details | lap_details.application_id | UNIQUE |
| applications | business_loan_details | business_loan_details.application_id | UNIQUE |
| applications | auto_loan_details | auto_loan_details.application_id | UNIQUE |
| home_loan_details | home_loan_bt_details | home_loan_bt_details.home_loan_detail_id | UNIQUE |
| home_loan_details | home_loan_topup_details | home_loan_topup_details.home_loan_detail_id | UNIQUE |
| lap_details | lap_bt_details | lap_bt_details.lap_detail_id | UNIQUE |
| lap_details | lap_topup_details | lap_topup_details.lap_detail_id | UNIQUE |
| business_loan_details | business_gst_profiles | business_gst_profiles.business_loan_detail_id | UNIQUE |
| auto_loan_details | vehicle_profiles | vehicle_profiles.auto_loan_detail_id | UNIQUE |
| leads | applications | applications.lead_id | Optional 1:1 |
| tickets | ticket_resolutions | ticket_resolutions.ticket_id | UNIQUE |
| campaigns | campaign_results | campaign_results.campaign_id | UNIQUE |

## 27.2 One-to-Many (Critical Paths)

| Parent | Child | FK |
|--------|-------|-----|
| regions | branches | branches.region_id |
| branches | employees, leads, applications, partners | branch_id |
| customers | applications, leads, documents, referrals | customer_id |
| partners | leads, commission_ledger | partner_id |
| product_families | products | products.family_id |
| products | applications, eligibility_rules, document_rules | product_id |
| leads | lead_scores, lead_assignments, lead_activities | lead_id |
| applications | application_timeline, eligibility_results, bank_logins, documents, commission_ledger | application_id |
| documents | document_versions, ocr_results, verification_results | document_id |
| commission_payments | commission_payment_lines | payment_id |
| chat_sessions | chat_messages | session_id |
| kpis | metrics | kpi_id |

## 27.3 Many-to-Many

| Table A | Table B | Junction | Notes |
|---------|---------|----------|-------|
| users | roles | user_roles | scope_branch_id, scope_region_id |
| roles | permissions | role_permissions | granted flag |
| commission_payments | commission_ledger | commission_payment_lines | Payout lines |
| products | lenders | lender_policies | Attributed M:N |
| dashboards | kpis | dashboards.layout JSON | Logical M:N |

---

# 28. INDEXING STRATEGY

## 28.1 Primary Indexes

All tables: clustered PK on `id` CHAR(36).

## 28.2 Foreign Key Indexes

**Rule:** Every FK column has a dedicated B-tree index. MySQL InnoDB auto-indexes FK columns.

## 28.3 Search Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| customers | `idx_customers_full_name` | Name search |
| customers | `idx_customers_deleted_at` | Active filter |
| leads | `idx_leads_prospect_phone` | Dedup/search |
| applications | `idx_applications_code` | Code lookup (covered by UQ) |
| partners | `idx_partners_referral_code` | Referral lookup |
| users | `uq_users_phone` | Login lookup |

**Phase 2:** FULLTEXT on `customers.full_name`, `leads.prospect_name`.

## 28.4 Reporting Indexes

| Table | Composite Index | Report |
|-------|----------------|--------|
| leads | (branch_id, status, created_at) | Branch funnel |
| applications | (branch_id, current_stage, created_at) | Ops pipeline |
| disbursements | (disbursement_date, lender_id) | Revenue by lender |
| commission_ledger | (partner_id, status, calculated_at) | Partner earnings |
| metrics | (kpi_id, scope_type, period_start) | KPI trends |

## 28.5 Analytics Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| analytics_snapshots | (snapshot_type, snapshot_date) | Dashboard load |
| metrics | (scope_type, scope_id, period_start) | Scoped KPI |
| partner_performance | (period_start, period_end) | Leaderboard |
| campaign_results | (campaign_id) | Campaign ROI |

## 28.6 Queue Indexes (Real-time Operations)

| Queue | Index | SLA |
|-------|-------|-----|
| leads | (assigned_to via lead_assignments), (sla_deadline) | Sales |
| applications | (assigned_credit_id, status) | Credit |
| applications | (assigned_ops_id, current_stage) | Ops |
| documents | (status, created_at) WHERE PENDING | Verification |
| tickets | (status, priority, sla_deadline) | Support |
| commission_ledger | (status) WHERE PENDING | Finance |

---

# 29. AUDIT STRATEGY

## 29.1 Standard Audit Columns

| Column | Type | Tables | Rule |
|--------|------|--------|------|
| created_at | DATETIME(3) | **All** | NOT NULL, immutable after insert |
| updated_at | DATETIME(3) | Mutable | Auto-updated |
| created_by | CHAR(36) | Business entities | FK → users; NULL = system |
| updated_by | CHAR(36) | Business entities | FK → users |
| deleted_at | DATETIME(3) | Soft-delete tables | NULL = active |
| deleted_by | CHAR(36) | Soft-delete tables | FK → users |
| version | INT | leads, applications, commission_ledger | Increment on update |

## 29.2 Immutable Tables (No updated_at/deleted_at)

`audit_logs`, `access_logs`, `change_logs`, `approval_logs`, `security_events`, `login_history`, `otp_verifications`, `application_timeline`, `lead_status_history`, `kyc_audit_logs`, `commission_ledger` (adjust via child tables), `commission_adjustments`, `pan_verifications`, `aadhaar_verifications`

## 29.3 Change Tracking

| Mechanism | Scope |
|-----------|-------|
| `change_logs` | Field-level before/after on PII and financial fields |
| `application_timeline` | LOS stage transitions |
| `lead_status_history` | LMS status transitions |
| `kyc_audit_logs` | KYC state changes |
| `document_versions` | Document re-uploads |
| Prisma middleware | Auto-populate created_by/updated_by from JWT |

## 29.4 Version Column Usage

```
UPDATE applications SET ..., version = version + 1 WHERE id = ? AND version = ?
-- If affected rows = 0 → optimistic lock conflict → retry
```

---

# 30. SOFT DELETE STRATEGY

## 30.1 Soft-Delete Tables

| Table | Reason |
|-------|--------|
| users | Account recovery, audit |
| customers | Regulatory retention |
| partners | Commission history linkage |
| employees | Audit trail |
| leads | Sales history |
| applications | Compliance (use status=CLOSED preferred; soft delete for errors) |

## 30.2 Implementation Standards

| Rule | Detail |
|------|--------|
| Query filter | All reads: `WHERE deleted_at IS NULL` via Prisma middleware |
| Delete operation | `UPDATE SET deleted_at = NOW(), deleted_by = ?` — never `DELETE` |
| Unique constraints | Phone/email unique only among active: application-level check or `uq_users_phone_active` partial index (Phase 2) |
| Cascade | Soft-deleting customer does NOT soft-delete applications — business rule in service layer |
| Restore | Admin API clears `deleted_at` with audit log entry |
| Hard delete | Prohibited on production for business tables; permitted on sessions, OTP after retention |

## 30.3 Non-Soft-Delete Tables

All financial, audit, log, and communication tables — use status enums and archival instead.

---

# 31. DATA RETENTION STRATEGY

| Data Category | Active DB Retention | Post-Retention Action |
|---------------|--------------------|-----------------------|
| **Documents (S3)** | 8 years | Glacier at year 3; metadata retained |
| **Document metadata** | 8 years | Archive row; S3 key preserved |
| **Applications (closed)** | 3 years online | Summary snapshot; detail archived |
| **Leads (lost/expired)** | 1 year | Anonymize PII; soft delete |
| **KYC records** | 8 years post-closure | Regulatory hold |
| **Commission records** | 8 years | Never delete; archive to cold storage |
| **Audit logs** | 7 years | Partition drop or export |
| **Access logs** | 3 years | Archive |
| **Notifications** | 90 days in-app | Purge read notifications |
| **sms_logs / whatsapp_logs** | 1 year | Archive |
| **emails** | 1 year | Archive |
| **push_notifications** | 90 days | Purge |
| **communication_logs** | 1 year | Partition archive |
| **Campaign data** | 2 years | Archive campaign_activities |
| **chat_messages** | 1 year | Delete; retain session metrics |
| **voice_sessions** | 1 year | Delete transcript S3; retain summary |
| **analytics_snapshots** | 5 years daily; forever monthly | Aggregate older |
| **metrics** | 3 years granular | Roll up to quarterly |
| **sessions / OTP** | 90 days | Hard delete |
| **login_history** | 1 year | Archive |

---

# 32. ARCHIVAL STRATEGY

## 32.1 Operational Data Archival

| Trigger | Tables | Action |
|---------|--------|--------|
| Application CLOSED + 3 years | applications, application_timeline, eligibility_results | Move to `archive_applications` (same schema) or export to S3 parquet |
| Lead LOST/EXPIRED + 1 year | leads, lead_activities | Anonymize; soft delete |
| Partner TERMINATED + 1 year | partners | Soft delete; retain commission_ledger |

## 32.2 Historical Data Archival

| Data | Method | Storage |
|------|--------|---------|
| Closed applications | ETL job monthly | S3 parquet + summary row in DB |
| Commission history | No archival | Full history in DB (8 years) |
| Metrics (old) | Roll-up job | Daily → monthly aggregation |
| Analytics snapshots | Retain monthly only after 1 year | DB |

## 32.3 Audit Data Archival

| Table | Strategy |
|-------|----------|
| audit_logs | RANGE partition by month; drop partitions > 7 years after export |
| access_logs | Partition; 3-year retention |
| change_logs | Partition; 7-year retention |
| security_events | 3-year retention; critical events retained 7 years |

**Export before drop:** All partitions exported to S3 Glacier before DROP PARTITION.

---

# 33. FUTURE EXPANSION TABLES

| Product | Table | Key Columns | FK |
|---------|-------|-------------|-----|
| **Personal Loan** | personal_loan_details | loan_purpose, existing_emi_obligation, unsecured_flag | application_id UNIQUE |
| **Insurance** | insurance_details | policy_type, sum_assured, premium, nominee_json | application_id UNIQUE |
| **Insurance** | insurance_policies | policy_number, insurer_id, status, renewal_date | customer_id |
| **Credit Card** | credit_card_details | card_type, existing_cards_count, requested_limit | application_id UNIQUE |
| **Mutual Fund** | mf_application_details | risk_profile, fund_id, sip_amount, sip_date | application_id UNIQUE |
| **Mutual Fund** | mf_holdings | fund_id, units, current_value | customer_id |
| **FD** | fd_booking_details | deposit_amount, tenure_months, interest_payout, bank_id | application_id UNIQUE |
| **Gold Loan** | gold_loan_details | gold_weight_grams, purity, estimated_value | application_id UNIQUE |
| **Gold Loan** | gold_pledge_items | item_type, weight, purity, description | gold_loan_detail_id |
| **Wealth Mgmt** | wealth_advisory_details | portfolio_value, advisory_type, risk_tolerance | application_id UNIQUE |
| **Wealth Mgmt** | wealth_portfolios | total_value, last_reviewed_at | customer_id |
| **Video KYC** | video_kyc_sessions | session_recording_s3_key, agent_id, result | kyc_profile_id |
| **eSign** | esign_sessions | document_id, sign_provider, signed_at, ip_address | document_id |
| **Lender Portal** | lender_users | lender_id, user_id, role | UNIQUE(lender_id, user_id) |
| **Lender Portal** | lender_submissions | bank_login_id, submission_payload, response | bank_login_id |
| **Loyalty** | loyalty_points | customer_id, balance | customer_id UNIQUE |
| **Loyalty** | loyalty_transactions | points, transaction_type, reference | loyalty_points_id |
| **Partner LMS** | partner_certifications | partner_id, training_material_id, passed_at | partner_id, material_id |

**Integration:** All `*_details` tables link 1:1 to `applications` — zero core schema changes.

---

# 34. DATABASE CAPACITY PLANNING

## 34.1 Year 1 Projections

| Metric | Estimate | Assumption |
|--------|----------|------------|
| Registered users | 50,000 | Customer + partner + employee |
| Leads | 150,000 | 3× application rate |
| Applications | 50,000 | — |
| Documents | 500,000 | ~10 per application |
| Commission ledger rows | 40,000 | ~80% disburse |
| Audit log rows | 5,000,000 | ~100 events/application |
| Chat messages | 1,000,000 | 20% AI adoption |
| SMS/WhatsApp logs | 2,000,000 | — |
| **Total DB rows** | ~10M | — |
| **DB size (data)** | ~25 GB | Avg row sizes |
| **Index size** | ~15 GB | ~60% of data |
| **S3 documents** | ~500 GB | Avg 1 MB/doc |
| **Total storage** | ~540 GB | DB + S3 |

**Recommended:** AWS RDS MySQL db.r6g.large (2 vCPU, 16 GB RAM), 100 GB gp3 storage (auto-scaling).

## 34.2 Year 3 Projections

| Metric | Estimate |
|--------|----------|
| Users | 500,000 |
| Applications (cumulative) | 750,000 |
| Annual applications | 250,000 |
| Total DB rows | ~150M |
| DB size | ~200 GB data + ~120 GB indexes |
| S3 | ~5 TB |
| **Strategy** | Read replica, Redis cache, partition audit_logs + communication_logs |

**Recommended:** db.r6g.xlarge primary + read replica, RDS Proxy, ElastiCache Redis.

## 34.3 Year 5 Projections

| Metric | Estimate |
|--------|----------|
| Users | 2,000,000+ |
| Applications (cumulative) | 4,000,000+ |
| Total DB rows | ~800M |
| DB size | ~900 GB data + ~500 GB indexes |
| S3 | ~25 TB |
| **Strategy** | Partitioned log tables, archival pipeline, analytics warehouse (Redshift/BigQuery), consider BINARY(16) UUIDs |

**Recommended:** db.r6g.2xlarge primary, 2 read replicas, RDS Proxy, dedicated analytics EC2/worker.

## 34.4 Growth Monitoring Thresholds

| Metric | Warning | Action |
|--------|---------|--------|
| Table row count | > 10M per operational table | Index review, archival |
| audit_logs size | > 50 GB | Enable partitioning |
| Query p95 latency | > 500ms | Read replica, query optimization |
| Connection pool utilization | > 80% | RDS Proxy, scale instance |
| Storage | > 80% allocated | Auto-scale or upgrade |

---

# APPENDIX A: COMPLETE TABLE INDEX

| # | Module | Table | Phase |
|---|--------|-------|-------|
| 1–10 | Identity | users, roles, permissions, role_permissions, user_roles, sessions, refresh_tokens, otp_verifications, devices, login_history | 1 |
| 11–17 | Customer | customers, customer_profiles, customer_addresses, customer_employment, customer_income, customer_preferences, customer_consents | 1 |
| 18–25 | Partner | partner_types, partners, partner_profiles, partner_kyc, partner_bank_accounts, partner_documents, partner_performance, partner_agreements | 1 |
| 26–30 | Organization | regions, branches, departments, employees, employee_reporting | 1 |
| 31–36 | Products | product_families, products, product_variants, eligibility_rules, document_rules, lender_policies | 1 |
| 37–44 | LMS | lead_sources, leads, lead_scores, lead_assignments, lead_status_history, lead_activities, lead_notes, lead_followups | 1 |
| 45–53 | LOS | applications, application_status, application_timeline, eligibility_results, bank_logins, credit_reviews, sanctions, disbursements, closures | 1 |
| 54–56 | HL | home_loan_details, home_loan_bt_details, home_loan_topup_details | 1 |
| 57–59 | LAP | lap_details, lap_bt_details, lap_topup_details | 1 |
| 60–62 | BL | business_loan_details, business_financials, business_gst_profiles | 1 |
| 63–65 | AL | auto_loan_details, vehicle_profiles, vehicle_valuations | 1 |
| 66–72 | Documents | document_types, documents, document_versions, document_requests, ocr_results, verification_results, document_deficiencies | 1 |
| 73–76 | KYC | kyc_profiles, pan_verifications, aadhaar_verifications, kyc_audit_logs | 1 |
| 77–80 | Referrals | referral_sources, referrals, referral_rewards, referral_transactions | 1 |
| 81–87 | Commissions | commission_rules, commission_ledger, commission_approvals, commission_payments, commission_payment_lines, commission_adjustments, commission_recoveries | 1 |
| 88–92 | Support | tickets, ticket_messages, ticket_assignments, ticket_escalations, ticket_resolutions | 1 |
| 93–98 | Communications | notifications, emails, sms_logs, whatsapp_logs, push_notifications, communication_logs | 1 |
| 99–102 | Campaigns | campaigns, campaign_audiences, campaign_activities, campaign_results | 1 |
| 103–109 | AI | chat_sessions, chat_messages, ai_recommendations, ai_insights, voice_sessions, knowledge_sources, prompt_templates | 1 |
| 110–115 | Knowledge | knowledge_categories, policies, faqs, sops, training_materials, sales_scripts | 1 |
| 116–120 | Analytics | kpis, metrics, dashboards, reports, analytics_snapshots | 1 |
| 121–125 | Audit | audit_logs, access_logs, change_logs, approval_logs, security_events | 1 |
| 126–130 | Settings | system_settings, product_settings, notification_settings, security_settings, ai_settings | 1 |
| 131–139 | Master Data | countries, states, cities, occupations, industries, banks, lenders, vehicle_manufacturers, vehicle_models | 1 |
| 140–157 | Future | personal_loan_details, insurance_details, insurance_policies, credit_card_details, mf_application_details, mf_holdings, fd_booking_details, gold_loan_details, gold_pledge_items, wealth_advisory_details, wealth_portfolios, video_kyc_sessions, esign_sessions, lender_users, lender_submissions, loyalty_points, loyalty_transactions, partner_certifications | 2–4 |

**Phase 1 Total: 139 tables** (including master data and commission_payment_lines junction)

---

# APPENDIX B: PRISMA SCHEMA FILE STRUCTURE

```
prisma/
├── schema.prisma          # Main schema with datasource + generator
├── migrations/            # prisma migrate output
└── seeds/
    ├── roles.ts
    ├── permissions.ts
    ├── product-catalog.ts
    ├── master-data.ts
    └── system-settings.ts

# Recommended schema.prisma organization (comments):
// ── Identity & Access ──
// ── Master Data ──
// ── Organization ──
// ── Customer ──
// ── Partner ──
// ── Products ──
// ── LMS ──
// ── LOS ──
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

---

# APPENDIX C: MYSQL SERVER CONFIGURATION (REFERENCE)

| Parameter | Recommended Value | Purpose |
|-----------|-------------------|---------|
| innodb_buffer_pool_size | 70% of RAM | Cache |
| innodb_log_file_size | 1 GB | Write performance |
| max_connections | 200 | With RDS Proxy |
| character-set-server | utf8mb4 | Unicode |
| collation-server | utf8mb4_unicode_ci | — |
| sql_mode | STRICT_TRANS_TABLES,NO_ZERO_DATE | Data integrity |
| time_zone | +00:00 | UTC storage |
| binlog_format | ROW | Replication/audit |
| innodb_file_per_table | ON | Table management |

---

# APPENDIX D: SEED DATA REQUIREMENTS

| Table | Seed Count | Source |
|-------|-----------|--------|
| roles | 22 | KUBERONE_RBAC_AND_PERMISSIONS.md |
| permissions | ~200 | RBAC matrix expansion |
| role_permissions | ~2000 | RBAC matrix |
| product_families | 4 | Loan Products doc |
| products | 20 | Loan Products doc |
| product_variants | 20 | Loan Products doc |
| lead_sources | 8 | IA doc |
| document_types | 40+ | Loan Products doc |
| partner_types | 4 | DSA, REFERRAL, BUILDER, CA |
| countries | 1 (India) | Master data |
| states | 36 | Indian states/UTs |
| lenders | 10+ (Phase 1) | Business onboarding |
| system_settings | 20+ | Section 25 seed reference |
| notification_settings | 30+ | Event catalog |

---

# APPENDIX E: DOCUMENT APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Chief Database Architect | | | |
| CTO | | | |
| Head of Backend Engineering | | | |
| DBA Lead | | | |
| Compliance Officer | | | |
| CEO / Managing Director | | | |

---

# APPENDIX F: REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | Kuber Finserve Data Architecture Team | Initial Database Schema Specification |

---

# APPENDIX G: RELATED DOCUMENT INDEX

| Document | Relationship |
|----------|-------------|
| [KUBERONE_ER_DIAGRAM_AND_DATA_MODEL.md](./KUBERONE_ER_DIAGRAM_AND_DATA_MODEL.md) | Logical entity model — parent document |
| [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md) | Deployment, backup, Prisma usage |
| [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) | Roles, permissions seed data |
| [KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md](./KUBERONE_LOAN_PRODUCTS_AND_SERVICES.md) | Product catalog seed, document rules |
| [KUBERONE_SCREEN_PLANNING_AND_IA.md](./KUBERONE_SCREEN_PLANNING_AND_IA.md) | Screen-to-table mapping |

---

**© 2026 Kuber Finserve. Confidential — For Internal, Database, Backend, and DBA Use.**

*This document is the authoritative database schema specification for KuberOne. Prisma schema and MySQL migrations must conform to table definitions, relationships, indexes, and constraints specified herein.*
