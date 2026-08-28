# Release validation (Checkpoint RV)

Executed 2026-08-27 in the agent VM. Historical scoreboard — **GitHub is now a public snapshot of this tree; LinkedIn is still not published.** At the time of this document: no public GitHub remote, no LinkedIn, no `terraform apply`.

Local development remains `npm run dev`. Production validation used **standalone `node server.js`**, not `scripts/dev.mjs`.

## Scoreboard

| Check | Result |
| --- | --- |
| Production build | **PASS** |
| Docker | **NOT TESTED** (no Docker daemon) |
| PostgreSQL remote path | **PASS** (local Postgres 16 `compass_rv` only) |
| Terraform fmt | **PASS** (`terraform fmt -check`, v1.9.8) |
| Terraform validate | **PASS** |
| Security audit (public-git content) | **PASS** with follow-ups listed below |
| Public GitHub ready | **NO** |
| AWS deployment ready | **NO** |
| LinkedIn portfolio ready | **NO** |

## 1. Local production validation — PASS

```text
npm run build                          # Next.js 16.3.3 standalone — succeeded
cp standalone + public + .next/static + db
HOSTNAME=127.0.0.1 PORT=43220 NODE_ENV=production node server.js
```

| Probe | Result |
| --- | --- |
| Process | `node server.js` (no `scripts/dev.mjs` in standalone tree) |
| `GET /api/health` | 200 `{ "status": "ok", "service": "img-compass-canada" }` |
| `GET /api/ready` (no `DATABASE_URL`) | 200 `{ "ready": true, "persistence": "local" }` |
| `GET /api/metrics` | 200 `{ "metrics": { "http_requests": … } }` |
| `GET /api/state` without Postgres | 501 `postgres_disabled` |
| `Origin: null` + `Sec-Fetch-Site: cross-site` on `/` and CSS | 200 (production does **not** run `blockCrossSiteDEV`; no header-stripping proxy) |
| Structured logs | JSON lines with `ts`, `level`, `msg`, `requestId`, `service` |

`NODE_ENV=production node scripts/dev.mjs` still exits 1 (refuses). Preview on 43210 is a separate process and was not used for this path.

Cookie follow-up: `compass_learner` is HttpOnly. `Secure` is set **only** when `COMPASS_COOKIE_SECURE=true` so HTTP ALB/local standalone work. Enable it with HTTPS.

## 2. Docker — NOT TESTED

`docker info` failed (daemon not present). Do **not** claim the image builds or that `.dockerignore` was exercised at runtime. The Dockerfile `CMD` is `node db/migrate.mjs && node server.js`. `scripts/dev.mjs` is listed in `.dockerignore`. Production images now bake `NEXT_PUBLIC_PERSISTENCE=remote` at **build** time (required for the client BFF path).

Owner should run `docker compose up --build` before AWS apply.

## 3. PostgreSQL remote path — PASS

Isolated local cluster only: database `compass_rv`, user `compass_rv`, host `127.0.0.1`. **Not** any third-party or personal study-app database.

| Step | Result |
| --- | --- |
| `node db/migrate.mjs` | `{ "msg": "migrate_ok" }`; table `learner_state` |
| Ready with valid `DATABASE_URL` (port 43221) | 200 `{ "ready": true, "persistence": "postgres" }` |
| Ready with wrong password (port 43222) | **503** `{ "ready": false, "persistence": "postgres" }` |
| `GET /api/state` no cookie | 401 |
| `POST /api/auth/demo` then GET/PUT `/api/state` | load seed, save `notes=rv-put-ok`, row persisted |
| HTML + sampled `/_next` assets | no `DATABASE_URL` / `postgres://` leak |
| localStorage mode | independent: no-DB server still `ready` local; `npm test` 27 passed including `migrateToCurrent` |

## 4. Terraform — fmt PASS, validate PASS, apply NOT RUN

Reviewed:

| Area | Notes |
| --- | --- |
| VPC | `10.40.0.0/16`, DNS hostnames/support |
| Subnets | 2 public (map public IP), 2 private, 2 AZs |
| Routes | public → IGW; private → NAT |
| SGs | ALB 80/(optional 443) from internet; ECS 43210 from ALB only; RDS 5432 from ECS only |
| ALB | public, HTTP forward; HTTPS optional |
| ECS | Fargate 512/1024, private subnets, `assign_public_ip = false`, no command override (image CMD) |
| RDS | Postgres 16 `db.t4g.micro`, private, encrypted, not public, 7-day backups, `skip_final_snapshot = true` |
| Secrets | JSON + `DATABASE_URL` strings; exec role `GetSecretValue` on those ARNs |
| CloudWatch | log group 30 days; Container Insights on |
| ECR | scan on push, mutable tags |
| IAM | exec = managed ECS execution + scoped secrets; **task role has no extra policies** |
| Env split | `var.environment` default `prod-demo`; GitHub has staging/prod-demo **environments**, not two Terraform stacks |

**Must fix or decide before `apply` (placeholders):**

1. `container_image` default is BusyBox — ECS will not serve the app until a real ECR URI is passed.
2. No remote state backend (local `.tfstate`). Add S3 + DynamoDB lock in the owner account.
3. NAT Gateway is the cost driver — see cheaper alternative in `docs/AWS-DEPLOYMENT-PLAN.md`.
4. `enable_https=false` means HTTP on the internet until ACM is attached.
5. GitHub Actions `AWS_ROLE_ARN` / ECR / ECS secrets do not exist until the owner creates OIDC.
6. Docker image path untested in this VM.
7. Staging workflow assumes a second ECS service that Terraform does not create by default.

## 5–8

Owner-executed AWS steps: `docs/AWS-DEPLOYMENT-PLAN.md`.  
Portfolio copy: root `README.md`.  
Interview guide: `docs/INTERVIEW-GUIDE.md`.  
Public-git audit: section 6 of this file and `docs/security.md`.

## 6. Security audit (public GitHub content)

**PASS for secrets/PII in this repo’s git history.** Follow-ups are process, not leaked credentials.

| Item | Finding |
| --- | --- |
| Git authors | `IMG Compass <compass@local.dev>` only |
| `.env` files | none committed; `.env` gitignored; `.env.example` has no real secrets |
| AWS keys / tokens | none in history |
| Personal names/emails | no owner personal emails; demo name **Dr. Alex Morgan** (fictional) |
| Other people’s study apps | no matching project IDs, remotes, or production URLs in this git history |
| Paid Qbanks | catalogs explicitly **not** UWorld/Abzi/Toronto Notes/Felipe Santos/MCC paid items |
| Screenshots | instructions only; no PNG binaries |
| Logs | JSON request ids; no email fields in log helper |
| README claims | must not say AWS is live until apply; must not say every line was hand-typed |

Untracked `AGENTS.md` / `CLAUDE.md` (Next scaffold) are gitignored so they are not published by accident.

## Why GitHub / AWS / LinkedIn are still NO

- Owner has not approved a **new** public remote.
- Docker image not built here.
- Terraform not applied; BusyBox image placeholder; no remote state.
- Screenshot pack not captured.
- LinkedIn should wait for a public repo URL and an honest “implemented vs designed” line.

## Stop

Wait for owner approval before creating a GitHub remote, applying Terraform, or posting LinkedIn.
