import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserPublic } from "@/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setAccountRole, useAccountRole } from "@/hooks/useAccountRole";
import useAuth from "@/hooks/useAuth";
import { getInitials } from "@/utils";

export function User({ user }: { user?: (UserPublic & { avatar_url?: string }) | null }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const freelancer = useAccountRole() === "freelancer";
  const [switching, setSwitching] = useState(false);
  const [open, setOpen] = useState(false);
  const displayName = user?.full_name || user?.email || "Your account";
  const role = freelancer ? "Freelancer" : "Client";
  const nextRole = freelancer ? "client" : "freelancer";

  const switchWorkspace = async () => {
    if (switching) return;
    if (!user && import.meta.env.MODE !== "visual-test") return;
    setSwitching(true);
    try {
      if (user) setAccountRole(user.email, nextRole);
      setOpen(false);
      await navigate({
        to: freelancer ? "/dashboard" : "/freelancer-dashboard",
      });
      toast.success(`Switched to ${nextRole} workspace`);
    } catch {
      toast.error("We couldn't switch workspaces. Please try again.");
    } finally {
      setSwitching(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-testid="user-menu"
          aria-label={`Open account menu, ${role} workspace`}
          className="account-trigger hover:bg-muted flex min-h-11 items-center gap-2 rounded-xl p-1.5 text-left transition-colors sm:gap-3 sm:pr-3"
        >
          <Avatar className="size-8 rounded-lg">
            {user?.avatar_url && <AvatarImage src={user.avatar_url} alt={displayName} />}
            <AvatarFallback className="bg-brand-100 text-brand-800 rounded-lg text-xs font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 sm:block">
            <p className="max-w-28 truncate text-xs font-semibold">{user?.full_name || "My account"}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">{role}</p>
          </div>
          <ChevronDown className="text-muted-foreground size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="shadow-floating w-[min(20rem,calc(100vw-2rem))] rounded-2xl p-2"
      >
        <div className="px-3 py-3">
          <p className="truncate text-sm font-semibold">{displayName}</p>
          <p className="text-muted-foreground mt-1 truncate text-xs">
            {user?.email || "Manage your account and workspace"}
          </p>
        </div>
        <div className="border-border bg-muted/50 mx-1 mb-2 rounded-xl border p-3">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <BriefcaseBusiness className="size-3.5" />
            <span>Current workspace</span>
            <Check className="text-primary ml-auto size-3.5" />
          </div>
          <p className="mt-2 text-sm font-semibold">
            {role}
            <span className="text-muted-foreground ml-2 font-normal">
              {freelancer ? "Find work & grow" : "Hire & collaborate"}
            </span>
          </p>
          <DropdownMenuItem
            disabled={switching}
            onSelect={(event) => {
              event.preventDefault();
              void switchWorkspace();
            }}
            className="border-brand-200 bg-brand-50 text-brand-800 focus:bg-brand-100 focus:text-brand-950 mt-3 min-h-11 cursor-pointer justify-between rounded-lg border px-3"
          >
            <span className="text-sm font-medium">{switching ? "Switching…" : `Switch to ${nextRole}`}</span>
            <ArrowLeftRight className="size-4 text-current" />
          </DropdownMenuItem>
        </div>
        <AccountMenuLink
          to={freelancer ? "/freelancer-dashboard" : "/dashboard"}
          title="Overview"
          icon={LayoutDashboard}
          active={pathname === (freelancer ? "/freelancer-dashboard" : "/dashboard")}
        />
        <AccountMenuLink
          to={freelancer ? "/freelancer" : "/client-profile"}
          title={freelancer ? "Freelancer profile" : "Client profile"}
          icon={UserRound}
          active={pathname === (freelancer ? "/freelancer" : "/client-profile")}
        />
        <AccountMenuLink
          to={freelancer ? "/freelancer-settings" : "/settings"}
          title="Account settings"
          icon={Settings}
          active={pathname === (freelancer ? "/freelancer-settings" : "/settings")}
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={logout}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive min-h-11 cursor-pointer rounded-lg px-3"
        >
          <LogOut className="size-4 text-current" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AccountMenuLink({
  to,
  title,
  icon: Icon,
  active,
}: {
  to: "/dashboard" | "/settings" | "/client-profile" | "/freelancer" | "/freelancer-dashboard" | "/freelancer-settings";
  title: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <DropdownMenuItem asChild className={`mt-1 min-h-11 cursor-pointer rounded-lg px-3 ${active ? "bg-muted" : ""}`}>
      <Link to={to}>
        <Icon className="size-4 text-current" />
        <span>{title}</span>
      </Link>
    </DropdownMenuItem>
  );
}
