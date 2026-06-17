# KuberOne Staging — production-like at reduced scale
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = { Project = "KuberOne", Environment = "staging", ManagedBy = "terraform" }
  }
}

locals {
  name_prefix = "kuberone-staging"
  azs         = slice(data.aws_availability_zones.available.names, 0, 2)
}

data "aws_availability_zones" "available" { state = "available" }

module "vpc" {
  source             = "../../modules/vpc"
  name_prefix        = local.name_prefix
  vpc_cidr           = "10.2.0.0/16"
  availability_zones = local.azs
}

module "security" {
  source         = "../../modules/security"
  name_prefix    = local.name_prefix
  vpc_id         = module.vpc.vpc_id
  s3_bucket_name = var.s3_bucket_name
}

module "alb" {
  source            = "../../modules/alb"
  name_prefix       = local.name_prefix
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  security_group_id = module.security.alb_security_group_id
  primary_domain    = "staging-api.kuberone.com"
  alternate_domains = ["staging-admin.kuberone.com", "staging-customer.kuberone.com", "staging-partner.kuberone.com"]
  enable_waf        = false
}

module "rds" {
  source             = "../../modules/rds"
  name_prefix        = local.name_prefix
  private_subnet_ids = module.vpc.private_subnet_ids
  security_group_id  = module.security.data_security_group_id
  master_password    = var.db_master_password
  instance_class     = "db.t4g.medium"
  multi_az           = false
  backup_retention_days = 14
  deletion_protection   = false
}

module "elasticache" {
  source             = "../../modules/elasticache"
  name_prefix        = local.name_prefix
  private_subnet_ids = module.vpc.private_subnet_ids
  security_group_id  = module.security.data_security_group_id
  auth_token         = var.redis_auth_token
  node_type          = "cache.t4g.medium"
  num_cache_nodes    = 1
}

module "s3" {
  source       = "../../modules/s3"
  bucket_name  = var.s3_bucket_name
  enable_crr   = false
}

module "ec2" {
  source                = "../../modules/ec2"
  name_prefix           = local.name_prefix
  private_subnet_ids    = module.vpc.private_subnet_ids
  security_group_id     = module.security.app_security_group_id
  instance_profile_name = module.security.ec2_instance_profile_name
  target_group_arns     = [module.alb.target_group_arn]
  instance_type         = "t3.large"
  desired_capacity      = 2
  min_size              = 1
  max_size              = 4
}
