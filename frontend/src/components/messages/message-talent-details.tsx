import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Clock3, MapPin, Star } from "lucide-react"
import {
  Monogram,
  SkillTag,
  workspaceStyles,
} from "@/components/dashboard/dashboard-header"
import type { Freelancer } from "@/data/freelancers"
import { cn } from "@/lib/utils"

export function MessageTalentDetails({
  selected,
  clientMode = false,
}: {
  selected: Freelancer
  clientMode?: boolean
}) {
  return (
    <div className="px-6 pb-8">
      <div className="mt-5">
        <Monogram
          className={cn(
            "size-16 text-xl",
            selected.background,
            selected.foreground,
          )}
        >
          {selected.initials}
        </Monogram>
        <h2 className="mt-5 text-2xl font-medium tracking-tight">
          {selected.name}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">{selected.title}</p>
        <p className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
          <MapPin className="size-3.5" />
          {selected.location}
        </p>
        {!clientMode && (
          <Link
            to="/talent/$freelancerId"
            params={{ freelancerId: selected.id }}
            search={{ q: undefined }}
            className={`${workspaceStyles.secondaryAction} mt-5 w-full justify-between`}
          >
            View full profile <ArrowUpRight className="size-4" />
          </Link>
        )}
      </div>
      {!clientMode && (
        <dl className="border-border mt-7 grid grid-cols-2 gap-4 border-y py-5">
          <div>
            <dt className="text-muted-foreground text-xs">Hourly rate</dt>
            <dd className="mt-2 text-xl font-medium tabular-nums">
              ${selected.rate}
              <span className="text-muted-foreground text-xs font-normal">
                {" "}
                /hr
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Client rating</dt>
            <dd className="mt-2 flex items-center gap-1.5 text-xl font-medium tabular-nums">
              <Star className="text-primary size-4" />
              {selected.rating.toFixed(1)}
              <span className="text-muted-foreground text-xs font-normal">
                ({selected.reviews})
              </span>
            </dd>
          </div>
        </dl>
      )}
      <section className="mt-6">
        <h3 className="text-sm font-medium">About</h3>
        <p className="text-muted-foreground mt-3 text-sm leading-7">
          {selected.bio}
        </p>
      </section>
      <section className="mt-6">
        <h3 className="text-sm font-medium">
          {clientMode ? "Project focus" : "Expertise"}
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {selected.skills.slice(0, 6).map((skill) => (
            <SkillTag key={skill}>{skill}</SkillTag>
          ))}
        </div>
      </section>
      <div className="border-border bg-muted/40 mt-7 rounded-xl border p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock3 className="text-primary size-4" />
          {selected.availability}
        </div>
        <p className="text-muted-foreground mt-2 text-xs leading-6">
          {selected.responseTime}
        </p>
      </div>
    </div>
  )
}
