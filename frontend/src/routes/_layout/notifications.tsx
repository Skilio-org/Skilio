import { createFileRoute } from "@tanstack/react-router"
import { NotificationsPage } from "@/pages/client-area/notifications-page"

export const Route = createFileRoute("/_layout/notifications")({
	component: NotificationsPage,
	head: () => ({ meta: [{ title: "Notifications | Skilio" }] }),
})
