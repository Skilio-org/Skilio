import { createFileRoute, notFound } from "@tanstack/react-router"
import { loadTalentProfile } from "@/components/talent/talent-api"
import { isAxiosError } from "axios"
import { TalentProfilePage } from "@/pages/client-area/talent-profile-page"

export const Route = createFileRoute("/_layout/talent_/$freelancerId")({
	loader: async ({ params }) => {
		try {
			return await loadTalentProfile(params.freelancerId)
		} catch (error) {
			if (isAxiosError(error) && error.response?.status === 404) throw notFound()
			throw error
		}
	},
	component: FreelancerProfileRoute,
	head: ({ loaderData }) => ({
		meta: [{ title: `${loaderData?.full_name ?? "Profile"} | Freelancer` }],
	}),
})

function FreelancerProfileRoute() {
	return <TalentProfilePage person={Route.useLoaderData()} />
}
