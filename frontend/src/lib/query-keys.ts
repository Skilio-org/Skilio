// Every TanStack Query key in one place, so a query and the code that invalidates it can't drift apart.
// Chat keys live in data/chat-keys.ts; connection and review keys sit next to their hooks.
export const queryKeys = {
	currentUser: ["currentUser"] as const,
	categories: ["categories"] as const,
	recentSearches: ["recentSearch"] as const,
	systemHealth: ["system-health"] as const,

	clientProfile: ["clientProfile"] as const,
	clientJobs: ["client-jobs"] as const,
	clientJobsActiveCount: ["client-jobs", "active-count"] as const,
	clientJobProposals: (jobId: string) => ["client-job-proposals", jobId] as const,

	freelancerProfile: (userId: string | undefined) => ["freelancer-profile", userId] as const,
	freelancerAvailability: (userId: string | undefined) => ["freelancer-availability", userId] as const,
	freelancerProposals: ["freelancer-proposals"] as const,
	freelancerJobs: ["freelancer-jobs"] as const,
	freelancerJobsDashboard: ["freelancer-jobs", "dashboard"] as const,
	savedJobs: ["saved-jobs"] as const,

	talentProfiles: ["talent-profiles"] as const,
	talentProfile: ["talent-profile"] as const,
	savedTalent: ["saved-talent"] as const,
}
