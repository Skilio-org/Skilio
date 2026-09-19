import { createFileRoute } from "@tanstack/react-router"
import FreelancerProposalsPage from "@/pages/freelancer-area/freelancer-proposals-page"

export const Route = createFileRoute("/_layout/freelancer-proposals")({
	component: FreelancerProposalsPage,
	head: () => ({ meta: [{ title: "Proposals | Freelancer" }] }),
})
