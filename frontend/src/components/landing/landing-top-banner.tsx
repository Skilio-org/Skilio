import { Link } from "@tanstack/react-router"
import { ArrowRight, Zap } from "lucide-react"

export function LandingTopBanner() {
	return (
		<aside
			aria-label="Announcement"
			className="relative z-50 border-b border-[#1A261B] bg-[#080C09] text-white"
		>
			<div className="landing-container flex min-h-10 flex-wrap items-center justify-center gap-x-3 gap-y-1 py-1.5 text-xs font-medium sm:h-10 sm:flex-nowrap sm:py-0 sm:text-[13px]">
				<span className="flex items-center gap-1.5 text-[#B8EF0D]">
					<Zap className="size-3.5 fill-[#B8EF0D]" />
					<strong className="font-semibold uppercase tracking-wider text-[11px] text-[#B8EF0D]">
						Skilio Direct
					</strong>
				</span>
				<span className="hidden text-white/50 sm:inline">·</span>
				<span className="text-center text-white/90">
					<span className="hidden sm:inline">
						0% marketplace commission for your first 3 months.
					</span>
					<span className="sm:hidden">0% commission for 3 months.</span>
				</span>
				<Link
					to="/signup"
					search={{ role: "freelancer" }}
					className="inline-flex shrink-0 items-center gap-1 rounded bg-[#B8EF0D] px-2.5 py-0.5 text-[11px] font-bold text-[#080C09] transition-transform hover:scale-105 active:scale-95"
				>
					<span>Claim 0% Fee</span>
					<ArrowRight className="size-3" />
				</Link>
			</div>
		</aside>
	)
}
