import { BriefcaseBusiness, Search } from "lucide-react";
import { workspaceStyles } from "@/components/dashboard/dashboard-header";
import type { ClientJob } from "./client-job-types";

type ClientJobsListProps = {
  jobs: ClientJob[];
  results: ClientJob[];
  query: string;
  tab: string;
  disabled: boolean;
  onQueryChange: (query: string) => void;
  onTabChange: (tab: string) => void;
  onOpenJob: (job: ClientJob) => void;
  onCreateJob: () => void;
  onClearFilters: () => void;
};

export function ClientJobsList({
  jobs,
  results,
  query,
  tab,
  disabled,
  onQueryChange,
  onTabChange,
  onOpenJob,
  onCreateJob,
  onClearFilters,
}: ClientJobsListProps) {
  return (
    <>
      <nav aria-label="Job status" className="border-border flex gap-6 overflow-x-auto border-b">
        {["All jobs", "Draft", "Open", "Closed"].map((status) => (
          <button
            type="button"
            key={status}
            onClick={() => onTabChange(status)}
            aria-pressed={tab === status}
            className={`min-h-12 shrink-0 border-b-2 px-1 text-sm font-medium ${tab === status ? "border-primary text-primary" : "text-muted-foreground border-transparent"}`}
          >
            {status}{" "}
            <span className="ml-1 text-xs">
              {jobs.filter((job) => status === "All jobs" || job.status === status).length}
            </span>
          </button>
        ))}
      </nav>
      <label className="bg-card border-input flex min-h-12 items-center gap-3 rounded-xl border px-4">
        <Search className="text-muted-foreground size-4" />
        <input
          type="search"
          aria-label="Search your jobs"
          placeholder="Search your jobs by title or skill"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </label>
      <p role="status" className="text-muted-foreground text-sm">
        {results.length} {results.length === 1 ? "job" : "jobs"}
      </p>
      {results.length ? (
        <div className="border-border divide-border divide-y overflow-hidden rounded-xl border">
          {results.map((job) => (
            <article key={job.id} className="bg-card flex flex-wrap items-center justify-between gap-5 p-6">
              <div className="min-w-0">
                <span className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs">{job.status}</span>
                <h2 className="mt-3 text-lg font-semibold break-words">{job.title || "Untitled job"}</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  {job.category} · {job.type}
                  {job.budget && ` · $${job.budget}${job.type === "Hourly" ? "/hr" : ""}`}
                </p>
              </div>
              <button type="button" className={workspaceStyles.secondaryAction} onClick={() => onOpenJob(job)}>
                View job
              </button>
            </article>
          ))}
        </div>
      ) : (
        <section className="bg-card rounded-xl border px-6 py-16 text-center">
          <BriefcaseBusiness className="text-primary mx-auto size-8" />
          <h2 className="mt-5 text-xl font-semibold">
            {jobs.length ? "No matching jobs" : "Make room for your next project."}
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-6">
            {jobs.length
              ? "Try another search or status."
              : "Describe what you need, choose the skills, and set a budget. You can save a draft and finish it later."}
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={jobs.length ? onClearFilters : onCreateJob}
            className={`${workspaceStyles.primaryAction} mt-6`}
          >
            {jobs.length ? "Show all jobs" : "Create your first job"}
          </button>
        </section>
      )}
    </>
  );
}
