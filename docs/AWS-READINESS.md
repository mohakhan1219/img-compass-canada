# AWS / Docker readiness

AWS prod-demo was applied in **ca-central-1**. GitHub hosts a curated snapshot of this tree (account IDs omitted from git history). The ALB URL is a **temporary live demo** and may be parked later; screenshots remain in `docs/screenshots/`.

## Scoreboard

| Item | Result |
| --- | --- |
| Docker smoke test | **PASS** (2026-08-27) |
| First AWS apply | **DONE** (ca-central-1) |
| RDS TLS with CA verification | **PASS** (image `v0.3.1`, `/api/ready` `tls.verified: true`) |
| Terraform image wiring | **PASS** |
| Active/parked Terraform | **READY** (`active.tfvars` / `parked.tfvars`) |
| Remote backend + ECR | **IN USE** |
| HTTPS / ACM | **NOT ENABLED** (HTTP ALB) |
| Screenshot pack | **READY** (synthetic Dr. Alex Morgan) |
| GitHub Actions CI | **ACTIVE** |
| GitHub Actions AWS CD / OIDC | **PREPARED, NOT ENABLED** |

## Follow-ups

- Custom domain + ACM if you want HTTPS (`docs/HTTPS.md`)
- GitHub Environments + OIDC if you want tag-based deploys (`docs/GITHUB-OIDC.md`)
