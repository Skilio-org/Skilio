import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { SettingsScreen, settingsSectionSchema } from "@/routes/_layout/settings"
export const Route = createFileRoute("/_layout/freelancer-settings")({
	component: FreelancerSettings,
	validateSearch: z.object({ section: settingsSectionSchema.optional() }),
	head: () => ({ meta: [{ title: "Settings | Freelancer" }] }),
})

function FreelancerSettings() {
	const { section = "profile" } = Route.useSearch()
	const navigate = Route.useNavigate()
	return (
		<SettingsScreen
			section={section}
			onSectionChange={(value) => void navigate({ search: { section: value }, replace: true })}
		/>
	)
}
