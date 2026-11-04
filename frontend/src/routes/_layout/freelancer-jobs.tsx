import { createFileRoute } from "@tanstack/react-router"
import FreelancerJobsPage from "@/pages/freelancer-area/freelancer-jobs-page"

export const Route = createFileRoute("/_layout/freelancer-jobs")({
	validateSearch: (search: Record<string, unknown>): { q?: string } => ({
		q: typeof search.q === "string" ? search.q : undefined,
	}),
	component: FreelancerJobsRoute,
	head: () => ({ meta: [{ title: "Jobs | Skilio" }] }),
})

function FreelancerJobsRoute() {
	const { q } = Route.useSearch()
	// Remount when the search in the URL changes (for example from a quick search) so the page starts from it.
	return <FreelancerJobsPage key={q ?? ""} initialQuery={q} />
}
