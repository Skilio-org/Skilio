import { useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate, useRouterState } from "@tanstack/react-router"
import {
	ArrowLeftRight,
	BriefcaseBusiness,
	Check,
	ChevronDown,
	LayoutDashboard,
	LogOut,
	Settings,
	UserRound,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { type UserPublic, UsersService } from "@/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAccountAvatarUrl } from "@/hooks/useAccountAvatar"
import { setAccountRole, useAccountRole } from "@/hooks/useAccountRole"
import useAuth from "@/hooks/useAuth"
import { getInitials } from "@/utils"

export function User({ user }: { user?: UserPublic | null }) {
	const queryClient = useQueryClient()
	const { logout } = useAuth()
	const navigate = useNavigate()
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	})
	const freelancer = useAccountRole() === "freelancer"
	const [switching, setSwitching] = useState(false)
	const [open, setOpen] = useState(false)
	const displayName = user?.full_name || user?.email || "Your account"
	const avatarUrl = useAccountAvatarUrl(user?.id)
	const role = freelancer ? "Freelancer" : "Client"
	const nextRole = freelancer ? "client" : "freelancer"

	const switchWorkspace = async () => {
		if (switching) return
		setSwitching(true)
		try {
			if (user) {
				if (import.meta.env.MODE !== "visual-test") {
					const response = await UsersService.switchRole({
						body: { role: nextRole },
					})
					queryClient.setQueryData(["currentUser"], response.data)
				}
				setAccountRole(user.email, nextRole)
			}
			setOpen(false)
			await navigate({
				to: freelancer ? "/dashboard" : "/freelancer-dashboard",
			})
			toast.success(`Switched to ${nextRole} workspace`)
		} catch {
			toast.error("We couldn't switch workspaces. Please try again.")
		} finally {
			setSwitching(false)
		}
	}

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					data-testid="user-menu"
					aria-label={`Open account menu, ${role} workspace`}
					className="account-trigger flex min-h-11 items-center gap-2 rounded-xl p-1.5 text-left transition-colors hover:bg-muted sm:gap-3 sm:pr-3"
				>
					<Avatar className="size-8 rounded-lg">
						{avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
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
			<DropdownMenuContent
				align="end"
				sideOffset={12}
				className="w-[min(20rem,calc(100vw-2rem))] rounded-2xl p-2 shadow-floating"
			>
				<div className="px-3 py-3">
					<p className="truncate font-semibold text-sm">{displayName}</p>
					<p className="mt-1 truncate text-muted-foreground text-xs">
						{user?.email || "Manage your account and workspace"}
					</p>
				</div>
				<div className="mx-1 mb-2 rounded-xl border border-border bg-muted/50 p-3">
					<div className="flex items-center gap-2 text-muted-foreground text-xs">
						<BriefcaseBusiness className="size-3.5" />
						<span>Current workspace</span>
						<Check className="ml-auto size-3.5 text-primary" />
					</div>
					<p className="mt-2 font-semibold text-sm">
						{role}
						<span className="ml-2 font-normal text-muted-foreground">
							{freelancer ? "Find work & grow" : "Hire & collaborate"}
						</span>
					</p>
					<DropdownMenuItem
						disabled={switching}
						onSelect={(event) => {
							event.preventDefault()
							void switchWorkspace()
						}}
						className="mt-3 min-h-11 cursor-pointer justify-between rounded-lg border border-brand-200 bg-brand-50 px-3 text-brand-800 focus:bg-brand-100 focus:text-brand-950"
					>
						<span className="font-medium text-sm">{switching ? "Switching…" : `Switch to ${nextRole}`}</span>
						<ArrowLeftRight className="size-4 text-current" />
					</DropdownMenuItem>
				</div>
				<AccountMenuLink
					to={freelancer ? "/freelancer-dashboard" : "/dashboard"}
					title="Overview"
					icon={LayoutDashboard}
					active={pathname === (freelancer ? "/freelancer-dashboard" : "/dashboard")}
				/>
				<AccountMenuLink
					to={freelancer ? "/freelancer" : "/client-profile"}
					title={freelancer ? "Freelancer profile" : "Client profile"}
					icon={UserRound}
					active={pathname === (freelancer ? "/freelancer" : "/client-profile")}
				/>
				<AccountMenuLink
					to={freelancer ? "/freelancer-settings" : "/settings"}
					title="Account settings"
					icon={Settings}
					active={pathname === (freelancer ? "/freelancer-settings" : "/settings")}
				/>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onSelect={logout}
					className="min-h-11 cursor-pointer rounded-lg px-3 text-destructive focus:bg-destructive/10 focus:text-destructive"
				>
					<LogOut className="size-4 text-current" />
					<span>Log out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}


