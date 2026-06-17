# Postman Guide

## Download

- In-app: Developer Portal → Postman Guide
- Direct: `/postman/KuberOne.postman_collection.json`

## Environment Variables

| Variable | Example |
|----------|---------|
| baseUrl | `http://localhost:4000/api/v1` |
| accessToken | (from login response) |
| refreshToken | (from login response) |

## Workflow

1. Import collection
2. Create environment with variables above
3. Run **Auth → Login** request
4. Use collection folders by module
