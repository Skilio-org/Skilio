import { Link, useRouterState } from "@tanstack/react-router"
import { Menu } from "lucide-react"
import { Logo } from "@/components/common/logo"
import { User } from "@/components/sidebar/user"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useAuth from "@/hooks/useAuth"

const links = [
  ["/freelancer-dashboard", "Overview"],
  ["/freelancer-jobs", "Find work"],
  ["/freelancer-saved-jobs", "Saved jobs"],
  ["/freelancer-proposals", "Proposals"],
  ["/freelancer-messages", "Messages"],
] as const
export function FreelancerNav() {
  const { user } = useAuth()
  const path = useRouterState({ select: (state) => state.location.pathname })
  return (
    <header className="border-border bg-card/95 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo to="/freelancer-dashboard" className="h-8" />
        <nav
          aria-label="Freelancer workspace"
          className="ml-4 hidden h-full shrink-0 items-center gap-1 lg:flex"
        >
          {links.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className={`flex h-full items-center border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors ${path === to ? "border-brand-600 text-foreground" : "text-muted-foreground hover:text-foreground border-transparent"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 xl:ml-0">
          <User user={user} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open workspace navigation"
                className="text-muted-foreground hover:bg-accent hover:text-foreground grid size-11 place-items-center rounded-full lg:hidden"
              >
                <Menu className="size-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {links.map(([to, label]) => (
                <DropdownMenuItem key={to} asChild>
                  <Link to={to} className="min-h-11">
                    {label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
