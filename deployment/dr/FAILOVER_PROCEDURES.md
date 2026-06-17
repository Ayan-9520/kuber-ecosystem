# Failover Procedures

## Primary / Standby

| Environment | Region | Role |
|-------------|--------|------|
| Primary | ap-south-1 | Production traffic |
| Standby | ap-south-2 | Warm standby |

## Failover Process

1. Confirm primary region unhealthy (3+ health check failures)
2. Declare failover incident (Level 2+ escalation)
3. Promote read replica (database) if needed
4. Update DNS / ALB target group to standby
5. Validate `/health/ready` and `/deep-health`
6. Notify stakeholders

## Failback Process

1. Confirm primary region restored and stable (30 min observation)
2. Sync data from standby to primary (if split-brain occurred, use PITR)
3. Switch traffic back to primary during maintenance window
4. Demote standby to read-only replica
5. Document failback in recovery audit log

## Traffic Switching Methods

- **DNS Failover:** Cloudflare / Route53 health checks
- **ALB:** Target group swap
- **Blue-Green:** PM2 environment switch via `deploy-backend.sh`

## API

```bash
POST /api/v1/dr/failover
{ "failoverType": "BLUE_GREEN", "primaryEnv": "production-ap-south-1", "standbyEnv": "standby-ap-south-2" }
```
