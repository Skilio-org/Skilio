import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Code2,
  Heart,
  MapPin,
  MessageSquare,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Freelancer — Find independent talent" },
      {
        name: "description",
        content: "Search verified freelance profiles, compare expertise, and find the right independent professional.",
      },
    ],
  }),
});

const categories = [
  { icon: Code2, name: "Development & IT", count: "3,240 professionals" },
  { icon: Palette, name: "Design & Creative", count: "2,180 professionals" },
  { icon: TrendingUp, name: "Sales & Marketing", count: "1,460 professionals" },
  { icon: Sparkles, name: "AI Services", count: "820 professionals" },
];

const people = [
  {
    name: "Maya Laurent",
    initials: "ML",
    role: "Senior Product Designer",
    location: "Paris, France",
    rate: "$75/hr",
    rating: "4.9",
    jobs: "64 projects",
    description: "I shape complex B2B products into clear, focused experiences that teams can ship with confidence.",
    skills: ["Product design", "Figma", "Design systems"],
    background: "bg-[#dce7ff]",
    color: "text-[#173ea5]",
  },
  {
    name: "Noah Williams",
    initials: "NW",
    role: "Full-stack Engineer",
    location: "Toronto, Canada",
    rate: "$90/hr",
    rating: "5.0",
    jobs: "91 projects",
    description: "I build reliable web products for growing teams, from the first architecture decision to launch.",
    skills: ["React", "TypeScript", "Node.js"],
    background: "bg-[#d8f0ea]",
    color: "text-[#075f4c]",
  },
  {
    name: "Amara Okafor",
    initials: "AO",
    role: "Brand Strategist",
    location: "London, UK",
    rate: "$65/hr",
    rating: "4.9",
    jobs: "48 projects",
    description: "I help ambitious companies find a distinct position, voice, and story their customers remember.",
    skills: ["Brand strategy", "Research", "Content"],
    background: "bg-[#f1e6d8]",
    color: "text-[#744217]",
  },
];

