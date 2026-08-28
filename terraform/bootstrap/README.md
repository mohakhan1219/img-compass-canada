# Bootstrap: S3 + DynamoDB for Terraform remote state

This stack is **separate** from the app VPC/ECS stack. Apply it **once** from an owner laptop with AWS credentials. Do **not** apply it from this agent environment unless the owner explicitly approves AWS resource creation.

Creates:

- S3 state bucket (versioned, encrypted, public access blocked)
- DynamoDB lock table (`LockID`)
- **ECR repository** `img-compass-prod-demo` (scan on push) so app-stack destroy keeps the image

Uses **local state** on purpose (chicken-and-egg). Store bucket/table names in `terraform/backend.hcl` (gitignored).

```bash
cd terraform/bootstrap
terraform init
terraform plan
terraform apply   # only with owner approval
```

Then push `docker` images to `ecr_repository_url` and apply the app stack with `active.tfvars`.

Destroy bootstrap **last**, after the app stack is destroyed, or you lose state and the image registry.
