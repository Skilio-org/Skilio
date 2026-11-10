import type { JobPostPublic } from "@/client"
import { readJobExperience } from "@/components/common/job-experience"
import type { FreelancerJob } from "@/types/job"
import { formatMoney, formatRate } from "@/lib/currency"

function formatBudget(job: JobPostPublic) {
	return job.budget_type === "hourly" ? formatRate(job.budget) : formatMoney(job.budget)
}

export function jobFromApi(job: JobPostPublic): FreelancerJob {
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
