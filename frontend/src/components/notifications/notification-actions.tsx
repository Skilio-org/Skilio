import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Check, FileText, Loader2, MessageSquare, Sparkles, UserPlus, X } from "lucide-react"
import { type ReactNode, useState } from "react"
import type { NotificationPublic } from "@/client/types.gen"
import { Badge } from "@/components/ui/badge"
import { chatKeys } from "@/data/chat-keys"
import { useAcceptConnectionRequest, useDeclineConnectionRequest } from "@/hooks/useConnections"

const linkButton =
	"inline-flex h-6 items-center gap-1.5 rounded-md bg-primary/10 px-2 text-[11px] font-medium text-link transition-colors hover:bg-primary/20"
const mutedBadge = "h-5 border-0 bg-muted/40 px-1.5 text-[10px] font-medium text-muted-foreground"

// The row under a notification. Clicks here must not trigger the notification's own click.
function ActionRow({ children }: { children: ReactNode }) {
	return (
		<div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
			{children}
		</div>
	)
}

function ActionLink({
	onClick,
	className = linkButton,
	disabled,
	children,
}: {
	onClick: () => void
	className?: string
	disabled?: boolean
	children: ReactNode
}) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={(e) => {
				e.stopPropagation()
				e.preventDefault()
				onClick()
			}}
			className={className}
		>
			{children}
		</button>
	)
}

// Accept / Decline buttons for a connection request, or the answer once it has been given.
function ConnectionRequestActions({
	notification,
	onMarkAsRead,
}: {
	notification: NotificationPublic
	onMarkAsRead: (id: string) => void
}) {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const acceptConnection = useAcceptConnectionRequest()
	const declineConnection = useDeclineConnectionRequest()

	const connectionId = notification.connection?.id
	const [answer, setAnswer] = useState<"accepted" | "declined" | null>(null)
	const status = answer ?? notification.connection?.status
	const busy = acceptConnection.isPending || declineConnection.isPending

	function respond(newStatus: "accepted" | "declined") {
		if (!connectionId) return
		const mutation = newStatus === "accepted" ? acceptConnection : declineConnection
		mutation.mutate(connectionId, {
			onSuccess: () => {
				setAnswer(newStatus)
				// Update the cached notifications so the buttons turn into a badge everywhere.
				queryClient.setQueryData<NotificationPublic[]>(chatKeys.notifications(), (current) =>
					current?.map((item) =>
						item.id === notification.id || item.connection?.id === connectionId
							? {
									...item,
									is_read: true,
									connection: item.connection ? { ...item.connection, status: newStatus } : item.connection,
								}
							: item,
					),
				)
				onMarkAsRead(notification.id)
			},
		})
	}

	if (status === "accepted") {
		return (
			<ActionRow>
				<Badge
					variant="secondary"
					className="h-6 border-0 bg-emerald-500/10 px-2 font-medium text-[11px] text-emerald-600 dark:text-emerald-400"
				>
					Connected
				</Badge>
			</ActionRow>
		)
	}

	if (status === "declined") {
		return (
			<ActionRow>
				<Badge variant="secondary" className="h-6 border-0 bg-muted/40 px-2 font-medium text-[11px] text-muted-foreground">
					Declined
				</Badge>
			</ActionRow>
		)
	}

	if (!connectionId) {
		return (
			<ActionRow>
				<ActionLink
					onClick={() => {
						onMarkAsRead(notification.id)
						void navigate({ to: "/connects" })
					}}
				>
					<UserPlus className="size-3" />
					View Connections
				</ActionLink>
			</ActionRow>
		)
	}

	return (
		<ActionRow>
			<ActionLink
				onClick={() => respond("accepted")}
				disabled={busy}
				className="inline-flex h-7 min-w-[76px] items-center justify-center gap-1.5 rounded-md bg-primary px-2.5 font-medium text-primary-foreground text-xs transition-opacity hover:opacity-90 disabled:opacity-50"
			>
				{acceptConnection.isPending ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
				Accept
			</ActionLink>
			<ActionLink
				onClick={() => respond("declined")}
				disabled={busy}
				className="inline-flex h-7 min-w-[76px] items-center justify-center gap-1.5 rounded-md bg-surface-container-high px-2.5 font-medium text-on-surface text-xs transition-colors hover:bg-surface-container-highest disabled:opacity-50"
			>
				{declineConnection.isPending ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
				Decline
			</ActionLink>
		</ActionRow>
	)
}

// Quick actions shown under a notification, depending on what happened.
export function NotificationActions({
	notification,
	role,
	onMarkAsRead,
}: {
	notification: NotificationPublic
	role: string
	onMarkAsRead: (id: string) => void
}) {
	const navigate = useNavigate()
	const messagesPath = role === "freelancer" ? "/freelancer-messages" : "/messages"

	switch (notification.event) {
		case "connection_request":
			return <ConnectionRequestActions notification={notification} onMarkAsRead={onMarkAsRead} />

		case "connection_accepted":
			return (
				<ActionRow>
					<ActionLink
						onClick={() => {
							onMarkAsRead(notification.id)
							void navigate({ to: messagesPath })
						}}
					>
						<MessageSquare className="size-3" />
						Send Message
					</ActionLink>
				</ActionRow>
			)

		case "message_received":
			return (
				<ActionRow>
					<ActionLink
						onClick={() => {
							onMarkAsRead(notification.id)
							void navigate({ to: messagesPath, search: { userId: notification.chat_message?.sender_id } })
						}}
					>
						<MessageSquare className="size-3" />
						Reply
					</ActionLink>
				</ActionRow>
			)

		case "proposal_received":
			return (
				<ActionRow>
					<ActionLink
						onClick={() => {
							onMarkAsRead(notification.id)
							void navigate({ to: "/client-jobs", search: { jobId: notification.job_post?.id } })
						}}
					>
						<FileText className="size-3" />
						Review Proposal
					</ActionLink>
				</ActionRow>
			)

		case "proposal_accepted":
			return (
				<ActionRow>
					<ActionLink
						onClick={() => {
							onMarkAsRead(notification.id)
							void navigate({ to: "/freelancer-proposals" })
						}}
						className="inline-flex h-6 items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 font-medium text-[11px] text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
					>
						<Sparkles className="size-3" />
						View Proposal
					</ActionLink>
				</ActionRow>
			)

		case "proposal_rejected":
			return (
				<ActionRow>
					<Badge variant="secondary" className={mutedBadge}>
						Proposal Declined
					</Badge>
				</ActionRow>
			)

		case "connection_declined":
			return (
				<ActionRow>
					<Badge variant="secondary" className={mutedBadge}>
						Declined
					</Badge>
				</ActionRow>
			)

		case "job_closed":
			return (
				<ActionRow>
					<Badge variant="secondary" className={mutedBadge}>
						Job Closed
					</Badge>
				</ActionRow>
			)

		default:
			return null
	}
}
