# Backend Service Configuration — Production

## Production Domain

```
api.kuberone.com → ALB → nginx → PM2 (4× API instances)
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MySQL connection with pool |
| `REDIS_URL` | Yes | Cache, queues, sessions, rate limit |
| `JWT_ACCESS_SECRET` | Yes | Access token signing |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing |
| `DATA_ENCRYPTION_KEY` | Yes | PII encryption (32+ chars) |
| `OTEL_ENABLED` | Recommended | OpenTelemetry export |
| `AUTOMATION_WORKER_ENABLED` | Yes | Automation queue processor |
| `CONTENT_WORKER_ENABLED` | Yes | Content generation worker |

## Queue Systems

| Queue | Worker | Retry | DLQ |
|-------|--------|-------|-----|
| notifications | notification-workers | 3 | yes |
| email | email-workers | 3 | yes |
| sms | sms-workers | 3 | yes |
| whatsapp | whatsapp-workers | 3 | yes |
| push | push-workers | 3 | yes |
| ai | ai-workers | 2 | yes |
| automation | automation-workers | 3 | yes |

## AI Services

- AI Advisor, Voice AI, Lead Scoring, Recommendations
- Knowledge Base, RAG Pipeline, Content Generation
- OpenAI Integration Layer (`OPENAI_API_KEY`)

## Scalability

- Horizontal: 4 API instances behind ALB
- Workers: scale via PM2 `instances` or separate EC2
- Kubernetes-ready: Docker images in `deployment/docker/`
