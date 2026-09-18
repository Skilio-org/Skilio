import { createFileRoute, notFound } from "@tanstack/react-router"
import { getFreelancer } from "@/data/freelancers"
import { TalentProfilePage } from "@/pages/client-area/talent-profile-page"

export const Route = createFileRoute("/_layout/talent_/$freelancerId")({
	loader: ({ params }) => {
		const freelancer = getFreelancer(params.freelancerId)
		if (!freelancer) throw notFound()
		return freelancer
	},
	component: FreelancerProfileRoute,
	head: ({ loaderData }) => ({
		meta: [{ title: `${loaderData?.name ?? "Profile"} | Freelancer` }],
	}),
})

function FreelancerProfileRoute() {
	return <TalentProfilePage person={Route.useLoaderData()} />
}
