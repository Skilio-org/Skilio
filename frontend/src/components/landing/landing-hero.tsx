import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowUpRight, ChevronDown, Search, Sparkles } from "lucide-react"
import { LandingHeroCards } from "./landing-hero-cards"

const CATEGORIES = [
	"All Categories",
	"Full-Stack Development",
	"UI/UX & Product Design",
	"Mobile Apps (iOS & Android)",
	"E-Commerce & Shopify",
	"Cloud & DevOps",
]

const QUICK_TAGS = [
	{ label: "🔥 Next.js & React", query: "React" },
	{ label: "UI/UX & Figma", query: "Design" },
	{ label: "Mobile (Flutter / React Native)", query: "Mobile" },
	{ label: "Shopify & E-Commerce", query: "Shopify" },
	{ label: "Node.js & Python", query: "Node" },
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
		<section className="relative overflow-hidden border-b border-border/60 bg-muted/20 py-10 sm:py-16 lg:py-20">
			{/* Ambient accent glow */}
			<div
				className="pointer-events-none absolute inset-0 -z-10 opacity-30 dark:opacity-20"
				style={{
					backgroundImage: `radial-gradient(circle at 50% 20%, rgba(184, 239, 13, 0.12) 0%, transparent 60%)`,
				}}
			/>

			<div className="landing-container flex flex-col items-center text-center px-4 sm:px-6">
				{/* Eyebrow Pill */}
				<div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-foreground shadow-xs backdrop-blur-xs">
					<Sparkles className="size-3 sm:size-3.5 text-[#7FA600] dark:text-primary" />
					<span>MOROCCO&apos;S FREELANCE TALENT NETWORK</span>
				</div>

				{/* Main Headline */}
				<h1 className="mt-5 sm:mt-6 max-w-4xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl sm:leading-tight lg:leading-[1.12]">
					Hire skilled Moroccan freelancers. <br className="hidden xs:inline" />
					<span className="text-foreground">Get your projects </span>
					<span className="relative inline-block text-[#7FA600] dark:text-[#B8EF0D]">
						shipped faster.
						<span className="absolute bottom-1.5 left-0 -z-10 h-2.5 sm:h-3 w-full bg-[#B8EF0D]/30 dark:bg-[#B8EF0D]/20" />
					</span>
				</h1>

				{/* Subtitle */}
				<p className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
					Connect directly with verified software developers, designers, and digital specialists across Morocco.
					Transparent rates, secure milestone escrow, and zero hidden platform fees.
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
									? "bg-primary text-primary-foreground shadow-xs"
									: "bg-card border border-border text-muted-foreground hover:text-foreground"
							}`}
						>
							Hire Talent
						</button>
						<button
							type="button"
							onClick={() => setRoleMode("work")}
							className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
								roleMode === "work"
									? "bg-primary text-primary-foreground shadow-xs"
									: "bg-card border border-border text-muted-foreground hover:text-foreground"
							}`}
						>
							Find Work
						</button>
					</div>

					{/* Search Box Form */}
					<form
						onSubmit={handleSearch}
						className="relative flex flex-col gap-2 rounded-2xl border border-border/80 bg-card p-2 shadow-md sm:flex-row sm:items-center sm:gap-2.5 sm:p-2.5"
					>
						<div className="flex flex-1 items-center gap-2.5 px-3 py-1.5 sm:py-1">
							<Search className="size-4 sm:size-5 shrink-0 text-muted-foreground" />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder={
									roleMode === "hire"
										? "Search by skill or role (e.g. React, UI/UX, Flutter, Shopify)..."
										: "Search open contracts & projects in Morocco..."
								}
								className="w-full bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 outline-hidden"
							/>
						</div>

						{/* Category Dropdown */}
						<div className="relative shrink-0 border-t border-border/60 pt-2 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-2">
							<button
								type="button"
								onClick={() => setIsCatOpen(!isCatOpen)}
								className="flex w-full items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
							>
								<span className="truncate max-w-[180px] text-left">{category}</span>
								<ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
							</button>

							{isCatOpen && (
								<div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 z-30 mt-1.5 w-full sm:w-56 rounded-xl border border-border bg-card p-1.5 shadow-xl">
									{CATEGORIES.map((cat) => (
										<button
											key={cat}
											type="button"
											onClick={() => {
												setCategory(cat)
												setIsCatOpen(false)
											}}
											className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
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
							className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-95"
						>
							<span>{roleMode === "hire" ? "Find Talent" : "Find Work"}</span>
							<ArrowUpRight className="size-4" />
						</button>
					</form>

					{/* Trending Pills */}
					<div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
						<span className="text-muted-foreground font-medium text-[11px] sm:text-xs">Popular:</span>
						{QUICK_TAGS.map((tag) => (
							<button
								key={tag.label}
								type="button"
								onClick={() => handleTagClick(tag.query)}
								className="rounded-full border border-border/80 bg-card/80 px-2.5 py-1 text-[11px] sm:text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-card hover:text-foreground"
							>
								{tag.label}
							</button>
						))}
					</div>
				</div>

				{/* Modular Floating Showcase Trio Preview */}
				<LandingHeroCards />
			</div>
		</section>
	)
}
