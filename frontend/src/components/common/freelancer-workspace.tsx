import { Link } from "@tanstack/react-router";
import { ArrowRight, Bookmark, BriefcaseBusiness, FileText, Search, type Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ChangePassword from "@/components/user-settings/change-password";
import { AppearanceSettings } from "@/components/user-settings/preferences";
import useAuth from "@/hooks/useAuth";
import { WorkspacePageHeader, WorkspaceSurface, workspaceStyles } from "../dashboard/dashboard-header";

type Job = {
  id: string;
  title: string;
  company: string;
  category: string;
  budget: string;
  description: string;
  skills: string[];
};
const samples: Job[] = [
  {
    id: "1",
    title: "Design a clearer onboarding experience",
    company: "Northstar Studio",
    category: "Design",
    budget: "$1,500–$2,500 · Fixed price",
    description:
      "We’re looking for a product designer to simplify our onboarding flow. The project includes a short discovery phase, wireframes, and a tested Figma prototype. Share a relevant example and tell us how you would approach the first week.",
    skills: ["Product design", "Figma", "UX research"],
  },
  {
    id: "2",
    title: "Build a responsive customer dashboard",
    company: "Forma",
    category: "Development",
    budget: "$50–$80/hr · 1–3 months",
    description:
      "Help our small product team build an accessible React dashboard from existing designs. You’ll work with our engineer on reusable components, API integration, and responsive behavior.",
    skills: ["React", "TypeScript", "Accessibility"],
  },
  {
    id: "3",
    title: "Create a launch content strategy",
    company: "Good Company",
    category: "Marketing",
    budget: "$800–$1,200 · Fixed price",
    description:
      "We need a clear content strategy for a new product launch. Deliverables include audience research, messaging, and a four-week editorial calendar.",
    skills: ["Content strategy", "Copywriting", "Research"],
  },
];
type Draft = {
  job: Job;
  cover: string;
  rate: string;
  status?: "Drafts" | "Submitted" | "Archived";
};
const seedProposals: Draft[] = [
  {
    job: samples[2],
    cover:
      "I would start with a short discovery workshop, then develop audience-specific messaging and a four-week content plan. My recent launch work focused on independent brands with small teams.",
    rate: "1000",
    status: "Submitted",
  },
  {
    job: samples[0],
    cover:
      "I would map the existing journey and identify the points of friction before prototyping a simpler first-run experience. I can share a tested Figma prototype within two weeks.",
    rate: "2200",
    status: "Drafts",
  },
];
const input =
  "min-h-12 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
const titles = {
  dashboard: "Your work, in one place.",
  jobs: "Find your next project.",
  proposals: "Your proposals",
  settings: "Account settings",
};
const subtitles = {
  dashboard: "Keep your profile current and move your next opportunity forward.",
  jobs: "Discover projects that fit your skills and the way you work.",
  proposals: "Keep track of the conversations you want to start.",
  projects: "Manage your active projects, milestones, and completed work.",
  settings: "Manage your account security and workspace appearance.",
};

export function FreelancerWorkspace({ page }: { page: keyof typeof titles }) {
  const { user } = useAuth();
  const jobs = samples;
  const key = `freelancer-work-v2:${user?.id ?? "preview"}`;
  const [saved, setSaved] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loaded, setLoaded] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All work");
  const [tab, setTab] = useState("Active");
  const [selected, setSelected] = useState<Job | null>(null);
  const [compose, setCompose] = useState(false);
  const [cover, setCover] = useState("");
  const [rate, setRate] = useState("");
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
  const filtered = jobs.filter(
    (j) =>
      (filter === "All work" || filter === j.category || (filter === "Saved" && saved.includes(j.id))) &&
      `${j.title} ${j.company} ${j.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase()),
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
    <div className="space-y-7">
      <WorkspacePageHeader
        eyebrow="Freelancer workspace"
        title={
          page === "dashboard" && user?.full_name
            ? `Good to see you, ${user.full_name.trim().split(/\s+/)[0]}.`
            : titles[page]
        }
        description={subtitles[page]}
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
      {page === "jobs" && (
        <>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-4 left-4 size-4" />
            <input
              aria-label="Search jobs"
              className={`${input} pl-11`}
              placeholder="Search by title or skill"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["All work", "Design", "Development", "Marketing", "Saved"].map((f) => (
              <button
                type="button"
                key={f}
                aria-pressed={filter === f}
                className={filter === f ? workspaceStyles.primaryAction : workspaceStyles.secondaryAction}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <p className="text-muted-foreground text-sm" role="status">
            {filtered.length} opportunities
          </p>
          {filtered.length ? (
            jobList
          ) : (
            <Empty
              icon={Search}
              title="No projects found"
              detail={
                jobs.length
                  ? "Try another skill or select All work."
                  : "Job listings are not available yet. Check back when the marketplace opens."
              }
            />
          )}
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
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{compose ? "Prepare your proposal" : selected?.title}</DialogTitle>
            <DialogDescription>
              {selected?.company} · {selected?.budget}
            </DialogDescription>
          </DialogHeader>
          {compose ? (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!selected) return;
                setDrafts((ds) => [
                  ...ds.filter((d) => d.job.id !== selected.id),
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
              <label className="block text-sm font-medium">
                Your introduction
                <textarea
                  required
                  minLength={40}
                  maxLength={5000}
                  className={`${input} mt-2`}
                  rows={6}
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                  placeholder="Describe your approach and relevant experience (at least 40 characters)."
                />
              </label>
              <label className="block text-sm font-medium">
                {selected?.budget.includes("Fixed price") ? "Your project budget (USD)" : "Your hourly rate (USD)"}
                <input
                  required
                  min="1"
                  type="number"
                  className={`${input} mt-2`}
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </label>
              <p className="text-muted-foreground text-xs leading-5">
                Saved on this device. You can simulate submission from Your proposals.
              </p>
              <button className={workspaceStyles.primaryAction} type="submit">
                Save draft
              </button>
            </form>
          ) : (
            <>
              <p className="text-muted-foreground text-sm leading-7">{selected?.description}</p>
              <button type="button" className={workspaceStyles.primaryAction} onClick={() => setCompose(true)}>
                Prepare proposal
                <ArrowRight className="size-4" />
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
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
