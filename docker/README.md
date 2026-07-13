# KuberOne Docker



## One command (repository root)



```bash

docker compose up -d --build

```



Defaults load from committed `.env.docker` — no manual setup, no separate frontend/backend start.



```bash

docker compose down

docker compose logs -f

docker compose ps

```



## Windows (Docker Desktop OOM during parallel builds)



```bash

pnpm docker:up:safe

```



## Infra only (host development)



```bash

docker compose up -d mysql redis

pnpm db:setup

pnpm dev:backend

```



## Integration tests



```bash

pnpm integration:up

```



## Layout



```

docker/

├── backend/Dockerfile + entrypoint.sh

├── admin/Dockerfile + nginx.conf

├── web-public/Dockerfile + nginx.conf

├── mobile-customer/Dockerfile + nginx.conf

├── mobile-dsa/Dockerfile + nginx.conf

└── nginx/Dockerfile + nginx.conf

```



Staging/production compose: `deployment/docker/`

