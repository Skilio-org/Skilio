import { createFileRoute, Link } from "@tanstack/react-router"
import { Briefcase, Check, Inbox, MessageSquare, Search, Send, UserCheck, UserMinus, Users, X } from "lucide-react"
import { useMemo, useState } from "react"
import { WorkspacePageHeader, WorkspaceSurface, workspaceStyles } from "@/components/dashboard/dashboard-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	useAcceptConnectionRequest,
	useConnections,
	useDeclineConnectionRequest,
	useRemoveConnection,
	useWithdrawConnectionRequest,
} from "@/hooks/useConnections"
import type { ConnectionPublic } from "@/client"
import useAuth from "@/hooks/useAuth"
import { useAccountRole } from "@/hooks/useAccountRole"
import { accountAvatarUrl } from "@/hooks/useAccountAvatar"
import { getInitials } from "@/utils"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_layout/connects")({
	component: ConnectsPage,
	head: () => ({
		meta: [
			{ title: "Connections & Network | Skilio" },
			{
				name: "description",
				content:
					"Manage verified partnerships, respond to collaboration requests, and unlock direct messaging on Skilio.",
			},
		],
	}),
})

type TabType = "network" | "received" | "sent"

function ConnectsPage() {
	const { user } = useAuth()
	const role = useAccountRole()

	// Queries for connections
	const { data: acceptedConnections, isLoading: loadingAccepted } = useConnections({
		status: "accepted",
		direction: "all",
	})

	const { data: receivedRequests, isLoading: loadingReceived } = useConnections({
		status: "pending",
		direction: "received",
	})

	const { data: sentRequests, isLoading: loadingSent } = useConnections({
		status: "pending",
		direction: "sent",
	})

	// Mutations
	const acceptMutation = useAcceptConnectionRequest()
	const declineMutation = useDeclineConnectionRequest()
	const withdrawMutation = useWithdrawConnectionRequest()
	const removeMutation = useRemoveConnection()

	// Local state
	const [activeTab, setActiveTab] = useState<TabType>("network")
	const [searchQuery, setSearchQuery] = useState("")
	const [connToRemove, setConnToRemove] = useState<ConnectionPublic | null>(null)

	// Normalized lists and counts
	const acceptedList = acceptedConnections?.data ?? []
	const receivedList = receivedRequests?.data ?? []
	const sentList = sentRequests?.data ?? []

	const acceptedCount = acceptedConnections?.count ?? acceptedList.length
	const receivedCount = receivedRequests?.count ?? receivedList.length
	const sentCount = sentRequests?.count ?? sentList.length

	// Realtime search filtering without exposing IDs
	const filteredAccepted = useMemo(() => {
		if (!searchQuery.trim()) return acceptedList
		const q = searchQuery.toLowerCase()
		return acceptedList.filter((conn) => {
			const partner = conn.sender_id === user?.id ? conn.receiver : conn.sender
			const name = partner?.full_name || "Platform Member"
			const jobTitle = conn.job_post?.title || ""
			const note = conn.note || ""
			return name.toLowerCase().includes(q) || jobTitle.toLowerCase().includes(q) || note.toLowerCase().includes(q)
		})
	}, [acceptedList, searchQuery, user?.id])

	const filteredReceived = useMemo(() => {
		if (!searchQuery.trim()) return receivedList
		const q = searchQuery.toLowerCase()
		return receivedList.filter((conn) => {
			const senderName = conn.sender?.full_name || "Platform Member"
			const jobTitle = conn.job_post?.title || ""
			const note = conn.note || ""
			return (
				senderName.toLowerCase().includes(q) || jobTitle.toLowerCase().includes(q) || note.toLowerCase().includes(q)
			)
		})
	}, [receivedList, searchQuery])

	const filteredSent = useMemo(() => {
		if (!searchQuery.trim()) return sentList
		const q = searchQuery.toLowerCase()
		return sentList.filter((conn) => {
			const receiverName = conn.receiver?.full_name || "Platform Member"
			const jobTitle = conn.job_post?.title || ""
			const note = conn.note || ""
			return (
				receiverName.toLowerCase().includes(q) || jobTitle.toLowerCase().includes(q) || note.toLowerCase().includes(q)
			)
		})
	}, [sentList, searchQuery])

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4  md:px-6">
			{/* Page Header matching Skilio workspace standard */}
			<WorkspacePageHeader
				eyebrow="Network & Collaboration"
				title="Connections"
				description="Manage verified partnerships, review incoming collaboration requests, and connect with professionals across Skilio."
				meta={<span className="font-medium text-primary">Direct Messaging Unlocked</span>}
				action={
					<Link to="/talent" search={{ q: undefined, category: undefined }} className={workspaceStyles.primaryAction}>
						<Search className="size-4" />
						<span>{role === "client" ? "Explore Freelancer Talent" : "Discover Verified Members"}</span>
					</Link>
				}
			/>

			{/* Interactive Metric Overview Cards (Clickable Category Selectors) */}
			{/* <section aria-label="Connection metrics overview" className="grid gap-3 sm:gap-4 sm:grid-cols-3">
				1. Connected Network Card
				<button
					type="button"
					onClick={() => setActiveTab("network")}
					aria-pressed={activeTab === "network"}
					className={cn(
						"group relative flex flex-col justify-between rounded-xl border p-5 text-left transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary",
						activeTab === "network"
							? "border-primary/60 bg-surface-container-low/50 shadow-xs ring-1 ring-primary/30 dark:border-primary/50"
							: "border-outline-variant bg-surface-container-lowest hover:border-outline hover:bg-surface-container-low/30"
					)}
				>
					<div className="flex items-center justify-between gap-2">
						<span className="font-caption text-caption font-semibold tracking-wider uppercase text-on-surface-variant">
							Connected Network
						</span>
						<div
							className={cn(
								"grid size-8 place-items-center rounded-lg transition-colors",
								activeTab === "network"
									? "bg-primary text-primary-foreground dark:bg-on-surface dark:text-background"
									: "bg-primary/10 text-primary"
							)}
						>
							<Users className="size-4" />
						</div>
					</div>
					<div className="mt-4">
						<div className="font-headline-xl text-3xl font-bold tracking-tight text-on-surface tabular-nums">
							{loadingAccepted ? "—" : acceptedCount}
						</div>
						<div className="mt-1 flex items-center gap-1.5 font-caption text-caption text-on-surface-variant">
							<span className="inline-block size-2 rounded-full bg-emerald-500" />
							<span>Direct messaging unlocked</span>
						</div>
					</div>
				</button>

				2. Received Requests Card
				<button
					type="button"
					onClick={() => setActiveTab("received")}
					aria-pressed={activeTab === "received"}
					className={cn(
						"group relative flex flex-col justify-between rounded-xl border p-5 text-left transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary",
						activeTab === "received"
							? "border-amber-500/60 bg-surface-container-low/50 shadow-xs ring-1 ring-amber-500/30 dark:border-amber-500/50"
							: "border-outline-variant bg-surface-container-lowest hover:border-outline hover:bg-surface-container-low/30"
					)}
				>
					<div className="flex items-center justify-between gap-2">
						<span className="font-caption text-caption font-semibold tracking-wider uppercase text-on-surface-variant">
							Received Requests
						</span>
						<div
							className={cn(
								"grid size-8 place-items-center rounded-lg transition-colors",
								activeTab === "received"
									? "bg-amber-500 text-white"
									: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
							)}
						>
							<Inbox className="size-4" />
						</div>
					</div>
					<div className="mt-4">
						<div className="font-headline-xl text-3xl font-bold tracking-tight text-on-surface tabular-nums">
							{loadingReceived ? "—" : receivedCount}
						</div>
						<div className="mt-1 flex items-center gap-1.5 font-caption text-caption text-on-surface-variant">
							{receivedCount > 0 ? (
								<span className="inline-block size-2 rounded-full bg-amber-500 animate-pulse" />
							) : (
								<Clock3 className="size-3 text-on-surface-variant" />
							)}
							<span>{receivedCount > 0 ? "Awaiting your response" : "No pending requests"}</span>
						</div>
					</div>
				</button>

				3. Sent Inquiries Card
				<button
					type="button"
					onClick={() => setActiveTab("sent")}
					aria-pressed={activeTab === "sent"}
					className={cn(
						"group relative flex flex-col justify-between rounded-xl border p-5 text-left transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary",
						activeTab === "sent"
							? "border-sky-500/60 bg-surface-container-low/50 shadow-xs ring-1 ring-sky-500/30 dark:border-sky-500/50"
							: "border-outline-variant bg-surface-container-lowest hover:border-outline hover:bg-surface-container-low/30"
					)}
				>
					<div className="flex items-center justify-between gap-2">
						<span className="font-caption text-caption font-semibold tracking-wider uppercase text-on-surface-variant">
							Sent Inquiries
						</span>
						<div
							className={cn(
								"grid size-8 place-items-center rounded-lg transition-colors",
								activeTab === "sent" ? "bg-sky-500 text-white" : "bg-sky-500/10 text-sky-600 dark:text-sky-400"
							)}
						>
							<Send className="size-4" />
						</div>
					</div>
					<div className="mt-4">
						<div className="font-headline-xl text-3xl font-bold tracking-tight text-on-surface tabular-nums">
							{loadingSent ? "—" : sentCount}
						</div>
						<div className="mt-1 flex items-center gap-1.5 font-caption text-caption text-on-surface-variant">
							<span className="inline-block size-2 rounded-full bg-sky-500" />
							<span>Pending recipient review</span>
						</div>
					</div>
				</button>
			</section> */}

			{/* Unified Tab Navigation Bar (Matches Skilio's Dashboard & Proposals Tabbing) */}

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-outline-variant border-b">
				{/* <nav aria-label="Job status" className="">
				{["All jobs", "Draft", "Open", "Closed"].map((status) => (
					<button
						type="button"
						key={status}
						onClick={() => onTabChange(status)}
						aria-pressed={tab === status}
						>
						{status}{" "}
						<span className="ml-1 text-xs">
							{jobs.filter((job) => status === "All jobs" || job.status === status).length}
						</span>
					</button>
				))}
			</nav> */}
				<nav aria-label="Connection tabs" className="flex gap-6 overflow-x-auto">
					{[
						{ id: "network" as const, label: "My Connections", icon: Users, count: acceptedCount },
						{
							id: "received" as const,
							label: "Received Requests",
							icon: Inbox,
							count: receivedCount,
							isAlert: receivedCount > 0,
						},
						{ id: "sent" as const, label: "Sent Inquiries", icon: Send, count: sentCount },
					].map((t) => {
						const active = activeTab === t.id

						return (
							<button
								key={t.id}
								type="button"
								onClick={() => setActiveTab(t.id)}
								aria-pressed={active}
								className={`min-h-12 shrink-0 border-b-2 px-1 font-medium text-sm flex flex-row items-center ${active ? "border-primary text-primary" : "border-transparent text-on-surface-variant"}`}
							>
								<span className="m-2">{t.label}</span>
								<span className="text-xs">
									<span className="ml-1 text-xs">{t.count}</span>
								</span>
							</button>
						)
					})}
				</nav>
			</div>
			{/* Instant Search Filter */}
			<label className="flex min-h-12 items-center gap-3 rounded-lg border border-input bg-surface-container-lowest px-4">
				<Search className="size-4 text-on-surface-variant" />
				<input
					type="text"
					aria-label="Search your jobs"
					placeholder="Filter by name, role or job..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="min-w-0 flex-1 bg-transparent text-sm outline-none"
				/>
				{searchQuery && (
					<button
						type="button"
						onClick={() => setSearchQuery("")}
						aria-label="Clear filter"
						className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-on-surface-variant hover:text-on-surface"
					>
						<X className="size-3.5" />
					</button>
				)}
			</label>

			{/* TAB CONTENT: TAB 1 - ACTIVE CONNECTIONS */}
			{activeTab === "network" && (
				<section aria-label="Connected Network" className="space-y-4">
					{loadingAccepted ? (
						<div className="py-16 text-center">
							<p className="font-label-md text-sm text-on-surface-variant">Loading your connections...</p>
						</div>
					) : filteredAccepted.length === 0 ? (
						<WorkspaceSurface className="flex flex-col items-center justify-center p-12 text-center">
							<div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary mb-3">
								<Users className="size-6" />
							</div>
							<h3 className="font-headline-sm font-semibold text-lg text-on-surface">
								{searchQuery ? "No matching connections found" : "No active connections yet"}
							</h3>
							<p className="mt-1.5 max-w-md font-body-md text-sm text-on-surface-variant leading-relaxed">
								{searchQuery
									? `No connections match "${searchQuery}". Try searching for another name, role, or project.`
									: "Connect directly with verified clients and specialists to unlock direct messaging, shared proposals, and collaboration."}
							</p>
							<div className="mt-5 flex flex-wrap gap-2.5">
								{searchQuery ? (
									<Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
										Clear Filter
									</Button>
								) : (
									<Link
										to="/talent"
										search={{ q: undefined, category: undefined }}
										className={workspaceStyles.primaryAction}
									>
										<Search className="size-4" />
										<span>Browse Verified Members</span>
									</Link>
								)}
							</div>
						</WorkspaceSurface>
					) : (
						<div className="grid gap-4 md:grid-cols-2">
							{filteredAccepted.map((conn) => {
								const partner = conn.sender_id === user?.id ? conn.receiver : conn.sender
								const partnerName = partner?.full_name || "Platform Member"
								const partnerRole = partner?.active_role === "client" ? "Client" : "Specialist"
								const targetUserId = partner?.id || (conn.sender_id === user?.id ? conn.receiver_id : conn.sender_id)

								return (
									<Card
										key={conn.id}
										className="group rounded-xl border border-outline-variant bg-surface-container-lowest p-5 transition-all duration-150 hover:border-outline hover:shadow-xs"
									>
										<CardContent className="p-0 flex flex-col justify-between h-full gap-4">
											{/* Member Identity & Status */}
											<div className="flex items-start justify-between gap-3">
												<div className="flex items-start gap-3.5 min-w-0">
													<div className="relative shrink-0">
														<Avatar className="size-11 rounded-lg border border-outline-variant bg-surface-container">
															<AvatarImage
																src={accountAvatarUrl(targetUserId)}
																alt={partnerName}
																className="object-cover"
															/>
															<AvatarFallback className="rounded-lg bg-surface-container font-label-md font-semibold text-label-md text-on-surface">
																{getInitials(partnerName)}
															</AvatarFallback>
														</Avatar>
														<span
															aria-hidden="true"
															className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-surface-container-lowest bg-emerald-500"
														/>
													</div>

													<div className="min-w-0 flex-1">
														<div className="flex flex-wrap items-center gap-2">
															<h4 className="font-headline-sm font-semibold text-base text-on-surface truncate">
																{partnerName}
															</h4>
															<Badge
																variant="outline"
																className="bg-primary/10 text-primary border-primary/30 text-[10px] font-medium gap-1"
															>
																<UserCheck className="size-3" />
																Connected
															</Badge>
														</div>

														<p className="mt-0.5 text-xs text-on-surface-variant font-medium">{partnerRole}</p>

														{conn.job_post && (
															<div className="mt-1.5 flex items-center gap-1.5 text-xs text-on-surface-variant">
																<Briefcase className="size-3.5 text-primary shrink-0" />
																<span className="truncate">{conn.job_post.title}</span>
															</div>
														)}
													</div>
												</div>

												{/* Disconnect Button (triggers confirmation dialog) */}
												<button
													type="button"
													onClick={() => setConnToRemove(conn)}
													title={`Remove connection with ${partnerName}`}
													className="grid size-8 shrink-0 place-items-center rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant/70 transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
												>
													<UserMinus className="size-4" />
												</button>
											</div>

											{/* Optional Connection Note */}
											{conn.note && (
												<div className="rounded-lg border border-outline-variant/50 bg-surface-container-low/40 p-2.5 text-xs text-on-surface-variant italic leading-relaxed">
													"{conn.note}"
												</div>
											)}

											{/* Action Footer */}
											<div className="flex items-center justify-between border-t border-outline-variant/60 pt-3 text-xs text-on-surface-variant">
												<span className="font-caption text-caption flex items-center gap-1.5">
													<span className="size-1.5 rounded-full bg-emerald-500" />
													Collaboration unlocked
												</span>

												<Link
													to={role === "freelancer" ? "/freelancer-messages" : "/messages"}
													search={{ userId: targetUserId }}
													className={cn(workspaceStyles.primaryAction, "h-8 px-3 text-xs gap-1.5")}
												>
													<MessageSquare className="size-3.5" />
													<span>Message</span>
												</Link>
											</div>
										</CardContent>
									</Card>
								)
							})}
						</div>
					)}
				</section>
			)}

			{/* TAB CONTENT: TAB 2 - RECEIVED REQUESTS */}
			{activeTab === "received" && (
				<section aria-label="Received connection requests" className="space-y-4">
					{loadingReceived ? (
						<div className="py-16 text-center">
							<p className="font-label-md text-sm text-on-surface-variant">Loading incoming requests...</p>
						</div>
					) : filteredReceived.length === 0 ? (
						<WorkspaceSurface className="flex flex-col items-center justify-center p-12 text-center">
							<div className="grid size-12 place-items-center rounded-full bg-amber-500/10 text-amber-500 mb-3">
								<Inbox className="size-6" />
							</div>
							<h3 className="font-headline-sm font-semibold text-lg text-on-surface">
								{searchQuery ? "No matching incoming requests" : "No pending requests awaiting your response"}
							</h3>
							<p className="mt-1.5 max-w-md font-body-md text-sm text-on-surface-variant leading-relaxed">
								{searchQuery
									? `No requests match "${searchQuery}". Clear your search filter to see all incoming inquiries.`
									: "When other verified members request to connect with you, their requests will appear here for your review."}
							</p>
							{searchQuery && (
								<Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="mt-4">
									Clear Filter
								</Button>
							)}
						</WorkspaceSurface>
					) : (
						<div className="space-y-3">
							{filteredReceived.map((conn) => {
								const senderName = conn.sender?.full_name || "Platform Member"
								const senderRole = conn.sender?.active_role === "client" ? "Client" : "Specialist"
								const senderId = conn.sender?.id || conn.sender_id

								return (
									<Card
										key={conn.id}
										className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 transition-all duration-150 hover:border-outline"
									>
										<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
											{/* Sender Info & Request Note */}
											<div className="flex items-start gap-3.5 min-w-0">
												<Avatar className="size-11 shrink-0 rounded-lg border border-outline-variant bg-surface-container">
													<AvatarImage src={accountAvatarUrl(senderId)} alt={senderName} className="object-cover" />
													<AvatarFallback className="rounded-lg bg-surface-container font-label-md font-semibold text-label-md text-on-surface">
														{getInitials(senderName)}
													</AvatarFallback>
												</Avatar>

												<div className="min-w-0 space-y-1">
													<div className="flex flex-wrap items-center gap-2">
														<h4 className="font-headline-sm font-semibold text-base text-on-surface">{senderName}</h4>
														<Badge
															variant="outline"
															className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]"
														>
															Pending Request
														</Badge>
													</div>

													<p className="text-xs text-on-surface-variant font-medium">
														{senderRole} • Wants to connect with you
													</p>

													{conn.job_post && (
														<div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-1">
															<Briefcase className="size-3.5 shrink-0" />
															<span className="truncate">Referencing Project: {conn.job_post.title}</span>
														</div>
													)}

													{conn.note && (
														<div className="mt-2 text-xs rounded-lg border border-outline-variant/60 bg-surface-container-low/40 p-2.5 text-on-surface leading-relaxed max-w-2xl italic">
															"{conn.note}"
														</div>
													)}
												</div>
											</div>

											{/* Symmetrical Action Buttons (Decline / Accept) */}
											<div className="flex shrink-0 items-center gap-2.5 self-end md:self-center">
												<Button
													size="sm"
													variant="secondary"
													disabled={declineMutation.isPending || acceptMutation.isPending}
													onClick={() => declineMutation.mutate(conn.id)}
													className="h-8 min-w-[84px] items-center justify-center border border-outline-variant bg-surface-container-lowest gap-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 hover:border-destructive/30 rounded-lg transition-colors"
												>
													<X className="size-3.5" />
													<span>Decline</span>
												</Button>

												<Button
													size="sm"
													disabled={acceptMutation.isPending || declineMutation.isPending}
													onClick={() => acceptMutation.mutate(conn.id)}
													className="h-8 min-w-[84px] items-center justify-center border-0 border-none gap-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
												>
													<Check className="size-3.5" />
													<span>Accept</span>
												</Button>
											</div>
										</div>
									</Card>
								)
							})}
						</div>
					)}
				</section>
			)}

			{/* TAB CONTENT: TAB 3 - SENT INQUIRIES */}
			{activeTab === "sent" && (
				<section aria-label="Sent connection inquiries" className="space-y-4">
					{loadingSent ? (
						<div className="py-16 text-center">
							<p className="font-label-md text-sm text-on-surface-variant">Loading sent inquiries...</p>
						</div>
					) : filteredSent.length === 0 ? (
						<WorkspaceSurface className="flex flex-col items-center justify-center p-12 text-center">
							<div className="grid size-12 place-items-center rounded-full bg-sky-500/10 text-sky-500 mb-3">
								<Send className="size-6" />
							</div>
							<h3 className="font-headline-sm font-semibold text-lg text-on-surface">
								{searchQuery ? "No matching sent inquiries" : "No pending sent requests"}
							</h3>
							<p className="mt-1.5 max-w-md font-body-md text-sm text-on-surface-variant leading-relaxed">
								{searchQuery
									? `No sent inquiries match "${searchQuery}". Clear your search filter to see all.`
									: "You haven't sent any pending connection inquiries. Discover professionals through job posts and member profiles."}
							</p>
							<div className="mt-5">
								{searchQuery ? (
									<Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
										Clear Filter
									</Button>
								) : (
									<Link
										to="/talent"
										search={{ q: undefined, category: undefined }}
										className={workspaceStyles.secondaryAction}
									>
										<Search className="size-4" />
										<span>Browse Verified Members</span>
									</Link>
								)}
							</div>
						</WorkspaceSurface>
					) : (
						<div className="space-y-3">
							{filteredSent.map((conn) => {
								const receiverName = conn.receiver?.full_name || "Platform Member"
								const receiverId = conn.receiver?.id || conn.receiver_id

								return (
									<Card
										key={conn.id}
										className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 transition-all duration-150 hover:border-outline"
									>
										<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
											{/* Receiver Info */}
											<div className="flex items-start gap-3.5 min-w-0">
												<Avatar className="size-11 shrink-0 rounded-lg border border-outline-variant bg-surface-container">
													<AvatarImage src={accountAvatarUrl(receiverId)} alt={receiverName} className="object-cover" />
													<AvatarFallback className="rounded-lg bg-surface-container font-label-md font-semibold text-label-md text-on-surface">
														{getInitials(receiverName)}
													</AvatarFallback>
												</Avatar>

												<div className="min-w-0 space-y-1">
													<div className="flex flex-wrap items-center gap-2">
														<span className="font-headline-sm font-semibold text-base text-on-surface">
															Request to: {receiverName}
														</span>
														<Badge
															variant="outline"
															className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]"
														>
															Pending Review
														</Badge>
													</div>

													{conn.job_post && (
														<p className="text-xs text-on-surface-variant flex items-center gap-1.5">
															<Briefcase className="size-3.5 text-primary shrink-0" />
															<span>Project: {conn.job_post.title}</span>
														</p>
													)}

													{conn.note && (
														<p className="mt-1 text-xs text-on-surface-variant italic bg-surface-container-low/40 border border-outline-variant/60 rounded-lg p-2.5 max-w-xl">
															"{conn.note}"
														</p>
													)}
												</div>
											</div>

											{/* Withdraw Action */}
											<Button
												size="sm"
												variant="ghost"
												disabled={withdrawMutation.isPending}
												onClick={() => withdrawMutation.mutate(conn.id)}
												className="h-8 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs text-on-surface-variant hover:text-destructive hover:border-destructive/30 transition-colors self-end sm:self-center"
											>
												Withdraw
											</Button>
										</div>
									</Card>
								)
							})}
						</div>
					)}
				</section>
			)}

			{/* Confirmation Dialog for Removing a Connection (Safe UX, No raw IDs exposed) */}
			<Dialog open={Boolean(connToRemove)} onOpenChange={(open) => !open && setConnToRemove(null)}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							<UserMinus className="size-5" />
							<span>Remove Connection</span>
						</DialogTitle>
						<DialogDescription>
							Are you sure you want to remove your connection with{" "}
							<strong className="text-foreground">
								{connToRemove
									? connToRemove.sender_id === user?.id
										? connToRemove.receiver?.full_name || "this member"
										: connToRemove.sender?.full_name || "this member"
									: "this member"}
							</strong>
							? Direct messaging channels will be locked until a new connection is accepted.
						</DialogDescription>
					</DialogHeader>

					<DialogFooter className="mt-4 gap-2">
						<Button variant="outline" onClick={() => setConnToRemove(null)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							disabled={removeMutation.isPending}
							onClick={() => {
								if (connToRemove) {
									removeMutation.mutate(connToRemove.id)
									setConnToRemove(null)
								}
							}}
						>
							{removeMutation.isPending ? "Removing..." : "Remove Connection"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
