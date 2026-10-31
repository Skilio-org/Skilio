import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Check, Sparkles } from "lucide-react"

export function LandingCta() {
	return (
		<section className="landing-container py-16 sm:py-24">
			<div className="relative overflow-hidden rounded-3xl bg-[#1F2125] px-6 py-12 text-white shadow-xl sm:px-12 sm:py-16 lg:px-16">
				{/* Background glow decoration */}
				<div
					className="pointer-events-none absolute -right-20 -top-20 size-96 rounded-full opacity-20 blur-3xl"
					style={{ background: "#B8EF0D" }}
				/>

				<div className="relative z-10 max-w-3xl">
					<div className="inline-flex items-center gap-1.5 rounded-md border border-[#B8EF0D]/30 bg-[#25282C] px-2.5 py-1 text-xs font-bold text-[#B8EF0D]">
						<Sparkles className="size-3.5" />
						<span>START TODAY · NO LOCK-IN</span>
					</div>

					<h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.15]">
						Make room for <br />
						<span className="text-[#B8EF0D]">your next great project.</span>
					</h2>

					<p className="mt-5 max-w-xl text-base text-neutral-300 leading-relaxed sm:text-lg">
						Whether you're hiring a specialist for a critical sprint or seeking your next
						flagship contract, Skilio is where ambitious builders collaborate with confidence.
					</p>

					{/* Dual CTAs */}
					<div className="mt-8 flex flex-wrap items-center gap-4">
						<Link
							to="/signup"
							search={{ role: "client" }}
							className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#B8EF0D] px-6 text-sm font-bold text-[#1F2125] shadow-xs transition-all hover:bg-[#A5D80B] active:scale-95"
						>
							<span>Hire Top Talent</span>
							<ArrowUpRight className="size-4" />
						</Link>

						<Link
							to="/signup"
							search={{ role: "freelancer" }}
							className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-[#25282C]/80 px-6 text-sm font-semibold text-white transition-all hover:border-white/40 hover:bg-[#25282C]"
						>
							<span>Apply as a Specialist</span>
							<ArrowUpRight className="size-4" />
						</Link>
					</div>

					{/* Trust Perks */}
					<div className="mt-10 flex flex-wrap items-center gap-6 border-t border-white/10 pt-6 text-xs text-neutral-400">
						<div className="flex items-center gap-2">
							<Check className="size-4 text-[#B8EF0D]" />
							<span>No credit card required to browse</span>
						</div>
						<div className="flex items-center gap-2">
							<Check className="size-4 text-[#B8EF0D]" />
							<span>100% Milestone Escrow Guarantee</span>
						</div>
						<div className="flex items-center gap-2">
							<Check className="size-4 text-[#B8EF0D]" />
							<span>Verified Work History & Identity</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
