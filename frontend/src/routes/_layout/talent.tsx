import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownWideNarrow,
  Banknote,
  BriefcaseBusiness,
  Clock3,
  Filter,
  type LucideIcon,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header";
import { FreelancerCard } from "@/components/talent/freelancer-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { freelancers } from "@/data/freelancers";

export const Route = createFileRoute("/_layout/talent")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: TalentDirectory,
  head: () => ({ meta: [{ title: "Find talent | Freelancer" }] }),
});

const specialties = ["All talent", "Development", "Design", "Marketing", "AI services"] as const;

const popularSearches = ["Product designer", "React developer", "AI engineer"];

const rateOptions = [
  { value: "any", label: "Any hourly rate" },
  { value: "under-50", label: "Under $50/hr" },
  { value: "50-100", label: "$50–$100/hr" },
  { value: "100-plus", label: "$100+/hr" },
];

const availabilityOptions = [
  { value: "any", label: "Any availability" },
  { value: "now", label: "Available now" },
  { value: "week", label: "Available this week" },
  { value: "next-week", label: "Available next week" },
];

const locationOptions = [
  { value: "worldwide", label: "Worldwide" },
  { value: "europe", label: "Europe" },
  { value: "north-america", label: "North America" },
  { value: "asia-pacific", label: "Asia Pacific" },
];

const specialtyTerms: Record<(typeof specialties)[number], string[]> = {
  "All talent": [],
  Development: ["engineer", "developer", "react", "typescript", "node.js"],
  Design: ["designer", "design", "figma", "ux"],
  Marketing: ["marketing", "brand", "growth", "seo", "positioning"],
  "AI services": ["ai", "automation", "llm", "rag", "python"],
};

const searchAliases: Record<string, string[]> = {
  developer: ["developer", "engineer"],
  engineer: ["engineer", "developer"],
  designer: ["designer", "design"],
  design: ["design", "designer"],
  ai: ["ai", "llm", "automation"],
};

