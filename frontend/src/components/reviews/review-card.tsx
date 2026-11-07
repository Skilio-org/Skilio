import { StarRatingDisplay } from "./review-stars"
import type { ReviewPublic } from "@/client"
// import { Monogram } from "@/components/dashboard/dashboard-header"
// import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { accountAvatarUrl } from "@/hooks/useAccountAvatar"
import { cn } from "@/lib/utils"

type ReviewCardProps = {
	review: ReviewPublic
	isOwnReview?: boolean
	onEdit?: (review: ReviewPublic) => void
	onDelete?: (review: ReviewPublic) => void
}

function formatReviewDate(dateStr?: string | null): string {
	if (!dateStr) return ""
	try {
		const date = new Date(dateStr)
		if (Number.isNaN(date.getTime())) return ""
		return date.toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		})
	} catch {
		return ""
	}
}

export function ReviewCard({ review, isOwnReview = false, onEdit, onDelete }: ReviewCardProps) {
	const reviewerName = review.client_name?.trim() || "Verified Client"
	// const initials = getInitials(reviewerName) || "CL"
	const formattedDate = formatReviewDate(review.created_at)
	const isEdited =
		Boolean(review.updated_at && review.created_at) &&
		new Date(review.updated_at!).getTime() - new Date(review.created_at!).getTime() > 60000

	return (
		<article
			className={`flex justify-between items-between flex-col rounded-lg border p-3 min-w-0 overflow-hidden transition-colors ${isOwnReview ? "border-outline-variant bg-surface-container-lowest hover:border-outline-variant/80" : "border-outline-variant bg-surface-container-lowest hover:border-outline-variant/80"
			}`}
		>
			<div className="flex flex-wrap items-start justify-between gap-3 min-w-0">
				<div className="flex items-start justify-start gap-3 min-w-0 flex-1">
					<img
						src={accountAvatarUrl(review.client_id)}
						alt=""
						className={cn(
							"size-12 shrink-0 place-items-center border font-label-sm font-semibold shadow-2xs rounded",
					)}/>
					{/* <Monogram className="size-10 bg-muted text-on-surface-variant text-xs font-medium">{initials}</Monogram> */}
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2 min-w-0">
							<h4 className="font-semibold text-sm text-foreground truncate">{reviewerName}</h4>
						</div>
						<StarRatingDisplay rating={review.rating} size="xs" showScore />
						<div className="mt-0.5 flex flex-wrap items-center gap-2 text-on-surface-variant text-xs">
							{formattedDate && <span>{formattedDate}</span>}
							{isEdited && <span>· edited</span>}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">

					{isOwnReview && (onEdit || onDelete) && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon-sm"
									className="text-on-surface-variant hover:text-foreground"
									aria-label="Review actions"
								>
									<MoreHorizontal />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{onEdit && (
									<DropdownMenuItem onClick={() => onEdit(review)} className="cursor-pointer gap-2">
										<Pencil className="size-3.5" />
										<span>Edit review</span>
									</DropdownMenuItem>
								)}
								{onDelete && (
									<DropdownMenuItem
										onClick={() => onDelete(review)}
										className="cursor-pointer gap-2 text-destructive focus:text-destructive"
									>
										<Trash2 className="size-3.5" />
										<span>Delete</span>
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</div>

			<p className="mt-2 text-sm! text-on-surface-variant text-md! leading-relaxed sm:text-base sm:leading-7 break-words">
				{review.comment}
				{isOwnReview && (
					<span className="underline text-xs py-1! px-2 rounded-4xl text-accent-cyan ml-1">
						your review
					</span>
				)}
			</p>
		</article>
	)
}
