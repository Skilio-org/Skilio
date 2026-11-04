// biome-ignore assist/source/organizeImports: <explanation>
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
	UserPlus,
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
import { cn } from "@/lib/utils"
import type { NotificationPublic } from "@/client/types.gen"
import { useNotifications } from "@/hooks/useNotifications"
import { useAccountRole } from "@/hooks/useAccountRole"
import { useAcceptConnectionRequest, useDeclineConnectionRequest } from "@/hooks/useConnections"
import { chatKeys } from "@/data/chat-keys"
import { formatMessageTime } from "@/util/timestampformatter"
import { useWebSocket } from "@/context/websocket-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAccountAvatarUrl } from "@/hooks/useAccountAvatar"

function NotificationIcon({ item }: { item: NotificationPublic }) {

	switch (item.event) {
		// case "message_received":
		// 	return <MessageSquare className="size-5" />

		case "proposal_received":
			return <FileText className="size-5" />

		// case "proposal_accepted":
		// 	return <Sparkles className="size-5 text-emerald-500" />

		// case "proposal_rejected":
		// 	return <XCircle className="size-5 text-muted-foreground" />

		case "connection_request":
			return <Avatar className="size-full rounded-none">
					<AvatarImage src={useAccountAvatarUrl(item.connection?.sender_id)}
						alt={item.connection?.sender?.full_name ?? "Unknown"} aria-hidden="true" />
					<AvatarFallback>{item.connection?.sender?.full_name || "Unknown"}</AvatarFallback>
				</Avatar>
		case "connection_accepted":
			return <Avatar className="size-full rounded-none">
				<AvatarImage src={useAccountAvatarUrl(item.connection?.receiver_id)}
					alt={item.connection?.receiver?.full_name ?? "Unknown"} aria-hidden="true" />
				<AvatarFallback>{item.connection?.receiver?.full_name || "Unknown"}</AvatarFallback>
			</Avatar>
		case "review_received":
			return <Avatar className="size-full rounded-none">
				<AvatarImage src={useAccountAvatarUrl(item.review?.client_id)}
					alt={item.review?.client_name ?? "Unknown"} aria-hidden="true" />
				<AvatarFallback>{item.review?.client_name || "Unknown"}</AvatarFallback>
			</Avatar>

		// case "job_closed":
		// 	return <BriefcaseBusiness className="size-5" />

		default:
			return <Bell className="size-5" />
	}
}

interface NotificationActionProps {
	notification: NotificationPublic
	role: string
	onMarkAsRead: (id: string) => void
}

function ConnectionStatusBadge({ notification }: { notification: NotificationPublic }) {
	const connectionStatus = notification.connection?.status

	const [actionStatus, _] = useState<"idle" | "accepted" | "declined">(
		connectionStatus === "accepted"
			? "accepted"
			: connectionStatus === "declined"
				? "declined"
				: "idle",
	)

	const isAccepted = actionStatus === "accepted" || connectionStatus === "accepted"
	const isDeclined = actionStatus === "declined" || connectionStatus === "declined"

	if (isAccepted || isDeclined) {
		return (
			<span 
				className={cn(
					"ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none tracking-wide",
					isAccepted
						? "bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/25"
						: "bg-red-500/10 text-red-600 ring-1 ring-inset ring-red-500/20 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/25",
				)}>
				{isAccepted ? "Accepted" : "Declined"}
			</span>
		)
	}
	return null
}

