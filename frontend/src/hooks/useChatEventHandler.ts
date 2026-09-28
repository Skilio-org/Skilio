import { useCallback, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ChatService, type ChatMessagePublic, type ConversationDetailPublic, type ConversationPublic, type ConversationsPublic } from "@/client"
import { chatKeys } from "@/data/chat-keys"
import { toast } from "sonner"

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
        console.log("INCOMING CONVERSATION ID", message.conversation_id)
        const current      = queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations())
        if (current == undefined) {
            toast.error("No conversations found in cache for incoming message. reload")
            return
        }
        let conversation: ConversationPublic | undefined = current?.data.find((item) => item.id === message.conversation_id)

        // console.log("handleIncomingMessage called with message
        // :", message)
        // alert("M!!!")
        /// BUG: `useProfiles` takes conversations.. here it does not!!
        if (!conversation) {
            let d = await queryClient.fetchQuery({
                queryKey: chatKeys.conversation(message.conversation_id),
                queryFn: ({ signal }) => ChatService.getConversationDetails({
                    path: { conversation_id: message.conversation_id },
                    signal,
                })
                .then((response) => response.data)
                .then((d: ConversationDetailPublic) => {
                    return d;
                }).catch((error) => {
                    console.error("Error fetching conversation details:", error)
                    toast.error("Failed to fetch conversation details for incoming message")
                    throw error
                }),
            })
            conversation = {
                id: d.id,
                client_id: d.client_id,
                freelancer_id: d.freelancer_id,
                created_at: d.created_at,
                updated_at: d.updated_at,
                last_message: d.last_message,
                other_user: d.other_user,
                unread_count: d.unread_count,
            };
        }
        // if (isViewingConversation) {
        //     alert("Viewing conversation, not incrementing unread count")
        // }
        toast.info(`New message from ${conversation.other_user?.full_name}: "${message.content}"`)
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
                    unread_count:
                        (current.unread_count ?? 0) +
                        (incrementUnread && !isViewingConversation ? 1 : 0),
                }
            },
        )
        // alert("Updated conversation: " + (conversation.unread_count ?? 0) + 1);
    }, [queryClient])

    return useMemo(() => { 
        return { handleIncomingMessage } 
    }, [handleIncomingMessage])
}