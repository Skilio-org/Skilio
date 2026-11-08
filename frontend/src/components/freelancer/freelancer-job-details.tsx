import { ArrowRight, Banknote, Bookmark, Building2, CircleCheck, Clock3, Globe2, MessageSquare, Send, UserPlus } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Link } from "@tanstack/react-router"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { connectionNoteMaxLength, useConnectionStatus, useSendConnectionRequest } from "@/hooks/useConnections"
import { useFreelancerProposals } from "@/hooks/useFreelancerProposals"
import { useSavedJobs } from "@/hooks/useSavedJobs"
import type { FreelancerJob } from "@/types/job"

export const JobDetails = ({
	job,
	projectType,
	initiallyApplying = false,
}: {
	job: FreelancerJob
	projectType: string
	initiallyApplying?: boolean
}) => {
	const { saved: savedIds, toggleSaved: toggleBookmark } = useSavedJobs()
	const saved = savedIds.includes(job.id)
	const { isSubmitted, getProposal, saveProposal } = useFreelancerProposals()
	const submitted = isSubmitted(job.id)
	const existingProposal = getProposal(job.id)

	const [connectOpen, setConnectOpen] = useState(false)
	const [connectNote, setConnectNote] = useState("")
	const { data: connectionStatus, isLoading: isLoading } = useConnectionStatus(job.clientId)
	const sendConnectionMutation = useSendConnectionRequest()

	const [applying, setApplying] = useState(() => initiallyApplying && !submitted)
	const coverInput = useRef<HTMLTextAreaElement>(null)

	useEffect(() => {
		if (applying) coverInput.current?.focus()
	}, [applying])

	const [cover, setCover] = useState(() => (!submitted && existingProposal ? existingProposal.cover : ""))

	useEffect(() => {
		if (submitted) {
			setApplying(false)
		}
	}, [submitted])

	const toggleSaved = () => {
		toggleBookmark(job.id)
	}

	const handleSaveDraft = async () => {
		if (submitted) {
			toast.error("You have already submitted a proposal for this job.")
			setApplying(false)
			return
		}
		try {
			await saveProposal(job, cover, "Drafts")
			setApplying(false)
			toast.success("Draft saved", { description: "You can review it in Proposals." })
		} catch {
			toast.error("Couldn't save your draft.")
		}
	}

	const handleSendConnection = async (e: React.FormEvent) => {
		e.preventDefault();

		if (connectNote.length > connectionNoteMaxLength) {
			toast.error(`Introductory note cannot exceed ${connectionNoteMaxLength} characters.`);
			return;
		}
		if (job.clientId == undefined || !job.clientId)
			return ;
		try {
			await sendConnectionMutation.mutateAsync({
				receiver_id: job.clientId,
				job_post_id: job.id || undefined,
				note: connectNote.trim() || undefined,
			});

			setConnectOpen(false);
			// setRecipientId("");
			// setJobPostId("");
			setConnectNote("");
		} catch {
		// error handled in mutation hook
		}
  	};

	const handleApplyNow = async () => {
		if (submitted) {
			toast.error("You have already submitted a proposal for this job.")
			setApplying(false)
			return
		}
		if (cover.trim().length < 40) {
			toast.error("Add a cover letter of at least 40 characters before submitting.")
			coverInput.current?.focus()
			return
		}
		try {
			await saveProposal(job, cover, "Submitted")
			setApplying(false)
			toast.success("Proposal submitted")
		} catch {
			toast.error("Couldn't submit your proposal.")
		}
	}
	const primary =
		"flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container dark:bg-on-surface dark:text-background dark:hover:bg-white"
	return (
		<div className="min-h-0 flex-1 overflow-y-auto bg-surface-container-lowest text-on-surface">
			<div className="grid min-h-full md:grid-cols-[minmax(0,1fr)_260px]">
				<div className="min-w-0">
					<section className="border-outline-variant/60 border-b px-6 py-7 sm:px-8">
						<p className="mb-3 font-caption font-medium text-caption text-link uppercase tracking-wider">
							{job.category} · Opportunity
						</p>
						<SheetTitle className="max-w-2xl font-headline-lg font-semibold text-2xl text-on-surface leading-8 tracking-tight">
							{job.title}
						</SheetTitle>
						<SheetDescription className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-caption text-caption text-on-surface-variant">
							<span>{job.posted}</span>
							<span className="inline-flex items-center gap-1.5">
								<Globe2 className="size-3.5" />
								Worldwide · Remote
							</span>
						</SheetDescription>
					</section>
					<section className="border-outline-variant/60 border-b px-6 py-6 sm:px-8">
						<h3 className="font-semibold text-headline-sm">About the project</h3>
						{job.experience && (
							<p className="mt-3 font-medium text-body-sm text-on-surface">Experience level: {job.experience}</p>
						)}
						<p className="mt-3 whitespace-pre-line font-body-sm text-body-sm text-on-surface-variant leading-6">
							{job.description}
						</p>
					</section>
					<section className="grid grid-cols-2 gap-6 border-outline-variant/60 border-b px-6 py-6 sm:px-8">
						<div>
							<Banknote className="mb-3 size-5 text-outline" />
							<p className="font-semibold text-body-md">{job.budget.split(" · ")[0]}</p>
							<p className="mt-1 text-caption text-on-surface-variant">
								{projectType === "Hourly" ? "Hourly rate" : "Project budget"}
							</p>
						</div>
						<div>
							<Clock3 className="mb-3 size-5 text-outline" />
							<p className="font-semibold text-body-md">{projectType}</p>
							<p className="mt-1 text-caption text-on-surface-variant">
								{job.budget.split(" · ")[1] !== "Fixed price"
									? job.budget.split(" · ")[1] || "Project-based engagement"
									: "Project-based engagement"}
							</p>
						</div>
					</section>
					<section className="px-6 py-6 sm:px-8">
						<h3 className="font-semibold text-headline-sm">Skills and expertise</h3>
						<div className="mt-3 flex flex-wrap gap-1.5">
							{job.skills.map((skill) => (
								<span
									key={skill}
									className="rounded border border-transparent bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-secondary-fixed-variant dark:border-border-subtle dark:text-on-surface-soft"
								>
									{skill}
								</span>
							))}
						</div>
					</section>
					{submitted && (
						<section className="border-outline-variant/60 border-t px-6 py-6 sm:px-8">
							<div className="flex items-center gap-2 font-medium text-body-sm text-link">
								<CircleCheck className="size-4" />
								<span>You have already submitted a proposal for this project.</span>
							</div>
							{existingProposal?.cover && (
								<div className="mt-3 rounded-lg border border-outline-variant/60 bg-surface-container-low/50 p-4">
									<p className="font-caption font-medium text-caption text-on-surface-variant">
										Your submitted introduction
									</p>
									<p className="mt-2 whitespace-pre-line text-body-sm text-on-surface-variant leading-relaxed">
										{existingProposal.cover}
									</p>
								</div>
							)}
						</section>
					)}
					{applying && !submitted && (
						<section className="border-outline-variant/60 border-t px-6 py-6 sm:px-8">
							<h3 className="font-semibold text-headline-sm">Make your introduction</h3>
							<p className="mt-1 text-body-sm text-on-surface-variant">
								A thoughtful proposal is the start of a great collaboration.
							</p>
							<form
								onSubmit={(event) => {
									event.preventDefault()
								}}
								className="mt-4 space-y-4"
							>
								<label className="block text-label-sm">
									Cover letter
									<textarea
										ref={coverInput}
										required
										minLength={40}
										maxLength={5000}
										rows={5}
										value={cover}
										onChange={(event) => setCover(event.target.value)}
										placeholder="Introduce yourself and explain your approach…"
										className="mt-2 w-full rounded-lg border border-outline-variant bg-background p-3 text-body-sm outline-none focus:border-primary"
									/>
									<span className="mt-1.5 block text-caption text-outline">
										At least 40 characters ({cover.length.toLocaleString()} / 5,000)
									</span>
								</label>
								<div className="flex items-center justify-between gap-3 pt-2">
									<button
										type="button"
										onClick={() => {
											setApplying(false)
											setCover("")
										}}
										className="inline-flex h-10 items-center justify-center rounded-lg px-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
									>
										Cancel
									</button>
									<div className="flex items-center gap-2.5">
										<button
											type="button"
											onClick={handleSaveDraft}
											className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
										>
											Save as draft
										</button>
										<button
											type="button"
											disabled={cover.trim().length < 40 || cover.length > 5000}
											onClick={handleApplyNow}
											className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:opacity-50 dark:bg-on-surface dark:text-background dark:hover:bg-white"
										>
											<Send className="size-4" />
											Apply now
										</button>
									</div>
								</div>
							</form>
						</section>
					)}
				</div>
				<aside className="border-outline-variant/60 border-t bg-surface-container-low/40 p-6 md:border-t-0 md:border-l">
					<div className="space-y-2.5">
						{submitted ? (
							<div className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/10 font-label-md text-label-md text-link dark:border-border-subtle dark:bg-surface-container">
								<CircleCheck className="size-4 text-link" />
								<span>Proposal submitted</span>
							</div>
						) : (
							<button
								type="button"
								className={primary}
								onClick={handleApplyNow}
							>
								{existingProposal ? "Continue proposal" : "Apply now"}
								<ArrowRight className="size-4" />
							</button>
						)}
						<button
							type="button"
							onClick={toggleSaved}
							aria-pressed={saved}
							className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-label-md text-on-surface hover:bg-surface-container"
						>
							<Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />
							{saved ? "Saved job" : "Save job"}
						</button>

						{/* Connect with Client Flow (F4, F5, F6) */}
						{job.clientId && !isLoading && (
							connectionStatus?.status === "connected" ? (
								<Link
									to="/freelancer-messages"
									search={{ userId: job.clientId }}
									className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/10 font-label-md text-label-md text-link hover:bg-primary/20"
								>
									<MessageSquare className="size-4" />
									<span>Message client (Connected)</span>
								</Link>
							) : connectionStatus?.status === "pending_sent" ? (
								<div className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 font-label-md text-label-md text-amber-600 dark:text-amber-400">
									<Clock3 className="size-4" />
									<span>Connection pending</span>
								</div>
							) : (
								<button
									type="button"
									onClick={() => setConnectOpen(true)}
									className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest font-label-md text-label-md text-on-surface hover:bg-surface-container"
								>
									<UserPlus className="size-4 text-link" />
									<span>Connect with client</span>
								</button>
							)
						)}
					</div>
					<section className="mt-7 border-outline-variant/60 border-t pt-6">
						<h3 className="font-semibold text-headline-sm">About the client</h3>
						<div className="mt-4 flex items-center gap-3">
							<span className="grid size-9 shrink-0 place-items-center rounded-lg border border-outline-variant bg-surface-container-lowest text-link">
								<Building2 className="size-4" />
							</span>
							<div>
								<p className="font-medium text-body-sm">{job.company}</p>
								<p className="mt-0.5 text-caption text-on-surface-variant">Project owner</p>
							</div>
						</div>
						<p className="mt-4 text-body-sm text-on-surface-variant leading-5">
							Hiring for {job.category.toLowerCase()}.
						</p>
					</section>
					<section className="mt-6 border-outline-variant/60 border-t pt-5">
						<h3 className="font-medium text-label-sm">Your next step</h3>
						<p className="mt-2 text-body-sm text-on-surface-variant leading-5">
							{submitted
								? "You have already submitted a proposal for this project. Track its progress in Proposals."
								: "Share relevant work and how you would approach this project. You can apply directly or save your proposal as a draft."}
						</p>
					</section>
				</aside>
			</div>

			{/* Connect with Client Dialog (Flowchart F4, F5) */}
			<Dialog open={connectOpen} onOpenChange={setConnectOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<UserPlus className="size-5 text-link" />
							<span>Connect with {job.company}</span>
						</DialogTitle>
						<DialogDescription>
							Send a connection inquiry regarding "{job.title}". Once accepted, direct chat and collaboration will be unlocked.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSendConnection} className="space-y-4 py-2">
						<div className="space-y-1.5">
							<div className="flex items-center justify-between">
								<label htmlFor="connect-note" className="text-sm font-medium">
									Introductory Note (Optional)
								</label>
								<span
									className={`text-[11px] ${
										connectNote.length > connectionNoteMaxLength ? "text-destructive font-semibold" : "text-muted-foreground"
									}`}
								>
									{connectNote.length}/{connectionNoteMaxLength}
								</span>
							</div>
							<textarea
								id="connect-note"
								rows={3}
								maxLength={connectionNoteMaxLength}
								placeholder="Add a brief note about why you are a great fit for this project..."
								value={connectNote}
								onChange={(e) => setConnectNote(e.target.value)}
								className="w-full rounded-lg border border-input bg-surface-container-lowest px-3 py-2.5 text-sm leading-6 outline-none transition-[color,box-shadow] placeholder:text-muted-foreground hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/25"
							/>
						</div>

						<DialogFooter className="mt-4 gap-2">
							<button
								type="button"
								onClick={() => setConnectOpen(false)}
								className="inline-flex h-9 items-center justify-center rounded-lg border border-outline-variant px-4 text-sm font-medium hover:bg-surface-container"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={sendConnectionMutation.isPending || connectNote.length > connectionNoteMaxLength}
								className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-50"
							>
								<Send className="size-3.5" />
								<span>{sendConnectionMutation.isPending ? "Sending..." : "Send Connection Request"}</span>
							</button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}
