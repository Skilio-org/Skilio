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
				"workspace-page-header flex flex-col justify-between gap-5 border-border border-b pb-7 sm:flex-row sm:items-end",
				className,
			)}
		>
			<div className="max-w-2xl">
				<p className="font-medium text-muted-foreground text-xs">{eyebrow}</p>
				<h1 className="mt-3 font-display font-medium text-3xl text-foreground tracking-[-0.04em] sm:text-[2.5rem]">
					{title}
				</h1>
				<p className="mt-3 text-muted-foreground text-sm leading-6">{description}</p>
			</div>
			{action && <div className="shrink-0 self-start sm:self-auto">{action}</div>}
		</header>
	)
}

export function WorkspaceSurface({ className, children, ...props }: React.ComponentProps<"section">) {
	return (
		<section className={cn("workspace-panel rounded-xl border border-border bg-card", className)} {...props}>
			{children}
		</section>
	)
}

export function Monogram({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<span className={cn("grid shrink-0 place-items-center rounded-xl font-display font-semibold", className)}>
			{children}
		</span>
	)
}

export function SkillTag({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<span
			className={cn(
				"inline-flex min-h-7 items-center rounded-md bg-muted px-3 font-medium text-muted-foreground text-xs",
				className,
			)}
		>
			{children}
		</span>
	)
}

export const workspaceStyles = {
	primaryAction:
		"inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-700 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
	secondaryAction:
		"inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
	iconButton:
		"grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
	inputShell:
		"flex min-h-12 items-center rounded-xl border border-input bg-background px-4 transition-shadow focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-100",
	select:
		"min-h-11 rounded-xl border border-input bg-card px-4 text-sm font-medium text-foreground outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100",
} as const
