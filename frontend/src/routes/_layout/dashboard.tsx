import { createFileRoute, Link } from "@tanstack/react-router"
import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header"
import { ProfileProgress } from "@/components/dashboard/dashboard-profile-progress"
import { RecommendedFreelancers } from "@/components/dashboard/dashboard-recommended"
import { TalentSearch } from "@/components/dashboard/dashboard-talent-search"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/dashboard")({
	component: Dashboard,
	head: () => ({ meta: [{ title: "Overview | Freelancer" }] }),
})

function Dashboard() {
	const { user } = useAuth()
	const firstName = user?.full_name?.trim().split(/\s+/)[0]
	return (
		<div className="space-y-8">
			<WorkspacePageHeader
				eyebrow="Client workspace / Overview"
				title={firstName ? `Good to see you, ${firstName}.` : "Find your next collaborator."}
				description="Continue your search or review professionals selected for you."
				action={
					<Link to="/client-jobs" className={workspaceStyles.primaryAction}>
						Post a job
					</Link>
				}
			/>
			<TalentSearch />
			<section className="grid gap-6 xl:grid-cols-[1fr_320px]">
				<RecommendedFreelancers />

				<aside className="space-y-6">
					<ProfileProgress />
				</aside>
			</section>
		</div>
	)
}
