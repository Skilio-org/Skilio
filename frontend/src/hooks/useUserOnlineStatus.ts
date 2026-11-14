import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { ChatService } from "@/client"

export function useUsersOnline(userIds: string[]) {
	const normalizedIds = useMemo(() => Array.from(new Set(userIds.filter(Boolean))).sort(), [userIds])

	const { data, isPending } = useQuery({
		queryKey: ["chat", "presence", normalizedIds],
		enabled: normalizedIds.length > 0,
		refetchInterval: 7_000,
		staleTime: 10_000,
		placeholderData: keepPreviousData,
		queryFn: async ({ signal }) => {
			const response = await ChatService.checkMultipleUserPresence({
				query: { user_ids: normalizedIds },
				signal,
			})

			return response.data
		},
	})

	const onlineUsers = useMemo(
		() =>
			Object.fromEntries(data?.map((presence) => [presence.user_id, presence.is_online]) ?? []) satisfies Record<
				string,
				boolean
			>,
		[data],
	)

	if (normalizedIds.length === 0) {
		return {
			onlineUsers: {},
			isOnline: () => false,
			isPending: false,
		}
	}
	return {
		onlineUsers,
		isOnline: (userId: string) => onlineUsers[userId] ?? false,
		isPending,
	}
}
