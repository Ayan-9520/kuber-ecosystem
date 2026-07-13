# Docker secrets directory

For local `docker compose up`, configure secrets in the **repository root** `.env` file (see `.env.example`).

This folder is reserved for file-based secrets if you later switch to Compose `secrets:` mounts in staging/production. Do not commit secret values.
