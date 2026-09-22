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
		title: "New message from Sarah",
		description: "She sent you a message about the React dashboard project.",
		time: "2m",
		read: false,
	},
	{
		id: 2,
		type: "contract",
		title: "Contract offer received",
		description: "Acme Studio sent you an offer for the Mobile App Redesign project.",
		time: "1h",
		read: false,
	},
	{
		id: 3,
		type: "profile",
		title: "Your profile is getting noticed",
		description: "You appeared in 8 client searches this week.",
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
				className="w-[390px] max-w-[calc(100vw-20px)] overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-0 shadow-xl dark:border-border-subtle dark:bg-surface-panel"
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
				<div className="max-h-[410px] overflow-y-auto px-1.5 pb-1.5">
					{notifications.length > 0 ? (
						notifications.map((notification) => (
							<DropdownMenuItem
								key={notification.id}
								onSelect={(event) => {
									event.preventDefault()
									markAsRead(notification.id)
								}}
								className={cn(
									"group relative flex cursor-pointer items-start gap-3 rounded-lg px-3 py-3 my-1 outline-none transition-colors focus:bg-surface-container",
									!notification.read && "bg-primary/[0.035] dark:bg-primary/[0.055]",
								)}
							>
								{/* Unread marker */}
								{!notification.read && (
									<span aria-hidden="true" className="absolute top-3 bottom-3 left-0 w-0.5 rounded-full bg-primary" />
								)}

								{/* Icon */}
								<span
									className={cn(
										"grid size-8 shrink-0 place-items-center rounded-lg border transition-colors",
										notification.read
											? "border-outline-variant bg-surface-container-low text-on-surface-variant dark:border-border-subtle dark:bg-surface-container"
											: "border-primary/15 bg-primary/8 text-primary dark:border-primary/20 dark:bg-primary/10",
									)}
								>
									<NotificationIcon type={notification.type} />
								</span>

								{/* Body */}
								<span className="min-w-0 flex-1">
									<span className="flex items-start justify-between gap-3">
										<span
											className={cn(
												"min-w-0 truncate font-label-sm text-label-sm text-on-surface",
												notification.read ? "font-medium" : "font-semibold",
											)}
										>
											{notification.title}
										</span>

										<span className="mt-0.5 shrink-0 font-caption text-[10px] text-outline">{notification.time}</span>
									</span>

									<span className="mt-1 line-clamp-2 block font-body-sm text-[11px] text-on-surface-variant leading-[17px]">
										{notification.description}
									</span>
								</span>

								{/* Unread dot */}
								{!notification.read && (
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
