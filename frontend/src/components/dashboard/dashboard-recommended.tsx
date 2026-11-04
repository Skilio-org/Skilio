import { Link } from "@tanstack/react-router"
import { ArrowRight, Search, Users } from "lucide-react"
import { EmptyState } from "@/components/common/empty-state"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import { FreelancerCard } from "@/components/talent/freelancer-card"
import { useRecommendedTalent } from "@/hooks/useRecommendedTalent"
import { useSavedTalent } from "@/hooks/useSavedTalent"
import { useErrorToast } from "@/hooks/useErrorToast"

export const RecommendedFreelancers = () => {
	const { data: matches = [], isPending, isError, errorUpdatedAt, refetch } = useRecommendedTalent()
	useErrorToast(
		isError ? "Couldn’t load professionals." : undefined,
		"recommended-talent-load",
		errorUpdatedAt,
		refetch,
	)
	const { savedIds, toggleSaved } = useSavedTalent()
	return (
		<section aria-labelledby="recommended-talent-heading" className="min-w-0">
			<div className="mb-6 flex items-center justify-between px-1">
				<h2 id="recommended-talent-heading" className="font-headline-sm font-semibold text-headline-sm text-on-surface">
					People worth getting to know
				</h2>

				<Link
					to="/talent"
					search={{ q: undefined, category: undefined }}
					className="flex items-center gap-0.5 font-label-sm font-medium text-label-sm text-link hover:underline"
				>
					View all
					<ArrowRight className="size-3.5" />
				</Link>
			</div>
			<div className="flex flex-col gap-3.5">
				{isPending && <p role="status">Loading professionals…</p>}
				{!isPending && !isError && matches.length === 0 && (
					<EmptyState
						icon={Users}
						title="No professionals available yet"
						description="New freelancers will appear here as they join. You can also browse the full talent directory."
						action={
							<Link
								to="/talent"
								search={{ q: undefined, category: undefined }}
								className={workspaceStyles.secondaryAction}
							>
								<Search className="size-4" />
								Browse talent
							</Link>
						}
					/>
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
