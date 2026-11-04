import { createFileRoute } from "@tanstack/react-router"
import { TalentDirectoryPage } from "@/pages/client-area/talent-directory-page"

export const Route = createFileRoute("/_layout/talent")({
	validateSearch: (search: Record<string, unknown>): { q?: string; category?: string } => ({
		q: typeof search.q === "string" ? search.q : undefined,
		category: typeof search.category === "string" ? search.category : undefined,
	}),
	component: TalentDirectoryRoute,
	head: () => ({ meta: [{ title: "Find talent | Skilio" }] }),
})

function TalentDirectoryRoute() {
	const { q, category } = Route.useSearch()
	const navigate = Route.useNavigate()

	return (
		<TalentDirectoryPage
			query={q}
			category={category}
			onQueryChange={(query) => void navigate({ search: (current) => ({ ...current, q: query }), replace: true })}
			onCategoryChange={(nextCategory) =>
				void navigate({
					search: (current) => ({
						...current,
						category: nextCategory === "all" ? undefined : nextCategory,
					}),
					replace: true,
				})
			}
		/>
	)
}
