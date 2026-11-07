import { useState, useMemo } from "react"
import { Star, MessageSquarePlus } from "lucide-react"
import { StarRatingDisplay } from "./review-stars"
import { ReviewCard } from "./review-card"
import { ReviewModal } from "./review-modal"
import { ReviewDeleteDialog } from "./review-delete-dialog"
import { useFreelancerReviews } from "@/hooks/useFreelancerReviews"
import type { ReviewPublic } from "@/client"
import useAuth from "@/hooks/useAuth"
import { Link } from "@tanstack/react-router"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"

type FreelancerReviewsSectionProps = {
	freelancerId: string
	profileUserId?: string
	freelancerName: string
	freelancerTitle?: string
	freelancerAvatarUrl?: string
	className?: string
}

type SortOption = "newest" | "highest" | "lowest"

export function FreelancerReviewsSection({
	freelancerId,
	profileUserId,
	freelancerName,
	freelancerTitle,
	freelancerAvatarUrl,
	className,
}: FreelancerReviewsSectionProps) {
	const { user } = useAuth()
	const {
		reviews,
		totalCount,
		averageRating,
		distribution,
		distributionPercent,
		myReview,
		isClientRole,
		isOwnProfile,
		isLoading,
		createReview,
		isCreating,
		updateReview,
		isUpdating,
		deleteReview,
		isDeleting,
	} = useFreelancerReviews(freelancerId, profileUserId)

	const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
	const [editingReview, setEditingReview] = useState<ReviewPublic | null>(null)
	const [deletingReview, setDeletingReview] = useState<ReviewPublic | null>(null)
	const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null)
	const [sortBy, setSortBy] = useState<SortOption>("newest")

	const firstName = freelancerName.split(" ")[0] || "this freelancer"

	const filteredAndSortedReviews = useMemo(() => {
		let list = [...reviews]

		if (selectedStarFilter !== null) {
			list = list.filter((r) => Math.round(r.rating) === selectedStarFilter)
		}

		list.sort((a, b) => {
			if (sortBy === "highest") return b.rating - a.rating
			if (sortBy === "lowest") return a.rating - b.rating
			// default: newest
			const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
			const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
			return timeB - timeA
		})

		// If user has a review and no star filter is active (or their review matches),
		// ensure user's review is pinned at the top for quick access
		if (myReview && (selectedStarFilter === null || Math.round(myReview.rating) === selectedStarFilter)) {
			list = [myReview, ...list.filter((r) => r.id !== myReview.id)]
		}

		return list
	}, [reviews, selectedStarFilter, sortBy, myReview])

	const handleOpenCreate = () => {
		setEditingReview(null)
		setIsReviewModalOpen(true)
	}

	const handleOpenEdit = (review: ReviewPublic) => {
		setEditingReview(review)
		setIsReviewModalOpen(true)
	}

	const handleOpenDelete = (review: ReviewPublic) => {
		setDeletingReview(review)
	}

	const handleFormSubmit = async (data: { rating: number; comment: string }) => {
		if (editingReview) {
			await updateReview({ reviewId: editingReview.id, ...data })
		} else {
			await createReview(data)
		}
	}

	const handleConfirmDelete = async () => {
		if (deletingReview) {
			await deleteReview(deletingReview.id)
			setDeletingReview(null)
		}
	}

	return (
		<section id="client-reviews" className={`scroll-mt-28 p-5 sm:p-8 ${className ?? ""}`}>
			{/* Section Header */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h3 className="font-semibold text-xl tracking-tight">Client reviews</h3>
					{totalCount > 0 && (
						<p className="mt-1 text-on-surface-variant text-sm">
							Verified reviews from clients who have worked with {firstName}.
						</p>
					)}
				</div>

				{/* Primary Action Button based on auth and role */}
				<div>
					{!user ? (
						<Link to="/login" className={cn(workspaceStyles.secondaryAction, "h-8 px-3 text-xs gap-1.5")}>
							<Star className="size-3.5 text-primary fill-primary" />
							<span>Sign in to review</span>
						</Link>
					) : isOwnProfile ? null : !isClientRole ? (
						<p className="text-xs text-on-surface-variant">Only client accounts can rate</p>
					) : myReview ? (
						<button
							type="button"
							onClick={() => handleOpenEdit(myReview)}
							className={cn(workspaceStyles.secondaryAction, "h-8 px-3 text-xs gap-1.5")}
						>
							<Star className="size-3.5 text-primary fill-primary" />
							<span>Edit your review</span>
						</button>
					) : (
						<button
							type="button"
							onClick={handleOpenCreate}
							className={cn(workspaceStyles.primaryAction, "h-8 px-3 text-xs gap-1.5")}
						>
							<MessageSquarePlus className="size-3.5" />
							<span>Rate this freelancer</span>
						</button>
					)}
				</div>
			</div>

			{/* Ratings Summary Card */}
			<div
				className={`mt-6 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 sm:p-6 ${totalCount === 0 ? "hidden" : ""}`}
			>
				<div className="grid gap-6 sm:grid-cols-[200px_1fr] sm:items-center">
					{/* Overall Rating Score */}
					<div className="flex flex-col items-center justify-center border-b border-outline-variant pb-6 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6 text-center">
						<div className="font-display font-bold text-5xl tracking-tight text-foreground">
							{totalCount > 0 ? averageRating.toFixed(1) : "—"}
						</div>
						<div className="mt-2">
							<StarRatingDisplay rating={averageRating} size="md" />
						</div>
						<p className="mt-2 font-medium text-xs text-on-surface-variant">
							{totalCount > 0 ? (
								<>
									Based on {totalCount} {totalCount === 1 ? "review" : "reviews"}
								</>
							) : (
								"No reviews yet"
							)}
						</p>
					</div>

					{/* Star Breakdown Distribution Bars */}
					<div className="space-y-2">
						{[5, 4, 3, 2, 1].map((star) => {
							const count = distribution[star] || 0
							const percent = distributionPercent[star] || 0
							const isSelected = selectedStarFilter === star

							return (
								<button
									key={star}
									type="button"
									onClick={() => setSelectedStarFilter(isSelected ? null : star)}
									aria-pressed={isSelected}
									className={`group flex w-full items-center gap-3 rounded-lg px-2 py-1 text-left text-xs transition-colors hover:bg-muted/50 ${
										isSelected ? "bg-muted font-medium text-foreground" : "text-on-surface-variant"
									}`}
								>
									<span className="flex w-12 shrink-0 items-center gap-1 font-medium text-foreground">
										<span>{star}</span>
										<Star className="size-3 fill-primary text-primary" />
									</span>

									{/* Progress Bar */}
									<div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
										<div
											className={`h-full rounded-full transition-all duration-300 ${
												isSelected ? "bg-primary" : "bg-primary/75 group-hover:bg-primary"
											}`}
											style={{ width: `${percent}%` }}
										/>
									</div>

									<span className="w-10 text-right tabular-nums text-on-surface-variant">{count}</span>
								</button>
							)
						})}
					</div>
				</div>
			</div>

			{/* Unified Tab Navigation Bar & Sort Controls (Consistent with Connections and Jobs tabbing) */}
			{totalCount > 0 && (
				<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-outline-variant border-b">
					<nav aria-label="Review rating tabs" className="flex gap-6 overflow-x-auto">
						<button
							type="button"
							onClick={() => setSelectedStarFilter(null)}
							aria-pressed={selectedStarFilter === null}
							className={`min-h-12 shrink-0 border-b-2 px-1 font-medium text-sm flex items-center transition-colors ${
								selectedStarFilter === null
									? "border-primary text-link"
									: "border-transparent text-on-surface-variant hover:text-on-surface"
							}`}
						>
							<span>All</span>
							<span className="ml-1 text-xs font-normal">({totalCount})</span>
						</button>
						{([5, 4, 3, 2, 1] as const).map((star) => {
							const active = selectedStarFilter === star
							const count = distribution[star] || 0
							return (
								<button
									key={star}
									type="button"
									onClick={() => setSelectedStarFilter(active ? null : star)}
									aria-pressed={active}
									className={`min-h-12 shrink-0 border-b-2 px-1 font-medium text-sm flex items-center transition-colors ${
										active
											? "border-primary text-link"
											: "border-transparent text-on-surface-variant hover:text-on-surface"
									}`}
								>
									<span>{star} ★</span>
									<span className="ml-1 text-xs font-normal">({count})</span>
								</button>
							)
						})}
					</nav>

					<div className="flex items-center gap-2 pb-2 sm:pb-0 shrink-0">
						<span className="font-caption text-caption text-outline">Sort:</span>
						<Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
							<SelectTrigger
								size="sm"
								aria-label="Sort reviews"
								className="w-44 rounded-lg border-outline-variant bg-surface-container-lowest px-3 font-normal text-[12px] leading-4 text-on-surface shadow-none hover:border-outline dark:bg-surface-card dark:hover:bg-surface-container data-[state=open]:border-primary [&>svg]:transition-transform data-[state=open]:[&>svg]:rotate-180"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent
								align="end"
								sideOffset={6}
								className="w-[var(--radix-select-trigger-width)] min-w-0 rounded-lg border-outline-variant bg-surface-container-lowest p-1 text-on-surface shadow-md [&_[data-radix-select-viewport]]:min-w-0"
							>
								{[
									["newest", "Most recent"],
									["highest", "Highest rating"],
									["lowest", "Lowest rating"],
								].map(([value, label]) => (
									<SelectItem
										key={value}
										value={value}
										className="min-h-8 cursor-pointer rounded px-3 pr-8 font-normal text-[12px] leading-4 focus:bg-surface-container focus:text-on-surface data-[state=checked]:bg-surface-container data-[state=checked]:text-link"
									>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			)}

			{/* Reviews List */}
			<div className="mt-6 space-y-4">
				{isLoading ? (
					<div className="space-y-3">
						{[1, 2].map((i) => (
							<div
								key={i}
								className="animate-pulse rounded-lg border border-outline-variant bg-surface-container-lowest p-6"
							>
								<div className="flex items-center gap-3">
									<div className="size-10 rounded-full bg-muted" />
									<div className="space-y-2">
										<div className="h-4 w-32 rounded bg-muted" />
										<div className="h-3 w-20 rounded bg-muted" />
									</div>
								</div>
								<div className="mt-4 h-16 w-full rounded bg-muted" />
							</div>
						))}
					</div>
				) : filteredAndSortedReviews.length > 0 ? (
					filteredAndSortedReviews.map((review) => (
						<ReviewCard
							key={review.id}
							review={review}
							isOwnReview={Boolean(user && review.client_id === user.id)}
							onEdit={handleOpenEdit}
							onDelete={handleOpenDelete}
						/>
					))
				) : totalCount === 0 ? (
					/* Completely empty reviews */
					<div>
						<p className="text-on-surface-variant text-sm">
							{isOwnProfile
								? "No reviews yet. They appear here after clients you work with leave one."
								: `No reviews yet. Be the first to work with ${firstName} and share your experience.`}
						</p>
					</div>
				) : (
					/* Star filter returned 0 results */
					<div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center">
						<p className="text-on-surface-variant text-sm">No {selectedStarFilter}-star reviews found.</p>
						<button
							type="button"
							onClick={() => setSelectedStarFilter(null)}
							className={cn(workspaceStyles.secondaryAction, "mt-3")}
						>
							Show all reviews
						</button>
					</div>
				)}
			</div>

			{/* Review Create/Edit Modal */}
			<ReviewModal
				open={isReviewModalOpen}
				onOpenChange={setIsReviewModalOpen}
				freelancerName={freelancerName}
				freelancerTitle={freelancerTitle}
				freelancerAvatarUrl={freelancerAvatarUrl}
				existingReview={editingReview}
				onSubmit={handleFormSubmit}
				isSubmitting={isCreating || isUpdating}
			/>

			{/* Review Delete Confirmation Dialog */}
			<ReviewDeleteDialog
				open={Boolean(deletingReview)}
				onOpenChange={(open) => !open && setDeletingReview(null)}
				onConfirmDelete={handleConfirmDelete}
				isDeleting={isDeleting}
			/>
		</section>
	)
}
