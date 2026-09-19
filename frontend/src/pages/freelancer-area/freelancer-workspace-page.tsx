import { Link } from "@tanstack/react-router"
import {
	ArrowDownWideNarrow,
	ArrowLeft,
	ArrowRight,
	Banknote,
	Bookmark,
	BriefcaseBusiness,
	Building2,
	CheckCircle2,
	ChevronDown,
	Circle,
	Clock3,
	FileText,
	Globe2,
	Pencil,
	Search,
	SlidersHorizontal,
	Sparkles,
	type Wallet,
	X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { JobFormSection, jobFormField } from "@/components/common/job-form-section"
import { WorkspacePageHeader, WorkspaceSurface, workspaceStyles } from "@/components/dashboard/dashboard-header"
import { FreelancerJobFilterFields } from "@/components/freelancer/freelancer-job-filter-fields"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
	type ProposalDraft as Draft,
	freelancerJobs,
	freelancerWorkspaceSubtitles,
	freelancerWorkspaceTitles,
	type FreelancerJob as Job,
	seedProposals,
} from "@/data/freelancer-workspace"
import useAuth from "@/hooks/useAuth"

type FreelancerWorkspacePageName = "dashboard" | "jobs" | "proposals" | "savedJobs"

export function FreelancerDashboardPage() {
	return <FreelancerWorkspacePage page="dashboard" />
}

export function FreelancerJobsPage() {
	return <FreelancerWorkspacePage page="jobs" />
}

export function FreelancerProposalsPage() {
	return <FreelancerWorkspacePage page="proposals" />
}

export function FreelancerSavedJobsPage() {
	return <FreelancerWorkspacePage page="savedJobs" />
}

