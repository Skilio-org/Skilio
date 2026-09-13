import { Link } from "@tanstack/react-router";
import { Info, ShieldCheck } from "lucide-react";

import { Monogram, SkillTag, workspaceStyles } from "@/components/dashboard/dashboard-header";
import type { Freelancer } from "@/data/freelancers";

export function MessageTalentDetails({ selected }: { selected: Freelancer }) {
  return (
    <aside className="border-border bg-card hidden min-h-0 flex-col border-l xl:flex">
      <div className="border-border flex items-center justify-between border-b px-5 py-4">
        <p className="font-display font-semibold">Talent details</p>
        <Info className="text-muted-foreground size-4" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="text-center">
          <div className="relative mx-auto w-fit">
            <Monogram className={`size-20 text-xl ${selected.background} ${selected.foreground}`}>
              {selected.initials}
            </Monogram>
            <span className="border-card absolute right-0 bottom-1 size-4 rounded-full border-[3px] bg-emerald-500" />
          </div>
          <p className="font-display mt-3 text-lg font-semibold">{selected.name}</p>
          <p className="text-muted-foreground mt-1 text-xs">{selected.title}</p>
          <Link
            to="/talent/$freelancerId"
            params={{ freelancerId: selected.id }}
            search={{ q: undefined }}
            className={`${workspaceStyles.secondaryAction} mt-4 min-h-10 px-4 text-xs`}
          >
            View profile
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <div className="bg-muted/60 rounded-xl p-3">
            <p className="font-display text-lg font-semibold">${selected.rate}/hr</p>
            <p className="text-muted-foreground mt-0.5 text-[10px]">Rate</p>
          </div>
          <div className="bg-muted/60 rounded-xl p-3">
            <p className="font-display text-lg font-semibold">{selected.rating.toFixed(1)}</p>
            <p className="text-muted-foreground mt-0.5 text-[10px]">Client rating</p>
          </div>
        </div>

        <div className="border-border mt-6 border-t pt-5">
          <p className="text-xs font-semibold">Conversation context</p>
          <div className="mt-3 space-y-3 text-xs">
            <div className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">Availability</span>
              <span className="text-right font-medium text-emerald-700">{selected.availability}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">Local time</span>
              <span className="text-right font-medium">{selected.timezone.split(" · ")[1]}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">Response</span>
              <span className="text-right font-medium">{selected.responseTime.replace("Usually replies ", "")}</span>
            </div>
          </div>
        </div>

        <div className="border-border mt-6 border-t pt-5">
          <p className="text-xs font-semibold">Top skills</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {selected.skills.slice(0, 5).map((skill) => (
              <SkillTag key={skill}>{skill}</SkillTag>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/35">
          <ShieldCheck className="size-4 text-emerald-700" />
          <p className="mt-2 text-xs font-semibold">Verified professional</p>
          <p className="text-muted-foreground mt-1 text-[11px] leading-5">
            Identity and work history have been reviewed.
          </p>
        </div>
      </div>
    </aside>
  );
}
