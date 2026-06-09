# KuberOne
## Release Management Framework

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise Release Management Framework (B6)  
**Classification:** Release Ready | Governance Ready | Production Ready | Enterprise Ready  
**Version:** 1.0  
**Date:** June 2026  
**Related Documents:**
- [KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md](./KUBERONE_DEVOPS_DEPLOYMENT_ARCHITECTURE.md) — §13 CI/CD Architecture, §14 Release Management (authoritative operational baseline)
- [KUBERONE_QA_STRATEGY.md](./KUBERONE_QA_STRATEGY.md) — UAT, certification, sign-off
- [KUBERONE_TESTING_STRATEGY.md](./KUBERONE_TESTING_STRATEGY.md) — Regression and test gates
- [KUBERONE_PRODUCTION_READINESS_FRAMEWORK.md](./KUBERONE_PRODUCTION_READINESS_FRAMEWORK.md) — Go-live gates
- [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md) — §30 Deployment Strategy
- [KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md](./KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md)
- [KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md](./KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md) — Mobile store and OTA

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Release types, branching, deployment, rollback, approval, production governance, versioning, communication |
| **Audience** | CTO, DevOps, QA Lead, Product Owner, Engineering Leads, Backend, Mobile, Board |
| **Status** | Authoritative Release Management Master Framework |
| **Out of Scope** | Source code, CI YAML, deployment scripts |

---

## Framework Statistics

| Metric | Value |
|--------|-------|
| **Release types** | 5 |
| **Branch patterns** | 6 |
| **Environments** | 4 |
| **Production cadence** | Bi-weekly (Tuesday or Thursday) |
| **UAT cadence** | Weekly (Friday) |
| **Hotfix SLA** | CTO approval; deploy within 4 hours (P1) |
| **Rollback RTO (API)** | < 3 minutes |
| **Version format** | SemVer `v{MAJOR}.{MINOR}.{PATCH}` |
| **Approval gates** | 4 (QA, UAT, Production, Hotfix) |

---

# EXECUTIVE SUMMARY

Release Management governs **how KuberOne software moves from development to production** safely, predictably, and with full traceability. This framework is the **governance layer** atop DevOps §13–14 — defining release types, branching strategy, deployment orchestration, rollback authority, approval chains, and production governance for a regulated fintech monorepo spanning backend, CRM admin, customer mobile, and DSA mobile.

## Strategic Release Principles

| # | Principle | Implementation |
|---|-----------|----------------|
| 1 | **Trunk-based with release branches** | `develop` integrates; `release/*` stabilizes; `main` is production |
| 2 | **Bi-weekly predictable cadence** | Business plans around Tuesday/Thursday production windows |
| 3 | **No direct commits to `main`** | PR + CI + approval always |
| 4 | **UAT is mandatory** | Except documented CTO hotfix waivers |
| 5 | **Rollback is always ready** | Pre-deploy snapshot + artifact retention |
| 6 | **Version everything** | Git tags, mobile semver, database migrations |
| 7 | **Communicate every release** | Release notes to all stakeholders |

**Board Recommendation:** Approve bi-weekly production release cadence with CTO as final production authority. Hotfix path requires post-mortem for all P1 incidents.

---

# 1. RELEASE MANAGEMENT VISION

## 1.1 Objectives

| Objective | Measure |
|-----------|---------|
| Predictable delivery | 95% of releases on scheduled date |
| Low defect escape | < 5% P1/P2 in production per release |
| Fast recovery | Rollback within 3 minutes (API) when needed |
| Audit trail | 100% releases with certification + deployment log |
| Stakeholder confidence | Release notes published within 1 hour of deploy |

## 1.2 Scope

| In Scope | Out of Scope |
|----------|--------------|
| Backend API releases | Lender portal third-party releases |
| CRM admin panel releases | Marketing campaign launches |
| Mobile app store releases | Business process changes (separate change management) |
| Mobile OTA updates | Infrastructure-only changes (DevOps change management) |
| Database migrations | |
| AI model / KB content updates | |
| Configuration changes (SSM) | |

## 1.3 Release Management RACI

