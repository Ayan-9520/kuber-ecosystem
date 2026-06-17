# KuberOne Scalability Optimization Report

**Generated:** 2026-06-13

---

## Completed Optimizations (This Audit)

| Optimization | Benefit | Status |
|--------------|---------|--------|
| `API_WORKERS_ENABLED` flag | Separates API from background workers in PM2 cluster | ✅ Done |
| Dedicated `kuberone-worker` PM2 app | Single worker process for all queues | ✅ Done |
| `DATABASE_CONNECTION_LIMIT` | Prevents connection exhaustion | ✅ Done |
| Index: `leads(deleted_at, created_at)` | Faster paginated lead lists | ✅ Done |
| Index: `customers(deleted_at, created_at)` | Faster customer lists | ✅ Done |
| Index: `refresh_tokens(token_hash)` | Faster auth token refresh | ✅ Done |
| `LEAD_EXPORT_MAX_ROWS=5000` | Prevents export memory spikes | ✅ Done |

---

## Priority 1 — Required for 50k Users

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | Implement Redis client (`ioredis`) for rate limiting store | 2–3 days | Critical — enables cluster consistency |
| 2 | Migrate express-rate-limit to Redis store | 1 day | Fixes mobile NAT + cluster |
| 3 | Migrate analytics cache to Redis | 1 day | Consistent dashboard performance |
| 4 | Add atomic queue claiming (`UPDATE ... WHERE status=PENDING LIMIT N`) | 2 days | Prevents duplicate job processing |
| 5 | Raise production `RATE_LIMIT_MAX_REQUESTS` to 1000/15min with Redis | 1 hour | Unblocks mobile scale |

---

## Priority 2 — Required for 100k Users

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 6 | RDS read replica + Prisma read routing for analytics/lists | 3–5 days | Offloads primary DB |
| 7 | Replace DB polling with BullMQ on Redis | 5–7 days | 10× queue throughput |
| 8 | Pre-aggregate analytics snapshots (existing worker pattern) | 3 days | Sub-2s dashboards at scale |
| 9 | Deploy pgvector/Qdrant for RAG (env already supports) | 3 days | Distributed AI search |
| 10 | CloudFront CDN for S3 document downloads | 2 days | Reduces API load |
| 11 | Run k6 load tiers 1000/5000/10000 and tune | 2 days | Validated capacity |

---

## Priority 3 — Required for 500k–1M Users

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 12 | Extract notification service to standalone deployable | 2–3 weeks | Independent scale |
| 13 | Extract AI platform to standalone service | 2–3 weeks | Token pool isolation |
| 14 | MySQL table partitioning (audit_logs, notifications) | 1 week | Write scalability |
| 15 | Multi-AZ active-passive failover (DR module exists) | 1 week | Availability |
| 16 | Event bus (SQS/Kafka) for domain events | 3–4 weeks | Decouple modules |
| 17 | Database sharding by region/branch | 4–6 weeks | 1M+ user scale |

---

## Configuration Recommendations (Production)

```env
# API instances (PM2 cluster)
API_WORKERS_ENABLED=false
DATABASE_CONNECTION_LIMIT=8
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=900000

# Worker instance (single fork)
API_WORKERS_ENABLED=true
DATABASE_CONNECTION_LIMIT=15
NOTIFICATION_WORKER_BATCH_SIZE=50
EMAIL_WORKER_BATCH_SIZE=40
```

```bash
# PM2 production
pm2 start deployment/pm2/ecosystem.config.cjs --env production
pm2 scale kuberone-api 4
```

---

## Load Test Commands

```bash
# Smoke
k6 run performance-testing/k6/smoke.js

# Tier load (100/500/1000/5000/10000 VUs)
VUS=1000 k6 run performance-testing/k6/load-tiers.js

# Scenario: concurrent logins
k6 run performance-testing/k6/scenarios/scenario-01-concurrent-logins.js

# AI burst
k6 run performance-testing/k6/scenarios/scenario-06-ai-burst.js
```

---

## Expected Score After Priority 1

| Dimension | Current | After P1 |
|-----------|---------|----------|
| Architecture | 72% | 82% |
| API | 62% | 78% |
| Caching | 35% | 65% |
| Infrastructure | 58% | 72% |
| **Overall** | **71%** | **~78%** → SCALABLE FOR 50K path |
