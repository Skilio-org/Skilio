import { Link } from "@tanstack/react-router"
import { Bookmark, ChevronDown, Filter, Search, SlidersHorizontal, X } from "lucide-react"
import { useEffect, useState } from "react"
import FreelancerJobCard from "@/components/freelancer/freelancer-job-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { freelancerJobs } from "@/data/freelancer-workspace"
import useAuth from "@/hooks/useAuth"
import type { FreelancerJob } from "@/types/job"
import CategorySelect from "@/components/common/category-select"
import { Slider } from "@/components/ui/slider"

// Optional search metadata: unknown client credentials must never be treated as verified.
type SearchJob = FreelancerJob & {
	clientRating?: number
	previousHires?: number
	experience?: string
	weeklyHours?: number
}
const popularSearches = ["Product design", "React", "Content strategy", "Design systems", "Mobile app"]
const primaryAction =
	"inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md text-on-primary hover:opacity-90 dark:bg-on-surface dark:text-background"
const secondaryAction =
	"inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 font-label-md text-label-md text-on-surface hover:bg-surface-container-low"

export default function FreelancerJobsPage() {
	const { user } = useAuth()
	const [query, setQuery] = useState("")
	const [search, setSearch] = useState("")
	const [types, setTypes] = useState<string[]>([])
	const [credentials, setCredentials] = useState<string[]>([])
	const [experience, setExperience] = useState<string[]>([])
	const [minimum, setMinimum] = useState("")
	const [maximum, setMaximum] = useState("")
	const [commitment, setCommitment] = useState("")
	const [sort, setSort] = useState("recommended")
	const [filtersOpen, setFiltersOpen] = useState(false)
	const [visibleCount, setVisibleCount] = useState(4)
	const [savedCount, setSavedCount] = useState(0)
	useEffect(() => {
		try {
			const data = JSON.parse(localStorage.getItem(`freelancer-work-v2:${user?.id ?? "preview"}`) || "{}")
			setSavedCount(Array.isArray(data.saved) ? data.saved.length : 0)
		} catch {
			setSavedCount(0)
		}
	}, [user?.id])
	const toggle = (values: string[], value: string, update: (values: string[]) => void) => {
		update(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
		setVisibleCount(4)
	}
	const clear = () => {
		setQuery("")
		setSearch("")
		setTypes([])
		setCredentials([])
		setExperience([])
		setMinimum("")
		setMaximum("")
		setCommitment("")
		setVisibleCount(4)
	}
	const filtered = (freelancerJobs as SearchJob[])
		.filter((job) => {
			const rate = Number(job.budget.replace(/,/g, "").match(/[\d.]+/)?.[0] || 0)
			return (
				(!search ||
					`${job.title} ${job.company} ${job.skills.join(" ")}`.toLowerCase().includes(search.toLowerCase())) &&
				(!types.length || types.includes(job.projectType)) &&
				(!credentials.includes("Top rated") || (job.clientRating ?? 0) >= 4.5) &&
				(!credentials.includes("Has hired previously") || (job.previousHires ?? 0) > 0) &&
				(!experience.length || experience.includes(job.experience ?? "")) &&
				(!(minimum || maximum) ||
					(job.projectType === "Hourly" &&
						(!minimum || rate >= Number(minimum)) &&
						(!maximum || rate <= Number(maximum)))) &&
				(!commitment ||
					(job.weeklyHours !== undefined &&
						(commitment === "Under 15 hrs/wk"
							? job.weeklyHours < 15
							: commitment === "15–30 hrs/wk"
								? job.weeklyHours >= 15 && job.weeklyHours <= 30
								: job.weeklyHours > 30)))
			)
		})
		.sort((a, b) =>
			sort === "title"
				? a.title.localeCompare(b.title)
				: sort === "budget"
					? Number(b.budget.replace(/,/g, "").match(/[\d.]+/)?.[0]) -
						Number(a.budget.replace(/,/g, "").match(/[\d.]+/)?.[0])
					: Number(a.id) - Number(b.id),
		)
	const chips = [
		...types.map((label) => ({ label, remove: () => toggle(types, label, setTypes) })),
		...credentials.map((label) => ({ label, remove: () => toggle(credentials, label, setCredentials) })),
		...experience.map((label) => ({ label, remove: () => toggle(experience, label, setExperience) })),
		...(search
			? [
					{
						label: search,
						remove: () => {
							setSearch("")
							setQuery("")
						},
					},
				]
			: []),
		...(commitment ? [{ label: commitment, remove: () => setCommitment("") }] : []),
		...(minimum || maximum
			? [
					{
						label: `$${minimum || "0"}–$${maximum || "∞"}/hr`,
						remove: () => {
							setMinimum("")
							setMaximum("")
						},
					},
				]
			: []),
	]
	const check = (label: string, checked: boolean, onChange: () => void) => (
		<label
			key={label}
			className="flex cursor-pointer items-center gap-2 font-body-sm text-body-sm text-on-surface-variant"
		>
			<input type="checkbox" checked={checked} onChange={onChange} className="size-3.5 shrink-0 accent-primary" />
			{label}
		</label>
	)

	const [category, setCategory] = useState("all")
	const categories = [
		"Web Development",
		"Frontend Development",
		"Backend Development",
		"Full-Stack Development",
		"Mobile Development",
		"iOS Development",
		"Android Development",
		"Cross-Platform App Development",
		"Desktop Application Development",
		"Game Development",
		"WordPress Development",
		"Shopify Development",
		"Webflow Development",
		"E-commerce Development",
		"CMS Development",
		"API Development",
		"Software Architecture",
		"Database Development",
		"Cloud Development",
		"DevOps & Cloud",
		"Site Reliability Engineering",
		"QA & Software Testing",
		"Automation Testing",
	]
	const [hourlyRate, setHourlyRate] = useState<[number, number]>([0, 120])
	const filters = (group: string) => (
		<div className="divide-y divide-outline-variant/50">
			<div className="flex items-center justify-between gap-2 pb-4">
				<h2 className="flex items-center gap-2 font-semibold text-body-md">
					<Filter className="size-4 text-primary" />
					Refine search
				</h2>
				<button type="button" onClick={clear} className="text-caption text-primary hover:underline">
					Clear all
				</button>
			</div>
			<fieldset className="space-y-2.5 py-4">
				<legend className="sr-only">Project Type</legend>
				<p className="mb-3 font-medium text-label-sm">Project Type</p>
				{check("All project types", !types.length, () => setTypes([]))}
				{check("Fixed price contracts", types.includes("Fixed price"), () => toggle(types, "Fixed price", setTypes))}
				{check("Hourly rates", types.includes("Hourly"), () => toggle(types, "Hourly", setTypes))}
			</fieldset>
			<fieldset className="space-y-2.5 py-4">
				<legend className="sr-only">Experience Level</legend>
				<p className="mb-3 font-medium text-label-sm">Experience Level</p>
				{["Entry level", "Intermediate", "Expert / Principal"].map((label) =>
					check(label, experience.includes(label), () => toggle(experience, label, setExperience)),
				)}
			</fieldset>
			<fieldset className="py-4">
				<legend className="sr-only">Hourly Rate</legend>

				<legend className="sr-only">Hourly Rate</legend>

				<div className="mb-4 flex items-center justify-between">
					<span className="font-medium text-label-sm">
						Hourly Rate
					</span>

					<span className="text-caption text-outline">
						${hourlyRate[0]} – $
						{hourlyRate[1] === 120 ? "120+" : hourlyRate[1]}/hr
					</span>
				</div>
				<Slider
				min={0}
				max={120}
				step={5}
				value={hourlyRate}
				onValueChange={(value) => {
					setHourlyRate(value as [number, number])
					setVisibleCount(4)
				}}
			/>
			</fieldset>
			<fieldset className="space-y-2.5 pt-4">
				<legend className="sr-only">Weekly Commitment</legend>
				<p className="mb-3 font-medium text-label-sm">Weekly Commitment</p>
				{["Under 15 hrs/wk", "15–30 hrs/wk", "30+ hrs/wk"].map((label) => (
					<label key={label} className="flex cursor-pointer items-center gap-2 text-body-sm text-on-surface-variant">
						<input
							type="radio"
							name={`${group}-hours`}
							checked={commitment === label}
							onChange={() => setCommitment(label)}
							className="size-3.5 accent-primary"
						/>
						{label}
					</label>
				))}
			</fieldset>
		</div>
	)

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 py-8 md:px-6 md:py-10">
			<header className="flex flex-col gap-4 border-outline-variant border-b py-3 pb-8 md:flex-row md:items-end md:justify-between">
				<div className="flex max-w-2xl flex-col gap-4">
					<div className="flex flex-wrap items-center gap-2">
						<span className="font-caption font-semibold text-caption text-on-surface-variant uppercase tracking-wider">
							Freelancer workspace
						</span>
						<span className="size-1 rounded-full bg-outline-variant" />
						<span className="flex items-center gap-1 font-caption font-medium text-caption text-primary">
							<span className="size-1.5 rounded-full bg-primary-container dark:bg-primary" />
							Discover verified contracts
						</span>
					</div>
					<h1 className="font-headline-xl font-semibold text-headline-xl text-on-surface tracking-tight">
						Find your next project.
					</h1>
					<p className="font-body-md text-body-md text-on-surface-variant">
						Discover freelance opportunities curated for your skill set and contract preferences.
					</p>
				</div>
				<div className="flex shrink-0 items-center self-start md:self-auto">
					<Link
						to="/freelancer-saved-jobs"
						className="group inline-flex h-9 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 font-label-md font-medium text-label-md text-on-surface transition-colors hover:border-outline hover:bg-surface-container-low dark:border-border-subtle dark:hover:border-border-input"
					>
						<Bookmark className="size-4 text-current transition-colors" />

						<span>Saved</span>

						<span className="rounded-md bg-surface-container px-1.5 py-0.5 font-caption text-[10px] text-on-surface-variant transition-colors group-hover:text-on-surface">
							{savedCount}
						</span>
					</Link>
				</div>
			</header>
			<search className="block">
			<form
				onSubmit={(event) => {
					event.preventDefault()
					setSearch(query.trim())
					setVisibleCount(4)
				}}
				className="flex min-h-16 items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-3 shadow-sm"
			>
				<Search className="ml-2 size-4 shrink-0 text-outline" />

				<input
					aria-label="Search projects"
					type="search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Search by title, skill, or company"
					className="min-w-0 flex-1 bg-transparent text-body-sm outline-none"
				/>

				<CategorySelect
					value={category}
					categories={categories}
					onValueChange={(value) => {
						setCategory(value)
						setVisibleCount(4)
					}}
				/>

				<button type="submit" className={primaryAction}>
					Search
				</button>
			</form>
				<div className="mt-3 flex flex-wrap items-center gap-2 text-caption">
					<span className="mr-1 font-medium">Popular searches:</span>
					{popularSearches.map((item) => (
						<button
							key={item}
							type="button"
							onClick={() => {
								setQuery(item)
								setSearch(item)
								setVisibleCount(4)
							}}
							className="rounded bg-surface-container px-2.5 py-1 text-on-surface-variant hover:text-primary"
						>
							{item}
						</button>
					))}
				</div>
			</search>
			<div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
				<aside
					aria-label="Job filters"
					className="hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-5 lg:block"
				>
					{filters("desktop")}
				</aside>
				<section aria-label="Job results" className="min-w-0">
					<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
						<div className="flex flex-wrap items-center gap-2">
							<p role="status" className="font-medium text-body-sm">
								Showing {filtered.length} {filtered.length === 1 ? "opportunity" : "opportunities"}
							</p>
							{chips.map((chip) => (
								<button
									type="button"
									key={chip.label}
									onClick={chip.remove}
									aria-label={`Remove ${chip.label} filter`}
									className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-lowest px-2 py-0.5 text-caption"
								>
									{chip.label}
									<X className="size-3" />
								</button>
							))}
						</div>
						<div className="flex items-center gap-2">
							<button type="button" onClick={() => setFiltersOpen(true)} className={`${secondaryAction} lg:hidden`}>
								<SlidersHorizontal className="size-4" />
								Filters
							</button>
							<div className="flex items-center gap-2">
								<span className="font-caption text-caption text-outline">Sort:</span>
								<Select value={sort} onValueChange={setSort}>
									<SelectTrigger
										size="sm"
										aria-label="Sort jobs"
										className="w-44 rounded-lg border-outline-variant bg-surface-container-lowest px-3 font-normal text-[12px] leading-4 text-on-surface shadow-none hover:border-outline dark:bg-surface-card dark:hover:bg-surface-container data-[state=open]:border-primary [&>svg]:transition-transform data-[state=open]:[&>svg]:rotate-180"
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent
										align="end"
										sideOffset={6}
										className="w-[var(--radix-select-trigger-width)] min-w-0 rounded-lg border-outline-variant bg-surface-container-lowest p-1 text-on-surface shadow-md [&_[data-radix-select-viewport]]:min-w-0"
									>
										{[
											["recommended", "Best match"],
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
					</div>
					<div className="flex flex-col gap-3.5">
						{filtered.slice(0, visibleCount).map((job) => (
							<FreelancerJobCard key={job.id} {...job} />
						))}
					</div>
					{!filtered.length && (
						<div className="rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-16 text-center">
							<Search className="mx-auto mb-4 size-6 text-outline" />
							<h2 className="font-semibold text-headline-md">No matching projects</h2>
							<p className="mt-2 text-body-sm text-on-surface-variant">
								Try fewer filters. Projects with missing credentials or experience details are excluded when those
								filters are selected.
							</p>
							<button type="button" onClick={clear} className={`${secondaryAction} mt-5`}>
								Clear filters
							</button>
						</div>
					)}
					{filtered.length > 0 && (
						<div className="flex justify-center pt-8 pb-6">
							<button
								type="button"
								disabled={visibleCount >= filtered.length}
								onClick={() => setVisibleCount((count) => count + 4)}
								className={`${secondaryAction} px-6 disabled:opacity-60`}
							>
								{visibleCount >= filtered.length ? "All opportunities loaded" : "Load more opportunities"}
								<ChevronDown className="size-4 text-outline" />
							</button>
						</div>
					)}
				</section>
			</div>
			<Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
				<SheetContent side="left" className="overflow-y-auto">
					<SheetHeader>
						<SheetTitle>Refine search</SheetTitle>
						<SheetDescription>Choose the projects that fit your preferences.</SheetDescription>
					</SheetHeader>
					<div className="p-5">
						{filters("mobile")}

						<button
							type="button"
							onClick={() =>
								setFiltersOpen(false)
							}
							className={`${primaryAction} mt-6 w-full`}
						>
							Show {filtered.length}{" "}
							opportunities
						</button>
					</div>
				</SheetContent>

			</Sheet>
		</div>
	)
}
