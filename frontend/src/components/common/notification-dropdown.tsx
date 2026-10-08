import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import {
	Bell,
	BriefcaseBusiness,
	Check,
	CheckCheck,
	FileText,
	Loader2,
	MessageSquare,
	Sparkles,
	Star,
	UserCheck,
	UserPlus,
	UserRound,
	UserX,
	X,
	XCircle,
} from "lucide-react"

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { NotificationEvent, NotificationPublic } from "@/client/types.gen"
import { useNotifications } from "@/hooks/useNotifications"
import { useAccountRole } from "@/hooks/useAccountRole"
import {
	useAcceptConnectionRequest,
	useDeclineConnectionRequest,
} from "@/hooks/useConnections"
import { chatKeys } from "@/data/chat-keys"
import { formatMessageTime } from "@/util/timestampformatter"
import { useWebSocket } from "@/context/websocket-context"

function NotificationIcon({ type }: { type: NotificationEvent }) {
	switch (type) {
		case "message_received":
			return <MessageSquare className="size-4" />

		case "proposal_received":
			return <FileText className="size-4" />

		case "proposal_accepted":
			return <Sparkles className="size-4 text-emerald-500" />

		case "proposal_rejected":
			return <XCircle className="size-4 text-muted-foreground" />

		case "connection_request":
			return <UserPlus className="size-4 text-primary" />

		case "connection_accepted":
			return <UserCheck className="size-4 text-emerald-500" />

		case "connection_declined":
			return <UserX className="size-4 text-muted-foreground" />

		case "review_received":
			return <Star className="size-4 text-amber-500" />

		case "job_closed":
			return <BriefcaseBusiness className="size-4" />

		default:
			return <UserRound className="size-4" />
	}
}

interface NotificationActionProps {
	notification: NotificationPublic
	role: string
	onMarkAsRead: (id: string) => void
}

function NotificationActions({
	notification,
	role,
	onMarkAsRead,
}: NotificationActionProps) {
	const navigate = useNavigate()
	const acceptConnection = useAcceptConnectionRequest()
	const declineConnection = useDeclineConnectionRequest()

	const [actionStatus, setActionStatus] = useState<"idle" | "accepted" | "declined">(
		notification.connection?.status === "accepted"
			? "accepted"
			: notification.connection?.status === "declined"
				? "declined"
				: "idle"
	)

	// 1. Connection Request Actions (Accept / Decline)
	if (notification.event === "connection_request") {
		const connectionId = notification.connection?.id

		if (actionStatus === "accepted") {
			return (
				<div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
					<Badge variant="outline" className="h-6 border-emerald-500/30 bg-emerald-500/10 px-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
						Connected
					</Badge>
				</div>
			)
		}

		if (actionStatus === "declined") {
			return (
				<div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
					<Badge variant="outline" className="h-6 border-muted-foreground/30 bg-muted/30 px-2 text-[11px] font-medium text-muted-foreground">
						Declined
					</Badge>
				</div>
			)
		}

		if (connectionId) {
			return (
				<div className="mt-2.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
					<button
						type="button"
						disabled={acceptConnection.isPending || declineConnection.isPending}
						onClick={(e) => {
							e.stopPropagation()
							e.preventDefault()
							acceptConnection.mutate(connectionId, {
								onSuccess: () => {
									setActionStatus("accepted")
									onMarkAsRead(notification.id)
								},
							})
						}}
						className="inline-flex h-7 items-center gap-1.5 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground shadow-2xs transition-opacity hover:opacity-90 disabled:opacity-50"
					>
						{acceptConnection.isPending ? (
							<Loader2 className="size-3 animate-spin" />
						) : (
							<Check className="size-3" />
						)}
						Accept
					</button>

					<button
						type="button"
						disabled={acceptConnection.isPending || declineConnection.isPending}
						onClick={(e) => {
							e.stopPropagation()
							e.preventDefault()
							declineConnection.mutate(connectionId, {
								onSuccess: () => {
									setActionStatus("declined")
									onMarkAsRead(notification.id)
								},
							})
						}}
						className="inline-flex h-7 items-center gap-1.5 rounded-md border border-outline-variant bg-surface-container-low px-2 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:opacity-50 dark:border-border-subtle"
					>
						{declineConnection.isPending ? (
							<Loader2 className="size-3 animate-spin" />
						) : (
							<X className="size-3" />
						)}
						Decline
					</button>
				</div>
			)
		}

		return (
			<div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation()
						e.preventDefault()
						onMarkAsRead(notification.id)
						void navigate({ to: "/connects" })
					}}
					className="inline-flex h-6 items-center gap-1.5 rounded-md bg-primary/10 px-2 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
				>
					<UserPlus className="size-3" />
					View Connections
				</button>
			</div>
		)
	}

	// 2. Connection Accepted -> Quick Start Message
	if (notification.event === "connection_accepted") {
		return (
			<div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation()
						e.preventDefault()
						onMarkAsRead(notification.id)
						void navigate({ to: role === "freelancer" ? "/freelancer-messages" : "/messages" })
					}}
					className="inline-flex h-6 items-center gap-1.5 rounded-md bg-primary/10 px-2 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
				>
					<MessageSquare className="size-3" />
					Send Message
				</button>
			</div>
		)
	}

	// 3. Message Received -> Reply
	if (notification.event === "message_received") {
		return (
			<div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation()
						e.preventDefault()
						onMarkAsRead(notification.id)
						void navigate({ to: role === "freelancer" ? "/freelancer-messages" : "/messages" })
					}}
					className="inline-flex h-6 items-center gap-1.5 rounded-md bg-primary/10 px-2 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
				>
					<MessageSquare className="size-3" />
					Reply
				</button>
			</div>
		)
	}

	// 4. Proposal Received -> Review
	if (notification.event === "proposal_received") {
		return (
			<div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation()
						e.preventDefault()
						onMarkAsRead(notification.id)
						void navigate({ to: "/client-jobs" })
					}}
					className="inline-flex h-6 items-center gap-1.5 rounded-md bg-primary/10 px-2 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
				>
					<FileText className="size-3" />
					Review Proposal
				</button>
			</div>
		)
	}

	// 5. Proposal Accepted -> View Project
	if (notification.event === "proposal_accepted") {
		return (
			<div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation()
						e.preventDefault()
						onMarkAsRead(notification.id)
						void navigate({ to: "/freelancer-proposals" })
					}}
					className="inline-flex h-6 items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 text-[11px] font-medium text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
				>
					<Sparkles className="size-3" />
					View Proposal
				</button>
			</div>
		)
	}

	// 6. Review Received -> View Profile
	if (notification.event === "review_received") {
		return (
			<div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation()
						e.preventDefault()
						onMarkAsRead(notification.id)
						void navigate({ to: role === "freelancer" ? "/freelancer" : "/client-profile" })
					}}
					className="inline-flex h-6 items-center gap-1.5 rounded-md bg-amber-500/10 px-2 text-[11px] font-medium text-amber-600 transition-colors hover:bg-amber-500/20 dark:text-amber-400"
				>
					<Star className="size-3" />
					View Review
				</button>
			</div>
		)
	}

	// 7. Proposal Rejected
	if (notification.event === "proposal_rejected") {
		return (
			<div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
				<Badge variant="outline" className="h-5 border-muted-foreground/30 bg-muted/30 px-1.5 text-[10px] font-medium text-muted-foreground">
					Proposal Declined
				</Badge>
			</div>
		)
	}

	// 8. Connection Declined
	if (notification.event === "connection_declined") {
		return (
			<div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
				<Badge variant="outline" className="h-5 border-muted-foreground/30 bg-muted/30 px-1.5 text-[10px] font-medium text-muted-foreground">
					Declined
				</Badge>
			</div>
		)
	}

	// 9. Job Closed
	if (notification.event === "job_closed") {
		return (
			<div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
				<Badge variant="outline" className="h-5 border-muted-foreground/30 bg-muted/30 px-1.5 text-[10px] font-medium text-muted-foreground">
					Job Closed
				</Badge>
			</div>
		)
	}

	return null
}

