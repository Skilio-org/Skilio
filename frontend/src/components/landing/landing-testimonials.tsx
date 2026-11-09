import { Quote } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { StarRatingDisplay } from "@/components/reviews/review-stars"

const TESTIMONIALS = [
	{
		quote:
			"Finding a serious React developer took us less than two days. Being able to pay in Dirhams through milestone escrow makes working with local freelancers worry-free.",
		author: "Reda El Alami",
		role: "Founder",
		company: "Casablanca Logistics",
		initials: "RA",
	},
	{
		quote:
			"Skilio makes it easy to work with real Moroccan companies without losing 20% to middle fees. Clients know what they want and milestones are paid on time.",
		author: "Siham Mansouri",
		role: "Senior UI/UX Designer",
		company: "Independent Specialist · Rabat",
		initials: "SM",
	},
	{
		quote:
			"We hired a mobile developer to build our customer app. The communication was direct, deadlines were respected, and the code quality was top-notch.",
		author: "Tarik Berrada",
		role: "Co-founder",
		company: "Atlas E-Com · Marrakech",
		initials: "TB",
	},
]

export function LandingTestimonials() {
	return (
		<section id="testimonials" className="scroll-mt-20 landing-section">
			<div className="landing-container">
				{/* Section Header */}
				<div className="landing-section-header">
					<h2 className="landing-heading text-foreground">
						Trusted by Moroccan businesses and independent talent.
					</h2>
					<p className="landing-lede">
						Real experiences from Moroccan founders, startups, and freelancers collaborating on
						Skilio.
					</p>
				</div>

				{/* Cards Grid */}
				<div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 md:grid-cols-3">
					{TESTIMONIALS.map((t) => (
						<Card
							key={t.author}
							className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6 transition-colors hover:border-outline"
						>
							<CardContent className="p-0">
								<StarRatingDisplay rating={5} size="sm" />

								<div className="relative mt-4 sm:mt-5">
									<Quote className="size-6 text-muted-foreground/20 absolute -top-2 -left-1" />
									<p className="relative z-10 text-foreground text-xs sm:text-sm leading-relaxed">
										&ldquo;{t.quote}&rdquo;
									</p>
								</div>
							</CardContent>

							<div className="mt-8 sm:mt-12 flex items-center gap-3 sm:gap-3.5 border-t border-border/60 pt-4 sm:pt-5">
								<Avatar className="size-9 sm:size-10 border border-border">
									<AvatarFallback className="bg-primary font-bold text-xs text-primary-foreground">
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
