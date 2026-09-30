import { createFileRoute } from "@tanstack/react-router"
import { LandingPage } from "@/pages/common/landing-page"

export const Route = createFileRoute("/")({
	component: LandingPage,
	head: () => ({
		meta: [
			{ title: "Skilio - Find independent talent" },
			{
				name: "description",
				content: "Search verified freelance profiles, compare expertise, and find the right independent professional.",
			},
		],
	}),
})
