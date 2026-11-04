import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Bell, CheckCheck } from "lucide-react"
import { useState } from "react"
import type { NotificationPublic } from "@/client/types.gen"
import { NotificationItem } from "@/components/notifications/notification-item"
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useWebSocket } from "@/context/websocket-context"
import { chatKeys } from "@/data/chat-keys"
import { useAccountRole } from "@/hooks/useAccountRole"
import { useNotifications } from "@/hooks/useNotifications"

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
	const messagesPath = role === "freelancer" ? "/freelancer-messages" : "/messages"

	// Some notifications only make sense for one kind of account.
	const visibleNotifications = notifications.filter((notification) => {
		const freelancerOnly = ["review_received", "proposal_rejected", "proposal_accepted"].includes(notification.event)
		if (freelancerOnly && role === "client") return false
		if (notification.event === "proposal_received" && role === "freelancer") return false
		return true
	})

	const markAllAsRead = () => {
		sendMessage({ type: "read_receipt", notification_id: "all_notifications" })
		queryClient.setQueryData<NotificationPublic[]>(chatKeys.notifications(), (current) =>
			(current || notifications).map((notification) => ({ ...notification, is_read: true })),
		)
	}

	const markAsRead = (notificationId: string) => {
		sendMessage({ type: "read_receipt", notification_id: notificationId })
		queryClient.setQueryData<NotificationPublic[]>(chatKeys.notifications(), (current) =>
			(current || notifications).map((notification) =>
				notification.id === notificationId ? { ...notification, is_read: true } : notification,
			),
		)
	}

	// Clicking a notification marks it as read and opens the page it is about.
	const handleItemClick = (notification: NotificationPublic) => {
		markAsRead(notification.id)
		setOpen(false)
		switch (notification.event) {
			case "proposal_received":
				void navigate({ to: "/client-jobs", search: { jobId: notification.job_post?.id } })
				break
			case "message_received":
				void navigate({ to: messagesPath, search: { userId: notification.chat_message?.sender_id } })
				break
			case "connection_request":
			case "connection_accepted":
			case "connection_declined":
				void navigate({ to: "/connects" })
				break
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
				<div className="flex items-center justify-between gap-4 px-4 py-3.5">
					<div className="min-w-0">
						<div className="flex items-center gap-2">
							<h2 className="font-headline-sm font-semibold text-headline-sm text-on-surface">Notifications</h2>
							{unreadCount > 0 && (
								<span className="rounded-md bg-surface-container px-1.5 py-0.5 font-caption font-medium text-caption text-link dark:border dark:border-border-subtle dark:bg-surface-container">
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
							className="flex size-8 shrink-0 items-center justify-center rounded-lg text-outline transition-colors hover:bg-surface-container hover:text-link"
						>
							<CheckCheck className="size-4" />
						</button>
					)}
				</div>

				<DropdownMenuSeparator className="m-0 bg-outline-variant/60 dark:bg-border-subtle" />

				<div className="flex items-center justify-between px-4 pt-3 pb-1.5">
					<span className="font-caption font-semibold text-[10px] text-outline uppercase tracking-wider">
						Recent activity
					</span>
					{unreadCount > 0 && <span className="font-caption text-[10px] text-outline">{unreadCount} unread</span>}
				</div>

				<div className="max-h-[420px] overflow-y-auto px-1.5 pb-1.5">
					{visibleNotifications.length > 0 ? (
						visibleNotifications.map((notification) => (
							<NotificationItem
								key={notification.id}
								notification={notification}
								role={role}
								onClick={() => handleItemClick(notification)}
								onMarkAsRead={markAsRead}
							/>
						))
					) : (
						<div className="px-6 py-12 text-center">
							<span className="mx-auto grid size-10 place-items-center rounded-lg border border-outline-variant bg-surface-container-low text-outline dark:border-border-subtle">
								<Bell className="size-[18px]" />
							</span>
							<h3 className="mt-3 font-label-md font-medium text-label-md text-on-surface">You're all caught up</h3>
							<p className="mt-1 font-caption text-caption text-on-surface-variant">New workspace activity will show up here.</p>
						</div>
					)}
				</div>

				{visibleNotifications.length > 0 && (
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
