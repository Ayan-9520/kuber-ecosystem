output "alb_dns_name" { value = module.alb.alb_dns_name }
output "rds_endpoint" { value = module.rds.endpoint sensitive = true }
output "redis_endpoint" { value = module.elasticache.primary_endpoint sensitive = true }
output "s3_bucket" { value = module.s3.bucket_id }
output "vpc_id" { value = module.vpc.vpc_id }
