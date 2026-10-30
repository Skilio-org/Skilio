import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Check } from "lucide-react"

export function LandingCta() {
	return (
		<section className="landing-container py-16 sm:py-20 lg:py-24">
			<div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-xs sm:p-12 lg:p-16">
				{/* Background ambient lighting */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
					<div className="hero-radial-glow absolute -top-24 right-1/4 h-[350px] w-full max-w-[600px] opacity-70 blur-3xl" />
					<div className="hero-dots-pattern absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_30%,transparent_80%)]" />
				</div>

				<div className="relative z-10">
					<div className="max-w-3xl">
						<p className="mb-4 font-medium text-primary text-sm">Start today</p>
						<h2 className="landing-heading text-foreground">
							Make room for
							<br />
							<span className="text-primary">your next great project.</span>
						</h2>
					</div>

					<div className="mt-6 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
						<p className="max-w-xl text-base text-muted-foreground leading-relaxed sm:text-lg sm:leading-8">
							Find independent specialists to build what matters, or land direct contracts with ambitious teams. One
							platform, zero commission fees, and complete transparency.
						</p>

						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<Link
								to="/signup"
								search={{ role: "client" }}
								className="landing-primary min-h-12 whitespace-nowrap px-8 font-semibold text-sm shadow-sm transition-all hover:shadow-md sm:text-base"
							>
								Find talent <ArrowUpRight className="size-4" />
							</Link>
							<Link
								to="/signup"
								search={{ role: "freelancer" }}
								className="landing-secondary min-h-12 whitespace-nowrap px-8 font-semibold text-sm shadow-2xs transition-all hover:shadow-xs sm:text-base"
							>
								Find work <ArrowUpRight className="size-4 text-muted-foreground" />
							</Link>
						</div>
					</div>

					{/* Bottom Highlights */}
					<div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-border/60 border-t pt-6 text-muted-foreground text-xs sm:text-sm">
						<div className="flex items-center gap-1.5">
							<Check className="size-4 text-success" />
							<span>Zero platform commission</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Check className="size-4 text-success" />
							<span>Direct client-talent messaging</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Check className="size-4 text-success" />
							<span>No credit card required to start</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
