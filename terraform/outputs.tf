output "alb_dns_name" {
  value       = var.enable_load_balancer ? aws_lb.app[0].dns_name : null
  description = "Null when parked with enable_load_balancer=false."
}

output "ecs_cluster" {
  value = aws_ecs_cluster.this.name
}

output "ecs_service" {
  value = aws_ecs_service.app.name
}

output "rds_address" {
  value     = aws_db_instance.postgres.address
  sensitive = true
}

output "rds_identifier" {
  value = aws_db_instance.postgres.identifier
}

output "cognito_user_pool_id" {
  value       = var.enable_cognito ? aws_cognito_user_pool.app[0].id : null
  description = "Null unless enable_cognito=true."
}
