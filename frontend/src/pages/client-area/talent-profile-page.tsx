import { Link } from "@tanstack/react-router"
import { ArrowLeft, ArrowUpRight, Bookmark, Check } from "lucide-react"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import { FreelancerProfileView } from "@/components/freelancer/freelancer-profile-view"
import type { Freelancer } from "@/data/freelancers"
import { useSavedTalent } from "@/hooks/useSavedTalent"

export function TalentProfilePage({ person }: { person: Freelancer }) {
	const firstName = person.name.split(" ")[0]
	const { savedIds, toggleSaved } = useSavedTalent()
	const saved = savedIds.includes(person.id)

	return (
		<FreelancerProfileView
			nameHeadingLevel="h1"
			profile={{
				name: person.name,
				initials: person.initials,
				title: person.title,
				location: person.location,
				summary: person.bio,
				about: person.about,
				skills: person.skills,
				rate: person.rate,
				availability: person.availability,
				memberSince: person.memberSince,
				rating: person.rating,
				reviews: person.reviews,
				background: person.background,
				foreground: person.foreground,
				portfolio: person.portfolio.map((entry) => ({
					id: entry.title,
					title: entry.title,
					category: entry.category,
					color: entry.color,
					detail: `This ${entry.category.toLowerCase()} project is part of ${person.name}’s demo portfolio. Original project files and a full case study aren’t included in this preview.`,
				})),
				languages: person.languages,
				education: [
					{
						id: "education",
						title: person.education,
					},
				],
			}}
			backLink={
				<Link
					to="/talent"
					search={{ q: undefined }}
					className="inline-flex min-h-11 items-center gap-2 font-medium text-muted-foreground text-sm hover:text-primary"
				>
					<ArrowLeft className="size-4" />
					Back to talent
				</Link>
			}
			contactActions={
				<>
					<Link to="/messages" search={{ with: person.id }} className={`${workspaceStyles.primaryAction} w-full`}>
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
				</>
			}
			contactFooter={
				<>
					<p className="mt-4 text-center text-muted-foreground text-xs leading-5">{person.responseTime}</p>
					{saved && (
						<p role="status" className="mt-2 text-center text-muted-foreground text-xs">
							Available in your Saved talent list.
						</p>
					)}
				</>
			}
			feedback={{
				rating: person.rating,
				quote:
					"Thoughtful work, clear communication, and a practical approach from the first conversation through delivery.",
				reviewerInitials: "AR",
				reviewerName: "Alex Rivera",
				reviewerMeta: "Product lead · Sample review",
			}}
			portfolioDialogEyebrow="Sample portfolio entry"
			portfolioDialogAction={
				<>
					<div>
						<h3 className="font-medium text-sm">Interested in similar work?</h3>
						<p className="mt-2 text-muted-foreground text-sm leading-6">
							Start a conversation about your goals, scope, and timeline.
						</p>
					</div>
					<Link to="/messages" search={{ with: person.id }} className={workspaceStyles.primaryAction}>
						Discuss a project
						<ArrowUpRight className="size-4" />
					</Link>
				</>
			}
		/>
	)
}
