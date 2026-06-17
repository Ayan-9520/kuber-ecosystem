# AWS Setup Guide — KuberOne Production

## Prerequisites

- AWS account with admin access (initial bootstrap)
- Domain `kuberone.com` in Cloudflare
- Terraform >= 1.6
- AWS CLI configured

## Step 1: Bootstrap State Backend

```bash
aws s3 mb s3://kuberone-terraform-state --region ap-south-1
aws dynamodb create-table \
  --table-name kuberone-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

## Step 2: Deploy Infrastructure

```bash
cd infrastructure/terraform/environments/production
cp terraform.tfvars.example terraform.tfvars
# Set db_master_password, redis_auth_token

terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

## Step 3: Secrets Manager

Create secrets under path `kuberone/production/`:

| Secret | Keys |
|--------|------|
| `kuberone/production/jwt` | JWT_ACCESS_SECRET, JWT_REFRESH_SECRET |
| `kuberone/production/database` | DATABASE_URL (mysql://...) |
| `kuberone/production/openai` | OPENAI_API_KEY |
| `kuberone/production/smtp` | SMTP_HOST, SMTP_USER, SMTP_PASS |
| `kuberone/production/sms` | SMS_API_KEY, SMS_SENDER_ID |
| `kuberone/production/whatsapp` | WHATSAPP_API_KEY, WHATSAPP_PHONE_ID |
| `kuberone/production/fcm` | FCM_SERVER_KEY, FCM_PROJECT_ID |

## Step 4: Cloudflare DNS

Point domains to ALB DNS name (see `deployment/nginx/cloudflare-dns.md`).

## Step 5: SSL

- **ACM**: Validate via DNS in Cloudflare
- **Origin Let's Encrypt**: `certbot --nginx -d api.kuberone.com -d admin.kuberone.com`

## Step 6: Deploy Application

```bash
# Via GitHub Actions (recommended)
gh workflow run deploy-production.yml

# Or manual SSH
ssh ubuntu@<instance>
cd /opt/kuberone
bash deployment/scripts/deploy-backend.sh production
bash deployment/scripts/deploy-admin.sh production
```

## Step 7: Verify

```bash
curl https://api.kuberone.com/health/live
curl https://api.kuberone.com/health/ready
```

## MySQL (RDS)

Prisma schema uses MySQL 8 as the source of truth. Production `DATABASE_URL` must use the `mysql://` scheme pointing at RDS (or Docker `mysql:8.0` in compose stacks).

1. Provision RDS via `infrastructure/terraform/modules/rds` (MySQL 8.0)
2. Set `DATABASE_URL=mysql://user:pass@host:3306/kuberone`
3. Run `pnpm db:migrate:deploy`
4. Verify via UAT and backup restore test

## Cost Estimate (ap-south-1)

| Service | Spec | ~Monthly |
|---------|------|----------|
| EC2 ASG | 4× c6i.xlarge | $500 |
| RDS | db.r6g.large Multi-AZ | $350 |
| ElastiCache | 2× cache.r6g.large | $250 |
| ALB | Standard | $25 |
| S3 | 500GB | $15 |
| NAT Gateway | 1 | $35 |
