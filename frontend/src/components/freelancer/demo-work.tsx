import { WorkspaceSurface, workspaceStyles } from "@/components/dashboard/dashboard-header";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { demoProjects, money, type DemoProject } from "@/data/freelancer-demo";
import useAuth from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const tabs = "flex flex-wrap gap-2";
function Tabs({ values, value, onChange }: { values: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className={tabs}>
      {values.map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={item === value}
          onClick={() => onChange(item)}
          className={item === value ? workspaceStyles.primaryAction : workspaceStyles.secondaryAction}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
export function DemoProjects() {
  const { user } = useAuth();
  const key = `demo-deliverables:${user?.id ?? "preview"}`;
  const [tab, setTab] = useState("Active");
  const [selected, setSelected] = useState<DemoProject | null>(null);
  const [note, setNote] = useState("");
  const [submissions, setSubmissions] = useState<Record<string, string>>({});
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "{}");
      setSubmissions(
        Object.fromEntries(
          Object.entries(raw).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
        ),
      );
    } catch {
      setSubmissions({});
    }
  }, [key]);
  const projects = demoProjects.filter((project) => tab === "Contracts" || project.status === tab);
  return (
    <div className="space-y-6">
      <Tabs values={["Active", "Completed", "Contracts"]} value={tab} onChange={setTab} />
      <div className="grid gap-5 lg:grid-cols-2">
        {projects.map((project) => {
          const complete = project.milestones.filter((item) => item.done).length;
          return (
            <WorkspaceSurface key={project.id} className="flex flex-col p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground text-xs">{project.company}</span>
                <span className="bg-accent text-accent-foreground rounded-md px-2.5 py-1 text-xs font-medium">
                  {project.status}
                </span>
              </div>
              <h2 className="font-display mt-4 text-2xl font-medium tracking-tight">{project.title}</h2>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="font-medium">
                  {money(project.amount)} <span className="text-muted-foreground font-normal">· Fixed price</span>
                </span>
                <span className="text-muted-foreground">
                  {project.status === "Completed" ? "Completed" : "Due"} {project.due}
                </span>
              </div>
              <div
                className="bg-muted mt-6 h-1.5 overflow-hidden rounded-full"
                role="progressbar"
                aria-label={`${project.title} milestones`}
                aria-valuenow={complete}
                aria-valuemin={0}
                aria-valuemax={project.milestones.length}
              >
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${(complete / project.milestones.length) * 100}%` }}
                />
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                {complete} of {project.milestones.length} milestones approved
              </p>
              <div className="border-border mt-6 flex flex-1 flex-col gap-3 border-t pt-5">
                {project.milestones.map((milestone, index) => (
                  <div key={milestone.title} className="flex items-start gap-3 text-sm">
                    <span
                      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${milestone.done ? "bg-accent text-primary" : "border-border text-muted-foreground border"}`}
                    >
                      {milestone.done ? <Check className="size-3" /> : <span className="text-[10px]">{index + 1}</span>}
                    </span>
                    <span className="flex-1">{milestone.title}</span>
                    <span className="text-muted-foreground">{money(milestone.amount)}</span>
                  </div>
                ))}
              </div>
              {submissions[project.id] && (
                <p role="status" className="text-primary mt-5 flex items-center gap-2 text-xs">
                  <Clock3 className="size-3.5" />
                  Demo submission awaiting review
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelected(project);
                    setNote(submissions[project.id] ?? "");
                  }}
                  className={workspaceStyles.secondaryAction}
                >
                  {tab === "Contracts" ? "View contract" : "Open project"}
                  <ArrowUpRight className="size-4" />
                </button>
                <Link
                  to="/freelancer-messages"
                  search={{ with: project.client }}
                  className={workspaceStyles.secondaryAction}
                >
                  Message client
                </Link>
              </div>
            </WorkspaceSurface>
          );
        })}
      </div>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>{selected?.company} · Demo contract</DialogDescription>
          </DialogHeader>
          {selected && (
            <>
              <dl className="bg-muted/50 grid grid-cols-2 gap-5 rounded-xl p-5 text-sm">
                <div>
                  <dt className="text-muted-foreground">Contract value</dt>
                  <dd className="mt-1 font-semibold">{money(selected.amount)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Due date</dt>
                  <dd className="mt-1 font-semibold">{selected.due}, 2026</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Payment</dt>
                  <dd className="mt-1">Fixed price · Milestones</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="mt-1">{selected.status}</dd>
                </div>
              </dl>
              <p className="text-muted-foreground text-sm leading-6">
                Each milestone includes one review round and a final handoff. This sample contract is provided for
                exploring the workspace.
              </p>
              {selected.status === "Active" ? (
                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const next = { ...submissions, [selected.id]: note.trim() };
                    try {
                      localStorage.setItem(key, JSON.stringify(next));
                      setSubmissions(next);
                      setSelected(null);
                      toast.success("Demo deliverable submitted for review");
                    } catch {
                      toast.error("Could not save this demo submission on your device.");
                    }
                  }}
                >
                  <label className="block text-sm font-medium">
                    Delivery notes
                    <textarea
                      required
                      minLength={20}
                      maxLength={3000}
                      rows={4}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="Summarize the deliverable and include a link to your work."
                      className="border-input bg-card mt-2 w-full rounded-lg border p-3 text-base sm:text-sm"
                    />
                  </label>
                  <p className="text-muted-foreground text-xs">
                    Demo only. Saved on this device; nothing is sent to a client.
                  </p>
                  <button type="submit" className={workspaceStyles.primaryAction}>
                    {submissions[selected.id] ? "Update demo submission" : "Submit demo deliverable"}
                  </button>
                </form>
              ) : (
                <div className="border-border rounded-xl border p-5">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Check className="text-primary size-4" />
                    All milestones completed
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    “Thoughtful, clear, and a pleasure to work with.”
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">Sample client feedback · 5.0 / 5</p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
