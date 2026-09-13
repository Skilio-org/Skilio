import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { workspaceStyles } from "@/components/dashboard/dashboard-header";

export const TalentSearch = () => {
  const navigate = useNavigate();
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    navigate({ to: "/talent", search: { q: query || undefined } });
  };

  return (
    <form onSubmit={handleSearch} className="border-border bg-card shadow-card rounded-2xl border p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className={`${workspaceStyles.inputShell} min-w-0 flex-1`}>
          <Search className="text-muted-foreground size-5 shrink-0" />
          <label htmlFor="dashboard-search" className="sr-only">
            Search talent
          </label>
          <input
            id="dashboard-search"
            name="q"
            type="search"
            placeholder="Search by role, skill, or expertise"
            className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent px-3 py-3 text-base outline-none md:text-sm"
          />
        </div>
        <button type="submit" className={`${workspaceStyles.primaryAction} min-h-12 px-6`}>
          Search talent <ArrowRight className="size-4" />
        </button>
      </div>
      <div className="text-muted-foreground mt-4 flex flex-wrap gap-2 text-xs">
        <span className="mr-1 py-1.5">Popular:</span>
        {["Product designer", "React developer", "AI engineer"].map((query) => (
          <Link
            key={query}
            to="/talent"
            search={{ q: query }}
            className="border-border bg-muted/60 hover:border-brand-300 hover:text-brand-700 rounded-full border px-3 py-1.5 transition-colors"
          >
            {query}
          </Link>
        ))}
      </div>
    </form>
  );
};