// <DropdownMenu>
// 	<DropdownMenuTrigger asChild>
// 		<button
// 			type="button"
// 			aria-label="Open account menu"
// 			className="group flex items-center gap-2 rounded-lg p-1 text-left outline-none transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary"
// 		>
// 			<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
// 				<UserRound className="size-[18px]" strokeWidth={2} />
// 			</span>

// 			<span className="hidden min-w-0 flex-col lg:flex">
// 				<span className="max-w-32 truncate font-label-sm font-medium text-label-sm text-on-surface leading-none">
// 					{fullName}
// 				</span>

// 				<span className="mt-1 font-caption text-caption text-on-surface-variant leading-none">
// 					Freelancer
// 				</span>
// 			</span>

// 			<ChevronDown className="hidden size-3.5 text-outline transition-transform group-data-[state=open]:rotate-180 lg:block" />
// 		</button>
// 	</DropdownMenuTrigger>

// 	<DropdownMenuContent
// 		align="end"
// 		sideOffset={8}
// 		className="w-[296px] max-w-[calc(100vw-24px)] rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-1.5 shadow-xl"
// 	>
// 		{/* Account header */}
// 		<div className="flex items-center gap-3 px-3.5 py-3.5">
// 			<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
// 				<UserRound className="size-[19px]" />
// 			</div>

// 			<div className="min-w-0 flex-1">
// 				<p className="truncate font-label-md font-medium text-label-md text-on-surface">{fullName}</p>

// 				{email && (
// 					<p className="mt-0.5 truncate font-caption text-caption text-on-surface-variant">{email}</p>
// 				)}
// 			</div>
// 		</div>

// 		<DropdownMenuSeparator className="mx-2 my-0 bg-outline-variant/50" />

// 		<div className="px-2 py-3">
// 			<DropdownMenuItem
// 				role="switch"
// 				aria-label="Available for work"
// 				aria-checked={availability.available === true}
// 				disabled={availability.pending || availability.error}
// 				onSelect={(event) => {
// 					event.preventDefault()
// 					availability.toggle()
// 				}}
// 				className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3 py-3 focus:bg-surface-container"
// 			>
// 				<span className="min-w-0">
// 					<span className="block text-[13px] font-medium text-on-surface">Available for work</span>
// 					<span className="mt-1 block text-[11px] text-on-surface-variant">
// 						{availability.error
// 							? "Status unavailable. Try again later."
// 							: availability.pending
// 								? "Updating availability…"
// 								: availability.available
// 									? "Open to new opportunities"
// 									: "Not taking new projects"}
// 					</span>
// 				</span>
// 				<span
// 					aria-hidden="true"
// 					className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors motion-reduce:transition-none ${availability.available ? "bg-primary" : "bg-outline"}`}
// 				>
// 					<span
// 						className={`size-4 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${availability.available ? "translate-x-[18px]" : "translate-x-0.5"}`}
// 					/>
// 				</span>
// 			</DropdownMenuItem>
// 		</div>