function TalentDirectory() {
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q ?? "");
  const [specialty, setSpecialty] = useState<(typeof specialties)[number]>("All talent");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [rate, setRate] = useState("any");
  const [availability, setAvailability] = useState("any");
  const [location, setLocation] = useState("worldwide");
  const [sort, setSort] = useState("best-match");

  const activeFilterCount = [rate !== "any", availability !== "any", location !== "worldwide"].filter(Boolean).length;

  const results = useMemo(() => {
    const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const expertiseTerms = specialtyTerms[specialty];

    const filtered = freelancers.filter((person) => {
      const haystack = [person.name, person.title, person.location, person.bio, ...person.skills]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchTerms.length === 0 ||
        searchTerms.every((term) => (searchAliases[term] ?? [term]).some((candidate) => haystack.includes(candidate)));
      const matchesSpecialty = expertiseTerms.length === 0 || expertiseTerms.some((term) => haystack.includes(term));
      const matchesRate =
        rate === "any" ||
        (rate === "under-50" && person.rate < 50) ||
        (rate === "50-100" && person.rate >= 50 && person.rate <= 100) ||
        (rate === "100-plus" && person.rate >= 100);
      const matchesAvailability =
        availability === "any" ||
        (availability === "now" && person.availability === "Available now") ||
        (availability === "week" && person.availability === "Available this week") ||
        (availability === "next-week" && person.availability === "Available next week");
      const matchesLocation =
        location === "worldwide" ||
        (location === "europe" &&
          ["France", "Portugal", "United Kingdom"].some((country) => person.location.includes(country))) ||
        (location === "north-america" &&
          ["Canada", "United States"].some((country) => person.location.includes(country))) ||
        (location === "asia-pacific" && person.location === "Singapore");

      return matchesSearch && matchesSpecialty && matchesRate && matchesAvailability && matchesLocation;
    });

    return filtered.sort((first, second) => {
      if (sort === "highest-rated") return second.rating - first.rating;
      if (sort === "lowest-rate") return first.rate - second.rate;
      return second.successRate - first.successRate || second.rating - first.rating;
    });
  }, [availability, location, query, rate, sort, specialty]);

  const resetFilters = () => {
    setRate("any");
    setAvailability("any");
    setLocation("worldwide");
  };

  return (
    <div className="space-y-7">
      <header className="border-border border-b pb-7 sm:pb-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <WorkspacePageHeader
              eyebrow="Talent discovery"
              title="Find the right talent"
              description="Discover skilled professionals by expertise, role, and location."
            />
            <p className="text-muted-foreground mt-2 text-sm leading-6 sm:text-base"></p>
          </div>
        </div>

        <search className="block">
          <form onSubmit={(event) => event.preventDefault()} className="mt-6 flex items-stretch gap-3">
            <div className="border-input bg-card focus-within:border-brand-600 focus-within:ring-brand-100 dark:focus-within:ring-brand-950 flex min-h-14 min-w-0 flex-1 items-center rounded-xl border px-4 transition-[border-color,box-shadow] focus-within:ring-4">
              <Search className="text-muted-foreground size-5 shrink-0" />
              <label htmlFor="talent-directory-search" className="sr-only">
                Search professionals
              </label>
              <input
                id="talent-directory-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by role, skill, or location"
                className="placeholder:text-muted-foreground min-w-0 flex-1 appearance-none bg-transparent px-3 text-base outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-ring grid size-10 shrink-0 place-items-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              aria-label="Toggle talent filters"
              onClick={() => setFiltersOpen((value) => !value)}
              aria-expanded={filtersOpen}
              className={`${workspaceStyles.secondaryAction} min-h-14 shrink-0 rounded-xl px-4 lg:hidden`}
            >
              <SlidersHorizontal className="size-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-brand-600 grid size-5 place-items-center rounded-full text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </form>

          <div className="mt-2 flex flex-wrap items-center gap-x-1 text-sm">
            <span className="text-muted-foreground mr-1">Popular:</span>
            {popularSearches.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setQuery(item)}
                className="text-foreground hover:text-brand-700 focus-visible:outline-ring min-h-11 rounded-lg px-2 font-medium underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-1"
              >
                {item}
              </button>
            ))}
          </div>
        </search>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:sticky lg:top-24 lg:block`}>
          <section className="border-border bg-card shadow-card overflow-hidden rounded-2xl border">
            <header className="border-border flex items-center justify-between border-b p-5">
              <div>
                <h2 className="font-display text-lg font-semibold">Filters</h2>
                <p className="text-muted-foreground mt-0.5 text-xs">Refine your shortlist</p>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-brand-700 hover:bg-brand-50 min-h-9 rounded-full px-3 text-xs font-semibold"
                >
                  Reset
                </button>
              )}
            </header>
            <div className="space-y-5 p-5">
              <FilterSelect
                label="Hourly rate"
                icon={Banknote}
                value={rate}
                onValueChange={setRate}
                options={rateOptions}
              />
              <FilterSelect
                label="Availability"
                icon={Clock3}
                value={availability}
                onValueChange={setAvailability}
                options={availabilityOptions}
              />
              <FilterSelect
                label="Location"
                icon={MapPin}
                value={location}
                onValueChange={setLocation}
                options={locationOptions}
              />
            </div>
          </section>
        </aside>

        <section className="min-w-0 space-y-5" aria-label="Talent results">
          <section aria-labelledby="expertise-heading">
            <div className="mb-3">
              <h2 id="expertise-heading" className="text-sm font-semibold">
                Browse by expertise
              </h2>
              <p className="text-muted-foreground mt-0.5 text-xs">Start with a discipline, then refine.</p>
            </div>
            <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Talent specialties">
              {specialties.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSpecialty(item)}
                  className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${
                    specialty === item
                      ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                      : "border-border bg-card text-muted-foreground hover:border-brand-200 hover:text-foreground"
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </section>

          <div className="border-border flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-display text-foreground text-2xl font-semibold">
                {query ? `Results for “${query}”` : "Recommended for you"}
              </p>
              <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                <BriefcaseBusiness className="size-4" />
                <strong className="text-foreground">{results.length}</strong>
                reviewed professionals
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ArrowDownWideNarrow className="text-muted-foreground size-4" />
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger
                  aria-label="Sort talent"
                  className="border-border bg-card shadow-card h-11 min-w-40 rounded-xl px-3.5 font-semibold"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="best-match">Best match</SelectItem>
                  <SelectItem value="highest-rated">Highest rated</SelectItem>
                  <SelectItem value="lowest-rate">Lowest rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((freelancer, index) => (
                <FreelancerCard key={freelancer.id} freelancer={freelancer} featured={index === 0} />
              ))}
            </div>
          ) : (
            <div className="border-border bg-card grid min-h-80 place-items-center rounded-2xl border border-dashed p-8 text-center">
              <div>
                <span className="bg-muted text-muted-foreground mx-auto grid size-12 place-items-center rounded-full">
                  <Filter className="size-5" />
                </span>
                <h2 className="font-display mt-4 text-xl font-semibold">No matching profiles</h2>
                <p className="text-muted-foreground mt-2 text-sm">Try a broader skill or remove a filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSpecialty("All talent");
                    resetFilters();
                  }}
                  className={`${workspaceStyles.primaryAction} mt-5`}
                >
                  Reset search
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  icon: Icon,
  value,
  onValueChange,
  options,
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <span className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-semibold">
        <Icon className="text-brand-600 size-3.5" /> {label}
      </span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger aria-label={label} className="bg-background h-12 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
