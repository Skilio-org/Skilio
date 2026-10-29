import { NotificationPublic } from "@/client"
import { chatKeys } from "@/data/chat-keys"
import { useChatEventHandlers } from "@/hooks/useChatEventHandler"
import { useQueryClient } from "@tanstack/react-query"
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export type sendState = "sent" | "failed" | "pending";

export type MessageSendState = Record<string, sendState>
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
	subscribe: (eventType: string, handler: WebSocketEventHandler) => () => void,
	setMessageSendResult: (messageId: string, success: sendState) => void,
	messageSendState: MessageSendState
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
	const [messageSendState, setMessageSendState_] = useState<MessageSendState>(() => ({
		// Initial entries, if any
	}))
	const [isConnected, setIsConnected] = useState(false)
	const wsRef = useRef<WebSocket | null>(null)
	const subscribersRef = useRef<Map<string, Set<WebSocketEventHandler>>>(new Map())
	const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
	const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const isMountedRef = useRef(true)

	const queryClient = useQueryClient()
	const queryClientRef = useRef(queryClient)
	const { handleIncomingMessage } = useChatEventHandlers()
	const setMessageSendResult = useCallback((messageId: string, state: sendState) => {
		setMessageSendState_((prev) => ({
			...prev,
			[messageId]: state,
		}))
	}, [])

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
			const ws = wsRef.current
			ws.onopen = null
			ws.onmessage = null
			ws.onclose = null
			ws.onerror = null
			// wsRef.current.close()
			if (ws.readyState === WebSocket.CONNECTING) {
				// Wait until it's open before cleanly closing, or close gracefully
				ws.onopen = () => {
					ws.close(1000);
				};
			} else if (ws.readyState === WebSocket.OPEN) {
				ws.close(1000);
			}
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
			const ws = new WebSocket(url)

			ws.addEventListener("error", () => {
				ws.close()
			})
			wsRef.current = ws

			ws.onopen = () => {
				if (!isMountedRef.current) ws.close(1000)
			}

			ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data)
					const eventType = data.type || "custom"
					switch (eventType) {
						case "pong":
							// Ignore pong messages
							return
						case "connection_established": {
							setIsConnected(true)
							pingIntervalRef.current = setInterval(() => {
								if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" }))
							}, 25000)
							return
						};
						case "chat_message": {
							handleIncomingMessage(data.data, {
								incrementUnread: true,
								isViewingConversation: false,
							})
						} break;
						case "notification": {
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
							toast.info(data.data.title, {
								description: data.data.content || data.data.body,
							})
						} break;
						case "message_ack": {
							const clientMessageId = data.data?.client_message_id
							if (clientMessageId) setMessageSendResult(clientMessageId, "sent")
						} break;
						case "message_ack_failed": {
							const clientMessageId = data.data?.client_message_id
							if (clientMessageId) setMessageSendResult(clientMessageId, "failed")
						} break;
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
				if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
				// console.log("WebSocket closed:", e.code, e.reason)
				if (e.code === WebSocketCloseCodes.PolicyViolation) {
					localStorage.clear()
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
	}, [cleanupSocket, handleIncomingMessage, queryClient, setMessageSendResult])

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

	useEffect(() => {
		isMountedRef.current = true
		// connect()
		const timer = setTimeout(() => {
			if (isMountedRef.current) {
				connect();
			}
	    }, 50);

		window.addEventListener("storage", handleStorage)
		window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, handleAuthTokenChanged)

		return () => {
			isMountedRef.current = false
			clearTimeout(timer);
			window.removeEventListener("storage", handleStorage)
			window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, handleAuthTokenChanged)
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
		<WebSocketContext.Provider value={{ isConnected, sendMessage, subscribe, setMessageSendResult, messageSendState }}>{children}</WebSocketContext.Provider>
	)
}

export function useWebSocket(): WebSocketContextType {
	const context = useContext(WebSocketContext)
	if (!context) {
		throw new Error("useWebSocket must be used within a WebSocketProvider")
	}
	return context
}
