import { JobsService, type JobPostPublic } from "@/client"
import { readJobExperience } from "@/components/common/job-experience"
import type { FreelancerJob } from "@/types/job"

export type BackendSearchJob = FreelancerJob & {
	clientRating?: number
	previousHires?: number
	weeklyHours?: number
}

function formatBudget(job: JobPostPublic) {
	const amount = job.budget.toLocaleString()
	return job.budget_type === "hourly" ? `$${amount}/hr` : `$${amount}`
}

export function jobFromApi(job: JobPostPublic): BackendSearchJob {
	const { level, description } = readJobExperience(job.description)
	return {
		id: job.id,
		title: job.title,
		company: job.client_company ?? job.client_name ?? "Client",
		category: job.category ?? "",
		budget: formatBudget(job),
		projectType: job.budget_type === "hourly" ? "Hourly" : "Fixed price",
		posted: job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recently posted",
		description,
		experience: level || undefined,
		skills: job.skills ?? [],
		clientId: job.client_id,
	}
}

export async function loadFreelancerJobs(
	query: {
		q?: string
		category?: string
		budgetType?: "hourly" | "fixed"
		minBudget?: number
		maxBudget?: number
		sortBy?: "newest" | "budget_desc" | "budget_asc"
	},
	signal?: AbortSignal,
) {
	const jobs: BackendSearchJob[] = []

	while (true) {
		const { data: page } = await JobsService.readJobs({
			query: {
				skip: jobs.length,
				limit: 100,
				q: query.q || undefined,
				category: query.category || undefined,
				budget_type: query.budgetType,
				min_budget: query.minBudget,
				max_budget: query.maxBudget,
				status: "open",
				sort_by: query.sortBy ?? "newest",
			},
			signal,
		})
		jobs.push(...page.data.map(jobFromApi))
		if (!page.data.length || jobs.length >= page.count) return jobs
	}
}
