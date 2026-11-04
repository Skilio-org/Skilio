import { Link } from "@tanstack/react-router"
import { ArrowUpRight, MessageSquare, ScanSearch, ShieldCheck } from "lucide-react"

const STEPS = [
	{
		step: "01",
		icon: ScanSearch,
		title: "Post Brief or Browse",
		desc: "Post what you need built in 2 minutes, or browse verified Moroccan developers and designers by skill and hourly rate.",
	},
	{
		step: "02",
		icon: MessageSquare,
		title: "Direct Chat & Agree on Scope",
		desc: "Connect with candidates in real time, review portfolios, and agree on clear milestones and timelines.",
	},
	{
		step: "03",
		icon: ShieldCheck,
		title: "Review Deliverables & Pay",
		desc: "Payments are protected in escrow. Inspect finished work, request revisions, and release payouts with confidence.",
	},
]

export function LandingHowItWorks() {
	return (
		<section
			id="how-it-works"
			className="scroll-mt-20 border-y border-border/70 bg-card py-12 sm:py-20 lg:py-24"
		>
			<div className="landing-container px-4 sm:px-6">
				{/* Section Header */}
				<div className="flex flex-col gap-2.5 sm:gap-3">
					<div className="inline-flex w-fit items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-bold text-foreground">
						<span>SIMPLE 3-STEP PROCESS</span>
					</div>
					<h2 className="landing-heading text-foreground">
						From project brief to completion in days.
					</h2>
					<p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
						A straightforward process designed to eliminate delays, middleman markups, and communication issues.
					</p>
				</div>

				{/* Steps Grid */}
				<div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 md:grid-cols-3">
					{STEPS.map(({ step, icon: Icon, title, desc }) => (
						<div
							key={step}
							className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-background p-6 sm:p-7 shadow-xs transition-all hover:border-foreground/20 hover:shadow-md"
						>
							<div>
								<div className="flex items-center justify-between">
									<span className="font-display text-3xl font-extrabold text-[#7FA600] dark:text-primary">
										{step}
									</span>
									<div className="grid size-11 place-items-center rounded-xl bg-muted/60 text-foreground">
										<Icon className="size-5" />
									</div>
								</div>

								<h3 className="mt-5 sm:mt-6 font-semibold text-base sm:text-lg text-foreground">
									{title}
								</h3>
								<p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
									{desc}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* Bottom Action */}
				<div className="mt-8 sm:mt-10 flex justify-center">
					<Link
						to="/signup"
						search={{ role: "client" }}
						className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
					>
						<span>Get started with your project</span>
						<ArrowUpRight className="size-4" />
					</Link>
				</div>
			</div>
		</section>
	)
}
