import { LandingHeader } from "@/components/landing/landing-header"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingTalent } from "@/components/landing/landing-talent"
import { LandingContracts } from "@/components/landing/landing-contracts"
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works"
import { LandingTestimonials } from "@/components/landing/landing-testimonials"
import { LandingCta } from "@/components/landing/landing-cta"
import { LandingFooter } from "@/components/landing/landing-footer"

export function LandingPage() {
	return (
		<div className="landing-page min-h-dvh bg-background text-foreground antialiased selection:bg-[#B8EF0D] selection:text-[#17191C]">
			{/* Main Sticky Header */}
			<LandingHeader />

			<main id="main-content" tabIndex={-1} className="outline-hidden">
				{/* High-Impact Hero with Search & Moroccan Showcase */}
				<LandingHero />

				{/* Curated Moroccan Specialist Roster */}
				<LandingTalent />

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
