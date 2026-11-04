import { useEffect, useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { StarRatingInput } from "./review-stars"
import type { ReviewPublic } from "@/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { extractErrorMessage, getInitials } from "@/utils"
import { AlertCircle, Loader2 } from "lucide-react"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import { cn } from "@/lib/utils"

type ReviewModalProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	freelancerName: string
	freelancerTitle?: string
	freelancerAvatarUrl?: string
	existingReview?: ReviewPublic | null
	onSubmit: (data: { rating: number; comment: string }) => Promise<void>
	isSubmitting: boolean
}

const MIN_COMMENT_LENGTH = 1
const MAX_COMMENT_LENGTH = 3000

export function ReviewModal({
	open,
	onOpenChange,
	freelancerName,
	freelancerTitle,
	freelancerAvatarUrl,
	existingReview,
	onSubmit,
	isSubmitting,
}: ReviewModalProps) {
	const [rating, setRating] = useState<number>(existingReview?.rating ?? 5)
	const [comment, setComment] = useState<string>(existingReview?.comment ?? "")
	const [error, setError] = useState<string | null>(null)

	const isEditing = Boolean(existingReview)

	useEffect(() => {
		if (open) {
			setRating(existingReview?.rating ?? 5)
			setComment(existingReview?.comment ?? "")
			setError(null)
		}
	}, [open, existingReview])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		if (!rating || rating < 1 || rating > 5) {
			setError("Please choose a rating between 1 and 5 stars.")
			return
		}

		const trimmedComment = comment.trim()
		if (trimmedComment.length < MIN_COMMENT_LENGTH) {
			setError("Please write a few words about your experience working together.")
			return
		}

		if (trimmedComment.length > MAX_COMMENT_LENGTH) {
			setError(`Your review cannot exceed ${MAX_COMMENT_LENGTH.toLocaleString()} characters.`)
			return
		}

		try {
			await onSubmit({ rating, comment: trimmedComment })
			onOpenChange(false)
		} catch (err: any) {
			setError(extractErrorMessage(err))
		}
	}

	const charCount = comment.trim().length
	const isOverLimit = charCount > MAX_COMMENT_LENGTH

	return (
		<Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader className="gap-1">
					<DialogTitle className="font-display font-semibold text-xl tracking-tight">
						{isEditing ? "Edit your review" : "Rate this freelancer"}
					</DialogTitle>
					<DialogDescription className="text-on-surface-variant text-sm">
						{isEditing
							? `Update your rating and feedback for ${freelancerName}.`
							: `Share your experience working with ${freelancerName} to help the community.`}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-5 pt-2">
					{/* Freelancer Info Card */}
					<div className="flex items-center gap-3.5 rounded-lg border border-outline-variant bg-muted/40 p-3">
						<Avatar className="size-11 border border-outline-variant">
							{freelancerAvatarUrl && <AvatarImage src={freelancerAvatarUrl} alt={freelancerName} />}
							<AvatarFallback className="bg-primary/10 font-medium text-primary text-sm">
								{getInitials(freelancerName)}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0 flex-1">
							<p className="truncate font-semibold text-sm text-foreground">{freelancerName}</p>
							{freelancerTitle && <p className="truncate text-on-surface-variant text-xs">{freelancerTitle}</p>}
						</div>
					</div>

					{/* Rating Input */}
					<div className="space-y-2">
						<label className="block font-medium text-foreground text-sm">
							Your overall rating <span className="text-destructive">*</span>
						</label>
						<StarRatingInput
							value={rating}
							onChange={(newRating) => {
								setRating(newRating)
								if (error) setError(null)
							}}
							disabled={isSubmitting}
						/>
					</div>

					{/* Comment Textarea */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<label htmlFor="review-comment" className="font-medium text-foreground text-sm">
								Detailed feedback <span className="text-destructive">*</span>
							</label>
							<span className={`text-xs ${isOverLimit ? "font-medium text-destructive" : "text-on-surface-variant"}`}>
								{charCount} / {MAX_COMMENT_LENGTH.toLocaleString()}
							</span>
						</div>
						<textarea
							id="review-comment"
							rows={4}
							value={comment}
							onChange={(e) => {
								setComment(e.target.value)
								if (error) setError(null)
							}}
							disabled={isSubmitting}
							required
							placeholder="What did you work on? How was communication, timeliness, and the quality of the deliverables?"
							className="w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-foreground text-sm placeholder:text-on-surface-variant focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
						/>
						<p className="text-on-surface-variant text-xs">
							Constructive, professional feedback helps freelancers showcase their work and helps other clients make
							informed hiring decisions.
						</p>
					</div>

					{/* Error Alert */}
					{error && (
						<div
							role="alert"
							className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm"
						>
							<AlertCircle className="size-4 shrink-0 translate-y-0.5" />
							<span>{error}</span>
						</div>
					)}

					<DialogFooter className="mt-6 gap-2 sm:gap-2">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
							className={workspaceStyles.secondaryAction}
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting || isOverLimit}
							className={cn(workspaceStyles.primaryAction, "disabled:cursor-not-allowed disabled:opacity-40")}
						>
							{isSubmitting && <Loader2 className="size-4 animate-spin" />}
							<span>{isEditing ? "Save changes" : "Submit review"}</span>
						</button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
