# Business Workflows

## Lead Workflow

`NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → CONVERTED | LOST`

APIs: `/leads`, `/lead-notes`, `/lead-activities`, `/lead-scoring/calculate/:id`

## Application Workflow

`DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → SANCTIONED → DISBURSED | REJECTED`

APIs: `/applications`, `/application-timeline`, `/sanctions`, `/disbursements`

## Document Workflow

`UPLOADED → PENDING_VERIFICATION → VERIFIED | REJECTED`

APIs: `/documents`, `POST /documents/:id/verify`, `/ocr-results`

## Commission Workflow

`ACCRUED → PENDING_APPROVAL → APPROVED → PAID`

APIs: `/commission-ledger`, `/commission-approvals`, `/commission-payments`
