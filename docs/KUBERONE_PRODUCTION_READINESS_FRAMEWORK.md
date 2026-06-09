# KuberOne
## Production Readiness Framework

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise Production Readiness Framework (B5)  
**Classification:** Go-Live Ready | Governance Ready | Board Ready | Enterprise Ready  
**Version:** 1.0  
**Date:** June 2026  
**Related Documents:**
- [KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md) — §28 Production Go-Live Checklist (90 items — authoritative technical baseline)
- [KUBERONE_QA_STRATEGY.md](./KUBERONE_QA_STRATEGY.md) — UAT, certification, sign-off
- [KUBERONE_TESTING_STRATEGY.md](./KUBERONE_TESTING_STRATEGY.md) — Test evidence requirements
- [KUBERONE_RELEASE_MANAGEMENT_FRAMEWORK.md](./KUBERONE_RELEASE_MANAGEMENT_FRAMEWORK.md) — Release and rollback governance
- [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md)
- [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md)
- [KUBERONE_VISION_AND_OBJECTIVES.md](./KUBERONE_VISION_AND_OBJECTIVES.md)
- [KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md](./KUBERONE_BUSINESS_WORKFLOW_AND_OPERATING_MODEL.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Production readiness governance — go-live checklist, business readiness, scoring model, sign-off gates, ongoing readiness |
| **Audience** | CTO, Board, DevOps, QA, Product, Compliance, Finance, Engineering Leads |
| **Status** | Authoritative Production Readiness Master Framework |
| **Out of Scope** | Source code, infrastructure scripts, implementation runbooks |

---

## Framework Statistics

| Metric | Value |
|--------|-------|
| **Technical checklist items** | 90 (DevOps §28 — incorporated by reference) |
| **Business readiness items** | 45 (this framework) |
| **Total readiness items** | 135 |
| **Readiness domains** | 8 |
| **Sign-off gates** | 5 |
| **Minimum go-live score** | 95% weighted |
| **RPO / RTO** | 1 hour / 4 hours |
| **Availability target** | 99.9% |

---

# EXECUTIVE SUMMARY

Production readiness is the **formal governance process** that determines whether KuberOne is safe to serve real customers, partners, and employees in production. The Enterprise Architecture Audit identified production readiness at **74/100** — strong DevOps go-live checklist but missing standalone governance for business readiness, scoring, and sign-off gates.

This framework closes that gap. It **incorporates by reference** all 90 technical items from [KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md) §28 and adds **45 business readiness items**, a **weighted scoring model**, and **five sign-off gates**.

## Framework Purpose

| Stakeholder | Value |
|-------------|-------|
| **Board / Investors** | Quantified readiness score; defensible go-live decision |
| **CTO** | Single framework for go/no-go authority |
| **DevOps** | Infrastructure, monitoring, backup, rollback evidence |
| **QA** | Test and UAT evidence mapped to readiness |
| **Product / Business** | Business process, partner, and customer readiness |
| **Compliance** | Regulatory and audit readiness attestation |

**Board Recommendation:** No production launch or major platform expansion without ≥ 95% weighted readiness score and all five sign-off gates cleared.

---

# 1. READINESS VISION

## 1.1 Definition

**Production Ready** means KuberOne can:
1. Serve customer and DSA mobile apps with 99.9% availability
2. Process loan applications through LOS S01–S09 without data loss
3. Enforce RBAC and PII protection under real traffic
4. Operate AI advisor within compliance guard rails
5. Recover from failure within RTO (4 hours) and RPO (1 hour)
6. Roll back a bad release within 3 minutes (API) or 1 hour (full)
7. Support business operations (sales, credit, ops, finance) on day one

## 1.2 Readiness Types

| Type | Scope | When Applied |
|------|-------|--------------|
| **Initial Go-Live** | First production launch (Week 52) | Full 135-item assessment |
| **Major Release** | Significant feature (AI, new product) | Domain subset + regression evidence |
| **Standard Release** | Bi-weekly production release | Certification + smoke + monitoring |
| **Hotfix** | Emergency production fix | Targeted subset + CTO waiver |
| **Expansion Readiness** | New product (Insurance, PL) | Module-specific checklist |

---

# 2. READINESS DOMAINS

## 2.1 Domain Overview

| # | Domain | Items | Weight | Primary Owner |
|---|--------|-------|--------|---------------|
| 1 | **Infrastructure** | 20 (DevOps §28.1) | 15% | DevOps |
| 2 | **Security** | 20 (DevOps §28.2) | 20% | DevOps + Backend Lead |
| 3 | **Database** | 10 (DevOps §28.3) | 10% | Backend Lead + DevOps |
| 4 | **Monitoring & Observability** | 10 (DevOps §28.4) | 10% | DevOps |
| 5 | **Backup & DR** | 7 (DevOps §28.5) | 10% | DevOps |
| 6 | **Application & QA** | 13 (DevOps §28.6) | 15% | QA Lead + Backend Lead |
| 7 | **Mobile** | 10 (DevOps §28.7) | 10% | Mobile Lead |
| 8 | **Business Readiness** | 45 (this framework) | 10% | Product Owner |
| | **Total** | **135** | **100%** | |

## 2.2 Domain Dependencies

```
Infrastructure ──→ Security ──→ Application
      │                │              │
      ▼                ▼              ▼
  Database ──→ Monitoring ──→ Business Readiness
      │                │
      ▼                ▼
  Backup/DR ──→ Mobile
```

No sign-off gate clears until its domain dependencies are ≥ 90% complete.

---

# 3. TECHNICAL READINESS (DEVOPS §28 — 90 ITEMS)

The following sections reproduce the **authoritative DevOps §28 checklist** by reference. During readiness assessment, each item is scored: ✅ Complete (1.0), ⚠️ Partial (0.5), ❌ Not started (0.0).

## 3.1 Infrastructure Checklist (Items 1–20)

*Source: DevOps §28.1*

| # | Item | Owner |
|---|------|-------|
| 1 | Production VPC created with correct CIDR | DevOps |
| 2 | Public subnets in 2 AZs | DevOps |
| 3 | Private subnets for RDS in 2 AZs | DevOps |
| 4 | Security groups configured per Section 5.2 | DevOps |
| 5 | EC2 app server launched (t3.large, Ubuntu 22.04) | DevOps |
| 6 | RDS MySQL 8 Multi-AZ provisioned (db.t3.medium) | DevOps |
| 7 | S3 buckets created (6 production buckets) | DevOps |
| 8 | S3 versioning enabled on all production buckets | DevOps |
| 9 | S3 Block Public Access enabled on all buckets | DevOps |
| 10 | Route 53 hosted zone configured | DevOps |
| 11 | ACM wildcard certificate issued | DevOps |
| 12 | EC2 instance role with S3 + SSM permissions | DevOps |
| 13 | SSM parameters populated for production | DevOps |
| 14 | Nginx installed and configured | DevOps |
| 15 | PM2 installed with startup script | DevOps |
| 16 | Node.js 20 LTS installed | DevOps |
| 17 | `pm2-logrotate` configured | DevOps |
| 18 | System logrotate configured for Nginx | DevOps |
| 19 | `unattended-upgrades` enabled (security patches) | DevOps |
| 20 | EBS volumes encrypted | DevOps |

## 3.2 Security Checklist (Items 21–40)

*Source: DevOps §28.2*

| # | Item | Owner |
|---|------|-------|
| 21 | TLS 1.3 configured on Nginx | DevOps |
| 22 | HSTS header enabled | DevOps |
| 23 | Security headers configured (Section 19.8) | DevOps |
| 24 | Rate limiting configured (Nginx + Express) | DevOps |
| 25 | CORS whitelist configured for production domains | Backend Lead |
| 26 | JWT secrets generated (256-bit) and stored in SSM | DevOps |
| 27 | All API keys stored in SSM (not in code) | DevOps |
| 28 | RDS encryption at rest enabled | DevOps |
| 29 | RDS not publicly accessible | DevOps |
| 30 | SSH key-only access (no password auth) | DevOps |
| 31 | Admin panel IP whitelist configured | DevOps |
| 32 | RBAC middleware verified on all endpoints | Backend Lead |
| 33 | PII masking verified per role | Backend Lead |
| 34 | Audit logging enabled for all mutations | Backend Lead |
| 35 | `.env` file permissions set to 600 | DevOps |
| 36 | Git secret scanning enabled | DevOps |
| 37 | npm audit passing (no critical vulnerabilities) | Backend Lead |
| 38 | Penetration test completed | Security |
| 39 | DPDP consent flow verified | Product |
| 40 | AI disclaimer displayed on all AI sessions | Product |

## 3.3 Database Checklist (Items 41–50)

*Source: DevOps §28.3*

| # | Item | Owner |
|---|------|-------|
| 41 | Prisma migrations applied to production | DevOps |
| 42 | Database indexes verified | Backend Lead |
| 43 | Slow query log enabled | DevOps |
| 44 | Connection pool limits configured | Backend Lead |
| 45 | Automated backup enabled (daily, 35-day retention) | DevOps |
| 46 | PITR enabled | DevOps |
| 47 | Pre-go-live manual snapshot taken | DevOps |
| 48 | Seed data applied (products, roles, config) | Backend Lead |
| 49 | Database connection tested from EC2 | DevOps |
| 50 | Read-only user created for reporting (if needed) | DevOps |

## 3.4 Monitoring Checklist (Items 51–60)

*Source: DevOps §28.4*

| # | Item | Owner |
|---|------|-------|
| 51 | PM2 monitoring active | DevOps |
| 52 | CloudWatch metrics enabled for EC2 + RDS | DevOps |
| 53 | Sentry configured for production | DevOps |
| 54 | Uptime monitor on `/health` (60s interval) | DevOps |
| 55 | P1/P2/P3 alerts configured per Section 17 | DevOps |
| 56 | Alert routing tested (SMS, Slack, email) | DevOps |
| 57 | On-call rotation established | CTO |
| 58 | Health check endpoint returning 200 | DevOps |
| 59 | Error tracking verified (test error in Sentry) | DevOps |
| 60 | AI cost monitoring dashboard configured | DevOps |

## 3.5 Backup Checklist (Items 61–67)

*Source: DevOps §28.5*

| # | Item | Owner |
|---|------|-------|
| 61 | RDS automated backup verified | DevOps |
| 62 | Manual snapshot restore tested (to QA) | DevOps |
| 63 | S3 versioning verified (upload + overwrite test) | DevOps |
| 64 | Logical backup cron configured | DevOps |
| 65 | Backup failure alert configured | DevOps |
| 66 | DR runbook documented and reviewed | DevOps |
| 67 | DR drill scheduled (within 30 days of go-live) | CTO |

## 3.6 Application Checklist (Items 68–80)

*Source: DevOps §28.6*

| # | Item | Owner |
|---|------|-------|
| 68 | Backend deployed and PM2 running | DevOps |
| 69 | Admin panel deployed and accessible | DevOps |
| 70 | API smoke tests passing | QA |
| 71 | Auth flow (OTP → login → refresh) working | QA |
| 72 | Document presign + upload flow working | QA |
| 73 | AI Advisor responding (English + Hindi) | QA |
| 74 | Push notification delivery verified | QA |
| 75 | WhatsApp message delivery verified | QA |
| 76 | Commission calculation verified | QA |
| 77 | LOS stage transitions working | QA |
| 78 | RBAC permissions verified per role | QA |
| 79 | Load test completed (100 concurrent users minimum; 500 target) | DevOps |
| 80 | Rollback procedure tested | DevOps |

## 3.7 Mobile Checklist (Items 81–90)

*Source: DevOps §28.7*

| # | Item | Owner |
|---|------|-------|
| 81 | Customer App production build submitted to Play Store | Mobile Lead |
| 82 | Customer App production build submitted to App Store | Mobile Lead |
| 83 | DSA App production build submitted to Play Store | Mobile Lead |
| 84 | DSA App production build submitted to App Store | Mobile Lead |
| 85 | Production API URL configured in app builds | Mobile Lead |
| 86 | Firebase FCM production config verified | Mobile Lead |
| 87 | Sentry production DSN configured | Mobile Lead |
| 88 | Expo OTA update channel configured | Mobile Lead |
| 89 | App Store / Play Store listings complete | Product |
| 90 | Privacy policy and terms published | Product |

---

# 4. BUSINESS READINESS (45 ITEMS)

## 4.1 Product & Customer Readiness (Items B1–B10)

| # | Item | Owner | Gate |
|---|------|-------|------|
| B1 | Phase 1 loan products configured (HL, LAP, BL, AL) | Product | Gate 3 |
| B2 | Eligibility rules validated by business | Product + Finance | Gate 3 |
| B3 | EMI calculator verified against business spreadsheet | Finance | Gate 3 |
| B4 | Customer onboarding flow approved by UX/Product | Product | Gate 4 |
| B5 | Customer support process documented (L1/L2/L3) | Product | Gate 4 |
| B6 | Customer FAQ / help content published | Product | Gate 4 |
| B7 | Customer communication templates approved (SMS, WA, email) | Product | Gate 3 |
| B8 | Referral program rules approved | Product + Finance | Gate 4 |
| B9 | Customer app store metadata and screenshots approved | Product | Gate 5 |
| B10 | Beta customer feedback incorporated (5–10 users) | Product | Gate 4 |

## 4.2 DSA Partner Readiness (Items B11–B18)

| # | Item | Owner | Gate |
|---|------|-------|------|
| B11 | DSA onboarding process documented | Product | Gate 4 |
| B12 | DSA agreement template legal-approved | Compliance | Gate 3 |
| B13 | DSA commission rules configured and verified | Finance | Gate 3 |
| B14 | DSA training materials prepared | Product | Gate 4 |
| B15 | Pilot DSA partners onboarded (3–5 partners) | Business | Gate 4 |
| B16 | DSA support channel established | Product | Gate 4 |
| B17 | DSA app store listings complete | Product | Gate 5 |
| B18 | DSA lead submission SLA defined | Business | Gate 3 |

## 4.3 Operations & CRM Readiness (Items B19–B28)

| # | Item | Owner | Gate |
|---|------|-------|------|
| B19 | Sales team trained on CRM lead management | Business | Gate 4 |
| B20 | Credit team trained on review workflow (SoD) | Business | Gate 4 |
| B21 | Operations team trained on document verification | Business | Gate 4 |
| B22 | Finance team trained on commission approval | Finance | Gate 4 |
| B23 | Branch/region hierarchy configured in production | Admin | Gate 3 |
| B24 | Employee accounts created for all go-live users | Admin | Gate 4 |
| B25 | LOS stage SLA definitions approved | Business | Gate 3 |
| B26 | Document checklist templates verified per product | Ops | Gate 3 |
| B27 | Sanction letter template legal-approved | Compliance | Gate 3 |
| B28 | Escalation matrix operational (Business Workflow doc) | Product | Gate 4 |

## 4.4 Compliance & Legal Readiness (Items B29–B36)

| # | Item | Owner | Gate |
|---|------|-------|------|
| B29 | Privacy policy published (DPDP compliant) | Compliance | Gate 5 |
| B30 | Terms of service published | Compliance | Gate 5 |
| B31 | AI usage disclaimer legal-approved | Compliance | Gate 3 |
| B32 | Consent capture flows verified (DPDP) | Compliance | Gate 3 |
| B33 | Data retention policy documented | Compliance | Gate 3 |
| B34 | PII access audit process operational | Compliance | Gate 4 |
| B35 | Regulatory notification plan (if breach) | Compliance | Gate 4 |
| B36 | RBI fair practice code alignment verified | Compliance | Gate 3 |

## 4.5 Finance & Commercial Readiness (Items B37–B40)

| # | Item | Owner | Gate |
|---|------|-------|------|
| B37 | Commission payout process documented | Finance | Gate 4 |
| B38 | Bank account for commission disbursement verified | Finance | Gate 3 |
| B39 | Lender commission agreements in place (Phase 1 lenders) | Business | Gate 3 |
| B40 | Revenue recognition process defined | Finance | Gate 4 |

## 4.6 AI & Data Readiness (Items B41–B45)

| # | Item | Owner | Gate |
|---|------|-------|------|
| B41 | Knowledge base articles curated (min 100 articles) | AI Lead + Product | Gate 3 |
| B42 | AI guard rails tested and Compliance-approved | AI Lead + Compliance | Gate 3 |
| B43 | OpenAI production budget and alerts configured | AI Lead + DevOps | Gate 3 |
| B44 | AI response audit sampling process defined | Compliance | Gate 4 |
| B45 | Hindi language content reviewed by native speaker | Product | Gate 4 |

---

# 5. READINESS SCORING MODEL

## 5.1 Item Scoring

| Status | Score | Symbol | Criteria |
|--------|-------|--------|----------|
| **Complete** | 1.0 | ✅ | Verified with evidence; owner signed |
| **Partial** | 0.5 | ⚠️ | In progress; workaround exists; not fully verified |
| **Not Started** | 0.0 | ❌ | No work or failed verification |
| **N/A** | Excluded | — | Not applicable to this release type; requires CTO approval |

## 5.2 Domain Score Calculation

```
Domain Score = (Sum of item scores / Applicable items) × 100%
```

## 5.3 Weighted Overall Score

```
Overall Readiness = Σ (Domain Score × Domain Weight)
```

| Domain | Weight |
|--------|--------|
| Infrastructure | 15% |
| Security | 20% |
| Database | 10% |
| Monitoring | 10% |
| Backup & DR | 10% |
| Application & QA | 15% |
| Mobile | 10% |
| Business | 10% |

## 5.4 Score Thresholds

| Score Range | Status | Action |
|-------------|--------|--------|
| **95–100%** | **GO** | Proceed to sign-off gates |
| **90–94%** | **CONDITIONAL GO** | CTO review; waivers documented; no S1 gaps |
| **80–89%** | **NOT READY** | Delay go-live; remediate within 1 week |
| **< 80%** | **STOP** | Significant gaps; re-plan timeline |

## 5.5 Non-Negotiable Items (Block Go-Live at 0.0)

These items **cannot be waived** regardless of overall score:

| # | Item | Domain |
|---|------|--------|
| 6 | RDS MySQL Multi-AZ | Infrastructure |
| 26 | JWT secrets in SSM | Security |
| 28 | RDS encryption at rest | Security |
| 32 | RBAC on all endpoints | Security |
| 34 | Audit logging on mutations | Security |
| 38 | Penetration test completed | Security |
| 45 | Automated backup enabled | Database |
| 55 | P1/P2/P3 alerts configured | Monitoring |
| 62 | Snapshot restore tested | Backup |
| 80 | Rollback tested | Application |
| B29 | Privacy policy published | Business |
| B32 | DPDP consent verified | Business |
| B42 | AI guard rails Compliance-approved | Business |

**13 non-negotiable items.** Any at 0.0 = automatic **STOP**.

## 5.6 Readiness Assessment Schedule

| Assessment | Timing | Participants |
|------------|--------|--------------|
| Baseline | Week 40 | All domain owners |
| Pre-UAT | Week 46 | All domain owners |
| Pre-Go-Live | Week 50 | All domain owners + CTO |
| Final | Week 51 | Board briefing + CTO decision |
| Post-Go-Live (30-day) | Week 56 | Retrospective; DR drill result |

## 5.7 Readiness Dashboard

| Field | Updated |
|-------|---------|
| Overall weighted score | Weekly from Week 40 |
| Domain scores (8) | Weekly |
| Non-negotiable status (13) | Weekly |
| Open blockers | Daily in final 2 weeks |
| Evidence links | Per item |
| Waiver log | As issued |

---

# 6. SIGN-OFF GATES

## 6.1 Gate Overview

| Gate | Name | Timing | Minimum Score | Cleared By |
|------|------|--------|---------------|------------|
| **Gate 1** | Foundation Ready | Week 8 | N/A (checklist) | DevOps + Backend Lead |
| **Gate 2** | Platform Test Ready | Week 38 | 80% | QA Lead |
| **Gate 3** | UAT Ready | Week 46 | 90% | QA Lead + Product |
| **Gate 4** | Release Candidate | Week 50 | 93% | QA Lead + CTO |
| **Gate 5** | Go-Live | Week 51–52 | 95% | CTO + Board |

## 6.2 Gate 1: Foundation Ready (Week 8)

| Criterion | Evidence |
|-----------|----------|
| CI pipeline operational | GitHub Actions green |
| QA environment deployed | Health check 200 |
| Auth module in QA | OTP flow tested |
| RBAC middleware operational | Integration tests pass |
| Monitoring baseline in QA | PM2 + CloudWatch |

**Sign-off:** DevOps Lead + Backend Lead

## 6.3 Gate 2: Platform Test Ready (Week 38)

| Criterion | Evidence |
|-----------|----------|
| All backend modules in QA | Module integration tests pass |
| Customer + DSA apps on QA | Maestro smoke pass |
| CRM on QA | Playwright smoke pass |
| AI Advisor on QA | Eval harness pass |
| Regression suite operational | Nightly pass |
| Readiness score ≥ 80% | Dashboard |

**Sign-off:** QA Lead

## 6.4 Gate 3: UAT Ready (Week 46)

| Criterion | Evidence |
|-----------|----------|
| UAT environment deployed | `uat-api` health 200 |
| Release candidate on UAT | `release/*` deployed |
| Core regression pass | 0 S1/S2 |
| Business readiness items B1–B18, B23–B27, B31–B33, B37–B39, B41–B43 ≥ 90% | Business checklist |
| Security items 21–37 ≥ 90% | Security checklist |
| k6 load test scheduled | Calendar confirmed |
| Readiness score ≥ 90% | Dashboard |

**Sign-off:** QA Lead + Product Owner

## 6.5 Gate 4: Release Candidate (Week 50)

| Criterion | Evidence |
|-----------|----------|
| UAT sign-off complete | Signed UAT form |
| Release certification issued | Certification document |
| Pen test complete | Third-party report |
| All non-negotiable items ✅ | Dashboard |
| Infrastructure items 1–20 ≥ 95% | DevOps checklist |
| Mobile items 81–90 ≥ 90% | Store submission proof |
| DR runbook reviewed | DevOps sign-off |
| Readiness score ≥ 93% | Dashboard |

**Sign-off:** QA Lead + CTO

## 6.6 Gate 5: Go-Live (Week 51–52)

| Criterion | Evidence |
|-----------|----------|
| Overall readiness ≥ 95% | Final dashboard |
| All 13 non-negotiable items ✅ | Dashboard |
| All 5 gate sign-offs complete | Sign-off log |
| Production deploy rehearsal on UAT | Rehearsal report |
| On-call rotation active | Schedule published |
| Board briefing complete | Board minutes |
| Go-live runbook distributed | All leads acknowledged |

**Sign-off:**

| Role | Scope |
|------|-------|
| CTO | Overall go-live authority |
| DevOps Lead | Infrastructure, monitoring, backup, rollback |
| Backend Lead | Application, database, RBAC |
| QA Lead | Testing, UAT, certification |
| Product Owner | Business, customer, partner readiness |
| Compliance Head | Regulatory readiness |
| Mobile Lead | App store, mobile config |
| Board Chair | Investment/stakeholder approval (initial go-live) |

---

# 7. RELEASE READINESS (ONGOING)

## 7.1 Standard Bi-Weekly Release Readiness

Not every release requires full 135-item assessment. Standard releases use a **lightweight readiness subset**:

| Domain | Items Checked | Threshold |
|--------|---------------|-----------|
| Application & QA | Certification + smoke + 0 P0/P1 | 100% |
| Security | npm audit + no new High ZAP | Pass |
| Database | Migration tested in UAT | Pass |
| Monitoring | No unresolved P1 alerts | Pass |
| Rollback | Rollback tested in last 90 days | Pass |

## 7.2 Major Release Readiness

Major releases (new product, AI feature, architecture change) require **domain-level reassessment**:

| Trigger | Additional Assessment |
|---------|----------------------|
| New loan product | B1, B2, B26 + eligibility tests |
| AI feature | B41–B45 + items 40, 73 |
| CRM module change | B19–B22 + item 78 |
| Infrastructure change | Full domain 1 + 4 + 5 |
| Security change | Full domain 2 |

## 7.3 Hotfix Readiness

| Requirement | Hotfix |
|-------------|--------|
| CI pass | Required |
| Targeted regression | Required |
| UAT sign-off | CTO waiver allowed |
| Full readiness score | Not required |
| Rollback plan | Required |
| Post-mortem (P1) | Within 48 hours |

---

# 8. ROLLBACK READINESS

## 8.1 Rollback Capability Matrix

*Source: DevOps §13.6*

| Component | Method | RTO | Verified By |
|-----------|--------|-----|-------------|
| Backend API | Rsync previous + `pm2 reload` | < 3 min | Item 80 |
| Admin Panel | Rsync previous `dist/` | < 2 min | Item 80 |
| Database | RDS pre-deploy snapshot restore | < 30 min | Item 62 |
| Mobile OTA | Republish previous Expo update | < 5 min | Mobile Lead |
| Mobile Store | Promote previous version | 1–24 hr | Mobile Lead |
| Full rollback | Previous artifact + RDS restore | < 1 hr | DR drill |

## 8.2 Rollback Decision Criteria

| Trigger | Decision Maker | Action |
|---------|----------------|--------|
| Smoke tests fail post-deploy | DevOps | Auto-rollback |
| Error rate > 5% within 15 min | DevOps + CTO | Rollback |
| P1 bug within 1 hour of deploy | CTO | Rollback assessment |
| Data corruption detected | CTO | Immediate rollback + snapshot |

## 8.3 Rollback Readiness Checklist

| # | Item | Owner |
|---|------|-------|
| R1 | Previous release artifact retained (last 3 releases) | DevOps |
| R2 | Pre-deploy RDS snapshot automated | DevOps |
| R3 | Rollback runbook documented | DevOps |
| R4 | Rollback tested in QA (item 80) | DevOps |
| R5 | Rollback communication template ready | Product |
| R6 | On-call team briefed on rollback procedure | CTO |

---

# 9. POST-GO-LIVE READINESS

## 9.1 First 30 Days

| Activity | Timing | Owner |
|----------|--------|-------|
| Daily error rate review | Daily | DevOps |
| Weekly readiness score refresh | Weekly | QA Lead |
| DR drill execution | Within 30 days | DevOps + CTO |
| Pen test remediation verification | Within 14 days | Security |
| AI response audit (sample) | Week 2 | Compliance |
| Customer support volume review | Weekly | Product |
| Commission payout dry run | Week 3 | Finance |
| Post-go-live retrospective | Day 30 | CTO + all leads |

## 9.2 Ongoing Readiness Hygiene

| Activity | Frequency |
|----------|-----------|
| Readiness dashboard update | Monthly |
| Non-negotiable item re-verification | Quarterly |
| DR drill | Quarterly |
| Pen test | Quarterly |
| Backup restore test | Quarterly |
| Rollback test | Quarterly |
| Business readiness review | Semi-annual |

---

# 10. ROLES AND RESPONSIBILITIES

| Role | Readiness Responsibility |
|------|-------------------------|
| **CTO** | Go-live authority; waiver approval; board briefing |
| **DevOps Lead** | Domains 1, 4, 5; items 1–20, 51–67, 79–80 |
| **Backend Lead** | Domains 2, 3; items 25, 32–34, 37, 41–42, 44, 48 |
| **QA Lead** | Domain 6; items 70–78; readiness dashboard ownership |
| **Mobile Lead** | Domain 7; items 81–88 |
| **Product Owner** | Domain 8; items B1–B10, B17, B19, B28 |
| **Compliance Head** | Items 39–40, B12, B27–B36, B42, B44 |
| **Finance Head** | B3, B8, B13, B37–B40 |
| **AI Lead** | B41–B43, item 60, 73 |
| **Security** | Item 38, pen test |
| **Board** | Gate 5 approval (initial go-live) |

---

# APPENDIX A: READINESS SCORECARD TEMPLATE

| Domain | Items | Complete | Partial | Not Started | Domain Score | Weight | Weighted |
|--------|-------|----------|---------|-------------|--------------|--------|----------|
| Infrastructure | 20 | | | | % | 15% | |
| Security | 20 | | | | % | 20% | |
| Database | 10 | | | | % | 10% | |
| Monitoring | 10 | | | | % | 10% | |
| Backup & DR | 7 | | | | % | 10% | |
| Application & QA | 13 | | | | % | 15% | |
| Mobile | 10 | | | | % | 10% | |
| Business | 45 | | | | % | 10% | |
| **Overall** | **135** | | | | | **100%** | **%** |

**Non-negotiable items clear:** Yes / No  
**Recommendation:** GO / CONDITIONAL GO / NOT READY / STOP  
**Assessor:** _______________ **Date:** _______________

---

# APPENDIX B: WAIVER LOG TEMPLATE

| Waiver ID | Item | Reason | Risk Assessment | Compensating Control | Approved By | Date | Expiry |
|-----------|------|--------|-----------------|---------------------|-------------|------|--------|
| W-001 | | | | | CTO | | |

*Non-negotiable items (§5.5) cannot appear in waiver log.*

---

# APPENDIX C: GATE SIGN-OFF LOG

| Gate | Target Date | Actual Date | Score | Sign-off By | Status |
|------|-------------|-------------|-------|-------------|--------|
| Gate 1 — Foundation | Week 8 | | N/A | DevOps + Backend Lead | |
| Gate 2 — Platform Test | Week 38 | | ≥ 80% | QA Lead | |
| Gate 3 — UAT Ready | Week 46 | | ≥ 90% | QA Lead + Product | |
| Gate 4 — Release Candidate | Week 50 | | ≥ 93% | QA Lead + CTO | |
| Gate 5 — Go-Live | Week 52 | | ≥ 95% | CTO + Board | |

---

# APPENDIX D: CROSS-REFERENCE INDEX

| Topic | Document | Section |
|-------|----------|---------|
| 90-item technical checklist | DevOps | §28 |
| UAT sign-off | QA Strategy | §7, §10 |
| Release certification | QA Strategy | §6 |
| Testing evidence | Testing Strategy | Full |
| Release process | Release Management Framework | Full |
| Rollback | DevOps | §13.6 |
| DR | DevOps | §22 |
| Sprint timeline | Sprint Planning Roadmap | Full |

---

**Document Status:** Authoritative Production Readiness Framework (B5)  
**Next Review:** Monthly from Week 40; quarterly post-go-live  
**Approval:** CTO · Board · DevOps Lead · QA Lead · Compliance Head
