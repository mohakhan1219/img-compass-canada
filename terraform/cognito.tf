# Optional Cognito User Pool. Disabled by default (no extra AWS bill until enable_cognito=true).
# Cost: Cognito is billed per monthly active user after a large free tier. SMS MFA is not enabled.

resource "aws_cognito_user_pool" "app" {
  count = var.enable_cognito ? 1 : 0
  name  = "${var.name_prefix}-${var.environment}-users"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  mfa_configuration        = "OFF"

  password_policy {
    minimum_length    = 8
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
    require_uppercase = false
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }
}

resource "aws_cognito_user_pool_client" "app" {
  count        = var.enable_cognito ? 1 : 0
  name         = "${var.name_prefix}-${var.environment}-web"
  user_pool_id = aws_cognito_user_pool.app[0].id

  generate_secret                      = false
  explicit_auth_flows                  = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH"]
  prevent_user_existence_errors        = "ENABLED"
  enable_token_revocation              = true
  allowed_oauth_flows_user_pool_client = false
}
