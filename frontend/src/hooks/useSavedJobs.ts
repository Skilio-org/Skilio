import { JobsService, type SavedJobPublic, type SavedJobsPublic } from "@/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import useAuth from "@/hooks/useAuth"
import { queryKeys } from "@/lib/query-keys"

export function useSavedJobs() {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	const savedQuery = useQuery({
		queryKey: queryKeys.savedJobs,
		enabled: Boolean(user),
		queryFn: async ({ signal }) => {
			const { data } = await JobsService.readSavedJobs({
				query: { skip: 0, limit: 100, sort_by: "newest" },
				signal,
			})
			return data
		},
	})
	const saveMutation = useMutation({
		mutationFn: async ({ id, saved }: { id: string; saved: boolean }) => {
			if (saved) {
				await JobsService.deleteSavedJobItem({ path: { id } })
				return
			}
			await JobsService.createSavedJob({ body: { job_post_id: id } })
		},
		onMutate: async ({ id, saved }) => {
			await queryClient.cancelQueries({ queryKey: queryKeys.savedJobs })
			const previous = queryClient.getQueryData<SavedJobsPublic>(queryKeys.savedJobs)

			if (previous) {
				const nextData = saved
					? previous.data.filter((item) => item.job_post_id !== id)
					: [...previous.data, { id, job_post_id: id } as SavedJobPublic]
				queryClient.setQueryData<SavedJobsPublic>(queryKeys.savedJobs, {
					...previous,
					data: nextData,
					count: saved ? Math.max(0, previous.count - 1) : previous.count + 1,
				})
			}

			return { previous }
		},
		onSuccess: async (_, { saved }) => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.savedJobs })
			await queryClient.invalidateQueries({ queryKey: queryKeys.freelancerJobs })
			toast.success(saved ? "Removed from saved jobs" : "Added to saved jobs")
		},
		onError: (_error, _variables, context) => {
			if (context?.previous) queryClient.setQueryData(queryKeys.savedJobs, context.previous)
			toast.error("Could not update saved jobs. Please try again.")
		},
	})
	const saved = savedQuery.data?.data ?? []
	const toggleSaved = (id: string) => {
		if (!user) {
			toast.error("Sign in to save jobs.")
			return
		}
		saveMutation.mutate({ id, saved: saved.some((item) => item.job_post_id === id) })
	}
	return {
		saved: saved.map((item) => item.job_post_id),
		savedJobs: saved.flatMap((item) => (item.job_post ? [item.job_post] : [])),
		savedAt: Object.fromEntries(saved.map((item) => [item.job_post_id, item.created_at ?? ""])),
		loaded: !savedQuery.isPending,
		error: savedQuery.isError ? "Could not load saved jobs." : "",
		toggleSaved,
	}
}
