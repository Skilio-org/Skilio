import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  CircleHelp,
  LayoutDashboard,
  type LucideIcon,
  Menu,
  MessageSquare,
  Search,
  Settings,
  UsersRound,
} from "lucide-react";

import { Logo } from "@/components/Common/Logo";
import { User } from "@/components/Sidebar/User";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccountRole } from "@/hooks/useAccountRole";
import useAuth from "@/hooks/useAuth";
import { FreelancerNav } from "./FreelancerNav";

export function TopNav() {
  const { user } = useAuth();
  const role = useAccountRole();
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = String(data.get("q") ?? "").trim();
    navigate({ to: "/talent", search: { q: query || undefined } });
  };

  if (role === "freelancer") return <FreelancerNav />;

  return (
    <header className="border-border bg-background/95 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo to="/dashboard" className="h-8" />

        <nav aria-label="Workspace navigation" className="ml-4 hidden h-full shrink-0 items-center gap-1 lg:flex">
          <Link
            to="/dashboard"
            className={`flex h-full items-center border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors ${
              pathname === "/dashboard"
                ? "border-brand-600 text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            Overview
          </Link>
          <Link
            to="/talent"
            search={{ q: undefined }}
            className={`flex h-full items-center border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors ${pathname.startsWith("/talent") ? "border-brand-600 text-foreground" : "text-muted-foreground hover:text-foreground border-transparent"}`}
          >
            Find talent
          </Link>
          <Link
            to="/saved"
            className={`flex h-full items-center border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors ${pathname === "/saved" ? "border-brand-600 text-foreground" : "text-muted-foreground hover:text-foreground border-transparent"}`}
          >
            Saved
          </Link>
          <Link
            to="/messages"
            search={{}}
            className={`flex h-full items-center border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors ${pathname === "/messages" ? "border-brand-600 text-foreground" : "text-muted-foreground hover:text-foreground border-transparent"}`}
          >
            Messages
          </Link>
        </nav>

        <form
          onSubmit={handleSearch}
          className="border-input bg-background focus-within:border-brand-600 focus-within:ring-brand-100 ml-auto hidden min-h-11 w-full max-w-[300px] items-center rounded-full border px-3 focus-within:ring-2 xl:flex 2xl:max-w-sm"
        >
          <Search className="text-muted-foreground size-[18px] shrink-0" aria-hidden="true" />
          <label htmlFor="global-talent-search" className="sr-only">
            Search talent
          </label>
          <input
            id="global-talent-search"
            name="q"
            type="search"
            placeholder="Search talent"
            className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <span className="border-border text-muted-foreground border-l pl-3 text-xs font-medium">Talent</span>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link
            to="/help"
            aria-label="Help"
            className="text-muted-foreground hover:bg-accent hover:text-foreground hidden size-11 items-center justify-center rounded-full transition-colors sm:flex"
          >
            <CircleHelp className="size-5" />
          </Link>
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="text-muted-foreground hover:bg-accent hover:text-foreground relative hidden size-11 items-center justify-center rounded-full transition-colors sm:flex"
          >
            <Bell className="size-5" />
            <span
              className="border-background bg-brand-600 absolute top-2.5 right-2.5 size-2 rounded-full border-2"
              aria-hidden="true"
            />
          </Link>
          <User user={user} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open navigation"
                className="text-muted-foreground hover:bg-accent hover:text-foreground grid size-11 place-items-center rounded-full lg:hidden"
              >
                <Menu className="size-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={10} className="w-[min(19rem,calc(100vw-2rem))] p-2.5">
              <DropdownMenuLabel className="px-2.5 pt-1 pb-2">
                <span className="font-display text-foreground block text-base font-semibold">Client workspace</span>
                <span className="text-muted-foreground mt-0.5 block text-xs font-normal">
                  Navigate your hiring activity
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="mb-2" />
              <MobileNavLink
                to="/dashboard"
                label="Overview"
                icon={LayoutDashboard}
                active={pathname === "/dashboard"}
              />
              <MobileNavLink
                to="/talent"
                label="Find talent"
                icon={UsersRound}
                active={pathname.startsWith("/talent")}
              />
              <MobileNavLink to="/saved" label="Saved talent" icon={Bookmark} active={pathname === "/saved"} />
              <MobileNavLink to="/messages" label="Messages" icon={MessageSquare} active={pathname === "/messages"} />
              <MobileNavLink
                to="/notifications"
                label="Notifications"
                icon={Bell}
                active={pathname === "/notifications"}
              />
              <MobileNavLink to="/settings" label="Settings" icon={Settings} active={pathname === "/settings"} />
              <DropdownMenuSeparator className="my-2" />
              <MobileNavLink to="/help" label="Help center" icon={CircleHelp} active={pathname === "/help"} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function MobileNavLink({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: "/dashboard" | "/talent" | "/saved" | "/messages" | "/notifications" | "/settings" | "/help";
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <DropdownMenuItem
      asChild
      className={`mb-0.5 min-h-12 cursor-pointer rounded-xl px-2.5 ${active ? "bg-brand-50 text-brand-950" : ""}`}
    >
      <Link to={to}>
        <span
          className={`grid size-8 place-items-center rounded-lg ${
            active ? "bg-brand-600 text-white" : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="size-4 text-current" />
        </span>
        <span className="font-semibold">{label}</span>
      </Link>
    </DropdownMenuItem>
  );
}
