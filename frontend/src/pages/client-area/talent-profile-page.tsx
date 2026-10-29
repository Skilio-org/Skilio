import { Link } from "@tanstack/react-router"
import { ArrowLeft, ArrowUpRight, Bookmark, Check, Star } from "lucide-react"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import { FreelancerProfileView } from "@/components/freelancer/freelancer-profile-view"
import type { FreelancerProfileDetailPublic } from "@/client"
import { accountAvatarUrl } from "@/hooks/useAccountAvatar"
import { getInitials } from "@/utils"
import { useSavedTalent } from "@/hooks/useSavedTalent"
import { FreelancerReviewsSection } from "@/components/reviews/freelancer-reviews-section"
import { useQuery } from "@tanstack/react-query"
import { loadTalentProfile } from "@/components/talent/talent-api"

export function TalentProfilePage({ person: initialPerson }: { person: FreelancerProfileDetailPublic }) {
	const { data: person } = useQuery({
		queryKey: ["talent-profile", initialPerson.user_id],
		initialData: initialPerson,
		queryFn: () => loadTalentProfile(initialPerson.user_id),
	})

	const name = person.full_name ?? person.user?.full_name ?? ""
	const firstName = name.split(" ")[0]
	const { savedIds, toggleSaved } = useSavedTalent()
	const saved = savedIds.includes(person.id)

	return (
		<div className="mx-auto w-full max-w-360 px-4 py-8 md:px-6 md:py-10">
			<FreelancerProfileView
				nameHeadingLevel="h1"
				profile={{
					name,
					initials: getInitials(name),
					avatarUrl: accountAvatarUrl(person.user_id),
					title: person.title ?? "",
					location: person.location ?? "",
					summary: person.bio ?? "",
					about: person.bio ? [person.bio] : [],
					skills: person.skills ?? [],
					rate: person.hourly_rate == null ? "" : String(person.hourly_rate),
					availability: person.availability ?? "",
					weeklyCapacity: person.hours ?? "",
					rating: person.average_rating ?? undefined,
					reviews: person.reviews_count,
					portfolio: (person.portfolio ?? []).map((entry) => ({
						id: entry.id,
						title: entry.title,
						category: entry.organization ?? "",
						detail: entry.detail ?? entry.description ?? "",
						url: entry.url ?? "",
					})),
					languages: (person.languages ?? "")
						.split(",")
						.map((name) => ({ name: name.trim(), level: "" }))
						.filter((language) => language.name),
					education: (person.educations ?? []).map((entry) => ({
						id: entry.id,
						title: entry.title ?? entry.degree ?? "",
						organization: entry.organization ?? entry.institution ?? "",
						detail: entry.detail ?? entry.description ?? "",
					})),
					experience: (person.experiences ?? []).map((entry) => ({
						id: entry.id,
						title: entry.title,
						organization: entry.organization ?? "",
						detail: entry.detail ?? "",
					})),
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
						<button
							type="button"
							onClick={() => {
								const el = document.getElementById("client-reviews")
								if (el) {
									el.scrollIntoView({ behavior: "smooth", block: "start" })
								}
							}}
							className={`${workspaceStyles.secondaryAction} w-full inline-flex items-center justify-center gap-2 cursor-pointer`}
						>
							<Star className="size-4 fill-amber-500 text-amber-500" />
							<span>Feedback & Reviews</span>
						</button>
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
					freelancerName={name}
					freelancerTitle={person.title ?? ""}
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
