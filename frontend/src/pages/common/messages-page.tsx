import { useEffect, useState } from "react"
import { Search, SquarePen } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { getClientTheme } from "@/components/messages/message-types"
import { cn } from "@/lib/utils"
import { ConversationList } from "@/components/messages/conversation-list"
import { MessageThread } from "@/components/messages/message-thread"
import type { InboxFilter, ThreadMessage } from "@/components/messages/message-types"
import { clientConversations, clientIntroductions, demoClients } from "@/data/freelancer-demo"

const talentConversations = [
	{
		id: "maya-laurent",
		preview: "Could you send the main user flow and the screens you want prioritized?",
		time: "10:31",
		unread: 2,
	},
	{
		id: "noah-williams",
		preview: "The architecture notes are ready for your review.",
		time: "Yesterday",
		unread: 0,
	},
	{
		id: "amara-okafor",
		preview: "Your positioning brief gives me a clear direction.",
		time: "Mon",
		unread: 1,
	},
	{
		id: "elias-chen",
		preview: "I've outlined the automation and evaluation flow.",
		time: "Sep 4",
		unread: 0,
	},
]

function sampleThread(
	id: string,
	meta: typeof talentConversations,
	introductions: Record<string, string>,
): ThreadMessage[] {
	const conversation = meta.find((item) => item.id === id)
	if (!conversation) return []
	return [
		{
			id: `${id}-intro`,
			body:
				id === "olivia-bennett"
					? "Morning! We just reviewed the interactive prototype for the new user onboarding sequence. Overall, the typography hierarchy feels significantly crisper than our last iteration."
					: introductions[id],
			feedback:
				 id === "olivia-bennett"
					? [
							"Step 2 progress bar: The completion interaction is much more intuitive. Keep that easing curve.",
							"Contrast adjustment: Could we increase contrast on the secondary button? It looks washed out in bright light.",
							"Animation timing: Let's check the tooltip animation on slower connections before sign-off.",
						]
					: undefined,
			time: "10:24 AM",
			own: false,
		},
		{
			id: `${id}-reply`,
			// attachment:
			// 	clientMode && id === "olivia-bennett"
			// 		? {
			// 				name: "onboarding-handoff-notes.txt",
			// 				content:
			// 					"Onboarding handoff\n\nReview secondary button contrast.\nCheck tooltip animation on slower connections.\nPrepare the next prototype iteration for Thursday's review.",
			// 			}
			// 		: undefined,
			body: "Thanks for the notes! That aligns with my thinking. I’ll refine the secondary buttons, check the animation timing, and share the updated prototype for your review.",
			time: "10:28 AM",
			own: true,
		},
		{
			id: `${id}-latest`,
			body: conversation.preview,
			time: "10:31 AM",
			own: false,
		},
	]
}

