# KuberOne
## DevOps & Deployment Architecture Document

**Company:** Kuber Finserve  
**Website:** [https://kuberfinserve.com](https://kuberfinserve.com)  
**Document Type:** Enterprise DevOps & Deployment Architecture (DDA)  
**Classification:** AWS Ready | EC2 Ready | PM2 Ready | Nginx Ready | Production Ready | Enterprise Ready  
**Version:** 1.0  
**Date:** June 2026  
**Deployment Stack:** Ubuntu Server · AWS EC2 · PM2 · Nginx · SSL · No Docker  
**Related Documents:**
- [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md)
- [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md)
- [KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md](./KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md)
- [KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md](./KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md)
- [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md)
- [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md)
- [KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md](./KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md)
- [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md)
- [KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md](./KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md)

---

## Document Control

| Field | Value |
|-------|-------|
| **Product** | KuberOne — AI-Powered Financial Services Ecosystem |
| **Scope** | Complete DevOps architecture — infrastructure, deployment, CI/CD, monitoring, security, backup, DR, operations |
| **Audience** | CTO, DevOps, SRE, Security, Engineering Leads, QA, Management, Board |
| **Status** | Authoritative DevOps Master Blueprint |
| **Out of Scope** | Source code, Docker/Kubernetes, Terraform scripts, shell scripts, API implementations |

---

## Architecture Statistics

| Metric | Value |
|--------|-------|
| **Environments** | 4 (Development, QA, UAT, Production) |
| **AWS Region (Primary)** | ap-south-1 (Mumbai) |
| **EC2 Instances (Phase 1 Prod)** | 1 app server |
| **EC2 Instances (Phase 2 Prod)** | 2 app + 1 worker |
| **PM2 Processes (Phase 1)** | 4 (API ×2, workers, scheduler) |
| **S3 Buckets (Prod)** | 6 |
| **Subdomains** | 5+ |
| **CI/CD Stages** | 8 |
| **RPO** | 1 hour |
| **RTO** | 4 hours |
| **Availability Target** | 99.9% |
| **Go-Live Checklist Items** | 80+ |

---

# 30. EXECUTIVE SUMMARY

*CTO-level summary — presented first for board and leadership review.*

## Strategic Intent

KuberOne requires an infrastructure and deployment architecture that supports a **regulated fintech platform** — multi-channel (customer app, DSA app, CRM admin), **AI-native** (OpenAI GPT, RAG, Voice AI), and **document-heavy** (KYC, loan documents, commission statements) — while remaining **operationally simple**, **cost-efficient**, and **production-ready** without container orchestration overhead.

The chosen deployment model — **Ubuntu on AWS EC2**, **PM2 process management**, **Nginx reverse proxy**, **RDS MySQL**, **S3 object storage** — deliberately avoids Docker/Kubernetes in Phase 1–2 to maximize engineering velocity and minimize DevOps complexity for a growth-stage fintech.

## Infrastructure Benefits

| Benefit | How Architecture Delivers |
|---------|---------------------------|
| **Single-region simplicity** | Mumbai (ap-south-1) for data residency and low latency |
| **Proven fintech stack** | Node.js + MySQL + S3 — battle-tested in Indian fintech |
| **Zero-downtime deploys** | PM2 cluster reload without Kubernetes |
| **Unified deployment unit** | Modular monolith — one API deploy serves all clients |
| **Document compliance** | S3 versioning + encryption + audit trail |
| **Operational transparency** | PM2 + Nginx + CloudWatch — observable without complexity |

## Security Benefits

| Benefit | Implementation |
|---------|----------------|
| **Defense in depth** | Nginx → Express → RBAC → DB; layered security |
| **Encryption everywhere** | TLS 1.3 in transit; SSE-S3 + RDS encryption at rest |
| **Secrets isolation** | AWS SSM Parameter Store — never in Git |
| **Network hardening** | Security groups, IP whitelisting for admin, rate limiting |
| **Audit readiness** | Structured logs, access logs, audit trail per RBAC spec |
| **DPDP/RBI alignment** | Data residency, retention policies, access controls |

## Scalability Benefits

| Phase | Scale | Infrastructure Response |
|-------|-------|------------------------|
| **Year 1** | 10K MAU, 50K leads | Single EC2 + RDS + S3 |
| **Year 3** | 100K MAU, 500K leads | ALB + 2 EC2 + read replica + Redis + worker EC2 |
| **Year 5** | 1M+ MAU, 2M+ leads | 4–8 EC2 + extracted workers + CDN + multi-AZ DR |

Architecture supports horizontal scaling **without redesign** — add EC2 instances behind ALB, add read replicas, extract worker processes.

## Cost Benefits

| Decision | Monthly Savings vs. Alternatives |
|----------|----------------------------------|
| PM2 on EC2 (not EKS/Kubernetes) | ₹30K–80K/month avoided orchestration cost |
| Modular monolith (not microservices) | Single deploy; one DevOps engineer sufficient Phase 1 |
| RDS (not self-managed MySQL) | Automated backup, patching, failover |
| S3 (not EBS for documents) | 10× cheaper per GB for document storage |
| OpenAI API (not self-hosted GPU) | No GPU EC2 instances (₹50K+/month avoided) |
| Expo OTA (not full store releases) | Faster hotfix delivery; reduced store review cycles |

**Estimated Phase 1 Production Infrastructure Cost:** ₹45,000–65,000/month (EC2 + RDS + S3 + monitoring + SSL).

## Future Readiness

- **Microservices extraction path** defined — notification, AI, analytics workers separable
- **Multi-region DR** architecture planned (Phase 3) — RDS snapshot + S3 CRR
- **Lender API integrations** — dedicated integration subnet and credential vault
- **Product expansion** — insurance, cards, MF modules deploy as backend modules, not new infrastructure
- **Voice AI scale** — WebSocket-capable Nginx config; dedicated worker EC2 for realtime

**Board Recommendation:** Approve this DevOps & Deployment Architecture as the master operations blueprint. Budget for Phase 1 infrastructure (₹45K–65K/month), one DevOps/SRE resource, and quarterly DR drill.

---

# 1. DEVOPS VISION

## 1.1 Infrastructure Goals

| # | Goal | Success Metric | Timeline |
|---|------|----------------|----------|
| 1 | **Production-ready from day one** | All environments operational before go-live | Week 1 of infra setup |
| 2 | **99.9% availability** | < 8.7 hours downtime/year | Ongoing |
| 3 | **Zero-downtime deployments** | PM2 reload with no user-facing outage | Every release |
| 4 | **Infrastructure as documented** | 100% alignment with this blueprint | Every change |
| 5 | **Automated CI/CD** | No manual deploy steps except production approval | Phase 1 |
| 6 | **Observable systems** | Health, metrics, logs accessible within 2 minutes | Phase 1 |
| 7 | **Recoverable systems** | DR drill successful quarterly | Quarterly |

## 1.2 Reliability Goals

| Goal | Target | Mechanism |
|------|--------|-----------|
| API uptime | 99.9% | PM2 auto-restart, health checks, ALB (Phase 2) |
| Database availability | 99.95% | RDS Multi-AZ (Production) |
| Document durability | 99.999999999% (11 nines) | S3 standard + versioning |
| Deployment success rate | > 99% | CI gates + smoke tests + rollback plan |
| Mean time to detect (MTTD) | < 5 minutes | Uptime monitor + alerting |
| Mean time to recover (MTTR) | < 4 hours | Documented runbooks + DR process |
| Backup success rate | 100% | Automated RDS snapshots + verification job |

## 1.3 Security Goals

| Goal | Implementation |
|------|----------------|
| No secrets in repository | AWS SSM Parameter Store + `.env` excluded from Git |
| TLS everywhere | ACM certificates; HTTPS-only; HSTS |
| Least-privilege access | IAM roles per EC2; no root API keys |
| Network isolation | Security groups; admin IP whitelist |
| Vulnerability management | npm audit in CI; monthly OS patching |
| Incident response | Documented security runbook; 1-hour P1 response |
| Compliance audit trail | Structured audit logs per RBAC specification |

## 1.4 Performance Goals

| Component | Target (p95) | Measurement |
|-----------|-------------|-------------|
| API (non-AI) | < 300ms | Application logs + APM |
| API (AI streaming) | < 5s first token | AI session logs |
| Admin panel load | < 2s (LCP) | Lighthouse / Web Vitals |
| Mobile app cold start | < 3s | Expo performance monitoring |
| Document presign | < 100ms | API logs |
| Database queries | < 50ms (simple) | Slow query log |
| Nginx proxy overhead | < 10ms | Nginx access logs |

## 1.5 Scalability Goals

| Horizon | Users | Leads/Year | Applications/Year | Infrastructure |
|---------|-------|------------|-------------------|----------------|
| Year 1 | 10K MAU | 50K | 15K | 1 EC2 + RDS medium |
| Year 3 | 100K MAU | 500K | 150K | 2 EC2 + ALB + replica + worker |
| Year 5 | 1M MAU | 2M | 600K | 4–8 EC2 + CDN + multi-region DR |

## 1.6 Cost Optimization Goals

| Goal | Strategy |
|------|----------|
| Right-size instances | Start t3.large; scale based on CloudWatch metrics |
| Reserved instances | 1-year RI for production EC2/RDS after 3 months stable |
| S3 lifecycle policies | Glacier for documents > 2 years |
| OpenAI cost control | Per-environment budgets; rate limits; caching |
| Monitoring cost | CloudWatch basic; Sentry free tier Phase 1 |
| Eliminate waste | Terminate unused dev/test resources nightly (QA) |

---

# 2. ENVIRONMENT STRATEGY

## 2.1 Environment Overview

| Environment | Purpose | Users | Data Sensitivity |
|-------------|---------|-------|------------------|
| **Development** | Active engineering; feature branches | Developers | Synthetic / anonymized |
| **QA** | Automated testing; integration validation | QA team | Test data (generated) |
| **UAT** | Business acceptance; stakeholder demo | Product, Business, Compliance | Masked production-like |
| **Production** | Live customer-facing system | All end users | Real PII; regulated |

## 2.2 Development Environment

| Attribute | Specification |
|-----------|---------------|
| **Purpose** | Local and shared dev for feature development |
| **Infrastructure** | Developer laptops + optional shared dev EC2 |
| **Database** | Local MySQL 8 (Docker optional for local DB only) or shared dev RDS |
| **Storage** | Local filesystem or `kuberone-documents-dev` S3 bucket |
| **AI** | OpenAI API with dev API key; lower rate limits |
| **Integrations** | Mock/sandbox for SMS, WhatsApp, payment |
| **Branch** | `feature/*`, `develop` |
| **Deploy trigger** | Manual (developer machine) |
| **Access** | All developers (VPN not required for local) |
| **SSL** | Not required (localhost) |
| **Monitoring** | Local PM2 logs only |

**Deployment Rules:**
- No production data in development
- No production secrets in development `.env`
- Feature branches merge to `develop` via PR
- Local `prisma migrate dev` for schema changes

**Security Rules:**
- `.env` files in `.gitignore` — enforced by pre-commit hook
- No real customer PII in dev database
- OpenAI dev key with $50/month budget cap

## 2.3 QA Environment

| Attribute | Specification |
|-----------|---------------|
| **Purpose** | Automated integration tests; regression testing |
| **Infrastructure** | EC2 t3.medium (`kuberone-qa-app`) |
| **Database** | RDS db.t3.micro (`kuberone-qa-db`) |
| **Storage** | `kuberone-documents-qa` S3 bucket |
| **AI** | OpenAI API with QA key |
| **Integrations** | Sandbox credentials |
| **Branch** | `develop`, `release/*` (pre-UAT) |
| **Deploy trigger** | Automatic on merge to `develop` |
| **Access** | Developers, QA team (SSH key + security group) |
| **SSL** | `qa-api.kuberone.in` (ACM) |
| **Monitoring** | Basic CloudWatch + test result dashboard |

**Deployment Rules:**
- Auto-deploy on `develop` merge after CI passes
- Database seeded with test fixtures (not production data)
- Nightly database reset (optional — configurable)
- QA EC2 stopped outside business hours (cost saving)

**Security Rules:**
- Separate AWS credentials from production
- IP-restricted SSH access (office VPN + CI runner)
- No production SSM parameters accessible from QA

## 2.4 UAT Environment

| Attribute | Specification |
|-----------|---------------|
| **Purpose** | Business acceptance testing; compliance review; demo |
| **Infrastructure** | EC2 t3.large (`kuberone-uat-app`) |
| **Database** | RDS db.t3.small (`kuberone-uat-db`) |
| **Storage** | `kuberone-documents-uat` S3 bucket |
| **AI** | OpenAI API with UAT key |
| **Integrations** | Sandbox / staging credentials |
| **Branch** | `release/*` |
| **Deploy trigger** | Manual or CI on `release/*` tag |
| **Access** | QA, Product, Business, Compliance (read); DevOps (deploy) |
| **SSL** | `uat-api.kuberone.in`, `uat-admin.kuberone.in` |
| **Monitoring** | CloudWatch + uptime monitor |

**Deployment Rules:**
- Deploy only from `release/*` branches
- UAT sign-off required before production promotion
- Database migrations tested in UAT before production
- Mobile apps point to UAT API via build flavor
- UAT data masked from production (never copy raw PII)

**Security Rules:**
- RBAC fully enforced (same as production)
- Audit logging enabled
- Compliance team has read access to UAT logs
- WhatsApp/sandbox only — no real customer messaging

## 2.5 Production Environment

| Attribute | Specification |
|-----------|---------------|
| **Purpose** | Live system serving customers, DSAs, and internal users |
| **Infrastructure** | EC2 t3.large × 1 (Phase 1) → × 2 + ALB (Phase 2) |
| **Database** | RDS db.t3.medium Multi-AZ (Phase 1) → db.r5.large (Phase 2) |
| **Storage** | Production S3 buckets (6 buckets) |
| **AI** | OpenAI API production key with budget alerts |
| **Integrations** | Production credentials (WhatsApp, FCM, SMS) |
| **Branch** | `main` only |
| **Deploy trigger** | Manual approval after UAT sign-off |
| **Access** | DevOps (deploy); CTO (approve); no developer SSH in prod |
| **SSL** | `api.kuberone.in`, `admin.kuberone.in`, `cdn.kuberone.in` |
| **Monitoring** | Full stack — CloudWatch, Sentry, uptime, alerts |

**Deployment Rules:**
- Production deploy requires: CI pass + UAT sign-off + CTO/DevOps approval
- Deploy window: Tuesday–Thursday, 10:00–14:00 IST (avoid weekends/holidays)
- `prisma migrate deploy` before application reload
- Post-deploy smoke tests mandatory
- Rollback plan documented before every production deploy
- Hotfix branch (`hotfix/*`) can bypass UAT with CTO approval

**Security Rules:**
- No direct developer SSH — DevOps only via bastion (Phase 2)
- All secrets in SSM Parameter Store
- WAF rules on API (Phase 2)
- Admin panel IP whitelist (office + VPN)
- MFA required for AWS console access
- Quarterly penetration test
- All mutations audited per RBAC specification

## 2.6 Environment Comparison Matrix

| Dimension | Development | QA | UAT | Production |
|-----------|-------------|-----|-----|------------|
| EC2 Size | Local / none | t3.medium | t3.large | t3.large (×2 Phase 2) |
| RDS Size | Local / micro | db.t3.micro | db.t3.small | db.t3.medium Multi-AZ |
| Multi-AZ | No | No | No | Yes |
| SSL | No | Yes | Yes | Yes |
| Auto-deploy | No | Yes | Semi-auto | No (manual approval) |
| Real PII | No | No | Masked | Yes |
| OpenAI Budget | $50/mo | $100/mo | $200/mo | $500–860/mo |
| Backup | No | Daily (7-day) | Daily (14-day) | Daily (35-day) + PITR |
| Monitoring | Minimal | Basic | Standard | Full |
| Cost/month | ~₹0 | ~₹8K | ~₹15K | ~₹45K–65K |

---

# 3. INFRASTRUCTURE OVERVIEW

## 3.1 Platform Infrastructure Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           KUBERONE INFRASTRUCTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CLIENTS                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Customer App │  │   DSA App    │  │ Admin Panel  │  │  Voice AI    │    │
│  │ (Expo/RN)    │  │ (Expo/RN)    │  │ (React/Vite) │  │ (In-App)     │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │                 │              │
│         └─────────────────┴─────────────────┴─────────────────┘              │
│                                    │                                         │
│                          Route 53 (DNS)                                      │
│                                    │                                         │
│  ┌─────────────────────────────────┴─────────────────────────────────────┐  │
│  │                    AWS ap-south-1 (Mumbai)                             │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ EC2: APP SERVER (Ubuntu 22.04 LTS)                              │  │  │
│  │  │ ├── Nginx (SSL termination, reverse proxy, static admin)        │  │  │
│  │  │ ├── PM2: kuberone-api (cluster ×2)                              │  │  │
│  │  │ ├── PM2: kuberone-workers (notification, commission, OCR)       │  │  │
│  │  │ └── PM2: kuberone-scheduler (cron jobs)                         │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ EC2: WORKER SERVER (Phase 2)                                    │  │  │
│  │  │ ├── PM2: ai-worker (RAG indexing, OCR queue)                    │  │  │
│  │  │ ├── PM2: report-worker (PDF generation)                         │  │  │
│  │  │ └── PM2: workflow-worker (SLA, stage automation)              │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │ RDS MySQL 8  │  │   AWS S3     │  │ ElastiCache  │                │  │
│  │  │ (Multi-AZ)   │  │ (6 buckets)  │  │ Redis (Ph.2) │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  │                                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │ CloudWatch   │  │  SSM Params  │  │     ACM      │                │  │
│  │  │ (Monitoring) │  │  (Secrets)   │  │   (SSL)      │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  EXTERNAL SERVICES                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ OpenAI   │ │ Firebase │ │ WhatsApp │ │ Deepgram │ │ElevenLabs│        │
│  │ GPT API  │ │   FCM    │ │ Business │ │   STT    │ │   TTS    │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                                              │
│  MOBILE DISTRIBUTION                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │ Google Play  │  │  App Store   │  │  Expo OTA    │                      │
│  │   Store      │  │  (iOS)       │  │  Updates     │                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3.2 Component Infrastructure Matrix

| Component | Technology | Hosting | Phase 1 | Phase 2 |
|-----------|------------|---------|---------|---------|
| **Customer App** | React Native (Expo) | Play Store + App Store | Launch | OTA updates |
| **DSA App** | React Native (Expo) | Play Store + App Store | Launch | OTA updates |
| **Admin Panel** | React.js + Vite + TypeScript | Nginx static on EC2 | Same EC2 as API | CDN (CloudFront) |
| **Backend API** | Node.js + Express + TypeScript | PM2 cluster on EC2 | 1 EC2, 2 instances | 2 EC2 + ALB |
| **Background Workers** | Node.js workers | PM2 fork on EC2 | Same EC2 | Dedicated worker EC2 |
| **Scheduler** | node-cron | PM2 fork on EC2 | Same EC2 | Same EC2 |
| **Database** | MySQL 8 | AWS RDS | db.t3.medium Multi-AZ | + read replica |
| **ORM** | Prisma | Runs in Node process | Bundled with API | Same |
| **File Storage** | AWS S3 | S3 ap-south-1 | 6 buckets | + CRR |
| **AI Layer** | OpenAI GPT + RAG | API calls from backend | Same EC2 workers | Dedicated AI worker |
| **Voice AI** | OpenAI Realtime, Deepgram, ElevenLabs | API calls from backend | Same EC2 | WebSocket via Nginx |
| **Push Notifications** | Firebase FCM | External SaaS | API integration | Same |
| **Messaging** | WhatsApp Business API | External SaaS | API integration | Same |
| **Monitoring** | CloudWatch + PM2 + Sentry | AWS + external | Basic | Full APM |
| **Backup** | RDS snapshots + S3 versioning | AWS managed | Daily | + cross-region |
| **DNS** | Route 53 | AWS | 5 subdomains | + health checks |
| **SSL** | ACM | AWS | Auto-renew | Same |
| **Secrets** | SSM Parameter Store | AWS | All environments | + rotation |

## 3.3 AWS Account Structure

| Account / OU | Purpose | Environments |
|--------------|---------|--------------|
| **KuberOne Production** | Live infrastructure | Production |
| **KuberOne Non-Production** | Dev, QA, UAT | QA, UAT, shared dev |
| **KuberOne Shared Services** | Route 53, ACM (wildcard), billing | Cross-account |

**IAM Strategy:** EC2 instance roles (no long-lived access keys). CI/CD uses OIDC federation with GitHub Actions (no stored AWS keys).

---

# 4. SERVER ARCHITECTURE

## 4.1 EC2 Instance Strategy

| Instance | Name | Type (Phase 1) | Type (Phase 2) | OS | Purpose |
|----------|------|----------------|----------------|-----|---------|
| App Server 1 | `kuberone-prod-app-01` | t3.large (2 vCPU, 8GB) | t3.xlarge | Ubuntu 22.04 LTS | Nginx + API + workers + admin static |
| App Server 2 | `kuberone-prod-app-02` | — | t3.large | Ubuntu 22.04 LTS | Nginx + API (ALB target) |
| Worker Server | `kuberone-prod-worker-01` | — | t3.large | Ubuntu 22.04 LTS | AI, report, workflow workers |
| QA Server | `kuberone-qa-app` | t3.medium | t3.medium | Ubuntu 22.04 LTS | QA environment |
| UAT Server | `kuberone-uat-app` | t3.large | t3.large | Ubuntu 22.04 LTS | UAT environment |

## 4.2 Application Server Layout (Production Phase 1)

```
/var/www/kuberone/
├── backend/                    # Compiled Node.js API (dist/)
│   ├── dist/
│   ├── node_modules/           # Production dependencies only
│   ├── prisma/
│   └── ecosystem.config.js     # PM2 configuration
├── admin/                      # Vite build output (static)
│   └── dist/
│       ├── index.html
│       ├── assets/
│       └── ...
└── releases/                   # Previous deployments (rollback)
    ├── 2026-06-01-v1.0.0/
    └── 2026-06-05-v1.0.1/

/var/log/kuberone/
├── nginx/
│   ├── access.log
│   └── error.log
├── pm2/
│   ├── kuberone-api-out.log
│   ├── kuberone-api-error.log
│   ├── kuberone-workers-out.log
│   └── kuberone-scheduler-out.log
└── application/
    └── app.log                 # Structured JSON logs (optional file)
```

## 4.3 Database Server (RDS)

| Attribute | Phase 1 (Production) | Phase 2 | Phase 3 |
|-----------|---------------------|---------|---------|
| Engine | MySQL 8.0 | MySQL 8.0 | MySQL 8.0 |
| Instance | db.t3.medium | db.r5.large | db.r5.xlarge |
| Storage | 100 GB gp3 | 250 GB gp3 | 500 GB gp3 |
| Multi-AZ | Yes | Yes | Yes |
| Read Replica | No | 1 replica | 2 replicas |
| Backup Retention | 35 days | 35 days | 35 days |
| PITR | Enabled | Enabled | Enabled |
| Encryption | AES-256 at rest | AES-256 | AES-256 |
| Parameter Group | Custom (innodb, slow query) | + RDS Proxy (Phase 2) | RDS Proxy |
| Maintenance Window | Sunday 03:00–04:00 IST | Same | Same |

## 4.4 Storage Layer

| Layer | Service | Purpose |
|-------|---------|---------|
| **Object Storage** | S3 (6 buckets) | Documents, assets, reports, backups, AI artifacts |
| **CDN** | CloudFront | Static assets, product images (Phase 1.5) |
| **Block Storage** | EBS (EC2 root) | 50 GB gp3 per EC2 instance |
| **Backup Storage** | S3 `kuberone-backups-prod` | RDS snapshot exports, config backups |

## 4.5 Monitoring Layer

| Component | Tool | Location |
|-----------|------|----------|
| Process monitoring | PM2 | On each EC2 |
| Infrastructure metrics | CloudWatch | AWS managed |
| Application errors | Sentry | External SaaS |
| Uptime monitoring | UptimeRobot / Pingdom | External |
| Log aggregation | CloudWatch Logs (Phase 1) → Loki (Phase 2) | AWS / self-hosted |
| SSL monitoring | ACM auto-renew + expiry alert | AWS |
| Cost monitoring | AWS Cost Explorer + budgets | AWS |

## 4.6 Future Expansion Strategy

| Trigger | Expansion Action |
|---------|-----------------|
| CPU > 70% sustained (7 days) | Upgrade EC2 instance type |
| API latency p95 > 500ms | Add second EC2 + ALB |
| Worker queue depth > 1000 | Add dedicated worker EC2 |
| DB connections > 80% | Add RDS Proxy + read replica |
| Storage > 80% | Increase RDS storage (online) |
| AI token cost > budget | Dedicated AI worker + request queuing |
| Multi-region requirement | DR region (ap-southeast-1) with RDS snapshot restore |
| Microservices extraction | Move notification/AI modules to separate EC2 with shared ALB |

---

# 5. NETWORK ARCHITECTURE

## 5.1 VPC Design

| Component | CIDR | Purpose |
|-----------|------|---------|
| VPC | 10.0.0.0/16 | KuberOne production VPC |
| Public Subnet (AZ-a) | 10.0.1.0/24 | EC2 app servers, ALB |
| Public Subnet (AZ-b) | 10.0.2.0/24 | EC2 app server 2 (Phase 2) |
| Private Subnet (AZ-a) | 10.0.10.0/24 | RDS primary |
| Private Subnet (AZ-b) | 10.0.20.0/24 | RDS standby (Multi-AZ) |
| Private Subnet (AZ-a) | 10.0.30.0/24 | ElastiCache Redis (Phase 2) |

## 5.2 Security Groups

| Security Group | Inbound | Outbound |
|----------------|---------|----------|
| `sg-alb` | 443 from 0.0.0.0/0 | EC2 app SG on 80 |
| `sg-app` | 80 from ALB SG; 22 from bastion SG | 443 (HTTPS), 3306 (RDS SG) |
| `sg-rds` | 3306 from app SG + worker SG | None |
| `sg-redis` | 6379 from app SG + worker SG | None |
| `sg-bastion` | 22 from office IP + VPN | All (for SSH tunnel) |

## 5.3 Traffic Flow

```
Internet
    │
    ▼
Route 53 (DNS resolution)
    │
    ▼
┌─────────────────────────────────────────────┐
│ Phase 1: Direct to EC2                      │
│ Phase 2: Application Load Balancer (ALB)    │
│   ├── HTTPS (443) → SSL termination (ACM) │
│   └── Health check: GET /health             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ EC2: Nginx (port 80)                        │
│   ├── api.kuberone.in → proxy_pass :4000    │
│   ├── admin.kuberone.in → static /admin     │
│   ├── cdn.kuberone.in → proxy CloudFront    │
│   ├── Rate limiting (limit_req)             │
│   ├── Gzip compression                      │
│   └── Security headers                      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ PM2: kuberone-api (port 4000, cluster ×2)   │
│   ├── JWT auth middleware                   │
│   ├── RBAC middleware                       │
│   ├── Business logic modules                │
│   └── Prisma → RDS MySQL                    │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
     RDS MySQL   AWS S3    External APIs
                              (OpenAI, FCM,
                               WhatsApp, etc.)
```

## 5.4 Firewall Rules

| Layer | Rule | Purpose |
|-------|------|---------|
| AWS Security Group | Deny all by default; allow specific | Network-level isolation |
| Nginx | `limit_req_zone` — 100 req/min per IP (API) | Rate limiting |
| Nginx | `limit_req_zone` — 30 req/min per IP (auth endpoints) | Brute-force protection |
| Nginx | `deny` known bad IPs (auto-updated) | Blocklist |
| Express | `express-rate-limit` — per-route limits | Application-level rate limit |
| RDS | No public accessibility | Database not internet-facing |
| S3 | Block Public Access on all buckets | No direct public document access |
| Admin panel | IP whitelist (office + VPN CIDR) | Restrict admin access (Phase 1.5) |

## 5.5 SSL/TLS Configuration

| Setting | Value |
|---------|-------|
| TLS Version | 1.2 minimum; 1.3 preferred |
| Certificate Provider | AWS ACM (auto-renew) |
| Cipher Suite | AWS recommended security policy |
| HSTS | `max-age=31536000; includeSubDomains` |
| OCSP Stapling | Enabled |
| Certificate Domains | `*.kuberone.in`, `kuberone.in` (wildcard ACM) |

---

# 6. DOMAIN STRATEGY

## 6.1 Domain Architecture

| Domain | Type | Points To | Purpose | SSL |
|--------|------|-----------|---------|-----|
| `kuberone.in` | Apex | Marketing site / redirect to app | Brand presence | ACM |
| `www.kuberone.in` | CNAME | Marketing site | Brand presence | ACM |
| `api.kuberone.in` | A / ALIAS | EC2 / ALB | Backend REST API | ACM |
| `admin.kuberone.in` | A / ALIAS | EC2 / ALB | CRM Admin Panel (static) | ACM |
| `cdn.kuberone.in` | CNAME | CloudFront distribution | Static assets, product images | ACM (CloudFront) |
| `support.kuberone.in` | CNAME | Support portal / help center | Customer support KB | ACM |
| `status.kuberone.in` | CNAME | Status page (UptimeRobot) | System status | External |

## 6.2 Non-Production Domains

| Domain | Environment | Purpose |
|--------|-------------|---------|
| `dev-api.kuberone.in` | Development | Shared dev API (optional) |
| `qa-api.kuberone.in` | QA | QA API endpoint |
| `qa-admin.kuberone.in` | QA | QA admin panel |
| `uat-api.kuberone.in` | UAT | UAT API endpoint |
| `uat-admin.kuberone.in` | UAT | UAT admin panel |

## 6.3 API Endpoint Routing (Nginx)

| URL Pattern | Backend | Notes |
|-------------|---------|-------|
| `api.kuberone.in/health` | `GET → localhost:4000/health` | No auth; ALB health check |
| `api.kuberone.in/v1/*` | `proxy_pass → localhost:4000` | All API routes |
| `api.kuberone.in/v1/ai/*/stream` | `proxy_pass` + SSE headers | AI streaming endpoints |
| `admin.kuberone.in/*` | `root /var/www/kuberone/admin/dist` | SPA — fallback to index.html |
| `cdn.kuberone.in/*` | CloudFront origin → S3 assets bucket | Cached static assets |

## 6.4 Mobile App API Configuration

| App | Build Flavor | API Base URL |
|-----|-------------|--------------|
| Customer App (prod) | `production` | `https://api.kuberone.in/v1` |
| Customer App (UAT) | `uat` | `https://uat-api.kuberone.in/v1` |
| DSA App (prod) | `production` | `https://api.kuberone.in/v1` |
| DSA App (UAT) | `uat` | `https://uat-api.kuberone.in/v1` |

## 6.5 DNS Management

| Attribute | Value |
|-----------|-------|
| Registrar | External (GoDaddy / Namecheap) |
| DNS Provider | AWS Route 53 |
| TTL | 300 seconds (5 min) for production records |
| Health Checks | Route 53 health check on `/health` (Phase 2 with ALB) |
| Failover | Route 53 failover routing (Phase 3 multi-region) |

---

# 7. BACKEND DEPLOYMENT

## 7.1 Node.js Runtime

| Attribute | Value |
|-----------|-------|
| Node.js Version | 20 LTS (20.x) |
| Package Manager | pnpm (monorepo) |
| TypeScript | Compiled to `dist/` before deploy |
| Entry Point | `dist/server.js` |
| Port | 4000 (internal; Nginx proxies) |
| Process Manager | PM2 |

## 7.2 PM2 Process Configuration

| Process Name | Script | Mode | Instances | Memory Limit | Purpose |
|--------------|--------|------|-----------|--------------|---------|
| `kuberone-api` | `dist/server.js` | cluster | 2 (Phase 1) | 512 MB | HTTP API server |
| `kuberone-workers` | `dist/workers/index.js` | fork | 1 | 256 MB | Background job processor |
| `kuberone-scheduler` | `dist/scheduler/index.js` | fork | 1 | 128 MB | Cron-scheduled jobs |

**PM2 Ecosystem Configuration (Reference — not code):**

| Setting | Value |
|---------|-------|
| `exec_mode` | `cluster` (API), `fork` (workers) |
| `instances` | `2` (API — matches vCPU count) |
| `max_memory_restart` | Per process limit above |
| `autorestart` | `true` |
| `watch` | `false` (never in production) |
| `env_production` | `NODE_ENV=production` |
| `log_date_format` | `YYYY-MM-DD HH:mm:ss Z` |
| `merge_logs` | `true` |
| `kill_timeout` | `5000` (graceful shutdown) |

## 7.3 PM2 Operational Commands

| Operation | Command | When |
|-----------|---------|------|
| Start (first time) | `pm2 start ecosystem.config.js --env production` | Initial setup |
| Zero-downtime deploy | `pm2 reload kuberone-api` | Every API deploy |
| Worker deploy | `pm2 reload kuberone-workers` | Worker code changes |
| View status | `pm2 status` | Monitoring |
| View logs | `pm2 logs kuberone-api --lines 100` | Debugging |
| Restart (hard) | `pm2 restart kuberone-api` | Emergency only |
| Save process list | `pm2 save` | After any process change |
| Boot persistence | `pm2 startup` + `pm2 save` | Server setup |
| Rollback | `pm2 resurrect` (from saved previous state) | Failed deploy |

## 7.4 Environment Variables

| Variable | Source | Environments | Rotation |
|----------|--------|--------------|----------|
| `NODE_ENV` | Server config | All | Never |
| `PORT` | Server config | All | Never |
| `DATABASE_URL` | SSM Parameter Store | Per env | On credential rotation |
| `JWT_SECRET` | SSM SecureString | Per env | Quarterly |
| `JWT_REFRESH_SECRET` | SSM SecureString | Per env | Quarterly |
| `AWS_REGION` | Server config | All | Never |
| `S3_BUCKET_DOCUMENTS` | SSM Parameter Store | Per env | Never |
| `S3_BUCKET_ASSETS` | SSM Parameter Store | Per env | Never |
| `OPENAI_API_KEY` | SSM SecureString | Per env | On compromise |
| `FIREBASE_SERVICE_ACCOUNT` | SSM SecureString (JSON) | Per env | Annual |
| `WHATSAPP_API_TOKEN` | SSM SecureString | Per env | On compromise |
| `WHATSAPP_PHONE_NUMBER_ID` | SSM Parameter Store | Per env | Never |
| `DEEPGRAM_API_KEY` | SSM SecureString | Per env | On compromise |
| `ELEVENLABS_API_KEY` | SSM SecureString | Per env | On compromise |
| `SMS_API_KEY` | SSM SecureString | Per env | On compromise |
| `SENTRY_DSN` | SSM Parameter Store | Per env | Never |
| `CORS_ORIGINS` | SSM Parameter Store | Per env | On domain change |

**Loading mechanism:** EC2 user-data script or deploy script fetches SSM parameters and writes `/var/www/kuberone/backend/.env` (permissions 600, owner: deploy user). Application reads `.env` at startup via `dotenv`.

## 7.5 Build & Deploy Steps

| Step | Action | Responsible |
|------|--------|-------------|
| 1 | CI pipeline passes (lint, typecheck, test) | GitHub Actions |
| 2 | `pnpm build` in `apps/backend` → `dist/` | CI |
| 3 | `prisma generate` (client generation) | CI |
| 4 | `prisma migrate deploy` on target RDS | CI / deploy script |
| 5 | Rsync `dist/`, `node_modules/`, `prisma/`, `ecosystem.config.js` to EC2 | CI / deploy script |
| 6 | `pm2 reload kuberone-api` (zero-downtime) | Deploy script |
| 7 | `pm2 reload kuberone-workers` (if worker changes) | Deploy script |
| 8 | `curl https://api.kuberone.in/health` → 200 | Automated smoke test |
| 9 | Smoke test: auth, lead list, presign | Automated |
| 10 | Notify team in Slack/email | CI notification |

## 7.6 Log Management

| Log Type | Location | Rotation | Retention |
|----------|----------|----------|-----------|
| PM2 stdout/stderr | `~/.pm2/logs/` | `pm2-logrotate` (daily, 10 files) | 30 days local |
| Nginx access | `/var/log/nginx/access.log` | logrotate (daily) | 90 days |
| Nginx error | `/var/log/nginx/error.log` | logrotate (daily) | 90 days |
| Application JSON | stdout (PM2 captures) | pm2-logrotate | 30 days local |
| CloudWatch (Phase 2) | Log group `/kuberone/prod/api` | AWS managed | 90 days |

**Log format (application):** Structured JSON with fields: `timestamp`, `level`, `requestId`, `userId`, `method`, `path`, `statusCode`, `durationMs`, `message`.

## 7.7 Health Check Endpoint

| Endpoint | Method | Auth | Response |
|----------|--------|------|----------|
| `/health` | GET | None | `{ "status": "ok", "version": "1.0.0", "uptime": 86400 }` |
| `/health/ready` | GET | None | Checks DB connection; 200 or 503 |
| `/health/live` | GET | None | Process alive; always 200 |

---

# 8. FRONTEND DEPLOYMENT (ADMIN PANEL)

## 8.1 Admin Panel Build Strategy

| Attribute | Value |
|-----------|-------|
| Framework | React.js + TypeScript + Vite |
| Build Command | `pnpm build` in `apps/admin` |
| Output Directory | `apps/admin/dist/` |
| Build Environment | CI (GitHub Actions) |
| Environment Variables | `VITE_API_BASE_URL`, `VITE_APP_NAME` (baked at build time) |

## 8.2 Build Environment Variables

| Variable | Production Value | UAT Value |
|----------|-----------------|-----------|
| `VITE_API_BASE_URL` | `https://api.kuberone.in/v1` | `https://uat-api.kuberone.in/v1` |
| `VITE_APP_NAME` | `KuberOne Admin` | `KuberOne Admin (UAT)` |
| `VITE_ENV` | `production` | `uat` |
| `VITE_SENTRY_DSN` | Production Sentry DSN | UAT Sentry DSN |

## 8.3 Static Hosting on EC2

| Attribute | Value |
|-----------|-------|
| Hosting Method | Nginx serves static files from `/var/www/kuberone/admin/dist` |
| No separate web server | Admin build co-located on app EC2 (Phase 1) |
| CDN (Phase 2) | CloudFront distribution for `admin.kuberone.in` |
| Cache Strategy | `index.html` — no cache; `assets/*` — 1 year cache (hash in filename) |

## 8.4 Nginx Configuration (Admin)

| Setting | Value |
|---------|-------|
| `server_name` | `admin.kuberone.in` |
| `root` | `/var/www/kuberone/admin/dist` |
| `index` | `index.html` |
| SPA fallback | `try_files $uri $uri/ /index.html` |
| Gzip | Enabled for JS, CSS, SVG, JSON |
| Security headers | CSP, X-Frame-Options, X-Content-Type-Options |
| IP whitelist (Phase 1.5) | Office CIDR + VPN CIDR in `allow/deny` |
| SSL | ACM certificate via Nginx |

## 8.5 Admin Deploy Steps

| Step | Action |
|------|--------|
| 1 | CI builds admin: `pnpm build` in `apps/admin` |
| 2 | Rsync `dist/` to EC2: `/var/www/kuberone/admin/dist/` |
| 3 | No PM2 reload needed (static files) |
| 4 | Verify: `curl -I https://admin.kuberone.in` → 200 |
| 5 | Clear CloudFront cache if CDN enabled (Phase 2) |

## 8.6 Admin Rollback

| Method | Action |
|--------|--------|
| Previous build | Rsync from `/var/www/kuberone/releases/{previous}/admin/dist/` |
| Time to rollback | < 2 minutes (rsync only) |

---

# 9. MOBILE APP DEPLOYMENT

## 9.1 Mobile App Overview

| App | Framework | Bundle ID (iOS) | Package (Android) |
|-----|-----------|-----------------|-------------------|
| **Customer App** | React Native (Expo) | `com.kuberfinserve.kuberone` | `com.kuberfinserve.kuberone` |
| **DSA App** | React Native (Expo) | `com.kuberfinserve.kuberone.dsa` | `com.kuberfinserve.kuberone.dsa` |

## 9.2 Expo Build Pipeline

| Step | Tool | Output |
|------|------|--------|
| 1. Code push | Git → `main` / `release/*` | Source |
| 2. EAS Build (Android) | `eas build --platform android --profile production` | `.aab` (App Bundle) |
| 3. EAS Build (iOS) | `eas build --platform ios --profile production` | `.ipa` |
| 4. Android submit | `eas submit --platform android` | Google Play Console |
| 5. iOS submit | `eas submit --platform ios` | App Store Connect |

## 9.3 Build Profiles (EAS)

| Profile | API URL | Distribution | Purpose |
|---------|---------|-------------|---------|
| `development` | `http://localhost:4000/v1` | Internal (dev client) | Local development |
| `preview` | `https://uat-api.kuberone.in/v1` | Internal (TestFlight/APK) | UAT testing |
| `production` | `https://api.kuberone.in/v1` | Store | Production release |

## 9.4 Android Deployment (Play Store)

| Attribute | Value |
|-----------|-------|
| Store | Google Play Console |
| Release Track | Internal → Closed Beta → Open Beta → Production |
| Signing | EAS managed keystore (or upload key) |
| Target SDK | Latest (API 34+) |
| Min SDK | API 24 (Android 7.0) |
| Review Time | 1–3 days (first release); hours (updates) |
| Staged Rollout | 10% → 50% → 100% over 3 days |
| Crash Monitoring | Sentry + Google Play Vitals |

**Release Checklist:**
- [ ] Version bumped in `app.json` / `app.config.ts`
- [ ] Changelog updated
- [ ] UAT sign-off on preview build
- [ ] API pointing to production
- [ ] Firebase config for production FCM
- [ ] Sentry DSN for production
- [ ] Privacy policy URL updated
- [ ] Screenshots and store listing current

## 9.5 iOS Deployment (App Store)

| Attribute | Value |
|-----------|-------|
| Store | App Store Connect |
| Distribution | TestFlight → App Store |
| Signing | EAS managed certificates + provisioning profiles |
| Target iOS | 15.0+ |
| Review Time | 1–7 days |
| Phased Release | 7-day phased rollout (optional) |
| Crash Monitoring | Sentry + Xcode Organizer |

**Release Checklist:**
- [ ] Same as Android checklist
- [ ] Apple Developer account active
- [ ] App Store Connect metadata complete
- [ ] Privacy nutrition labels accurate
- [ ] Export compliance declared

## 9.6 OTA Update Strategy (Expo Updates)

| Attribute | Value |
|-----------|-------|
| Service | Expo Updates (EAS Update) |
| Scope | JavaScript/asset changes only (no native code) |
| Channel: `production` | Production app installs |
| Channel: `preview` | UAT/TestFlight builds |
| Rollout | Instant (all users on channel) or gradual |
| Rollback | Republish previous update bundle |

**OTA vs. Store Release Decision Matrix:**

| Change Type | OTA | Store Release |
|-------------|-----|---------------|
| Bug fix (JS only) | ✅ OTA | Not needed |
| UI change (JS only) | ✅ OTA | Not needed |
| New native dependency | ❌ | ✅ Store release |
| SDK version upgrade | ❌ | ✅ Store release |
| Permission change | ❌ | ✅ Store release |
| API URL change | ✅ OTA (config) | Not needed |
| Security patch (native) | ❌ | ✅ Store release |

## 9.7 Mobile App Versioning

| Component | Format | Example |
|-----------|--------|---------|
| App version (user-facing) | `MAJOR.MINOR.PATCH` | `1.2.0` |
| Build number (iOS) | Incrementing integer | `42` |
| Version code (Android) | Incrementing integer | `42` |
| OTA runtime version | Matches native build | `1.2.0` |

**Versioning Rules:**
- `MAJOR` — breaking changes, major feature release
- `MINOR` — new features, backward compatible
- `PATCH` — bug fixes (typically OTA)

---

# 10. DATABASE ARCHITECTURE

## 10.1 MySQL Configuration (Production)

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `innodb_buffer_pool_size` | 50% of RDS memory | Query performance |
| `max_connections` | 200 | Pool headroom for PM2 instances |
| `slow_query_log` | ON | Threshold: 1 second |
| `long_query_time` | 1 | Identify slow queries |
| `character_set_server` | `utf8mb4` | Hindi/Unicode support |
| `collation_server` | `utf8mb4_unicode_ci` | Case-insensitive Unicode |
| `binlog_format` | ROW | PITR support |
| `innodb_file_per_table` | ON | Table-level management |
| `wait_timeout` | 300 | Connection cleanup |

## 10.2 Connection Management

| Component | Setting |
|-----------|---------|
| Prisma connection pool (per instance) | `connection_limit=10` (2 instances = 20 total) |
| Worker connection pool | `connection_limit=5` |
| Scheduler connection pool | `connection_limit=2` |
| Total production connections | ~27 of 200 max |
| RDS Proxy (Phase 2) | Connection multiplexing for scaling |

## 10.3 Backup Strategy

| Backup Type | Method | Frequency | Retention |
|-------------|--------|-----------|-----------|
| Automated snapshot | RDS managed | Daily (03:00 IST) | 35 days |
| Manual snapshot | Pre-deploy | Before every production deploy | 90 days |
| PITR (Point-in-Time Recovery) | RDS transaction logs | Continuous | 35 days |
| Logical backup (mysqldump) | Weekly cron → S3 | Weekly (Sunday 04:00) | 90 days in S3 |
| Cross-region snapshot copy | AWS Backup (Phase 2) | Daily | 35 days |

## 10.4 Replication Readiness

| Phase | Configuration |
|-------|---------------|
| Phase 1 | Single RDS Multi-AZ (synchronous standby) |
| Phase 2 | Add read replica (async) for reporting queries |
| Phase 3 | 2 read replicas; analytics queries routed to replica |
| Phase 4 | Cross-region read replica for DR |

**Read Replica Usage (Phase 2+):**
- Analytics/reporting queries → read replica
- List endpoints with heavy joins → read replica (optional)
- All writes → primary only
- Prisma read replica support via `datasource` URL configuration

## 10.5 Performance Optimization

| Optimization | Implementation | Phase |
|--------------|----------------|-------|
| Indexing | Per database schema specification; reviewed quarterly | 1 |
| Query optimization | Slow query log review weekly | 1 |
| Connection pooling | Prisma pool limits | 1 |
| Read replica | Reporting offloaded | 2 |
| RDS Proxy | Connection multiplexing | 2 |
| Query caching | Redis for frequent config/product queries | 2 |
| Partitioning | Large tables (audit_logs, notifications) by month | 3 |
| Archive | Move records > 2 years to archive tables | 3 |

## 10.6 Storage Planning

| Year | Estimated Data Size | RDS Storage | S3 Documents |
|------|-------------------|-------------|--------------|
| Year 1 | 5 GB | 100 GB allocated | 50 GB |
| Year 3 | 50 GB | 250 GB allocated | 500 GB |
| Year 5 | 200 GB | 500 GB allocated | 2 TB |

**Growth drivers:** Applications, documents (S3 not DB), audit logs, chat sessions, analytics snapshots.

---

# 11. PRISMA DEPLOYMENT

## 11.1 Migration Strategy

| Environment | Command | When | Who |
|-------------|---------|------|-----|
| Development | `prisma migrate dev` | During feature development | Developer |
| QA | `prisma migrate deploy` | On `develop` deploy | CI (automated) |
| UAT | `prisma migrate deploy` | On `release/*` deploy | CI (automated) |
| Production | `prisma migrate deploy` | Before `pm2 reload` | CI with manual approval gate |

## 11.2 Migration Workflow

```
Developer creates migration locally
    │
    ▼
prisma migrate dev --name {description}
    │
    ▼
Migration SQL committed to Git (prisma/migrations/)
    │
    ▼
PR review (schema change review required)
    │
    ▼
Merge to develop → CI runs migrate deploy on QA
    │
    ▼
QA tests pass → promote to release/*
    │
    ▼
CI runs migrate deploy on UAT
    │
    ▼
UAT sign-off → manual approval
    │
    ▼
CI runs migrate deploy on Production RDS
    │
    ▼
pm2 reload (application uses new schema)
```

## 11.3 Schema Versioning

| Practice | Detail |
|----------|--------|
| Migration naming | `YYYYMMDDHHMMSS_{description}` (Prisma default) |
| One migration per PR | Atomic schema changes |
| No manual SQL in production | All changes via Prisma migrations |
| Schema review | DBA/DevOps reviews migration SQL in PR |
| Destructive changes | Require explicit approval (column drop, table drop) |
| Data migrations | Separate seed/script; not in schema migration |
| Migration history | `_prisma_migrations` table on each database |

## 11.4 Rollback Strategy

| Scenario | Rollback Method |
|----------|----------------|
| **Migration failed** | Prisma marks migration as failed; fix forward with new migration |
| **Application bug after migration** | `pm2 reload` previous build (schema already migrated) |
| **Schema rollback needed** | Create reverse migration (Prisma has no auto-rollback) |
| **Data corruption** | Restore RDS from pre-deploy snapshot |
| **Emergency** | Restore RDS PITR to point before migration |

**Pre-deploy snapshot rule:** Always take RDS manual snapshot before production `prisma migrate deploy`.

## 11.5 Prisma in CI/CD

| CI Step | Command | Gate |
|---------|---------|------|
| Generate client | `prisma generate` | Must succeed |
| Validate schema | `prisma validate` | Must succeed |
| Check migration status | `prisma migrate status` | No pending failures |
| Deploy migration | `prisma migrate deploy` | Must succeed before app deploy |
| Seed (non-prod only) | `prisma db seed` | QA/UAT only |

---

# 12. FILE STORAGE ARCHITECTURE

## 12.1 S3 Bucket Registry

| Bucket | Environment | Purpose | Versioning | Lifecycle |
|--------|-------------|---------|------------|-----------|
| `kuberone-documents-prod` | Production | KYC, application documents | Enabled | Glacier after 2 years |
| `kuberone-documents-uat` | UAT | UAT documents | Enabled | Delete after 90 days |
| `kuberone-documents-qa` | QA | QA test documents | Disabled | Delete after 30 days |
| `kuberone-assets-prod` | Production | Product images, app assets | Enabled | None |
| `kuberone-reports-prod` | Production | Commission statements, analytics PDFs | Enabled | Glacier after 1 year |
| `kuberone-backups-prod` | Production | DB exports, config backups | Enabled | Delete after 1 year |
| `kuberone-ai-prod` | Production | RAG source files, AI artifacts | Enabled | None |

## 12.2 Folder Structure

```
kuberone-documents-prod/
├── customers/{customerId}/
│   ├── kyc/pan/{documentId}.pdf
│   ├── kyc/aadhaar/{documentId}.pdf
│   ├── applications/{applicationId}/income/{documentId}.pdf
│   ├── applications/{applicationId}/property/{documentId}.pdf
│   └── profile/photo/{documentId}.jpg
├── partners/{partnerId}/
│   ├── kyc/{documentId}.pdf
│   ├── agreements/{documentId}.pdf
│   └── bank/{documentId}.pdf
├── applications/{applicationId}/
│   ├── sanction/{documentId}.pdf
│   ├── disbursement/{documentId}.pdf
│   └── correspondence/{documentId}.pdf
├── reports/
│   ├── commission-statements/{year}/{month}/{partnerId}.pdf
│   └── analytics/{reportId}.pdf
└── temp/{uploadId}/          # Lifecycle: delete after 24 hours
```

## 12.3 Access Policies

| Operation | Method | Who | Expiry |
|-----------|--------|-----|--------|
| Upload | Presigned PUT URL | Customer, DSA, Agent | 15 minutes |
| Download | Presigned GET URL | Authorized roles (RBAC) | 5 minutes |
| Delete | IAM role (backend only) | System (soft delete in DB) | N/A |
| List | IAM role (backend only) | Backend service | N/A |
| Admin browse | Backend proxy + audit | Super Admin, Compliance | Session-based |

## 12.4 Security Controls

| Control | Implementation |
|---------|----------------|
| Block Public Access | Enabled on all buckets |
| Encryption | SSE-S3 (AES-256) mandatory |
| HTTPS only | Bucket policy denies non-SSL |
| IAM role | EC2 instance role — no access keys in code |
| Presigned URL scope | Single object; method-restricted (PUT or GET) |
| Versioning | All production buckets versioned |
| Access logging | S3 server access logs to logging bucket |
| Cross-region replication | `kuberone-documents-prod` → ap-southeast-1 (Phase 2) |
| Virus scan | ClamAV on upload confirm (Phase 2) |

## 12.5 Retention Policies

| Content Type | Retention | After Retention |
|--------------|-----------|-----------------|
| KYC documents | 8 years | Glacier → retain |
| Application documents | 8 years | Glacier → retain |
| Commission statements | 7 years | Glacier → retain |
| Analytics reports | 3 years | Glacier → delete |
| Temp uploads | 24 hours | Auto-delete (lifecycle rule) |
| AI/RAG source files | Active + 1 year after deactivation | Delete |
| DB backup exports | 1 year | Auto-delete (lifecycle rule) |

---

# 13. CI/CD ARCHITECTURE

## 13.1 Source Control

| Attribute | Value |
|-----------|-------|
| Platform | GitHub |
| Repository | `kuberfinserve/kuberone` (monorepo) |
| Default Branch | `main` (production) |
| Branch Protection | `main` — require PR, CI pass, 1 approval |

## 13.2 Branch Strategy

| Branch Pattern | Purpose | Deploys To | Auto-Deploy |
|----------------|---------|------------|-------------|
| `main` | Production-ready code | Production | Manual approval |
| `develop` | Integration branch | QA | Auto |
| `release/*` | Release candidates | UAT | Semi-auto |
| `feature/*` | Feature development | None (local) | No |
| `hotfix/*` | Emergency production fixes | Production (fast-track) | Manual + CTO approval |
| `test/*` | Experimental / spike | None | No |

## 13.3 CI Pipeline (GitHub Actions)

```
┌─────────────────────────────────────────────────────────────┐
│                    CI PIPELINE (Every Push/PR)               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Stage 1: INSTALL                                            │
│  ├── pnpm install (frozen lockfile)                          │
│  └── Cache node_modules                                      │
│                                                              │
│  Stage 2: LINT & TYPECHECK                                   │
│  ├── ESLint (all apps)                                       │
│  ├── TypeScript compile check                                │
│  └── Prettier format check                                   │
│                                                              │
│  Stage 3: TEST                                               │
│  ├── Unit tests (backend, shared)                            │
│  ├── Integration tests (API endpoints)                       │
│  └── Test coverage report (min 60%)                          │
│                                                              │
│  Stage 4: SECURITY                                           │
│  ├── npm audit (fail on critical)                            │
│  ├── Secret scanning (no keys in code)                         │
│  └── Dependency review                                       │
│                                                              │
│  Stage 5: BUILD                                              │
│  ├── pnpm build (backend → dist/)                            │
│  ├── pnpm build (admin → dist/)                              │
│  └── prisma generate                                         │
│                                                              │
│  Stage 6: ARTIFACT                                           │
│  ├── Upload backend dist artifact                            │
│  ├── Upload admin dist artifact                              │
│  └── Upload prisma migrations                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 13.4 CD Pipeline (Deployment)

```
┌─────────────────────────────────────────────────────────────┐
│                    CD PIPELINE (Deploy)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Trigger: merge to develop / release/* / main (approved)     │
│                                                              │
│  Stage 1: PRE-DEPLOY                                         │
│  ├── Download build artifacts                                │
│  ├── RDS manual snapshot (production only)                   │
│  └── prisma migrate deploy                                   │
│                                                              │
│  Stage 2: DEPLOY BACKEND                                     │
│  ├── SSH to target EC2 (via deploy key)                      │
│  ├── Rsync dist/ to /var/www/kuberone/backend/               │
│  ├── Fetch SSM secrets → .env                                │
│  ├── pm2 reload kuberone-api                                 │
│  └── pm2 reload kuberone-workers (if changed)                │
│                                                              │
│  Stage 3: DEPLOY ADMIN                                       │
│  ├── Rsync admin dist/ to /var/www/kuberone/admin/dist/      │
│  └── (No PM2 reload needed)                                  │
│                                                              │
│  Stage 4: SMOKE TEST                                         │
│  ├── GET /health → 200                                       │
│  ├── POST /auth/otp/send → 200                               │
│  ├── GET /customer/products → 200 (with test token)          │
│  └── Admin panel loads → 200                                 │
│                                                              │
│  Stage 5: NOTIFY                                             │
│  ├── Slack/email: deploy success                             │
│  └── Update deployment log                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 13.5 Approval Process

| Environment | Approvers | Gate |
|-------------|-----------|------|
| QA | None (auto on `develop` merge) | CI pass |
| UAT | QA Lead sign-off | CI pass + QA pass |
| Production | CTO or DevOps Lead | CI pass + UAT sign-off + manual approval in GitHub |
| Hotfix (production) | CTO | CI pass + CTO emergency approval |

## 13.6 Rollback Strategy

| Component | Rollback Method | Time |
|-----------|----------------|------|
| Backend API | Rsync previous release + `pm2 reload` | < 3 minutes |
| Admin Panel | Rsync previous `dist/` | < 2 minutes |
| Database | Restore RDS pre-deploy snapshot | < 30 minutes |
| Mobile App (OTA) | Republish previous Expo update | < 5 minutes |
| Mobile App (Store) | Promote previous version in store console | 1–24 hours |
| Full rollback | Previous release artifact + RDS snapshot restore | < 1 hour |

**Rollback Decision Criteria:**
- Smoke tests fail after deploy
- Error rate > 5% within 15 minutes of deploy
- P1 bug reported within 1 hour of deploy
- CTO/DevOps decision

---

# 14. RELEASE MANAGEMENT

## 14.1 Release Types

| Type | Branch | UAT Required | Approval | Frequency |
|------|--------|-------------|----------|-----------|
| **Development Release** | `develop` → QA | No | Auto | Daily (multiple) |
| **QA Release** | `develop` → QA | No | Auto | Daily |
| **UAT Release** | `release/*` → UAT | Self | QA Lead | Weekly |
| **Production Release** | `main` → Production | Yes (UAT sign-off) | CTO/DevOps | Bi-weekly |
| **Hotfix** | `hotfix/*` → Production | Optional (CTO waiver) | CTO | As needed |

## 14.2 Release Cadence

| Release | Schedule | Window |
|---------|----------|--------|
| Production | Bi-weekly (Tuesday or Thursday) | 10:00–14:00 IST |
| UAT | Weekly (Friday) | Anytime |
| QA | Continuous (on merge) | Anytime |
| Hotfix | As needed | Anytime with approval |
| Mobile Store | Monthly (or as needed) | Submit Monday; release when approved |
| OTA Update | Weekly (JS-only changes) | Anytime |

## 14.3 Release Process (Production)

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

## 14.4 Hotfix Strategy

| Scenario | Process |
|----------|---------|
| P1 production bug | Create `hotfix/{description}` from `main` |
| Fix + test locally | Developer |
| PR to `main` with CTO approval | Skip UAT if CTO waives |
| Deploy to production | Same CD pipeline |
| Backport to `develop` | Merge `main` → `develop` after hotfix |
| Post-mortem | Within 48 hours for P1 |

## 14.5 Version Tagging

| Tag Format | Example | When |
|------------|---------|------|
| `v{MAJOR}.{MINOR}.{PATCH}` | `v1.2.0` | Every production release |
| `v{MAJOR}.{MINOR}.{PATCH}-hotfix.{N}` | `v1.2.1-hotfix.1` | Hotfix releases |
| `v{MAJOR}.{MINOR}.{PATCH}-rc.{N}` | `v1.3.0-rc.1` | UAT release candidates |

---

# 15. MONITORING ARCHITECTURE

## 15.1 Monitoring Stack

| Layer | Tool | Metrics | Phase |
|-------|------|---------|-------|
| **Process** | PM2 | CPU, memory, restart count, uptime | 1 |
| **Infrastructure** | CloudWatch | EC2 CPU/memory/disk, RDS connections/IOPS/latency | 1 |
| **Application** | Sentry | Errors, exceptions, stack traces | 1 |
| **Uptime** | UptimeRobot / Pingdom | `/health` endpoint availability | 1 |
| **APM** | CloudWatch Agent (custom metrics) | Request latency, throughput | 2 |
| **Logs** | CloudWatch Logs | Centralized log search | 2 |
| **Business** | Custom analytics dashboard | Leads, conversions, disbursements | 1.5 |
| **AI** | OpenAI usage dashboard + custom | Token usage, cost, latency | 1.5 |
| **SSL** | ACM + expiry alert | Certificate validity | 1 |

## 15.2 Application Monitoring

| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| Request rate (req/min) | Application logs | > 3× normal (spike) |
| Error rate (%) | Sentry | > 1% of requests |
| Response time p50 | Application logs | > 200ms |
| Response time p95 | Application logs | > 500ms |
| Response time p99 | Application logs | > 2000ms |
| Active connections | PM2 | > 500 |
| Memory usage per process | PM2 | > 80% of limit |
| Process restarts | PM2 | > 3 in 10 minutes |
| Unhandled rejections | Sentry | Any |

## 15.3 API Monitoring

| Endpoint Category | SLA (p95) | Monitor |
|-------------------|-----------|---------|
| Auth (OTP, login) | < 500ms | Per-endpoint latency |
| CRUD operations | < 300ms | Per-endpoint latency |
| List/search | < 500ms | Per-endpoint latency |
| Eligibility check | < 500ms | Per-endpoint latency |
| AI Advisor (streaming) | < 5s first token | Per-session latency |
| Document presign | < 100ms | Per-endpoint latency |
| Health check | < 50ms | Uptime monitor (60s interval) |

## 15.4 Database Monitoring

| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| CPU utilization | CloudWatch (RDS) | > 80% for 10 min |
| Free storage | CloudWatch (RDS) | < 20% remaining |
| Database connections | CloudWatch (RDS) | > 80% of max |
| Read IOPS | CloudWatch (RDS) | > 80% provisioned |
| Write IOPS | CloudWatch (RDS) | > 80% provisioned |
| Replica lag | CloudWatch (RDS) | > 30 seconds (Phase 2) |
| Slow queries | RDS slow query log | > 10/hour |
| Deadlocks | RDS error log | Any |

## 15.5 Infrastructure Monitoring

| Resource | Metrics | Alert |
|----------|---------|-------|
| EC2 CPU | CloudWatch `CPUUtilization` | > 80% for 15 min |
| EC2 Memory | CloudWatch Agent | > 85% |
| EC2 Disk | CloudWatch `DiskSpaceUtilization` | > 85% |
| EC2 Network | CloudWatch `NetworkIn/Out` | Anomaly detection |
| RDS (all metrics) | CloudWatch RDS namespace | Per section 15.4 |
| S3 bucket size | CloudWatch `BucketSizeBytes` | > 80% of budget |
| ALB (Phase 2) | `HealthyHostCount`, `TargetResponseTime` | Unhealthy host |

## 15.6 Business Monitoring

| Metric | Source | Dashboard |
|--------|--------|-----------|
| Daily active users | Application analytics | CEO dashboard |
| Leads created today | CRM analytics | Sales dashboard |
| Applications submitted | LOS analytics | Operations dashboard |
| Disbursements today | LMS analytics | Revenue dashboard |
| AI sessions today | AI analytics | AI dashboard |
| Commission payout pending | Commission engine | Finance dashboard |
| SLA breaches | Workflow engine | Operations dashboard |

---

# 16. LOGGING ARCHITECTURE

## 16.1 Log Categories

| Category | Content | Format | Sensitivity |
|----------|---------|--------|-------------|
| **Application Logs** | Request/response, business events, errors | JSON structured | Medium (no PII in message) |
| **Security Logs** | Auth attempts, RBAC denials, rate limit hits | JSON structured | High |
| **Audit Logs** | PII access, document access, financial mutations | JSON structured | Critical |
| **Error Logs** | Unhandled exceptions, stack traces | JSON + Sentry | Medium |
| **Access Logs** | HTTP requests (Nginx) | Combined/JSON log format | Low |
| **Worker Logs** | Job processing, queue events | JSON structured | Low |
| **AI Logs** | Session metadata, token usage (no message content with PII) | JSON structured | Medium |
| **Integration Logs** | External API calls (OpenAI, FCM, WhatsApp) | JSON structured | Medium |

## 16.2 Application Log Schema

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `timestamp` | ISO 8601 | Yes | `2026-06-05T10:30:00+05:30` |
| `level` | string | Yes | `info`, `warn`, `error` |
| `requestId` | UUID | Yes (per request) | `a1b2c3d4-...` |
| `userId` | UUID | If authenticated | `user-uuid` |
| `role` | string | If authenticated | `SALES_EXECUTIVE` |
| `method` | string | HTTP requests | `POST` |
| `path` | string | HTTP requests | `/v1/customer/leads` |
| `statusCode` | number | HTTP responses | `200` |
| `durationMs` | number | HTTP responses | `145` |
| `module` | string | Business events | `lead`, `application`, `ai` |
| `action` | string | Business events | `lead.created`, `stage.transitioned` |
| `message` | string | Always | Human-readable description |
| `error` | object | On error | `{ code, message }` (no stack in prod response) |

**PII Rules in Logs:**
- Never log: PAN, Aadhaar, bank account, full phone, full address
- Mask: phone (last 4 digits), email (domain only), name (first name only)
- Include: entity IDs (UUIDs), action types, timestamps

## 16.3 Security Log Events

| Event | Log Level | Fields |
|-------|-----------|--------|
| Login success | INFO | userId, role, IP, userAgent |
| Login failure | WARN | phone/email (masked), IP, reason |
| OTP sent | INFO | phone (masked), channel |
| OTP verification failed | WARN | phone (masked), attempt count |
| Token refresh | INFO | userId, IP |
| Token revoked | INFO | userId, reason |
| RBAC denied | WARN | userId, role, resource, action, IP |
| Rate limit hit | WARN | IP, endpoint, count |
| Suspicious activity | ERROR | IP, pattern, details |
| Admin login | INFO | userId, IP (always logged) |

## 16.4 Audit Log Events

Per [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md):

| Event | Required Fields |
|-------|----------------|
| PII field accessed | actorId, entityType, entityId, fieldName, IP |
| Document viewed | actorId, documentId, documentType, IP |
| Document uploaded | actorId, documentId, applicationId, IP |
| Financial record modified | actorId, entityType, entityId, oldValue (hash), newValue (hash) |
| Stage transition | actorId, applicationId, fromStage, toStage |
| Commission calculated | system, partnerId, amount, period |
| Role/permission changed | actorId, targetUserId, change |
| AI recommendation made | sessionId, recommendationType, productCode |

## 16.5 Log Storage & Retention

| Log Type | Storage (Phase 1) | Storage (Phase 2) | Retention |
|----------|-------------------|-------------------|-----------|
| Application logs | PM2 files (local) | CloudWatch Logs | 30 days |
| Security logs | PM2 files + DB (`audit_logs`) | CloudWatch + DB | 2 years (DB) |
| Audit logs | DB (`audit_logs` table) | DB + S3 archive | 2–10 years (category-dependent) |
| Error logs | Sentry | Sentry | 90 days |
| Access logs (Nginx) | `/var/log/nginx/` | CloudWatch Logs | 90 days |
| Worker logs | PM2 files | CloudWatch Logs | 30 days |
| AI session metadata | DB (`chat_sessions`) | DB | 2 years metadata; 90 days messages |
| Integration logs | PM2 files | CloudWatch Logs | 30 days |

## 16.6 Log Rotation

| Component | Tool | Policy |
|-----------|------|--------|
| PM2 logs | `pm2-logrotate` | Daily rotation; keep 10 files; max 50 MB per file |
| Nginx logs | `logrotate` (system) | Daily rotation; keep 90 days; compress |
| Application file logs | `logrotate` | Daily; keep 30 days |
| CloudWatch Logs | AWS managed | Per retention policy; auto-expire |

## 16.7 Log Access

| Role | Access Level | Method |
|------|-------------|--------|
| Developer | Application + error logs (dev/QA only) | PM2 logs / CloudWatch |
| DevOps | All logs (all environments) | CloudWatch / SSH |
| Security | Security + audit logs | DB query + CloudWatch |
| Compliance | Audit logs (read-only) | Admin panel audit viewer |
| CTO | All logs | CloudWatch dashboard |
| Developer in Production | **No direct access** | Request via DevOps |

---

# 17. ALERTING FRAMEWORK

## 17.1 Alert Severity Levels

| Level | Name | Response Time | Channel | Example |
|-------|------|---------------|---------|---------|
| **P1** | Critical | 15 minutes | SMS + Phone + Slack | API down, database unreachable |
| **P2** | High | 1 hour | Slack + Email | Error rate > 5%, disk > 90% |
| **P3** | Medium | 4 hours | Slack + Email | CPU > 80%, slow queries spike |
| **P4** | Low | Next business day | Email | SSL expiring in 30 days, cost budget 80% |
| **P5** | Info | Dashboard only | Dashboard | Deployment success, backup complete |

## 17.2 Server Alerts

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| EC2 instance down | Status check failed | P1 | Auto-restart; launch replacement if persistent |
| CPU > 80% sustained | 15-minute average | P3 | Investigate; consider scale-up |
| Memory > 85% | 10-minute average | P2 | Investigate memory leak; PM2 restart if needed |
| Disk > 85% | Current utilization | P2 | Clean logs; expand EBS if needed |
| Disk > 95% | Current utilization | P1 | Emergency cleanup; expand EBS |
| PM2 process crash loop | > 3 restarts in 10 min | P1 | Investigate; rollback if post-deploy |
| Nginx down | Health check fails | P1 | Restart Nginx; check config |

## 17.3 Database Alerts

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| RDS unavailable | Connection failures | P1 | RDS Multi-AZ failover (automatic) |
| RDS CPU > 80% | 15-minute average | P3 | Query optimization; consider upgrade |
| RDS storage < 20% | Free space | P2 | Increase allocated storage |
| RDS connections > 80% | Current count | P2 | Investigate connection leak; add RDS Proxy |
| Replica lag > 30s | Phase 2 | P3 | Investigate replica load |
| Backup failed | Daily snapshot status | P2 | Manual snapshot; investigate |
| Slow query spike | > 10 slow queries/hour | P3 | Review slow query log |

## 17.4 API Alerts

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| API down | `/health` fails 3 consecutive checks | P1 | Investigate; rollback if post-deploy |
| Error rate > 1% | 5-minute window | P3 | Investigate Sentry errors |
| Error rate > 5% | 5-minute window | P2 | Consider rollback |
| p95 latency > 500ms | 15-minute window | P3 | Investigate slow endpoints |
| p95 latency > 2000ms | 5-minute window | P2 | Consider rollback |
| Rate limit spike | > 10× normal blocks/hour | P3 | Possible attack; review IPs |
| 5xx spike | > 50 in 5 minutes | P2 | Investigate immediately |

## 17.5 Security Alerts

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| Failed login spike | > 50 failures in 5 min from single IP | P2 | Block IP; investigate |
| RBAC denial spike | > 20 in 5 min from single user | P3 | Investigate potential abuse |
| Unauthorized access attempt | 401/403 spike | P3 | Review access logs |
| SSL certificate expiring | < 14 days | P4 | Renew (ACM auto-renews; alert if failed) |
| SSM parameter accessed | Unusual access pattern | P3 | Review IAM audit |
| New SSH connection to production | Any (Phase 2) | P3 | Verify authorized DevOps |
| Prompt injection attempt | > 10/day (AI) | P3 | Review AI security logs |

## 17.6 Business Alerts

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| Zero leads today (business hours) | No leads by 14:00 IST | P4 | Check lead capture flow |
| SLA breach spike | > 20 breaches/day | P3 | Notify operations manager |
| Disbursement failure | Any failed disbursement | P3 | Notify finance team |
| Commission calculation error | Worker job failure | P2 | Investigate; manual recalculation |
| AI cost > daily budget | OpenAI spend > $30/day | P3 | Review AI usage patterns |
| WhatsApp delivery failure | > 10% failure rate | P3 | Check WhatsApp API status |
| FCM delivery failure | > 5% failure rate | P3 | Check Firebase status |

## 17.7 Alert Routing

| Recipient | P1 | P2 | P3 | P4 |
|-----------|----|----|----|----|
| DevOps Engineer | SMS + Phone | Slack | Slack | Email |
| CTO | SMS | Email | Dashboard | Dashboard |
| Backend Lead | — | Slack | Slack | — |
| Security Lead | SMS (security P1) | Slack (security P2) | Email | — |
| On-call rotation | P1 primary | P2 primary | — | — |

## 17.8 On-Call Rotation

| Attribute | Value |
|-----------|-------|
| Rotation | Weekly |
| Primary | DevOps Engineer |
| Secondary | Backend Lead |
| Escalation | Primary (15 min) → Secondary (30 min) → CTO (60 min) |
| On-call hours | 24/7 for P1; business hours for P2–P4 |
| Tool | PagerDuty / OpsGenie (Phase 2) or manual phone tree (Phase 1) |

---

# 18. PERFORMANCE MANAGEMENT

## 18.1 API Performance

| Category | Target (p95) | Optimization |
|----------|-------------|--------------|
| Auth endpoints | < 500ms | OTP cache; rate limit |
| CRUD endpoints | < 300ms | Indexed queries; lean DTOs |
| List endpoints | < 500ms | Pagination; selective `select` |
| Search endpoints | < 500ms | FULLTEXT indexes; limit results |
| Eligibility check | < 500ms | Rules engine in-memory; cached lender rules |
| EMI calculator | < 50ms | Pure computation; no DB |
| Document presign | < 100ms | S3 SDK; no DB in hot path |
| AI Advisor (first token) | < 5s | Streaming; RAG cache |
| AI Copilot | < 8s | Pre-computed insights where possible |
| File upload (presign) | < 100ms | Async confirm processing |

**Performance Testing:**
- Load test before production go-live (target: 100 concurrent users)
- Quarterly load test on production (off-peak hours)
- Tool: k6 or Artillery (run from CI or dedicated test EC2)

## 18.2 Database Performance

| Optimization | Implementation | Review |
|--------------|----------------|--------|
| Index coverage | Per schema specification (139 tables) | Quarterly |
| Slow query review | RDS slow query log → weekly report | Weekly |
| N+1 prevention | Prisma `include`/`select` discipline | Per PR |
| Connection pooling | Prisma pool limits per process | On scale events |
| Read replica routing | Reporting queries → replica | Phase 2 |
| Query caching | Redis for product config, lender rules | Phase 2 |
| Table partitioning | `audit_logs`, `notifications` by month | Phase 3 |
| Archive old data | Move > 2-year records to archive tables | Annual |

## 18.3 Frontend Performance (Admin Panel)

| Metric | Target | Optimization |
|--------|--------|-------------|
| Largest Contentful Paint (LCP) | < 2.5s | Code splitting; lazy routes |
| First Input Delay (FID) | < 100ms | Minimize main thread blocking |
| Cumulative Layout Shift (CLS) | < 0.1 | Fixed dimensions for dynamic content |
| Time to Interactive (TTI) | < 3.5s | Tree shaking; Vite build optimization |
| Bundle size (initial) | < 500 KB gzipped | Dynamic imports for heavy modules |
| API response caching | React Query staleTime | Reduce redundant API calls |

## 18.4 Mobile Performance

| Metric | Target | Optimization |
|--------|--------|-------------|
| App cold start | < 3s | Expo optimization; lazy screen loading |
| Screen transition | < 300ms | React Navigation optimization |
| API call (non-AI) | < 500ms | React Query cache; optimistic updates |
| Image loading | < 1s | Cached images; WebP format |
| Document upload | Background upload | Queue with retry; presigned S3 |
| AI chat first token | < 5s | SSE streaming; loading indicator |
| Offline capability | Basic (cached profile, products) | AsyncStorage for config |
| Memory usage | < 200 MB | Image cleanup; list virtualization |
| Battery impact | Minimal background activity | No unnecessary polling |

## 18.5 Performance Review Cadence

| Review | Frequency | Owner | Output |
|--------|-----------|-------|--------|
| API latency report | Weekly | Backend Lead | Top 10 slowest endpoints |
| Slow query report | Weekly | DevOps / DBA | Queries to optimize |
| Error rate report | Daily (automated) | DevOps | Sentry summary |
| Load test | Quarterly | DevOps | Capacity report |
| Mobile performance | Monthly | Mobile Lead | Expo performance metrics |
| Admin Lighthouse audit | Monthly | Frontend Lead | Score + recommendations |

---

# 19. SECURITY ARCHITECTURE

## 19.1 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: NETWORK SECURITY                                    │
│   AWS Security Groups · VPC · Nginx rate limiting            │
│   IP whitelisting (admin) · DDoS (AWS Shield Standard)       │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: TRANSPORT SECURITY                                    │
│   TLS 1.3 · HSTS · Certificate pinning (mobile)              │
│   S3 HTTPS-only bucket policies                               │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: APPLICATION SECURITY                                  │
│   JWT auth · RBAC middleware · Input validation (Zod)        │
│   Rate limiting · CORS whitelist · Body size limits           │
├─────────────────────────────────────────────────────────────┤
│ Layer 4: DATA SECURITY                                         │
│   PII masking by role · Encryption at rest · Presigned URLs  │
│   No PII in logs · DPDP consent                               │
├─────────────────────────────────────────────────────────────┤
│ Layer 5: OPERATIONAL SECURITY                                  │
│   SSM secrets · IAM roles · Audit logging · Access reviews   │
│   Incident response · Penetration testing                     │
└─────────────────────────────────────────────────────────────┘
```

## 19.2 SSL/TLS

| Component | Configuration |
|-----------|---------------|
| Certificate | AWS ACM wildcard (`*.kuberone.in`) |
| Protocol | TLS 1.2 minimum; TLS 1.3 preferred |
| HSTS | `max-age=31536000; includeSubDomains; preload` |
| Mobile pinning | Certificate public key pinned in app config |
| Internal (EC2 ↔ RDS) | TLS enforced (RDS SSL) |
| S3 | HTTPS-only bucket policy |

## 19.3 Firewall

| Layer | Rules |
|-------|-------|
| AWS Security Groups | Deny all inbound by default; allow 443 (ALB/EC2), 22 (bastion only) |
| Nginx | Rate limiting per IP; block known bad IPs; admin IP whitelist |
| RDS | No public access; only app/worker security groups on port 3306 |
| S3 | Block Public Access; IAM role access only |
| Redis (Phase 2) | Private subnet only; app SG on port 6379 |

## 19.4 IP Whitelisting

| Resource | Whitelisted IPs | Purpose |
|----------|----------------|---------|
| Admin panel (`admin.kuberone.in`) | Office static IP, VPN CIDR | Restrict CRM access |
| Production SSH (Phase 2 bastion) | DevOps IPs, CI runner IP | Server management |
| RDS (emergency DBA access) | Bastion only | No direct DBA access |
| SSM Session Manager | DevOps IAM roles | Preferred over SSH (Phase 2) |

## 19.5 Rate Limiting

| Endpoint Category | Limit | Window | Implementation |
|-------------------|-------|--------|----------------|
| Global API | 100 requests | 1 minute per IP | Nginx `limit_req` |
| Auth (OTP send) | 5 requests | 1 minute per phone | Express rate limiter |
| Auth (login) | 10 requests | 5 minutes per IP | Express rate limiter |
| AI Advisor | 20 messages | 1 hour per user | Application logic |
| AI Copilot | 50 requests | 1 hour per user | Application logic |
| Document presign | 30 requests | 1 hour per user | Application logic |
| Admin API | 200 requests | 1 minute per user | Nginx + Express |

## 19.6 DDoS Protection

| Layer | Protection |
|-------|------------|
| AWS Shield Standard | Automatic DDoS protection (included) |
| Nginx rate limiting | Per-IP request throttling |
| Express rate limiting | Per-user/per-route throttling |
| AWS WAF (Phase 2) | SQL injection, XSS, bot control rules |
| CloudFront (Phase 2) | Edge caching reduces origin load |
| ALB (Phase 2) | Absorbs traffic spikes |

## 19.7 Secrets Management

See Section 20 for detailed secret management architecture.

## 19.8 Security Headers (Nginx)

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'` |
| `Permissions-Policy` | `camera=(), microphone=(self), geolocation=(self)` |

## 19.9 Vulnerability Management

| Activity | Frequency | Tool |
|----------|-----------|------|
| npm audit | Every CI build | `npm audit` / Dependabot |
| OS patching | Monthly | `unattended-upgrades` (security only) |
| Dependency updates | Weekly review | Dependabot PRs |
| Penetration test | Quarterly | External security firm |
| Security code review | Per PR (AI/auth changes) | Manual review |
| AWS Security Hub | Continuous (Phase 2) | AWS Security Hub |

---

# 20. SECRET MANAGEMENT

## 20.1 Secret Storage Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECRET MANAGEMENT FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  AWS SSM Parameter Store                                     │
│  ├── /kuberone/prod/DATABASE_URL          (SecureString)     │
│  ├── /kuberone/prod/JWT_SECRET            (SecureString)     │
│  ├── /kuberone/prod/OPENAI_API_KEY        (SecureString)     │
│  ├── /kuberone/prod/FIREBASE_SERVICE_ACCOUNT (SecureString)  │
│  ├── /kuberone/prod/WHATSAPP_API_TOKEN    (SecureString)     │
│  ├── /kuberone/prod/DEEPGRAM_API_KEY      (SecureString)     │
│  ├── /kuberone/prod/ELEVENLABS_API_KEY    (SecureString)     │
│  ├── /kuberone/prod/SMS_API_KEY           (SecureString)     │
│  ├── /kuberone/prod/S3_BUCKET_DOCUMENTS   (String)         │
│  └── /kuberone/prod/CORS_ORIGINS          (String)         │
│                                                              │
│  Per-environment prefix: /kuberone/{env}/                   │
│                                                              │
│  EC2 Instance Role (IAM)                                     │
│  └── Permission: ssm:GetParameter on /kuberone/{env}/*       │
│                                                              │
│  Deploy Script                                               │
│  └── Fetches params → writes /var/www/kuberone/backend/.env  │
│      (permissions: 600, owner: deploy-user)                  │
│                                                              │
│  Application (Node.js)                                       │
│  └── Reads .env at startup via dotenv                         │
│                                                              │
│  NEVER in Git: .env, credentials.json, *.pem, API keys       │
└─────────────────────────────────────────────────────────────┘
```

## 20.2 Secret Registry

| Secret | SSM Path | Type | Rotation | Used By |
|--------|----------|------|----------|---------|
| `DATABASE_URL` | `/kuberone/{env}/DATABASE_URL` | SecureString | On credential change | API, workers, scheduler |
| `JWT_SECRET` | `/kuberone/{env}/JWT_SECRET` | SecureString | Quarterly | API |
| `JWT_REFRESH_SECRET` | `/kuberone/{env}/JWT_REFRESH_SECRET` | SecureString | Quarterly | API |
| `OPENAI_API_KEY` | `/kuberone/{env}/OPENAI_API_KEY` | SecureString | On compromise | API, AI workers |
| `FIREBASE_SERVICE_ACCOUNT` | `/kuberone/{env}/FIREBASE_SERVICE_ACCOUNT` | SecureString (JSON) | Annual | Notification worker |
| `WHATSAPP_API_TOKEN` | `/kuberone/{env}/WHATSAPP_API_TOKEN` | SecureString | On compromise | Notification worker |
| `WHATSAPP_PHONE_NUMBER_ID` | `/kuberone/{env}/WHATSAPP_PHONE_NUMBER_ID` | String | Never | Notification worker |
| `WHATSAPP_VERIFY_TOKEN` | `/kuberone/{env}/WHATSAPP_VERIFY_TOKEN` | SecureString | On compromise | API (webhook) |
| `DEEPGRAM_API_KEY` | `/kuberone/{env}/DEEPGRAM_API_KEY` | SecureString | On compromise | API (voice) |
| `ELEVENLABS_API_KEY` | `/kuberone/{env}/ELEVENLABS_API_KEY` | SecureString | On compromise | API (voice) |
| `SMS_API_KEY` | `/kuberone/{env}/SMS_API_KEY` | SecureString | On compromise | API (OTP) |
| `SENTRY_DSN` | `/kuberone/{env}/SENTRY_DSN` | String | Never | API, admin |
| `S3_BUCKET_DOCUMENTS` | `/kuberone/{env}/S3_BUCKET_DOCUMENTS` | String | Never | API, workers |
| `S3_BUCKET_ASSETS` | `/kuberone/{env}/S3_BUCKET_ASSETS` | String | Never | API |
| `S3_BUCKET_REPORTS` | `/kuberone/{env}/S3_BUCKET_REPORTS` | String | Never | Report worker |
| `CORS_ORIGINS` | `/kuberone/{env}/CORS_ORIGINS` | String | On domain change | API |

## 20.3 Secret Access Controls

| Role | SSM Access | Method |
|------|-----------|--------|
| EC2 Instance Role | Read `/kuberone/{env}/*` | IAM policy on instance role |
| CI/CD (GitHub Actions) | Read `/kuberone/{env}/*` | OIDC federation; no stored keys |
| Developer | **No production access** | Cannot read prod SSM |
| DevOps | Read/write all environments | AWS Console + CLI (MFA required) |
| CTO | Read production (emergency) | AWS Console (MFA required) |

## 20.4 Secret Rotation Procedures

| Secret | Rotation Method | Downtime |
|--------|----------------|----------|
| JWT secrets | Generate new → update SSM → deploy (dual-validation period) | Zero (if dual-validation implemented) |
| Database password | RDS modify → update SSM → deploy | < 1 minute (reconnect) |
| OpenAI API key | Generate new in OpenAI dashboard → update SSM → deploy | Zero |
| Firebase service account | Generate new key → update SSM → deploy | Zero |
| WhatsApp token | Regenerate in Meta Business → update SSM → deploy | Zero |
| SSL certificate | ACM auto-renews | Zero |

## 20.5 Environment Variable Security Rules

| Rule | Enforcement |
|------|-------------|
| No secrets in Git | `.gitignore` + pre-commit hook + CI secret scanning |
| No secrets in Docker images | N/A (no Docker) |
| No secrets in client-side code | Only `VITE_*` public config in admin build |
| No secrets in mobile app binary | API keys fetched from backend at runtime |
| `.env` file permissions | `chmod 600` on EC2 |
| `.env` not in deployment artifact | Generated on-server from SSM |
| Log scrubbing | Application logger redacts known secret patterns |

---

# 21. BACKUP STRATEGY

## 21.1 Backup Overview

| Asset | Method | Frequency | Retention | Storage |
|-------|--------|-----------|-----------|---------|
| **MySQL (RDS)** | Automated snapshots | Daily (03:00 IST) | 35 days | RDS managed |
| **MySQL (RDS)** | Manual pre-deploy snapshot | Before production deploy | 90 days | RDS managed |
| **MySQL (RDS)** | PITR (transaction logs) | Continuous | 35 days | RDS managed |
| **MySQL (logical)** | mysqldump → S3 | Weekly (Sunday 04:00) | 90 days | `kuberone-backups-prod` |
| **S3 documents** | Versioning (automatic) | Every change | Indefinite (lifecycle to Glacier) | Same bucket |
| **S3 documents** | Cross-region replication | Continuous (Phase 2) | Indefinite | ap-southeast-1 replica |
| **S3 AI/RAG files** | Versioning | Every change | Indefinite | Same bucket |
| **Application code** | Git repository | Every commit | Indefinite | GitHub |
| **PM2 config** | Git (`ecosystem.config.js`) | Every deploy | Indefinite | GitHub |
| **Nginx config** | Git + server backup to S3 | On change | 1 year | `kuberone-backups-prod` |
| **SSM parameters** | AWS SSM versioning | On change | AWS managed | SSM |
| **SSL certificates** | ACM managed | Auto-renew | N/A | ACM |

## 21.2 Database Backup Details

| Attribute | Value |
|-----------|-------|
| Automated snapshot window | 03:00–04:00 IST (low traffic) |
| Manual snapshot naming | `kuberone-prod-pre-deploy-{YYYY-MM-DD}-{version}` |
| PITR granularity | 5-minute intervals |
| Logical backup size (est.) | ~500 MB compressed (Year 1) |
| Logical backup encryption | SSE-S3 on backup bucket |
| Backup verification | Monthly restore test to QA RDS |

## 21.3 Document Backup Details

| Control | Implementation |
|---------|----------------|
| Versioning | Enabled — every overwrite creates new version |
| Cross-region replication | Phase 2 — `kuberone-documents-prod` → ap-southeast-1 |
| Lifecycle | Standard → Glacier after 2 years → retain indefinitely |
| Deletion protection | MFA delete on production buckets (Phase 2) |
| Inventory | S3 inventory report weekly → `kuberone-backups-prod` |

## 21.4 Configuration Backup

| Config | Backup Method | Location |
|--------|--------------|----------|
| Nginx config | Git repo + S3 copy on change | `/etc/nginx/sites-available/kuberone` |
| PM2 ecosystem | Git repo (`ecosystem.config.js`) | In monorepo |
| Environment variables | SSM Parameter Store (versioned) | AWS SSM |
| Route 53 DNS records | Export on change | S3 backup |
| Security group rules | Terraform/CloudFormation (Phase 2) or manual doc | Git repo |
| Prisma schema + migrations | Git repo | In monorepo |

## 21.5 Backup Verification

| Test | Frequency | Owner | Success Criteria |
|------|-----------|-------|------------------|
| RDS snapshot restore to QA | Monthly | DevOps | DB accessible; table count matches |
| S3 object restore (version) | Quarterly | DevOps | Document retrievable |
| Logical backup restore | Quarterly | DevOps | Data integrity verified |
| Full DR drill | Quarterly | DevOps + CTO | RTO < 4 hours achieved |
| Backup alert test | Monthly | DevOps | Alerts fire correctly on simulated failure |

## 21.6 Retention Policy Summary

| Data Category | Retention | Regulation |
|---------------|-----------|------------|
| Application records | 8 years | RBI/NBFC norms |
| KYC documents | 8 years | RBI KYC norms |
| Commission records | 7 years | Tax/regulatory |
| Audit logs | 2–10 years | DPDP + internal policy |
| Application logs | 30 days | Operational |
| Access logs | 90 days | Security |
| DB backups (automated) | 35 days | Operational |
| DB backups (manual) | 90 days | Pre-deploy safety |
| S3 versions (documents) | Indefinite (Glacier after 2 years) | Regulatory |

---

# 22. DISASTER RECOVERY

## 22.1 Recovery Objectives

| Metric | Target | Measurement |
|--------|--------|-------------|
| **RPO** (Recovery Point Objective) | 1 hour | Maximum acceptable data loss |
| **RTO** (Recovery Time Objective) | 4 hours | Maximum acceptable downtime |
| **Availability** | 99.9% | 8.7 hours downtime/year maximum |
| **MTTR** (Mean Time to Recover) | < 2 hours | Average recovery time (non-catastrophic) |
| **MTTD** (Mean Time to Detect) | < 5 minutes | Monitoring detection time |

## 22.2 Disaster Scenarios & Recovery

| Scenario | Impact | Recovery Steps | RTO |
|----------|--------|----------------|-----|
| **App server crash** | API unavailable | PM2 auto-restart; if persistent: launch new EC2 from AMI, deploy latest, update DNS | < 30 min |
| **App server hardware failure** | API unavailable | Launch new EC2 from AMI; rsync latest deploy; PM2 start; verify health | < 1 hour |
| **Database primary failure** | API unavailable | RDS Multi-AZ automatic failover to standby | < 2 min |
| **Database corruption** | Data integrity compromised | Restore from latest pre-deploy snapshot to new RDS; update DATABASE_URL; restart API | < 2 hours |
| **Accidental data deletion** | Specific records deleted | PITR restore to point before deletion; selective data recovery | < 2 hours |
| **S3 bucket issue** | Documents inaccessible | Restore from versioned object; if bucket deleted: restore from cross-region replica (Phase 2) | < 1 hour |
| **SSL certificate failure** | HTTPS broken | ACM auto-renew; manual re-request if auto-renew fails | < 1 hour |
| **DDoS attack** | API degraded/unavailable | AWS Shield absorbs; enable WAF rules; rate limiting; scale if needed | < 1 hour |
| **Region failure (ap-south-1)** | Complete outage | Restore RDS snapshot in ap-southeast-1; activate S3 CRR; deploy EC2 in secondary region; update Route 53 | < 4 hours |
| **Ransomware / compromise** | System integrity unknown | Isolate affected instances; restore from clean AMI + pre-incident RDS snapshot; rotate all secrets | < 4 hours |
| **Complete disaster** | Total infrastructure loss | Execute full DR runbook (Section 22.4) | < 4 hours |

## 22.3 Recovery Process (Standard)

```
Disaster Detected (monitoring alert / user report)
    │
    ▼
Step 1: ASSESS (5 minutes)
    ├── Identify scope (app / DB / storage / network)
    ├── Classify severity (P1/P2)
    └── Notify on-call + CTO
    │
    ▼
Step 2: CONTAIN (15 minutes)
    ├── Isolate affected components
    ├── Enable maintenance page if needed
    └── Preserve logs/evidence
    │
    ▼
Step 3: RECOVER (variable)
    ├── Execute scenario-specific recovery (Section 22.2)
    ├── Verify data integrity
    └── Run smoke tests
    │
    ▼
Step 4: RESTORE SERVICE
    ├── Remove maintenance page
    ├── Monitor for 30 minutes
    └── Confirm with stakeholders
    │
    ▼
Step 5: POST-INCIDENT
    ├── Post-mortem within 48 hours
    ├── Update runbook if needed
    └── Implement preventive measures
```

## 22.4 Full DR Runbook

| Step | Action | Owner | Duration |
|------|--------|-------|----------|
| 1 | Confirm disaster scope; declare P1 | DevOps | 5 min |
| 2 | Notify CTO, management, customer support | DevOps | 5 min |
| 3 | Launch new EC2 in DR region (or same region) | DevOps | 15 min |
| 4 | Restore RDS from latest snapshot | DevOps | 30–60 min |
| 5 | Verify S3 access (primary or CRR) | DevOps | 10 min |
| 6 | Fetch SSM secrets on new EC2 | DevOps | 5 min |
| 7 | Deploy latest application build | DevOps | 10 min |
| 8 | Deploy admin panel build | DevOps | 5 min |
| 9 | Configure Nginx + SSL | DevOps | 10 min |
| 10 | PM2 start all processes | DevOps | 5 min |
| 11 | Update Route 53 DNS (if IP changed) | DevOps | 5 min (+ TTL propagation) |
| 12 | Run smoke tests | DevOps | 10 min |
| 13 | Enable monitoring/alerts | DevOps | 5 min |
| 14 | Notify all-clear to stakeholders | CTO | — |
| **Total** | | | **~2–4 hours** |

## 22.5 Business Continuity

| Function | Continuity Plan |
|----------|----------------|
| **Customer App** | Mobile apps continue to function (cached data); queue API calls; show maintenance message if API down |
| **DSA App** | Same as customer app; offline lead capture (Phase 2) |
| **Admin/CRM** | Maintenance page during recovery; manual processes via phone/email |
| **Customer Support** | Manual support via phone; WhatsApp; email during outage |
| **Loan Processing** | Manual processing via phone/email; resume when system restored |
| **Commission** | Delayed calculation acceptable for 24 hours; manual interim statements |
| **AI Advisor** | Unavailable during outage; FAQ fallback on support page |
| **Notifications** | Queue in worker; deliver when system restored (up to 24h backlog) |

## 22.6 DR Testing Schedule

| Test Type | Frequency | Scope | Success Criteria |
|-----------|-----------|-------|------------------|
| RDS failover test | Quarterly | Multi-AZ automatic failover | API recovers < 5 min |
| Snapshot restore test | Monthly | Restore to QA RDS | Data integrity verified |
| Full DR drill | Quarterly | Complete runbook execution | RTO < 4 hours |
| S3 recovery test | Quarterly | Restore versioned object | Document accessible |
| Secret rotation drill | Quarterly | Rotate JWT secrets | Zero-downtime rotation |
| Communication drill | Semi-annual | Notify all stakeholders | All contacts reachable |

---

# 23. SCALABILITY STRATEGY

## 23.1 Growth Projections

| Metric | Year 1 | Year 3 | Year 5 |
|--------|--------|--------|--------|
| **Registered Users** | 10,000 | 100,000 | 1,000,000 |
| **Monthly Active Users (MAU)** | 5,000 | 50,000 | 500,000 |
| **Leads/Year** | 50,000 | 500,000 | 2,000,000 |
| **Applications/Year** | 15,000 | 150,000 | 600,000 |
| **Disbursements/Year** | 8,000 | 80,000 | 300,000 |
| **DSAs/Partners** | 200 | 2,000 | 10,000 |
| **Documents Stored** | 50,000 | 500,000 | 2,000,000 |
| **S3 Storage** | 50 GB | 500 GB | 2 TB |
| **Database Size** | 5 GB | 50 GB | 200 GB |
| **AI Sessions/Month** | 5,000 | 50,000 | 200,000 |
| **API Requests/Day** | 50,000 | 500,000 | 2,000,000 |

## 23.2 Year 1 Infrastructure (Launch)

| Component | Specification | Monthly Cost (est.) |
|-----------|---------------|-------------------|
| EC2 App Server | 1× t3.large (2 vCPU, 8 GB) | ₹5,500 |
| RDS MySQL | db.t3.medium Multi-AZ (100 GB) | ₹12,000 |
| S3 | 50 GB standard + requests | ₹1,500 |
| Route 53 | 5 hosted zones/records | ₹500 |
| ACM | SSL certificates | Free |
| CloudWatch | Basic monitoring | ₹1,000 |
| Sentry | Developer plan | ₹2,000 |
| Data Transfer | 100 GB/month | ₹2,000 |
| OpenAI API | $500–860/month | ₹7,000 |
| **Total** | | **₹31,500–38,500** |

**Capacity:** 50K API requests/day; 5K MAU; 50K leads/year.

## 23.3 Year 3 Infrastructure (Growth)

| Component | Specification | Monthly Cost (est.) |
|-----------|---------------|-------------------|
| EC2 App Servers | 2× t3.large behind ALB | ₹11,000 |
| EC2 Worker Server | 1× t3.large | ₹5,500 |
| ALB | Application Load Balancer | ₹2,500 |
| RDS MySQL | db.r5.large Multi-AZ + 1 read replica (250 GB) | ₹35,000 |
| ElastiCache Redis | cache.t3.medium | ₹4,500 |
| S3 | 500 GB + requests + CRR | ₹5,000 |
| CloudFront | CDN for assets + admin | ₹3,000 |
| CloudWatch + Logs | Full monitoring | ₹3,000 |
| Sentry | Team plan | ₹5,000 |
| WAF | Basic rules | ₹3,000 |
| Data Transfer | 500 GB/month | ₹8,000 |
| OpenAI API | $2,000–4,000/month | ₹30,000 |
| **Total** | | **₹1,15,000–1,25,000** |

**Capacity:** 500K API requests/day; 50K MAU; 500K leads/year.

## 23.4 Year 5 Infrastructure (Scale)

| Component | Specification | Monthly Cost (est.) |
|-----------|---------------|-------------------|
| EC2 App Servers | 4–8× t3.xlarge behind ALB | ₹44,000–88,000 |
| EC2 Worker Servers | 2× t3.xlarge | ₹22,000 |
| ALB | Application Load Balancer | ₹5,000 |
| RDS MySQL | db.r5.xlarge Multi-AZ + 2 read replicas (500 GB) | ₹80,000 |
| RDS Proxy | Connection pooling | ₹5,000 |
| ElastiCache Redis | cache.r5.large (cluster) | ₹15,000 |
| S3 | 2 TB + requests + CRR | ₹15,000 |
| CloudFront | Full CDN | ₹8,000 |
| CloudWatch + Logs + APM | Full observability | ₹8,000 |
| Sentry | Business plan | ₹10,000 |
| WAF | Advanced rules | ₹5,000 |
| Data Transfer | 2 TB/month | ₹25,000 |
| OpenAI API | $5,000–10,000/month | ₹80,000 |
| Multi-region DR | Secondary region standby | ₹30,000 |
| **Total** | | **₹3,50,000–4,00,000** |

**Capacity:** 2M API requests/day; 500K MAU; 2M leads/year.

## 23.5 Scaling Triggers & Actions

| Trigger | Threshold | Action |
|---------|-----------|--------|
| EC2 CPU > 70% (7-day avg) | Sustained | Upgrade instance type or add instance |
| API p95 > 500ms | Sustained 3 days | Investigate; add read replica; optimize queries |
| DB connections > 80% | Current | Add RDS Proxy; optimize pool sizes |
| DB storage > 80% | Current | Increase allocated storage (online) |
| Worker queue > 1000 jobs | Sustained | Add worker EC2 or scale worker PM2 instances |
| S3 storage > budget | 80% of annual budget | Review lifecycle policies; archive to Glacier |
| Error rate > 1% | 24-hour window | Investigate; consider scale-up |
| AI cost > budget | 80% of monthly budget | Implement request queuing; cache responses |
| MAU > 2× current capacity | Monthly check | Proactive scale-up before hitting limits |

## 23.6 Scaling Principles

| Principle | Implementation |
|-----------|----------------|
| Scale horizontally first | Add EC2 instances behind ALB |
| Scale database reads | Read replicas for reporting/analytics |
| Scale workers independently | Separate worker EC2 from API |
| Scale storage automatically | S3 auto-scales; RDS online storage increase |
| Don't scale prematurely | Monitor 7-day trends before scaling |
| Cost-aware scaling | Reserved instances after 3 months stability |
| Stateless API | No server-side session — enables horizontal scaling |

---

# 24. COST OPTIMIZATION

## 24.1 Cost Breakdown (Phase 1 Production)

| Category | Monthly Cost (₹) | % of Total | Optimization |
|----------|-------------------|------------|--------------|
| EC2 (app server) | 5,500 | 15% | Reserved instance after 3 months (-30%) |
| RDS (database) | 12,000 | 33% | Right-size; reserved instance (-30%) |
| S3 (storage) | 1,500 | 4% | Lifecycle policies; Glacier for old docs |
| OpenAI API | 7,000–15,000 | 20–40% | Rate limits; caching; gpt-4o-mini for simple tasks |
| Data transfer | 2,000 | 5% | CloudFront caching (Phase 2) |
| Monitoring (Sentry + CW) | 3,000 | 8% | Free tiers; right-size log retention |
| DNS + SSL | 500 | 1% | Already optimized (ACM free) |
| Firebase FCM | 0 | 0% | Free tier sufficient |
| WhatsApp Business | 2,000 | 5% | Template optimization; batch messages |
| SMS (OTP) | 3,000 | 8% | Rate limit OTP; cache verification |
| **Total** | **₹36,500–44,500** | 100% | |

## 24.2 Server Cost Optimization

| Strategy | Savings | When |
|----------|---------|------|
| Reserved Instances (1-year) | 30–40% on EC2 + RDS | After 3 months stable usage |
| Spot instances for workers (Phase 3) | 60–70% on worker EC2 | Non-critical background jobs |
| Right-sizing | 20–30% | Quarterly review of CloudWatch metrics |
| QA/UAT shutdown schedule | 50% on non-prod EC2 | Stop QA EC2 nights/weekends |
| Graviton instances (ARM) | 20% cheaper | Phase 2 evaluation (t4g instances) |

## 24.3 Storage Cost Optimization

| Strategy | Savings | Implementation |
|----------|---------|----------------|
| S3 Intelligent-Tiering | 10–20% | Auto-move infrequent access objects |
| Glacier for old documents | 60–80% vs standard | Lifecycle rule: > 2 years → Glacier |
| Temp folder auto-delete | Prevents waste | 24-hour lifecycle on `temp/` prefix |
| Compress logical backups | 50% storage | gzip mysqldump before S3 upload |
| CloudFront caching | Reduces S3 GET costs | Cache product images, assets |

## 24.4 AI Cost Optimization

| Strategy | Savings | Implementation |
|----------|---------|----------------|
| gpt-4o-mini for simple tasks | 60% per call | Support FAQ, simple queries |
| Response caching | 20–30% | Cache identical eligibility queries (1-hour TTL) |
| Token budget per session | Prevents runaway | 5,000 token max per advisor session |
| Rate limiting | Prevents abuse | 20 messages/hour per user |
| Batch processing | 10% | Batch copilot insights during off-peak |
| Monthly budget alerts | Prevents overspend | Alert at 80% and 100% of budget |
| RAG chunk optimization | 10% | Optimal chunk size reduces context tokens |

## 24.5 Monitoring Cost Optimization

| Strategy | Savings | Implementation |
|----------|---------|----------------|
| CloudWatch free tier | Basic monitoring free | 10 metrics, 5 GB logs free |
| Log retention limits | 30–50% | 30-day retention (not indefinite) |
| Sentry event limits | 20% | Filter noisy errors; sample in production |
| UptimeRobot free tier | Free for 50 monitors | Sufficient for Phase 1 |
| PM2 monitoring (free) | Free | Built-in process monitoring |

## 24.6 Cost Review Cadence

| Review | Frequency | Owner | Output |
|--------|-----------|-------|--------|
| AWS Cost Explorer review | Weekly | DevOps | Weekly spend report |
| Budget vs. actual | Monthly | DevOps + Finance | Monthly cost report |
| Reserved instance analysis | Quarterly | DevOps | RI purchase recommendation |
| OpenAI cost review | Monthly | AI Lead + DevOps | Token usage optimization plan |
| Right-sizing review | Quarterly | DevOps | Instance upgrade/downgrade plan |
| Annual budget planning | Annual | CTO + Finance | Next year infrastructure budget |

---

# 25. COMPLIANCE & AUDIT

## 25.1 Regulatory Compliance

| Regulation | Requirement | Implementation |
|------------|-------------|----------------|
| **RBI Guidelines** | Fair practice; data security; audit trail | AI disclaimers; encryption; audit logs |
| **DPDP Act 2023** | Consent; data minimization; deletion rights | Consent capture; PII masking; deletion API |
| **IT Act 2000** | Reasonable security practices | This security architecture |
| **NBFC norms** (if applicable) | Data localization; retention | ap-south-1 region; 8-year retention |
| **PCI DSS** (if payment gateway) | Card data security | No card data stored; gateway handles PCI |

## 25.2 Audit Log Requirements

| Event Category | Retention | Storage | Access |
|----------------|-----------|---------|--------|
| Authentication events | 2 years | DB + CloudWatch | Security team |
| PII access | 10 years | DB (append-only) | Compliance team |
| Document access | 8 years | DB (append-only) | Compliance team |
| Financial mutations | 10 years | DB (append-only) | Compliance + Finance |
| Admin actions | 5 years | DB + CloudWatch | Security team |
| AI interactions | 2 years | DB | AI Lead + Compliance |
| Configuration changes | 5 years | SSM versioning + Git | DevOps |
| Deployment events | 2 years | CI/CD logs | DevOps |

## 25.3 Security Audits

| Audit Type | Frequency | Auditor | Scope |
|------------|-----------|---------|-------|
| Penetration test | Quarterly | External firm | API, admin, mobile |
| Vulnerability scan | Monthly | Automated (npm audit + AWS Inspector) | Dependencies, EC2 |
| Access review | Quarterly | Security + DevOps | IAM, SSM, SSH, admin users |
| Code security review | Per PR (auth/AI changes) | Backend Lead | Critical modules |
| Infrastructure review | Semi-annual | DevOps + CTO | AWS config vs. this document |
| AI response audit | Quarterly | Compliance + AI Lead | Sample of AI responses |
| Log integrity check | Monthly | DevOps | Audit log completeness |

## 25.4 Access Reviews

| System | Review Frequency | Reviewer | Actions |
|--------|-----------------|----------|---------|
| AWS IAM users/roles | Quarterly | CTO + DevOps | Remove unused; least privilege |
| SSM Parameter access | Quarterly | DevOps | Verify IAM policies |
| Production SSH access | Quarterly | CTO | Remove unnecessary access |
| Admin panel users | Monthly | Admin Manager | Deactivate inactive users |
| Database credentials | Quarterly | DevOps | Rotate if needed |
| GitHub repository access | Quarterly | CTO | Remove departed team members |
| Firebase console | Quarterly | DevOps | Verify access list |
| OpenAI API key access | Quarterly | AI Lead | Verify usage; rotate if needed |

## 25.5 Compliance Monitoring

| Monitor | Tool | Alert |
|---------|------|-------|
| Encryption at rest (RDS) | AWS Config | If disabled |
| Encryption at rest (S3) | AWS Config | If SSE disabled on any bucket |
| Public S3 access | AWS Config | If Block Public Access disabled |
| SSL certificate validity | ACM + custom alert | < 14 days to expiry |
| Audit log gaps | Custom check | If no audit logs for > 1 hour during business hours |
| Failed backup | RDS event + CloudWatch | If daily snapshot fails |
| Unauthorized API access | Security logs | > 50 denied requests/hour |
| Data deletion requests | Support tickets | SLA: process within 30 days (DPDP) |

---

# 26. DEVOPS OPERATING MODEL

## 26.1 Team Structure (Phase 1)

| Role | Count | Responsibilities |
|------|-------|-----------------|
| **DevOps / SRE Engineer** | 1 | Infrastructure, CI/CD, monitoring, deployments, DR |
| **Backend Lead** | 1 | Architecture, code review, performance, on-call secondary |
| **CTO** | 1 | Approval authority, architecture decisions, P1 escalation |
| **QA Lead** | 1 | UAT sign-off, test environment management |
| **Developers** | 3–5 | Feature development, PR reviews, no production access |

## 26.2 Responsibility Matrix (RACI)

| Activity | Developer | QA | DevOps | Backend Lead | CTO |
|----------|-----------|-----|--------|-------------|-----|
| Feature development | **R** | I | I | A | I |
| Code review | **R** | I | I | **A** | I |
| CI pipeline maintenance | C | I | **R/A** | C | I |
| QA deployment | I | **R** | **A** | I | I |
| UAT sign-off | I | **R/A** | C | C | I |
| Production deployment | I | C | **R** | C | **A** |
| Infrastructure changes | I | I | **R/A** | C | **A** |
| Monitoring/alerting | I | I | **R/A** | C | I |
| Incident response (P1) | C | I | **R** | **R** | **A** |
| DR drill | I | C | **R/A** | C | **A** |
| Secret rotation | I | I | **R/A** | C | I |
| Security audit | C | C | **R** | C | **A** |
| Cost review | I | I | **R** | I | **A** |
| Mobile store release | **R** | **R** | C | C | **A** |

*R = Responsible, A = Accountable, C = Consulted, I = Informed*

## 26.3 Release Responsibilities

| Phase | Owner | Activities |
|-------|-------|------------|
| **Development** | Developer | Feature branch; local testing; PR creation |
| **Code Review** | Backend Lead | Review code, RBAC, audit logging |
| **CI** | GitHub Actions (automated) | Lint, test, build, security scan |
| **QA Deploy** | DevOps (automated) | Deploy to QA on `develop` merge |
| **QA Testing** | QA Lead | Regression testing; bug reports |
| **UAT Deploy** | DevOps | Deploy `release/*` to UAT |
| **UAT Testing** | QA + Product + Business | Acceptance testing; sign-off |
| **Production Deploy** | DevOps (with CTO approval) | Deploy to production |
| **Post-Deploy Monitor** | DevOps | 30-minute monitoring window |
| **Release Notes** | Product Owner | Changelog; stakeholder communication |

## 26.4 Incident Management

| Severity | Response Time | Resolution Target | Communication |
|----------|---------------|-------------------|---------------|
| P1 (Critical) | 15 minutes | 4 hours | CTO + all stakeholders within 30 min |
| P2 (High) | 1 hour | 8 hours | DevOps + Backend Lead within 1 hour |
| P3 (Medium) | 4 hours | 24 hours | DevOps ticket; daily update |
| P4 (Low) | Next business day | 1 week | DevOps ticket |

## 26.5 Change Management

| Change Type | Approval | Documentation |
|-------------|----------|---------------|
| Infrastructure change | CTO + DevOps | Change ticket; update this document |
| Production deployment | CTO/DevOps | Release notes; deployment log |
| Database migration | Backend Lead + DevOps | Migration review in PR |
| Secret rotation | DevOps | Rotation log |
| Security policy change | CTO + Security | Updated security section |
| Monitoring/alert change | DevOps | Updated alerting section |
| Emergency hotfix | CTO | Post-mortem within 48 hours |

---

# 27. FUTURE INFRASTRUCTURE

## 27.1 Microservices Readiness

| Module | Extract When | Target Infrastructure |
|--------|-------------|----------------------|
| **Notification Service** | > 100K notifications/day | Dedicated EC2; own PM2 process; shared ALB |
| **AI Service** | > 50K AI sessions/month | Dedicated EC2; GPU not needed (OpenAI API) |
| **Analytics Service** | > 1M events/day | Dedicated EC2 + warehouse (Redshift) |
| **Document/OCR Service** | > 10K documents/day | Dedicated EC2; higher CPU |
| **Workflow Engine** | Complex SLA rules | Dedicated EC2 |

**Extraction Pattern:**
- Module already bounded in monorepo (`modules/{name}/`)
- Extract to separate PM2 process first (same EC2)
- Then separate EC2 behind same ALB
- Eventually separate repository if team scales

## 27.2 Multi-Region Readiness

| Phase | Region | Purpose |
|-------|--------|---------|
| Phase 1 | ap-south-1 (Mumbai) | Primary — all services |
| Phase 2 | ap-south-1 | Primary + S3 CRR to ap-southeast-1 |
| Phase 3 | ap-south-1 + ap-southeast-1 (Singapore) | Active-passive DR |
| Phase 4 | Multi-region active-active | If national scale requires |

**Multi-Region Prerequisites:**
- Stateless API (already designed)
- Database replication (RDS cross-region read replica)
- S3 CRR (already planned)
- Route 53 failover routing
- Session-less auth (JWT — already designed)

## 27.3 Lender Integration Infrastructure

| Component | Requirement |
|-----------|-------------|
| API credentials vault | SSM SecureString per lender |
| Webhook endpoints | Nginx routes for lender callbacks |
| Integration worker | Dedicated PM2 process for async lender API calls |
| Retry queue | Worker with exponential backoff |
| IP whitelisting | Lender IPs whitelisted on security group |
| Audit logging | All lender API calls logged |
| Sandbox environment | Separate UAT credentials per lender |

## 27.4 Product Expansion Infrastructure

| Product | Infrastructure Impact | Additional Resources |
|---------|------------------------|---------------------|
| **Insurance** | New module; new S3 prefix; new RAG sources | No new servers (Phase 1) |
| **Credit Cards** | New module; simplified LOS | No new servers |
| **Mutual Funds** | New module; MF data feed integration | Integration worker capacity |
| **Wealth Products** | New module; portfolio analytics | Report worker capacity |
| **Gold Loan** | New module; valuation integration | OCR worker capacity |
| **Fixed Deposit** | New module; booking flow | No new servers |

**Principle:** New products deploy as backend modules within the existing monolith. Infrastructure scales only when volume demands.

## 27.5 Technology Evolution Path

| Component | Current (Phase 1) | Phase 2 | Phase 3 |
|-----------|-------------------|---------|---------|
| Compute | EC2 + PM2 | EC2 + ALB + PM2 | EC2 fleet + worker EC2 |
| Database | RDS MySQL Multi-AZ | + read replica + RDS Proxy | + cross-region replica |
| Cache | In-memory (Node) | ElastiCache Redis | Redis cluster |
| Storage | S3 standard | S3 + CloudFront CDN | S3 + CRR + Intelligent-Tiering |
| Monitoring | PM2 + CloudWatch + Sentry | + CloudWatch Logs + APM | + PagerDuty + Grafana |
| CI/CD | GitHub Actions | + staging gates + canary | + automated rollback |
| Secrets | SSM Parameter Store | + automatic rotation | + HashiCorp Vault (if needed) |
| Containerization | None | None | Evaluate for workers only |
| Kubernetes | None | None | Evaluate at 1M+ users |

---

# 28. PRODUCTION GO-LIVE CHECKLIST

## 28.1 Infrastructure Checklist

| # | Item | Status | Owner |
|---|------|--------|-------|
| 1 | Production VPC created with correct CIDR | ☐ | DevOps |
| 2 | Public subnets in 2 AZs | ☐ | DevOps |
| 3 | Private subnets for RDS in 2 AZs | ☐ | DevOps |
| 4 | Security groups configured per Section 5.2 | ☐ | DevOps |
| 5 | EC2 app server launched (t3.large, Ubuntu 22.04) | ☐ | DevOps |
| 6 | RDS MySQL 8 Multi-AZ provisioned (db.t3.medium) | ☐ | DevOps |
| 7 | S3 buckets created (6 production buckets) | ☐ | DevOps |
| 8 | S3 versioning enabled on all production buckets | ☐ | DevOps |
| 9 | S3 Block Public Access enabled on all buckets | ☐ | DevOps |
| 10 | Route 53 hosted zone configured | ☐ | DevOps |
| 11 | ACM wildcard certificate issued | ☐ | DevOps |
| 12 | EC2 instance role with S3 + SSM permissions | ☐ | DevOps |
| 13 | SSM parameters populated for production | ☐ | DevOps |
| 14 | Nginx installed and configured | ☐ | DevOps |
| 15 | PM2 installed with startup script | ☐ | DevOps |
| 16 | Node.js 20 LTS installed | ☐ | DevOps |
| 17 | `pm2-logrotate` configured | ☐ | DevOps |
| 18 | System logrotate configured for Nginx | ☐ | DevOps |
| 19 | `unattended-upgrades` enabled (security patches) | ☐ | DevOps |
| 20 | EBS volumes encrypted | ☐ | DevOps |

## 28.2 Security Checklist

| # | Item | Status | Owner |
|---|------|--------|-------|
| 21 | TLS 1.3 configured on Nginx | ☐ | DevOps |
| 22 | HSTS header enabled | ☐ | DevOps |
| 23 | Security headers configured (Section 19.8) | ☐ | DevOps |
| 24 | Rate limiting configured (Nginx + Express) | ☐ | DevOps |
| 25 | CORS whitelist configured for production domains | ☐ | Backend Lead |
| 26 | JWT secrets generated (256-bit) and stored in SSM | ☐ | DevOps |
| 27 | All API keys stored in SSM (not in code) | ☐ | DevOps |
| 28 | RDS encryption at rest enabled | ☐ | DevOps |
| 29 | RDS not publicly accessible | ☐ | DevOps |
| 30 | SSH key-only access (no password auth) | ☐ | DevOps |
| 31 | Admin panel IP whitelist configured | ☐ | DevOps |
| 32 | RBAC middleware verified on all endpoints | ☐ | Backend Lead |
| 33 | PII masking verified per role | ☐ | Backend Lead |
| 34 | Audit logging enabled for all mutations | ☐ | Backend Lead |
| 35 | `.env` file permissions set to 600 | ☐ | DevOps |
| 36 | Git secret scanning enabled | ☐ | DevOps |
| 37 | npm audit passing (no critical vulnerabilities) | ☐ | Backend Lead |
| 38 | Penetration test completed | ☐ | Security |
| 39 | DPDP consent flow verified | ☐ | Product |
| 40 | AI disclaimer displayed on all AI sessions | ☐ | Product |

## 28.3 Database Checklist

| # | Item | Status | Owner |
|---|------|--------|-------|
| 41 | Prisma migrations applied to production | ☐ | DevOps |
| 42 | Database indexes verified | ☐ | Backend Lead |
| 43 | Slow query log enabled | ☐ | DevOps |
| 44 | Connection pool limits configured | ☐ | Backend Lead |
| 45 | Automated backup enabled (daily, 35-day retention) | ☐ | DevOps |
| 46 | PITR enabled | ☐ | DevOps |
| 47 | Pre-go-live manual snapshot taken | ☐ | DevOps |
| 48 | Seed data applied (products, roles, config) | ☐ | Backend Lead |
| 49 | Database connection tested from EC2 | ☐ | DevOps |
| 50 | Read-only user created for reporting (if needed) | ☐ | DevOps |

## 28.4 Monitoring Checklist

| # | Item | Status | Owner |
|---|------|--------|-------|
| 51 | PM2 monitoring active | ☐ | DevOps |
| 52 | CloudWatch metrics enabled for EC2 + RDS | ☐ | DevOps |
| 53 | Sentry configured for production | ☐ | DevOps |
| 54 | Uptime monitor on `/health` (60s interval) | ☐ | DevOps |
| 55 | P1/P2/P3 alerts configured per Section 17 | ☐ | DevOps |
| 56 | Alert routing tested (SMS, Slack, email) | ☐ | DevOps |
| 57 | On-call rotation established | ☐ | CTO |
| 58 | Health check endpoint returning 200 | ☐ | DevOps |
| 59 | Error tracking verified (test error in Sentry) | ☐ | DevOps |
| 60 | AI cost monitoring dashboard configured | ☐ | DevOps |

## 28.5 Backup Checklist

| # | Item | Status | Owner |
|---|------|--------|-------|
| 61 | RDS automated backup verified | ☐ | DevOps |
| 62 | Manual snapshot restore tested (to QA) | ☐ | DevOps |
| 63 | S3 versioning verified (upload + overwrite test) | ☐ | DevOps |
| 64 | Logical backup cron configured | ☐ | DevOps |
| 65 | Backup failure alert configured | ☐ | DevOps |
| 66 | DR runbook documented and reviewed | ☐ | DevOps |
| 67 | DR drill scheduled (within 30 days of go-live) | ☐ | CTO |

## 28.6 Application Checklist

| # | Item | Status | Owner |
|---|------|--------|-------|
| 68 | Backend deployed and PM2 running | ☐ | DevOps |
| 69 | Admin panel deployed and accessible | ☐ | DevOps |
| 70 | API smoke tests passing | ☐ | QA |
| 71 | Auth flow (OTP → login → refresh) working | ☐ | QA |
| 72 | Document presign + upload flow working | ☐ | QA |
| 73 | AI Advisor responding (English + Hindi) | ☐ | QA |
| 74 | Push notification delivery verified | ☐ | QA |
| 75 | WhatsApp message delivery verified | ☐ | QA |
| 76 | Commission calculation verified | ☐ | QA |
| 77 | LOS stage transitions working | ☐ | QA |
| 78 | RBAC permissions verified per role | ☐ | QA |
| 79 | Load test completed (100 concurrent users) | ☐ | DevOps |
| 80 | Rollback procedure tested | ☐ | DevOps |

## 28.7 Mobile App Checklist

| # | Item | Status | Owner |
|---|------|--------|-------|
| 81 | Customer App production build submitted to Play Store | ☐ | Mobile Lead |
| 82 | Customer App production build submitted to App Store | ☐ | Mobile Lead |
| 83 | DSA App production build submitted to Play Store | ☐ | Mobile Lead |
| 84 | DSA App production build submitted to App Store | ☐ | Mobile Lead |
| 85 | Production API URL configured in app builds | ☐ | Mobile Lead |
| 86 | Firebase FCM production config verified | ☐ | Mobile Lead |
| 87 | Sentry production DSN configured | ☐ | Mobile Lead |
| 88 | Expo OTA update channel configured | ☐ | Mobile Lead |
| 89 | App Store / Play Store listings complete | ☐ | Product |
| 90 | Privacy policy and terms published | ☐ | Product |

## 28.8 Go-Live Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| CTO | | | |
| DevOps Lead | | | |
| Backend Lead | | | |
| QA Lead | | | |
| Product Owner | | | |
| Compliance Head | | | |

---

# 29. DEVELOPMENT TO PRODUCTION ROADMAP

## 29.1 Roadmap Overview

| Phase | Name | Weeks | Environments | Key Deliverables |
|-------|------|-------|--------------|------------------|
| **1** | Development Infrastructure | 1–4 | Dev (local + shared) | Dev environment, CI pipeline, Git workflow |
| **2** | QA Environment | 5–8 | Dev + QA | QA EC2, auto-deploy, integration testing |
| **3** | UAT Environment | 9–16 | Dev + QA + UAT | UAT EC2/RDS/S3, release process, mobile preview builds |
| **4** | Production Go-Live | 17–26 | All environments | Production infra, security hardening, go-live |

## 29.2 Phase 1: Development Infrastructure (Weeks 1–4)

| Week | Deliverables | Owner |
|------|-------------|-------|
| W1 | GitHub repository setup; branch protection rules; monorepo structure | DevOps |
| W1 | Local development guide (MySQL, `.env`, `pnpm dev`) | Backend Lead |
| W2 | GitHub Actions CI pipeline: lint, typecheck, test, build | DevOps |
| W2 | Prisma local setup; initial migration; seed data | Backend Lead |
| W3 | Shared dev EC2 (optional); dev S3 bucket | DevOps |
| W3 | Pre-commit hooks: lint, secret scanning | DevOps |
| W4 | CI badge; test coverage reporting; Dependabot enabled | DevOps |
| W4 | Developer onboarding documentation | Backend Lead |

**Exit Criteria:**
- [ ] CI pipeline runs on every PR (lint + test + build)
- [ ] All developers can run full stack locally
- [ ] Git workflow documented and followed
- [ ] No secrets in repository (verified by scanning)

## 29.3 Phase 2: QA Environment (Weeks 5–8)

| Week | Deliverables | Owner |
|------|-------------|-------|
| W5 | QA EC2 provisioned; Node.js + PM2 + Nginx installed | DevOps |
| W5 | QA RDS MySQL provisioned; Prisma migrate deploy | DevOps |
| W5 | QA S3 bucket created | DevOps |
| W6 | CD pipeline: auto-deploy to QA on `develop` merge | DevOps |
| W6 | SSM parameters for QA environment | DevOps |
| W7 | QA smoke tests automated (health, auth, core endpoints) | QA + DevOps |
| W7 | QA database seed script | Backend Lead |
| W8 | QA shutdown schedule (nights/weekends) for cost saving | DevOps |
| W8 | QA access documentation | DevOps |

**Exit Criteria:**
- [ ] `develop` merge auto-deploys to QA within 10 minutes
- [ ] QA smoke tests pass after every deploy
- [ ] QA team can access and test all features
- [ ] QA environment cost < ₹8K/month

## 29.4 Phase 3: UAT Environment (Weeks 9–16)

| Week | Deliverables | Owner |
|------|-------------|-------|
| W9 | UAT EC2 + RDS + S3 provisioned (production-like sizing) | DevOps |
| W9 | UAT DNS: `uat-api.kuberone.in`, `uat-admin.kuberone.in` | DevOps |
| W10 | UAT SSL certificates (ACM) | DevOps |
| W10 | CD pipeline for `release/*` → UAT deploy | DevOps |
| W11 | UAT SSM parameters populated | DevOps |
| W11 | Mobile preview builds pointing to UAT API | Mobile Lead |
| W12 | UAT test data (masked production-like) | QA |
| W13 | UAT sign-off process documented | QA Lead |
| W14 | Performance baseline testing on UAT | DevOps |
| W15 | Security review on UAT (RBAC, PII, audit) | Security |
| W16 | UAT full regression test pass | QA Lead |

**Exit Criteria:**
- [ ] UAT environment mirrors production architecture
- [ ] Release branch deploys to UAT successfully
- [ ] Mobile preview builds work against UAT
- [ ] Business stakeholders sign off on UAT testing
- [ ] Security review passed

## 29.5 Phase 4: Production Go-Live (Weeks 17–26)

| Week | Deliverables | Owner |
|------|-------------|-------|
| W17 | Production VPC, subnets, security groups | DevOps |
| W18 | Production EC2 + RDS + S3 provisioned | DevOps |
| W19 | Production DNS, SSL, Nginx, PM2 configured | DevOps |
| W19 | Production SSM parameters populated (all secrets) | DevOps |
| W20 | CD pipeline for `main` → production (with approval gate) | DevOps |
| W21 | Monitoring stack: CloudWatch, Sentry, uptime monitor | DevOps |
| W21 | Alerting framework configured (Section 17) | DevOps |
| W22 | Backup strategy implemented and verified | DevOps |
| W22 | DR runbook documented; DR drill scheduled | DevOps |
| W23 | Security hardening complete (Section 28.2) | DevOps + Security |
| W23 | Penetration test completed | Security |
| W24 | Load test on production (100 concurrent users) | DevOps |
| W24 | Admin panel deployed to production | DevOps |
| W25 | Mobile apps submitted to Play Store + App Store | Mobile Lead |
| W25 | Production go-live checklist completed (Section 28) | All |
| W26 | **GO-LIVE** — Production deployment | CTO + DevOps |
| W26 | Post-go-live monitoring (48-hour watch) | DevOps |
| W26 | DR drill within 30 days | DevOps |

**Exit Criteria:**
- [ ] All 90 go-live checklist items completed
- [ ] Production smoke tests passing
- [ ] Monitoring and alerting operational
- [ ] Backup verified (restore test passed)
- [ ] Mobile apps approved and published
- [ ] CTO go-live approval signed
- [ ] Post-go-live 48-hour watch completed without P1 incidents
- [ ] DR drill scheduled within 30 days

## 29.6 Post-Go-Live Roadmap (Months 1–6)

| Month | Focus | Deliverables |
|-------|-------|-------------|
| M1 | Stability | Monitor; fix production issues; first DR drill |
| M2 | Optimization | Performance tuning; slow query optimization; cost review |
| M3 | Hardening | Admin IP whitelist; WAF evaluation; security audit |
| M4 | Scale Prep | Read replica evaluation; Redis evaluation; load test |
| M5 | Worker Separation | Dedicated worker EC2; AI worker separation |
| M6 | Phase 2 Infra | ALB + 2 EC2; CloudFront CDN; ElastiCache Redis |

---

# APPENDIX A: AWS SERVICE MAP

| AWS Service | Purpose | Environment | Phase |
|-------------|---------|-------------|-------|
| EC2 | Application + worker servers | All (except dev local) | 1 |
| RDS (MySQL 8) | Primary database | QA, UAT, Production | 1 |
| S3 | Document/asset/backup storage | All | 1 |
| Route 53 | DNS management | UAT, Production | 1 |
| ACM | SSL/TLS certificates | UAT, Production | 1 |
| SSM Parameter Store | Secrets management | All (except dev local) | 1 |
| CloudWatch | Metrics + logs + alarms | QA, UAT, Production | 1 |
| ALB | Load balancing | Production | 2 |
| ElastiCache (Redis) | Caching + rate limits | Production | 2 |
| CloudFront | CDN for static assets | Production | 2 |
| WAF | Web application firewall | Production | 2 |
| AWS Backup | Cross-service backup orchestration | Production | 2 |
| AWS Config | Compliance monitoring | Production | 2 |
| AWS Shield | DDoS protection | Production | 1 (Standard, free) |
| SES | Transactional email (optional) | Production | 1.5 |
| IAM | Access management | All | 1 |

## Services Explicitly NOT Used

| Service | Reason |
|---------|--------|
| Docker / ECS / EKS | Per deployment strategy — PM2 on EC2 |
| Lambda | Monolith on EC2; no serverless decomposition |
| DynamoDB | MySQL meets all requirements |
| API Gateway | Nginx serves as API gateway |
| Cognito | Custom JWT auth implemented |
| CloudFormation / Terraform | Phase 1 manual setup; IaC in Phase 2 |

---

# APPENDIX B: PM2 PROCESS REFERENCE

| Process | Entry Point | Mode | Instances | Memory | Port |
|---------|-------------|------|-----------|--------|------|
| `kuberone-api` | `dist/server.js` | cluster | 2 | 512 MB | 4000 |
| `kuberone-workers` | `dist/workers/index.js` | fork | 1 | 256 MB | — |
| `kuberone-scheduler` | `dist/scheduler/index.js` | fork | 1 | 128 MB | — |
| `ai-worker` (Phase 2) | `dist/workers/ai.worker.js` | fork | 1–2 | 512 MB | — |
| `report-worker` (Phase 2) | `dist/workers/report.worker.js` | fork | 1 | 256 MB | — |
| `workflow-worker` (Phase 2) | `dist/workers/workflow.worker.js` | fork | 1 | 256 MB | — |

---

# APPENDIX C: NGINX SERVER BLOCK REFERENCE

| Server Block | `server_name` | Root / Proxy | SSL | Special |
|-------------|---------------|-------------|-----|---------|
| API | `api.kuberone.in` | `proxy_pass http://127.0.0.1:4000` | ACM | Rate limit; SSE support |
| Admin | `admin.kuberone.in` | `root /var/www/kuberone/admin/dist` | ACM | SPA fallback; IP whitelist |
| CDN | `cdn.kuberone.in` | CloudFront origin | ACM | Cache headers |
| UAT API | `uat-api.kuberone.in` | `proxy_pass http://127.0.0.1:4000` | ACM | Same as API |
| UAT Admin | `uat-admin.kuberone.in` | `root /var/www/kuberone/admin/dist` | ACM | Same as admin |
| Health | `api.kuberone.in/health` | `proxy_pass` (no auth) | ACM | ALB health check target |

---

# APPENDIX D: DEPLOYMENT RUNBOOK (QUICK REFERENCE)

## Standard Production Deploy

| Step | Command / Action |
|------|-----------------|
| 1 | Verify UAT sign-off and CTO approval |
| 2 | CI pipeline green on `main` |
| 3 | RDS manual snapshot (automated in CI) |
| 4 | `prisma migrate deploy` (automated in CI) |
| 5 | Rsync backend `dist/` to EC2 |
| 6 | Rsync admin `dist/` to EC2 |
| 7 | Fetch SSM secrets → `.env` |
| 8 | `pm2 reload kuberone-api` |
| 9 | `pm2 reload kuberone-workers` (if changed) |
| 10 | `curl https://api.kuberone.in/health` → 200 |
| 11 | Run smoke tests |
| 12 | Monitor for 30 minutes |

## Emergency Rollback

| Step | Command / Action |
|------|-----------------|
| 1 | `rsync` previous release from `/var/www/kuberone/releases/` |
| 2 | `pm2 reload kuberone-api` |
| 3 | Verify `/health` → 200 |
| 4 | If DB issue: restore RDS pre-deploy snapshot |
| 5 | Notify team; schedule post-mortem |

---

# APPENDIX E: DOCUMENT APPROVAL

| Role | Name | Date | Signature |
|------|------|------|-----------|
| CTO | | | |
| DevOps Lead | | | |
| Security Head | | | |
| Backend Lead | | | |

---

# APPENDIX F: REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | KuberOne Architecture Team | Initial release |

---

# APPENDIX G: RELATED DOCUMENT INDEX

| Document | Relationship |
|----------|-------------|
| [KUBERONE_SYSTEM_ARCHITECTURE.md](./KUBERONE_SYSTEM_ARCHITECTURE.md) | Parent architecture; deployment section 29 |
| [KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md](./KUBERONE_BACKEND_DEVELOPMENT_BLUEPRINT.md) | Backend deployment section 30 |
| [KUBERONE_AI_RAG_ARCHITECTURE.md](./KUBERONE_AI_RAG_ARCHITECTURE.md) | AI infrastructure, OpenAI cost, voice stack |
| [KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md](./KUBERONE_REACT_NATIVE_MOBILE_ARCHITECTURE.md) | Mobile deployment, Expo, OTA |
| [KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md](./KUBERONE_CRM_ADMIN_PANEL_ARCHITECTURE.md) | Admin panel build and deployment |
| [KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md](./KUBERONE_DATABASE_SCHEMA_SPECIFICATION.md) | Database schema for migration planning |
| [KUBERONE_RBAC_AND_PERMISSIONS.md](./KUBERONE_RBAC_AND_PERMISSIONS.md) | Security access controls |
| [KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md](./KUBERONE_FOLDER_STRUCTURE_AND_MONOREPO.md) | Repository layout for CI/CD |
| [KUBERONE_API_SPECIFICATION.md](./KUBERONE_API_SPECIFICATION.md) | API endpoints for smoke tests |

---

*End of Document — KuberOne DevOps & Deployment Architecture v1.0*

