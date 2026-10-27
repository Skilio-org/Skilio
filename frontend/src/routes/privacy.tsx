import { createFileRoute } from "@tanstack/react-router"
import { PrivacyPolicyPage } from "@/pages/common/privacy-page"

export const Route = createFileRoute("/privacy")({
	component: PrivacyPolicyPage,
	head: () => ({
		meta: [
			{ title: "Privacy Policy | Skilio" },
			{
				name: "description",
				content:
					"Read our Privacy Policy to understand how Skilio collects, protects, and manages your personal and workspace data.",
			},
		],
	}),
})