| Activity | Developer | QA Lead | DevOps | Product | Backend Lead | CTO |
|----------|-----------|---------|--------|---------|--------------|-----|
| Feature development | **R** | I | I | C | A | I |
| Release branch cut | C | C | **R** | C | C | I |
| UAT coordination | I | **R/A** | C | C | I | I |
| Release certification | I | **A** | C | C | C | I |
| Production deploy | I | C | **R** | I | C | **A** |
| Rollback execution | C | C | **R** | I | C | **A** |
| Hotfix approval | C | C | **R** | I | C | **A** |
| Release notes | C | I | I | **R/A** | I | I |
| Version tagging | I | I | **R** | I | C | I |
| Post-mortem (P1) | C | C | **R** | C | **R** | **A** |

---

# 2. RELEASE TYPES

*Aligned with DevOps §14.1*

| Type | Branch | Source → Target | UAT Required | Approval | Frequency |
|------|--------|-----------------|-------------|----------|-----------|
| **Development Release** | `feature/*` → `develop` | Local → Integration | No | PR review + CI | Continuous |
| **QA Release** | `develop` → QA env | Integration → QA | No | Auto (CI pass) | Daily (multiple) |
| **UAT Release** | `release/*` → UAT env | Release candidate → UAT | Self-test by QA | QA Lead | Weekly (Friday) |
| **Production Release** | `release/*` → `main` → Prod | UAT-certified → Production | Yes | CTO/DevOps | Bi-weekly |
| **Hotfix Release** | `hotfix/*` → `main` → Prod | Production fix → Production | Optional (CTO waiver) | CTO | As needed |

## 2.1 Development Release

| Attribute | Value |
|-----------|-------|
| Purpose | Integrate feature work into shared codebase |
| Trigger | PR merge to `develop` |
| Deploy | Auto to QA |
| Testing | CI (unit + integration) + QA smoke |
| Version impact | None |
| Documentation | PR description; linked user story |

## 2.2 QA Release

| Attribute | Value |
|-----------|-------|
| Purpose | Validate integrated features in shared test environment |
| Trigger | Every `develop` merge |
| Environment | `qa-api.kuberone.in`, `qa-admin.kuberone.in` |
| Testing | Automated smoke (25 items) + QA exploratory |
| Rollback | Redeploy previous `develop` SHA |
| SLA | Deploy within 10 minutes of merge |

## 2.3 UAT Release

| Attribute | Value |
|-----------|-------|
| Purpose | Business acceptance of release candidate |
| Trigger | `release/*` branch cut and deploy |
| Environment | `uat-api.kuberone.in`, `uat-admin.kuberone.in`, mobile `preview` |
| Testing | Full regression + UAT scripts (3–5 days) |
| Entry | QA regression pass on `develop`; feature freeze |
| Exit | UAT sign-off + release certification |
| Version tag | `v{X.Y.Z}-rc.{N}` |

## 2.4 Production Release

| Attribute | Value |
|-----------|-------|
| Purpose | Deliver validated features to customers |
| Trigger | `release/*` merged to `main` with approvals |
| Environment | `api.kuberone.in`, `admin.kuberone.in`, production mobile |
| Window | Tuesday or Thursday, 10:00–14:00 IST |
| Pre-deploy | RDS snapshot; migration review |
| Post-deploy | Smoke + 30-minute monitoring |
| Version tag | `v{X.Y.Z}` |

## 2.5 Hotfix Release

| Attribute | Value |
|-----------|-------|
| Purpose | Emergency fix for P1 production issue |
| Trigger | P1 incident or critical security vulnerability |
| Branch | `hotfix/{description}` from `main` |
| UAT | Skipped if CTO waives (documented) |
| Testing | CI + targeted regression (1–4 hours) |
| Deploy | Anytime with CTO approval |
| Post-deploy | Backport `main` → `develop`; post-mortem within 48 hours |
| Version tag | `v{X.Y.Z}-hotfix.{N}` |

---

# 3. BRANCHING STRATEGY

*Aligned with DevOps §13.2*

## 3.1 Branch Model

```
main ─────────────────────────────────────────────► Production
  ↑                    ↑                ↑
  │ hotfix/*           │ release/*      │ (merge back)
  │                    │                │
develop ───────────────────────────────────────────► QA (auto-deploy)
  ↑
  │
feature/* ──► (PR) ──► develop
```

## 3.2 Branch Definitions

