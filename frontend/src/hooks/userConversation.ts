import { ChatService } from "@/client"
import { chatKeys } from "@/data/chat-keys"
import { useQuery } from "@tanstack/react-query"

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
    };
}