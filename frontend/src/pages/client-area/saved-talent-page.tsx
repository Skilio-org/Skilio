import { Link } from "@tanstack/react-router"
import { Bookmark, Search, X } from "lucide-react"
import { useState } from "react"
import { EmptyState } from "@/components/common/empty-state"
import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header"
import { FreelancerCard } from "@/components/talent/freelancer-card"
import { talentCardFromApi } from "@/components/talent/talent-api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSavedTalent } from "@/hooks/useSavedTalent"
import { useErrorToast } from "@/hooks/useErrorToast"
import QuickSavedSearch from "../common/quick-search"

type SortOption = "newest" | "rate_asc" | "rate_desc"

export function SavedTalentPage() {
	const [query, setQuery] = useState("")
	const [sort, setSort] = useState<SortOption>("newest")
	const { savedIds, toggleSaved } = useSavedTalent()
	const { savedProfiles, savedCount, isPending, isError, errorUpdatedAt, refetch } = useSavedTalent({
		query,
		sortBy: sort,
	})
	useErrorToast(isError ? "Could not load saved talent." : undefined, "saved-talent-load", errorUpdatedAt, refetch)
	const people = savedProfiles.map(talentCardFromApi)

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4  md:px-6">
			<WorkspacePageHeader
				eyebrow="Client workspace"
				title="Saved talent"
				description="Keep the people you’d like to work with in one place."
				meta={
					<span className="font-medium text-primary">
						{savedCount} saved {savedCount === 1 ? "profile" : "profiles"}
					</span>
				}
			/>
			<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
				<main className="flex min-w-0 flex-col gap-6 lg:col-span-8">
					{savedCount > 0 && (
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
											value="newest"
											className="min-h-8 cursor-pointer rounded px-3 pr-8 font-normal text-[12px] leading-4 focus:bg-surface-container focus:text-on-surface data-[state=checked]:bg-surface-container data-[state=checked]:text-primary"
										>
											Recently saved
										</SelectItem>

										<SelectItem
											value="rate_asc"
											className="min-h-8 cursor-pointer rounded px-3 pr-8 font-normal text-[12px] leading-4 focus:bg-surface-container focus:text-on-surface data-[state=checked]:bg-surface-container data-[state=checked]:text-primary"
										>
											Lowest hourly rate
										</SelectItem>

										<SelectItem
											value="rate_desc"
											className="min-h-8 cursor-pointer rounded px-3 pr-8 font-normal text-[12px] leading-4 focus:bg-surface-container focus:text-on-surface data-[state=checked]:bg-surface-container data-[state=checked]:text-primary"
										>
											Highest hourly rate
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					)}

					{savedCount > 0 && (
						<p role="status" className="text-sm text-on-surface-variant">
							<strong className="font-semibold text-foreground">{people.length}</strong>{" "}
							{people.length === 1 ? "professional" : "professionals"}
							{query ? " matching your search" : " saved"}
						</p>
					)}

					{isPending && <p role="status">Loading saved talent…</p>}

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
						<EmptyState
							icon={Bookmark}
							title={savedCount > 0 && query ? "No matching saved profiles" : "Your shortlist starts here"}
							description={
								savedCount > 0 && query
									? "Try another name, skill, or location."
									: "Save a profile while browsing talent. You’ll find everyone you save right here."
							}
							action={
								savedIds.length ? (
									<button type="button" onClick={() => setQuery("")} className={workspaceStyles.secondaryAction}>
										Clear search
									</button>
								) : (
									<Link
										to="/talent"
										search={{ q: undefined, category: undefined }}
										className={workspaceStyles.secondaryAction}
									>
										<Search className="size-4" />
										Browse talent
									</Link>
								)
							}
						/>
					)}
				</main>

				<aside className="min-w-0 lg:sticky lg:top-20 lg:col-span-4">
					<QuickSavedSearch />
				</aside>
			</div>
		</div>
	)
}