function FreelancerWorkspacePage({ page }: { page: FreelancerWorkspacePageName }) {
	const { user } = useAuth()
	const jobs = freelancerJobs
	const key = `freelancer-work-v2:${user?.id ?? "preview"}`
	const [saved, setSaved] = useState<string[]>([])
	const [drafts, setDrafts] = useState<Draft[]>([])
	const [loaded, setLoaded] = useState("")
	const [error, setError] = useState("")
	const [query, setQuery] = useState("")
	const [filter, setFilter] = useState("All work")
	const [jobType, setJobType] = useState("any")
	const [jobSort, setJobSort] = useState("recommended")
	const [jobFiltersOpen, setJobFiltersOpen] = useState(false)
	const [tab, setTab] = useState("Active")
	const [selected, setSelected] = useState<Job | null>(null)
	const [compose, setCompose] = useState(false)
	const [cover, setCover] = useState("")
	const [rate, setRate] = useState("")
	const selectedProjectType =
		selected?.projectType ?? (selected?.budget.includes("Fixed price") ? "Fixed price" : "Hourly")
	useEffect(() => {
		try {
			const stored = localStorage.getItem(key)
			const data = JSON.parse(stored || "{}")
			setSaved(Array.isArray(data.saved) ? data.saved.filter((s: unknown) => typeof s === "string") : [])
			setDrafts(
				Array.isArray(data.drafts)
					? data.drafts.filter(
							(d: Draft) =>
								d?.job &&
								[d.job.id, d.job.title, d.job.company, d.job.category, d.job.budget, d.job.description].every(
									(value) => typeof value === "string",
								) &&
								Array.isArray(d.job.skills) &&
								d.job.skills.every((value) => typeof value === "string") &&
								typeof d.cover === "string" &&
								typeof d.rate === "string",
						)
					: seedProposals,
			)
		} catch {
			setDrafts(seedProposals)
			setError("Your saved drafts couldn’t be restored. Showing demo proposals.")
		}
		setLoaded(key)
	}, [key])
	useEffect(() => {
		if (loaded !== key) return
		try {
			localStorage.setItem(key, JSON.stringify({ saved, drafts }))
		} catch {
			setError("Changes couldn’t be saved on this device.")
		}
	}, [key, loaded, saved, drafts])
	const filtered = jobs
		.filter(
			(j) =>
				(page !== "savedJobs" || saved.includes(j.id)) &&
				(filter === "All work" || filter === j.category || (filter === "Saved" && saved.includes(j.id))) &&
				(jobType === "any" || jobType === j.projectType) &&
				`${j.title} ${j.company} ${j.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase()),
		)
		.sort((first, second) => {
			if (jobSort === "title") return first.title.localeCompare(second.title)
			if (jobSort === "budget")
				return second.budget.localeCompare(first.budget, undefined, {
					numeric: true,
				})
			return Number(first.id) - Number(second.id)
		})
	const activeJobFilterCount = [jobType !== "any", filter === "Saved"].filter(Boolean).length
	const clearJobFilters = () => {
		setJobType("any")
		if (filter === "Saved") setFilter("All work")
	}
	const clearJobSearch = () => {
		setQuery("")
		setFilter("All work")
		clearJobFilters()
	}
	const hasJobFilters = !!query || filter !== "All work" || activeJobFilterCount > 0
	const jobFilterFields = (group: string) => (
		<FreelancerJobFilterFields
			group={group}
			jobType={jobType}
			showClear={activeJobFilterCount > 0}
			onJobTypeChange={setJobType}
			onClear={clearJobFilters}
		/>
	)
	const proposalTab = tab === "Active" ? "Drafts" : tab
	const visibleProposals = drafts.filter((draft) => (draft.status ?? "Drafts") === proposalTab)
	const submittedProposals = drafts.filter((draft) => (draft.status ?? "Drafts") === "Submitted")
	const firstName = user?.full_name?.trim().split(/\s+/)[0] || "there"
	const dashboardFilters = ["All work", ...Array.from(new Set(jobs.map((job) => job.category))).slice(0, 2)]
	const changeProposal = (id: string, status: Draft["status"]) => {
		setDrafts((items) => items.map((item) => (item.job.id === id ? { ...item, status } : item)))
		toast.success(
			status === "Submitted"
				? "Demo proposal submitted. Nothing was sent to a client."
				: status === "Archived"
					? "Proposal archived"
					: "Proposal restored to drafts",
		)
	}
	const open = (job: Job, draft?: Draft) => {
		setSelected(job)
		setCompose(!!draft)
		setCover(draft?.cover ?? "")
		setRate(draft?.rate ?? "")
	}
	const renderJobCard = (job: Job) => {
		const isSaved = saved.includes(job.id)
		const projectType = job.budget.toLowerCase().includes("fixed") ? "Fixed price" : "Hourly"

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
							onClick={() => open(job)}
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
							onClick={() => open(job)}
							className="h-8 rounded-lg px-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
						>
							View details
						</button>
						<button
							type="button"
							onClick={() => {
								setSelected(job)
								setCompose(true)
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

	const directoryJobList = <div className="flex flex-col gap-3.5">{filtered.map(renderJobCard)}</div>
	const dashboardJobList = <div className="flex flex-col gap-3.5">{filtered.slice(0, 4).map(renderJobCard)}</div>
	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 py-8 md:px-6 md:py-10">
			{page === "dashboard" ? (
				<header className="flex flex-col gap-4 border-outline-variant border-b py-3 pb-8 md:flex-row md:items-end md:justify-between">
					<div className="flex max-w-2xl flex-col gap-4">
						<div className="flex flex-wrap items-center gap-2">
							<span className="font-caption font-semibold text-caption text-on-surface-variant uppercase tracking-wider">
								Freelancer workspace
							</span>
							<span className="size-1 rounded-full bg-outline-variant" />
							<span className="flex items-center gap-1 font-caption font-medium text-caption text-primary dark:gap-1.5 dark:rounded dark:border dark:border-emerald-border dark:bg-emerald-well dark:px-2 dark:py-0.5 dark:text-emerald-text">
								<span className="size-1.5 animate-pulse rounded-full bg-primary-container dark:bg-[#10b981] dark:shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
								Available for new contracts
							</span>
						</div>
						<h1 className="font-headline-xl font-semibold text-headline-xl text-on-surface tracking-tight">
							Good to see you, {firstName}.
						</h1>
						<p className="font-body-md text-body-md text-on-surface-variant">
							Keep your profile current and discover verified opportunities curated specifically for your skill stack.
						</p>
					</div>
					<div className="flex items-center gap-2.5 self-start md:self-auto">
						<Link
							to="/freelancer-saved-jobs"
							className="flex h-9 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low dark:border-border-subtle dark:hover:border-border-input"
						>
							<Bookmark className="size-4 text-outline dark:text-on-surface-variant" />
							Saved ({saved.length})
						</Link>
						<Link
							to="/freelancer-jobs"
							className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md text-surface-container-lowest shadow-sm transition-colors hover:bg-[#152243] dark:bg-white dark:text-background dark:shadow-[0_0_15px_rgba(255,255,255,0.08)] dark:hover:bg-[#f1f5f9]"
						>
							<Search className="size-4" />
							Browse all jobs
						</Link>
					</div>
				</header>
			) : (
				<WorkspacePageHeader
					eyebrow={page === "savedJobs" ? "Your shortlist" : "Freelancer workspace"}
					title={freelancerWorkspaceTitles[page]}
					description={freelancerWorkspaceSubtitles[page]}
					action=""
				/>
			)}
			{error && (
				<p role="alert" className="text-destructive text-sm">
					{error}
				</p>
			)}
			{page === "dashboard" && (
				<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
					<section className="flex flex-col gap-6 lg:col-span-8">
						<div className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
								{dashboardFilters.map((item) => {
									const active = filter === item
									const count = item === "All work" ? jobs.length : jobs.filter((job) => job.category === item).length

									return (
										<button
											key={item}
											type="button"
											onClick={() => setFilter(item)}
											className={
												active
													? "flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 font-label-md text-label-md text-surface-container-lowest transition-colors dark:border dark:border-primary/50 dark:bg-surface-container-high dark:text-white dark:shadow-[0_0_10px_rgba(59,130,246,0.15)]"
													: "flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface dark:border-border-subtle"
											}
										>
											<span>{item === "All work" ? "All matches" : item}</span>
											<span
												className={
													active
														? "rounded bg-white/20 px-1.5 py-0.5 font-caption text-caption dark:bg-primary/20 dark:text-on-primary-container"
														: "rounded bg-surface-container px-1.5 py-0.5 font-caption text-caption text-outline"
												}
											>
												{count}
											</span>
										</button>
									)
								})}
							</div>
							<div className="flex items-center gap-2 self-end sm:self-auto">
								<span className="font-caption text-caption text-outline">
									Sorted by:{" "}
									<strong className="font-medium text-on-surface dark:text-on-surface-strong">Best Match</strong>
								</span>
								<button
									type="button"
									title="Adjust preferences"
									onClick={() => setJobFiltersOpen(true)}
									className="p-1 text-outline transition-colors hover:text-on-surface"
								>
									<SlidersHorizontal className="size-[18px]" />
								</button>
							</div>
						</div>

						<div className="flex items-center justify-between px-1">
							<div className="flex items-center gap-2">
								<h2 className="font-headline-sm font-semibold text-headline-sm text-on-surface">
									Opportunities to explore
								</h2>
								<span className="size-1.5 rounded-full bg-outline-variant" />
								<span className="font-caption text-caption text-outline">Updated recently</span>
							</div>
							<Link
								to="/freelancer-jobs"
								className="flex items-center gap-0.5 font-label-sm font-medium text-label-sm text-primary transition-colors hover:text-primary-container"
							>
								View all
								<ArrowRight className="size-3.5" />
							</Link>
						</div>

						{filtered.length ? (
							dashboardJobList
						) : (
							<Empty
								icon={BriefcaseBusiness}
								title="No opportunities in this category"
								detail="Try another category or browse all available work."
							/>
						)}

						{filtered.length > 0 && (
							<div className="flex justify-center pt-2 pb-6">
								<Link
									to="/freelancer-jobs"
									className="flex h-9 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-6 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low dark:border-border-subtle dark:hover:border-border-input"
								>
									Load more opportunities
									<ChevronDown className="size-4 text-outline" />
								</Link>
							</div>
						)}
					</section>

					<aside className="flex flex-col gap-5 lg:sticky lg:top-20 lg:col-span-4">
						<section className="relative overflow-hidden rounded-lg border border-outline-variant bg-gradient-to-b from-[#e8f1fc] to-[#f0f6fd] p-5 dark:from-[#111c33] dark:to-[#0f172a] dark:shadow-sm">
							<div className="mb-3">
								<h2 className="font-headline-sm font-semibold text-headline-sm text-on-surface">
									Let your profile do the talking
								</h2>
								<p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
									Add your verified skills, set your target rate, and showcase client work you’re proud of.
								</p>
							</div>

							<div className="my-3.5 rounded-lg border border-outline-variant bg-surface-container-lowest p-3.5 shadow-sm dark:border-border-subtle dark:bg-background/70 dark:shadow-inner">
								<div className="mb-1.5 flex items-center justify-between font-caption text-caption">
									<span className="font-medium text-on-surface dark:text-on-surface-soft">Profile readiness</span>
									<span className="font-medium text-primary dark:text-primary-hover">Review</span>
								</div>
								<div className="h-px w-full bg-surface-container dark:bg-border-dark" />
								<ul className="mt-3 flex flex-col gap-2 font-caption text-caption text-on-surface-variant">
									<li className="flex items-center gap-2">
										<CheckCircle2 className="size-3.5 shrink-0 text-primary-container dark:text-emerald-text" />
										<span>Keep your skills and rate current</span>
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="size-3.5 shrink-0 text-primary-container dark:text-emerald-text" />
										<span>Show strong portfolio work</span>
									</li>
									<li className="flex items-center gap-2 text-on-surface">
										<Circle className="size-3.5 shrink-0 text-outline" />
										<span>Review your public profile before applying</span>
									</li>
								</ul>
							</div>

							<Link
								to="/freelancer"
								className="group flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md text-surface-container-lowest shadow-sm transition-colors hover:bg-[#152243] dark:bg-white dark:text-background dark:shadow-[0_0_20px_rgba(255,255,255,0.08)] dark:hover:bg-[#f1f5f9]"
							>
								Complete profile
								<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
							</Link>
						</section>

						<section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
							<div className="mb-4 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<h3 className="font-headline-sm font-semibold text-headline-sm text-on-surface">Active proposals</h3>
									<span className="rounded border border-transparent bg-surface-container px-1.5 py-0.5 font-caption text-caption text-outline dark:border-border-subtle dark:text-on-surface-variant">
										{submittedProposals.length}
									</span>
								</div>
								<Link to="/freelancer-proposals" className="font-label-sm text-label-sm text-primary hover:underline">
									View all
								</Link>
							</div>
							<div className="flex flex-col gap-3">
								{submittedProposals.slice(0, 2).length ? (
									submittedProposals.slice(0, 2).map((proposal) => (
										<button
											key={proposal.job.id}
											type="button"
											onClick={() => open(proposal.job, proposal)}
											className="flex flex-col gap-1.5 rounded-lg border border-outline-variant p-3 text-left transition-colors hover:bg-surface-container-low dark:bg-background/50"
										>
											<div className="flex w-full items-center justify-between gap-3">
												<span className="truncate font-label-sm font-medium text-label-sm text-on-surface">
													{proposal.job.title}
												</span>
												<span className="shrink-0 rounded bg-primary-fixed px-2 py-0.5 font-caption font-medium text-caption text-on-primary-fixed">
													Submitted
												</span>
											</div>
											<div className="flex w-full items-center justify-between gap-3 font-caption text-caption text-outline">
												<span className="truncate">
													{proposal.job.company} • {proposal.job.budget}
												</span>
												<span className="shrink-0">{proposal.job.posted ?? "Recently"}</span>
											</div>
										</button>
									))
								) : (
									<p className="rounded-lg border border-outline-variant border-dashed px-3 py-4 font-body-sm text-body-sm text-on-surface-variant">
										Submitted proposals will appear here.
									</p>
								)}
							</div>
						</section>

						<section className="flex flex-col gap-3.5 rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
							<div className="flex items-center justify-between">
								<h3 className="font-headline-sm font-semibold text-headline-sm text-on-surface">Quick searches</h3>
								<Pencil className="size-4 text-outline" />
							</div>
							<div className="flex flex-col gap-2">
								{["Product design", "React & Design Systems"].map((search) => (
									<button
										key={search}
										type="button"
										onClick={() => {
											setQuery(search)
											setFilter("All work")
										}}
										className="group flex items-center justify-between rounded p-2 text-left transition-colors hover:bg-surface-container"
									>
										<span className="flex items-center gap-2">
											<Search className="size-4 text-outline" />
											<span className="font-body-sm text-body-sm text-on-surface transition-colors group-hover:text-primary-container">
												{search}
											</span>
										</span>
										<ArrowRight className="size-3.5 text-outline" />
									</button>
								))}
							</div>
							<div className="flex items-center justify-between border-outline-variant border-t pt-3 font-caption text-caption text-on-surface-variant">
								<span>Use these to jump back into common searches.</span>
								<Link to="/freelancer-jobs" className="font-medium text-primary hover:underline">
									Browse
								</Link>
							</div>
						</section>
					</aside>
				</div>
			)}
			{page === "savedJobs" && (
				<>
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
										onClick={() => setQuery("")}
										aria-label="Clear saved search"
										className="grid size-10 place-items-center rounded-lg hover:bg-muted"
									>
										<X className="size-4" />
									</button>
								)}
							</label>
							<Select value={jobSort} onValueChange={setJobSort}>
								<SelectTrigger aria-label="Sort saved jobs" className="h-12 w-full rounded-xl bg-card sm:w-48">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="recommended">Recommended</SelectItem>
									<SelectItem value="title">Project title</SelectItem>
								</SelectContent>
							</Select>
						</div>
					)}
					<p role="status" className="text-muted-foreground text-sm">
						<strong className="font-semibold text-foreground">{filtered.length}</strong>{" "}
						{filtered.length === 1 ? "job" : "jobs"}
						{query ? " matching your search" : " saved"}
					</p>
					{filtered.length ? (
						directoryJobList
					) : (
						<section className="rounded-xl border border-border bg-card px-6 py-16 text-center">
							<Bookmark className="mx-auto size-8 text-muted-foreground" />
							<h2 className="mt-5 font-medium text-xl tracking-tight">
								{saved.length ? "No matching saved jobs" : "Your shortlist starts here"}
							</h2>
							<p className="mx-auto mt-3 max-w-sm text-muted-foreground text-sm leading-6">
								{saved.length
									? "Try another title, skill, or company."
									: "Save a job while browsing work. You’ll find every opportunity you bookmark right here."}
							</p>
							{saved.length ? (
								<button
									type="button"
									onClick={() => setQuery("")}
									className={`${workspaceStyles.secondaryAction} mt-6`}
								>
									Clear search
								</button>
							) : (
								<Link to="/freelancer-jobs" className={`${workspaceStyles.primaryAction} mt-6`}>
									Explore work <ArrowRight className="size-4" />
								</Link>
							)}
						</section>
					)}
				</>
			)}
			{page === "jobs" && (
				<>
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
									<strong className="font-semibold text-foreground">{filtered.length}</strong>{" "}
									{filtered.length === 1 ? "opportunity" : "opportunities"}
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
									{filter !== "All work" && <JobFilterChip label={filter} onRemove={() => setFilter("All work")} />}
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
							{filtered.length ? (
								directoryJobList
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
									Show {filtered.length} {filtered.length === 1 ? "opportunity" : "opportunities"}
								</button>
							</div>
						</SheetContent>
					</Sheet>
				</>
			)}
			{page === "proposals" && (
				<>
					<div className="flex flex-wrap gap-2">
						{["Drafts", "Submitted", "Archived"].map((t) => (
							<button
								key={t}
								type="button"
								className={
									(tab === "Active" ? "Drafts" : tab) === t
										? workspaceStyles.primaryAction
										: workspaceStyles.secondaryAction
								}
								onClick={() => setTab(t)}
							>
								{t}
							</button>
						))}
					</div>
					{visibleProposals.length ? (
						<div className="space-y-4">
							{visibleProposals.map((d) => (
								<WorkspaceSurface key={d.job.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
									<div>
										<p className="text-muted-foreground text-xs">
											{d.status ?? "Drafts"} · {d.job.company}
										</p>
										<h2 className="mt-2 font-semibold text-lg">{d.job.title}</h2>
										<p className="mt-2 text-muted-foreground text-sm">
											Proposed {d.job.budget.includes("Fixed price") ? "budget" : "rate"}: ${d.rate}
											{d.job.budget.includes("Fixed price") ? "" : "/hr"}
										</p>
									</div>
									<div className="flex flex-wrap gap-2">
										{proposalTab === "Drafts" && (
											<>
												<button
													type="button"
													className={workspaceStyles.secondaryAction}
													onClick={() => open(d.job, d)}
												>
													Edit draft
												</button>
												<button
													type="button"
													className={workspaceStyles.primaryAction}
													onClick={() => changeProposal(d.job.id, "Submitted")}
												>
													Submit demo proposal
												</button>
											</>
										)}
										{proposalTab === "Submitted" && (
											<button
												type="button"
												className={workspaceStyles.secondaryAction}
												onClick={() => {
													setSelected(d.job)
													setCompose(false)
												}}
											>
												View job
											</button>
										)}
										<button
											type="button"
											className={workspaceStyles.secondaryAction}
											onClick={() => changeProposal(d.job.id, proposalTab === "Archived" ? "Drafts" : "Archived")}
										>
											{proposalTab === "Archived" ? "Restore draft" : "Archive"}
										</button>
									</div>
								</WorkspaceSurface>
							))}
						</div>
					) : (
						<Empty
							icon={FileText}
							title={
								tab === "Submitted"
									? "No submitted proposals"
									: tab === "Archived"
										? "No archived proposals"
										: "Start with a project that fits"
							}
							detail="Your proposals will appear here. Browse work and prepare a thoughtful introduction."
							action={
								<Link className={workspaceStyles.primaryAction} to="/freelancer-jobs">
									Find work
									<ArrowRight className="size-4" />
								</Link>
							}
						/>
					)}
				</>
			)}
			<Sheet
				open={!!selected}
				onOpenChange={(open) => {
					if (!open) setSelected(null)
				}}
			>
				<SheetContent
					side="right"
					showCloseButton={false}
					className={
						compose
							? "w-full max-w-none gap-0 bg-card p-0 sm:max-w-180"
							: "w-full max-w-none gap-0 p-0 sm:w-[min(78vw,1180px)] sm:max-w-none"
					}
				>
					{selected && (
						<>
							<header className="flex h-18 shrink-0 items-center justify-between gap-4 border-border border-b bg-card px-5 sm:px-7">
								<SheetClose className="inline-flex min-h-11 items-center gap-2 rounded-lg font-medium text-muted-foreground text-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
									<ArrowLeft className="size-4" />
									Back to jobs
								</SheetClose>
								<p className="hidden text-muted-foreground text-xs sm:block">{selected.company} · Remote opportunity</p>
							</header>
							<div
								className={
									compose
										? "flex min-h-0 flex-1 flex-col"
										: "min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_310px] lg:overflow-hidden"
								}
							>
								<main className={compose ? "flex min-h-0 flex-1 flex-col" : "min-w-0 lg:overflow-y-auto"}>
									{compose ? (
										<section className="flex min-h-0 flex-1 flex-col">
											<div className="border-border border-b px-6 py-6 sm:px-8">
												<p className="mb-2 font-semibold text-primary text-xs">YOUR NEXT OPPORTUNITY</p>
												<SheetTitle className="font-semibold text-2xl tracking-tight">
													Make your introduction
												</SheetTitle>
												<SheetDescription className="mt-2 text-sm leading-6">
													A thoughtful proposal is the start of a great collaboration.
												</SheetDescription>
											</div>
											<form
												className="flex min-h-0 flex-1 flex-col"
												onSubmit={(event) => {
													event.preventDefault()
													setDrafts((items) => [
														...items.filter((draft) => draft.job.id !== selected.id),
														{
															job: selected,
															cover: cover.trim(),
															rate,
															status: "Drafts",
														},
													])
													setSelected(null)
													toast.success("Proposal draft saved on this device")
												}}
											>
												<div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-6 sm:px-8">
													<div className="rounded-xl border border-border bg-muted/40 p-4">
														<p className="text-muted-foreground text-xs">Applying to · {selected.company}</p>
														<p className="mt-2 font-semibold text-sm leading-6">{selected.title}</p>
														<p className="mt-2 text-muted-foreground text-xs">{selected.budget}</p>
														<button
															type="button"
															onClick={() => setCompose(false)}
															className="mt-2 min-h-11 font-medium text-primary text-sm hover:underline"
														>
															View job details <span aria-hidden="true">↗</span>
														</button>
													</div>
													<JobFormSection
														title="Tell them why you’re a good fit"
														description="Share relevant experience and how you’d approach this project."
													>
														<label className="block font-medium text-sm">
															Cover letter
															<textarea
																required
																minLength={40}
																maxLength={5000}
																className={`${jobFormField} min-h-40 resize-y leading-6`}
																rows={6}
																value={cover}
																onChange={(event) => setCover(event.target.value)}
																placeholder="Hi! Your project caught my attention because…"
															/>
															<span className="mt-2 block text-muted-foreground text-xs">
																At least 40 characters{" "}
																<span className="float-right">{cover.length.toLocaleString()} / 5,000</span>
															</span>
														</label>
													</JobFormSection>
												</div>
												<footer className="shrink-0 border-border border-t px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
													<div className="flex items-center justify-between gap-3">
														<button
															type="button"
															onClick={() => setCompose(false)}
															className={workspaceStyles.secondaryAction}
														>
															Back
														</button>
														<button className={workspaceStyles.primaryAction} type="submit">
															Send
															<ArrowRight className="size-4" />
														</button>
													</div>
												</footer>
											</form>
										</section>
									) : (
										<>
											<section className="border-border border-b p-6 sm:p-9">
												<p className="font-medium text-muted-foreground text-xs">
													{selected.posted ?? "Recently posted"}
												</p>
												<SheetTitle className="mt-4 max-w-3xl font-display font-medium text-3xl tracking-tight sm:text-4xl">
													{selected.title}
												</SheetTitle>
												<SheetDescription className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
													<span className="inline-flex items-center gap-2">
														<Building2 className="size-4" /> {selected.company}
													</span>
													<span className="inline-flex items-center gap-2">
														<Globe2 className="size-4" /> Worldwide · Remote
													</span>
												</SheetDescription>
											</section>
											<section className="border-border border-b p-6 sm:p-9">
												<h3 className="font-semibold text-lg">Project summary</h3>
												<p className="mt-4 max-w-3xl text-base text-muted-foreground leading-7">
													{selected.description}
												</p>
											</section>
											<section className="grid gap-7 border-border border-b p-6 sm:grid-cols-3 sm:p-9">
												<JobFact icon={Clock3} title={selectedProjectType} detail="Engagement" />
												<JobFact icon={Sparkles} title="Intermediate" detail="Experience level" />
												<JobFact icon={Banknote} title={selected.budget.split(" · ")[0]} detail={selectedProjectType} />
											</section>
											<section className="border-border border-b p-6 sm:p-9">
												<p className="text-sm">
													<span className="font-semibold">Project type:</span> {selectedProjectType}
												</p>
											</section>
											<section className="border-border border-b p-6 sm:p-9">
												<h3 className="font-semibold text-xl tracking-tight">Skills and expertise</h3>
												<p className="mt-5 font-medium text-sm">Required skills</p>
												<div className="mt-3 flex flex-wrap gap-2">
													{selected.skills.map((skill) => (
														<span
															key={skill}
															className="inline-flex min-h-8 items-center rounded-full bg-muted px-3.5 font-medium text-muted-foreground text-xs"
														>
															{skill}
														</span>
													))}
												</div>
											</section>
											<section className="grid gap-8 p-6 sm:grid-cols-2 sm:p-9">
												<div>
													<h3 className="font-semibold text-lg">Preferred qualifications</h3>
													<p className="mt-3 text-muted-foreground text-sm leading-6">
														Clear communication, relevant project examples, and reliable availability.
													</p>
												</div>
												<div>
													<h3 className="font-semibold text-lg">Activity on this job</h3>
													<dl className="mt-3 space-y-2 text-muted-foreground text-sm">
														<div className="flex justify-between gap-4">
															<dt>Proposals</dt>
															<dd className="text-foreground">5–10</dd>
														</div>
														<div className="flex justify-between gap-4">
															<dt>Interviewing</dt>
															<dd className="text-foreground">1</dd>
														</div>
														<div className="flex justify-between gap-4">
															<dt>Invites sent</dt>
															<dd className="text-foreground">2</dd>
														</div>
													</dl>
												</div>
											</section>
										</>
									)}
								</main>
								{!compose && (
									<aside className="border-border border-t bg-card p-6 lg:overflow-y-auto lg:border-t-0 lg:border-l lg:p-7">
										<div className="grid gap-3">
											<button
												type="button"
												className={`${workspaceStyles.primaryAction} w-full`}
												onClick={() => setCompose(true)}
											>
												{compose ? "Editing proposal" : "Apply now"}
												{!compose && <ArrowRight className="size-4" />}
											</button>
											<button
												type="button"
												aria-pressed={saved.includes(selected.id)}
												onClick={() =>
													setSaved((ids) =>
														ids.includes(selected.id) ? ids.filter((id) => id !== selected.id) : [...ids, selected.id],
													)
												}
												className={`${workspaceStyles.secondaryAction} w-full`}
											>
												<Bookmark
													className={`size-4 ${saved.includes(selected.id) ? "fill-primary text-primary" : ""}`}
												/>
												{saved.includes(selected.id) ? "Job saved" : "Save job"}
											</button>
										</div>
										<section className="mt-8 border-border border-t pt-7">
											<p className="text-muted-foreground text-xs">About the client</p>
											<h3 className="mt-2 font-semibold text-xl">{selected.company}</h3>
											<dl className="mt-6 space-y-5 text-sm">
												<div>
													<dt className="text-muted-foreground">Location</dt>
													<dd className="mt-1 font-medium">Worldwide</dd>
												</div>
												<div>
													<dt className="text-muted-foreground">Member since</dt>
													<dd className="mt-1 font-medium">2023</dd>
												</div>
											</dl>
										</section>
									</aside>
								)}
							</div>
						</>
					)}
				</SheetContent>
			</Sheet>
		</div>
	)
}

function JobFilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
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

function JobFact({ icon: Icon, title, detail }: { icon: typeof Wallet; title: string; detail: string }) {
	return (
		<div className="flex items-start gap-3">
			<span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-container text-on-surface-variant">
				<Icon className="size-4" />
			</span>
			<div className="min-w-0">
				<p className="wrap-break-word font-semibold text-sm">{title}</p>
				<p className="mt-1 text-muted-foreground text-xs">{detail}</p>
			</div>
		</div>
	)
}

function Empty({
	icon: Icon,
	title,
	detail,
	action,
}: {
	icon: typeof Wallet
	title: string
	detail: string
	action?: React.ReactNode
}) {
	return (
		<WorkspaceSurface className="grid min-h-72 place-items-center border-outline-variant border-dashed bg-surface-container-lowest p-8 text-center">
			<div>
				<span className="mx-auto grid size-14 place-items-center rounded-lg border border-outline-variant bg-surface-container text-primary">
					<Icon className="size-6" strokeWidth={1.5} />
				</span>
				<h2 className="mt-5 font-headline-lg font-semibold text-headline-lg text-on-surface">{title}</h2>
				<p className="mx-auto mt-3 max-w-lg font-body-sm text-body-sm text-on-surface-variant leading-6">{detail}</p>
				{action && <div className="mt-5">{action}</div>}
			</div>
		</WorkspaceSurface>
	)
}
