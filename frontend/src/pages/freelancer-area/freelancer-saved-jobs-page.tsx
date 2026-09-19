import { Link } from "@tanstack/react-router"
import { ArrowRight, Bookmark, Search } from "lucide-react"
import { useEffect, useState } from "react"

import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header"
import FreelancerJobCard from "@/components/freelancer/freelancer-job-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { freelancerJobs, freelancerWorkspaceSubtitles, freelancerWorkspaceTitles } from "@/data/freelancer-workspace"
import useAuth from "@/hooks/useAuth"

const FreelancerSavedJobsPage = () => {
	const { user } = useAuth()

	const jobs = freelancerJobs

	const storageKey = `freelancer-work-v2:${user?.id ?? "preview"}`

	const [saved, setSaved] = useState<string[]>([])
	const [loaded, setLoaded] = useState(false)
	const [error, setError] = useState("")

	const [query, setQuery] = useState("")
	const [jobSort, setJobSort] = useState("recommended")

	useEffect(() => {
		try {
			const stored = localStorage.getItem(storageKey)

			if (!stored) {
				setSaved([])
				setLoaded(true)
				return
			}

			const data = JSON.parse(stored)

			setSaved(
				Array.isArray(data.saved) ? data.saved.filter((id: unknown): id is string => typeof id === "string") : [],
			)
		} catch {
			setSaved([])
			setError("Your saved jobs couldn't be restored.")
		}

		setLoaded(true)
	}, [storageKey])

	useEffect(() => {
		if (!loaded) return

		try {
			const stored = localStorage.getItem(storageKey)
			const existing = stored ? JSON.parse(stored) : {}

			localStorage.setItem(
				storageKey,
				JSON.stringify({
					...existing,
					saved,
				}),
			)
		} catch {
			setError("Saved jobs couldn't be updated on this device.")
		}
	}, [loaded, saved, storageKey])

	const savedJobs = jobs
		.filter((job) => saved.includes(job.id))
		.filter((job) => `${job.title} ${job.company} ${job.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
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

	const clearSearch = () => {
		setQuery("")
	}

	const clearSavedJobs = () => {
		setSaved([])
		setQuery("")
	}

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 py-8 md:px-6 md:py-10">
			<WorkspacePageHeader
				eyebrow="Your shortlist"
				title={freelancerWorkspaceTitles.savedJobs}
				description={freelancerWorkspaceSubtitles.savedJobs}
				action=""
			/>

			{error && (
				<p role="alert" className="text-destructive text-sm">
					{error}
				</p>
			)}

			{saved.length > 0 && (
				<div className="flex flex-col gap-3 sm:flex-row">
					<label className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-input bg-card px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
						<Search className="size-4 shrink-0 text-muted-foreground" />

						<span className="sr-only">Search saved jobs</span>

						<input
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search by title, skill, or company"
							className="min-w-0 flex-1 bg-transparent text-base outline-none sm:text-sm [&::-webkit-search-cancel-button]:hidden"
						/>

						{query && (
							<button
								type="button"
								onClick={clearSearch}
								aria-label="Clear saved jobs search"
								className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
							>
								<span aria-hidden="true" className="text-lg leading-none">
									×
								</span>
							</button>
						)}
					</label>

					<Select value={jobSort} onValueChange={setJobSort}>
						<SelectTrigger aria-label="Sort saved jobs" className="h-12 w-full rounded-xl bg-card sm:w-48">
							<SelectValue />
						</SelectTrigger>

						<SelectContent>
							<SelectItem value="recommended">Recommended</SelectItem>

							<SelectItem value="budget">Highest budget</SelectItem>

							<SelectItem value="title">Project title</SelectItem>
						</SelectContent>
					</Select>
				</div>
			)}

			<div className="flex flex-wrap items-center justify-between gap-3">
				<p role="status" className="text-muted-foreground text-sm">
					<strong className="font-semibold text-foreground">{savedJobs.length}</strong>{" "}
					{savedJobs.length === 1 ? "job" : "jobs"}
					{query ? " matching your search" : " saved"}
				</p>

				{saved.length > 0 && (
					<button
						type="button"
						onClick={clearSavedJobs}
						className="min-h-9 px-2 font-medium text-muted-foreground text-xs transition-colors hover:text-destructive"
					>
						Clear saved jobs
					</button>
				)}
			</div>

			{savedJobs.length > 0 ? (
				<div className="flex flex-col gap-3.5">
					{savedJobs.map((job) => (
						<FreelancerJobCard key={job.id} {...job} />
					))}
				</div>
			) : (
				<section className="rounded-xl border border-border bg-card px-6 py-16 text-center">
					<Bookmark className="mx-auto size-8 text-muted-foreground" />

					<h2 className="mt-5 font-medium text-xl tracking-tight">
						{saved.length > 0 ? "No matching saved jobs" : "Your shortlist starts here"}
					</h2>

					<p className="mx-auto mt-3 max-w-sm text-muted-foreground text-sm leading-6">
						{saved.length > 0
							? "Try another title, skill, or company."
							: "Save a job while browsing work. You'll find every opportunity you bookmark right here."}
					</p>

					{saved.length > 0 ? (
						<button type="button" onClick={clearSearch} className={`${workspaceStyles.secondaryAction} mt-6`}>
							Clear search
						</button>
					) : (
						<Link to="/freelancer-jobs" className={`${workspaceStyles.primaryAction} mt-6`}>
							Explore work
							<ArrowRight className="size-4" />
						</Link>
					)}
				</section>
			)}
		</div>
	)
}

export default FreelancerSavedJobsPage
