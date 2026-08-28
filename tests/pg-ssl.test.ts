import { describe, expect, it } from "vitest";
import { pgClientConfig } from "../src/server/pg-ssl";

describe("pgClientConfig", () => {
  it("disables TLS for local Compose hosts", () => {
    const cfg = pgClientConfig("postgresql://compass:compass@db:5432/compass?sslmode=require");
    expect(cfg.ssl).toBe(false);
    expect(cfg.tlsVerified).toBe(false);
  });

  it("strips sslmode and verifies with the RDS CA bundle for remote hosts", () => {
    const cfg = pgClientConfig(
      "postgresql://u:p@img-compass-prod-demo.xxxx.rds.amazonaws.com:5432/compass?sslmode=require",
    );
    expect(cfg.connectionString).not.toContain("sslmode");
    expect(cfg.tlsVerified).toBe(true);
    expect(cfg.ssl).not.toBe(false);
    if (cfg.ssl) {
      expect(cfg.ssl.rejectUnauthorized).toBe(true);
      expect(cfg.ssl.ca).toContain("BEGIN CERTIFICATE");
    }
  });

  it("honours sslmode=disable", () => {
    const cfg = pgClientConfig("postgresql://u:p@example.com:5432/db?sslmode=disable");
    expect(cfg.ssl).toBe(false);
    expect(cfg.tlsVerified).toBe(false);
  });
});
