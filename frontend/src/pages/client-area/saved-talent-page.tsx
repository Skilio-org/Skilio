import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Bookmark, Search, X } from "lucide-react"
import { useState } from "react"
import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header"
import { FreelancerCard } from "@/components/talent/freelancer-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { freelancers } from "@/data/freelancers"
import { useSavedTalent } from "@/hooks/useSavedTalent"

export function SavedTalentPage() {
	const { savedIds, toggleSaved } = useSavedTalent()
	const [query, setQuery] = useState("")
	const [sort, setSort] = useState("recommended")
	const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
	const people = freelancers
		.filter(
			(person) =>
				savedIds.includes(person.id) &&
				terms.every((term) =>
					[person.name, person.title, person.location, ...person.skills].join(" ").toLowerCase().includes(term),
				),
		)
		.sort((a, b) =>
			sort === "lowest-rate"
				? a.rate - b.rate
				: sort === "highest-rated"
					? b.rating - a.rating
					: b.successRate - a.successRate,
		)
	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 py-8 md:px-6 md:py-10">
			<WorkspacePageHeader
				eyebrow="Client workspace / Saved talent"
				title="Saved talent"
				description="Keep the people you’d like to work with in one place."
				action=""
			/>
			{savedIds.length > 0 && (
				<div className="flex flex-col gap-3 sm:flex-row">
					<label className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
						<Search className="size-4 shrink-0 text-on-surface-variant" />
						<span className="sr-only">Search saved talent</span>
						<input
							type="search"
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
								className="grid size-10 place-items-center rounded-lg hover:bg-muted"
							>
								<X className="size-4" />
							</button>
						)}
					</label>
					<Select value={sort} onValueChange={setSort}>
						<SelectTrigger
							aria-label="Sort saved talent"
							className="h-12 w-full rounded-lg bg-surface-container-lowest sm:w-48"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="recommended">Recommended</SelectItem>
							<SelectItem value="highest-rated">Highest rated</SelectItem>
							<SelectItem value="lowest-rate">Lowest rate</SelectItem>
						</SelectContent>
					</Select>
				</div>
			)}
			<p role="status" className="text-on-surface-variant text-sm">
				<strong className="font-semibold text-foreground">{people.length}</strong>{" "}
				{people.length === 1 ? "professional" : "professionals"}
				{query ? " matching your search" : " saved"}
			</p>
			{people.length > 0 ? (
				<div className="flex flex-col gap-3.5">
					{people.map((person) => (
						<FreelancerCard key={person.id} freelancer={person} saved onToggleSaved={() => toggleSaved(person.id)} />
					))}
				</div>
			) : (
				<section className="rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-16 text-center">
					<Bookmark className="mx-auto size-8 text-on-surface-variant" />
					<h2 className="mt-5 font-medium text-xl tracking-tight">
						{savedIds.length ? "No matching saved profiles" : "Your shortlist starts here"}
					</h2>
					<p className="mx-auto mt-3 max-w-sm text-on-surface-variant text-sm leading-6">
						{savedIds.length
							? "Try another name, skill, or location."
							: "Save a profile while browsing talent. You’ll find everyone you save right here."}
					</p>
					{savedIds.length ? (
						<button type="button" onClick={() => setQuery("")} className={`${workspaceStyles.secondaryAction} mt-6`}>
							Clear search
						</button>
					) : (
						<Link to="/talent" search={{ q: undefined }} className={`${workspaceStyles.primaryAction} mt-6`}>
							Explore talent
							<ArrowUpRight className="size-4" />
						</Link>
					)}
				</section>
			)}
		</div>
	)
}
