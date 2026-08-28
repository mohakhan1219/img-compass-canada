# Security

- Apache-2.0 application; no production credentials in git
- Demo auth cookie is HttpOnly; not a substitute for real identity
- RDS is private-subnet only; ECS tasks reach it via security groups
- Secrets Manager holds `DATABASE_URL`; SSM holds non-secret ALB DNS
- RDS connections verify the Amazon RDS **ca-central-1** CA bundle (`rejectUnauthorized: true`). Certificate validation is not disabled.
- ECR scan on push; Dependabot for npm, Actions, Terraform
- `npm audit` in CI
- TLS via ACM when `enable_https=true` (off by default until a certificate exists)
- Synthetic data only; no CV/passport/MCC ID uploads
- Eligibility copy is on the About page; a single portfolio banner discloses synthetic data
- `scripts/dev.mjs` (Origin/Referer/Sec-Fetch stripping) is **local / Cloud Preview only**. Staging and production run `node server.js` and keep normal Next.js origin checks. The proxy is dockerignored and refuses `NODE_ENV=production`.
- Demo cookie `compass_learner` is HttpOnly. Set `COMPASS_COOKIE_SECURE=true` only on HTTPS. HTTP ALB (default `enable_https=false`) must leave it false or browsers will drop the cookie.

## Threat notes for interview

This is a **planning demo**, not a health-records system. Do not store PHI. Rotate the RDS password via Secrets Manager and force a new ECS deployment (see runbooks).
