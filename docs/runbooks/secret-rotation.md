# Runbook: secret rotation

1. Generate a new RDS master password in the console **or** `aws rds modify-db-instance --master-user-password`.
2. Update Secrets Manager secrets `img-compass/{env}/database` and `.../database-url`.
3. Force a new ECS deployment so tasks pick up the secret (`--force-new-deployment`).
4. Confirm `/api/ready`.
5. Do not put the password in git, tickets, or `NEXT_PUBLIC_*` variables.
