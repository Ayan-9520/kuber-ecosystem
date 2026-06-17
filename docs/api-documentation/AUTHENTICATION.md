# Authentication

## JWT Bearer

Protected endpoints require:

```
Authorization: Bearer <accessToken>
```

## Employee Login

`POST /api/v1/auth/login`

```json
{
  "loginType": "employee",
  "email": "admin@kuberone.com",
  "password": "Admin@123"
}
```

## Refresh Token

`POST /api/v1/auth/refresh` with `{ "refreshToken": "..." }`. Tokens rotate on each refresh.

## OTP (Mobile)

1. `POST /auth/send-otp` — `{ "phone": "9876543210", "purpose": "LOGIN" }`
2. `POST /auth/verify-otp` — `{ "phone": "9876543210", "otp": "123456", "purpose": "LOGIN" }`

Development OTP is always `123456` when `APP_ENV=development`.

## Logout

`POST /api/v1/auth/logout` with valid bearer token.
