# On-demand AWS lifecycle (deploy → validate → park or destroy)

Do **not** `terraform apply` until the owner approves AWS resource creation. Docker smoke must pass first (`docs/DOCKER-SMOKE-WINDOWS.md`).

AWS deployment is an **on-demand portfolio environment**: provision for validation/demo, then park or destroy idle runtime so it does not keep generating unnecessary monthly cost.

Region assumptions: **ca-central-1**. List prices change; treat numbers as order-of-magnitude.

## 1. Operating states

### ACTIVE

| Piece | Setting |
| --- | --- |
| ECS desired count | `1` |
| ALB | Enabled (`enable_load_balancer = true`) |
| HTTPS | Optional (`enable_https` + ACM) |
| RDS | Available, private subnet, not public |
| NAT | **Off** (`enable_nat = false`) |
| CloudWatch | Log group 14-day retention |
| Health | ALB → `/api/health`; app `/api/ready` |

Network (Option B): Fargate in **public** subnets with a public IP; inbound **tcp/43210 only from the ALB security group**; RDS in **private** subnets; RDS SG allows **5432 only from the ECS SG**.

Apply with `active.tfvars` + gitignored `terraform.tfvars` (`container_image`).

### PARKED (Terraform)

| Piece | Setting |
| --- | --- |
| ECS desired count | `0` (no Fargate vCPU-hours) |
| ALB | **Destroyed** (`enable_load_balancer = false`) — ALB still bills if left at count 1 |
| RDS | Instance **still exists** until you CLI-stop or destroy it |
| NAT | Still off |
| ECR | Lives in **bootstrap**, not the app stack |
| Terraform state | S3 + DynamoDB (bootstrap) |

Apply with `parked.tfvars` (same `container_image`). Then optionally `aws rds stop-db-instance` (see RDS section).

**Parked is not free.** Typical remainders: RDS (running or storage-only if stopped), VPC/IGW (usually $0), Secrets Manager, CloudWatch stored logs, ECS cluster ($0), public IPv4 if any ENI remains, S3 state, ECR storage.

### MINIMAL RETAINED

`terraform destroy` the **app** stack (VPC, ALB, ECS, RDS, secrets). Keep **bootstrap**: S3 state, DynamoDB lock, **ECR + image**. Restore later with `terraform apply -var-file=active.tfvars`. Demo data is gone unless you snapshot RDS first.

## 2. Parking options — recommendation

| | Option A — PARK | Option B — DESTROY APP STACK |
| --- | --- | --- |
| How | `parked.tfvars` apply; optional RDS stop | `terraform destroy` in `terraform/` (not bootstrap) |
| Time to live demo | Minutes (RDS start 5–15 min if stopped; ALB recreate ~2–5 min) | 15–25+ min (RDS create is the long pole) |
| Monthly cost idle | **Not cheap** if RDS+ALB remain; better if ALB gone + RDS stopped (~storage) | **Cheapest** (state + ECR cents–few dollars) |
| Demo data | Kept on RDS (until 7-day auto-start if stopped) | Lost unless snapshot |

**Recommend for this portfolio: Option B after the first successful validation** (snapshot RDS if you care about demo rows, then destroy the app stack). Use Option A only if you need the same DB back the same day.

Do not keep an ALB “for convenience” while parked — it is a large idle bill.

## 3. RDS

This stack is **Postgres 16, Single-AZ, `db.t4g.micro`**. Single-AZ instances **can be stopped**.

- Stop: `aws rds stop-db-instance --db-instance-identifier …`
- AWS **automatically starts** the instance after **7 days**. Billing for instance-hours **resumes**.
- Stopped: you still pay **storage** (and backups/PIOPS if any). You do **not** pay instance-hours while stopped.
- Terraform does **not** manage stop/start. A later `terraform apply` may conflict if you change RDS arguments; prefer not to apply while relying on a stopped instance.
- **Long idle (weeks):** snapshot + destroy RDS (or whole app stack) is more cost-effective than a 7-day stop loop.

