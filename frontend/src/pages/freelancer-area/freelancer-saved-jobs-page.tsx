import { Link } from "@tanstack/react-router"
import { Bookmark, CircleCheck, FileText, Search, ShieldCheck, SlidersHorizontal, Upload, X } from "lucide-react"
import { useEffect, useState } from "react"
import FreelancerJobCard from "@/components/freelancer/freelancer-job-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { freelancerJobs } from "@/data/freelancer-workspace"
import useAuth from "@/hooks/useAuth"
import { useSavedJobs } from "@/hooks/useSavedJobs"

const primaryAction =
	"inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md text-on-primary hover:opacity-90 dark:bg-on-surface dark:text-background"
const secondaryAction =
	"inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 font-label-md text-label-md text-on-surface hover:bg-surface-container-low"
const panel = "rounded-lg border border-outline-variant bg-surface-container-lowest p-5"
const categories = [
	{ value: "all", label: "All saved" },
	{ value: "Design", label: "Design & UX" },
	{ value: "Development", label: "Frontend & Engineering" },
	{ value: "Marketing", label: "Strategy" },
]

export default function FreelancerSavedJobsPage() {
	const { saved, savedAt, loaded, error } = useSavedJobs()
	const { user } = useAuth()
	const [category, setCategory] = useState("all")
	const [query, setQuery] = useState("")
	const [sort, setSort] = useState("recent")
	const [searches, setSearches] = useState<string[]>([])
	const [searchError, setSearchError] = useState("")
	const searchKey = `freelancer-saved-searches:${user?.id ?? "preview"}`
	useEffect(() => {
		try {
			const data = JSON.parse(localStorage.getItem(searchKey) || "[]")
			setSearches(Array.isArray(data) ? data.filter((item: unknown): item is string => typeof item === "string") : [])
			setSearchError("")
		} catch {
			setSearches([])
			setSearchError("Saved searches couldn't be restored.")
		}
	}, [searchKey])
	const updateSearches = (next: string[]) => {
		try {
			localStorage.setItem(searchKey, JSON.stringify(next))
			setSearches(next)
			setSearchError("")
		} catch {
			setSearchError("Your search couldn't be saved on this device.")
		}
	}
	const allSaved = freelancerJobs.filter((job) => saved.includes(job.id))
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
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 py-8 md:px-6 md:py-10">
			<header className="flex flex-col gap-4 border-outline-variant border-b py-3 pb-8 md:flex-row md:items-end md:justify-between">
				<div className="flex max-w-2xl flex-col gap-4">
					<div className="flex flex-wrap items-center gap-2 font-caption text-caption">
						<span className="font-semibold text-on-surface-variant uppercase tracking-wider">Freelancer workspace</span>
						<span className="size-1 rounded-full bg-outline-variant" />
						<span className="flex items-center gap-1 font-medium text-primary">
							<span className="size-1.5 rounded-full bg-primary-container dark:bg-primary" />
							{allSaved.length} bookmarked {allSaved.length === 1 ? "opportunity" : "opportunities"}
						</span>
					</div>
					<h1 className="font-headline-xl font-semibold text-headline-xl text-on-surface tracking-tight">Saved Jobs</h1>
					<p className="font-body-md text-body-md text-on-surface-variant">
						Review and manage roles you’ve bookmarked. Keep your next opportunity in sight and get ready to apply.
					</p>
				</div>
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
			</header>
			{error && (
				<p role="alert" className="text-body-sm text-destructive">
					{error}
				</p>
			)}
			<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(280px,1fr)] lg:gap-8">
				<section aria-label="Saved opportunities" className="min-w-0 space-y-5">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<fieldset aria-label="Job categories" className="flex min-w-0 flex-wrap gap-1.5">
							{categories.map((item) => (
								<button
									type="button"
									key={item.value}
									aria-pressed={category === item.value}
									onClick={() => setCategory(item.value)}
									className={
										category === item.value
											? "flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 font-label-md text-label-md text-surface-container-lowest transition-colors dark:bg-on-surface dark:text-background"
											: "flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface dark:border-border-subtle"
									}
								>
									<span>{item.label}</span>
									<span
										className={
											category === item.value
												? "rounded bg-white/20 px-1.5 py-0.5 font-caption text-caption dark:bg-background/15 dark:text-background"
												: "rounded bg-surface-container px-1.5 py-0.5 font-caption text-caption text-outline"
										}
									>
										{allSaved.filter((job) => item.value === "all" || job.category === item.value).length}
									</span>
								</button>
							))}
						</fieldset>
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
					<section className={panel}>
						<div className="mb-4 flex items-center gap-2">
							<h2 className="font-headline-sm font-semibold text-headline-sm">Application readiness</h2>
							<span className="rounded bg-surface-container px-1.5 py-0.5 text-caption text-primary">Review</span>
						</div>
						<div className="space-y-2.5">
							{[
								{ icon: ShieldCheck, label: "Identity & account", to: "/freelancer-settings" as const },
								{ icon: CircleCheck, label: "Skills & availability", to: "/freelancer" as const },
								{ icon: FileText, label: "Proposal drafts", to: "/freelancer-proposals" as const },
							].map(({ icon: Icon, label, to }) => (
								<Link
									key={label}
									to={to}
									className="flex min-h-10 items-center gap-2.5 rounded bg-surface-container-low px-3 py-2 text-body-sm hover:bg-surface-container"
								>
									<Icon className="size-4 shrink-0 text-primary" />
									<span className="flex-1">{label}</span>
									<span className="text-caption text-primary">Review</span>
								</Link>
							))}
						</div>
						<Link to="/freelancer-settings" className={`${secondaryAction} mt-4 w-full bg-surface-container-low`}>
							Manage application settings
							<SlidersHorizontal className="size-4 text-outline" />
						</Link>
					</section>
					<section className={panel}>
						<h2 className="mb-4 font-headline-sm font-semibold text-headline-sm">Saved search queries</h2>
						<form
							onSubmit={(event) => {
								event.preventDefault()
								if (query.trim() && !searches.includes(query.trim())) updateSearches([...searches, query.trim()])
							}}
							className="flex items-center gap-2 rounded-lg border border-outline-variant px-2.5 py-1.5"
						>
							<Search className="size-4 shrink-0 text-outline" />
							<input
								aria-label="Search saved jobs"
								placeholder="Search your saved jobs"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								className="min-w-0 flex-1 bg-transparent py-1 text-body-sm outline-none"
							/>
							<button
								type="submit"
								disabled={!query.trim() || searches.includes(query.trim())}
								className="rounded px-1 py-1 text-label-sm text-primary disabled:opacity-40"
							>
								Save
							</button>
						</form>
						{searchError && (
							<p role="alert" className="mt-3 text-caption text-destructive">
								{searchError}
							</p>
						)}
						{searches.length ? (
							<ul className="mt-3 space-y-1">
								{searches.map((item) => (
									<li key={item} className="flex items-center gap-2">
										<button
											type="button"
											onClick={() => {
												setQuery(item)
												setCategory("all")
											}}
											className="flex min-w-0 flex-1 items-center gap-2 rounded py-2 text-left text-body-sm hover:text-primary"
										>
											<Search className="size-4 shrink-0 text-outline" />
											<span className="truncate">{item}</span>
										</button>
										<button
											type="button"
											aria-label={`Remove saved search ${item}`}
											onClick={() => updateSearches(searches.filter((value) => value !== item))}
											className="rounded p-2 text-outline hover:bg-surface-container"
										>
											<X className="size-3.5" />
										</button>
									</li>
								))}
							</ul>
						) : (
							<p className="my-4 text-body-sm text-on-surface-variant leading-relaxed">
								Save a search to quickly revisit the roles and skills you’re interested in.
							</p>
						)}
					</section>
				</aside>
			</div>
		</div>
	)
}
