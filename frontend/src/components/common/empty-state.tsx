import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
	icon: LucideIcon
	title: string
	description: string
	action?: ReactNode
	className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
	return (
		<section
			className={cn(
				"grid min-h-72 place-items-center rounded-lg border border-outline-variant border-dashed bg-surface-container-lowest p-8 text-center",
				className,
			)}
		>
			<div>
				<span className="mx-auto grid size-14 place-items-center rounded-lg border border-outline-variant bg-surface-container text-link">
					<Icon className="size-6" strokeWidth={1.5} />
				</span>

				<h2 className="mt-5 font-headline-lg font-semibold text-headline-lg text-on-surface">{title}</h2>

				<p className="mx-auto mt-3 max-w-lg font-body-sm text-body-sm text-on-surface-variant leading-6">
					{description}
				</p>

				{action && <div className="mt-6 flex flex-wrap justify-center gap-2.5">{action}</div>}
			</div>
		</section>
	)
}
