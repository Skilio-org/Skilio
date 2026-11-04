import { Award, Check, MessageSquare, ShieldCheck, Zap } from "lucide-react"

export function LandingBento() {
	return (
		<section id="difference" className="scroll-mt-20 py-12 sm:py-20 lg:py-24">
			<div className="landing-container px-4 sm:px-6">
				{/* Section Header */}
				<div className="flex flex-col gap-2.5 sm:gap-3">
					<div className="inline-flex w-fit items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-bold text-foreground">
						<span>THE SKILIO ADVANTAGE</span>
					</div>
					<h2 className="landing-heading text-foreground">
						Built for speed, transparency, and high trust.
					</h2>
					<p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
						Why Moroccan businesses and independent specialists choose Skilio for their projects.
					</p>
				</div>

				{/* Bento Grid */}
				<div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 md:grid-cols-12">
					{/* Box 1: Milestone Escrow Protection */}
					<div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-all hover:border-foreground/20 hover:shadow-md md:col-span-12 lg:col-span-7">
						<div>
							<div className="inline-flex items-center gap-1.5 rounded-md bg-[#EEF8E7] dark:bg-[#252A21] dark:border dark:border-[#384334] px-2.5 py-1 text-xs font-bold text-[#3E7B3D] dark:text-[#8DD37D]">
								<ShieldCheck className="size-3.5" />
								<span>SECURE PAYMENTS</span>
							</div>
							<h3 className="mt-4 font-semibold text-lg sm:text-xl text-foreground">
								Milestone Escrow Protection
							</h3>
							<p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
								Funds are held safely in milestone escrow before work begins. Freelancers are confident
								they will be paid, and clients inspect completed work before releasing payment.
							</p>
						</div>

						{/* Escrow Progress Visual */}
						<div className="mt-5 sm:mt-6 flex flex-col gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-3.5 sm:p-4">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-medium">
								<span className="text-foreground">Milestone 1: UI Wireframes & Architecture</span>
								<span className="inline-flex w-fit items-center rounded-md bg-[#EEF8E7] dark:bg-[#252A21] dark:border dark:border-[#384334] px-2 py-0.5 text-[10px] font-bold text-[#3E7B3D] dark:text-[#8DD37D]">
									Approved & Paid
								</span>
							</div>
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-medium">
								<span className="text-foreground">Milestone 2: Frontend Implementation</span>
								<span className="inline-flex w-fit items-center rounded-md bg-[#FFFBEB] dark:bg-[#272318] dark:border dark:border-[#423920] px-2 py-0.5 text-[10px] font-bold text-[#D97706] dark:text-[#FBBF24]">
									Funds in Escrow (6,500 DH)
								</span>
							</div>
						</div>
					</div>

					{/* Box 2: Zero Hidden Platform Deductions */}
					<div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-all hover:border-foreground/20 hover:shadow-md md:col-span-12 lg:col-span-5">
						<div>
							<div className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-bold text-foreground">
								<Zap className="size-3.5" />
								<span>TRANSPARENT VALUE</span>
							</div>
							<h3 className="mt-4 font-semibold text-lg sm:text-xl text-foreground">
								Zero Hidden Platform Deductions
							</h3>
							<p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
								Unlike traditional agencies that mark up fees by 30% or more, Skilio provides direct,
								honest pricing so everyone gets fair value.
							</p>
						</div>

						<div className="mt-5 sm:mt-6 rounded-xl border border-primary/30 bg-primary/5 p-3.5 sm:p-4">
							<span className="block text-xs font-semibold uppercase tracking-wider text-[#7FA600] dark:text-primary">
								Skilio Fair Deal
							</span>
							<p className="mt-1 font-display text-base sm:text-lg font-bold text-foreground">
								Direct Agreement · Keep 100% of Agreed Rate
							</p>
						</div>
					</div>

					{/* Box 3: Direct In-App Chat */}
					<div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-all hover:border-foreground/20 hover:shadow-md md:col-span-12 lg:col-span-5">
						<div>
							<div className="inline-flex items-center gap-1.5 rounded-md bg-[#EEF8E7] dark:bg-[#252A21] dark:border dark:border-[#384334] px-2.5 py-1 text-xs font-bold text-[#3E7B3D] dark:text-[#8DD37D]">
								<MessageSquare className="size-3.5" />
								<span>DIRECT CHAT</span>
							</div>
							<h3 className="mt-4 font-semibold text-lg sm:text-xl text-foreground">
								Direct Client-to-Specialist Chat
							</h3>
							<p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
								No middlemen or agency delays. Real-time messaging, file sharing, and milestone tracking
								happen in one smooth workspace.
							</p>
						</div>

						<div className="mt-5 sm:mt-6 flex items-center justify-between rounded-xl bg-muted/40 border border-border/50 p-3.5 text-xs">
							<span className="text-muted-foreground">Typical response time</span>
							<span className="font-semibold text-[#3E7B3D] dark:text-[#8DD37D]">&lt; 30 minutes</span>
						</div>
					</div>

					{/* Box 4: Quality & Verification */}
					<div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-all hover:border-foreground/20 hover:shadow-md md:col-span-12 lg:col-span-7">
						<div>
							<div className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-bold text-foreground">
								<Award className="size-3.5" />
								<span>QUALITY & TRUST</span>
							</div>
							<h3 className="mt-4 font-semibold text-lg sm:text-xl text-foreground">
								Verified Profiles & Authentic Reviews
							</h3>
							<p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
								Every freelancer profile includes verified portfolios, technical skills, and authentic client reviews.
								You can evaluate past work with full confidence.
							</p>
						</div>

						{/* Checklist */}
						<div className="mt-5 sm:mt-6 grid gap-2 grid-cols-1 sm:grid-cols-3">
							{[
								"Verified Work History",
								"Direct Code Samples",
								"Authentic Client Reviews",
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
