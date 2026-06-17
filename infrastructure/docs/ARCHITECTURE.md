# KuberOne Production Infrastructure Architecture

## Target Scale

| Metric | Target |
|--------|--------|
| Registered users | 10,000+ |
| Concurrent users | 1,000+ |
| Availability | 99.9% |
| RPO | 15 minutes |
| RTO | 1 hour |

## Request Flow

```
Internet
    ↓
Cloudflare (DDoS, WAF, CDN, SSL edge)
    ↓
AWS ALB (ACM SSL, health checks, blue-green target groups)
    ↓
Nginx (reverse proxy, compression, rate limiting, security headers)
    ↓
Backend API Cluster (4+ nodes, PM2 cluster or Docker replicas)
    ├── Workers (automation, content, backup, notifications, AI)
    ├── Redis (cache, sessions, queues, rate limiting)
    ├── MySQL RDS 8.0 (Multi-AZ, replication-ready)
    └── S3 (documents, backups, AI artifacts)
    ↓
Monitoring Stack
    ├── Prometheus (metrics)
    ├── Grafana (dashboards)
    ├── Loki (log aggregation)
    └── OpenTelemetry (traces)
```

## Multi-Region Ready

- S3 cross-region replication (CRR) configured in Terraform
- RDS read replica in secondary region (manual promotion for DR)
- Cloudflare global anycast for edge routing
- Route 53 health-checked failover (optional)

## Environments

| Environment | VPC CIDR | Purpose |
|-------------|----------|---------|
| development | 10.0.0.0/16 | Local / dev |
| qa | 10.1.0.0/16 | QA testing |
| staging | 10.2.0.0/16 | Pre-production |
| production | 10.10.0.0/16 | Live traffic |

## Database

Application and infrastructure both use **MySQL 8** (RDS in AWS, Prisma `provider = "mysql"`). Connection pooling via Prisma `connection_limit` parameter.

## Kubernetes Ready

Docker Compose services map 1:1 to K8s Deployments. Helm chart structure can wrap `deployment/docker/` images when migrating to EKS.
