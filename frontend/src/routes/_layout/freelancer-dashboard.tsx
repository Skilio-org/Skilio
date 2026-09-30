import { createFileRoute } from "@tanstack/react-router"
import FreelancerDashboardPage from "@/pages/freelancer-area/freelancer-dashboard"

export const Route = createFileRoute("/_layout/freelancer-dashboard")({
	component: FreelancerDashboardPage,
	head: () => ({ meta: [{ title: "Dashboard | Skilio" }] }),
})
