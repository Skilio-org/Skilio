import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Check, Sparkles } from "lucide-react"

export function LandingCta() {
	return (
		<section className="landing-container px-4 sm:px-6 py-12 sm:py-20 lg:py-24">
			<div className="relative overflow-hidden rounded-2xl bg-[#1F2125] dark:bg-[#151719] border border-border px-6 py-10 text-white sm:px-12 sm:py-16 lg:px-16">
				{/* Background glow decoration */}
				<div
					className="pointer-events-none absolute -right-20 -top-20 size-80 sm:size-96 rounded-full opacity-15 blur-3xl"
					style={{ background: "#B8EF0D" }}
				/>

				<div className="relative z-10 max-w-3xl">
					<div className="inline-flex items-center gap-1.5 rounded-md border border-[#B8EF0D]/30 bg-[#25282C] px-2.5 py-1 text-xs font-bold text-[#B8EF0D]">
						<Sparkles className="size-3.5" />
						<span>START TODAY · NO LOCK-IN</span>
					</div>

					<h2 className="mt-5 sm:mt-6 font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white sm:leading-tight lg:leading-[1.15]">
						Make room for <br />
						<span className="text-[#B8EF0D]">your next great project.</span>
					</h2>

					<p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base text-neutral-300 leading-relaxed">
						Whether you&apos;re hiring a specialist for a critical sprint or seeking your next
						flagship contract, Skilio is where ambitious builders collaborate with confidence.
					</p>

					{/* Dual CTAs - Full width tap targets on mobile */}
					<div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
						<Link
							to="/signup"
							search={{ role: "client" }}
							className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-medium text-on-primary transition-colors hover:bg-primary-hover"
						>
							<span>Hire Top Talent</span>
							<ArrowUpRight className="size-4" />
						</Link>

						<Link
							to="/signup"
							search={{ role: "freelancer" }}
							className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 text-[13px] font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10"
						>
							<span>Apply as a Specialist</span>
							<ArrowUpRight className="size-4" />
						</Link>
					</div>

					{/* Trust Perks */}
					<div className="mt-8 sm:mt-10 grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-6 border-t border-white/10 pt-5 sm:pt-6 text-xs text-neutral-400">
						<div className="flex items-center gap-2">
							<Check className="size-4 text-[#B8EF0D] shrink-0" />
							<span>No credit card required to browse</span>
						</div>
						<div className="flex items-center gap-2">
							<Check className="size-4 text-[#B8EF0D] shrink-0" />
							<span>100% Milestone Escrow Guarantee</span>
						</div>
						<div className="flex items-center gap-2">
							<Check className="size-4 text-[#B8EF0D] shrink-0" />
							<span>Verified Work History & Identity</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
