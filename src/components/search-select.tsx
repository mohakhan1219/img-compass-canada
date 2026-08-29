"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export function SearchSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Search…",
  allowEmpty = true,
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  allowEmpty?: boolean;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return options.slice(0, 80);
    return options.filter((o) => o.label.toLowerCase().includes(t) || o.value.toLowerCase().includes(t)).slice(0, 80);
  }, [options, q]);

  return (
    <div>
      {label ? (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        value={q || options.find((o) => o.value === value)?.label || ""}
        onChange={(e) => {
          setQ(e.target.value);
          const exact = options.find((o) => o.label.toLowerCase() === e.target.value.toLowerCase());
          if (exact) onChange(exact.value);
        }}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-[#d6cfc4] bg-white px-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
      />
      <select
        className={cn("mt-2 h-10 w-full rounded-lg border border-[#d6cfc4] bg-white px-3 text-sm")}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setQ("");
        }}
      >
        {allowEmpty ? <option value="">Select…</option> : null}
        {filtered.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export const SELECT = "h-10 w-full rounded-lg border border-[#d6cfc4] bg-white px-3 text-sm";
