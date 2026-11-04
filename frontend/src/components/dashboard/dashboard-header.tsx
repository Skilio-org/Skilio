import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type WorkspacePageHeaderProps = {
	eyebrow: string
	title: ReactNode
	description: ReactNode
	meta?: ReactNode
	action?: ReactNode
	className?: string
}

export function WorkspacePageHeader({
	eyebrow,
	title,
	description,
	meta,
	action,
	className,
}: WorkspacePageHeaderProps) {
	return (
		<header
			className={cn(
				"flex flex-col gap-4 border-outline-variant border-b py-3 pb-8 md:flex-row md:items-end md:justify-between",
				className,
			)}
		>
			<div className="flex max-w-2xl flex-col gap-4">
				<div className="flex flex-wrap items-center gap-2 font-caption text-caption">
					<span className="font-semibold text-on-surface-variant uppercase tracking-wider">{eyebrow}</span>

					{meta && (
						<>
							<span className="size-1 rounded-full bg-outline-variant" />
							{meta}
						</>
					)}
				</div>

				<h1 className="font-headline-xl font-semibold text-headline-xl text-on-surface tracking-tight">{title}</h1>

				<p className="font-body-md text-body-md text-on-surface-variant">{description}</p>
			</div>

			{action && <div className="flex shrink-0 flex-wrap items-center gap-2.5 self-start md:self-auto">{action}</div>}
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
		"inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",

	secondaryAction:
		"inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 font-label-md text-label-md font-medium text-on-surface transition-colors hover:border-outline hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",

	destructiveAction:
		"inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-destructive px-4 font-label-md text-label-md font-medium text-white transition-colors hover:bg-destructive/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50",

	iconButton:
		"grid size-8 shrink-0 place-items-center rounded-lg border border-outline-variant bg-surface-container-lowest text-outline transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",

	inputShell:
		"flex h-9 items-center rounded-lg border border-outline-variant bg-surface-container-lowest px-3 font-body-sm text-body-sm text-on-surface transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",

	select:
		"h-9 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 font-label-md text-label-md font-medium text-on-surface outline-none transition-colors hover:border-outline focus:border-primary focus:ring-1 focus:ring-primary",
} as const
