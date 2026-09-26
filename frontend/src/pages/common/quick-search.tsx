import { SearchesService } from "@/client"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { ArrowRight, Search } from "lucide-react"

export const QuickSavedSearch = () => {
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

	const recentSearch = recentSearchResponse?.data ?? []
	const count = recentSearchResponse?.count ?? 0

	if (isLoading) {
		return <div>Loading...</div>
	}

	if (isError) {
		return <div>Failed to load recent searches.</div>
	}

	return (
		count > 0 && (
			<section className="flex flex-col gap-3.5 rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
				<h3 className="font-headline-sm font-semibold text-headline-sm text-on-surface">Quick searches</h3>

				<div className="flex flex-col gap-2">
					{recentSearch.map((search) => (
						<button
							key={search}
							type="button"
							onClick={() => {}}
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
					<span>
						{count} {count === 1 ? "search" : "searches"}
					</span>

					<Link to="/freelancer-jobs" className="font-medium text-primary hover:underline">
						Browse
					</Link>
				</div>
			</section>
		)
	)
}

export default QuickSavedSearch
