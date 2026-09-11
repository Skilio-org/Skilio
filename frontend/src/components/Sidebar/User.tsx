import { Link, useRouterState } from "@tanstack/react-router"
import {
  BadgeCheck,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAccountRole } from "@/hooks/useAccountRole"
import useAuth from "@/hooks/useAuth"
import { getInitials } from "@/utils"

export function User({ user }: { user: any }) {
  const { logout } = useAuth()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const freelancer = useAccountRole() === "freelancer"
  const displayName =
    user?.full_name ||
    user?.email ||
    (freelancer ? "Freelancer account" : "Client account")
  const email =
    user?.email ||
    (freelancer ? "Your freelancer workspace" : "Signed-in client")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-testid="user-menu"
          aria-label="Open account menu"
          className="flex min-h-11 items-center gap-2 rounded-full p-1 pr-2 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Avatar className="size-9 border border-border">
            {user?.avatar_url && (
              <AvatarImage src={user.avatar_url} alt={displayName} />
            )}
            <AvatarFallback className="bg-brand-100 text-xs font-semibold text-brand-800">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 2xl:block">
            <p className="max-w-28 truncate text-xs font-semibold text-foreground">
              {displayName}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {freelancer ? "Freelancer" : "Client"}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border-border/80 p-0 shadow-floating"
      >
        <div className="relative overflow-hidden bg-slate-950 px-5 pb-5 pt-6 text-white">
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-16 size-40 rounded-full bg-brand-500/25 blur-3xl"
          />
          <div className="relative flex items-center gap-3.5">
            <Avatar className="size-12 border border-white/20 ring-4 ring-white/10">
              {user?.avatar_url && (
                <AvatarImage src={user.avatar_url} alt={displayName} />
              )}
              <AvatarFallback className="bg-white text-sm font-bold text-slate-950">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-semibold">
                {displayName}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-300">{email}</p>
            </div>
          </div>
          <div className="relative mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-100">
            <BadgeCheck className="size-3.5 text-sky-300" />
            {freelancer ? "Freelancer workspace" : "Client workspace"}
          </div>
        </div>

        <div className="p-2.5">
          <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Workspace
          </p>
          <AccountMenuLink
            to={freelancer ? "/freelancer-dashboard" : "/dashboard"}
            title="Overview"
            description={
              freelancer ? "Your freelance workspace" : "Your hiring workspace"
            }
            icon={LayoutDashboard}
            active={
              pathname === (freelancer ? "/freelancer-dashboard" : "/dashboard")
            }
          />
          {!freelancer && (
            <AccountMenuLink
              to="/client-profile"
              title="Client profile"
              description="How talent sees you"
              icon={UserRound}
              active={pathname === "/client-profile"}
            />
          )}
          {freelancer && (
            <AccountMenuLink
              to="/freelancer"
              title="Freelancer profile"
              description="Set up your profile and showcase your work"
              icon={UserRound}
              active={pathname === "/freelancer"}
            />
          )}
          <AccountMenuLink
            to={freelancer ? "/freelancer-settings" : "/settings"}
            title="Account settings"
            description="Profile, security and access"
            icon={Settings}
            active={
              pathname === (freelancer ? "/freelancer-settings" : "/settings")
            }
          />
        </div>

        <div className="border-t border-border bg-muted/35 p-2.5">
          <DropdownMenuItem
            onClick={logout}
            className="min-h-11 cursor-pointer rounded-xl px-3 text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-destructive/10">
              <LogOut className="size-4 text-destructive" />
            </span>
            <span className="font-semibold">Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AccountMenuLink({
  to,
  title,
  description,
  icon: Icon,
  active,
}: {
  to:
    | "/dashboard"
    | "/settings"
    | "/client-profile"
    | "/freelancer"
    | "/freelancer-dashboard"
    | "/freelancer-settings"
  title: string
  description: string
  icon: typeof LayoutDashboard
  active: boolean
}) {
  return (
    <DropdownMenuItem
      asChild
      className={`group mb-0.5 min-h-14 cursor-pointer rounded-xl p-0 focus:bg-brand-50 focus:text-brand-950 ${
        active ? "bg-brand-50 text-brand-950" : ""
      }`}
    >
      <Link to={to} className="flex w-full items-center gap-3 px-2.5 py-2">
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-lg transition-colors ${
            active
              ? "bg-brand-600 text-white"
              : "bg-muted text-muted-foreground group-focus:bg-white group-focus:text-brand-700"
          }`}
        >
          <Icon className="size-4 text-current" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-5">{title}</span>
          <span className="block truncate text-[11px] leading-4 text-muted-foreground">
            {description}
          </span>
        </span>
        <ChevronRight className="size-4 text-muted-foreground/70 transition-transform group-focus:translate-x-0.5 group-focus:text-brand-700" />
      </Link>
    </DropdownMenuItem>
  )
}
