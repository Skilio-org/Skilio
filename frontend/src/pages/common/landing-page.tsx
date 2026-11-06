import { useState } from "react"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingTalent } from "@/components/landing/landing-talent"
import { LandingContracts } from "@/components/landing/landing-contracts"
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works"
import { LandingTestimonials } from "@/components/landing/landing-testimonials"
import { LandingCta } from "@/components/landing/landing-cta"
import { LandingFooter } from "@/components/landing/landing-footer"

export function LandingPage() {
	const [talentFilter, setTalentFilter] = useState("All talent")

	const handleSearchSelect = (query: string) => {
		const lower = query.toLowerCase()
		if (lower.includes("react") || lower.includes("node") || lower.includes("full-stack") || lower.includes("dev")) {
			setTalentFilter("Full-Stack Engineering")
		} else if (lower.includes("design") || lower.includes("figma") || lower.includes("ui") || lower.includes("ux")) {
			setTalentFilter("Product & UI/UX Design")
		} else if (lower.includes("mobile") || lower.includes("flutter") || lower.includes("ios") || lower.includes("android")) {
			setTalentFilter("Mobile Development")
		} else if (
			lower.includes("shopify") ||
			lower.includes("ecommerce") ||
			lower.includes("e-commerce") ||
			lower.includes("marketing")
		) {
			setTalentFilter("E-Commerce & Marketing")
		} else {
			setTalentFilter("All talent")
		}
	}

	return (
		<div className="landing-page min-h-dvh bg-background text-foreground antialiased selection:bg-[#B8EF0D] selection:text-[#17191C]">
			{/* Main Sticky Header */}
			<LandingHeader />

			<main id="main-content" tabIndex={-1} className="outline-hidden">
				{/* High-Impact Hero with Search & Moroccan Showcase */}
				<LandingHero onSearchSelect={handleSearchSelect} />

				{/* Curated Moroccan Specialist Roster with Expertise Filters */}
				<LandingTalent filter={talentFilter} onFilter={setTalentFilter} />

				{/* Live Active Contracts Feed */}
				<LandingContracts />

				{/* Simple 3-Step Workflow */}
				<LandingHowItWorks />

				{/* Verified Testimonials from Moroccan Clients & Specialists */}
				<LandingTestimonials />

				{/* High-Impact Conversion Banner */}
				<LandingCta />
			</main>

			{/* Platform Footer */}
			<LandingFooter />
		</div>
	)
}
