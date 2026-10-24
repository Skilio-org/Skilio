import { Link } from "@tanstack/react-router"
import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header"
import { ProfileProgress } from "@/components/dashboard/dashboard-profile-progress"
import { RecommendedFreelancers } from "@/components/dashboard/dashboard-recommended"
import { TalentSearch } from "@/components/dashboard/dashboard-talent-search"
import useAuth from "@/hooks/useAuth"
import QuickSavedSearch from "../common/quick-search"

export function ClientDashboardPage() {
	const { user } = useAuth()
	const firstName = user?.full_name?.trim().split(/\s+/)[0]
	const activeJobsCount = 4
	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4  md:px-6 ">
			<WorkspacePageHeader
				eyebrow="Client workspace"
				title={firstName ? `Good to see you, ${firstName}.` : "Find your next collaborator."}
				description="Continue your search or review professionals selected for you."
				meta={<span className="font-medium text-primary">{activeJobsCount} active jobs</span>}
				action={
					<Link to="/client-jobs" className={workspaceStyles.primaryAction} search={{ jobId: undefined }}>
						Post a job
					</Link>
				}
			/>
			<TalentSearch />
			<section className="grid gap-6 xl:grid-cols-[1fr_320px]">
				<RecommendedFreelancers />

				<aside className="space-y-6">
					<ProfileProgress />
					<QuickSavedSearch />
				</aside>
			</section>
		</div>
	)
}
