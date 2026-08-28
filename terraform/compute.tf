resource "aws_ecs_cluster" "this" {
  name = "${var.name_prefix}-${var.environment}"
  setting {
    name  = "containerInsights"
    value = "disabled"
  }
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.name_prefix}-${var.environment}"
  retention_in_days = 14
}

resource "aws_iam_role" "task_exec" {
  name = "${var.name_prefix}-${var.environment}-exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "task_exec" {
  role       = aws_iam_role.task_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "secrets" {
  name = "secrets"
  role = aws_iam_role.task_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = [aws_secretsmanager_secret.db.arn, aws_secretsmanager_secret.database_url.arn]
    }]
  })
}

resource "aws_iam_role" "task" {
  name = "${var.name_prefix}-${var.environment}-task"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_lb" "app" {
  count              = var.enable_load_balancer ? 1 : 0
  name               = "${var.name_prefix}-${var.environment}"
  load_balancer_type = "application"
  subnets            = aws_subnet.public[*].id
  security_groups    = [aws_security_group.alb[0].id]
}

resource "aws_lb_target_group" "app" {
  count       = var.enable_load_balancer ? 1 : 0
  name        = "${var.name_prefix}-${var.environment}"
  port        = 43210
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  health_check {
    path                = "/api/health"
    matcher             = "200"
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener" "http" {
  count             = var.enable_load_balancer ? 1 : 0
  load_balancer_arn = aws_lb.app[0].arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = var.enable_https ? "redirect" : "forward"
    target_group_arn = var.enable_https ? null : aws_lb_target_group.app[0].arn
    dynamic "redirect" {
      for_each = var.enable_https ? [1] : []
      content {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }
}

resource "aws_lb_listener" "https" {
  count             = var.enable_load_balancer && var.enable_https ? 1 : 0
  load_balancer_arn = aws_lb.app[0].arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.acm_certificate_arn
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app[0].arn
  }
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${var.name_prefix}-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.task_exec.arn
  task_role_arn            = aws_iam_role.task.arn
  container_definitions = jsonencode([{
    name         = "web"
    image        = var.container_image
    essential    = true
    portMappings = [{ containerPort = 43210, protocol = "tcp" }]
    environment = [
      { name = "PORT", value = "43210" },
      { name = "HOSTNAME", value = "0.0.0.0" },
      { name = "NODE_ENV", value = "production" },
      { name = "NEXT_PUBLIC_PERSISTENCE", value = "remote" },
      { name = "COMPASS_COOKIE_SECURE", value = var.enable_https ? "true" : "false" }
    ]
    # Command is omitted: image CMD is `node db/migrate.mjs && node server.js`.
    # Never set command to npm run dev / scripts/dev.mjs.
    secrets = [{
      name      = "DATABASE_URL"
      valueFrom = aws_secretsmanager_secret.database_url.arn
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.app.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "web"
      }
    }
    healthCheck = {
      command     = ["CMD-SHELL", "wget -qO- http://127.0.0.1:43210/api/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 40
    }
  }])
}

resource "aws_ecs_service" "app" {
  name            = "${var.name_prefix}-${var.environment}"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"
  network_configuration {
    subnets          = var.enable_nat ? aws_subnet.private[*].id : aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = !var.enable_nat
  }
  dynamic "load_balancer" {
    for_each = var.enable_load_balancer ? [1] : []
    content {
      target_group_arn = aws_lb_target_group.app[0].arn
      container_name   = "web"
      container_port   = 43210
    }
  }
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
}

resource "aws_ssm_parameter" "alb_dns" {
  count = var.enable_load_balancer ? 1 : 0
  name  = "/${var.name_prefix}/${var.environment}/alb_dns"
  type  = "String"
  value = aws_lb.app[0].dns_name
}
