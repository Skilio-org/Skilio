import type { ReactNode } from "react";

export const jobFormField =
  "border-input bg-card mt-2 min-h-12 w-full rounded-xl border px-3.5 py-3 text-base transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 sm:text-sm";

export function JobFormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="bg-primary/8 text-primary grid size-8 shrink-0 place-items-center rounded-lg text-xs font-semibold">
          {number}
        </span>
        <div>
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          <p className="text-muted-foreground mt-1 text-sm leading-5">{description}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
