import type { ReactNode } from "react"

export const jobFormField =
	"border-outline-variant bg-surface-container-lowest mt-2 min-h-11 w-full rounded-lg border px-3.5 py-2.5 text-base transition-colors placeholder:text-muted-foreground hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 sm:text-sm"

export function JobFormSection({
	title,
	description,
	children,
}: {
	title: string
	description: string
	children: ReactNode
}) {
	return (
		<section className="space-y-5">
			{title && (
				<div className="flex items-start gap-3">
					<div>
						<h3 className="font-semibold text-base tracking-tight">{title}</h3>
						<p className="mt-1 text-muted-foreground text-sm leading-5">{description}</p>
					</div>
				</div>
			)}
			<div className="space-y-5">{children}</div>
		</section>
	)
}
