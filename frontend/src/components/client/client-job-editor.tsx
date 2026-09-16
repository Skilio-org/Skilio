import { JobFormSection, jobFormField } from "@/components/common/job-form-section";
import { workspaceStyles } from "@/components/dashboard/dashboard-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { ClientJob } from "./client-job-types";

type ClientJobEditorProps = {
  job: ClientJob | null;
  editing: boolean;
  error: string;
  onClose: () => void;
  onEditingChange: (editing: boolean) => void;
  onJobChange: (job: ClientJob) => void;
  onSave: (job: ClientJob) => void;
};

export function ClientJobEditor({
  job,
  editing,
  error,
  onClose,
  onEditingChange,
  onJobChange,
  onSave,
}: ClientJobEditorProps) {
  return (
    <Sheet open={!!job} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-card w-full gap-0 p-0 sm:max-w-180">
        <SheetHeader className="border-b px-6 py-6 pr-12 sm:px-8 sm:pr-14">
          <p className="text-primary text-xs font-semibold">{editing ? "FIND YOUR NEXT COLLABORATOR" : "YOUR JOB"}</p>
          <SheetTitle className="mt-1 text-2xl font-semibold tracking-tight">
            {editing ? "Let’s shape your project" : job?.title || "Untitled job"}
          </SheetTitle>
          <SheetDescription>
            {editing ? "A few details to help the right freelancer find you." : `${job?.status} · ${job?.category}`}
          </SheetDescription>
        </SheetHeader>
        {job && (
          <div className={editing ? "flex min-h-0 flex-1 flex-col" : "min-h-0 flex-1 overflow-y-auto p-6 sm:p-8"}>
            {error && (
              <p role="alert" className="text-destructive shrink-0 px-6 py-3 text-sm">
                {error}
              </p>
            )}
            {editing ? (
              <form
                className="flex min-h-0 flex-1 flex-col"
                onSubmit={(event) => {
                  event.preventDefault();
                  onSave({ ...job, title: job.title.trim(), status: "Open" });
                }}
              >
                <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-6 sm:px-8">
                  <JobFormSection
                    title="Start with the big picture"
                    description="What are you building, and what would a great result look like?"
                  >
                    <label className="block text-sm font-medium">
                      Job title
                      <input
                        required
                        maxLength={120}
                        pattern=".*\S.*"
                        className={jobFormField}
                        value={job.title}
                        onChange={(event) => onJobChange({ ...job, title: event.target.value })}
                        placeholder="e.g. Design an onboarding flow for our app"
                      />
                    </label>
                    <label className="block text-sm font-medium">
                      Project description
                      <textarea
                        required
                        minLength={80}
                        maxLength={5000}
                        rows={5}
                        className={`${jobFormField} min-h-32 resize-y leading-6`}
                        value={job.description}
                        onChange={(event) =>
                          onJobChange({
                            ...job,
                            description: event.target.value,
                          })
                        }
                        placeholder={"We’re looking for someone to…\nThe main deliverables are…"}
                      />
                      <span className="text-muted-foreground mt-2 flex justify-between gap-3 text-xs font-normal">
                        <span>At least 80 characters</span>
                        <span>{job.description.length.toLocaleString()} / 5,000</span>
                      </span>
                    </label>
                  </JobFormSection>
                  <div className="border-border border-t" />
                  <JobFormSection
                    title="Find the right expertise"
                    description="Choose a category and the skills your project needs."
                  >
                    <div className="text-sm font-medium">
                      <label htmlFor="job-category">Category</label>
                      <Select value={job.category} onValueChange={(category) => onJobChange({ ...job, category })}>
                        <SelectTrigger id="job-category" className="mt-2 min-h-12 w-full rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Development", "Design", "Marketing", "Writing", "AI services"].map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <label className="block text-sm font-medium">
                      Skills
                      <input
                        required
                        pattern=".*\S.*"
                        maxLength={250}
                        className={jobFormField}
                        value={job.skills}
                        onChange={(event) => onJobChange({ ...job, skills: event.target.value })}
                        placeholder="React, TypeScript, Accessibility"
                      />
                    </label>
                    <p className="text-muted-foreground text-xs">
                      Separate skills with commas, for example: React, TypeScript.
                    </p>
                  </JobFormSection>
                  <div className="border-border border-t" />
                  <JobFormSection
                    title="Set a budget"
                    description="Give freelancers a clear starting point for their proposal."
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="text-sm font-medium">
                        <label htmlFor="job-payment-type">Payment type</label>
                        <Select value={job.type} onValueChange={(type) => onJobChange({ ...job, type })}>
                          <SelectTrigger id="job-payment-type" className="mt-2 min-h-12 w-full rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fixed price">Fixed price</SelectItem>
                            <SelectItem value="Hourly">Hourly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <label className="block text-sm font-medium">
                        {job.type === "Hourly" ? "Hourly rate (USD)" : "Budget (USD)"}
                        <input
                          required
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder={job.type === "Hourly" ? "e.g. 65" : "e.g. 2000"}
                          className={jobFormField}
                          value={job.budget}
                          onChange={(event) => onJobChange({ ...job, budget: event.target.value })}
                        />
                      </label>
                    </div>
                  </JobFormSection>
                </div>
                <footer className="border-border shrink-0 border-t px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onSave({ ...job, status: "Draft" })}
                      className={workspaceStyles.secondaryAction}
                    >
                      Save draft
                    </button>
                    <button type="submit" className={workspaceStyles.primaryAction}>
                      Save as open
                    </button>
                  </div>
                </footer>
              </form>
            ) : (
              <ClientJobDetails job={job} onEdit={() => onEditingChange(true)} onSave={onSave} />
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ClientJobDetails({
  job,
  onEdit,
  onSave,
}: {
  job: ClientJob;
  onEdit: () => void;
  onSave: (job: ClientJob) => void;
}) {
  return (
    <div className="space-y-7">
      <section>
        <h3 className="font-semibold">Project brief</h3>
        <p className="text-muted-foreground mt-3 text-sm leading-7 wrap-break-word whitespace-pre-wrap">
          {job.description || "No description yet."}
        </p>
      </section>
      <section>
        <h3 className="font-semibold">Budget</h3>
        <p className="mt-2 text-sm">
          {job.budget ? `$${job.budget}${job.type === "Hourly" ? "/hr" : ""}` : "Not set"} · {job.type}
        </p>
      </section>
      <section>
        <h3 className="font-semibold">Skills</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {job.skills
            .split(",")
            .filter((skill) => skill.trim())
            .map((skill, index) => (
              <span key={`${skill}-${index}`} className="bg-muted rounded-md px-3 py-1.5 text-xs">
                {skill.trim()}
              </span>
            ))}
        </div>
      </section>
      <section className="border-t pt-6">
        <h3 className="font-semibold">Proposals</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Proposals will be available when live job posting is connected.
        </p>
      </section>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onEdit} className={workspaceStyles.primaryAction}>
          Edit job
        </button>
        {job.status === "Open" && (
          <button
            type="button"
            onClick={() => onSave({ ...job, status: "Closed" })}
            className={workspaceStyles.secondaryAction}
          >
            Close job
          </button>
        )}
        {job.status === "Closed" && (
          <button type="button" onClick={onEdit} className={workspaceStyles.secondaryAction}>
            Review and reopen
          </button>
        )}
      </div>
    </div>
  );
}