| Branch Pattern | Purpose | Deploys To | Auto-Deploy | Lifetime |
|----------------|---------|------------|-------------|----------|
| `main` | Production-ready code | Production | Manual approval | Permanent |
| `develop` | Integration branch | QA | Auto | Permanent |
| `release/*` | Release candidates | UAT | Semi-auto | 1–2 weeks; deleted after merge |
| `feature/*` | Feature development | None (local) | No | Days to 2 weeks |
| `hotfix/*` | Emergency production fixes | Production (fast-track) | Manual + CTO | Hours to 1 day |
| `test/*` | Experimental / spike | None | No | Days; never merged without review |

## 3.3 Branch Protection Rules

| Branch | Protection |
|--------|------------|
| `main` | Require PR; CI pass; 1 approval; no force push; signed commits (Phase 2) |
| `develop` | Require PR; CI pass; 1 approval; no force push |
| `release/*` | Require PR to `main`; CI pass; QA Lead approval |
| `hotfix/*` | Require PR to `main`; CI pass; CTO approval |

## 3.4 Branch Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/{ticket}-{short-description}` | `feature/KUB-142-emi-calculator` |
| Release | `release/v{X.Y.Z}` | `release/v1.4.0` |
| Hotfix | `hotfix/{ticket}-{short-description}` | `hotfix/KUB-999-otp-rate-limit` |
| Test/Spike | `test/{description}` | `test/qdrant-evaluation` |

## 3.5 Merge Flow Rules

| From | To | Method | Gate |
|------|-----|--------|------|
| `feature/*` | `develop` | PR (squash merge) | CI + code review |
| `develop` | `release/*` | Branch cut (not merge) | QA regression pass |
| `release/*` | `main` | PR (merge commit) | UAT sign-off + certification + CTO approval |
| `hotfix/*` | `main` | PR (merge commit) | CTO approval + CI |
| `main` | `develop` | PR (after hotfix) | CI — backport within 24 hours |
| `release/*` | `develop` | PR (if fixes on release branch) | CI — sync before prod merge |

## 3.4 Feature Freeze

| Event | Timing | Rule |
|-------|--------|------|
| Release branch cut | Friday (UAT week) | No new features on `release/*`; bug fixes only |
| Hard freeze | 2 days before production | Only P0/P1 fixes allowed on `release/*` |
| Production deploy day | Deploy morning | No merges to `main` until smoke pass |

---

# 4. DEPLOYMENT STRATEGY

*Aligned with DevOps §13.4 and Backend Blueprint §30*

## 4.1 Deployment Architecture

| Component | Method | Downtime |
|-----------|--------|----------|
| Backend API | Rsync `dist/` + `pm2 reload` (cluster) | Zero (rolling) |
| Workers / Scheduler | `pm2 reload` | Brief job pause (< 5s) |
| Admin Panel | Rsync `dist/` to Nginx static | Zero |
| Database | `prisma migrate deploy` | Zero (additive migrations) |
| Mobile (OTA) | Expo Updates publish | Zero (JS-only) |
| Mobile (Store) | EAS submit → store approval | Store-dependent |
| SSM Secrets | Manual update + `pm2 reload` | Zero |

## 4.2 CD Pipeline Stages

| Stage | Actions | Owner | Duration |
|-------|---------|-------|----------|
| **Pre-Deploy** | Download artifacts; RDS snapshot (prod); `prisma migrate deploy` | CI (automated) | 5–10 min |
| **Deploy Backend** | SSH/rsync; fetch SSM → `.env`; `pm2 reload` | CI (automated) | 3 min |
| **Deploy Admin** | Rsync admin `dist/` | CI (automated) | 2 min |
| **Smoke Test** | Health, auth, products, admin load | CI (automated) | 5 min |
| **Notify** | Slack/email success; update deployment log | CI (automated) | 1 min |
| **Monitor** | 30-minute watch window | DevOps | 30 min |

## 4.3 Environment Deployment Triggers

| Environment | Trigger Branch | Approval | Auto/Semi/Manual |
|-------------|----------------|----------|------------------|
| QA | `develop` merge | None (CI pass) | Auto |
| UAT | `release/*` push/merge | QA Lead | Semi-auto |
| Production | `main` merge | CTO/DevOps | Manual (GitHub environment) |

