import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { AUTH_TOKEN_CHANGED_EVENT } from "@/context/websocket-context"

export function GoogleAuthCallbackPage({ code, error }: { code?: string; error?: string }) {
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
				search: { error: "Missing Google authorization code" },
			})

			return
		}

		const authenticate = async () => {
			try {
				const res = await fetch(`${import.meta.env.VITE_GOOGLE_OAUTH_URL}/callback?code=${encodeURIComponent(code)}`, {
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
	}, [code, error, navigate])

	return null
}
