import { useProfiles } from "@/hooks/useProfiles"
import { useConversations } from "./useConversations"

export function useChatData() {
	const conversationsQuery = useConversations()
	const profilesQuery = useProfiles(conversationsQuery.data, conversationsQuery.isSuccess)

	return {
		profiles: profilesQuery,
		conversations: conversationsQuery,
	}
}