## 4.4 Database Migration Release Rules

| Rule | Description |
|------|-------------|
| Additive first | New columns nullable or with defaults; no destructive changes in same release |
| UAT first | Every migration runs in UAT before production |
| Review in PR | Backend Lead + DevOps review migration SQL |
| Rollback plan | Every migration PR includes rollback notes |
| Snapshot before prod | RDS manual snapshot automated in pre-deploy |
| No data migration in deploy window | Heavy data migrations run as separate maintenance window |

## 4.5 Mobile Deployment Strategy

| Channel | Type | Cadence | Approval |
|---------|------|---------|----------|
| **OTA (Expo Updates)** | JS/asset-only changes | Weekly | DevOps + QA smoke |
| **Store Release (EAS)** | Native changes, major versions | Monthly or per need | CTO + Product |
| **Preview Build** | UAT testing | Per UAT cycle | QA Lead |

**Mobile release dependency:** Backend API must be deployed and stable before mobile store release pointing to new API features.

## 4.6 Configuration Release

| Config Type | Store | Change Process |
|-------------|-------|----------------|
| SSM parameters | AWS SSM | DevOps ticket; test in UAT first |
| Feature flags | `system_settings` DB table | Admin panel; test in QA |
| Nginx config | EC2 filesystem | DevOps PR to infra repo; test in UAT |
| Product rules | Database seed/admin | Product approval; UAT verification |

---

# 5. RELEASE CADENCE AND CALENDAR

*Aligned with DevOps §14.2*

## 5.1 Standard Cadence

| Release | Schedule | Window (IST) | Owner |
|---------|----------|--------------|-------|
| Production | Bi-weekly (Tuesday or Thursday) | 10:00–14:00 | DevOps |
| UAT | Weekly (Friday) | Anytime | DevOps |
| QA | Continuous (on `develop` merge) | Anytime | Automated |
| Hotfix | As needed | Anytime (with approval) | DevOps |
| Mobile Store | Monthly (or as needed) | Submit Monday; release when approved | Mobile Lead |
| OTA Update | Weekly (JS-only) | Anytime | DevOps |

## 5.2 Two-Week Release Cycle

| Day | Activity |
|-----|----------|
| **Monday (Week 1)** | Sprint ends; features merged to `develop`; QA regression |
| **Tuesday (Week 1)** | QA regression complete; defect fixes |
| **Wednesday (Week 1)** | QA Lead approves `release/*` cut |
| **Thursday (Week 1)** | `release/v{X.Y.Z}` branch cut; deploy to UAT |
| **Friday (Week 1)** | UAT kickoff |
| **Monday–Wednesday (Week 2)** | UAT execution; defect fixes on `release/*` |
| **Thursday (Week 2)** | UAT sign-off; release certification |
| **Friday (Week 2)** | Merge `release/*` → `main` (if Tuesday prod) OR hold for next Tuesday |
| **Tuesday (Week 3)** | Production deploy; smoke; monitor; announce |

## 5.3 Release Calendar (Blackout Periods)

| Period | Rule |
|--------|------|
| Indian public holidays (major) | No production deploy |
| Month-end (last 2 days) | No production deploy (finance reconciliation) |
| Friday after 14:00 IST | No production deploy |
| During active P1 incident | No production deploy until resolved |
| Board meeting day | No production deploy (CTO availability) |

---

# 6. PRODUCTION RELEASE PROCESS

*Aligned with DevOps §14.3 — 14-step process*

| Step | Action | Owner | Duration |
|------|--------|-------|----------|
| 1 | Feature freeze on `release/*` | Product Owner | — |
| 2 | UAT testing complete; sign-off | QA Lead | 2–3 days |
| 3 | Release notes drafted | Product Owner | 1 hour |
| 4 | Merge `release/*` → `main` via PR | DevOps | 15 min |
| 5 | CI pipeline passes | GitHub Actions | 10 min |
| 6 | Manual production deploy approval | CTO/DevOps | — |
| 7 | RDS pre-deploy snapshot | CI (automated) | 5 min |
| 8 | `prisma migrate deploy` | CI (automated) | 2 min |
| 9 | Backend deploy + PM2 reload | CI (automated) | 3 min |
| 10 | Admin deploy | CI (automated) | 2 min |
| 11 | Smoke tests | CI (automated) | 5 min |
| 12 | Mobile OTA publish (if applicable) | DevOps | 5 min |
| 13 | Monitor for 30 minutes | DevOps | 30 min |
| 14 | Release announcement | Product Owner | — |

