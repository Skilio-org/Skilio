import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Heart, MapPin, Star } from "lucide-react";
import { useState } from "react";

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

export function LandingTalent() {
  const [savedPeople, setSavedPeople] = useState<Set<string>>(new Set());

  return (
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
  );
}
