import type { HealthState } from "@/types/status"

function ServiceCard({
	icon,
	name,
	description,
	status,
}: {
	icon: React.ReactNode
	name: string
	description: string
	status: HealthState
}) {
	const isHealthy = status === "healthy"
	const isDegraded = status === "degraded"

	return (
		<div className="p-5 rounded-xl border border-border bg-card hover:border-muted-foreground/30 transition-all flex flex-col justify-between space-y-3">
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-start gap-3">
					<div className="p-2.5 rounded-lg bg-muted text-foreground/80 shrink-0 mt-0.5">{icon}</div>
					<div>
						<h4 className="font-semibold text-sm text-foreground">{name}</h4>
						<p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
					</div>
				</div>
				<span
					className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${
						isHealthy
							? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
							: isDegraded
								? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
								: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
					}`}
				>
					<span
						className={`size-1.5 rounded-full ${
							isHealthy ? "bg-emerald-500" : isDegraded ? "bg-amber-500" : "bg-rose-500"
						}`}
					/>
					{isHealthy ? "Operational" : isDegraded ? "Degraded" : "Outage"}
				</span>
			</div>
		</div>
	)
}

export default ServiceCard
