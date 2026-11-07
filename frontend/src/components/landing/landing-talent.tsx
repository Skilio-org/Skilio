import { Link } from "@tanstack/react-router"
import { MapPin, Star } from "lucide-react"
import { freelancers } from "@/data/freelancers"

const CATEGORIES = [
	"All talent",
	"Full-Stack Engineering",
	"Product & UI/UX Design",
	"Mobile Development",
	"E-Commerce & Marketing",
]

const TERMS_MAP: Record<string, string[]> = {
	"Full-Stack Engineering": ["engineer", "react", "typescript", "full-stack", "postgres", "node"],
	"Product & UI/UX Design": ["design", "product", "figma", "ux", "ui"],
	"Mobile Development": ["mobile", "flutter", "react native", "ios", "android"],
	"E-Commerce & Marketing": ["brand", "marketing", "growth", "seo", "shopify", "ecommerce", "e-commerce"],
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
		<section id="talent" className="scroll-mt-20 landing-section">
			<div className="landing-container">
				{/* Section Header */}
				<div className="landing-section-header">
					<h2 className="landing-heading text-foreground">
						Skilled Moroccan specialists ready for your project.
					</h2>
					<p className="landing-lede">
						Browse verified portfolios, inspect practical experience, and connect with developers
						and designers directly.
					</p>
				</div>

				{/* Filter Tabs - horizontally scrollable on mobile */}
				<div className="mt-8 sm:mt-12 flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar">
					{CATEGORIES.map((cat) => {
						const active = filter === cat
						return (
							<button
								key={cat}
								type="button"
								onClick={() => onFilter(cat)}
								className={`shrink-0 rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-medium transition-colors ${
									active
										? "bg-primary text-primary-foreground"
										: "border border-border/80 bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
								}`}
							>
								{cat}
							</button>
						)
					})}
				</div>

				{/* Talent Cards Grid */}
				<div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{displayPeople.map((person) => (
						<article
							key={person.id}
							className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6 transition-colors hover:border-outline"
						>
							<div>
								{/* Card Top: Avatar, Name, Rate */}
								<div className="flex items-start justify-between gap-3">
									<div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
										<span
											className={`grid size-11 sm:size-12 shrink-0 place-items-center rounded-xl font-bold text-sm ${person.background} ${person.foreground}`}
										>
											{person.initials}
										</span>
										<div className="min-w-0">
											<h3 className="font-semibold text-foreground text-sm sm:text-base group-hover:text-link transition-colors truncate">
												{person.name}
											</h3>
											<p className="text-xs text-muted-foreground truncate">{person.title}</p>
										</div>
									</div>

									<div className="text-right shrink-0">
										<p className="font-display font-bold text-base sm:text-lg text-foreground">
											{person.rate} DH
											<span className="text-xs font-normal text-muted-foreground">
												/hr
											</span>
										</p>
										<span className="text-[11px] font-medium text-muted-foreground">
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
									<Star className="size-3.5 fill-primary text-primary shrink-0" />
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
									className="inline-flex items-center font-semibold text-foreground hover:text-link hover:underline shrink-0"
								>
									<span>View</span>
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
						className="inline-flex w-full sm:w-auto h-9 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest px-5 text-[13px] font-medium text-on-surface transition-colors hover:border-outline hover:bg-surface-container-low"
					>
						<span>Explore all verified Moroccan talent</span>
					</Link>
				</div>
			</div>
		</section>
	)
}
