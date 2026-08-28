import { cn } from "@/lib/utils";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-slate-200/80", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400 transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function RingStat({
  value,
  label,
  hint,
}: {
  value: number | null;
  label: string;
  hint?: string;
}) {
  const pct = value === null ? 0 : Math.max(0, Math.min(100, value));
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 96 96" className="h-24 w-24 -rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="#0f766e"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={value === null ? c : offset}
        />
      </svg>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-3xl font-semibold tabular-nums text-[#0b1f33]">
          {value === null ? "—" : value}
          {value === null ? "" : <span className="text-lg text-slate-400">/100</span>}
        </p>
        {hint ? <p className="mt-1 text-sm text-slate-600">{hint}</p> : null}
      </div>
    </div>
  );
}
