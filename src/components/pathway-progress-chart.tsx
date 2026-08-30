import Link from "next/link";
import type { PathwayProgressPoint } from "@/domain/dashboard";

const TONE_FILL: Record<PathwayProgressPoint["tone"], string> = {
  complete: "#059669",
  current: "#0f766e",
  verify: "#d97706",
  blocked: "#dc2626",
  upcoming: "#cbd5e1",
};

export function PathwayProgressChart({
  points,
  overallPercent,
  completed,
  total,
}: {
  points: PathwayProgressPoint[];
  overallPercent: number;
  completed: number;
  total: number;
}) {
  const width = 720;
  const height = 280;
  const padL = 44;
  const padR = 8;
  const padT = 22;
  const padB = 72;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const gap = 8;
  const barW = (innerW - gap * (points.length - 1)) / points.length;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13.5rem]">
      <div className="min-w-0">
        <div className="hidden md:block">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Residency pathway progress by stage">
            <text
              x={padL - 32}
              y={padT + innerH / 2}
              className="fill-slate-400"
              fontSize="9"
              transform={`rotate(-90 ${padL - 32} ${padT + innerH / 2})`}
            >
              Completion (%)
            </text>
            {[0, 25, 50, 75, 100].map((tick) => {
              const y = padT + innerH - (tick / 100) * innerH;
              return (
                <g key={tick}>
                  <line x1={padL} x2={width - padR} y1={y} y2={y} stroke="#e4ddd2" strokeWidth="1" />
                  <text x={padL - 8} y={y + 4} textAnchor="end" className="fill-slate-400" fontSize="10">
                    {tick}
                  </text>
                </g>
              );
            })}
            {points.map((point, i) => {
              const x = padL + i * (barW + gap);
              const percent = point.percent;
              const has = percent !== null;
              const h = has ? (percent / 100) * innerH : 0;
              const y = padT + innerH - h;
              const cx = x + barW / 2;
              return (
                <g key={point.id}>
                  {has && percent > 0 ? (
                    <g>
                      <rect x={x} y={y} width={barW} height={Math.max(h, 3)} rx="4" fill={TONE_FILL[point.tone]}>
                        <title>{`${point.label}: ${percent}% · ${point.basis}`}</title>
                      </rect>
                      <text x={cx} y={y - 4} textAnchor="middle" className="fill-slate-600" fontSize="8">
                        {percent}%
                      </text>
                    </g>
                  ) : has ? (
                    <rect x={x} y={padT + innerH - 3} width={barW} height={3} rx="1.5" fill={TONE_FILL[point.tone]}>
                      <title>{`${point.label}: 0% · ${point.basis}`}</title>
                    </rect>
                  ) : (
                    <polygon
                      points={`${cx},${padT + innerH - 8} ${cx + 6},${padT + innerH} ${cx},${padT + innerH + 2} ${cx - 6},${padT + innerH}`}
                      fill={TONE_FILL[point.tone]}
                    >
                      <title>{`${point.label}: ${point.statusLabel} · ${point.basis}`}</title>
                    </polygon>
                  )}
                  <text
                    x={cx}
                    y={padT + innerH + 28}
                    textAnchor="end"
                    className="fill-slate-600"
                    fontSize="9"
                    transform={`rotate(-42 ${cx} ${padT + innerH + 14})`}
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="mt-1 text-[11px] text-slate-500">
            Bars are countable tracker completion. Diamonds are status only (no honest percentage).
          </p>
        </div>
        <ul className="space-y-2.5 md:hidden">
          {points.map((point) => (
            <li key={point.id}>
              <Link href={point.href} className="block">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-[#0b1f33]">{point.label}</span>
                  <span className="shrink-0 text-xs tabular-nums text-slate-500">
                    {point.percent === null ? point.statusLabel : `${point.percent}%`}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                  {point.percent === null ? (
                    <div className="flex h-full items-center px-0.5">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: TONE_FILL[point.tone] }} />
                    </div>
                  ) : (
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${point.percent}%`, background: TONE_FILL[point.tone] }}
                    />
                  )}
                </div>
                <p className="mt-1 text-[11px] leading-snug text-slate-500">{point.basis}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <aside className="flex flex-col justify-center rounded-2xl border border-[#e4ddd2] bg-[#fffcf8] px-5 py-5 text-center lg:text-left">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-800">Overall pathway progress</p>
        <p className="mt-2 text-4xl font-semibold tabular-nums text-[#0b1f33]">{overallPercent}%</p>
        <p className="mt-2 text-sm text-slate-600">
          {completed} of {total} pathway stages complete.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          This is stage completion, not an exam, residency, or Match prediction.
        </p>
      </aside>
    </div>
  );
}
