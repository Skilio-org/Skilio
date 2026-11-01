import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { AUTH_TOKEN_CHANGED_EVENT } from "@/context/websocket-context"
import { isLoggedIn } from "@/hooks/useAuth"
import { ResetPasswordPage } from "@/pages/auth/reset-password-page"

const searchSchema = z.object({ token: z.string().catch("") })

export const Route = createFileRoute("/reset-password")({
	component: ResetPasswordRoute,
	validateSearch: searchSchema,
	beforeLoad: async ({ search, context }) => {
		if (!search.token) throw redirect({ to: "/login" })
		if (isLoggedIn()) {
			localStorage.removeItem("access_token")
			window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT))
			context.queryClient.clear()
		}
	},
	head: () => ({
		meta: [
			{ title: "Reset password | Skilio" },
			{ name: "description", content: "Choose a new password for your Skilio account." },
		],
	}),
})

function ResetPasswordRoute() {
	return <ResetPasswordPage token={Route.useSearch().token} />
}
