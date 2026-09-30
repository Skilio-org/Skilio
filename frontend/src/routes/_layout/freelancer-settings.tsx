import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { settingsSectionSchema } from "@/lib/settings"
import { SettingsPage } from "@/pages/common/settings-page"
export const Route = createFileRoute("/_layout/freelancer-settings")({
	component: FreelancerSettings,
	validateSearch: z.object({ section: settingsSectionSchema.optional() }),
	head: () => ({ meta: [{ title: "Settings | Skilio" }] }),
})

function FreelancerSettings() {
	const { section = "profile" } = Route.useSearch()
	const navigate = Route.useNavigate()
	return (
		<SettingsPage
			section={section}
			onSectionChange={(value) => void navigate({ search: { section: value }, replace: true })}
		/>
	)
}
