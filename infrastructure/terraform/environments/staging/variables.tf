variable "aws_region" { type = string default = "ap-south-1" }
variable "s3_bucket_name" { type = string default = "kuberone-staging" }
variable "db_master_password" { type = string sensitive = true }
variable "redis_auth_token" { type = string sensitive = true }
