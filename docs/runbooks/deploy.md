# Runbook: deploy

1. CI on `main` must be green (lint, tests, build, Terraform validate, image build).
1b. Confirm the image still uses migrate + `server.js`, not `npm run dev` / `scripts/dev.mjs`.
2. `docker build` and push to ECR (`:{git sha}` and moving `prod-demo` tag as needed).
3. Staging: Actions **Deploy staging** with the image tag.
4. Prod-demo: push git tag `vX.Y.Z` (see CHANGELOG). Workflow builds, pushes, and runs `scripts/ecs-deploy.sh`.
5. Confirm `/api/health` and `/api/ready` on the ALB DNS (SSM `/img-compass/prod-demo/alb_dns`).
6. Record the previous task definition ARN printed by the deploy script for rollback.
