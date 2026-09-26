import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ProfilesService } from "@/client"
import useAuth from "@/hooks/useAuth"

type SavedTalentOptions = {
	query?: string
	sortBy?: "rate_asc" | "rate_desc" | "newest"
}

export function useSavedTalent(options: SavedTalentOptions = {}) {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	const savedQuery = useQuery({
		queryKey: ["saved-talent", options.query ?? "", options.sortBy ?? "newest"],
		enabled: Boolean(user),
		queryFn: async ({ signal }) => {
			const { data } = await ProfilesService.readSavedProfiles({
				query: {
					q: options.query || undefined,
					sort_by: options.sortBy ?? "newest",
					skip: 0,
					limit: 100,
				},
				signal,
			})
			return data
		},
	})
	const saveMutation = useMutation({
		mutationFn: ({ id, saved }: { id: string; saved: boolean }) =>
			saved ? ProfilesService.unsaveProfile({ path: { id } }) : ProfilesService.saveProfile({ path: { id } }),
		onSuccess: async (_, { saved }) => {
			await queryClient.invalidateQueries({ queryKey: ["saved-talent"] })
			await queryClient.invalidateQueries({ queryKey: ["talent-profiles"] })
			await queryClient.invalidateQueries({ queryKey: ["talent-profile"] })
			toast.success(saved ? "Removed from saved talent" : "Added to saved talent")
		},
		onError: () => toast.error("Could not update saved talent. Please try again."),
	})
	const savedIds = savedQuery.data?.data.map((profile) => profile.id) ?? []

	const toggleSaved = (id: string) => {
		if (!user) {
			toast.error("Sign in to save talent.")
			return
		}
		saveMutation.mutate({ id, saved: savedIds.includes(id) })
	}
	return {
		savedIds,
		savedProfiles: savedQuery.data?.data ?? [],
		savedCount: savedQuery.data?.count ?? 0,
		toggleSaved,
		isPending: savedQuery.isPending,
		isError: savedQuery.isError,
		refetch: savedQuery.refetch,
	}
}
