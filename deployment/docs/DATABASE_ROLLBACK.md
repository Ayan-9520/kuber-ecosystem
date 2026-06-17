# Database Rollback Guidance — KuberOne

## Pre-deploy (required)

1. Trigger backup job: `POST /api/v1/backups` with scope `DATABASE`
2. Verify backup integrity: `POST /api/v1/backups/executions/{id}/verify`
3. Run migration gate: `node scripts/prisma-migration-gate.mjs`

## Rollback procedure

1. **Stop application workers** to prevent writes during restore
2. **Restore database** from latest verified backup via Restore Center (`/backup`)
3. **Checkout application code** to matching release tag
4. **Do not run** `prisma migrate deploy` if rolling back schema — code and DB must match
5. **Restart services** via PM2 or container orchestrator
6. **Record rollback** via DevOps API: `POST /api/v1/devops/rollbacks`

## Migration safety

- Destructive migrations (`DROP TABLE`, `DROP COLUMN`, `TRUNCATE`) are blocked in CI unless `ALLOW_DESTRUCTIVE_MIGRATIONS=true`
- Always test migrations on staging before production
- Keep forward-only migrations in production; use compensating migrations instead of down migrations

## Environment variables

| Secret | Purpose |
|--------|---------|
| `DATABASE_URL` | Primary MySQL connection |
| `DEVOPS_WEBHOOK_SECRET` | CI pipeline webhook auth |
| `AWS_S3_BACKUP_BUCKET` | Backup storage for point-in-time restore |
