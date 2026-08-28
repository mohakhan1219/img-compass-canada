# AWS / Docker readiness (updated after TLS-hardened prod-demo)

**Public GitHub:** curated snapshot of this tree (account IDs stripped from git history). **No LinkedIn.** AWS prod-demo is live in ca-central-1 and left running. Do not terraform destroy without owner approval.

## Scoreboard

| Item | Result |
| --- | --- |
| Docker smoke test | **PASS** (agent VM, 2026-08-27) |
| First AWS apply | **DONE** (ca-central-1) |
| RDS TLS with CA verification | **PASS** (image `v0.3.1`, `/api/ready` `tls.verified: true`) |
| Terraform image wiring | **PASS** |
| Active/parked Terraform | **READY** (`active.tfvars` / `parked.tfvars`) |
| Remote backend + ECR | **IN USE** |
| HTTPS / ACM | **NOT ENABLED** (HTTP ALB) |
| Screenshot pack | **READY** (live ALB + synthetic Dr. Alex Morgan) |
| Public GitHub | **YES** (curated public history; see README) |
| LinkedIn | **NO** |

## Remaining owner gates

**Before LinkedIn:** public repo URL + honest status (HTTP demo, on-demand AWS, estimated USD 2–4/day while running). Prefer screenshots if the stack is later destroyed.

GitHub OIDC and a custom HTTPS domain remain optional follow-ups.

**Before recruiter HTTPS demo:** ACM + `enable_https` (see `docs/HTTPS.md`).
