import { useQuery } from "@tanstack/react-query"
import { ChatService } from "@/client"

export function useUserOnlineStatus(userId: string | undefined) {
	const { data: presence, isPending } = useQuery({
		queryKey: ["chat", "presence", userId],
		enabled: Boolean(userId),
		refetchInterval: 30_000,
		staleTime: 10_000,
		queryFn: async ({ signal }) => {
			if (!userId) throw new Error("A user is required")
			const response = await ChatService.checkUserPresence({ path: { user_id: userId }, signal })
			return response.data
		},
	})
	return { isOnline: presence?.is_online ?? false, isPending }
}

export function useUsersOnline(userIds: string[])
{
    const { data, isPending } = useQuery({
        queryKey: ["chat", "presence", userIds],
        enabled: userIds.length > 0,
        refetchInterval: 30_000,
        staleTime: 10_000,
        queryFn: async ({ signal }) => {
            const response = await ChatService.checkMultipleUserPresence({
                query: { user_ids: userIds },
                signal,
            })

            return response.data
        },
    })

	const onlineUsers =
    Object.fromEntries(
        data?.map((presence) => [presence.user_id, presence.is_online]) ?? [],
    ) satisfies Record<string, boolean>

    if (userIds.length === 0) {
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