# RECOVERY.UZ — Deploy Guide

Single source of truth: same `server.js` and `init.sql` run locally and in production.
The only difference is environment variables.

---

## Local development

```bash
# 1. Start local Postgres in Docker
npm run db:up

# 2. Seed test users + catalog (idempotent)
npm run db:seed

# 3. Run backend + frontend
npm run server      # → http://localhost:3004
npm run dev         # → http://localhost:5173
```

Test credentials (all created by seed):

| Role     | Login               | Password    |
|----------|---------------------|-------------|
| admin    | admin@hdd-fixer.uz  | admin123    |
| operator | operator@test.uz    | operator123 |
| master   | master1@test.uz     | master123   |
| client   | client@test.uz      | client123   |

Useful commands:

```bash
npm run db:psql     # open psql shell
npm run db:logs     # tail postgres logs
npm run db:down     # stop the local db (data persisted in volume)
```

---

## Production deploy (server: 172.16.252.32)

### One-time setup

On the server:

```bash
cd /home/yoyo/RECOVERY_UZ
cp .env.example .env
$EDITOR .env       # set DB_PASSWORD, JWT_SECRET, TELEGRAM_*

# Build and start the whole stack
docker compose up -d --build

# Seed test data (only first time)
docker compose exec backend node backend/seed.js
```

The stack contains:

- `postgres` — Postgres 16 with `init.sql` auto-applied on first boot
- `backend`  — node `server.js` (same file as local) on port 3004 inside the network
- `frontend` — nginx serving the Vite build, proxying `/v1` → `backend:3004`

Frontend listens on host port 80. Behind your existing nginx (TLS termination,
hddfix.uz) just proxy to `127.0.0.1:80`.

### Update workflow

```bash
cd /home/yoyo/RECOVERY_UZ
git pull
docker compose up -d --build       # rebuilds backend & frontend, restarts postgres only if image changed
```

The frontend build picks up `.env.production` automatically (`VITE_API_URL=/v1`),
so it always talks to the same origin, eliminating cache/CORS surprises.

### Diagnostics

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose exec postgres psql -U recovery_admin -d recovery_uz -c '\dt'
curl -s http://localhost/v1/health
```

---

## Sanity check: local vs prod parity

The point of this setup is identical behaviour. To confirm:

1. Locally: `npm run db:up && npm run db:seed && npm run server` → `curl http://localhost:3004/v1/health`
2. On server: `docker compose up -d --build` → `curl http://localhost/v1/health`

Both should return `{"status":"ok","db":"connected"}`. Login with the same
credentials returns identical JSON shape, so the frontend behaves the same.
