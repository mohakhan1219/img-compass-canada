# Runbook: backup and restore

- RDS `backup_retention_period = 7` (automated backups).
- Restore: create a new instance from snapshot, update `database-url` secret, deploy.
- `skip_final_snapshot = true` on this **prod-demo** stack to keep teardown cheap. Turn final snapshots **on** if the environment must survive account cleanup.
- Application JSON payloads are in `learner_state.payload`; restoring RDS restores learner documents.