**Total deploy window:** ~70 minutes (excluding UAT).

## 6.1 Pre-Release Checklist

| # | Item | Owner |
|---|------|-------|
| 1 | UAT sign-off form signed | QA Lead |
| 2 | Release certification issued | QA Lead |
| 3 | Release notes approved | Product Owner |
| 4 | Database migration tested in UAT | Backend Lead |
| 5 | Rollback artifact available | DevOps |
| 6 | On-call engineer confirmed | DevOps |
| 7 | Open P0/P1 defects = 0 | QA Lead |
| 8 | Stakeholders notified of deploy window | Product Owner |

## 6.2 Post-Release Checklist

| # | Item | Owner |
|---|------|-------|
| 1 | Production smoke pass | QA + DevOps |
| 2 | 30-minute monitoring green | DevOps |
| 3 | Git tag `v{X.Y.Z}` created | DevOps |
| 4 | Deployment log updated | DevOps |
| 5 | Release notes published (Slack, email) | Product Owner |
| 6 | `release/*` branch deleted (after merge) | DevOps |
| 7 | `main` → `develop` sync (if hotfix or release fixes) | DevOps |
| 8 | Readiness dashboard updated | QA Lead |

---

# 7. ROLLBACK STRATEGY

*Aligned with DevOps §13.6*

## 7.1 Rollback Methods

| Component | Rollback Method | RTO | Owner |
|-----------|----------------|-----|-------|
| Backend API | Rsync previous release + `pm2 reload` | < 3 minutes | DevOps |
| Admin Panel | Rsync previous `dist/` | < 2 minutes | DevOps |
| Database | Restore RDS pre-deploy snapshot | < 30 minutes | DevOps |
| Mobile App (OTA) | Republish previous Expo update | < 5 minutes | DevOps |
| Mobile App (Store) | Promote previous version in store console | 1–24 hours | Mobile Lead |
| Full rollback | Previous release artifact + RDS snapshot restore | < 1 hour | DevOps |

## 7.2 Rollback Decision Criteria

| Condition | Action | Authority |
|-----------|--------|-----------|
| Smoke tests fail after deploy | Auto-rollback | DevOps |
| Error rate > 5% within 15 minutes | Rollback recommended | DevOps → CTO |
| P1 bug reported within 1 hour | Rollback assessment | CTO |
| Data corruption detected | Immediate full rollback | CTO |
| Performance degradation > 50% p95 | Rollback assessment | DevOps → CTO |

## 7.3 Rollback Procedure

| Step | Action | Owner |
|------|--------|-------|
| 1 | Decision to rollback (criteria met) | CTO/DevOps |
| 2 | Notify stakeholders (Slack P1 channel) | DevOps |
| 3 | Rsync previous backend artifact | DevOps |
| 4 | `pm2 reload kuberone-api` + workers | DevOps |
| 5 | Rsync previous admin `dist/` | DevOps |
| 6 | If DB issue: restore pre-deploy snapshot | DevOps |
| 7 | Run production smoke tests | QA |
| 8 | Confirm monitoring green | DevOps |
| 9 | Log incident; schedule post-mortem | CTO |
| 10 | Create hotfix branch if needed | Backend Lead |

## 7.4 Rollback Artifact Retention

| Artifact | Retention | Storage |
|----------|-----------|---------|
| Backend `dist/` (last 5 releases) | 90 days | S3 `kuberone-artifacts` + EC2 |
| Admin `dist/` (last 5 releases) | 90 days | S3 `kuberone-artifacts` + EC2 |
| RDS pre-deploy snapshots | 90 days | RDS |
| Mobile OTA bundles (last 3) | 60 days | Expo dashboard |
| Git tags | Indefinite | GitHub |

---

# 8. APPROVAL PROCESS

*Aligned with DevOps §13.5*

## 8.1 Environment Approval Gates

