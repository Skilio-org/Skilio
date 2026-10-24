import { Link } from "@tanstack/react-router"
import { Bell, Bookmark, Check, ChevronRight, MessageSquare, Sparkles } from "lucide-react"
import { useState } from "react"

import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header"

const notifications = [
	{
		icon: MessageSquare,
		title: "Maya Laurent replied to your message",
		detail: "“That sounds closely aligned with my recent work…”",
		time: "12 minutes ago",
		unread: true,
		href: "/messages" as const,
	},
	{
		icon: Sparkles,
		title: "18 new profiles match your saved search",
		detail: "Senior product designers · Available this month",
		time: "2 hours ago",
		unread: true,
		href: "/talent" as const,
	},
	{
		icon: Bookmark,
		title: "Noah Williams is available now",
		detail: "A freelancer from your shortlist updated their availability.",
		time: "Yesterday",
		unread: false,
		href: "/saved" as const,
	},
	{
		icon: Check,
		title: "Your client profile is complete",
		detail: "You’re ready to message freelancers and build shortlists.",
		time: "3 days ago",
		unread: false,
		href: "/client-profile" as const,
	},
]

export function NotificationsPage() {
	const [allRead, setAllRead] = useState(false)

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4  md:px-6 ">
			<WorkspacePageHeader
				eyebrow="Client workspace / Activity"
				title="Notifications"
				description="Updates from your conversations, saved searches, and shortlist."
				action={
					<button
						type="button"
						onClick={() => setAllRead(true)}
						disabled={allRead}
						className={`${workspaceStyles.secondaryAction} disabled:pointer-events-none disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-700 disabled:opacity-100`}
					>
						{allRead && <Check className="size-4" />}
						{allRead ? "All read" : "Mark all as read"}
					</button>
				}
			/>
			<section className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
				{notifications.map((item) => (
					<Link
						key={item.title}
						to={item.href}
						className="group flex gap-4 border-outline-variant border-b p-5 transition-colors last:border-b-0 hover:bg-accent/50 sm:p-6"
					>
						<span
							className={`grid size-11 shrink-0 place-items-center rounded-full ${item.unread && !allRead ? "bg-brand-100 text-brand-700" : "bg-muted text-on-surface-variant"}`}
						>
							<item.icon className="size-5" />
						</span>
						<span className="min-w-0 flex-1">
							<span className="flex items-start gap-3">
								<strong className="text-foreground text-sm sm:text-base">{item.title}</strong>
								{item.unread && !allRead && (
									<span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />
								)}
							</span>
							<span className="mt-1 block text-on-surface-variant text-sm leading-6">{item.detail}</span>
							<span className="mt-2 block text-on-surface-variant text-xs">{item.time}</span>
						</span>
						<ChevronRight className="mt-3 size-4 shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
					</Link>
				))}
			</section>
			<div className="flex items-center justify-center gap-2 py-5 text-on-surface-variant text-sm">
				<Bell className="size-4" />
				You’re all caught up.
			</div>
		</div>
	)
}
