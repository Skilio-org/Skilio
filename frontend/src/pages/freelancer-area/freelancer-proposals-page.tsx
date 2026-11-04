import { Link } from "@tanstack/react-router"
import {
	Archive,
	ArrowLeft,
	ArrowRight,
	Bookmark,
	Briefcase,
	Clock3,
	FilePenLine,
	MessageSquare,
	Search,
	Send,
	Trash2,
	UserCheck,
	UserMinus,
	X,
	XCircle,
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { JobFormSection, jobFormField } from "@/components/common/job-form-section"
import {
	SkillTag,
	WorkspacePageHeader,
	WorkspaceSurface,
	workspaceStyles,
} from "@/components/dashboard/dashboard-header"
import { JobDetails } from "@/components/freelancer/freelancer-job-details"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { accountAvatarUrl } from "@/hooks/useAccountAvatar"
import { useErrorToast } from "@/hooks/useErrorToast"
import { type BackendProposal, useFreelancerProposals } from "@/hooks/useFreelancerProposals"
import { cn } from "@/lib/utils"
import type { FreelancerJob } from "@/types/job"
import { getInitials } from "@/utils"

type ProposalTab = "Drafts" | "Submitted" | "Archived"

function formatProposalDate(value?: string | null) {
	if (!value) return null
	const date = new Date(value)
	return Number.isNaN(date.getTime())
		? null
		: date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

const FreelancerProposalsPage = () => {
	const { drafts, loaded, error, isSubmitting, isWithdrawing, saveProposal, withdrawProposal } =
		useFreelancerProposals()
	useErrorToast(error, "freelancer-proposals-load")

	const [tab, setTab] = useState<ProposalTab>("Drafts")
	const [query, setQuery] = useState("")
	const [sort, setSort] = useState("recent")

	const [selected, setSelected] = useState<FreelancerJob | null>(null)
	const [activeProposal, setActiveProposal] = useState<BackendProposal | null>(null)
	const [compose, setCompose] = useState(false)
	const [cover, setCover] = useState("")
	const [itemToWithdraw, setItemToWithdraw] = useState<BackendProposal | null>(null)

	// Counts
	const draftsCount = drafts.filter((d) => d.rawStatus === "draft").length
	const submittedCount = drafts.filter((d) => d.rawStatus === "pending" || d.rawStatus === "accepted").length
	const acceptedCount = drafts.filter((d) => d.rawStatus === "accepted").length
	const archivedCount = drafts.filter((d) => d.rawStatus === "rejected").length

	const tabs = [
		{
			id: "Drafts" as const,
			label: "Drafts",
			icon: FilePenLine,
			count: draftsCount,
		},
		{
			id: "Submitted" as const,
			label: "Submitted Proposals",
			icon: Send,
			count: submittedCount,
			isAlert: acceptedCount > 0,
		},
		{
			id: "Archived" as const,
			label: "Archived",
			icon: Archive,
			count: archivedCount,
		},
	]

	const visibleProposals = useMemo(() => {
		const q = query.trim().toLowerCase()
		return drafts
			.filter((draft) => {
				const matchesTab =
					tab === "Drafts"
						? draft.rawStatus === "draft"
						: tab === "Submitted"
							? draft.rawStatus === "pending" || draft.rawStatus === "accepted"
							: draft.rawStatus === "rejected"
				if (!matchesTab) return false
				if (!q) return true
				const searchStr =
					`${draft.job.title} ${draft.job.company} ${draft.job.skills.join(" ")} ${draft.job.category}`.toLowerCase()
				return searchStr.includes(q)
			})
			.sort((a, b) => {
				if (sort === "title") return a.job.title.localeCompare(b.job.title)
				if (sort === "budget") {
					const numA = Number(a.job.budget.replace(/,/g, "").match(/[\d.]+/)?.[0] || 0)
					const numB = Number(b.job.budget.replace(/,/g, "").match(/[\d.]+/)?.[0] || 0)
					return numB - numA
				}
				const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
				const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
				return timeB - timeA
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

	const selectedProjectType =
		selected?.projectType ?? (selected?.budget.toLowerCase().includes("fixed") ? "Fixed price" : "Hourly")

	const isReadOnlyProposal = activeProposal?.rawStatus === "accepted" || activeProposal?.rawStatus === "rejected"

	const emptyTitle =
		tab === "Submitted"
			? "No submitted proposals yet"
			: tab === "Archived"
				? "No archived proposals"
				: "Your draft proposals start here"

	const emptyDescription =
		tab === "Submitted"
			? "Proposals you submit to clients will appear here with live client review updates."
			: tab === "Archived"
				? "Past submissions and declined proposals will be filed here."
				: "Save a draft proposal to polish your introduction before applying to open roles."

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 md:px-6">
			{/* Page Header */}
			<WorkspacePageHeader
				eyebrow="Freelancer workspace"
				title="Your proposals"
				description="Manage your ongoing applications, review drafts, and track client responses across Skilio."
				meta={
					<span className="font-medium text-primary">
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
							Find opportunities
						</Link>
					</div>
				}
			/>

			{/* Unified Tab Navigation Bar (Styled identically to Connections page) */}
			<div className="flex min-w-0 max-w-full flex-col gap-3 border-outline-variant border-b sm:flex-row sm:items-center sm:justify-between">
				<nav aria-label="Proposal tabs" className="flex max-w-full gap-6 overflow-x-auto">
					{tabs.map((t) => {
						const active = tab === t.id

						return (
							<button
								key={t.id}
								type="button"
								onClick={() => {
									setTab(t.id)
									setQuery("")
								}}
								aria-pressed={active}
								className={cn(
									"flex min-h-12 shrink-0 flex-row items-center border-b-2 px-1 font-medium text-sm transition-colors",
									active
										? "border-primary text-primary"
										: "border-transparent text-on-surface-variant hover:text-on-surface",
								)}
							>
								<span className="py-2 pr-1.5">{t.label}</span>
								<span
									className={cn(
										"ml-1 rounded-full px-2 py-0.5 font-semibold text-xs tabular-nums",
										active ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant",
									)}
								>
									{t.count}
								</span>
							</button>
						)
					})}
				</nav>
			</div>

			{/* Instant Search Filter & Sort Selector (Styled identically to Connections page filter) */}
			<div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<label className="relative flex min-h-12 flex-1 items-center gap-3 rounded-lg border border-input bg-surface-container-lowest px-4 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
					<Search className="size-4 shrink-0 text-on-surface-variant" />
					<input
						type="text"
						aria-label="Filter proposals"
						placeholder="Filter by project, client, or skill..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="min-w-0 flex-1 bg-transparent text-on-surface text-sm outline-none placeholder:text-outline"
					/>
					{query && (
						<button
							type="button"
							onClick={() => setQuery("")}
							aria-label="Clear filter"
							className="rounded p-1 text-on-surface-variant hover:text-on-surface"
						>
							<X className="size-3.5" />
						</button>
					)}
				</label>

				<div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
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
								["recent", "Newest first"],
								["title", "Project title"],
								["budget", "Budget: High to low"],
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

			{/* Main Section Feed */}
			<section aria-label="Proposals feed" className="min-w-0 space-y-4">
				{!loaded ? (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<Card
								key={i}
								className="min-w-0 rounded-xl border border-outline-variant bg-surface-container-lowest p-5"
							>
								<CardContent className="flex flex-col gap-4 p-0">
									<div className="flex items-start gap-3.5">
										<Skeleton className="size-11 rounded-lg" />
										<div className="flex-1 space-y-2">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-5 w-48" />
										</div>
										<Skeleton className="h-5 w-20 rounded-full" />
									</div>
									<Skeleton className="h-16 w-full rounded-lg" />
									<div className="flex items-center justify-between border-outline-variant/60 border-t pt-3">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-8 w-28 rounded-lg" />
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : visibleProposals.length === 0 ? (
					<WorkspaceSurface className="flex flex-col items-center justify-center p-12 text-center">
						<div className="mb-3 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
							{tab === "Drafts" ? (
								<FilePenLine className="size-6" />
							) : tab === "Submitted" ? (
								<Send className="size-6" />
							) : (
								<Archive className="size-6" />
							)}
						</div>
						<h3 className="font-headline-sm font-semibold text-lg text-on-surface">
							{query ? "No matching proposals found" : emptyTitle}
						</h3>
						<p className="mt-1.5 max-w-md font-body-md text-on-surface-variant text-sm leading-relaxed">
							{query ? `No proposals match "${query}". Try searching for another keyword or skill.` : emptyDescription}
						</p>
						<div className="mt-5 flex flex-wrap gap-2.5">
							{query ? (
								<Button variant="outline" size="sm" onClick={() => setQuery("")}>
									Clear Filter
								</Button>
							) : (
								<Link to="/freelancer-jobs" className={workspaceStyles.primaryAction}>
									<Search className="size-4" />
									<span>Browse Opportunities</span>
								</Link>
							)}
						</div>
					</WorkspaceSurface>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{visibleProposals.map((draft) => {
							const formattedDate = formatProposalDate(draft.createdAt)
							const isAccepted = draft.rawStatus === "accepted"
							const isPending = draft.rawStatus === "pending"
							const isDraft = draft.rawStatus === "draft"
							const isRejected = draft.rawStatus === "rejected"

							return (
								<Card
									key={draft.proposalId}
									className="group min-w-0 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 transition-all duration-150 hover:border-outline hover:shadow-xs"
								>
									<CardContent className="flex h-full flex-col justify-between gap-4 p-0">
										{/* Member / Client Identity & Status */}
										<div className="flex items-start justify-between gap-3">
											<div className="flex min-w-0 items-start gap-3.5">
												<div className="relative shrink-0">
													<Avatar className="size-11 rounded-lg border border-outline-variant bg-surface-container">
														{draft.job.clientId && (
															<AvatarImage
																src={accountAvatarUrl(draft.job.clientId)}
																alt={draft.job.company}
																className="object-cover"
															/>
														)}
														<AvatarFallback className="rounded-lg bg-surface-container font-label-md font-semibold text-label-md text-on-surface">
															{getInitials(draft.job.company)}
														</AvatarFallback>
													</Avatar>
													<span
														aria-hidden="true"
														className={cn(
															"absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-surface-container-lowest",
															isAccepted
																? "bg-emerald-500"
																: isPending
																	? "animate-pulse bg-amber-500"
																	: isDraft
																		? "bg-outline"
																		: "bg-muted-foreground/40",
														)}
													/>
												</div>

												<div className="min-w-0 flex-1">
													<div className="flex flex-wrap items-center gap-2">
														<h4 className="truncate font-headline-sm font-semibold text-base text-on-surface">
															{draft.job.company}
														</h4>

														{/* Explicit Authentic Status Badge */}
														{isAccepted ? (
															<Badge
																variant="outline"
																className="gap-1 border-primary/30 bg-primary/10 font-medium text-[10px] text-primary"
															>
																<UserCheck className="size-3" />
																Accepted
															</Badge>
														) : isPending ? (
															<Badge
																variant="outline"
																className="gap-1 border-amber-500/30 bg-amber-500/10 font-medium text-[10px] text-amber-600 dark:text-amber-400"
															>
																<Clock3 className="size-3" />
																Under review
															</Badge>
														) : isDraft ? (
															<Badge
																variant="outline"
																className="gap-1 border-outline-variant bg-surface-container-low font-medium text-[10px] text-on-surface-variant"
															>
																<FilePenLine className="size-3 text-outline" />
																Draft
															</Badge>
														) : (
															<Badge
																variant="outline"
																className="gap-1 border-border bg-muted font-medium text-[10px] text-muted-foreground"
															>
																<XCircle className="size-3" />
																Declined
															</Badge>
														)}
													</div>

													<p className="mt-0.5 font-medium text-on-surface-variant text-xs">
														Remote · {draft.job.category}
													</p>

													<button
														type="button"
														onClick={() => openJob(draft.job)}
														className="mt-2 flex w-full items-center gap-1.5 truncate text-left font-semibold text-on-surface text-xs transition-colors hover:text-primary"
													>
														<Briefcase className="size-3.5 shrink-0 text-primary" />
														<span className="truncate">{draft.job.title}</span>
													</button>

													<div className="mt-1 flex items-center gap-2 text-on-surface-variant text-xs">
														<strong className="font-numeric-data font-semibold text-on-surface">
															{draft.job.budget.split(" · ")[0]}
														</strong>
														<span>·</span>
														<span>{draft.job.projectType} contract</span>
													</div>
												</div>
											</div>

											{/* Disconnect / Discard / Delete Action Button */}
											{!isAccepted && (
												<button
													type="button"
													onClick={() => setItemToWithdraw(draft)}
													title={isDraft ? "Discard draft" : isRejected ? "Delete record" : "Withdraw proposal"}
													className="grid size-8 shrink-0 place-items-center rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant/70 transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
												>
													{isDraft || isRejected ? <Trash2 className="size-4" /> : <X className="size-4" />}
												</button>
											)}
										</div>

										{/* Proposal Introduction Note Box (Inspired by connections note box) */}
										<div className="rounded-lg border border-outline-variant/50 bg-surface-container-low/40 p-3 text-on-surface-variant text-xs leading-relaxed">
											<div className="mb-1 flex items-center justify-between font-medium text-[11px] text-on-surface-variant/80">
												<span>{isDraft ? "Draft proposal" : "Your cover letter"}</span>
												{formattedDate && <span className="tabular-nums">{formattedDate}</span>}
											</div>
											<p className="line-clamp-3 whitespace-pre-line text-on-surface-variant italic">
												"
												{draft.cover ||
													"A great proposal starts with a personal introduction. Tell the client how you can help."}
												"
											</p>
										</div>

										{/* Skills Tags */}
										<div className="flex flex-wrap gap-1.5">
											{draft.job.skills.slice(0, 3).map((skill) => (
												<SkillTag key={skill}>{skill}</SkillTag>
											))}
										</div>

										{/* Action Footer (Inspired by connections action footer) */}
										<div className="flex items-center justify-between border-outline-variant/60 border-t pt-3 text-on-surface-variant text-xs">
											<span className="flex items-center gap-1.5 font-caption text-caption">
												<span
													className={cn(
														"size-2 rounded-full",
														isAccepted ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-outline",
													)}
												/>
												<span>
													{isAccepted
														? "Collaboration unlocked"
														: isPending
															? "Under client review"
															: isDraft
																? "Draft in progress"
																: "Submission closed"}
												</span>
											</span>

											<div className="flex items-center gap-2">
												{isDraft && (
													<button
														type="button"
														onClick={() => openProposal(draft.job, draft)}
														className={cn(workspaceStyles.primaryAction, "h-8 gap-1.5 px-3 text-xs")}
													>
														<span>Continue draft</span>
														<ArrowRight className="size-3.5" />
													</button>
												)}

												{isPending && (
													<button
														type="button"
														onClick={() => openProposal(draft.job, draft)}
														className={cn(workspaceStyles.primaryAction, "h-8 gap-1.5 px-3 text-xs")}
													>
														<span>Edit proposal</span>
														<ArrowRight className="size-3.5" />
													</button>
												)}

												{isAccepted && (
													<>
														<button
															type="button"
															onClick={() => openProposal(draft.job, draft)}
															className={cn(workspaceStyles.secondaryAction, "h-8 gap-1.5 px-3 text-xs")}
														>
															<span>View terms</span>
														</button>
														{draft.job.clientId && (
															<Link
																to="/freelancer-messages"
																search={{ userId: draft.job.clientId }}
																className={cn(workspaceStyles.primaryAction, "h-8 gap-1.5 px-3 text-xs")}
															>
																<MessageSquare className="size-3.5" />
																<span>Message</span>
															</Link>
														)}
													</>
												)}

												{isRejected && (
													<button
														type="button"
														onClick={() => openProposal(draft.job, draft)}
														className={cn(workspaceStyles.secondaryAction, "h-8 gap-1.5 px-3 text-xs")}
													>
														<span>View details</span>
														<ArrowRight className="size-3.5" />
													</button>
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							)
						})}
					</div>
				)}
			</section>

			{/* Slide-over Sheet: Proposal Editor or Job Details */}
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

			{/* Safe Confirmation Dialog (Inspired by connections remove dialog) */}
			<Dialog open={Boolean(itemToWithdraw)} onOpenChange={(open) => !open && setItemToWithdraw(null)}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							{itemToWithdraw?.rawStatus === "draft" || itemToWithdraw?.rawStatus === "rejected" ? (
								<Trash2 className="size-5" />
							) : (
								<UserMinus className="size-5" />
							)}
							<span>
								{itemToWithdraw?.rawStatus === "draft"
									? "Discard Draft"
									: itemToWithdraw?.rawStatus === "rejected"
										? "Delete Proposal Record"
										: "Withdraw Proposal"}
							</span>
						</DialogTitle>
						<DialogDescription>
							{itemToWithdraw?.rawStatus === "draft" ? (
								<>
									Are you sure you want to discard your draft for{" "}
									<strong className="text-foreground">{itemToWithdraw?.job.title}</strong>? This cannot be undone.
								</>
							) : itemToWithdraw?.rawStatus === "rejected" ? (
								<>
									Are you sure you want to remove the declined proposal record for{" "}
									<strong className="text-foreground">{itemToWithdraw?.job.title}</strong>?
								</>
							) : (
								<>
									Are you sure you want to withdraw your proposal for{" "}
									<strong className="text-foreground">{itemToWithdraw?.job.title}</strong>? The client will no longer
									see your submission.
								</>
							)}
						</DialogDescription>
					</DialogHeader>

					<DialogFooter className="mt-4 gap-2">
						<Button variant="outline" onClick={() => setItemToWithdraw(null)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							disabled={isWithdrawing}
							onClick={async () => {
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
							}}
						>
							{isWithdrawing
								? "Processing..."
								: itemToWithdraw?.rawStatus === "draft"
									? "Discard draft"
									: itemToWithdraw?.rawStatus === "rejected"
										? "Delete record"
										: "Withdraw proposal"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
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
}) => {
	return (
		<section className="flex min-h-0 min-w-0 flex-1 flex-col">
			<div className="border-border border-b px-6 py-6 sm:px-8">
				<p className="mb-2 font-semibold text-primary text-xs uppercase tracking-wider">
					{readOnly ? "Submitted Application" : "Your Next Opportunity"}
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

export default FreelancerProposalsPage
