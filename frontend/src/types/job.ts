export type FreelancerJob = {
	id: string
	title: string
	company: string
	category: string
	budget: string
	projectType: "Fixed price" | "Hourly"
	posted: string
	description: string
	experience?: string
	skills: string[]
	clientId?: string
}
