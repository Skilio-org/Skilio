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
		id: "amine-elmansouri",
		initials: "AM",
		name: "Amine El Mansouri",
		title: "Senior Full-Stack Engineer",
		location: "Casablanca, Morocco",
		timezone: "GMT+1 · Casablanca",
		rate: 350,
		rating: 4.9,
		reviews: 42,
		projects: 38,
		successRate: 98,
		availability: "Available now",
		responseTime: "Replies within 1 hour",
		bio: "Full-stack engineer building high-performance web applications, SaaS dashboards, and scalable REST/GraphQL APIs.",
		about: [
			"I help Moroccan startups and businesses build modern, reliable web applications. My core stack centers on React, Next.js, Node.js, and PostgreSQL.",
			"Focused on clean code architecture, performance optimization, and pragmatic delivery without unnecessary complexity.",
		],
		skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "Docker"],
		languages: [
			{ name: "Arabic", level: "Native" },
			{ name: "French", level: "Fluent" },
			{ name: "English", level: "Fluent" },
		],
		education: "Software Engineering · 1337 Coding School / ENSIAS",
		memberSince: "Member since 2022",
		background: "bg-[#dce7ff]",
		foreground: "text-[#173ea5]",
		portfolio: [
			{ title: "B2B Order Portal", category: "Full-Stack Web App", color: "bg-[#d8e5ff]" },
			{ title: "Logistics Analytics", category: "Interactive Dashboard", color: "bg-[#f0e7d8]" },
		],
	},
	{
		id: "fatima-bennani",
		initials: "FB",
		name: "Fatima-Zahra Bennani",
		title: "UI/UX & Product Designer",
		location: "Rabat, Morocco",
		timezone: "GMT+1 · Rabat",
		rate: 280,
		rating: 5.0,
		reviews: 36,
		projects: 29,
		successRate: 100,
		availability: "Available now",
		responseTime: "Replies within 2 hours",
		bio: "Product designer crafting intuitive mobile apps, design systems, and modern brand interfaces.",
		about: [
			"I transform complex business requirements into clean, elegant, user-friendly digital experiences.",
			"From wireframing and interactive Figma prototypes to developer-ready design systems, I ensure your product looks and feels world-class.",
		],
		skills: ["UI/UX Design", "Figma", "Design Systems", "Mobile App UI", "Prototyping", "User Research"],
		languages: [
			{ name: "Arabic", level: "Native" },
			{ name: "French", level: "Fluent" },
			{ name: "English", level: "Fluent" },
		],
		education: "Digital Product Design · National School of Applied Sciences",
		memberSince: "Member since 2023",
		background: "bg-[#fde8df]",
		foreground: "text-[#8a3b22]",
		portfolio: [
			{ title: "Fintech Mobile Wallet", category: "iOS & Android Design", color: "bg-[#fde8df]" },
			{ title: "SaaS Design System", category: "Component Library", color: "bg-[#dce7ff]" },
		],
	},
	{
		id: "karim-tazi",
		initials: "KT",
		name: "Karim Tazi",
		title: "Mobile App Developer",
		location: "Marrakech, Morocco",
		timezone: "GMT+1 · Marrakech",
		rate: 320,
		rating: 4.8,
		reviews: 28,
		projects: 25,
		successRate: 96,
		availability: "Available now",
		responseTime: "Replies within 3 hours",
		bio: "Cross-platform mobile developer building fast, native-feeling apps with Flutter and React Native.",
		about: [
			"Specialized in building end-to-end mobile applications for startups, retail brands, and booking platforms.",
			"Hands-on experience with payment integrations, push notifications, offline-first architectures, and App Store / Google Play submissions.",
		],
		skills: ["Flutter", "React Native", "iOS", "Android", "Firebase", "REST APIs", "State Management"],
		languages: [
			{ name: "Arabic", level: "Native" },
			{ name: "French", level: "Fluent" },
			{ name: "English", level: "Fluent" },
		],
		education: "Computer Science · Cadi Ayyad University",
		memberSince: "Member since 2022",
		background: "bg-[#e2f7d8]",
		foreground: "text-[#2e6820]",
		portfolio: [
			{ title: "Delivery & Courier App", category: "Flutter App", color: "bg-[#e2f7d8]" },
			{ title: "Property Booking App", category: "React Native", color: "bg-[#fde8df]" },
		],
	},
	{
		id: "leila-chraibi",
		initials: "LC",
		name: "Leila Chraibi",
		title: "E-Commerce & Growth Specialist",
		location: "Tangier, Morocco",
		timezone: "GMT+1 · Tangier",
		rate: 250,
		rating: 4.9,
		reviews: 31,
		projects: 34,
		successRate: 97,
		availability: "Available now",
		responseTime: "Replies within 2 hours",
		bio: "E-commerce strategist and developer building high-converting online stores with Shopify and custom solutions.",
		about: [
			"I help Moroccan merchants and direct-to-consumer brands scale their online sales through custom storefronts, payment gateway integrations, and conversion rate optimization.",
		],
		skills: ["Shopify", "E-Commerce", "Conversion Optimization", "SEO", "Analytics", "Liquid", "Frontend"],
		languages: [
			{ name: "Arabic", level: "Native" },
			{ name: "French", level: "Fluent" },
			{ name: "English", level: "Fluent" },
		],
		education: "Business & Digital Systems · ENCG Tangier",
		memberSince: "Member since 2023",
		background: "bg-[#f4e8ff]",
		foreground: "text-[#692994]",
		portfolio: [
			{ title: "Artisan Leather Goods Store", category: "Custom Shopify Store", color: "bg-[#f4e8ff]" },
			{ title: "Organic Beauty Brand", category: "E-Commerce Re-platforming", color: "bg-[#dce7ff]" },
		],
	},
]
