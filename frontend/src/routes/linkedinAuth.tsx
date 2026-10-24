import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { AUTH_TOKEN_CHANGED_EVENT } from "@/context/websocket-context"

const linkedinAuthSearchSchema = z.object({
	code: z.string().optional(),
	state: z.string().optional(),
	error: z.string().optional(),
})

export const Route = createFileRoute("/linkedinAuth")({
	component: LinkedinAuthCallbackRoute,
	validateSearch: (search) => linkedinAuthSearchSchema.parse(search),
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
				search: { error: "Missing LinkedIn authorization code" },
			})
		}

		try {
			const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")
			const params = new URLSearchParams({ code: deps.code })
			if (deps.state) {
				params.set("state", deps.state)
			}

			const callbackUrl = import.meta.env.VITE_LINKEDIN_OAUTH_URL
				? `${import.meta.env.VITE_LINKEDIN_OAUTH_URL}/callback?${params.toString()}`
				: `${baseUrl}/api/v1/login/linkedin/callback?${params.toString()}`

			const response = await fetch(callbackUrl, { credentials: "include" })
			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.detail || "Authentication failed")
			}

			const data = await response.json()
			localStorage.setItem("access_token", data.access_token)
			window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT))
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

function LinkedinAuthCallbackRoute() {
	return null
}