# Interview guide — IMG Compass Canada

Speak as the person who **directed** product, architecture, platform, and validation. Implementation used AI-assisted tools under that direction (see `NOTICE`).

## 60 seconds

IMG Compass Canada is a planning demo for International Medical Graduates on the path to Canadian residency: profile, MCCQE1 practice logging, NAC, language, provincial requirements, CaRMS, interviews, ranking, and match. It is not medical or legal advice; demo rows are synthetic and labelled when fictional.

The architecture is a Next.js BFF: the browser never gets `DATABASE_URL`. Default demo uses localStorage. Remote mode stores a versioned JSON document in Postgres. I specified health/ready/metrics, Terraform for a small ECS Fargate + RDS footprint, and an on-demand park/destroy model so a portfolio demo does not run a NAT Gateway or idle ALB for months. We validated the production Node server locally, then deployed and validated the same stack on AWS in **ca-central-1** (ALB, one Fargate task, private RDS, no NAT). Local `npm run dev` is a Cloud Preview workaround only — production is `server.js`.

## Architecture

UI → Next.js route handlers → domain + pure feature repositories → `LearnerStateRepository` → Postgres (or localStorage adapter in the browser). Journey status is **derived**, not a stored progress enum. Holds are classified (verification vs completion vs admin).

## Why ECS Fargate instead of EKS

One container, one task, portfolio scale. EKS adds a control plane, node groups or Fargate profiles, and more IAM/networking. Fargate is enough to show VPC, ALB, rolling deploys, and task IAM without running Kubernetes for a demo.

## Why RDS Postgres

The learner record is a versioned JSON document (`jsonb`) with a small relational envelope (`learner_id`, `updated_at`). Postgres is operationally familiar, has RDS backups, and matches the BFF. Not DynamoDB: we are not designing access patterns around keys/GSIs for this V1.

## Why repository abstraction

Domain and feature repos stay free of I/O. Persistence ports let localStorage, in-memory tests, and Postgres swap without rewriting MCCQE1/NAC/CaRMS logic. That is how Checkpoint 2 stayed testable and Checkpoint 3 added a database.

## BFF / API security

`DATABASE_URL` is server-only (Secrets Manager on ECS). `/api/state` requires the HttpOnly `compass_learner` cookie. Demo auth is **not** real identity. No `NEXT_PUBLIC_` secrets. Production does **not** strip `Origin`/`Sec-Fetch-*`; that exists only in `scripts/dev.mjs` for Cloud Preview.

## localStorage vs remote

`NEXT_PUBLIC_PERSISTENCE` is baked at **build** time for the client. `local` = workshop/offline. `remote` = fetch `/api/state`. Docker production images bake `remote`. Local `npm run dev` stays `local` unless you rebuild with the flag.

## CI/CD

`ci.yml` is **active** on GitHub: lint, test, build, audit, terraform fmt/validate, docker build. Staging (`workflow_dispatch`), prod-demo tag deploy, and rollback workflows are **in-repo but not enabled** — they need GitHub Environments and AWS OIDC (`docs/GITHUB-OIDC.md`). GitHub Actions does not currently deploy to AWS.

## Terraform flow

`init` (S3 backend after bootstrap) → `fmt` → `validate` → `plan -var-file=active.tfvars` with a real ECR image → `apply`. After a demo, `parked.tfvars` (ECS 0, no ALB) or `terraform destroy` of the app stack while bootstrap ECR/state remain. See `docs/OPERATIONS-LIFECYCLE.md`.

## SLI / SLO

SLIs: ALB health on `/api/health`, readiness on `/api/ready`, p95 latency, deploy reaching steady state. SLOs are **best-effort demo** (e.g. 99% monthly), not a paid SLA. Error budget: freeze tags after two consecutive rollbacks.

## Health vs ready

**Health:** process can serve HTTP (ALB uses this). **Ready:** if `DATABASE_URL` is set, Postgres `select 1` must work; otherwise 503. Production ready JSON also reports `tls.rejectUnauthorized` / `tls.verified` after the RDS CA bundle is used. Local mode without a DB still returns ready=local so a storage-less demo is not marked down.

## Rollback

Previous task definition ARN from the deploy script or Actions rollback. App migrations in V1 are additive `create table if not exists`.

## Backup / restore

RDS 1-day automated backups (Free Tier). Restore = new instance from snapshot, update `database-url` secret, redeploy. `skip_final_snapshot=true` is a **demo teardown** choice.

## Preview incident (root cause)

Cloud Preview iframe sent `Origin: null`. Next 16 `blockCrossSiteDEV` allowed `/` but **403** on `/_next/*`. Curl without Origin still 200, so the process looked healthy while the UI was blank. Fix: local-only proxy on `npm run dev`. Production `server.js` does not strip headers and does not use that proxy.

## Implemented vs designed

**Implemented and proven:** product path with demo data, BFF, Postgres adapter, health/ready/metrics, Terraform, standalone production server, local Postgres round-trip, **and a validated AWS prod-demo** in ca-central-1 (see `docs/AWS-DEPLOYMENT-EVIDENCE.md`).

**Designed, not currently enabled:** GitHub Actions → AWS deploy via OIDC; HTTPS/ACM (needs a domain you control); real identity.

**Out of scope:** LLM APIs, PHI, official MCC/CaRMS data.

You may say:

“I deployed and validated IMG Compass Canada on AWS using Terraform, ECS Fargate, RDS PostgreSQL, ALB, ECR, Secrets Manager and CloudWatch. RDS TLS is verified with the Amazon RDS regional CA bundle — we do not disable certificate validation. Since this is a portfolio environment without continuous production traffic, I designed it to be parked or recreated on demand to control recurring cloud cost.”

## Do not claim

- That you wrote every line without AI assistance
- That the environment will stay up forever (it is on-demand and still bills while running)
- That Docker was never validated (Compose production smoke **did** pass)
- That this is official MCC/CaRMS software or medical advice
- That demo auth is production identity or that the app is PHIPA/HIPAA certified
- That language “needs verification” is a failed exam
- That eligibility numbers are legally binding
- That the preview proxy is a production security feature
