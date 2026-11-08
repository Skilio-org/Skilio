import type { ExperienceLevel } from "@/components/common/job-experience"
import { maxSkillLength, maxSkills } from "@/components/common/skills-select"

export type ClientJob = {
	id: string
	title: string
	description: string
	skills: string[]
	experienceLevel: ExperienceLevel | ""
	category: string
	location: string
	type: string
	budget: string
	status: "Draft" | "Open" | "Closed"
}

export const blankClientJob: ClientJob = {
	id: "",
	title: "",
	description: "",
	skills: [],
	experienceLevel: "",
	category: "",
	location: "",
	type: "Fixed price",
	budget: "",
	status: "Draft",
}

// Limits for the job post form. The inputs enforce them while typing, and validateJob() checks them again on save.
export const jobLimits = {
	title: 100,
	descriptionMin: 80,
	descriptionMax: 2000,
	hourlyMin: 10,
	hourlyMax: 5000,
	fixedMin: 100,
	fixedMax: 500_000,
}

// The allowed budget for the job's payment type.
export function budgetRange(type: string) {
	return type === "Hourly"
		? { min: jobLimits.hourlyMin, max: jobLimits.hourlyMax }
		: { min: jobLimits.fixedMin, max: jobLimits.fixedMax }
}

// Returns the first problem with the job, or null when it can be saved.
// A draft only needs a valid title and values within the limits; an open job needs everything filled in.
export function validateJob(job: ClientJob): string | null {
	const isOpen = job.status === "Open"
	const title = job.title.trim()
	const description = job.description.trim()
	const range = budgetRange(job.type)
	const money = (value: number) => `$${value.toLocaleString("en-US")}`

	if (!title) return "Enter a job title."
	if (title.length > jobLimits.title) return `The job title can be at most ${jobLimits.title} characters.`
	if (description.length > jobLimits.descriptionMax) {
		return `The project description can be at most ${jobLimits.descriptionMax.toLocaleString("en-US")} characters.`
	}
	if (job.skills.length > maxSkills) return `Choose up to ${maxSkills} skills.`
	if (job.skills.some((skill) => skill.length > maxSkillLength)) {
		return `Each skill can be at most ${maxSkillLength} characters.`
	}

	const budget = Number(job.budget)
	if (job.budget.trim() && (!Number.isFinite(budget) || budget < range.min || budget > range.max)) {
		return `The ${job.type === "Hourly" ? "hourly rate" : "budget"} must be between ${money(range.min)} and ${money(range.max)}.`
	}

	if (isOpen) {
		if (description.length < jobLimits.descriptionMin) {
			return `The project description needs at least ${jobLimits.descriptionMin} characters.`
		}
		if (!job.experienceLevel) return "Select the experience level."
		if (!job.budget.trim()) return job.type === "Hourly" ? "Enter an hourly rate." : "Enter a budget."
		if (!job.category) return "Choose a category before posting this job."
	}
	return null
}
