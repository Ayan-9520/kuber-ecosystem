# Scalability — Backend Production

## Current Architecture

- **API:** 4 Node.js instances (PM2 cluster mode)
- **Workers:** Dedicated PM2 process(es)
- **Load Balancer:** AWS ALB health-checked on `/health/live`
- **Database:** RDS MySQL with connection pooling (Prisma)
- **Cache/Queue:** Redis ElastiCache

## Horizontal Scaling

```bash
# PM2 scale API instances
pm2 scale kuberone-api 6

# Or add EC2 behind ALB target group
```

## Auto Recovery

- PM2 auto-restart on crash
- ALB removes unhealthy instances
- Dead letter queues for failed jobs

## Kubernetes Ready

Docker images: `deployment/docker/backend/Dockerfile`  
Compose reference: `deployment/docker/docker-compose.production.yml`

Future migration path: Helm chart wrapping existing containers.
