import { Link } from "@tanstack/react-router"
import { freelancers } from "@/data/freelancers"
import { LandingTalentCard } from "@/components/landing/landing-talent-card"

const DISPLAY_FREELANCERS = freelancers.slice(0, 3)

export function LandingTalent() {
	return (
		<section id="talent" className="scroll-mt-20 landing-section">
			<div className="landing-container">
				{/* Section Header */}
				<div className="landing-section-header">
					<h2 className="landing-heading text-foreground">
						Skilled Moroccan specialists ready for your project.
					</h2>
					<p className="landing-lede">
						Browse verified portfolios, inspect practical experience, and connect with developers
						and designers directly.
					</p>
				</div>

				{/* Talent Cards Grid */}
				<div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{DISPLAY_FREELANCERS.map((person) => (
						<LandingTalentCard key={person.id} person={person} />
					))}
				</div>

				{/* Explore All CTA */}
				<div className="mt-8 sm:mt-10 flex justify-center">
					<Link
						to="/talent"
						search={{ q: undefined, category: undefined }}
						className="inline-flex w-full sm:w-auto h-9 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest px-5 text-[13px] font-medium text-on-surface transition-colors hover:border-outline hover:bg-surface-container-low"
					>
						<span>Explore all verified Moroccan talent</span>
					</Link>
				</div>
			</div>
		</section>
	)
}
