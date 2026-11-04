import SearchWithCategories from "@/components/common/search-with-categories"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

export const TalentSearch = () => {
	const navigate = useNavigate()
	const [category, setCategory] = useState("all")

	return (
		<section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
			<div className="mb-5 flex items-start justify-between gap-5">
				<div>
					<h2 className="font-headline-sm font-semibold text-headline-sm text-on-surface">
						Who would make your next project better?
					</h2>

					<p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
						Find the right person for the work you have in mind.
					</p>
				</div>
			</div>

			<SearchWithCategories
				initialCategory={category}
				placeholder="Try a role, skill, or area of expertise"
				popularSearches={["Product designer", "React developer", "AI engineer"]}
				onCategoryChange={setCategory}
				onSearch={(query) => {
					void navigate({
						to: "/talent",
						search: {
							q: query || undefined,
							category: category === "all" ? undefined : category,
						},
					})
				}}
			/>
		</section>
	)
}
