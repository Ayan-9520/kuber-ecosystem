# KuberOne
## API Specification Document

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise REST API Specification  
**Classification:** Backend Ready | Frontend Ready | Node.js Ready | Future Scale Ready  
**Version:** 1.0  
**Date:** June 2026  
**Base URL:** `https://api.kuberone.kuberfinserve.com/api/v1`  
**Tech Stack:** Node.js · Express.js · TypeScript · MySQL · Prisma · JWT · OTP  
**Related Documents:**
- [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md)
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md)
- [KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md](./KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md)
- [KUBERONE_ER_DIAGRAM_AND_DATA_MODEL.md](./KUBERONE_ER_DIAGRAM_AND_DATA_MODEL.md)
- [KUBERONE_SCREEN_PLANNING_AND_IA.md](./KUBERONE_SCREEN_PLANNING_AND_IA.md)
- [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Complete REST API catalog — endpoints, auth, validation, RBAC, errors |
| **Audience** | Backend, Frontend, Mobile, QA, Security, Integration Partners |
| **Status** | Authoritative API Specification |
| **Out of Scope** | Source code, OpenAPI YAML file (derived from this doc) |

---

## API Statistics

| Metric | Count |
|--------|-------|
| **API domains** | 18 |
| **Total endpoints** | **324** |
| **Phase 1 endpoints** | **312** |
| **Customer App endpoints** | 98 |
| **DSA App endpoints** | 52 |
| **CRM endpoints** | 128 |
| **Management endpoints** | 18 |
| **Admin endpoints** | 42 |
| **Public/Unauthenticated** | 14 |
| **Future Lender Portal** | 6 (Phase 3) |
| **Webhooks** | 5 |

---

## API ID Convention

| Format | Example |
|--------|---------|
| `API-{DOMAIN}-{NNN}` | `API-AUTH-001` |
| Domain codes | AUTH, USR, CUS, DSA, REF, EMP, BRN, PRD, ELG, EMI, LED, LMS, LOS, APP, DOC, OCR, KYC, AI, VOC, CHT, NTF, WA, CMP, COM, ANA, DSH, SUP, TKT, KB, SET, AUD, ADM, MGT, PUB, LEN |

---

## Standard Error Codes (Global)

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Zod/schema validation failed |
| 401 | `AUTH_UNAUTHORIZED` | Missing/invalid token |
| 401 | `AUTH_TOKEN_EXPIRED` | Access token expired |
| 403 | `RBAC_FORBIDDEN` | Permission denied |
| 403 | `RBAC_SCOPE_VIOLATION` | Record outside scope |
| 403 | `SOD_VIOLATION` | Segregation of duties |
| 404 | `RESOURCE_NOT_FOUND` | Not found or not visible |
| 409 | `RESOURCE_CONFLICT` | Duplicate, invalid transition |
| 422 | `BUSINESS_RULE_VIOLATION` | Domain rule failed |
| 429 | `RATE_LIMIT_EXCEEDED` | Throttled |
| 500 | `INTERNAL_ERROR` | Server error |

---

# EXECUTIVE SUMMARY

KuberOne exposes a **versioned REST API** (`/api/v1`) consumed by Customer App (React Native), DSA App (React Native), CRM Admin Panel (React.js), and Management Dashboards. All endpoints enforce **JWT authentication** (except public/auth), **RBAC middleware**, **Zod validation**, and **standardized JSON envelopes**.

| Principle | Implementation |
|-----------|----------------|
| **RESTful design** | Resources as nouns; HTTP verbs for actions |
| **Stateless** | JWT + refresh token; no server-side session for API |
| **Scope-safe** | branchId/regionId from JWT — never client-overridable |
| **Idempotent writes** | `Idempotency-Key` header on financial mutations |
| **Document upload** | Presigned S3 URLs — bytes never through API |
| **AI isolation** | Dedicated `/ai` and `/voice` domains with rate limits |
| **Audit** | All mutations logged; PII reads enhanced-logged |

**Board Recommendation:** Approve this API specification as the contract for all KuberOne client and integration development.

---

# GLOBAL API STANDARDS

## API Naming Standards

| Rule | Standard | Example |
|------|----------|---------|
| Base path | `/api/v{version}` | `/api/v1` |
| Resource path | kebab-case plural nouns | `/applications`, `/lead-assignments` |
| Nested resources | Parent → child | `/applications/{id}/documents` |
| Actions (non-CRUD) | POST verb + action sub-path | `POST /applications/{id}/submit` |
| No verbs in paths | Except approved actions | ✓ `/leads/{id}/convert` ✗ `/getLeads` |
| IDs in path | UUID only | `/customers/550e8400-e29b-41d4-a716-446655440000` |
| Codes in query | Business codes as filter | `?productCode=HL-01` |

## Versioning Standards

| Strategy | Rule |
|----------|------|
| URL versioning | `/api/v1` — current; `/api/v2` for breaking changes |
| Deprecation | `Sunset` header + 6-month notice |
| Non-breaking additions | Same version — new optional fields |
| Mobile min version | `X-App-Version` header checked for critical APIs |

## Pagination Standards

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | 1 | — | 1-indexed page |
| `pageSize` | integer | 20 | 100 | Items per page |
| `cursor` | string | — | — | Phase 2 cursor pagination |

**Response meta:**
```json
{
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering Standards

| Pattern | Example | Notes |
|---------|---------|-------|
| Equality | `?status=QUALIFIED` | Enum values UPPER_SNAKE |
| Multiple | `?status=NEW,CONTACTED` | Comma-separated OR |
| Date range | `?from=2026-01-01&to=2026-06-30` | ISO 8601 date |
| FK filter | `?productId={uuid}` | UUID |
| Scope | Auto-applied | branchId/regionId from JWT — **not** in query |
| Boolean | `?isActive=true` | — |

## Search Standards

| Parameter | Min Length | Scope |
|-----------|------------|-------|
| `q` | 3 chars | Full-text name/mobile/code search |
| `phone` | 10 digits | Last 4 or full (role-gated) |
| `code` | Exact | Business codes KFL-, KFA- |

## Sorting Standards

| Parameter | Values | Default |
|-----------|--------|---------|
| `sort` | Field name | `createdAt` |
| `order` | `asc`, `desc` | `desc` |
| Multi-sort | Phase 2 | `sort=status,-createdAt` |

## Security Standards

| Control | Standard |
|---------|----------|
| Transport | TLS 1.3 only |
| Authentication | `Authorization: Bearer {accessToken}` |
| Refresh | HttpOnly cookie (CRM web) OR body (mobile) |
| MFA | Required for CRM employees |
| CORS | Whitelist: app domains only |
| CSRF | SameSite cookies + CSRF token (CRM) |
| Rate limiting | Per-user + per-IP (see per-endpoint) |
| Idempotency | `Idempotency-Key: {uuid}` on POST financial ops |
| PII | Masked in response per role |
| Input validation | Zod schemas — reject unknown fields |

## Response Standards

**Success envelope:**
```json
{
  "success": true,
  "data": {},
  "meta": {},
  "requestId": "uuid-v4"
}
```

**List response:** `data` is array; `meta` contains pagination.

**Single resource:** `data` is object.

**Action response:** `data` includes `message` + affected resource.

## Error Standards

```json
{
  "success": false,
  "error": {
    "code": "LEAD_001_DUPLICATE_PHONE",
    "message": "A lead with this phone already exists in your branch",
    "details": [{ "field": "prospectPhone", "message": "..." }]
  },
  "requestId": "uuid-v4"
}
```

## File Upload Standards

| Step | Endpoint | Method |
|------|----------|--------|
| 1. Request presign | `/documents/presign` | POST |
| 2. Upload to S3 | Presigned PUT URL | PUT (direct to S3) |
| 3. Confirm upload | `/documents/confirm` | POST |

| Rule | Standard |
|------|----------|
| Max size | 10 MB (configurable per document type) |
| Allowed MIME | From `document_types.allowed_mime_types` |
| Checksum | SHA-256 required on confirm |
| Virus scan | Phase 2 — async before VERIFIED status |

---

# API CLIENT GROUPS

## Customer App APIs

| Domain Prefix | Endpoints | Auth |
|---------------|-----------|------|
| `/auth` | OTP login, refresh, logout | Partial |
| `/public` | Products, EMI calculator | None |
| `/customer` | Profile, KYC, preferences | Customer JWT |
| `/applications` | Apply, track, withdraw | Customer JWT |
| `/documents` | Upload, status | Customer JWT |
| `/eligibility` | Check eligibility | Customer JWT |
| `/emi` | Calculators | Customer/Public |
| `/ai` | Advisor chat | Customer JWT |
| `/voice` | Voice sessions | Customer JWT |
| `/referral` | Share, rewards | Customer JWT |
| `/notifications` | In-app notifications | Customer JWT |
| `/support` | Tickets | Customer JWT |
| `/knowledge` | FAQs, articles | Customer JWT |

## DSA App APIs

| Domain Prefix | Endpoints | Auth |
|---------------|-----------|------|
| `/auth` | Partner login | Partial |
| `/dsa` | Dashboard, profile, KYC | DSA JWT |
| `/dsa/leads` | Submit, track leads | DSA JWT |
| `/dsa/commissions` | Earnings, payouts | DSA JWT |
| `/dsa/performance` | Stats, leaderboard | DSA JWT |
| `/documents` | Partner docs | DSA JWT |
| `/knowledge` | Training, scripts | DSA JWT |
| `/notifications` | Push history | DSA JWT |
| `/support` | Partner tickets | DSA JWT |

## CRM APIs

| Domain Prefix | Endpoints | Auth |
|---------------|-----------|------|
| `/auth` | Employee login + MFA | Partial |
| `/crm` | Leads, customers, applications | Employee JWT |
| `/credit` | Credit queue, verification | Credit role |
| `/ops` | Processing, lender submit | Ops role |
| `/branch` | Branch dashboard | Branch Mgr+ |
| `/regional` | Regional dashboard | Regional Mgr+ |
| `/support` | Ticket console | Support role |
| `/compliance` | Audit, fraud | Compliance role |
| `/ai` | Copilot | Sales, Branch |
| `/analytics` | Reports | Managers |
| `/admin` | Config (limited) | Admin |

## Management APIs

| Domain Prefix | Endpoints | Auth |
|---------------|-----------|------|
| `/management` | CEO, Director, Head dashboards | Management JWT |
| `/analytics` | Executive reports | Management JWT |
| `/management/board-pack` | Board reports | CEO, Finance |

## Admin APIs

| Domain Prefix | Endpoints | Auth |
|---------------|-----------|------|
| `/admin` | Users, roles, products, lenders | Admin JWT |
| `/admin/campaigns` | Campaign management | Admin |
| `/admin/settings` | System config | Admin/Super Admin |
| `/admin/knowledge` | CMS | Admin |
| `/compliance` | Full audit access | Compliance Mgr |

## Future Lender Portal APIs (Phase 3)

| Domain Prefix | Endpoints | Auth |
|---------------|-----------|------|
| `/lender/auth` | Lender login | Lender JWT |
| `/lender/applications` | Queue, detail | Lender JWT |
| `/lender/documents` | Download package | Lender JWT |
| `/lender/status` | Update status | Lender JWT |

---

# 1. AUTHENTICATION APIs

**Domain prefix:** `/auth`

---

## API-AUTH-001 — Send OTP

| Field | Value |
|-------|-------|
| **Purpose** | Send OTP to phone for login or registration |
| **Endpoint** | `/auth/otp/send` |
| **Method** | `POST` |
| **Authentication** | None |
| **Rate Limit** | 5 req/phone/hour; 20 req/IP/hour |

**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| phone | string | Yes | E.164, +91XXXXXXXXXX |
| channel | enum | No | SMS, WHATSAPP (default SMS) |
| purpose | enum | Yes | LOGIN, REGISTRATION |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "otpSent": true,
    "expiresInSeconds": 300,
    "maskedPhone": "+91XXXXXX3210"
  }
}
```

**Permission:** Public  
**Business Rules:** DLT template for SMS; WhatsApp template for WA; 5-min expiry; max 3 verify attempts  
**Errors:** `AUTH_001_INVALID_PHONE` (400), `AUTH_002_RATE_LIMITED` (429), `AUTH_003_CHANNEL_UNAVAILABLE` (503)

---

## API-AUTH-002 — Verify OTP

| Field | Value |
|-------|-------|
| **Purpose** | Verify OTP and issue JWT tokens |
| **Endpoint** | `/auth/otp/verify` |
| **Method** | `POST` |
| **Authentication** | None |
| **Rate Limit** | 10 req/phone/hour |

**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| phone | string | Yes | E.164 |
| otp | string | Yes | 6 digits |
| purpose | enum | Yes | LOGIN, REGISTRATION |
| deviceId | string | No | Mobile device fingerprint |
| fcmToken | string | No | Push token |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt",
    "refreshToken": "jwt",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "userType": "CUSTOMER",
      "phone": "+91XXXXXX3210",
      "isNewUser": false
    },
    "profile": {}
  }
}
```

**Permission:** Public  
**Business Rules:** Register if new user + purpose=REGISTRATION; link device; create session  
**Errors:** `AUTH_004_INVALID_OTP` (400), `AUTH_005_OTP_EXPIRED` (400), `AUTH_006_MAX_ATTEMPTS` (429)

---

## API-AUTH-003 — Employee Login (Password)

| Field | Value |
|-------|-------|
| **Purpose** | CRM employee email/password login |
| **Endpoint** | `/auth/login` |
| **Method** | `POST` |
| **Authentication** | None |
| **Rate Limit** | 10 req/IP/15min |

**Request Body:** `{ email, password, clientType: "CRM_WEB" }`  
**Response:** `{ accessToken, refreshToken, mfaRequired: boolean, user }`  
**Permission:** Public (employees only)  
**Business Rules:** MFA challenge if mfaEnabled; lock after 5 failures  
**Errors:** `AUTH_007_INVALID_CREDENTIALS` (401), `AUTH_008_ACCOUNT_LOCKED` (403)

---

## API-AUTH-004 — MFA Verify

| Endpoint | `/auth/mfa/verify` | Method | `POST` | Auth | None (mfaSession token)  
**Body:** `{ mfaSessionToken, otp }`  
**Response:** Full token pair + roles array  
**Rate Limit:** 5/min

---

## API-AUTH-005 — Refresh Token

| Endpoint | `/auth/refresh` | Method | `POST` | Auth | Refresh token  
**Body:** `{ refreshToken }` (mobile) OR cookie (CRM)  
**Response:** `{ accessToken, refreshToken, expiresIn }` — token rotation  
**Business Rules:** Old refresh token invalidated; chain in refresh_tokens table  
**Errors:** `AUTH_009_INVALID_REFRESH` (401)

---

## API-AUTH-006 — Logout

| Endpoint | `/auth/logout` | Method | `POST` | Auth | Required  
**Body:** `{ refreshToken }` optional  
**Response:** `{ loggedOut: true }`  
**Business Rules:** Revoke session + refresh tokens

---

## API-AUTH-007 — Forgot Password

| Endpoint | `/auth/forgot-password` | Method | `POST` | Auth | None  
**Body:** `{ email }`  
**Response:** `{ message: "Reset link sent" }` (always 200 — no enumeration)

---

## API-AUTH-008 — Reset Password

| Endpoint | `/auth/reset-password` | Method | `POST` | Auth | Reset token in body  
**Body:** `{ token, newPassword }`  
**Validation:** Password min 12 chars, complexity rules

---

## API-AUTH-009 — Get Current Session

| Endpoint | `/auth/me` | Method | `GET` | Auth | Required  
**Response:** `{ user, roles, permissions[], scope: { branchId, regionId } }`  
**Permission:** Any authenticated user

---

## API-AUTH-010 — List Active Sessions

| Endpoint | `/auth/sessions` | Method | `GET` | Auth | Required  
**Response:** Array of active sessions with device info  
**Permission:** Own sessions only (customer/DSA); Admin can view employee sessions

---

## API-AUTH-011 — Revoke Session

| Endpoint | `/auth/sessions/{sessionId}` | Method | `DELETE` | Auth | Required  
**Permission:** Own session or Admin

---

# 2. USER APIs

**Domain prefix:** `/users`

| API ID | Endpoint | Method | Auth | Purpose | Permission |
|--------|----------|--------|------|---------|------------|
| API-USR-001 | `/users/me` | GET | Yes | Get current user detail | own |
| API-USR-002 | `/users/me` | PATCH | Yes | Update email, preferences | own |
| API-USR-003 | `/users/{id}` | GET | Yes | Get user by ID | users.read:branch+ |
| API-USR-004 | `/users` | GET | Yes | List users (scoped) | users.read:branch |
| API-USR-005 | `/users` | POST | Yes | Create user (employee) | users.create:all |
| API-USR-006 | `/users/{id}` | PATCH | Yes | Update user status | users.update:all |
| API-USR-007 | `/users/{id}` | DELETE | Yes | Deactivate user (soft) | users.delete:all |
| API-USR-008 | `/users/{id}/roles` | GET | Yes | List user roles | users.read:branch |
| API-USR-009 | `/users/{id}/roles` | POST | Yes | Assign role | users.update:all |
| API-USR-010 | `/users/{id}/roles/{roleId}` | DELETE | Yes | Remove role | users.update:all |

### API-USR-005 Detail — Create User

**Body:** `{ email, phone, userType: "EMPLOYEE", password, roleIds[], branchId, regionId }`  
**Validation:** Unique email/phone; password policy; valid roleIds  
**Response:** `{ id, employeeCode, ... }`  
**Errors:** `USR_001_DUPLICATE` (409)  
**Rate Limit:** 30/hour (Admin)

---

# 3. CUSTOMER APIs

**Domain prefix:** `/customer`

| API ID | Endpoint | Method | Auth | Purpose | Permission |
|--------|----------|--------|------|---------|------------|
| API-CUS-001 | `/customer/profile` | GET | Yes | Get customer profile | customers.read:own |
| API-CUS-002 | `/customer/profile` | PATCH | Yes | Update profile fields | customers.update:own |
| API-CUS-003 | `/customer/profile/completion` | GET | Yes | Profile completion % | customers.read:own |
| API-CUS-004 | `/customer/addresses` | GET | Yes | List addresses | customers.read:own |
| API-CUS-005 | `/customer/addresses` | POST | Yes | Add address | customers.update:own |
| API-CUS-006 | `/customer/addresses/{id}` | PATCH | Yes | Update address | customers.update:own |
| API-CUS-007 | `/customer/addresses/{id}` | DELETE | Yes | Remove address | customers.update:own |
| API-CUS-008 | `/customer/employment` | GET | Yes | List employment | customers.read:own |
| API-CUS-009 | `/customer/employment` | POST | Yes | Add employment | customers.update:own |
| API-CUS-010 | `/customer/income` | GET | Yes | List income records | customers.read:own |
| API-CUS-011 | `/customer/income` | POST | Yes | Declare income | customers.update:own |
| API-CUS-012 | `/customer/preferences` | GET | Yes | Notification prefs | customers.read:own |
| API-CUS-013 | `/customer/preferences` | PATCH | Yes | Update prefs | customers.update:own |
| API-CUS-014 | `/customer/consents` | GET | Yes | List consents | customers.read:own |
| API-CUS-015 | `/customer/consents` | POST | Yes | Grant consent | customers.update:own |
| API-CUS-016 | `/customer/consents/{type}/revoke` | POST | Yes | Revoke consent | customers.update:own |
| API-CUS-017 | `/customer/dashboard` | GET | Yes | Customer dashboard | customers.read:own |
| API-CUS-018 | `/customer/applications/summary` | GET | Yes | Application summary | customers.read:own |

### CRM Customer APIs (`/crm/customers`)

| API ID | Endpoint | Method | Permission |
|--------|----------|--------|------------|
| API-CUS-019 | `/crm/customers` | GET | customers.read:assigned/branch |
| API-CUS-020 | `/crm/customers/{id}` | GET | customers.read:scoped |
| API-CUS-021 | `/crm/customers/{id}/personal` | GET | customers.read:scoped (masked PII by role) |
| API-CUS-022 | `/crm/customers/{id}/kyc` | GET | kyc.read:scoped |
| API-CUS-023 | `/crm/customers/{id}/applications` | GET | applications.read:scoped |
| API-CUS-024 | `/crm/customers/{id}/documents` | GET | documents.read:scoped |
| API-CUS-025 | `/crm/customers/{id}/interactions` | GET | customers.read:scoped |
| API-CUS-026 | `/crm/customers/{id}/interactions` | POST | customers.update:assigned |
| API-CUS-027 | `/crm/customers/{id}/cross-sell` | GET | customers.read:portfolio (RM) |
| API-CUS-028 | `/crm/customers/merge` | POST | customers.update:all (Admin) |

**Query params (list):** `q`, `status`, `kycStatus`, `branchId` (auto-scoped), `page`, `pageSize`, `sort`  
**Business Rules:** PII masking per RBAC; Customer can only access own profile  
**Rate Limit:** 120/min (customer); 300/min (CRM)

---

# 4. PARTNER APIs

**Domain prefix:** `/partners` (CRM) · `/dsa` (DSA App)

| API ID | Endpoint | Method | Client | Purpose | Permission |
|--------|----------|--------|--------|---------|------------|
| API-PTR-001 | `/crm/partners` | GET | CRM | List partners | partners.read:branch |
| API-PTR-002 | `/crm/partners/{id}` | GET | CRM | Partner 360 | partners.read:scoped |
| API-PTR-003 | `/crm/partners` | POST | CRM | Onboard partner | partners.create:all |
| API-PTR-004 | `/crm/partners/{id}/activate` | POST | CRM | Activate partner | partners.approve:branch |
| API-PTR-005 | `/crm/partners/{id}/suspend` | POST | CRM | Suspend partner | partners.update:branch |
| API-PTR-006 | `/crm/partners/{id}/performance` | GET | CRM | Performance metrics | partners.read:branch |
| API-PTR-007 | `/crm/partners/{id}/documents` | GET | CRM | Partner documents | documents.read:scoped |
| API-PTR-008 | `/crm/partners/{id}/commissions` | GET | CRM | Partner commissions | commissions.read:branch |
| API-PTR-009 | `/crm/partners/onboarding-queue` | GET | CRM | Pending activations | partners.read:branch |
| API-PTR-010 | `/crm/partners/disputes` | GET | CRM | Open disputes | commissions.read:branch |

**Filters:** `partnerType`, `status`, `tier`, `branchId`, `q`  
**Business Rules:** DSA cannot access CRM partner endpoints; partner scoped to own data in DSA app

---

# 5. DSA APIs

**Domain prefix:** `/dsa`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-DSA-001 | `/dsa/dashboard` | GET | DSA dashboard widgets | partners.read:own |
| API-DSA-002 | `/dsa/profile` | GET | Own partner profile | partners.read:own |
| API-DSA-003 | `/dsa/profile` | PATCH | Update profile | partners.update:own |
| API-DSA-004 | `/dsa/kyc` | GET | KYC status | kyc.read:own |
| API-DSA-005 | `/dsa/kyc/pan` | POST | Submit PAN | kyc.update:own |
| API-DSA-006 | `/dsa/bank-accounts` | GET | List bank accounts | partners.read:own |
| API-DSA-007 | `/dsa/bank-accounts` | POST | Add bank account | partners.update:own |
| API-DSA-008 | `/dsa/agreements` | GET | List agreements | partners.read:own |
| API-DSA-009 | `/dsa/agreements/{id}/sign` | POST | eSign agreement | partners.update:own |
| API-DSA-010 | `/dsa/certifications` | GET | Product certifications | partners.read:own |
| API-DSA-011 | `/dsa/leads` | POST | Submit lead | leads.create:own |
| API-DSA-012 | `/dsa/leads` | GET | List own leads | leads.read:own |
| API-DSA-013 | `/dsa/leads/{id}` | GET | Lead detail | leads.read:own |
| API-DSA-014 | `/dsa/leads/{id}/documents` | POST | Upload lead docs | documents.upload:own |
| API-DSA-015 | `/dsa/leads/{id}/followups` | GET | Follow-up schedule | leads.read:own |
| API-DSA-016 | `/dsa/commissions` | GET | Commission summary | commissions.read:own |
| API-DSA-017 | `/dsa/commissions/ledger` | GET | Commission ledger | commissions.read:own |
| API-DSA-018 | `/dsa/commissions/{id}` | GET | Commission detail | commissions.read:own |
| API-DSA-019 | `/dsa/commissions/disputes` | POST | Raise dispute | commissions.update:own |
| API-DSA-020 | `/dsa/payouts` | GET | Payout history | commissions.read:own |
| API-DSA-021 | `/dsa/payouts/{id}` | GET | Payout detail | commissions.read:own |
| API-DSA-022 | `/dsa/performance` | GET | Performance stats | partners.read:own |
| API-DSA-023 | `/dsa/leaderboard` | GET | Network ranking | partners.read:own |
| API-DSA-024 | `/dsa/training` | GET | Training materials | knowledge.read:own |
| API-DSA-025 | `/dsa/training/{id}/complete` | POST | Mark training done | partners.update:own |

### API-DSA-011 — Submit Lead (Detail)

**Body:**
```json
{
  "prospectName": "string",
  "prospectPhone": "+91XXXXXXXXXX",
  "prospectEmail": "optional",
  "productId": "uuid",
  "variantId": "uuid optional",
  "requestedAmount": 2500000,
  "notes": "optional"
}
```
**Validation:** Partner ACTIVE; product in certified_products; phone unique per branch 30-day window  
**Response:** `{ id, leadCode, status: "NEW" }`  
**Errors:** `LEAD_001_DUPLICATE_PHONE` (409), `DSA_001_NOT_CERTIFIED` (422)  
**Rate Limit:** 60/hour per partner

---

# 6. REFERRAL APIs

**Domain prefix:** `/referral`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-REF-001 | `/referral/code` | GET | Get my referral code | referrals.read:own |
| API-REF-002 | `/referral/share` | POST | Generate share link | referrals.create:own |
| API-REF-003 | `/referral/tracking` | GET | Referral tracking list | referrals.read:own |
| API-REF-004 | `/referral/rewards` | GET | Reward history | referrals.read:own |
| API-REF-005 | `/referral/leaderboard` | GET | Referral leaderboard | referrals.read:own |
| API-REF-006 | `/public/referral/{code}` | GET | Validate referral code | Public |
| API-REF-007 | `/public/referral/{code}/register` | POST | Register via referral | Public |
| API-REF-008 | `/crm/referrals` | GET | All referrals (CRM) | referrals.read:branch |
| API-REF-009 | `/crm/referrals/{id}` | GET | Referral detail | referrals.read:branch |
| API-REF-010 | `/crm/referral-rewards` | GET | Reward queue | referrals.read:branch |
| API-REF-011 | `/crm/referral-rewards/{id}/approve` | POST | Approve reward | referrals.approve:branch |

**Business Rules:** Reward triggered on DISBURSEMENT; dual reward referrer+referee per campaign rules  
**Rate Limit:** 30/min (share); Public register 10/IP/hour

---

# 7. EMPLOYEE APIs

**Domain prefix:** `/crm/employees` · `/admin/employees`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-EMP-001 | `/crm/employees` | GET | List employees (scoped) | employees.read:branch |
| API-EMP-002 | `/crm/employees/{id}` | GET | Employee detail | employees.read:branch |
| API-EMP-003 | `/crm/employees/me` | GET | Current employee profile | employees.read:own |
| API-EMP-004 | `/admin/employees` | POST | Create employee | employees.create:all |
| API-EMP-005 | `/admin/employees/{id}` | PATCH | Update employee | employees.update:all |
| API-EMP-006 | `/admin/employees/{id}/deactivate` | POST | Deactivate | employees.delete:all |
| API-EMP-007 | `/crm/employees/{id}/reporting` | GET | Reporting structure | employees.read:branch |
| API-EMP-008 | `/crm/employees/{id}/pipeline` | GET | Sales pipeline summary | employees.read:assigned |
| API-EMP-009 | `/crm/employees/{id}/targets` | GET | Sales targets | employees.read:branch |
| API-EMP-010 | `/admin/employees/bulk-import` | POST | Bulk import CSV | employees.create:all |

---

# 8. BRANCH APIs

**Domain prefix:** `/branch` · `/admin/branches` · `/regional`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-BRN-001 | `/branch/dashboard` | GET | Branch manager dashboard | analytics.generate:branch |
| API-BRN-002 | `/branch/funnel` | GET | Branch lead funnel | analytics.read:branch |
| API-BRN-003 | `/branch/team` | GET | Branch team performance | employees.read:branch |
| API-BRN-004 | `/branch/partners` | GET | Branch partner summary | partners.read:branch |
| API-BRN-005 | `/regional/dashboard` | GET | Regional dashboard | analytics.generate:region |
| API-BRN-006 | `/regional/branches` | GET | Branch comparison | analytics.read:region |
| API-BRN-007 | `/admin/branches` | GET | List all branches | branches.read:all |
| API-BRN-008 | `/admin/branches` | POST | Create branch | branches.create:all |
| API-BRN-009 | `/admin/branches/{id}` | PATCH | Update branch | branches.update:all |
| API-BRN-010 | `/admin/regions` | GET | List regions | branches.read:all |
| API-BRN-011 | `/admin/regions` | POST | Create region | branches.create:all |

---

# 9. PRODUCT APIs

**Domain prefix:** `/public/products` · `/admin/products`

| API ID | Endpoint | Method | Auth | Purpose |
|--------|----------|--------|------|---------|
| API-PRD-001 | `/public/products` | GET | No | Product catalog |
| API-PRD-002 | `/public/products/{code}` | GET | No | Product detail |
| API-PRD-003 | `/public/products/{code}/variants` | GET | No | Product variants |
| API-PRD-004 | `/public/products/families` | GET | No | Product families |
| API-PRD-005 | `/public/products/compare` | POST | No | Compare products |
| API-PRD-006 | `/admin/products` | GET | Yes | Admin product list |
| API-PRD-007 | `/admin/products` | POST | Yes | Create product |
| API-PRD-008 | `/admin/products/{id}` | PATCH | Yes | Update product |
| API-PRD-009 | `/admin/products/{id}/variants` | POST | Yes | Add variant |
| API-PRD-010 | `/admin/products/{id}/document-rules` | GET | Yes | Document rules |
| API-PRD-011 | `/admin/products/{id}/eligibility-rules` | GET | Yes | Eligibility rules |
| API-PRD-012 | `/admin/lenders` | GET | Yes | Lender list |
| API-PRD-013 | `/admin/lenders/{id}/policies` | GET | Yes | Lender policies |
| API-PRD-014 | `/admin/lenders/{id}/policies` | POST | Yes | Add lender policy |

**Permission (admin):** `products.configure:all`  
**Cache:** Public product catalog cached 1 hour (Redis Phase 2)  
**Rate Limit:** Public 120/min/IP

---

# 10. ELIGIBILITY APIs

**Domain prefix:** `/eligibility` · `/public/eligibility`

| API ID | Endpoint | Method | Auth | Purpose |
|--------|----------|--------|------|---------|
| API-ELG-001 | `/public/eligibility/preview` | POST | No | Anonymous eligibility preview |
| API-ELG-002 | `/eligibility/check` | POST | Yes | Full eligibility check |
| API-ELG-003 | `/eligibility/check/{id}` | GET | Yes | Get check result |
| API-ELG-004 | `/applications/{id}/eligibility` | GET | Yes | Application eligibility |
| API-ELG-005 | `/applications/{id}/eligibility/recheck` | POST | Yes | Re-run eligibility |
| API-ELG-006 | `/credit/eligibility/queue` | GET | Yes | Credit eligibility queue |

### API-ELG-002 — Eligibility Check

**Body:** `{ productId, variantId?, customerId?, income, employmentType, requestedAmount, tenureMonths, productSpecificFields{} }`  
**Response:** `{ result: ELIGIBLE|CONDITIONAL|INELIGIBLE, maxEligibleAmount, recommendedTenure, recommendedEmi, foir, ltv, ruleResults[] }`  
**Permission:** `eligibility.read:own` (customer) / `eligibility.read:assigned` (sales)  
**Business Rules:** Run all active eligibility_rules; snapshot stored in eligibility_results  
**Errors:** `ELG_001_INCOMPLETE_DATA` (400), `ELG_002_PRODUCT_INACTIVE` (422)  
**Rate Limit:** 20/hour/customer; 100/hour/employee

---

# 11. EMI APIs

**Domain prefix:** `/public/emi` · `/emi`

| API ID | Endpoint | Method | Auth | Purpose |
|--------|----------|--------|------|---------|
| API-EMI-001 | `/public/emi/calculate` | POST | No | Basic EMI calculator |
| API-EMI-002 | `/emi/calculate` | POST | Yes | EMI with profile context |
| API-EMI-003 | `/public/emi/eligibility` | POST | No | EMI-based eligibility estimate |
| API-EMI-004 | `/public/emi/compare` | POST | No | Compare loan scenarios |
| API-EMI-005 | `/public/emi/savings` | POST | No | BT savings calculator |

**Body (calculate):** `{ principal, annualInterestRate, tenureMonths, processingFee? }`  
**Response:** `{ emi, totalInterest, totalPayment, amortizationSchedule[] }`  
**Validation:** principal > 0; rate 1–30%; tenure 1–360 months  
**Rate Limit:** 60/min/IP (public)

---

# 12. LEAD APIs

**Domain prefix:** `/crm/leads`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-LED-001 | `/crm/leads` | GET | Lead queue/list | leads.read:assigned |
| API-LED-002 | `/crm/leads/{id}` | GET | Lead detail 360 | leads.read:assigned |
| API-LED-003 | `/crm/leads` | POST | Manual lead create | leads.create:branch |
| API-LED-004 | `/crm/leads/{id}` | PATCH | Update lead | leads.update:assigned |
| API-LED-005 | `/crm/leads/{id}/assign` | POST | Assign lead | leads.assign:branch |
| API-LED-006 | `/crm/leads/{id}/qualify` | POST | Qualify/disqualify | leads.update:assigned |
| API-LED-007 | `/crm/leads/{id}/convert` | POST | Convert to application | leads.update:assigned |
| API-LED-008 | `/crm/leads/{id}/activities` | GET | Activity history | leads.read:assigned |
| API-LED-009 | `/crm/leads/{id}/activities` | POST | Log activity (call) | leads.update:assigned |
| API-LED-010 | `/crm/leads/{id}/notes` | GET | Notes list | leads.read:assigned |
| API-LED-011 | `/crm/leads/{id}/notes` | POST | Add note | leads.update:assigned |
| API-LED-012 | `/crm/leads/{id}/followups` | POST | Schedule follow-up | leads.update:assigned |
| API-LED-013 | `/crm/leads/{id}/score` | GET | Lead score breakdown | leads.read:assigned |
| API-LED-014 | `/crm/leads/bulk-assign` | POST | Bulk assign | leads.assign:branch |
| API-LED-015 | `/crm/leads/sla-alerts` | GET | SLA breach alerts | leads.read:branch |

**Query:** `status`, `priority`, `productId`, `sourceId`, `assignedToId`, `from`, `to`, `q`, `page`, `pageSize`  
**Business Rules:** Convert only QUALIFIED leads; SLA auto-escalation per branch settings

---

# 13. LMS APIs

**Domain prefix:** `/crm/lms` (analytics & config)

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-LMS-001 | `/crm/lms/funnel` | GET | Lead funnel analytics | analytics.read:branch |
| API-LMS-002 | `/crm/lms/sources` | GET | Lead source breakdown | analytics.read:branch |
| API-LMS-003 | `/crm/lms/sla` | GET | SLA compliance metrics | analytics.read:branch |
| API-LMS-004 | `/crm/lms/assignment-rules` | GET | Auto-assignment rules | leads.configure:all |
| API-LMS-005 | `/crm/lms/assignment-rules` | PUT | Update assignment rules | leads.configure:all |
| API-LMS-006 | `/crm/lms/scoring-config` | GET | Scoring model config | leads.configure:all |
| API-LMS-007 | `/crm/lms/conversion-rate` | GET | Conversion metrics | analytics.read:branch |
| API-LMS-008 | `/crm/lms/export` | POST | Export leads CSV | leads.export:branch |

---

# 14. LOS APIs

**Domain prefix:** `/crm/los` · `/ops` · `/credit`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-LOS-001 | `/crm/los/stages` | GET | LOS stage definitions | applications.read:branch |
| API-LOS-002 | `/crm/los/queues/sales` | GET | Sales queue | applications.read:assigned |
| API-LOS-003 | `/credit/queue` | GET | Credit processing queue | applications.read:assigned |
| API-LOS-004 | `/ops/queue` | GET | Operations queue | applications.read:assigned |
| API-LOS-005 | `/applications/{id}/stage` | POST | Advance/rework stage | applications.update:assigned |
| API-LOS-006 | `/applications/{id}/timeline` | GET | Full timeline | applications.read:scoped |
| API-LOS-007 | `/credit/applications/{id}/review` | POST | Credit review decision | applications.approve:assigned |
| API-LOS-008 | `/ops/applications/{id}/lender-submit` | POST | Submit to lender | applications.update:assigned |
| API-LOS-009 | `/ops/applications/{id}/sanction` | POST | Record sanction | applications.update:assigned |
| API-LOS-010 | `/ops/applications/{id}/disbursement` | POST | Record disbursement | applications.approve:assigned |
| API-LOS-011 | `/applications/{id}/reject` | POST | Reject application | applications.reject:assigned |
| API-LOS-012 | `/applications/{id}/withdraw` | POST | Process withdrawal | applications.update:own/assigned |
| API-LOS-013 | `/applications/{id}/exception` | POST | Request policy exception | applications.escalate:assigned |
| API-LOS-014 | `/crm/los/sla` | GET | LOS SLA dashboard | analytics.read:branch |

### API-LOS-005 — Advance Stage

**Body:** `{ toStage: "S04_ELIGIBILITY", notes?, metadata? }`  
**Validation:** Valid transition per workflow; guards (documents_complete, eligibility_pass)  
**Business Rules:** SoD — credit cannot advance to S08; commission triggered on S08  
**Errors:** `APP_001_INVALID_TRANSITION` (409), `APP_002_GUARD_FAILED` (422)  
**Idempotency:** Required

---

# 15. APPLICATION APIs

**Domain prefix:** `/applications` · `/customer/applications` · `/crm/applications`

| API ID | Endpoint | Method | Client | Purpose |
|--------|----------|--------|--------|---------|
| API-APP-001 | `/customer/applications` | GET | Customer | My applications |
| API-APP-002 | `/customer/applications` | POST | Customer | Start application |
| API-APP-003 | `/customer/applications/{id}` | GET | Customer | Application detail |
| API-APP-004 | `/customer/applications/{id}` | PATCH | Customer | Update draft |
| API-APP-005 | `/customer/applications/{id}/submit` | POST | Customer | Submit application |
| API-APP-006 | `/customer/applications/{id}/withdraw` | POST | Customer | Withdraw |
| API-APP-007 | `/customer/applications/{id}/timeline` | GET | Customer | Status timeline |
| API-APP-008 | `/customer/applications/{id}/sanction` | GET | Customer | Sanction letter |
| API-APP-009 | `/customer/applications/{id}/disbursement` | GET | Customer | Disbursement info |
| API-APP-010 | `/crm/applications` | GET | CRM | Application list |
| API-APP-011 | `/crm/applications/{id}` | GET | CRM | Application 360 |
| API-APP-012 | `/crm/applications/{id}/summary` | GET | CRM | Summary tab |
| API-APP-013 | `/crm/applications/{id}/eligibility` | GET | CRM | Eligibility tab |
| API-APP-014 | `/crm/applications/{id}/documents` | GET | CRM | Documents tab |
| API-APP-015 | `/crm/applications/{id}/credit` | GET | CRM | Credit tab |
| API-APP-016 | `/crm/applications/{id}/lender` | GET | CRM | Lender tab |
| API-APP-017 | `/crm/applications/{id}/assign` | POST | CRM | Assign executives |
| API-APP-018 | `/applications/{id}/product-details` | GET | All | Product extension data |
| API-APP-019 | `/applications/{id}/product-details` | PATCH | All | Update product fields |
| API-APP-020 | `/customer/applications/draft` | GET | Customer | Resume draft |

**Wizard auto-save:** PATCH every 30s from client; `metadata` JSON stores step progress  
**Business Rules:** One DRAFT per product per customer; submit locks customer edits

---

# 16. DOCUMENT APIs

**Domain prefix:** `/documents`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-DOC-001 | `/documents/presign` | POST | Get S3 presigned URL | documents.upload:scoped |
| API-DOC-002 | `/documents/confirm` | POST | Confirm upload | documents.upload:scoped |
| API-DOC-003 | `/documents/{id}` | GET | Get document metadata | documents.read:scoped |
| API-DOC-004 | `/documents/{id}/download` | GET | Presigned download URL | documents.download:scoped |
| API-DOC-005 | `/documents/{id}/versions` | GET | Version history | documents.read:scoped |
| API-DOC-006 | `/applications/{id}/documents` | GET | Application checklist | documents.read:scoped |
| API-DOC-007 | `/applications/{id}/documents/status` | GET | Completion status | documents.read:scoped |
| API-DOC-008 | `/credit/documents/queue` | GET | Verification queue | documents.verify:assigned |
| API-DOC-009 | `/credit/documents/{id}/verify` | POST | Verify/reject doc | documents.verify:assigned |
| API-DOC-010 | `/crm/documents/{id}/deficiency` | POST | Raise deficiency | documents.update:assigned |
| API-DOC-011 | `/ops/documents/package` | POST | Build lender package | documents.download:assigned |
| API-DOC-012 | `/documents/{id}` | DELETE | Delete unlinked doc | documents.delete:own |

### API-DOC-001 — Presign

**Body:** `{ documentTypeCode, applicationId?, customerId?, fileName, mimeType, fileSizeBytes }`  
**Response:** `{ uploadUrl, s3Key, expiresInSeconds, documentId }`  
**Validation:** MIME in allowed list; size <= max; user has upload permission for context  
**Errors:** `DOC_001_INVALID_TYPE` (400), `DOC_002_SIZE_EXCEEDED` (400)

---

# 17. OCR APIs

**Domain prefix:** `/credit/ocr` · `/documents/ocr`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-OCR-001 | `/documents/{id}/ocr` | POST | Trigger OCR processing | documents.verify:assigned |
| API-OCR-002 | `/documents/{id}/ocr` | GET | Get OCR results | documents.read:scoped |
| API-OCR-003 | `/credit/ocr/queue` | GET | OCR review queue | documents.verify:assigned |
| API-OCR-004 | `/credit/ocr/{id}/review` | POST | Accept/reject OCR extraction | documents.verify:assigned |

**Business Rules:** OCR auto-triggered on confirm if document_type.requires_ocr=true; async worker  
**Rate Limit:** 30/hour trigger per document

---

# 18. KYC APIs

**Domain prefix:** `/customer/kyc` · `/dsa/kyc` · `/crm/kyc` · `/compliance/kyc`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-KYC-001 | `/customer/kyc/status` | GET | KYC status summary | kyc.read:own |
| API-KYC-002 | `/customer/kyc/pan` | POST | Submit PAN | kyc.update:own |
| API-KYC-003 | `/customer/kyc/pan/verify` | POST | Trigger PAN verification | kyc.update:own |
| API-KYC-004 | `/customer/kyc/aadhaar/send-otp` | POST | Aadhaar OTP | kyc.update:own |
| API-KYC-005 | `/customer/kyc/aadhaar/verify` | POST | Verify Aadhaar OTP | kyc.update:own |
| API-KYC-006 | `/customer/kyc/photo` | POST | Upload photo (presign flow) | kyc.update:own |
| API-KYC-007 | `/customer/kyc/address-proof` | POST | Upload address proof | kyc.update:own |
| API-KYC-008 | `/crm/customers/{id}/kyc` | GET | CRM KYC view | kyc.read:scoped |
| API-KYC-009 | `/compliance/kyc/queue` | GET | KYC review queue | kyc.verify:organization |
| API-KYC-010 | `/compliance/kyc/{id}/review` | POST | Manual KYC review | kyc.verify:organization |
| API-KYC-011 | `/compliance/kyc/audit-logs` | GET | KYC audit trail | kyc.audit:organization |
| API-KYC-012 | `/customer/kyc/video-kyc/schedule` | POST | Schedule video KYC (Phase 3) | kyc.update:own |

**Business Rules:** PAN before Aadhaar; KYC gate before S04; encrypted storage; masked in API  
**Errors:** `KYC_001_PAN_INVALID` (400), `KYC_002_NAME_MISMATCH` (422), `KYC_003_ALREADY_VERIFIED` (409)  
**Rate Limit:** PAN verify 5/day/customer

---

# 19. AI ADVISOR APIs

**Domain prefix:** `/ai/advisor`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-AI-001 | `/ai/advisor/sessions` | POST | Start chat session | ai.use:own |
| API-AI-002 | `/ai/advisor/sessions` | GET | List sessions | ai.read:own |
| API-AI-003 | `/ai/advisor/sessions/{id}` | GET | Session detail | ai.read:own |
| API-AI-004 | `/ai/advisor/sessions/{id}/messages` | POST | Send message | ai.use:own |
| API-AI-005 | `/ai/advisor/sessions/{id}/messages` | GET | Message history | ai.read:own |
| API-AI-006 | `/ai/advisor/recommendations` | GET | Active recommendations | ai.read:own |
| API-AI-007 | `/ai/advisor/recommendations/{id}/apply` | POST | Apply recommendation | ai.use:own |
| API-AI-008 | `/ai/advisor/eligibility` | POST | AI-assisted eligibility | ai.use:own |
| API-AI-009 | `/ai/advisor/insights` | GET | Customer insights | ai.read:own |
| API-AI-010 | `/ai/copilot` | POST | CRM copilot query | ai.use:assigned |

### API-AI-004 — Send Message

**Body:** `{ content: string, context?: { applicationId?, productId? } }`  
**Response:** `{ messageId, role: "ASSISTANT", content, recommendations[], ragSources[] }`  
**Business Rules:** RAG over knowledge_sources; PII not sent to LLM; conversation stored  
**Rate Limit:** 50/hour/customer; 200/hour/employee  
**Errors:** `AI_001_CONTENT_FILTER` (400), `AI_002_RATE_LIMITED` (429), `AI_003_SERVICE_UNAVAILABLE` (503)

---

# 20. AI VOICE APIs

**Domain prefix:** `/voice`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-VOC-001 | `/voice/sessions` | POST | Start voice session | voice.use:own |
| API-VOC-002 | `/voice/sessions/{id}` | GET | Session status | voice.read:own |
| API-VOC-003 | `/voice/sessions/{id}/token` | GET | WebRTC/realtime token | voice.use:own |
| API-VOC-004 | `/voice/sessions/{id}/end` | POST | End session | voice.use:own |
| API-VOC-005 | `/voice/sessions/{id}/summary` | GET | AI summary | voice.read:own |
| API-VOC-006 | `/voice/callback` | POST | Request callback | voice.use:own |
| API-VOC-007 | `/voice/appointments` | POST | Book appointment | voice.use:own |
| API-VOC-008 | `/voice/sessions` | GET | Session history | voice.read:own |

**Business Rules:** Feature flag `feature.voice_ai.enabled`; transcript to S3; summary generated async  
**Rate Limit:** 10 sessions/day/customer

---

# 21. CHAT APIs

**Domain prefix:** `/support/chat` · `/ai/chat`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-CHT-001 | `/support/chat/sessions` | POST | Start support chat | support.create:own |
| API-CHT-002 | `/support/chat/sessions/{id}/messages` | POST | Send support message | support.update:own |
| API-CHT-003 | `/support/chat/sessions/{id}/messages` | GET | Chat history | support.read:own |
| API-CHT-004 | `/crm/support/chat/queue` | GET | Live chat queue | support.read:branch |
| API-CHT-005 | `/crm/support/chat/sessions/{id}/accept` | POST | Agent accept chat | support.update:assigned |
| API-CHT-006 | `/crm/support/chat/sessions/{id}/close` | POST | Close chat session | support.close:assigned |

---

# 22. NOTIFICATION APIs

**Domain prefix:** `/notifications`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-NTF-001 | `/notifications` | GET | List notifications | notifications.read:own |
| API-NTF-002 | `/notifications/{id}/read` | POST | Mark read | notifications.update:own |
| API-NTF-003 | `/notifications/read-all` | POST | Mark all read | notifications.update:own |
| API-NTF-004 | `/notifications/unread-count` | GET | Unread badge count | notifications.read:own |
| API-NTF-005 | `/notifications/preferences` | GET | Channel preferences | notifications.read:own |
| API-NTF-006 | `/notifications/preferences` | PATCH | Update preferences | notifications.update:own |
| API-NTF-007 | `/notifications/history/sms` | GET | SMS history | notifications.read:own |
| API-NTF-008 | `/notifications/history/email` | GET | Email history | notifications.read:own |
| API-NTF-009 | `/notifications/history/whatsapp` | GET | WhatsApp history | notifications.read:own |
| API-NTF-010 | `/notifications/devices` | POST | Register FCM token | notifications.update:own |

**Query:** `isRead`, `type`, `from`, `to`, `page`, `pageSize`  
**Rate Limit:** 120/min

---

# 23. WHATSAPP APIs

**Domain prefix:** `/webhooks/whatsapp` · `/admin/whatsapp`

| API ID | Endpoint | Method | Auth | Purpose |
|--------|----------|--------|------|---------|
| API-WA-001 | `/webhooks/whatsapp` | POST | Webhook signature | Receive WA events |
| API-WA-002 | `/webhooks/whatsapp/status` | POST | Webhook signature | Delivery status callback |
| API-WA-003 | `/admin/whatsapp/templates` | GET | Admin | List WA templates |
| API-WA-004 | `/admin/whatsapp/templates` | POST | Admin | Register template |
| API-WA-005 | `/crm/comms/whatsapp/send` | POST | Employee | Send WA message (scoped) |
| API-WA-006 | `/crm/comms/whatsapp/logs` | GET | Employee | WA send logs |

**Business Rules:** Template-only outbound; DLT/TRAI compliant; opt-in required  
**Webhook Security:** HMAC signature verification

---

# 24. CAMPAIGN APIs

**Domain prefix:** `/admin/campaigns` · `/analytics/campaigns`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-CMP-001 | `/admin/campaigns` | GET | List campaigns | campaigns.read:all |
| API-CMP-002 | `/admin/campaigns` | POST | Create campaign | campaigns.create:all |
| API-CMP-003 | `/admin/campaigns/{id}` | GET | Campaign detail | campaigns.read:all |
| API-CMP-004 | `/admin/campaigns/{id}` | PATCH | Update campaign | campaigns.update:all |
| API-CMP-005 | `/admin/campaigns/{id}/audience` | POST | Define audience | campaigns.update:all |
| API-CMP-006 | `/admin/campaigns/{id}/schedule` | POST | Schedule send | campaigns.approve:all |
| API-CMP-007 | `/admin/campaigns/{id}/launch` | POST | Launch campaign | campaigns.approve:all |
| API-CMP-008 | `/admin/campaigns/{id}/pause` | POST | Pause campaign | campaigns.update:all |
| API-CMP-009 | `/analytics/campaigns/{id}` | GET | Campaign analytics | analytics.read:branch |
| API-CMP-010 | `/analytics/campaigns` | GET | Campaign comparison | analytics.read:branch |

**Business Rules:** Consent check before marketing; audience size preview; SoD — creator ≠ approver

---

# 25. REFERRAL APIs (Extended)

*Core referral APIs defined in Section 6. Extended endpoints:*

| API ID | Endpoint | Method | Purpose |
|--------|----------|--------|---------|
| API-REF-012 | `/admin/referral-rules` | GET | Referral reward rules |
| API-REF-013 | `/admin/referral-rules` | PUT | Update reward rules |
| API-REF-014 | `/analytics/referrals` | GET | Referral analytics |
| API-REF-015 | `/referral/payouts` | GET | Referral payout history |

---

# 26. COMMISSION APIs

**Domain prefix:** `/dsa/commissions` · `/crm/commissions` · `/admin/commissions`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-COM-001 | `/crm/commissions/ledger` | GET | Commission ledger | commissions.read:branch |
| API-COM-002 | `/crm/commissions/{id}` | GET | Commission detail | commissions.read:branch |
| API-COM-003 | `/crm/commissions/approvals` | GET | Approval queue | commissions.approve:branch |
| API-COM-004 | `/crm/commissions/{id}/approve` | POST | Approve commission | commissions.approve:branch |
| API-COM-005 | `/crm/commissions/{id}/reject` | POST | Reject commission | commissions.reject:branch |
| API-COM-006 | `/crm/commissions/disputes` | GET | Dispute queue | commissions.read:branch |
| API-COM-007 | `/crm/commissions/disputes/{id}/resolve` | POST | Resolve dispute | commissions.approve:branch |
| API-COM-008 | `/finance/payouts` | GET | Payout batches | commissions.read:branch |
| API-COM-009 | `/finance/payouts` | POST | Create payout batch | commissions.approve:all |
| API-COM-010 | `/finance/payouts/{id}` | GET | Batch detail | commissions.read:branch |
| API-COM-011 | `/finance/payouts/{id}/approve` | POST | Approve batch | commissions.approve:all |
| API-COM-012 | `/finance/payouts/{id}/execute` | POST | Execute bank transfer | commissions.approve:all |
| API-COM-013 | `/admin/commission-rules` | GET | Commission rules | commissions.configure:all |
| API-COM-014 | `/admin/commission-rules` | POST | Create rule | commissions.configure:all |
| API-COM-015 | `/admin/commission-rules/{id}` | PATCH | Update rule | commissions.configure:all |
| API-COM-016 | `/crm/commissions/clawbacks` | POST | Process clawback | commissions.approve:all |
| API-COM-017 | `/analytics/commissions` | GET | Commission analytics | analytics.read:branch |

**Business Rules:** Commission triggered on disbursement confirm; TDS deducted; SoD — approver ≠ processor  
**Idempotency:** Required on payout execute  
**Errors:** `COMM_001_ALREADY_PAID` (409), `COMM_002_SOD_VIOLATION` (403)

---

# 27. ANALYTICS APIs

**Domain prefix:** `/analytics`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-ANA-001 | `/analytics/hub` | GET | Analytics navigation | analytics.read:scoped |
| API-ANA-002 | `/analytics/revenue` | GET | Revenue dashboard | analytics.read:branch |
| API-ANA-003 | `/analytics/leads/funnel` | GET | Lead funnel | analytics.read:branch |
| API-ANA-004 | `/analytics/conversion` | GET | Conversion rates | analytics.read:branch |
| API-ANA-005 | `/analytics/branches/{id}` | GET | Branch analytics | analytics.read:branch |
| API-ANA-006 | `/analytics/regional` | GET | Regional comparison | analytics.read:region |
| API-ANA-007 | `/analytics/partners` | GET | Partner analytics | analytics.read:branch |
| API-ANA-008 | `/analytics/products` | GET | Product mix | analytics.read:branch |
| API-ANA-009 | `/analytics/lenders` | GET | Lender performance | analytics.read:branch |
| API-ANA-010 | `/analytics/sla` | GET | SLA analytics | analytics.read:branch |
| API-ANA-011 | `/analytics/ai` | GET | AI usage analytics | analytics.read:all |
| API-ANA-012 | `/analytics/reports` | GET | Report list | reports.read:scoped |
| API-ANA-013 | `/analytics/reports/generate` | POST | Generate report | reports.generate:scoped |
| API-ANA-014 | `/analytics/reports/{id}/download` | GET | Download report | reports.read:scoped |
| API-ANA-015 | `/management/analytics/executive` | GET | Executive summary | analytics.read:aggregated |

**Query:** `from`, `to`, `branchId` (auto-scoped), `productId`, `granularity`  
**Cache:** Snapshot tables; 15-min cache on dashboards  
**Rate Limit:** 60/min

---

# 28. DASHBOARD APIs

**Domain prefix:** `/crm/dashboard` · `/management` · `/dsa/dashboard`

| API ID | Endpoint | Method | Role | Purpose |
|--------|----------|--------|------|---------|
| API-DSH-001 | `/crm/dashboard/sales` | GET | Sales Executive | Sales dashboard |
| API-DSH-002 | `/crm/dashboard/rm` | GET | RM | Portfolio dashboard |
| API-DSH-003 | `/crm/dashboard/credit` | GET | Credit | Credit queue dashboard |
| API-DSH-004 | `/crm/dashboard/ops` | GET | Ops | Operations dashboard |
| API-DSH-005 | `/branch/dashboard` | GET | Branch Mgr | Branch dashboard |
| API-DSH-006 | `/regional/dashboard` | GET | Regional Mgr | Regional dashboard |
| API-DSH-007 | `/support/dashboard` | GET | Support | Support console |
| API-DSH-008 | `/compliance/dashboard` | GET | Compliance | Compliance dashboard |
| API-DSH-009 | `/admin/dashboard` | GET | Admin | Admin ops dashboard |
| API-DSH-010 | `/management/dashboard` | GET | Management | Executive KPIs |
| API-DSH-011 | `/management/ceo` | GET | CEO | CEO dashboard |
| API-DSH-012 | `/management/director` | GET | Director | Director dashboard |
| API-DSH-013 | `/management/business` | GET | Business Head | Business dashboard |
| API-DSH-014 | `/management/sales` | GET | Sales Head | Sales head dashboard |
| API-DSH-015 | `/management/operations` | GET | Ops Head | Ops head dashboard |
| API-DSH-016 | `/management/finance` | GET | Finance Head | Finance dashboard |
| API-DSH-017 | `/management/board-pack` | GET | CEO, Finance | Board report pack |
| API-DSH-018 | `/management/forecast` | GET | CEO, Business | Forecast planner |
| API-DSH-019 | `/dsa/dashboard` | GET | DSA | Partner dashboard (alias API-DSA-001) |
| API-DSH-020 | `/customer/dashboard` | GET | Customer | Customer dashboard (alias API-CUS-017) |

**Response structure:** `{ widgets: [{ id, type, title, data, refreshInterval }] }`  
**Permission:** `analytics.generate:{scope}`

---

# 29. SUPPORT APIs

**Domain prefix:** `/support`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-SUP-001 | `/support/tickets` | POST | Create ticket | support.create:own |
| API-SUP-002 | `/support/tickets` | GET | My tickets | support.read:own |
| API-SUP-003 | `/support/tickets/{id}` | GET | Ticket detail | support.read:scoped |
| API-SUP-004 | `/support/faqs` | GET | FAQ list | Public/knowledge.read:own |
| API-SUP-005 | `/support/faqs/{id}` | GET | FAQ detail | Public |
| API-SUP-006 | `/support/categories` | GET | Ticket categories | Public |
| API-SUP-007 | `/support/csat` | POST | Submit CSAT rating | support.update:own |
| API-SUP-008 | `/crm/support/tickets` | GET | Support queue | support.read:branch |

---

# 30. TICKET APIs

**Domain prefix:** `/crm/support/tickets` · `/support/tickets`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-TKT-001 | `/crm/support/tickets/{id}` | PATCH | Update ticket | support.update:assigned |
| API-TKT-002 | `/crm/support/tickets/{id}/assign` | POST | Assign agent | support.assign:branch |
| API-TKT-003 | `/crm/support/tickets/{id}/messages` | POST | Add message | support.update:assigned |
| API-TKT-004 | `/crm/support/tickets/{id}/messages` | GET | Message thread | support.read:scoped |
| API-TKT-005 | `/crm/support/tickets/{id}/escalate` | POST | Escalate ticket | support.escalate:assigned |
| API-TKT-006 | `/crm/support/tickets/{id}/resolve` | POST | Resolve ticket | support.close:assigned |
| API-TKT-007 | `/crm/support/tickets/{id}/reopen` | POST | Reopen ticket | support.reopen:branch |
| API-TKT-008 | `/crm/support/escalations` | GET | Escalation queue | support.read:branch |
| API-TKT-009 | `/crm/support/sla` | GET | SLA metrics | support.read:branch |
| API-TKT-010 | `/crm/support/agents/performance` | GET | Agent performance | support.read:branch |
| API-TKT-011 | `/admin/support/templates` | GET | Canned responses | support.configure:all |
| API-TKT-012 | `/admin/support/templates` | POST | Create template | support.configure:all |

---

# 31. KNOWLEDGE BASE APIs

**Domain prefix:** `/knowledge` · `/admin/knowledge`

| API ID | Endpoint | Method | Auth | Purpose |
|--------|----------|--------|------|---------|
| API-KB-001 | `/knowledge/articles` | GET | Optional | List articles (published) |
| API-KB-002 | `/knowledge/articles/{slug}` | GET | Optional | Article detail |
| API-KB-003 | `/knowledge/faqs` | GET | Optional | FAQ list |
| API-KB-004 | `/knowledge/search` | GET | Optional | Search KB |
| API-KB-005 | `/knowledge/categories` | GET | Optional | Categories |
| API-KB-006 | `/dsa/knowledge/scripts` | GET | DSA | Sales scripts |
| API-KB-007 | `/dsa/knowledge/training` | GET | DSA | Training content |
| API-KB-008 | `/admin/knowledge/articles` | GET | Admin | CMS article list |
| API-KB-009 | `/admin/knowledge/articles` | POST | Admin | Create article |
| API-KB-010 | `/admin/knowledge/articles/{id}` | PATCH | Admin | Update article |
| API-KB-011 | `/admin/knowledge/articles/{id}/publish` | POST | Admin | Publish article |
| API-KB-012 | `/admin/knowledge/faqs` | CRUD | Admin | FAQ management |
| API-KB-013 | `/admin/knowledge/sops` | CRUD | Admin | SOP management |
| API-KB-014 | `/admin/knowledge/policies` | CRUD | Admin | Policy management |
| API-KB-015 | `/admin/knowledge/rag-sources` | GET | Admin | RAG source list |
| API-KB-016 | `/admin/knowledge/rag-sources/{id}/reindex` | POST | Admin | Trigger RAG reindex |

**Query (search):** `q` (min 3), `category`, `productId`, `audience`  
**Cache:** Published articles cached 30 min

---

# 32. SETTINGS APIs

**Domain prefix:** `/admin/settings`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-SET-001 | `/admin/settings/system` | GET | System settings | settings.read:all |
| API-SET-002 | `/admin/settings/system` | PATCH | Update system settings | settings.configure:all |
| API-SET-003 | `/admin/settings/products/{id}` | GET | Product settings | settings.read:all |
| API-SET-004 | `/admin/settings/products/{id}` | PATCH | Update product settings | settings.configure:all |
| API-SET-005 | `/admin/settings/notifications` | GET | Notification event config | settings.read:all |
| API-SET-006 | `/admin/settings/notifications` | PATCH | Update notification config | settings.configure:all |
| API-SET-007 | `/admin/settings/security` | GET | Security settings | settings.read:all |
| API-SET-008 | `/admin/settings/security` | PATCH | Update security | settings.configure:all |
| API-SET-009 | `/admin/settings/ai` | GET | AI settings | settings.read:all |
| API-SET-010 | `/admin/settings/ai` | PATCH | Update AI config | settings.configure:all |
| API-SET-011 | `/admin/workflows` | GET | LOS workflow config | settings.configure:all |
| API-SET-012 | `/admin/workflows` | PUT | Update workflows | settings.configure:all |

**Business Rules:** Super Admin only for security/AI settings; audit log on every change

---

# 33. AUDIT APIs

**Domain prefix:** `/compliance/audit`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-AUD-001 | `/compliance/audit-logs` | GET | Business audit logs | audit.read:organization |
| API-AUD-002 | `/compliance/audit-logs/{id}` | GET | Audit log detail | audit.read:organization |
| API-AUD-003 | `/compliance/access-logs` | GET | PII access logs | audit.read:organization |
| API-AUD-004 | `/compliance/change-logs` | GET | Field change logs | audit.read:organization |
| API-AUD-005 | `/compliance/approval-logs` | GET | Approval audit | audit.read:organization |
| API-AUD-006 | `/compliance/security-events` | GET | Security events | audit.read:organization |
| API-AUD-007 | `/compliance/security-events/{id}/resolve` | POST | Resolve event | audit.update:organization |
| API-AUD-008 | `/compliance/audit-logs/export` | POST | Export audit logs | audit.export:organization |

**Query:** `entityType`, `entityId`, `actorId`, `action`, `from`, `to`  
**Business Rules:** Read-only; no delete; export requires Compliance Manager+  
**Rate Limit:** 30/min

---

# 34. ADMIN APIs

**Domain prefix:** `/admin`

| API ID | Endpoint | Method | Purpose | Permission |
|--------|----------|--------|---------|------------|
| API-ADM-001 | `/admin/roles` | GET | List roles | rbac.read:all |
| API-ADM-002 | `/admin/roles/{id}` | GET | Role detail + permissions | rbac.read:all |
| API-ADM-003 | `/admin/roles/{id}/permissions` | PUT | Update role permissions | rbac.configure:all |
| API-ADM-004 | `/admin/permissions` | GET | List permissions | rbac.read:all |
| API-ADM-005 | `/admin/users` | GET | All users | users.read:all |
| API-ADM-006 | `/admin/integrations/health` | GET | Integration status | settings.read:all |
| API-ADM-007 | `/admin/integrations/{name}/test` | POST | Test integration | settings.configure:all |
| API-ADM-008 | `/admin/master-data/countries` | GET | Countries | settings.read:all |
| API-ADM-009 | `/admin/master-data/states` | GET | States | settings.read:all |
| API-ADM-010 | `/admin/master-data/banks` | GET | Banks | settings.read:all |
| API-ADM-011 | `/admin/master-data/vehicle-makes` | GET | Vehicle manufacturers | settings.read:all |
| API-ADM-012 | `/admin/master-data/vehicle-models` | GET | Vehicle models | settings.read:all |
| API-ADM-013 | `/admin/feature-flags` | GET | Feature flags | settings.read:all |
| API-ADM-014 | `/admin/feature-flags` | PATCH | Update flags | settings.configure:all |
| API-ADM-015 | `/admin/system/health` | GET | System health | settings.read:all |
| API-ADM-016 | `/admin/system/cache/clear` | POST | Clear cache | settings.configure:all |
| API-ADM-017 | `/admin/data/export` | POST | Data export job | data.export:all |
| API-ADM-018 | `/admin/data/import` | POST | Data import job | data.create:all |

---

# FUTURE LENDER PORTAL APIs (Phase 3)

| API ID | Endpoint | Method | Purpose |
|--------|----------|--------|---------|
| API-LEN-001 | `/lender/auth/login` | POST | Lender login |
| API-LEN-002 | `/lender/applications` | GET | Application queue |
| API-LEN-003 | `/lender/applications/{id}` | GET | Application detail |
| API-LEN-004 | `/lender/applications/{id}/documents` | GET | Document package URL |
| API-LEN-005 | `/lender/applications/{id}/status` | POST | Update lender status |
| API-LEN-006 | `/lender/applications/{id}/query` | POST | Raise query |

---

# WEBHOOK APIs

| API ID | Endpoint | Method | Purpose |
|--------|----------|--------|---------|
| API-WHK-001 | `/webhooks/whatsapp` | POST | WhatsApp inbound |
| API-WHK-002 | `/webhooks/sms/delivery` | POST | SMS delivery status |
| API-WHK-003 | `/webhooks/payment` | POST | Payout confirmation (Phase 2) |
| API-WHK-004 | `/webhooks/kyc` | POST | KYC provider callback |
| API-WHK-005 | `/webhooks/lender` | POST | Lender status callback (Phase 3) |

**Security:** HMAC-SHA256 signature in `X-Webhook-Signature` header

---

# GLOBAL RATE LIMITS

| Tier | Limit | Applies To |
|------|-------|------------|
| Public | 120 req/min/IP | /public/* |
| Customer | 300 req/min/user | Customer JWT |
| DSA | 300 req/min/user | DSA JWT |
| CRM Employee | 600 req/min/user | Employee JWT |
| Admin | 300 req/min/user | Admin JWT |
| Auth OTP | 5 req/hour/phone | /auth/otp/send |
| AI Advisor | 50 req/hour/user | /ai/advisor/* |
| File presign | 30 req/hour/user | /documents/presign |
| Financial ops | 10 req/min/user | payouts, disbursements |

**Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

# APPENDIX A: COMPLETE API CATALOG

| # | API ID | Method | Endpoint | Auth | Client |
|---|--------|--------|----------|------|--------|
| 1 | API-AUTH-001 | POST | /auth/otp/send | No | All |
| 2 | API-AUTH-002 | POST | /auth/otp/verify | No | All |
| 3 | API-AUTH-003 | POST | /auth/login | No | CRM |
| 4 | API-AUTH-004 | POST | /auth/mfa/verify | Partial | CRM |
| 5 | API-AUTH-005 | POST | /auth/refresh | Refresh | All |
| 6 | API-AUTH-006 | POST | /auth/logout | Yes | All |
| 7 | API-AUTH-007 | POST | /auth/forgot-password | No | CRM |
| 8 | API-AUTH-008 | POST | /auth/reset-password | Token | CRM |
| 9 | API-AUTH-009 | GET | /auth/me | Yes | All |
| 10 | API-AUTH-010 | GET | /auth/sessions | Yes | All |
| 11 | API-AUTH-011 | DELETE | /auth/sessions/{id} | Yes | All |
| 12 | API-USR-001 | GET | /users/me | Yes | All |
| 13 | API-USR-002 | PATCH | /users/me | Yes | All |
| 14 | API-USR-003 | GET | /users/{id} | Yes | CRM |
| 15 | API-USR-004 | GET | /users | Yes | Admin |
| 16 | API-USR-005 | POST | /users | Yes | Admin |
| 17 | API-USR-006 | PATCH | /users/{id} | Yes | Admin |
| 18 | API-USR-007 | DELETE | /users/{id} | Yes | Admin |
| 19 | API-USR-008 | GET | /users/{id}/roles | Yes | Admin |
| 20 | API-USR-009 | POST | /users/{id}/roles | Yes | Admin |
| 21 | API-USR-010 | DELETE | /users/{id}/roles/{roleId} | Yes | Admin |
| 22 | API-CUS-001 | GET | /customer/profile | Yes | Customer |
| 23 | API-CUS-002 | PATCH | /customer/profile | Yes | Customer |
| 24 | API-CUS-003 | GET | /customer/profile/completion | Yes | Customer |
| 25 | API-CUS-004 | GET | /customer/addresses | Yes | Customer |
| 26 | API-CUS-005 | POST | /customer/addresses | Yes | Customer |
| 27 | API-CUS-006 | PATCH | /customer/addresses/{id} | Yes | Customer |
| 28 | API-CUS-007 | DELETE | /customer/addresses/{id} | Yes | Customer |
| 29 | API-CUS-008 | GET | /customer/employment | Yes | Customer |
| 30 | API-CUS-009 | POST | /customer/employment | Yes | Customer |
| 31 | API-CUS-010 | GET | /customer/income | Yes | Customer |
| 32 | API-CUS-011 | POST | /customer/income | Yes | Customer |
| 33 | API-CUS-012 | GET | /customer/preferences | Yes | Customer |
| 34 | API-CUS-013 | PATCH | /customer/preferences | Yes | Customer |
| 35 | API-CUS-014 | GET | /customer/consents | Yes | Customer |
| 36 | API-CUS-015 | POST | /customer/consents | Yes | Customer |
| 37 | API-CUS-016 | POST | /customer/consents/{type}/revoke | Yes | Customer |
| 38 | API-CUS-017 | GET | /customer/dashboard | Yes | Customer |
| 39 | API-CUS-018 | GET | /customer/applications/summary | Yes | Customer |
| 40 | API-CUS-019 | GET | /crm/customers | Yes | CRM |
| 41 | API-CUS-020 | GET | /crm/customers/{id} | Yes | CRM |
| 42 | API-CUS-021 | GET | /crm/customers/{id}/personal | Yes | CRM |
| 43 | API-CUS-022 | GET | /crm/customers/{id}/kyc | Yes | CRM |
| 44 | API-CUS-023 | GET | /crm/customers/{id}/applications | Yes | CRM |
| 45 | API-CUS-024 | GET | /crm/customers/{id}/documents | Yes | CRM |
| 46 | API-CUS-025 | GET | /crm/customers/{id}/interactions | Yes | CRM |
| 47 | API-CUS-026 | POST | /crm/customers/{id}/interactions | Yes | CRM |
| 48 | API-CUS-027 | GET | /crm/customers/{id}/cross-sell | Yes | CRM |
| 49 | API-CUS-028 | POST | /crm/customers/merge | Yes | Admin |
| 50 | API-PTR-001 | GET | /crm/partners | Yes | CRM |
| 51 | API-PTR-002 | GET | /crm/partners/{id} | Yes | CRM |
| 52 | API-PTR-003 | POST | /crm/partners | Yes | CRM |
| 53 | API-PTR-004 | POST | /crm/partners/{id}/activate | Yes | CRM |
| 54 | API-PTR-005 | POST | /crm/partners/{id}/suspend | Yes | CRM |
| 55 | API-PTR-006 | GET | /crm/partners/{id}/performance | Yes | CRM |
| 56 | API-PTR-007 | GET | /crm/partners/{id}/documents | Yes | CRM |
| 57 | API-PTR-008 | GET | /crm/partners/{id}/commissions | Yes | CRM |
| 58 | API-PTR-009 | GET | /crm/partners/onboarding-queue | Yes | CRM |
| 59 | API-PTR-010 | GET | /crm/partners/disputes | Yes | CRM |
| 60 | API-DSA-001 | GET | /dsa/dashboard | Yes | DSA |
| 61 | API-DSA-002 | GET | /dsa/profile | Yes | DSA |
| 62 | API-DSA-003 | PATCH | /dsa/profile | Yes | DSA |
| 63 | API-DSA-004 | GET | /dsa/kyc | Yes | DSA |
| 64 | API-DSA-005 | POST | /dsa/kyc/pan | Yes | DSA |
| 65 | API-DSA-006 | GET | /dsa/bank-accounts | Yes | DSA |
| 66 | API-DSA-007 | POST | /dsa/bank-accounts | Yes | DSA |
| 67 | API-DSA-008 | GET | /dsa/agreements | Yes | DSA |
| 68 | API-DSA-009 | POST | /dsa/agreements/{id}/sign | Yes | DSA |
| 69 | API-DSA-010 | GET | /dsa/certifications | Yes | DSA |
| 70 | API-DSA-011 | POST | /dsa/leads | Yes | DSA |
| 71 | API-DSA-012 | GET | /dsa/leads | Yes | DSA |
| 72 | API-DSA-013 | GET | /dsa/leads/{id} | Yes | DSA |
| 73 | API-DSA-014 | POST | /dsa/leads/{id}/documents | Yes | DSA |
| 74 | API-DSA-015 | GET | /dsa/leads/{id}/followups | Yes | DSA |
| 75 | API-DSA-016 | GET | /dsa/commissions | Yes | DSA |
| 76 | API-DSA-017 | GET | /dsa/commissions/ledger | Yes | DSA |
| 77 | API-DSA-018 | GET | /dsa/commissions/{id} | Yes | DSA |
| 78 | API-DSA-019 | POST | /dsa/commissions/disputes | Yes | DSA |
| 79 | API-DSA-020 | GET | /dsa/payouts | Yes | DSA |
| 80 | API-DSA-021 | GET | /dsa/payouts/{id} | Yes | DSA |
| 81 | API-DSA-022 | GET | /dsa/performance | Yes | DSA |
| 82 | API-DSA-023 | GET | /dsa/leaderboard | Yes | DSA |
| 83 | API-DSA-024 | GET | /dsa/training | Yes | DSA |
| 84 | API-DSA-025 | POST | /dsa/training/{id}/complete | Yes | DSA |
| 85 | API-REF-001 | GET | /referral/code | Yes | Customer |
| 86 | API-REF-002 | POST | /referral/share | Yes | Customer |
| 87 | API-REF-003 | GET | /referral/tracking | Yes | Customer |
| 88 | API-REF-004 | GET | /referral/rewards | Yes | Customer |
| 89 | API-REF-005 | GET | /referral/leaderboard | Yes | Customer |
| 90 | API-REF-006 | GET | /public/referral/{code} | No | Public |
| 91 | API-REF-007 | POST | /public/referral/{code}/register | No | Public |
| 92 | API-REF-008 | GET | /crm/referrals | Yes | CRM |
| 93 | API-REF-009 | GET | /crm/referrals/{id} | Yes | CRM |
| 94 | API-REF-010 | GET | /crm/referral-rewards | Yes | CRM |
| 95 | API-REF-011 | POST | /crm/referral-rewards/{id}/approve | Yes | CRM |
| 96 | API-EMP-001 | GET | /crm/employees | Yes | CRM |
| 97 | API-EMP-002 | GET | /crm/employees/{id} | Yes | CRM |
| 98 | API-EMP-003 | GET | /crm/employees/me | Yes | CRM |
| 99 | API-EMP-004 | POST | /admin/employees | Yes | Admin |
| 100 | API-EMP-005 | PATCH | /admin/employees/{id} | Yes | Admin |
| 101 | API-EMP-006 | POST | /admin/employees/{id}/deactivate | Yes | Admin |
| 102 | API-EMP-007 | GET | /crm/employees/{id}/reporting | Yes | CRM |
| 103 | API-EMP-008 | GET | /crm/employees/{id}/pipeline | Yes | CRM |
| 104 | API-EMP-009 | GET | /crm/employees/{id}/targets | Yes | CRM |
| 105 | API-EMP-010 | POST | /admin/employees/bulk-import | Yes | Admin |
| 106 | API-BRN-001 | GET | /branch/dashboard | Yes | CRM |
| 107 | API-BRN-002 | GET | /branch/funnel | Yes | CRM |
| 108 | API-BRN-003 | GET | /branch/team | Yes | CRM |
| 109 | API-BRN-004 | GET | /branch/partners | Yes | CRM |
| 110 | API-BRN-005 | GET | /regional/dashboard | Yes | CRM |
| 111 | API-BRN-006 | GET | /regional/branches | Yes | CRM |
| 112 | API-BRN-007 | GET | /admin/branches | Yes | Admin |
| 113 | API-BRN-008 | POST | /admin/branches | Yes | Admin |
| 114 | API-BRN-009 | PATCH | /admin/branches/{id} | Yes | Admin |
| 115 | API-BRN-010 | GET | /admin/regions | Yes | Admin |
| 116 | API-BRN-011 | POST | /admin/regions | Yes | Admin |
| 117 | API-PRD-001 | GET | /public/products | No | All |
| 118 | API-PRD-002 | GET | /public/products/{code} | No | All |
| 119 | API-PRD-003 | GET | /public/products/{code}/variants | No | All |
| 120 | API-PRD-004 | GET | /public/products/families | No | All |
| 121 | API-PRD-005 | POST | /public/products/compare | No | All |
| 122 | API-PRD-006 | GET | /admin/products | Yes | Admin |
| 123 | API-PRD-007 | POST | /admin/products | Yes | Admin |
| 124 | API-PRD-008 | PATCH | /admin/products/{id} | Yes | Admin |
| 125 | API-PRD-009 | POST | /admin/products/{id}/variants | Yes | Admin |
| 126 | API-PRD-010 | GET | /admin/products/{id}/document-rules | Yes | Admin |
| 127 | API-PRD-011 | GET | /admin/products/{id}/eligibility-rules | Yes | Admin |
| 128 | API-PRD-012 | GET | /admin/lenders | Yes | Admin |
| 129 | API-PRD-013 | GET | /admin/lenders/{id}/policies | Yes | Admin |
| 130 | API-PRD-014 | POST | /admin/lenders/{id}/policies | Yes | Admin |
| 131 | API-ELG-001 | POST | /public/eligibility/preview | No | Public |
| 132 | API-ELG-002 | POST | /eligibility/check | Yes | All |
| 133 | API-ELG-003 | GET | /eligibility/check/{id} | Yes | All |
| 134 | API-ELG-004 | GET | /applications/{id}/eligibility | Yes | All |
| 135 | API-ELG-005 | POST | /applications/{id}/eligibility/recheck | Yes | CRM |
| 136 | API-ELG-006 | GET | /credit/eligibility/queue | Yes | Credit |
| 137 | API-EMI-001 | POST | /public/emi/calculate | No | Public |
| 138 | API-EMI-002 | POST | /emi/calculate | Yes | All |
| 139 | API-EMI-003 | POST | /public/emi/eligibility | No | Public |
| 140 | API-EMI-004 | POST | /public/emi/compare | No | Public |
| 141 | API-EMI-005 | POST | /public/emi/savings | No | Public |
| 142 | API-LED-001 | GET | /crm/leads | Yes | CRM |
| 143 | API-LED-002 | GET | /crm/leads/{id} | Yes | CRM |
| 144 | API-LED-003 | POST | /crm/leads | Yes | CRM |
| 145 | API-LED-004 | PATCH | /crm/leads/{id} | Yes | CRM |
| 146 | API-LED-005 | POST | /crm/leads/{id}/assign | Yes | CRM |
| 147 | API-LED-006 | POST | /crm/leads/{id}/qualify | Yes | CRM |
| 148 | API-LED-007 | POST | /crm/leads/{id}/convert | Yes | CRM |
| 149 | API-LED-008 | GET | /crm/leads/{id}/activities | Yes | CRM |
| 150 | API-LED-009 | POST | /crm/leads/{id}/activities | Yes | CRM |
| 151 | API-LED-010 | GET | /crm/leads/{id}/notes | Yes | CRM |
| 152 | API-LED-011 | POST | /crm/leads/{id}/notes | Yes | CRM |
| 153 | API-LED-012 | POST | /crm/leads/{id}/followups | Yes | CRM |
| 154 | API-LED-013 | GET | /crm/leads/{id}/score | Yes | CRM |
| 155 | API-LED-014 | POST | /crm/leads/bulk-assign | Yes | CRM |
| 156 | API-LED-015 | GET | /crm/leads/sla-alerts | Yes | CRM |
| 157 | API-LMS-001 | GET | /crm/lms/funnel | Yes | CRM |
| 158 | API-LMS-002 | GET | /crm/lms/sources | Yes | CRM |
| 159 | API-LMS-003 | GET | /crm/lms/sla | Yes | CRM |
| 160 | API-LMS-004 | GET | /crm/lms/assignment-rules | Yes | Admin |
| 161 | API-LMS-005 | PUT | /crm/lms/assignment-rules | Yes | Admin |
| 162 | API-LMS-006 | GET | /crm/lms/scoring-config | Yes | Admin |
| 163 | API-LMS-007 | GET | /crm/lms/conversion-rate | Yes | CRM |
| 164 | API-LMS-008 | POST | /crm/lms/export | Yes | CRM |
| 165 | API-LOS-001 | GET | /crm/los/stages | Yes | CRM |
| 166 | API-LOS-002 | GET | /crm/los/queues/sales | Yes | CRM |
| 167 | API-LOS-003 | GET | /credit/queue | Yes | Credit |
| 168 | API-LOS-004 | GET | /ops/queue | Yes | Ops |
| 169 | API-LOS-005 | POST | /applications/{id}/stage | Yes | CRM |
| 170 | API-LOS-006 | GET | /applications/{id}/timeline | Yes | All |
| 171 | API-LOS-007 | POST | /credit/applications/{id}/review | Yes | Credit |
| 172 | API-LOS-008 | POST | /ops/applications/{id}/lender-submit | Yes | Ops |
| 173 | API-LOS-009 | POST | /ops/applications/{id}/sanction | Yes | Ops |
| 174 | API-LOS-010 | POST | /ops/applications/{id}/disbursement | Yes | Ops |
| 175 | API-LOS-011 | POST | /applications/{id}/reject | Yes | CRM |
| 176 | API-LOS-012 | POST | /applications/{id}/withdraw | Yes | All |
| 177 | API-LOS-013 | POST | /applications/{id}/exception | Yes | CRM |
| 178 | API-LOS-014 | GET | /crm/los/sla | Yes | CRM |
| 179 | API-APP-001 | GET | /customer/applications | Yes | Customer |
| 180 | API-APP-002 | POST | /customer/applications | Yes | Customer |
| 181 | API-APP-003 | GET | /customer/applications/{id} | Yes | Customer |
| 182 | API-APP-004 | PATCH | /customer/applications/{id} | Yes | Customer |
| 183 | API-APP-005 | POST | /customer/applications/{id}/submit | Yes | Customer |
| 184 | API-APP-006 | POST | /customer/applications/{id}/withdraw | Yes | Customer |
| 185 | API-APP-007 | GET | /customer/applications/{id}/timeline | Yes | Customer |
| 186 | API-APP-008 | GET | /customer/applications/{id}/sanction | Yes | Customer |
| 187 | API-APP-009 | GET | /customer/applications/{id}/disbursement | Yes | Customer |
| 188 | API-APP-010 | GET | /crm/applications | Yes | CRM |
| 189 | API-APP-011 | GET | /crm/applications/{id} | Yes | CRM |
| 190 | API-APP-012 | GET | /crm/applications/{id}/summary | Yes | CRM |
| 191 | API-APP-013 | GET | /crm/applications/{id}/eligibility | Yes | CRM |
| 192 | API-APP-014 | GET | /crm/applications/{id}/documents | Yes | CRM |
| 193 | API-APP-015 | GET | /crm/applications/{id}/credit | Yes | CRM |
| 194 | API-APP-016 | GET | /crm/applications/{id}/lender | Yes | CRM |
| 195 | API-APP-017 | POST | /crm/applications/{id}/assign | Yes | CRM |
| 196 | API-APP-018 | GET | /applications/{id}/product-details | Yes | All |
| 197 | API-APP-019 | PATCH | /applications/{id}/product-details | Yes | All |
| 198 | API-APP-020 | GET | /customer/applications/draft | Yes | Customer |
| 199 | API-DOC-001 | POST | /documents/presign | Yes | All |
| 200 | API-DOC-002 | POST | /documents/confirm | Yes | All |
| 201 | API-DOC-003 | GET | /documents/{id} | Yes | All |
| 202 | API-DOC-004 | GET | /documents/{id}/download | Yes | All |
| 203 | API-DOC-005 | GET | /documents/{id}/versions | Yes | All |
| 204 | API-DOC-006 | GET | /applications/{id}/documents | Yes | All |
| 205 | API-DOC-007 | GET | /applications/{id}/documents/status | Yes | All |
| 206 | API-DOC-008 | GET | /credit/documents/queue | Yes | Credit |
| 207 | API-DOC-009 | POST | /credit/documents/{id}/verify | Yes | Credit |
| 208 | API-DOC-010 | POST | /crm/documents/{id}/deficiency | Yes | CRM |
| 209 | API-DOC-011 | POST | /ops/documents/package | Yes | Ops |
| 210 | API-DOC-012 | DELETE | /documents/{id} | Yes | All |
| 211 | API-OCR-001 | POST | /documents/{id}/ocr | Yes | Credit |
| 212 | API-OCR-002 | GET | /documents/{id}/ocr | Yes | CRM |
| 213 | API-OCR-003 | GET | /credit/ocr/queue | Yes | Credit |
| 214 | API-OCR-004 | POST | /credit/ocr/{id}/review | Yes | Credit |
| 215 | API-KYC-001 | GET | /customer/kyc/status | Yes | Customer |
| 216 | API-KYC-002 | POST | /customer/kyc/pan | Yes | Customer |
| 217 | API-KYC-003 | POST | /customer/kyc/pan/verify | Yes | Customer |
| 218 | API-KYC-004 | POST | /customer/kyc/aadhaar/send-otp | Yes | Customer |
| 219 | API-KYC-005 | POST | /customer/kyc/aadhaar/verify | Yes | Customer |
| 220 | API-KYC-006 | POST | /customer/kyc/photo | Yes | Customer |
| 221 | API-KYC-007 | POST | /customer/kyc/address-proof | Yes | Customer |
| 222 | API-KYC-008 | GET | /crm/customers/{id}/kyc | Yes | CRM |
| 223 | API-KYC-009 | GET | /compliance/kyc/queue | Yes | Compliance |
| 224 | API-KYC-010 | POST | /compliance/kyc/{id}/review | Yes | Compliance |
| 225 | API-KYC-011 | GET | /compliance/kyc/audit-logs | Yes | Compliance |
| 226 | API-KYC-012 | POST | /customer/kyc/video-kyc/schedule | Yes | Customer |
| 227 | API-AI-001 | POST | /ai/advisor/sessions | Yes | Customer |
| 228 | API-AI-002 | GET | /ai/advisor/sessions | Yes | Customer |
| 229 | API-AI-003 | GET | /ai/advisor/sessions/{id} | Yes | Customer |
| 230 | API-AI-004 | POST | /ai/advisor/sessions/{id}/messages | Yes | Customer |
| 231 | API-AI-005 | GET | /ai/advisor/sessions/{id}/messages | Yes | Customer |
| 232 | API-AI-006 | GET | /ai/advisor/recommendations | Yes | Customer |
| 233 | API-AI-007 | POST | /ai/advisor/recommendations/{id}/apply | Yes | Customer |
| 234 | API-AI-008 | POST | /ai/advisor/eligibility | Yes | Customer |
| 235 | API-AI-009 | GET | /ai/advisor/insights | Yes | Customer |
| 236 | API-AI-010 | POST | /ai/copilot | Yes | CRM |
| 237 | API-VOC-001 | POST | /voice/sessions | Yes | Customer |
| 238 | API-VOC-002 | GET | /voice/sessions/{id} | Yes | Customer |
| 239 | API-VOC-003 | GET | /voice/sessions/{id}/token | Yes | Customer |
| 240 | API-VOC-004 | POST | /voice/sessions/{id}/end | Yes | Customer |
| 241 | API-VOC-005 | GET | /voice/sessions/{id}/summary | Yes | Customer |
| 242 | API-VOC-006 | POST | /voice/callback | Yes | Customer |
| 243 | API-VOC-007 | POST | /voice/appointments | Yes | Customer |
| 244 | API-VOC-008 | GET | /voice/sessions | Yes | Customer |
| 245 | API-CHT-001 | POST | /support/chat/sessions | Yes | Customer |
| 246 | API-CHT-002 | POST | /support/chat/sessions/{id}/messages | Yes | All |
| 247 | API-CHT-003 | GET | /support/chat/sessions/{id}/messages | Yes | All |
| 248 | API-CHT-004 | GET | /crm/support/chat/queue | Yes | Support |
| 249 | API-CHT-005 | POST | /crm/support/chat/sessions/{id}/accept | Yes | Support |
| 250 | API-CHT-006 | POST | /crm/support/chat/sessions/{id}/close | Yes | Support |
| 251 | API-NTF-001 | GET | /notifications | Yes | All |
| 252 | API-NTF-002 | POST | /notifications/{id}/read | Yes | All |
| 253 | API-NTF-003 | POST | /notifications/read-all | Yes | All |
| 254 | API-NTF-004 | GET | /notifications/unread-count | Yes | All |
| 255 | API-NTF-005 | GET | /notifications/preferences | Yes | All |
| 256 | API-NTF-006 | PATCH | /notifications/preferences | Yes | All |
| 257 | API-NTF-007 | GET | /notifications/history/sms | Yes | All |
| 258 | API-NTF-008 | GET | /notifications/history/email | Yes | All |
| 259 | API-NTF-009 | GET | /notifications/history/whatsapp | Yes | All |
| 260 | API-NTF-010 | POST | /notifications/devices | Yes | Mobile |
| 261 | API-WA-001 | POST | /webhooks/whatsapp | Webhook | External |
| 262 | API-WA-002 | POST | /webhooks/whatsapp/status | Webhook | External |
| 263 | API-WA-003 | GET | /admin/whatsapp/templates | Yes | Admin |
| 264 | API-WA-004 | POST | /admin/whatsapp/templates | Yes | Admin |
| 265 | API-WA-005 | POST | /crm/comms/whatsapp/send | Yes | CRM |
| 266 | API-WA-006 | GET | /crm/comms/whatsapp/logs | Yes | CRM |
| 267 | API-CMP-001 | GET | /admin/campaigns | Yes | Admin |
| 268 | API-CMP-002 | POST | /admin/campaigns | Yes | Admin |
| 269 | API-CMP-003 | GET | /admin/campaigns/{id} | Yes | Admin |
| 270 | API-CMP-004 | PATCH | /admin/campaigns/{id} | Yes | Admin |
| 271 | API-CMP-005 | POST | /admin/campaigns/{id}/audience | Yes | Admin |
| 272 | API-CMP-006 | POST | /admin/campaigns/{id}/schedule | Yes | Admin |
| 273 | API-CMP-007 | POST | /admin/campaigns/{id}/launch | Yes | Admin |
| 274 | API-CMP-008 | POST | /admin/campaigns/{id}/pause | Yes | Admin |
| 275 | API-CMP-009 | GET | /analytics/campaigns/{id} | Yes | CRM |
| 276 | API-CMP-010 | GET | /analytics/campaigns | Yes | CRM |
| 277 | API-REF-012 | GET | /admin/referral-rules | Yes | Admin |
| 278 | API-REF-013 | PUT | /admin/referral-rules | Yes | Admin |
| 279 | API-REF-014 | GET | /analytics/referrals | Yes | CRM |
| 280 | API-REF-015 | GET | /referral/payouts | Yes | Customer |
| 281 | API-COM-001 | GET | /crm/commissions/ledger | Yes | CRM |
| 282 | API-COM-002 | GET | /crm/commissions/{id} | Yes | CRM |
| 283 | API-COM-003 | GET | /crm/commissions/approvals | Yes | CRM |
| 284 | API-COM-004 | POST | /crm/commissions/{id}/approve | Yes | CRM |
| 285 | API-COM-005 | POST | /crm/commissions/{id}/reject | Yes | CRM |
| 286 | API-COM-006 | GET | /crm/commissions/disputes | Yes | CRM |
| 287 | API-COM-007 | POST | /crm/commissions/disputes/{id}/resolve | Yes | CRM |
| 288 | API-COM-008 | GET | /finance/payouts | Yes | Finance |
| 289 | API-COM-009 | POST | /finance/payouts | Yes | Finance |
| 290 | API-COM-010 | GET | /finance/payouts/{id} | Yes | Finance |
| 291 | API-COM-011 | POST | /finance/payouts/{id}/approve | Yes | Finance |
| 292 | API-COM-012 | POST | /finance/payouts/{id}/execute | Yes | Finance |
| 293 | API-COM-013 | GET | /admin/commission-rules | Yes | Admin |
| 294 | API-COM-014 | POST | /admin/commission-rules | Yes | Admin |
| 295 | API-COM-015 | PATCH | /admin/commission-rules/{id} | Yes | Admin |
| 296 | API-COM-016 | POST | /crm/commissions/clawbacks | Yes | Finance |
| 297 | API-COM-017 | GET | /analytics/commissions | Yes | CRM |
| 298 | API-ANA-001 | GET | /analytics/hub | Yes | CRM |
| 299 | API-ANA-002 | GET | /analytics/revenue | Yes | CRM |
| 300 | API-ANA-003 | GET | /analytics/leads/funnel | Yes | CRM |
| 301 | API-ANA-004 | GET | /analytics/conversion | Yes | CRM |
| 302 | API-ANA-005 | GET | /analytics/branches/{id} | Yes | CRM |
| 303 | API-ANA-006 | GET | /analytics/regional | Yes | CRM |
| 304 | API-ANA-007 | GET | /analytics/partners | Yes | CRM |
| 305 | API-ANA-008 | GET | /analytics/products | Yes | CRM |
| 306 | API-ANA-009 | GET | /analytics/lenders | Yes | CRM |
| 307 | API-ANA-010 | GET | /analytics/sla | Yes | CRM |
| 308 | API-ANA-011 | GET | /analytics/ai | Yes | Admin |
| 309 | API-ANA-012 | GET | /analytics/reports | Yes | CRM |
| 310 | API-ANA-013 | POST | /analytics/reports/generate | Yes | CRM |
| 311 | API-ANA-014 | GET | /analytics/reports/{id}/download | Yes | CRM |
| 312 | API-ANA-015 | GET | /management/analytics/executive | Yes | Mgmt |

*Dashboard (API-DSH-001–020), Support (API-SUP-001–008), Ticket (API-TKT-001–012), Knowledge Base (API-KB-001–016), Settings (API-SET-001–012), Audit (API-AUD-001–008), Admin (API-ADM-001–018), Lender (API-LEN-001–006), Webhooks (API-WHK-001–005) — catalog entries 313–324 in Appendix B.*

---

# APPENDIX B: EXTENDED API CATALOG (313–324)

| # | API ID | Method | Endpoint | Client |
|---|--------|--------|----------|--------|
| 313 | API-DSH-001 | GET | /crm/dashboard/sales | CRM |
| 314 | API-DSH-005 | GET | /branch/dashboard | CRM |
| 315 | API-DSH-011 | GET | /management/ceo | Mgmt |
| 316 | API-SUP-001 | POST | /support/tickets | Customer |
| 317 | API-TKT-006 | POST | /crm/support/tickets/{id}/resolve | CRM |
| 318 | API-KB-001 | GET | /knowledge/articles | All |
| 319 | API-SET-001 | GET | /admin/settings/system | Admin |
| 320 | API-AUD-001 | GET | /compliance/audit-logs | Compliance |
| 321 | API-ADM-001 | GET | /admin/roles | Admin |
| 322 | API-LEN-001 | POST | /lender/auth/login | Lender |
| 323 | API-WHK-001 | POST | /webhooks/whatsapp | Webhook |
| 324 | API-HEALTH-001 | GET | /health | Public |

**Total catalogued endpoints: 324** (312 Phase 1 + 12 Phase 3 lender/health)

---

# APPENDIX C: JWT TOKEN STRUCTURE

```json
{
  "sub": "user-uuid",
  "userType": "EMPLOYEE",
  "roles": ["SALES_EXECUTIVE"],
  "permissions": ["leads.read:assigned", "applications.read:assigned"],
  "scope": {
    "branchId": "uuid",
    "regionId": "uuid",
    "employeeId": "uuid"
  },
  "iat": 1717500000,
  "exp": 1717503600
}
```

---

# APPENDIX D: REQUIRED REQUEST HEADERS

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Authenticated endpoints | Bearer {accessToken} |
| Content-Type | POST/PATCH/PUT | application/json |
| X-Request-Id | Recommended | Client-generated UUID for tracing |
| X-App-Version | Mobile | App version string |
| X-Client-Type | All | CUSTOMER_APP, DSA_APP, CRM_WEB |
| X-Device-Id | Mobile | Device fingerprint |
| Idempotency-Key | Financial mutations | UUID v4 |

---

# APPENDIX E: OPENAPI GENERATION NOTES

This document is the source of truth. Generate OpenAPI 3.1 spec via:
1. Zod schemas in `packages/shared-types`
2. Route definitions in Express routers
3. Auto-sync script comparing routes ↔ this catalog

---

# APPENDIX F: DOCUMENT APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Head of Engineering | | | |
| API Architect | | | |
| CTO | | | |
| CISO | | | |
| CEO / Managing Director | | | |

---

# APPENDIX G: REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | Kuber Finserve Engineering | Initial API Specification |

---

# APPENDIX H: RELATED DOCUMENT INDEX

| Document | Relationship |
|----------|-------------|
| [KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md](./KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md) | Table mapping for API resources |
| [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) | Permission strings per endpoint |
| [KUBERONE_SCREEN_PLANNING_AND_IA.md](./KUBERONE_SCREEN_PLANNING_AND_IA.md) | Screen-to-API mapping |
| [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md) | API layer architecture |

---

**© 2026 Kuber Finserve. Confidential — For Internal, Engineering, and Integration Use.**

*This document is the authoritative REST API specification for KuberOne. All backend routes and frontend API clients must conform to endpoints, contracts, and security requirements defined herein.*
