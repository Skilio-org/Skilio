import { StarRatingDisplay } from "./review-stars"
import type { ReviewPublic } from "@/client"
import { Monogram } from "@/components/dashboard/dashboard-header"
import { getInitials } from "@/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
	const initials = getInitials(reviewerName) || "CL"
	const formattedDate = formatReviewDate(review.created_at)
	const isEdited =
		Boolean(review.updated_at && review.created_at) &&
		new Date(review.updated_at!).getTime() - new Date(review.created_at!).getTime() > 60000

	return (
		<article
			className={`rounded-xl border p-5 sm:p-6 transition-colors ${
				isOwnReview
					? "border-primary/40 bg-primary/5 dark:bg-primary/[0.03]"
					: "border-border bg-card hover:border-border/80"
			}`}
		>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="flex items-center gap-3">
					<Monogram className="size-10 bg-muted text-muted-foreground text-xs font-medium">{initials}</Monogram>
					<div>
						<div className="flex items-center gap-2">
							<h4 className="font-semibold text-sm text-foreground">{reviewerName}</h4>
							{isOwnReview && (
								<Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-medium uppercase tracking-wider">
									Your review
								</Badge>
							)}
						</div>
						<div className="mt-0.5 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
							{formattedDate && <span>{formattedDate}</span>}
							{isEdited && <span>· edited</span>}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<StarRatingDisplay rating={review.rating} size="sm" showScore />

					{isOwnReview && (onEdit || onDelete) && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon-sm"
									className="text-muted-foreground hover:text-foreground"
									aria-label="Review actions"
								>
									<MoreHorizontal className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-36">
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

			<p className="mt-4 whitespace-pre-wrap break-words text-muted-foreground text-sm leading-relaxed sm:text-base sm:leading-7">
				{review.comment}
			</p>
		</article>
	)
}
