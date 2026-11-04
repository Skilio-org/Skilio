import { Link } from "@tanstack/react-router"
import { ArrowUpRight, MessageSquare, ScanSearch, ShieldCheck } from "lucide-react"

const STEPS = [
	{
		step: "01",
		icon: ScanSearch,
		title: "Define Brief or Browse",
		desc: "Post your project specifications in 2 minutes, or explore curated specialist profiles by exact tech stack and verified hourly rates.",
	},
	{
		step: "02",
		icon: MessageSquare,
		title: "Direct Alignment & Chat",
		desc: "Meet top candidates directly, review code repositories or Figma systems, and align on scope without intermediary delays.",
	},
	{
		step: "03",
		icon: ShieldCheck,
		title: "Milestone Delivery & Escrow",
		desc: "Lock payments safely in tier-1 escrow. Inspect staging deliverables, request revisions, and approve payouts with 1 click.",
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
						<span>SIMPLE 3-STEP WORKFLOW</span>
					</div>
					<h2 className="landing-heading text-foreground">
						From project brief to production in days.
					</h2>
					<p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
						A streamlined process engineered to remove bureaucratic friction, long sales cycles,
						and agency markups.
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
									<span className="font-display text-3xl font-extrabold text-ring">
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
