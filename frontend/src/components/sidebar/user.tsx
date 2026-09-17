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
		if (!user && import.meta.env.MODE !== "visual-test") return
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
