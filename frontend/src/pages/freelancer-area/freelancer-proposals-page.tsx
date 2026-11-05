import { Link } from "@tanstack/react-router"
import { Archive, ArrowLeft, Bookmark, FilePenLine, Search, Send } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { EmptyState } from "@/components/common/empty-state"
import { WorkspacePageHeader, workspaceStyles } from "@/components/dashboard/dashboard-header"
import { JobDetails } from "@/components/freelancer/freelancer-job-details"
import { ProposalCard, ProposalCardSkeleton } from "@/components/freelancer/proposals/proposal-card"
import { ProposalEditor } from "@/components/freelancer/proposals/proposal-editor"
import { ProposalFilters } from "@/components/freelancer/proposals/proposal-filters"
import { ProposalWithdrawDialog } from "@/components/freelancer/proposals/proposal-withdraw-dialog"
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet"
import { useErrorToast } from "@/hooks/useErrorToast"
import { type BackendProposal, useFreelancerProposals } from "@/hooks/useFreelancerProposals"
import type { FreelancerJob } from "@/types/job"

type ProposalTab = "Drafts" | "Submitted" | "Archived"

// Which proposals belong on which tab.
const tabStatuses: Record<ProposalTab, string[]> = {
	Drafts: ["draft"],
	Submitted: ["pending", "accepted"],
	Archived: ["rejected"],
}

const emptyMessages: Record<ProposalTab, { title: string; description: string }> = {
	Drafts: {
		title: "Your draft proposals start here",
		description: "Save a draft proposal to polish your introduction before applying to open roles.",
	},
	Submitted: {
		title: "No submitted proposals yet",
		description: "Proposals you submit to clients will appear here with live client review updates.",
	},
	Archived: {
		title: "No archived proposals",
		description: "Past submissions and declined proposals will be filed here.",
	},
}

// "$1,200 · Fixed" -> 1200, so proposals can be sorted by budget.
const budgetNumber = (budget: string) => Number(budget.replace(/,/g, "").match(/[\d.]+/)?.[0] || 0)
const createdTime = (value?: string | null) => (value ? new Date(value).getTime() : 0)

