import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { ProfilesService } from "@/client"
import { FreelancerCard } from "@/components/talent/freelancer-card"
import { talentCardFromApi } from "@/components/talent/talent-api"
import { useSavedTalent } from "@/hooks/useSavedTalent"

export const RecommendedFreelancers = () => {
	const { data: matches = [], isPending, isError, refetch } = useQuery({
		queryKey: ["talent-profiles", { limit: 4 }],
		queryFn: async ({ signal }) => {
			const { data } = await ProfilesService.readProfiles({ query: { skip: 0, limit: 4 }, signal })
			return data.data.slice(0, 4).map(talentCardFromApi)
		},
	})
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
					search={{ q: undefined }}
					className="inline-flex min-h-11 shrink-0 items-center gap-2 font-medium text-primary text-sm hover:underline"
				>
					View all <ArrowRight className="size-4" />
				</Link>
			</div>
			<div className="flex flex-col gap-3.5">
				{isPending && <p role="status">Loading professionals…</p>}
				{isError && (
					<p role="alert">
						Couldn’t load professionals.{" "}
						<button type="button" onClick={() => void refetch()} className="text-primary hover:underline">
							Try again
						</button>
					</p>
				)}
				{!isPending && !isError && matches.length === 0 && (
					<p role="status">No professionals available yet.</p>
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
