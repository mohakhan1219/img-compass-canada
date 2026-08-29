# IMG Compass Canada V2 — implementation plan

**Product:** Your complete journey from IMG to Canadian residency — in one place.

**Constraint:** Keep the existing Next.js standalone + PostgreSQL + ECS/Fargate + private RDS + verified TLS + health/ready/metrics + Terraform lifecycle. Do not add NAT, EKS, search clusters, or extra always-on compute.

---

## What we reuse (do not rebuild)

| Layer | Keep |
| --- | --- |
| App | Next.js 16 App Router, React 19, Tailwind, shadcn-style primitives, navy/cream visual system |
| Persistence | `learner_state` JSONB + `/api/state` BFF |
| Observability | `/api/health`, `/api/ready`, `/api/metrics`, JSON logs, `x-request-id` |
| Data plane | RDS TLS via bundled CA, `rejectUnauthorized: true` |
| Platform | Terraform VPC/ECS/ALB/RDS, Docker standalone, GitHub Actions |
| Demo learner | Dr. Alex Morgan (`demo-alex`) as **optional** Explore Demo |
| Study UX | MCCQE sessions/questions/mocks, NAC timer/stations, interview practice |

## What we replace

| Layer | V1 problem | V2 |
| --- | --- | --- |
| Auth | Cookie = learner id; GET missing row seeds **demo** | Signed session; Cognito (prod) + local hashed-password fallback; empty state for new users |
| Profile | Five free-text fields, fake 100% | 7-step onboarding + section completeness |
| Journey | Equal-weight demo stages + unexplained % | Personalized stages + transparent Compass indicator |
| Provincial | Fictional Northlake/Harbour/Prairie | Real CaRMS R-1 institutions + official URLs |
| Requirements | Mixed into learner JSON as editable “required” | Reference catalog vs personal progress |
| Programs | Fake catalog | Schema + institutions now; 2027 descriptions not fabricated |
| Nav | Flat 13 items | Grouped: Home / Journey / Exams / Eligibility / CaRMS / Match / About / Settings |

---

## Architecture decisions

### Authentication

- **Production (optional Terraform):** Amazon Cognito User Pool, email username, no SMS MFA.
- **Local / CI / default ECS until Cognito is applied:** `app_user` table with **scrypt** password hashes. Never store plaintext.
- Session cookie is an **opaque signed token** (`compass_session`), not a learner id. Server maps token → `user_id` / `demo-alex`.
- Demo: separate path `POST /api/auth/demo` still issues a session for `demo-alex` only.
- Cost: Cognito MAU is effectively $0 at demo scale (free tier 50k MAU). Terraform flag `enable_cognito` defaults **false** so applying V2 app code does not require Cognito until we opt in.

### Reference vs personal data

- **Reference** lives in versioned TypeScript catalogs under `src/reference/` (git-reviewed, no extra AWS). Optional future SQL import without redesign.
- **Personal** remains JSONB on `learner_state` plus `app_user`.
- Users cannot change official requirement status (required → not required). They track **personal** status, notes, dates, blockers.

### 2027 data safety

- Seed participating **institutions** and high-level pathway notes with `lastVerified` and `sourceStatus`.
- Do **not** invent 2027 program descriptions or convert 2026 criteria into 2027 truth.
- Program explorer rows are institution + specialty placeholders with official PGME/CaRMS links and `needs_review` where descriptions are not yet public.

### AWS

- Reuse existing ECS/RDS. Do not destroy the running environment.
- Cognito resources are additive and gated.
- No NAT, no extra caches.

---

## Phases (internal)

1. Schema + session + empty vs demo seed + migrate v2→v3
2. Reference catalogs + dependent dropdowns
3. Auth APIs + AuthGate + onboarding
4. Journey engine + dashboard + About
5. Provincial / Program Explorer / CaRMS flow
6. Exams / credentials / language
7. Tests, lint, build, Docker, terraform validate, secret scan

---

## Acceptance mapping

See repository README “V2” section after implementation. Product is complete only when a new account is isolated, demo still works, reference institutions are real, and Explorer → Applications → Interviews → Ranking → Match propagates from one store.
