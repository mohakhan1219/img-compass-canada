import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(__dirname),
  // Cloud Agent preview loads the app from a proxied origin, not localhost.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "0.0.0.0",
    "172.30.0.2",
    "*.cursor.sh",
    "*.cursor.com",
    "*.cursorusercontent.com",
  ],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
