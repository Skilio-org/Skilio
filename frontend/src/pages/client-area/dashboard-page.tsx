import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { JobsService } from "@/client"
import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header"
import { ProfileProgress } from "@/components/dashboard/dashboard-profile-progress"
import { RecommendedFreelancers } from "@/components/dashboard/dashboard-recommended"
import { TalentSearch } from "@/components/dashboard/dashboard-talent-search"
import useAuth from "@/hooks/useAuth"
import QuickSavedSearch from "../common/quick-search"
import { queryKeys } from "@/lib/query-keys"

export function ClientDashboardPage() {
	const { user } = useAuth()
	const firstName = user?.full_name?.trim().split(/\s+/)[0]
	const { data: activeJobsCount } = useQuery({
		// Nested under "client-jobs" so saving or deleting a job refreshes this count too.
		queryKey: queryKeys.clientJobsActiveCount,
		enabled: Boolean(user),
		queryFn: async ({ signal }) => {
			const { data } = await JobsService.readMyJobs({ query: { skip: 0, limit: 1, status: "open" }, signal })
			return data.count
		},
	})
	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4  md:px-6 ">
			<WorkspacePageHeader
				eyebrow="Client workspace"
				title={firstName ? `Good to see you, ${firstName}.` : "Find your next collaborator."}
				description="Continue your search or review professionals selected for you."
				meta={
					activeJobsCount !== undefined && (
						<span className="font-medium text-link">
							{activeJobsCount} active {activeJobsCount === 1 ? "job" : "jobs"}
						</span>
					)
				}
				action={
					<Link to="/client-jobs" className={workspaceStyles.primaryAction} search={{ jobId: undefined }}>
						Post a job
					</Link>
				}
			/>
			<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
				<section className="flex flex-col gap-6 lg:col-span-8">
					<TalentSearch />
					<RecommendedFreelancers />
				</section>

				<aside className="flex flex-col gap-5 lg:sticky lg:top-20 lg:col-span-4">
					<ProfileProgress />
					<QuickSavedSearch />
				</aside>
			</div>
		</div>
	)
}