const FreelancerProposalsPage = () => {
	const { drafts, loaded, error, isSubmitting, isWithdrawing, saveProposal, withdrawProposal } =
		useFreelancerProposals()
	useErrorToast(error, "freelancer-proposals-load")

	const [tab, setTab] = useState<ProposalTab>("Drafts")
	const [query, setQuery] = useState("")
	const [sort, setSort] = useState("recent")

	// The slide-over: a job being read, or a proposal being written.
	const [selected, setSelected] = useState<FreelancerJob | null>(null)
	const [activeProposal, setActiveProposal] = useState<BackendProposal | null>(null)
	const [compose, setCompose] = useState(false)
	const [cover, setCover] = useState("")
	const [itemToWithdraw, setItemToWithdraw] = useState<BackendProposal | null>(null)

	const countFor = (tabName: ProposalTab) => drafts.filter((d) => tabStatuses[tabName].includes(d.rawStatus)).length
	const draftsCount = countFor("Drafts")
	const acceptedCount = drafts.filter((d) => d.rawStatus === "accepted").length

	const tabs = [
		{ id: "Drafts" as const, label: "Drafts", count: draftsCount },
		{ id: "Submitted" as const, label: "Submitted proposals", count: countFor("Submitted") },
		{ id: "Archived" as const, label: "Archived", count: countFor("Archived") },
	]

	const visibleProposals = useMemo(() => {
		const search = query.trim().toLowerCase()
		return drafts
			.filter((draft) => {
				if (!tabStatuses[tab].includes(draft.rawStatus)) return false
				const text = `${draft.job.title} ${draft.job.company} ${draft.job.skills.join(" ")} ${draft.job.category}`
				return !search || text.toLowerCase().includes(search)
			})
			.sort((a, b) => {
				if (sort === "title") return a.job.title.localeCompare(b.job.title)
				if (sort === "budget") return budgetNumber(b.job.budget) - budgetNumber(a.job.budget)
				return createdTime(b.createdAt) - createdTime(a.createdAt)
			})
	}, [drafts, tab, query, sort])

	const openProposal = (job: FreelancerJob, draft: BackendProposal) => {
		setSelected(job)
		setActiveProposal(draft)
		setCompose(true)
		setCover(draft.cover)
	}

	const openJob = (job: FreelancerJob) => {
		setSelected(job)
		setActiveProposal(drafts.find((d) => d.job.id === job.id) || null)
		setCompose(false)
		setCover("")
	}

	const closeSheet = () => {
		setSelected(null)
		setActiveProposal(null)
		setCompose(false)
		setCover("")
	}

	const handleSaveDraft = async () => {
		if (!selected) return

		const existing = drafts.find((draft) => draft.job.id === selected.id)
		if (existing && existing.rawStatus !== "draft") {
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

	const handleSubmitProposal = async () => {
		if (!selected) return
		if (cover.trim().length < 40) {
			toast.error("Add a cover letter of at least 40 characters before submitting.")
			return
		}
		if (cover.length > 3000) {
			toast.error("Cover letter cannot exceed 3,000 characters.")
			return
		}

		try {
			await saveProposal(selected, cover, "Submitted")
			closeSheet()
			setTab("Submitted")
			toast.success(activeProposal?.rawStatus === "pending" ? "Proposal updated" : "Proposal submitted")
		} catch {
			toast.error("Couldn't submit the proposal.")
		}
	}

	const handleWithdraw = async () => {
		if (!itemToWithdraw) return
		try {
			await withdrawProposal(itemToWithdraw.proposalId)
			toast.success(
				itemToWithdraw.rawStatus === "draft"
					? "Draft discarded"
					: itemToWithdraw.rawStatus === "rejected"
						? "Record deleted"
						: "Proposal withdrawn",
			)
			setItemToWithdraw(null)
		} catch {
			toast.error("Couldn't process your request.")
		}
	}

	const selectedProjectType =
		selected?.projectType ?? (selected?.budget.toLowerCase().includes("fixed") ? "Fixed price" : "Hourly")
	const isReadOnlyProposal = activeProposal?.rawStatus === "accepted" || activeProposal?.rawStatus === "rejected"
	const currentTabCount = tabs.find((t) => t.id === tab)?.count ?? 0

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 md:px-6">
			<WorkspacePageHeader
				eyebrow="Freelancer workspace"
				title="Your proposals"
				description="Manage your ongoing applications, review drafts, and track client responses across Skilio."
				meta={
					<span className="font-medium text-link">
						{draftsCount} {draftsCount === 1 ? "draft" : "drafts"} in progress
						{acceptedCount > 0 && ` · ${acceptedCount} accepted`}
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
							Find work
						</Link>
					</div>
				}
			/>

			<nav aria-label="Proposal tabs" className="flex gap-6 overflow-x-auto border-outline-variant border-b">
				{tabs.map((t) => (
					<button
						key={t.id}
						type="button"
						onClick={() => {
							setTab(t.id)
							setQuery("")
						}}
						aria-pressed={tab === t.id}
						className={`min-h-12 shrink-0 border-b-2 px-1 font-medium text-sm ${tab === t.id ? "border-primary text-link" : "border-transparent text-on-surface-variant"}`}
					>
						{t.label} <span className="ml-1 text-xs">{t.count}</span>
					</button>
				))}
			</nav>

			{currentTabCount > 0 && (
				<ProposalFilters query={query} onQueryChange={setQuery} sort={sort} onSortChange={setSort} />
			)}

			<section aria-label="Proposals feed" className="min-w-0 space-y-4">
				{!loaded ? (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{[0, 1, 2, 3].map((i) => (
							<ProposalCardSkeleton key={i} />
						))}
					</div>
				) : visibleProposals.length === 0 ? (
					<EmptyState
						icon={tab === "Drafts" ? FilePenLine : tab === "Submitted" ? Send : Archive}
						title={query ? "No matching proposals found" : emptyMessages[tab].title}
						description={
							query
								? `No proposals match "${query}". Try searching for another keyword or skill.`
								: emptyMessages[tab].description
						}
						action={
							query ? (
								<button type="button" onClick={() => setQuery("")} className={workspaceStyles.secondaryAction}>
									Clear filter
								</button>
							) : (
								<Link to="/freelancer-jobs" className={workspaceStyles.secondaryAction}>
									<Search className="size-4" />
									<span>Find work</span>
								</Link>
							)
						}
					/>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{visibleProposals.map((draft) => (
							<ProposalCard
								key={draft.proposalId}
								draft={draft}
								onOpenJob={openJob}
								onOpenProposal={openProposal}
								onWithdraw={setItemToWithdraw}
							/>
						))}
					</div>
				)}
			</section>

			{/* Slide-over: the proposal editor, or the job details */}
			<Sheet open={selected !== null} onOpenChange={(open) => !open && closeSheet()}>
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
									readOnly={isReadOnlyProposal}
									isPendingSubmission={activeProposal?.rawStatus === "pending"}
									isSubmitting={isSubmitting}
									onSend={handleSubmitProposal}
									onCancel={closeSheet}
									onSubmit={handleSaveDraft}
								/>
							) : (
								<JobDetails key={selected.id} job={selected} projectType={selectedProjectType} />
							)}
						</>
					)}
				</SheetContent>
			</Sheet>

			<ProposalWithdrawDialog
				proposal={itemToWithdraw}
				isWithdrawing={isWithdrawing}
				onClose={() => setItemToWithdraw(null)}
				onConfirm={handleWithdraw}
			/>
		</div>
	)
}

export default FreelancerProposalsPage
