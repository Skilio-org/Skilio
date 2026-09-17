export type FreelancerJob = {
	id: string
	title: string
	company: string
	category: string
	budget: string
	projectType: "Fixed price" | "Hourly"
	posted: string
	description: string
	skills: string[]
}

export type ProposalDraft = {
	job: FreelancerJob
	cover: string
	rate: string
	status?: "Drafts" | "Submitted" | "Archived"
}

export const freelancerJobs: FreelancerJob[] = [
	{
		id: "1",
		title: "Design a clearer onboarding experience",
		company: "Northstar Studio",
		category: "Design",
		budget: "$1,500 · Fixed price",
		projectType: "Fixed price",
		posted: "Posted 2 hours ago",
		description:
			"We’re looking for a product designer to simplify our onboarding flow. The project includes a short discovery phase, wireframes, and a tested Figma prototype. Share a relevant example and tell us how you would approach the first week.",
		skills: ["Product design", "Figma", "UX research"],
	},
	{
		id: "2",
		title: "Build a responsive customer dashboard",
		company: "Forma",
		category: "Development",
		budget: "$50/hr · 1–3 months",
		projectType: "Hourly",
		posted: "Posted 5 hours ago",
		description:
			"Help our small product team build an accessible React dashboard from existing designs. You’ll work with our engineer on reusable components, API integration, and responsive behavior.",
		skills: ["React", "TypeScript", "Accessibility"],
	},
	{
		id: "3",
		title: "Create a launch content strategy",
		company: "Good Company",
		category: "Marketing",
		budget: "$800 · Fixed price",
		projectType: "Fixed price",
		posted: "Posted yesterday",
		description:
			"We need a clear content strategy for a new product launch. Deliverables include audience research, messaging, and a four-week editorial calendar.",
		skills: ["Content strategy", "Copywriting", "Research"],
	},
]

export const seedProposals: ProposalDraft[] = [
	{
		job: freelancerJobs[2],
		cover:
			"I would start with a short discovery workshop, then develop audience-specific messaging and a four-week content plan. My recent launch work focused on independent brands with small teams.",
		rate: "1000",
		status: "Submitted",
	},
	{
		job: freelancerJobs[0],
		cover:
			"I would map the existing journey and identify the points of friction before prototyping a simpler first-run experience. I can share a tested Figma prototype within two weeks.",
		rate: "2200",
		status: "Drafts",
	},
]

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
