# GitHub Actions OIDC

Workflows already use `aws-actions/configure-aws-credentials` with `role-to-assume: ${{ secrets.AWS_ROLE_ARN }}` and `permissions: id-token: write`. They must **not** use long-lived `AWS_ACCESS_KEY_ID` on GitHub.

Apply `terraform/oidc/` only after GitHub Environments `staging` and `prod-demo` exist and the owner approves IAM resource creation.

```bash
cd terraform/oidc
terraform init
terraform plan -var="github_org=YOUR_ORG" -var="github_repo=YOUR_REPO"
```

## Trust policy concept

GitHub’s OIDC issuer is `https://token.actions.githubusercontent.com`. The role trust requires:

- `aud` = `sts.amazonaws.com`
- `sub` like `repo:ORG/REPO:environment:prod-demo` (prod role) or `environment:staging` (staging role)

A workflow on `main` without that environment **cannot** assume the prod role.

## GitHub binding

| GitHub Environment | Secret `AWS_ROLE_ARN` | Other secrets |
| --- | --- | --- |
| `prod-demo` | `terraform/oidc` output `prod_role_arn` | `ECR_REPOSITORY`, `ECS_CLUSTER`, `ECS_SERVICE` for prod-demo |
| `staging` | `staging_role_arn` | cluster/service for a **second** stack (`environment=staging`) or omit staging |

Required workflow permission: `id-token: write`.

## Deploy permissions (role policy)

- ECR auth + push/pull
- ECS describe/register/update
- `iam:PassRole` on `${name_prefix}-*` task/exec roles

No `ec2:*` or `rds:*` on the GitHub role. Infrastructure changes stay on the owner’s Terraform apply, not on every tag push.

## Staging vs prod

Two IAM roles, two GitHub environments, optionally two ECS services (second Terraform workspace with `-var="environment=staging"` and a different CIDR). Until a second stack exists, leave the staging workflow unused.
