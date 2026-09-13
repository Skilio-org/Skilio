import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export function LandingCta() {
  return (
    <section className="landing-container py-16 sm:py-24">
      <div className="border-brand-200 bg-brand-50 rounded-2xl border px-6 py-12 sm:px-12 sm:py-14">
        <h2 className="landing-heading max-w-3xl">
          Make room for
          <br />
          <span className="text-primary">your next great project.</span>
        </h2>
        <div className="mt-7 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <p className="text-muted-foreground max-w-md text-base leading-7">
            Find someone to bring it to life. Or be the person who does. One account, both possibilities.
          </p>
          <Link to="/signup" className="landing-primary self-start whitespace-nowrap">
            Create account <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
