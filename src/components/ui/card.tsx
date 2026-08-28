import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#e4ddd2] bg-[#fffcf8] p-5 shadow-[0_1px_2px_rgba(11,31,51,0.04),0_8px_24px_rgba(11,31,51,0.06)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-base font-semibold text-[#0b1f33]", className)} {...props} />;
}
