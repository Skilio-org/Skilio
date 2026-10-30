import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Clock3, MapPin, Search, Star } from "lucide-react"
import { freelancers } from "@/data/freelancers"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const filters = ["All talent", "Design", "Development", "Marketing", "AI"] as const

const terms: Record<string, string[]> = {
	Design: ["design"],
	Development: ["engineer", "developer"],
	Marketing: ["brand", "marketing"],
	AI: ["ai", "machine learning"],
}

export function LandingTalent({ filter, onFilter }: { filter: string; onFilter: (value: string) => void }) {
	const people = freelancers.filter(
		(person) =>
			filter === "All talent" ||
			terms[filter]?.some(
				(term) =>
					`${person.title} ${person.skills.join(" ")}`
						.toLowerCase()
						.split(/[^a-z]+/)
						.includes(term) || person.title.toLowerCase().includes(term),
			),
	)

	const getFilteredCount = (f: string) => {
		if (f === "All talent") return freelancers.length
		return freelancers.filter((person) =>
			terms[f]?.some(
				(term) =>
					`${person.title} ${person.skills.join(" ")}`
						.toLowerCase()
						.split(/[^a-z]+/)
						.includes(term) || person.title.toLowerCase().includes(term),
			),
		).length
	}

	return (
		<section id="talent" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
			<div className="landing-container">
				{/* Section Header */}
				<div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
					<div className="max-w-2xl">
						<p className="mb-4 font-medium text-primary text-sm">Featured talent</p>
						<h2 className="landing-heading text-foreground">
							A little expertise.
							<br />
							A lot of possibility.
						</h2>
						<p className="mt-4 text-base text-muted-foreground leading-relaxed sm:leading-7">
							Explore the independent specialists behind the work. Compare craft, portfolios, and rates before you
							start a collaboration.
						</p>
					</div>

					<Link
						to="/signup"
						search={{ role: "client" }}
						className="landing-text-link mb-1 hidden items-center gap-1.5 self-end font-semibold text-sm md:inline-flex"
					>
						Explore full directory <ArrowUpRight className="size-4" />
					</Link>
				</div>

				{/* Filter Tabs */}
				<fieldset className="mt-8 flex flex-wrap items-center gap-2">
					<legend className="sr-only">Filter talent by expertise</legend>
					{filters.map((item) => {
						const isSelected = filter === item
						return (
							<button
								key={item}
								type="button"
								aria-pressed={isSelected}
								onClick={() => onFilter(item)}
								className={cn(
									"inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 font-medium text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm",
									isSelected
										? "border-foreground bg-foreground font-semibold text-background shadow-xs"
										: "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:bg-muted hover:text-foreground",
								)}
							>
								<span>{item}</span>
								<span
									className={cn(
										"rounded-full px-2 py-0.5 font-semibold text-[11px] tabular-nums",
										isSelected ? "bg-background/20 text-background" : "bg-muted text-muted-foreground",
									)}
								>
									{getFilteredCount(item)}
								</span>
							</button>
						)
					})}
				</fieldset>

				{/* Talent Cards Responsive Grid */}
				<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
					{people.length ? (
						people.map((person) => (
							<article
								key={person.id}
								className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-xs transition-all duration-200 hover:border-outline hover:shadow-sm dark:hover:border-border-hover"
							>
								<div>
									{/* Card Top: Avatar with Availability Indicator & Hourly Rate */}
									<div className="flex items-start justify-between gap-3">
										<div className="relative shrink-0">
											<Avatar className="size-11 rounded-lg border border-border bg-surface-container">
												<AvatarFallback className="rounded-lg bg-surface-container font-display font-semibold text-on-surface text-sm">
													{person.initials}
												</AvatarFallback>
											</Avatar>
											<span
												aria-hidden="true"
												className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-card bg-success"
											/>
										</div>

										<div className="flex flex-col items-end">
											<p className="font-display font-semibold text-foreground text-lg tabular-nums sm:text-xl">
												${person.rate}
												<span className="font-caption text-muted-foreground text-xs font-normal"> / hour</span>
											</p>
											<span className="mt-1 inline-flex items-center gap-1 font-caption text-muted-foreground text-xs">
												<Clock3 className="size-3 shrink-0 text-success" />
												{person.availability}
											</span>
										</div>
									</div>

									{/* Name & Title */}
									<div className="mt-4">
										<h3 className="font-display font-medium text-foreground text-lg tracking-tight transition-colors group-hover:text-primary">
											{person.name}
										</h3>
										<p className="mt-0.5 font-medium text-muted-foreground text-sm">{person.title}</p>
									</div>

									{/* Location & Rating */}
									<div className="mt-2.5 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
										<span className="inline-flex items-center gap-1">
											<MapPin className="size-3 shrink-0 text-muted-foreground" />
											<span className="truncate">{person.location}</span>
										</span>
										<span className="text-muted-foreground/60">·</span>
										<span className="inline-flex items-center gap-1">
											<Star className="size-3.5 fill-amber-400 text-amber-400" />
											<strong className="font-medium text-foreground">{person.rating.toFixed(1)}</strong>
											<span>({person.reviews} reviews)</span>
										</span>
									</div>

									{/* Bio */}
									<p className="mt-3.5 line-clamp-2 font-body-sm text-muted-foreground text-sm leading-relaxed">
										{person.bio}
									</p>

									{/* Skills Chips */}
									<div className="mt-4 flex flex-wrap gap-1.5">
										{person.skills.slice(0, 4).map((skill) => (
											<span
												key={skill}
												className="rounded border border-border/60 bg-muted/60 px-2 py-0.5 font-label-sm font-medium text-muted-foreground text-xs"
											>
												{skill}
											</span>
										))}
										{person.skills.length > 4 && (
											<span className="rounded border border-border/60 bg-muted/60 px-2 py-0.5 font-label-sm font-medium text-muted-foreground text-xs">
												+{person.skills.length - 4}
											</span>
										)}
									</div>
								</div>

								{/* Card Footer: Timezone & Action Link */}
								<div className="mt-6 flex items-center justify-between gap-2 border-border border-t pt-4 text-xs">
									<span className="font-caption text-muted-foreground text-xs">
										{person.timezone.split("·")[0].trim()}
									</span>
									<Link
										to="/signup"
										search={{ role: "client" }}
										className="inline-flex items-center gap-1 font-medium text-foreground text-xs transition-colors hover:text-primary"
										aria-label={`View profile of ${person.name}`}
									>
										<span>View profile</span>
										<ArrowUpRight className="size-3.5" />
									</Link>
								</div>
							</article>
						))
					) : (
						<div className="col-span-full rounded-2xl border border-border border-dashed p-10 text-center">
							<Search className="mx-auto size-6 text-muted-foreground" />
							<h3 className="mt-4 font-medium text-foreground text-lg">More specialists are on the way</h3>
							<p className="mt-2 text-muted-foreground text-sm">Explore other areas of expertise in the meantime.</p>
							<button
								type="button"
								onClick={() => onFilter("All talent")}
								className="landing-text-link mt-5 font-semibold"
							>
								See all talent <ArrowUpRight className="size-4" />
							</button>
						</div>
					)}
				</div>

				{/* Directory Discovery Banner */}
				<div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-2xl border border-border bg-muted/40 p-6 sm:flex-row sm:px-8">
					<div className="text-center sm:text-left">
						<h4 className="font-display font-medium text-foreground text-base sm:text-lg">
							Looking for specific expertise?
						</h4>
						<p className="mt-1 text-muted-foreground text-xs sm:text-sm">
							Create a free account to browse verified portfolios, save profiles, and message specialists directly with
							zero platform commission.
						</p>
					</div>
					<Link
						to="/signup"
						search={{ role: "client" }}
						className="landing-primary shrink-0 whitespace-nowrap px-6 font-semibold text-xs sm:text-sm"
					>
						Explore full directory <ArrowUpRight className="size-4" />
					</Link>
				</div>
			</div>
		</section>
	)
}
