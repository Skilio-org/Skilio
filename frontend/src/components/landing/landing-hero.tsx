import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowUpRight, ChevronDown, Search } from "lucide-react"

const CATEGORIES = [
	"All Categories",
	"Full-Stack Development",
	"Product & UI/UX Design",
	"Mobile App Development",
	"E-Commerce & Shopify",
	"Cloud & DevOps",
]

const QUICK_TAGS = [
	{ label: "Next.js & React", query: "React" },
	{ label: "UI/UX & Figma", query: "Design" },
	{ label: "Mobile (Flutter / iOS)", query: "Mobile" },
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
		<section className="border-b border-border/60 bg-muted/20 py-16 sm:py-20 lg:py-24">
			<div className="landing-container flex flex-col items-center text-center">
				{/* Main Headline */}
				<h1 className="max-w-4xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl sm:leading-tight lg:leading-[1.15]">
					Hire skilled Moroccan freelancers. <br className="hidden xs:inline" />
					Get your projects shipped faster.
				</h1>

				{/* Subtitle */}
				<p className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
					Connect directly with pre-vetted Moroccan developers, designers, and digital experts.
					Transparent rates in Dirhams, secure escrow, and zero platform cuts.
				</p>

				{/* Interactive Search Hub */}
				<div className="mt-8 sm:mt-10 w-full max-w-3xl">
					{/* Role Switcher Tabs */}
					<div className="mb-3 flex items-center justify-center gap-1.5">
						<button
							type="button"
							onClick={() => setRoleMode("hire")}
							className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
								roleMode === "hire"
									? "bg-primary text-primary-foreground"
									: "bg-card border border-border text-muted-foreground hover:text-foreground"
							}`}
						>
							Hire Talent
						</button>
						<button
							type="button"
							onClick={() => setRoleMode("work")}
							className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
								roleMode === "work"
									? "bg-primary text-primary-foreground"
									: "bg-card border border-border text-muted-foreground hover:text-foreground"
							}`}
						>
							Find Work
						</button>
					</div>

					{/* Search Box Form */}
					<form
						onSubmit={handleSearch}
						className="relative flex flex-col gap-2 rounded-xl border border-border bg-card p-2 sm:flex-row sm:items-center sm:gap-2.5 sm:p-2.5"
					>
						<div className="flex flex-1 items-center gap-2.5 px-3 py-1.5 sm:py-1">
							<Search className="size-4 sm:size-5 shrink-0 text-muted-foreground" />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder={
									roleMode === "hire"
										? "Search by skill or title (e.g. Next.js, Figma, Flutter)..."
										: "Search open contracts & projects in Morocco..."
								}
								className="w-full bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-hidden"
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
								<div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 z-30 mt-1.5 w-full sm:w-56 rounded-xl border border-border bg-card p-1.5 shadow-md">
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
							className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
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
								className="rounded-full border border-border/80 bg-card/80 px-2.5 py-1 text-[11px] sm:text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-card hover:text-foreground"
							>
								{tag.label}
							</button>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
