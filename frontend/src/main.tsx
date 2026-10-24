import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { AxiosError } from "axios"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { client } from "./client/client.gen"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/sonner"
import { AUTH_TOKEN_CHANGED_EVENT, WebSocketProvider } from "./context/websocket-context"
import { routeTree } from "./routeTree.gen"
import "./styles/globals.css"

client.setConfig({
	baseURL: import.meta.env.VITE_API_URL ?? "",
	auth: () => localStorage.getItem("access_token") || "",
})

let queryClient: QueryClient
const handleApiError = (error: Error) => {
	if (error instanceof AxiosError && [401, 403].includes(error.response?.status ?? 0)) {
		localStorage.removeItem("access_token")
		window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT))
		queryClient.clear()
		window.location.href = "/login"
	}
}

queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: handleApiError,
	}),
	mutationCache: new MutationCache({
		onError: handleApiError,
	}),
})

const router = createRouter({ routeTree, context: { queryClient } })
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

ReactDOM.createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<QueryClientProvider client={queryClient}>
				<WebSocketProvider>
					<RouterProvider router={router} />
					<Toaster richColors closeButton />
				</WebSocketProvider>
			</QueryClientProvider>
		</ThemeProvider>
	</StrictMode>,
)
