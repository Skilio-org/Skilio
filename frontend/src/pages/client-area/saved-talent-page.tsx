import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Bookmark, Search, X } from "lucide-react"
import { useState } from "react"
import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header"
import { FreelancerCard } from "@/components/talent/freelancer-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { freelancers } from "@/data/freelancers"
import { useSavedTalent } from "@/hooks/useSavedTalent"
import QuickSavedSearch from "../common/quick-search"

type SortOption = "highest-rated" | "lowest-rate"

export function SavedTalentPage() {
	const { savedIds, toggleSaved } = useSavedTalent()
	const [query, setQuery] = useState("")
	const [sort, setSort] = useState<SortOption>("highest-rated")
	const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)

	const people = freelancers
		.filter((person) => {
			if (!savedIds.includes(person.id)) {
				return false
			}

			const searchableText = [person.name, person.title, person.location, ...person.skills].join(" ").toLowerCase()

			return terms.every((term) => searchableText.includes(term))
		})
		.sort((a, b) => {
			switch (sort) {
				case "lowest-rate":
					return a.rate - b.rate

				case "highest-rated":
					return b.rating - a.rating
			}
		})

	return (
		<div className="mx-auto w-full max-w-360 px-4 py-8 md:px-6 md:py-10">
			<WorkspacePageHeader
				eyebrow="Client workspace"
				title="Saved talent"
				description="Keep the people you’d like to work with in one place."
				meta={<span className="font-medium text-primary">Your talent shortlist</span>}
				action=""
			/>
			<div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
				<main className="min-w-0 space-y-5">
					{savedIds.length > 0 && (
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<label className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
								<Search className="size-4 shrink-0 text-on-surface-variant" />

								<span className="sr-only">Search saved talent</span>

								<input
									type="text"
									value={query}
									onChange={(event) => setQuery(event.target.value)}
									placeholder="Search by name, skill, or location"
									className="min-w-0 flex-1 bg-transparent text-base outline-none sm:text-sm [&::-webkit-search-cancel-button]:hidden"
								/>

								{query && (
									<button
										type="button"
										onClick={() => setQuery("")}
										aria-label="Clear saved search"
										className="grid size-8 shrink-0 place-items-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
									>
										<X className="size-4" />
									</button>
								)}
							</label>

							<div className="flex shrink-0 items-center gap-2">
								<span className="font-caption text-caption text-outline">Sort:</span>

								<Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
									<SelectTrigger
										size="sm"
										aria-label="Sort saved talent"
										className="w-44 rounded-lg border-outline-variant bg-surface-container-lowest px-3 font-normal text-[12px] leading-4 text-on-surface shadow-none hover:border-outline dark:bg-surface-card dark:hover:bg-surface-container data-[state=open]:border-primary [&>svg]:transition-transform data-[state=open]:[&>svg]:rotate-180"
									>
										<SelectValue />
									</SelectTrigger>

									<SelectContent
										align="end"
										sideOffset={6}
										className="w-[var(--radix-select-trigger-width)] min-w-0 rounded-lg border-outline-variant bg-surface-container-lowest p-1 text-on-surface shadow-md [&_[data-radix-select-viewport]]:min-w-0"
									>
										<SelectItem
											value="highest-rated"
											className="min-h-8 cursor-pointer rounded px-3 pr-8 font-normal text-[12px] leading-4 focus:bg-surface-container focus:text-on-surface data-[state=checked]:bg-surface-container data-[state=checked]:text-primary"
										>
											Highest rated
										</SelectItem>

										<SelectItem
											value="lowest-rate"
											className="min-h-8 cursor-pointer rounded px-3 pr-8 font-normal text-[12px] leading-4 focus:bg-surface-container focus:text-on-surface data-[state=checked]:bg-surface-container data-[state=checked]:text-primary"
										>
											Lowest hourly rate
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					)}

					{savedIds.length > 0 && (
						<p role="status" className="text-sm text-on-surface-variant">
							<strong className="font-semibold text-foreground">{people.length}</strong>{" "}
							{people.length === 1 ? "professional" : "professionals"}
							{query ? " matching your search" : " saved"}
						</p>
					)}

					{people.length > 0 ? (
						<section className="flex flex-col gap-3.5">
							{people.map((person) => (
								<FreelancerCard
									key={person.id}
									freelancer={person}
									saved
									onToggleSaved={() => toggleSaved(person.id)}
								/>
							))}
						</section>
					) : (
						<section className="rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-16 text-center">
							<Bookmark className="mx-auto size-8 text-on-surface-variant" />

							<h2 className="mt-5 font-medium text-xl tracking-tight">
								{savedIds.length ? "No matching saved profiles" : "Your shortlist starts here"}
							</h2>

							<p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-on-surface-variant">
								{savedIds.length
									? "Try another name, skill, or location."
									: "Save a profile while browsing talent. You’ll find everyone you save right here."}
							</p>

							{savedIds.length ? (
								<button
									type="button"
									onClick={() => setQuery("")}
									className={`${workspaceStyles.secondaryAction} mt-6`}
								>
									Clear search
								</button>
							) : (
								<Link
									to="/talent"
									search={{ q: undefined, category: undefined }}
									className={`${workspaceStyles.primaryAction} mt-6`}
								>
									Explore talent
									<ArrowUpRight className="size-4" />
								</Link>
							)}
						</section>
					)}
				</main>

				<aside className="min-w-0 xl:sticky xl:top-6">
					<QuickSavedSearch />
				</aside>
			</div>
		</div>
	)
}
