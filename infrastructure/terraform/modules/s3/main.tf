resource "aws_s3_bucket" "main" {
  bucket = var.bucket_name
  tags   = merge(var.tags, { Name = var.bucket_name })
}

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
      kms_master_key_id = var.kms_key_arn != "" ? var.kms_key_arn : null
    }
  }
}

resource "aws_s3_bucket_public_access_block" "main" {
  bucket                  = aws_s3_bucket.main.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    id     = "archive-old-versions"
    status = "Enabled"
    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }
    noncurrent_version_expiration {
      noncurrent_days = 365
    }
  }

  rule {
    id     = "expire-temp-uploads"
    status = "Enabled"
    filter { prefix = "temp/" }
    expiration { days = 7 }
  }
}

# Cross-region replication ready
resource "aws_s3_bucket_replication_configuration" "crr" {
  count  = var.enable_crr && var.replica_bucket_arn != "" ? 1 : 0
  bucket = aws_s3_bucket.main.id
  role   = var.replication_role_arn

  rule {
    id     = "replicate-all"
    status = "Enabled"
    destination {
      bucket        = var.replica_bucket_arn
      storage_class = "STANDARD"
    }
  }
}

resource "aws_s3_bucket" "backups" {
  count  = var.create_backup_bucket ? 1 : 0
  bucket = "${var.bucket_name}-backups"
  tags   = merge(var.tags, { Name = "${var.bucket_name}-backups", Purpose = "backup" })
}

resource "aws_s3_bucket_versioning" "backups" {
  count  = var.create_backup_bucket ? 1 : 0
  bucket = aws_s3_bucket.backups[0].id
  versioning_configuration { status = "Enabled" }
}
