import { BriefcaseBusiness, Search } from "lucide-react"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import type { ClientJob } from "./client-job-types"

type ClientJobsListProps = {
	jobs: ClientJob[]
	results: ClientJob[]
	query: string
	tab: string
	disabled: boolean
	onQueryChange: (query: string) => void
	onTabChange: (tab: string) => void
	onOpenJob: (job: ClientJob) => void
	onCreateJob: () => void
	onClearFilters: () => void
}

export function ClientJobsList({
	jobs,
	results,
	query,
	tab,
	disabled,
	onQueryChange,
	onTabChange,
	onOpenJob,
	onCreateJob,
	onClearFilters,
}: ClientJobsListProps) {
	return (
		<>
			<nav aria-label="Job status" className="flex gap-6 overflow-x-auto border-outline-variant border-b">
				{["All jobs", "Draft", "Open", "Closed"].map((status) => (
					<button
						type="button"
						key={status}
						onClick={() => onTabChange(status)}
						aria-pressed={tab === status}
						className={`min-h-12 shrink-0 border-b-2 px-1 font-medium text-sm ${tab === status ? "border-primary text-primary" : "border-transparent text-on-surface-variant"}`}
					>
						{status}{" "}
						<span className="ml-1 text-xs">
							{jobs.filter((job) => status === "All jobs" || job.status === status).length}
						</span>
					</button>
				))}
			</nav>
			<label className="flex min-h-12 items-center gap-3 rounded-lg border border-input bg-surface-container-lowest px-4">
				<Search className="size-4 text-on-surface-variant" />
				<input
					type="search"
					aria-label="Search your jobs"
					placeholder="Search your jobs by title or skill"
					value={query}
					onChange={(event) => onQueryChange(event.target.value)}
					className="min-w-0 flex-1 bg-transparent text-sm outline-none"
				/>
			</label>
			{results.length ? (
				<div className="divide-y divide-border overflow-hidden rounded-lg border border-outline-variant">
					{results.map((job) => (
						<article
							key={job.id}
							className="flex flex-wrap items-center justify-between gap-5 bg-surface-container-lowest p-6"
						>
							<div className="min-w-0">
								<span className="rounded-md bg-muted px-2 py-1 text-on-surface-variant text-xs">{job.status}</span>
								<h2 className="mt-3 break-words font-semibold text-lg">{job.title || "Untitled job"}</h2>
								<p className="mt-2 text-on-surface-variant text-sm">
									{job.category} · {job.type}
									{job.budget && ` · $${job.budget}${job.type === "Hourly" ? "/hr" : ""}`}
								</p>
							</div>
							<button type="button" className={workspaceStyles.secondaryAction} onClick={() => onOpenJob(job)}>
								View job
							</button>
						</article>
					))}
				</div>
			) : (
				<section className="rounded-lg border bg-surface-container-lowest px-6 py-16 text-center">
					<BriefcaseBusiness className="mx-auto size-8 text-primary" />
					<h2 className="mt-5 font-semibold text-xl">
						{jobs.length ? "No matching jobs" : "Make room for your next project."}
					</h2>
					<p className="mx-auto mt-3 max-w-md text-on-surface-variant text-sm leading-6">
						{jobs.length
							? "Try another search or status."
							: "Describe what you need, choose the skills, and set a budget. You can save a draft and finish it later."}
					</p>
					<button
						type="button"
						disabled={disabled}
						onClick={jobs.length ? onClearFilters : onCreateJob}
						className={`${workspaceStyles.primaryAction} mt-6`}
					>
						{jobs.length ? "Show all jobs" : "Create your first job"}
					</button>
				</section>
			)}
		</>
	)
}
