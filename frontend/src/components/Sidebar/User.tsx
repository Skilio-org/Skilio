import { Link as RouterLink } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleUserRound,
  LogOut,
  Moon,
  Settings,
  Sun,
  UserRound
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { Switch } from "@/components/ui/switch";

import { useTheme } from "@/components/theme-provider";
import useAuth from "@/hooks/useAuth";

import { getInitials } from "@/utils";

/* =========================================================
   TYPES
   ========================================================= */

interface UserInfoProps {
  fullName?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  size?: "small" | "large";
}

/* =========================================================
   HELPERS
   ========================================================= */

function getRoleLabel(role?: string) {
  if (role === "client") {
    return "Client";
  }

  if (role === "freelancer") {
    return "Freelancer";
  }

  return "Member";
}

/* =========================================================
   AVATAR
   ========================================================= */

function UserAvatar({
  fullName,
  email,
  avatarUrl,
  size = "small",
}: {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  size?: "small" | "large";
}) {
  const displayName = fullName || email || "User";

  return (
    <Avatar
      className={
        size === "large"
          ? `
              size-12
              shrink-0
              border
              border-border
            `
          : `
              size-8
              shrink-0
              border
              border-border
            `
      }
    >
      {avatarUrl && (
        <AvatarImage
          src={avatarUrl}
          alt={displayName}
          className="object-cover"
        />
      )}

      <AvatarFallback
        className="
          bg-primary
          font-semibold
          text-primary-foreground
        "
      >
        {getInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );
}

/* =========================================================
   USER INFO
   ========================================================= */

function UserInfo({
  fullName,
  email,
  role,
  avatarUrl,
  size = "small",
}: UserInfoProps) {
  const displayName = fullName || email || "User";
  const roleLabel = getRoleLabel(role);

  return (
    <div
      className="
        flex
        min-w-0
        w-full
        items-center
        gap-3
      "
    >
      <UserAvatar
        fullName={fullName}
        email={email}
        avatarUrl={avatarUrl}
        size={size}
      />

      <div className="min-w-0 flex-1">
        <p
          className={
            size === "large"
              ? `
                  truncate
                  text-[15px]
                  font-semibold
                  text-foreground
                `
              : `
                  truncate
                  text-sm
                  font-semibold
                  text-foreground
                `
          }
        >
          {displayName}
        </p>

        <p
          className="
            mt-0.5
            truncate
            text-xs
            text-muted-foreground
          "
        >
          {roleLabel}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MENU ROW
   ========================================================= */

interface MenuRowProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
}

function MenuRow({ icon: Icon, label, onClick, trailing }: MenuRowProps) {
  return (
    <DropdownMenuItem
      onClick={onClick}
      className="
        group
        flex
        min-h-11
        cursor-pointer
        items-center
        gap-3
        rounded-lg
        px-3
        py-2.5
        text-sm
        font-medium
        text-foreground
        outline-none
        transition-colors

        focus:bg-accent
        focus:text-accent-foreground

        data-[highlighted]:bg-accent
        data-[highlighted]:text-accent-foreground
      "
    >
      <Icon
        className="
          size-[18px]
          shrink-0
          text-muted-foreground
        "
      />

      <span className="flex-1">{label}</span>

      {trailing && <div className="shrink-0">{trailing}</div>}
    </DropdownMenuItem>
  );
}

/* =========================================================
   USER
   ========================================================= */

export function User({ user }: { user: any }) {
  const { logout } = useAuth();

  const { isMobile, setOpenMobile, state } = useSidebar();

  const { resolvedTheme, setTheme } = useTheme();

  const [online, setOnline] = useState(true);

  if (!user) {
    return null;
  }

  const role = user?.role === "client" ? "client" : "freelancer";

  const isDark = resolvedTheme === "dark";

  const isCollapsed = !isMobile && state === "collapsed";

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = () => {
    logout();

    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          {/* =================================================
              TRIGGER
              ================================================= */}

          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              data-testid="user-menu"
              tooltip="Account"
              className={`
                transition-colors

                hover:bg-sidebar-accent
                hover:text-sidebar-accent-foreground

                data-[state=open]:bg-sidebar-accent
                data-[state=open]:text-sidebar-accent-foreground

                ${
                  isCollapsed
                    ? `
                      mx-auto
                      size-10!
                      justify-center
                      rounded-xl
                      p-1!
                    `
                    : `
                      min-h-14
                      rounded-xl
                      px-2.5
                    `
                }
              `}
            >
              {isCollapsed ? (
                <UserAvatar
                  fullName={user?.full_name}
                  email={user?.email}
                  avatarUrl={user?.avatar_url}
                />
              ) : (
                <>
                  <UserInfo
                    fullName={user?.full_name}
                    email={user?.email}
                    role={role}
                    avatarUrl={user?.avatar_url}
                  />

                  <ChevronDown
                    className="
                      ml-auto
                      size-4
                      shrink-0
                      text-muted-foreground
                      transition-transform
                      duration-200
                    "
                  />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          {/* =================================================
              DROPDOWN
              ================================================= */}

          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={10}
            collisionPadding={12}
            className="
              w-[340px]
              rounded-2xl
              border
              border-border
              bg-popover
              p-2
              text-popover-foreground
              shadow-floating
            "
          >
            {/* =================================================
                PROFILE
                ================================================= */}

            <DropdownMenuLabel
              className="
                p-3
                font-normal
              "
            >
              <UserInfo
                fullName={user?.full_name}
                email={user?.email}
                role={role}
                avatarUrl={user?.avatar_url}
                size="large"
              />
            </DropdownMenuLabel>

            {/* =================================================
                ONLINE
                ================================================= */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                px-3
                py-3
              "
            >
              <div>
                <p
                  className="
                    text-sm
                    font-medium
                    text-foreground
                  "
                >
                  Online for messages
                </p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-muted-foreground
                  "
                >
                  Let others know you're available
                </p>
              </div>

              <Switch
                checked={online}
                onCheckedChange={setOnline}
                aria-label="Online for messages"
              />
            </div>

            <DropdownMenuSeparator className="my-2" />

            {/* =================================================
                MY PROFILE
                ================================================= */}

            <RouterLink
              to="/settings"
              onClick={handleMenuClick}
              className="block"
            >
              <MenuRow icon={CircleUserRound} label="My profile" />
            </RouterLink>

            {/* =================================================
                STATS
                ================================================= */}

            <MenuRow icon={BarChart3} label="Stats and trends" />

            {/* =================================================
                PROFILE TYPE
                ================================================= */}

            <MenuRow
              icon={role === "client" ? BriefcaseBusiness : UserRound}
              label={
                role === "client" ? "Client workspace" : "Freelancer profile"
              }
            />

            {/* =================================================
                ACCOUNT HEALTH
                ================================================= */}

            <MenuRow icon={Activity} label="Account health" />

            {/* =================================================
                THEME
                ================================================= */}

            <MenuRow
              icon={isDark ? Moon : Sun}
              label={isDark ? "Theme: Dark" : "Theme: Light"}
              onClick={toggleTheme}
            />

            {/* =================================================
                SETTINGS
                ================================================= */}

            <RouterLink
              to="/settings"
              onClick={handleMenuClick}
              className="block"
            >
              <MenuRow icon={Settings} label="Settings" />
            </RouterLink>

            {/* =================================================
                SWITCH ACCOUNT
                ================================================= */}

            <DropdownMenuSeparator className="my-2" />

            <div
              className="
                px-3
                pb-1
                pt-2
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-muted-foreground
                "
              >
                Switch account
              </p>
            </div>

            <button
              type="button"
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-left
                transition-colors

                hover:bg-accent
              "
            >
              <div
                className="
                  flex
                  size-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-border
                  bg-muted
                  text-muted-foreground
                "
              >
                {role === "freelancer" ? (
                  <BriefcaseBusiness className="size-4" />
                ) : (
                  <UserRound className="size-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="
                    truncate
                    text-sm
                    font-semibold
                    text-foreground
                  "
                >
                  {role === "freelancer"
                    ? "Client account"
                    : "Freelancer account"}
                </p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-muted-foreground
                  "
                >
                  {role === "freelancer" ? "Hire freelancers" : "Find work"}
                </p>
              </div>

              <Check
                className="
                  size-4
                  text-transparent
                "
              />
            </button>

            {/* =================================================
                BOTTOM
                ================================================= */}

            <DropdownMenuSeparator className="my-2" />

            <MenuRow icon={LogOut} label="Log out" onClick={handleLogout} />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
