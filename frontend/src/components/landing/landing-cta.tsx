import { Link } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"

export function LandingCta() {
	return (
		<section className="landing-container landing-section">
			<div className="rounded-2xl bg-[#1F2125] dark:bg-[#151719] border border-border px-6 py-10 text-white sm:px-12 sm:py-16 lg:px-16">
				<div className="max-w-3xl">
					<h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white sm:leading-tight lg:leading-[1.15]">
						Ready to build with Morocco&apos;s best freelance talent?
					</h2>

					<p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base text-neutral-300 leading-relaxed">
						Whether you are hiring for a key milestone or looking for your next contract, Skilio
						connects you directly with serious builders.
					</p>

					{/* Dual CTAs */}
					<div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
						<Link
							to="/signup"
							search={{ role: "client" }}
							className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-medium text-on-primary transition-colors hover:bg-primary-hover"
						>
							<span>Hire Moroccan Talent</span>
							<ArrowUpRight className="size-4" />
						</Link>

						<Link
							to="/signup"
							search={{ role: "freelancer" }}
							className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 text-[13px] font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10"
						>
							<span>Apply as a Freelancer</span>
							<ArrowUpRight className="size-4" />
						</Link>
					</div>

					{/* Trust notes */}
					<div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5 sm:pt-6 text-xs text-neutral-400">
						<span>Free to browse and post</span>
						<span>·</span>
						<span>Milestone escrow protection</span>
						<span>·</span>
						<span>Direct collaboration in Dirhams</span>
					</div>
				</div>
			</div>
		</section>
	)
}