// 		{/* Workspace switcher */}
// 		<div className="p-2">
// 			<DropdownMenuLabel className="px-2 py-1.5 font-caption font-medium text-[10px] text-outline uppercase tracking-widest">
// 				Switch workspace
// 			</DropdownMenuLabel>

// 			<DropdownMenuItem asChild className="cursor-pointer rounded-lg p-0 focus:bg-surface-container">
// 				<Link to="/freelancer-dashboard" className="flex min-h-11 w-full items-center gap-3 px-2.5 py-2">
// 					<span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-container text-primary">
// 						<UserRound className="size-4" />
// 					</span>

// 					<span className="min-w-0 flex-1">
// 						<span className="block font-label-md font-medium text-label-md text-on-surface">Freelancer</span>

// 						<span className="mt-0.5 block font-caption text-caption text-on-surface-variant">
// 							Find work & manage proposals
// 						</span>
// 					</span>

// 					<Check className="size-4 shrink-0 text-primary" />
// 				</Link>
// 			</DropdownMenuItem>

// 			<DropdownMenuItem asChild className="cursor-pointer rounded-lg p-0 focus:bg-surface-container">
// 				<Link to="/dashboard" className="flex min-h-11 w-full items-center gap-3 px-2.5 py-2">
// 					<span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-container text-on-surface-variant">
// 						<BriefcaseBusiness className="size-4" />
// 					</span>

// 					<span className="min-w-0 flex-1">
// 						<span className="block font-label-md font-medium text-label-md text-on-surface">Client</span>

// 						<span className="mt-0.5 block font-caption text-caption text-on-surface-variant">
// 							Hire talent & manage projects
// 						</span>
// 					</span>
// 				</Link>
// 			</DropdownMenuItem>
// 		</div>

// 		<DropdownMenuSeparator className="mx-2 my-0 bg-outline-variant/50" />

// 		<div className="p-2">
// 			<DropdownMenuItem asChild className="cursor-pointer rounded-lg p-0 focus:bg-surface-container">
// 				<Link
// 					to="/freelancer"
// 					className="flex min-h-9 items-center gap-2.5 px-2.5 font-label-md text-label-md text-on-surface"
// 				>
// 					<UserRound className="size-4 text-outline" />
// 					Freelancer profile
// 				</Link>
// 			</DropdownMenuItem>

// 			<DropdownMenuItem asChild className="cursor-pointer rounded-lg p-0 focus:bg-surface-container">
// 				<Link
// 					to="/settings"
// 					className="flex min-h-9 items-center gap-2.5 px-2.5 font-label-md text-label-md text-on-surface"
// 				>
// 					<Settings className="size-4 text-outline" />
// 					Settings
// 				</Link>
// 			</DropdownMenuItem>
// 		</div>

// 		<DropdownMenuSeparator className="mx-2 my-0 bg-outline-variant/50" />

// 		<div className="p-2">
// 			<DropdownMenuItem
// 				onSelect={() => logout()}
// 				className="min-h-9 cursor-pointer rounded px-2.5 font-label-md text-error text-label-md focus:bg-error-container focus:text-error"
// 			>
// 				<LogOut className="mr-2.5 size-4" />
// 				Log out
// 			</DropdownMenuItem>
// 		</div>
// 	</DropdownMenuContent>
// </DropdownMenu>


function AccountMenuLink({
	to,
	title,
	icon: Icon,
	active,
}: {
	to: "/dashboard" | "/settings" | "/client-profile" | "/freelancer" | "/freelancer-dashboard" | "/freelancer-settings"
	title: string
	icon: typeof LayoutDashboard
	active: boolean
}) {
	return (
		<DropdownMenuItem asChild className={`mt-1 min-h-11 cursor-pointer rounded-lg px-3 ${active ? "bg-muted" : ""}`}>
			<Link to={to}>
				<Icon className="size-4 text-current" />
				<span>{title}</span>
			</Link>
		</DropdownMenuItem>
	)
}