function NotificationActions({ notification, onMarkAsRead }: NotificationActionProps) {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const acceptConnection = useAcceptConnectionRequest()
	const declineConnection = useDeclineConnectionRequest()

	const connectionId = notification.connection?.id || (notification as any).connection_id
	const connectionStatus = notification.connection?.status

	const [actionStatus, setActionStatus] = useState<"idle" | "accepted" | "declined">(
		connectionStatus === "accepted"
			? "accepted"
			: connectionStatus === "declined"
				? "declined"
				: "idle",
	)

	const isAccepted = actionStatus === "accepted" || connectionStatus === "accepted"
	const isDeclined = actionStatus === "declined" || connectionStatus === "declined"

	if (notification.event === "connection_request") {
		if (isAccepted || isDeclined)
			return null

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
								onSuccess: (data) => {
									setActionStatus("accepted")
									queryClient.setQueryData<NotificationPublic[]>(chatKeys.notifications(), (current) => {
										if (!current) return current
										return current.map((item) => {
											if (
												item.id === notification.id ||
												item.connection?.id === connectionId ||
												(item as any).connection_id === connectionId
											) {
												return {
													...item,
													is_read: true,
													connection: {
														...(item.connection || {}),
														...(data || {}),
														id: connectionId,
														status: "accepted",
													} as any,
												}
											}
											return item
										})
									})
									onMarkAsRead(notification.id)
								},
							})
						}}
						className="inline-flex h-7 min-w-[76px] items-center justify-center gap-1.5 rounded-md border-0 border-none bg-primary px-2.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
					>
						{acceptConnection.isPending ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
						Accept
					</button>

					<button
						type="button"
						disabled={acceptConnection.isPending || declineConnection.isPending}
						onClick={(e) => {
							e.stopPropagation()
							e.preventDefault()
							declineConnection.mutate(connectionId, {
								onSuccess: (data) => {
									setActionStatus("declined")
									queryClient.setQueryData<NotificationPublic[]>(chatKeys.notifications(), (current) => {
										if (!current) return current
										return current.map((item) => {
											if (
												item.id === notification.id ||
												item.connection?.id === connectionId ||
												(item as any).connection_id === connectionId
											) {
												return {
													...item,
													is_read: true,
													connection: {
														...(item.connection || {}),
														...(data || {}),
														id: connectionId,
														status: "declined",
													} as any,
												}
											}
											return item
										})
									})
									onMarkAsRead(notification.id)
								},
							})
						}}
						className="inline-flex h-7 min-w-[76px] items-center justify-center gap-1.5 rounded-md border-0 border-none bg-surface-container-high px-2.5 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-50"
					>
						{declineConnection.isPending ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
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
					className="inline-flex h-6 items-center gap-1.5 rounded-md border-0 border-none bg-primary/10 px-2 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
				>
					<UserPlus className="size-3" />
					View Connections
				</button>
			</div>
		)
	}

	return null
}

export function UserName({name}: {name: string | undefined})
{
	return <span className="underline font-semibold">{name}</span>
}

export function BakedBody({notification}: {notification: NotificationPublic}) {
	switch (notification.event) {
		case "connection_request":
			return <>
				<UserName name={notification.connection?.sender?.full_name || notification.connection?.receiver?.full_name || "Someone"} /> wants to connect with you.
			</>
		case "connection_accepted":
			return <>
				<UserName name={notification.connection?.sender?.full_name || notification.connection?.receiver?.full_name || "Someone"} /> accepted your request.
			</>	
		case "connection_declined":
			return <>
				<UserName name={notification.connection?.sender?.full_name || notification.connection?.receiver?.full_name || "Someone"} /> declined your request.
			</>
		case "review_received":
			return <>
				<UserName name={notification.review?.client?.full_name || notification.review?.client_name || notification.connection?.receiver?.full_name || "Someone"} /> left a review for you.
			</>
		case "proposal_received":
			return <>
				<UserName name={notification.proposal?.freelancer?.full_name || "Someone"} /> has submitted a proposal for your job.
			</>
		case "proposal_accepted":
		case "proposal_rejected":
			return <UserName name={notification.proposal?.freelancer?.full_name || "Someone"} /> + notification.content.replace(/.*? accepted your proposal|.*? rejected your proposal/, "")
		case "job_closed":
			return <UserName name={notification.job_post?.title || "Unknown Job"} /> + notification.content.replace(/.*? has been closed/, "")
		default:
	}
	return <>notification.content</>
}

export function NotificationBody({notification, onMarkAsRead}: {notification: NotificationPublic, onMarkAsRead: (id: string) => void})
{
	const role = useAccountRole()
	// let content = notification.content;

	// Generate content depending on the notification that was received.
	// If someone sent a connection request.
	// Then it should be their name + wants to connect.
	// If someone sent a review.
	// Then it should be their name + reviewed your account.
	// If someone accepted your connect.
	// Then it should be their name + accepted your connection.
	// and so on..
	// Micro instructions:
	// Make the name standout just a bit more than the actual content.
	// Make the spacing better than whatever there is now.
	// Make sure the ui is as clean as possible.\
	// also, dont change anything except this component.
	// switch (notification.event) {
	// 	case "connection_request":
	// 		content = `${notification.connection?.sender?.full_name || "Someone"} wants to connect with you.`
	// 		break
	// 	case "connection_accepted":
	// 		content = `${notification.connection?.receiver?.full_name || "Someone"} accepted your connection request.`
	// 		break
	// 	case "connection_declined":
	// 		content = `${notification.connection?.receiver?.full_name || "Someone"} declined your connection request.`
	// 		break
	// 	case "review_received":
	// 		content = `${notification.review?.client?.full_name || "Someone"} left a review for you.`
	// 		break
	// 	case "proposal_received":
	// 		content = `${notification.proposal?.freelancer?.full_name || "Someone"} submitted a proposal for your job.`
	// 		break
	// 	case "proposal_accepted":
	// 		content = `${notification.proposal?.freelancer?.full_name || "Someone"} accepted your proposal.`
	// 		break
	// 	case "proposal_rejected":
	// 		content = `${notification.proposal?.freelancer?.full_name || "Someone"} rejected your proposal.`
	// 		break
	// 	case "job_closed":
	// 		content = `Your job "${notification.job_post?.title || "Unknown Job"}" has been closed.`
	// 		break
	// 	default:
	// 		content = notification.content
	// }

	return (
		<span className="min-w-0 flex-1">
			<span className="flex items-start justify-between gap-3">
				<span
					className={cn(
						"min-w-0 truncate font-label-sm text-label-sm text-on-surface",
						notification.is_read ? "font-medium" : "font-semibold",
					)}
				>
					{notification.title}
					<ConnectionStatusBadge notification={notification} />
				</span>

				<span className="mt-0.5 shrink-0 font-caption text-[10px] text-outline">
					{formatMessageTime(notification.created_at)}
				</span>
			</span>

			<span className="mt-1 line-clamp-2 block font-body-sm text-[11px] text-on-surface-variant leading-[17px]">
				<BakedBody notification={notification} />
			</span>

			{/* Actionable buttons tailored per notification type */}
			<NotificationActions notification={notification} role={role} onMarkAsRead={onMarkAsRead} />
		</span>
	)
}

