import { useQueries } from "@tanstack/react-query"
import { ClientProfilesService, ProfilesService, ConversationsPublic, type UserPublic } from "@/client"
import { chatKeys } from "@/data/chat-keys"
import type { ConversationProfile } from "@/hooks/isClientProfile"

export function createFallbackProfile(user: UserPublic): ConversationProfile {
	if (user.active_role === "freelancer") {
		return {
			id: user.id,
			user_id: user.id,
			full_name: user.full_name || "Freelancer",
			title: "Freelancer",
			is_available: true,
			availability: "Available now",
			skills: [],
			user,
		} as unknown as ConversationProfile
	}
	return {
		id: user.id,
		user_id: user.id,
		full_name: user.full_name || "Client",
		company: "",
		company_role: "Client",
		user,
	} as unknown as ConversationProfile
}

async function fetchProfile(user: UserPublic, signal: AbortSignal): Promise<ConversationProfile> {
	try {
		if (user.active_role === "freelancer") {
			const { data } = await ProfilesService.readProfileByUserId({
				path: { user_id: user.id },
				signal,
			})
			return (data as ConversationProfile) ?? createFallbackProfile(user)
		}

		const { data } = await ClientProfilesService.profilesReadClientProfileByUserId({
			path: { user_id: user.id },
			signal,
		})
		return (data as ConversationProfile) ?? createFallbackProfile(user)
	} catch (error) {
		console.warn("Failed to fetch profile for user, using fallback profile:", user.id, error)
		return createFallbackProfile(user)
	}
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
		const user = users[index]
		if (query.data) {
			profiles.set(user.id, query.data as ConversationProfile)
		} else if (!query.isPending) {
			profiles.set(user.id, createFallbackProfile(user))
		}
	})

	return {
		data: profiles,
		isPending: !conversationsLoaded || profilesQueries.some((query) => query.isPending),
		isSuccess: profilesQueries.every((query) => query.isSuccess),
		isError: profilesQueries.some((query) => query.isError),
		isFetching: profilesQueries.some((query) => query.isFetching),
		refetch: () => Promise.all(profilesQueries.map((query) => query.refetch())),
	}
}
