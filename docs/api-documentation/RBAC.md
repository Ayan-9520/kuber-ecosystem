# RBAC Guide

## Permission Format

`<resource>.<action>` — e.g. `leads.read`, `applications.write`, `audit.read`

## Data Scope (`x-data-scope`)

| Scope | Description |
|-------|-------------|
| SELF | Own records only |
| BRANCH | Branch-assigned records |
| REGION | Regional aggregation |
| ORGANIZATION | Full org access |
| N/A | Public or system endpoints |

## Roles

SUPER_ADMIN, ADMIN, BRANCH_MANAGER, RELATIONSHIP_MANAGER, OPERATIONS, PARTNER, CUSTOMER, DSA

ADMIN and SUPER_ADMIN bypass permission checks.

## API Access

Each OpenAPI operation documents required permissions in `x-permissions`.
