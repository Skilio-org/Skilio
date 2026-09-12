import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  Clock3,
  Eye,
  MapPin,
  MessageSquare,
  Search,
  Star,
  Users,
} from "lucide-react"
import { useState } from "react"

import {
  Monogram,
  SkillTag,
  WorkspacePageHeader,
  WorkspaceSurface,
  workspaceStyles,
} from "@/components/Common/WorkspaceUI"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Overview | Freelancer" }] }),
})

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
]

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [savedMatchIds, setSavedMatchIds] = useState<Set<string>>(new Set())
  const firstName = user?.full_name?.trim().split(/\s+/)[0]

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = String(
      new FormData(event.currentTarget).get("q") ?? "",
    ).trim()
    navigate({ to: "/talent", search: { q: query || undefined } })
  }

  return (
    <div className="space-y-8">
      <WorkspacePageHeader
        eyebrow="Overview"
        title={
          firstName
            ? `Good to see you, ${firstName}.`
            : "Find your next collaborator."
        }
        description="Continue your search or review professionals selected for you."
        action={
          <Link
            to="/client-profile"
            className={workspaceStyles.secondaryAction}
          >
            Complete client profile <ArrowRight className="size-4" />
          </Link>
        }
      />

      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className={`${workspaceStyles.inputShell} min-w-0 flex-1`}>
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <label htmlFor="dashboard-search" className="sr-only">
              Search talent
            </label>
            <input
              id="dashboard-search"
              name="q"
              type="search"
              placeholder="Search by role, skill, or expertise"
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base outline-none placeholder:text-muted-foreground md:text-sm"
            />
          </div>
          <button
            type="submit"
            className={`${workspaceStyles.primaryAction} min-h-12 px-6`}
          >
            Search talent <ArrowRight className="size-4" />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="mr-1 py-1.5">Popular:</span>
          {["Product designer", "React developer", "AI engineer"].map(
            (query) => (
              <Link
                key={query}
                to="/talent"
                search={{ q: query }}
                className="rounded-full border border-border bg-muted/60 px-3 py-1.5 transition-colors hover:border-brand-300 hover:text-brand-700"
              >
                {query}
              </Link>
            ),
          )}
        </div>
      </form>

      <section
        aria-label="Workspace summary"
        className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-card sm:grid-cols-3"
      >
        {[
          {
            icon: Bookmark,
            value: "5",
            label: "Saved profiles",
            detail: "2 shortlisted this week",
          },
          {
            icon: Eye,
            value: "28",
            label: "Profiles viewed",
            detail: "Across 6 disciplines",
          },
          {
            icon: MessageSquare,
            value: "4",
            label: "Conversations",
            detail: "2 awaiting a reply",
          },
        ].map((item) => (
          <article
            key={item.label}
            className="border-b border-border p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:p-6 sm:last:border-r-0"
          >
            <div className="flex items-start justify-between">
              <item.icon className="size-5 text-brand-600" />
              <span className="font-display text-3xl font-medium tracking-tight">
                {item.value}
              </span>
            </div>
            <p className="mt-7 font-semibold">{item.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
            <div>
              <p className="text-sm font-semibold text-brand-700">
                Recommended for you
              </p>
              <h2 className="mt-1 font-display text-2xl font-medium tracking-tight">
                Strong matches for your search
              </h2>
            </div>
            <Link
              to="/talent"
              search={{ q: undefined }}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {matches.map((person) => (
              <article
                key={person.name}
                className="p-5 transition-colors hover:bg-muted/35 sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <Monogram className={`size-14 text-lg ${person.style}`}>
                    {person.initials}
                  </Monogram>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <Link
                          to="/talent/$freelancerId"
                          params={{ freelancerId: person.id }}
                          search={{ q: undefined }}
                          className="flex items-center gap-1.5 font-display text-lg font-semibold hover:text-brand-700"
                        >
                          {person.name}
                          <BadgeCheck
                            className="size-4 text-brand-600"
                            aria-label="Verified"
                          />
                        </Link>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {person.role}
                        </p>
                      </div>
                      <p className="font-semibold">{person.rate}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <strong className="text-foreground">
                          {person.rating}
                        </strong>
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
                    aria-label={`Save ${person.name}`}
                    aria-pressed={savedMatchIds.has(person.id)}
                    onClick={() =>
                      setSavedMatchIds((current) => {
                        const next = new Set(current)
                        if (next.has(person.id)) {
                          next.delete(person.id)
                        } else {
                          next.add(person.id)
                        }
                        return next
                      })
                    }
                    className={workspaceStyles.iconButton}
                  >
                    <Bookmark
                      className={`size-4 ${
                        savedMatchIds.has(person.id) ? "fill-current" : ""
                      }`}
                    />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <WorkspaceSurface className="p-6">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-full bg-brand-50 text-brand-700">
                <Users className="size-5" />
              </span>
              <span className="text-sm font-semibold text-brand-700">
                3 of 5
              </span>
            </div>
            <h2 className="mt-6 font-display text-xl font-semibold">
              Build your first shortlist
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Save a few strong profiles, then compare their skills and
              experience side by side.
            </p>
            <div className="mt-5 h-1.5 bg-muted">
              <div className="h-full w-3/5 bg-brand-600" />
            </div>
            <Link
              to="/talent"
              search={{ q: undefined }}
              className={`${workspaceStyles.secondaryAction} mt-6 w-full justify-between`}
            >
              Continue exploring <ArrowRight className="size-4" />
            </Link>
          </WorkspaceSurface>

          <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-card">
            <Clock3 className="size-5 text-brand-300" />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Saved search
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold">
              Senior product designers
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              18 new matching profiles since your last visit.
            </p>
            <Link
              to="/talent"
              search={{ q: undefined }}
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white hover:text-brand-200"
            >
              Review matches <ArrowRight className="size-4" />
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}
