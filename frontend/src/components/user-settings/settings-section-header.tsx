import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function SettingsSectionHeader({
	eyebrow,
	title,
	description,
	icon: Icon,
	tone = "brand",
	actions,
	className,
}: {
	eyebrow: string
	title: string
	description: string
	icon: LucideIcon
	tone?: "brand" | "destructive"
	actions?: ReactNode
	className?: string
}) {
	return (
		<header className={cn("flex items-start gap-4 border-outline-variant border-b p-5 sm:p-7", className)}>
			<span
				className={cn(
					"grid size-11 shrink-0 place-items-center rounded-lg",
					tone === "destructive"
						? "bg-danger-soft text-destructive"
						: "bg-brand-50 text-brand-700 dark:bg-muted dark:text-brand-500",
				)}
			>
				<Icon className="size-5" />
			</span>
			<div className="min-w-0 flex-1">
				<p
					className={cn(
						"font-semibold text-xs uppercase tracking-[0.16em]",
						tone === "destructive" ? "text-destructive" : "text-brand-700",
					)}
				>
					{eyebrow}
				</p>
				<h2 className="mt-1 font-headline-md font-semibold text-headline-md">{title}</h2>
				<p className="mt-1 text-muted-foreground text-sm leading-6">{description}</p>
			</div>
			{actions}
		</header>
	)
}
