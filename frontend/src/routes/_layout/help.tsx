import { createFileRoute } from "@tanstack/react-router"
import {
  ChevronDown,
  CircleHelp,
  Mail,
  Search,
  ShieldCheck,
} from "lucide-react"
import { useMemo, useState } from "react"

import { workspaceStyles } from "@/components/Common/WorkspaceUI"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export const Route = createFileRoute("/_layout/help")({
  component: HelpCenter,
  head: () => ({ meta: [{ title: "Help center | Freelancer" }] }),
})

const categories = [
  {
    title: "Finding talent",
    copy: "Search, filters, profiles, and shortlists.",
    articles: [
      "Build a shortlist from profile cards",
      "Compare availability, rate, and success signals",
      "Use search filters without losing context",
    ],
  },
  {
    title: "Messages",
    copy: "Starting and managing conversations.",
    articles: [
      "Start a conversation from a profile",
      "Send a useful first brief",
      "Keep profile context visible while messaging",
    ],
  },
  {
    title: "Account & safety",
    copy: "Settings, privacy, and secure use.",
    articles: [
      "Update your client profile",
      "Manage notification and privacy settings",
      "Recognize verified professional signals",
    ],
  },
]

const commonQuestions = [
  {
    question: "How do I save a freelancer to my shortlist?",
    answer:
      "Use the bookmark control on any talent card or profile. In Saved talent, you can place the professional in a focused list, move them later, or select several people for comparison.",
  },
  {
    question: "Can I message a freelancer before making a decision?",
    answer:
      "Yes. Open a profile or a saved-talent card and choose Message. You can share context, attach a brief, and keep the freelancer’s profile details visible while you talk.",
  },
  {
    question: "How are profiles and reviews verified?",
    answer:
      "Reviewed profiles show an identity badge and verified work signals. Ratings, completed projects, availability, and response time are displayed together so you can evaluate the full picture.",
  },
  {
    question: "How do I update my client information?",
    answer:
      "Open Client profile from your account menu. Add your role, company context, location, and a short description so professionals understand who they would be collaborating with.",
  },
]

function HelpCenter() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].title)
  const [trustOpen, setTrustOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selectedArticles = useMemo(
    () =>
      categories.find((category) => category.title === selectedCategory)
        ?.articles ?? [],
    [selectedCategory],
  )
  const matchingArticles = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return []

    return categories.flatMap((category) =>
      category.articles
        .filter((article) =>
          `${category.title} ${category.copy} ${article}`
            .toLowerCase()
            .includes(search),
        )
        .map((article) => ({ article, category: category.title })),
    )
  }, [query])

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-slate-950 px-5 py-14 text-center text-white shadow-card sm:px-10 sm:py-16">
        <CircleHelp className="mx-auto size-7 text-brand-300" />
        <p className="mt-5 text-sm font-semibold text-brand-300">Help center</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-5xl">
          How can we help?
        </h1>
        <div className="mx-auto mt-7 flex min-h-13 max-w-xl items-center rounded-xl bg-white px-4 text-slate-950">
          <Search className="size-5 text-slate-400" />
          <input
            aria-label="Search help articles"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the help center"
            className="min-w-0 flex-1 bg-transparent px-3 text-base outline-none md:text-sm"
          />
        </div>
      </section>

      {query.trim() && (
        <section aria-live="polite">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-brand-700">
                Search results
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold">
                Help for “{query.trim()}”
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="self-start text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Clear search
            </button>
          </div>
          {matchingArticles.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {matchingArticles.map(({ article, category }) => (
                <article
                  key={`${category}-${article}`}
                  className="rounded-2xl border border-border bg-card p-5 shadow-card"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
                    {category}
                  </p>
                  <h3 className="mt-2 font-display text-base font-semibold">
                    {article}
                  </h3>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-border bg-card p-7 text-center">
              <h3 className="font-display text-lg font-semibold">
                No matching help articles
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try “messages”, “profile”, “privacy”, or “shortlist”.
              </p>
            </div>
          )}
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        {categories.map(({ title, copy }) => (
          <article
            key={title}
            className={`rounded-2xl border bg-card p-6 shadow-card transition ${
              selectedCategory === title
                ? "border-brand-300 ring-4 ring-brand-100"
                : "border-border"
            }`}
          >
            <h2 className="font-display text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy}
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory(title)}
              className="mt-5 min-h-11 text-sm font-semibold text-brand-700"
            >
              {selectedCategory === title
                ? "Showing articles"
                : "Browse articles"}
            </button>
          </article>
        ))}
      </section>
      <section>
        <p className="text-sm font-semibold text-brand-700">Common questions</p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">
          Quick answers
        </h2>
        <div className="mt-6 border-t border-border">
          <div className="border-b border-border py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {selectedCategory}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {selectedArticles.map((article) => (
                <div
                  key={article}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold"
                >
                  {article}
                </div>
              ))}
            </div>
          </div>
          {commonQuestions.map(({ question, answer }) => (
            <details key={question} className="group border-b border-border">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold">
                {question}
                <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
              </summary>
              <p className="max-w-3xl pb-5 text-sm leading-7 text-muted-foreground">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>
      <section className="grid gap-5 rounded-2xl border border-border bg-card p-6 shadow-card sm:grid-cols-2 sm:p-8">
        <div className="flex gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
            <Mail className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">
              Contact support
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Get help from our support team.
            </p>
            <a
              href="mailto:support@freelancer.com"
              className={`${workspaceStyles.secondaryAction} mt-4`}
            >
              Email support
            </a>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">
              Trust & safety
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Report suspicious activity or learn how we protect the platform.
            </p>
            <button
              type="button"
              onClick={() => setTrustOpen(true)}
              className={`${workspaceStyles.secondaryAction} mt-4`}
            >
              Visit trust center
            </button>
          </div>
        </div>
      </section>

      <Dialog open={trustOpen} onOpenChange={setTrustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trust & safety center</DialogTitle>
            <DialogDescription>
              Review the safety signals clients should expect before starting a
              conversation with independent talent.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {[
              "Verified identity and reviewed work history",
              "Clear profile information before messaging",
              "Shortlist-first workflow for careful comparison",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-border bg-background p-4"
              >
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <p className="text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
