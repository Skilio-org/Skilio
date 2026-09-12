import { Link, useRouterState } from "@tanstack/react-router";
import { CircleHelp, Compass, LayoutDashboard, Settings, ShieldCheck } from "lucide-react";

import { SidebarAppearance } from "@/components/Common/Appearance";
import { Logo } from "@/components/Common/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/useAuth";

import { User } from "./User";

const navigation = [
  { icon: LayoutDashboard, title: "Overview", path: "/dashboard" as const },
  { icon: Settings, title: "Account settings", path: "/settings" as const },
];

export function AppSidebar() {
  const { user } = useAuth();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border bg-sidebar border-r">
      <SidebarHeader className="px-3 pt-5 pb-3 group-data-[collapsible=icon]:px-2">
        <div className="flex h-12 items-center px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Logo variant="responsive" className="h-8 w-auto group-data-[collapsible=icon]:size-8" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-5 group-data-[collapsible=icon]:px-1.5">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-muted-foreground mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] uppercase group-data-[collapsible=icon]:hidden">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.path}
                    tooltip={item.title}
                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground h-11 rounded-lg px-3 text-sm font-medium transition-colors data-[active=true]:font-semibold"
                  >
                    <Link to={item.path}>
                      <item.icon className="size-[18px]" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Discover talent"
                  className="h-11 rounded-lg px-3 text-sm font-medium transition-colors"
                >
                  <a href="/#talent">
                    <Compass className="size-[18px]" />
                    <span>Discover talent</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.is_superuser && (
          <SidebarGroup className="mt-7 p-0">
            <SidebarGroupLabel className="text-muted-foreground mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] uppercase group-data-[collapsible=icon]:hidden">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/admin"}
                    tooltip="User management"
                    className="data-[active=true]:bg-sidebar-accent h-11 rounded-lg px-3 text-sm font-medium data-[active=true]:font-semibold"
                  >
                    <Link to="/admin">
                      <ShieldCheck className="size-[18px]" />
                      <span>User management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border gap-2 border-t px-2 py-3 group-data-[collapsible=icon]:px-1.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Get help" className="h-11 rounded-lg px-3 text-sm font-medium">
              <a href="mailto:support@freelancer.com">
                <CircleHelp className="size-[18px]" />
                <span>Get help</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarAppearance />
        <div className="mt-1 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <User user={user} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
