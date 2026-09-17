import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { LandingCategories } from "@/components/landing/landing-categories"
import { LandingCta } from "@/components/landing/landing-cta"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works"
import { LandingTalent } from "@/components/landing/landing-talent"

export const Route = createFileRoute("/")({
	component: LandingPage,
	head: () => ({
		meta: [
			{ title: "Freelancer - Find independent talent" },
			{
				name: "description",
				content: "Search verified freelance profiles, compare expertise, and find the right independent professional.",
			},
		],
	}),
})

function LandingPage() {
	const [filter, setFilter] = useState("All talent")
	return (
		<div className="landing-page min-h-dvh bg-card text-foreground">
			<LandingHeader />
			<main id="main-content" tabIndex={-1} className="outline-none">
				<LandingHero />
				<LandingCategories onSelect={setFilter} />
				<LandingTalent filter={filter} onFilter={setFilter} />
				<LandingHowItWorks />
				<LandingCta />
			</main>
			<LandingFooter />
		</div>
	)
}
