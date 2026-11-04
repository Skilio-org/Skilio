import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

// Plain section heading shared by every settings panel. The eyebrow and icon props are still
// accepted so existing panels keep working, but they are no longer drawn.
export function SettingsSectionHeader({
	title,
	description,
	tone = "brand",
	actions,
	className,
}: {
	eyebrow?: string
	title: string
	description: string
	icon?: unknown
	tone?: "brand" | "destructive"
	actions?: ReactNode
	className?: string
}) {
	return (
		<header className={cn("flex items-start gap-4 border-outline-variant border-b px-5 py-5 sm:px-7", className)}>
			<div className="min-w-0 flex-1">
				<h2
					className={cn(
						"font-headline-sm font-semibold text-headline-sm",
						tone === "destructive" ? "text-destructive" : "text-on-surface",
					)}
				>
					{title}
				</h2>
				<p className="mt-1 text-on-surface-variant text-sm">{description}</p>
			</div>
			{actions}
		</header>
	)
}
