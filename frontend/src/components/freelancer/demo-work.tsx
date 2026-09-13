import { Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowUpRight, Check, Clock3, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WorkspaceSurface, workspaceStyles } from "@/components/dashboard/dashboard-header";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { demoProjects, demoTransactions, money, type DemoProject } from "@/data/freelancer-demo";
import useAuth from "@/hooks/useAuth";

const tabs = "flex flex-wrap gap-2";
function Tabs({
  values,
  value,
  onChange,
}: {
  values: string[];
  value: string;
  onChange: (value: string) => void;
}) {
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
                  {money(project.amount)}{" "}
                  <span className="text-muted-foreground font-normal">· Fixed price</span>
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
                      {milestone.done ? (
                        <Check className="size-3" />
                      ) : (
                        <span className="text-[10px]">{index + 1}</span>
                      )}
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
                Each milestone includes one review round and a final handoff. This sample contract is provided
                for exploring the workspace.
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

export function DemoEarnings() {
  const [filter, setFilter] = useState("All transactions");
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const transactions = demoTransactions.filter(
    (item) => filter === "All transactions" || item.status === filter,
  );
  const exportStatement = () => {
    const csv = [
      "ID,Date,Description,Client,Amount USD,Status",
      ...transactions.map((item) =>
        [item.id, item.date, item.description, item.company, item.amount, item.status]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "demo-earnings.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          [
            "Available balance",
            requested ? "$0" : "$3,000",
            requested ? "Demo payout requested" : "Ready for a demo payout",
          ],
          ["In review", "$600", "Northstar · Discovery milestone"],
          ["Total earned", "$6,000", "Across 4 demo payments"],
        ].map(([title, value, detail]) => (
          <WorkspaceSurface key={title} className="workspace-metric p-6">
            <p className="text-muted-foreground text-sm">{title}</p>
            <p className="mt-4 text-3xl font-semibold tracking-tight">
              {value}
              <span className="text-muted-foreground ml-2 text-xs font-normal">USD</span>
            </p>
            <p className="text-muted-foreground mt-3 text-xs">{detail}</p>
          </WorkspaceSurface>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <WorkspaceSurface className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl font-medium">Your earning rhythm</h2>
              <p className="text-muted-foreground mt-2 text-xs">Demo earnings · April–September 2026</p>
            </div>
            <span className="text-sm font-medium">$6,000</span>
          </div>
          <div
            className="mt-8 flex h-40 items-end gap-3 sm:gap-6"
            role="img"
            aria-label="Demo earnings: April 0 dollars, May 0, June 0, July 0, August 2400, September 3600"
          >
            {[
              ["Apr", 0],
              ["May", 0],
              ["Jun", 0],
              ["Jul", 0],
              ["Aug", 2400],
              ["Sep", 3600],
            ].map(([month, value]) => (
              <div key={month} className="flex h-full flex-1 flex-col justify-end gap-2 text-center">
                <span className="text-muted-foreground text-[10px]">{money(Number(value))}</span>
                <div
                  className={`min-h-1 rounded-t-md ${month === "Sep" ? "bg-primary" : "bg-primary/25"}`}
                  style={{ height: `${(Number(value) / 3600) * 100}px` }}
                />
                <span className="text-muted-foreground text-xs">{month}</span>
              </div>
            ))}
          </div>
        </WorkspaceSurface>
        <WorkspaceSurface className="flex flex-col p-6">
          <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Payout account
          </span>
          <h2 className="font-display mt-4 text-xl font-medium">Demo bank ·· 4821</h2>
          <p className="text-muted-foreground mt-3 flex-1 text-sm leading-6">
            Explore the payout flow using a sample account. No real bank details or funds are involved.
          </p>
          <button
            type="button"
            disabled={requested}
            onClick={() => setPayoutOpen(true)}
            className={`${workspaceStyles.primaryAction} mt-5 disabled:opacity-50`}
          >
            {requested ? "Demo payout requested" : "Preview payout"}
            <ArrowUpRight className="size-4" />
          </button>
        </WorkspaceSurface>
      </div>
      <WorkspaceSurface className="overflow-hidden">
        <div className="border-border flex flex-wrap items-center justify-between gap-4 border-b p-5 sm:p-6">
          <div>
            <h2 className="font-display text-xl font-medium">Transaction history</h2>
            <p className="text-muted-foreground mt-1 text-xs">All amounts in USD · Demo data</p>
          </div>
          <button type="button" onClick={exportStatement} className={workspaceStyles.secondaryAction}>
            <ArrowDownToLine className="size-4" />
            Export CSV
          </button>
        </div>
        <div className="p-5">
          <Tabs
            values={["All transactions", "Available", "Pending", "Paid out"]}
            value={filter}
            onChange={setFilter}
          />
        </div>
        <div className="divide-border divide-y">
          {transactions.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-5 sm:gap-5 sm:px-6">
              <span className="bg-muted hidden size-10 shrink-0 place-items-center rounded-xl sm:grid">
                <FileText className="text-muted-foreground size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium">{item.description}</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  {item.company} · {item.date}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold">{money(item.amount)}</p>
                <p className="text-muted-foreground mt-1 text-xs">{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </WorkspaceSurface>
      <Dialog open={payoutOpen} onOpenChange={setPayoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview your payout</DialogTitle>
            <DialogDescription>This is a simulation. No money will move.</DialogDescription>
          </DialogHeader>
          <dl className="space-y-4 py-4 text-sm">
            <div className="flex justify-between">
              <dt>Demo available balance</dt>
              <dd className="font-semibold">$3,000.00 USD</dd>
            </div>
            <div className="flex justify-between">
              <dt>Destination</dt>
              <dd>Demo bank ·· 4821</dd>
            </div>
            <div className="flex justify-between">
              <dt>Estimated arrival</dt>
              <dd>2–3 business days</dd>
            </div>
          </dl>
          <button
            type="button"
            className={workspaceStyles.primaryAction}
            onClick={() => {
              setRequested(true);
              setPayoutOpen(false);
              toast.success("Demo payout requested. No money was transferred.");
            }}
          >
            Simulate payout request
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
