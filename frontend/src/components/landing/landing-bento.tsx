export function LandingBento() {
	return (
		<section id="difference" className="scroll-mt-20 landing-section">
			<div className="landing-container">
				{/* Section Header */}
				<div className="landing-section-header">
					<h2 className="landing-heading text-foreground">
						Built for trust, speed, and clear results.
					</h2>
					<p className="landing-lede">
						Designed specifically for Moroccan founders and freelancers who want direct
						collaboration without middlemen or excessive fees.
					</p>
				</div>

				{/* Bento Grid */}
				<div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 md:grid-cols-12">
					{/* Box 1: Milestone Escrow Protection */}
					<div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6 transition-colors hover:border-outline md:col-span-12 lg:col-span-7">
						<div>
							<h3 className="font-semibold text-lg sm:text-xl text-foreground">
								Milestone Escrow Protection
							</h3>
							<p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
								Funds are deposited securely into milestone escrow before work begins. Freelancers
								work with peace of mind; clients review and approve completed work before funds are
								released.
							</p>
						</div>

						{/* Escrow Progress Visual */}
						<div className="mt-5 sm:mt-6 flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-3.5 sm:p-4">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
								<span className="font-medium text-foreground">Milestone 1: Architecture & API Setup</span>
								<span className="text-muted-foreground font-medium">3,500 DH · Released</span>
							</div>
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
								<span className="font-medium text-foreground">Milestone 2: UI Implementation & Testing</span>
								<span className="text-muted-foreground font-medium">6,500 DH · In Escrow</span>
							</div>
						</div>
					</div>

					{/* Box 2: Zero Hidden Platform Cuts */}
					<div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6 transition-colors hover:border-outline md:col-span-12 lg:col-span-5">
						<div>
							<h3 className="font-semibold text-lg sm:text-xl text-foreground">
								Zero Hidden Take Rates
							</h3>
							<p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
								Unlike legacy international platforms that deduct 20% of your earnings, Skilio
								offers flat and transparent terms. Keep what you earn.
							</p>
						</div>

						<div className="mt-5 sm:mt-6 rounded-xl border border-border/60 bg-muted/20 p-3.5 sm:p-4 text-xs">
							<p className="font-medium text-foreground">
								Direct pricing · Keep 100% of your agreed milestone rate.
							</p>
						</div>
					</div>

					{/* Box 3: Direct Messaging & Collaboration */}
					<div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6 transition-colors hover:border-outline md:col-span-12 lg:col-span-5">
						<div>
							<h3 className="font-semibold text-lg sm:text-xl text-foreground">
								Direct Client-to-Freelancer Sync
							</h3>
							<p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
								No middle agency or account managers in between. Real-time chat, milestone tracking,
								file sharing, and contract revisions in one unified place.
							</p>
						</div>

						<div className="mt-5 sm:mt-6 flex items-center justify-between rounded-xl bg-muted/20 border border-border/60 p-3.5 text-xs text-muted-foreground">
							<span>Average response time</span>
							<span className="font-medium text-foreground">Under 30 minutes</span>
						</div>
					</div>

					{/* Box 4: Quality & Verification */}
					<div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6 transition-colors hover:border-outline md:col-span-12 lg:col-span-7">
						<div>
							<h3 className="font-semibold text-lg sm:text-xl text-foreground">
								Verified Moroccan Talent
							</h3>
							<p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
								Every specialist profile is reviewed for practical skills, verified portfolios, and
								professional reliability. Work with confidence from day one.
							</p>
						</div>

						{/* Criteria */}
						<div className="mt-5 sm:mt-6 grid gap-2 grid-cols-1 sm:grid-cols-3">
							{[
								"Verified Portfolios",
								"Practical Code Check",
								"Client Reviews",
							].map((item) => (
								<div
									key={item}
									className="rounded-lg bg-muted/20 border border-border/60 p-2.5 text-xs font-medium text-foreground text-center"
								>
									{item}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
