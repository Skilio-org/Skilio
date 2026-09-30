import { useQueries } from "@tanstack/react-query"
import { ClientProfilesService, ProfilesService, ConversationsPublic, type UserPublic } from "@/client"
import { chatKeys } from "@/data/chat-keys"
import type { ConversationProfile } from "@/hooks/isClientProfile"

export async function fetchProfile(user: UserPublic, signal: AbortSignal) {
	console.log("FETCHING PROFILE", user.id, user.active_role)
	if (user.active_role === "freelancer") {
		const { data } = await ProfilesService.readProfileByUserId({
			path: { user_id: user.id },
			signal,
		})
		return data
	}

	const { data } = await ClientProfilesService.profilesReadClientProfileByUserId({
		path: { user_id: user.id },
		signal,
	})
	return data
}

export function useProfiles(conversations: ConversationsPublic | undefined, conversationsLoaded: boolean) {
	const users = (conversations?.data ?? [])
		.map((conversation) => conversation.other_user)
		.filter((user): user is UserPublic => Boolean(user))

	const profilesQueries = useQueries({
		queries: users.map((user) => ({
			queryKey: chatKeys.profile(user.id, user.active_role ?? "client"),
			enabled: conversationsLoaded,
			staleTime: 5 * 60 * 1000,
			queryFn: ({ signal }: { signal: AbortSignal }) => fetchProfile(user, signal),
		})),
	})

	const profiles = new Map<string, ConversationProfile>()
	profilesQueries.forEach((query, index) => {
		if (query.data) {
			profiles.set(users[index].id, query.data as ConversationProfile)
		}
	})

	return {
		data: profiles,
		isPending: !conversationsLoaded || (users.length > 0 && profiles.size === 0),
		// isPending: profilesQueries.some((query) => query.isPending),
		isSuccess: profilesQueries.every((query) => query.isSuccess),
		isError: profilesQueries.some((query) => query.isError),
		isFetching: profilesQueries.some((query) => query.isFetching),
		refetch: () => Promise.all(profilesQueries.map((query) => query.refetch())),
	}
}
