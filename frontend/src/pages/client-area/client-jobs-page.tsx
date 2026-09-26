import { Plus } from "lucide-react"
import { useState } from "react"
import { JobsService } from "@/client"
import { ClientJobEditor } from "@/components/client/client-job-editor"
import { blankClientJob, type ClientJob } from "@/components/client/client-job-types"
import { clientJobFromApi, clientJobPayload } from "@/components/client/client-jobs-api"
import { ClientJobsList } from "@/components/client/client-jobs-list"
import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header"
import useAuth from "@/hooks/useAuth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function ClientJobsPage() {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	const jobsQuery = useQuery({
		queryKey: ["client-jobs"],
		enabled: Boolean(user),
		queryFn: async ({ signal }) => {
			const { data } = await JobsService.readMyJobs({ query: { skip: 0, limit: 100 }, signal })
			return data.data.map(clientJobFromApi)
		},
	})
	const saveMutation = useMutation({
		mutationFn: (job: ClientJob) => {
			const body = clientJobPayload(job)
			return job.id ? JobsService.updateJob({ path: { id: job.id }, body }) : JobsService.createJob({ body })
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["client-jobs"] })
			setEditorJob(null)
			toast.success("Job saved")
		},
	})
	const deleteMutation = useMutation({
		mutationFn: (id: string) => JobsService.deleteJob({ path: { id } }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["client-jobs"] })
			setEditorJob(null)
			toast.success("Job deleted")
		},
	})
	const jobs = jobsQuery.data ?? []
	const error = jobsQuery.isError
		? "Could not load your jobs."
		: saveMutation.isError
			? "Could not save this job."
			: deleteMutation.isError
				? "Could not delete this job."
				: ""
	const [query, setQuery] = useState("")
	const [tab, setTab] = useState("All jobs")
	const [editorJob, setEditorJob] = useState<ClientJob | null>(null)
	const [isEditing, setIsEditing] = useState(false)

	const persistJob = (job: ClientJob) => {
		saveMutation.mutate(job)
	}

	const startJob = () => {
		setEditorJob({ ...blankClientJob, id: "" })
		setIsEditing(true)
	}
	const results = jobs.filter(
		(job) =>
			(tab === "All jobs" || job.status === tab) &&
			`${job.title} ${job.skills}`.toLowerCase().includes(query.toLowerCase()),
	)

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 py-8 md:px-6 md:py-10">
			<WorkspacePageHeader
				eyebrow="Client workspace"
				title="Your next great hire starts here."
				description="Create a clear brief and keep your hiring in one place."
				meta={<span className="font-medium text-primary">Hiring activity</span>}
				action={
					<button
						type="button"
						disabled={!user || jobsQuery.isPending || saveMutation.isPending}
						onClick={startJob}
						className={workspaceStyles.primaryAction}
					>
						<Plus className="size-4" /> Post a job
					</button>
				}
			/>
			{error && (
				<p role="alert" className="text-destructive text-sm">
					{error}
				</p>
			)}
			<ClientJobsList
				jobs={jobs}
				results={results}
				query={query}
				tab={tab}
				disabled={!user || jobsQuery.isPending}
				onQueryChange={setQuery}
				onTabChange={setTab}
				onOpenJob={(job) => {
					setEditorJob(job)
					setIsEditing(false)
				}}
				onCreateJob={startJob}
				onClearFilters={() => {
					setQuery("")
					setTab("All jobs")
				}}
			/>
			<ClientJobEditor
				job={editorJob}
				editing={isEditing}
				error={error}
				onClose={() => setEditorJob(null)}
				onEditingChange={setIsEditing}
				onJobChange={setEditorJob}
				onSave={persistJob}
				onDelete={(job) => {
					if (job.id && window.confirm("Delete this job?")) deleteMutation.mutate(job.id)
				}}
			/>
		</div>
	)
}
