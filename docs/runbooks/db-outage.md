# Runbook: database outage

1. `/api/health` stays 200 (process is up). `/api/ready` returns 503 in Postgres mode.
2. ALB will take targets unhealthy if the container health check is `/api/health` only — liveness is intentionally shallow so a DB blip does not kill the task in a restart loop. Watch `/api/ready` and RDS CPU/connections in CloudWatch.
3. Check RDS status, subnet routing, and the ECS security group ingress on 5432.
4. If storage is exhausted, scale allocated storage (this demo uses 20 GB).
5. Application local mode (`NEXT_PUBLIC_PERSISTENCE=local`) does not use RDS and can still run for workshops.
