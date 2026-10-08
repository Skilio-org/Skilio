import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ProfilesService } from "@/client"
import useAuth from "@/hooks/useAuth"

export function useFreelancerAvailability() {
	const { user } = useAuth()
	const client = useQueryClient()
	const queryKey = ["freelancer-availability", user?.id]
	const query = useQuery({
		queryKey,
		enabled: Boolean(user),
		queryFn: async () => {
			return (await ProfilesService.readProfileMe()).data.is_available ?? true
		},
	})
	const mutation = useMutation({
		mutationFn: async (available: boolean) => {
			const { data } = await ProfilesService.updateProfileMe({
				body: {
					is_available: available,
					availability: available ? "Available now" : "Not currently available",
				},
			})
			return data.is_available ?? available
		},
		onSuccess: (available) => client.setQueryData(queryKey, available),
		onError: () => toast.error("Couldn't update availability. Please try again."),
	})
	return {
		available: query.data,
		pending: query.isPending || mutation.isPending,
		error: query.isError,
		toggle: () => mutation.mutate(!query.data),
	}
}
