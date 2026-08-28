export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#0b1f33]">{title}</h1>
        {description ? <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
