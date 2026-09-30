import { createFileRoute } from "@tanstack/react-router"
import FreelancerJobsPage from "@/pages/freelancer-area/freelancer-jobs-page"

export const Route = createFileRoute("/_layout/freelancer-jobs")({
	component: FreelancerJobsPage,
	head: () => ({ meta: [{ title: "Jobs | Skilio" }] }),
})
