# Secrets Management — KuberOne CI/CD

Store all secrets in **GitHub Environments** (`development`, `qa`, `staging`, `production`) or your cloud secret manager (AWS Secrets Manager, HashiCorp Vault).

## Required GitHub Secrets

| Secret | Environment | Purpose |
|--------|-------------|---------|
| `JWT_ACCESS_SECRET` | All | API access tokens |
| `JWT_REFRESH_SECRET` | All | Refresh tokens |
| `DATABASE_URL` | All | MySQL connection |
| `OPENAI_API_KEY` | staging, production | AI platform |
| `AWS_ACCESS_KEY_ID` | staging, production | S3, SES, SNS, backups |
| `AWS_SECRET_ACCESS_KEY` | staging, production | AWS credentials |
| `SMTP_*` / `AWS_SES_*` | production | Email delivery |
| `SMS_*` / `AWS_SNS_*` | production | SMS OTP |
| `WHATSAPP_*` | production | WhatsApp Business API |
| `FCM_*` / `FIREBASE_*` | production | Push notifications |
| `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY` | staging, production | SSH deploy |
| `DEVOPS_API_URL` | CI | Pipeline webhook target |
| `DEVOPS_WEBHOOK_SECRET` | CI + backend | Webhook authentication |
| `GITHUB_TOKEN` | CI | GHCR push (auto-provided) |
| `AWS_ECR_REGISTRY` | optional | ECR image push |

## Container Registry

- **GHCR**: `ghcr.io/<org>/kuberone-backend:<sha>` (default in `ci-build.yml`)
- **Docker Hub**: add `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` and uncomment tags in workflow
- **ECR**: add `AWS_ECR_REGISTRY`, configure `aws-actions/amazon-ecr-login`

## Rotation Policy

- JWT secrets: rotate quarterly; invalidate refresh tokens on rotation
- Database passwords: rotate with blue-green deploy + backup restore test
- API keys (OpenAI, WhatsApp, FCM): rotate on compromise; update GitHub Environment secrets

## Local Development

Never commit `.env` files. Use `.env.example` templates and `pnpm db:setup` for local bootstrap.
