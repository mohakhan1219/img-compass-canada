# Runbook: rollback

1. Open Actions **Rollback prod-demo**.
2. Pass the previous ECS task definition ARN (from the last successful deploy log).
3. Wait until the service is stable.
4. Confirm `/api/health` and `/api/ready`.
5. If the bad release included a destructive migration (V1 has none beyond `create table if not exists`), restore RDS from snapshot first (see backup/restore).
