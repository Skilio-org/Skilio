import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { JobsService, type JobPostCreate, type JobPostPublic } from "@/client"
import { ClientJobEditor } from "@/components/client/client-job-editor"
import { ClientJobsList } from "@/components/client/client-jobs-list"
import { blankClientJob, type ClientJob } from "@/components/client/client-job-types"
import { jobDescriptionLimit, readJobExperience, writeJobExperience } from "@/components/common/job-experience"
import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header"
import useAuth from "@/hooks/useAuth"
import { useErrorToast } from "@/hooks/useErrorToast"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"

type ClientJobsPageProps = {
	focusedJobId?: string
	onFocusedJobChange: (jobId?: string) => void
}

function clientJobFromApi(job: JobPostPublic): ClientJob {
	const { level, description } = readJobExperience(job.description)
	return {
		id: job.id,
		title: job.title,
		description,
		experienceLevel: level,
		skills: job.skills ?? [],
		category: job.category ?? "",
		location: job.location ?? "",
		type: job.budget_type === "hourly" ? "Hourly" : "Fixed price",
		budget: String(job.budget),
		status: job.status === "draft" ? "Draft" : job.status === "closed" ? "Closed" : "Open",
	}
}

function clientJobPayload(job: ClientJob): JobPostCreate {
	return {
		title: job.title.trim(),
		description: writeJobExperience(job.description, job.experienceLevel),
		budget_type: job.type === "Hourly" ? "hourly" : "fixed",
		budget: Number(job.budget),
		category: job.category || null,
		location: job.location.trim() || null,
		status: job.status === "Draft" ? "draft" : job.status === "Closed" ? "closed" : "open",
		skills: job.skills,
	}
}

export function ClientJobsPage({ focusedJobId, onFocusedJobChange }: ClientJobsPageProps) {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	const jobsQuery = useQuery({
		queryKey: queryKeys.clientJobs,
		enabled: Boolean(user),
		queryFn: async ({ signal }) => {
			const { data } = await JobsService.readMyJobs({ query: { skip: 0, limit: 100 }, signal })
			return data.data.map(clientJobFromApi)
		},
	})
	useErrorToast(
		jobsQuery.isError ? "Could not load your jobs." : undefined,
		"client-jobs-load",
		jobsQuery.errorUpdatedAt,
	)
	const saveMutation = useMutation({
		mutationFn: (job: ClientJob) => {
			const body = clientJobPayload(job)
			return job.id ? JobsService.updateJob({ path: { id: job.id }, body }) : JobsService.createJob({ body })
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.clientJobs })
			onFocusedJobChange(undefined)
			setEditorJob(null)
			toast.success("Job saved")
		},
		onError: () => toast.error("Could not save this job."),
	})
	const deleteMutation = useMutation({
		mutationFn: (id: string) => JobsService.deleteJob({ path: { id } }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.clientJobs })
			onFocusedJobChange(undefined)
			setEditorJob(null)
			toast.success("Job deleted")
		},
		onError: () => toast.error("Could not delete this job."),
	})
	const jobs = jobsQuery.data ?? []
	const [query, setQuery] = useState("")
	const [tab, setTab] = useState("All jobs")
	const [editorJob, setEditorJob] = useState<ClientJob | null>(null)
	const [isEditing, setIsEditing] = useState(false)

	useEffect(() => {
		if (!focusedJobId || !jobsQuery.isSuccess) return
		const focusedJob = jobs.find((job) => job.id === focusedJobId)
		if (focusedJob) {
			setEditorJob((currentJob) => (currentJob?.id === focusedJob.id ? currentJob : focusedJob))
			setIsEditing(false)
			return
		}
		onFocusedJobChange(undefined)
		setEditorJob(null)
	}, [focusedJobId, jobs, jobsQuery.isSuccess, onFocusedJobChange])

	const persistJob = (job: ClientJob) => {
		if (job.description.trim().length > jobDescriptionLimit(job.experienceLevel)) {
			toast.error("Shorten the project description before saving this job.")
			return
		}
		if (job.status === "Open" && !job.category) {
			toast.error("Choose a category before posting this job.")
			return
		}
		saveMutation.mutate(job)
	}

	const startJob = () => {
		onFocusedJobChange(undefined)
		setEditorJob({ ...blankClientJob, id: "" })
		setIsEditing(true)
	}
	const results = jobs.filter(
		(job) =>
			(tab === "All jobs" || job.status === tab) &&
			`${job.title} ${job.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase()),
	)

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4  md:px-6 ">
			<WorkspacePageHeader
				eyebrow="Client workspace"
				title="Your next great hire starts here."
				description="Create a clear brief and keep your hiring in one place."
				meta={
					<span className="font-medium text-link">
						{jobs.filter((job) => job.status === "Open").length} open{" "}
						{jobs.filter((job) => job.status === "Open").length === 1 ? "job" : "jobs"}
					</span>
				}
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
			<ClientJobsList
				jobs={jobs}
				results={results}
				query={query}
				tab={tab}
				disabled={!user || jobsQuery.isPending}
				onQueryChange={setQuery}
				onTabChange={setTab}
				onOpenJob={(job) => {
					onFocusedJobChange(job.id)
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
				onClose={() => {
					onFocusedJobChange(undefined)
					setEditorJob(null)
				}}
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
