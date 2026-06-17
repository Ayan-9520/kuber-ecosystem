output "bucket_id" { value = aws_s3_bucket.main.id }
output "bucket_arn" { value = aws_s3_bucket.main.arn }
output "backup_bucket_id" { value = try(aws_s3_bucket.backups[0].id, null) }
