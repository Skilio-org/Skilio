export type Freelancer = {
	id: string
	initials: string
	name: string
	title: string
	location: string
	timezone: string
	rate: number
	rating: number
	reviews: number
	projects: number
	successRate: number
	availability: string
	responseTime: string
	bio: string
	about: string[]
	skills: string[]
	languages: { name: string; level: string }[]
	education: string
	memberSince: string
	background: string
	foreground: string
	portfolio: { title: string; category: string; color: string }[]
}

export const freelancers: Freelancer[] = [
	{
		id: "maya-laurent",
		initials: "ML",
		name: "Maya Laurent",
		title: "Senior Product Designer",
		location: "Paris, France",
		timezone: "CET · 8:42 PM local time",
		rate: 75,
		rating: 4.9,
		reviews: 86,
		projects: 64,
		successRate: 98,
		availability: "Available now",
		responseTime: "Usually replies within 2 hours",
		bio: "B2B product specialist focused on clear workflows, scalable systems, and thoughtful interaction design.",
		about: [
			"I help product teams turn complex workflows into calm, useful experiences. My work spans early product strategy, UX research, interaction design, and production-ready design systems.",
			"I work closely with founders and engineering teams, keeping decisions visible and making sure the final product is as practical to build as it is intuitive to use.",
		],
		skills: ["Product design", "Figma", "UX research", "Design systems", "Prototyping", "SaaS", "User testing"],
		languages: [
			{ name: "French", level: "Native" },
			{ name: "English", level: "Fluent" },
		],
		education: "MSc Interaction Design · École de Design Nantes",
		memberSince: "Member since 2021",
		background: "bg-[#dce7ff]",
		foreground: "text-[#173ea5]",
		portfolio: [
			{
				title: "Ledger analytics",
				category: "Fintech dashboard",
				color: "bg-[#d8e5ff]",
			},
			{
				title: "Northstar OS",
				category: "Design system",
				color: "bg-[#e8e1f8]",
			},
			{ title: "Careflow", category: "Healthcare SaaS", color: "bg-[#d7eee6]" },
		],
	},
	{
		id: "noah-williams",
		initials: "NW",
		name: "Noah Williams",
		title: "Full-stack Engineer",
		location: "Toronto, Canada",
		timezone: "EST · 2:42 PM local time",
		rate: 90,
		rating: 5,
		reviews: 112,
		projects: 91,
		successRate: 100,
		availability: "Available now",
		responseTime: "Usually replies within 1 hour",
		bio: "I build reliable web products for growing teams, from the first architecture decision to launch.",
		about: [
			"I’m a senior full-stack engineer who enjoys taking products from a rough brief to a stable, measurable release. I specialize in TypeScript systems, React interfaces, and pragmatic Node.js services.",
			"Clients bring me in when they need strong technical judgment, clear communication, and an engineer who can own the result rather than only the ticket.",
		],
		skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Next.js", "System design"],
		languages: [
			{ name: "English", level: "Native" },
			{ name: "French", level: "Conversational" },
		],
		education: "BSc Computer Science · University of Waterloo",
		memberSince: "Member since 2020",
		background: "bg-[#d8f0ea]",
		foreground: "text-[#075f4c]",
		portfolio: [
			{
				title: "Atlas commerce",
				category: "Commerce platform",
				color: "bg-[#d7eee6]",
			},
			{
				title: "Relay API",
				category: "Developer platform",
				color: "bg-[#dce7ff]",
			},
			{
				title: "Signal rooms",
				category: "Collaboration tool",
				color: "bg-[#f0e7d8]",
			},
		],
	},
	{
		id: "amara-okafor",
		initials: "AO",
		name: "Amara Okafor",
		title: "Brand Strategist",
		location: "London, United Kingdom",
		timezone: "GMT · 7:42 PM local time",
		rate: 65,
		rating: 4.9,
		reviews: 74,
		projects: 48,
		successRate: 97,
		availability: "Available this week",
		responseTime: "Usually replies within 4 hours",
		bio: "I help ambitious companies find a distinct position, voice, and story their customers remember.",
		about: [
			"I partner with founders and marketing leaders to clarify what their brand stands for and how to express it consistently. Engagements usually cover customer research, positioning, messaging, and launch strategy.",
			"My approach is evidence-led and collaborative, producing a practical foundation your whole team can use—not a presentation that gathers dust.",
		],
		skills: ["Brand strategy", "Positioning", "Research", "Messaging", "Content strategy", "Go-to-market"],
		languages: [
			{ name: "English", level: "Native" },
			{ name: "Igbo", level: "Fluent" },
		],
		education: "MA Brand Strategy · University of the Arts London",
		memberSince: "Member since 2022",
		background: "bg-[#f1e6d8]",
		foreground: "text-[#744217]",
		portfolio: [
			{
				title: "Common Ground",
				category: "Brand platform",
				color: "bg-[#f0e7d8]",
			},
			{ title: "Flora Health", category: "Positioning", color: "bg-[#d7eee6]" },
			{ title: "Within", category: "Launch strategy", color: "bg-[#e8e1f8]" },
		],
	},
	{
		id: "elias-chen",
		initials: "EC",
		name: "Elias Chen",
		title: "AI Automation Engineer",
		location: "Singapore",
		timezone: "SGT · 3:42 AM local time",
		rate: 110,
		rating: 4.8,
		reviews: 59,
		projects: 42,
		successRate: 96,
		availability: "Available next week",
		responseTime: "Usually replies within 6 hours",
		bio: "Applied AI engineer creating dependable automation for operations, support, and knowledge workflows.",
		about: [
			"I design and implement AI-assisted workflows that reduce repetitive work without turning core business processes into a black box.",
			"My projects combine retrieval systems, evaluation, human review, and careful observability so teams can trust what they put into production.",
		],
		skills: ["Python", "LLM applications", "RAG", "FastAPI", "OpenAI", "Evaluation", "Automation"],
		languages: [
			{ name: "English", level: "Fluent" },
			{ name: "Mandarin", level: "Native" },
		],
		education: "MEng Artificial Intelligence · NUS",
		memberSince: "Member since 2022",
		background: "bg-[#e8e1f8]",
		foreground: "text-[#5b278c]",
		portfolio: [
			{
				title: "Resolve AI",
				category: "Support automation",
				color: "bg-[#e8e1f8]",
			},
			{
				title: "Briefcase",
				category: "Knowledge system",
				color: "bg-[#dce7ff]",
			},
			{
				title: "Ops copilot",
				category: "Internal tool",
				color: "bg-[#d7eee6]",
			},
		],
	},
	{
		id: "sofia-mendes",
		initials: "SM",
		name: "Sofia Mendes",
		title: "Growth Marketing Lead",
		location: "Lisbon, Portugal",
		timezone: "WET · 7:42 PM local time",
		rate: 70,
		rating: 4.9,
		reviews: 68,
		projects: 53,
		successRate: 99,
		availability: "Available now",
		responseTime: "Usually replies within 3 hours",
		bio: "Full-funnel growth strategist helping B2B teams turn positioning into repeatable acquisition.",
		about: [
			"I build focused growth programs across content, lifecycle, paid acquisition, and conversion optimization.",
			"Every engagement starts with measurement and customer context, then moves quickly into experiments that create reusable learning.",
		],
		skills: ["Growth strategy", "SEO", "Lifecycle", "Analytics", "Paid media", "CRO"],
		languages: [
			{ name: "Portuguese", level: "Native" },
			{ name: "English", level: "Fluent" },
		],
		education: "MSc Marketing · NOVA SBE",
		memberSince: "Member since 2021",
		background: "bg-[#fde8df]",
		foreground: "text-[#8a3b22]",
		portfolio: [
			{
				title: "Arc growth model",
				category: "Growth strategy",
				color: "bg-[#fde8df]",
			},
			{
				title: "Field Notes",
				category: "Content system",
				color: "bg-[#f0e7d8]",
			},
			{ title: "Motion", category: "Lifecycle program", color: "bg-[#dce7ff]" },
		],
	},
]
