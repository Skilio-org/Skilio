import type { FreelancerJob } from "@/types/job"

export type ProposalDraft = {
	job: FreelancerJob
	cover: string
	rate: string
	status?: "Drafts" | "Submitted" | "Archived"
}

export const freelancerWorkspaceTitles = {
	savedJobs: "Saved jobs",
	dashboard: "Your work, in one place.",
	jobs: "Find your next project.",
	proposals: "Your proposals",
	settings: "Account settings",
}

export const freelancerWorkspaceSubtitles = {
	savedJobs: "Keep the projects you’d like to work on in one place.",
	dashboard: "Keep your profile current and move your next opportunity forward.",
	jobs: "Discover projects that fit your skills and the way you work.",
	proposals: "Keep track of the conversations you want to start.",
	projects: "Manage your active projects, milestones, and completed work.",
	settings: "Manage your account security and workspace appearance.",
}
