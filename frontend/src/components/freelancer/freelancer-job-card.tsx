import { Bookmark } from "lucide-react"
import { useState } from "react"
import type { FreelancerJob } from "@/types/job"

const FreelancerJobCard = (job: FreelancerJob) => {
	const [saved, setSaved] = useState<string[]>([])
	const isSaved = saved.includes(job.id)
	const projectType = job.budget.toLowerCase().includes("fixed") ? "Fixed price" : "Hourly"
	const [selected, setSelected] = useState<FreelancerJob | null>(null)
	return (
		<article
			key={job.id}
			className="group relative rounded-lg border border-outline-variant bg-surface-container-lowest p-5 transition-colors duration-150 hover:border-outline dark:hover:border-border-hover"
		>
			<div className="mb-2.5 flex items-start justify-between gap-4">
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2 font-caption text-caption">
						<span className="font-label-sm font-medium text-label-sm text-on-surface-variant dark:text-on-surface-soft">
							{job.company}
						</span>
						<span className="text-outline dark:text-on-surface-faint">•</span>
						<span className="text-outline">Remote</span>
						{job.posted && (
							<>
								<span className="text-outline dark:text-on-surface-faint">•</span>
								<span className="text-outline">{job.posted}</span>
							</>
						)}
					</div>
					<button
						type="button"
						// onClick={() => open(job)}
						className="pt-0.5 text-left font-headline-md font-semibold text-headline-md text-on-surface transition-colors group-hover:text-primary-container"
					>
						{job.title}
					</button>
				</div>
				<button
					type="button"
					aria-label={`${isSaved ? "Unsave" : "Save"} ${job.title}`}
					aria-pressed={isSaved}
					onClick={() =>
						setSaved((ids) => (ids.includes(job.id) ? ids.filter((id) => id !== job.id) : [...ids, job.id]))
					}
					className="flex size-8 shrink-0 items-center justify-center rounded-lg text-outline transition-colors hover:bg-surface-container hover:text-primary dark:hover:text-on-surface"
				>
					<Bookmark className={`size-5 ${isSaved ? "fill-primary text-primary" : ""}`} />
				</button>
			</div>

			<div className="mb-3 flex flex-wrap items-center gap-3">
				<div className="flex items-baseline gap-1 font-numeric-data text-numeric-data">
					<span className="font-semibold text-[15px] text-on-surface">{job.budget}</span>
					<span className="font-caption text-caption text-on-surface-variant">{projectType}</span>
				</div>
				<span className="size-1 rounded-full bg-outline-variant" />
				<span className="font-caption text-caption text-on-surface-variant">{job.category}</span>
			</div>

			<p className="mb-4 line-clamp-2 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
				{job.description}
			</p>

			<div className="flex flex-col gap-3 border-surface-container border-t pt-3 dark:border-border-dark sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap items-center gap-1.5">
					{job.skills.slice(0, 4).map((skill) => (
						<span
							key={skill}
							className="rounded border border-transparent bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-secondary-fixed-variant dark:border-border-subtle dark:text-on-surface-soft"
						>
							{skill}
						</span>
					))}
				</div>
				<div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
					<button
						type="button"
						// onClick={() => open(job)}
						className="h-8 rounded-lg px-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
					>
						View details
					</button>
					<button
						type="button"
						onClick={() => {
							// setSelected(job)
							// setCompose(true)
						}}
						className="h-8 rounded-lg bg-primary px-3.5 font-label-md text-label-md text-surface-container-lowest transition-colors hover:bg-[#152243] dark:bg-white dark:text-background dark:hover:bg-[#f1f5f9]"
					>
						Apply now
					</button>
				</div>
			</div>
		</article>
	)
}

export default FreelancerJobCard
