import { useAccountRole } from "@/hooks/useAccountRole"
import { Link, useRouterState } from "@tanstack/react-router"
import { Bell, Boxes, Menu, Moon, Sun } from "lucide-react"
import { NotificationDropdown } from "@/components/common/notification-dropdown"
import { useTheme } from "@/components/theme-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import useAuth from "@/hooks/useAuth"
import { User } from "../sidebar/user"

const freelancerMenu = [
	["/freelancer-dashboard", "Overview"],
	["/freelancer-jobs", "Find Work"],
	["/freelancer-saved-jobs", "Saved Jobs"],
	["/freelancer-proposals", "Proposals"],
	["/freelancer-messages", "Messages"],
] as const

const clientMenu = [
	["/dashboard", "Overview"],
	["/talent", "Find talent"],
	["/client-jobs", "Jobs"],
	["/saved", "Proposals"],
	["/messages", "Messages"],
] as const

export function TopNav() {
	const { user } = useAuth()
	const { resolvedTheme, setTheme } = useTheme()
	const isDark = resolvedTheme === "dark"

	const path = useRouterState({
		select: (state) => state.location.pathname,
	})

	const role = useAccountRole()
	const menu = role === "freelancer" ? freelancerMenu : clientMenu
	return (
		<header className="fixed top-0 right-0 left-0 z-50 w-full border-outline-variant border-b bg-surface-container-lowest/95 backdrop-blur-md dark:bg-surface-panel/95">
			<div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-4 px-4 md:px-6">
				{/* Left */}
				<div className="flex h-full min-w-0 items-center gap-7">
					<Link to="/freelancer-dashboard" className="group flex shrink-0 items-center gap-2">
						<span className="flex size-6 items-center justify-center rounded-lg bg-primary text-surface-bright dark:border dark:border-border-dark dark:bg-surface-container dark:text-primary">
							<Boxes className="size-4" strokeWidth={2} />
						</span>

						<span className="font-headline-sm font-semibold text-headline-sm text-on-surface tracking-tight">
							Freelancer
						</span>
					</Link>

					<nav aria-label="Freelancer workspace" className="hidden h-full items-center gap-5 md:flex">
						{menu.map(([to, label]) => {
							const active = path === to

							return (
								<Link
									key={to}
									to={to}
									aria-current={active ? "page" : undefined}
									className={
										active
											? "flex h-full items-center whitespace-nowrap border-primary border-b-2 px-0 font-label-md font-medium text-label-md text-primary transition-colors dark:text-on-surface"
											: "flex h-full items-center whitespace-nowrap border-transparent border-b-2 px-0 font-label-md font-medium text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
									}
								>
									{label}
								</Link>
							)
						})}
					</nav>
				</div>

				{/* Right */}
				<div className="flex shrink-0 items-center gap-3">
					{/* Search */}
					{/* <label className="relative hidden items-center sm:flex">
						<Search className="pointer-events-none absolute left-2 size-[18px] text-outline" />

						<span className="sr-only">Search jobs and contracts</span>

						<input
							type="search"
							placeholder="Search jobs, contracts..."
							className="h-8 w-52 rounded-lg border border-outline-variant bg-surface-container-lowest pr-10 pl-8 font-body-sm text-body-sm text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary-container focus:ring-1 focus:ring-primary-container lg:w-64 [&::-webkit-search-cancel-button]:hidden"
						/>

						<kbd className="pointer-events-none absolute right-1 rounded-lg bg-surface-container px-1.5 py-0.5 font-caption text-caption text-outline">
							⌘K
						</kbd>
					</label> */}

					{/* Notifications */}
					<NotificationDropdown />

					{/* dark/light mode toggle*/}
					<button
						type="button"
						aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
						onClick={() => setTheme(isDark ? "light" : "dark")}
						className="relative flex size-8 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
					>
						<span key={resolvedTheme} className="theme-toggle-icon" aria-hidden="true">
							{isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
						</span>
					</button>

					<div className="hidden h-4 w-px bg-outline-variant sm:block" />

					<User user={user} />

					{/* Mobile navigation */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								aria-label="Open workspace navigation"
								className="flex size-8 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface md:hidden"
							>
								<Menu className="size-[18px]" />
							</button>
						</DropdownMenuTrigger>

						<DropdownMenuContent
							align="end"
							className="w-56 rounded-lg border-outline-variant bg-surface-container-lowest p-1"
						>
							{menu.map(([to, label]) => (
								<DropdownMenuItem key={to} asChild>
									<Link to={to} className="min-h-9 font-label-md text-label-md">
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
