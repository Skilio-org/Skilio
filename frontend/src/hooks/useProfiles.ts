import { useQueries } from "@tanstack/react-query"
import { ClientProfilesService, ProfilesService, ConversationsPublic, type UserPublic } from "@/client"
import { chatKeys } from "@/data/chat-keys"
import type { ConversationProfile } from "@/hooks/isClientProfile"

export function createFallbackProfile(user: UserPublic, role?: "client" | "freelancer"): ConversationProfile {
	if (role === "freelancer") {
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

async function fetchProfile(
	user: UserPublic,
	role: "client" | "freelancer",
	signal: AbortSignal,
): Promise<ConversationProfile> {
	try {
		if (role === "freelancer") {
			const { data } = await ProfilesService.readProfileByUserId({
				path: { user_id: user.id },
				signal,
			})
			return (data as ConversationProfile) ?? createFallbackProfile(user, role)
		}

		const { data } = await ClientProfilesService.profilesReadClientProfileByUserId({
			path: { user_id: user.id },
			signal,
		})
		return (data as ConversationProfile) ?? createFallbackProfile(user, role)
	} catch (error) {
		console.warn("Failed to fetch profile for user, using fallback profile:", user.id, error)
		return createFallbackProfile(user, role)
	}
}

export function useProfiles(conversations: ConversationsPublic | undefined, conversationsLoaded: boolean) {
	const userRolePairs = (conversations?.data ?? [])
		.filter((conv) => Boolean(conv.other_user))
		.map((conv) => ({
			user: conv.other_user as UserPublic,
			role: conv.other_user_role as "client" | "freelancer",
		}))

	const profilesQueries = useQueries({
		queries: userRolePairs.map(({ user, role }) => ({
			queryKey: chatKeys.profile(user.id, role),
			enabled: conversationsLoaded,
			staleTime: 5 * 60 * 1000,
			queryFn: ({ signal }: { signal: AbortSignal }) => fetchProfile(user, role, signal),
		})),
	})

	const profiles = new Map<string, ConversationProfile>()
	profilesQueries.forEach((query, index) => {
		const { user, role } = userRolePairs[index]
		if (query.data) {
			profiles.set(user.id, query.data as ConversationProfile)
		} else if (!query.isPending) {
			profiles.set(user.id, createFallbackProfile(user, role))
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
