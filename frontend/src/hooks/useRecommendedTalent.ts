import { useQuery } from "@tanstack/react-query"
import { ProfilesService } from "@/client"
import { talentCardFromApi } from "@/components/talent/talent-api"
import { queryKeys } from "@/lib/query-keys"

const RECOMMENDED_COUNT = 4

export function useRecommendedTalent() {
	return useQuery({
		queryKey: [...queryKeys.talentProfiles, { limit: RECOMMENDED_COUNT }],
		queryFn: async ({ signal }) => {
			const { data } = await ProfilesService.readProfiles({ query: { skip: 0, limit: RECOMMENDED_COUNT }, signal })
			return data.data.map(talentCardFromApi)
		},
	})
}
