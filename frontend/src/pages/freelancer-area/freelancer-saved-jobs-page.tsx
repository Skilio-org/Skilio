import { Link } from "@tanstack/react-router"
import { Bookmark, Search, Upload, X } from "lucide-react"
import { useState } from "react"
import FreelancerJobCard from "@/components/freelancer/freelancer-job-card"
import { jobFromApi } from "@/components/freelancer/freelancer-jobs-api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSavedJobs } from "@/hooks/useSavedJobs"
import QuickSavedSearch from "../common/quick-search"
import { WorkspacePageHeader } from "@/components/dashboard/dashboard-header"
import { useErrorToast } from "@/hooks/useErrorToast"

const primaryAction =
	"inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md text-on-primary hover:opacity-90 dark:bg-on-surface dark:text-background"
const secondaryAction =
	"inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 font-label-md text-label-md text-on-surface hover:bg-surface-container-low"
const panel = "rounded-lg border border-outline-variant bg-surface-container-lowest p-5"

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
				title="Saved Jobs"
				description="Review and manage roles you’ve bookmarked. Keep your next opportunity in sight and get ready to apply."
				meta={<span className="font-medium text-primary">bookmarked opportunities</span>}
				action={
					<div className="flex shrink-0 flex-wrap items-center gap-2.5">
						<button
							type="button"
							onClick={exportList}
							disabled={!allSaved.length}
							className={`${secondaryAction} disabled:opacity-50`}
						>
							<Upload className="size-4" />
							Export list
						</button>
						<Link to="/freelancer-jobs" className={primaryAction}>
							<Search className="size-4" />
							Browse more jobs
						</Link>
					</div>
				}
			/>
			<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(280px,1fr)] lg:gap-8">
				<section aria-label="Saved opportunities" className="min-w-0 space-y-5">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="flex min-w-0 flex-wrap gap-1.5" />
						<div className="flex items-center gap-2">
							<span className="font-caption text-caption text-outline">Sort by:</span>
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
					{query && (
						<div className="flex items-center justify-between gap-3 text-body-sm">
							<span>
								Search: <strong>{query}</strong>
							</span>
							<button
								type="button"
								onClick={() => setQuery("")}
								className="inline-flex items-center gap-1 text-primary"
							>
								Clear search
								<X className="size-4" />
							</button>
						</div>
					)}
					<div className="flex flex-col gap-3.5">
						{filtered.map((job) => (
							<FreelancerJobCard key={job.id} {...job} savedView />
						))}
					</div>
					{!filtered.length && (
						<div className={`${panel} py-16 text-center`}>
							<Bookmark className="mx-auto size-7 text-outline" />
							<h2 className="mt-4 font-headline-md font-semibold text-headline-md">
								{!loaded
									? "Loading your saved jobs…"
									: allSaved.length
										? "No matching saved jobs"
										: "Your shortlist starts here"}
							</h2>
							<p className="mx-auto mt-2 max-w-sm text-body-sm text-on-surface-variant leading-relaxed">
								{allSaved.length
									? "Try another category or search to find your saved opportunities."
									: "Bookmark a project on the jobs page and it will appear here."}
							</p>
							{allSaved.length ? (
								<button
									type="button"
									onClick={() => {
										setQuery("")
										setCategory("all")
									}}
									className={`${secondaryAction} mt-5`}
								>
									Clear filters
								</button>
							) : (
								<Link to="/freelancer-jobs" className={`${primaryAction} mt-5`}>
									Explore work
								</Link>
							)}
						</div>
					)}
					<p role="status" className="pt-3 font-caption text-caption text-outline">
						Showing {filtered.length} of {allSaved.length} saved {allSaved.length === 1 ? "contract" : "contracts"}
					</p>
				</section>
				<aside aria-label="Application tools" className="flex min-w-0 flex-col gap-5">
					<QuickSavedSearch />
				</aside>
			</div>
		</div>
	)
}
