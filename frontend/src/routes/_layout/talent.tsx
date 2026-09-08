import { createFileRoute } from "@tanstack/react-router"
import {
  ArrowDownWideNarrow,
  Banknote,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Filter,
  type LucideIcon,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react"
import { useMemo, useState } from "react"

import { workspaceStyles } from "@/components/Common/WorkspaceUI"
import { FreelancerCard } from "@/components/Talent/FreelancerCard"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { freelancers } from "@/data/freelancers"

export const Route = createFileRoute("/_layout/talent")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: TalentDirectory,
  head: () => ({ meta: [{ title: "Find talent | Freelancer" }] }),
})

const specialties = [
  "All talent",
  "Development",
  "Design",
  "Marketing",
  "AI services",
] as const

const popularSearches = ["Product designer", "React developer", "AI engineer"]

const rateOptions = [
  { value: "any", label: "Any hourly rate" },
  { value: "under-50", label: "Under $50/hr" },
  { value: "50-100", label: "$50–$100/hr" },
  { value: "100-plus", label: "$100+/hr" },
]

const availabilityOptions = [
  { value: "any", label: "Any availability" },
  { value: "now", label: "Available now" },
  { value: "week", label: "Available this week" },
  { value: "next-week", label: "Available next week" },
]

const locationOptions = [
  { value: "worldwide", label: "Worldwide" },
  { value: "europe", label: "Europe" },
  { value: "north-america", label: "North America" },
  { value: "asia-pacific", label: "Asia Pacific" },
]

const specialtyTerms: Record<(typeof specialties)[number], string[]> = {
  "All talent": [],
  Development: ["engineer", "developer", "react", "typescript", "node.js"],
  Design: ["designer", "design", "figma", "ux"],
  Marketing: ["marketing", "brand", "growth", "seo", "positioning"],
  "AI services": ["ai", "automation", "llm", "rag", "python"],
}

const searchAliases: Record<string, string[]> = {
  developer: ["developer", "engineer"],
  engineer: ["engineer", "developer"],
  designer: ["designer", "design"],
  design: ["design", "designer"],
  ai: ["ai", "llm", "automation"],
}

