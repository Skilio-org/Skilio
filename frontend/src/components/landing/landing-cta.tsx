import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function LandingCta() {
  return (
    <section className="bg-brand-600 px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto grid max-w-[1344px] gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <ShieldCheck className="text-brand-200 size-8" aria-hidden="true" />
          <h2 className="font-display mt-7 max-w-4xl text-4xl leading-[1.05] font-medium tracking-[-0.04em] sm:text-6xl">
            The right person changes what’s possible.
          </h2>
          <p className="text-brand-100 mt-5 max-w-xl text-lg leading-8">
            Create a free client account and start building your shortlist.
          </p>
        </div>
        <Link
          to="/signup"
          className="text-brand-800 hover:bg-brand-50 inline-flex min-h-14 items-center justify-between gap-10 rounded-full bg-white px-6 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Explore freelancers <ArrowRight className="size-5" />
        </Link>
      </div>
    </section>
  );
}
