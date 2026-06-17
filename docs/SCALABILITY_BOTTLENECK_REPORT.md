# KuberOne Scalability Bottleneck Report

**Generated:** 2026-06-13

---

## Critical Bottlenecks

| ID | Bottleneck | Location | Impact | Tier Blocked |
|----|------------|----------|--------|--------------|
| B1 | **No Redis client in codebase** | Entire backend | Rate limits and caches not shared across PM2 instances; inconsistent throttling | 50k+ |
| B2 | **Workers co-located with API** | `server.ts` | Duplicate queue processing under cluster; CPU contention | 10k+ (mitigated) |
| B3 | **Global rate limit 100/15min/IP** | `app.ts`, `env.ts` | Mobile NAT users blocked | 10k+ |
| B4 | **In-memory rate limit buckets** | `rate-limit.service.ts` | Per-process limits ineffective in cluster | 50k+ |

---

## High Bottlenecks

| ID | Bottleneck | Location | Impact |
|----|------------|----------|--------|
| B5 | DB polling queues (not Redis/BullMQ) | email/sms/push queue services | DB CPU spikes at high notification volume |
| B6 | Queue claim race condition | `notification-queue.service.ts` | Duplicate processing possible |
| B7 | MySQL single primary writer | Architecture | Write ceiling ~5k TPS theoretical, ~500 practical |
| B8 | Analytics in-memory cache | `analytics-cache.service.ts` | Cache miss storm on cluster |
| B9 | Lead export was 10k rows unbounded | `lead.service.ts` | Memory spike (fixed to 5000) |
| B10 | RAG local vector store | `VECTOR_DB_PROVIDER=local` | Not horizontally scalable |

---

## Medium Bottlenecks

| ID | Bottleneck | Impact |
|----|------------|--------|
| B11 | No read replica routing | Analytics queries hit primary |
| B12 | `contains` text search | Slow on 1M+ row tables |
| B13 | CRM dashboard parallel queries | N+1 under load |
| B14 | OpenAI API latency | AI throughput capped externally |
| B15 | No connection pool was configured | Connection exhaustion (fixed) |
| B16 | Document uploads synchronous to S3 | Thread blocking |

---

## Low Bottlenecks

| ID | Bottleneck | Impact |
|----|------------|--------|
| B17 | Admin bundle >500KB | CRM load time |
| B18 | Observability full sampling default | Log storage cost |
| B19 | PostgreSQL in docs vs MySQL in dev | Ops confusion |

---

## Bottleneck Heat Map by User Tier

| Bottleneck | 10k | 50k | 100k | 1M |
|------------|-----|-----|------|-----|
| B1 No Redis | ⚠️ | 🔴 | 🔴 | 🔴 |
| B2 Worker colocation | ✅ fixed | ✅ | ✅ | ⚠️ |
| B3 Rate limit/IP | 🔴 | 🔴 | 🔴 | 🔴 |
| B5 DB queues | ⚠️ | 🔴 | 🔴 | 🔴 |
| B7 Single DB writer | ✅ | ⚠️ | 🔴 | 🔴 |
| B10 Local RAG | ✅ | ⚠️ | 🔴 | 🔴 |

Legend: ✅ manageable | ⚠️ watch | 🔴 blocking
