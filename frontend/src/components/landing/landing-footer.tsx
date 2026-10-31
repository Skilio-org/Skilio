import { Link } from "@tanstack/react-router"
import { Logo } from "@/components/common/logo"

const FOOTER_SECTIONS = [
	{
		title: "Platform",
		links: [
			{ label: "Find Talent", href: "#talent", isAnchor: true },
			{ label: "Browse Contracts", href: "#contracts", isAnchor: true },
			{ label: "Why Skilio", href: "#difference", isAnchor: true },
			{ label: "How It Works", href: "#how-it-works", isAnchor: true },
			{ label: "Sign Up", href: "/signup", isAnchor: false },
			{ label: "Log In", href: "/login", isAnchor: false },
		],
	},
	{
		title: "Categories",
		links: [
			{ label: "AI & Machine Learning", href: "#talent", isAnchor: true },
			{ label: "Full-Stack Development", href: "#talent", isAnchor: true },
			{ label: "Product & UI/UX Design", href: "#talent", isAnchor: true },
			{ label: "Cloud & DevOps", href: "#talent", isAnchor: true },
			{ label: "Growth & Marketing", href: "#talent", isAnchor: true },
		],
	},
	{
		title: "Specialists",
		links: [
			{ label: "How to Get Vetted", href: "/signup", isAnchor: false },
			{ label: "Freelancer Earnings", href: "/signup", isAnchor: false },
			{ label: "Milestone Escrow", href: "#difference", isAnchor: true },
			{ label: "Browse Jobs", href: "/freelancer-jobs", isAnchor: false },
			{ label: "Community", href: "/status", isAnchor: false },
		],
	},
	{
		title: "Company",
		links: [
			{ label: "About Skilio", href: "/", isAnchor: false },
			{ label: "Privacy Policy", href: "/privacy", isAnchor: false },
			{ label: "Terms of Service", href: "/terms", isAnchor: false },
			{ label: "System Status", href: "/status", isAnchor: false },
		],
	},
]

export function LandingFooter() {
	return (
		<footer className="border-t border-[#162217] bg-[#070A07] text-[#C4D4C5]">
			<div className="landing-container px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
				<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
					{/* Brand Column (4 cols on lg) */}
					<div className="flex flex-col gap-4 lg:col-span-4">
						<Logo className="h-7 sm:h-8 w-auto self-start brightness-200" />
						<p className="max-w-sm text-xs leading-relaxed text-[#95A896]">
							The modern freelance marketplace for ambitious builders and elite independent
							talent. Zero hidden markups, pre-funded escrow milestones, and direct collaboration.
						</p>

						{/* System Status Pill */}
						<Link
							to="/status"
							className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg border border-[#1A261B] bg-[#0E140F] px-3 py-1.5 text-xs font-medium text-[#B5C4B6] hover:bg-[#131B14] hover:text-white transition-colors"
						>
							<span className="size-2 rounded-full bg-[#B8EF0D] animate-pulse" />
							<span>All Systems Operational (99.99%)</span>
						</Link>
					</div>

					{/* 4 Link Columns (8 cols on lg) */}
					<div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
						{FOOTER_SECTIONS.map((section) => (
							<div key={section.title} className="flex flex-col gap-3">
								<h4 className="text-xs font-bold uppercase tracking-wider text-[#F4F8F4]">
									{section.title}
								</h4>
								<ul className="flex flex-col gap-2.5 text-xs text-[#95A896]">
									{section.links.map((link) => (
										<li key={link.label}>
											{link.isAnchor ? (
												<a
													href={link.href}
													className="hover:text-[#B8EF0D] transition-colors"
												>
													{link.label}
												</a>
											) : (
												<Link
													to={link.href as any}
													className="hover:text-[#B8EF0D] transition-colors"
												>
													{link.label}
												</Link>
											)}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="mt-12 sm:mt-14 flex flex-col gap-3 sm:gap-4 border-t border-[#162217] pt-6 sm:pt-8 text-xs text-[#738774] sm:flex-row sm:items-center sm:justify-between">
					<p>© {new Date().getFullYear()} Skilio Inc. All rights reserved.</p>
					<div className="flex flex-wrap items-center gap-3 sm:gap-4">
						<Link to="/privacy" className="hover:text-[#B8EF0D] transition-colors">
							Privacy Policy
						</Link>
						<span>·</span>
						<Link to="/terms" className="hover:text-[#B8EF0D] transition-colors">
							Terms of Service
						</Link>
						<span>·</span>
						<Link to="/status" className="hover:text-[#B8EF0D] transition-colors">
							System Status
						</Link>
					</div>
				</div>
			</div>
		</footer>
	)
}
