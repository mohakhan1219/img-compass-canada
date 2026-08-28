# Docker smoke test (Windows)

This agent environment **does not have Docker**. Do not treat the image as validated until you run the steps below on a machine with Docker Desktop.

Use PowerShell. Install [Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/) and wait until `docker info` succeeds.

## 1. Build and run with Postgres (remote persistence)

From the `img-compass-canada` folder (the nested app repo, not any other project):

```powershell
docker compose up --build
```

Compose sets `NEXT_PUBLIC_PERSISTENCE=remote`, `NODE_ENV=production`, and `DATABASE_URL` to the Compose Postgres service. Image `CMD` is `node db/migrate.mjs && node server.js` — **not** `npm run dev`.

App: http://127.0.0.1:43210

## 2. Probes (another PowerShell window)

```powershell
curl.exe -sS http://127.0.0.1:43210/api/health
# expect: {"status":"ok","service":"img-compass-canada"}

curl.exe -sS -D - http://127.0.0.1:43210/api/ready
# expect HTTP 200 and "persistence":"postgres"

curl.exe -sS http://127.0.0.1:43210/api/metrics
# expect JSON metrics
```

Confirm the response includes `x-request-id`. Confirm logs:

```powershell
docker compose logs --no-color app
# expect JSON lines with "requestId" and "msg":"health" / "ready_postgres"
```

Confirm the preview proxy is absent:

```powershell
docker compose exec app ls scripts/dev.mjs
# expect: No such file or directory
```

Confirm `DATABASE_URL` is not in HTML:

```powershell
curl.exe -sS http://127.0.0.1:43210/ | findstr DATABASE_URL
# expect: no match
```

Optional BFF round-trip:

```powershell
curl.exe -sS -c cookies.txt -b cookies.txt -X POST http://127.0.0.1:43210/api/auth/demo
curl.exe -sS -c cookies.txt -b cookies.txt http://127.0.0.1:43210/api/state
```

## 3. Ready must fail when Postgres is broken

```powershell
docker compose stop db
curl.exe -sS -D - http://127.0.0.1:43210/api/ready
# expect HTTP 503 and "ready":false
docker compose start db
```

Wait a few seconds after `start db`, then ready should return 200 again.

## 4. Image history / secrets

```powershell
docker compose images
docker image history img-compass-canada-app
docker compose config
```

`DATABASE_URL` in Compose is a **local demo password** (`compass` / `compass`). That is acceptable on your laptop. It must **not** be an RDS production secret. Image history should not show AWS keys. Runtime logs should not print `DATABASE_URL`.

## 5. Tear down

```powershell
docker compose down
```

Record PASS only if every probe above matches. Until then, Docker remains **NOT TESTED** for the public-release gate.
