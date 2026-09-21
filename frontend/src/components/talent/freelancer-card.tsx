import { Link } from "@tanstack/react-router"
import { Bookmark, MapPin, Star } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Freelancer } from "@/data/freelancers"
import { cn } from "@/lib/utils"
import { getInitials } from "@/utils"

type FreelancerWithAvatar = Freelancer & {
	avatarUrl?: string | null
}

export function FreelancerCard({
	freelancer,
	saved,
	onToggleSaved,
}: {
	freelancer: FreelancerWithAvatar
	saved: boolean
	onToggleSaved: () => void
}) {
	return (
		<article
			aria-label={freelancer.name}
			className="group relative rounded-lg border border-outline-variant bg-surface-container-lowest p-5 transition-colors duration-150 hover:border-outline dark:hover:border-border-hover"
		>
			{/* Header */}
			<div className="mb-2.5 flex items-start justify-between gap-4">
				<div className="flex min-w-0 flex-1 items-start gap-3">
					{/* Avatar */}
					<Link
						to="/talent/$freelancerId"
						params={{ freelancerId: freelancer.id }}
						search={{ q: undefined }}
						className="relative mt-0.5 shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<Avatar className="size-10 rounded-lg border border-outline-variant bg-surface-container">
							{freelancer.avatarUrl && (
								<AvatarImage src={freelancer.avatarUrl} alt={freelancer.name} className="object-cover" />
							)}

							<AvatarFallback className="rounded-lg bg-surface-container font-label-md font-semibold text-label-md text-on-surface">
								{getInitials(freelancer.name)}
							</AvatarFallback>
						</Avatar>

						<span
							aria-hidden="true"
							className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-surface-container-lowest bg-success"
						/>
					</Link>

					{/* Identity */}
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2 font-caption text-caption">
							<span className="font-label-sm font-medium text-label-sm text-on-surface-variant dark:text-on-surface-soft">
								{freelancer.name}
							</span>

							<span className="text-outline dark:text-on-surface-faint">•</span>

							<span className="inline-flex items-center gap-1 text-outline">
								<MapPin className="size-3" />
								{freelancer.location}
							</span>

							<span className="text-outline dark:text-on-surface-faint">•</span>

							<span className="text-outline">{freelancer.availability}</span>
						</div>

						<Link
							to="/talent/$freelancerId"
							params={{ freelancerId: freelancer.id }}
							search={{ q: undefined }}
							className="relative inline-block pt-0.5 text-left font-headline-md font-semibold text-headline-md text-on-surface transition-colors after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 group-hover:text-primary-container group-hover:after:scale-x-100"
						>
							{freelancer.title}
						</Link>
					</div>
				</div>

				{/* Save */}
				<button
					type="button"
					onClick={onToggleSaved}
					aria-label={`${saved ? "Unsave" : "Save"} ${freelancer.name}`}
					aria-pressed={saved}
					className="flex size-8 shrink-0 items-center justify-center rounded-lg text-outline transition-colors hover:bg-surface-container hover:text-primary dark:hover:text-on-surface"
				>
					<Bookmark className={cn("size-5", saved && "fill-primary text-primary")} />
				</button>
			</div>

			{/* Rate / rating */}
			<div className="mb-3 flex flex-wrap items-center gap-3">
				<div className="flex items-baseline gap-2 font-numeric-data text-numeric-data">
					<span className="font-semibold text-[15px] text-on-surface">${freelancer.rate}</span>

					<span className="font-caption text-caption text-on-surface-variant">/ hour</span>
				</div>

				<span className="size-1 rounded-full bg-outline-variant" />

				<div className="flex items-center gap-1.5 font-caption text-caption text-on-surface-variant">
					<Star className="size-3.5 fill-current text-primary-container" aria-hidden="true" />

					<span className="font-medium text-on-surface">{freelancer.rating.toFixed(1)}</span>

					<span>
						({freelancer.reviews} {freelancer.reviews === 1 ? "review" : "reviews"})
					</span>
				</div>
			</div>

			{/* Bio */}
			<p className="mb-4 line-clamp-2 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
				{freelancer.bio}
			</p>

			{/* Footer */}
			<div className="flex flex-col gap-3 border-surface-container border-t pt-3 dark:border-border-dark sm:flex-row sm:items-center sm:justify-between">
				{/* EXACT SAME skill style as job card */}
				<div className="flex flex-wrap items-center gap-1.5">
					{freelancer.skills.slice(0, 4).map((skill) => (
						<span
							key={skill}
							className="rounded border border-transparent bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-secondary-fixed-variant dark:border-border-subtle dark:text-on-surface-soft"
						>
							{skill}
						</span>
					))}

					{freelancer.skills.length > 4 && (
						<span className="rounded border border-transparent bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-secondary-fixed-variant dark:border-border-subtle dark:text-on-surface-soft">
							+{freelancer.skills.length - 4}
						</span>
					)}
				</div>

				{/* EXACT SAME action layout as job card */}
				<div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
					<Link
						to="/talent/$freelancerId"
						params={{ freelancerId: freelancer.id }}
						search={{ q: undefined }}
						className="inline-flex h-8 items-center justify-center rounded-lg px-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
					>
						View profile
					</Link>

					<Link
						to="/messages"
						search={{ with: freelancer.id }}
						className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3.5 font-label-md text-label-md text-surface-container-lowest transition-colors hover:bg-[#152243] dark:bg-on-surface dark:font-semibold dark:text-background dark:hover:bg-white"
					>
						Message
					</Link>
				</div>
			</div>
		</article>
	)
}
