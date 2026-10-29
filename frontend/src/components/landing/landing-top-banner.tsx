import { Link } from "@tanstack/react-router"
import { ArrowRight, Zap } from "lucide-react"

export function LandingTopBanner() {
	return (
		<aside aria-label="Announcement" className="relative z-50 bg-[#1F2125] text-white">
			<div className="landing-container flex h-10 items-center justify-center gap-2.5 text-xs font-medium sm:gap-3 sm:text-[13px]">
				<span className="flex items-center gap-1.5 text-[#B8EF0D]">
					<Zap className="size-3.5 fill-[#B8EF0D]" />
					<strong className="font-semibold uppercase tracking-wider text-[11px] text-[#B8EF0D]">
						Skilio Direct
					</strong>
				</span>
				<span className="text-white/80 hidden sm:inline">·</span>
				<span className="truncate text-white/90">
					0% marketplace commission for your first 3 months.
				</span>
				<Link
					to="/signup"
					search={{ role: "freelancer" }}
					className="inline-flex items-center gap-1 rounded bg-[#B8EF0D] px-2 py-0.5 text-[11px] font-bold text-[#1F2125] transition-transform hover:scale-105"
				>
					<span>Claim 0% Fee</span>
					<ArrowRight className="size-3" />
				</Link>
			</div>
		</aside>
	)
}

