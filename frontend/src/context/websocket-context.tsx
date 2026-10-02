import { NotificationPublic } from "@/client"
import { chatKeys } from "@/data/chat-keys"
import { useChatEventHandlers } from "@/hooks/useChatEventHandler"
import { useQueryClient } from "@tanstack/react-query"
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

const enum WebSocketCloseCodes {
	NormalClosure = 1000,
	GoingAway = 1001,
	ProtocolError = 1002,
	UnsupportedData = 1003,
	NoStatusReceived = 1005,
	AbnormalClosure = 1006,
	InvalidFramePayloadData = 1007,
	PolicyViolation = 1008,
	MessageTooBig = 1009,
	MandatoryExtensionMissing = 1010,
	InternalServerError = 1011,
	TlsHandshakeFailure = 1015,
}

type WebSocketEventHandler = (data: any) => void
export const AUTH_TOKEN_CHANGED_EVENT = "auth-token-changed"

interface WebSocketContextType {
	isConnected: boolean
	sendMessage: (payload: any) => boolean
	subscribe: (eventType: string, handler: WebSocketEventHandler) => () => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

function getWebSocketUrl(): string {
	const token = localStorage.getItem("access_token")
	if (!token) return ""

	const apiUrl = import.meta.env.VITE_API_URL || ""
	let wsHost = ""

	if (apiUrl) {
		wsHost = apiUrl.replace(/^http/, "ws")
	} else if (typeof window !== "undefined") {
		if (window.location.port === "5173") {
			wsHost = `ws://${window.location.hostname}:8000`
		} else {
			const proto = window.location.protocol === "https:" ? "wss:" : "ws:"
			wsHost = `${proto}//${window.location.host}`
		}
	}

	return `${wsHost}/api/v1/chat/ws?token=${encodeURIComponent(token)}`
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
	const [isConnected, setIsConnected] = useState(false)
	const wsRef = useRef<WebSocket | null>(null)
	const subscribersRef = useRef<Map<string, Set<WebSocketEventHandler>>>(new Map())
	const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
	const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const isMountedRef = useRef(true)

	const queryClient = useQueryClient()
	const queryClientRef = useRef(queryClient)
	const { handleIncomingMessage } = useChatEventHandlers()

	// Keep queryClient ref updated to keep connect reference stable
	useEffect(() => {
		queryClientRef.current = queryClient
	}, [queryClient])

	const cleanupSocket = useCallback(() => {
		if (pingIntervalRef.current) {
			clearInterval(pingIntervalRef.current)
			pingIntervalRef.current = null
		}
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current)
			reconnectTimeoutRef.current = null
		}
		if (wsRef.current) {
			// Nullify event handlers before closing so onclose doesn't trigger a reconnect cycle
			wsRef.current.onopen = null
			wsRef.current.onmessage = null
			wsRef.current.onclose = null
			wsRef.current.onerror = null
			wsRef.current.close()
			wsRef.current = null
		}
	}, [])

	const connect = useCallback(() => {
		const token = localStorage.getItem("access_token")
		if (!token) {
			setIsConnected(false)
			return
		}

		const url = getWebSocketUrl()
		if (!url) return

		// Clean up active connection/listeners before opening a new one
		cleanupSocket()
		try {
			let ws = new WebSocket(url)

			// ws.addEventListener("error", (event) => {
			// 	ws.close()
			// })
			wsRef.current = ws

			ws.onopen = () => {
				if (!isMountedRef.current) return
				setIsConnected(true)

				pingIntervalRef.current = setInterval(() => {
					if (ws.readyState === WebSocket.OPEN) {
						ws.send(JSON.stringify({ type: "ping" }))
					}
				}, 25000)
			}

			ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data)
					const eventType = data.type || "custom"
					if (eventType === "chat_message" && data.data) {
						handleIncomingMessage(data.data, {
							incrementUnread: true,
							isViewingConversation: false,
						})
					}
					if (eventType === "notification" && data.data) {
						queryClient.setQueryData<NotificationPublic[]>(chatKeys.notifications(), 
						(currentNotifications) => {
							if (!currentNotifications) {
								return [data.data]
							}
							// Check if the notification already exists in the cache
							const exists = currentNotifications.some(
								(notification) => notification.id === data.data.id
							)
							if (exists) {
								return currentNotifications
							}
							return [data.data, ...currentNotifications]
						})
					}
					// if (eventType === "chat_message") {
					// 	queryClientRef.current.invalidateQueries({ queryKey: ["chat", "conversations"] })
					// 	if (data.data?.conversation_id) {
					// 		queryClientRef.current.invalidateQueries({
					// 			queryKey: ["chat", "conversation", data.data.conversation_id],
					// 		})
					// 	}
					// }

					if (eventType === "notification" && data.data?.title) {
						toast.info(data.data.title, {
							description: data.data.content || data.data.body,
						})
					}

					const handlers = subscribersRef.current.get(eventType)
					if (handlers) {
						for (const handler of handlers) {
							handler(data.data ?? data)
						}
					}

					const wildcardHandlers = subscribersRef.current.get("*")
					if (wildcardHandlers) {
						for (const handler of wildcardHandlers) {
							handler(data)
						}
					}
				} catch {
					// Ignore non-JSON or heartbeat response
				}
			}
			ws.onclose = (e) => {
				if (e.code === WebSocketCloseCodes.PolicyViolation) {
					localStorage.removeItem("access_token")
					window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT))
					return
				}
				if (isMountedRef.current) {
					setIsConnected(false)
					if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)

					// Auto-reconnect after 3s if still logged in
					if (localStorage.getItem("access_token")) {
						reconnectTimeoutRef.current = setTimeout(() => {
							connect()
						}, 3000)
					}
				}
			}
		} catch (error) {
			if (isMountedRef.current) {
				setIsConnected(false)
			}
		}
	}, [cleanupSocket])

	// let handleStorage: (e: StorageEvent) => void
	const handleStorage = (e: StorageEvent) => {
		if (e.newValue) {
			if (e.key === "access_token") {
				connect()
			} else {
				cleanupSocket()
				setIsConnected(false)
			}
		}
	}
	const handleAuthTokenChanged = () => {
		if (localStorage.getItem("access_token")) {
			connect()
		} else {
			cleanupSocket()
			setIsConnected(false)
		}
	}
	const safeConnect = useCallback(() => {
		isMountedRef.current = true
		connect()

		window.addEventListener("storage", handleStorage)
		window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, handleAuthTokenChanged)
	}, [connect])

	useEffect(() => {
		window.addEventListener("DOMContentLoaded", safeConnect)
		return () => {
			isMountedRef.current = false
			window.removeEventListener("storage", handleStorage)
			window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, handleAuthTokenChanged)
			window.removeEventListener("DOMContentLoaded", safeConnect)
			cleanupSocket()
		}
	}, [connect, cleanupSocket])

	const sendMessage = useCallback((payload: any): boolean => {
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			const text = typeof payload === "string" ? payload : JSON.stringify(payload)
			wsRef.current.send(text)
			return true
		}
		return false
	}, [])

	const subscribe = useCallback((eventType: string, handler: WebSocketEventHandler) => {
		if (!subscribersRef.current.has(eventType)) {
			subscribersRef.current.set(eventType, new Set())
		}
		subscribersRef.current.get(eventType)?.add(handler)

		return () => {
			subscribersRef.current.get(eventType)?.delete(handler)
		}
	}, [])

	return (
		<WebSocketContext.Provider value={{ isConnected, sendMessage, subscribe }}>{children}</WebSocketContext.Provider>
	)
}

export function useWebSocket(): WebSocketContextType {
	const context = useContext(WebSocketContext)
	if (!context) {
		throw new Error("useWebSocket must be used within a WebSocketProvider")
	}
	return context
}
