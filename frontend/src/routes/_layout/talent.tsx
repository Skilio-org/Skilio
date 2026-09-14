import { createFileRoute } from "@tanstack/react-router"
import {
  ArrowDownWideNarrow,
  Banknote,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  WorkspacePageHeader,
  workspaceStyles,
} from "@/components/dashboard/dashboard-header"
import { FreelancerCard } from "@/components/talent/freelancer-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { freelancers } from "@/data/freelancers"
import { useSavedTalent } from "@/hooks/useSavedTalent"

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
  { value: "50-100", label: "$50–$99/hr" },
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
  Design: ["designer", "product design", "figma", "ux research"],
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
  const navigate = Route.useNavigate()
  const [query, setQuery] = useState(q ?? "")
  useEffect(() => setQuery(q ?? ""), [q])
  const { savedIds, toggleSaved } = useSavedTalent()
  const [savedOnly, setSavedOnly] = useState(false)
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
        (rate === "50-100" && person.rate >= 50 && person.rate < 100) ||
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
        matchesLocation &&
        (!savedOnly || savedIds.includes(person.id))
      )
    })

    return filtered.sort((first, second) => {
      if (sort === "highest-rated") return second.rating - first.rating
      if (sort === "lowest-rate") return first.rate - second.rate
      return (
        second.successRate - first.successRate || second.rating - first.rating
      )
    })
  }, [
    availability,
    location,
    query,
    rate,
    sort,
    specialty,
    savedOnly,
    savedIds,
  ])

  const resetFilters = () => {
    setRate("any")
    setAvailability("any")
    setLocation("worldwide")
  }

  const clearAll = () => {
    setQuery("")
    setSpecialty("All talent")
    setSavedOnly(false)
    resetFilters()
    void navigate({ search: { q: undefined }, replace: true })
  }
  const hasFilters =
    !!query || specialty !== "All talent" || activeFilterCount > 0 || savedOnly
  const filterFields = (group: string) => (
    <div className="space-y-7">
      <fieldset>
        <legend className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Banknote className="text-muted-foreground size-4" />
          Hourly rate
        </legend>
        <div className="space-y-1">
          {rateOptions.map((option) => (
            <label
              key={option.value}
              className="hover:bg-muted flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm"
            >
              <input
                type="radio"
                name={group}
                value={option.value}
                checked={rate === option.value}
                onChange={() => setRate(option.value)}
                className="accent-primary size-4"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
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
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={resetFilters}
          className="text-primary min-h-11 text-sm font-medium hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
  return (
    <div className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Find talent"
        title="Good people for your next project."
        description="Explore experience, compare skills, and find someone you’d like to work with."
      />
      <search className="block">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void navigate({
              search: { q: query.trim() || undefined },
              replace: true,
            })
          }}
          className="flex gap-2"
        >
          <label className="border-input bg-card focus-within:border-primary focus-within:ring-primary/10 flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl border px-4 focus-within:ring-2">
            <Search className="text-muted-foreground size-5 shrink-0" />
            <span className="sr-only">Search professionals</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try a role, skill, or name"
              className="min-w-0 flex-1 bg-transparent text-base outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  void navigate({ search: { q: undefined }, replace: true })
                }}
                aria-label="Clear search"
                className="text-muted-foreground hover:bg-muted grid size-10 shrink-0 place-items-center rounded-lg"
              >
                <X className="size-4" />
              </button>
            )}
          </label>
          <button
            type="submit"
            className="bg-primary text-primary-foreground hidden min-h-14 rounded-xl px-7 text-sm font-medium hover:opacity-90 sm:block"
          >
            Search
          </button>
          <button
            type="button"
            aria-label="Open talent filters"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen(true)}
            className="border-border bg-card relative grid min-h-14 w-14 shrink-0 place-items-center rounded-xl border lg:hidden"
          >
            <SlidersHorizontal className="size-5" />
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground absolute top-1 right-1 rounded-full px-1.5 text-[10px]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </form>
        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 text-xs">
          <span>Try:</span>
          {popularSearches.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setQuery(item)
                void navigate({ search: { q: item }, replace: true })
              }}
              className="text-foreground decoration-border hover:text-primary min-h-11 font-medium underline underline-offset-4"
            >
              {item}
            </button>
          ))}
        </div>
      </search>
      <nav
        aria-label="Talent specialties"
        className="border-border flex gap-5 overflow-x-auto border-b sm:gap-7"
      >
        {specialties.map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={specialty === item}
            onClick={() => setSpecialty(item)}
            className={`min-h-12 shrink-0 border-b-2 px-1 text-sm font-medium transition-colors ${specialty === item ? "border-primary text-primary" : "text-muted-foreground hover:text-foreground border-transparent"}`}
          >
            {item}
          </button>
        ))}
      </nav>
      <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside
          aria-label="Talent filters"
          className="sticky top-24 hidden lg:block"
        >
          <h2 className="mb-6 text-base font-semibold">Refine your search</h2>
          {filterFields("desktop-rate")}
          <p className="border-border text-muted-foreground mt-7 border-t pt-5 text-xs leading-6">
            Demo directory. Profiles, reviews, and rates are sample data.
          </p>
        </aside>
        <section aria-label="Talent results" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p role="status" className="text-muted-foreground text-sm">
              <strong className="text-foreground font-semibold">
                {results.length}
              </strong>{" "}
              {results.length === 1 ? "professional" : "professionals"}
              {query ? ` matching “${query}”` : " to explore"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger
                  aria-label="Sort talent"
                  className="border-border bg-card h-11 w-44 rounded-lg text-xs"
                >
                  <ArrowDownWideNarrow className="text-muted-foreground size-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="best-match">Recommended</SelectItem>
                  <SelectItem value="highest-rated">Highest rated</SelectItem>
                  <SelectItem value="lowest-rate">Lowest rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {hasFilters && (
            <div className="mb-4 flex flex-wrap gap-2">
              {specialty !== "All talent" && (
                <FilterChip
                  label={specialty}
                  onRemove={() => setSpecialty("All talent")}
                />
              )}
              {rate !== "any" && (
                <FilterChip
                  label={
                    rateOptions.find((option) => option.value === rate)
                      ?.label ?? rate
                  }
                  onRemove={() => setRate("any")}
                />
              )}
              {availability !== "any" && (
                <FilterChip
                  label={
                    availabilityOptions.find(
                      (option) => option.value === availability,
                    )?.label ?? availability
                  }
                  onRemove={() => setAvailability("any")}
                />
              )}
              {location !== "worldwide" && (
                <FilterChip
                  label={
                    locationOptions.find((option) => option.value === location)
                      ?.label ?? location
                  }
                  onRemove={() => setLocation("worldwide")}
                />
              )}
              <button
                type="button"
                onClick={clearAll}
                className="text-primary min-h-9 px-2 text-xs font-medium hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
          {results.length ? (
            <div className="divide-border border-border divide-y overflow-hidden rounded-xl border">
              {results.map((person) => (
                <FreelancerCard
                  key={person.id}
                  freelancer={person}
                  saved={savedIds.includes(person.id)}
                  onToggleSaved={() => toggleSaved(person.id)}
                />
              ))}
            </div>
          ) : (
            <div className="border-border bg-card rounded-xl border px-6 py-16 text-center">
              <Search className="text-muted-foreground mx-auto size-7" />
              <h2 className="mt-5 text-xl font-medium tracking-tight">
                {savedOnly && !savedIds.length
                  ? "Start your shortlist"
                  : "No matching profiles"}
              </h2>
              <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-6">
                {savedOnly && !savedIds.length
                  ? "Use the bookmark on a profile to add it to Saved talent."
                  : "Try a broader skill, another location, or a different hourly rate."}
              </p>
              <button
                type="button"
                onClick={clearAll}
                className={`${workspaceStyles.secondaryAction} mt-6`}
              >
                Browse all talent
              </button>
            </div>
          )}
        </section>
      </div>
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 sm:max-w-sm"
        >
          <SheetHeader className="border-border border-b">
            <SheetTitle>Refine your search</SheetTitle>
            <SheetDescription>
              Choose the experience, rate, and availability you need.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {filtersOpen && filterFields("mobile-rate")}
          </div>
          <div className="border-border border-t p-5">
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className={`${workspaceStyles.primaryAction} w-full`}
            >
              Show {results.length}{" "}
              {results.length === 1 ? "professional" : "professionals"}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${label} filter`}
      className="bg-accent text-accent-foreground inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-xs"
    >
      {label}
      <X className="size-3" />
    </button>
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
  icon: typeof MapPin
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <span className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-semibold">
        <Icon className="text-brand-600 size-3.5" /> {label}
      </span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          aria-label={label}
          className="bg-card h-12 w-full rounded-lg"
        >
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