function TalentDirectory() {
  const { q } = Route.useSearch()
  const [query, setQuery] = useState(q ?? "")
  const [specialty, setSpecialty] =
    useState<(typeof specialties)[number]>("All talent")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [rate, setRate] = useState("any")
  const [availability, setAvailability] = useState("any")
  const [location, setLocation] = useState("worldwide")
  const [sort, setSort] = useState("best-match")

  const activeFilterCount = [
    rate !== "any",
    availability !== "any",
    location !== "worldwide",
  ].filter(Boolean).length

  const results = useMemo(() => {
    const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
    const expertiseTerms = specialtyTerms[specialty]

    const filtered = freelancers.filter((person) => {
      const haystack = [
        person.name,
        person.title,
        person.location,
        person.bio,
        ...person.skills,
      ]
        .join(" ")
        .toLowerCase()

      const matchesSearch =
        searchTerms.length === 0 ||
        searchTerms.every((term) =>
          (searchAliases[term] ?? [term]).some((candidate) =>
            haystack.includes(candidate),
          ),
        )
      const matchesSpecialty =
        expertiseTerms.length === 0 ||
        expertiseTerms.some((term) => haystack.includes(term))
      const matchesRate =
        rate === "any" ||
        (rate === "under-50" && person.rate < 50) ||
        (rate === "50-100" && person.rate >= 50 && person.rate <= 100) ||
        (rate === "100-plus" && person.rate >= 100)
      const matchesAvailability =
        availability === "any" ||
        (availability === "now" && person.availability === "Available now") ||
        (availability === "week" &&
          person.availability === "Available this week") ||
        (availability === "next-week" &&
          person.availability === "Available next week")
      const matchesLocation =
        location === "worldwide" ||
        (location === "europe" &&
          ["France", "Portugal", "United Kingdom"].some((country) =>
            person.location.includes(country),
          )) ||
        (location === "north-america" &&
          ["Canada", "United States"].some((country) =>
            person.location.includes(country),
          )) ||
        (location === "asia-pacific" && person.location === "Singapore")

      return (
        matchesSearch &&
        matchesSpecialty &&
        matchesRate &&
        matchesAvailability &&
        matchesLocation
      )
    })

    return filtered.sort((first, second) => {
      if (sort === "highest-rated") return second.rating - first.rating
      if (sort === "lowest-rate") return first.rate - second.rate
      return (
        second.successRate - first.successRate || second.rating - first.rating
      )
    })
  }, [availability, location, query, rate, sort, specialty])

  const resetFilters = () => {
    setRate("any")
    setAvailability("any")
    setLocation("worldwide")
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-border bg-card p-5 shadow-card sm:p-8 lg:p-10">
        <div className="absolute -right-20 -top-28 size-80 rounded-full border-[42px] border-brand-50 dark:border-brand-950/35" />
        <div className="absolute right-36 top-10 size-16 rounded-full bg-emerald-50 blur-2xl dark:bg-emerald-950/40" />
        <div className="relative">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-sm font-semibold text-brand-700">
                <Sparkles className="size-4" /> Curated independent talent
              </p>
              <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Who do you need to move the work forward?
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Search reviewed professionals by skill, outcome, or location—and
                start a conversation directly.
              </p>
            </div>
            <div className="hidden items-center gap-3 rounded-2xl border border-border bg-background/80 p-4 backdrop-blur-sm sm:flex">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/45">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Every profile reviewed</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Quality before quantity
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={(event) => event.preventDefault()}
            className="mt-7 flex gap-2 rounded-2xl border border-border bg-background p-2 shadow-floating"
          >
            <label className="flex min-h-13 min-w-0 flex-1 items-center px-3">
              <Search className="size-5 shrink-0 text-brand-600" />
              <span className="sr-only">Search professionals</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a role, skill, or location"
                className="min-w-0 flex-1 appearance-none bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </label>
            <button
              type="button"
              aria-label="Toggle talent filters"
              onClick={() => setFiltersOpen((value) => !value)}
              aria-expanded={filtersOpen}
              className={`${workspaceStyles.secondaryAction} min-h-13 shrink-0 px-4 lg:hidden`}
            >
              <SlidersHorizontal className="size-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-brand-600 text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Popular:</span>
            {popularSearches.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setQuery(item)}
                className="min-h-8 rounded-full border border-border bg-card px-3 font-medium text-muted-foreground transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          className={`${filtersOpen ? "block" : "hidden"} lg:sticky lg:top-24 lg:block`}
        >
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <header className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h2 className="font-display text-lg font-semibold">Filters</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Refine your shortlist
                </p>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="min-h-9 rounded-full px-3 text-xs font-semibold text-brand-700 hover:bg-brand-50"
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
            <div className="border-t border-border bg-muted/30 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <p className="text-xs leading-5 text-muted-foreground">
                  All displayed professionals have completed profile and
                  identity review.
                </p>
              </div>
            </div>
          </section>
        </aside>

        <section className="min-w-0 space-y-5" aria-label="Talent results">
          <section aria-labelledby="expertise-heading">
            <div className="mb-3">
              <h2 id="expertise-heading" className="text-sm font-semibold">
                Browse by expertise
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Start with a discipline, then refine.
              </p>
            </div>
            <nav
              className="flex gap-2 overflow-x-auto pb-1"
              aria-label="Talent specialties"
            >
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

          <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-display text-2xl font-semibold text-foreground">
                {query ? `Results for “${query}”` : "Recommended for you"}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <BriefcaseBusiness className="size-4" />
                <strong className="text-foreground">{results.length}</strong>
                reviewed professionals
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ArrowDownWideNarrow className="size-4 text-muted-foreground" />
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger
                  aria-label="Sort talent"
                  className="h-11 min-w-40 rounded-xl border-border bg-card px-3.5 font-semibold shadow-card"
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
                <FreelancerCard
                  key={freelancer.id}
                  freelancer={freelancer}
                  featured={index === 0}
                />
              ))}
            </div>
          ) : (
            <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <div>
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                  <Filter className="size-5" />
                </span>
                <h2 className="mt-4 font-display text-xl font-semibold">
                  No matching profiles
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a broader skill or remove a filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    setSpecialty("All talent")
                    resetFilters()
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
  )
}

function FilterSelect({
  label,
  icon: Icon,
  value,
  onValueChange,
  options,
}: {
  label: string
  icon: LucideIcon
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Icon className="size-3.5 text-brand-600" /> {label}
      </span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger aria-label={label} className="h-12 w-full bg-background">
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
  )
}
