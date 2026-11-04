import { CategoriesService, SearchesService } from "@/client"
import CategorySelect from "@/components/common/category-select"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { useEffect, useState } from "react"

const defaultPopularSearches = ["Product design", "React", "Brand strategy", "Design systems", "AI"]

type SearchWithCategoriesProps = {
	initialQuery?: string
	initialCategory?: string
	popularSearches?: string[]
	placeholder?: string

	onSearch?: (query: string) => void
	onCategoryChange?: (category: string) => void
}

export const SearchWithCategories = ({
	initialQuery = "",
	initialCategory = "all",
	popularSearches = defaultPopularSearches,
	placeholder = "Search by title, skill, or name",
	onSearch,
	onCategoryChange,
}: SearchWithCategoriesProps) => {
	const [query, setQuery] = useState(initialQuery)
	const [category, setCategory] = useState(initialCategory)

	const {
		data: categories = [],
		isLoading: categoriesLoading,
		isError: categoriesError,
	} = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const response = await CategoriesService.readCategories()

			return response.data.data
		},
		staleTime: 1000 * 60 * 30,
	})

	const queryClient = useQueryClient()

	const saveRecentSearchMutation = useMutation({
		mutationFn: async (search: string) => {
			return SearchesService.saveRecentSearch({
				body: {
					query: search,
				},
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["recentSearch"],
			})
		},
	})

	useEffect(() => {
		setQuery(initialQuery)
	}, [initialQuery])

	useEffect(() => {
		setCategory(initialCategory)
	}, [initialCategory])

	const submitSearch = (value: string) => {
		const trimmedQuery = value.trim()
		if (!trimmedQuery) return
		setQuery(trimmedQuery)
		saveRecentSearchMutation.mutate(trimmedQuery)
		onSearch?.(trimmedQuery)
	}

	const handleCategoryChange = (value: string) => {
		setCategory(value)
		onCategoryChange?.(value)
	}

	return (
		<search className="block">
			<form
				onSubmit={(event) => {
					event.preventDefault()
					submitSearch(query)
				}}
				className="flex min-h-16 items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-3 shadow-sm"
			>
				<Search className="ml-2 size-4 shrink-0 text-outline" />

				<input
					aria-label="Search professionals"
					type="text"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder={placeholder}
					className="min-w-0 flex-1 bg-transparent text-body-sm outline-none"
				/>

				<CategorySelect
					value={category}
					categories={categories}
					onValueChange={handleCategoryChange}
					isLoading={categoriesLoading}
					isError={categoriesError}
				/>

				<button
					type="submit"
					className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md text-on-primary hover:opacity-90 dark:bg-on-surface dark:text-background"
				>
					Search
				</button>
			</form>

			<div className="mt-3 flex flex-wrap items-center gap-2 text-caption">
				<span className="mr-1 font-medium">Popular searches:</span>

				{popularSearches.map((item) => (
					<button
						key={item}
						type="button"
						onClick={() => submitSearch(item)}
						className="rounded bg-surface-container px-2.5 py-1 text-on-surface-variant hover:text-link"
					>
						{item}
					</button>
				))}
			</div>
		</search>
	)
}

export default SearchWithCategories
