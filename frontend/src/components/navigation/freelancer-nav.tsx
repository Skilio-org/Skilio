import { Link, useRouterState } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
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

	const queryClient = useQueryClient()
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
					{/* <User user={user}/> */}
					
					{/* Account menu */}
					<DropdownMenu open={open} onOpenChange={setOpen}>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								data-testid="user-menu"
								aria-label={`Open account menu,  workspace`}
								className="account-trigger flex min-h-11 items-center gap-2 rounded-xl p-1.5 text-left transition-colors hover:bg-muted sm:gap-3 sm:pr-3"
							>
								<Avatar className="size-8 rounded-lg">
									{avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} className="size-8 rounded-lg"/>}
									<AvatarFallback className="rounded-lg bg-brand-100 font-semibold text-brand-800 text-xs">
										{getInitials(displayName)}
									</AvatarFallback>
								</Avatar>
								<div className="hidden min-w-0 sm:block">
									<p className="max-w-28 truncate font-semibold text-xs">{user?.full_name || "My account"}</p>
									<p className="mt-0.5 text-muted-foreground text-xs">{role}</p>
								</div>
								<ChevronDown className="size-3.5 text-muted-foreground" />
							</button>
						</DropdownMenuTrigger>
{/* 
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								aria-label="Open account menu"
								className="group flex items-center gap-2 rounded-lg p-1 text-left outline-none transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary"
							>
								<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
									<Avatar className="size-[18px] rounded-lg">
										{avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
										<AvatarFallback className="rounded-lg bg-brand-100 font-semibold text-brand-800 text-xs">
											{getInitials(displayName)}
										</AvatarFallback>
									</Avatar>
								</span>
								

								<span className="hidden min-w-0 flex-col lg:flex">
									<span className="max-w-32 truncate font-label-sm font-medium text-label-sm text-on-surface leading-none">
										{fullName}
									</span>

									<span className="mt-1 font-caption text-caption text-on-surface-variant leading-none">
										Freelancer
									</span>
								</span>

								<ChevronDown className="hidden size-3.5 text-outline transition-transform group-data-[state=open]:rotate-180 lg:block" />
							</button>
						</DropdownMenuTrigger> */}

						<DropdownMenuContent
							align="end"
							sideOffset={8}
							className="w-[296px] max-w-[calc(100vw-24px)] rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-1.5 shadow-xl"
						>
							<div className="flex items-center gap-3 px-3.5 py-3.5">
								<Avatar className="size-8 rounded-lg">
									{avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} className="size-8 rounded-lg"/>}
									<AvatarFallback className="rounded-lg bg-brand-100 font-semibold text-brand-800 text-xs">
										{getInitials(displayName)}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<p className="truncate font-label-md font-medium text-label-md text-on-surface">{fullName}</p>
									{email && (
										<p className="mt-0.5 truncate font-caption text-caption text-on-surface-variant">{email}</p>
									)}
								</div>
							</div>
							<DropdownMenuSeparator className="mx-2 my-0 bg-outline-variant/50" />
							<div className="px-2 pt-3 pb-0">
								<DropdownMenuItem
									role="switch"
									aria-label="Available for work"
									aria-checked={availability.available === true}
									disabled={availability.pending || availability.error}
									onSelect={(event) => {
										event.preventDefault()
										availability.toggle()
									}}
									className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3 py-3 focus:bg-surface-container"
								>
									<span className="min-w-0">
										<span className="block text-[13px] font-medium text-on-surface">Available for work</span>
										<span className="mt-1 block text-[11px] text-on-surface-variant">
											{availability.error
												? "Status unavailable. Try again later."
												: availability.pending
													? "Updating availability…"
													: availability.available
														? "Open to new opportunities"
														: "Not taking new projects"}
										</span>
									</span>
									<span
										aria-hidden="true"
										className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors motion-reduce:transition-none ${availability.available ? "bg-primary" : "bg-outline"}`}
									>
										<span
											className={`size-4 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${availability.available ? "translate-x-[18px]" : "translate-x-0.5"}`}
										/>
									</span>
								</DropdownMenuItem>
							</div>

							{/* Workspace switcher */}
							<div className="p-2">
								<DropdownMenuLabel className="px-2 py-1.5 font-caption font-medium text-[10px] text-outline uppercase tracking-widest">
									Switch workspace
								</DropdownMenuLabel>

								<DropdownMenuItem asChild className="cursor-pointer rounded-lg p-0 focus:bg-surface-container">
									<Link to="/freelancer-dashboard" className="flex min-h-11 w-full items-center gap-3 px-2.5 py-2">
										<span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-container text-primary">
											<UserRound className="size-4" />
										</span>
										<span className="min-w-0 flex-1">
											<span className="block font-label-md font-medium text-label-md text-on-surface">Freelancer</span>
											<span className="mt-0.5 block font-caption text-caption text-on-surface-variant">
												Find work & manage proposals
											</span>
										</span>
										<Check className="size-4 shrink-0 text-primary" />
									</Link>
								</DropdownMenuItem>

								<DropdownMenuItem asChild className="cursor-pointer rounded-lg p-0 focus:bg-surface-container">
									<Link to="/dashboard" className="flex min-h-11 w-full items-center gap-3 px-2.5 py-2">
										<span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-container text-on-surface-variant">
											<BriefcaseBusiness className="size-4" />
										</span>

										<span className="min-w-0 flex-1">
											<span className="block font-label-md font-medium text-label-md text-on-surface">Client</span>

											<span className="mt-0.5 block font-caption text-caption text-on-surface-variant">
												Hire talent & manage projects
											</span>
										</span>
									</Link>
								</DropdownMenuItem>
							</div>

							<DropdownMenuSeparator className="mx-2 my-0 bg-outline-variant/50" />

							<div className="p-2">
								<DropdownMenuItem asChild className="cursor-pointer rounded-lg p-0 focus:bg-surface-container">
									<Link
										to="/freelancer"
										className="flex min-h-9 items-center gap-2.5 px-2.5 font-label-md text-label-md text-on-surface"
									>
										<UserRound className="size-4 text-outline" />
										Freelancer profile
									</Link>
								</DropdownMenuItem>

								<DropdownMenuItem asChild className="cursor-pointer rounded-lg p-0 focus:bg-surface-container">
									<Link
										to="/settings"
										className="flex min-h-9 items-center gap-2.5 px-2.5 font-label-md text-label-md text-on-surface"
									>
										<Settings className="size-4 text-outline" />
										Settings
									</Link>
								</DropdownMenuItem>
							</div>

							<DropdownMenuSeparator className="mx-2 my-0 bg-outline-variant/50" />

							<div className="p-2">
								<DropdownMenuItem
									onSelect={() => logout()}
									className="min-h-9 cursor-pointer rounded px-2.5 font-label-md text-error text-label-md focus:bg-error-container focus:text-error"
								>
									<LogOut className="mr-2.5 size-4" />
									Log out
								</DropdownMenuItem>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>

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
