import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  LayoutDashboard,
  type LucideIcon,
  Menu,
  MessageSquare,
  Settings,
  UsersRound,
} from "lucide-react";

import { Logo } from "@/components/common/logo";
import { User } from "@/components/sidebar/user";
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
import { FreelancerNav } from "./freelancer-nav";

export function TopNav() {
  const { user } = useAuth();
  const role = useAccountRole();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  if (role === "freelancer") return <FreelancerNav />;

  return (
    <header className="border-border bg-card/95 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-330 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
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
            to="/client-jobs"
            className={`flex h-full items-center border-b-2 px-3 text-sm font-medium whitespace-nowrap ${pathname === "/client-jobs" ? "border-brand-600 text-foreground" : "text-muted-foreground hover:text-foreground border-transparent"}`}
          >
            Jobs
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
        <div className="ml-auto flex items-center gap-1 xl:ml-0">
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="text-muted-foreground hover:bg-accent hover:text-foreground relative hidden size-11 items-center justify-center rounded-full transition-colors sm:flex"
          >
            <Bell className="size-5" />
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
              <MobileNavLink
                to="/client-jobs"
                label="Your jobs"
                icon={BriefcaseBusiness}
                active={pathname === "/client-jobs"}
              />
              <MobileNavLink to="/messages" label="Messages" icon={MessageSquare} active={pathname === "/messages"} />
              <MobileNavLink
                to="/notifications"
                label="Notifications"
                icon={Bell}
                active={pathname === "/notifications"}
              />
              <MobileNavLink to="/settings" label="Settings" icon={Settings} active={pathname === "/settings"} />
              <DropdownMenuSeparator className="my-2" />
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
  to: "/dashboard" | "/talent" | "/saved" | "/messages" | "/notifications" | "/settings" | "/client-jobs";
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
