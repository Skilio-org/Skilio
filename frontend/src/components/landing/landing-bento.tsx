import { Award, Check, MessageSquare, ShieldCheck, Zap } from "lucide-react"

export function LandingBento() {
	return (
		<section id="difference" className="scroll-mt-20 py-16 sm:py-24">
			<div className="landing-container">
				{/* Section Header */}
				<div className="flex flex-col gap-3">
					<div className="inline-flex w-fit items-center gap-1.5 rounded-md bg-[#EDF9C5] px-2.5 py-1 text-xs font-bold text-[#4F6500] dark:bg-[#1F2125] dark:text-[#B8EF0D]">
						<span>THE SKILIO DIFFERENCE</span>
					</div>
					<h2 className="landing-heading text-foreground">
						Engineered for speed, transparency, and high trust.
					</h2>
					<p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
						Why top founders and senior specialists are abandoning legacy 20% commission
						marketplaces for Skilio.
					</p>
				</div>

				{/* Bento Grid */}
				<div className="mt-12 grid gap-6 md:grid-cols-12">
					{/* Box 1: Milestone Escrow Protection (8 cols on lg) */}
					<div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all hover:border-foreground/20 hover:shadow-md md:col-span-12 lg:col-span-7">
						<div>
							<div className="inline-flex items-center gap-1.5 rounded-md bg-[#EEF8E7] px-2.5 py-1 text-xs font-bold text-[#3E7B3D] dark:bg-[#3E7B3D]/20">
								<ShieldCheck className="size-3.5" />
								<span>FINANCIAL SAFEGUARD</span>
							</div>
							<h3 className="mt-4 font-semibold text-xl text-foreground">
								Milestone Escrow Protection
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								Funds are pre-deposited into tier-1 bank escrow before work begins.
								Freelancers know they will be paid; clients inspect and approve staging
								deliverables before releasing a single dollar.
							</p>
						</div>

						{/* Escrow Progress Visual */}
						<div className="mt-6 flex flex-col gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-4">
							<div className="flex items-center justify-between text-xs font-medium">
								<span className="text-foreground">Milestone 1: Architecture & Data Schema</span>
								<span className="rounded-md bg-[#EEF8E7] px-2 py-0.5 text-[10px] font-bold text-[#3E7B3D] dark:bg-[#3E7B3D]/20">
									Approved & Paid
								</span>
							</div>
							<div className="flex items-center justify-between text-xs font-medium">
								<span className="text-foreground">Milestone 2: Production Staging Review</span>
								<span className="rounded-md bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-bold text-[#D97706] dark:bg-[#D97706]/20">
									Funds in Escrow ($4,200)
								</span>
							</div>
						</div>
					</div>

					{/* Box 2: Zero Hidden Platform Cuts (5 cols on lg) */}
					<div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all hover:border-foreground/20 hover:shadow-md md:col-span-12 lg:col-span-5">
						<div>
							<div className="inline-flex items-center gap-1.5 rounded-md bg-[#EDF9C5] px-2.5 py-1 text-xs font-bold text-[#4F6500] dark:bg-[#1F2125] dark:text-[#B8EF0D]">
								<Zap className="size-3.5" />
								<span>FAIR PRICING</span>
							</div>
							<h3 className="mt-4 font-semibold text-xl text-foreground">
								Zero Hidden Take Rates
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								Unlike legacy marketplaces that siphon 20% of your earnings, Skilio
								passes maximum value to talent and founders with flat, transparent
								pricing.
							</p>
						</div>

						<div className="mt-6 rounded-xl border border-[#B8EF0D]/40 bg-[#EDF9C5]/40 p-4 dark:border-[#B8EF0D]/20 dark:bg-[#1F2125]">
							<span className="block text-xs font-semibold uppercase tracking-wider text-[#4F6500] dark:text-[#B8EF0D]">
								Skilio Direct Guarantee
							</span>
							<p className="mt-1 font-display text-lg font-bold text-foreground">
								0% Cut for First 3 Months · Keep 100%
							</p>
						</div>
					</div>

					{/* Box 3: Direct Messaging & Collaboration (5 cols on lg) */}
					<div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all hover:border-foreground/20 hover:shadow-md md:col-span-12 lg:col-span-5">
						<div>
							<div className="inline-flex items-center gap-1.5 rounded-md bg-[#EFF6FF] px-2.5 py-1 text-xs font-bold text-[#1D4ED8] dark:bg-[#1D4ED8]/20 dark:text-[#60A5FA]">
								<MessageSquare className="size-3.5" />
								<span>SEAMLESS SYNC</span>
							</div>
							<h3 className="mt-4 font-semibold text-xl text-foreground">
								Direct Founder-to-Engineer Sync
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								No agency intermediaries or account managers in the way. Real-time chat,
								milestone tracking, Git link previews, and contract revisions in one
								unified workspace.
							</p>
						</div>

						<div className="mt-6 flex items-center justify-between rounded-xl bg-muted/40 p-3.5 text-xs">
							<span className="text-muted-foreground">Median response time</span>
							<span className="font-semibold text-foreground">&lt; 15 minutes</span>
						</div>
					</div>

					{/* Box 4: Rigorous Top 3% Vetting (7 cols on lg) */}
					<div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all hover:border-foreground/20 hover:shadow-md md:col-span-12 lg:col-span-7">
						<div>
							<div className="inline-flex items-center gap-1.5 rounded-md bg-[#FAF5FF] px-2.5 py-1 text-xs font-bold text-[#7E22CE] dark:bg-[#7E22CE]/20 dark:text-[#C084FC]">
								<Award className="size-3.5" />
								<span>QUALITY GUARANTEE</span>
							</div>
							<h3 className="mt-4 font-semibold text-xl text-foreground">
								Vetted for Craft, Code & Communication
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								Every specialist completes technical architecture evaluations, portfolio code
								audits, and English communication assessments. You only interview
								candidates who can execute immediately without hand-holding.
							</p>
						</div>

						{/* Checklist */}
						<div className="mt-6 grid gap-2 sm:grid-cols-3">
							{[
								"Code Repo Audit",
								"System Design Review",
								"Verified Client Calls",
							].map((item) => (
								<div
									key={item}
									className="flex items-center gap-2 rounded-lg bg-muted/30 p-2.5 text-xs font-medium text-foreground"
								>
									<Check className="size-3.5 text-[#3E7B3D]" />
									<span>{item}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

