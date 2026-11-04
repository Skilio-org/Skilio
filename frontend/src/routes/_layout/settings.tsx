import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { settingsSectionSchema } from "@/lib/settings"
import { SettingsPage } from "@/pages/common/settings-page"

export const Route = createFileRoute("/_layout/settings")({
	component: UserSettings,
	// Old links to sections that no longer exist fall back to the profile section instead of erroring.
	validateSearch: z.object({ section: settingsSectionSchema.optional().catch(undefined) }),
	head: () => ({ meta: [{ title: "Account settings | Skilio" }] }),
})

function UserSettings() {
	const { section = "profile" } = Route.useSearch()
	const navigate = Route.useNavigate()

	return (
		<SettingsPage
			section={section}
			onSectionChange={(value) => void navigate({ search: { section: value }, replace: true })}
		/>
	)
}
