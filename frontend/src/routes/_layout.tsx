import { createFileRoute, redirect } from "@tanstack/react-router"
import { isLoggedIn } from "@/hooks/useAuth"
import { UsersService } from "@/client"
import { AUTH_TOKEN_CHANGED_EVENT } from "@/context/websocket-context"
import { AppLayout } from "@/pages/common/app-layout"

export const Route = createFileRoute("/_layout")({
	component: AppLayout,
	beforeLoad: async () => {
		if (!isLoggedIn()) throw redirect({ to: "/login" })
		// Validate the token server-side before rendering any protected area
		try {
			await UsersService.readUserMe()
		} catch {
			localStorage.removeItem("access_token")
			window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT))
			throw redirect({ to: "/login" })
		}
	},
})
