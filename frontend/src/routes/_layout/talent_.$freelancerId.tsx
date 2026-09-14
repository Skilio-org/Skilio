import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Bookmark, Check, Clock3, FileText, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { Monogram, SkillTag, workspaceStyles } from "@/components/dashboard/dashboard-header";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getFreelancer } from "@/data/freelancers";
import { useSavedTalent } from "@/hooks/useSavedTalent";

export const Route = createFileRoute("/_layout/talent_/$freelancerId")({
  loader: ({ params }) => {
    const freelancer = getFreelancer(params.freelancerId);
    if (!freelancer) throw notFound();
    return freelancer;
  },
  component: FreelancerProfile,
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.name ?? "Profile"} | Freelancer` }],
  }),
});

function FreelancerProfile() {
  const person = Route.useLoaderData();
  const firstName = person.name.split(" ")[0];
  const { savedIds, toggleSaved } = useSavedTalent();
  const saved = savedIds.includes(person.id);
  const [projectTitle, setProjectTitle] = useState<string | null>(null);
  const project = person.portfolio.find((entry) => entry.title === projectTitle);
  const heading = "text-xl font-semibold tracking-tight";
  const section = "scroll-mt-28 p-5 sm:p-8";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/talent"
          search={{ q: undefined }}
          className="text-muted-foreground hover:text-primary inline-flex min-h-11 items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="size-4" />
          Back to talent
        </Link>
      </div>
      <header className="border-border border-b pb-7 sm:pb-9">
        <div className="flex items-start gap-4 sm:gap-6">
          <Monogram className={`size-16 text-xl sm:size-24 sm:text-3xl ${person.background} ${person.foreground}`}>
            {person.initials}
          </Monogram>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground mb-2 text-xs font-medium">Independent professional</p>
            <h1 className="font-display text-3xl font-medium tracking-tight sm:text-[2.5rem]">{person.name}</h1>
            <p className="text-muted-foreground mt-2 text-base sm:text-lg">{person.title}</p>
            <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {person.location}
              </span>
              <span>{person.memberSince}</span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-3.5" />
                <strong className="font-semibold">{person.rating.toFixed(1)}</strong>
                <span className="text-muted-foreground">{person.reviews} reviews</span>
              </span>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground mt-6 max-w-3xl text-base leading-7">{person.bio}</p>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-8">
        <aside aria-label="Contact and availability" className="lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
          <section className="border-border bg-card rounded-xl border p-5 sm:p-6">
            <p className="text-sm font-medium">Work with {firstName}</p>
            <div className="mt-5 flex items-baseline gap-2">
              <p className="text-3xl font-semibold tracking-tight tabular-nums">${person.rate}</p>
              <span className="text-muted-foreground text-sm">USD / hour</span>
            </div>
            <p className="bg-accent text-accent-foreground mt-3 inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium">
              <Clock3 className="size-3.5" />
              {person.availability}
            </p>
            <div className="mt-5 grid gap-2">
              <Link to="/messages" search={{ with: person.id }} className={`${workspaceStyles.primaryAction} w-full`}>
                Message {firstName}
                <ArrowUpRight className="size-4" />
              </Link>
              <button
                type="button"
                onClick={() => toggleSaved(person.id)}
                aria-pressed={saved}
                className={`${workspaceStyles.secondaryAction} w-full`}
              >
                {saved ? <Check className="size-4" /> : <Bookmark className="size-4" />}
                {saved ? "Profile saved" : "Save profile"}
              </button>
            </div>
            <p className="text-muted-foreground mt-4 text-center text-xs leading-5">{person.responseTime}</p>
            {saved && (
              <p role="status" className="text-muted-foreground mt-2 text-center text-xs">
                Available in your Saved talent list.
              </p>
            )}
          </section>
        </aside>
        <article
          aria-label="Professional profile"
          className="border-border bg-card min-w-0 overflow-hidden rounded-xl border lg:col-start-1 lg:row-start-1"
        >
          <nav aria-label="Profile sections" className="border-border flex gap-6 overflow-x-auto border-b px-5 sm:px-8">
            {[
              ["about", "About"],
              ["selected-work", "Selected work"],
              ["background", "Background"],
              ["client-feedback", "Feedback"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-muted-foreground hover:text-primary inline-flex min-h-14 shrink-0 items-center text-sm font-medium"
              >
                {label}
              </a>
            ))}
          </nav>
          <section id="about" className={section}>
            <h2 className={heading}>About {firstName}</h2>
            <div className="text-muted-foreground mt-5 space-y-4 text-sm leading-7">
              {person.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <h3 className="mt-7 text-sm font-medium">Skills & expertise</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {person.skills.map((skill) => (
                <SkillTag key={skill}>{skill}</SkillTag>
              ))}
            </div>
          </section>
          <section id="selected-work" className={`${section} border-border border-t`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className={heading}>Selected work</h2>
              <span className="text-muted-foreground text-xs">{person.portfolio.length} sample projects</span>
            </div>
            <div className="mt-5 space-y-3">
              {person.portfolio.map((entry) => (
                <button
                  key={entry.title}
                  type="button"
                  aria-label={`View ${entry.title}`}
                  onClick={() => setProjectTitle(entry.title)}
                  className="group border-border hover:border-primary/40 hover:bg-muted/30 flex w-full items-center gap-4 rounded-xl border p-3 text-left transition-colors sm:p-4"
                >
                  <span
                    className={`grid size-14 shrink-0 place-items-center rounded-lg text-slate-800 sm:size-16 ${entry.color}`}
                  >
                    <FileText className="size-6" strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-medium tracking-tight">{entry.title}</span>
                    <span className="text-muted-foreground mt-1 block text-xs leading-5">{entry.category}</span>
                  </span>
                  <ArrowUpRight className="text-muted-foreground group-hover:text-primary mr-1 size-4 shrink-0" />
                </button>
              ))}
            </div>
          </section>
          <section id="background" className={`${section} border-border border-t`}>
            <h2 className={heading}>Background</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium">Languages</h3>
                <dl className="mt-3 space-y-3">
                  {person.languages.map((language) => (
                    <div key={language.name} className="flex justify-between gap-4 text-sm">
                      <dt className="text-muted-foreground">{language.name}</dt>
                      <dd>{language.level}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="sm:border-border sm:border-l sm:pl-6">
                <h3 className="text-sm font-medium">Education</h3>
                <p className="text-muted-foreground mt-3 text-sm leading-7">{person.education}</p>
              </div>
            </div>
          </section>
          <section id="client-feedback" className={`${section} border-border border-t`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className={heading}>Client feedback</h2>
              <p className="flex items-center gap-2 text-sm">
                <Star className="text-primary size-4" />
                <strong>{person.rating.toFixed(1)}</strong>
                <span className="text-muted-foreground">/ 5</span>
              </p>
            </div>
            <blockquote className="border-primary/40 mt-6 border-l-2 pl-5 text-base leading-7">
              “Thoughtful work, clear communication, and a practical approach from the first conversation through
              delivery.”
            </blockquote>
            <div className="mt-5 flex items-center gap-3">
              <Monogram className="bg-muted text-muted-foreground size-10 text-xs">AR</Monogram>
              <div>
                <p className="text-sm font-medium">Alex Rivera</p>
                <p className="text-muted-foreground mt-1 text-xs">Product lead · Sample review</p>
              </div>
            </div>
          </section>
        </article>
      </div>
      <Dialog
        open={!!project}
        onOpenChange={(open) => {
          if (!open) setProjectTitle(null);
        }}
      >
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <p className="text-muted-foreground mb-2 text-xs">Sample portfolio entry</p>
            <DialogTitle>{project?.title}</DialogTitle>
            <DialogDescription>{project?.category}</DialogDescription>
          </DialogHeader>
          <div className="border-border bg-muted/40 rounded-xl border p-5">
            <p className="text-muted-foreground text-sm leading-7">
              This {project?.category.toLowerCase()} project is part of {person.name}’s demo portfolio. Original project
              files and a full case study aren’t included in this preview.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Interested in similar work?</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Start a conversation about your goals, scope, and timeline.
            </p>
          </div>
          <Link to="/messages" search={{ with: person.id }} className={workspaceStyles.primaryAction}>
            Discuss a project
            <ArrowUpRight className="size-4" />
          </Link>
        </DialogContent>
      </Dialog>
    </div>
  );
}
