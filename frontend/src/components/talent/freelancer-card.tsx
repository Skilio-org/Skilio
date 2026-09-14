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
    <article aria-label={freelancer.name} className="group bg-card hover:bg-muted/15 p-5 transition-colors sm:p-7">
      <div className="flex items-start gap-3 sm:gap-4">
        <Monogram className={`size-12 text-base sm:size-14 ${freelancer.background} ${freelancer.foreground}`}>
          {freelancer.initials}
        </Monogram>
        <div className="min-w-0 flex-1">
          <h2>
            <Link
              to="/talent/$freelancerId"
              params={{ freelancerId: freelancer.id }}
              search={{ q: undefined }}
              className="hover:text-primary text-lg font-semibold tracking-tight"
            >
              {freelancer.name}
            </Link>
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">{freelancer.title}</p>
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
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <Star className="text-primary size-3.5" />
              <strong className="text-foreground font-semibold">{freelancer.rating.toFixed(1)}</strong>
              <span>({freelancer.reviews} reviews)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {freelancer.location}
            </span>
          </div>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">{freelancer.bio}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {freelancer.skills.slice(0, 4).map((skill) => (
              <SkillTag key={skill}>{skill}</SkillTag>
            ))}
          </div>
        </div>
        <div className="border-border flex flex-wrap items-end justify-between gap-4 border-t pt-4 xl:flex-col xl:items-stretch xl:border-t-0 xl:border-l xl:pt-0 xl:pl-6">
          <div>
            <p className="text-xl font-semibold tracking-tight tabular-nums">
              ${freelancer.rate}
              <span className="text-muted-foreground ml-1 text-xs font-normal">/ hour</span>
            </p>
            <p className="text-muted-foreground mt-1.5 text-xs">{freelancer.availability}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 xl:flex-col xl:items-stretch">
            <Link
              to="/talent/$freelancerId"
              params={{ freelancerId: freelancer.id }}
              search={{ q: undefined }}
              className="border-border hover:border-primary hover:text-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors"
            >
              View profile <ArrowUpRight className="size-4" />
            </Link>
            <Link
              to="/messages"
              search={{ with: freelancer.id }}
              className="text-primary hover:bg-accent inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-medium"
            >
              Message
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
