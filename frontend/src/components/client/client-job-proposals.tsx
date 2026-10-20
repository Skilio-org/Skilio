import { Link } from "@tanstack/react-router"
import { useInfiniteQuery } from "@tanstack/react-query"
import { ArrowUpRight, Inbox, MessageSquare, MessageSquarePlus, Star } from "lucide-react"
import { useState } from "react"
import { ProposalsService, type ProposalPublic } from "@/client"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { accountAvatarUrl } from "@/hooks/useAccountAvatar"
import { getInitials } from "@/utils"
import { useErrorToast } from "@/hooks/useErrorToast"
import { ReviewModal } from "@/components/reviews/review-modal"
import { useFreelancerReviews } from "@/hooks/useFreelancerReviews"

const pageSize = 20

function proposalDate(value?: string | null) {
	if (!value) return null
	const date = new Date(value)
	return Number.isNaN(date.getTime())
		? null
		: date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

function ProposalCard({ proposal }: { proposal: ProposalPublic }) {
	const [expanded, setExpanded] = useState(false)
	const profile = proposal.freelancer_profile
	const name = proposal.freelancer?.full_name?.trim() || profile?.full_name?.trim() || "Freelancer"
	const date = proposalDate(proposal.created_at)
	const status = proposal.status === "pending" ? "Pending" : proposal.status === "accepted" ? "Accepted" : "Rejected"
	const letter = proposal.cover_letter?.trim() ?? ""
	const isLongLetter = letter.length > 240
	const displayedLetter = expanded || !isLongLetter ? letter : `${letter.slice(0, 240).trimEnd()}…`

	return (
		<article className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 sm:p-5">
			<div className="flex flex-wrap items-start gap-3">
				<Avatar className="size-11">
					{proposal.freelancer_id && <AvatarImage src={accountAvatarUrl(proposal.freelancer_id)} alt="" />}
					<AvatarFallback>{getInitials(name)}</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1">
					<h4 className="font-semibold text-sm">{name}</h4>
					{profile?.title && <p className="mt-0.5 text-on-surface-variant text-sm">{profile.title}</p>}
					{date && <p className="mt-1 text-on-surface-variant text-xs">Received {date}</p>}
				</div>
				<Badge variant={proposal.status === "rejected" ? "outline" : "secondary"}>{status}</Badge>
			</div>
			{letter && (
				<div className="mt-4">
					<p
						id={`proposal-letter-${proposal.id}`}
						className="wrap-break-word whitespace-pre-wrap text-on-surface-variant text-sm leading-6"
					>
						{displayedLetter}
					</p>
					{isLongLetter && (
						<button
							type="button"
							aria-controls={`proposal-letter-${proposal.id}`}
							aria-expanded={expanded}
							onClick={() => setExpanded((value) => !value)}
							className="mt-2 font-medium text-primary text-sm hover:underline"
						>
							{expanded ? "Show less" : "Read full proposal"}
						</button>
					)}
				</div>
			)}
			<div className="mt-4 flex flex-wrap items-center gap-3">
				<Link to="/messages" search={{ userId: proposal.freelancer_id }} className={workspaceStyles.primaryAction}>
					<MessageSquare className="size-4" /> Message
				</Link>
				{profile && (
					<>
						<Link
							to="/talent/$freelancerId"
							params={{ freelancerId: profile.id }}
							className={workspaceStyles.secondaryAction}
						>
							View profile <ArrowUpRight className="size-4" />
						</Link>
						{proposal.status === "accepted" && (
							<ProposalRateButton
								profileId={profile.id}
								freelancerUserId={proposal.freelancer_id}
								freelancerName={name}
								freelancerTitle={profile.title ?? undefined}
							/>
						)}
					</>
				)}
			</div>
		</article>
	)
}

function ProposalRateButton({
	profileId,
	freelancerUserId,
	freelancerName,
	freelancerTitle,
}: {
	profileId: string
	freelancerUserId?: string
	freelancerName: string
	freelancerTitle?: string
}) {
	const [modalOpen, setModalOpen] = useState(false)
	const { myReview, createReview, updateReview, isCreating, isUpdating, canCreateReview } = useFreelancerReviews(
		profileId,
		freelancerUserId,
	)

	const handleSubmit = async (data: { rating: number; comment: string }) => {
		if (myReview) {
			await updateReview({ reviewId: myReview.id, ...data })
		} else {
			await createReview(data)
		}
	}

	return (
		<>
			{myReview ? (
				<button
					type="button"
					onClick={() => setModalOpen(true)}
					className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 font-label-md text-label-md font-medium text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300"
				>
					<Star className="size-4 fill-amber-500 text-amber-500" />
					<span>Reviewed (★{myReview.rating})</span>
				</button>
			) : canCreateReview ? (
				<button
					type="button"
					onClick={() => setModalOpen(true)}
					className="inline-flex h-9 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 font-label-md text-label-md font-medium text-on-surface transition-colors hover:border-outline hover:bg-surface-container-low"
				>
					<MessageSquarePlus className="size-4 text-primary" />
					<span>Rate freelancer</span>
				</button>
			) : null}

			<ReviewModal
				open={modalOpen}
				onOpenChange={setModalOpen}
				freelancerName={freelancerName}
				freelancerTitle={freelancerTitle}
				freelancerAvatarUrl={freelancerUserId ? accountAvatarUrl(freelancerUserId) : undefined}
				existingReview={myReview}
				onSubmit={handleSubmit}
				isSubmitting={isCreating || isUpdating}
			/>
		</>
	)
}

export function ClientJobProposals({ jobId }: { jobId: string }) {
	const proposalsQuery = useInfiniteQuery({
		queryKey: ["client-job-proposals", jobId],
		initialPageParam: 0,
		queryFn: async ({ pageParam, signal }) => {
			const { data } = await ProposalsService.readProposalsForJob({
				path: { job_id: jobId },
				query: { skip: pageParam, limit: pageSize },
				signal,
			})
			return data
		},
		getNextPageParam: (lastPage, pages) => {
			const loaded = pages.reduce((total, page) => total + page.data.length, 0)
			return loaded < lastPage.count && lastPage.data.length ? loaded : undefined
		},
	})
	const proposals = proposalsQuery.data?.pages.flatMap((page) => page.data) ?? []
	const count = proposalsQuery.data?.pages[0]?.count
	useErrorToast(
		proposalsQuery.isError && !proposals.length ? "Could not load proposals for this job." : undefined,
		`client-job-proposals-${jobId}`,
		proposalsQuery.errorUpdatedAt,
		proposalsQuery.refetch,
	)
	useErrorToast(
		proposalsQuery.isFetchNextPageError ? "Could not load more proposals." : undefined,
		`client-job-proposals-more-${jobId}`,
		proposalsQuery.errorUpdatedAt,
		proposalsQuery.fetchNextPage,
	)

	return (
		<section aria-labelledby="received-proposals-heading" className="border-outline-variant border-b pb-7">
			<div className="flex items-baseline justify-between gap-3">
				<h3 id="received-proposals-heading" className="font-semibold">
					Received proposals{count !== undefined ? ` (${count})` : ""}
				</h3>
			</div>
			{proposalsQuery.isPending ? (
				<div className="mt-4 flex flex-col gap-3" role="status" aria-label="Loading proposals">
					<Skeleton className="h-28 w-full" />
					<Skeleton className="h-28 w-full" />
				</div>
			) : proposalsQuery.isError && !proposals.length ? (
				<div className="mt-4">
					<button
						type="button"
						onClick={() => void proposalsQuery.refetch()}
						className={`${workspaceStyles.secondaryAction} mt-3`}
					>
						Try again
					</button>
				</div>
			) : proposals.length ? (
				<div className="mt-4 flex flex-col gap-3">
					{proposals.map((proposal) => (
						<ProposalCard key={proposal.id} proposal={proposal} />
					))}
					{proposalsQuery.hasNextPage && (
						<button
							type="button"
							onClick={() => void proposalsQuery.fetchNextPage()}
							disabled={proposalsQuery.isFetchingNextPage}
							className={`${workspaceStyles.secondaryAction} self-start`}
						>
							{proposalsQuery.isFetchingNextPage ? "Loading…" : "Load more proposals"}
						</button>
					)}
				</div>
			) : (
				<div className="mt-4 rounded-lg border border-outline-variant border-dashed p-6 text-center">
					<Inbox className="mx-auto size-7 text-on-surface-variant" />
					<p className="mt-3 font-medium text-sm">No proposals yet</p>
					<p className="mt-1 text-on-surface-variant text-sm">Submitted proposals will appear here.</p>
				</div>
			)}
		</section>
	)
}
