import { ChatMessagePublic, ChatService, ConversationDetailPublic } from "@/client"
import { chatKeys } from "@/data/chat-keys"
import { useQuery } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
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