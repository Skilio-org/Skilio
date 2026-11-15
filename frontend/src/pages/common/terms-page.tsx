import { LegalPageLayout, LegalSection } from "@/components/common/legal-page-layout"

const text = "text-muted-foreground"
const list = "list-disc space-y-2 pl-6 text-muted-foreground"

export function TermsOfServicePage() {
	return (
		<LegalPageLayout
			eyebrow="Terms & Conditions"
			title="Terms of Service"
			lastUpdated="Last updated: November 2026 · Effective for all Skilio users."
		>
			<LegalSection title="1. Accepting these terms">
				<p className={text}>
					By creating an account or using Skilio, you agree to these terms and to our Privacy Policy. If you use Skilio
					for a company or other organisation, you confirm that you are allowed to accept these terms on its behalf. If
					you do not agree, please do not use the service.
				</p>
			</LegalSection>

			<LegalSection title="2. What Skilio is">
				<p className={text}>
					Skilio is an online marketplace where clients can post jobs and find freelancers, and where freelancers can
					build a profile, send proposals and talk to clients. Skilio provides the platform only. We are not a party to
					any agreement between a client and a freelancer, and we do not employ the freelancers who use the platform.
				</p>
				<p className={text}>
					Skilio does not process payments. Rates and budgets shown on the platform, in Moroccan dirhams (DH), are the
					amounts the people involved have stated. Any payment is arranged directly between the client and the
					freelancer, and they are responsible for agreeing its terms.
				</p>
			</LegalSection>

			<LegalSection title="3. Your account">
				<ul className={list}>
					<li>You must give accurate information and keep it up to date.</li>
					<li>One person may hold one account. An account can be used as both a client and a freelancer.</li>
					<li>You are responsible for your password and for everything that happens under your account.</li>
					<li>Tell us promptly if you think someone else has accessed your account.</li>
				</ul>
			</LegalSection>

			<LegalSection title="4. Your content">
				<p className={text}>
					You own what you put on Skilio, such as your profile, portfolio, resume, job posts, proposals, messages and
					reviews. You give Skilio permission to store it and to show it to other members as the service requires, for
					example displaying your published profile to clients. You are responsible for your content and you promise
					that you have the right to share it.
				</p>
			</LegalSection>

			<LegalSection title="5. Acceptable use">
				<p className={text}>You agree not to:</p>
				<ul className={list}>
					<li>Post false, misleading or fraudulent information, or pretend to be someone else.</li>
					<li>Harass, threaten or abuse other members, or send spam or unsolicited promotions.</li>
					<li>Upload anything illegal, offensive or that you do not have the right to share.</li>
					<li>
						Upload files that contain viruses or other harmful code. Images and resumes must be within the size and type
						limits shown in the app.
					</li>
					<li>
						Collect other members&apos; data in bulk, or try to break, overload or bypass the security of the service.
					</li>
					<li>Use Skilio for anything unlawful.</li>
				</ul>
			</LegalSection>

			<LegalSection title="6. Proposals, connections and reviews">
				<p className={text}>
					Proposals, connection requests and messages must be honest and relevant to real work. Reviews must describe
					your genuine experience of working with the person. We may remove content or reviews that break these terms.
				</p>
			</LegalSection>

			<LegalSection title="7. Freelancers and clients">
				<p className={text}>
					Freelancers work as independent professionals, not as employees of Skilio or of any client. Clients decide
					whom to hire, and freelancers decide which work to accept. We do not check the quality of anyone&apos;s work,
					and we do not guarantee that a job will be filled, that a freelancer will be available, or what the outcome of
					any project will be. Please take reasonable care before you agree to work with someone.
				</p>
			</LegalSection>

			<LegalSection title="8. Suspension and closing your account">
				<p className={text}>
					We may suspend or close an account that breaks these terms or puts other members at risk. You can close your
					own account at any time from Account Settings, under Delete account. What happens to your data is described in
					the Privacy Policy.
				</p>
			</LegalSection>

			<LegalSection title="9. The service as it is">
				<p className={text}>
					We work to keep Skilio available and accurate, but we provide it as it is, without a guarantee that it will
					always be available or free of errors. We may change or remove features at any time. To the extent the law
					allows, Skilio is not responsible for losses that come from agreements between members, from content posted by
					members, or from the service being unavailable.
				</p>
			</LegalSection>

			<LegalSection title="10. Changes to these terms">
				<p className={text}>
					We may update these terms from time to time. When we do, we will change the date at the top of this page and
					tell you in the app. Continuing to use Skilio after a change means you accept the new terms.
				</p>
			</LegalSection>
		</LegalPageLayout>
	)
}
