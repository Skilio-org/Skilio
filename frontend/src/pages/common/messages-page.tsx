import { useEffect, useState } from "react"
import { SquarePen } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { ConversationList } from "@/components/messages/conversation-list"
import { MessageTalentDetails } from "@/components/messages/message-talent-details"
import { MessageThread } from "@/components/messages/message-thread"
import { MessageToolDialogView } from "@/components/messages/message-tool-dialog"
import type { InboxFilter, ThreadMessage } from "@/components/messages/message-types"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { clientConversations, clientIntroductions, demoClients } from "@/data/freelancer-demo"
import { freelancers } from "@/data/freelancers"

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
const talentIntroductions: Record<string, string> = {
	"maya-laurent":
		"Thanks for reaching out. I'd love to learn more about the product and the workflow you want to improve.",
	"noah-williams": "Thanks for the context. The product sounds like a strong fit for the systems I usually build.",
	"amara-okafor": "I've read through your brief. There is a good opportunity to make the positioning more distinctive.",
	"elias-chen": "The workflow is a good candidate for automation, especially with a clear human review step.",
}
function sampleThread(
	id: string,
	meta: typeof talentConversations,
	introductions: Record<string, string>,
	clientMode: boolean,
): ThreadMessage[] {
	const conversation = meta.find((item) => item.id === id)
	if (!conversation) return []
	return [
		{
			id: `${id}-intro`,
			body:
				clientMode && id === "olivia-bennett"
					? "Morning! We just reviewed the interactive prototype for the new user onboarding sequence. Overall, the typography hierarchy feels significantly crisper than our last iteration."
					: introductions[id],
			feedback:
				clientMode && id === "olivia-bennett"
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
			attachment:
				clientMode && id === "olivia-bennett"
					? {
							name: "onboarding-handoff-notes.txt",
							content:
								"Onboarding handoff\n\nReview secondary button contrast.\nCheck tooltip animation on slower connections.\nPrepare the next prototype iteration for Thursday's review.",
						}
					: undefined,
			body: clientMode
				? "Thanks for the notes! That aligns with my thinking. I’ll refine the secondary buttons, check the animation timing, and share the updated prototype for your review."
				: "Great to meet you. We're building a marketplace and would like to talk through the scope, timeline, and your approach.",
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
	clientMode = false,
}: {
	selectedContact?: string
	onSelectContact: (id: string) => void
	clientMode?: boolean
}) {
	const people = clientMode ? demoClients : freelancers
	const meta = clientMode ? clientConversations : talentConversations
	const introductions = clientMode ? clientIntroductions : talentIntroductions
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
	const [briefOpen, setBriefOpen] = useState(false)
	const [detailsOpen, setDetailsOpen] = useState(false)
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
				...sampleThread(selectedId, meta, introductions, clientMode).slice(
					0,
					clientMode && selectedId === "olivia-bennett" ? 2 : 3,
				),
				...(sent[selectedId] ?? []),
			]
		: []
	const draft = drafts[selectedId] ?? ""
	const select = (id: string) => {
		setDetailsOpen(false)
		setBriefOpen(false)
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
		<div className={clientMode ? "freelancer-inbox" : undefined}>
			{clientMode && (
				<header className="mb-7 flex flex-wrap items-end justify-between gap-5">
					<div>
						<p className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
							<span className="uppercase tracking-wider text-primary">Freelancer workspace</span>
							<span>·</span>Communications & active contracts
						</p>
						<h1 className="text-4xl font-semibold tracking-tight text-foreground">Messages</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							Manage client conversations, share design artifacts, and collaborate on active contracts.
						</p>
					</div>
					<button
						type="button"
						onClick={() => setNewMessageOpen(true)}
						className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground dark:bg-on-surface dark:text-background"
					>
						<SquarePen className="size-4" />
						New message
					</button>
				</header>
			)}
			<Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>New message</DialogTitle>
						<DialogDescription>Choose a client to start or continue a conversation.</DialogDescription>
					</DialogHeader>
					<input
						aria-label="Find a recipient"
						value={recipientQuery}
						onChange={(e) => setRecipientQuery(e.target.value)}
						placeholder="Search clients…"
						className="h-11 rounded-lg border bg-background px-3 text-sm"
					/>
					{people
						.filter((person) => `${person.name} ${person.title}`.toLowerCase().includes(recipientQuery.toLowerCase()))
						.map((person) => (
							<button
								key={person.id}
								type="button"
								onClick={() => {
									select(person.id)
									setNewMessageOpen(false)
								}}
								className="rounded-lg p-3 text-left hover:bg-muted"
							>
								<span className="block text-sm font-medium">{person.name}</span>
								<span className="text-xs text-muted-foreground">{person.title}</span>
							</button>
						))}
					{!people.some((person) =>
						`${person.name} ${person.title}`.toLowerCase().includes(recipientQuery.toLowerCase()),
					) && <p className="py-4 text-sm text-muted-foreground">No matching clients.</p>}
				</DialogContent>
			</Dialog>
			<div className="messages-workspace grid min-w-0 overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)]">
				<ConversationList
					people={people}
					clientMode={clientMode}
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
					clientMode={clientMode}
					key={selectedId}
					selected={selected}
					messages={messages}
					draft={draft}
					archived={archived.includes(selectedId)}
					onBack={() => select("")}
					onOpenLatest={() => select(meta[0].id)}
					onOpenBrief={() => setBriefOpen(true)}
					onDetails={() => setDetailsOpen(true)}
					onArchive={archive}
					onMarkUnread={() => {
						setUnread((current) => ({ ...current, [selectedId]: 1 }))
						select("")
					}}
					onDraftChange={updateDraft}
					onSend={send}
				/>
				{briefOpen && (
					<MessageToolDialogView
						onClose={() => setBriefOpen(false)}
						onInsert={(brief) => {
							updateDraft((draft ? `${draft}\n\n` : "") + brief)
							setBriefOpen(false)
						}}
					/>
				)}
				<Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
					<SheetContent className="w-full overflow-y-auto sm:max-w-sm">
						<SheetHeader>
							<SheetTitle>Conversation details</SheetTitle>
							<SheetDescription>Get to know the person behind the work.</SheetDescription>
						</SheetHeader>
						{selected && <MessageTalentDetails selected={selected} clientMode={clientMode} />}
					</SheetContent>
				</Sheet>
			</div>
		</div>
	)
}
