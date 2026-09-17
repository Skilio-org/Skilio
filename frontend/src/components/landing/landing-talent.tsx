import { Link } from "@tanstack/react-router"
import { ArrowUpRight, MapPin, Search, Star } from "lucide-react"
import { freelancers } from "@/data/freelancers"

const filters = ["All talent", "Design", "Development", "Marketing", "AI"]
const terms: Record<string, string[]> = {
	Design: ["design"],
	Development: ["engineer", "developer"],
	Marketing: ["brand", "marketing"],
	AI: ["ai", "machine learning"],
}

export function LandingTalent({ filter, onFilter }: { filter: string; onFilter: (value: string) => void }) {
	const people = freelancers
		.filter(
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
		.slice(0, 3)
	return (
		<section id="talent" className="scroll-mt-24 py-16 sm:py-24">
			<div className="landing-container">
				<h2 className="landing-heading max-w-2xl">
					A little expertise.
					<br />A lot of possibility.
				</h2>
				<p className="mt-5 max-w-xl text-base text-muted-foreground leading-7">
					Explore the people behind the work. Compare their craft, experience, and approach before you say hello.
				</p>
				<fieldset className="mt-8 flex flex-wrap gap-2">
					<legend className="sr-only">Filter talent by expertise</legend>
					{filters.map((item) => (
						<button
							key={item}
							type="button"
							aria-pressed={filter === item}
							onClick={() => onFilter(item)}
							className={`min-h-11 rounded-full border px-5 font-medium text-sm transition-colors ${filter === item ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/30 hover:bg-muted"}`}
						>
							{item}
						</button>
					))}
				</fieldset>
				<div
					className={`mt-8 grid gap-5 ${people.length > 1 ? "md:grid-cols-[1.12fr_1fr]" : "max-w-2xl"}`}
					aria-live="polite"
				>
					{people.length ? (
						people.map((person, index) => (
							<article
								key={person.id}
								className={`talent-preview group rounded-2xl border border-border bg-card ${index === 0 ? "md:row-span-2" : ""}`}
							>
								{index === 0 && (
									<div className="overflow-hidden rounded-t-2xl">
										<img
											src="/assets/images/featured-product-designer.webp"
											alt="Illustrative view of a designer reviewing work in a studio"
											width={1448}
											height={1086}
											loading="lazy"
											className="aspect-[2.15] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
										/>
									</div>
								)}
								<div className="p-6 sm:p-7">
									<div className="flex items-start gap-4">
										<span
											className={`grid size-12 shrink-0 place-items-center rounded-xl font-semibold text-sm ${person.background} ${person.foreground}`}
										>
											{person.initials}
										</span>
										<div className="min-w-0 flex-1">
											<h3 className="font-display font-medium text-xl tracking-tight">{person.name}</h3>
											<p className="mt-1 text-muted-foreground text-sm">{person.title}</p>
										</div>
										<p className="whitespace-nowrap font-medium text-lg tabular-nums">
											${person.rate}
											<span className="font-normal text-muted-foreground text-xs"> /hr</span>
										</p>
									</div>
									{index === 0 && <p className="mt-5 max-w-xl text-muted-foreground text-sm leading-6">{person.bio}</p>}
									<div className="mt-5 flex flex-wrap gap-2">
										{person.skills.slice(0, 3).map((skill) => (
											<span key={skill} className="rounded-md bg-muted px-2.5 py-1.5 text-muted-foreground text-xs">
												{skill}
											</span>
										))}
									</div>
									<div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-border border-t pt-4 text-muted-foreground text-xs">
										<span className="flex items-center gap-1.5">
											<MapPin className="size-3.5" />
											{person.location}
										</span>
										<span className="flex items-center gap-1.5">
											<Star className="size-3.5 text-primary" />
											<strong className="text-foreground">{person.rating.toFixed(1)}</strong> ({person.reviews} reviews)
										</span>
									</div>
								</div>
							</article>
						))
					) : (
						<div className="col-span-full rounded-2xl border border-border border-dashed p-10 text-center">
							<Search className="mx-auto size-6 text-muted-foreground" />
							<h3 className="mt-4 font-medium text-lg">More specialists are on the way</h3>
							<p className="mt-2 text-muted-foreground text-sm">Explore other areas of expertise in the meantime.</p>
							<button type="button" onClick={() => onFilter("All talent")} className="landing-text-link mt-5">
								See all talent <ArrowUpRight className="size-4" />
							</button>
						</div>
					)}
				</div>
				<div className="mt-6 flex flex-wrap items-center justify-between gap-4">
					<p className="text-muted-foreground text-xs">Sample profiles to help you explore the marketplace.</p>
					<Link to="/signup" search={{ role: "client" }} className="landing-text-link text-sm">
						Meet your next collaborator <ArrowUpRight className="size-4" />
					</Link>
				</div>
			</div>
		</section>
	)
}
