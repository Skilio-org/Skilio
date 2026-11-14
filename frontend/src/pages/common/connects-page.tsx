import { Link } from "@tanstack/react-router"
import { Inbox, Search, Send, Users, X } from "lucide-react"
import { useState } from "react"
import type { ConnectionPublic } from "@/client"
import { ConnectionCard, ReceivedRequestCard, SentRequestCard } from "@/components/connections/connection-cards"
import { RemoveConnectionDialog } from "@/components/connections/remove-connection-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header"
import { useAccountRole } from "@/hooks/useAccountRole"
import useAuth from "@/hooks/useAuth"
import {
	useAcceptConnectionRequest,
	useConnections,
	useDeclineConnectionRequest,
	useRemoveConnection,
	useWithdrawConnectionRequest,
} from "@/hooks/useConnections"

type TabType = "network" | "received" | "sent"

const MEMBER_FALLBACK = "Platform Member"

// Does the search text appear in the person's name, the job title or the note?
function matchesSearch(search: string, name: string | null | undefined, connection: ConnectionPublic) {
	const text = `${name || MEMBER_FALLBACK} ${connection.job_post?.title ?? ""} ${connection.note ?? ""}`
	return text.toLowerCase().includes(search.toLowerCase())
}

// Clients look for talent; freelancers look for work (the talent page is not available to freelancers).
function FindLink({ role, className }: { role: ReturnType<typeof useAccountRole>; className: string }) {
	return role === "client" ? (
		<Link to="/talent" search={{ q: undefined, category: undefined }} className={className}>
			<Search className="size-4" />
			<span>Find talent</span>
		</Link>
	) : (
		<Link to="/freelancer-jobs" search={{ q: undefined }} className={className}>
			<Search className="size-4" />
			<span>Find work</span>
		</Link>
	)
}

