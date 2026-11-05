import { Send } from "lucide-react"
import { JobFormSection, jobFormField } from "@/components/common/job-form-section"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import { SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { FreelancerJob } from "@/types/job"

// The cover letter form shown inside the proposal slide-over.
export function ProposalEditor({
	job,
	cover,
	onCoverChange,
	onCancel,
	onSubmit,
	readOnly = false,
	isPendingSubmission = false,
	isSubmitting = false,
	onSend,
}: {
	job: FreelancerJob
	cover: string
	onCoverChange: (value: string) => void
	onCancel: () => void
	onSubmit: () => void
	readOnly?: boolean
	isPendingSubmission?: boolean
	isSubmitting?: boolean
	onSend: () => void
}) {
	return (
		<section className="flex min-h-0 min-w-0 flex-1 flex-col">
			<div className="border-border border-b px-6 py-6 sm:px-8">
				<p className="mb-2 font-semibold text-link text-xs uppercase tracking-wider">
					{readOnly ? "Submitted application" : "Your next opportunity"}
				</p>

				<SheetTitle className="wrap-break-word font-semibold text-2xl text-foreground tracking-tight">
					{readOnly ? "Your proposal" : isPendingSubmission ? "Edit your proposal" : "Make your introduction"}
				</SheetTitle>

				<SheetDescription className="mt-2 text-muted-foreground text-sm leading-6">
					{readOnly
						? "Your introduction and proposed terms for this project."
						: isPendingSubmission
							? "Update your cover letter while your application is under client review."
							: "A thoughtful proposal is the start of a great collaboration."}
				</SheetDescription>
			</div>

			<form
				className="flex min-h-0 min-w-0 flex-1 flex-col"
				onSubmit={(event) => {
					event.preventDefault()
					if (!readOnly && !isPendingSubmission) onSubmit()
				}}
			>
				<div className="min-h-0 min-w-0 flex-1 space-y-7 overflow-y-auto overflow-x-hidden px-6 py-6 sm:px-8">
					<div className="rounded-xl border border-border bg-muted/40 p-4 wrap-break-word">
						<p className="text-muted-foreground text-xs">
							{readOnly ? "Proposal for" : "Applying to"} · {job.company}
						</p>
						<p className="mt-2 font-semibold text-foreground text-sm leading-6">{job.title}</p>
						<p className="mt-2 text-muted-foreground text-xs">{job.budget}</p>
					</div>

					<JobFormSection
						title="Tell them why you're a good fit"
						description="Share relevant experience and how you'd approach this project."
					>
						<label className="block font-medium text-foreground text-sm">
							Cover letter
							<textarea
								readOnly={readOnly}
								required
								minLength={40}
								maxLength={3000}
								rows={7}
								value={cover}
								onChange={(event) => onCoverChange(event.target.value)}
								placeholder="Hi! Your project caught my attention because…"
								className={cn(jobFormField, "mt-2 min-h-40 resize-y text-foreground leading-6")}
							/>
							<span className="mt-2 block text-muted-foreground text-xs">
								At least 40 characters
								<span className="float-right tabular-nums">{cover.length.toLocaleString()} / 3,000</span>
							</span>
						</label>
					</JobFormSection>
				</div>

				<footer className="shrink-0 border-border border-t px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<button type="button" onClick={onCancel} className={workspaceStyles.secondaryAction}>
							{readOnly ? "Close" : "Back"}
						</button>

						{!readOnly && (
							<div className="flex flex-wrap items-center justify-end gap-2.5">
								{!isPendingSubmission && (
									<button type="submit" disabled={isSubmitting} className={workspaceStyles.secondaryAction}>
										Save as draft
									</button>
								)}
								<button
									type="button"
									disabled={cover.trim().length < 40 || cover.length > 3000 || isSubmitting}
									onClick={onSend}
									className={cn(workspaceStyles.primaryAction, "disabled:opacity-50")}
								>
									<Send className="size-3.5" />
									{isSubmitting ? "Submitting..." : isPendingSubmission ? "Update proposal" : "Apply now"}
								</button>
							</div>
						)}
					</div>
				</footer>
			</form>
		</section>
	)
}
