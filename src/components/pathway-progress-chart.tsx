import Link from "next/link";
import type { PathwayProgressPoint } from "@/domain/dashboard";

const TONE_FILL: Record<PathwayProgressPoint["tone"], string> = {
  complete: "#059669",
  current: "#0f766e",
  verify: "#d97706",
  blocked: "#dc2626",
  upcoming: "#94a3b8",
};

const SHORT: Record<string, string> = {
  Profile: "Profile",
  Credentials: "Creds",
  MCCQE: "MCCQE",
  NAC: "NAC",
  Language: "Lang",
  Provinces: "Prov",
  Programs: "Prog",
  CaRMS: "CaRMS",
  Applications: "Apps",
  Interviews: "Intvw",
  Ranking: "Rank",
  Match: "Match",
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
  const height = 168;
  const padL = 32;
  const padR = 8;
  const padT = 10;
  const padB = 36;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const slot = innerW / points.length;
  const barW = Math.min(16, slot * 0.48);

  return (
    <div>
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Residency pathway progress</h2>
        <p className="text-sm text-[#0b1f33]">
          Overall pathway progress · <span className="font-semibold tabular-nums text-teal-800">{overallPercent}%</span>
          <span className="text-slate-500">
            {" "}
            · {completed} of {total} stages complete
          </span>
        </p>
      </header>

      <div className="hidden overflow-hidden rounded-xl bg-[#0b1f33]/[0.035] px-2 pt-2 md:block">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[10.5rem] w-full" role="img" aria-label="Residency pathway progress by stage">
          {[0, 50, 100].map((tick) => {
            const y = padT + innerH - (tick / 100) * innerH;
            return (
              <g key={tick}>
                <line x1={padL} x2={width - padR} y1={y} y2={y} stroke="#d6cfc4" strokeWidth="1" />
                <text x={padL - 6} y={y + 3} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="ui-sans-serif, system-ui">
                  {tick}
                </text>
              </g>
            );
          })}
          {points.map((point, i) => {
            const cx = padL + slot * i + slot / 2;
            const x = cx - barW / 2;
            const percent = point.percent;
            const has = percent !== null;
            const trackTop = padT;
            const trackH = innerH;
            const fillH = has ? Math.max((percent / 100) * innerH, percent === 0 ? 2 : 0) : 0;
            const fillY = padT + innerH - fillH;
            return (
              <g key={point.id}>
                <rect x={x} y={trackTop} width={barW} height={trackH} rx="4" fill="#fff" stroke="#e4ddd2" strokeWidth="1" />
                {has && percent > 0 ? (
                  <rect x={x} y={fillY} width={barW} height={fillH} rx="4" fill={TONE_FILL[point.tone]}>
                    <title>{`${point.label}: ${percent}% · ${point.basis}`}</title>
                  </rect>
                ) : has ? (
                  <rect x={x} y={padT + innerH - 3} width={barW} height={3} rx="1.5" fill={TONE_FILL[point.tone]}>
                    <title>{`${point.label}: 0% · ${point.basis}`}</title>
                  </rect>
                ) : (
                  <circle cx={cx} cy={padT + innerH - 9} r="4" fill={TONE_FILL[point.tone]}>
                    <title>{`${point.label}: ${point.statusLabel} · ${point.basis}`}</title>
                  </circle>
                )}
                <text
                  x={cx}
                  y={padT + innerH + 14}
                  textAnchor="middle"
                  fill="#334155"
                  fontSize="9"
                  fontFamily="ui-sans-serif, system-ui"
                >
                  {SHORT[point.label] ?? point.label}
                </text>
                <text x={cx} y={padT + innerH + 26} textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="ui-sans-serif, system-ui">
                  {has ? `${percent}%` : "—"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 md:hidden">
        {points.map((point) => (
          <li key={point.id}>
            <Link href={point.href} className="block" title={point.basis}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-[#0b1f33]">{point.label}</span>
                <span className="shrink-0 text-xs tabular-nums text-slate-500">
                  {point.percent === null ? point.statusLabel : `${point.percent}%`}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#e4ddd2]">
                {point.percent === null ? (
                  <div className="flex h-full items-center px-1">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: TONE_FILL[point.tone] }} />
                  </div>
                ) : (
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(point.percent, point.percent === 0 ? 2 : point.percent)}%`, background: TONE_FILL[point.tone] }}
                  />
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
        Bars = countable completion. Markers = status only. Stage completion only — not an exam, residency, or Match
        prediction.
      </p>
    </div>
  );
}
