variable "aws_region" {
  type        = string
  default     = "ca-central-1"
  description = "Primary region for the V1 prod-demo."
}

variable "name_prefix" {
  type    = string
  default = "img-compass"
}

variable "environment" {
  type    = string
  default = "prod-demo"
}

variable "vpc_cidr" {
  type    = string
  default = "10.40.0.0/16"
}

variable "container_image" {
  type        = string
  description = "Required. Full image URI (ECR). BusyBox and empty values are rejected."
  validation {
    condition     = length(var.container_image) >= 20 && !can(regex("(?i)busybox", var.container_image))
    error_message = "Set -var=container_image to a real registry URI (for example ACCOUNT.dkr.ecr.ca-central-1.amazonaws.com/img-compass-prod-demo:v0.3.0). BusyBox is not allowed."
  }
}

variable "db_username" {
  type    = string
  default = "compass"
}

variable "db_name" {
  type    = string
  default = "compass"
}

variable "enable_https" {
  type        = bool
  default     = false
  description = "Set true only after an ACM certificate ARN is provided."
}

variable "acm_certificate_arn" {
  type    = string
  default = ""
  validation {
    condition     = !var.enable_https || length(var.acm_certificate_arn) > 10
    error_message = "enable_https=true requires acm_certificate_arn."
  }
}

variable "desired_count" {
  type        = number
  default     = 1
  description = "ACTIVE=1. PARKED=0 (no Fargate hours)."
}

variable "enable_nat" {
  type        = bool
  default     = false
  description = "false = Option B (public-subnet Fargate, no NAT). true = Option A (private Fargate + NAT). Keep false for this portfolio."
}

variable "enable_cognito" {
  type        = bool
  default     = false
  description = "Optional Amazon Cognito User Pool. Default false so existing deploys do not add cost until opted in. Cognito MAU is effectively $0 at demo scale (50k MAU free tier); no SMS MFA."
}

variable "enable_load_balancer" {
  type        = bool
  default     = true
  description = "ACTIVE=true. PARKED=false removes the ALB (it still bills at desired_count=0)."
}
