import { createFileRoute } from "@tanstack/react-router"
import { ClientJobsPage } from "@/pages/client-area/client-jobs-page"

export const Route = createFileRoute("/_layout/client-jobs")({
	component: ClientJobsPage,
	head: () => ({ meta: [{ title: "Your jobs | Skilio" }] }),
})
