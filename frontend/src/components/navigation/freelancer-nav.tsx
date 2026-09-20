import { Link, useNavigate, useRouterState } from "@tanstack/react-router"
import {
	Bell,
	Boxes,
	BriefcaseBusiness,
	Check,
	ChevronDown,
	LogOut,
	Menu,
	Moon,
	Search,
	Settings,
	Sun,
	UserRound,
} from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useAuth from "@/hooks/useAuth"
import { useFreelancerAvailability } from "@/hooks/useFreelancerAvailability"
import { User } from "../sidebar/user"
import { useAccountAvatarUrl } from "@/hooks/useAccountAvatar"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { getInitials } from "@/utils"
import { setAccountRole, useAccountRole } from "@/hooks/useAccountRole"
import { UsersService } from "@/client"
import { useState } from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

const links = [
	["/freelancer-dashboard", "Overview"],
	["/freelancer-jobs", "Find Work"],
	["/freelancer-saved-jobs", "Saved Jobs"],
	["/freelancer-proposals", "Proposals"],
	["/freelancer-messages", "Messages"],
] as const

export function FreelancerNav() {
	const { user, logout } = useAuth()
	const availability = useFreelancerAvailability()
	const { resolvedTheme, setTheme } = useTheme()
	const isDark = resolvedTheme === "dark"

	const path = useRouterState({
		select: (state) => state.location.pathname,
	})

	const fullName = user?.full_name?.trim() || "User"
	const email = user?.email || ""

	const avatarUrl = useAccountAvatarUrl(user?.id)

	const displayName = user?.full_name || user?.email || "Your account"

	const navigate = useNavigate()
	const freelancer = useAccountRole() === "freelancer"
	const role = freelancer ? "Freelancer" : "Client"
	const [open, setOpen] = useState(false)
	const [switching, setSwitching] = useState(false)
	const switchWorkspace = async () => {
		if (switching) return
		setSwitching(true)
		try {
			if (user) {
				if (import.meta.env.MODE !== "visual-test") {
					const response = await UsersService.switchRole({
						body: { role: nextRole },
					})
					// QueryClient.setQueryData(["currentUser"], response.data)
				}
				// setAccountRole(user.email, nextRole)
			}
			setOpen(false)
			// await navigate({
			// 	to: freelancer ? "/dashboard" : "/freelancer-dashboard",
			// })
			toast.success(`Switched to workspace`)
		} catch {
			toast.error("We couldn't switch workspaces. Please try again.")
		} finally {
			setSwitching(false)
		}
	}
	const nextRole = freelancer ? "client" : "freelancer"
	const queryClient = useQueryClient()
	const switchtoRole = async (role: "Freelancer" | "Client") => {
		if (switching) return
		setSwitching(true)
		try {
			if (user) {
				if (import.meta.env.MODE !== "visual-test") {
					const response = await UsersService.switchRole({
						body: { role: nextRole},
					})
					queryClient.setQueryData(["currentUser"], response.data)
				}
				setAccountRole(user.email, nextRole)
			}
			setOpen(false)
			await navigate({
				to: freelancer ? "/dashboard" : "/freelancer-dashboard",
			})
			toast.success(`Switched to workspace`)
		} catch {
			toast.error("We couldn't switch workspaces. Please try again.")
		} finally {
			setSwitching(false)
		}
	}

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
						{links.map(([to, label]) => {
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
					<label className="relative hidden items-center sm:flex">
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
					</label>

					{/* Notifications */}
					<button
						type="button"
						aria-label="Notifications"
						className="relative flex size-8 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
					>
						<Bell className="size-[18px]" />

						<span aria-hidden="true" className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-error" />
					</button>

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
					<User user={user}/>
					
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
							{links.map(([to, label]) => (
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
