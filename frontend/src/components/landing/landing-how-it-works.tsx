import { Link } from "@tanstack/react-router"
import { MessageSquare, ScanSearch, ShieldCheck } from "lucide-react"

const STEPS = [
	{
		step: "01",
		icon: ScanSearch,
		title: "Post Brief or Browse Talent",
		desc: "Describe what you need in 2 minutes, or browse verified Moroccan developers and designers by skill and hourly rate.",
	},
	{
		step: "02",
		icon: MessageSquare,
		title: "Direct Chat & Agree on Scope",
		desc: "Talk directly with candidates, check previous work, and agree on milestones, deadlines, and pricing.",
	},
	{
		step: "03",
		icon: ShieldCheck,
		title: "Review Deliverables & Pay Safely",
		desc: "Milestone funds remain in escrow until you test and approve the work. Release payments with full confidence.",
	},
]

export function LandingHowItWorks() {
	return (
		<section
			id="how-it-works"
			className="scroll-mt-20 border-y border-border bg-card landing-section"
		>
			<div className="landing-container">
				{/* Section Header */}
				<div className="landing-section-header">
					<h2 className="landing-heading text-foreground">
						Simple 3-step process to get work done.
					</h2>
					<p className="landing-lede">
						No agency layers, no complex sales calls. Direct, fast, and transparent.
					</p>
				</div>

				{/* Steps Grid */}
				<div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 md:grid-cols-3">
					{STEPS.map(({ step, icon: Icon, title, desc }) => (
						<div
							key={step}
							className="group relative flex flex-col justify-between rounded-xl border border-border bg-background p-5 sm:p-6 transition-colors hover:border-outline"
						>
							<div>
								<div className="flex items-center justify-between">
									<span className="font-display text-3xl font-extrabold text-foreground">
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
						className="inline-flex w-full sm:w-auto h-9 items-center justify-center rounded-lg bg-primary px-5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
					>
						<span>Get started with your project</span>
					</Link>
				</div>
			</div>
		</section>
	)
}
