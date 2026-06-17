variable "name_prefix" { type = string }
variable "vpc_cidr" { type = string default = "10.10.0.0/16" }
variable "availability_zones" { type = list(string) }
variable "enable_nat_gateway" { type = bool default = true }
variable "tags" { type = map(string) default = {} }
