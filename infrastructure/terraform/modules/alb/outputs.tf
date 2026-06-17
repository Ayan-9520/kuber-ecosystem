output "alb_arn" { value = aws_lb.main.arn }
output "alb_dns_name" { value = aws_lb.main.dns_name }
output "target_group_arn" { value = aws_lb_target_group.api.arn }
output "certificate_arn" { value = var.certificate_arn != "" ? var.certificate_arn : try(aws_acm_certificate.main[0].arn, "") }
