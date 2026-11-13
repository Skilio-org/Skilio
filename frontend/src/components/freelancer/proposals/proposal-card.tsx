import { Link } from "@tanstack/react-router"
import { ArrowRight, Briefcase, Clock3, FilePenLine, MessageSquare, Trash2, UserCheck, X, XCircle } from "lucide-react"
import { SkillTag, workspaceStyles } from "@/components/dashboard/dashboard-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { accountAvatarUrl } from "@/hooks/useAccountAvatar"
import type { BackendProposal } from "@/hooks/useFreelancerProposals"
import { getInitials } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { FreelancerJob } from "@/types/job"

function formatProposalDate(value?: string | null) {
	if (!value) return null
	const date = new Date(value)
	return Number.isNaN(date.getTime())
		? null
		: date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

// Placeholder shown while the proposals are loading.
export function ProposalCardSkeleton() {
	return (
		<Card className="min-w-0 rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
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
	)
}

// The status badge next to the company name.
function StatusBadge({ status }: { status: BackendProposal["rawStatus"] }) {
	if (status === "accepted") {
		return (
			<Badge variant="success">
				<UserCheck className="size-3" />
				Accepted
			</Badge>
		)
	}
	if (status === "pending") {
		return (
			<Badge variant="pending">
				<Clock3 className="size-3" />
				Under review
			</Badge>
		)
	}
	if (status === "draft") {
		return (
			<Badge
				variant="outline"
				className="gap-1 border-outline-variant bg-surface-container-low font-medium text-[10px] text-on-surface-variant"
			>
				<FilePenLine className="size-3 text-outline" />
				Draft
			</Badge>
		)
	}
	return (
		<Badge variant="outline" className="gap-1 border-border bg-muted font-medium text-[10px] text-muted-foreground">
			<XCircle className="size-3" />
			Declined
		</Badge>
	)
}

export function ProposalCard({
	draft,
	onOpenJob,
	onOpenProposal,
	onWithdraw,
}: {
	draft: BackendProposal
	onOpenJob: (job: FreelancerJob) => void
	onOpenProposal: (job: FreelancerJob, draft: BackendProposal) => void
	onWithdraw: (draft: BackendProposal) => void
}) {
	const formattedDate = formatProposalDate(draft.createdAt)
	const isAccepted = draft.rawStatus === "accepted"
	const isPending = draft.rawStatus === "pending"
	const isDraft = draft.rawStatus === "draft"
	const isRejected = draft.rawStatus === "rejected"

	return (
		<Card className="group min-w-0 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 transition-all duration-150 hover:border-outline hover:shadow-xs">
			<CardContent className="flex h-full flex-col justify-between gap-4 p-0">
				{/* Client, status and the discard / withdraw button */}
				<div className="flex items-start justify-between gap-3">
					<div className="flex min-w-0 items-start gap-3.5">
						<div className="relative shrink-0">
							<Avatar className="size-11 rounded-lg border border-outline-variant bg-surface-container">
								{draft.job.clientId && (
									<AvatarImage
										src={accountAvatarUrl(draft.job.clientId, "", "client")}
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
										? "bg-primary"
										: isPending
											? "animate-pulse bg-primary"
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
								<StatusBadge status={draft.rawStatus} />
							</div>

							<p className="mt-0.5 font-medium text-on-surface-variant text-xs">Remote · {draft.job.category}</p>

							<button
								type="button"
								onClick={() => onOpenJob(draft.job)}
								className="mt-2 flex w-full items-center gap-1.5 truncate text-left font-semibold text-on-surface text-xs transition-colors hover:text-link"
							>
								<Briefcase className="size-3.5 shrink-0 text-link" />
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

					{!isAccepted && (
						<button
							type="button"
							onClick={() => onWithdraw(draft)}
							title={isDraft ? "Discard draft" : isRejected ? "Delete record" : "Withdraw proposal"}
							className="grid size-8 shrink-0 place-items-center rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant/70 transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
						>
							{isDraft || isRejected ? <Trash2 className="size-4" /> : <X className="size-4" />}
						</button>
					)}
				</div>

				{/* Cover letter preview */}
				<div className="rounded-lg border border-outline-variant/50 bg-surface-container-low/40 p-3 text-on-surface-variant text-xs leading-relaxed">
					<div className="mb-1 flex items-center justify-between font-medium text-[11px] text-on-surface-variant">
						<span>{isDraft ? "Draft proposal" : "Your cover letter"}</span>
						{formattedDate && <span className="tabular-nums">{formattedDate}</span>}
					</div>
					<p className="line-clamp-3 whitespace-pre-line text-on-surface-variant italic">
						"{draft.cover || "A great proposal starts with a personal introduction. Tell the client how you can help."}"
					</p>
				</div>

				<div className="flex flex-wrap gap-1.5">
					{draft.job.skills.slice(0, 3).map((skill) => (
						<SkillTag key={skill}>{skill}</SkillTag>
					))}
				</div>

				{/* Footer: current state and the action that fits it */}
				<div className="flex items-center justify-between border-outline-variant/60 border-t pt-3 text-on-surface-variant text-xs">
					<span className="flex items-center gap-1.5 font-caption text-caption">
						<span
							className={cn("size-2 rounded-full", isAccepted ? "bg-primary" : isPending ? "bg-primary" : "bg-outline")}
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
								onClick={() => onOpenProposal(draft.job, draft)}
								className={cn(workspaceStyles.primaryAction, "h-8 gap-1.5 px-3 text-xs")}
							>
								<span>Continue draft</span>
								<ArrowRight className="size-3.5" />
							</button>
						)}

						{isPending && (
							<button
								type="button"
								onClick={() => onOpenProposal(draft.job, draft)}
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
									onClick={() => onOpenProposal(draft.job, draft)}
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
								onClick={() => onOpenProposal(draft.job, draft)}
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
}
