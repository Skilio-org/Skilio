import { useCallback, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { ChatMessagePublic, ConversationDetailPublic, ConversationsPublic } from "@/client"
import { chatKeys } from "@/data/chat-keys"
import { useConversations } from "@/hooks/useConversations"
import { useProfiles } from "@/hooks/useProfiles"

type ChatMessageUpdateOptions = {
	incrementUnread?: boolean
	isViewingConversation?: boolean
}

export function useChatEventHandlers() {
    const queryClient = useQueryClient()

    const handleIncomingMessage = useCallback((
		message: ChatMessagePublic,
		{ incrementUnread = true, isViewingConversation = false }: ChatMessageUpdateOptions = {},
	) => {
        const current = queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations())
        const conversation = current?.data.find((item) => item.id === message.conversation_id)

        if (!current || !conversation) {
            void useConversations()
                .refetch({ throwOnError: false, cancelRefetch: false })
            void useProfiles()
                .refetch({ throwOnError: false, cancelRefetch: false })
            return
        }

        queryClient.setQueryData<ConversationsPublic>(chatKeys.conversations(), {
            ...current,
            data: [
                {
                    ...conversation,
                    last_message: message,
                    unread_count:
                        (conversation.unread_count ?? 0) +
                        (incrementUnread && !isViewingConversation ? 1 : 0),
                },
                ...current.data.filter((item) => item.id !== message.conversation_id),
            ],
        })

        queryClient.setQueryData(
            chatKeys.conversation(message.conversation_id),
            (current: ConversationDetailPublic | undefined) => {
                if (!current) return current
                if (
                    current.messages?.some(
                        (existing) => existing.id === message.id,
                    )
                ) {
                    return current
                }
                return {
                    ...current,
                    last_message: message,
                    messages: [...(current.messages ?? []), message],
                }
            },
        )
    }, [queryClient])

    return useMemo(() => ({ handleIncomingMessage }), [handleIncomingMessage])
}