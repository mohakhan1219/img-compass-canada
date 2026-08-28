# Local preview (Cloud Agent)

## What we observed

From inside the VM, `http://127.0.0.1:43210/` and `/api/health` often returned **200** while the Cloud **Preview** card still looked dead.

That is not a random Next crash:

1. **Process exits** — happened when we killed and swapped `next dev` / `next start` / standalone. The app does not OOM-kill itself (no OOM in dmesg).
2. **Port 43210** — not stolen by another app. The other Next app stays on **43180**.
3. **`next start` + `output: "standalone"`** — Next itself warns this combination is unsupported. Do not use it for preview.
4. **Cloud preview iframe + Next 16 `blockCrossSiteDEV`** — HTML `/` is allowed, but `/_next/*` (JS/CSS/HMR) returns **403 Unauthorized** when the browser sends `Origin: null` (sandboxed iframe) or an origin that is not in `allowedDevOrigins`. Curl without those headers still gets 200, so the process looks “healthy” while the iframe cannot load assets.

## Supported command (only this)

```bash
npm run dev
```

`package.json` → `node scripts/dev.mjs`:

- Listens on `0.0.0.0:43210` (preview URL)
- Runs `next dev` on `127.0.0.1:43211`
- Forwards HTTP and websockets after stripping `Origin` / `Referer` / `Sec-Fetch-*` so the iframe can load `/_next` resources

Do not run `next start` or `node .next/standalone/server.js` for this Cloud Preview.

## Production and staging — never this proxy

`scripts/dev.mjs` exists only so local development and Cloud Preview can load `/_next` behind a sandboxed iframe. It strips `Origin`, `Referer`, and `Sec-Fetch-*`. That is **not** an application security control and **must not** run in staging or production.

- Production/staging HTTP path: ALB → ECS Fargate → image `CMD` (`node db/migrate.mjs && node server.js`).
- The Docker image excludes `scripts/dev.mjs` (`.dockerignore`).
- The proxy exits immediately if `NODE_ENV=production`.
- Terraform does not override the container command to `npm run dev`.

Keep **`npm run dev` as the only documented local command**. Docker Compose and ECS use the standalone server, not this proxy.
