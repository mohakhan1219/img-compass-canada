#!/usr/bin/env node
/**
 * LOCAL DEVELOPMENT / Cloud Agent Preview ONLY.
 * Never use this process in staging, ECS, Docker production, or Terraform deploys.
 * Those must run `node server.js` (standalone) with Next's normal origin checks intact.
 */
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

if (process.env.NODE_ENV === "production") {
  console.error(
    "[compass-dev] Refusing to start the preview proxy because NODE_ENV=production. Use the standalone server (Dockerfile CMD / npm start after build).",
  );
  process.exit(1);
}

const PUBLIC_HOST = "0.0.0.0";
const PUBLIC_PORT = Number(process.env.PORT || 43210);
const INNER_PORT = Number(process.env.COMPASS_INNER_PORT || 43211);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function stripPreviewHeaders(headers) {
  const out = { ...headers };
  delete out.origin;
  delete out.Origin;
  delete out.referer;
  delete out.Referer;
  delete out["sec-fetch-site"];
  delete out["sec-fetch-mode"];
  delete out["sec-fetch-dest"];
  delete out["sec-fetch-user"];
  out.host = `127.0.0.1:${INNER_PORT}`;
  return out;
}

const child = spawn(
  process.execPath,
  [
    path.join(ROOT, "node_modules/next/dist/bin/next"),
    "dev",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(INNER_PORT),
  ],
  { cwd: ROOT, stdio: "inherit", env: process.env },
);

child.on("exit", (code, signal) => {
  console.error(`[compass-dev] next dev exited code=${code} signal=${signal}`);
  process.exit(code ?? 1);
});

const server = http.createServer((req, res) => {
  const upstream = http.request(
    {
      hostname: "127.0.0.1",
      port: INNER_PORT,
      path: req.url,
      method: req.method,
      headers: stripPreviewHeaders(req.headers),
    },
    (up) => {
      res.writeHead(up.statusCode ?? 502, up.headers);
      up.pipe(res);
    },
  );
  upstream.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(503, { "content-type": "text/plain" });
    }
    res.end("waiting for next dev");
  });
  req.pipe(upstream);
});

server.on("upgrade", (req, socket, head) => {
  const upstream = http.request({
    hostname: "127.0.0.1",
    port: INNER_PORT,
    path: req.url,
    method: req.method,
    headers: stripPreviewHeaders(req.headers),
  });
  upstream.on("upgrade", (upRes, upSocket, upHead) => {
    socket.write(
      "HTTP/1.1 101 Switching Protocols\r\n" +
        Object.entries(upRes.headers)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("\r\n") +
        "\r\n\r\n",
    );
    if (upHead.length) socket.write(upHead);
    if (head.length) upSocket.write(head);
    upSocket.pipe(socket);
    socket.pipe(upSocket);
  });
  upstream.on("error", () => socket.destroy());
  upstream.end();
});

server.listen(PUBLIC_PORT, PUBLIC_HOST, () => {
  console.log(
    `[compass-dev] preview http://${PUBLIC_HOST}:${PUBLIC_PORT} -> next dev 127.0.0.1:${INNER_PORT}`,
  );
});

function shutdown() {
  server.close();
  child.kill("SIGTERM");
  setTimeout(() => process.exit(0), 2000).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
