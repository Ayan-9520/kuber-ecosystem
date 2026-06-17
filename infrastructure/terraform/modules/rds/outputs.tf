output "endpoint" { value = aws_db_instance.main.endpoint }
output "address" { value = aws_db_instance.main.address }
output "port" { value = aws_db_instance.main.port }
output "replica_endpoint" { value = try(aws_db_instance.replica[0].endpoint, null) }
