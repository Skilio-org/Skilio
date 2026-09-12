import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Bookmark,
  BriefcaseBusiness,
  Check,
  Clock3,
  ExternalLink,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { useState } from "react";

import { Monogram, SkillTag, workspaceStyles } from "@/components/Common/WorkspaceUI";
import { getFreelancer } from "@/data/freelancers";

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
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6">
      <Link
        to="/talent"
        search={{ q: undefined }}
        className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex min-h-11 items-center gap-2 rounded-full pr-4 text-sm font-semibold transition-colors"
      >
        <span className="border-border bg-card grid size-9 place-items-center rounded-full border">
          <ArrowLeft className="size-4" />
        </span>
        Back to talent
      </Link>

      <section className="border-border bg-card shadow-card relative overflow-hidden rounded-[28px] border">
        <div className="dark:from-brand-950/60 absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-[#eef3ff] via-[#f4f1ff] to-[#e9f7f3] dark:via-violet-950/30 dark:to-emerald-950/30" />
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-16 size-72 rounded-full border-[38px] border-white/35 dark:border-white/5"
        />
        <div className="relative px-5 pt-16 pb-6 sm:px-8 sm:pt-20 sm:pb-8 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end">
              <div className="relative w-fit">
                <Monogram
                  className={`border-card shadow-card size-24 border-[5px] text-3xl sm:size-28 ${person.background} ${person.foreground}`}
                >
                  {person.initials}
                </Monogram>
                <span
                  className="border-card absolute right-1 bottom-2 size-5 rounded-full border-[3px] bg-emerald-500"
                  role="img"
                  aria-label="Online"
                />
              </div>
              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{person.name}</h1>
                  <span className="bg-brand-50 text-brand-700 dark:bg-brand-950/60 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
                    <BadgeCheck className="size-3.5" /> Verified
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 text-base sm:text-lg">{person.title}</p>
                <div className="text-muted-foreground mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" /> {person.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-4" /> {person.timezone}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex w-full gap-2 lg:w-auto">
              <button
                type="button"
                onClick={() => setSaved((value) => !value)}
                aria-pressed={saved}
                className={`${workspaceStyles.secondaryAction} min-h-12 flex-1 px-4 lg:flex-none`}
              >
                <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />
                {saved ? "Saved" : "Save"}
              </button>
              <Link
                to="/messages"
                search={{ with: person.id }}
                className={`${workspaceStyles.primaryAction} min-h-12 flex-[1.4] px-6 lg:flex-none`}
              >
                Message {person.name.split(" ")[0]}
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="border-border bg-border mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border sm:grid-cols-4">
            {[
              {
                value: person.rating.toFixed(1),
                label: `${person.reviews} client reviews`,
                icon: Star,
              },
              {
                value: `${person.successRate}%`,
                label: "Project success",
                icon: ShieldCheck,
              },
              {
                value: `${person.projects}`,
                label: "Projects completed",
                icon: BriefcaseBusiness,
              },
              {
                value: `$${person.rate}/hr`,
                label: person.availability,
                icon: Sparkles,
              },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-card p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <Icon className="text-brand-600 size-4" />
                  <p className="font-display text-xl font-semibold sm:text-2xl">{value}</p>
                </div>
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="space-y-6">
          <section className="border-border bg-card shadow-card rounded-2xl border p-5 sm:p-8">
            <p className="text-brand-700 text-sm font-semibold">Profile</p>
            <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight">
              About {person.name.split(" ")[0]}
            </h2>
            <div className="text-muted-foreground mt-5 space-y-4 text-[15px] leading-7">
              {person.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="border-border mt-7 border-t pt-6">
              <h3 className="text-sm font-semibold">Core expertise</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {person.skills.map((skill) => (
                  <SkillTag key={skill} className="min-h-9 px-4 text-sm">
                    {skill}
                  </SkillTag>
                ))}
              </div>
            </div>
          </section>

          <section className="border-border bg-card shadow-card rounded-2xl border p-5 sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-brand-700 text-sm font-semibold">Selected work</p>
                <h2 className="font-display mt-1 text-2xl font-semibold">Recent portfolio</h2>
              </div>
              <span className="text-muted-foreground shrink-0 text-sm">{person.portfolio.length} case studies</span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {person.portfolio.map((project, index) => (
                <article
                  key={project.title}
                  className="group border-border bg-background hover:border-brand-200 hover:shadow-card overflow-hidden rounded-2xl border transition hover:-translate-y-0.5"
                >
                  <div className={`relative aspect-[4/3] overflow-hidden ${project.color}`}>
                    <div className="absolute inset-x-[13%] top-[20%] bottom-0 rounded-t-xl border border-white/60 bg-white/75 p-2 shadow-lg backdrop-blur-sm">
                      <div className="flex gap-1">
                        <span className="size-1.5 rounded-full bg-slate-300" />
                        <span className="size-1.5 rounded-full bg-slate-300" />
                        <span className="size-1.5 rounded-full bg-slate-300" />
                      </div>
                      <div className="mt-3 grid h-[68%] grid-cols-[28%_1fr] gap-2">
                        <div className="rounded bg-slate-900/80" />
                        <div className="space-y-2">
                          <div className="h-2 w-2/3 rounded-full bg-slate-500/35" />
                          <div className="h-8 rounded bg-white/90" />
                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="h-7 rounded bg-white/75" />
                            <div className="h-7 rounded bg-white/75" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="absolute top-3 left-3 rounded-full bg-white/70 px-2 py-1 font-mono text-[10px] text-slate-600 backdrop-blur-sm">
                      0{index + 1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <h3 className="font-display truncate font-semibold">{project.title}</h3>
                      <p className="text-muted-foreground mt-1 text-xs">{project.category}</p>
                    </div>
                    <span className="border-border text-muted-foreground group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-700 grid size-9 shrink-0 place-items-center rounded-full border transition">
                      <ExternalLink className="size-4" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="border-border bg-card shadow-card overflow-hidden rounded-2xl border">
            <div className="border-border flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-end sm:p-8">
              <div>
                <p className="text-brand-700 text-sm font-semibold">Client feedback</p>
                <h2 className="font-display mt-1 text-2xl font-semibold">Consistently trusted</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-semibold">{person.rating.toFixed(1)}</span>
                <div>
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="size-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">{person.reviews} reviews</p>
                </div>
              </div>
            </div>
            <div className="p-5 sm:p-8">
              <div className="flex items-center gap-3">
                <Monogram className="size-10 bg-slate-900 text-xs text-white">AR</Monogram>
                <div>
                  <p className="text-sm font-semibold">Alex Rivera</p>
                  <p className="text-muted-foreground text-xs">Product lead · Verified client</p>
                </div>
              </div>
              <blockquote className="font-display text-foreground mt-5 max-w-3xl text-xl leading-8 tracking-[-0.015em]">
                “The work was thoughtful from the first workshop through delivery. Every decision was clear, practical,
                and connected to the outcome we needed.”
              </blockquote>
              <div className="text-muted-foreground mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <span>SaaS product engagement</span>
                <span className="bg-border hidden size-1 rounded-full sm:block" />
                <span>Completed 3 weeks ago</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24">
          <section className="border-border bg-card shadow-card overflow-hidden rounded-2xl border">
            <div className="border-border bg-muted/35 border-b p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-xs font-medium">Hourly rate</p>
                  <p className="font-display mt-1 text-3xl font-semibold">
                    ${person.rate}
                    <span className="text-muted-foreground text-base font-medium">/hr</span>
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50">
                  {person.availability}
                </span>
              </div>
            </div>
            <div className="p-6">
              <Link
                to="/messages"
                search={{ with: person.id }}
                className={`${workspaceStyles.primaryAction} min-h-12 w-full`}
              >
                <MessageSquare className="size-4" />
                Start a conversation
              </Link>
              <button
                type="button"
                onClick={() => setSaved((value) => !value)}
                aria-pressed={saved}
                className={`${workspaceStyles.secondaryAction} mt-2 min-h-12 w-full`}
              >
                <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />
                {saved ? "Saved to shortlist" : "Save to shortlist"}
              </button>
              <div className="border-border mt-5 space-y-3 border-t pt-5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Response time</span>
                  <span className="text-right font-medium">{person.responseTime.replace("Usually ", "")}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Local time</span>
                  <span className="text-right font-medium">{person.timezone.split(" · ")[1]}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="border-border bg-card shadow-card rounded-2xl border p-6">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <h2 className="font-display font-semibold">Trusted profile</h2>
                <p className="text-muted-foreground text-xs">Independently verified</p>
              </div>
            </div>
            <div className="text-muted-foreground mt-5 space-y-3 text-sm">
              {["Identity verified", "Payment verified", person.memberSince].map((item) => (
                <p key={item} className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-600" /> {item}
                </p>
              ))}
            </div>
          </section>

          <section className="border-border bg-card shadow-card rounded-2xl border p-6">
            <h2 className="font-display text-lg font-semibold">Languages & education</h2>
            <div className="mt-4 space-y-3">
              {person.languages.map((language) => (
                <div key={language.name} className="flex justify-between gap-4 text-sm">
                  <span>{language.name}</span>
                  <span className="text-muted-foreground">{language.level}</span>
                </div>
              ))}
            </div>
            <div className="border-border mt-5 border-t pt-5">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Education</p>
              <p className="mt-2 text-sm leading-6">{person.education}</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
