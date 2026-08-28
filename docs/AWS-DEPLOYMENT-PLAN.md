# AWS deployment plan (owner-executed)

**Do not run `terraform apply` until the owner explicitly approves resource creation.** This document is the runbook for that future day. Region default: `ca-central-1`.

This agent has **not** created AWS resources and **has not** built the Docker image (no daemon).

## Lowest-cost reasonable portfolio shape

**Selected for this portfolio: Option B** (`enable_nat = false`). Comparison: `docs/LOW-COST-AWS.md`. HTTPS: `docs/HTTPS.md`. OIDC: `docs/GITHUB-OIDC.md`. Backend bootstrap: `terraform/bootstrap/README.md`.

Keep: one VPC, one ALB, one Fargate task (0.5 vCPU / 1 GB), one RDS `db.t4g.micro`, ECR, Secrets Manager, CloudWatch (14-day logs). Container Insights off.

Rough monthly order of magnitude (verify in the AWS calculator):

- Option B (default, no NAT): **~USD 40–60**/month
- Option A (`enable_nat = true`): **~USD 70–100**/month
- Destroy when idle: `terraform destroy` in the app stack, then bootstrap last.

## Prerequisites

1. AWS account with billing alerts (e.g. USD 20 and USD 50).
2. IAM user or SSO role that can create the bootstrap backend **and** the app stack (or two roles).
3. Docker working on the laptop that will push to ECR.
4. Decide HTTP vs HTTPS. Default Terraform is **HTTP :80**. Public HTTPS needs a domain + ACM certificate in `ca-central-1`.
5. Confirm `container_image` is passed (required; BusyBox is rejected).

## IAM permissions (apply role)

Broad but typical for this stack (tighten after first apply if desired):

- `ec2:*` scoped to the demo VPC (or `AmazonVPCFullAccess` for first apply only)
- `elasticloadbalancing:*`
- `ecs:*`, `ecr:*`
- `rds:*`
- `secretsmanager:*`, `ssm:PutParameter`, `ssm:GetParameter`
- `logs:*`, `cloudwatch:*`
- `iam:CreateRole`, `iam:AttachRolePolicy`, `iam:PutRolePolicy`, `iam:PassRole` (ECS tasks)
- `ec2:AllocateAddress`, `ec2:CreateNatGateway` **only if keeping NAT**

GitHub OIDC deploy role (after stack exists) needs far less: ECR push, ECS register/update, `iam:PassRole` on the two task roles.

## Terraform backend / bootstrap

App stack uses `backend "s3" {}` (partial config). **Do not apply bootstrap here.** Owner laptop:

1. `terraform/bootstrap` → S3 (versioned, encrypted, public access blocked) + DynamoDB lock table (`LockID`).
2. Copy `backend.hcl.example` to `backend.hcl` with those names.
3. `terraform init -backend-config=backend.hcl` in `terraform/`.
4. Never commit `backend.hcl` or `*.tfstate`.

## Image wiring (required)

```bash
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION=ca-central-1
# After first terraform apply (or create ECR first):
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com"
docker build -t img-compass-canada:v0.3.0 .
# Confirm the image CMD is migrate + server.js, not npm run dev
docker run --rm --entrypoint '' img-compass-canada:v0.3.0 ls scripts/dev.mjs && echo 'FAIL proxy in image' || echo 'proxy absent OK'
# Tag/push using terraform output ecr_repository_url
```

Pass `-var="container_image=ACCOUNT.dkr.ecr.ca-central-1.amazonaws.com/img-compass-prod-demo:v0.3.0"` or `terraform.tfvars`. Apply **fails** if the value is missing or contains `busybox`.

Chicken-and-egg: **ECR is in `terraform/bootstrap`**. Apply bootstrap first, push the image, then apply the app stack with that URI. Do not put ECR in the destroyable app stack.

Dockerfile bakes `NEXT_PUBLIC_PERSISTENCE=remote` so the browser uses the BFF.

## Terraform variables

| Variable | Guidance |
| --- | --- |
| `aws_region` | `ca-central-1` |
| `environment` | `prod-demo` (or `staging` for a **second** apply in another workspace/dir) |
| `container_image` | **Required real ECR URI** |
| `enable_https` | `false` until ACM exists |
| `acm_certificate_arn` | set with HTTPS |
| `desired_count` | `1` |
| `db_username` / `db_name` | keep defaults unless you have a naming policy |

ECS sets `NODE_ENV=production`, `NEXT_PUBLIC_PERSISTENCE=remote`, `COMPASS_COOKIE_SECURE` from `enable_https`. Do not set container `command` to `npm run dev`.

## DNS / ACM

- No domain: use ALB DNS from SSM `/img-compass/prod-demo/alb_dns` (HTTP). Fine as a **temporary live demo**; browsers show “Not secure”.
- Domain: Route 53 (or external DNS) A/ALIAS to ALB → request ACM cert in `ca-central-1` → `enable_https=true`.
- Then `COMPASS_COOKIE_SECURE` becomes `true`.

## Deploy sequence (when approved)

1. Bootstrap S3/DynamoDB backend.
2. `terraform init && terraform plan` with a real `container_image` plan (or ECR-first).
3. `terraform apply` after reviewing the plan.
4. Build/push image; `terraform apply` again if the URI changed.
5. Hit `http://<alb>/api/health` and `/api/ready`.
6. Optional: configure GitHub OIDC and secrets (`AWS_ROLE_ARN`, `ECR_REPOSITORY`, `ECS_CLUSTER`, `ECS_SERVICE`).
7. Tag `v0.3.0` only after the public repo exists **and** you want the prod-demo workflow to fire.

## Destroy

```bash
terraform destroy
```

RDS `skip_final_snapshot = true` so destroy is cheap. Turn that **off** if you need to keep data.

## Rollback

1. Keep the previous ECS task definition ARN from `scripts/ecs-deploy.sh` output.
2. GitHub Action **Rollback prod-demo**, or `aws ecs update-service --task-definition <previous-arn> --force-new-deployment`.
3. Confirm `/api/health` and `/api/ready`.
4. Bad migration: restore RDS snapshot (V1 has `create table if not exists` only).

## Staging

`.github/workflows/deploy-staging.yml` expects a **separate** ECS service. This Terraform stack is one environment. For a real staging account, copy the stack with `-var="environment=staging"` and a second VPC CIDR, or skip staging and use `prod-demo` only.
