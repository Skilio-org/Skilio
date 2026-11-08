import { createFileRoute, redirect } from "@tanstack/react-router"
import { isAxiosError } from "axios"
import { z } from "zod"
import { LoginService } from "@/client"
import { AUTH_TOKEN_CHANGED_EVENT } from "@/context/websocket-context"

const googleAuthSearchSchema = z.object({
	code: z.string().optional(),
	state: z.string().optional(),
	error: z.string().optional(),
})

export const Route = createFileRoute("/googleAuth")({
	component: () => null,
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
			const oauthUrl = import.meta.env.VITE_GOOGLE_OAUTH_URL
			const baseURL = import.meta.env.VITE_API_URL || (oauthUrl ? new URL(oauthUrl, window.location.origin).origin : "")
			const { data } = await LoginService.googleCallback({
				baseURL,
				query: { code: deps.code, state: deps.state },
				withCredentials: true,
			})
			const token = z.object({ access_token: z.string().min(1) }).parse(data)
			localStorage.setItem("access_token", token.access_token)
			window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT))
		} catch (error) {
			const detail = isAxiosError<{ detail?: string }>(error) ? error.response?.data?.detail : undefined
			throw redirect({
				to: "/login",
				search: {
					error: detail || (error instanceof Error ? error.message : "Authentication failed"),
				},
			})
		}

		throw redirect({ to: "/dashboard" })
	},
})
