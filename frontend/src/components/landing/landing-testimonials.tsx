import { Star } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const TESTIMONIALS = [
	{
		quote:
			"Finding a dependable React developer in Morocco used to take weeks of asking around. On Skilio, we found an engineer who delivered our client portal within 10 days. Clean code and smooth communication throughout.",
		author: "Reda El Alami",
		role: "Founder",
		company: "Atlas Retail & Media · Casablanca",
		initials: "RA",
		type: "Client",
	},
	{
		quote:
			"As a freelance designer in Morocco, getting paid on time and fairly has always been stressful. Skilio's milestone system means I can focus on my creative work knowing payments are safely held in escrow.",
		author: "Siham Mansouri",
		role: "UI/UX Designer",
		company: "Freelance Specialist · Rabat",
		initials: "SM",
		type: "Freelancer",
	},
	{
		quote:
			"We needed extra engineering support for our mobile app release. The developer we hired in Marrakech integrated smoothly with our team and delivered clean, well-tested code right on schedule.",
		author: "Tarik Berrada",
		role: "Tech Lead",
		company: "DabaTech · Tangier",
		initials: "TB",
		type: "Client",
	},
]

export function LandingTestimonials() {
	return (
		<section id="testimonials" className="scroll-mt-20 py-12 sm:py-20 lg:py-24">
			<div className="landing-container px-4 sm:px-6">
				{/* Section Header */}
				<div className="flex flex-col gap-2.5 sm:gap-3">
					<div className="inline-flex w-fit items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-bold text-foreground">
						<span>AUTHENTIC REVIEWS & STORIES</span>
					</div>
					<h2 className="landing-heading text-foreground">
						Trusted by Moroccan founders and independent specialists.
					</h2>
					<p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
						See how Moroccan businesses and skilled freelancers collaborate with confidence on Skilio.
					</p>
				</div>

				{/* Cards Grid */}
				<div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 md:grid-cols-3">
					{TESTIMONIALS.map((t) => (
						<Card
							key={t.author}
							className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-all hover:border-foreground/20 hover:shadow-md"
						>
							<CardContent className="p-0">
								<div className="flex items-center justify-between gap-2">
									<div className="flex items-center gap-1 text-amber-500">
										{Array.from({ length: 5 }).map((_, i) => (
											<Star key={i} className="size-3.5 sm:size-4 fill-amber-400 text-amber-400" />
										))}
									</div>
									<Badge
										variant="outline"
										className="text-[11px] font-semibold text-muted-foreground"
									>
										{t.type}
									</Badge>
								</div>

								<div className="mt-4 sm:mt-5">
									<p className="text-foreground/90 text-xs sm:text-sm leading-relaxed italic">
										“{t.quote}”
									</p>
								</div>
							</CardContent>

							<div className="mt-6 sm:mt-8 flex items-center gap-3 sm:gap-3.5 border-t border-border/60 pt-4 sm:pt-5">
								<Avatar className="size-9 sm:size-10 border border-border">
									<AvatarFallback className="bg-muted border border-border/80 font-semibold text-xs text-foreground">
										{t.initials}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0">
									<p className="truncate font-semibold text-foreground text-xs sm:text-sm">
										{t.author}
									</p>
									<p className="truncate text-muted-foreground text-[11px] sm:text-xs">
										{t.role} · <span className="text-foreground/80">{t.company}</span>
									</p>
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		</section>
	)
}
