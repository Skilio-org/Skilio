import { useWebSocket } from "@/context/websocket-context"
import { useMessageContacts } from "@/hooks/useMessageContacts"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useNavigate } from "@tanstack/react-router"
import { freelancers } from "@/data/freelancers"
import { useAccountRole } from "@/hooks/useAccountRole"
import { useEffect, useRef, useState } from "react"
import { Search, SquarePen } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { getClientTheme } from "@/components/messages/message-types"
import { cn } from "@/lib/utils"
import { ConversationList } from "@/components/messages/conversation-list"
import { MessageThread } from "@/components/messages/message-thread"
import type { InboxFilter } from "@/components/messages/message-types"
import {
	ClientProfilesService,
	ConversationsPublic,
	ProfilesService,
	UserPublic,
	type ClientProfileDetailPublic,
	type FreelancerProfilePublic,
} from "@/client"
import { all } from "axios"
import { ChatService } from "@/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"

const conversationQueryKey = ["chat", "conversations"]

type ConversationProfile = ClientProfileDetailPublic | FreelancerProfilePublic

export function useConversationProfiles(conversations: ConversationsPublic, enabled: boolean) {
	const userIds = conversations.data
		.map((conversation) => conversation.other_user)
		.filter((user): user is UserPublic => Boolean(user))
		.map((user) => `${user.id}:${user.active_role}`)
		.sort()

	return useQuery({
		queryKey: ["chat", "conversation-profiles", userIds],
		enabled: enabled && userIds.length > 0,
		queryFn: async ({ signal }) => {
			const users = conversations.data
				.map((conversation) => conversation.other_user)
				.filter((user): user is UserPublic => Boolean(user))

			const freelancerProfiles: FreelancerProfilePublic[] = []
			if (users.some((user) => user.active_role === "freelancer")) {
				let skip = 0
				while (true) {
					const { data: page } = await ProfilesService.readProfiles({
						query: { skip, limit: 100 },
						signal,
					})
					freelancerProfiles.push(...page.data)
					skip += page.data.length
					if (!page.data.length || skip >= page.count) break
				}
			}

			const clientProfiles = await Promise.all(
				users
					.filter((user) => user.active_role !== "freelancer")
					.map(async (user) => {
						const { data } = await ClientProfilesService.profilesReadClientProfileByUserId({
							path: { user_id: user.id },
							signal,
						})
						return [user.id, data] as const
					}),
			)

			const profiles = new Map<string, ConversationProfile>()
			for (const profile of freelancerProfiles) {
				profiles.set(profile.user_id, profile)
			}
			for (const [userId, profile] of clientProfiles) {
				profiles.set(userId, profile)
			}

			return profiles
		},
	})
}

export function useConversations() {
    return useQuery({
        queryKey: ["chat", "conversations"],
        queryFn: async ({ signal }) => {
            const response = await ChatService.getMyConversations({ signal })
            return response.data
        },
    })
}


