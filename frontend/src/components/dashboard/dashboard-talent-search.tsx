import { workspaceStyles } from "@/components/dashboard/dashboard-header";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";

export const TalentSearch = () => {
  const navigate = useNavigate();
  return (
    <section className="border-brand-200 bg-brand-50 rounded-2xl border p-6 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-5">
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tight sm:text-[1.75rem]">
            Who would make your next project better?
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Find the right person for the work you have in mind.
          </p>
        </div>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
          void navigate({ to: "/talent", search: { q: q || undefined } });
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className={`${workspaceStyles.inputShell} bg-card min-w-0 flex-1`}>
            <Search className="text-muted-foreground size-5 shrink-0" />
            <label htmlFor="dashboard-search" className="sr-only">
              Search talent
            </label>
            <input
              id="dashboard-search"
              name="q"
              type="search"
              placeholder="Try a role, skill, or area of expertise"
              className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent px-3 py-3 text-base outline-none md:text-sm"
            />
          </div>
          <button type="submit" className={`${workspaceStyles.primaryAction} min-h-12 px-6`}>
            Search talent <Search className="size-4" />
          </button>
        </div>
      </form>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
        <span className="text-muted-foreground">Popular searches</span>
        {["Product designer", "React developer", "AI engineer"].map((q) => (
          <Link
            key={q}
            to="/talent"
            search={{ q }}
            className="text-muted-foreground decoration-border hover:text-primary inline-flex min-h-9 items-center gap-1 font-medium underline underline-offset-4 transition-colors"
          >
            {q}
          </Link>
        ))}
      </div>
    </section>
  );
};
