import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, CheckCircle2, Circle } from "lucide-react"
import { ProfilesService } from "@/client"
import { profileFormFromApi, profileProgress } from "@/components/freelancer/profile-editor/profile-form"
import { queryKeys } from "@/lib/query-keys"

interface FreelancerProfileReadinessCardProps {
	userId?: string
}

export function FreelancerProfileReadinessCard({ userId }: FreelancerProfileReadinessCardProps) {
	const { data: profile } = useQuery({
		queryKey: queryKeys.freelancerProfile(userId),
		enabled: !!userId,
		queryFn: async ({ signal }) => (await ProfilesService.readProfileMe({ signal })).data,
	})

	const profileForm = profile ? profileFormFromApi(profile) : null
	const progress = profileForm ? profileProgress(profileForm) : null

	const hasSkillsAndRate = Boolean((profile?.skills?.length ?? 0) > 0 && (profile?.hourly_rate ?? 0) > 0)
	const hasPortfolio = Boolean((profile?.portfolio?.length ?? 0) > 0 || (profile?.portfolio_media?.length ?? 0) > 0)
	const isProfileFinished = Boolean(profile?.finished)
	const isAllDone = isProfileFinished && hasSkillsAndRate && hasPortfolio
	const completionPercent = isAllDone ? 100 : (progress?.percent ?? 0)

	// Once the profile is fully completed and finished, hide the onboarding card completely.
	if (isAllDone || completionPercent >= 100) {
		return null
	}

	return (
		<section className="relative overflow-hidden rounded-lg border border-outline-variant bg-gradient-to-b from-[#e8f1fc] to-[#f0f6fd] p-5 dark:bg-surface-card dark:bg-none dark:shadow-none">
			<div className="mb-3">
				<h2 className="font-headline-sm font-semibold text-headline-sm text-on-surface">
					Let your profile do the talking
				</h2>

				<p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
					<span className="font-medium text-on-surface">Complete your profile to get higher chances of hiring.</span>{" "}
					Add your verified skills, set your target rate, and showcase client work you’re proud of.
				</p>
			</div>

			<div className="my-3.5 rounded-lg border border-outline-variant bg-surface-container-lowest p-3.5 shadow-sm dark:border-border-subtle dark:bg-surface-panel dark:shadow-none">
				<div className="mb-2 flex items-center justify-between font-caption text-caption">
					<div className="flex items-center gap-2">
						<span className="font-medium text-on-surface dark:text-on-surface-soft">Profile readiness</span>
						<span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-on-surface dark:bg-primary/20 dark:text-primary">
							{completionPercent}%
						</span>
					</div>

					<Link to="/freelancer" className="font-medium text-link transition-colors hover:underline dark:text-primary">
						Review
					</Link>
				</div>

				<div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container dark:bg-border-dark">
					<div
						className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
						style={{ width: `${completionPercent}%` }}
					/>
				</div>

				<ul className="flex flex-col gap-2 font-caption text-caption text-on-surface-variant">
					<li>
						<Link to="/freelancer" className="group flex items-center gap-2 transition-colors hover:text-on-surface">
							{hasSkillsAndRate ? (
								<CheckCircle2 className="size-3.5 shrink-0 text-primary dark:text-primary" />
							) : (
								<Circle className="size-3.5 shrink-0 text-outline group-hover:text-on-surface-variant" />
							)}
							<span
								className={hasSkillsAndRate ? "text-on-surface" : "text-on-surface-variant group-hover:text-on-surface"}
							>
								Keep your skills and rate current
							</span>
						</Link>
					</li>

					<li>
						<Link to="/freelancer" className="group flex items-center gap-2 transition-colors hover:text-on-surface">
							{hasPortfolio ? (
								<CheckCircle2 className="size-3.5 shrink-0 text-primary dark:text-primary" />
							) : (
								<Circle className="size-3.5 shrink-0 text-outline group-hover:text-on-surface-variant" />
							)}
							<span
								className={hasPortfolio ? "text-on-surface" : "text-on-surface-variant group-hover:text-on-surface"}
							>
								Show strong portfolio work
							</span>
						</Link>
					</li>

					<li>
						<Link to="/freelancer" className="group flex items-center gap-2 transition-colors hover:text-on-surface">
							{isProfileFinished ? (
								<CheckCircle2 className="size-3.5 shrink-0 text-primary dark:text-primary" />
							) : (
								<Circle className="size-3.5 shrink-0 text-outline group-hover:text-on-surface-variant" />
							)}
							<span
								className={
									isProfileFinished ? "text-on-surface" : "text-on-surface-variant group-hover:text-on-surface"
								}
							>
								Review your public profile before applying
							</span>
						</Link>
					</li>
				</ul>
			</div>

			<Link
				to="/freelancer"
				className="group flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-hover"
			>
				{isAllDone ? "Review profile" : "Complete profile"}
				<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
			</Link>
		</section>
	)
}
