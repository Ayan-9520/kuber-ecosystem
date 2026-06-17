# KuberOne Backend Production Deployment Guide

**Domain:** `api.kuberone.com`  
**Company:** Kuber Finserve

## Overview

Deploy the complete KuberOne backend platform to production including API, workers, queues, AI services, and schedulers.

## Pre-Deploy Checklist

```bash
pnpm backend-deployment:gate
pnpm lint && pnpm typecheck && pnpm build
pnpm test && pnpm test:integration
pnpm security:test
pnpm db:migrate:deploy
```

## Deploy Services

| Service | PM2 / Docker | Description |
|---------|--------------|-------------|
| Backend API | `kuberone-api` ×4 | Express API behind nginx/ALB |
| Worker Services | `kuberone-worker` | Background job processor |
| Queue Processors | worker | Redis-backed queues |
| Notification Workers | worker | Multi-channel dispatch |
| Email / SMS / WhatsApp / Push | worker | Channel-specific workers |
| AI Workers | worker | OpenAI, RAG, content generation |
| Scheduler Services | worker | Cron-style automation |
| Automation Workers | worker | Journey execution |

## Deployment Strategies

| Strategy | Command | Use Case |
|----------|---------|----------|
| Rolling | `DEPLOY_STRATEGY=rolling` | Default, zero-downtime reload |
| Blue-Green | `DEPLOY_STRATEGY=blue-green` | Major releases |
| Canary | `DEPLOY_STRATEGY=canary` | Risk-sensitive changes |

## Manual Deploy

```bash
ssh production
cd /opt/kuberone
bash deployment/scripts/deploy-backend.sh production
node scripts/production-deploy-validate.mjs
```

## CI/CD

- **Deploy:** `.github/workflows/backend-production-deploy.yml`
- **Rollback:** `.github/workflows/backend-production-rollback.yml`

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/deployment/status` | Deployment status |
| `GET /api/v1/deployment/health` | Health aggregation |
| `GET /api/v1/deployment/services` | Service health |
| `GET /api/v1/deployment/releases` | Version history |
| `POST /api/v1/deployment/webhook` | CI webhook (secret header) |

## CRM Dashboard

Admin → **Backend Deployment** (`/backend-deployment`)

**RBAC:** `backend.deploy`, `backend.release`, `backend.manage`
