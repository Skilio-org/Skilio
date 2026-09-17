import { ArrowUpRight, Code2, Palette, ScanLine, TrendingUp } from "lucide-react"

const categories = [
	{
		icon: Code2,
		name: "Development & IT",
		detail: "Build something that works.",
		value: "Development",
	},
	{
		icon: Palette,
		name: "Design & Creative",
		detail: "Make your vision tangible.",
		value: "Design",
	},
	{
		icon: TrendingUp,
		name: "Sales & Marketing",
		detail: "Reach the right people.",
		value: "Marketing",
	},
	{
		icon: ScanLine,
		name: "AI Services",
		detail: "Put new possibilities to work.",
		value: "AI",
	},
]

export function LandingCategories({ onSelect }: { onSelect: (value: string) => void }) {
	const selectCategory = (value: string) => {
		onSelect(value)
		document.getElementById("talent")?.scrollIntoView({ block: "start" })
	}
	return (
		<section id="categories" className="scroll-mt-24 border-border border-y bg-muted/40 py-12 sm:py-16">
			<div className="landing-container">
				<div className="mb-8 flex flex-wrap items-end justify-between gap-4">
					<h2 className="font-display font-medium text-2xl tracking-tight sm:text-3xl">What are you working on?</h2>
					<button type="button" onClick={() => selectCategory("All talent")} className="landing-text-link text-sm">
						Explore all talent <ArrowUpRight className="size-4" />
					</button>
				</div>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{categories.map(({ icon: Icon, name, detail, value }) => (
						<button
							key={name}
							type="button"
							onClick={() => selectCategory(value)}
							className="category-link group rounded-xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/40 hover:bg-accent"
						>
							<span className="mb-8 flex justify-between">
								<Icon className="size-6 text-primary" strokeWidth={1.5} />
								<ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
							</span>
							<span className="block font-medium tracking-tight">{name}</span>
							<span className="mt-2 block text-muted-foreground text-sm">{detail}</span>
						</button>
					))}
				</div>
			</div>
		</section>
	)
}
