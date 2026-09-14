import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Bookmark, Search, X } from "lucide-react";
import { useState } from "react";
import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header";
import { FreelancerCard } from "@/components/talent/freelancer-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { freelancers } from "@/data/freelancers";
import { useSavedTalent } from "@/hooks/useSavedTalent";

export const Route = createFileRoute("/_layout/saved")({
  component: SavedTalent,
  head: () => ({ meta: [{ title: "Saved talent | Freelancer" }] }),
});
function SavedTalent() {
  const { savedIds, toggleSaved } = useSavedTalent();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recommended");
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const people = freelancers
    .filter(
      (person) =>
        savedIds.includes(person.id) &&
        terms.every((term) =>
          [person.name, person.title, person.location, ...person.skills].join(" ").toLowerCase().includes(term),
        ),
    )
    .sort((a, b) =>
      sort === "lowest-rate"
        ? a.rate - b.rate
        : sort === "highest-rated"
          ? b.rating - a.rating
          : b.successRate - a.successRate,
    );
  return (
    <div className="mx-auto w-full space-y-6 xl:max-w-[912px]">
      <WorkspacePageHeader
        eyebrow="Your shortlist"
        title="Saved talent"
        description="Keep the people you’d like to work with in one place."
        action={
          <Link to="/talent" search={{ q: undefined }} className={workspaceStyles.secondaryAction}>
            Find talent
            <ArrowUpRight className="size-4" />
          </Link>
        }
      />
      {savedIds.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="border-input bg-card focus-within:border-primary focus-within:ring-primary/10 flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border px-4 focus-within:ring-2">
            <Search className="text-muted-foreground size-4 shrink-0" />
            <span className="sr-only">Search saved talent</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, skill, or location"
              className="min-w-0 flex-1 bg-transparent text-base outline-none sm:text-sm [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear saved search"
                className="hover:bg-muted grid size-10 place-items-center rounded-lg"
              >
                <X className="size-4" />
              </button>
            )}
          </label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger aria-label="Sort saved talent" className="bg-card h-12 w-full rounded-xl sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="highest-rated">Highest rated</SelectItem>
              <SelectItem value="lowest-rate">Lowest rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <p role="status" className="text-muted-foreground text-sm">
        <strong className="text-foreground font-semibold">{people.length}</strong>{" "}
        {people.length === 1 ? "professional" : "professionals"}
        {query ? " matching your search" : " saved"}
      </p>
      {people.length > 0 ? (
        <div className="divide-border border-border divide-y overflow-hidden rounded-xl border">
          {people.map((person) => (
            <FreelancerCard key={person.id} freelancer={person} saved onToggleSaved={() => toggleSaved(person.id)} />
          ))}
        </div>
      ) : (
        <section className="border-border bg-card rounded-xl border px-6 py-16 text-center">
          <Bookmark className="text-muted-foreground mx-auto size-8" />
          <h2 className="mt-5 text-xl font-medium tracking-tight">
            {savedIds.length ? "No matching saved profiles" : "Your shortlist starts here"}
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-6">
            {savedIds.length
              ? "Try another name, skill, or location."
              : "Save a profile while browsing talent. You’ll find everyone you save right here."}
          </p>
          {savedIds.length ? (
            <button type="button" onClick={() => setQuery("")} className={`${workspaceStyles.secondaryAction} mt-6`}>
              Clear search
            </button>
          ) : (
            <Link to="/talent" search={{ q: undefined }} className={`${workspaceStyles.primaryAction} mt-6`}>
              Explore talent
              <ArrowUpRight className="size-4" />
            </Link>
          )}
        </section>
      )}
    </div>
  );
}
