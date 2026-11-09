import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"

const PLATFORM_CATEGORIES = [
	"Web Mobile & Software Dev",
	"Design & Creative",
	"Ai & Automations",
	"Data Science & Analytics",
	"Sales & Marketing",
	"IT & Networking",
	"Engineering & Architecture",
	"Writing",
	"Accounting & Consulting",
	"Customer Service",
	"Legal",
]

export function LandingHero() {
	const [roleMode, setRoleMode] = useState<"hire" | "work">("hire")
	const [searchQuery, setSearchQuery] = useState("")
	const navigate = useNavigate()

	const { data: remoteCategories } = useCategories()
	const categories =
		remoteCategories && remoteCategories.length > 0 ? remoteCategories : PLATFORM_CATEGORIES

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		if (roleMode === "hire") {
			navigate({
				to: "/talent",
				search: {
					q: searchQuery.trim() || undefined,
				},
			})
		} else {
			navigate({
				to: "/freelancer-jobs",
				search: {
					q: searchQuery.trim() || undefined,
				},
			})
		}
	}

	const handleCategoryClick = (cat: string) => {
		if (roleMode === "hire") {
			navigate({
				to: "/talent",
				search: {
					q: searchQuery.trim() || undefined,
					category: cat,
				},
			})
		} else {
			navigate({
				to: "/freelancer-jobs",
				search: {
					q: cat,
				},
			})
		}
	}

	return (
		<section className="border-b border-border/60 bg-muted/20 py-16 sm:py-20 lg:py-24">
			<div className="landing-container flex flex-col items-center text-center">
				{/* Main Headline */}
				<h1 className="max-w-4xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl sm:leading-tight lg:leading-[1.15] text-center">
					Hire skilled Moroccan freelancers.
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
						className="relative flex flex-col gap-2 rounded-xl border border-border bg-card p-2 sm:flex-row sm:items-center sm:gap-2.5 sm:p-2.5 shadow-sm"
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

						{/* Submit Action */}
						<button
							type="submit"
							className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover shrink-0"
						>
							<span>{roleMode === "hire" ? "Find Talent" : "Find Work"}</span>
						</button>
					</form>

					{/* Categories under search */}
					<div className="mt-4 flex flex-wrap items-center justify-center gap-2">
						{categories.map((cat) => (
							<button
								key={cat}
								type="button"
								onClick={() => handleCategoryClick(cat)}
								className="rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-foreground/30 hover:bg-card hover:text-foreground active:scale-[0.98]"
							>
								{cat}
							</button>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
