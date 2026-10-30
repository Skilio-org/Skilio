import { Quote, Star } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const TESTIMONIALS = [
	{
		quote:
			"Finding a senior full-stack lead took us less than 36 hours. The technical caliber of specialists on Skilio is noticeably higher than typical freelance marketplaces.",
		author: "Elena Rostova",
		role: "VP of Product",
		company: "FinTech Labs",
		initials: "ER",
		type: "Client",
	},
	{
		quote:
			"Skilio creates an environment of mutual respect. Direct communication with founders, crystal-clear milestones, and zero hidden platform cuts taking away 20% of my check.",
		author: "Marcus Chen",
		role: "Principal AI Engineer",
		company: "Independent Specialist",
		initials: "MC",
		type: "Freelancer",
	},
	{
		quote:
			"We scaled our product sprint team by three specialists within a week. Every deliverable was polished, production-ready, and executed without hand-holding.",
		author: "Sarah Jenkins",
		role: "Founder & Design Director",
		company: "Studio Lumina",
		initials: "SJ",
		type: "Client",
	},
]

export function LandingTestimonials() {
	return (
		<section id="testimonials" className="scroll-mt-20 py-16 sm:py-24">
			<div className="landing-container">
				{/* Section Header */}
				<div className="flex flex-col gap-3">
					<div className="inline-flex w-fit items-center gap-1.5 rounded-md bg-[#EDF9C5] px-2.5 py-1 text-xs font-bold text-[#4F6500] dark:bg-[#1F2125] dark:text-[#B8EF0D]">
						<span>TESTIMONIALS & CASE STUDIES</span>
					</div>
					<h2 className="landing-heading text-foreground">
						Trusted by teams that ship and talent that delivers.
					</h2>
					<p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
						See how leading founders and world-class independent specialists collaborate on
						Skilio to bring ambitious ideas to life.
					</p>
				</div>

				{/* Cards Grid */}
				<div className="mt-12 grid gap-6 md:grid-cols-3">
					{TESTIMONIALS.map((t) => (
						<Card
							key={t.author}
							className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all hover:border-foreground/20 hover:shadow-md"
						>
							<CardContent className="p-0">
								<div className="flex items-center justify-between gap-2">
									<div className="flex items-center gap-1 text-amber-500">
										{Array.from({ length: 5 }).map((_, i) => (
											<Star key={i} className="size-4 fill-amber-400 text-amber-400" />
										))}
									</div>
									<Badge
										variant="outline"
										className="text-[11px] font-semibold text-muted-foreground"
									>
										{t.type}
									</Badge>
								</div>

								<div className="relative mt-5">
									<Quote className="size-6 text-muted-foreground/20 absolute -top-2 -left-1" />
									<p className="relative z-10 text-foreground text-sm leading-relaxed sm:text-base">
										"{t.quote}"
									</p>
								</div>
							</CardContent>

							<div className="mt-8 flex items-center gap-3.5 border-t border-border/60 pt-5">
								<Avatar className="size-10 border border-border">
									<AvatarFallback className="bg-[#1F2125] font-bold text-xs text-[#B8EF0D]">
										{t.initials}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0">
									<p className="truncate font-semibold text-foreground text-sm">
										{t.author}
									</p>
									<p className="truncate text-muted-foreground text-xs">
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

