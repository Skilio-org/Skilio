import { Award, Check, MessageSquare, ShieldCheck, Zap } from "lucide-react"

export function LandingBento() {
	return (
		<section id="difference" className="scroll-mt-20 py-12 sm:py-20 lg:py-24">
			<div className="landing-container px-4 sm:px-6">
				{/* Section Header */}
				<div className="flex flex-col gap-2.5 sm:gap-3">
					<div className="inline-flex w-fit items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-bold text-foreground">
						<span>THE SKILIO DIFFERENCE</span>
					</div>
					<h2 className="landing-heading text-foreground">
						Engineered for speed, transparency, and high trust.
					</h2>
					<p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
						Why top founders and senior specialists are abandoning legacy 20% commission
						marketplaces for Skilio.
					</p>
				</div>

				{/* Bento Grid */}
				<div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 md:grid-cols-12">
					{/* Box 1: Milestone Escrow Protection (8 cols on lg) */}
					<div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6 transition-colors hover:border-outline md:col-span-12 lg:col-span-7">
						<div>
							<div className="inline-flex items-center gap-1.5 rounded-md bg-[#EEF8E7] dark:bg-[#252A21] dark:border dark:border-[#384334] px-2.5 py-1 text-xs font-bold text-[#3E7B3D] dark:text-[#8DD37D]">
								<ShieldCheck className="size-3.5" />
								<span>FINANCIAL SAFEGUARD</span>
							</div>
							<h3 className="mt-4 font-semibold text-lg sm:text-xl text-foreground">
								Milestone Escrow Protection
							</h3>
							<p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
								Funds are pre-deposited into tier-1 bank escrow before work begins.
								Freelancers know they will be paid; clients inspect and approve staging
								deliverables before releasing a single dollar.
							</p>
						</div>

						{/* Escrow Progress Visual */}
						<div className="mt-5 sm:mt-6 flex flex-col gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-3.5 sm:p-4">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-medium">
								<span className="text-foreground">Milestone 1: Architecture & Data Schema</span>
								<span className="inline-flex w-fit items-center rounded-md bg-[#EEF8E7] dark:bg-[#252A21] dark:border dark:border-[#384334] px-2 py-0.5 text-[10px] font-bold text-[#3E7B3D] dark:text-[#8DD37D]">
									Approved & Paid
								</span>
							</div>
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-medium">
								<span className="text-foreground">Milestone 2: Production Staging Review</span>
								<span className="inline-flex w-fit items-center rounded-md bg-[#FFFBEB] dark:bg-[#272318] dark:border dark:border-[#423920] px-2 py-0.5 text-[10px] font-bold text-warning dark:text-[#FBBF24]">
									Funds in Escrow ($4,200)
								</span>
							</div>
						</div>
					</div>

					{/* Box 2: Zero Hidden Platform Cuts (5 cols on lg) */}
					<div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6 transition-colors hover:border-outline md:col-span-12 lg:col-span-5">
						<div>
							<div className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-bold text-foreground">
								<Zap className="size-3.5" />
								<span>FAIR PRICING</span>
							</div>
							<h3 className="mt-4 font-semibold text-lg sm:text-xl text-foreground">
								Zero Hidden Take Rates
							</h3>
							<p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
								Unlike legacy marketplaces that siphon 20% of your earnings, Skilio
								passes maximum value to talent and founders with flat, transparent
								pricing.
							</p>
						</div>

						<div className="mt-5 sm:mt-6 rounded-xl border border-primary/30 bg-primary/5 p-3.5 sm:p-4">
							<span className="block text-xs font-semibold uppercase tracking-wider text-ring">
								Skilio Direct Guarantee
							</span>
							<p className="mt-1 font-display text-base sm:text-lg font-bold text-foreground">
								0% Cut for First 3 Months · Keep 100%
							</p>
						</div>
					</div>

					{/* Box 3: Direct Messaging & Collaboration (5 cols on lg) */}
					<div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6 transition-colors hover:border-outline md:col-span-12 lg:col-span-5">
						<div>
							<div className="inline-flex items-center gap-1.5 rounded-md bg-[#EEF8E7] dark:bg-[#252A21] dark:border dark:border-[#384334] px-2.5 py-1 text-xs font-bold text-[#3E7B3D] dark:text-[#8DD37D]">
								<MessageSquare className="size-3.5" />
								<span>SEAMLESS SYNC</span>
							</div>
							<h3 className="mt-4 font-semibold text-lg sm:text-xl text-foreground">
								Direct Founder-to-Engineer Sync
							</h3>
							<p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
								No agency intermediaries or account managers in the way. Real-time chat,
								milestone tracking, Git link previews, and contract revisions in one
								unified workspace.
							</p>
						</div>

						<div className="mt-5 sm:mt-6 flex items-center justify-between rounded-xl bg-muted/40 border border-border/50 p-3.5 text-xs">
							<span className="text-muted-foreground">Median response time</span>
							<span className="font-semibold text-[#3E7B3D] dark:text-[#8DD37D]">&lt; 15 minutes</span>
						</div>
					</div>

					{/* Box 4: Rigorous Top 3% Vetting (7 cols on lg) */}
					<div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6 transition-colors hover:border-outline md:col-span-12 lg:col-span-7">
						<div>
							<div className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-bold text-foreground">
								<Award className="size-3.5" />
								<span>QUALITY GUARANTEE</span>
							</div>
							<h3 className="mt-4 font-semibold text-lg sm:text-xl text-foreground">
								Vetted for Craft, Code & Communication
							</h3>
							<p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
								Every specialist completes technical architecture evaluations, portfolio code
								audits, and English communication assessments. You only interview
								candidates who can execute immediately without hand-holding.
							</p>
						</div>

						{/* Checklist */}
						<div className="mt-5 sm:mt-6 grid gap-2 grid-cols-1 sm:grid-cols-3">
							{[
								"Code Repo Audit",
								"System Design Review",
								"Verified Client Calls",
							].map((item) => (
								<div
									key={item}
									className="flex items-center gap-2 rounded-lg bg-muted/30 border border-border/40 p-2.5 text-xs font-medium text-foreground"
								>
									<Check className="size-3.5 text-[#3E7B3D] dark:text-[#8DD37D] shrink-0" />
									<span className="truncate">{item}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
