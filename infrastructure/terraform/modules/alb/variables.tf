variable "name_prefix" { type = string }
variable "vpc_id" { type = string }
variable "public_subnet_ids" { type = list(string) }
variable "security_group_id" { type = string }
variable "primary_domain" { type = string default = "api.kuberone.com" }
variable "alternate_domains" { type = list(string) default = ["admin.kuberone.com"] }
variable "certificate_arn" { type = string default = "" }
variable "create_acm_certificate" { type = bool default = true }
variable "enable_sticky_sessions" { type = bool default = false }
variable "enable_waf" { type = bool default = true }
variable "waf_acl_arn" { type = string default = "" }
variable "tags" { type = map(string) default = {} }
