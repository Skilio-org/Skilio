import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Award, Clock, ShieldCheck, Sparkles } from "lucide-react"

const CONTRACTS = [
	{
		tag: "Fixed Scope",
		budget: "$14,000",
		rateType: "Fixed Budget · 3 Milestones",
		title: "Autonomous Multi-Agent Orchestration Platform",
		client: "FinTech Labs · Enterprise Verified",
		escrow: "100% Escrow Funded",
		proposals: "4 Proposals",
		time: "Posted 2h ago",
		tags: ["LangChain", "Python", "FastAPI", "Docker", "PostgreSQL"],
	},
	{
		tag: "Hourly Contract",
		budget: "$110 - $140",
		rateType: "/hour · 3 Month Contract",
		title: "Core Banking API Architecture & Go Microservices",
		client: "Vantage Payments · Payment Verified",
		escrow: "Verified Payment Method",
		proposals: "7 Proposals",
		time: "Posted 5h ago",
		tags: ["Go", "gRPC", "Temporal", "Kubernetes", "AWS"],
	},
	{
		tag: "Design Sprint",
		budget: "$8,500",
		rateType: "Fixed Budget · 2 Sprints",
		title: "Enterprise Design System & Dashboard Component Library",
		client: "Studio Lumina · Series A Startup",
		escrow: "Escrow Pre-Funded",
		proposals: "6 Proposals",
		time: "Posted 7h ago",
		tags: ["Figma", "Design Systems", "Tailwind CSS", "React"],
	},
]

export function LandingContracts() {
	return (
		<section
			id="contracts"
			className="scroll-mt-20 border-y border-border/70 dark:border-[#1F2D21] bg-muted/20 dark:bg-[#080C09] py-12 sm:py-20 lg:py-24"
		>
			<div className="landing-container px-4 sm:px-6">
				{/* Section Header */}
				<div className="flex flex-col gap-2.5 sm:gap-3">
					<div className="inline-flex w-fit items-center gap-1.5 rounded-md border border-[#B8EF0D]/40 bg-[#EDF9C5] dark:border-[#2E421F] dark:bg-[#152317] px-2.5 py-1 text-xs font-bold text-[#4F6500] dark:text-[#B8EF0D]">
						<ShieldCheck className="size-3.5" />
						<span>LIVE MARKETPLACE FEED</span>
					</div>
					<h2 className="landing-heading text-foreground">
						High-budget contracts posted today. Serious builders.
					</h2>
					<p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
						For independent talent: directly apply to pre-funded milestones, set your own
						rates, and keep 100% of your earnings with zero hidden platform cut penalties.
					</p>
				</div>

				{/* Contract Cards Grid */}
				<div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{CONTRACTS.map((contract) => (
						<article
							key={contract.title}
							className="group flex flex-col justify-between rounded-2xl border border-border/80 dark:border-[#1F2D21] bg-card dark:bg-[#0E140F] p-5 sm:p-6 shadow-xs transition-all hover:border-foreground/20 dark:hover:border-[#B8EF0D]/30 hover:shadow-md"
						>
							<div>
								{/* Meta Row: Tag & Escrow Badge */}
								<div className="flex items-center justify-between gap-2">
									<div className="flex flex-wrap items-center gap-1.5">
										<span className="rounded-md bg-[#1F2125] dark:bg-[#131B14] dark:border dark:border-[#1F2D21] px-2 py-0.5 text-[11px] font-semibold text-white dark:text-[#B8EF0D]">
											{contract.tag}
										</span>
										<span className="inline-flex items-center gap-1 rounded-md bg-[#EEF8E7] dark:bg-[#142316] dark:border dark:border-[#203D24] px-2 py-0.5 text-[11px] font-semibold text-[#1E5C2D] dark:text-[#4ADE80]">
											<ShieldCheck className="size-3" />
											{contract.escrow}
										</span>
									</div>
									<span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
										<Clock className="size-3" />
										{contract.time}
									</span>
								</div>

								{/* Title */}
								<h3 className="mt-4 font-semibold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors leading-snug">
									{contract.title}
								</h3>

								{/* Client Info */}
								<div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
									<Award className="size-3.5 text-[#1E5C2D] dark:text-[#4ADE80] shrink-0" />
									<span className="truncate">{contract.client}</span>
								</div>

								{/* Budget Box */}
								<div className="mt-4 flex flex-wrap items-baseline gap-2">
									<span className="font-display font-bold text-xl sm:text-2xl text-foreground">
										{contract.budget}
									</span>
									<span className="text-xs text-muted-foreground">
										{contract.rateType}
									</span>
								</div>

								{/* Tags */}
								<div className="mt-4 flex flex-wrap gap-1.5">
									{contract.tags.map((tg) => (
										<span
											key={tg}
											className="rounded-md border border-border/60 dark:border-[#1F2D21] bg-muted/40 dark:bg-[#131B14] px-2 py-0.5 text-[11px] font-medium text-muted-foreground dark:text-[#B5C4B6]"
										>
											{tg}
										</span>
									))}
								</div>
							</div>

							{/* Footer */}
							<div className="mt-5 sm:mt-6 flex items-center justify-between border-t border-border/60 dark:border-[#1F2D21] pt-3.5 sm:pt-4 text-xs">
								<span className="text-muted-foreground font-medium">
									{contract.proposals}
								</span>
								<Link
									to="/signup"
									search={{ role: "freelancer" }}
									className="inline-flex items-center gap-1 font-semibold text-foreground dark:text-[#B8EF0D] hover:underline"
								>
									<span>Submit Proposal</span>
									<ArrowUpRight className="size-3.5" />
								</Link>
							</div>
						</article>
					))}
				</div>

				{/* Bottom Actions */}
				<div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
					<Link
						to="/signup"
						search={{ role: "freelancer" }}
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F2125] dark:bg-[#B8EF0D] px-6 py-3 text-sm font-semibold text-white dark:text-[#080C09] shadow-xs transition-all hover:bg-[#2B2E32] dark:hover:bg-[#C8FF23]"
					>
						<span>Browse all 340+ open contracts</span>
						<ArrowUpRight className="size-4" />
					</Link>
					<Link
						to="/signup"
						search={{ role: "client" }}
						className="inline-flex items-center justify-center gap-2 rounded-xl border border-border dark:border-[#1F2D21] bg-card dark:bg-[#0E140F] px-6 py-3 text-sm font-semibold text-foreground shadow-xs transition-all hover:border-foreground/30 dark:hover:border-[#B8EF0D]/40 hover:bg-muted dark:hover:bg-[#131B14]"
					>
						<Sparkles className="size-4 text-[#7FA600] dark:text-[#B8EF0D]" />
						<span>Post a new project in 2 minutes</span>
					</Link>
				</div>
			</div>
		</section>
	)
}
