import { ChatService } from "@/client"
import { chatKeys } from "@/data/chat-keys"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useCreateConversation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (userId: string) => {
			const response = await ChatService.createOrGetConversation({
				body: { freelancer_id: userId },
			})
			return response.data
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: chatKeys.conversations(),
			})
		},
	})
}
