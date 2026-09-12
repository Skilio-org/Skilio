import { Link, useRouterState } from "@tanstack/react-router"
import {
  CircleHelp,
  Compass,
  LayoutDashboard,
  Settings,
  ShieldCheck,
} from "lucide-react"

import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
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
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"

import { User } from "./User"

const navigation = [
  { icon: LayoutDashboard, title: "Overview", path: "/dashboard" as const },
  { icon: Settings, title: "Account settings", path: "/settings" as const },
]

export function AppSidebar() {
  const { user } = useAuth()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="px-3 pb-3 pt-5 group-data-[collapsible=icon]:px-2">
        <div className="flex h-12 items-center px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Logo
            variant="responsive"
            className="h-8 w-auto group-data-[collapsible=icon]:size-8"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-5 group-data-[collapsible=icon]:px-1.5">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground group-data-[collapsible=icon]:hidden">
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
                    className="h-11 rounded-lg px-3 text-sm font-medium transition-colors data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground"
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
            <SidebarGroupLabel className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground group-data-[collapsible=icon]:hidden">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/admin"}
                    tooltip="User management"
                    className="h-11 rounded-lg px-3 text-sm font-medium data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold"
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

      <SidebarFooter className="gap-2 border-t border-sidebar-border px-2 py-3 group-data-[collapsible=icon]:px-1.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Get help"
              className="h-11 rounded-lg px-3 text-sm font-medium"
            >
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
  )
}

export default AppSidebar
