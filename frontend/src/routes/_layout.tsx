import { createFileRoute, redirect } from "@tanstack/react-router"
import { isAxiosError } from "axios"
import { currentUserQueryKey, fetchCurrentUser, isLoggedIn } from "@/hooks/useAuth"
import { AUTH_TOKEN_CHANGED_EVENT } from "@/context/websocket-context"
import { AppLayout } from "@/pages/layouts/app-layout"

export const Route = createFileRoute("/_layout")({
	component: AppLayout,
	beforeLoad: async ({ context }) => {
		if (!isLoggedIn()) throw redirect({ to: "/login" })

		try {
			await context.queryClient.fetchQuery({
				queryKey: currentUserQueryKey,
				queryFn: fetchCurrentUser,
				staleTime: 0,
				retry: false,
			})
		} catch (error) {
			if (isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
				localStorage.removeItem("access_token")
				window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT))
				context.queryClient.clear()
				throw redirect({ to: "/login" })
			}
			throw error
		}
	},
})
