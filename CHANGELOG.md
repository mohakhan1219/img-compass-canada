# Changelog

All notable changes to IMG Compass Canada are documented here. Versioning follows [SemVer](https://semver.org/).

## 0.5.0 — 2026-08-29

### Added
- Individual accounts (sign up / sign in / sign out / password reset) with PostgreSQL PBKDF2 hashes; optional Amazon Cognito (Terraform-gated, default off).
- Seven-step onboarding and section-based profile completeness.
- Reference catalogs: real CaRMS R-1 institutions, official sources, 2027 timeline dates from carms.ca, language-exam catalog, credentials tracker, Program Explorer.
- Personalized journey including credentials, programs, and residency onboarding.
- Transparent Compass planning indicator (not an MCC/NAC/match prediction).

### Changed
- Sessions use an opaque `compass_session` cookie. The legacy learner-id cookie is no longer trusted.
- Provincial pathway and Program Explorer use official faculty names and URLs. Fictional Northlake/Harbour/Prairie names are not in the reference catalog.
- Explore Demo (Dr. Alex Morgan) is optional, not the only entry.

### Security
- User state is keyed by authenticated user id. GET /api/state never seeds demo data into a real account.


All notable changes to IMG Compass Canada are documented here. Versioning follows [SemVer](https://semver.org/).

## 0.4.5 — 2026-08-28

### Changed
- Public README and linked docs: recruiter-facing wording, CI vs CD/OIDC, temporary demo URL.

## 0.4.4 — 2026-08-28

### Changed
- Recruiter-facing README and public-release hygiene. Public Git history is a curated snapshot so earlier local commits that contained an AWS account ID are not published.

## 0.4.3 — 2026-08-28

### Changed
- Synthetic demo learner is **Dr. Alex Morgan**. Other seed data is unchanged.

## 0.4.2 — 2026-08-28

### Changed
- Final copy pass on remaining “practice evidence” / demo-row phrasing. Settings and match demo-control labels cleaned up.

## 0.4.1 — 2026-08-28

### Changed
- Polish Applications, Interviews, Ranking, Match, CaRMS, and Language workspaces. Cleaner product copy; match-day demo controls tucked away.

## 0.4.0 — 2026-08-28

### Changed
- Trust and UI redesign: one portfolio banner, About page, quiet Demo data chips, and a healthcare SaaS visual system. Red reserved for real blockers.

## 0.3.1 — 2026-08-28

### Fixed
- RDS TLS now verifies the Amazon RDS **ca-central-1** CA bundle (`rejectUnauthorized: true`). Removed `sslmode=no-verify` and `rejectUnauthorized: false`.

## Unreleased

- Docker production smoke **PASS** in the agent VM: Compose image `CMD` migrate+`server.js`, health/ready/metrics, Postgres BFF, ready 503 when DB stopped, no `scripts/dev.mjs` in the image.
- Production Docker build bakes `NEXT_PUBLIC_PERSISTENCE=remote`. Demo cookie `Secure` flag only when `COMPASS_COOKIE_SECURE=true` (HTTPS).
- Local / Cloud Preview: `npm run dev` remains a public origin-stripping proxy (port 43210 → `next dev` on 127.0.0.1:43211). The proxy refuses `NODE_ENV=production`, is excluded from the Docker image, and is not the ECS/Compose command.

## 0.3.0 — 2026-08-27

### Added
- Classified journey holds (`requirement_uncertain`, `incomplete_requirement`, `performance_gap`, `expired_or_stale_verification`, `administrative_blocker`)
- Visible **DEMO / FICTIONAL — NOT OFFICIAL** labels on provincial surfaces and the dashboard
- PostgreSQL `LearnerStateRepository` and Next.js BFF (`/api/state`) for remote mode
- `/api/health`, `/api/ready`, `/api/metrics`, structured JSON logs, request IDs
- Docker image, Compose Postgres, Terraform (VPC, ALB, ECS Fargate, RDS, Secrets Manager, CloudWatch)
- GitHub Actions CI, staging deploy, tagged prod-demo deploy, rollback workflow, Dependabot
- Architecture, SRE, security, and runbook documentation

### Changed
- Default local demo still uses browser localStorage (`NEXT_PUBLIC_PERSISTENCE=local`)

## 0.2.0 — 2026-08-27

Checkpoint 2: NAC, language, interviews, provincial tracker, CaRMS through match, repository pattern.

## 0.1.0 — 2026-08-27

Checkpoint 1: foundation, IMG profile, MCCQE1 demo module.
