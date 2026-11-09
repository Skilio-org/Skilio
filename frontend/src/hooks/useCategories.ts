import { useQuery } from "@tanstack/react-query"
import { CategoriesService } from "@/client"
import { queryKeys } from "@/lib/query-keys"
import { PLATFORM_CATEGORIES } from "@/data/categories"

export { PLATFORM_CATEGORIES, type PlatformCategory } from "@/data/categories"

// Categories come from a backend enum, so they almost never change.
export function useCategories() {
	return useQuery({
		queryKey: queryKeys.categories,
		queryFn: async () => (await CategoriesService.readCategories()).data.data,
		initialData: () => [...PLATFORM_CATEGORIES],
		staleTime: 1000 * 60 * 30,
	})
}
