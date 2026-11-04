import { Check, type LucideIcon, Monitor, Moon, Sun } from "lucide-react"

import { type Theme, useTheme } from "@/components/theme-provider"
import { SettingsSectionHeader } from "@/components/user-settings/settings-section-header"
import { cn } from "@/lib/utils"

const themes: {
	value: Theme
	title: string
	description: string
	icon: LucideIcon
}[] = [
	{
		value: "light",
		title: "Light",
		description: "Clean and bright",
		icon: Sun,
	},
	{
		value: "dark",
		title: "Dark",
		description: "Easy on the eyes",
		icon: Moon,
	},
	{
		value: "system",
		title: "System",
		description: "Match your device",
		icon: Monitor,
	},
]

export function AppearanceSettings() {
	const { theme, setTheme } = useTheme()

	return (
		<SettingsPanel
			eyebrow="Display"
			title="Appearance"
			description="Select the visual theme that feels best for your workspace."
			icon={Monitor}
		>
			<div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-7">
				{themes.map((option) => {
					const Icon = option.icon
					const selected = theme === option.value
					return (
						<button
							key={option.value}
							type="button"
							onClick={() => setTheme(option.value)}
							aria-pressed={selected}
							className={cn(
								"group relative min-h-44 overflow-hidden rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
								selected ? "border-brand-500 bg-brand-50/30 dark:bg-brand-500/5" : "border-outline-variant",
							)}
						>
							<span
								className={cn(
									"absolute inset-x-4 top-4 h-20 overflow-hidden rounded-lg border",
									option.value === "dark" ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white",
								)}
							>
								<span
									className={cn(
										"absolute inset-x-2 top-2 h-2 rounded-full",
										option.value === "dark" ? "bg-slate-800" : "bg-slate-100",
									)}
								/>
								<span
									className={cn(
										"absolute top-7 bottom-2 left-2 w-1/4 rounded",
										option.value === "dark" ? "bg-slate-800" : "bg-slate-100",
									)}
								/>
								<span
									className={cn(
										"absolute top-7 right-2 bottom-2 left-[34%] rounded",
										option.value === "dark" ? "bg-slate-900" : "bg-[#eef3ff]",
									)}
								/>
							</span>
							<span className="absolute right-4 bottom-4 left-4 flex items-center gap-3">
								<span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground group-hover:text-foreground">
									<Icon className="size-4" />
								</span>
								<span>
									<span className="block font-semibold text-sm">{option.title}</span>
									<span className="block text-[11px] text-muted-foreground">{option.description}</span>
								</span>
								{selected && (
									<span className="ml-auto grid size-5 place-items-center rounded-full bg-brand-600 text-white">
										<Check className="size-3" strokeWidth={3} />
									</span>
								)}
							</span>
						</button>
					)
				})}
			</div>
		</SettingsPanel>
	)
}

function SettingsPanel({
	eyebrow,
	title,
	description,
	icon: Icon,
	children,
}: {
	eyebrow: string
	title: string
	description: string
	icon: LucideIcon
	children: React.ReactNode
}) {
	return (
		<section className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
			<SettingsSectionHeader eyebrow={eyebrow} title={title} description={description} icon={Icon} />
			{children}
		</section>
	)
}
