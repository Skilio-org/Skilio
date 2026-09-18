import { createFileRoute } from "@tanstack/react-router"
import { ClientDashboardPage } from "@/pages/client-area/dashboard-page"

export const Route = createFileRoute("/_layout/dashboard")({
	component: ClientDashboardPage,
	head: () => ({ meta: [{ title: "Overview | Freelancer" }] }),
})
