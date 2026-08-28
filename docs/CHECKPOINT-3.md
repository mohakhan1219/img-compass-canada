# Checkpoint 3 (G–H) — historical report

**Note:** Frozen checkpoint from 27 Aug 2026. AWS prod-demo and the public GitHub snapshot came later. Treat the “no public GitHub” lines below as historical, not current status.

**Status at checkpoint:** G–H implementation was complete in this repository. There was no public GitHub remote yet.

**Local command:** `npm run dev` only. Cloud Preview uses a development proxy that **must not** run in staging or production.

This agent environment could not `terraform apply` (no AWS credentials) or `docker build` (no Docker daemon). `terraform validate` succeeded. Apply in the owner AWS account before claiming a live prod-demo URL.

---

## 1. Architecture

Single Next.js 16 App Router monolith (`src/`). Layers:

| Layer | Location |
| --- | --- |
| UI | `src/app`, `src/components` |
| Domain | `src/domain` (journey, blockers, requirements, MCCQE1/NAC/language/CaRMS engines) |
| Feature repositories | `src/data/repositories` (pure; no I/O) |
| Persistence ports | `PersistenceAdapter`, `LearnerStateRepository` |
| Browser adapter | `LocalStorageAdapter` when `NEXT_PUBLIC_PERSISTENCE=local` (default) |
| Server adapter | `postgres-state-repository.ts` |
| BFF | `src/app/api/*` |

**Request path (remote):** Browser → Next.js route handlers → domain → `LearnerStateRepository` → Postgres. The browser never receives `DATABASE_URL`.

**Request path (AWS prod-demo, after apply):** User → ALB → ECS Fargate (`node server.js`) → RDS Postgres 16 in private subnets. Secrets Manager supplies `DATABASE_URL`.

**Not in V1:** Azure, AI APIs, real identity, PHI, official MCC/CaRMS data.

**Preview vs production HTTP:**

- Local / Cloud Preview: `npm run dev` → `scripts/dev.mjs` on `0.0.0.0:43210` forwarding to `next dev` on `127.0.0.1:43211`, stripping `Origin` / `Referer` / `Sec-Fetch-*` so sandboxed iframes can load `/_next`.
- Staging / production: Docker `CMD` `node db/migrate.mjs && node server.js`. Proxy is dockerignored, refuses `NODE_ENV=production`, and is not set as the ECS container command.

## 2. AWS resources (this environment)

**None applied.** No VPC, ALB, ECS, RDS, ECR, or Secrets Manager objects were created. There is no live prod-demo URL from this session.

## 3. Terraform (`terraform/`)

Contract for a **single-account portfolio demo** in `ca-central-1`:

- VPC `10.40.0.0/16`, public + private subnets, NAT
- ALB (HTTP 80; HTTPS optional via `enable_https` + ACM ARN, default off)
- ECS Fargate 0.5 vCPU / 1 GB, desired count 1, private subnets, no public IP
- RDS PostgreSQL 16 `db.t4g.micro`
- ECR (scan on push), Secrets Manager (`database` JSON + `database-url`), CloudWatch logs, SSM parameter for ALB DNS
- Task env includes `NODE_ENV=production` and `NEXT_PUBLIC_PERSISTENCE=remote`; **no** container `command` override (image CMD is migrate + `server.js`)

`terraform validate` has succeeded locally. `apply` is owner-side.

## 4. Persistence

- **AppState v2** with `migrateToCurrent`. Storage key `img-compass-canada.v1` in local mode.
- **Local:** `StoreProvider` + `LocalStorageAdapter`; feature repos stay pure.
- **Remote:** cookie `compass_learner`; `GET`/`PUT /api/state`; `POST /api/auth/demo`, `/api/auth/signout`.
- **Postgres:** `LearnerStateRepository` + migration `db/migrations/001_learner_state.sql`; `npm run db:migrate` / Compose / image CMD.
- Journey status is **derived** (`computeJourneySnapshot`); not stored as `stageProgress`.
- Eligibility is never hardcoded as medical/legal truth. Fictional provincial rows: **DEMO / FICTIONAL — NOT OFFICIAL**.

## 5. CI/CD

- `.github/workflows/ci.yml`: lint, test, build, `npm audit` (non-blocking), terraform fmt/validate, docker build (no push).
- `deploy-staging.yml`: `workflow_dispatch` + OIDC → `scripts/ecs-deploy.sh`.
- `deploy-prod-demo.yml`: git tag `v*` → build/push ECR → ECS.
- `rollback.yml`: previous task definition ARN.
- `dependabot.yml` for npm, Actions, Terraform (needs a GitHub remote to run).

Workflows are **in-repo only** until a GitHub remote exists.

## 6. SRE

Documented in `docs/sre.md`: availability/readiness/latency SLIs; best-effort 99% demo SLO; JSON logs + `x-request-id`; `/api/metrics`; CloudWatch + Container Insights (after apply). Error budget: freeze tagged deploys after two consecutive rollbacks.

Runbooks: `docs/runbooks/{deploy,rollback,backup-restore,db-outage,secret-rotation}.md`.

Health: `GET /api/health`. Ready: `GET /api/ready` (DB ping when `DATABASE_URL` set). Metrics: `GET /api/metrics`.

## 7. Security

- Apache-2.0; no production credentials in git.
- Demo auth only (HttpOnly cookie in remote mode). Not HIPAA/PHIPA/PIPEDA certified.
- RDS private-subnet only; ECR scan; Dependabot; TLS when ACM is wired.
- Synthetic data; no CV/passport/MCC ID uploads.
- **Preview proxy is not a production security feature.** Staging/production keep Next.js origin checks and ALB TLS (when enabled).

## 8. Test / lint / build / deploy

| Check | This session |
| --- | --- |
| `npm test` / lint / build | Expected green in CI; run locally after this commit |
| `terraform validate` | Succeeded previously |
| `docker build` / `docker compose` | Not run here (no daemon) |
| ECS deploy | Not run (no AWS) |

## 9. Cost (after apply; destroy when idle)

Dominant cost is **NAT Gateway**. Also ALB, Fargate 0.5/1GB, RDS `db.t4g.micro`, modest CloudWatch/ECR. This is a demo footprint, not a landing zone.

## 10. Technical debt

- Next 16 middleware deprecation toward `proxy`.
- Demo auth is not real identity.
- Default ALB is HTTP until ACM.
- Terraform default `container_image` is a BusyBox placeholder until CI supplies ECR.
- Screenshot PNG pack not captured in-repo (see `docs/screenshots/README.md`).
- Cloud Preview proxy is a local workaround for `blockCrossSiteDEV` + `Origin: null`.

## 11. Screenshots

Instructions only (`docs/screenshots/README.md`). Capture after `npm run dev` and **Settings → Reset demo data**. Do not include real names, photos, or production project IDs.

## 12. Public GitHub

**Not ready.** Nested independent git history exists locally. Do not create a public remote until the owner checklist is complete. Do not copy history from any private study app.

## 13. LinkedIn

**Not ready.** First public/LinkedIn release is full V1 A–H after owner review.

## 14. Interview talking points

- Persistence ports: swap localStorage vs Postgres without changing domain/repos.
- BFF so the browser never holds `DATABASE_URL`.
- Derived journey + classified holds (`requirement_uncertain` vs exam failure).
- Fictional requirements labelled, source-aware, not medical/legal truth.
- Terraform is the **contract**; this agent did not create live AWS resources — say that explicitly.
- Local preview proxy is **dev-only**; production is standalone Next on ECS.

---

**Stop here.** Do not publish, tag publicly, or post to LinkedIn from this checkpoint.

