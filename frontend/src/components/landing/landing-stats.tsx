const STATS = [
	{
		value: "12,000+",
		label: "Vetted Specialists",
		description: "Top 3% accepted across all technical engineering & design domains",
	},
	{
		value: "$18.5M+",
		label: "Direct Talent Earnings",
		description: "100% direct payouts with zero hidden platform markups or take rates",
	},
	{
		value: "28 Hours",
		label: "Median Match Time",
		description: "From project specifications to signed milestone contract",
	},
	{
		value: "99.4%",
		label: "Contract Success Rate",
		description: "Verified 5-star milestone completion across 4,800+ engagements",
	},
]

const TRUST_LOGOS = [
	{ name: "LINEAR", role: "Productivity" },
	{ name: "VERCEL", role: "Frontend Cloud" },
	{ name: "SUPABASE", role: "Postgres & Auth" },
	{ name: "RAMP", role: "Finance Automation" },
	{ name: "RETOOL", role: "Internal Tools" },
	{ name: "LATTICE", role: "People Operations" },
]

export function LandingStats() {
	return (
		<section
			aria-label="Platform proof metrics and trusted companies"
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

				{/* Trust Logos Banner */}
				<div className="mt-10 sm:mt-14 border-t border-border/50 pt-6 sm:pt-8">
					<p className="text-center text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
						Trusted by product & engineering leaders at modern high-velocity companies
					</p>
					<div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-12 lg:gap-16 opacity-75 grayscale hover:grayscale-0 transition-all">
						{TRUST_LOGOS.map((logo) => (
							<span
								key={logo.name}
								className="font-display text-xs sm:text-sm font-bold tracking-widest text-foreground/80 sm:text-base"
							>
								{logo.name}
							</span>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
