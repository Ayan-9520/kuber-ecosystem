# Error Catalog

All errors use the envelope:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": []
  }
}
```

| Code | HTTP | Recovery |
|------|------|----------|
| BAD_REQUEST | 400 | Fix request payload or query params |
| UNAUTHORIZED | 401 | Refresh token or re-login |
| FORBIDDEN | 403 | Check RBAC permissions and data scope |
| NOT_FOUND | 404 | Verify resource ID and scope |
| CONFLICT | 409 | Re-fetch resource, retry with latest state |
| VALIDATION_ERROR | 422 | Fix fields in `error.details` |
| RATE_LIMITED | 429 | Wait for `Retry-After`, backoff |
| INTERNAL_ERROR | 500 | Retry with idempotency; contact support with request ID |