export function ConnectsPage() {
	const { user } = useAuth()
	const role = useAccountRole()

	const accepted = useConnections({ role, status: "accepted", direction: "all" })
	const received = useConnections({ role, status: "pending", direction: "received" })
	const sent = useConnections({ role, status: "pending", direction: "sent" })

	const acceptMutation = useAcceptConnectionRequest()
	const declineMutation = useDeclineConnectionRequest()
	const withdrawMutation = useWithdrawConnectionRequest()
	const removeMutation = useRemoveConnection()

	const [activeTab, setActiveTab] = useState<TabType>("network")
	const [searchQuery, setSearchQuery] = useState("")
	const [connToRemove, setConnToRemove] = useState<ConnectionPublic | null>(null)

	const acceptedList = accepted.data?.data ?? []
	const receivedList = received.data?.data ?? []
	const sentList = sent.data?.data ?? []

	const acceptedCount = accepted.data?.count ?? acceptedList.length
	const receivedCount = received.data?.count ?? receivedList.length
	const sentCount = sent.data?.count ?? sentList.length

	const search = searchQuery.trim()
	const partnerOf = (conn: ConnectionPublic) => (conn.sender_id === user?.id ? conn.receiver : conn.sender)
	const filteredAccepted = acceptedList.filter((conn) => matchesSearch(search, partnerOf(conn)?.full_name, conn))
	const filteredReceived = receivedList.filter((conn) => matchesSearch(search, conn.sender?.full_name, conn))
	const filteredSent = sentList.filter((conn) => matchesSearch(search, conn.receiver?.full_name, conn))

	const tabs = [
		{ id: "network" as const, label: "My connections", count: acceptedCount },
		{ id: "received" as const, label: "Received requests", count: receivedCount },
		{ id: "sent" as const, label: "Sent inquiries", count: sentCount },
	]
	const activeListLength =
		activeTab === "network" ? acceptedList.length : activeTab === "received" ? receivedList.length : sentList.length

	const clearFilterButton = (
		<button type="button" onClick={() => setSearchQuery("")} className={workspaceStyles.secondaryAction}>
			Clear filter
		</button>
	)

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 md:px-6">
			<WorkspacePageHeader
				eyebrow={`${role === "client" ? "Client" : "Freelancer"} workspace`}
				title="Connections"
				description="Manage verified partnerships, review incoming collaboration requests, and connect with professionals."
				meta={
					<span className="font-medium text-link">
						{acceptedCount} {acceptedCount === 1 ? "connection" : "connections"}
						{receivedCount > 0 && ` · ${receivedCount} awaiting your reply`}
					</span>
				}
				action={<FindLink role={role} className={workspaceStyles.primaryAction} />}
			/>

			<nav
				aria-label="Connection tabs"
				className="-mx-4 flex gap-3 overflow-x-auto border-outline-variant border-b px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:gap-6 sm:px-0"
			>
				{tabs.map((t) => (
					<button
						key={t.id}
						type="button"
						onClick={() => setActiveTab(t.id)}
						aria-pressed={activeTab === t.id}
						className={`min-h-11 shrink-0 border-b-2 px-1 font-medium text-sm transition-colors whitespace-nowrap sm:min-h-12 ${activeTab === t.id ? "border-primary text-link" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
					>
						{t.label} <span className="ml-1 text-xs">{t.count}</span>
					</button>
				))}
			</nav>

			{activeListLength > 0 && (
				<label className="flex min-h-11 items-center gap-2.5 rounded-lg border border-input bg-surface-container-lowest px-3.5 sm:min-h-12 sm:gap-3 sm:px-4">
					<Search className="size-4 shrink-0 text-on-surface-variant" />
					<input
						type="text"
						aria-label="Filter connections"
						placeholder="Filter by name, role, or job"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="min-w-0 flex-1 bg-transparent text-sm outline-none"
					/>
					{searchQuery && (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							aria-label="Clear filter"
							className="rounded p-0.5 text-on-surface-variant hover:text-on-surface"
						>
							<X className="size-3.5" />
						</button>
					)}
				</label>
			)}

			{activeTab === "network" && (
				<section aria-label="Connected Network" className="space-y-4">
					{accepted.isLoading ? (
						<p className="py-16 text-center font-label-md text-on-surface-variant text-sm">
							Loading your connections...
						</p>
					) : filteredAccepted.length === 0 ? (
						<EmptyState
							icon={Users}
							title={searchQuery ? "No matching connections found" : "No active connections yet"}
							description={
								searchQuery
									? `No connections match "${searchQuery}". Try searching for another name, role, or project.`
									: "Connect directly with verified clients and specialists to unlock direct messaging, shared proposals, and collaboration."
							}
							action={
								searchQuery ? clearFilterButton : <FindLink role={role} className={workspaceStyles.secondaryAction} />
							}
						/>
					) : (
						<div className="grid gap-3 sm:gap-4 md:grid-cols-2">
							{filteredAccepted.map((conn) => (
								<ConnectionCard
									key={conn.id}
									connection={conn}
									userId={user?.id}
									messagesPath={role === "freelancer" ? "/freelancer-messages" : "/messages"}
									onRemove={setConnToRemove}
								/>
							))}
						</div>
					)}
				</section>
			)}

			{activeTab === "received" && (
				<section aria-label="Received connection requests" className="space-y-4">
					{received.isLoading ? (
						<p className="py-16 text-center font-label-md text-on-surface-variant text-sm">
							Loading incoming requests...
						</p>
					) : filteredReceived.length === 0 ? (
						<EmptyState
							icon={Inbox}
							title={searchQuery ? "No matching incoming requests" : "No pending requests awaiting your response"}
							description={
								searchQuery
									? `No requests match "${searchQuery}". Clear your search filter to see all incoming inquiries.`
									: "When other verified members request to connect with you, their requests will appear here for your review."
							}
							action={searchQuery && clearFilterButton}
						/>
					) : (
						<div className="space-y-3">
							{filteredReceived.map((conn) => (
								<ReceivedRequestCard
									key={conn.id}
									connection={conn}
									busy={acceptMutation.isPending || declineMutation.isPending}
									onAccept={() => acceptMutation.mutate(conn.id)}
									onDecline={() => declineMutation.mutate(conn.id)}
								/>
							))}
						</div>
					)}
				</section>
			)}

			{activeTab === "sent" && (
				<section aria-label="Sent connection inquiries" className="space-y-4">
					{sent.isLoading ? (
						<p className="py-16 text-center font-label-md text-on-surface-variant text-sm">Loading sent inquiries...</p>
					) : filteredSent.length === 0 ? (
						<EmptyState
							icon={Send}
							title={searchQuery ? "No matching sent inquiries" : "No pending sent requests"}
							description={
								searchQuery
									? `No sent inquiries match "${searchQuery}". Clear your search filter to see all.`
									: "You haven't sent any pending connection inquiries. Discover professionals through job posts and member profiles."
							}
							action={
								searchQuery ? clearFilterButton : <FindLink role={role} className={workspaceStyles.secondaryAction} />
							}
						/>
					) : (
						<div className="space-y-3">
							{filteredSent.map((conn) => (
								<SentRequestCard
									key={conn.id}
									connection={conn}
									busy={withdrawMutation.isPending}
									onWithdraw={() => withdrawMutation.mutate(conn.id)}
								/>
							))}
						</div>
					)}
				</section>
			)}

			<RemoveConnectionDialog
				personName={connToRemove ? (partnerOf(connToRemove)?.full_name ?? "this member") : null}
				isRemoving={removeMutation.isPending}
				onClose={() => setConnToRemove(null)}
				onConfirm={() => {
					if (connToRemove) removeMutation.mutate(connToRemove.id)
					setConnToRemove(null)
				}}
			/>
		</div>
	)
}
