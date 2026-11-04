import { Logo } from "@/components/common/logo"
import { useAccountRole } from "@/hooks/useAccountRole"
import { Link, useRouterState } from "@tanstack/react-router"
import { Menu } from "lucide-react"
import { NotificationDropdown } from "@/components/common/notification-dropdown"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import useAuth from "@/hooks/useAuth"
import { User } from "../sidebar/user"
import { useConversations } from "@/hooks/useConversations"

const freelancerMenu = [
	["/freelancer-dashboard", "Overview"],
	["/freelancer-jobs", "Find work"],
	["/freelancer-saved-jobs", "Saved jobs"],
	["/freelancer-proposals", "Proposals"],
	["/connects", "Connections"],
	["/freelancer-messages", "Messages"],
] as const

const clientMenu = [
	["/dashboard", "Overview"],
	["/talent", "Find talent"],
	["/client-jobs", "Jobs"],
	["/saved", "Saved talent"],
	["/connects", "Connections"],
	["/messages", "Messages"],
] as const

export function TopNav() {
	const { user } = useAuth()
	let unreadMessages: number = 0
	const path = useRouterState({
		select: (state) => state.location.pathname,
	})

	const role = useAccountRole()
	const menu = role === "freelancer" ? freelancerMenu : clientMenu
	// Load the conversations to get the unread messages count once the page has been loaded.
	const { data: conversations } = useConversations()
	if (conversations?.data === undefined) {
		unreadMessages = 0
	} else
		unreadMessages = conversations?.data.reduce((total, conversation) => total + (conversation.unread_count ?? 0), 0)
	const unreadLabel = unreadMessages > 99 ? "99+" : String(unreadMessages)
	return (
		<header className="sticky top-0 z-50 w-full bg-surface-container-lowest/95 backdrop-blur-md dark:bg-surface-panel/95">
			<div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-4 px-4 md:px-6">
				{/* Left */}
				<div className="flex h-full min-w-0 items-center gap-7">
					<Logo
						variant="full"
						to={role === "freelancer" ? "/freelancer-dashboard" : "/dashboard"}
						iconClassName="h-8 translate-y-px"
					/>

					<nav
						aria-label={role === "freelancer" ? "Freelancer workspace" : "Client workspace"}
						className="hidden h-full items-center gap-5 md:flex"
					>
						{menu.map(([to, label]) => {
							const active = path === to || (to === "/talent" && path.startsWith("/talent/"))

							return (
								<Link
									key={to}
									to={to}
									aria-current={active ? "page" : undefined}
									className={
										active
											? "flex h-full items-center whitespace-nowrap px-0 font-label-md font-medium text-label-md text-link transition-colors dark:text-on-surface"
											: "flex h-full items-center whitespace-nowrap px-0 font-label-md font-medium text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
									}
								>
									<span className="flex items-center gap-2">
										{label}
										{to.includes("messages") && unreadMessages > 0 && (
											<span
												aria-label={`${unreadMessages} unread messages`}
												className="min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center font-caption text-[10px] font-bold text-on-primary leading-none"
											>
												{unreadLabel}
											</span>
										)}
									</span>
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
					<ThemeToggle />

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
								<Menu className="size-4.5" />
							</button>
						</DropdownMenuTrigger>

						<DropdownMenuContent
							align="end"
							className="w-56 rounded-lg border-outline-variant bg-surface-container-lowest p-1"
						>
							{menu.map(([to, label]) => (
								<DropdownMenuItem key={to} asChild>
									<Link to={to} className="flex min-h-9 items-center justify-between gap-3 font-label-md text-label-md">
										<span>{label}</span>
										{to.includes("messages") && unreadMessages > 0 && (
											<span
												className="min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center font-caption text-[10px] font-bold text-on-primary leading-none"
											>
												{unreadLabel}
											</span>
										)}
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
