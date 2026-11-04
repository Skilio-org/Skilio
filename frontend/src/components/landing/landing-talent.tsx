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
		<section id="talent" className="scroll-mt-20 py-12 sm:py-20 lg:py-24">
			<div className="landing-container px-4 sm:px-6">
				{/* Section Header */}
				<div className="flex flex-col gap-2.5 sm:gap-3">
					<div className="inline-flex w-fit items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-bold text-foreground">
						<span>PRE-VETTED ROSTER</span>
					</div>
					<h2 className="landing-heading text-foreground">
						Curated specialists ready for your next sprint.
					</h2>
					<p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
						Browse verified portfolios, inspect technical match scores, and interview senior
						engineers and designers in under 24 hours.
					</p>
				</div>

				{/* Filter Tabs - horizontally scrollable on mobile */}
				<div className="mt-6 sm:mt-8 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar">
					{CATEGORIES.map((cat) => {
						const active = filter === cat
						return (
							<button
								key={cat}
								type="button"
								onClick={() => onFilter(cat)}
								className={`shrink-0 rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold transition-all ${
									active
										? "bg-primary text-primary-foreground shadow-xs"
										: "border border-border/80 bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
								}`}
							>
								{cat}
							</button>
						)
					})}
				</div>

				{/* Talent Cards Grid */}
				<div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{displayPeople.map((person) => (
						<article
							key={person.id}
							className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-all hover:border-foreground/20 hover:shadow-md"
						>
							<div>
								{/* Card Top: Avatar, Name, Rate */}
								<div className="flex items-start justify-between gap-3">
									<div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
										<span
											className={`grid size-11 sm:size-12 shrink-0 place-items-center rounded-xl font-bold text-sm ${person.background} ${person.foreground} shadow-xs`}
										>
											{person.initials}
										</span>
										<div className="min-w-0">
											<div className="flex items-center gap-1.5">
												<h3 className="font-semibold text-foreground text-sm sm:text-base group-hover:text-link transition-colors truncate">
													{person.name}
												</h3>
												<span className="inline-flex items-center gap-0.5 rounded bg-[#EEF8E7] dark:bg-[#252A21] dark:border dark:border-[#384334] px-1.5 py-0.5 text-[10px] font-bold text-[#3E7B3D] dark:text-[#8DD37D]">
													<Check className="size-2.5" />
													Top 3%
												</span>
											</div>
											<p className="text-xs text-muted-foreground truncate">{person.title}</p>
										</div>
									</div>

									<div className="text-right shrink-0">
										<p className="font-display font-bold text-base sm:text-lg text-foreground">
											${person.rate}
											<span className="text-xs font-normal text-muted-foreground">
												/hr
											</span>
										</p>
										<span className="text-[11px] font-medium text-[#3E7B3D] dark:text-[#8DD37D]">
											{person.availability}
										</span>
									</div>
								</div>

								{/* Bio */}
								<p className="mt-3.5 sm:mt-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
									{person.bio}
								</p>

								{/* Skills Pills */}
								<div className="mt-3.5 sm:mt-4 flex flex-wrap gap-1.5">
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
							<div className="mt-5 sm:mt-6 flex items-center justify-between border-t border-border/60 pt-3.5 sm:pt-4 text-xs">
								<div className="flex items-center gap-1 min-w-0">
									<Star className="size-3.5 fill-amber-400 text-amber-400 shrink-0" />
									<span className="font-bold text-foreground">{person.rating}</span>
									<span className="text-muted-foreground">({person.reviews})</span>
									<span className="mx-1 text-muted-foreground/60">·</span>
									<span className="flex items-center gap-1 text-muted-foreground truncate">
										<MapPin className="size-3 shrink-0" />
										<span className="truncate max-w-[85px] sm:max-w-none">{person.location.split(",")[0]}</span>
									</span>
								</div>

								<Link
									to="/talent"
									search={{ q: undefined, category: undefined }}
									className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-link hover:underline shrink-0"
								>
									<span>View</span>
									<ArrowUpRight className="size-3.5" />
								</Link>
							</div>
						</article>
					))}
				</div>

				{/* Explore All CTA */}
				<div className="mt-8 sm:mt-10 flex justify-center">
					<Link
						to="/talent"
						search={{ q: undefined, category: undefined }}
						className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-xs transition-all hover:border-foreground/30 hover:bg-muted"
					>
						<span>Explore all 12,000+ vetted talent profiles</span>
						<ArrowUpRight className="size-4 text-ring" />
					</Link>
				</div>
			</div>
		</section>
	)
}
