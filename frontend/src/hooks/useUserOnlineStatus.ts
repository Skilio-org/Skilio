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
