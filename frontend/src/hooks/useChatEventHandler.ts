import { useCallback, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type {
	ChatMessagePublic,
	ConversationDetailPublic,
	ConversationsPublic,
} from "@/client"
import { chatKeys } from "@/data/chat-keys"
// import { toast } from "sonner"

type ChatMessageUpdateOptions = {
	incrementUnread?: boolean
	isViewingConversation?: boolean
}

// function playBeep(frequency = 440, duration = 150, type = "sine")
// {
//       // Reuse or create AudioContext
//       const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

//       const oscillator = audioCtx.createOscillator();
//       const gainNode = audioCtx.createGain();

//       oscillator.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
//       oscillator.frequency.value = frequency; // Hz (440Hz is standard pitch A)

//       // Smooth volume fade to avoid harsh clicking sounds
//       gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Volume (0.0 to 1.0)
//       gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration / 1000);

//       oscillator.connect(gainNode);
//       gainNode.connect(audioCtx.destination);

//       oscillator.start();
//       oscillator.stop(audioCtx.currentTime + duration / 1000);
// }

export function useChatEventHandlers() {
	const queryClient = useQueryClient()

	const handleIncomingMessage = useCallback(
		async (
			message: ChatMessagePublic,
			{ incrementUnread = true, isViewingConversation = false }: ChatMessageUpdateOptions = {},
		) => {
			let foundInAny = false
			const allQueries = queryClient.getQueriesData<ConversationsPublic>({
				queryKey: [...chatKeys.all, "conversations"],
			})

			for (const [, queryData] of allQueries) {
				if (queryData?.data?.some((item) => item.id === message.conversation_id)) {
					foundInAny = true
					break
				}
			}

			if (!foundInAny) {
				queryClient.setQueryData(
					chatKeys.conversation(message.conversation_id),
					(current: ConversationDetailPublic | undefined) => {
						if (!current) return current
						if (current.messages?.some((existing) => existing.id === message.id)) {
							return current
						}
						return {
							...current,
							last_message: message,
							messages: [...(current.messages ?? []), message],
							unread_count: (current.unread_count ?? 0) + (incrementUnread && !isViewingConversation ? 1 : 0),
						}
					},
				)
				await queryClient.refetchQueries({
					queryKey: [...chatKeys.all, "conversations"],
				})
				return
			}

			queryClient.setQueriesData<ConversationsPublic>(
				{ queryKey: [...chatKeys.all, "conversations"] },
				(current) => {
					if (!current) return current
					const conversation = current.data.find((item) => item.id === message.conversation_id)
					if (!conversation) return current
					return {
						...current,
						data: [
							{
								...conversation,
								last_message: message,
								unread_count: (conversation.unread_count ?? 0) + (incrementUnread && !isViewingConversation ? 1 : 0),
							},
							...current.data.filter((item) => item.id !== message.conversation_id),
						],
					}
				},
			)

			queryClient.setQueryData(
				chatKeys.conversation(message.conversation_id),
				(current: ConversationDetailPublic | undefined) => {
					if (!current) return current
					if (current.messages?.some((existing) => existing.id === message.id)) {
						return current
					}
					return {
						...current,
						last_message: message,
						messages: [...(current.messages ?? []), message],
						unread_count: (current.unread_count ?? 0) + (incrementUnread && !isViewingConversation ? 1 : 0),
					}
				},
			)
		},
		[queryClient],
	)

	return useMemo(() => {
		return { handleIncomingMessage }
	}, [handleIncomingMessage])
}
