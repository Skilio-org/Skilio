import StatusPage from "@/pages/common/status-page"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/status")({
	component: StatusPage,
	head: () => ({
		meta: [
			{ title: "System Status | Skilio" },
			{
				name: "description",
				content: "Live operational status of Skilio systems, microservices, and databases.",
			},
		],
	}),
})
