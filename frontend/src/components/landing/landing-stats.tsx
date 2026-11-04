const STATS = [
	{
		value: "2,500+",
		label: "Verified Specialists",
		description: "Skilled developers, designers, and tech experts across Morocco",
	},
	{
		value: "100%",
		label: "Escrow Protection",
		description: "Milestone funds held securely until you inspect and approve deliverables",
	},
	{
		value: "Under 24h",
		label: "Average Match Time",
		description: "From project brief to receiving qualified proposals from verified talent",
	},
	{
		value: "4.9 / 5",
		label: "Client Satisfaction",
		description: "Verified ratings and direct feedback from Moroccan founders and businesses",
	},
]

const DOMAINS = [
	{ name: "E-COMMERCE & RETAIL" },
	{ name: "TECH STARTUPS" },
	{ name: "DIGITAL AGENCIES" },
	{ name: "LOGISTICS & FLEET" },
	{ name: "HOSPITALITY & TOURS" },
	{ name: "FINTECH & PAYMENTS" },
]

export function LandingStats() {
	return (
		<section
			aria-label="Platform proof metrics and trusted domains"
			className="border-y border-border/70 bg-card py-10 sm:py-12 lg:py-16"
		>
			<div className="landing-container px-4 sm:px-6">
				{/* 4 Stats Grid */}
				<div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-8 md:grid-cols-4 lg:gap-10">
					{STATS.map((stat, idx) => (
						<div
							key={stat.label}
							className={`flex flex-col ${
								idx < STATS.length - 1
									? "md:border-r md:border-border/60 md:pr-6 lg:pr-8"
									: ""
							}`}
						>
							<span className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
								{stat.value}
							</span>
							<span className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold text-foreground sm:text-base">
								{stat.label}
							</span>
							<p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-muted-foreground">
								{stat.description}
							</p>
						</div>
					))}
				</div>

				{/* Domain Trust Strip */}
				<div className="mt-10 sm:mt-14 border-t border-border/50 pt-6 sm:pt-8">
					<p className="text-center text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
						Trusted for projects across key Moroccan industries
					</p>
					<div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-10">
						{DOMAINS.map((domain) => (
							<span
								key={domain.name}
								className="rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground hover:text-foreground transition-colors"
							>
								{domain.name}
							</span>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
