import { cn } from "@/lib/utils";

export function DemoChip({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500",
        className,
      )}
    >
      Demo data
    </span>
  );
}
