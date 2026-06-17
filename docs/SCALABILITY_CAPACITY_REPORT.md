# KuberOne Capacity Report

**Generated:** 2026-06-13  
**Basis:** Code architecture analysis + deployment configs + performance SLOs (`packages/performance-testing/src/thresholds.ts`)

---

## Concurrent User Capacity

| Configuration | Max Concurrent Users | Notes |
|---------------|---------------------|-------|
| Single dev server | 100–200 | No PM2 cluster |
| 1× t3.large, PM2 ×2 | 500–1,000 | Workers co-located |
| 2× t3.large, PM2 cluster ×4 each, API_WORKERS split | **2,500–10,000** | Recommended 10k tier |
| 4× t3.xlarge + RDS r6g.xlarge + Redis | 25,000–50,000 | Requires Redis (not yet in code) |
| Multi-AZ + read replica + 8 API nodes | 100,000 | Enterprise tier |

---

## Requests Per Second (RPS)

| Endpoint class | P95 target | Est. RPS (4-node cluster) |
|----------------|------------|---------------------------|
| `/health` | <50ms | 800+ |
| Auth OTP/login | <500ms | 50–80 |
| Lead list (paginated) | <500ms | 100–150 |
| Application detail | <500ms | 80–120 |
| Document upload | <1000ms | 20–40 |
| Analytics dashboard | <2000ms | 30–50 |
| AI chat completion | <5000ms | 10–20 |

**Cluster aggregate:** ~150 RPS mixed workload (current) → ~800 RPS (with Redis cache + replica)

---

## Daily Transaction Limits

| Entity | Current Max/Day | 10k Users | 100k Users | 1M Users |
|--------|----------------|-----------|------------|----------|
| Leads created | 5,000 | 25,000 | 100,000 | 500,000 |
| Applications submitted | 2,000 | 10,000 | 50,000 | 250,000 |
| Documents uploaded | 3,000 | 15,000 | 75,000 | 375,000 |
| Notifications dispatched | 50,000 | 500,000 | 2,000,000 | 10,000,000 |
| AI requests | 10,000 | 100,000 | 500,000 | 2,500,000 |
| Support tickets | 500 | 2,500 | 10,000 | 50,000 |

---

## Queue Throughput

| Queue | Single worker throughput | 3 worker processes |
|-------|-------------------------|-------------------|
| Email | ~120/min | ~360/min |
| SMS | ~150/min | ~450/min |
| Push | ~150/min | ~450/min |
| Notification orchestrator | ~100/min | ~300/min |
| Automation | ~150/min | ~450/min |

**Daily notification ceiling (single worker):** ~216,000 (theoretical) — practical limit ~50,000 due to provider rate limits and DB polling overhead.

---

## Database Connection Budget

| Component | Connections |
|-----------|-------------|
| Per API instance (default) | 10 |
| 4 PM2 API instances | 40 |
| 1 worker instance | 10 |
| Admin tools / migrations | 5 |
| **Total recommended** | **55** |
| RDS db.r6g.large max | ~1,000 |

Plan `DATABASE_CONNECTION_LIMIT` as: `floor((RDS_MAX - 20) / API_INSTANCES)`.

---

## Storage Growth (Est. per 10k active users/month)

| Store | Growth |
|-------|--------|
| MySQL data | 2–5 GB |
| S3 documents | 10–50 GB |
| Audit/observability logs | 5–20 GB |
| AI usage logs | 500 MB–2 GB |
