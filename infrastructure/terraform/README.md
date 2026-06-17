# KuberOne — Terraform Infrastructure

Enterprise AWS infrastructure for KuberOne production (10,000+ users, 1,000+ concurrent).

## Architecture

```
Internet → Cloudflare → AWS ALB → Nginx → Backend Cluster → Redis → MySQL (RDS) → S3
                                                              ↓
                                                    Monitoring (Prometheus/Grafana/OTel)
```

## Structure

```
terraform/
├── modules/
│   ├── vpc/          # VPC, subnets, IGW, NAT, route tables, NACLs
│   ├── security/     # Security groups, IAM roles
│   ├── alb/          # Application Load Balancer, target groups, health checks
│   ├── rds/          # MySQL 8 (Multi-AZ ready, encryption, backups)
│   ├── elasticache/  # Redis cluster (sessions, cache, queues)
│   ├── s3/           # Versioning, lifecycle, encryption, CRR-ready
│   └── ec2/          # Compute (Docker/PM2) — K8s-ready
├── environments/
│   ├── development/
│   ├── qa/
│   ├── staging/
│   └── production/
└── README.md
```

## Quick Start (Production)

```bash
cd infrastructure/terraform/environments/production
cp terraform.tfvars.example terraform.tfvars
# Edit variables: region, domain, instance sizes

terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

## Future Cloud Compatibility

Module interfaces are cloud-agnostic where possible. Azure/GCP equivalents:
- VPC → VNet / VPC Network
- ALB → Application Gateway / Cloud Load Balancing
- RDS → Azure Database / Cloud SQL
- ElastiCache → Azure Cache / Memorystore
- S3 → Blob Storage / Cloud Storage

## State Backend (recommended)

```hcl
terraform {
  backend "s3" {
    bucket         = "kuberone-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "kuberone-terraform-locks"
  }
}
```

## Secrets

Never commit `terraform.tfvars` with secrets. Use AWS Secrets Manager references or `TF_VAR_*` environment variables.
