# KuberOne

AI-powered financial services ecosystem by Kuber Finserve.

## One-command setup

Prerequisites: [Docker Desktop](https://www.docker.com/products/docker-desktop/) — set **Memory to 6 GB+** (Settings → Resources).

**Folder:** `E:\Projects\kuberapp`

```powershell
cd E:\Projects\kuberapp
docker compose up -d --build
```

Or double-click: `start.cmd`

No manual frontend/backend start — everything runs in Docker.

| Service | URL |
|---------|-----|
| Nginx gateway | http://localhost:8080 |
| Backend API | http://localhost:4000/health/live |
| Admin CRM | http://localhost:5173 |
| Public profiles | http://localhost:5174 |
| Customer app (web) | http://localhost:8081/login |
| DSA app (web) | http://localhost:8082/login |

Docker serves **built Expo web apps** on :8081 and :8082. **No pnpm needed** — double-click `start.cmd` or `start-apps.cmd`.

| MySQL | `localhost:3307` → `kuberone_dev` |
| Redis | `localhost:6380` |

Default seed logins:
- Admin: `admin@kuberone.com` / `Admin@123`
- Customer OTP: `9876543210` / `123456`
- DSA OTP: `8888777766` / `123456`

## Everyday commands

```bash
docker compose up -d --build
docker compose down
docker compose logs -f
docker compose ps
```

On Windows, if parallel builds crash Docker Desktop: `pnpm docker:up:safe`

### Docker Desktop not starting?

1. Quit Docker Desktop completely (system tray → Quit)
2. Run in PowerShell: `wsl --shutdown`
3. Open Docker Desktop again — wait until **Engine running**
4. Settings → Resources → Memory: set **8 GB+**
5. Then: `docker compose up -d --build` or `pnpm docker:up:safe`

## Project layout (Docker)

```
.
├── docker-compose.yml
├── .env.docker              # committed defaults (no copy needed)
├── .env.example               # optional local overrides
└── docker/
    ├── backend/Dockerfile
    ├── admin/Dockerfile
    ├── web-public/Dockerfile
    ├── mobile-customer/Dockerfile
    ├── mobile-dsa/Dockerfile
    └── nginx/Dockerfile
```

Host development: `pnpm db:docker` → `docker compose up -d mysql redis`

Staging/production: `deployment/docker/`
