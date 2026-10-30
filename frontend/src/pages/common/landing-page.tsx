import { useState } from "react"
import { Star, Quote } from "lucide-react"

import { LandingCategories } from "@/components/landing/landing-categories"
import { LandingCta } from "@/components/landing/landing-cta"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works"
import { LandingTalent } from "@/components/landing/landing-talent"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const STATS = [
	{ value: "0%", label: "Platform commission", description: "Zero hidden cuts or fees for talent and clients" },
	{ value: "4", label: "Specialty categories", description: "Development, Design, Marketing, and AI Services" },
	{ value: "Direct", label: "Client messaging", description: "Unrestricted direct conversations and clear scoping" },
	{
		value: "100%",
		label: "Transparent reviews",
		description: "Authentic client ratings, feedback, and skill transparency",
	},
]

const TESTIMONIALS = [
	{
		quote:
			"Finding a senior full-stack engineer took us less than 48 hours. The caliber of specialists on Skilio is noticeably higher than typical freelance marketplaces.",
		author: "Elena Rostova",
		role: "VP of Product",
		company: "FinTech Labs",
		initials: "ER",
		type: "Client",
	},
	{
		quote:
			"Skilio creates an environment of mutual respect. Direct communication with founders, crystal-clear milestones, and zero friction getting paid on time.",
		author: "Marcus Chen",
		role: "Principal AI Engineer",
		company: "Independent Specialist",
		initials: "MC",
		type: "Freelancer",
	},
	{
		quote:
			"We hired two specialist contractors for our design system rebuild. The direct collaboration and transparent rates made onboarding seamless and fast.",
		author: "Sarah Jenkins",
		role: "Founder & Design Director",
		company: "Studio Lumina",
		initials: "SJ",
		type: "Client",
	},
]

export function LandingPage() {
	const [filter, setFilter] = useState("All talent")

	return (
		<div className="landing-page min-h-dvh bg-card text-foreground">
			<LandingHeader />
			<main id="main-content" tabIndex={-1} className="outline-none">
				<LandingHero />

				{/* Key Platform Stats & Social Proof */}
				<section aria-label="Key platform metrics" className="border-border border-y bg-muted/25 py-12 lg:py-14">
					<div className="landing-container">
						<div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-10">
							{STATS.map((stat, idx) => (
								<div
									key={stat.label}
									className={`flex flex-col ${
										idx < STATS.length - 1 ? "md:border-border md:border-r md:pr-6 lg:pr-8" : ""
									}`}
								>
									<span className="font-display font-medium text-3xl text-foreground tracking-tight sm:text-4xl lg:text-5xl">
										{stat.value}
									</span>
									<span className="mt-2 font-medium text-foreground text-sm sm:text-base">{stat.label}</span>
									<p className="mt-1 text-muted-foreground text-xs leading-relaxed">{stat.description}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<LandingCategories onSelect={setFilter} />
				<LandingTalent filter={filter} onFilter={setFilter} />

				{/* Testimonials & Customer Success Stories */}
				<section id="testimonials" className="scroll-mt-24 border-border border-t bg-background py-16 sm:py-24">
					<div className="landing-container">
						<div className="max-w-2xl">
							<p className="mb-4 font-medium text-primary text-sm">Testimonials</p>
							<h2 className="landing-heading">Trusted by teams that ship.</h2>
							<p className="mt-4 text-base text-muted-foreground leading-7">
								See how leading founders and world-class independent specialists collaborate on Skilio to bring
								ambitious ideas to life.
							</p>
						</div>

						<div className="mt-12 grid gap-6 md:grid-cols-3 lg:gap-8">
							{TESTIMONIALS.map((t) => (
								<Card
									key={t.author}
									className="group flex flex-col justify-between border-border/80 bg-card/60 p-6 shadow-xs backdrop-blur-xs transition-all hover:border-border hover:shadow-sm sm:p-7"
								>
									<CardContent className="p-0">
										<div className="flex items-center justify-between gap-2">
											<div className="flex items-center gap-1 text-amber-500">
												{Array.from({ length: 5 }).map((_, i) => (
													<Star key={i} className="size-4 fill-amber-400 text-amber-400" />
												))}
											</div>
											<Badge variant="outline" className="font-normal text-[11px] text-muted-foreground tracking-wide">
												{t.type}
											</Badge>
										</div>

										<div className="relative mt-5">
											<Quote className="absolute -top-2 -left-1 size-6 text-muted-foreground/20" />
											<p className="relative z-10 text-foreground/90 text-sm leading-relaxed sm:text-base">
												"{t.quote}"
											</p>
										</div>
									</CardContent>

									<div className="mt-8 flex items-center gap-3.5 border-border/60 border-t pt-5">
										<Avatar className="size-10 border border-border">
											<AvatarFallback className="bg-surface-container font-semibold text-on-surface text-xs">
												{t.initials}
											</AvatarFallback>
										</Avatar>
										<div className="min-w-0">
											<p className="truncate font-medium text-foreground text-sm">{t.author}</p>
											<p className="truncate text-muted-foreground text-xs">
												{t.role} · <span className="text-foreground/70">{t.company}</span>
											</p>
										</div>
									</div>
								</Card>
							))}
						</div>
					</div>
				</section>

				<LandingHowItWorks />
				<LandingCta />
			</main>
			<LandingFooter />
		</div>
	)
}
