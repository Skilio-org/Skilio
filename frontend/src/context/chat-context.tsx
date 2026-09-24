import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { AUTH_TOKEN_CHANGED_EVENT, useWebSocket } from "@/context/websocket-context"
import {
	ChatService,
	ClientProfilesService,
	type ChatMessagePublic,
	type ConversationDetailPublic,
	type ConversationsPublic,
	ProfilesService,
	type UserPresence,
	type UserPublic,
	type ClientProfileDetailPublic,
	type FreelancerProfilePublic,
} from "@/client"
import type { ThreadMessage } from "@/components/messages/message-types"

const conversationQueryKey = ["chat", "conversations"]
type ConversationProfile = ClientProfileDetailPublic | FreelancerProfilePublic

type ChatContextValue = {
	conversations: ConversationsPublic
	conversationsPending: boolean
	conversationProfiles: Map<string, ConversationProfile>
	activeUserId?: string
	selectedConversationId?: string
	selected?: UserPublic
	selectedProfile?: ConversationProfile
	conversationDetail?: ConversationDetailPublic
	messages: ThreadMessage[]
	draft: string
	archived: boolean
	presence?: UserPresence
	presencePending: boolean
	isConnected: boolean
	selectConversation: (userId?: string) => void
	updateDraft: (value: string) => void
	send: () => void
	archive: () => void
	markUnread: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

function formatMessageTime(createdAt?: string | null): string {
	if (!createdAt) return ""
	return new Intl.DateTimeFormat(undefined, {
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(createdAt))
}

function toThreadMessage(message: ChatMessagePublic, otherUserId?: string): ThreadMessage {
	return {
		id: message.id,
		body: message.content,
		time: formatMessageTime(message.created_at),
		own: Boolean(otherUserId && message.sender_id !== otherUserId),
	}
}

function isClientProfile(
	profile: ConversationProfile,
): profile is ClientProfileDetailPublic {
	return "company" in profile
}

function useConversationProfiles(
	conversations: ConversationsPublic,
	enabled: boolean,
) {
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
			for (const profile of freelancerProfiles) profiles.set(profile.user_id, profile)
			for (const [userId, profile] of clientProfiles) profiles.set(userId, profile)
			return profiles
		},
	})
}

