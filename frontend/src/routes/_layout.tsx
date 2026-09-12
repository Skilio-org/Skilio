import { createFileRoute, Navigate, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { Footer } from "@/components/Common/Footer";
import { Logo } from "@/components/Common/Logo";
import { TopNav } from "@/components/Navigation/TopNav";
import { Button } from "@/components/ui/button";
import { accountRole } from "@/hooks/useAccountRole";
import useAuth, { isLoggedIn } from "@/hooks/useAuth";

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: () => {
    if (import.meta.env.MODE === "visual-test") return;

    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function Layout() {
  const { user, isPending, isFetching, error, refetch, logout } = useAuth();
  const path = useRouterState({ select: (state) => state.location.pathname });

  // Use the shared account query so expired sessions reach the existing
  // authentication handler, and transient failures remain recoverable.
  if (import.meta.env.MODE !== "visual-test") {
    if (!user) {
      return (
        <div className="bg-background flex min-h-svh flex-col">
          <header className="mx-auto w-full max-w-[1320px] px-6 py-6">
            <Logo />
          </header>
          <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 pb-24 outline-none"
          >
            {error ? (
              <section role="alert" className="bg-card rounded-2xl border p-8">
                <h1 className="text-2xl font-semibold tracking-tight">We couldn’t load your account</h1>
                <p className="text-muted-foreground mt-3">
                  Check your connection and try again, or sign in again to refresh your session.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button disabled={isFetching} onClick={() => void refetch()}>
                    {isFetching ? "Trying again…" : "Try again"}
                  </Button>
                  <Button variant="outline" onClick={logout}>
                    Back to sign in
                  </Button>
                </div>
              </section>
            ) : (
              <p role="status" className="text-muted-foreground text-center">
                {isPending ? "Loading your workspace…" : "Checking your account…"}
              </p>
            )}
          </main>
        </div>
      );
    }
    if (accountRole(user.email) === "freelancer") {
      if (
        [
          "/dashboard",
          "/talent",
          "/saved",
          "/client-profile",
          "/messages",
          "/help",
          "/notifications",
          "/settings",
        ].some((p) => path === p || path.startsWith(`${p}/`))
      ) {
        return (
          <Navigate
            replace
            to={
              path === "/messages"
                ? "/freelancer-messages"
                : path === "/settings"
                  ? "/freelancer-settings"
                  : "/freelancer-dashboard"
            }
          />
        );
      }
    } else if (path.startsWith("/freelancer")) {
      return <Navigate replace to="/dashboard" />;
    }
  }
  return (
    <div className="bg-background flex min-h-svh flex-col">
      <TopNav />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
