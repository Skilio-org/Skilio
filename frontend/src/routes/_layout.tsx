import { createFileRoute, redirect } from "@tanstack/react-router"
import { isLoggedIn } from "@/hooks/useAuth"
import { AppLayout } from "@/pages/common/app-layout"

export const Route = createFileRoute("/_layout")({
	component: AppLayout,
	beforeLoad: async () => {
		console.log("Checking if user is logged in with access token: ", localStorage.getItem("access_token"))
		if (!await isLoggedIn()) throw redirect({ to: "/login" })
		else console.log("User is logged in, proceeding to load the layout with: ", localStorage.getItem("access_token"))
	},
})
