import { Link } from "@tanstack/react-router"
import { ArrowLeft, ArrowUpRight, Bookmark, Check, Star } from "lucide-react"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import { FreelancerProfileView } from "@/components/freelancer/freelancer-profile-view"
import type { FreelancerProfileDetailPublic } from "@/client"
import { profileFromApi } from "@/components/freelancer/freelancer-profile-api"
import { accountAvatarUrl } from "@/hooks/useAccountAvatar"
import { getInitials } from "@/utils"
import { useSavedTalent } from "@/hooks/useSavedTalent"
import { FreelancerReviewsSection } from "@/components/reviews/freelancer-reviews-section"
import { useQuery } from "@tanstack/react-query"
import { loadTalentProfile } from "@/components/talent/talent-api"

export function TalentProfilePage({ person: initialPerson }: { person: FreelancerProfileDetailPublic }) {
	const { data: person } = useQuery({
		queryKey: ["talent-profile", initialPerson.id],
		initialData: initialPerson,
		queryFn: () => loadTalentProfile(initialPerson.id),
	})

	const profile = profileFromApi(person)
	const firstName = profile.name.split(" ")[0]
	const { savedIds, toggleSaved } = useSavedTalent()
	const saved = savedIds.includes(person.id)

	return (
		<div className="mx-auto w-full max-w-360 px-4 py-8 md:px-6 md:py-10">
			<FreelancerProfileView
				nameHeadingLevel="h1"
				profile={{
					name: profile.name,
					initials: getInitials(profile.name),
					avatarUrl: accountAvatarUrl(person.user_id),
					title: profile.title,
					location: profile.location,
					summary: profile.bio,
					about: profile.bio ? [profile.bio] : [],
					skills: profile.skills,
					rate: profile.rate,
					availability: profile.availability,
					weeklyCapacity: profile.hours,
					rating: person.average_rating ?? undefined,
					reviews: person.reviews_count,
					portfolio: profile.portfolio.map((entry) => ({ ...entry, category: entry.organization })),
					languages: profile.languages
						.split(",")
						.map((name) => ({ name: name.trim(), level: "" }))
						.filter((language) => language.name),
					education: profile.education,
					experience: profile.experience,
				}}
				backLink={
					<Link
						to="/talent"
						search={{ q: undefined, category: undefined }}
						className="inline-flex min-h-11 items-center gap-2 font-medium text-muted-foreground text-sm hover:text-primary"
					>
						<ArrowLeft className="size-4" />
						Back to talent
					</Link>
				}
				contactActions={
					<>
						<Link
							to="/messages"
							search={{ userId: person.user_id }}
							className={`${workspaceStyles.primaryAction} w-full`}
						>
							Message {firstName}
							<ArrowUpRight className="size-4" />
						</Link>
						<button
							type="button"
							onClick={() => toggleSaved(person.id)}
							aria-pressed={saved}
							className={`${workspaceStyles.secondaryAction} w-full`}
						>
							{saved ? <Check className="size-4" /> : <Bookmark className="size-4" />}
							{saved ? "Profile saved" : "Save profile"}
						</button>
						<a
							href="#client-reviews"
							className={`${workspaceStyles.secondaryAction} w-full inline-flex items-center justify-center gap-2`}
						>
							<Star className="size-4 fill-amber-500 text-amber-500" />
							<span>Feedback & Reviews</span>
						</a>
					</>
				}
				contactFooter={
					<>
						{saved && (
							<p role="status" className="mt-2 text-center text-muted-foreground text-xs">
								Available in your Saved talent list.
							</p>
						)}
					</>
				}
				reviewsNode={
					<FreelancerReviewsSection
						freelancerId={person.id}
						profileUserId={person.user_id}
						freelancerName={profile.name}
						freelancerTitle={profile.title}
						freelancerAvatarUrl={accountAvatarUrl(person.user_id)}
					/>
				}
				portfolioDialogAction={
					<>
						<div>
							<h3 className="font-medium text-sm">Interested in similar work?</h3>
							<p className="mt-2 text-muted-foreground text-sm leading-6">
								Start a conversation about your goals, scope, and timeline.
							</p>
						</div>
						<Link to="/messages" search={{ userId: person.user_id }} className={workspaceStyles.primaryAction}>
							Discuss a project
							<ArrowUpRight className="size-4" />
						</Link>
					</>
				}
			/>
		</div>
	)
}
