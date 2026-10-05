import { createFileRoute } from "@tanstack/react-router";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy | Skilio" },
      {
        name: "description",
        content:
          "Read our Privacy Policy to understand how Skilio collects, protects, and manages your personal and workspace data.",
      },
    ],
  }),
});

function PrivacyPolicyPage() {
  return (
    <div className="landing-page bg-background text-foreground min-h-dvh flex flex-col">
      <LandingHeader />

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none py-16 sm:py-24">
        <div className="landing-container max-w-4xl">
          <div className="border-border border-b pb-8">
            <p className="text-primary text-sm font-medium mb-3">Legal & Transparency</p>
            <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground mt-4 text-sm sm:text-base">
              Last updated: October 2026 · Effective for all Skilio users.
            </p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none mt-10 space-y-10 text-foreground/90 leading-relaxed text-sm sm:text-base">
            <section className="space-y-3">
              <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                1. Information We Collect
              </h2>
              <p className="text-muted-foreground">
                When you create an account, build a profile, or interact on Skilio, we collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Account Information:</strong> Name, email address, password hash, and account role (client or freelancer).</li>
                <li><strong className="text-foreground">Profile & Work Details:</strong> Professional title, skills, hourly rate, portfolio links, and biographical summary.</li>
                <li><strong className="text-foreground">Activity & Networking:</strong> Connection requests, introductory notes (up to 300 characters), and proposal interactions.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                2. How We Use Information
              </h2>
              <p className="text-muted-foreground">
                Your data is used solely to provide and improve the Skilio platform:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Enabling clients to discover matching freelance talent and freelancers to find projects.</li>
                <li>Facilitating direct messaging and collaboration between connected users.</li>
                <li>Protecting account security and preventing fraudulent or unauthorized activities.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                3. Information Sharing & Security
              </h2>
              <p className="text-muted-foreground">
                We do not sell your personal data. Profile information you designate as public is visible to other members of the marketplace to enable discovery and networking. All data is protected with modern encryption in transit and at rest.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                4. Your Rights
              </h2>
              <p className="text-muted-foreground">
                You have the right to access, edit, or delete your account information at any time via your Account Settings.
              </p>
            </section>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
