import { type ChatMessagePublic, ChatService, type ConversationDetailPublic, type ConversationsPublic } from "@/client"
import { chatKeys } from "@/data/chat-keys"
import { type QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
// import { useWebSocket } from "@/context/websocket-context"

export function useConversation(id: string) {
	const data = useQuery({
		queryKey: chatKeys.conversation(id),
		enabled: Boolean(id),
		queryFn: async ({ signal }) => {
			const response = await ChatService.getConversationDetails({
				path: {
					conversation_id: id,
				},
				signal,
			})
			return response.data
		},
	})
	return {
		data: data.data,
		isPending: data.isPending,
	}
}

export function useConversationUpdate() {
	const queryClient = useQueryClient()

	return (id: string, message: ChatMessagePublic) =>
		queryClient.setQueryData(chatKeys.conversation(id), (current: ConversationDetailPublic) => {
			if (!current) return current
			if (current.messages?.some((item) => item.id === message.id)) {
				return current
			}
			return {
				...current,
				last_message: message,
				messages: [...(current.messages ?? []), message],
			}
		})
}

export function removeMessageFromCache(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
) {
  const cachedConversation = queryClient.getQueryData<ConversationDetailPublic>(
    chatKeys.conversation(conversationId),
  )

  if (cachedConversation) {
    const target = cachedConversation.messages?.find((item) => item.id === messageId)
    const wasUnread = target ? !target.is_read : false
    const updatedMessages = cachedConversation.messages?.filter((item) => item.id !== messageId) ?? []
    const newLastMessage = updatedMessages.length > 0 ? updatedMessages[updatedMessages.length - 1] : null
    const isLastMessage = cachedConversation.last_message?.id === messageId

    queryClient.setQueryData<ConversationDetailPublic>(
      chatKeys.conversation(conversationId),
      {
        ...cachedConversation,
        messages: updatedMessages,
        unread_count: wasUnread && cachedConversation.unread_count
          ? Math.max(0, cachedConversation.unread_count - 1)
          : cachedConversation.unread_count,
        last_message: isLastMessage ? newLastMessage : cachedConversation.last_message,
      },
    )

    queryClient.setQueryData<ConversationsPublic>(chatKeys.conversations(), (current) => {
      if (!current) return current
      return {
        ...current,
        data: current.data.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              unread_count: wasUnread && conv.unread_count
                ? Math.max(0, conv.unread_count - 1)
                : conv.unread_count,
              last_message: isLastMessage ? newLastMessage : conv.last_message,
            }
          }
          return conv
        }),
      }
    })
  } else {
    queryClient.setQueryData<ConversationsPublic>(chatKeys.conversations(), (current) => {
      if (!current) return current
      return {
        ...current,
        data: current.data.map((conv) => {
          if (conv.id === conversationId) {
            const isLastMessage = conv.last_message?.id === messageId
            const wasLastUnread = isLastMessage && conv.last_message ? !conv.last_message.is_read : false

            return {
              ...conv,
              unread_count: wasLastUnread && conv.unread_count
                ? Math.max(0, conv.unread_count - 1)
                : conv.unread_count,
            }
          }
          return conv
        }),
      }
    })
    void queryClient.invalidateQueries({
      queryKey: chatKeys.conversation(conversationId),
    })
    void queryClient.invalidateQueries({
      queryKey: chatKeys.conversations(),
    })
  }
}

export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: string) =>
      ChatService.deleteMessage({
        path: { message_id: messageId },
      }),
    onSuccess: (_, messageId) => {
      removeMessageFromCache(queryClient, conversationId, messageId)
    },
    onError: () => {
      toast.error("Error deleting the message. Please try again later.")
    },
  })
}

export const useMessageDelete = useDeleteMessage