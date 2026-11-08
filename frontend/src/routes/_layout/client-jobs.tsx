import { createFileRoute } from "@tanstack/react-router"
import { ClientJobsPage } from "@/pages/client-area/client-jobs-page"

export const Route = createFileRoute("/_layout/client-jobs")({
	validateSearch: (search: Record<string, unknown>) => ({
		jobId: typeof search.jobId === "string" ? search.jobId.trim() || undefined : undefined,
	}),
	component: () => {
		const { jobId } = Route.useSearch()
		const navigate = Route.useNavigate()

		return (
			<ClientJobsPage
				focusedJobId={jobId}
				onFocusedJobChange={(nextJobId) => void navigate({ search: { jobId: nextJobId }, replace: !nextJobId })}
			/>
		)
	},
	head: () => ({ meta: [{ title: "Your jobs | Skilio" }] }),
})
