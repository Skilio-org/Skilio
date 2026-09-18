import { createFileRoute } from "@tanstack/react-router"
import { FreelancerJobsPage } from "@/pages/freelancer-area/freelancer-workspace-page"
export const Route = createFileRoute("/_layout/freelancer-jobs")({
	component: FreelancerJobsPage,
	head: () => ({ meta: [{ title: "Jobs | Freelancer" }] }),
})
