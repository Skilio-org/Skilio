import { createFileRoute, redirect } from "@tanstack/react-router"
import { isLoggedIn } from "@/hooks/useAuth"
import { AppLayout } from "@/pages/common/app-layout"

export const Route = createFileRoute("/_layout")({
	component: AppLayout,
	beforeLoad: () => {
		if (import.meta.env.MODE === "visual-test") return
		if (!isLoggedIn()) throw redirect({ to: "/login" })
	},
})
