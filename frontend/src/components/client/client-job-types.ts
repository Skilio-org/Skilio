import type { ExperienceLevel } from "@/components/common/job-experience"

export type ClientJob = {
	id: string
	title: string
	description: string
	skills: string[]
	experienceLevel: ExperienceLevel | ""
	category: string
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
	category: "Development",
	type: "Fixed price",
	budget: "",
	status: "Draft",
}
