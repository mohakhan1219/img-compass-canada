# Terraform (prod-demo)

Default network is **Option B**: public-subnet Fargate, **no NAT**, RDS private, ECS port 43210 only from the ALB SG.

`container_image` is **required** (no BusyBox default). Put the URI in gitignored `terraform.tfvars`.

Lifecycle files (committed, no secrets):

| File | Meaning |
| --- | --- |
| `active.tfvars` | desired_count=1, ALB on |
| `parked.tfvars` | desired_count=0, ALB removed |

ECR lives in **`bootstrap/`** so `terraform destroy` of this directory does not delete the image.

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # set real ECR URI from bootstrap output
cp backend.hcl.example backend.hcl             # after bootstrap
terraform init -backend-config=backend.hcl
terraform plan  -var-file=active.tfvars -var-file=terraform.tfvars
terraform apply -var-file=active.tfvars -var-file=terraform.tfvars
```

Park / restore / costs: `docs/OPERATIONS-LIFECYCLE.md`.
