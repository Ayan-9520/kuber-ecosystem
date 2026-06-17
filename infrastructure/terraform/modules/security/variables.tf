variable "name_prefix" { type = string }
variable "vpc_id" { type = string }
variable "s3_bucket_name" { type = string }
variable "allowed_cidr_blocks" { type = list(string) default = ["0.0.0.0/0"] }
variable "tags" { type = map(string) default = {} }
