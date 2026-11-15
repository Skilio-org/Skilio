import { LegalPageLayout, LegalSection } from "@/components/common/legal-page-layout"

const text = "text-muted-foreground"
const list = "list-disc space-y-2 pl-6 text-muted-foreground"

export function PrivacyPolicyPage() {
	return (
		<LegalPageLayout
			eyebrow="Legal & Transparency"
			title="Privacy Policy"
			lastUpdated="Last updated: November 2026 · Effective for all Skilio users."
		>
			<LegalSection title="1. About this policy">
				<p className={text}>
					Skilio is a marketplace where clients hire independent freelancers. This policy explains what personal data we
					collect when you use Skilio, why we collect it, who can see it, and what you can do about it. By creating an
					account you confirm that you have read it.
				</p>
			</LegalSection>

			<LegalSection title="2. Information we collect">
				<ul className={list}>
					<li>
						<strong className="text-foreground">Account details:</strong> your full name, email address, account role
						(client, freelancer, or both) and a password. Passwords are stored only as a salted hash, never in plain
						text. If you sign in with Google or LinkedIn, we receive the basic profile details they share with us, such
						as your name and email address.
					</li>
					<li>
						<strong className="text-foreground">Freelancer profile:</strong> professional title, main area of work,
						skills, introduction, languages, city, hourly rate, weekly availability, work experience, education,
						portfolio projects (titles, descriptions, links and cover images), your profile photo and, if you choose to
						upload one, your resume.
					</li>
					<li>
						<strong className="text-foreground">Client profile:</strong> company name, your role, company website, city,
						company size and your profile photo.
					</li>
					<li>
						<strong className="text-foreground">Marketplace activity:</strong> job posts, proposals and cover letters,
						connection requests and their notes, messages, reviews and ratings, saved jobs and talent, recent searches
						and notifications.
					</li>
					<li>
						<strong className="text-foreground">Presence:</strong> whether you are currently online, so that people you
						message can see it.
					</li>
				</ul>
				<p className={text}>
					We do not use advertising trackers or third-party analytics on Skilio, and we do not collect payment card
					details.
				</p>
			</LegalSection>

			<LegalSection title="3. How we use your information">
				<ul className={list}>
					<li>To create and run your account and to keep it secure.</li>
					<li>To show your profile to other members so clients can find freelancers and freelancers can find work.</li>
					<li>To deliver proposals, connection requests, messages, reviews and notifications between users.</li>
					<li>To send service emails, such as password recovery.</li>
					<li>To monitor the health of the service and to detect and prevent abuse.</li>
				</ul>
				<p className={text}>We do not sell your personal data and we do not use it for advertising.</p>
			</LegalSection>

			<LegalSection title="4. Who can see your information">
				<ul className={list}>
					<li>
						<strong className="text-foreground">Published freelancer profiles</strong> (photo, name, title, skills,
						rate, projects and the other profile details) are visible to other members of Skilio. A profile that is not
						published yet is visible only to you.
					</li>
					<li>
						<strong className="text-foreground">Your resume</strong> can be downloaded by members who view your profile.
						You can remove it at any time.
					</li>
					<li>
						<strong className="text-foreground">Messages and connection notes</strong> are visible only to the people in
						that conversation or connection.
					</li>
					<li>
						<strong className="text-foreground">Proposals</strong> are visible to you and to the client who posted the
						job.
					</li>
					<li>
						<strong className="text-foreground">Reviews</strong> are shown on the freelancer&apos;s profile together
						with the name and photo of the client who wrote them.
					</li>
				</ul>
			</LegalSection>

			<LegalSection title="5. Service providers">
				<p className={text}>We rely on a small number of providers to run Skilio:</p>
				<ul className={list}>
					<li>
						<strong className="text-foreground">Cloudinary</strong> stores and delivers uploaded files: profile photos,
						portfolio images and resumes.
					</li>
					<li>
						<strong className="text-foreground">Google and LinkedIn</strong> handle sign-in if you choose to use them.
						Their own privacy policies apply to what they collect.
					</li>
					<li>
						<strong className="text-foreground">Cloud hosting and email delivery</strong> providers run our servers and
						send our service emails on our behalf.
					</li>
				</ul>
				<p className={text}>
					These providers process data only to provide their service to us. We do not share your information with anyone
					else, unless the law requires it.
				</p>
			</LegalSection>

			<LegalSection title="6. Browser storage and cookies">
				<p className={text}>
					Skilio uses your browser&apos;s local storage to keep you signed in and to remember your preferences, such as
					light or dark theme and your last used role. It also sets one small cookie that remembers whether the side
					menu is open. These are needed for the site to work, and they are not used to track you. You can clear them at
					any time from your browser settings, and you will be signed out.
				</p>
			</LegalSection>

			<LegalSection title="7. Security">
				<p className={text}>
					Connections to Skilio are encrypted with HTTPS, passwords are salted and hashed, and every request that
					changes your data requires you to be signed in. No online service can promise perfect security, so please use
					a strong, unique password and sign out on shared devices.
				</p>
			</LegalSection>

			<LegalSection title="8. Keeping and deleting your data">
				<p className={text}>
					We keep your information while your account is active. You can delete your account at any time from Account
					Settings, under Delete account. This removes your account and the profile information linked to it. Backups
					made before the deletion may keep a copy until they expire, and files held by our storage provider can take a
					little longer to disappear.
				</p>
			</LegalSection>

			<LegalSection title="9. Your choices and rights">
				<ul className={list}>
					<li>View and edit your profile and account details whenever you like.</li>
					<li>Replace or remove your profile photo, portfolio images and resume.</li>
					<li>Withdraw proposals and connection requests, and remove connections.</li>
					<li>Delete your account and the data linked to it.</li>
					<li>Ask us for a copy of the personal data we hold about you, or ask us to correct it.</li>
				</ul>
			</LegalSection>

			<LegalSection title="10. Children">
				<p className={text}>
					Skilio is for people who are old enough to enter into a work agreement. It is not intended for children, and
					we do not knowingly collect their data.
				</p>
			</LegalSection>

			<LegalSection title="11. Changes to this policy">
				<p className={text}>
					If we change this policy in a way that matters, we will update the date at the top of this page and tell you
					in the app. Continuing to use Skilio after a change means you accept the updated policy.
				</p>
			</LegalSection>
		</LegalPageLayout>
	)
}
