import { Link } from "@tanstack/react-router"
import { ArrowUp } from "lucide-react"
import skilioLogo from "/assets/images/skilio-logo.svg"

const FOOTER_SECTIONS = [
	{
		title: "Platform",
		links: [
			{ label: "Find Talent", href: "#talent", isAnchor: true },
			{ label: "Browse Contracts", href: "#contracts", isAnchor: true },
			{ label: "Milestone Escrow", href: "#difference", isAnchor: true },
			{ label: "How It Works", href: "#how-it-works", isAnchor: true },
			{ label: "Why Skilio", href: "#difference", isAnchor: true },
		],
	},
	{
		title: "Specialties",
		links: [
			{ label: "Full-Stack Dev", href: "#talent", isAnchor: true },
			{ label: "Product & UI/UX", href: "#talent", isAnchor: true },
			{ label: "Mobile Development", href: "#talent", isAnchor: true },
			{ label: "Cloud & DevOps", href: "#talent", isAnchor: true },
			{ label: "AI & Automation", href: "#talent", isAnchor: true },
		],
	},
	{
		title: "Company",
		links: [
			{ label: "About Skilio", href: "/", isAnchor: false },
			{ label: "System Status", href: "/status", isAnchor: false },
			{ label: "Terms of Service", href: "/terms", isAnchor: false },
			{ label: "Privacy Policy", href: "/privacy", isAnchor: false },
			{ label: "Log In", href: "/login", isAnchor: false },
		],
	},
]

export function LandingFooter() {
	return (
		<footer className="relative border-t border-border/70 bg-[#131517] text-neutral-300 overflow-hidden">
			{/* Subtle brand hairline accent glow */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 max-w-4xl bg-gradient-to-r from-transparent via-primary/35 to-transparent"
			/>

			<div className="landing-container py-12 sm:py-16 lg:py-20">
				<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
					{/* Brand Column (5 cols on lg) */}
					<div className="flex flex-col gap-3.5 lg:col-span-5">
						<Link to="/" className="group inline-flex items-center gap-2.5 w-fit outline-none">
							<img
								src={skilioLogo}
								alt="Skilio"
								className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
							/>
							<span className="font-display text-xl font-bold tracking-tight text-white">Skilio</span>
						</Link>

						<p className="max-w-sm text-xs sm:text-[13px] leading-relaxed text-neutral-400">
							The freelance talent network connecting businesses with verified Moroccan developers,
							designers, and digital specialists. Direct collaboration and milestone escrow payments.
						</p>
					</div>

					{/* Balanced Link Columns (7 cols on lg) */}
					<div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
						{FOOTER_SECTIONS.map((section) => (
							<div key={section.title} className="flex flex-col gap-3.5">
								<h4 className="text-[12px] font-semibold tracking-wider text-neutral-200">
									{section.title}
								</h4>
								<ul className="flex flex-col gap-2 text-xs sm:text-[13px] text-neutral-400">
									{section.links.map((link) => (
										<li key={link.label}>
											{link.isAnchor ? (
												<a
													href={link.href}
													className="inline-flex items-center gap-1 hover:text-white transition-colors duration-150"
												>
													{link.label}
												</a>
											) : (
												<Link
													to={link.href as any}
													className="inline-flex items-center gap-1 hover:text-white transition-colors duration-150"
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
				<div className="mt-12 sm:mt-16 flex flex-col gap-4 border-t border-white/10 pt-6 sm:pt-8 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
					<p>© {new Date().getFullYear()} Skilio. All rights reserved.</p>

					<button
						type="button"
						onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
						className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer w-fit"
						aria-label="Back to top"
					>
						<span>Back to top</span>
						<ArrowUp className="size-3" />
					</button>
				</div>
			</div>
		</footer>
	)
}
