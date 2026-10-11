import type * as React from "react"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"

interface LegalPageLayoutProps {
	eyebrow?: string
	title: string
	lastUpdated?: string
	children: React.ReactNode
}

export function LegalPageLayout({
	eyebrow = "Legal & Transparency",
	title,
	lastUpdated = "Last updated: October 2026 · Effective for all Skilio users.",
	children,
}: LegalPageLayoutProps) {
	return (
		<div className="landing-page flex min-h-dvh flex-col bg-background text-foreground">
			<LandingHeader />

			<main id="main-content" tabIndex={-1} className="flex-1 py-16 outline-none sm:py-24">
				<div className="landing-container max-w-4xl">
					{/* Header */}
					<div className="border-border border-b pb-8">
						{eyebrow && <p className="mb-3 font-medium text-primary text-sm">{eyebrow}</p>}
						<h1 className="font-display font-semibold text-3xl text-foreground tracking-tight sm:text-5xl">{title}</h1>
						{lastUpdated && <p className="mt-4 text-muted-foreground text-sm sm:text-base">{lastUpdated}</p>}
					</div>

					{/* Content */}
					<div className="prose prose-neutral dark:prose-invert mt-10 max-w-none space-y-10 text-foreground/90 text-sm leading-relaxed sm:text-base">
						{children}
					</div>
				</div>
			</main>

			<LandingFooter />
		</div>
	)
}

interface LegalSectionProps {
	title: string
	children: React.ReactNode
}

export function LegalSection({ title, children }: LegalSectionProps) {
	return (
		<section className="space-y-3">
			<h2 className="font-display font-semibold text-foreground text-xl tracking-tight sm:text-2xl">{title}</h2>
			{children}
		</section>
	)
}
