terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "KuberOne"
      Company     = "Kuber Finserve"
      Environment = "production"
      ManagedBy   = "terraform"
    }
  }
}

locals {
  name_prefix = "kuberone-prod"
  azs         = slice(data.aws_availability_zones.available.names, 0, 2)
  tags        = { Environment = "production" }
}

data "aws_availability_zones" "available" {
  state = "available"
}

module "vpc" {
  source             = "../../modules/vpc"
  name_prefix        = local.name_prefix
  vpc_cidr           = var.vpc_cidr
  availability_zones = local.azs
  tags               = local.tags
}

module "security" {
  source         = "../../modules/security"
  name_prefix    = local.name_prefix
  vpc_id         = module.vpc.vpc_id
  s3_bucket_name = var.s3_bucket_name
  tags           = local.tags
}

module "alb" {
  source              = "../../modules/alb"
  name_prefix         = local.name_prefix
  vpc_id              = module.vpc.vpc_id
  public_subnet_ids   = module.vpc.public_subnet_ids
  security_group_id   = module.security.alb_security_group_id
  primary_domain      = "api.kuberone.com"
  alternate_domains   = ["admin.kuberone.com"]
  enable_sticky_sessions = var.enable_sticky_sessions
  enable_waf          = var.enable_waf
  tags                = local.tags
}

module "rds" {
  source              = "../../modules/rds"
  name_prefix         = local.name_prefix
  private_subnet_ids  = module.vpc.private_subnet_ids
  security_group_id   = module.security.data_security_group_id
  master_password     = var.db_master_password
  multi_az            = true
  create_read_replica = var.create_read_replica
  tags                = local.tags
}

module "elasticache" {
  source             = "../../modules/elasticache"
  name_prefix        = local.name_prefix
  private_subnet_ids = module.vpc.private_subnet_ids
  security_group_id  = module.security.data_security_group_id
  auth_token         = var.redis_auth_token
  num_cache_nodes    = 2
  tags               = local.tags
}

module "s3" {
  source               = "../../modules/s3"
  bucket_name          = var.s3_bucket_name
  enable_crr           = var.enable_s3_crr
  create_backup_bucket = true
  tags                 = local.tags
}

module "ec2" {
  source                = "../../modules/ec2"
  name_prefix           = local.name_prefix
  private_subnet_ids    = module.vpc.private_subnet_ids
  security_group_id     = module.security.app_security_group_id
  instance_profile_name = module.security.ec2_instance_profile_name
  target_group_arns     = [module.alb.target_group_arn]
  desired_capacity      = var.api_desired_capacity
  tags                  = local.tags
}
