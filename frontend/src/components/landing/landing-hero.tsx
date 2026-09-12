import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Check, ChevronRight, MapPin, Search, Star } from "lucide-react";

export function LandingHero() {
  return (
    <section className="border-b border-slate-200">
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[1.08fr_.92fr]">
        <div className="flex min-h-[640px] min-w-0 flex-col justify-center px-5 py-20 sm:px-8 lg:min-h-[720px] lg:border-r lg:border-slate-200 lg:px-12 xl:px-20">
          <p className="text-brand-700 mb-6 flex items-center gap-2 text-sm font-semibold">
            <span className="size-2 bg-emerald-500" />
            1,800+ professionals available this week
          </p>
          <h1 className="font-display max-w-[780px] text-[clamp(3.5rem,6.5vw,6.7rem)] leading-[0.94] font-medium tracking-[-0.055em] text-slate-950">
            Hire by proof, <br />
            not promises.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
            Browse detailed profiles, see real work, and connect directly with independent professionals who fit your
            standards.
          </p>

          <div className="focus-within:border-brand-600 focus-within:ring-brand-100 mt-9 flex max-w-2xl items-center rounded-2xl border border-slate-300 bg-white p-2 shadow-[0_14px_40px_-20px_rgba(15,23,42,.35)] focus-within:ring-4">
            <Search className="ml-3 size-5 shrink-0 text-slate-400" aria-hidden="true" />
            <label htmlFor="talent-search" className="sr-only">
              Search by skill or role
            </label>
            <input
              id="talent-search"
              type="search"
              placeholder="Try “React developer” or “brand designer”"
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base outline-none placeholder:text-slate-400"
            />
            <Link
              to="/signup"
              aria-label="Search talent"
              className="bg-brand-600 hover:bg-brand-700 focus-visible:outline-brand-600 grid size-12 shrink-0 place-items-center rounded-xl text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <ArrowRight className="size-5" />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
            {["Profiles reviewed", "Portfolio-first", "Direct messaging"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <Check className="size-4 text-emerald-600" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="min-w-0 bg-[#f3f6fb] px-5 py-14 sm:px-8 lg:flex lg:items-center lg:px-12">
          <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,.35)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <p className="text-sm font-semibold text-slate-950">Top matches</p>
                <p className="mt-0.5 text-xs text-slate-500">Product design · Available now</p>
              </div>
              <span className="inline-flex min-h-11 items-center rounded-full border border-slate-200 px-4 text-xs font-semibold text-slate-600">
                Best match
              </span>
            </div>

            <article className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="font-display grid size-14 shrink-0 place-items-center rounded-full bg-[#dce7ff] text-lg font-semibold text-[#173ea5]">
                  ML
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h2 className="font-display text-lg font-semibold">Maya Laurent</h2>
                    <BadgeCheck className="text-brand-600 size-4" aria-label="Verified" />
                  </div>
                  <p className="text-sm text-slate-600">Senior Product Designer</p>
                </div>
                <p className="shrink-0 text-sm font-semibold">$75/hr</p>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-600">
                B2B product specialist focused on clear workflows, scalable systems, and thoughtful interaction design.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Product design", "Figma", "UX research"].map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <strong className="text-slate-800">4.9</strong> · 86 reviews
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> Paris, France
                </span>
                <span className="ml-auto font-semibold text-emerald-700">Available now</span>
              </div>
            </article>

            {[
              [
                "NW",
                "Noah Williams",
                "Full-stack Engineer",
                "$90/hr",
                "5.0 · 112 reviews",
                "bg-[#d8f0ea] text-[#075f4c]",
              ],
              ["AO", "Amara Okafor", "Brand Strategist", "$65/hr", "4.9 · 74 reviews", "bg-[#f1e6d8] text-[#744217]"],
            ].map(([initials, name, role, rate, reviews, style]) => (
              <article
                key={name}
                className="flex items-center gap-4 border-b border-slate-200 p-5 last:border-b-0 sm:px-6"
              >
                <div
                  className={`font-display grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold ${style}`}
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display truncate font-semibold">{name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {role} · {reviews}
                  </p>
                </div>
                <p className="text-sm font-semibold">{rate}</p>
                <ChevronRight className="size-4 text-slate-400" />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
