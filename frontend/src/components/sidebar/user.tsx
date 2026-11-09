import { useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { BriefcaseBusiness, Check, ChevronDown, LogOut, Settings, UserRound } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { type UserMe, UsersService } from "@/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAccountAvatarUrl } from "@/hooks/useAccountAvatar"
import { setAccountRole, useAccountRole } from "@/hooks/useAccountRole"
import useAuth from "@/hooks/useAuth"
import { useFreelancerAvailability } from "@/hooks/useFreelancerAvailability"
import { getInitials } from "@/lib/format"

type AccountRole = "freelancer" | "client"

export function User({ user }: { user?: UserMe | null }) {
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	const { logout } = useAuth()

	const availability = useFreelancerAvailability()

	const accountRole = useAccountRole()
	const freelancer = accountRole === "freelancer"

	const [open, setOpen] = useState(false)
	const [switching, setSwitching] = useState(false)

	const role = freelancer ? "Freelancer" : "Client"

	const displayName = user?.full_name?.trim() || user?.email || "Your account"

	const fullName = user?.full_name?.trim() || "My account"
	const email = user?.email || ""
	const avatarUrl = useAccountAvatarUrl(user?.id)

	const switchWorkspace = async (targetRole: AccountRole) => {
		if (switching) return

		const currentRole: AccountRole = freelancer ? "freelancer" : "client"

		const destination = targetRole === "freelancer" ? "/freelancer-dashboard" : "/dashboard"

		/*
		 * Clicking the workspace we're already in should just
		 * navigate there instead of calling the API again.
		 */
		if (targetRole === currentRole) {
			setOpen(false)

			await navigate({
				to: destination,
			})

			return
		}

		setSwitching(true)

		try {
			if (user) {
				const response = await UsersService.switchRole({
					body: {
						role: targetRole,
					},
				})
				queryClient.setQueryData(["currentUser"], response.data)
				setAccountRole(user.email, targetRole)
			}

			setOpen(false)

			await navigate({
				to: destination,
			})

			toast.success(`Switched to ${targetRole === "freelancer" ? "Freelancer" : "Client"} workspace`)
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
					className="account-trigger group flex min-h-11 items-center gap-2 rounded-xl p-1.5 text-left outline-none transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary sm:gap-3 sm:pr-3"
				>
					<Avatar className="size-8 rounded-lg">
						{avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} className="rounded-lg" />}

						<AvatarFallback className="rounded-lg bg-brand-100 font-semibold text-brand-800 text-xs">
							{getInitials(displayName)}
						</AvatarFallback>
					</Avatar>

					<div className="hidden min-w-0 sm:block">
						<p className="max-w-28 truncate font-label-sm font-medium text-label-sm text-on-surface">{fullName}</p>

						<p className="mt-0.5 font-caption text-caption text-on-surface-variant">{role}</p>
					</div>

					<ChevronDown className="size-3.5 text-outline transition-transform group-data-[state=open]:rotate-180" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				sideOffset={8}
				className="w-[296px] max-w-[calc(100vw-24px)] rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-1.5 shadow-xl"
			>
				{/* Account */}
				<div className="flex items-center gap-3 px-3.5 py-3.5">
					<Avatar className="size-9 rounded-lg">
						{avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} className="rounded-lg" />}

						<AvatarFallback className="rounded-lg bg-brand-100 font-semibold text-brand-800 text-xs">
							{getInitials(displayName)}
						</AvatarFallback>
					</Avatar>

					<div className="min-w-0 flex-1">
						<p className="truncate font-label-md font-medium text-label-md text-on-surface">{fullName}</p>

						{email && <p className="mt-0.5 truncate font-caption text-caption text-on-surface-variant">{email}</p>}
					</div>
				</div>

				<DropdownMenuSeparator className="mx-2 my-0 bg-outline-variant/50" />

				{/* Freelancer availability */}
				{freelancer && (
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
								className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors motion-reduce:transition-none ${
									availability.available ? "bg-primary" : "bg-outline"
								}`}
							>
								<span
									className={`size-4 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${
										availability.available ? "translate-x-[18px]" : "translate-x-0.5"
									}`}
								/>
							</span>
						</DropdownMenuItem>
					</div>
				)}

				{/* Workspace switcher */}
				<div className="p-2">
					<DropdownMenuLabel className="px-2 py-1.5 font-caption font-medium text-[10px] text-outline uppercase tracking-widest">
						Switch workspace
					</DropdownMenuLabel>

					<DropdownMenuItem
						disabled={switching}
						onSelect={(event) => {
							event.preventDefault()
							void switchWorkspace("freelancer")
						}}
						className="min-h-11 cursor-pointer rounded-lg p-0 focus:bg-surface-container"
					>
						<div className="flex w-full items-center gap-3 px-2.5 py-2">
							<span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-container text-on-surface">
								<UserRound className="size-4 text-current" />
							</span>

							<span className="min-w-0 flex-1">
								<span className="block font-label-md font-medium text-label-md text-on-surface">Freelancer</span>

								<span className="mt-0.5 block font-caption text-caption text-on-surface-variant">
									Find work & manage proposals
								</span>
							</span>

							{freelancer && <Check className="size-4 shrink-0 text-link" />}
						</div>
					</DropdownMenuItem>

					<DropdownMenuItem
						disabled={switching}
						onSelect={(event) => {
							event.preventDefault()
							void switchWorkspace("client")
						}}
						className="min-h-11 cursor-pointer rounded-lg p-0 focus:bg-surface-container"
					>
						<div className="flex w-full items-center gap-3 px-2.5 py-2">
							<span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-container text-on-surface">
								<BriefcaseBusiness className="size-4 text-current" />
							</span>

							<span className="min-w-0 flex-1">
								<span className="block font-label-md font-medium text-label-md text-on-surface">Client</span>

								<span className="mt-0.5 block font-caption text-caption text-on-surface-variant">
									Hire talent & manage projects
								</span>
							</span>

							{!freelancer && <Check className="size-4 shrink-0 text-link" />}
						</div>
					</DropdownMenuItem>
				</div>

				<DropdownMenuSeparator className="mx-2 my-0 bg-outline-variant/50" />

				{/* Account links */}
				<div className="p-2">
					<DropdownMenuItem asChild className="cursor-pointer rounded-lg p-0 focus:bg-surface-container">
						<Link
							to={freelancer ? "/freelancer" : "/client-profile"}
							className="flex min-h-9 items-center gap-2.5 px-2.5 font-label-md text-label-md text-on-surface"
						>
							<UserRound className="size-4 text-current" />

							{freelancer ? "Freelancer profile" : "Client profile"}
						</Link>
					</DropdownMenuItem>

					<DropdownMenuItem asChild className="cursor-pointer rounded-lg p-0 focus:bg-surface-container">
						<Link
							to={freelancer ? "/freelancer-settings" : "/settings"}
							className="flex min-h-9 items-center gap-2.5 px-2.5 font-label-md text-label-md text-on-surface"
						>
							<Settings className="size-4  text-current" />
							Settings
						</Link>
					</DropdownMenuItem>
				</div>

				<DropdownMenuSeparator className="mx-2 my-0 bg-outline-variant/50" />

				{/* Logout */}
				<div className="p-2">
					<DropdownMenuItem
						onSelect={() => logout()}
						className="min-h-9 cursor-pointer rounded-lg px-2.5 font-label-md text-error text-label-md focus:bg-error-container focus:text-error"
					>
						<LogOut className="mr-2.5 size-4 text-current" />
						Log out
					</DropdownMenuItem>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
