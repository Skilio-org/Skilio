const STATS = [
	{
		value: "2,500+",
		label: "Verified Specialists",
		description: "Pre-screened Moroccan developers, designers, and specialists",
	},
	{
		value: "100%",
		label: "Escrow Protection",
		description: "Funds securely held and released only after your approval",
	},
	{
		value: "< 24h",
		label: "Average Match Time",
		description: "Connect with available local freelancers in Casablanca, Rabat & remote",
	},
	{
		value: "4.9 / 5",
		label: "Client Satisfaction",
		description: "Consistently high marks from Moroccan businesses and founders",
	},
]

const DOMAIN_SECTORS = [
	"E-Commerce & Retail",
	"Tech Startups",
	"Digital Agencies",
	"Logistics & Fleet",
	"Hospitality & Tours",
	"Fintech & Payments",
]

export function LandingStats() {
	return (
		<section
			aria-label="Platform proof metrics and domain sectors"
			className="border-y border-border bg-card py-10 sm:py-12 lg:py-16"
		>
			<div className="landing-container">
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

				{/* Domain Sectors Banner */}
				<div className="mt-10 sm:mt-14 border-t border-border/50 pt-6 sm:pt-8">
					<p className="text-center text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
						Powering projects across Morocco&apos;s fastest-growing sectors
					</p>
					<div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-12">
						{DOMAIN_SECTORS.map((sector) => (
							<span
								key={sector}
								className="rounded-full border border-border/70 bg-muted/40 px-3.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/20"
							>
								{sector}
							</span>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
