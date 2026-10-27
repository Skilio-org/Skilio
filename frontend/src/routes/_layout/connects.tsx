import { createFileRoute } from "@tanstack/react-router"
import { ConnectsPage } from "@/pages/common/connects-page"

export const Route = createFileRoute("/_layout/connects")({
	component: ConnectsPage,
	head: () => ({
		meta: [
			{ title: "Connections & Network | Skilio" },
			{
				name: "description",
				content:
					"Manage verified partnerships, respond to collaboration requests, and unlock direct messaging on Skilio.",
			},
		],
	}),
})
