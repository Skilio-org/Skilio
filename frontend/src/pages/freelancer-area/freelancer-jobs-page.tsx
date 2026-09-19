import { ArrowDownWideNarrow, Search, SlidersHorizontal, X } from "lucide-react"
import { useState } from "react"

import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header"
import FreelancerJobCard from "@/components/freelancer/freelancer-job-card"
import { FreelancerJobFilterFields } from "@/components/freelancer/freelancer-job-filter-fields"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { freelancerJobs, freelancerWorkspaceSubtitles, freelancerWorkspaceTitles } from "@/data/freelancer-workspace"

const FreelancerJobsPage = () => {
	const jobs = freelancerJobs

	const [query, setQuery] = useState("")
	const [jobType, setJobType] = useState("any")
	const [jobSort, setJobSort] = useState("recommended")
	const [jobFiltersOpen, setJobFiltersOpen] = useState(false)

	const filteredJobs = jobs
		.filter((job) => {
			const matchesType = jobType === "any" || job.projectType === jobType

			const matchesSearch = `${job.title} ${job.company} ${job.skills.join(" ")}`
				.toLowerCase()
				.includes(query.toLowerCase())

			return matchesType && matchesSearch
		})
		.sort((first, second) => {
			if (jobSort === "title") {
				return first.title.localeCompare(second.title)
			}

			if (jobSort === "budget") {
				return second.budget.localeCompare(first.budget, undefined, {
					numeric: true,
				})
			}

			return Number(first.id) - Number(second.id)
		})

	const activeJobFilterCount = [jobType !== "any"].filter(Boolean).length

	const hasJobFilters = query.length > 0 || activeJobFilterCount > 0

	const clearJobFilters = () => {
		setJobType("any")
	}

	const clearJobSearch = () => {
		setQuery("")
		clearJobFilters()
	}

	const jobFilterFields = (group: string) => (
		<FreelancerJobFilterFields
			group={group}
			jobType={jobType}
			showClear={activeJobFilterCount > 0}
			onJobTypeChange={setJobType}
			onClear={clearJobFilters}
		/>
	)

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 py-8 md:px-6 md:py-10">
			<WorkspacePageHeader
				eyebrow="Freelancer workspace"
				title={freelancerWorkspaceTitles.jobs}
				description={freelancerWorkspaceSubtitles.jobs}
				action=""
			/>

			<search className="block">
				<form className="flex gap-2" onSubmit={(event) => event.preventDefault()}>
					<label className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl border border-input bg-card px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
						<Search className="size-5 shrink-0 text-muted-foreground" />

						<span className="sr-only">Search jobs</span>

						<input
							type="search"
							aria-label="Search jobs"
							placeholder="Try a role, skill, or company"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							className="min-w-0 flex-1 bg-transparent text-base outline-none [&::-webkit-search-cancel-button]:hidden"
						/>

						{query && (
							<button
								type="button"
								onClick={() => setQuery("")}
								aria-label="Clear search"
								className="grid size-10 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
							>
								<X className="size-4" />
							</button>
						)}
					</label>

					<button
						type="submit"
						className="hidden min-h-14 rounded-xl bg-primary px-7 font-medium text-primary-foreground text-sm hover:opacity-90 sm:block"
					>
						Search
					</button>

					<button
						type="button"
						aria-label="Open job filters"
						aria-expanded={jobFiltersOpen}
						onClick={() => setJobFiltersOpen(true)}
						className="relative grid min-h-14 w-14 shrink-0 place-items-center rounded-xl border border-border bg-card lg:hidden"
					>
						<SlidersHorizontal className="size-5" />

						{activeJobFilterCount > 0 && (
							<span className="absolute top-1 right-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
								{activeJobFilterCount}
							</span>
						)}
					</button>
				</form>

				<div className="mt-1 flex flex-wrap items-center gap-x-3 text-muted-foreground text-xs">
					<span>Try:</span>

					{["Product design", "React", "Content strategy"].map((item) => (
						<button
							key={item}
							type="button"
							onClick={() => setQuery(item)}
							className="min-h-11 font-medium text-foreground underline decoration-border underline-offset-4 hover:text-primary"
						>
							{item}
						</button>
					))}
				</div>
			</search>

			<div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
				<aside aria-label="Job filters" className="sticky top-24 hidden lg:block">
					<h2 className="mb-6 font-semibold text-base">Refine your search</h2>

					{jobFilterFields("desktop-job-type")}
				</aside>

				<section aria-label="Job results" className="min-w-0">
					<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
						<p className="text-muted-foreground text-sm" role="status">
							<strong className="font-semibold text-foreground">{filteredJobs.length}</strong>{" "}
							{filteredJobs.length === 1 ? "opportunity" : "opportunities"}
							{query ? ` matching “${query}”` : " to explore"}
						</p>

						<Select value={jobSort} onValueChange={setJobSort}>
							<SelectTrigger aria-label="Sort jobs" className="h-11 w-44 rounded-lg border-border bg-card text-xs">
								<ArrowDownWideNarrow className="size-3.5 text-muted-foreground" />
								<SelectValue />
							</SelectTrigger>

							<SelectContent align="end">
								<SelectItem value="recommended">Recommended</SelectItem>

								<SelectItem value="budget">Highest budget</SelectItem>

								<SelectItem value="title">Project title</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{hasJobFilters && (
						<div className="mb-4 flex flex-wrap gap-2">
							{jobType !== "any" && <JobFilterChip label={jobType} onRemove={() => setJobType("any")} />}

							{query && <JobFilterChip label={query} onRemove={() => setQuery("")} />}

							<button
								type="button"
								onClick={clearJobSearch}
								className="min-h-9 px-2 font-medium text-primary text-xs hover:underline"
							>
								Clear all
							</button>
						</div>
					)}

					{filteredJobs.length > 0 ? (
						<div className="flex flex-col gap-3.5">
							{filteredJobs.map((job) => (
								<FreelancerJobCard key={job.id} {...job} />
							))}
						</div>
					) : (
						<div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
							<Search className="mx-auto size-7 text-muted-foreground" />

							<h2 className="mt-5 font-medium text-xl tracking-tight">No matching projects</h2>

							<p className="mx-auto mt-3 max-w-sm text-muted-foreground text-sm leading-6">
								Try a broader skill, another category, or a different project type.
							</p>

							<button type="button" onClick={clearJobSearch} className={`${workspaceStyles.secondaryAction} mt-6`}>
								Browse all work
							</button>
						</div>
					)}
				</section>
			</div>

			<Sheet open={jobFiltersOpen} onOpenChange={setJobFiltersOpen}>
				<SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-sm">
					<SheetHeader className="border-border border-b">
						<SheetTitle>Refine your search</SheetTitle>

						<SheetDescription>Choose the project type and duration that fit your work.</SheetDescription>
					</SheetHeader>

					<div className="flex-1 overflow-y-auto p-6">{jobFiltersOpen && jobFilterFields("mobile-job-type")}</div>

					<div className="border-border border-t p-5">
						<button
							type="button"
							onClick={() => setJobFiltersOpen(false)}
							className={`${workspaceStyles.primaryAction} w-full`}
						>
							Show {filteredJobs.length} {filteredJobs.length === 1 ? "opportunity" : "opportunities"}
						</button>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	)
}

const JobFilterChip = ({ label, onRemove }: { label: string; onRemove: () => void }) => {
	return (
		<button
			type="button"
			onClick={onRemove}
			aria-label={`Remove ${label} filter`}
			className="inline-flex min-h-8 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container px-3 font-label-sm text-label-sm text-on-surface-variant"
		>
			{label}

			<X className="size-3" />
		</button>
	)
}

export default FreelancerJobsPage
