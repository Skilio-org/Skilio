import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Check, MapPin, Star } from "lucide-react"
import { freelancers } from "@/data/freelancers"

const CATEGORIES = [
	"All talent",
	"AI & Machine Learning",
	"Full-Stack Engineering",
	"Product & UI/UX Design",
	"Growth & Marketing",
]

const TERMS_MAP: Record<string, string[]> = {
	"AI & Machine Learning": ["ai", "python", "automation", "llm", "rag"],
	"Full-Stack Engineering": ["engineer", "react", "typescript", "full-stack", "postgres"],
	"Product & UI/UX Design": ["design", "product", "figma", "ux", "ui"],
	"Growth & Marketing": ["brand", "marketing", "growth", "seo", "content"],
}

export function LandingTalent({
	filter,
	onFilter,
}: {
	filter: string
	onFilter: (value: string) => void
}) {
	const filteredPeople = freelancers.filter((person) => {
		if (filter === "All talent") return true
		const searchTerms = TERMS_MAP[filter] || []
		const content = `${person.title} ${person.skills.join(" ")} ${person.bio}`.toLowerCase()
		return searchTerms.some((term) => content.includes(term))
	})

	const displayPeople = (filteredPeople.length > 0 ? filteredPeople : freelancers).slice(0, 3)

	return (
		<section id="talent" className="scroll-mt-20 py-16 sm:py-24">
			<div className="landing-container">
				{/* Section Header */}
				<div className="flex flex-col gap-3">
					<div className="inline-flex w-fit items-center gap-1.5 rounded-md bg-[#EDF9C5] px-2.5 py-1 text-xs font-bold text-[#4F6500] dark:bg-[#1F2125] dark:text-[#B8EF0D]">
						<span>PRE-VETTED ROSTER</span>
					</div>
					<h2 className="landing-heading text-foreground">
						Curated specialists ready for your next sprint.
					</h2>
					<p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
						Browse verified portfolios, inspect technical match scores, and interview senior
						engineers and designers in under 24 hours.
					</p>
				</div>

				{/* Filter Tabs */}
				<div className="mt-8 flex flex-wrap gap-2">
					{CATEGORIES.map((cat) => {
						const active = filter === cat
						return (
							<button
								key={cat}
								type="button"
								onClick={() => onFilter(cat)}
								className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
									active
										? "bg-[#1F2125] text-white shadow-xs dark:bg-white dark:text-[#1F2125]"
										: "border border-border/80 bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
								}`}
							>
								{cat}
							</button>
						)
					})}
				</div>

				{/* Talent Cards Grid */}
				<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{displayPeople.map((person) => (
						<article
							key={person.id}
							className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all hover:border-foreground/20 hover:shadow-md"
						>
							<div>
								{/* Card Top: Avatar, Name, Rate */}
								<div className="flex items-start justify-between gap-3">
									<div className="flex items-center gap-3.5">
										<span
											className={`grid size-12 shrink-0 place-items-center rounded-xl font-bold text-sm ${person.background} ${person.foreground} shadow-xs`}
										>
											{person.initials}
										</span>
										<div>
											<div className="flex items-center gap-1.5">
												<h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">
													{person.name}
												</h3>
												<span className="inline-flex items-center gap-0.5 rounded bg-[#EEF8E7] px-1.5 py-0.5 text-[10px] font-bold text-[#3E7B3D] dark:bg-[#3E7B3D]/20">
													<Check className="size-2.5" />
													Top 3%
												</span>
											</div>
											<p className="text-xs text-muted-foreground">{person.title}</p>
										</div>
									</div>

									<div className="text-right">
										<p className="font-display font-bold text-base text-foreground sm:text-lg">
											${person.rate}
											<span className="text-xs font-normal text-muted-foreground">
												/hr
											</span>
										</p>
										<span className="text-[11px] font-medium text-[#3E7B3D]">
											{person.availability}
										</span>
									</div>
								</div>

								{/* Bio */}
								<p className="mt-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
									{person.bio}
								</p>

								{/* Skills Pills */}
								<div className="mt-4 flex flex-wrap gap-1.5">
									{person.skills.slice(0, 4).map((skill) => (
										<span
											key={skill}
											className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
										>
											{skill}
										</span>
									))}
								</div>
							</div>

							{/* Card Footer */}
							<div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-xs">
								<div className="flex items-center gap-1">
									<Star className="size-3.5 fill-amber-400 text-amber-400" />
									<span className="font-bold text-foreground">{person.rating}</span>
									<span className="text-muted-foreground">({person.reviews})</span>
									<span className="mx-1 text-muted-foreground/60">·</span>
									<span className="flex items-center gap-1 text-muted-foreground">
										<MapPin className="size-3" />
										{person.location.split(",")[0]}
									</span>
								</div>

								<Link
									to="/talent"
									search={{ q: undefined, category: undefined }}
									className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline"
								>
									<span>View</span>
									<ArrowUpRight className="size-3.5" />
								</Link>
							</div>
						</article>
					))}
				</div>

				{/* Explore All CTA */}
				<div className="mt-10 flex justify-center">
					<Link
						to="/talent"
						search={{ q: undefined, category: undefined }}
						className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-xs transition-all hover:border-foreground/30 hover:bg-muted"
					>
						<span>Explore all 12,000+ vetted talent profiles</span>
						<ArrowUpRight className="size-4" />
					</Link>
				</div>
			</div>
		</section>
	)
}
