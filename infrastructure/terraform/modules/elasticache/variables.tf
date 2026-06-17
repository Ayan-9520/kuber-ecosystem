variable "name_prefix" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "security_group_id" { type = string }
variable "node_type" { type = string default = "cache.r6g.large" }
variable "num_cache_nodes" { type = number default = 2 }
variable "auth_token" { type = string sensitive = true }
variable "tags" { type = map(string) default = {} }
