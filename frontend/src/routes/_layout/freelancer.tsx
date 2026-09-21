import { createFileRoute } from "@tanstack/react-router"
import FreelancerProfilePage from "@/pages/freelancer-area/freelancer-profile-page"

export const Route = createFileRoute("/_layout/freelancer")({
	component: FreelancerProfilePage,
	head: () => ({ meta: [{ title: "Your freelancer profile | Freelancer" }] }),
})
