import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { AUTH_TOKEN_CHANGED_EVENT } from "@/context/websocket-context"

export function LinkedinAuthCallbackPage({ code, state, error }: { code?: string; state?: string; error?: string }) {
	const navigate = useNavigate()

	useEffect(() => {
		const controller = new AbortController()
		if (error) {
			navigate({
				to: "/login",
				search: { error },
			})

			return
		}

		if (!code) {
			navigate({
				to: "/login",
				search: { error: "Missing LinkedIn authorization code" },
			})

			return
		}

		const authenticate = async () => {
			try {
				const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")
				const params = new URLSearchParams({ code })
				if (state) {
					params.set("state", state)
				}

				const callbackUrl = import.meta.env.VITE_LINKEDIN_OAUTH_URL
					? `${import.meta.env.VITE_LINKEDIN_OAUTH_URL}/callback?${params.toString()}`
					: `${baseUrl}/api/v1/login/linkedin/callback?${params.toString()}`

				const res = await fetch(callbackUrl, {
					credentials: "include",
					signal: controller.signal,
				})

				if (!res.ok) {
					const errorData = await res.json()
					throw new Error(errorData.detail || "Authentication failed")
				}

				const data = await res.json()

				localStorage.setItem("access_token", data.access_token)
				window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT))

				navigate({
					to: "/dashboard",
				})
			} catch (err: any) {
				if (err.name !== "AbortError") {
					navigate({
						to: "/login",
						search: {
							error: err instanceof Error ? err.message : "Authentication failed",
						},
					})
				}
			}
		}

		void authenticate()
		return () => {
			// Cleanup function to remove the event listener when the component unmounts
			controller.abort()
			window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, () => {})
		}
	}, [error, code, state, navigate])

	return null
}
