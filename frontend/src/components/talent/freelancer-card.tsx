import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Bookmark, MapPin, Star } from "lucide-react";
import { Monogram, SkillTag, workspaceStyles } from "@/components/dashboard/dashboard-header";
import type { Freelancer } from "@/data/freelancers";

export function FreelancerCard({
  freelancer,
  saved,
  onToggleSaved,
}: {
  freelancer: Freelancer;
  saved: boolean;
  onToggleSaved: () => void;
}) {
  return (
    <article
      aria-label={freelancer.name}
      className="group bg-card p-5 transition-colors hover:bg-muted/15 sm:p-7"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <Monogram
          className={`size-12 text-base sm:size-14 ${freelancer.background} ${freelancer.foreground}`}
        >
          {freelancer.initials}
        </Monogram>
        <div className="min-w-0 flex-1">
          <h2>
            <Link
              to="/talent/$freelancerId"
              params={{ freelancerId: freelancer.id }}
              search={{ q: undefined }}
              className="text-lg font-semibold tracking-tight hover:text-primary"
            >
              {freelancer.name}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{freelancer.title}</p>
        </div>
        <button
          type="button"
          onClick={onToggleSaved}
          aria-label={`${saved ? "Remove" : "Save"} ${freelancer.name}`}
          aria-pressed={saved}
          className={workspaceStyles.iconButton}
        >
          <Bookmark className={`size-4 ${saved ? "fill-primary text-primary" : ""}`} />
        </button>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_175px] xl:gap-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-3.5 text-primary" />
              <strong className="font-semibold text-foreground">{freelancer.rating.toFixed(1)}</strong>
              <span>({freelancer.reviews} reviews)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {freelancer.location}
            </span>
            <span>{freelancer.projects} projects</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{freelancer.bio}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {freelancer.skills.slice(0, 4).map((skill) => (
              <SkillTag key={skill}>{skill}</SkillTag>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4 xl:flex-col xl:items-stretch xl:border-t-0 xl:border-l xl:pt-0 xl:pl-6">
          <div>
            <p className="text-xl font-semibold tracking-tight tabular-nums">
              ${freelancer.rate}
              <span className="ml-1 text-xs font-normal text-muted-foreground">/ hour</span>
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">{freelancer.availability}</p>
          </div>
          <Link
            to="/talent/$freelancerId"
            params={{ freelancerId: freelancer.id }}
            search={{ q: undefined }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
          >
            View profile
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
