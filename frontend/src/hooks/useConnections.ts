import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ConnectionsService, type ConnectionCreate, type ConnectionPublic, type ConnectionStatus } from "@/client"
import { extractErrorMessage } from "@/utils"

export const connectionKeys = {
	all: ["connections"] as const,
	list: (status?: ConnectionStatus | null, direction?: string | null) =>
		[...connectionKeys.all, "list", { status, direction }] as const,
	status: (targetUserId: string) => [...connectionKeys.all, "status", targetUserId] as const,
}

/**
 * Hook to list connections with optional status and direction filtering.
 */
export function useConnections(options?: {
	status?: ConnectionStatus | null
	direction?: "all" | "sent" | "received" | null
}) {
	const status = options?.status ?? null
	const direction = options?.direction ?? null

	return useQuery({
		queryKey: connectionKeys.list(status, direction),
		queryFn: async ({ signal }) => {
			try {
				const response = await ConnectionsService.listConnections({
					query: {
						status: status ?? undefined,
						direction: direction ?? undefined,
					},
					signal,
				})
				return response.data?.data || []
			} catch (err) {
				console.error("Failed to fetch connections:", err)
				return [] as ConnectionPublic[]
			}
		},
	})
}

/**
 * Hook to get connection relationship state with a specific user.
 * Returns: "none" | "pending_sent" | "pending_received" | "connected"
 */
export function useConnectionStatus(targetUserId?: string | null) {
	return useQuery({
		queryKey: connectionKeys.status(targetUserId || ""),
		enabled: Boolean(targetUserId),
		queryFn: async ({ signal }) => {
			if (!targetUserId) return { status: "none" as const, connection_id: null }
			try {
				const response = await ConnectionsService.getConnectionStatus({
					path: { target_user_id: targetUserId },
					signal,
				})
				return response.data
			} catch (err) {
				console.error("Failed to get connection status:", err)
				return { status: "none" as const, connection_id: null }
			}
		},
	})
}

/**
 * Mutation to send a new connection request (with optional 300-char note and job post reference).
 */
export function useSendConnectionRequest() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: ConnectionCreate) => {
			return await ConnectionsService.sendConnectionRequest({
				body: data,
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: connectionKeys.all })
			toast.success("Connection request sent!", {
				description: "The recipient will be notified. Once accepted, direct chat will unlock.",
			})
		},
		onError: (error: any) => {
			const message = extractErrorMessage(error) || "Failed to send connection request"
			toast.error(message)
		},
	})
}

/**
 * Mutation to accept an incoming connection request.
 */
export function useAcceptConnectionRequest() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (connectionId: string) => {
			return await ConnectionsService.acceptConnectionRequest({
				path: { connection_id: connectionId },
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: connectionKeys.all })
			queryClient.invalidateQueries({ queryKey: ["conversations"] })
			toast.success("Connection accepted!", {
				description: "Direct messaging and collaboration is now unlocked.",
			})
		},
		onError: (error: any) => {
			const message = extractErrorMessage(error) || "Failed to accept connection request"
			toast.error(message)
		},
	})
}

/**
 * Mutation to decline an incoming connection request.
 */
export function useDeclineConnectionRequest() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (connectionId: string) => {
			return await ConnectionsService.declineConnectionRequest({
				path: { connection_id: connectionId },
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: connectionKeys.all })
			toast.info("Connection request declined.")
		},
		onError: (error: any) => {
			const message = extractErrorMessage(error) || "Failed to decline connection request"
			toast.error(message)
		},
	})
}

/**
 * Mutation to withdraw an outgoing pending connection request.
 */
export function useWithdrawConnectionRequest() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (connectionId: string) => {
			return await ConnectionsService.withdrawConnectionRequest({
				path: { connection_id: connectionId },
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: connectionKeys.all })
			toast.info("Connection request withdrawn.")
		},
		onError: (error: any) => {
			const message = extractErrorMessage(error) || "Failed to withdraw connection request"
			toast.error(message)
		},
	})
}

/**
 * Mutation to remove an existing connection.
 */
export function useRemoveConnection() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (connectionId: string) => {
			return await ConnectionsService.removeConnection({
				path: { connection_id: connectionId },
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: connectionKeys.all })
			toast.info("Connection removed.")
		},
		onError: (error: any) => {
			const message = extractErrorMessage(error) || "Failed to remove connection"
			toast.error(message)
		},
	})
}
