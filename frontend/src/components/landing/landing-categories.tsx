import { ArrowUpRight, Code2, Palette, ScanLine, TrendingUp } from "lucide-react"

const categories = [
	{
		icon: Code2,
		name: "Development & IT",
		detail: "Full-stack apps, APIs, system architecture, and modern web platforms.",
		value: "Development",
	},
	{
		icon: Palette,
		name: "Design & Creative",
		detail: "Brand identities, design systems, UI/UX, and product experiences.",
		value: "Design",
	},
	{
		icon: TrendingUp,
		name: "Sales & Marketing",
		detail: "Growth engineering, brand positioning, content, and market expansion.",
		value: "Marketing",
	},
	{
		icon: ScanLine,
		name: "AI Services",
		detail: "LLM agents, custom fine-tuning, ML pipelines, and AI integration.",
		value: "AI",
	},
]

export function LandingCategories({ onSelect }: { onSelect: (value: string) => void }) {
	const selectCategory = (value: string) => {
		onSelect(value)
		document.getElementById("talent")?.scrollIntoView({ block: "start", behavior: "smooth" })
	}

	return (
		<section id="categories" className="scroll-mt-24 border-border border-y bg-muted/40 py-16 sm:py-20 lg:py-24">
			<div className="landing-container">
				{/* Section Header */}
				<div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
					<div className="max-w-2xl">
						<p className="mb-4 font-medium text-primary text-sm">Categories</p>
						<h2 className="landing-heading text-foreground">What are you working on?</h2>
						<p className="mt-4 text-base text-muted-foreground leading-relaxed sm:leading-7">
							Discover independent specialists across core domains, with verified portfolios, direct messaging, and
							transparent rates.
						</p>
					</div>

					<button
						type="button"
						onClick={() => selectCategory("All talent")}
						className="landing-text-link mb-1 hidden items-center gap-1.5 self-end font-semibold text-sm md:inline-flex"
					>
						Explore all talent <ArrowUpRight className="size-4" />
					</button>
				</div>

				{/* Categories Grid */}
				<div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{categories.map(({ icon: Icon, name, detail, value }) => (
						<button
							key={name}
							type="button"
							onClick={() => selectCategory(value)}
							className="category-link group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 text-left shadow-xs transition-all duration-200 hover:border-outline hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-7 dark:hover:border-border-hover"
						>
							<div>
								<div className="mb-6 flex items-center justify-between">
									<span className="grid size-11 place-items-center rounded-xl border border-border bg-surface-container text-primary">
										<Icon className="size-5" strokeWidth={1.75} />
									</span>
									<ArrowUpRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
								</div>
								<h3 className="font-display font-medium text-foreground text-lg tracking-tight transition-colors group-hover:text-primary">
									{name}
								</h3>
								<p className="mt-2 text-muted-foreground text-sm leading-relaxed">{detail}</p>
							</div>

							<div className="mt-6 border-border/60 border-t pt-4 font-medium text-foreground text-xs group-hover:text-primary">
								View specialists →
							</div>
						</button>
					))}
				</div>
			</div>
		</section>
	)
}
