import { Link, useNavigate } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"

export const TalentSearch = () => {
	const navigate = useNavigate()
	return (
		<section className="rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
			<div className="mb-6 flex items-start justify-between gap-5">
				<div>
					<h2 className="font-display font-medium text-2xl tracking-tight sm:text-[1.75rem]">
						Who would make your next project better?
					</h2>
					<p className="mt-2 text-muted-foreground text-sm leading-6">
						Find the right person for the work you have in mind.
					</p>
				</div>
			</div>
			<form
				onSubmit={(event) => {
					event.preventDefault()
					const q = String(new FormData(event.currentTarget).get("q") ?? "").trim()
					void navigate({ to: "/talent", search: { q: q || undefined } })
				}}
			>
				<div className="flex flex-col gap-3 sm:flex-row">
					<div className={`${workspaceStyles.inputShell} min-w-0 flex-1 bg-card`}>
						<Search className="size-5 shrink-0 text-muted-foreground" />
						<label htmlFor="dashboard-search" className="sr-only">
							Search talent
						</label>
						<input
							id="dashboard-search"
							name="q"
							type="search"
							placeholder="Try a role, skill, or area of expertise"
							className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base outline-none placeholder:text-muted-foreground md:text-sm"
						/>
					</div>
					<button type="submit" className={`${workspaceStyles.primaryAction} min-h-12 px-6`}>
						Search talent <Search className="size-4" />
					</button>
				</div>
			</form>
			<div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
				<span className="text-muted-foreground">Popular searches</span>
				{["Product designer", "React developer", "AI engineer"].map((q) => (
					<Link
						key={q}
						to="/talent"
						search={{ q }}
						className="inline-flex min-h-9 items-center gap-1 font-medium text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
					>
						{q}
					</Link>
				))}
			</div>
		</section>
	)
}
