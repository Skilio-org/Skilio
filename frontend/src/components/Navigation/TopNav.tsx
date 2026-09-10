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
import useAuth from "@/hooks/useAuth";

export function TopNav() {
  const { user } = useAuth();
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

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo to="/dashboard" className="h-8" />

        <nav
          aria-label="Workspace navigation"
          className="ml-4 hidden h-full shrink-0 items-center gap-1 lg:flex"
        >
          <Link
            to="/dashboard"
            className={`flex h-full items-center whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors ${
              pathname === "/dashboard"
                ? "border-brand-600 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </Link>
          <Link
            to="/talent"
            search={{ q: undefined }}
            className={`flex h-full items-center whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors ${pathname.startsWith("/talent") ? "border-brand-600 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Find talent
          </Link>
          <Link
            to="/saved"
            className={`flex h-full items-center whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors ${pathname === "/saved" ? "border-brand-600 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Saved
          </Link>
          <Link
            to="/messages"
            search={{}}
            className={`flex h-full items-center whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors ${pathname === "/messages" ? "border-brand-600 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Messages
          </Link>
        </nav>

        <form
          onSubmit={handleSearch}
          className="ml-auto hidden min-h-11 w-full max-w-[300px] items-center rounded-full border border-input bg-background px-3 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100 xl:flex 2xl:max-w-sm"
        >
          <Search
            className="size-[18px] shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="global-talent-search" className="sr-only">
            Search talent
          </label>
          <input
            id="global-talent-search"
            name="q"
            type="search"
            placeholder="Search talent"
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <span className="border-l border-border pl-3 text-xs font-medium text-muted-foreground">
            Talent
          </span>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link
            to="/help"
            aria-label="Help"
            className="hidden size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
          >
            <CircleHelp className="size-5" />
          </Link>
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="relative hidden size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
          >
            <Bell className="size-5" />
            <span
              className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-background bg-brand-600"
              aria-hidden="true"
            />
          </Link>
          <User user={user} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open navigation"
                className="grid size-11 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
              >
                <Menu className="size-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-[min(19rem,calc(100vw-2rem))] p-2.5"
            >
              <DropdownMenuLabel className="px-2.5 pb-2 pt-1">
                <span className="block font-display text-base font-semibold text-foreground">
                  Client workspace
                </span>
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
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
              <MobileNavLink
                to="/saved"
                label="Saved talent"
                icon={Bookmark}
                active={pathname === "/saved"}
              />
              <MobileNavLink
                to="/messages"
                label="Messages"
                icon={MessageSquare}
                active={pathname === "/messages"}
              />
              <MobileNavLink
                to="/notifications"
                label="Notifications"
                icon={Bell}
                active={pathname === "/notifications"}
              />
              <MobileNavLink
                to="/settings"
                label="Settings"
                icon={Settings}
                active={pathname === "/settings"}
              />
              <DropdownMenuSeparator className="my-2" />
              <MobileNavLink
                to="/help"
                label="Help center"
                icon={CircleHelp}
                active={pathname === "/help"}
              />
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
  to:
    | "/dashboard"
    | "/talent"
    | "/saved"
    | "/messages"
    | "/notifications"
    | "/settings"
    | "/help";
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <DropdownMenuItem
      asChild
      className={`mb-0.5 min-h-12 cursor-pointer rounded-xl px-2.5 ${
        active ? "bg-brand-50 text-brand-950" : ""
      }`}
    >
      <Link to={to}>
        <span
          className={`grid size-8 place-items-center rounded-lg ${
            active
              ? "bg-brand-600 text-white"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="size-4 text-current" />
        </span>
        <span className="font-semibold">{label}</span>
      </Link>
    </DropdownMenuItem>
  );
}
