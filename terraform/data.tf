resource "aws_security_group" "alb" {
  count  = var.enable_load_balancer ? 1 : 0
  name   = "${var.name_prefix}-${var.environment}-alb"
  vpc_id = aws_vpc.main.id
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  dynamic "ingress" {
    for_each = var.enable_https ? [443] : []
    content {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs" {
  name   = "${var.name_prefix}-${var.environment}-ecs"
  vpc_id = aws_vpc.main.id
  dynamic "ingress" {
    for_each = var.enable_load_balancer ? [1] : []
    content {
      from_port       = 43210
      to_port         = 43210
      protocol        = "tcp"
      security_groups = [aws_security_group.alb[0].id]
    }
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "rds" {
  name   = "${var.name_prefix}-${var.environment}-rds"
  vpc_id = aws_vpc.main.id
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_subnet_group" "rds" {
  name       = "${var.name_prefix}-${var.environment}-db"
  subnet_ids = aws_subnet.private[*].id
}

resource "random_password" "db" {
  length  = 24
  special = false
}

resource "aws_secretsmanager_secret" "db" {
  name = "${var.name_prefix}/${var.environment}/database"
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db.result
    dbname   = var.db_name
    host     = aws_db_instance.postgres.address
  })
}

resource "aws_secretsmanager_secret" "database_url" {
  name = "${var.name_prefix}/${var.environment}/database-url"
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = "postgresql://${var.db_username}:${random_password.db.result}@${aws_db_instance.postgres.address}:5432/${var.db_name}?sslmode=require"
}

resource "aws_db_instance" "postgres" {
  identifier             = "${var.name_prefix}-${var.environment}"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = "db.t4g.micro"
  allocated_storage      = 20
  db_name                = var.db_name
  username               = var.db_username
  password               = random_password.db.result
  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot    = true
  deletion_protection    = false
  storage_encrypted      = true
  # Free-tier accounts reject 7-day retention (FreeTierRestrictionError).
  # 1 day still allows a short restore window without extra backup cost vs 7 days.
  backup_retention_period = 1
  publicly_accessible     = false
  tags                    = { Environment = var.environment }
}
