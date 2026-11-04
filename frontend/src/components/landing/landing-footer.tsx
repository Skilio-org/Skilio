import { Link } from "@tanstack/react-router"
import { Logo } from "@/components/common/logo"

const FOOTER_SECTIONS = [
	{
		title: "Platform",
		links: [
			{ label: "Find Talent", href: "#talent", isAnchor: true },
			{ label: "Browse Projects", href: "#contracts", isAnchor: true },
			{ label: "Why Skilio", href: "#difference", isAnchor: true },
			{ label: "How It Works", href: "#how-it-works", isAnchor: true },
			{ label: "Sign Up", href: "/signup", isAnchor: false },
			{ label: "Log In", href: "/login", isAnchor: false },
		],
	},
	{
		title: "Categories",
		links: [
			{ label: "Full-Stack Development", href: "#talent", isAnchor: true },
			{ label: "UI/UX & Product Design", href: "#talent", isAnchor: true },
			{ label: "Mobile App Development", href: "#talent", isAnchor: true },
			{ label: "E-Commerce & Shopify", href: "#talent", isAnchor: true },
			{ label: "Cloud & DevOps", href: "#talent", isAnchor: true },
		],
	},
	{
		title: "Specialists",
		links: [
			{ label: "How to Join", href: "/signup", isAnchor: false },
			{ label: "Freelancer Benefits", href: "/signup", isAnchor: false },
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
		<footer className="border-t border-border bg-[#17191C] text-neutral-300">
			<div className="landing-container px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
				<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
					{/* Brand Column (4 cols on lg) */}
					<div className="flex flex-col gap-4 lg:col-span-4">
						<Logo className="h-7 sm:h-8 w-auto self-start brightness-200" />
						<p className="max-w-sm text-xs leading-relaxed text-neutral-400">
							The freelance platform connecting Moroccan businesses with verified independent
							developers, designers, and digital specialists. Safe milestone escrow and direct collaboration.
						</p>

						{/* System Status Pill */}
						<Link
							to="/status"
							className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
						>
							<span className="size-2 rounded-full bg-[#B8EF0D] animate-pulse" />
							<span>All Systems Operational (99.99%)</span>
						</Link>
					</div>

					{/* 4 Link Columns (8 cols on lg) */}
					<div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
						{FOOTER_SECTIONS.map((section) => (
							<div key={section.title} className="flex flex-col gap-3">
								<h4 className="text-xs font-bold uppercase tracking-wider text-white">
									{section.title}
								</h4>
								<ul className="flex flex-col gap-2.5 text-xs text-neutral-400">
									{section.links.map((link) => (
										<li key={link.label}>
											{link.isAnchor ? (
												<a
													href={link.href}
													className="hover:text-white transition-colors"
												>
													{link.label}
												</a>
											) : (
												<Link
													to={link.href as any}
													className="hover:text-white transition-colors"
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

				{/* Bottom Legal Strip */}
				<div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6 sm:pt-8 text-xs text-neutral-500">
					<p>© {new Date().getFullYear()} Skilio. Built for independent builders in Morocco.</p>
					<div className="flex items-center gap-6">
						<Link to="/privacy" className="hover:text-neutral-300 transition-colors">
							Privacy Policy
						</Link>
						<Link to="/terms" className="hover:text-neutral-300 transition-colors">
							Terms of Service
						</Link>
					</div>
				</div>
			</div>
		</footer>
	)
}
