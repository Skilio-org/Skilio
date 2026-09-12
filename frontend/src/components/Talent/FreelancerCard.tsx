import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BadgeCheck,
  Bookmark,
  BriefcaseBusiness,
  Clock3,
  type LucideIcon,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useState } from "react";

import { Monogram, SkillTag, workspaceStyles } from "@/components/dashboard/dashboard-header";
import type { Freelancer } from "@/data/freelancers";

export function FreelancerCard({ freelancer, featured = false }: { freelancer: Freelancer; featured?: boolean }) {
  const [saved, setSaved] = useState(false);

  return (
    <article
      className={`group bg-card shadow-card hover:shadow-card-hover relative overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
        featured ? "border-brand-300" : "border-border hover:border-brand-200"
      }`}
    >
      <div className="grid lg:grid-cols-[minmax(0,1fr)_210px]">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <Monogram className={`size-16 text-xl sm:size-20 ${freelancer.background} ${freelancer.foreground}`}>
                {freelancer.initials}
              </Monogram>
              <span className="border-card absolute right-0 bottom-1 size-4 rounded-full border-[3px] bg-emerald-500" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link
                      to="/talent/$freelancerId"
                      params={{ freelancerId: freelancer.id }}
                      search={{ q: undefined }}
                      className="font-display text-foreground text-xl font-semibold sm:text-2xl"
                    >
                      {freelancer.name}
                    </Link>
                    <BadgeCheck className="text-brand-600 size-4" aria-label="Verified profile" />
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm font-medium">{freelancer.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSaved((value) => !value)}
                  aria-label={`${saved ? "Remove" : "Save"} ${freelancer.name}`}
                  aria-pressed={saved}
                  className={`${workspaceStyles.iconButton} -mt-1 lg:hidden`}
                >
                  <Bookmark className={`size-4.5 ${saved ? "fill-current" : ""}`} />
                </button>
              </div>

              <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <strong className="text-foreground">{freelancer.rating.toFixed(1)}</strong>
                  <span>({freelancer.reviews} reviews)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {freelancer.location}
                </span>
              </div>

              <p className="text-muted-foreground mt-4 max-w-3xl text-sm leading-6">{freelancer.bio}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {freelancer.skills.slice(0, 4).map((skill) => (
                  <SkillTag key={skill}>{skill}</SkillTag>
                ))}
              </div>

              <div className="border-border mt-5 grid grid-cols-2 gap-3 border-t pt-4 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
                <Signal icon={ShieldCheck} value={`${freelancer.successRate}%`} label="success" />
                <Signal icon={BriefcaseBusiness} value={`${freelancer.projects}`} label="projects" />
                <Signal
                  icon={Clock3}
                  value={freelancer.responseTime.replace("Usually replies ", "")}
                  label="response"
                  className="col-span-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-border bg-muted/25 flex flex-col justify-between border-t p-5 lg:border-t-0 lg:border-l lg:p-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-muted-foreground text-xs font-medium">Hourly rate</p>
                <p className="font-display text-foreground mt-1 text-2xl font-semibold">
                  ${freelancer.rate}
                  <span className="text-muted-foreground text-sm font-medium">/hr</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSaved((value) => !value)}
                aria-label={`${saved ? "Remove" : "Save"} ${freelancer.name}`}
                aria-pressed={saved}
                className={`${workspaceStyles.iconButton} -mt-1 hidden lg:grid`}
              >
                <Bookmark className={`size-[18px] ${saved ? "fill-current" : ""}`} />
              </button>
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {freelancer.availability}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-1">
            <Link
              to="/talent/$freelancerId"
              params={{ freelancerId: freelancer.id }}
              search={{ q: undefined }}
              className={`${workspaceStyles.primaryAction} min-h-11 w-full px-4`}
            >
              View profile <ArrowUpRight className="size-4" />
            </Link>
            <Link
              to="/messages"
              search={{ with: freelancer.id }}
              className={`${workspaceStyles.secondaryAction} min-h-11 w-full px-4`}
            >
              Message
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function Signal({
  icon: Icon,
  value,
  label,
  className = "",
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon className="text-brand-600 size-3.5 shrink-0" />
      <span className="text-xs">
        <strong className="text-foreground font-semibold">{value}</strong>{" "}
        <span className="text-muted-foreground">{label}</span>
      </span>
    </div>
  );
}
