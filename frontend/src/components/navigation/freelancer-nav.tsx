import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/common/logo";
import { User } from "@/components/sidebar/user";
import useAuth from "@/hooks/useAuth";

const links = [
  ["/freelancer-dashboard", "Overview"],
  ["/freelancer-jobs", "Find work"],
  ["/freelancer-proposals", "Proposals"],
  ["/freelancer-projects", "My work"],
  ["/freelancer-earnings", "Earnings"],
  ["/freelancer-messages", "Messages"],
] as const;
export function FreelancerNav() {
  const { user } = useAuth();
  const path = useRouterState({ select: (state) => state.location.pathname });
  return (
    <header className="border-border bg-background/95 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo to="/freelancer-dashboard" className="h-8" />
        <nav aria-label="Freelancer workspace" className="hidden h-full flex-1 items-center gap-1 lg:flex">
          {links.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className={`flex h-full items-center border-b-2 px-3 text-sm font-medium whitespace-nowrap ${path === to ? "border-brand-600 text-foreground" : "text-muted-foreground hover:text-foreground border-transparent"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/freelancer"
            className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center text-sm font-medium"
          >
            My profile
          </Link>
          <User user={user} />
        </div>
      </div>
      <nav aria-label="Freelancer mobile navigation" className="flex overflow-x-auto px-4 lg:hidden">
        {links.map(([to, label]) => (
          <Link
            key={to}
            to={to}
            className={`flex min-h-12 shrink-0 items-center border-b-2 px-3 text-sm ${path === to ? "border-primary font-semibold" : "text-muted-foreground border-transparent"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
