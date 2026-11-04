import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { ArrowRight, Users } from "lucide-react"
import { ProfilesService } from "@/client"
import { FreelancerCard } from "@/components/talent/freelancer-card"
import { talentCardFromApi } from "@/components/talent/talent-api"
import { useSavedTalent } from "@/hooks/useSavedTalent"
import { useErrorToast } from "@/hooks/useErrorToast"

export const RecommendedFreelancers = () => {
	const {
		data: matches = [],
		isPending,
		isError,
		errorUpdatedAt,
		refetch,
	} = useQuery({
		queryKey: ["talent-profiles", { limit: 4 }],
		queryFn: async ({ signal }) => {
			const { data } = await ProfilesService.readProfiles({ query: { skip: 0, limit: 4 }, signal })
			return data.data.slice(0, 4).map(talentCardFromApi)
		},
	})
	useErrorToast(
		isError ? "Couldn’t load professionals." : undefined,
		"recommended-talent-load",
		errorUpdatedAt,
		refetch,
	)
	const { savedIds, toggleSaved } = useSavedTalent()
	return (
		<section aria-labelledby="recommended-talent-heading" className="min-w-0">
			<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="font-medium text-muted-foreground text-xs">Recommended for you</p>
					<h2 id="recommended-talent-heading" className="mt-2 font-semibold text-headline-md tracking-tight">
						People worth getting to know
					</h2>
				</div>
				<Link
					to="/talent"
					search={{ q: undefined, category: undefined }}
					className="inline-flex min-h-11 shrink-0 items-center gap-2 font-medium text-primary text-sm hover:underline"
				>
					View all <ArrowRight className="size-4" />
				</Link>
			</div>
			<div className="flex flex-col gap-3.5">
				{isPending && <p role="status">Loading professionals…</p>}
				{!isPending && !isError && matches.length === 0 && (
					<div
						role="status"
						className="grid min-h-72 place-items-center rounded-lg border border-outline-variant border-dashed bg-surface-container-lowest p-8 text-center"
					>
						<div>
							<span className="mx-auto grid size-14 place-items-center rounded-lg border border-outline-variant bg-surface-container text-primary">
								<Users className="size-6" strokeWidth={1.5} />
							</span>

							<h3 className="mt-5 font-headline-lg font-semibold text-headline-lg text-on-surface">
								No professionals available yet
							</h3>

							<p className="mx-auto mt-3 max-w-lg font-body-sm text-body-sm text-on-surface-variant leading-6">
								New freelancers will appear here as they join. You can also browse the full talent directory.
							</p>
						</div>
					</div>
				)}
				{matches.map((person) => (
					<FreelancerCard
						key={person.id}
						freelancer={person}
						saved={savedIds.includes(person.id)}
						onToggleSaved={() => toggleSaved(person.id)}
					/>
				))}
			</div>
		</section>
	)
}
