const counters = new Map<string, number>();

export function inc(name: string, n = 1) {
  counters.set(name, (counters.get(name) ?? 0) + n);
}

export function snapshotMetrics(): Record<string, number> {
  return Object.fromEntries(counters.entries());
}
