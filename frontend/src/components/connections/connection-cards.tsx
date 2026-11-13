import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { Briefcase, Check, MessageSquare, UserMinus, X } from "lucide-react"
import type { ConnectionPublic } from "@/client"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { accountAvatarUrl } from "@/hooks/useAccountAvatar"
import { getInitials } from "@/lib/format"
import { cn } from "@/lib/utils"

const roleLabel = (isSpecialist: boolean) => (isSpecialist ? "Specialist" : "Client")

// Specialists have a profile page you can open. Clients don't, so for them this just shows the content.
function ProfileLink({
	isSpecialist,
	id,
	className,
	children,
}: {
	isSpecialist: boolean
	id: string
	className?: string
	children: ReactNode
}) {
	if (!isSpecialist) return <>{children}</>
	return (
		<Link to="/talent/$freelancerId" params={{ freelancerId: id }} search={{ q: undefined }} className={className}>
			{children}
		</Link>
	)
}

function PersonAvatar({ id, name, role, className }: { id: string; name: string; role?: "client" | "freelancer"; className?: string }) {
	return (
		<Avatar className={cn("size-10 sm:size-11 shrink-0 rounded-lg border border-outline-variant bg-surface-container", className)}>
			<AvatarImage src={accountAvatarUrl(id, "", role)} alt={name} className="object-cover" />
			<AvatarFallback className="rounded-lg bg-surface-container font-label-md font-semibold text-xs sm:text-label-md text-on-surface">
				{getInitials(name)}
			</AvatarFallback>
		</Avatar>
	)
}

// The project and note that came with a connection request (used by received and sent requests).
function RequestDetails({ connection }: { connection: ConnectionPublic }) {
	return (
		<>
			{connection.job_post && (
				<div className="mt-1 flex items-center gap-1.5 font-medium text-link text-xs">
					<Briefcase className="size-3.5 shrink-0" />
					<span className="truncate">Referencing project: {connection.job_post.title}</span>
				</div>
			)}
			{connection.note && (
				<div className="mt-2 max-w-2xl rounded-lg border border-outline-variant/60 bg-surface-container-low/40 p-2.5 text-on-surface text-xs italic leading-relaxed">
					"{connection.note}"
				</div>
			)}
		</>
	)
}

const requestCard =
	"rounded-xl border border-outline-variant bg-surface-container-lowest p-4 sm:p-5 transition-all duration-150 hover:border-outline"

// Someone you are already connected with.
export function ConnectionCard({
	connection,
	userId,
	messagesPath,
	onRemove,
}: {
	connection: ConnectionPublic
	userId?: string
	messagesPath: "/freelancer-messages" | "/messages"
	onRemove: (connection: ConnectionPublic) => void
}) {
	const partner = connection.sender_id === userId ? connection.receiver : connection.sender
	const partnerName = partner?.full_name || "Platform Member"
	const partnerId = partner?.id || (connection.sender_id === userId ? connection.receiver_id : connection.sender_id)
	const isSpecialist = connection.freelancer_id === partnerId

	return (
		<Card className="group rounded-xl border border-outline-variant bg-surface-container-lowest p-4 sm:p-5 transition-all duration-150 hover:border-outline hover:shadow-xs">
			<CardContent className="flex h-full flex-col justify-between gap-3 sm:gap-4 p-0">
				<div className="flex items-start justify-between gap-2.5 sm:gap-3">
					<div className="flex min-w-0 items-start gap-3 sm:gap-3.5">
						<div className="relative shrink-0">
							<ProfileLink isSpecialist={isSpecialist} id={partnerId} className="shrink-0 rounded-lg">
								<PersonAvatar id={partnerId} name={partnerName} role={isSpecialist ? "freelancer" : "client"} />
							</ProfileLink>
							<span
								aria-hidden="true"
								className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-surface-container-lowest bg-primary"
							/>
						</div>

						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
								<h4 className="truncate font-headline-sm font-semibold text-sm sm:text-base text-on-surface">
									<ProfileLink isSpecialist={isSpecialist} id={partnerId} className="hover:underline">
										{partnerName}
									</ProfileLink>
								</h4>
							</div>
							<p className="mt-0.5 font-medium text-on-surface-variant text-xs">{roleLabel(isSpecialist)}</p>
							{connection.job_post && (
								<div className="mt-1.5 flex items-center gap-1.5 text-on-surface-variant text-xs">
									<Briefcase className="size-3.5 shrink-0 text-link" />
									<span className="truncate">{connection.job_post.title}</span>
								</div>
							)}
						</div>
					</div>

					<button
						type="button"
						onClick={() => onRemove(connection)}
						title={`Remove connection with ${partnerName}`}
						className="grid size-8 shrink-0 place-items-center rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant/70 transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
					>
						<UserMinus className="size-4" />
					</button>
				</div>

				{connection.note && (
					<div className="rounded-lg border border-outline-variant/50 bg-surface-container-low/40 p-2.5 text-on-surface-variant text-xs italic leading-relaxed">
						"{connection.note}"
					</div>
				)}

				<div className="flex flex-wrap items-center justify-between gap-2 border-outline-variant/60 border-t pt-3 text-on-surface-variant text-xs">
					<span className="flex items-center gap-1.5 font-caption text-caption">
						<span className="size-1.5 rounded-full bg-primary" />
						Collaboration unlocked
					</span>
					<Link
						to={messagesPath}
						search={{ userId: partnerId }}
						className={cn(workspaceStyles.primaryAction, "h-8.5 sm:h-8 gap-1.5 px-3 text-xs shrink-0")}
					>
						<MessageSquare className="size-3.5" />
						<span>Message</span>
					</Link>
				</div>
			</CardContent>
		</Card>
	)
}

