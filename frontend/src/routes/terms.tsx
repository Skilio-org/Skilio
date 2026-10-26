import { createFileRoute } from "@tanstack/react-router"
import { TermsOfServicePage } from "@/pages/common/terms-page"

export const Route = createFileRoute("/terms")({
	component: TermsOfServicePage,
	head: () => ({
		meta: [
			{ title: "Terms of Service | Skilio" },
			{
				name: "description",
				content:
					"Review our Terms of Service governing platform usage, client-freelancer connections, contracts, and marketplace conduct.",
			},
		],
	}),
})
