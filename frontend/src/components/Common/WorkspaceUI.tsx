import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function WorkspacePageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end",
        className,
      )}
    >
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-brand-700">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-[-0.035em] text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-base leading-7 text-muted-foreground">
          {description}
        </p>
      </div>
      {action && (
        <div className="shrink-0 self-start sm:self-auto">{action}</div>
      )}
    </header>
  )
}

export function WorkspaceSurface({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card shadow-card",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  )
}

export function Monogram({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display font-semibold",
        className,
      )}
    >
      {children}
    </span>
  )
}

export function SkillTag({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full bg-muted px-3 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  )
}

export const workspaceStyles = {
  primaryAction:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  secondaryAction:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  iconButton:
    "grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  inputShell:
    "flex min-h-12 items-center rounded-xl border border-input bg-background px-4 transition-shadow focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-100",
  select:
    "min-h-11 rounded-xl border border-input bg-card px-4 text-sm font-medium text-foreground outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100",
} as const
