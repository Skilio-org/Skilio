import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext } from "@tanstack/react-router"
import ErrorComponent from "@/components/common/error-component"
import NotFound from "@/components/common/not-found"
import { RootLayout } from "@/pages/layouts/root-layout"

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
	component: RootLayout,
	notFoundComponent: () => <NotFound />,
	errorComponent: ({ error, reset }) => (
		<ErrorComponent error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
	),
})
