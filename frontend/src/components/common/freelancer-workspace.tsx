import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ChangePassword from "@/components/user-settings/change-password";
import { AppearanceSettings } from "@/components/user-settings/preferences";
import useAuth from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownWideNarrow,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  Clock3,
  FileText,
  Globe2,
  Search,
  SlidersHorizontal,
  Sparkles,
  type Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WorkspacePageHeader, WorkspaceSurface, workspaceStyles } from "../dashboard/dashboard-header";
import { FreelancerJobFilterFields } from "../freelancer/freelancer-job-filter-fields";
import {
  type ProposalDraft as Draft,
  type FreelancerJob as Job,
  freelancerJobs,
  freelancerWorkspaceSubtitles,
  freelancerWorkspaceTitles,
  seedProposals,
} from "../freelancer/freelancer-workspace-data";
import { JobFormSection, jobFormField } from "./job-form-section";

export function FreelancerWorkspace({ page }: { page: keyof typeof freelancerWorkspaceTitles }) {
  const { user } = useAuth();
  const jobs = freelancerJobs;
  const key = `freelancer-work-v2:${user?.id ?? "preview"}`;
  const [saved, setSaved] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loaded, setLoaded] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All work");
  const [jobType, setJobType] = useState("any");
  const [jobSort, setJobSort] = useState("recommended");
  const [jobFiltersOpen, setJobFiltersOpen] = useState(false);
  const [tab, setTab] = useState("Active");
  const [selected, setSelected] = useState<Job | null>(null);
  const [compose, setCompose] = useState(false);
  const [cover, setCover] = useState("");
  const [rate, setRate] = useState("");
  const selectedProjectType =
    selected?.projectType ?? (selected?.budget.includes("Fixed price") ? "Fixed price" : "Hourly");
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      const data = JSON.parse(stored || "{}");
      setSaved(Array.isArray(data.saved) ? data.saved.filter((s: unknown) => typeof s === "string") : []);
      setDrafts(
        Array.isArray(data.drafts)
          ? data.drafts.filter(
              (d: Draft) =>
                d?.job &&
                [d.job.id, d.job.title, d.job.company, d.job.category, d.job.budget, d.job.description].every(
                  (value) => typeof value === "string",
                ) &&
                Array.isArray(d.job.skills) &&
                d.job.skills.every((value) => typeof value === "string") &&
                typeof d.cover === "string" &&
                typeof d.rate === "string",
            )
          : seedProposals,
      );
    } catch {
      setDrafts(seedProposals);
      setError("Your saved drafts couldn’t be restored. Showing demo proposals.");
    }
    setLoaded(key);
  }, [key]);
  useEffect(() => {
    if (loaded !== key) return;
    try {
      localStorage.setItem(key, JSON.stringify({ saved, drafts }));
    } catch {
      setError("Changes couldn’t be saved on this device.");
    }
  }, [key, loaded, saved, drafts]);
  const filtered = jobs
    .filter(
      (j) =>
        (page !== "savedJobs" || saved.includes(j.id)) &&
        (filter === "All work" || filter === j.category || (filter === "Saved" && saved.includes(j.id))) &&
        (jobType === "any" || jobType === j.projectType) &&
        `${j.title} ${j.company} ${j.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((first, second) => {
      if (jobSort === "title") return first.title.localeCompare(second.title);
      if (jobSort === "budget")
        return second.budget.localeCompare(first.budget, undefined, {
          numeric: true,
        });
      return Number(first.id) - Number(second.id);
    });
  const activeJobFilterCount = [jobType !== "any", filter === "Saved"].filter(Boolean).length;
  const clearJobFilters = () => {
    setJobType("any");
    if (filter === "Saved") setFilter("All work");
  };
  const clearJobSearch = () => {
    setQuery("");
    setFilter("All work");
    clearJobFilters();
  };
  const hasJobFilters = !!query || filter !== "All work" || activeJobFilterCount > 0;
  const jobFilterFields = (group: string) => (
    <FreelancerJobFilterFields
      group={group}
      jobType={jobType}
      showClear={activeJobFilterCount > 0}
      onJobTypeChange={setJobType}
      onClear={clearJobFilters}
    />
  );
  const proposalTab = tab === "Active" ? "Drafts" : tab;
  const visibleProposals = drafts.filter((draft) => (draft.status ?? "Drafts") === proposalTab);
  const changeProposal = (id: string, status: Draft["status"]) => {
    setDrafts((items) => items.map((item) => (item.job.id === id ? { ...item, status } : item)));
    toast.success(
      status === "Submitted"
        ? "Demo proposal submitted. Nothing was sent to a client."
        : status === "Archived"
          ? "Proposal archived"
          : "Proposal restored to drafts",
    );
  };
  const open = (job: Job, draft?: Draft) => {
    setSelected(job);
    setCompose(!!draft);
    setCover(draft?.cover ?? "");
    setRate(draft?.rate ?? "");
  };
  const directoryJobList = (
    <div className="divide-border border-border divide-y overflow-hidden rounded-xl border">
      {filtered.map((job) => (
        <article key={job.id} className="bg-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">
                {job.posted} · {job.company} · Remote
              </p>
              <button
                type="button"
                onClick={() => open(job)}
                className="hover:text-primary mt-2 text-left text-xl font-medium tracking-tight wrap-break-word"
              >
                {job.title}
              </button>
              <p className="mt-3 text-sm font-medium">{job.budget}</p>
            </div>
            <button
              type="button"
              aria-label={`${saved.includes(job.id) ? "Unsave" : "Save"} ${job.title}`}
              aria-pressed={saved.includes(job.id)}
              onClick={() =>
                setSaved((ids) => (ids.includes(job.id) ? ids.filter((id) => id !== job.id) : [...ids, job.id]))
              }
              className={workspaceStyles.iconButton}
            >
              <Bookmark className={`size-4 ${saved.includes(job.id) ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>
          <p className="text-muted-foreground mt-4 max-w-3xl text-sm leading-6">{job.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="bg-muted text-muted-foreground inline-flex min-h-7 items-center rounded-md px-3 text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
  const jobList = (
    <div className="space-y-4">
      {filtered.map((job) => (
        <WorkspaceSurface key={job.id} className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-xs">{job.company} · Remote</p>
              <button
                onClick={() => open(job)}
                className="hover:text-primary mt-2 text-left text-xl font-medium tracking-tight"
                type="button"
              >
                {job.title}
              </button>
              <p className="mt-3 text-sm font-medium">{job.budget}</p>
            </div>
            <button
              type="button"
              aria-label={`${saved.includes(job.id) ? "Unsave" : "Save"} ${job.title}`}
              aria-pressed={saved.includes(job.id)}
              onClick={() =>
                setSaved((ids) => (ids.includes(job.id) ? ids.filter((id) => id !== job.id) : [...ids, job.id]))
              }
              className={workspaceStyles.iconButton}
            >
              <Bookmark className={`size-4 ${saved.includes(job.id) ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>
          <p className="text-muted-foreground mt-3 text-sm leading-6">{job.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {job.skills.map((s) => (
              <span key={s} className="bg-muted text-muted-foreground rounded-full px-3 py-1.5 text-xs">
                {s}
              </span>
            ))}
          </div>
        </WorkspaceSurface>
      ))}
    </div>
  );
  return (
    <div className={page === "savedJobs" ? "mx-auto w-full space-y-6 xl:max-w-228" : "space-y-7"}>
      <WorkspacePageHeader
        eyebrow={page === "savedJobs" ? "Your shortlist" : "Freelancer workspace"}
        title={
          page === "dashboard" && user?.full_name
            ? `Good to see you, ${user.full_name.trim().split(/\s+/)[0]}.`
            : freelancerWorkspaceTitles[page]
        }
        description={freelancerWorkspaceSubtitles[page]}
        action=""
      />
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      {page === "dashboard" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Opportunities to explore</h2>
              <Link className="text-primary text-sm font-medium" to="/freelancer-jobs">
                View all
              </Link>
            </div>
            {jobs.length ? (
              jobList
            ) : (
              <Empty
                icon={BriefcaseBusiness}
                title="Your next project starts here"
                detail="New opportunities will appear when job listings are available."
              />
            )}
          </section>
          <aside className="space-y-5">
            <WorkspaceSurface className="border-brand-200 bg-brand-50 p-6">
              <h2 className="font-display text-xl font-medium tracking-tight">Let your profile do the talking</h2>
              <p className="text-muted-foreground mt-3 text-sm leading-6">
                Add your skills, set your rate, and share work you’re proud of.
              </p>
              <Link to="/freelancer" className={`${workspaceStyles.primaryAction} mt-5`}>
                Complete profile
                <ArrowRight className="size-4" />
              </Link>
            </WorkspaceSurface>
          </aside>
        </div>
      )}
      {page === "savedJobs" && (
        <>
          {saved.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="border-input bg-card focus-within:border-primary focus-within:ring-primary/10 flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border px-4 focus-within:ring-2">
                <Search className="text-muted-foreground size-4 shrink-0" />
                <span className="sr-only">Search saved jobs</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by title, skill, or company"
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
              <Select value={jobSort} onValueChange={setJobSort}>
                <SelectTrigger aria-label="Sort saved jobs" className="bg-card h-12 w-full rounded-xl sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="title">Project title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <p role="status" className="text-muted-foreground text-sm">
            <strong className="text-foreground font-semibold">{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "job" : "jobs"}
            {query ? " matching your search" : " saved"}
          </p>
          {filtered.length ? (
            directoryJobList
          ) : (
            <section className="border-border bg-card rounded-xl border px-6 py-16 text-center">
              <Bookmark className="text-muted-foreground mx-auto size-8" />
              <h2 className="mt-5 text-xl font-medium tracking-tight">
                {saved.length ? "No matching saved jobs" : "Your shortlist starts here"}
              </h2>
              <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-6">
                {saved.length
                  ? "Try another title, skill, or company."
                  : "Save a job while browsing work. You’ll find every opportunity you bookmark right here."}
              </p>
              {saved.length ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className={`${workspaceStyles.secondaryAction} mt-6`}
                >
                  Clear search
                </button>
              ) : (
                <Link to="/freelancer-jobs" className={`${workspaceStyles.primaryAction} mt-6`}>
                  Explore work <ArrowRight className="size-4" />
                </Link>
              )}
            </section>
          )}
        </>
      )}
      {page === "jobs" && (
        <>
          <search className="block">
            <form className="flex gap-2" onSubmit={(event) => event.preventDefault()}>
              <label className="border-input bg-card focus-within:border-primary focus-within:ring-primary/10 flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl border px-4 focus-within:ring-2">
                <Search className="text-muted-foreground size-5 shrink-0" />
                <span className="sr-only">Search jobs</span>
                <input
                  type="search"
                  aria-label="Search jobs"
                  placeholder="Try a role, skill, or company"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-base outline-none [&::-webkit-search-cancel-button]:hidden"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="text-muted-foreground hover:bg-muted grid size-10 shrink-0 place-items-center rounded-lg"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </label>
              <button
                type="submit"
                className="bg-primary text-primary-foreground hidden min-h-14 rounded-xl px-7 text-sm font-medium hover:opacity-90 sm:block"
              >
                Search
              </button>
              <button
                type="button"
                aria-label="Open job filters"
                aria-expanded={jobFiltersOpen}
                onClick={() => setJobFiltersOpen(true)}
                className="border-border bg-card relative grid min-h-14 w-14 shrink-0 place-items-center rounded-xl border lg:hidden"
              >
                <SlidersHorizontal className="size-5" />
                {activeJobFilterCount > 0 && (
                  <span className="bg-primary text-primary-foreground absolute top-1 right-1 rounded-full px-1.5 text-[10px]">
                    {activeJobFilterCount}
                  </span>
                )}
              </button>
            </form>
            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 text-xs">
              <span>Try:</span>
              {["Product design", "React", "Content strategy"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuery(item)}
                  className="text-foreground decoration-border hover:text-primary min-h-11 font-medium underline underline-offset-4"
                >
                  {item}
                </button>
              ))}
            </div>
          </search>
          <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside aria-label="Job filters" className="sticky top-24 hidden lg:block">
              <h2 className="mb-6 text-base font-semibold">Refine your search</h2>
              {jobFilterFields("desktop-job-type")}
            </aside>
            <section aria-label="Job results" className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted-foreground text-sm" role="status">
                  <strong className="text-foreground font-semibold">{filtered.length}</strong>{" "}
                  {filtered.length === 1 ? "opportunity" : "opportunities"}
                  {query ? ` matching “${query}”` : " to explore"}
                </p>
                <Select value={jobSort} onValueChange={setJobSort}>
                  <SelectTrigger aria-label="Sort jobs" className="border-border bg-card h-11 w-44 rounded-lg text-xs">
                    <ArrowDownWideNarrow className="text-muted-foreground size-3.5" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="budget">Highest budget</SelectItem>
                    <SelectItem value="title">Project title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {hasJobFilters && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {filter !== "All work" && <JobFilterChip label={filter} onRemove={() => setFilter("All work")} />}
                  {jobType !== "any" && <JobFilterChip label={jobType} onRemove={() => setJobType("any")} />}
                  {query && <JobFilterChip label={query} onRemove={() => setQuery("")} />}
                  <button
                    type="button"
                    onClick={clearJobSearch}
                    className="text-primary min-h-9 px-2 text-xs font-medium hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
              {filtered.length ? (
                directoryJobList
              ) : (
                <div className="border-border bg-card rounded-xl border px-6 py-16 text-center">
                  <Search className="text-muted-foreground mx-auto size-7" />
                  <h2 className="mt-5 text-xl font-medium tracking-tight">No matching projects</h2>
                  <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-6">
                    Try a broader skill, another category, or a different project type.
                  </p>
                  <button type="button" onClick={clearJobSearch} className={`${workspaceStyles.secondaryAction} mt-6`}>
                    Browse all work
                  </button>
                </div>
              )}
            </section>
          </div>
          <Sheet open={jobFiltersOpen} onOpenChange={setJobFiltersOpen}>
            <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-sm">
              <SheetHeader className="border-border border-b">
                <SheetTitle>Refine your search</SheetTitle>
                <SheetDescription>Choose the project type and duration that fit your work.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-6">{jobFiltersOpen && jobFilterFields("mobile-job-type")}</div>
              <div className="border-border border-t p-5">
                <button
                  type="button"
                  onClick={() => setJobFiltersOpen(false)}
                  className={`${workspaceStyles.primaryAction} w-full`}
                >
                  Show {filtered.length} {filtered.length === 1 ? "opportunity" : "opportunities"}
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
      {page === "proposals" && (
        <>
          <div className="flex flex-wrap gap-2">
            {["Drafts", "Submitted", "Archived"].map((t) => (
              <button
                key={t}
                type="button"
                className={
                  (tab === "Active" ? "Drafts" : tab) === t
                    ? workspaceStyles.primaryAction
                    : workspaceStyles.secondaryAction
                }
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {visibleProposals.length ? (
            <div className="space-y-4">
              {visibleProposals.map((d) => (
                <WorkspaceSurface key={d.job.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
                  <div>
                    <p className="text-muted-foreground text-xs">
                      {d.status ?? "Drafts"} · {d.job.company}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold">{d.job.title}</h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                      Proposed {d.job.budget.includes("Fixed price") ? "budget" : "rate"}: ${d.rate}
                      {d.job.budget.includes("Fixed price") ? "" : "/hr"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {proposalTab === "Drafts" && (
                      <>
                        <button
                          type="button"
                          className={workspaceStyles.secondaryAction}
                          onClick={() => open(d.job, d)}
                        >
                          Edit draft
                        </button>
                        <button
                          type="button"
                          className={workspaceStyles.primaryAction}
                          onClick={() => changeProposal(d.job.id, "Submitted")}
                        >
                          Submit demo proposal
                        </button>
                      </>
                    )}
                    {proposalTab === "Submitted" && (
                      <button
                        type="button"
                        className={workspaceStyles.secondaryAction}
                        onClick={() => {
                          setSelected(d.job);
                          setCompose(false);
                        }}
                      >
                        View job
                      </button>
                    )}
                    <button
                      type="button"
                      className={workspaceStyles.secondaryAction}
                      onClick={() => changeProposal(d.job.id, proposalTab === "Archived" ? "Drafts" : "Archived")}
                    >
                      {proposalTab === "Archived" ? "Restore draft" : "Archive"}
                    </button>
                  </div>
                </WorkspaceSurface>
              ))}
            </div>
          ) : (
            <Empty
              icon={FileText}
              title={
                tab === "Submitted"
                  ? "No submitted proposals"
                  : tab === "Archived"
                    ? "No archived proposals"
                    : "Start with a project that fits"
              }
              detail="Your proposals will appear here. Browse work and prepare a thoughtful introduction."
              action={
                <Link className={workspaceStyles.primaryAction} to="/freelancer-jobs">
                  Find work
                  <ArrowRight className="size-4" />
                </Link>
              }
            />
          )}
        </>
      )}
      {page === "settings" && (
        <>
          <div className="flex gap-2">
            {["Account", "Security", "Appearance"].map((t) => (
              <button
                key={t}
                type="button"
                className={
                  (tab === "Active" ? "Account" : tab) === t
                    ? workspaceStyles.primaryAction
                    : workspaceStyles.secondaryAction
                }
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "Security" ? (
            <ChangePassword />
          ) : tab === "Appearance" ? (
            <AppearanceSettings />
          ) : (
            <WorkspaceSurface className="p-6">
              <h2 className="text-lg font-semibold">Freelancer account</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="mt-1">{user?.full_name || "Your name"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="mt-1">{user?.email || "Sign in to see your email"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Account type</dt>
                  <dd className="mt-1">Freelancer</dd>
                </div>
              </dl>
              <Link className={`${workspaceStyles.secondaryAction} mt-6`} to="/freelancer">
                Edit professional profile
              </Link>
            </WorkspaceSurface>
          )}
        </>
      )}
      <Sheet
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent
          side="right"
          showCloseButton={false}
          className={
            compose
              ? "bg-card w-full max-w-none gap-0 p-0 sm:max-w-180"
              : "w-full max-w-none gap-0 p-0 sm:w-[min(78vw,1180px)] sm:max-w-none"
          }
        >
          {selected && (
            <>
              <header className="border-border bg-card flex h-18 shrink-0 items-center justify-between gap-4 border-b px-5 sm:px-7">
                <SheetClose className="text-muted-foreground hover:text-foreground focus-visible:outline-ring inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium focus-visible:outline-2">
                  <ArrowLeft className="size-4" />
                  Back to jobs
                </SheetClose>
                <p className="text-muted-foreground hidden text-xs sm:block">{selected.company} · Remote opportunity</p>
              </header>
              <div
                className={
                  compose
                    ? "flex min-h-0 flex-1 flex-col"
                    : "min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_310px] lg:overflow-hidden"
                }
              >
                <main className={compose ? "flex min-h-0 flex-1 flex-col" : "min-w-0 lg:overflow-y-auto"}>
                  {compose ? (
                    <section className="flex min-h-0 flex-1 flex-col">
                      <div className="border-border border-b px-6 py-6 sm:px-8">
                        <p className="text-primary mb-2 text-xs font-semibold">YOUR NEXT OPPORTUNITY</p>
                        <SheetTitle className="text-2xl font-semibold tracking-tight">
                          Make your introduction
                        </SheetTitle>
                        <SheetDescription className="mt-2 text-sm leading-6">
                          A thoughtful proposal is the start of a great collaboration.
                        </SheetDescription>
                      </div>
                      <form
                        className="flex min-h-0 flex-1 flex-col"
                        onSubmit={(event) => {
                          event.preventDefault();
                          setDrafts((items) => [
                            ...items.filter((draft) => draft.job.id !== selected.id),
                            {
                              job: selected,
                              cover: cover.trim(),
                              rate,
                              status: "Drafts",
                            },
                          ]);
                          setSelected(null);
                          toast.success("Proposal draft saved on this device");
                        }}
                      >
                        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-6 sm:px-8">
                          <div className="border-border bg-muted/40 rounded-xl border p-4">
                            <p className="text-muted-foreground text-xs">Applying to · {selected.company}</p>
                            <p className="mt-2 text-sm leading-6 font-semibold">{selected.title}</p>
                            <p className="text-muted-foreground mt-2 text-xs">{selected.budget}</p>
                            <button
                              type="button"
                              onClick={() => setCompose(false)}
                              className="text-primary mt-2 min-h-11 text-sm font-medium hover:underline"
                            >
                              View job details <span aria-hidden="true">↗</span>
                            </button>
                          </div>
                          <JobFormSection
                            title="Tell them why you’re a good fit"
                            description="Share relevant experience and how you’d approach this project."
                          >
                            <label className="block text-sm font-medium">
                              Cover letter
                              <textarea
                                required
                                minLength={40}
                                maxLength={5000}
                                className={`${jobFormField} min-h-40 resize-y leading-6`}
                                rows={6}
                                value={cover}
                                onChange={(event) => setCover(event.target.value)}
                                placeholder="Hi! Your project caught my attention because…"
                              />
                              <span className="text-muted-foreground mt-2 block text-xs">
                                At least 40 characters{" "}
                                <span className="float-right">{cover.length.toLocaleString()} / 5,000</span>
                              </span>
                            </label>
                          </JobFormSection>
                        </div>
                        <footer className="border-border shrink-0 border-t px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
                          <div className="flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => setCompose(false)}
                              className={workspaceStyles.secondaryAction}
                            >
                              Back
                            </button>
                            <button className={workspaceStyles.primaryAction} type="submit">
                              Send
                              <ArrowRight className="size-4" />
                            </button>
                          </div>
                        </footer>
                      </form>
                    </section>
                  ) : (
                    <>
                      <section className="border-border border-b p-6 sm:p-9">
                        <p className="text-muted-foreground text-xs font-medium">
                          {selected.posted ?? "Recently posted"}
                        </p>
                        <SheetTitle className="font-display mt-4 max-w-3xl text-3xl font-medium tracking-tight sm:text-4xl">
                          {selected.title}
                        </SheetTitle>
                        <SheetDescription className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                          <span className="inline-flex items-center gap-2">
                            <Building2 className="size-4" /> {selected.company}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Globe2 className="size-4" /> Worldwide · Remote
                          </span>
                        </SheetDescription>
                      </section>
                      <section className="border-border border-b p-6 sm:p-9">
                        <h3 className="text-lg font-semibold">Project summary</h3>
                        <p className="text-muted-foreground mt-4 max-w-3xl text-base leading-7">
                          {selected.description}
                        </p>
                      </section>
                      <section className="border-border grid gap-7 border-b p-6 sm:grid-cols-3 sm:p-9">
                        <JobFact icon={Clock3} title={selectedProjectType} detail="Engagement" />
                        <JobFact icon={Sparkles} title="Intermediate" detail="Experience level" />
                        <JobFact icon={Banknote} title={selected.budget.split(" · ")[0]} detail={selectedProjectType} />
                      </section>
                      <section className="border-border border-b p-6 sm:p-9">
                        <p className="text-sm">
                          <span className="font-semibold">Project type:</span> {selectedProjectType}
                        </p>
                      </section>
                      <section className="border-border border-b p-6 sm:p-9">
                        <h3 className="text-xl font-semibold tracking-tight">Skills and expertise</h3>
                        <p className="mt-5 text-sm font-medium">Required skills</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selected.skills.map((skill) => (
                            <span
                              key={skill}
                              className="bg-muted text-muted-foreground inline-flex min-h-8 items-center rounded-full px-3.5 text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </section>
                      <section className="grid gap-8 p-6 sm:grid-cols-2 sm:p-9">
                        <div>
                          <h3 className="text-lg font-semibold">Preferred qualifications</h3>
                          <p className="text-muted-foreground mt-3 text-sm leading-6">
                            Clear communication, relevant project examples, and reliable availability.
                          </p>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Activity on this job</h3>
                          <dl className="text-muted-foreground mt-3 space-y-2 text-sm">
                            <div className="flex justify-between gap-4">
                              <dt>Proposals</dt>
                              <dd className="text-foreground">5–10</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                              <dt>Interviewing</dt>
                              <dd className="text-foreground">1</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                              <dt>Invites sent</dt>
                              <dd className="text-foreground">2</dd>
                            </div>
                          </dl>
                        </div>
                      </section>
                    </>
                  )}
                </main>
                {!compose && (
                  <aside className="border-border bg-card border-t p-6 lg:overflow-y-auto lg:border-t-0 lg:border-l lg:p-7">
                    <div className="grid gap-3">
                      <button
                        type="button"
                        className={`${workspaceStyles.primaryAction} w-full`}
                        onClick={() => setCompose(true)}
                      >
                        {compose ? "Editing proposal" : "Apply now"}
                        {!compose && <ArrowRight className="size-4" />}
                      </button>
                      <button
                        type="button"
                        aria-pressed={saved.includes(selected.id)}
                        onClick={() =>
                          setSaved((ids) =>
                            ids.includes(selected.id) ? ids.filter((id) => id !== selected.id) : [...ids, selected.id],
                          )
                        }
                        className={`${workspaceStyles.secondaryAction} w-full`}
                      >
                        <Bookmark
                          className={`size-4 ${saved.includes(selected.id) ? "fill-primary text-primary" : ""}`}
                        />
                        {saved.includes(selected.id) ? "Job saved" : "Save job"}
                      </button>
                    </div>
                    <section className="border-border mt-8 border-t pt-7">
                      <p className="text-muted-foreground text-xs">About the client</p>
                      <h3 className="mt-2 text-xl font-semibold">{selected.company}</h3>
                      <dl className="mt-6 space-y-5 text-sm">
                        <div>
                          <dt className="text-muted-foreground">Location</dt>
                          <dd className="mt-1 font-medium">Worldwide</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Member since</dt>
                          <dd className="mt-1 font-medium">2023</dd>
                        </div>
                      </dl>
                    </section>
                  </aside>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function JobFilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${label} filter`}
      className="bg-accent text-accent-foreground inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-xs"
    >
      {label}
      <X className="size-3" />
    </button>
  );
}

function JobFact({ icon: Icon, title, detail }: { icon: typeof Wallet; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="bg-muted text-muted-foreground grid size-10 shrink-0 place-items-center rounded-xl">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold wrap-break-word">{title}</p>
        <p className="text-muted-foreground mt-1 text-xs">{detail}</p>
      </div>
    </div>
  );
}

function Empty({
  icon: Icon,
  title,
  detail,
  action,
}: {
  icon: typeof Wallet;
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <WorkspaceSurface className="bg-muted/20 grid min-h-80 place-items-center border-dashed p-8 text-center">
      <div>
        <span className="border-border bg-card text-primary mx-auto grid size-16 place-items-center rounded-2xl border">
          <Icon className="size-6" strokeWidth={1.5} />
        </span>
        <h2 className="font-display mt-5 text-2xl font-medium tracking-tight">{title}</h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-sm leading-6">{detail}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </WorkspaceSurface>
  );
}
