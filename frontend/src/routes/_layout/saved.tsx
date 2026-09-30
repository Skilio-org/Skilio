import { createFileRoute } from "@tanstack/react-router"
import { SavedTalentPage } from "@/pages/client-area/saved-talent-page"

export const Route = createFileRoute("/_layout/saved")({
	component: SavedTalentPage,
	head: () => ({ meta: [{ title: "Saved talent | Skilio" }] }),
})