export function MessagesPage({
	selectedContact,
	onSelectContact,
}: {
	selectedContact?: string
	onSelectContact: (id: string) => void
}) {
	const people = demoClients
	const meta = clientConversations 
	const introductions = clientIntroductions 
	const selected = people.find((person) => person.id === selectedContact)
	const selectedId = selected?.id ?? ""
	const [newMessageOpen, setNewMessageOpen] = useState(false)
	const [recipientQuery, setRecipientQuery] = useState("")
	const [query, setQuery] = useState("")
	const [filter, setFilter] = useState<InboxFilter>("all")
	const [drafts, setDrafts] = useState<Record<string, string>>({})
	const [sent, setSent] = useState<Record<string, ThreadMessage[]>>({})
	const [unread, setUnread] = useState<Record<string, number>>(() =>
		Object.fromEntries(meta.map((item) => [item.id, item.unread])),
	)
	const [archived, setArchived] = useState<string[]>([])
	const [addedIds, setAddedIds] = useState<string[]>([])
	useEffect(() => {
		if (!selectedId) return
		setUnread((current) => ({ ...current, [selectedId]: 0 }))
		if (!meta.some((item) => item.id === selectedId))
			setAddedIds((current) => (current.includes(selectedId) ? current : [...current, selectedId]))
	}, [selectedId, meta])
	const all = [
		...meta,
		...addedIds.map((id) => ({
			id,
			preview: "Start a conversation",
			time: "",
			unread: 0,
		})),
	]
	const unreadCount = all.reduce((count, item) => count + (archived.includes(item.id) ? 0 : (unread[item.id] ?? 0)), 0)
	const conversations = all
		.map((item) => {
			const outgoing = sent[item.id] ?? []
			const last = outgoing[outgoing.length - 1]
			const draft = drafts[item.id]?.trim()
			return {
				...item,
				preview: draft || (last ? `You: ${last.body}` : item.preview),
				time: last?.time ?? item.time,
				unread: unread[item.id] ?? 0,
				hasDraft: !!draft,
			}
		})
		.filter((item) => {
			const person = people.find((candidate) => candidate.id === item.id)
			if (!person) return false
			const matches = `${person.name} ${person.title} ${item.preview}`
				.toLowerCase()
				.includes(query.trim().toLowerCase())
			const isArchived = archived.includes(item.id)
			return matches && (filter === "archived" ? isArchived : !isArchived && (filter === "all" || item.unread > 0))
		})
	const messages = selectedId
		? [
				...sampleThread(selectedId, meta, introductions).slice(
					0,
					selectedId === "olivia-bennett" ? 2 : 3,
				),
				...(sent[selectedId] ?? []),
			]
		: []
	const draft = drafts[selectedId] ?? ""
	const select = (id: string) => {
		onSelectContact(id)
	}
	const updateDraft = (value: string) => setDrafts((current) => ({ ...current, [selectedId]: value }))
	const send = () => {
		if (!selectedId || !draft.trim()) return
		const message: ThreadMessage = {
			id: crypto.randomUUID(),
			body: draft.trim(),
			time: new Date().toLocaleTimeString([], {
				hour: "numeric",
				minute: "2-digit",
			}),
			own: true,
			local: true,
		}
		setSent((current) => ({
			...current,
			[selectedId]: [...(current[selectedId] ?? []), message],
		}))
		updateDraft("")
		setArchived((current) => current.filter((id) => id !== selectedId))
	}
	const archive = () => {
		const restoring = archived.includes(selectedId)
		setArchived((current) => (restoring ? current.filter((id) => id !== selectedId) : [...current, selectedId]))
		select("")
		toast.success(restoring ? "Conversation moved to inbox" : "Conversation archived")
	}
	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 py-8 md:px-6 md:py-10">
			<header className="flex flex-col gap-4 border-outline-variant border-b py-3 pb-8 md:flex-row md:items-end md:justify-between">
				<div className="flex max-w-2xl flex-col gap-4">
					<div className="flex flex-wrap items-center gap-2 font-caption text-caption">
						<span className="font-semibold text-on-surface-variant uppercase tracking-wider">Freelancer workspace</span>
						<span className="size-1 rounded-full bg-outline-variant" />
						<span className="flex items-center gap-1 font-medium text-primary">
							<span className="size-1.5 rounded-full bg-primary-container dark:bg-primary" />
							{unreadCount > 0
								? `${unreadCount} unread ${unreadCount === 1 ? "message" : "messages"}`
								: "Active communications"}
						</span>
					</div>
					<h1 className="font-headline-xl font-semibold text-headline-xl text-on-surface tracking-tight">Messages</h1>
					<p className="font-body-md text-body-md text-on-surface-variant">
						Manage client conversations, share design artifacts, and collaborate on active contracts.
					</p>
				</div>
				<div className="flex shrink-0 flex-wrap items-center gap-2.5">
					<button
						type="button"
						onClick={() => setNewMessageOpen(true)}
						className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
					>
						<SquarePen className="size-4" />
						New message
					</button>
				</div>
			</header>
			<Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
				<DialogContent className="max-w-md border-outline-variant bg-surface-container-lowest">
					<DialogHeader>
						<DialogTitle className="font-headline-sm font-semibold text-headline-sm text-on-surface">
							New message
						</DialogTitle>
						<DialogDescription className="font-body-sm text-body-sm text-on-surface-variant">
							Choose a client to start or continue a conversation.
						</DialogDescription>
					</DialogHeader>
					<div className="relative mt-2">
						<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
						<input
							aria-label="Find a recipient"
							value={recipientQuery}
							onChange={(e) => setRecipientQuery(e.target.value)}
							placeholder="Search clients…"
							className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-low pl-9 pr-3 font-body-sm text-body-sm text-on-surface outline-none transition-colors placeholder:text-outline focus:border-outline focus:ring-1 focus:ring-outline"
						/>
					</div>
					<div className="max-h-64 space-y-1 overflow-y-auto pt-2">
						{people
							.filter((person) => `${person.name} ${person.title}`.toLowerCase().includes(recipientQuery.toLowerCase()))
							.map((person) => {
								const theme = getClientTheme(person.id)
								return (
									<button
										key={person.id}
										type="button"
										onClick={() => {
											select(person.id)
											setNewMessageOpen(false)
										}}
										className="flex w-full items-center gap-3 rounded-lg border border-transparent p-2.5 text-left transition-colors hover:border-outline-variant hover:bg-surface-container-low"
									>
										<span
											className={cn(
												"grid size-9 shrink-0 place-items-center rounded-lg border font-label-sm font-semibold shadow-2xs",
												theme.bg,
												theme.text,
												theme.border,
											)}
										>
											{person.initials}
										</span>
										<div className="min-w-0 flex-1">
											<span className="block truncate font-label-md font-semibold text-label-md text-on-surface">
												{person.name}
											</span>
											<span className="block truncate font-caption text-caption text-on-surface-variant">
												{person.title}
											</span>
										</div>
									</button>
								)
							})}
						{!people.some((person) =>
							`${person.name} ${person.title}`.toLowerCase().includes(recipientQuery.toLowerCase()),
						) && (
							<p className="py-6 text-center font-body-sm text-body-sm text-on-surface-variant">
								No matching clients.
							</p>
						)}
					</div>
				</DialogContent>
			</Dialog>
			<div className="messages-workspace grid min-w-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)] h-[calc(100vh-14.5rem)] min-h-[640px] max-h-[880px]">
				<ConversationList
					people={people}
					conversations={conversations}
					selectedId={selectedId}
					query={query}
					filter={filter}
					unreadCount={unreadCount}
					onQueryChange={setQuery}
					onFilterChange={setFilter}
					onSelect={select}
				/>
				<MessageThread
					key={selectedId}
					selected={selected}
					messages={messages}
					draft={draft}
					archived={archived.includes(selectedId)}
					onBack={() => select("")}
					onOpenLatest={() => select(meta[0].id)}
					onOpenBrief={() => {}}
					onDetails={() => {}}
					onArchive={archive}
					onMarkUnread={() => {
						setUnread((current) => ({ ...current, [selectedId]: 1 }))
						select("")
					}}
					onDraftChange={updateDraft}
					onSend={send}
				/>
			</div>
		</div>
	)
}
