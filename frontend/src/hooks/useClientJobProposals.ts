import { useInfiniteQuery } from "@tanstack/react-query"
import { ProposalsService } from "@/client"
import { queryKeys } from "@/lib/query-keys"

const PAGE_SIZE = 20

export function useClientJobProposals(jobId: string) {
	return useInfiniteQuery({
		queryKey: queryKeys.clientJobProposals(jobId),
		initialPageParam: 0,
		queryFn: async ({ pageParam, signal }) => {
			const { data } = await ProposalsService.readProposalsForJob({
				path: { job_id: jobId },
				query: { skip: pageParam, limit: PAGE_SIZE },
				signal,
			})
			return data
		},
		getNextPageParam: (lastPage, pages) => {
			const loaded = pages.reduce((total, page) => total + page.data.length, 0)
			return loaded < lastPage.count && lastPage.data.length ? loaded : undefined
		},
	})
}
