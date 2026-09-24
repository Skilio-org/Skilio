import { Link } from "@tanstack/react-router"
import { Bookmark, ChevronDown, Filter, Search, SlidersHorizontal, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { FreelancerCard } from "@/components/talent/freelancer-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { useQuery } from "@tanstack/react-query"
import { loadTalentCards } from "@/components/talent/talent-api"
import { useSavedTalent } from "@/hooks/useSavedTalent"
import { SearchWithCategories } from "@/components/common/search-with-categories"
import { WorkspacePageHeader } from "@/components/dashboard/dashboard-header"

const locationOptions = ["Worldwide", "Europe", "North America", "Asia Pacific"]
const primaryAction =
	"inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md text-on-primary hover:opacity-90 dark:bg-on-surface dark:text-background"
const secondaryAction =
	"inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 font-label-md text-label-md text-on-surface hover:bg-surface-container-low"

export function TalentDirectoryPage({
	initialQuery,
	initialCategory,
	onQueryChange,
	onCategoryChange,
}: {
	initialQuery?: string
	initialCategory?: string
	onQueryChange: (query?: string) => void
	onCategoryChange: (category: string) => void
}) {
	const [search, setSearch] = useState(initialQuery ?? "")
	const [category, setCategory] = useState(initialCategory ?? "all")
	const [location, setLocation] = useState("Worldwide")
	const [hourlyRate, setHourlyRate] = useState<[number, number]>([0, 120])
	const [highlyRated, setHighlyRated] = useState(false)
	const [sort, setSort] = useState("best-match")
	const [filtersOpen, setFiltersOpen] = useState(false)
	const [visibleCount, setVisibleCount] = useState(4)
	const {
		data: freelancers = [],
		isPending,
		isError,
		refetch,
	} = useQuery({
		queryKey: ["talent-profiles", search, category, hourlyRate],
		queryFn: ({ signal }) =>
			loadTalentCards(
				{
					q: search,
					category: category === "all" ? undefined : category,
					minRate: hourlyRate[0] || undefined,
					maxRate: hourlyRate[1] === 120 ? undefined : hourlyRate[1],
				},
				signal,
			),
	})
	const { savedIds, toggleSaved } = useSavedTalent()
	useEffect(() => {
		setSearch(initialQuery ?? "")
		setVisibleCount(4)
	}, [initialQuery])
	useEffect(() => {
		setCategory(initialCategory ?? "all")
	}, [initialCategory])
	useEffect(() => setVisibleCount(4), [category, location, hourlyRate, highlyRated, sort])
	const submitSearch = (value: string) => {
		const trimmedValue = value.trim()

		setSearch(trimmedValue)
		setVisibleCount(4)
		onQueryChange(trimmedValue || undefined)
	}
	const clearAll = () => {
		submitSearch("")
		setCategory("all")
		onCategoryChange("all")
		setLocation("Worldwide")
		setHourlyRate([0, 120])
		setHighlyRated(false)
	}
	const results = useMemo(() => {
		return freelancers
			.filter((person) => {
				return (
					person.rate >= hourlyRate[0] &&
					(hourlyRate[1] === 120 || person.rate <= hourlyRate[1]) &&
					(!highlyRated || person.rating >= 4.9) &&
					(location === "Worldwide" ||
						(location === "Europe" &&
							["France", "Portugal", "United Kingdom"].some((country) => person.location.includes(country))) ||
						(location === "North America" &&
							["Canada", "United States"].some((country) => person.location.includes(country))) ||
						(location === "Asia Pacific" && person.location === "Singapore"))
				)
			})
			.sort((a, b) =>
				sort === "highest-rated" ? b.rating - a.rating : sort === "lowest-rate" ? a.rate - b.rate : b.rating - a.rating,
			)
	}, [freelancers, hourlyRate, highlyRated, location, sort])
	const chips = [
		...(search ? [{ label: search, remove: () => submitSearch("") }] : []),
		...(category !== "all" ? [{ label: category, remove: () => setCategory("all") }] : []),
		...(location !== "Worldwide" ? [{ label: location, remove: () => setLocation("Worldwide") }] : []),
		...(highlyRated ? [{ label: "4.9+ rating", remove: () => setHighlyRated(false) }] : []),
		...(hourlyRate[0] !== 0 || hourlyRate[1] !== 120
			? [
					{
						label: `$${hourlyRate[0]}–$${hourlyRate[1] === 120 ? "120+" : hourlyRate[1]}/hr`,
						remove: () => setHourlyRate([0, 120]),
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
	const filters = (group: string) => (
		<div className="divide-y divide-outline-variant/50">
			<div className="flex items-center justify-between gap-2 pb-4">
				<h2 className="flex items-center gap-2 font-semibold text-body-md">
					<Filter className="size-4 text-primary" />
					Refine search
				</h2>
				<button type="button" onClick={clearAll} className="text-caption text-primary hover:underline">
					Clear all
				</button>
			</div>
			<fieldset className="space-y-2.5 py-4">
				<legend className="sr-only">Location</legend>
				<p className="mb-3 font-medium text-label-sm">Location</p>
				{locationOptions.map((option) => (
					<label key={option} className="flex cursor-pointer items-center gap-2 text-body-sm text-on-surface-variant">
						<input
							type="radio"
							name={`${group}-location`}
							checked={location === option}
							onChange={() => setLocation(option)}
							className="size-3.5 accent-primary"
						/>
						{option}
					</label>
				))}
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
					onValueChange={(value) => setHourlyRate(value as [number, number])}
				/>
			</fieldset>
			<fieldset className="space-y-2.5 pt-4">
				<legend className="sr-only">Client Reviews</legend>
				<p className="mb-3 font-medium text-label-sm">Client Reviews</p>
				{check("Rated 4.9 and above", highlyRated, () => setHighlyRated(!highlyRated))}
			</fieldset>
		</div>
	)
	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 py-8 md:px-6 md:py-10">
			<WorkspacePageHeader
				eyebrow="Client workspace"
				title="Find your next collaborator."
				description="Discover freelance professionals for your project, budget, and timeline."
				meta={<span className="font-medium text-primary">Discover independent talent</span>}
				action={
					<Link
						to="/saved"
						className="group inline-flex h-9 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 font-label-md font-medium text-label-md text-on-surface transition-colors hover:border-outline hover:bg-surface-container-low dark:border-border-subtle dark:hover:border-border-input"
					>
						<Bookmark className="size-4 text-current transition-colors" />
						<span>Saved</span>
						<span className="rounded-md bg-surface-container px-1.5 py-0.5 font-caption text-[10px] text-on-surface-variant transition-colors group-hover:text-on-surface">
							{savedIds.length}
						</span>
					</Link>
				}
			/>
			<SearchWithCategories
				initialQuery={initialQuery}
				initialCategory={category}
				onSearch={(value) => {
					setSearch(value)
					setVisibleCount(4)
					onQueryChange(value || undefined)
				}}
				onCategoryChange={(value) => {
					setCategory(value)
					setVisibleCount(4)
					onCategoryChange(value)
				}}
			/>
			<div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
				<aside
					aria-label="Talent filters"
					className="hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-5 lg:block"
				>
					{filters("desktop")}
				</aside>
				<section aria-label="Talent results" className="min-w-0">
					<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
						<div className="flex flex-wrap items-center gap-2">
							<p role="status" className="font-medium text-body-sm">
								Showing {results.length} {results.length === 1 ? "professional" : "professionals"}
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
								aria-label="Open talent filters"
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
										aria-label="Sort talent"
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
											["best-match", "Best match"],
											["highest-rated", "Highest rated"],
											["lowest-rate", "Lowest rate"],
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
						{results.slice(0, visibleCount).map((person) => (
							<FreelancerCard
								key={person.id}
								freelancer={person}
								saved={savedIds.includes(person.id)}
								onToggleSaved={() => toggleSaved(person.id)}
							/>
						))}
					</div>
					{isPending && <p role="status">Loading professionals…</p>}
					{isError && (
						<div role="alert">
							Couldn’t load professionals.{" "}
							<button type="button" onClick={() => void refetch()}>
								Try again
							</button>
						</div>
					)}
					{!isPending && !isError && !results.length && (
						<div className="rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-16 text-center">
							<Search className="mx-auto mb-4 size-6 text-outline" />
							<h2 className="font-semibold text-headline-md">No matching profiles</h2>
							<p className="mt-2 text-body-sm text-on-surface-variant">
								Try a broader skill, another location, or a different hourly rate.
							</p>
							<button type="button" onClick={clearAll} className={`${secondaryAction} mt-5`}>
								Clear filters
							</button>
						</div>
					)}
					{results.length > 0 && (
						<div className="flex justify-center pt-8 pb-6">
							<button
								type="button"
								disabled={visibleCount >= results.length}
								onClick={() => setVisibleCount((count) => count + 4)}
								className={`${secondaryAction} px-6 disabled:opacity-60`}
							>
								{visibleCount >= results.length ? "All professionals loaded" : "Load more professionals"}
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
						<SheetDescription>Choose the professionals who fit your project.</SheetDescription>
					</SheetHeader>
					<div className="p-5">
						{filters("mobile")}
						<button type="button" onClick={() => setFiltersOpen(false)} className={`${primaryAction} mt-6 w-full`}>
							Show {results.length} {results.length === 1 ? "professional" : "professionals"}
						</button>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	)
}