export function ChatProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient()
	const { isConnected, sendMessage, subscribe } = useWebSocket()
	const [hasAccessToken, setHasAccessToken] = useState(() => Boolean(localStorage.getItem("access_token")))
	const [activeUserId, setActiveUserId] = useState<string>()
	const [drafts, setDrafts] = useState<Record<string, string>>({})
	const [archivedIds, setArchivedIds] = useState<string[]>([])
	const creatingConversationFor = useRef<string | undefined>(undefined)
	const readReceiptSentFor = useRef<string | undefined>(undefined)

	useEffect(() => {
		const updateAuthState = () => setHasAccessToken(Boolean(localStorage.getItem("access_token")))
		window.addEventListener("storage", updateAuthState)
		window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, updateAuthState)
		return () => {
			window.removeEventListener("storage", updateAuthState)
			window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, updateAuthState)
		}
	}, [])

	const { data: conversations = { count: 0, data: [] }, isPending: conversationsPending } = useQuery({
		queryKey: conversationQueryKey,
		enabled: hasAccessToken,
		queryFn: async ({ signal }) => {
			const response = await ChatService.getMyConversations({ signal })
			return response.data
		},
	})
	const { data: conversationProfiles = new Map<string, ConversationProfile>() } = useConversationProfiles(
		conversations,
		!conversationsPending,
	)
	const selectedConversation = conversations.data.find(
		(conversation) => conversation.other_user?.id === activeUserId,
	)
	const selected = selectedConversation?.other_user ?? undefined
	const selectedProfile = activeUserId ? conversationProfiles.get(activeUserId) : undefined
	const { data: conversationDetail } = useQuery({
		queryKey: ["chat", "conversation", selectedConversation?.id],
		enabled: Boolean(selectedConversation?.id),
		queryFn: async ({ signal }) => {
			if (!selectedConversation?.id) throw new Error("A conversation is required")
			const response = await ChatService.getConversationDetails({
				path: { conversation_id: selectedConversation.id },
				signal,
			})
			return response.data
		},
	})
	const { data: presence, isPending: presencePending } = useQuery({
		queryKey: ["chat", "presence", selected?.id],
		enabled: Boolean(selected?.id),
		refetchInterval: 30_000,
		queryFn: async ({ signal }) => {
			if (!selected?.id) throw new Error("A user is required")
			const response = await ChatService.checkUserPresence({
				path: { user_id: selected.id },
				signal,
			})
			return response.data
		},
	})

	const selectConversation = useCallback((userId?: string) => {
		setActiveUserId(userId)
	}, [])
	const selectedId = activeUserId ?? ""
	const draft = drafts[selectedId] ?? ""
	const messages = useMemo(
		() => (conversationDetail?.messages ?? []).map((message) => toThreadMessage(message, selectedProfile?.user_id)),
		[conversationDetail?.messages, selectedProfile?.user_id],
	)
	const updateDraft = useCallback((value: string) => {
		setDrafts((current) => ({ ...current, [selectedId]: value }))
	}, [selectedId])
	const send = useCallback(() => {
		if (!selectedConversation?.id || !draft.trim()) return
		const sent = sendMessage({
			type: "chat_message",
			conversation_id: selectedConversation.id,
			content: draft.trim(),
		})
		if (!sent) {
			toast.error("You are offline. Please try again when the connection is restored.")
			return
		}
		updateDraft("")
		setArchivedIds((current) => current.filter((id) => id !== selectedId))
	}, [draft, selectedConversation?.id, selectedId, sendMessage, updateDraft])
	const archive = useCallback(() => {
		const restoring = archivedIds.includes(selectedId)
		setArchivedIds((current) => (restoring ? current.filter((id) => id !== selectedId) : [...current, selectedId]))
		selectConversation(undefined)
		toast.success(restoring ? "Conversation moved to inbox" : "Conversation archived")
	}, [archivedIds, selectedId, selectConversation])
	const markUnread = useCallback(() => {
		if (selectedConversation?.id) {
			queryClient.setQueryData<ConversationsPublic>(conversationQueryKey, (current) => {
				if (!current) return current
				return {
					...current,
					data: current.data.map((conversation) =>
						conversation.id === selectedConversation.id
							? { ...conversation, unread_count: Math.max(conversation.unread_count ?? 0, 1) }
							: conversation,
					),
				}
			})
		}
		selectConversation(undefined)
	}, [queryClient, selectedConversation?.id, selectConversation])

	useEffect(() => {
		if (!activeUserId || conversationsPending || selectedConversation || creatingConversationFor.current === activeUserId) return
		creatingConversationFor.current = activeUserId
		void ChatService.createOrGetConversation({ body: { freelancer_id: activeUserId } })
			.then(({ data }) => {
				if (!data.other_user) return
				queryClient.setQueryData<ConversationsPublic>(conversationQueryKey, (current) => {
					if (!current) return { count: 1, data: [data] }
					if (current.data.some((conversation) => conversation.id === data.id)) return current
					return { count: current.count + 1, data: [data, ...current.data] }
				})
			})
			.catch((error) => {
				creatingConversationFor.current = undefined
				toast.error(error instanceof Error ? error.message : "Unable to create conversation")
			})
	}, [activeUserId, conversationsPending, queryClient, selectedConversation])

	useEffect(() => {
		if (!selectedConversation?.id || !conversationDetail?.messages?.length || !isConnected) return
		if (readReceiptSentFor.current === selectedConversation.id) return
		if (sendMessage({ type: "read_receipt", conversation_id: selectedConversation.id })) {
			readReceiptSentFor.current = selectedConversation.id
		}
	}, [conversationDetail?.messages?.length, isConnected, selectedConversation?.id, sendMessage])

	useEffect(() => {
		if (!selectedConversation?.id || !conversationDetail) return
		queryClient.setQueryData<ConversationsPublic>(conversationQueryKey, (current) => {
			if (!current) return current
			return {
				...current,
				data: current.data.map((conversation) =>
					conversation.id === selectedConversation.id ? { ...conversation, unread_count: 0 } : conversation,
				),
			}
		})
	}, [conversationDetail, queryClient, selectedConversation?.id])

	useEffect(() => {
		const handleMessage = (message: ChatMessagePublic, incrementUnread: boolean) => {
			if (incrementUnread && message.conversation_id === selectedConversation?.id) readReceiptSentFor.current = undefined
			queryClient.setQueryData<ConversationDetailPublic>(["chat", "conversation", message.conversation_id], (current) => {
				if (!current || current.messages?.some((item) => item.id === message.id)) return current
				return { ...current, last_message: message, messages: [...(current.messages ?? []), message] }
			})
			queryClient.setQueryData<ConversationsPublic>(conversationQueryKey, (current) => {
				if (!current) return current
				const conversation = current.data.find((item) => item.id === message.conversation_id)
				if (!conversation) {
					void queryClient.invalidateQueries({ queryKey: conversationQueryKey })
					return current
				}
				const unreadIncrement = incrementUnread && message.conversation_id !== selectedConversation?.id ? 1 : 0
				return {
					...current,
					data: [
						{ ...conversation, last_message: message, unread_count: (conversation.unread_count ?? 0) + unreadIncrement },
						...current.data.filter((item) => item.id !== message.conversation_id),
					],
				}
			})
		}
		const unsubscribeMessage = subscribe("chat_message", (message: ChatMessagePublic) => handleMessage(message, true))
		const unsubscribeAck = subscribe("message_ack", (message: ChatMessagePublic) => handleMessage(message, false))
		const unsubscribeRead = subscribe("messages_read", (event: { conversation_id: string; read_by: string }) => {
			queryClient.setQueryData<ConversationDetailPublic>(["chat", "conversation", event.conversation_id], (current) => {
				if (!current) return current
				return { ...current, messages: (current.messages ?? []).map((message) => message.sender_id === event.read_by ? message : { ...message, is_read: true }) }
			})
		})
		return () => {
			unsubscribeMessage()
			unsubscribeAck()
			unsubscribeRead()
		}
	}, [queryClient, selectedConversation?.id, subscribe])

	const value: ChatContextValue = {
		conversations,
		conversationsPending,
		conversationProfiles,
		activeUserId,
		selectedConversationId: selectedConversation?.id,
		selected,
		selectedProfile,
		conversationDetail,
		messages,
		draft,
		archived: archivedIds.includes(selectedId),
		presence,
		presencePending,
		isConnected,
		selectConversation,
		updateDraft,
		send,
		archive,
		markUnread,
	}

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat(): ChatContextValue {
	const context = useContext(ChatContext)
	if (!context) throw new Error("useChat must be used within ChatProvider")
	return context
}

export { isClientProfile }
