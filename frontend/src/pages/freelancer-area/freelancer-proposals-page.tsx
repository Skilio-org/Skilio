import { Link } from "@tanstack/react-router"
import {
	Archive,
	ArrowLeft,
	ArrowRight,
	Bookmark,
	CircleCheck,
	FilePenLine,
	FileText,
	Search,
	Send,
	X,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { JobDetails } from "@/components/freelancer/freelancer-job-details"
import { JobFormSection, jobFormField } from "@/components/common/job-form-section"
import { WorkspacePageHeader, WorkspaceSurface } from "@/components/dashboard/dashboard-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { type BackendProposal, useFreelancerProposals } from "@/hooks/useFreelancerProposals"
import { useErrorToast } from "@/hooks/useErrorToast"
import type { FreelancerJob } from "@/types/job"

type ProposalTab = "Drafts" | "Submitted" | "Archived"
const workspaceStyles = {
	primaryAction:
		"inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md text-on-primary transition-colors hover:opacity-90 dark:bg-on-surface dark:text-background",
	secondaryAction:
		"inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low",
}
const proposalStatuses = [
	{
		label: "Drafts" as const,
		title: "Ready for your next move",
		description: "Finish your introduction and make it count.",
	},
	{
		label: "Submitted" as const,
		title: "Out in the world",
		description: "Keep track of the proposals you’ve sent.",
	},
	{
		label: "Archived" as const,
		title: "Filed for later",
		description: "Past proposals, ready when you need them.",
	},
]

const FreelancerProposalsPage = () => {
	const { drafts, error, saveProposal, withdrawProposal } = useFreelancerProposals()
	useErrorToast(error, "freelancer-proposals-load")

	const [tab, setTab] = useState<ProposalTab>("Drafts")
	const [query, setQuery] = useState("")
	const [sort, setSort] = useState("default")
	const counts = (status: ProposalTab) => drafts.filter((draft) => (draft.status ?? "Drafts") === status).length
	const selectTab = (status: ProposalTab) => {
		setTab(status)
		setQuery("")
	}

	const [selected, setSelected] = useState<FreelancerJob | null>(null)
	const [compose, setCompose] = useState(false)

	const [cover, setCover] = useState("")

	const visibleProposals = drafts
		.filter(
			(draft) =>
				(draft.status ?? "Drafts") === tab &&
				`${draft.job.title} ${draft.job.company} ${draft.job.skills.join(" ")}`
					.toLowerCase()
					.includes(query.trim().toLowerCase()),
		)
		.sort((a, b) => (sort === "title" ? a.job.title.localeCompare(b.job.title) : 0))
	const selectedReadOnly =
		!!selected && drafts.some((draft) => draft.job.id === selected.id && (draft.status ?? "Drafts") !== "Drafts")

	const selectedProjectType =
		selected?.projectType ?? (selected?.budget.toLowerCase().includes("fixed") ? "Fixed price" : "Hourly")

	const changeProposal = async (id: string, status: ProposalTab) => {
		const proposal = drafts.find((draft) => draft.job.id === id)
		if (!proposal) return
		if (status === "Submitted" && proposal?.status === "Submitted") {
			toast.error("You have already submitted a proposal for this job.")
			return
		}
		if (status === "Submitted" && proposal && proposal.cover.trim().length < 40) {
			toast.error("Add a cover letter of at least 40 characters before submitting.")
			openProposal(proposal.job, proposal)
			return
		}
		if (status === "Archived") {
			try {
				await withdrawProposal(proposal.proposalId)
				toast.success("Proposal withdrawn")
			} catch {
				toast.error("Couldn't withdraw the proposal.")
			}
			return
		}
		if (proposal.status === "Archived") {
			toast.error("Archived proposals cannot be restored.")
			return
		}
		try {
			await saveProposal(proposal.job, proposal.cover, status)
			toast.success(status === "Submitted" ? "Proposal submitted" : "Proposal restored to drafts")
		} catch {
			toast.error("Couldn't update the proposal.")
		}
	}

	const openProposal = (job: FreelancerJob, draft: BackendProposal) => {
		setSelected(job)
		setCompose(true)
		setCover(draft.cover)
	}

	const openJob = (job: FreelancerJob) => {
		setSelected(job)
		setCompose(false)
		setCover("")
	}

	const closeSheet = () => {
		setSelected(null)
		setCompose(false)
		setCover("")
	}

	const saveDraft = async () => {
		if (!selected) return

		const existing = drafts.find((draft) => draft.job.id === selected.id)
		if (existing?.status === "Submitted") {
			toast.error("You have already submitted a proposal for this job.")
			closeSheet()
			return
		}

		try {
			await saveProposal(selected, cover, "Drafts")
			closeSheet()
			toast.success("Proposal draft saved")
		} catch {
			toast.error("Couldn't save the proposal draft.")
		}
	}

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 py-8 md:px-6 md:py-10">
			<WorkspacePageHeader
				eyebrow="Freelancer workspace"
				title="Your proposals"
				description="From a thoughtful introduction to your next collaboration."
				meta={
					<span className="font-medium text-primary">
						{counts("Drafts")} {counts("Drafts") === 1 ? "draft" : "drafts"} to make your own
					</span>
				}
				action={
					<div className="flex shrink-0 flex-wrap items-center gap-2.5">
						<Link to="/freelancer-saved-jobs" className={workspaceStyles.secondaryAction}>
							<Bookmark className="size-4" />
							Saved jobs
						</Link>
						<Link to="/freelancer-jobs" className={workspaceStyles.primaryAction}>
							<Search className="size-4" />
							Find opportunities
						</Link>
					</div>
				}
			/>
			<section aria-label="Proposal overview" className="grid grid-cols-3 gap-2 sm:gap-3">
				{proposalStatuses.map(({ label, description }) => (
					<button
						key={label}
						type="button"
						onClick={() => selectTab(label)}
						aria-pressed={tab === label}
						className={`group rounded-lg border bg-surface-container-lowest p-3 text-left transition-colors hover:border-outline sm:p-5 ${tab === label ? "border-outline" : "border-outline-variant"}`}
					>
						<div className="flex items-center justify-between">
							<span className="font-label-md text-caption text-on-surface-variant sm:text-label-md">
								{label === "Drafts" ? "In progress" : label}
							</span>
						</div>
						<div className="mt-3 flex items-end justify-between">
							<span className="font-headline-xl font-semibold text-headline-xl tabular-nums tracking-tight">
								{counts(label).toString().padStart(2, "0")}
							</span>
						</div>
						<p className="mt-2 hidden text-caption text-on-surface-variant sm:block">{description}</p>
					</button>
				))}
			</section>
			<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(280px,1fr)] lg:gap-8">
				<section aria-label="Your proposal list" className="min-w-0 space-y-5">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<fieldset aria-label="Proposal status" className="flex min-w-0 flex-wrap gap-1.5">
							{proposalStatuses.map(({ label }) => (
								<button
									key={label}
									type="button"
									aria-pressed={tab === label}
									onClick={() => selectTab(label)}
									className={
										tab === label
											? "flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 font-label-md text-label-md text-surface-container-lowest transition-colors dark:bg-on-surface dark:text-background"
											: "flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface dark:border-border-subtle"
									}
								>
									<span>{label}</span>
									<span
										className={
											tab === label
												? "rounded bg-white/20 px-1.5 py-0.5 font-caption text-caption dark:bg-background/15 dark:text-background"
												: "rounded bg-surface-container px-1.5 py-0.5 font-caption text-caption text-outline"
										}
									>
										{counts(label)}
									</span>
								</button>
							))}
						</fieldset>
						<div className="flex items-center gap-2">
							<span className="font-caption text-caption text-outline">Sort by:</span>
							<Select value={sort} onValueChange={setSort}>
								<SelectTrigger
									size="sm"
									aria-label="Sort proposals"
									className="w-44 rounded-lg border-outline-variant bg-surface-container-lowest px-3 font-normal text-[12px] text-on-surface leading-4 shadow-none hover:border-outline data-[state=open]:border-primary dark:bg-surface-card dark:hover:bg-surface-container [&>svg]:transition-transform data-[state=open]:[&>svg]:rotate-180"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent
									align="end"
									sideOffset={6}
									className="w-[var(--radix-select-trigger-width)] min-w-0 rounded-lg border-outline-variant bg-surface-container-lowest p-1 text-on-surface shadow-md [&_[data-radix-select-viewport]]:min-w-0"
								>
									{[
										["default", "Default order"],
										["title", "Project title"],
									].map(([value, label]) => (
										<SelectItem
											key={value}
											value={value}
											className="min-h-8 cursor-pointer rounded px-3 pr-8 font-normal text-[12px] leading-4 focus:bg-surface-container focus:text-on-surface data-[state=checked]:bg-surface-container data-[state=checked]:text-primary"
										>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<label className="flex h-11 items-center gap-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 focus-within:border-primary">
						<Search className="size-4 shrink-0 text-outline" />
						<span className="sr-only">Search proposals</span>
						<input
							type="text"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search by project, client, or skill"
							className="min-w-0 flex-1 bg-transparent text-body-sm outline-none"
						/>
						{query && (
							<button
								type="button"
								aria-label="Clear proposal search"
								onClick={() => setQuery("")}
								className="rounded p-1 text-outline hover:text-on-surface"
							>
								<X className="size-4" />
							</button>
						)}
					</label>
					<div className="flex items-center justify-between gap-3">
						<h2 className="font-headline-sm font-semibold text-headline-sm">
							{proposalStatuses.find((status) => status.label === tab)?.title}
						</h2>
						<span role="status" className="text-caption text-outline">
							{visibleProposals.length} {visibleProposals.length === 1 ? "proposal" : "proposals"}
						</span>
					</div>
					{visibleProposals.length ? (
						<div className="space-y-3.5">
							{visibleProposals.map((draft) => (
								<article
									key={draft.job.id}
									className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 transition-colors hover:border-outline"
								>
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2 text-caption text-outline">
												<span className="font-medium text-on-surface-variant">{draft.job.company}</span>
												<span aria-hidden="true">·</span>
												<span>Remote</span>
												<span aria-hidden="true">·</span>
												<span>{draft.job.category}</span>
											</div>
											<button
												type="button"
												onClick={() => openJob(draft.job)}
												className="mt-1.5 text-left font-headline-md font-semibold text-headline-md text-on-surface hover:text-primary"
											>
												{draft.job.title}
											</button>
										</div>
										<span className="inline-flex shrink-0 items-center gap-1.5 rounded border border-outline-variant bg-surface-container-low px-2 py-1 text-caption text-on-surface-variant">
											{tab === "Drafts" ? (
												<FilePenLine className="size-3" />
											) : tab === "Submitted" ? (
												<Send className="size-3" />
											) : (
												<Archive className="size-3" />
											)}
											{tab === "Drafts" ? "Draft" : tab}
										</span>
									</div>
									<div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-caption">
										<div>
											<span className="mr-2 text-on-surface-variant">Project budget</span>
											<strong className="font-numeric-data font-semibold text-[16px] text-on-surface">
												{draft.job.budget.split(" · ")[0]}
											</strong>
										</div>
										<span className="text-outline">{draft.job.projectType} contract</span>
									</div>
									<div className="mt-4 rounded-lg border border-outline-variant/50 bg-surface-container-low/50 p-3.5">
										<p className="mb-1.5 font-caption font-medium text-caption text-on-surface-variant">
											Your introduction
										</p>
										<p className="line-clamp-3 text-body-sm text-on-surface-variant leading-relaxed">
											{draft.cover ||
												"A great proposal starts with a personal introduction. Tell the client how you can help."}
										</p>
									</div>
									<div className="mt-4 flex flex-col gap-3 border-outline-variant/50 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
										<div className="flex flex-wrap gap-1.5">
											{draft.job.skills.slice(0, 3).map((skill) => (
												<span
													key={skill}
													className="rounded border border-transparent bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-secondary-fixed-variant dark:border-border-subtle dark:text-on-surface-soft"
												>
													{skill}
												</span>
											))}
										</div>
										<div className="flex shrink-0 flex-wrap items-center gap-2 self-end">
											<button
												type="button"
												onClick={() => changeProposal(draft.job.id, tab === "Archived" ? "Drafts" : "Archived")}
												className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-label-sm text-on-surface-variant hover:bg-surface-container"
											>
												{tab === "Archived" ? "Restore draft" : "Archive"}
											</button>
											<button
												type="button"
												onClick={() => openProposal(draft.job, draft)}
												className={workspaceStyles.primaryAction}
											>
												{tab === "Drafts" ? "Continue draft" : "View proposal"}
												<ArrowRight className="size-3.5" />
											</button>
										</div>
									</div>
								</article>
							))}
						</div>
					) : query ? (
						<WorkspaceSurface className="p-10 text-center">
							<Search className="mx-auto size-6 text-outline" />
							<h3 className="mt-4 font-headline-md font-semibold text-headline-md">No matching proposals</h3>
							<p className="mt-2 text-body-sm text-on-surface-variant">Try another project, client, or skill.</p>
							<button type="button" onClick={() => setQuery("")} className={`${workspaceStyles.secondaryAction} mt-5`}>
								Clear search
							</button>
						</WorkspaceSurface>
					) : (
						<EmptyProposals tab={tab} />
					)}
					<p className="pt-1 text-caption text-outline">Your next great project starts with a conversation.</p>
				</section>
				<aside aria-label="Proposal guidance" className="space-y-5">
					<WorkspaceSurface className="p-5">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="font-headline-sm font-semibold text-headline-sm">Make your first impression count</h2>
							<FilePenLine className="size-4 shrink-0 text-primary" />
						</div>
						<p className="text-body-sm text-on-surface-variant leading-relaxed">
							A little care goes a long way. Give every proposal a personal touch.
						</p>
						<div className="mt-5 space-y-4">
							{[
								["Start with their project", "Show you understand what they need."],
								["Make your experience relevant", "Share a similar project and its outcome."],
								["Offer a clear next step", "Explain how you’d start the work."],
							].map(([title, description]) => (
								<div key={title} className="flex gap-2.5">
									<CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
									<div>
										<h3 className="font-label-md font-medium text-label-md">{title}</h3>
										<p className="mt-1 text-caption text-on-surface-variant leading-relaxed">{description}</p>
									</div>
								</div>
							))}
						</div>
						<Link to="/freelancer" className={`${workspaceStyles.secondaryAction} mt-5 w-full`}>
							Review your profile
							<ArrowRight className="size-3.5" />
						</Link>
					</WorkspaceSurface>
					<WorkspaceSurface className="p-5">
						<div className="mb-3 flex items-center gap-2">
							<h2 className="font-headline-sm font-semibold text-headline-sm">Keep the momentum</h2>
						</div>
						<p className="text-body-sm text-on-surface-variant leading-relaxed">
							Your shortlist is a good place to find your next introduction.
						</p>
						<Link
							to="/freelancer-saved-jobs"
							className="mt-4 inline-flex items-center gap-2 font-label-md text-label-md text-primary hover:underline"
						>
							Explore saved jobs
							<ArrowRight className="size-3.5" />
						</Link>
					</WorkspaceSurface>
				</aside>
			</div>

			<Sheet
				open={selected !== null}
				onOpenChange={(open) => {
					if (!open) {
						closeSheet()
					}
				}}
			>
				<SheetContent
					side="right"
					showCloseButton={false}
					className={
						compose
							? "w-full max-w-none gap-0 bg-card p-0 sm:max-w-180"
							: "w-full max-w-none gap-0 p-0 sm:w-[min(88vw,1040px)] sm:max-w-none"
					}
				>
					{selected && (
						<>
							<header className="flex h-14 shrink-0 items-center justify-between gap-4 border-border border-b bg-card px-5 sm:px-7">
								<SheetClose className="inline-flex min-h-11 items-center gap-2 rounded-lg font-medium text-muted-foreground text-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
									<ArrowLeft className="size-4" />
									Back to proposals
								</SheetClose>

								<p className="hidden text-muted-foreground text-xs sm:block">{selected.company} · Remote opportunity</p>
							</header>

							{compose ? (
								<ProposalEditor
									job={selected}
									cover={cover}
									onCoverChange={setCover}
									readOnly={selectedReadOnly}
									onSend={async () => {
										try {
											await saveProposal(selected, cover, "Submitted")
											closeSheet()
											setTab("Submitted")
											toast.success("Proposal submitted")
										} catch {
											toast.error("Couldn't submit the proposal.")
										}
									}}
									onCancel={closeSheet}
									onSubmit={saveDraft}
								/>
							) : (
								<JobDetails key={selected.id} job={selected} projectType={selectedProjectType} />
							)}
						</>
					)}
				</SheetContent>
			</Sheet>
		</div>
	)
}

const ProposalEditor = ({
	job,
	cover,
	onCoverChange,
	onCancel,
	onSubmit,
	readOnly = false,
	onSend,
}: {
	job: FreelancerJob
	cover: string
	onCoverChange: (value: string) => void
	onCancel: () => void
	onSubmit: () => void
	readOnly?: boolean
	onSend: () => void
}) => {
	return (
		<section className="flex min-h-0 flex-1 flex-col">
			<div className="border-border border-b px-6 py-6 sm:px-8">
				<p className="mb-2 font-semibold text-primary text-xs">YOUR NEXT OPPORTUNITY</p>

				<SheetTitle className="font-semibold text-2xl tracking-tight">
					{readOnly ? "Your proposal" : "Make your introduction"}
				</SheetTitle>

				<SheetDescription className="mt-2 text-sm leading-6">
					{readOnly
						? "Your introduction and proposed terms, all in one place."
						: "A thoughtful proposal is the start of a great collaboration."}
				</SheetDescription>
			</div>

			<form
				className="flex min-h-0 flex-1 flex-col"
				onSubmit={(event) => {
					event.preventDefault()
					if (!readOnly) onSubmit()
				}}
			>
				<div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-6 sm:px-8">
					<div className="rounded-xl border border-border bg-muted/40 p-4">
						<p className="text-muted-foreground text-xs">
							{readOnly ? "Proposal for" : "Applying to"} · {job.company}
						</p>

						<p className="mt-2 font-semibold text-sm leading-6">{job.title}</p>

						<p className="mt-2 text-muted-foreground text-xs">{job.budget}</p>
					</div>

					<JobFormSection
						title="Tell them why you're a good fit"
						description="Share relevant experience and how you'd approach this project."
					>
						<label className="block font-medium text-sm">
							Cover letter
							<textarea
								readOnly={readOnly}
								required
								minLength={40}
								maxLength={5000}
								rows={6}
								value={cover}
								onChange={(event) => onCoverChange(event.target.value)}
								placeholder="Hi! Your project caught my attention because…"
								className={`${jobFormField} mt-2 min-h-40 resize-y leading-6`}
							/>
							<span className="mt-2 block text-muted-foreground text-xs">
								At least 40 characters
								<span className="float-right">{cover.length.toLocaleString()} / 5,000</span>
							</span>
						</label>
					</JobFormSection>
				</div>

				<footer className="shrink-0 border-border border-t px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
					<div className="flex items-center justify-between gap-3">
						<button type="button" onClick={onCancel} className={workspaceStyles.secondaryAction}>
							Back
						</button>

						{!readOnly && (
							<div className="flex items-center justify-end gap-2.5">
								<button type="submit" className={workspaceStyles.secondaryAction}>
									Save as draft
								</button>
								<button
									type="button"
									disabled={cover.trim().length < 40 || cover.length > 5000}
									onClick={onSend}
									className={`${workspaceStyles.primaryAction} disabled:opacity-50`}
								>
									<Send className="size-3.5" />
									Apply now
								</button>
							</div>
						)}
					</div>
				</footer>
			</form>
		</section>
	)
}

const EmptyProposals = ({ tab }: { tab: ProposalTab }) => {
	const title =
		tab === "Submitted"
			? "No submitted proposals"
			: tab === "Archived"
				? "No archived proposals"
				: "Start with a project that fits"

	return (
		<WorkspaceSurface className="grid min-h-72 place-items-center border-outline-variant border-dashed bg-surface-container-lowest p-8 text-center">
			<div>
				<span className="mx-auto grid size-14 place-items-center rounded-lg border border-outline-variant bg-surface-container text-primary">
					<FileText className="size-6" strokeWidth={1.5} />
				</span>

				<h2 className="mt-5 font-headline-lg font-semibold text-headline-lg text-on-surface">{title}</h2>

				<p className="mx-auto mt-3 max-w-lg font-body-sm text-body-sm text-on-surface-variant leading-6">
					Your proposals will appear here. Browse work and prepare a thoughtful introduction.
				</p>

				{tab === "Drafts" && (
					<div className="mt-5">
						<Link className={workspaceStyles.primaryAction} to="/freelancer-jobs">
							Find work
							<ArrowRight className="size-4" />
						</Link>
					</div>
				)}
			</div>
		</WorkspaceSurface>
	)
}

export default FreelancerProposalsPage