| Environment | Approvers | Gate Requirements |
|-------------|-----------|-------------------|
| QA | None (auto on `develop` merge) | CI pass |
| UAT | QA Lead sign-off | CI pass + QA regression pass |
| Production | CTO or DevOps Lead | CI pass + UAT sign-off + certification + manual GitHub approval |
| Hotfix (production) | CTO | CI pass + CTO emergency approval |

## 8.2 Production Approval Workflow

```
Developer → QA Certification → QA Lead Sign-off
    → DevOps Deploy Request → CTO/DevOps GitHub Approval
    → Automated CD Pipeline → Smoke → Monitor
```

| Approval Step | System | Evidence |
|---------------|--------|----------|
| Code review | GitHub PR | Approved review |
| CI pass | GitHub Actions | Green check |
| UAT sign-off | QA test management | Signed form |
| Certification | QA Lead document | Certification PDF |
| Production approval | GitHub Environment `production` | Manual approval by CTO/DevOps |
| Deploy execution | GitHub Actions CD | Deployment log |

## 8.3 Hotfix Approval Workflow

| Step | Requirement |
|------|-------------|
| 1 | P1 incident confirmed or critical CVE |
| 2 | `hotfix/*` branch from `main` |
| 3 | Fix + CI pass + targeted regression |
| 4 | CTO written approval (Slack/email/ticket) |
| 5 | Deploy via same CD pipeline |
| 6 | UAT waiver documented (if UAT skipped) |
| 7 | Backport to `develop` within 24 hours |
| 8 | Post-mortem within 48 hours |

## 8.4 Waiver Authority

| Waiver Type | Authority | Documentation |
|-------------|-----------|---------------|
| UAT skip (hotfix) | CTO | Waiver email + ticket |
| Production deploy outside window | CTO | Change ticket |
| Known S3 defect ship | Product + QA Lead + CTO | Release notes known issues |
| Blackout period deploy | CTO + Board notification | Change ticket |

*Non-negotiable items per Production Readiness Framework §5.5 cannot be waived.*

---

# 9. VERSIONING AND TAGGING

*Aligned with DevOps §14.5*

## 9.1 Version Format

| Tag Format | Example | When |
|------------|---------|------|
| `v{MAJOR}.{MINOR}.{PATCH}` | `v1.4.0` | Every production release |
| `v{MAJOR}.{MINOR}.{PATCH}-hotfix.{N}` | `v1.4.1-hotfix.1` | Hotfix releases |
| `v{MAJOR}.{MINOR}.{PATCH}-rc.{N}` | `v1.5.0-rc.1` | UAT release candidates |

## 9.2 Semantic Versioning Rules

| Bump | When | Example |
|------|------|---------|
| **MAJOR** | Breaking API change; major platform shift | `v1.x.x` → `v2.0.0` |
| **MINOR** | New feature; new module; new product | `v1.4.x` → `v1.5.0` |
| **PATCH** | Bug fix; security patch; no new features | `v1.4.0` → `v1.4.1` |

## 9.3 Component Versioning

| Component | Version Source | Notes |
|-----------|---------------|-------|
| Backend API | Git tag; `package.json` | Tag is authoritative |
| Admin Panel | Git tag (same as backend release) | Deployed together |
| Customer Mobile | `app.json` `version` + `versionCode`/`buildNumber` | Store semver independent |
| DSA Mobile | Same as customer | Separate app identity |
| Database schema | Prisma migration timestamp | Not user-facing |
| OpenAPI spec | `info.version` in spec | Matches API tag |

## 9.4 API Versioning

| Version | Path | Status |
|---------|------|--------|
| v1 | `/v1/*` | Current (Phase 1) |
| v2 | `/v2/*` | Future — breaking changes only |

**Rule:** No breaking changes within `v1`. Deprecation uses `Sunset` header with 90-day notice.

---

# 10. PRODUCTION GOVERNANCE

## 10.1 Production Access Control

| Rule | Implementation |
|------|----------------|
| No developer SSH to production | DevOps only via bastion (Phase 2) |
| No direct database access | DevOps via RDS console; read-only for reporting |
| Admin panel IP whitelist | Nginx `allow` directive |
| Deploy only via CI/CD | No manual `pm2` commands without ticket |
| Secrets only in SSM | No `.env` in repository |

## 10.2 Production Change Categories

