import type { JobPostCreate, JobPostPublic } from "@/client"
import { readJobExperience, writeJobExperience } from "@/components/common/job-experience"
import type { ClientJob } from "./client-job-types"

export function clientJobFromApi(job: JobPostPublic): ClientJob {
	const { level, description } = readJobExperience(job.description)
	return {
		id: job.id,
		title: job.title,
		description,
		experienceLevel: level,
		skills: job.skills ?? [],
		category: job.category ?? "",
		type: job.budget_type === "hourly" ? "Hourly" : "Fixed price",
		budget: String(job.budget),
		status: job.status === "draft" ? "Draft" : job.status === "closed" ? "Closed" : "Open",
	}
}

export function clientJobPayload(job: ClientJob): JobPostCreate {
	return {
		title: job.title.trim(),
		description: writeJobExperience(job.description, job.experienceLevel),
		budget_type: job.type === "Hourly" ? "hourly" : "fixed",
		budget: Number(job.budget),
		category: job.category,
		status: job.status === "Draft" ? "draft" : job.status === "Closed" ? "closed" : "open",
		skills: job.skills,
	}
}
