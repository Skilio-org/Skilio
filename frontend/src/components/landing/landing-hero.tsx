import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Check } from "lucide-react"

export function LandingHero() {
	return (
		<section className="landing-hero relative overflow-hidden pt-12 pb-14 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
			{/* Background ambient glow & dot matrix canvas */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
				<div className="hero-radial-glow absolute -top-32 left-1/2 h-[600px] w-full max-w-[1200px] -translate-x-1/2 opacity-90 blur-3xl" />
				<div className="hero-dots-pattern absolute inset-0 [mask-image:radial-gradient(ellipse_80%_65%_at_50%_40%,#000_45%,transparent_90%)]" />
			</div>

			<div className="landing-container relative z-10 mx-auto max-w-5xl text-center">
				{/* Eyebrow Pill */}
				<div className="hero-copy inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-4 py-1.5 font-medium text-foreground/85 text-xs shadow-2xs backdrop-blur-md transition-colors hover:border-border">
					<span className="relative flex size-2">
						<span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-lime opacity-75" />
						<span className="relative inline-flex size-2 rounded-full bg-accent-lime" />
					</span>
					<span>Direct collaboration</span>
					<span className="text-muted-foreground/60">·</span>
					<span className="text-muted-foreground">0% commission platform</span>
				</div>

				{/* Hero Headline */}
				<h1 className="hero-copy mt-6 font-bold font-display text-[clamp(2.5rem,5.8vw,5.15rem)] text-foreground leading-[1.05] tracking-[-0.04em] sm:mt-7">
					<span className="block">Hire talent. Land work.</span>
					<span className="mt-3 block sm:mt-4">
						<span className="inline-block rounded-2xl bg-accent-lime px-5 py-1.5 font-bold font-display text-on-primary-container shadow-xs sm:px-7 sm:py-2.5">
							Pay nothing.
						</span>
					</span>
				</h1>

				{/* Subheadline */}
				<p className="hero-copy mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8">
					Find independent specialists for your next build, or land contracts with ambitious founders. Direct
					client-freelancer collaboration with zero commission cuts and total transparency.
				</p>

				{/* Consistent Action Buttons */}
				<div className="hero-copy mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
					<a
						href="#talent"
						className="landing-primary min-h-12 w-full gap-2.5 rounded-full px-8 font-semibold text-sm shadow-sm transition-all hover:shadow-md sm:w-auto sm:text-base"
					>
						Find talent <ArrowUpRight className="size-4" />
					</a>
					<Link
						to="/signup"
						search={{ role: "freelancer" }}
						className="landing-secondary min-h-12 w-full gap-2.5 rounded-full px-8 font-semibold text-sm shadow-2xs transition-all hover:shadow-xs sm:w-auto sm:text-base"
					>
						Find work <ArrowUpRight className="size-4 text-muted-foreground" />
					</Link>
				</div>

				{/* Trust and Guarantee Indicators */}
				<div className="hero-copy mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2.5 font-medium text-muted-foreground text-xs sm:text-sm">
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
						<span>Verified client reviews</span>
					</div>
				</div>
			</div>
		</section>
	)
}
