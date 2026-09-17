import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import ErrorComponent from "@/components/common/error-component";
import NotFound from "@/components/common/not-found";

export const Route = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <a
        href="#main-content"
        className="shadow-floating fixed top-4 left-4 z-[100] -translate-y-24 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  ),
  notFoundComponent: () => <NotFound />,
  errorComponent: ({ error, reset }) => (
    <ErrorComponent
      error={error instanceof Error ? error : new Error(String(error))}
      reset={reset}
    />
  ),
});
