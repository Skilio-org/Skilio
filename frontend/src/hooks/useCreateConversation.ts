import { ChatService, type UserRole } from "@/client"
import { chatKeys } from "@/data/chat-keys"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useCreateConversation(role?: "client" | "freelancer") {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (userId: string) => {
			const response = await ChatService.createOrGetConversation({
				body: {
					freelancer_id: userId,
					target_user_id: userId,
					as_role: role as UserRole | undefined,
				},
			})
			return response.data
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: chatKeys.conversations(role),
			})
			await queryClient.invalidateQueries({
				queryKey: chatKeys.all,
			})
		},
	})
}
