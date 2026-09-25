import { useQuery } from "@tanstack/react-query"
import {
	ClientProfilesService,
	ProfilesService,
	type UserPublic,
} from "@/client"
import { chatKeys } from "@/data/chat-keys"
import { useConversations } from "@/hooks/useConversations"
import type { ConversationProfile } from "@/hooks/isClientProfile"

export async function fetchProfiles(users: UserPublic[], signal: AbortSignal) {
    const profiles = new Map<string, ConversationProfile>()
    const freelancerUsers = users.filter((user) => user.active_role === "freelancer")

    if (freelancerUsers.length > 0) {
        for (const user of freelancerUsers) {
            const { data } = await ProfilesService.readProfile({
                path: {
                    id: user.id,
                },
                signal,
            })
            profiles.set(user.id, data)
        }
    }

    const clientProfiles = await Promise.all(
        users
            .filter((user) => user.active_role !== "freelancer")
            .map(async (user) => {
                const { data } = await ClientProfilesService.profilesReadClientProfileByUserId({
                    path: { user_id: user.id },
                    signal,
                })
                return [user.id, data] as const
            }),
    )

    for (const [userId, profile] of clientProfiles) profiles.set(userId, profile)
    return profiles
}

export function useProfiles() {
    const conversationsQuery = useConversations()
    const users = (conversationsQuery.data?.data ?? [])
        .map((conversation) => conversation.other_user)
        .filter((user): user is UserPublic => Boolean(user))
    const userKeys = users.map((user) => `${user.id}:${user.active_role}`).sort()
    
    const profilesQuery = useQuery<Map<string, ConversationProfile>>({
        queryKey: chatKeys.profiles(userKeys),
        enabled: conversationsQuery.isSuccess && userKeys.length > 0,
        staleTime: 5 * 60 * 1000,
        queryFn: ({ signal }) => fetchProfiles(users, signal),
    })

    return profilesQuery;
}
