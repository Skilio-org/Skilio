import { useCallback, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { ChatMessagePublic, ConversationDetailPublic, ConversationsPublic } from "@/client"
import { chatKeys } from "@/data/chat-keys"
import { useConversations } from "./useConversations"

type ChatMessageUpdateOptions = {
	incrementUnread?: boolean
	isViewingConversation?: boolean
}

export function useChatEventHandlers() {
    const queryClient = useQueryClient()
    
    const handleIncomingMessage = useCallback(async (
        message: ChatMessagePublic,
		{ incrementUnread = true, isViewingConversation = false }: ChatMessageUpdateOptions = {},
	) => {
        const current      = queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations())
        const conversation = current?.data.find((item) => item.id === message.conversation_id)

        // console.log("handleIncomingMessage called with message
        // :", message)
        // alert("M!!!")
        /// BUG: `useProfiles` takes conversations.. here it does not!!
        if (!current || !conversation) {
            await queryClient.refetchQueries({
                queryKey: chatKeys.conversations(),
                type: "active",
            })
            return
        }
        // if (isViewingConversation) {
        //     alert("Viewing conversation, not incrementing unread count")
        // }

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
                current.last_message = message
                current.messages?.push(message)
                current.unread_count =
                    (current.unread_count ?? 0) +
                    (incrementUnread && !isViewingConversation ? 1 : 0)
                // console.log("Updated conversation:", current.unread_count);                
                // console.log("Last:", current.last_message);
                return current
            },
        )
        // alert("Updated conversation: " + (conversation.unread_count ?? 0) + 1);
    }, [queryClient])

    return useMemo(() => { 
        return { handleIncomingMessage } 
    }, [handleIncomingMessage])
}