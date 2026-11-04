import { SearchesService } from "@/client"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { ArrowRight, Search } from "lucide-react"
import { useAccountRole } from "@/hooks/useAccountRole"

const rowClass =
	"group flex items-center justify-between rounded p-2 text-left transition-colors hover:bg-surface-container"

export const QuickSavedSearch = () => {
	const role = useAccountRole()
	const {
		data: recentSearchResponse,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["recentSearch"],
		queryFn: async () => {
			const response = await SearchesService.readRecentSearches()
			return response.data
		},
		staleTime: 1000 * 60 * 30,
	})

	// The same search can be saved more than once; show each only once.
	const seen = new Set<string>()
	const recentSearch = (recentSearchResponse?.data ?? []).filter((search) => {
		const key = search.trim().toLowerCase()
		if (!key || seen.has(key)) return false
		seen.add(key)
		return true
	})
	const count = recentSearch.length

	if (isLoading) {
		return <div>Loading...</div>
	}

	if (isError) {
		return <div>Failed to load recent searches.</div>
	}

	// Clients search for talent, freelancers search for jobs.
	return (
		<section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h3 className="font-headline-sm font-semibold text-headline-sm text-on-surface">Quick searches</h3>
					<span className="rounded border border-transparent bg-surface-container px-1.5 py-0.5 font-caption text-caption text-outline dark:border-border-subtle dark:text-on-surface-variant">
						{count}
					</span>
				</div>
				{role === "freelancer" ? (
					<Link
						to="/freelancer-jobs"
						search={{ q: undefined }}
						className="font-label-sm text-label-sm text-primary hover:underline"
					>
						Search
					</Link>
				) : (
					<Link
						to="/talent"
						search={{ q: undefined, category: undefined }}
						className="font-label-sm text-label-sm text-primary hover:underline"
					>
						Search
					</Link>
				)}
			</div>
			<div className="flex flex-col gap-3">
				{recentSearch.length > 0 ? (
					recentSearch.map((search) => {
						const content = (
							<>
								<span className="flex items-center gap-2">
									<Search className="size-4 text-outline" />
									<span className="font-body-sm text-body-sm text-on-surface transition-colors group-hover:text-primary">
										{search}
									</span>
								</span>
								<ArrowRight className="size-3.5 text-outline transition-transform group-hover:translate-x-0.5" />
							</>
						)
						return role === "freelancer" ? (
							<Link key={search} to="/freelancer-jobs" search={{ q: search }} className={rowClass}>
								{content}
							</Link>
						) : (
							<Link key={search} to="/talent" search={{ q: search, category: undefined }} className={rowClass}>
								{content}
							</Link>
						)
					})
				) : (
					<p className="rounded-lg border border-outline-variant border-dashed px-3 py-4 font-body-sm text-body-sm text-on-surface-variant">
						Your searches will appear here.
					</p>
				)}
			</div>
		</section>
	)
}

export default QuickSavedSearch
