import { Link } from "@tanstack/react-router"
import { MapPin, Star } from "lucide-react"
import type { Freelancer } from "@/data/freelancers"
import { formatMoney } from "@/lib/currency"

interface LandingTalentCardProps {
	person: Freelancer
}

export function LandingTalentCard({ person }: LandingTalentCardProps) {
	const city = person.location.split(",")[0]

	return (
		<article className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6 transition-colors hover:border-outline">
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
							{formatMoney(person.rate)}
							<span className="text-xs font-normal text-muted-foreground">/hr</span>
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
						<span className="truncate max-w-[85px] sm:max-w-none">{city}</span>
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
	)
}
