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
				"workspace-page-header flex flex-col justify-between gap-4 border-outline-variant border-b pb-8 md:flex-row md:items-end",
				className,
			)}
		>
			<div className="flex max-w-2xl flex-col gap-1.5">
				<p className="font-caption font-semibold text-caption text-on-surface-variant uppercase tracking-wider">
					{eyebrow}
				</p>

				<h1 className="font-headline-xl font-semibold text-headline-xl text-on-surface tracking-tight">{title}</h1>

				<p className="font-body-md text-body-md text-on-surface-variant">{description}</p>
			</div>

			{action && <div className="shrink-0 self-start md:self-auto">{action}</div>}
		</header>
	)
}

export function WorkspaceSurface({ className, children, ...props }: React.ComponentProps<"section">) {
	return (
		<section
			className={cn("workspace-panel rounded-lg border border-outline-variant bg-surface-container-lowest", className)}
			{...props}
		>
			{children}
		</section>
	)
}

export function Monogram({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<span
			className={cn(
				"grid shrink-0 place-items-center rounded bg-primary font-label-sm font-semibold text-on-primary",
				className,
			)}
		>
			{children}
		</span>
	)
}

export function SkillTag({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<span
			className={cn(
				"inline-flex min-h-5 items-center rounded bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-secondary-fixed-variant",
				className,
			)}
		>
			{children}
		</span>
	)
}

export const workspaceStyles = {
	primaryAction:
		"inline-flex h-9 items-center justify-center gap-2 rounded bg-primary px-4 font-label-md text-label-md font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",

	secondaryAction:
		"inline-flex h-9 items-center justify-center gap-2 rounded border border-outline-variant bg-surface-container-lowest px-3.5 font-label-md text-label-md font-medium text-on-surface transition-colors hover:border-outline hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",

	iconButton:
		"grid size-8 shrink-0 place-items-center rounded border border-outline-variant bg-surface-container-lowest text-outline transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",

	inputShell:
		"flex h-9 items-center rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-sm text-body-sm text-on-surface transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",

	select:
		"h-9 rounded border border-outline-variant bg-surface-container-lowest px-3 font-label-md text-label-md font-medium text-on-surface outline-none transition-colors hover:border-outline focus:border-primary focus:ring-1 focus:ring-primary",
} as const
