import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Clock3, MapPin, Star } from "lucide-react"
import { Monogram, SkillTag, workspaceStyles } from "@/components/dashboard/dashboard-header"
import type { Freelancer } from "@/data/freelancers"
import { cn } from "@/lib/utils"

export function MessageTalentDetails({ selected, clientMode = false }: { selected: Freelancer; clientMode?: boolean }) {
	return (
		<div className="px-6 pb-8">
			<div className="mt-5">
				<Monogram className={cn("size-16 text-xl", selected.background, selected.foreground)}>
					{selected.initials}
				</Monogram>
				<h2 className="mt-5 font-medium text-2xl tracking-tight">{selected.name}</h2>
				<p className="mt-2 text-muted-foreground text-sm">{selected.title}</p>
				<p className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
					<MapPin className="size-3.5" />
					{selected.location}
				</p>
				{!clientMode && (
					<Link
						to="/talent/$freelancerId"
						params={{ freelancerId: selected.id }}
						search={{ q: undefined }}
						className={`${workspaceStyles.secondaryAction} mt-5 w-full justify-between`}
					>
						View full profile <ArrowUpRight className="size-4" />
					</Link>
				)}
			</div>
			{!clientMode && (
				<dl className="mt-7 grid grid-cols-2 gap-4 border-border border-y py-5">
					<div>
						<dt className="text-muted-foreground text-xs">Hourly rate</dt>
						<dd className="mt-2 font-medium text-xl tabular-nums">
							${selected.rate}
							<span className="font-normal text-muted-foreground text-xs"> /hr</span>
						</dd>
					</div>
					<div>
						<dt className="text-muted-foreground text-xs">Client rating</dt>
						<dd className="mt-2 flex items-center gap-1.5 font-medium text-xl tabular-nums">
							<Star className="size-4 text-primary" />
							{selected.rating.toFixed(1)}
							<span className="font-normal text-muted-foreground text-xs">({selected.reviews})</span>
						</dd>
					</div>
				</dl>
			)}
			<section className="mt-6">
				<h3 className="font-medium text-sm">About</h3>
				<p className="mt-3 text-muted-foreground text-sm leading-7">{selected.bio}</p>
			</section>
			<section className="mt-6">
				<h3 className="font-medium text-sm">{clientMode ? "Project focus" : "Expertise"}</h3>
				<div className="mt-3 flex flex-wrap gap-2">
					{selected.skills.slice(0, 6).map((skill) => (
						<SkillTag key={skill}>{skill}</SkillTag>
					))}
				</div>
			</section>
			<div className="mt-7 rounded-xl border border-border bg-muted/40 p-4">
				<div className="flex items-center gap-2 font-medium text-sm">
					<Clock3 className="size-4 text-primary" />
					{selected.availability}
				</div>
				<p className="mt-2 text-muted-foreground text-xs leading-6">{selected.responseTime}</p>
			</div>
		</div>
	)
}
