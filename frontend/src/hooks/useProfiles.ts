import { useQuery } from "@tanstack/react-query"
import {
	ClientProfilesService,
	ConversationsPublic,
	ProfilesService,
	type UserPublic,
} from "@/client"
import { chatKeys } from "@/data/chat-keys"
import type { ConversationProfile } from "@/hooks/isClientProfile"

export async function fetchProfiles(conversations: ConversationsPublic | undefined, signal: AbortSignal) {
    const profiles = new Map<string, ConversationProfile>()
    if (conversations?.count === 0) return new Map<string, ConversationProfile>()

    for (const conversation of conversations?.data ?? []) {
        if (conversation === undefined)
            continue;

        console.log("Fetching profile for conv:", conversation)        
        if (conversation.other_user?.active_role === "freelancer") {
            const { data } = await ProfilesService.readProfileByUserId({
                path: {
                    user_id: conversation.other_user?.id ?? "",
                },
                signal,
            })
            profiles.set(conversation.other_user?.id, data)
        } else {
            const { data } = await ClientProfilesService.profilesReadClientProfileByUserId({
                    path: { user_id: conversation.other_user?.id ?? "" },
                    signal,
                })
            profiles.set(conversation.other_user?.id ?? "", data)
        }
    }
    return profiles
}

export function useProfiles(
    conversations: ConversationsPublic | undefined,
    conversationsLoaded: boolean,
) {
    const users = (conversations?.data ?? [])
        .map((conversation) => conversation.other_user)
        .filter((user): user is UserPublic => Boolean(user))
    const userKeys = users.map((user) => `${user.id}:${user.active_role}`).sort()
    
    const profilesQuery = useQuery<Map<string, ConversationProfile>>({
        queryKey: chatKeys.profiles(userKeys),
        enabled: conversationsLoaded && userKeys.length > 0,
        staleTime: 5 * 60 * 1000,
        queryFn: ({ signal }) => fetchProfiles(conversations, signal),
    })

    return profilesQuery;
}
