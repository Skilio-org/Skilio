import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ListFilter, MessagesSquare, ScanSearch } from "lucide-react";

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="border-border bg-muted/40 scroll-mt-24 border-y py-16 sm:py-24">
      <div className="landing-container grid gap-12 md:grid-cols-[.9fr_1.1fr] lg:gap-24">
        <div>
          <p className="text-primary mb-5 text-sm font-medium">How it works</p>
          <h2 className="landing-heading">
            Less searching.
            <br />
            More doing.
          </h2>
          <p className="text-muted-foreground mt-5 max-w-sm text-base leading-7">
            Go from a project in mind to a person you want to work with.
          </p>
          <Link to="/signup" search={{ role: "client" }} className="landing-text-link mt-7">
            Get started <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <ol className="space-y-8">
          {[
            {
              icon: ScanSearch,
              title: "Find your kind of expert",
              copy: "Search by skill, explore specialties, and discover people who understand the work.",
            },
            {
              icon: ListFilter,
              title: "Look beyond the headline",
              copy: "Compare portfolios, experience, and rates. Save the people who stand out.",
            },
            {
              icon: MessagesSquare,
              title: "Start a real conversation",
              copy: "Share your brief, ask questions, and find out if you're a good fit.",
            },
          ].map(({ icon: Icon, title, copy }) => (
            <li key={title} className="border-border flex gap-5 border-b pb-8 last:border-0 last:pb-0">
              <span className="border-border bg-card text-primary grid size-12 shrink-0 place-items-center rounded-xl border">
                <Icon className="size-5" strokeWidth={1.5} />
              </span>
              <div>
                <h3 className="text-lg font-medium tracking-tight">{title}</h3>
                <p className="text-muted-foreground mt-2 max-w-md text-sm leading-7">{copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
