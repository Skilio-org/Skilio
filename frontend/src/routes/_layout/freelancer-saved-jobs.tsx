import { createFileRoute } from "@tanstack/react-router"
import FreelancerSavedJobsPage from "@/pages/freelancer-area/freelancer-saved-jobs-page"

export const Route = createFileRoute("/_layout/freelancer-saved-jobs")({
	component: FreelancerSavedJobsPage,
	head: () => ({ meta: [{ title: "Saved jobs | Freelancer" }] }),
})