| Category | Approval | Lead Time |
|----------|----------|-----------|
| Standard release | CTO/DevOps | 2-week cycle |
| Config change (SSM) | DevOps + Backend Lead | 24 hours |
| Infrastructure change | CTO + DevOps | 48 hours |
| Emergency hotfix | CTO | Immediate |
| Database migration | Backend Lead + DevOps | Included in release |
| AI KB content update | AI Lead + Product | 24 hours (no deploy needed) |

## 10.3 Production Monitoring Governance

| Metric | Threshold | Action |
|--------|-----------|--------|
| API error rate | > 1% sustained 5 min | P2 alert |
| API error rate | > 5% sustained 5 min | P1 alert; rollback assessment |
| p95 latency | > 500ms sustained 10 min | P2 alert |
| PM2 restart | > 3 in 10 min | P2 alert |
| RDS CPU | > 80% sustained 15 min | P2 alert |
| Disk usage | > 85% | P2 alert |
| SSL expiry | < 14 days | P3 alert |
| Backup failure | Any | P1 alert |

## 10.4 Release Audit Trail

| Record | Retention | Storage |
|--------|-----------|---------|
| Git PR + merge commit | Indefinite | GitHub |
| CI/CD logs | 2 years | GitHub Actions |
| Deployment log | 2 years | S3 + internal wiki |
| UAT sign-off forms | 3 years | QA document store |
| Release certification | 3 years | QA document store |
| CTO approval records | 3 years | GitHub Environment logs |
| Rollback incidents | 5 years | Incident management system |
| Post-mortem reports | 5 years | Incident management system |

## 10.5 Release Communication

| Audience | Channel | Timing | Content |
|----------|---------|--------|---------|
| Engineering | Slack `#releases` | Deploy start + complete | Version, scope, deploy status |
| Business / Sales | Email | Post-deploy | Release notes (business language) |
| DSA partners | WhatsApp / email (major only) | Post-deploy | Feature highlights |
| Customers | In-app notification (major only) | Post-deploy | New feature announcement |
| Board / Investors | Monthly summary | Monthly | Release count, quality metrics |

## 10.6 Release Notes Template

| Section | Content |
|---------|---------|
| Version | `v{X.Y.Z}` |
| Date | Deploy date |
| Summary | 1–2 sentence overview |
| New Features | Bullet list with user benefit |
| Improvements | Performance, UX enhancements |
| Bug Fixes | Notable fixes (no internal jargon) |
| Breaking Changes | If any (rare in Phase 1) |
| Database Migrations | Yes/No; downtime expected |
| Mobile Updates | OTA / Store / None |
| Known Issues | With workarounds |
| Rollback Plan | One-line summary |

---

# 11. HOTFIX MANAGEMENT

*Aligned with DevOps §14.4*

## 11.1 Hotfix Triggers

| Trigger | Severity | UAT Waiver Eligible |
|---------|----------|---------------------|
| Production down | P1 | Yes |
| Data corruption / financial error | P1 | Yes |
| Security vulnerability (critical CVE) | P1 | Yes |
| RBAC bypass discovered | P1 | Yes |
| Major feature broken (no workaround) | P2 | Case-by-case |
| Performance degradation | P2 | No — use standard release |

## 11.2 Hotfix Process

| Scenario | Process |
|----------|---------|
| P1 production bug | Create `hotfix/{description}` from `main` |
| Fix + test locally | Developer |
| PR to `main` with CTO approval | Skip UAT if CTO waives |
| Deploy to production | Same CD pipeline |
| Backport to `develop` | Merge `main` → `develop` after hotfix |
| Post-mortem | Within 48 hours for P1 |

## 11.3 Hotfix vs Standard Release Decision Tree

```
P1 incident?
├── Yes → Hotfix path (CTO approval)
│         └── UAT waived? → CTO documents waiver
└── No → Can wait for next bi-weekly?
    ├── Yes → Standard release
    └── No (P2 urgent) → Expedited release (UAT compressed to 1 day)
```

---

# 12. RELEASE METRICS