function getNotificationDestination(notification: NotificationEvent, role: string): string | null {
	switch (notification) {
		case "connection_request":
		case "connection_accepted":
		case "connection_declined":
			return "/connects"

		case "message_received":
			return role === "freelancer" ? "/freelancer-messages" : "/messages"

		case "proposal_received":
			return "/client-jobs"

		case "proposal_accepted":
		case "proposal_rejected":
			return "/freelancer-proposals"

		case "review_received":
			return role === "freelancer" ? "/freelancer" : "/client-profile"

		case "job_closed":
			return role === "freelancer" ? "/freelancer-jobs" : "/client-jobs"

		default:
			return null
	}
}

export function NotificationDropdown() {
	const { data: notifications, isPending } = useNotifications()
	const { sendMessage } = useWebSocket()
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	const role = useAccountRole()

	if (!notifications || isPending) {
		return (
			<button
				type="button"
				disabled
				aria-label="Loading notifications"
				className="group relative flex size-8 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant opacity-60 dark:border-border-subtle"
			>
				<Bell className="size-[18px]" />
			</button>
		)
	}

	const unreadCount = notifications.filter((notification) => !notification.is_read).length

	const markAllAsRead = () => {
		sendMessage({
			type: "read_receipt",
			notification_id: "all_notifications",
		})
		queryClient.setQueryData<NotificationPublic[]>(chatKeys.notifications(), [
			...notifications.map((notification) => ({ ...notification, is_read: true })),
		])
	}

	const markAsRead = (notificationId: string) => {
		sendMessage({
			type: "read_receipt",
			notification_id: notificationId,
		})
		queryClient.setQueryData<NotificationPublic[]>(chatKeys.notifications(), [
			...notifications.map((notification) =>
				notification.id === notificationId ? { ...notification, is_read: true } : notification
			),
		])
	}

	const handleItemClick = (notification: NotificationPublic) => {
		markAsRead(notification.id)
		const destination = getNotificationDestination(notification.event, role)
		if (destination) {
			void navigate({ to: destination })
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label={unreadCount ? `${unreadCount} unread notifications` : "Notifications"}
					className="group relative flex size-8 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant outline-none transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary/25 dark:border-border-subtle"
				>
					<Bell className="size-[18px]" />

					{unreadCount > 0 && (
						<span aria-hidden="true" className="absolute top-1 right-1 flex size-2 items-center justify-center">
							<span className="absolute size-2 rounded-full bg-surface-container-lowest dark:bg-surface-panel" />
							<span className="relative size-1.5 rounded-full bg-error" />
						</span>
					)}
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				sideOffset={8}
				className="w-[400px] max-w-[calc(100vw-20px)] overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-0 shadow-xl dark:border-border-subtle dark:bg-surface-panel"
			>
				{/* Header */}
				<div className="flex items-center justify-between gap-4 px-4 py-3.5">
					<div className="min-w-0">
						<div className="flex items-center gap-2">
							<h2 className="font-headline-sm font-semibold text-headline-sm text-on-surface">Notifications</h2>

							{unreadCount > 0 && (
								<span className="rounded-md bg-surface-container px-1.5 py-0.5 font-caption font-medium text-caption text-primary dark:border dark:border-border-subtle dark:bg-surface-container">
									{unreadCount}
								</span>
							)}
						</div>

						<p className="mt-0.5 font-caption text-caption text-on-surface-variant">Updates from your workspace</p>
					</div>

					{unreadCount > 0 && (
						<button
							type="button"
							onClick={markAllAsRead}
							title="Mark all as read"
							aria-label="Mark all notifications as read"
							className="flex size-8 shrink-0 items-center justify-center rounded-lg text-outline transition-colors hover:bg-surface-container hover:text-primary"
						>
							<CheckCheck className="size-4" />
						</button>
					)}
				</div>

				<DropdownMenuSeparator className="m-0 bg-outline-variant/60 dark:bg-border-subtle" />

				{/* Small section heading */}
				<div className="flex items-center justify-between px-4 pt-3 pb-1.5">
					<span className="font-caption font-semibold text-[10px] text-outline uppercase tracking-wider">
						Recent activity
					</span>

					{unreadCount > 0 && <span className="font-caption text-[10px] text-outline">{unreadCount} unread</span>}
				</div>

				{/* Notifications */}
				<div className="max-h-[420px] overflow-y-auto px-1.5 pb-1.5">
					{notifications.length > 0 ? (
						notifications.map((notification) => (
							<DropdownMenuItem
								key={notification.id}
								onSelect={(event) => {
									event.preventDefault()
									handleItemClick(notification)
								}}
								className={cn(
									"group relative flex cursor-pointer items-start gap-3 rounded-lg px-3 py-3 mb-1 outline-none transition-colors focus:bg-surface-container",
									!notification.is_read && "bg-primary/[0.035] dark:bg-primary/[0.055]"
								)}
							>
								{/* Icon */}
								<span
									className={cn(
										"grid size-8 shrink-0 place-items-center rounded-lg border transition-colors",
										notification.is_read
											? "border-outline-variant bg-surface-container-low text-on-surface-variant dark:border-border-subtle dark:bg-surface-container"
											: "border-primary/15 bg-primary/8 text-primary dark:border-primary/20 dark:bg-primary/10"
									)}
								>
									<NotificationIcon type={notification.event} />
								</span>

								{/* Body */}
								<span className="min-w-0 flex-1">
									<span className="flex items-start justify-between gap-3">
										<span
											className={cn(
												"min-w-0 truncate font-label-sm text-label-sm text-on-surface",
												notification.is_read ? "font-medium" : "font-semibold"
											)}
										>
											{notification.title}
										</span>

										<span className="mt-0.5 shrink-0 font-caption text-[10px] text-outline">
											{formatMessageTime(notification.created_at)}
										</span>
									</span>

									<span className="mt-1 line-clamp-2 block font-body-sm text-[11px] text-on-surface-variant leading-[17px]">
										{notification.content}
									</span>

									{/* Actionable buttons tailored per notification type */}
									<NotificationActions
										notification={notification}
										role={role}
										onMarkAsRead={markAsRead}
									/>
								</span>

								{/* Unread dot */}
								{!notification.is_read && (
									<span aria-label="Unread" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
								)}
							</DropdownMenuItem>
						))
					) : (
						<div className="px-6 py-12 text-center">
							<span className="mx-auto grid size-10 place-items-center rounded-lg border border-outline-variant bg-surface-container-low text-outline dark:border-border-subtle">
								<Bell className="size-[18px]" />
							</span>

							<h3 className="mt-3 font-label-md font-medium text-label-md text-on-surface">You're all caught up</h3>

							<p className="mt-1 font-caption text-caption text-on-surface-variant">
								New workspace activity will show up here.
							</p>
						</div>
					)}
				</div>

				{notifications.length > 0 && (
					<>
						<DropdownMenuSeparator className="m-0 bg-outline-variant/60 dark:bg-border-subtle" />

						<div className="flex items-center justify-between px-4 py-2.5">
							<span className="font-caption text-caption text-outline">Showing recent activity</span>
						</div>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
