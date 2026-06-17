variable "bucket_name" { type = string }
variable "kms_key_arn" { type = string default = "" }
variable "enable_crr" { type = bool default = false }
variable "replica_bucket_arn" { type = string default = "" }
variable "replication_role_arn" { type = string default = "" }
variable "create_backup_bucket" { type = bool default = true }
variable "tags" { type = map(string) default = {} }
