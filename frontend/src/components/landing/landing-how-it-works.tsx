import { Link } from "@tanstack/react-router"
import { ArrowUpRight, ListFilter, MessagesSquare, ScanSearch } from "lucide-react"

export function LandingHowItWorks() {
	return (
		<section id="how-it-works" className="scroll-mt-24 border-border border-y bg-muted/40 py-16 sm:py-24">
			<div className="landing-container grid gap-12 md:grid-cols-[.9fr_1.1fr] lg:gap-24">
				<div>
					<p className="mb-5 font-medium text-primary text-sm">How it works</p>
					<h2 className="landing-heading">
						Less searching.
						<br />
						More doing.
					</h2>
					<p className="mt-5 max-w-sm text-base text-muted-foreground leading-7">
						Go from a project in mind to a person you want to work with.
					</p>
					<Link to="/signup" search={{ role: "client" }} className="landing-text-link mt-7">
						Get started <ArrowUpRight className="size-4" />
					</Link>
				</div>
				<ol className="space-y-8">
					{[
						{
							icon: ScanSearch,
							title: "Find your kind of expert",
							copy: "Search by skill, explore specialties, and discover people who understand the work.",
						},
						{
							icon: ListFilter,
							title: "Look beyond the headline",
							copy: "Compare portfolios, experience, and rates. Save the people who stand out.",
						},
						{
							icon: MessagesSquare,
							title: "Start a real conversation",
							copy: "Share your brief, ask questions, and find out if you're a good fit.",
						},
					].map(({ icon: Icon, title, copy }) => (
						<li key={title} className="flex gap-5 border-border border-b pb-8 last:border-0 last:pb-0">
							<span className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-card text-primary">
								<Icon className="size-5" strokeWidth={1.5} />
							</span>
							<div>
								<h3 className="font-medium text-lg tracking-tight">{title}</h3>
								<p className="mt-2 max-w-md text-muted-foreground text-sm leading-7">{copy}</p>
							</div>
						</li>
					))}
				</ol>
			</div>
		</section>
	)
}
