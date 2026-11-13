import { useProfiles } from "@/hooks/useProfiles"
import { useConversations } from "./useConversations"

export function useChatData(role?: "client" | "freelancer") {
	const conversationsQuery = useConversations(role)
	const profilesQuery = useProfiles(conversationsQuery.data, conversationsQuery.isSuccess)

	return {
		profiles: profilesQuery,
		conversations: conversationsQuery,
	}
}
