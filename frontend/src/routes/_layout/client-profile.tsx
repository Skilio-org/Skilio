import { createFileRoute } from "@tanstack/react-router"
import { ClientProfilePage } from "@/pages/client-area/client-profile-page"

export const Route = createFileRoute("/_layout/client-profile")({
	component: ClientProfilePage,
	head: () => ({ meta: [{ title: "Client profile | Skilio" }] }),
})
