# Recovery Runbooks Index

| Scenario | Runbook Code | RTO |
|----------|--------------|-----|
| Database Failure | RB_SCN_DATABASE | 60 min |
| Application Failure | RB_SCN_APPLICATION | 45 min |
| Server Failure | RB_SCN_SERVER | 60 min |
| Load Balancer Failure | RB_SCN_LB | 30 min |
| Redis Failure | RB_SCN_REDIS | 30 min |
| Storage Failure | RB_SCN_STORAGE | 90 min |
| AI Service Failure | RB_SCN_AI | 45 min |
| Notification Provider Failure | RB_SCN_NOTIFICATION | 30 min |
| Region Failure | RB_SCN_REGION | 240 min |
| Cloud Provider Failure | RB_SCN_CLOUD | 240 min |
| Security Incident | RB_SCN_SECURITY | 180 min |
| Credential Leak | RB_SCN_CREDENTIAL | 120 min |
| Ransomware Attack | RB_SCN_RANSOMWARE | 120 min |
| Accidental Data Deletion | RB_SCN_DELETE | 30 min |
| Failed Production Deployment | RB_SCN_DEPLOY_FAIL | 45 min |

## Standard Runbook Steps

1. Declare incident and notify escalation matrix
2. Assess scope and impact
3. Isolate affected systems
4. Execute recovery procedure
5. Validate data integrity and RPO/RTO
6. Resume operations
7. Post-incident review

## Emergency Contacts

| Role | Contact |
|------|---------|
| DevOps On-Call | devops@kuberfinserve.com |
| SRE Lead | sre@kuberfinserve.com |
| CTO | cto@kuberfinserve.com |
| Compliance | compliance@kuberfinserve.com |

## Escalation Matrix

| Level | Role | Response Time |
|-------|------|---------------|
| 1 | DevOps On-Call | 15 min |
| 2 | SRE Lead | 30 min |
| 3 | CTO | 60 min |
| 4 | CEO / Compliance | 120 min |

## CRM Access

Admin → **Disaster Recovery** (`/dr`) — runbooks, drills, failover, reports