export function NotificationDropdown() {
	const { data: notifications, isPending } = useNotifications()
	const { sendMessage } = useWebSocket()
	const [open, setOpen] = useState(false)
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
	const markAsRead = (notificationId: string) => {
		sendMessage({
			type: "read_receipt",
			notification_id: notificationId,
		})
		queryClient.setQueryData<NotificationPublic[]>(chatKeys.notifications(), (current) =>
			(current || notifications).map((notification) =>
				notification.id === notificationId ? { ...notification, is_read: true } : notification,
			),
		)
	}

	const markAllAsRead = () => {
		sendMessage({
			type: "read_receipt",
			notification_id: "all_notifications",
		})
		queryClient.setQueryData<NotificationPublic[]>(chatKeys.notifications(), (current) =>
			(current || notifications).map((notification) => ({ ...notification, is_read: true })),
		)
	}


	const handleItemClick = (notification: NotificationPublic) => {
		markAsRead(notification.id)
		setOpen(false)
		switch (notification.event) {
			case "proposal_received":
				void navigate({
					to: "/client-jobs",
					search: { jobId: notification.job_post?.id },
				})
				break
			case "message_received":
				void navigate({
					to: role === "freelancer" ? "/freelancer-messages" : "/messages",
					search: { userId: notification.chat_message?.sender_id },
				})
				break
			case "connection_request":
				void navigate({ to: "/connects" })
				break
			case "connection_accepted":
			case "connection_declined": {
				// I was here.
				void navigate({ to: `/talent/${notification.connection?.receiver_id}` })
			} break;
			case "proposal_accepted":
			case "proposal_rejected":
				void navigate({ to: "/freelancer-proposals" })
				break
			case "review_received":
				void navigate({ to: role === "freelancer" ? "/freelancer" : "/client-profile" })
				break
			case "job_closed":
				void navigate({ to: role === "freelancer" ? "/freelancer-jobs" : "/client-jobs" })
				break
			default:
				break
		}
	}

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
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
						notifications.map((notification) => {
							if ((notification.event === "review_received"
								|| notification.event === "proposal_rejected"
								|| notification.event === "proposal_accepted") && role === "client")
								return ""
							if (notification.event === "proposal_received" && role === "freelancer")
								return ""

							return <DropdownMenuItem
								key={notification.id}
								onSelect={(event) => {
									event.preventDefault()
									handleItemClick(notification)
								}}
								className={cn(
									"group relative flex cursor-pointer items-start gap-3 rounded-lg px-3 py-3 mb-1 outline-none transition-colors focus:bg-surface-container",
									!notification.is_read && "bg-primary/[0.035] dark:bg-primary/[0.055]",
								)}
							>
								{/* Icon */}
								{/* Emm this needs to change, if I have an avatar, I will just use the avatar. */}
								<span
									className={cn(
										"grid size-10 shrink-0 rounded place-items-center border transition-colors",
										"border-outline-variant bg-surface-container-low text-on-surface-variant dark:border-border-subtle dark:bg-surface-container"
									)}
								>
									<NotificationIcon item={notification} />
								</span>

								{/* Body */}
								<NotificationBody notification={notification} onMarkAsRead={markAsRead}/>

								{/* Unread dot */}
								{!notification.is_read && (
									<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
								)}
							</DropdownMenuItem>
						}
					)) : (
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
