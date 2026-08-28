export type PersistenceMode = "local" | "remote";

export function clientPersistenceMode(): PersistenceMode {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_PERSISTENCE === "remote") {
    return "remote";
  }
  return "local";
}

export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

export function isPostgresConfigured(): boolean {
  return Boolean(databaseUrl());
}
