variable "name_prefix" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "security_group_id" { type = string }
variable "instance_profile_name" { type = string }
variable "target_group_arns" { type = list(string) }
variable "instance_type" { type = string default = "c6i.xlarge" }
variable "root_volume_gb" { type = number default = 100 }
variable "min_size" { type = number default = 2 }
variable "max_size" { type = number default = 8 }
variable "desired_capacity" { type = number default = 4 }
variable "app_directory" { type = string default = "/opt/kuberone" }
variable "tags" { type = map(string) default = {} }