function LandingPage() {
  const [savedPeople, setSavedPeople] = useState<Set<string>>(new Set());

  return (
    <div className="min-h-screen bg-white text-[#101828]">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center px-5 sm:px-8 lg:px-12">
          <a href="#main-content" aria-label="Freelancer home" className="shrink-0">
            <img src="/assets/images/freelancer-logo.png" alt="Freelancer" className="h-8 w-auto" />
          </a>

          <nav
            aria-label="Main navigation"
            className="ml-14 hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex"
          >
            <a className="transition-colors hover:text-slate-950" href="#talent">
              Find talent
            </a>
            <a className="transition-colors hover:text-slate-950" href="#categories">
              Categories
            </a>
            <a className="transition-colors hover:text-slate-950" href="#how-it-works">
              How it works
            </a>
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="hover:text-brand-700 hidden min-h-11 items-center px-4 text-sm font-semibold text-slate-700 transition-colors sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="bg-brand-600 hover:bg-brand-700 focus-visible:outline-brand-600 inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-5"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="outline-none">
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
                Browse detailed profiles, see real work, and connect directly with independent professionals who fit
                your standards.
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
                    B2B product specialist focused on clear workflows, scalable systems, and thoughtful interaction
                    design.
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
                  [
                    "AO",
                    "Amara Okafor",
                    "Brand Strategist",
                    "$65/hr",
                    "4.9 · 74 reviews",
                    "bg-[#f1e6d8] text-[#744217]",
                  ],
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

        <section aria-label="Platform statistics" className="border-b border-slate-200 bg-slate-950 text-white">
          <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-white/15 lg:grid-cols-4">
            {[
              ["12k+", "reviewed profiles"],
              ["140", "specialist disciplines"],
              ["92", "countries represented"],
              ["4.9/5", "average talent rating"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="border-b border-white/15 px-5 py-8 last:border-b-0 sm:px-8 lg:border-b-0 lg:px-12"
              >
                <p className="font-display text-3xl font-medium tracking-tight sm:text-4xl">{value}</p>
                <p className="mt-1 text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="categories" className="border-b border-slate-200 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1344px]">
            <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
              <div>
                <p className="text-brand-700 text-sm font-semibold">Explore expertise</p>
                <h2 className="font-display mt-3 max-w-md text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">
                  Start with the skill. Find the person.
                </h2>
              </div>
              <div className="border-t border-slate-300">
                {categories.map((category) => (
                  <a
                    key={category.name}
                    href="#talent"
                    className="group grid min-h-24 grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-slate-300 transition-colors hover:bg-slate-50 sm:gap-6 sm:px-4"
                  >
                    <category.icon className="text-brand-600 size-5" aria-hidden="true" />
                    <div className="sm:flex sm:items-baseline sm:justify-between sm:gap-6">
                      <h3 className="font-display text-lg font-semibold sm:text-xl">{category.name}</h3>
                      <p className="mt-1 text-sm text-slate-500 sm:mt-0">{category.count}</p>
                    </div>
                    <ArrowRight className="group-hover:text-brand-600 size-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="talent" className="bg-[#f7f8fa] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1344px]">
            <div className="flex flex-col justify-between gap-5 border-b border-slate-300 pb-7 sm:flex-row sm:items-end">
              <div>
                <p className="text-brand-700 text-sm font-semibold">Selected talent</p>
                <h2 className="font-display mt-3 text-4xl font-medium tracking-[-0.035em] sm:text-5xl">
                  People with a track record.
                </h2>
              </div>
              <Link
                to="/signup"
                className="text-brand-700 hover:text-brand-800 inline-flex min-h-11 items-center gap-2 font-semibold"
              >
                Browse all profiles <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {people.map((person) => (
                <article
                  key={person.name}
                  className="shadow-card hover:border-brand-200 hover:shadow-card-hover rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 xl:p-8"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`grid size-20 place-items-center rounded-full ${person.background} ${person.color} font-display text-2xl font-semibold`}
                    >
                      {person.initials}
                    </div>
                    <button
                      type="button"
                      aria-label={`Save ${person.name}`}
                      aria-pressed={savedPeople.has(person.name)}
                      onClick={() =>
                        setSavedPeople((current) => {
                          const next = new Set(current);
                          if (next.has(person.name)) {
                            next.delete(person.name);
                          } else {
                            next.add(person.name);
                          }
                          return next;
                        })
                      }
                      className="grid size-11 place-items-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-400 hover:text-rose-600"
                    >
                      <Heart className={`size-4 ${savedPeople.has(person.name) ? "fill-current" : ""}`} />
                    </button>
                  </div>
                  <div className="mt-7 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display flex items-center gap-1.5 text-xl font-semibold">
                        {person.name}
                        <BadgeCheck className="text-brand-600 size-4" aria-label="Verified" />
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">{person.role}</p>
                    </div>
                    <p className="shrink-0 font-semibold">{person.rate}</p>
                  </div>
                  <p className="mt-5 min-h-[72px] text-sm leading-6 text-slate-600">{person.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {person.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="mt-7 grid grid-cols-2 gap-4 border-y border-slate-200 py-4 text-sm">
                    <div>
                      <p className="text-slate-500">Rating</p>
                      <p className="mt-1 flex items-center gap-1.5 font-semibold">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" /> {person.rating}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Experience</p>
                      <p className="mt-1 font-semibold">{person.jobs}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="size-4" /> {person.location}
                  </div>
                  <Link
                    to="/signup"
                    className="hover:bg-brand-700 mt-6 inline-flex min-h-12 w-full items-center justify-between rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition-colors"
                  >
                    View full profile <ArrowRight className="size-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-slate-200 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1344px]">
            <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-24">
              <div>
                <p className="text-brand-700 text-sm font-semibold">How it works</p>
                <h2 className="font-display mt-3 text-4xl leading-tight font-medium tracking-[-0.035em] sm:text-5xl">
                  A clearer way to choose.
                </h2>
                <p className="mt-5 max-w-md text-lg leading-8 text-slate-600">
                  Search, compare, and connect without wading through noisy feeds or irrelevant listings.
                </p>
              </div>
              <ol className="border-t border-slate-300">
                {[
                  ["01", "Search with context", "Filter by expertise, location, rate, and availability."],
                  ["02", "Evaluate real evidence", "Review portfolios, experience, feedback, and work history."],
                  ["03", "Save and connect", "Build a shortlist and message the people who stand out."],
                ].map(([number, title, copy]) => (
                  <li
                    key={number}
                    className="grid gap-3 border-b border-slate-300 py-7 sm:grid-cols-[72px_1fr_1fr] sm:items-start sm:gap-6"
                  >
                    <span className="text-brand-700 font-mono text-sm">{number}</span>
                    <h3 className="font-display text-xl font-semibold">{title}</h3>
                    <p className="leading-7 text-slate-600">{copy}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

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
      </main>

      <footer className="bg-slate-950 px-5 py-12 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1344px]">
          <div className="flex flex-col gap-8 border-b border-white/15 pb-10 sm:flex-row sm:items-center sm:justify-between">
            <img src="/assets/images/freelancer-logo-light.png" alt="Freelancer" className="h-8 w-auto self-start" />
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-300">
              <a href="#talent" className="hover:text-white">
                Find talent
              </a>
              <a href="#categories" className="hover:text-white">
                Categories
              </a>
              <a href="#how-it-works" className="hover:text-white">
                How it works
              </a>
              <Link to="/login" className="hover:text-white">
                Log in
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-3 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Freelancer. All rights reserved.</p>
            <p className="inline-flex items-center gap-2">
              <MessageSquare className="size-3.5" /> Built for better working relationships.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
