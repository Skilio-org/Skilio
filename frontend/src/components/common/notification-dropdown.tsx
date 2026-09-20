import { useState } from "react"
import { Bell, BriefcaseBusiness, CheckCheck, FileText, MessageSquare, UserRound } from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type NotificationType = "message" | "proposal" | "contract" | "profile"

type Notification = {
	id: number
	type: NotificationType
	title: string
	description: string
	time: string
	read: boolean
}

const initialNotifications: Notification[] = [
	{
		id: 1,
		type: "message",
		title: "New message",
		description: "Sarah sent you a message about the React dashboard project.",
		time: "2m",
		read: false,
	},
	{
		id: 2,
		type: "proposal",
		title: "Proposal viewed",
		description: "Your proposal for Senior Frontend Developer was viewed by the client.",
		time: "18m",
		read: false,
	},
	{
		id: 3,
		type: "contract",
		title: "Contract offer received",
		description: "Acme Studio sent you a new contract offer.",
		time: "1h",
		read: false,
	},
	{
		id: 4,
		type: "profile",
		title: "Profile activity",
		description: "Your profile appeared in 8 client searches this week.",
		time: "1d",
		read: true,
	},
]

function NotificationIcon({ type }: { type: NotificationType }) {
	switch (type) {
		case "message":
			return <MessageSquare className="size-4" />

		case "proposal":
			return <FileText className="size-4" />

		case "contract":
			return <BriefcaseBusiness className="size-4" />

		case "profile":
			return <UserRound className="size-4" />
	}
}

export function NotificationDropdown() {
	const [notifications, setNotifications] = useState(initialNotifications)

	const unreadCount = notifications.filter((notification) => !notification.read).length

	const markAsRead = (id: number) => {
		setNotifications((current) =>
			current.map((notification) =>
				notification.id === id
					? {
							...notification,
							read: true,
						}
					: notification,
			),
		)
	}

	const markAllAsRead = () => {
		setNotifications((current) =>
			current.map((notification) => ({
				...notification,
				read: true,
			})),
		)
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
					className="relative flex size-8 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant outline-none transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary/30"
				>
					<Bell className="size-[18px]" />

					{unreadCount > 0 && (
						<span
							aria-hidden="true"
							className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-error ring-2 ring-surface-container-lowest"
						/>
					)}
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				sideOffset={8}
				className="w-[380px] max-w-[calc(100vw-24px)] rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-1.5 shadow-xl"
			>
				{/* Header */}
				<div className="flex items-center justify-between gap-4 px-3.5 py-3">
					<div className="min-w-0">
						<div className="flex items-center gap-2">
							<h2 className="font-label-md font-semibold text-label-md text-on-surface">Notifications</h2>

							{unreadCount > 0 && (
								<span className="rounded-full bg-primary/10 px-2 py-0.5 font-caption text-[10px] text-primary">
									{unreadCount} new
								</span>
							)}
						</div>

						<p className="mt-0.5 font-caption text-caption text-on-surface-variant">Workspace activity and updates</p>
					</div>

					{unreadCount > 0 && (
						<button
							type="button"
							onClick={markAllAsRead}
							className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 font-caption text-caption text-primary transition-colors hover:bg-surface-container"
						>
							<CheckCheck className="size-3.5" />
							<span className="hidden sm:inline">Mark all read</span>
						</button>
					)}
				</div>

				<DropdownMenuSeparator className="mx-2 my-0 bg-outline-variant/50" />

				{/* Notifications */}
				<div className="max-h-[420px] overflow-y-auto p-1.5">
					{notifications.length > 0 ? (
						notifications.map((notification) => (
							<DropdownMenuItem
								key={notification.id}
								onSelect={(event) => {
									event.preventDefault()

									markAsRead(notification.id)
								}}
								className={cn(
									"group relative mb-1 cursor-pointer items-start gap-3 rounded-lg px-3 py-3 outline-none focus:bg-surface-container",
									!notification.read && "bg-surface-container-low",
								)}
							>
								{/* Icon */}
								<span
									className={cn(
										"mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg",
										notification.read ? "bg-surface-container text-on-surface-variant" : "bg-primary/10 text-primary",
									)}
								>
									<NotificationIcon type={notification.type} />
								</span>

								{/* Content */}
								<span className="min-w-0 flex-1">
									<span className="flex items-start justify-between gap-3">
										<span
											className={cn(
												"truncate text-[13px] text-on-surface",
												notification.read ? "font-medium" : "font-semibold",
											)}
										>
											{notification.title}
										</span>

										<span className="shrink-0 font-caption text-[10px] text-outline">{notification.time}</span>
									</span>

									<span className="mt-1 line-clamp-2 block font-caption text-[11px] leading-4 text-on-surface-variant">
										{notification.description}
									</span>
								</span>

								{/* Unread */}
								{!notification.read && (
									<span aria-label="Unread" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
								)}
							</DropdownMenuItem>
						))
					) : (
						<div className="px-5 py-10 text-center">
							<span className="mx-auto grid size-11 place-items-center rounded-xl bg-surface-container text-on-surface-variant">
								<Bell className="size-5" />
							</span>

							<p className="mt-3 font-label-md font-medium text-on-surface">You're all caught up</p>

							<p className="mt-1 font-caption text-caption text-on-surface-variant">
								New notifications will appear here.
							</p>
						</div>
					)}
				</div>

				{/* <DropdownMenuSeparator className="mx-2 my-0 bg-outline-variant/50" /> */}

				{/* Footer */}
				{/* <div className="p-1.5">
					<button
						type="button"
						className="flex min-h-9 w-full items-center justify-center rounded-lg font-label-md font-medium text-label-md text-primary transition-colors hover:bg-surface-container"
					>
						View all notifications
					</button>
				</div> */}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
