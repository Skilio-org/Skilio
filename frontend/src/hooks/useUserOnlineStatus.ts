import { ChatService } from "@/client/sdk.gen"
import { useQuery } from "@tanstack/react-query"

export function useUserOnlineStatus(uuid: string | undefined) {
	const { data: presence, isPending: presencePending } = useQuery({
		queryKey: ["chat", "presence", uuid],
		enabled: Boolean(uuid),
		refetchInterval: 30_000,
		queryFn: async ({ signal: signal }) => {
			if (!uuid) throw new Error("A user is required")
			const response = await ChatService.checkUserPresence({
				path: { user_id: uuid },
				signal: signal,
			})
			return response.data
		},

		// Optional extras:
		refetchIntervalInBackground: false, // Stops polling when browser tab loses focus (default: false)
		staleTime: 10_000, // Keeps data fresh for 10s before marking stale
	})
	return { isOnline: presence?.is_online ?? false, isPending: presencePending }
}
