import { ArrowLeft, Bookmark, CircleCheck } from "lucide-react"
import { useRef, useState } from "react"
import { JobDetails } from "@/components/freelancer/freelancer-job-details"
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet"
import { useFreelancerProposals } from "@/hooks/useFreelancerProposals"
import { useSavedJobs } from "@/hooks/useSavedJobs"
import type { FreelancerJob } from "@/types/job"

const FreelancerJobCard = ({ savedView = false, ...job }: FreelancerJob & { savedView?: boolean }) => {
	const [detailsOpen, setDetailsOpen] = useState(false)
	const [initiallyApplying, setInitiallyApplying] = useState(false)
	const detailsTrigger = useRef<HTMLButtonElement | null>(null)
	const { saved, savedAt, toggleSaved, error } = useSavedJobs()
	const { isSubmitted } = useFreelancerProposals()
	const hasApplied = isSubmitted(job.id)
	const isSaved = saved.includes(job.id)
	const projectType = job.projectType

	return (
		<Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
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
							{(savedView || job.posted) && (
								<>
									<span className="text-outline dark:text-on-surface-faint">•</span>
									<span className="text-outline">
										{savedView
											? savedAt[job.id]
												? `Saved ${new Date(savedAt[job.id]).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
												: "Saved to your shortlist"
											: job.posted}
									</span>
								</>
							)}
						</div>
						<button
							type="button"
							onClick={(event) => {
								detailsTrigger.current = event.currentTarget
								setInitiallyApplying(false)
								setDetailsOpen(true)
							}}
							aria-haspopup="dialog"
							className="relative pt-0.5 text-left font-headline-md font-semibold text-headline-md text-on-surface transition-colors after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 group-hover:text-primary-container group-hover:after:scale-x-100"
						>
							{job.title}
						</button>
					</div>
					<button
						type="button"
						aria-label={`${isSaved ? "Unsave" : "Save"} ${job.title}`}
						aria-pressed={isSaved}
						onClick={() => toggleSaved(job.id)}
						className="flex size-8 shrink-0 items-center justify-center rounded-lg text-outline transition-colors hover:bg-surface-container hover:text-primary dark:hover:text-on-surface"
					>
						<Bookmark className={`size-5 ${isSaved ? "fill-primary text-primary" : ""}`} />
					</button>
				</div>

				{error && (
					<p role="alert" className="mb-3 text-destructive text-sm">
						{error}
					</p>
				)}
				<div className="mb-3 flex flex-wrap items-center gap-3">
					<div className="flex items-baseline gap-2 font-numeric-data text-numeric-data">
						<span className="font-semibold text-[15px] text-on-surface">{job.budget.split(" · ")[0]}</span>
						<span className="font-caption text-caption text-on-surface-variant">{projectType}</span>
					</div>
					<span className="size-1 rounded-full bg-outline-variant" />
					<span className="font-caption text-caption text-on-surface-variant">{job.category}</span>
				</div>

				<p className="mb-4 line-clamp-2 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
					{job.description}
				</p>

				<div className="flex flex-col gap-3 border-surface-container border-t pt-3 sm:flex-row sm:items-center sm:justify-between dark:border-border-dark">
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
						{savedView && (
							<button
								type="button"
								onClick={() => toggleSaved(job.id)}
								className="h-8 rounded-lg px-3 font-label-md text-destructive text-label-md hover:bg-destructive/10"
							>
								Remove
							</button>
						)}
						<button
							type="button"
							onClick={(event) => {
								detailsTrigger.current = event.currentTarget
								setInitiallyApplying(false)
								setDetailsOpen(true)
							}}
							aria-haspopup="dialog"
							className="h-8 rounded-lg px-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
						>
							View details
						</button>
						{hasApplied ? (
							<span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 font-label-md text-label-md text-primary dark:border-border-subtle dark:bg-surface-container">
								<CircleCheck className="size-3.5" />
								Applied
							</span>
						) : (
							<button
								type="button"
								onClick={(event) => {
									detailsTrigger.current = event.currentTarget
									setInitiallyApplying(true)
									setDetailsOpen(true)
								}}
								aria-haspopup="dialog"
								className="h-8 rounded-lg bg-primary px-3.5 font-label-md text-label-md text-surface-container-lowest transition-colors hover:bg-[#152243] dark:bg-on-surface dark:font-semibold dark:text-background dark:hover:bg-white"
							>
								Apply now
							</button>
						)}
					</div>
				</div>
			</article>
			<SheetContent
				side="right"
				showCloseButton={false}
				className="w-full max-w-none gap-0 bg-card p-0 sm:w-[min(88vw,1040px)] sm:max-w-none"
				onCloseAutoFocus={(event) => {
					event.preventDefault()
					detailsTrigger.current?.focus()
				}}
			>
				<header className="flex h-14 shrink-0 items-center justify-between gap-4 border-border border-b bg-card px-5 sm:px-7">
					<SheetClose className="inline-flex min-h-11 items-center gap-2 rounded-lg font-medium text-muted-foreground text-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
						<ArrowLeft className="size-4" />
						Back to opportunities
					</SheetClose>
					<p className="hidden text-muted-foreground text-xs sm:block">{job.company} · Remote opportunity</p>
				</header>
				<JobDetails job={job} projectType={projectType} initiallyApplying={initiallyApplying} />
			</SheetContent>
		</Sheet>
	)
}

export default FreelancerJobCard