export function MessagesPage({
	selectedContact,
	onSelectContact,
}: {
	selectedContact?: string
	onSelectContact: (id: string) => void
}) {
	const queryClient = useQueryClient()
	const {
		data: conversations = { count: 0, data: [] },
		isPending: conversationsPending,
	} = useConversations()
	const { data: conversationProfiles = new Map() } = useConversationProfiles(
		conversations,
		!conversationsPending,
	)
	void conversationProfiles

	// const { sendMessage } = useWebSocket()
	// const { sendMessage } = useWebSocket()
	const { sendMessage, subscribe } = useWebSocket()
	const navigate = useNavigate()
	const clientMode = useAccountRole() === "client"
	const contacts = useMessageContacts(clientMode)
	// const people = ;

	const [selected, setSelected] = useState<UserPublic | undefined>(undefined)
	const hasInitializedSelection = useRef(false)
	// const selected = people.find((person) => person.id === selectedContact)
	const selectedId = selected?.id ?? ""
	const [newMessageOpen, setNewMessageOpen] = useState(false)
	const [recipientQuery, setRecipientQuery] = useState("")
	const [query, setQuery] = useState("")
	const [filter, setFilter] = useState<InboxFilter>("all")
	const [drafts, setDrafts] = useState<Record<string, string>>({})
	
	const [unreadCount, setUnread] = useState<number>(0)
	const [archived, setArchived] = useState<string[]>([])

	const draft = drafts[selectedId] ?? ""
	const select = (id: string) => {
		onSelectContact(id)
	}
	const updateDraft = (value: string) => setDrafts((current) => ({ ...current, [selectedId]: value }))
	
	const send = () => {
		if (!selectedId || !draft.trim()) return
		const sentSuccessfully = sendMessage({
			type: "chat_message",
			conversation_id: selectedId,
			content: draft.trim(),
		})
		if (!sentSuccessfully) {
			toast.error("You are offline. Please try again when the connection is restored.")
			return
		}

		updateDraft("")
		setArchived((current) => current.filter((id) => id !== selectedId))
	}

	const archive = () => {
		const restoring = archived.includes(selectedId)
		setArchived((current) => (restoring ? current.filter((id) => id !== selectedId) : [...current, selectedId]))
		select("")
		toast.success(restoring ? "Conversation moved to inbox" : "Conversation archived")
	}

	useEffect(() => {
		if (hasInitializedSelection.current || conversationsPending) return

		const conversation = selectedContact
			? conversations.data.find((item) => item.other_user?.id === selectedContact)
			: conversations.data[0]

		if (conversation?.other_user) {
			hasInitializedSelection.current = true
			setSelected(conversation.other_user)
			if (selectedContact !== conversation.other_user.id) onSelectContact(conversation.other_user.id)
			return
		}

		if (!selectedContact) return

		hasInitializedSelection.current = true
		void ChatService.createOrGetConversation({
			body: { freelancer_id: selectedContact },
		})
			.then(({ data: createdConversation }) => {
				if (!createdConversation.other_user) return

				queryClient.setQueryData<ConversationsPublic>(conversationQueryKey, (current) => {
					if (!current) return { count: 1, data: [createdConversation] }

					const alreadyExists = current.data.some((item) => item.id === createdConversation.id)
					if (alreadyExists) return current

					return {
						count: current.count + 1,
						data: [createdConversation, ...current.data],
					}
				})
				setSelected(createdConversation.other_user)
				onSelectContact(createdConversation.other_user.id)
			})
			.catch((error) => {
				hasInitializedSelection.current = false
				toast.error(error instanceof Error ? error.message : "Unable to create conversation")
			})
	}, [conversations.data, conversationsPending, onSelectContact, queryClient, selectedContact])


    useEffect(() => {
        return subscribe("chat_message", (message) => {
            queryClient.setQueryData<ConversationsPublic>(
                conversationQueryKey,
                (current: any) => {
                    if (!current) return current

                    const conversation = current.data.find(
                        (item: any) => item.id === message.conversation_id,
                    )

                    // The conversation is not loaded locally.
                    // A refetch is needed because we do not have the other user's data.
                    if (!conversation) {
                        void queryClient.invalidateQueries({
                            queryKey: conversationQueryKey,
                        })
                        return current
                    }

                    const unreadIncrement =
                        message.conversation_id === selectedContact ? 0 : 1

                    const updatedConversation = {
                        ...conversation,
                        last_message: {
                            ...conversation.last_message,
                            content: message.content,
                        },
						unread_count:
							(conversation.unread_count ?? 0) + unreadIncrement,
                    }

                    return {
                        ...current,
                        data: [
                            updatedConversation,
                            ...current.data.filter(
                                (item: any) => item.id !== message.conversation_id,
                            ),
                        ],
                    }
                },
            )
        })
    }, [queryClient, selectedContact, subscribe])

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 py-8 md:px-6 md:py-10">
			<header className="flex flex-col gap-4 border-outline-variant border-b py-3 pb-8 md:flex-row md:items-end md:justify-between">
				<div className="flex max-w-2xl flex-col gap-4">
					<div className="flex flex-wrap items-center gap-2 font-caption text-caption">
						<span className="font-semibold text-on-surface-variant uppercase tracking-wider">
							{clientMode ? "Client workspace" : "Freelancer workspace"}
						</span>
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
						{clientMode
							? "Connect with freelancers, discuss your brief, and keep your projects moving."
							: "Manage client conversations, share design artifacts, and collaborate on active contracts."}
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
							Choose a {clientMode ? "freelancer" : "client"} to start or continue a conversation.
						</DialogDescription>
					</DialogHeader>
					<div className="relative mt-2">
						<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
						<input
							aria-label="Find a recipient"
							value={recipientQuery}
							onChange={(e) => setRecipientQuery(e.target.value)}
							placeholder={clientMode ? "Search freelancers…" : "Search clients…"}
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
								No matching {clientMode ? "freelancers" : "clients"}.
							</p>
						)}
					</div>
				</DialogContent>
			</Dialog>
			<div className="messages-workspace grid min-w-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)] h-[calc(100vh-14.5rem)] min-h-[640px] max-h-[880px]">
				<ConversationList
					conversations={conversations}
					selectedId={clientMode ? (selectedContact ?? "") : selectedId}
					query={query}
					filter={filter}
					unreadCount={unreadCount}
					onQueryChange={setQuery}
					onFilterChange={setFilter}
					onSelect={select}
				/>
				{clientMode && selectedContact && !selected ? (
					<section className="flex flex-col gap-4 p-6" aria-live="polite">
						<Alert>
							<AlertTitle>
								{contacts.isPending
									? "Loading freelancer…"
									: contacts.isError
										? "Couldn’t load freelancer"
										: "Freelancer unavailable"}
							</AlertTitle>
							<AlertDescription>
								{contacts.isPending
									? "Getting their profile details."
									: contacts.isError
										? "Please try loading the profile again."
										: contacts.data?.length === 0
											? "No public freelancer profiles are available yet. Once this freelancer’s profile is available, reload to start your conversation."
											: "This freelancer’s public profile could not be found. Check the contact link or try again later."}
							</AlertDescription>
						</Alert>
						{!contacts.isPending && (
							<Button variant="outline" disabled={contacts.isFetching} onClick={() => void contacts.refetch()}>
								{contacts.isFetching ? "Loading…" : "Reload profile"}
							</Button>
						)}
						<Button variant="outline" onClick={() => select("")}>
							Back to conversations
						</Button>
					</section>
				) : (
					<MessageThread
						key={selectedId}
						selected={selected}
						messages={messages}
						draft={draft}
						archived={archived.includes(selectedId)}
						onBack={() => select("")}
						onOpenLatest={() => {
							if (all[0]) select(all[0].id)
							else setNewMessageOpen(true)
						}}
						hasConversations={all.length > 0}
						canViewProfile={clientMode && freelancers.some((person) => person.id === selectedId)}
						onOpenBrief={() => {}}
						onDetails={() => {
							if (clientMode && selected && freelancers.some((person) => person.id === selected.id))
								void navigate({
									to: "/talent/$freelancerId",
									params: { freelancerId: selected.id },
									search: { q: undefined },
								})
						}}
						onArchive={archive}
						onMarkUnread={() => {
							setUnread((current) => ({ ...current, [selectedId]: 1 }))
							select("")
						}}
						onDraftChange={updateDraft}
						onSend={send}
					/>
				)}
			</div>
		</div>
	)
}
