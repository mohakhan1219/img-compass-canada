# PARKED: no Fargate hours, no ALB hours. RDS still exists (stop it with AWS CLI — see docs/OPERATIONS-LIFECYCLE.md).
# Still requires container_image in terraform.tfvars (task definition is retained).
enable_nat           = false
enable_load_balancer = false
desired_count        = 0
enable_https         = false
