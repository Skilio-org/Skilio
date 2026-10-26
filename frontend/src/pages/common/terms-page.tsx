import { LegalPageLayout, LegalSection } from "@/components/common/legal-page-layout"

export function TermsOfServicePage() {
	return (
		<LegalPageLayout
			eyebrow="Terms & Conditions"
			title="Terms of Service"
			lastUpdated="Last updated: October 2026 · Effective for all Skilio users."
		>
			<LegalSection title="1. Acceptance of Terms">
				<p className="text-muted-foreground">
					By accessing or using Skilio, you agree to comply with and be bound by these Terms of Service. If you are
					using Skilio on behalf of a company or organization, you represent that you have authority to bind that
					entity.
				</p>
			</LegalSection>

			<LegalSection title="2. User Accounts & Integrity">
				<p className="text-muted-foreground">
					Users agree to provide accurate, up-to-date information during onboarding. You are responsible for
					safeguarding your credentials and maintaining the security of your account.
				</p>
			</LegalSection>

			<LegalSection title="3. Connections & Professional Conduct">
				<p className="text-muted-foreground">
					Our platform enables direct networking inquiries and proposal submissions. Unsolicited spam, harassment, or
					abusive behavior will result in immediate suspension or termination of account privileges.
				</p>
			</LegalSection>

			<LegalSection title="4. Independent Contractor Relationship">
				<p className="text-muted-foreground">
					Freelancers operate as independent contractors and not as employees of Skilio or any hiring client. Both
					parties establish their own project terms, milestones, and deliverable expectations.
				</p>
			</LegalSection>
		</LegalPageLayout>
	)
}
