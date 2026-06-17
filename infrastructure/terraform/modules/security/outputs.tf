output "alb_security_group_id" { value = aws_security_group.alb.id }
output "app_security_group_id" { value = aws_security_group.app.id }
output "data_security_group_id" { value = aws_security_group.data.id }
output "ec2_instance_profile_name" { value = aws_iam_instance_profile.ec2.name }
