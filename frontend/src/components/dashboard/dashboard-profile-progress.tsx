import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Bookmark, MessageSquare, UserRound } from "lucide-react"
import { WorkspaceSurface } from "./dashboard-header"

export const ProfileProgress = () => (
	<WorkspaceSurface className="p-5">
		<h2 className="font-headline-sm font-semibold text-headline-sm text-on-surface">Set your project up for success</h2>
		<p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
			A few small steps toward a great collaboration.
		</p>
		<div className="mt-4 flex flex-col gap-3">
			{[
				{
					icon: UserRound,
					title: "Introduce yourself",
					detail: "Complete your client profile",
					to: "/client-profile",
				},
				{
					icon: Bookmark,
					title: "Build a shortlist",
					detail: "Keep your favorites together",
					to: "/saved",
				},
				{
					icon: MessageSquare,
					title: "Start a conversation",
					detail: "Talk through your project",
					to: "/messages",
				},
			].map(({ icon: Icon, ...item }) => (
				<Link
					key={item.title}
					to={item.to}
					className="group flex items-center gap-3 rounded-lg border border-outline-variant p-3 transition-colors hover:bg-surface-container-low"
				>
					<span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-on-surface-variant">
						<Icon className="size-4" />
					</span>
					<span className="min-w-0 flex-1">
						<span className="block font-label-sm font-medium text-label-sm text-on-surface">{item.title}</span>
						<span className="mt-0.5 block font-caption text-caption text-on-surface-variant">{item.detail}</span>
					</span>
					<ArrowUpRight className="size-3.5 text-on-surface-variant group-hover:text-link" />
				</Link>
			))}
		</div>
	</WorkspaceSurface>
)
