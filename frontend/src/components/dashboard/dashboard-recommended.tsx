import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Bookmark, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { Monogram, SkillTag, workspaceStyles } from "./dashboard-header";

const matches = [
  {
    id: "maya-laurent",
    initials: "ML",
    name: "Maya Laurent",
    role: "Senior Product Designer",
    location: "Paris, France",
    rate: "$75/hr",
    rating: "4.9",
    skills: ["Product design", "Figma", "UX research"],
    style: "bg-[#dce7ff] text-[#173ea5]",
  },
  {
    id: "noah-williams",
    initials: "NW",
    name: "Noah Williams",
    role: "Full-stack Engineer",
    location: "Toronto, Canada",
    rate: "$90/hr",
    rating: "5.0",
    skills: ["React", "TypeScript", "Node.js"],
    style: "bg-[#d8f0ea] text-[#075f4c]",
  },
  {
    id: "amara-okafor",
    initials: "AO",
    name: "Amara Okafor",
    role: "Brand Strategist",
    location: "London, UK",
    rate: "$65/hr",
    rating: "4.9",
    skills: ["Brand strategy", "Research", "Content"],
    style: "bg-[#f1e6d8] text-[#744217]",
  },
];

export const RecommendedFreelancers = () => {
  const [savedMatchIds, setSavedMatchIds] = useState<Set<string>>(new Set());
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <div className="border-border flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <p className="text-muted-foreground text-xs font-medium">Recommended for you</p>
          <h2 className="font-display mt-2 text-2xl font-medium tracking-tight">People worth getting to know</h2>
        </div>
        <Link
          to="/talent"
          search={{ q: undefined }}
          className="text-brand-700 hover:text-brand-800 inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
        >
          View all <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="divide-border divide-y">
        {matches.map((person) => (
          <article key={person.name} className="hover:bg-muted/35 p-5 transition-colors sm:p-6">
            <div className="flex items-start gap-4">
              <Monogram className={`size-14 text-lg ${person.style}`}>{person.initials}</Monogram>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <Link
                      to="/talent/$freelancerId"
                      params={{ freelancerId: person.id }}
                      search={{ q: undefined }}
                      className="font-display hover:text-brand-700 flex items-center gap-1.5 text-lg font-semibold"
                    >
                      {person.name}
                      <BadgeCheck className="text-brand-600 size-4" aria-label="Verified" />
                    </Link>
                    <p className="text-muted-foreground mt-0.5 text-sm">{person.role}</p>
                  </div>
                  <p className="font-semibold">{person.rate}</p>
                </div>
                <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <strong className="text-foreground">{person.rating}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {person.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Available now
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {person.skills.map((skill) => (
                    <SkillTag key={skill}>{skill}</SkillTag>
                  ))}
                </div>
              </div>
              <button
                type="button"
                aria-label={`${savedMatchIds.has(person.id) ? "Unsave" : "Save"} ${person.name}`}
                aria-pressed={savedMatchIds.has(person.id)}
                onClick={() =>
                  setSavedMatchIds((current) => {
                    const next = new Set(current);
                    if (next.has(person.id)) {
                      next.delete(person.id);
                    } else {
                      next.add(person.id);
                    }
                    return next;
                  })
                }
                className={workspaceStyles.iconButton}
              >
                <Bookmark className={`size-4 ${savedMatchIds.has(person.id) ? "fill-current" : ""}`} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
