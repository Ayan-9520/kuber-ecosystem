# Backend Rollback Guide

## Triggers

- Health check failure post-deploy
- Critical error spike (error tracking)
- Failed migration
- Manual incident response

## Steps

1. **Halt traffic** — ALB drain or blue-green switch
2. **Execute rollback:**
   ```bash
   bash deployment/scripts/rollback.sh backend <previous-version>
   ```
3. **Or GitHub Actions:** `backend-production-rollback.yml`
4. **Validate:** `node scripts/production-deploy-validate.mjs`
5. **Record:** Webhook to `/api/v1/deployment/webhook` with `status: ROLLED_BACK`

## Database Rollback

See `deployment/docs/DATABASE_ROLLBACK.md` — additive migrations only in production.

## PM2 Rollback

```bash
pm2 reload kuberone-api --env production
pm2 reload kuberone-worker --env production
```
