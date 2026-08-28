# ACTIVE: full demo (Fargate 1 + ALB). Requires terraform.tfvars with container_image.
enable_nat           = false
enable_load_balancer = true
desired_count        = 1
enable_https         = false
