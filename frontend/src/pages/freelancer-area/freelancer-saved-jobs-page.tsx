import { Link } from "@tanstack/react-router"
import { Bookmark, Search, Upload } from "lucide-react"
import { useState } from "react"
import { EmptyState } from "@/components/common/empty-state"
import FreelancerJobCard from "@/components/freelancer/freelancer-job-card"
import { jobFromApi } from "@/components/freelancer/freelancer-job-mapper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSavedJobs } from "@/hooks/useSavedJobs"
import QuickSavedSearch from "../common/quick-search"
import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header"
import { useErrorToast } from "@/hooks/useErrorToast"

export default function FreelancerSavedJobsPage() {
	const { saved, savedJobs, savedAt, loaded, error } = useSavedJobs()
	useErrorToast(error, "saved-jobs-load")
	const [category, setCategory] = useState("all")
	const [query, setQuery] = useState("")
	const [sort, setSort] = useState("recent")

	const allSaved = savedJobs.map(jobFromApi)
	const filtered = allSaved
		.filter(
			(job) =>
				(category === "all" || category === job.category) &&
				`${job.title} ${job.company} ${job.skills.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()),
		)
		.sort((a, b) => {
			if (sort === "title") return a.title.localeCompare(b.title)
			if (sort === "budget")
				return (
					Number(b.budget.replace(/,/g, "").match(/[\d.]+/)?.[0] || 0) -
					Number(a.budget.replace(/,/g, "").match(/[\d.]+/)?.[0] || 0)
				)
			return (
				(Date.parse(savedAt[b.id] || "") || 0) - (Date.parse(savedAt[a.id] || "") || 0) ||
				saved.indexOf(b.id) - saved.indexOf(a.id)
			)
		})
	const exportList = () => {
		const cell = (value: string) => `"${(/^[=+@-]/.test(value) ? "'" : "") + value.replace(/"/g, '""')}"`
		const rows = [
			["Title", "Company", "Category", "Budget", "Skills"],
			...allSaved.map((job) => [job.title, job.company, job.category, job.budget, job.skills.join(", ")]),
		]
		const url = URL.createObjectURL(
			new Blob([rows.map((row) => row.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }),
		)
		const link = document.createElement("a")
		link.href = url
		link.download = "saved-jobs.csv"
		link.click()
		setTimeout(() => URL.revokeObjectURL(url), 1000)
	}
	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4  md:px-6 ">
			<WorkspacePageHeader
				eyebrow="Freelancer workspace"
				title="Saved jobs"
				description="Review and manage roles you’ve bookmarked. Keep your next opportunity in sight and get ready to apply."
				meta={
					<span className="font-medium text-primary">
						{allSaved.length} bookmarked {allSaved.length === 1 ? "job" : "jobs"}
					</span>
				}
				action={
					<div className="flex shrink-0 flex-wrap items-center gap-2.5">
						<button
							type="button"
							onClick={exportList}
							disabled={!allSaved.length}
							className={`${workspaceStyles.secondaryAction} disabled:opacity-50`}
						>
							<Upload className="size-4" />
							Export list
						</button>
						<Link to="/freelancer-jobs" className={workspaceStyles.primaryAction}>
							<Search className="size-4" />
							Browse more jobs
						</Link>
					</div>
				}
			/>
			<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
				<section aria-label="Saved opportunities" className="flex min-w-0 flex-col gap-6 lg:col-span-8">
					{allSaved.length > 0 && (
					<div className="flex flex-wrap items-center justify-between gap-3">
						<p role="status" className="font-medium text-body-sm">
							Showing {filtered.length} of {allSaved.length} saved {allSaved.length === 1 ? "job" : "jobs"}
						</p>
						<div className="flex items-center gap-2">
							<span className="font-caption text-caption text-outline">Sort:</span>
							<Select value={sort} onValueChange={setSort}>
								<SelectTrigger
									size="sm"
									aria-label="Sort saved jobs"
									className="w-44 rounded-lg border-outline-variant bg-surface-container-lowest px-3 font-normal text-[12px] text-on-surface leading-4 shadow-none hover:border-outline data-[state=open]:border-primary dark:bg-surface-card dark:hover:bg-surface-container [&>svg]:transition-transform data-[state=open]:[&>svg]:rotate-180"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent
									align="end"
									sideOffset={6}
									className="w-[var(--radix-select-trigger-width)] min-w-0 rounded-lg border-outline-variant bg-surface-container-lowest p-1 text-on-surface shadow-md [&_[data-radix-select-viewport]]:min-w-0"
								>
									{[
										["recent", "Recently saved"],
										["budget", "Highest budget"],
										["title", "Project title"],
									].map(([value, label]) => (
										<SelectItem
											key={value}
											value={value}
											className="min-h-8 cursor-pointer rounded px-3 pr-8 font-normal text-[12px] leading-4 focus:bg-surface-container focus:text-on-surface data-[state=checked]:bg-surface-container data-[state=checked]:text-primary"
										>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					)}
					{filtered.length > 0 && (
						<div className="flex flex-col gap-3.5">
							{filtered.map((job) => (
								<FreelancerJobCard key={job.id} {...job} savedView />
							))}
						</div>
					)}
					{!filtered.length && (
						<EmptyState
							icon={Bookmark}
							title={
								!loaded
									? "Loading your saved jobs…"
									: allSaved.length
										? "No matching saved jobs"
										: "Your shortlist starts here"
							}
							description={
								allSaved.length
									? "Try another category or search to find your saved opportunities."
									: "Bookmark a project on the jobs page and it will appear here. Saved jobs are easy to compare and apply to later."
							}
							action={
								loaded &&
								(allSaved.length ? (
									<button
										type="button"
										onClick={() => {
											setQuery("")
											setCategory("all")
										}}
										className={workspaceStyles.secondaryAction}
									>
										Clear filters
									</button>
								) : (
									<Link to="/freelancer-jobs" className={workspaceStyles.secondaryAction}>
										<Search className="size-4" />
										Browse all jobs
									</Link>
								))
							}
						/>
					)}
				</section>
				<aside aria-label="Application tools" className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-20 lg:col-span-4">
					<QuickSavedSearch />
				</aside>
			</div>
		</div>
	)
}
