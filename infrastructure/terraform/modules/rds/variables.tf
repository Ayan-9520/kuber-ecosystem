variable "name_prefix" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "security_group_id" { type = string }
variable "engine_version" { type = string default = "8.0.39" }
variable "instance_class" { type = string default = "db.r6g.large" }
variable "replica_instance_class" { type = string default = "db.r6g.large" }
variable "allocated_storage" { type = number default = 100 }
variable "max_allocated_storage" { type = number default = 500 }
variable "database_name" { type = string default = "kuberone" }
variable "master_username" { type = string default = "kuberone_admin" }
variable "master_password" { type = string sensitive = true }
variable "multi_az" { type = bool default = true }
variable "backup_retention_days" { type = number default = 30 }
variable "deletion_protection" { type = bool default = true }
variable "create_read_replica" { type = bool default = false }
variable "tags" { type = map(string) default = {} }
