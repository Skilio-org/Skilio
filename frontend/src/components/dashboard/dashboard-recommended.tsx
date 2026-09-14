import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FreelancerCard } from "@/components/talent/freelancer-card";
import { freelancers } from "@/data/freelancers";
import { useSavedTalent } from "@/hooks/useSavedTalent";

const matches = freelancers.filter((person) => ["maya-laurent", "noah-williams", "amara-okafor"].includes(person.id));

export const RecommendedFreelancers = () => {
  const { savedIds, toggleSaved } = useSavedTalent();
  return (
    <section
      aria-labelledby="recommended-talent-heading"
      className="border-border bg-card min-w-0 overflow-hidden rounded-xl border"
    >
      <div className="border-border flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
        <div>
          <p className="text-muted-foreground text-xs font-medium">Recommended for you</p>
          <h2 id="recommended-talent-heading" className="mt-2 text-2xl font-medium tracking-tight">
            People worth getting to know
          </h2>
        </div>
        <Link
          to="/talent"
          search={{ q: undefined }}
          className="text-primary inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-medium hover:underline"
        >
          View all <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="divide-border divide-y">
        {matches.map((person) => (
          <FreelancerCard
            key={person.id}
            freelancer={person}
            saved={savedIds.includes(person.id)}
            onToggleSaved={() => toggleSaved(person.id)}
          />
        ))}
      </div>
    </section>
  );
};
