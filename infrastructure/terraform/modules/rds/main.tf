resource "aws_db_subnet_group" "main" {
  name       = "${var.name_prefix}-db-subnet"
  subnet_ids = var.private_subnet_ids
  tags       = merge(var.tags, { Name = "${var.name_prefix}-db-subnet" })
}

resource "aws_db_parameter_group" "mysql" {
  name_prefix = "${var.name_prefix}-mysql-"
  family      = "mysql8.0"
  description = "KuberOne MySQL parameters"

  parameter {
    name  = "slow_query_log"
    value = "1"
  }
  parameter {
    name  = "long_query_time"
    value = "2"
  }
  parameter {
    name  = "log_output"
    value = "FILE"
  }
}

resource "aws_db_instance" "main" {
  identifier     = "${var.name_prefix}-mysql"
  engine         = "mysql"
  engine_version = var.engine_version
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.database_name
  username = var.master_username
  password = var.master_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.security_group_id]
  parameter_group_name   = aws_db_parameter_group.mysql.name

  multi_az                = var.multi_az
  publicly_accessible     = false
  backup_retention_period = var.backup_retention_days
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  deletion_protection     = var.deletion_protection
  skip_final_snapshot     = false
  final_snapshot_identifier = "${var.name_prefix}-final-snapshot"

  performance_insights_enabled          = true
  monitoring_interval                   = 60
  enabled_cloudwatch_logs_exports       = ["audit", "error", "general", "slowquery"]

  tags = merge(var.tags, { Name = "${var.name_prefix}-mysql" })
}

# Read replica ready (enable for HA / DR)
resource "aws_db_instance" "replica" {
  count                  = var.create_read_replica ? 1 : 0
  identifier             = "${var.name_prefix}-mysql-replica"
  replicate_source_db    = aws_db_instance.main.identifier
  instance_class         = var.replica_instance_class
  publicly_accessible    = false
  vpc_security_group_ids = [var.security_group_id]
  storage_encrypted      = true
  skip_final_snapshot    = true
  tags                   = merge(var.tags, { Name = "${var.name_prefix}-mysql-replica" })
}
