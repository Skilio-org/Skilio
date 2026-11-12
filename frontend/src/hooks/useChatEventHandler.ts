import { useCallback, useMemo } from "react"
import { type QueryClient, useQueryClient } from "@tanstack/react-query"
import type { ChatMessagePublic, ConversationDetailPublic, ConversationsPublic } from "@/client"
import { chatKeys } from "@/data/chat-keys"

export type ChatMessageUpdateOptions = {
	incrementUnread?: boolean
	isViewingConversation?: boolean
}

export async function applyIncomingMessageToCache(
	queryClient: QueryClient,
	message: ChatMessagePublic,
	{ incrementUnread = true, isViewingConversation = false }: ChatMessageUpdateOptions = {},
) {
	const unreadDelta = incrementUnread && !isViewingConversation ? 1 : 0

	queryClient.setQueryData<ConversationDetailPublic>(chatKeys.conversation(message.conversation_id), (current) => {
		if (!current) return current
		if (current.messages?.some((existing) => existing.id === message.id)) {
			return current
		}
		return {
			...current,
			last_message: message,
			messages: [...(current.messages ?? []), message],
			unread_count: (current.unread_count ?? 0) + unreadDelta,
		}
	})

	let found = false
	for (const [queryKey, queryData] of queryClient.getQueriesData<ConversationsPublic>({
		queryKey: [...chatKeys.all, "conversations"],
	})) {
		const conv = queryData?.data?.find((item) => item.id === message.conversation_id)
		if (!conv) continue
		found = true
		if (conv.last_message?.id === message.id) continue

		queryClient.setQueryData<ConversationsPublic>(queryKey, (current) => {
			if (!current?.data) return current
			const index = current.data.findIndex((item) => item.id === message.conversation_id)
			if (index === -1) return current

			const conversation = current.data[index]
			if (conversation.last_message?.id === message.id) return current

			const nextData = [...current.data]
			nextData.splice(index, 1)
			nextData.unshift({
				...conversation,
				last_message: message,
				unread_count: (conversation.unread_count ?? 0) + unreadDelta,
			})
			return {
				...current,
				data: nextData,
			}
		})
	}

	if (!found) {
		await queryClient.invalidateQueries({
			queryKey: [...chatKeys.all, "conversations"],
			refetchType: "active",
		})
	}
}

export function useChatEventHandlers() {
	const queryClient = useQueryClient()

	const handleIncomingMessage = useCallback(
		(message: ChatMessagePublic, options?: ChatMessageUpdateOptions) =>
			applyIncomingMessageToCache(queryClient, message, options),
		[queryClient],
	)

	return useMemo(() => ({ handleIncomingMessage }), [handleIncomingMessage])
}
