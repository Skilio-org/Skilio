import { Link, useRouterState } from "@tanstack/react-router"
import {
	Bell,
	Bookmark,
	BriefcaseBusiness,
	LayoutDashboard,
	type LucideIcon,
	Menu,
	MessageSquare,
	Settings,
	UsersRound,
} from "lucide-react"

import { Logo } from "@/components/common/logo"
import { User } from "@/components/sidebar/user"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAccountRole } from "@/hooks/useAccountRole"
import useAuth from "@/hooks/useAuth"
import { FreelancerNav } from "./freelancer-nav"

export function TopNav() {
	const { user } = useAuth()
	const role = useAccountRole()
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	})

	if (role === "freelancer") return <FreelancerNav />

	return (
		<header className="sticky top-0 z-50 border-border border-b bg-card/95 backdrop-blur-md">
			<div className="mx-auto flex h-18 max-w-330 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
				<Logo to="/dashboard" className="h-8" />

				<nav aria-label="Workspace navigation" className="ml-4 hidden h-full shrink-0 items-center gap-1 lg:flex">
					<Link
						to="/dashboard"
						className={`flex h-full items-center whitespace-nowrap border-b-2 px-3 font-medium text-sm transition-colors ${
							pathname === "/dashboard"
								? "border-brand-600 text-foreground"
								: "border-transparent text-muted-foreground hover:text-foreground"
						}`}
					>
						Overview
					</Link>
					<Link
						to="/talent"
						search={{ q: undefined }}
						className={`flex h-full items-center whitespace-nowrap border-b-2 px-3 font-medium text-sm transition-colors ${pathname.startsWith("/talent") ? "border-brand-600 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
					>
						Find talent
					</Link>
					<Link
						to="/client-jobs"
						className={`flex h-full items-center whitespace-nowrap border-b-2 px-3 font-medium text-sm ${pathname === "/client-jobs" ? "border-brand-600 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
					>
						Jobs
					</Link>
					<Link
						to="/saved"
						className={`flex h-full items-center whitespace-nowrap border-b-2 px-3 font-medium text-sm transition-colors ${pathname === "/saved" ? "border-brand-600 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
					>
						Saved
					</Link>
					<Link
						to="/messages"
						search={{}}
						className={`flex h-full items-center whitespace-nowrap border-b-2 px-3 font-medium text-sm transition-colors ${pathname === "/messages" ? "border-brand-600 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
					>
						Messages
					</Link>
				</nav>
				<div className="ml-auto flex items-center gap-1 xl:ml-0">
					<Link
						to="/notifications"
						aria-label="Notifications"
						className="relative hidden size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
					>
						<Bell className="size-5" />
					</Link>
					<User user={user} />

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								aria-label="Open navigation"
								className="grid size-11 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
							>
								<Menu className="size-5" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" sideOffset={10} className="w-[min(19rem,calc(100vw-2rem))] p-2.5">
							<DropdownMenuLabel className="px-2.5 pt-1 pb-2">
								<span className="block font-display font-semibold text-base text-foreground">Client workspace</span>
								<span className="mt-0.5 block font-normal text-muted-foreground text-xs">
									Navigate your hiring activity
								</span>
							</DropdownMenuLabel>
							<DropdownMenuSeparator className="mb-2" />
							<MobileNavLink
								to="/dashboard"
								label="Overview"
								icon={LayoutDashboard}
								active={pathname === "/dashboard"}
							/>
							<MobileNavLink
								to="/talent"
								label="Find talent"
								icon={UsersRound}
								active={pathname.startsWith("/talent")}
							/>
							<MobileNavLink to="/saved" label="Saved talent" icon={Bookmark} active={pathname === "/saved"} />
							<MobileNavLink
								to="/client-jobs"
								label="Your jobs"
								icon={BriefcaseBusiness}
								active={pathname === "/client-jobs"}
							/>
							<MobileNavLink to="/messages" label="Messages" icon={MessageSquare} active={pathname === "/messages"} />
							<MobileNavLink
								to="/notifications"
								label="Notifications"
								icon={Bell}
								active={pathname === "/notifications"}
							/>
							<MobileNavLink to="/settings" label="Settings" icon={Settings} active={pathname === "/settings"} />
							<DropdownMenuSeparator className="my-2" />
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	)
}

function MobileNavLink({
	to,
	label,
	icon: Icon,
	active,
}: {
	to: "/dashboard" | "/talent" | "/saved" | "/messages" | "/notifications" | "/settings" | "/client-jobs"
	label: string
	icon: LucideIcon
	active: boolean
}) {
	return (
		<DropdownMenuItem
			asChild
			className={`mb-0.5 min-h-12 cursor-pointer rounded-xl px-2.5 ${active ? "bg-brand-50 text-brand-950" : ""}`}
		>
			<Link to={to}>
				<span
					className={`grid size-8 place-items-center rounded-lg ${
						active ? "bg-brand-600 text-white" : "bg-muted text-muted-foreground"
					}`}
				>
					<Icon className="size-4 text-current" />
				</span>
				<span className="font-semibold">{label}</span>
			</Link>
		</DropdownMenuItem>
	)
}