// Someone who asked to connect with you: accept or decline.
export function ReceivedRequestCard({
	connection,
	busy,
	onAccept,
	onDecline,
}: {
	connection: ConnectionPublic
	busy: boolean
	onAccept: () => void
	onDecline: () => void
}) {
	const name = connection.sender?.full_name || "Platform Member"
	const senderId = connection.sender?.id || connection.sender_id
	const isSpecialist = connection.freelancer_id === senderId

	return (
		<Card className={requestCard}>
			<div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 items-start gap-3 sm:gap-3.5">
					<ProfileLink isSpecialist={isSpecialist} id={senderId} className="shrink-0 rounded-lg">
						<PersonAvatar id={senderId} name={name} role={isSpecialist ? "freelancer" : "client"} />
					</ProfileLink>
					<div className="min-w-0 space-y-1">
						<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
							<h4 className="font-headline-sm font-semibold text-sm sm:text-base text-on-surface">
								<ProfileLink isSpecialist={isSpecialist} id={senderId} className="hover:underline">
									{name}
								</ProfileLink>
							</h4>
							<Badge variant="pending">
								Pending request
							</Badge>
						</div>
						<p className="font-medium text-on-surface-variant text-xs">
							{roleLabel(isSpecialist)} • Wants to connect with you
						</p>
						<RequestDetails connection={connection} />
					</div>
				</div>

				<div className="flex w-full shrink-0 items-center gap-2 pt-2.5 border-t border-outline-variant/50 sm:w-auto sm:border-t-0 sm:pt-0 sm:self-center">
					<button
						type="button"
						disabled={busy}
						onClick={onDecline}
						className={cn(
							workspaceStyles.secondaryAction,
							"flex-1 sm:flex-initial h-9 sm:h-8 justify-center px-3.5 text-destructive text-xs hover:border-destructive/30 hover:bg-destructive/10 disabled:opacity-50",
						)}
					>
						<X className="size-3.5" />
						<span>Decline</span>
					</button>
					<button
						type="button"
						disabled={busy}
						onClick={onAccept}
						className={cn(
							workspaceStyles.primaryAction,
							"flex-1 sm:flex-initial h-9 sm:h-8 justify-center px-4 text-xs disabled:opacity-50",
						)}
					>
						<Check className="size-3.5" />
						<span>Accept</span>
					</button>
				</div>
			</div>
		</Card>
	)
}

// A request you sent that has not been answered yet: you can withdraw it.
export function SentRequestCard({
	connection,
	busy,
	onWithdraw,
}: {
	connection: ConnectionPublic
	busy: boolean
	onWithdraw: () => void
}) {
	const name = connection.receiver?.full_name || "Platform Member"
	const receiverId = connection.receiver?.id || connection.receiver_id
	const isSpecialist = connection.freelancer_id === receiverId

	return (
		<Card className={requestCard}>
			<div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 items-start gap-3 sm:gap-3.5">
					<ProfileLink isSpecialist={isSpecialist} id={receiverId} className="shrink-0 rounded-lg">
						<PersonAvatar id={receiverId} name={name} role={isSpecialist ? "freelancer" : "client"} />
					</ProfileLink>
					<div className="min-w-0 space-y-1">
						<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
							<h4 className="font-headline-sm font-semibold text-sm sm:text-base text-on-surface">
								<ProfileLink isSpecialist={isSpecialist} id={receiverId} className="hover:underline">
									{name}
								</ProfileLink>
							</h4>
							<Badge variant="pending">
								Pending review
							</Badge>
						</div>
						<p className="font-medium text-on-surface-variant text-xs">
							{roleLabel(isSpecialist)} • Awaiting their response
						</p>
						<RequestDetails connection={connection} />
					</div>
				</div>

				<div className="w-full pt-2.5 border-t border-outline-variant/50 sm:w-auto sm:border-t-0 sm:pt-0 sm:self-center">
					<button
						type="button"
						disabled={busy}
						onClick={onWithdraw}
						className={cn(
							workspaceStyles.secondaryAction,
							"w-full sm:w-auto h-9 sm:h-8 justify-center px-4 text-xs hover:border-destructive/30 hover:text-destructive disabled:opacity-50",
						)}
					>
						Withdraw
					</button>
				</div>
			</div>
		</Card>
	)
}
