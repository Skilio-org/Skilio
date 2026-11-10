import { useQuery } from "@tanstack/react-query"
import { ChatService } from "@/client"
import { chatKeys } from "@/data/chat-keys"

async function fetchConversations({
	signal,
	role,
}: {
	signal: AbortSignal
	role?: "client" | "freelancer"
}) {
	const response = await ChatService.getMyConversations({
		query: { role: (role as any) ?? undefined },
		signal,
	})
	return response.data
}

export function useConversations(role?: "client" | "freelancer") {
	return useQuery({
		queryKey: chatKeys.conversations(role),
		queryFn: ({ signal }) => fetchConversations({ signal, role }),
	})
}
