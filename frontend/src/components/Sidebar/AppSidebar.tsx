import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  Home,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

import { Link, useRouterState } from "@tanstack/react-router";

import { SidebarAppearance } from "@/components/Common/Appearance";
import { Logo } from "@/components/Common/Logo";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import useAuth from "@/hooks/useAuth";

import { User } from "./User";

/* =========================================================
   TYPES
   ========================================================= */

type NavigationItem = {
  title: string;
  path: string;
  icon: React.ElementType;
  nested?: boolean;
};

/* =========================================================
   MAIN NAVIGATION
   ========================================================= */

const mainItems: NavigationItem[] = [
  {
    icon: Search,
    title: "Search",
    path: "/search",
  },
  {
    icon: Home,
    title: "Home",
    path: "/",
  },
  {
    icon: Bell,
    title: "Notifications",
    path: "/notifications",
  },
];

/* =========================================================
   WORK NAVIGATION
   ========================================================= */

const workItems: NavigationItem[] = [
  {
    icon: TrendingUp,
    title: "Opportunities",
    path: "/opportunities",
    nested: true,
  },
  {
    icon: BriefcaseBusiness,
    title: "Contracts",
    path: "/contracts",
    nested: true,
  },
  {
    icon: WalletCards,
    title: "Finances",
    path: "/finances",
    nested: true,
  },
  {
    icon: MessageSquare,
    title: "Messages",
    path: "/messages",
  },
];

/* =========================================================
   APP SIDEBAR
   ========================================================= */

export function AppSidebar() {
  const { user: currentUser } = useAuth();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(path);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="
        border-r
        border-sidebar-border
        bg-sidebar
      "
    >
      {/* =====================================================
          TOP
          ===================================================== */}

      <SidebarHeader
        className="
          px-3
          pb-3
          pt-4

          group-data-[collapsible=icon]:items-center
          group-data-[collapsible=icon]:px-2
        "
      >
        {/* =================================================
            LOGO
            ================================================= */}

        <div
          className="
            flex
            min-h-14
            items-center
            px-2

            group-data-[collapsible=icon]:justify-center
            group-data-[collapsible=icon]:px-0
          "
        >
          <Logo
            variant="responsive"
            className="
              h-10
              w-auto

              group-data-[collapsible=icon]:size-8
            "
          />
        </div>

        {/* =================================================
            USER — UPWORK STYLE
            ================================================= */}

        <div
          className="
            mt-2
            w-full

            group-data-[collapsible=icon]:flex
            group-data-[collapsible=icon]:justify-center
          "
        >
          <User user={currentUser} />
        </div>

        <SidebarSeparator className="mt-3" />
      </SidebarHeader>

      {/* =====================================================
          CONTENT
          ===================================================== */}

      <SidebarContent
        className="
          px-2
          pb-3
          pt-3

          group-data-[collapsible=icon]:px-1.5
        "
      >
        {/* =================================================
            PRIMARY
            ================================================= */}

        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainItems.map((item) => {
                const active = isActive(item.path);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="
                        h-11
                        rounded-lg
                        px-3
                        text-[14px]
                        font-medium
                        text-sidebar-foreground
                        transition-all
                        duration-150

                        hover:bg-sidebar-accent
                        hover:text-sidebar-accent-foreground

                        data-[active=true]:bg-sidebar-accent
                        data-[active=true]:font-semibold
                        data-[active=true]:text-sidebar-accent-foreground
                      "
                    >
                      <Link to={item.path}>
                        <item.icon
                          className="
                            size-[19px]
                            shrink-0
                          "
                        />

                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* =================================================
            WORK
            ================================================= */}

        <SidebarGroup className="mt-7 p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {workItems.map((item) => {
                const active = isActive(item.path);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="
                        h-11
                        rounded-lg
                        px-3
                        text-[14px]
                        font-medium
                        text-sidebar-foreground
                        transition-all
                        duration-150

                        hover:bg-sidebar-accent
                        hover:text-sidebar-accent-foreground

                        data-[active=true]:bg-sidebar-accent
                        data-[active=true]:font-semibold
                        data-[active=true]:text-sidebar-accent-foreground
                      "
                    >
                      <Link to={item.path} className="flex items-center">
                        <item.icon
                          className="
                            size-[19px]
                            shrink-0
                          "
                        />

                        <span className="flex-1">{item.title}</span>

                        {item.nested && (
                          <ChevronRight
                            className="
                              ml-auto
                              size-4
                              text-muted-foreground

                              group-data-[collapsible=icon]:hidden
                            "
                          />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* =================================================
            ADMIN
            ================================================= */}

        {currentUser?.is_superuser && (
          <SidebarGroup className="mt-7 p-0">
            <SidebarSeparator className="mb-4" />

            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {/* Admin */}

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin")}
                    tooltip="Admin"
                    className="
                      h-11
                      rounded-lg
                      px-3
                      text-[14px]
                      font-medium
                      text-sidebar-foreground
                      transition-all

                      hover:bg-sidebar-accent
                      hover:text-sidebar-accent-foreground

                      data-[active=true]:bg-sidebar-accent
                      data-[active=true]:font-semibold
                      data-[active=true]:text-sidebar-accent-foreground
                    "
                  >
                    <Link to="/admin">
                      <ShieldCheck className="size-[19px]" />

                      <span>Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Users */}

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/users")}
                    tooltip="Users"
                    className="
                      h-11
                      rounded-lg
                      px-3
                      text-[14px]
                      font-medium
                      text-sidebar-foreground
                      transition-all

                      hover:bg-sidebar-accent
                      hover:text-sidebar-accent-foreground

                      data-[active=true]:bg-sidebar-accent
                      data-[active=true]:font-semibold
                      data-[active=true]:text-sidebar-accent-foreground
                    "
                  >
                    <Link to="/admin/users">
                      <Users className="size-[19px]" />

                      <span>Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* =====================================================
          BOTTOM
          ===================================================== */}

      <SidebarFooter
        className="
          gap-1
          border-t
          border-sidebar-border
          px-2
          py-3

          group-data-[collapsible=icon]:px-1.5
        "
      >
        <SidebarMenu>
          {/* =================================================
              HELP
              ================================================= */}

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Help"
              className="
                h-11
                rounded-lg
                px-3
                text-[14px]
                font-medium
                text-sidebar-foreground
                transition-colors

                hover:bg-sidebar-accent
                hover:text-sidebar-accent-foreground
              "
            >
              <Link to="/help">
                <CircleHelp className="size-[19px]" />

                <span className="flex-1">Help</span>

                <ChevronRight
                  className="
                    ml-auto
                    size-4
                    text-muted-foreground

                    group-data-[collapsible=icon]:hidden
                  "
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* =================================================
              SETTINGS
              ================================================= */}

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/settings")}
              tooltip="Settings"
              className="
                h-11
                rounded-lg
                px-3
                text-[14px]
                font-medium
                text-sidebar-foreground
                transition-colors

                hover:bg-sidebar-accent
                hover:text-sidebar-accent-foreground

                data-[active=true]:bg-sidebar-accent
                data-[active=true]:font-semibold
                data-[active=true]:text-sidebar-accent-foreground
              "
            >
              <Link to="/settings">
                <Settings className="size-[19px]" />

                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* =================================================
            APPEARANCE
            ================================================= */}

        <SidebarAppearance />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
