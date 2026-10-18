import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { AUTH_TOKEN_CHANGED_EVENT } from "@/context/websocket-context"

const googleAuthSearchSchema = z.object({
	code: z.string().optional(),
	state: z.string().optional(),
	error: z.string().optional(),
})

export const Route = createFileRoute("/googleAuth")({
	component: GoogleAuthCallbackRoute,
	validateSearch: (search) => googleAuthSearchSchema.parse(search),
	loaderDeps: ({ search }) => ({
		code: search.code,
		state: search.state,
		error: search.error,
	}),
	loader: async ({ deps }) => {
		if (deps.error) {
			throw redirect({
				to: "/login",
				search: { error: deps.error },
			})
		}

		if (!deps.code) {
			throw redirect({
				to: "/login",
				search: { error: "Missing Google authorization code" },
			})
		}

		try {
			const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")
			const params = new URLSearchParams({ code: deps.code })
			if (deps.state) {
				params.set("state", deps.state)
			}

			const callbackUrl = import.meta.env.VITE_GOOGLE_OAUTH_URL
				? `${import.meta.env.VITE_GOOGLE_OAUTH_URL}/callback?${params.toString()}`
				: `${baseUrl}/api/v1/login/google/callback?${params.toString()}`

			const response = await fetch(callbackUrl, { credentials: "include" })
			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.detail || "Authentication failed")
			}

			const data = await response.json()
			localStorage.setItem("access_token", data.access_token)
			window.dispatchEvent(new Event (AUTH_TOKEN_CHANGED_EVENT))
		} catch (error) {
			throw redirect({
				to: "/login",
				search: {
					error: error instanceof Error ? error.message : "Authentication failed",
				},
			})
		}

		throw redirect({ to: "/dashboard" })
	},
})

function GoogleAuthCallbackRoute() {
	return null
}
