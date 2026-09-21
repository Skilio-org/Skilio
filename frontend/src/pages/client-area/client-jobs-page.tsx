import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { ClientJobEditor } from "@/components/client/client-job-editor"
import { blankClientJob, type ClientJob } from "@/components/client/client-job-types"
import { ClientJobsList } from "@/components/client/client-jobs-list"
import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header"
import useAuth from "@/hooks/useAuth"

export function ClientJobsPage() {
	const { user } = useAuth()
	const storageKey = `client-jobs-v1:${user?.id ?? "preview"}`
	const [jobs, setJobs] = useState<ClientJob[]>([])
	const [loadedKey, setLoadedKey] = useState("")
	const [error, setError] = useState("")
	const [query, setQuery] = useState("")
	const [tab, setTab] = useState("All jobs")
	const [editorJob, setEditorJob] = useState<ClientJob | null>(null)
	const [isEditing, setIsEditing] = useState(false)

	useEffect(() => {
		try {
			const value: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]")
			if (!Array.isArray(value)) throw new Error()
			setJobs(value.filter(isClientJob))
			setError("")
		} catch {
			setJobs([])
			setError("Your jobs couldn’t be restored from this browser. Refresh and try again.")
		}
		setLoadedKey(storageKey)
		setEditorJob(null)
	}, [storageKey])

	const persistJob = (job: ClientJob) => {
		if (loadedKey !== storageKey) return
		const nextJobs = jobs.some((item) => item.id === job.id)
			? jobs.map((item) => (item.id === job.id ? job : item))
			: [job, ...jobs]
		try {
			localStorage.setItem(storageKey, JSON.stringify(nextJobs))
			setJobs(nextJobs)
			setEditorJob(null)
			setError("")
		} catch {
			setError("We couldn’t save your changes. Free up browser storage and try again.")
		}
	}

	const startJob = () => {
		setEditorJob({ ...blankClientJob, id: crypto.randomUUID() })
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
				eyebrow="Client workspace / Jobs"
				title="Your next great hire starts here."
				description="Create a clear brief and keep your hiring in one place."
				action={
					<button
						type="button"
						disabled={loadedKey !== storageKey}
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
				disabled={loadedKey !== storageKey}
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
			/>
		</div>
	)
}

function isClientJob(job: unknown): job is ClientJob {
	return (
		!!job &&
		typeof job === "object" &&
		["id", "title", "description", "skills", "category", "type", "budget"].every(
			(name) => typeof (job as Record<string, unknown>)[name] === "string",
		) &&
		["Draft", "Open", "Closed"].includes((job as ClientJob).status)
	)
}