## 4. ALB

ALB charges **hourly + LCU** even when ECS desired count is 0. Parked Terraform therefore sets `enable_load_balancer = false` so apply **deletes** the ALB, listeners, and target group. Restore: `active.tfvars` apply recreates them (new DNS name unless you use a domain/ACM alias).

## 5. What to keep always

| Resource | Where | Why | Approx idle cost |
| --- | --- | --- | --- |
| Terraform state bucket | bootstrap | Recreate app stack | S3 cents |
| DynamoDB lock table | bootstrap | State locking (on-demand) | cents if idle |
| ECR + image | bootstrap | Skip rebuild | storage cents–~$1 |
| Source / tfvars / docs | git | Configuration | $0 |

## 6. Cost estimates (ca-central-1, order of magnitude, 2026 list prices vary)

**A. ACTIVE** (continuous): ALB ~USD 16–22 + Fargate 0.5 vCPU/1 GB ~USD 12–18 + RDS `db.t4g.micro` ~USD 12–18 + Secrets/logs/ECR/public IPv4. **~USD 45–70/month**. No NAT in the default design.

**B. PARKED** (ECS 0, ALB deleted, RDS **running**): RDS dominates **~USD 12–18/month** + secrets/logs. If RDS **stopped**: mainly storage **~USD 2–5/month** until the 7-day auto-start.

**C. MINIMAL RETAINED** (app stack destroyed): **~USD 0.50–3/month** (S3 + ECR + empty DynamoDB).

## 7. First deployment (do not run apply yet)

A. Docker smoke on Windows — **blocker** (`docs/DOCKER-SMOKE-WINDOWS.md`)  
B. Public GitHub — curated snapshot of this tree  
C. GitHub OIDC — after Environments exist (`docs/GITHUB-OIDC.md`)  
D–E. Build and push image to **bootstrap ECR**  
F. Bootstrap apply (state + lock + ECR) — owner approval  
G. `terraform plan -var-file=active.tfvars -var-file=terraform.tfvars`  
H. Owner reviews plan  
I. `terraform apply` same files  
J. Image CMD already runs `db/migrate.mjs` then `server.js`  
K–M. `/api/health`, `/api/ready`, `/api/metrics`  
N. Demo sign-in + `/api/state` round-trip  
O. CloudWatch log group `/ecs/img-compass-prod-demo`  
P. HTTPS only if ACM configured  
Q. Screenshots / ALB URL evidence  

## 8. Park (Option A)

```bash
cd terraform
terraform plan  -var-file=parked.tfvars -var-file=terraform.tfvars
terraform apply -var-file=parked.tfvars -var-file=terraform.tfvars   # owner approval
# optional, same day / same week only:
aws rds stop-db-instance --db-instance-identifier img-compass-prod-demo
```

Remains: VPC, RDS (stopped or not), ECS cluster/service at 0, task definition, secrets, logs, bootstrap ECR/state.

## 9. Restore from Option A

```bash
aws rds start-db-instance --db-instance-identifier img-compass-prod-demo
# wait until available (often 5–15 minutes)
cd terraform
terraform apply -var-file=active.tfvars -var-file=terraform.tfvars   # owner approval
```

Confirm `/api/health` and `/api/ready` on the **new** ALB DNS (SSM parameter).

## 10. Minimal destroy / restore (Option B, recommended after first demo)

Before destroy, optional: `aws rds create-db-snapshot …`

```bash
cd terraform
terraform destroy -var-file=active.tfvars -var-file=terraform.tfvars   # destroys app stack only
# leave terraform/bootstrap in place
```

Restore:

```bash
cd terraform
terraform apply -var-file=active.tfvars -var-file=terraform.tfvars
```

RDS create often **10–20 minutes**. Empty database unless you restore a snapshot and rewrite `database-url`.
