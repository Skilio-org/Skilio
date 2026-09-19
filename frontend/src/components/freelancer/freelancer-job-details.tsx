import { Banknote, Building2, Clock3, Globe2, Sparkles } from "lucide-react"
import { SheetDescription, SheetTitle } from "@/components/ui/sheet"
import type { FreelancerJob } from "@/types/job"

export const JobDetails = ({ job, projectType }: { job: FreelancerJob; projectType: string }) => {
	return (
		<div className="min-h-0 flex-1 overflow-y-auto">
			<section className="border-border border-b p-6 sm:p-9">
				<p className="font-medium text-muted-foreground text-xs">{job.posted ?? "Recently posted"}</p>

				<SheetTitle className="mt-4 max-w-3xl font-display font-medium text-3xl tracking-tight sm:text-4xl">
					{job.title}
				</SheetTitle>

				<SheetDescription className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
					<span className="inline-flex items-center gap-2">
						<Building2 className="size-4" />
						{job.company}
					</span>

					<span className="inline-flex items-center gap-2">
						<Globe2 className="size-4" />
						Worldwide · Remote
					</span>
				</SheetDescription>
			</section>

			<section className="border-border border-b p-6 sm:p-9">
				<h3 className="font-semibold text-lg">Project summary</h3>

				<p className="mt-4 max-w-3xl text-base text-muted-foreground leading-7">{job.description}</p>
			</section>

			<section className="grid gap-7 border-border border-b p-6 sm:grid-cols-3 sm:p-9">
				<JobFact icon={<Clock3 className="size-4" />} title={projectType} detail="Engagement" />

				<JobFact icon={<Sparkles className="size-4" />} title="Intermediate" detail="Experience level" />

				<JobFact icon={<Banknote className="size-4" />} title={job.budget.split(" · ")[0]} detail={projectType} />
			</section>

			<section className="border-border border-b p-6 sm:p-9">
				<h3 className="font-semibold text-xl tracking-tight">Skills and expertise</h3>

				<div className="mt-4 flex flex-wrap gap-2">
					{job.skills.map((skill) => (
						<span
							key={skill}
							className="inline-flex min-h-8 items-center rounded-full bg-muted px-3.5 font-medium text-muted-foreground text-xs"
						>
							{skill}
						</span>
					))}
				</div>
			</section>
		</div>
	)
}

const JobFact = ({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) => {
	return (
		<div className="flex items-start gap-3">
			<span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-container text-on-surface-variant">
				{icon}
			</span>

			<div className="min-w-0">
				<p className="wrap-break-word font-semibold text-sm">{title}</p>

				<p className="mt-1 text-muted-foreground text-xs">{detail}</p>
			</div>
		</div>
	)
}
