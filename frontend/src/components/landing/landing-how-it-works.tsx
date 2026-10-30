import { Link } from "@tanstack/react-router"
import { ArrowUpRight, CheckCircle2, MessagesSquare, ScanSearch, ShieldCheck } from "lucide-react"

const STEPS = [
	{
		icon: ScanSearch,
		step: "01",
		title: "Discover verified specialists",
		copy: "Search by core skills, explore domains, and review public profiles with authentic client ratings and transparent rates.",
	},
	{
		icon: MessagesSquare,
		step: "02",
		title: "Direct client-talent messaging",
		copy: "Message specialists directly without middlemen or restrictive gates. Clarify project scope, timelines, and deliverables.",
	},
	{
		icon: ShieldCheck,
		step: "03",
		title: "Collaborate with zero commission",
		copy: "Work together with 0% platform cuts. Independent talent keeps 100% of their rate, and clients pay exactly what was agreed upon.",
	},
]

export function LandingHowItWorks() {
	return (
		<section id="how-it-works" className="scroll-mt-24 border-border border-y bg-muted/40 py-16 sm:py-20 lg:py-24">
			<div className="landing-container grid gap-12 md:grid-cols-[.9fr_1.1fr] lg:gap-20">
				<div>
					<p className="mb-4 font-medium text-primary text-sm">How it works</p>
					<h2 className="landing-heading text-foreground">
						Less searching.
						<br />
						More doing.
					</h2>
					<p className="mt-4 max-w-md text-base text-muted-foreground leading-relaxed sm:leading-7">
						Go from a project idea to collaborating with the right specialist. Direct connections, zero platform
						commission, and total transparency from day one.
					</p>

					<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
						<Link
							to="/signup"
							search={{ role: "client" }}
							className="landing-primary inline-flex min-h-11 self-start px-6 font-semibold text-sm"
						>
							Get started as client <ArrowUpRight className="size-4" />
						</Link>
						<Link
							to="/signup"
							search={{ role: "freelancer" }}
							className="landing-secondary inline-flex min-h-11 self-start px-6 font-semibold text-sm"
						>
							Join as talent
						</Link>
					</div>

					<div className="mt-8 flex items-center gap-2 text-muted-foreground text-xs">
						<CheckCircle2 className="size-4 text-success" />
						<span>No credit card required to explore or message</span>
					</div>
				</div>

				<ol className="space-y-6 sm:space-y-8">
					{STEPS.map(({ icon: Icon, step, title, copy }) => (
						<li
							key={title}
							className="group relative flex gap-5 rounded-2xl border border-border bg-card p-6 shadow-xs transition-all duration-200 hover:border-outline hover:shadow-sm sm:p-7 dark:hover:border-border-hover"
						>
							<span className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-surface-container text-primary">
								<Icon className="size-5.5" strokeWidth={1.75} />
							</span>
							<div>
								<div className="flex items-center gap-2.5">
									<span className="font-mono font-semibold text-muted-foreground/60 text-xs">{step}</span>
									<h3 className="font-display font-medium text-foreground text-lg tracking-tight transition-colors group-hover:text-primary">
										{title}
									</h3>
								</div>
								<p className="mt-2 text-muted-foreground text-sm leading-relaxed">{copy}</p>
							</div>
						</li>
					))}
				</ol>
			</div>
		</section>
	)
}