| Metric | Target | Review |
|--------|--------|--------|
| Release frequency | Bi-weekly (26/year) | Monthly |
| On-time release rate | > 95% | Monthly |
| Release-induced incidents (P1/P2) | < 5% of releases | Per release |
| Mean time to rollback | < 10 minutes (decision + execution) | Per incident |
| UAT cycle duration | 3–5 business days | Per release |
| Hotfix frequency | < 2/month at maturity | Monthly |
| Deploy failure rate (smoke fail) | < 3% | Monthly |
| Change failure rate (DORA) | < 15% | Quarterly |

---

# 13. RELEASE RISK REGISTER

| # | Risk | Mitigation |
|---|------|------------|
| 1 | Database migration failure in production | UAT migration test; pre-deploy snapshot; additive-only rule |
| 2 | Mobile store rejection delays release | Submit 1 week early; parallel OTA for JS fixes |
| 3 | UAT cycle exceeds 5 days | Feature freeze discipline; QA automation |
| 4 | Hotfix introduces regression | Targeted regression mandatory; backport to develop |
| 5 | Monorepo merge conflicts on release branch | Short-lived `release/*`; daily sync from develop |
| 6 | AI KB content incompatible with release | KB updates decoupled from code deploy |
| 7 | Third-party API outage during deploy | Deploy during low-traffic window; feature flags |
| 8 | Key person unavailable for approval | Deputy approver (Backend Lead for CTO) |

---

# APPENDIX A: RELEASE TYPE DECISION MATRIX

| Scenario | Release Type |
|----------|-------------|
| New feature ready; bi-weekly window approaching | UAT → Production |
| Bug fix on `develop`; not yet release week | QA Release only |
| P1 production outage | Hotfix |
| Security CVE critical | Hotfix |
| Mobile JS-only UI fix | OTA (weekly) |
| Mobile native module change | Store Release |
| Database schema change | Included in Production Release |
| AI KB new articles | Content update (no code deploy) |
| Infrastructure scaling | DevOps change (outside release) |

---

# APPENDIX B: BRANCH LIFECYCLE DIAGRAM

```
Week 1                          Week 2                          Week 3
──────                          ──────                          ──────
feature/KUB-100 ──PR──► develop ──► QA auto-deploy
feature/KUB-101 ──PR──► develop ──► QA auto-deploy
                                │
                        release/v1.4.0 cut (Thursday W1)
                                │
                                ▼
                        UAT deploy (Thursday W1)
                        UAT testing (Fri W1 – Wed W2)
                        UAT sign-off (Thursday W2)
                        Certification (Thursday W2)
                                │
                        release/v1.4.0 ──PR──► main (Friday W2)
                                │
                                ▼
                        Production deploy (Tuesday W3)
                        Tag v1.4.0
                        Delete release/v1.4.0
```

---

# APPENDIX C: DEPLOYMENT LOG TEMPLATE

| Field | Value |
|-------|-------|
| Release Version | |
| Git Tag | |
| Git SHA | |
| Deploy Date/Time (IST) | |
| Deployed By | |
| Approved By | |
| Environment | Production |
| Components | Backend / Admin / Mobile OTA / Migration |
| RDS Snapshot ID | |
| Migration Applied | Yes / No — migration names |
| Smoke Test Result | Pass / Fail |
| Rollback Required | Yes / No |
| Monitoring (30 min) | Green / Issues |
| Release Notes Link | |
| Incidents | None / Reference |

---

# APPENDIX D: CROSS-REFERENCE INDEX

| Topic | Document | Section |
|-------|----------|---------|
| CI pipeline stages | DevOps | §13.3 |
| CD pipeline stages | DevOps | §13.4 |
| Branch strategy | DevOps | §13.2 |
| Approval gates | DevOps | §13.5 |
| Rollback methods | DevOps | §13.6 |
| Release types | DevOps | §14.1 |
| Release cadence | DevOps | §14.2 |
| Production process | DevOps | §14.3 |
| Hotfix strategy | DevOps | §14.4 |
| Version tagging | DevOps | §14.5 |
| UAT process | QA Strategy | §7 |
| Certification | QA Strategy | §6 |
| Go-live gates | Production Readiness Framework | §6 |
| PM2 deploy | Backend Blueprint | §30.2–30.4 |
| Mobile deploy | DevOps | §9 |

---

**Document Status:** Authoritative Release Management Framework (B6)  
**Next Review:** Quarterly  
**Approval:** CTO · DevOps Lead · QA Lead · Product Owner
