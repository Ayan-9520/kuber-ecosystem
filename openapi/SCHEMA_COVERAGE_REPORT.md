# Schema Coverage Report

Generated: 2026-06-13T10:09:17.977Z

## Domain Schemas (24 total)
- ApiSuccessResponse
- ApiPaginatedResponse
- PaginationMeta
- ApiErrorResponse
- User
- Customer
- Partner
- Lead
- Application
- Document
- Referral
- Commission
- Notification
- Ticket
- Campaign
- KnowledgeArticle
- AiRequest
- AnalyticsResponse
- AuditEvent
- AuthTokens
- LoginRequest
- OtpSendRequest
- OtpVerifyRequest
- RefreshRequest

## Auth Flow Schemas
- OtpSendRequest, OtpVerifyRequest, LoginRequest, RefreshRequest, AuthTokens

## Pagination
- Page, Limit, SortBy, SortOrder, Search parameters
- PaginationMeta, ApiPaginatedResponse

## Error Model
- ApiErrorResponse with standard codes: BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, VALIDATION_ERROR, RATE_LIMITED, INTERNAL_ERROR

## Audit
- AuditEvent schema with integrityHash

## Coverage Gap
Request/response bodies for most endpoints use generic `object` — enrich from `@kuberone/shared-validation` Zod schemas in future passes.
