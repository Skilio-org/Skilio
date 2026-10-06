import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout, LegalSection } from "@/components/common/legal-page-layout";

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
    <LegalPageLayout
      eyebrow="Legal & Transparency"
      title="Privacy Policy"
      lastUpdated="Last updated: October 2026 · Effective for all Skilio users."
    >
      <LegalSection title="1. Information We Collect">
        <p className="text-muted-foreground">
          When you create an account, build a profile, or interact on Skilio, we collect:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Account Information:</strong> Name, email address, password hash, and account role (client or freelancer).
          </li>
          <li>
            <strong className="text-foreground">Profile & Work Details:</strong> Professional title, skills, hourly rate, portfolio links, and biographical summary.
          </li>
          <li>
            <strong className="text-foreground">Activity & Networking:</strong> Connection requests, introductory notes (up to 300 characters), and proposal interactions.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How We Use Information">
        <p className="text-muted-foreground">
          Your data is used solely to provide and improve the Skilio platform:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Enabling clients to discover matching freelance talent and freelancers to find projects.</li>
          <li>Facilitating direct messaging and collaboration between connected users.</li>
          <li>Protecting account security and preventing fraudulent or unauthorized activities.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Information Sharing & Security">
        <p className="text-muted-foreground">
          We do not sell your personal data. Profile information you designate as public is visible to other members of the marketplace to enable discovery and networking. All data is protected with modern encryption in transit and at rest.
        </p>
      </LegalSection>

      <LegalSection title="4. Your Rights">
        <p className="text-muted-foreground">
          You have the right to access, edit, or delete your account information at any time via your Account Settings.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
