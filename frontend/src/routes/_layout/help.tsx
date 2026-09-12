import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, CircleHelp, Mail, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { workspaceStyles } from "@/components/dashboard/dashboard-header";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_layout/help")({
  component: HelpCenter,
  head: () => ({ meta: [{ title: "Help center | Freelancer" }] }),
});

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
];

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
];

function HelpCenter() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].title);
  const [trustOpen, setTrustOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedArticles = useMemo(
    () => categories.find((category) => category.title === selectedCategory)?.articles ?? [],
    [selectedCategory],
  );
  const matchingArticles = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return [];

    return categories.flatMap((category) =>
      category.articles
        .filter((article) => `${category.title} ${category.copy} ${article}`.toLowerCase().includes(search))
        .map((article) => ({ article, category: category.title })),
    );
  }, [query]);

  return (
    <div className="space-y-10">
      <section className="shadow-card rounded-2xl bg-slate-950 px-5 py-14 text-center text-white sm:px-10 sm:py-16">
        <CircleHelp className="text-brand-300 mx-auto size-7" />
        <p className="text-brand-300 mt-5 text-sm font-semibold">Help center</p>
        <h1 className="font-display mt-2 text-3xl font-medium tracking-tight sm:text-5xl">How can we help?</h1>
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
              <p className="text-brand-700 text-sm font-semibold">Search results</p>
              <h2 className="font-display mt-1 text-2xl font-semibold">Help for “{query.trim()}”</h2>
            </div>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-brand-700 hover:text-brand-800 self-start text-sm font-semibold"
            >
              Clear search
            </button>
          </div>
          {matchingArticles.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {matchingArticles.map(({ article, category }) => (
                <article
                  key={`${category}-${article}`}
                  className="border-border bg-card shadow-card rounded-2xl border p-5"
                >
                  <p className="text-brand-700 text-xs font-semibold tracking-[0.12em] uppercase">{category}</p>
                  <h3 className="font-display mt-2 text-base font-semibold">{article}</h3>
                </article>
              ))}
            </div>
          ) : (
            <div className="border-border bg-card mt-5 rounded-2xl border border-dashed p-7 text-center">
              <h3 className="font-display text-lg font-semibold">No matching help articles</h3>
              <p className="text-muted-foreground mt-1 text-sm">
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
            className={`bg-card shadow-card rounded-2xl border p-6 transition ${
              selectedCategory === title ? "border-brand-300 ring-brand-100 ring-4" : "border-border"
            }`}
          >
            <h2 className="font-display text-lg font-semibold">{title}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">{copy}</p>
            <button
              type="button"
              onClick={() => setSelectedCategory(title)}
              className="text-brand-700 mt-5 min-h-11 text-sm font-semibold"
            >
              {selectedCategory === title ? "Showing articles" : "Browse articles"}
            </button>
          </article>
        ))}
      </section>
      <section>
        <p className="text-brand-700 text-sm font-semibold">Common questions</p>
        <h2 className="font-display mt-2 text-3xl font-medium tracking-tight">Quick answers</h2>
        <div className="border-border mt-6 border-t">
          <div className="border-border border-b py-5">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
              {selectedCategory}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {selectedArticles.map((article) => (
                <div key={article} className="border-border bg-card rounded-xl border px-4 py-3 text-sm font-semibold">
                  {article}
                </div>
              ))}
            </div>
          </div>
          {commonQuestions.map(({ question, answer }) => (
            <details key={question} className="group border-border border-b">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold">
                {question}
                <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
              </summary>
              <p className="text-muted-foreground max-w-3xl pb-5 text-sm leading-7">{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="border-border bg-card shadow-card grid gap-5 rounded-2xl border p-6 sm:grid-cols-2 sm:p-8">
        <div className="flex gap-4">
          <span className="bg-brand-50 text-brand-700 grid size-11 shrink-0 place-items-center rounded-full">
            <Mail className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">Contact support</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">Get help from our support team.</p>
            <a href="mailto:support@freelancer.com" className={`${workspaceStyles.secondaryAction} mt-4`}>
              Email support
            </a>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">Trust & safety</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
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
              Review the safety signals clients should expect before starting a conversation with independent talent.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {[
              "Verified identity and reviewed work history",
              "Clear profile information before messaging",
              "Shortlist-first workflow for careful comparison",
            ].map((item) => (
              <div key={item} className="border-border bg-background flex items-start gap-3 rounded-xl border p-4">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <p className="text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
