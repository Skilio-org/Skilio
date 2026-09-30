import { useQuery } from "@tanstack/react-query"
import { ChatService } from "@/client"
import { chatKeys } from "@/data/chat-keys"

export async function fetchConversations({ signal }: { signal: AbortSignal }) {
    const response = await ChatService.getMyConversations({ signal })
    let data = response.data
        return data;
}

export function useConversations() {
    // console.log("useConversations is deprecated. Please use useQuery with chatKeys.conversations() instead.")
    return useQuery({
        queryKey: chatKeys.conversations(),
        queryFn: fetchConversations,
    })
}