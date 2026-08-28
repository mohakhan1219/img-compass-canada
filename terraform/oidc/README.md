# GitHub OIDC Terraform (optional)

Separate from the app VPC stack. Apply only after the public GitHub repository exists and the owner approves IAM creation. See `docs/GITHUB-OIDC.md`.

```bash
terraform init
terraform plan -var="github_org=YOUR_ORG" -var="github_repo=YOUR_REPO"
```
