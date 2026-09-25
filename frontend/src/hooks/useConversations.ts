import { useQuery } from "@tanstack/react-query"
import { ChatService } from "@/client"
import { chatKeys } from "@/data/chat-keys"

export async function fetchConversations({ signal }: { signal: AbortSignal }) {
    const response = await ChatService.getMyConversations({ signal })
    return response.data
}

export function useConversations() {
    return useQuery({
        queryKey: chatKeys.conversations(),
        queryFn: fetchConversations,
    })
}