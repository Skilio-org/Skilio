import { createFileRoute } from "@tanstack/react-router"
import { TalentDirectoryPage } from "@/pages/client-area/talent-directory-page"

export const Route = createFileRoute("/_layout/talent")({
	validateSearch: (search: Record<string, unknown>) => ({
		q: typeof search.q === "string" ? search.q : undefined,
	}),
	component: TalentDirectoryRoute,
	head: () => ({ meta: [{ title: "Find talent | Freelancer" }] }),
})

function TalentDirectoryRoute() {
	const { q } = Route.useSearch()
	const navigate = Route.useNavigate()

	return (
		<TalentDirectoryPage
			initialQuery={q}
			onQueryChange={(query) => void navigate({ search: { q: query }, replace: true })}
		/>
	)
}
