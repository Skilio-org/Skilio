import {
	Bell,
	BriefcaseBusiness,
	FileText,
	MessageSquare,
	Sparkles,
	Star,
	UserCheck,
	UserPlus,
	UserX,
	XCircle,
} from "lucide-react"
import type { NotificationEvent, NotificationPublic } from "@/client/types.gen"
import { NotificationActions } from "@/components/notifications/notification-actions"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { formatMessageTime } from "@/lib/format"
import { cn } from "@/lib/utils"

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
			return <UserPlus className="size-4 text-link" />
		case "connection_accepted":
			return <UserCheck className="size-4 text-emerald-500" />
		case "connection_declined":
			return <UserX className="size-4 text-muted-foreground" />
		case "review_received":
			return <Star className="size-4 fill-primary text-primary" />
		case "job_closed":
			return <BriefcaseBusiness className="size-4" />
		default:
			return <Bell className="size-4" />
	}
}

// One row in the notification list: icon, title, time, text and the quick actions.
export function NotificationItem({
	notification,
	role,
	onClick,
	onMarkAsRead,
}: {
	notification: NotificationPublic
	role: string
	onClick: () => void
	onMarkAsRead: (id: string) => void
}) {
	return (
		<DropdownMenuItem
			onSelect={(event) => {
				event.preventDefault()
				onClick()
			}}
			className={cn(
				"group relative mb-1 flex cursor-pointer items-start gap-3 rounded-lg px-3 py-3 outline-none transition-colors focus:bg-surface-container",
				!notification.is_read && "bg-primary/[0.035] dark:bg-primary/[0.055]",
			)}
		>
			<span
				className={cn(
					"grid size-8 shrink-0 place-items-center rounded-lg border transition-colors",
					notification.is_read
						? "border-outline-variant bg-surface-container-low text-on-surface-variant dark:border-border-subtle dark:bg-surface-container"
						: "border-primary/15 bg-primary/8 text-link dark:border-primary/20 dark:bg-primary/10",
				)}
			>
				<NotificationIcon type={notification.event} />
			</span>

			<span className="min-w-0 flex-1">
				<span className="flex items-start justify-between gap-3">
					<span
						className={cn(
							"min-w-0 truncate font-label-sm text-label-sm text-on-surface",
							notification.is_read ? "font-medium" : "font-semibold",
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

				<NotificationActions notification={notification} role={role} onMarkAsRead={onMarkAsRead} />
			</span>

			{!notification.is_read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />}
		</DropdownMenuItem>
	)
}
