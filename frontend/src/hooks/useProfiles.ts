import { type UseQueryResult, useQueries } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { ClientProfilesService, type ConversationsPublic, ProfilesService, type UserPublic } from "@/client"
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
	const { pairs: nextPairs, signature } = useMemo(() => {
		const seen = new Set<string>()
		const pairs: Array<{ user: UserPublic; role: "client" | "freelancer"; key: string }> = []
		for (const conv of conversations?.data ?? []) {
			if (!conv.other_user) continue
			const role = conv.other_user_role as "client" | "freelancer"
			const key = `${conv.other_user.id}:${role}`
			if (seen.has(key)) continue
			seen.add(key)
			pairs.push({ user: conv.other_user, role, key })
		}
		pairs.sort((a, b) => a.key.localeCompare(b.key))
		return {
			pairs,
			signature: pairs.map((p) => `${p.key}:${p.user.full_name ?? ""}`).join("\0"),
		}
	}, [conversations?.data])

	const committedRef = useRef<{ signature: string; pairs: typeof nextPairs }>({
		signature: "",
		pairs: [],
	})
	const userRolePairs = committedRef.current.signature === signature ? committedRef.current.pairs : nextPairs
	useEffect(() => {
		committedRef.current = { signature, pairs: userRolePairs }
	}, [signature, userRolePairs])

	const combine = useCallback(
		(results: UseQueryResult<ConversationProfile>[]) => {
			const profiles = new Map<string, ConversationProfile>()
			results.forEach((query, index) => {
				const pair = userRolePairs[index]
				if (!pair) return
				if (query.data) {
					profiles.set(pair.user.id, query.data)
				} else if (!query.isPending) {
					profiles.set(pair.user.id, createFallbackProfile(pair.user, pair.role))
				}
			})

			return {
				data: profiles,
				isPending: !conversationsLoaded || results.some((query) => query.isPending),
				isSuccess: results.every((query) => query.isSuccess),
				isError: results.some((query) => query.isError),
				isFetching: results.some((query) => query.isFetching),
				refetch: () => Promise.all(results.map((query) => query.refetch())),
			}
		},
		[userRolePairs, conversationsLoaded],
	)

	const queries = useMemo(
		() =>
			userRolePairs.map(({ user, role }) => ({
				queryKey: chatKeys.profile(user.id, role),
				enabled: conversationsLoaded,
				staleTime: 5 * 60 * 1000,
				queryFn: ({ signal }: { signal: AbortSignal }) => fetchProfile(user, role, signal),
			})),
		[userRolePairs, conversationsLoaded],
	)

	return useQueries({
		queries,
		combine,
	})
}
