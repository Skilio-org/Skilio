import { createFileRoute } from "@tanstack/react-router"
import { StatusPage } from "@/pages/common/status-page"

export const Route = createFileRoute("/status")({
	component: StatusPage,
	head: () => ({
		meta: [
			{ title: "System Status | Freelancer" },
			{
				name: "description",
				content: "Live operational status of Freelancer systems, microservices, and databases.",
			},
		],
	}),
})
