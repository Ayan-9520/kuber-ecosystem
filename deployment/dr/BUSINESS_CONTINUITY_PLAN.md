# Business Continuity Plan — KuberOne

## Objectives

Ensure Kuber Finserve can continue loan origination, partner operations, and customer service during major disruptions.

## Critical Business Functions

| Function | Max Tolerable Downtime | Owner |
|----------|------------------------|-------|
| Customer loan applications | 60 min | Operations Head |
| DSA partner lead capture | 60 min | Sales Head |
| Payment/disbursement processing | 30 min | Finance Head |
| Regulatory reporting | 24 hours | Compliance |

## Recovery Priorities

1. Database and authentication
2. API and mobile apps
3. Document storage and KYC
4. Notifications
5. AI services (degraded mode acceptable)
6. Analytics and reporting

## Communication Plan

- Internal: Slack #incident-response, email to leadership
- External: Status page, customer SMS for extended outages
- Regulatory: Compliance Officer within 4 hours for data breaches

## Plan Review

- Quarterly review with CTO, Compliance, DevOps
- Update after every DR drill or major incident
