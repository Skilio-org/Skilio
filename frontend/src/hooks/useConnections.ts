import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ConnectionsService, type ConnectionCreate, type ConnectionStatus, type NotificationPublic } from "@/client"
import { chatKeys } from "@/data/chat-keys"

export const connectionNoteMaxLength = 300

export const connectionKeys = {
	all: ["connections"] as const,
	list: (status?: ConnectionStatus | null, direction?: string | null) =>
		[...connectionKeys.all, "list", { status, direction }] as const,
	status: (targetUserId: string) => [...connectionKeys.all, "status", targetUserId] as const,
}

const noConnection = { status: "none" as const, connection_id: null }

function errorMessage(error: unknown, fallback: string) {
	const { body, message } = (error ?? {}) as { body?: { detail?: unknown }; message?: string }
	return typeof body?.detail === "string" ? body.detail : message || fallback
}

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
					query: { status: status ?? undefined, direction: direction ?? undefined },
					signal,
				})
				return response.data || []
			} catch {
				return { data: [], count: 0 }
			}
		},
	})
}

// Relationship with one user: "none" | "pending_sent" | "pending_received" | "connected".
export function useConnectionStatus(targetUserId?: string | null) {
	return useQuery({
		queryKey: connectionKeys.status(targetUserId || ""),
		enabled: Boolean(targetUserId),
		queryFn: async ({ signal }) => {
			if (!targetUserId) return noConnection
			try {
				const response = await ConnectionsService.getConnectionStatus({
					path: { target_user_id: targetUserId },
					signal,
				})
				return response.data
			} catch {
				return noConnection
			}
		},
	})
}

export function useSendConnectionRequest() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: ConnectionCreate) => ConnectionsService.sendConnectionRequest({ body: data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: connectionKeys.all })
			queryClient.invalidateQueries({ queryKey: chatKeys.notifications() })
			toast.success("Connection request sent!", {
				description: "The recipient will be notified. Once accepted, direct chat will unlock.",
			})
		},
		onError: (error) => toast.error(errorMessage(error, "Failed to send connection request")),
	})
}

// Accept, decline, withdraw and remove all take a connection id and refresh both connections and notifications caches.
function useConnectionAction(
	action: (connectionId: string) => Promise<unknown>,
	notify: () => void,
	failureMessage: string,
	newStatus?: "accepted" | "declined" | "withdrawn",
) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: action,
		onSuccess: (_data, connectionId) => {
			queryClient.invalidateQueries({ queryKey: connectionKeys.all })
			queryClient.invalidateQueries({ queryKey: chatKeys.notifications() })

			if (newStatus && connectionId) {
				queryClient.setQueryData<NotificationPublic[]>(chatKeys.notifications(), (current) => {
					if (!current) return current
					return current.map((item) => {
						if (item.connection?.id === connectionId || (item as any).connection_id === connectionId) {
							return {
								...item,
								is_read: true,
								connection: item.connection
									? { ...item.connection, status: newStatus }
									: ({ id: connectionId, status: newStatus } as any),
							}
						}
						return item
					})
				})
			}

			notify()
		},
		onError: (error) => toast.error(errorMessage(error, failureMessage)),
	})
}

export const useAcceptConnectionRequest = () =>
	useConnectionAction(
		(id) => ConnectionsService.acceptConnectionRequest({ path: { connection_id: id } }),
		() =>
			toast.success("Connection accepted!", {
				description: "Direct messaging and collaboration is now unlocked.",
			}),
		"Failed to accept connection request",
		"accepted",
	)

export const useDeclineConnectionRequest = () =>
	useConnectionAction(
		(id) => ConnectionsService.declineConnectionRequest({ path: { connection_id: id } }),
		() => toast.info("Connection request declined."),
		"Failed to decline connection request",
		"declined",
	)

export const useWithdrawConnectionRequest = () =>
	useConnectionAction(
		(id) => ConnectionsService.withdrawConnectionRequest({ path: { connection_id: id } }),
		() => toast.info("Connection request withdrawn."),
		"Failed to withdraw connection request",
		"withdrawn",
	)

export const useRemoveConnection = () =>
	useConnectionAction(
		(id) => ConnectionsService.removeConnection({ path: { connection_id: id } }),
		() => toast.info("Connection removed."),
		"Failed to remove connection",
	)
