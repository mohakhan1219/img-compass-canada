# Cognito (optional)

`enable_cognito` defaults to **false**. Existing ECS/RDS stacks do not create a User Pool until you opt in.

## Cost

- No SMS MFA.
- Cognito bills per monthly active user after a large free tier (50,000 MAU). A portfolio demo is effectively **$0/month**.
- Enabling Cognito does **not** add NAT, EKS, or extra always-on compute.

## App wiring

When enabled, set on the task:

- `COGNITO_USER_POOL_ID`
- `COGNITO_CLIENT_ID`
- `COGNITO_REGION` (default `ca-central-1`)

Until those are set, the app uses **local hashed passwords** in PostgreSQL (`app_user.password_hash` is PBKDF2, never plaintext). Sessions are opaque IDs in `app_session`, not learner ids in cookies.

The legacy `compass_learner` cookie is ignored and cleared on sign-out.
