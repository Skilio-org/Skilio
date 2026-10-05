import { createFileRoute } from "@tanstack/react-router";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";

export const Route = createFileRoute("/terms")({
  component: TermsOfServicePage,
  head: () => ({
    meta: [
      { title: "Terms of Service | Skilio" },
      {
        name: "description",
        content:
          "Review our Terms of Service governing platform usage, client-freelancer connections, contracts, and marketplace conduct.",
      },
    ],
  }),
});

function TermsOfServicePage() {
  return (
    <div className="landing-page bg-background text-foreground min-h-dvh flex flex-col">
      <LandingHeader />

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none py-16 sm:py-24">
        <div className="landing-container max-w-4xl">
          <div className="border-border border-b pb-8">
            <p className="text-primary text-sm font-medium mb-3">Terms & Conditions</p>
            <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="text-muted-foreground mt-4 text-sm sm:text-base">
              Last updated: October 2026 · Effective for all Skilio users.
            </p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none mt-10 space-y-10 text-foreground/90 leading-relaxed text-sm sm:text-base">
            <section className="space-y-3">
              <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground">
                By accessing or using Skilio, you agree to comply with and be bound by these Terms of Service. If you are using Skilio on behalf of a company or organization, you represent that you have authority to bind that entity.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                2. User Accounts & Integrity
              </h2>
              <p className="text-muted-foreground">
                Users agree to provide accurate, up-to-date information during onboarding. You are responsible for safeguarding your credentials and maintaining the security of your account.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                3. Connections & Professional Conduct
              </h2>
              <p className="text-muted-foreground">
                Our platform enables direct networking inquiries and proposal submissions. Unsolicited spam, harassment, or abusive behavior will result in immediate suspension or termination of account privileges.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                4. Independent Contractor Relationship
              </h2>
              <p className="text-muted-foreground">
                Freelancers operate as independent contractors and not as employees of Skilio or any hiring client. Both parties establish their own project terms, milestones, and deliverable expectations.
              </p>
            </section>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
