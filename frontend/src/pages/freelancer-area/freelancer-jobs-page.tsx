import CitySelect from "@/components/common/city-select"
import SearchWithCategories from "@/components/common/search-with-categories"
import { WorkspacePageHeader } from "@/components/dashboard/dashboard-header"
import FreelancerJobCard from "@/components/freelancer/freelancer-job-card"
import { jobFromApi } from "@/components/freelancer/freelancer-job-mapper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { useSavedJobs } from "@/hooks/useSavedJobs"
import { useErrorToast } from "@/hooks/useErrorToast"
import { Link } from "@tanstack/react-router"
import { useInfiniteQuery } from "@tanstack/react-query"
import { JobsService } from "@/client"
import { Bookmark, ChevronDown, Filter, Search, SlidersHorizontal, X } from "lucide-react"
import { useState } from "react"

const popularSearches = ["Product design", "React", "Content strategy", "Design systems", "Mobile app"]

const primaryAction =
	"inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md text-on-primary hover:opacity-90 dark:bg-on-surface dark:text-background"

const secondaryAction =
	"inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 font-label-md text-label-md text-on-surface hover:bg-surface-container-low"

export default function FreelancerJobsPage() {
	const { saved } = useSavedJobs()

	const savedCount = saved.length

	const [search, setSearch] = useState("")
	const [category, setCategory] = useState("all")
	const [types, setTypes] = useState<string[]>([])
	const [credentials, setCredentials] = useState<string[]>([])
	const [experience, setExperience] = useState<string[]>([])
	const [location, setLocation] = useState("")
	const [hourlyRate, setHourlyRate] = useState<[number, number]>([0, 120])
	// const [commitment, setCommitment] = useState("")
	const [sort, setSort] = useState("recommended")
	const [filtersOpen, setFiltersOpen] = useState(false)
	const [visibleCount, setVisibleCount] = useState(4)

	/*
	 * SearchWithCategories owns its input state internally.
	 * Incrementing this forces it to reset when "Clear all" is used.
	 */
	const [searchResetKey, setSearchResetKey] = useState(0)
	const budgetType = types.length === 1 ? (types[0] === "Hourly" ? "hourly" : "fixed") : undefined
	const sortBy = sort === "budget" ? "budget_desc" : "newest"
	const {
		data,
		isPending,
		isError,
		errorUpdatedAt,
		refetch,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ["freelancer-jobs", search, category, budgetType, hourlyRate, location, sortBy],
		initialPageParam: 0,
		queryFn: async ({ pageParam, signal }) => {
			const { data } = await JobsService.readJobs({
				query: {
					skip: pageParam,
					limit: 100,
					q: search,
					category: category === "all" ? undefined : category,
					budget_type: budgetType,
					location: location || undefined,
					min_budget: hourlyRate[0] || undefined,
					max_budget: hourlyRate[1] === 120 ? undefined : hourlyRate[1],
					status: "open",
					sort_by: sortBy,
				},
				signal,
			})
			return data
		},
		getNextPageParam: (lastPage, pages) => {
			if (lastPage.data.length === 0) return undefined
			const loaded = pages.reduce((count, page) => count + page.data.length, 0)
			return loaded < lastPage.count ? loaded : undefined
		},
	})
	useErrorToast(isError ? "Could not load opportunities." : undefined, "freelancer-jobs-load", errorUpdatedAt, refetch)
	const jobs = data?.pages.flatMap((page) => page.data.map(jobFromApi)) ?? []

	const toggle = (values: string[], value: string, update: (values: string[]) => void) => {
		update(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
		setVisibleCount(4)
	}

	const clear = () => {
		setSearch("")
		setCategory("all")
		setTypes([])
		setCredentials([])
		setExperience([])
		setLocation("")
		setHourlyRate([0, 120])
		// setCommitment("")
		setVisibleCount(4)
		setSearchResetKey((current) => current + 1)
	}

	const filtered = jobs
		.filter((job) => !experience.length || (job.experience && experience.includes(job.experience)))
		.sort((a, b) => (sort === "title" ? a.title.localeCompare(b.title) : 0))

	const removeSearch = () => {
		setSearch("")
		setVisibleCount(4)
		setSearchResetKey((current) => current + 1)
	}

	const removeCategory = () => {
		setCategory("all")
		setVisibleCount(4)
		setSearchResetKey((current) => current + 1)
	}

	const chips = [
		...types.map((label) => ({
			label,
			remove: () => toggle(types, label, setTypes),
		})),

		...credentials.map((label) => ({
			label,
			remove: () => toggle(credentials, label, setCredentials),
		})),

		...experience.map((label) => ({
			label,
			remove: () => toggle(experience, label, setExperience),
		})),

		...(location
			? [
					{
						label: location,
						remove: () => {
							setLocation("")
							setVisibleCount(4)
						},
					},
				]
			: []),

		...(search
			? [
					{
						label: search,
						remove: removeSearch,
					},
				]
			: []),

		...(category !== "all"
			? [
					{
						label: category,
						remove: removeCategory,
					},
				]
			: []),

		// ...(commitment
		// 	? [
		// 			{
		// 				label: commitment,
		// 				remove: () => {
		// 					setCommitment("")
		// 					setVisibleCount(4)
		// 				},
		// 			},
		// 		]
		// 	: []),

		...(hourlyRate[0] !== 0 || hourlyRate[1] !== 120
			? [
					{
						label: `$${hourlyRate[0]}–${hourlyRate[1] === 120 ? "120+" : hourlyRate[1]}/hr`,
						remove: () => {
							setHourlyRate([0, 120])
							setVisibleCount(4)
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

	const filters = () => (
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

				{check("All project types", !types.length, () => {
					setTypes([])
					setVisibleCount(4)
				})}

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
				<legend className="sr-only">Location</legend>

				<p className="mb-3 font-medium text-label-sm">Location</p>

				<CitySelect
					value={location}
					emptyLabel="Any location"
					onValueChange={(value) => {
						setLocation(value)
						setVisibleCount(4)
					}}
					className="h-10 w-full max-w-none rounded-lg border border-outline-variant"
				/>
			</fieldset>

			<fieldset className="py-4">
				<legend className="sr-only">Hourly Rate</legend>

				<div className="mb-4 flex items-center justify-between">
					<span className="font-medium text-label-sm">Hourly Rate</span>

					<span className="text-caption text-outline">
						${hourlyRate[0]} – ${hourlyRate[1] === 120 ? "120+" : hourlyRate[1]}/hr
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
		</div>
	)

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4  md:px-6 ">
			<WorkspacePageHeader
				eyebrow="Freelancer workspace"
				title="Find your next project."
				description="Discover freelance opportunities curated for your skill set and contract preferences."
				meta={<span className="font-medium text-primary">Discover verified contracts</span>}
				action={
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
				}
			/>

			<SearchWithCategories
				key={searchResetKey}
				initialQuery={search}
				initialCategory={category}
				popularSearches={popularSearches}
				placeholder="Search by title, skill, or company"
				onSearch={(value) => {
					setSearch(value)
					setVisibleCount(4)
				}}
				onCategoryChange={(value) => {
					setCategory(value)
					setVisibleCount(4)
				}}
			/>

			<div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
				<aside
					aria-label="Job filters"
					className="hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-5 lg:block"
				>
					{filters()}
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
							<button
								type="button"
								aria-label="Open job filters"
								onClick={() => setFiltersOpen(true)}
								className={`${secondaryAction} lg:hidden`}
							>
								<SlidersHorizontal className="size-4" />
								Filters
							</button>

							<div className="flex items-center gap-2">
								<span className="font-caption text-caption text-outline">Sort:</span>

								<Select value={sort} onValueChange={setSort}>
									<SelectTrigger
										size="sm"
										aria-label="Sort jobs"
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

					{isPending && <p role="status">Loading opportunities...</p>}

					{!isPending && !isError && !filtered.length && !hasNextPage && (
						<div className="rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-16 text-center">
							<Search className="mx-auto mb-4 size-6 text-outline" />

							<h2 className="font-semibold text-headline-md">No matching projects</h2>

							<p className="mt-2 text-body-sm text-on-surface-variant">
								Try a broader search, another category, or fewer filters.
							</p>

							<button type="button" onClick={clear} className={`${secondaryAction} mt-5`}>
								Clear filters
							</button>
						</div>
					)}

					{(filtered.length > 0 || hasNextPage) && (
						<div className="flex justify-center pt-8 pb-6">
							<button
								type="button"
								disabled={isFetchingNextPage || (visibleCount >= filtered.length && !hasNextPage)}
								onClick={() => {
									if (visibleCount < filtered.length) {
										setVisibleCount((count) => count + 4)
									} else if (hasNextPage) {
										void fetchNextPage().then((result) => {
											if (result.isSuccess) setVisibleCount((count) => count + 4)
										})
									}
								}}
								className={`${secondaryAction} px-6 disabled:opacity-60`}
							>
								{isFetchingNextPage
									? "Loading opportunities…"
									: visibleCount >= filtered.length && !hasNextPage
										? "All opportunities loaded"
										: "Load more opportunities"}

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
						{filters()}

						<button type="button" onClick={() => setFiltersOpen(false)} className={`${primaryAction} mt-6 w-full`}>
							Show {filtered.length} {filtered.length === 1 ? "opportunity" : "opportunities"}
						</button>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	)
}
