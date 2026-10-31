import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
	ArrowUpRight,
	Check,
	ChevronDown,
	Search,
	ShieldCheck,
	Sparkles,
	Star,
	Zap,
} from "lucide-react"

const CATEGORIES = [
	"All Categories",
	"AI & Machine Learning",
	"Full-Stack Development",
	"Product & UI/UX Design",
	"Cloud & DevOps",
	"Solana & Web3",
]

const QUICK_TAGS = [
	{ label: "🔥 AI Agents & LLMs", query: "AI" },
	{ label: "React 19 & Next.js", query: "React" },
	{ label: "Product & Brand Design", query: "Design" },
	{ label: "Rust & Systems", query: "Rust" },
	{ label: "Solana & Web3", query: "Solana" },
]

export function LandingHero({
	onSearchSelect,
}: {
	onSearchSelect?: (tag: string) => void
}) {
	const [roleMode, setRoleMode] = useState<"hire" | "work">("hire")
	const [searchQuery, setSearchQuery] = useState("")
	const [category, setCategory] = useState("All Categories")
	const [isCatOpen, setIsCatOpen] = useState(false)
	const navigate = useNavigate()

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		if (roleMode === "hire") {
			if (onSearchSelect && searchQuery) {
				onSearchSelect(searchQuery)
				document.getElementById("talent")?.scrollIntoView({ behavior: "smooth" })
			} else {
				navigate({
					to: "/talent",
					search: { q: searchQuery || undefined, category: undefined },
				})
			}
		} else {
			navigate({ to: "/signup", search: { role: "freelancer" } })
		}
	}

	const handleTagClick = (tag: string) => {
		setSearchQuery(tag)
		if (onSearchSelect) {
			onSearchSelect(tag)
			document.getElementById("talent")?.scrollIntoView({ behavior: "smooth" })
		}
	}

	return (
		<section className="relative overflow-hidden border-b border-border/60 dark:border-[#1F2D21]/60 bg-muted/20 dark:bg-[#080C09] py-10 sm:py-16 lg:py-20">
			{/* Subtle ambient green glow pattern */}
			<div
				className="pointer-events-none absolute inset-0 -z-10 opacity-30 dark:opacity-25"
				style={{
					backgroundImage: `radial-gradient(circle at 50% 20%, rgba(184, 239, 13, 0.12) 0%, transparent 60%)`,
				}}
			/>

			<div className="landing-container flex flex-col items-center text-center px-4 sm:px-6">
				{/* Eyebrow Pill */}
				<div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#B8EF0D]/40 bg-[#EDF9C5]/80 dark:border-[#2E421F] dark:bg-[#152317] px-3 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-[#4F6500] dark:text-[#B8EF0D] shadow-xs backdrop-blur-xs">
					<Sparkles className="size-3 sm:size-3.5 text-[#7FA600] dark:text-[#B8EF0D]" />
					<span>THE TOP 3% INDEPENDENT TALENT NETWORK</span>
				</div>

				{/* Main Headline */}
				<h1 className="mt-5 sm:mt-6 max-w-4xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl sm:leading-tight lg:leading-[1.12]">
					Stop sifting resumes. <br className="hidden xs:inline" />
					<span className="text-foreground">
						Start shipping with{" "}
					</span>
					<span className="relative inline-block text-[#7FA600] dark:text-[#B8EF0D]">
						elite talent.
						<span className="absolute bottom-1.5 left-0 -z-10 h-2.5 sm:h-3 w-full bg-[#B8EF0D]/30 dark:bg-[#B8EF0D]/20" />
					</span>
				</h1>

				{/* Subtitle */}
				<p className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
					Connect directly with pre-vetted senior software engineers, designers, and AI
					architects. Transparent hourly rates, milestone escrow protection, and zero hidden
					platform cuts.
				</p>

				{/* Interactive Search Hub */}
				<div className="mt-7 sm:mt-8 w-full max-w-3xl">
					{/* Role Switcher Tabs */}
					<div className="mb-2.5 flex items-center justify-center gap-1.5">
						<button
							type="button"
							onClick={() => setRoleMode("hire")}
							className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
								roleMode === "hire"
									? "bg-[#1F2125] text-white shadow-xs dark:bg-[#B8EF0D] dark:text-[#080C09]"
									: "bg-card dark:bg-[#0E140F] border border-border dark:border-[#1F2D21] text-muted-foreground hover:text-foreground"
							}`}
						>
							Hire Talent
						</button>
						<button
							type="button"
							onClick={() => setRoleMode("work")}
							className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
								roleMode === "work"
									? "bg-[#1F2125] text-white shadow-xs dark:bg-[#B8EF0D] dark:text-[#080C09]"
									: "bg-card dark:bg-[#0E140F] border border-border dark:border-[#1F2D21] text-muted-foreground hover:text-foreground"
							}`}
						>
							Find Work
						</button>
					</div>

					{/* Search Box Form */}
					<form
						onSubmit={handleSearch}
						className="relative flex flex-col gap-2 rounded-2xl border border-border/80 dark:border-[#1F2D21] bg-card dark:bg-[#0E140F] p-2 shadow-md sm:flex-row sm:items-center sm:gap-2.5 sm:p-2.5"
					>
						<div className="flex flex-1 items-center gap-2.5 px-3 py-1.5 sm:py-1">
							<Search className="size-4 sm:size-5 shrink-0 text-muted-foreground" />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder={
									roleMode === "hire"
										? "Search by skill, role or domain (e.g. Next.js, PyTorch)..."
										: "Search open contracts & projects (e.g. Full-Stack, LLM)..."
								}
								className="w-full bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 outline-hidden"
							/>
						</div>

						{/* Category Dropdown */}
						<div className="relative shrink-0 border-t border-border/60 dark:border-[#1F2D21] pt-2 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-2">
							<button
								type="button"
								onClick={() => setIsCatOpen(!isCatOpen)}
								className="flex w-full items-center justify-between gap-2 rounded-lg bg-muted/50 dark:bg-[#131B14] px-3 py-2 text-xs font-medium text-foreground hover:bg-muted dark:hover:bg-[#1A261B]"
							>
								<span className="truncate max-w-[180px] text-left">{category}</span>
								<ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
							</button>

							{isCatOpen && (
								<div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 z-30 mt-1.5 w-full sm:w-56 rounded-xl border border-border dark:border-[#1F2D21] bg-card dark:bg-[#0E140F] p-1.5 shadow-xl">
									{CATEGORIES.map((cat) => (
										<button
											key={cat}
											type="button"
											onClick={() => {
												setCategory(cat)
												setIsCatOpen(false)
											}}
											className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-muted dark:hover:bg-[#152317] hover:text-foreground"
										>
											{cat}
										</button>
									))}
								</div>
							)}
						</div>

						{/* Submit Action */}
						<button
							type="submit"
							className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#B8EF0D] px-6 text-sm font-semibold text-[#080C09] shadow-xs transition-all hover:bg-[#C8FF23] active:scale-95"
						>
							<span>{roleMode === "hire" ? "Find Talent" : "Find Work"}</span>
							<ArrowUpRight className="size-4" />
						</button>
					</form>

					{/* Trending Pills */}
					<div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
						<span className="text-muted-foreground font-medium text-[11px] sm:text-xs">Trending:</span>
						{QUICK_TAGS.map((tag) => (
							<button
								key={tag.label}
								type="button"
								onClick={() => handleTagClick(tag.query)}
								className="rounded-full border border-border/80 dark:border-[#1F2D21] bg-card/80 dark:bg-[#0E140F] px-2.5 py-1 text-[11px] sm:text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-card hover:text-foreground dark:hover:text-[#F4F8F4]"
							>
								{tag.label}
							</button>
						))}
					</div>
				</div>

				{/* Floating Showcase Trio Preview */}
				<div className="mt-10 sm:mt-12 grid w-full max-w-5xl items-center gap-4 text-left sm:gap-6 md:grid-cols-[240px_1fr_240px]">
					{/* Left Float: Escrow Safeguard */}
					<div className="hidden rounded-2xl border border-border/80 dark:border-[#1F2D21] bg-card dark:bg-[#0E140F] p-4 shadow-sm backdrop-blur-xs md:block">
						<div className="flex items-center gap-2.5">
							<div className="grid size-8 place-items-center rounded-lg bg-[#EEF8E7] text-[#1E5C2D] dark:bg-[#142316] dark:text-[#4ADE80] dark:border dark:border-[#203D24]">
								<ShieldCheck className="size-4" />
							</div>
							<div>
								<span className="block text-[11px] font-bold uppercase tracking-wider text-[#1E5C2D] dark:text-[#4ADE80]">
									Milestone Protected
								</span>
								<span className="text-sm font-semibold text-foreground">
									$8,500.00 Escrow
								</span>
							</div>
						</div>
						<p className="mt-3 text-xs leading-relaxed text-muted-foreground">
							Tier-1 bank escrow. Funds released only upon verified staging deliverables.
						</p>
					</div>

					{/* Center: Live Featured Specialist Profile */}
					<div className="rounded-2xl border border-border/90 dark:border-[#1F2D21] bg-card dark:bg-[#0E140F] p-4 sm:p-6 shadow-lg transition-transform hover:-translate-y-0.5">
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
								<div className="grid size-11 sm:size-12 shrink-0 place-items-center rounded-xl bg-[#1F2125] dark:bg-[#1A261B] font-bold text-sm text-[#B8EF0D] shadow-xs">
									MC
								</div>
								<div className="min-w-0">
									<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
										<h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
											Marcus Chen
										</h3>
										<span className="inline-flex items-center gap-1 rounded-md bg-[#EEF8E7] dark:bg-[#142316] dark:border dark:border-[#203D24] px-1.5 py-0.5 text-[10px] font-bold text-[#1E5C2D] dark:text-[#4ADE80]">
											<Check className="size-3" />
											Top 3% Vetted
										</span>
									</div>
									<p className="text-xs text-muted-foreground truncate">
										Principal AI & Systems Engineer · Ex-DeepMind
									</p>
								</div>
							</div>
							<div className="text-right shrink-0">
								<p className="font-display text-base sm:text-lg font-bold text-foreground">
									$140
									<span className="text-xs font-normal text-muted-foreground">
										/hr
									</span>
								</p>
								<span className="text-[11px] font-medium text-[#1E5C2D] dark:text-[#4ADE80]">
									Available: 30h/wk
								</span>
							</div>
						</div>

						{/* Skills */}
						<div className="mt-3.5 sm:mt-4 flex flex-wrap gap-1.5">
							{["PyTorch", "LangChain", "CUDA / C++", "FastAPI", "TypeScript"].map(
								(skill) => (
									<span
										key={skill}
										className="rounded-md border border-border/60 dark:border-[#1F2D21] bg-muted/40 dark:bg-[#131B14] px-2 py-0.5 text-[11px] font-medium text-foreground/80 dark:text-[#B5C4B6]"
									>
										{skill}
									</span>
								),
							)}
						</div>

						{/* Verified Feedback Snippet */}
						<div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-xl bg-muted/30 dark:bg-[#111912] px-3.5 py-2.5 border border-border/50 dark:border-[#1F2D21] text-xs">
							<div className="flex items-center gap-1 text-amber-500 shrink-0">
								{Array.from({ length: 5 }).map((_, i) => (
									<Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
								))}
								<span className="ml-1 font-semibold text-foreground">5.0</span>
								<span className="text-muted-foreground">(38)</span>
							</div>
							<p className="italic text-muted-foreground text-[11px] leading-relaxed sm:truncate sm:pl-3">
								“Marcus delivered our agentic pipeline in 12 days. Flawless.”
							</p>
						</div>
					</div>

					{/* Right Float: Match Speed */}
					<div className="hidden rounded-2xl border border-border/80 dark:border-[#1F2D21] bg-card dark:bg-[#0E140F] p-4 shadow-sm backdrop-blur-xs md:block">
						<div className="flex items-center gap-2.5">
							<div className="grid size-8 place-items-center rounded-lg bg-[#FFFBEB] text-[#D97706] dark:bg-[#231E12] dark:text-[#FBBF24] dark:border dark:border-[#3D321A]">
								<Zap className="size-4" />
							</div>
							<div>
								<span className="block text-[11px] font-bold uppercase tracking-wider text-[#D97706] dark:text-[#FBBF24]">
									Match Velocity
								</span>
								<span className="text-sm font-semibold text-foreground">
									28h Median Time
								</span>
							</div>
						</div>
						<p className="mt-3 text-xs leading-relaxed text-muted-foreground">
							3.5x faster than traditional agencies. Start collaborating in days, not
							months.
						</p>
					</div>
				</div>
			</div>
		</section>
	)
}
