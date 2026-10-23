import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { HeadContent, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

export function RootLayout() {
	return (
		<>
			<HeadContent />
			<a
				href="#main-content"
				className="fixed top-4 left-4 z-100 -translate-y-24 rounded-full bg-slate-950 px-4 py-2 font-semibold text-sm text-white shadow-floating transition-transform focus:translate-y-0"
			>
				Skip to main content
			</a>
			<Outlet />
			<TanStackRouterDevtools position="bottom-right" />
			<ReactQueryDevtools initialIsOpen={false} />
		</>
	)
}
