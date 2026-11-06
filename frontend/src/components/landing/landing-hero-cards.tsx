import { Check, ShieldCheck, Star, Zap } from "lucide-react"

export function LandingHeroCards() {
	return (
		<div className="mt-10 sm:mt-12 grid w-full max-w-5xl items-center gap-4 text-left sm:gap-6 md:grid-cols-[240px_1fr_240px]">
			{/* Left Float: Escrow Safeguard */}
			<div className="hidden rounded-xl border border-border bg-card p-4 transition-colors hover:border-outline md:block">
				<div className="flex items-center gap-2.5">
					<div className="grid size-8 place-items-center rounded-lg bg-[#EEF8E7] text-[#3E7B3D] dark:bg-[#252A21] dark:text-[#8DD37D] dark:border dark:border-[#384334]">
						<ShieldCheck className="size-4" />
					</div>
					<div>
						<span className="block text-[11px] font-bold uppercase tracking-wider text-[#3E7B3D] dark:text-[#8DD37D]">
							Milestone Protected
						</span>
						<span className="text-sm font-semibold text-foreground">
							10,000 DH Escrow
						</span>
					</div>
				</div>
				<p className="mt-3 text-xs leading-relaxed text-muted-foreground">
					Payments are held safely in escrow. Funds are released only after you review and approve completed work.
				</p>
			</div>

			{/* Center: Live Featured Moroccan Specialist Profile */}
			<div className="w-full max-w-full overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-6 transition-colors hover:border-outline">
				<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
					<div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
						<div className="grid size-11 sm:size-12 shrink-0 place-items-center rounded-xl bg-primary/10 border border-primary/20 font-bold text-sm text-primary">
							YB
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
								<h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
									Yassine Benali
								</h3>
								<span className="inline-flex items-center gap-1 rounded-md bg-[#EEF8E7] dark:bg-[#252A21] dark:border dark:border-[#384334] px-1.5 py-0.5 text-[10px] font-bold text-[#3E7B3D] dark:text-[#8DD37D]">
									<Check className="size-3" />
									Verified Specialist
								</span>
							</div>
							<p className="text-xs text-muted-foreground truncate">
								Full-Stack Engineer · Casablanca, Morocco
							</p>
						</div>
					</div>
					<div className="flex items-center justify-between sm:flex-col sm:items-end gap-0.5 shrink-0 pt-2 border-t border-border/50 sm:border-0 sm:pt-0">
						<p className="font-display text-base sm:text-lg font-bold text-foreground">
							350 DH
							<span className="text-xs font-normal text-muted-foreground">
								/hr
							</span>
						</p>
						<span className="text-[11px] font-medium text-[#3E7B3D] dark:text-[#8DD37D]">
							Available: 30h/wk
						</span>
					</div>
				</div>

				{/* Skills */}
				<div className="mt-3.5 sm:mt-4 flex flex-wrap gap-1.5">
					{["React", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"].map((skill) => (
						<span
							key={skill}
							className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
						>
							{skill}
						</span>
					))}
				</div>

				{/* Verified Feedback Snippet */}
				<div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-xl bg-muted/30 px-3.5 py-2.5 border border-border/50 text-xs">
					<div className="flex items-center gap-1 text-amber-500 shrink-0">
						{Array.from({ length: 5 }).map((_, i) => (
							<Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
						))}
						<span className="ml-1 font-semibold text-foreground">5.0</span>
						<span className="text-muted-foreground">(24 reviews)</span>
					</div>
					<p className="italic text-muted-foreground text-[11px] leading-relaxed sm:truncate sm:pl-3">
						“Yassine delivered our client portal on time. High quality code and very responsive.”
					</p>
				</div>
			</div>

			{/* Right Float: Fast Match */}
			<div className="hidden rounded-xl border border-border bg-card p-4 transition-colors hover:border-outline md:block">
				<div className="flex items-center gap-2.5">
					<div className="grid size-8 place-items-center rounded-lg bg-[#FFFBEB] text-[#D97706] dark:bg-[#272318] dark:text-[#FBBF24] dark:border dark:border-[#423920]">
						<Zap className="size-4" />
					</div>
					<div>
						<span className="block text-[11px] font-bold uppercase tracking-wider text-[#D97706] dark:text-[#FBBF24]">
							Fast Local Match
						</span>
						<span className="text-sm font-semibold text-foreground">
							Under 24h
						</span>
					</div>
				</div>
				<p className="mt-3 text-xs leading-relaxed text-muted-foreground">
					Connect with available freelancers in Casablanca, Rabat, Marrakech, and across Morocco.
				</p>
			</div>
		</div>
	)
}
