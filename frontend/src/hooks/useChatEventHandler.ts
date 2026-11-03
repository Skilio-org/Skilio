import { useCallback, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
	type ChatMessagePublic,
	type ConversationDetailPublic,
	type ConversationPublic,
	type ConversationsPublic,
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
			console.log("INCOMING CONVERSATION ID", message.conversation_id)
			const current = queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations())
			if (current == undefined) {
				// toast.error("No conversations found in cache for incoming message. reload")
				return
			}
			let conversation: ConversationPublic | undefined = current?.data.find(
				(item) => item.id === message.conversation_id,
			)

			// console.log("handleIncomingMessage called with message
			// :", message)
			// alert("M!!!")
			/// BUG: `useProfiles` takes conversations.. here it does not!!
			if (!conversation) {
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
					queryKey: chatKeys.conversations(),
				})
				return
			}

			queryClient.setQueryData<ConversationsPublic>(chatKeys.conversations(), {
				...current,
				data: [
					{
						...conversation,
						last_message: message,
						unread_count: (conversation.unread_count ?? 0) + (incrementUnread && !isViewingConversation ? 1 : 0),
					},
					...current.data.filter((item) => item.id !== message.conversation_id),
				],
			})

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
			// alert("Updated conversation: " + (conversation.unread_count ?? 0) + 1);
		},
		[queryClient],
	)

	return useMemo(() => {
		return { handleIncomingMessage }
	}, [handleIncomingMessage])
}
