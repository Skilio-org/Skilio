import { isClientProfile } from "@/context/chat-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useNavigate } from "@tanstack/react-router"
import { useAccountRole } from "@/hooks/useAccountRole"
import { useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { getClientTheme } from "@/components/messages/message-types"
import { cn } from "@/lib/utils"
import { ConversationList } from "@/components/messages/conversation-list"
import { MessageThread } from "@/components/messages/message-thread"
import type { InboxFilter } from "@/components/messages/message-types"
import { useUserOnlineStatus } from "@/hooks/useUserOnlineStatus"
import { useCreateConversation } from "@/hooks/useCreateConversation"
import { useConversations } from "@/hooks/useConversations"
import { useProfiles } from "@/hooks/useProfiles"
import { useWebSocket } from "@/context/websocket-context"
import { toast } from "sonner"
import { useConversation, useConversationUpdate } from "@/hooks/userConversation"
import { ChatMessagePublic, ConversationDetailPublic } from "@/client/types.gen"
// import { useChatEventHandlers } from "@/hooks/useChatEventHandler"
import { chatKeys } from "@/data/chat-keys"
import { useQueryClient } from "@tanstack/react-query"
import useAuth from "@/hooks/useAuth"

export function MessagesPage({
	SelectedUserId,
	onSelectContact,
}: {
	SelectedUserId: string | undefined
	onSelectContact: (id: string) => void
}) {
	// TODO: What if the conversations does not even exist.. yet...
	// 1. check if the conversation exists.
	const { user } = useAuth();
	const [recipientQuery, setRecipientQuery] = useState("")
	const [newMessageOpen, setNewMessageOpen] = useState(false)
	const [query, setQuery]                   = useState("")
	const [filter, setFilter]                 = useState<InboxFilter>("all")
	const [draft, setDraft]                   = useState("")
	const creatingForUserRef                  = useRef<string | null>(null)

	const { sendMessage } = useWebSocket()
	const conversations = useConversations()
	const profiles = useProfiles(conversations.data, conversations.isSuccess)
	const createConversation = useCreateConversation()
	const MessageUpdate = useConversationUpdate()
	const selectedConversation = SelectedUserId
		? conversations.data?.data.find((conversation) => conversation.other_user?.id === SelectedUserId)
		: conversations.data?.data[0]
	const selectedConversationId = selectedConversation?.id
	const selectedProfile = profiles.data?.get(selectedConversation?.other_user?.id ?? "")
	const { isOnline, isPending: presencePending } = useUserOnlineStatus(selectedProfile?.user_id)
	const detailsQuery = useConversation(selectedConversationId ?? "")
	const navigate = useNavigate()
	const clientMode = useAccountRole() === "client"
	const queryClient = useQueryClient()

	useEffect(() => {
		if (
			conversations.isSuccess &&
			SelectedUserId &&
			!selectedConversation &&
			!createConversation.isPending &&
			creatingForUserRef.current !== SelectedUserId
		) {
			console.log("Creating new conversation with user:", SelectedUserId)
			void createConversation.mutateAsync(SelectedUserId)
			.then((newConversation) => {
				onSelectContact(newConversation.other_user?.id ?? "")
			})
			.catch((error) => {
				console.error("Error creating conversation:", error)
				toast.error("Failed to create conversation. Please try again.")
			})
			creatingForUserRef.current = SelectedUserId
		}
		if (!SelectedUserId && conversations.data?.data[0]?.other_user?.id) 
			onSelectContact(conversations.data?.data[0]?.other_user?.id ?? "")
		}, [
		SelectedUserId,
		conversations.isSuccess,
		// creatingForUserRef,
		createConversation.isPending,
		selectedConversation,
	])

	useEffect(() => {
		if (selectedConversationId == undefined) return ;
		// mutate the current conversation to mark all messages as read.
		queryClient.setQueryData<ConversationDetailPublic>(chatKeys.conversation(selectedConversationId), (current) => {
			if (!current) return current
			// Send receipt to server for all messages in this conversation.
			sendMessage({
				type: "read_receipt",
				conversation_id: selectedConversationId,
			})
			return {
				...current,
				unread_count: 0,
				messages: current.messages?.map((message) => ({
					...message,
					is_read: true,
				})),
			}
		})
		// Also update the conversations list to mark this conversation as read..
		queryClient.setQueryData(chatKeys.conversations(), (current: any) => {
			if (!current) return current
			const updatedConversations = current.data.map((conversation: any) => {
				if (conversation.id === selectedConversationId) {
					return {
						...conversation,
						unread_count: 0,
						last_message: {
							...conversation.last_message,
							is_read: true,
						},
					}
				}
				return conversation
			})
			return {
				...current,
				data: updatedConversations,
			}
		})
	}, [
		selectedConversationId,
		detailsQuery.isPending,
		detailsQuery.data?.unread_count
	])

	if (conversations.isPending) {
		return <>Still loading conversations!</>
	}

   	if (profiles.isPending && profiles.data?.size === 0 && conversations.data?.data.length !== 0)
       	return <>Still loading profiles!</>


	const matchingProfiles = Array.from(profiles.data?.entries() ?? []).filter(([, profile]) =>
		checkProfile(profile, recipientQuery),
	)

	const unreadCount = conversations.data?.data.reduce(
		(total, conversation) => total + (conversation.unread_count ?? 0),
		0,
	)

	function checkProfile(profile: Parameters<typeof isClientProfile>[0], search: string) {
		if (search.trim() === "") return true
		const text = isClientProfile(profile)
		? `${profile.company ?? ""} ${profile.full_name ?? ""}`
			: `${profile.title ?? ""} ${profile.full_name ?? ""}`
		return text.toLowerCase().includes(search.toLowerCase())
	}

	const send = (message: string) => {
		const content = message.trim()
		const rmessage: ChatMessagePublic = {
			id: crypto.randomUUID(),
			conversation_id: selectedConversationId ?? "",
			content,
			sender_id: user?.id ?? "Me",
			created_at: new Date().toISOString(),
			is_read: false,
		};
		// console.log("User:", user)

		if (!selectedConversationId || !content) return

		const sent = sendMessage({
			type: "chat_message",
			conversation_id: selectedConversationId,
			content,
		})
		if (sent) setDraft("")
		else toast.error("Failed to send message. Please try again.")
		MessageUpdate(selectedConversationId, rmessage)
	}

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
							{unreadCount ?? 0} unread {unreadCount === 1 ? "message" : "messages"}
						</span>
					</div>
					<h1 className="font-headline-xl font-semibold text-headline-xl text-on-surface tracking-tight">Messages</h1>
					<p className="font-body-md text-body-md text-on-surface-variant">
						{clientMode
							? "Connect with freelancers, discuss your brief, and keep your projects moving."
							: "Manage client conversations, share design artifacts, and collaborate on active contracts."}
					</p>
				</div>
				{/* <div className="flex shrink-0 flex-wrap items-center gap-2.5">
					<button
						type="button"
						onClick={() => setNewMessageOpen(true)}
						className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
					>
						<SquarePen className="size-4" />
						New message
					</button>
				</div> */}
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
						{matchingProfiles.map(([id, profile]) => {
							const theme = getClientTheme(id)
							const name = profile.full_name ?? "Unknown user"
							const subtitle = isClientProfile(profile)
								? profile.company ?? profile.company_role ?? "Client"
								: profile.title ?? "Freelancer"
							return (
								<button
									key={id}
									type="button"
									onClick={() => {
										onSelectContact(id)
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
										{name.slice(0, 2).toUpperCase()}
									</span>
									<div className="min-w-0 flex-1">
										<span className="block truncate font-label-md font-semibold text-label-md text-on-surface">
											{name}
										</span>
										<span className="block truncate font-caption text-caption text-on-surface-variant">
											{subtitle}
										</span>
									</div>
								</button>
							)
						})}
						{matchingProfiles.length === 0 && (
							<p className="py-6 text-center font-body-sm text-body-sm text-on-surface-variant">
								No matching users.
							</p>
						)}
					</div>
				</DialogContent>
			</Dialog>
			<div className="messages-workspace grid min-w-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)] h-[calc(100vh-14.5rem)] min-h-[640px] max-h-[880px]">
				<ConversationList
					selected={selectedProfile}
					query={query}
					filter={filter}
					unreadCount={unreadCount ?? 0}
					onQueryChange={setQuery}
					onFilterChange={setFilter}
					onSelect={onSelectContact}
				/>
				{selectedConversationId && !selectedConversation ? (
					<section className="flex flex-col gap-4 p-6" aria-live="polite">
						<Alert>
							<AlertTitle>
								{profiles.isPending
									? "Loading freelancer…"
									: profiles.isError
										? "Couldn’t load freelancer"
										: "Freelancer unavailable"}
							</AlertTitle>
							<AlertDescription>
								{profiles.isPending
									? "Getting their profile details."
									: profiles.isError
										? "Please try loading the profile again."
										: profiles.data?.size === 0
											? "No public freelancer profiles are available yet. Once this freelancer’s profile is available, reload to start your conversation."
											: "This freelancer’s public profile could not be found. Check the contact link or try again later."}
							</AlertDescription>
						</Alert>
						{!profiles.isPending && (
							<Button variant="outline" disabled={profiles.isFetching} onClick={() => void profiles.refetch()}>
								{profiles.isFetching ? "Loading…" : "Reload profile"}
							</Button>
						)}
						<Button variant="outline" onClick={() => onSelectContact("")}>
							Back to conversations
						</Button>
					</section>
				) : (
					selectedConversationId !== undefined &&
					<MessageThread
						key={selectedProfile?.user_id ?? "no-profile"}
						selected={selectedProfile}
						isOnline={isOnline}
						presencePending={presencePending}
						messages={detailsQuery.data?.messages ?? []}
						draft={draft}
						archived={false}
						onBack={() => onSelectContact(SelectedUserId ?? "")}
						onOpenLatest={() => {
							if (conversations.data?.data[0]?.other_user?.id) 
								onSelectContact(conversations.data?.data[0].other_user?.id)
							else setNewMessageOpen(true)
						}}
						hasConversations={conversations.data?.count == undefined ? false : conversations.data?.count > 0}
						canViewProfile={true}
						onDetails={() => {
							if (clientMode && selectedConversation?.other_user?.active_role === "freelancer")
								void navigate({
									to: "/talent/$freelancerId",
									params: { freelancerId: selectedProfile?.user_id ?? "" },
									search: { q: undefined },
								})
						}}
						onArchive={() => {}}
						onMarkUnread={() => {
							// markUnread()
							// select("")
							() => {}
						}}
						onDraftChange={setDraft}
						onSend={() => send(draft)}
					/>
				)}
			</div>
		</div>
	)
}
