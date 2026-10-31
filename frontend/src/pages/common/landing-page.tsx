import { useState } from "react"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingStats } from "@/components/landing/landing-stats"
import { LandingTalent } from "@/components/landing/landing-talent"
import { LandingContracts } from "@/components/landing/landing-contracts"
import { LandingBento } from "@/components/landing/landing-bento"
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works"
import { LandingTestimonials } from "@/components/landing/landing-testimonials"
import { LandingCta } from "@/components/landing/landing-cta"
import { LandingFooter } from "@/components/landing/landing-footer"

export function LandingPage() {
	const [talentFilter, setTalentFilter] = useState("All talent")

	const handleSearchSelect = (query: string) => {
		const lower = query.toLowerCase()
		if (lower.includes("ai") || lower.includes("python") || lower.includes("llm")) {
			setTalentFilter("AI & Machine Learning")
		} else if (lower.includes("react") || lower.includes("rust") || lower.includes("dev")) {
			setTalentFilter("Full-Stack Engineering")
		} else if (lower.includes("design") || lower.includes("figma") || lower.includes("brand")) {
			setTalentFilter("Product & UI/UX Design")
		} else {
			setTalentFilter("All talent")
		}
	}

	return (
		<div className="landing-page min-h-dvh bg-background text-foreground antialiased selection:bg-[#B8EF0D] selection:text-[#17191C]">
			{/* Main Sticky Header */}
			<LandingHeader />

			<main id="main-content" tabIndex={-1} className="outline-hidden">
				{/* High-Impact Hero with Dual Search & Floating Showcase */}
				<LandingHero onSearchSelect={handleSearchSelect} />

				{/* Key Platform Proof Metrics & Company Trust Strip */}
				<LandingStats />

				{/* Curated Specialist Roster with Expertise Filters */}
				<LandingTalent filter={talentFilter} onFilter={setTalentFilter} />

				{/* Live Active Contracts Feed */}
				<LandingContracts />

				{/* The Skilio Difference Bento Showcase */}
				<LandingBento />

				{/* Simple 3-Step Workflow */}
				<LandingHowItWorks />

				{/* Verified Testimonials & Stories of Scale */}
				<LandingTestimonials />

				{/* High-Impact Conversion Banner */}
				<LandingCta />
			</main>

			{/* Comprehensive Platform Footer */}
			<LandingFooter />
		</div>
	)
}
