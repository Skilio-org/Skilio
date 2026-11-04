import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Trash2 } from "lucide-react"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"

type ReviewDeleteDialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirmDelete: () => Promise<void>
	isDeleting: boolean
}

export function ReviewDeleteDialog({ open, onOpenChange, onConfirmDelete, isDeleting }: ReviewDeleteDialogProps) {
	const handleDelete = async () => {
		await onConfirmDelete()
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={(val) => !isDeleting && onOpenChange(val)}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader className="gap-1">
					<DialogTitle className="font-display font-semibold text-lg text-destructive">Delete your review?</DialogTitle>
					<DialogDescription className="text-on-surface-variant text-sm">
						This review and rating will be permanently removed from this freelancer's profile. You can write a new
						review at any time.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className="mt-6 gap-2 sm:gap-2">
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						disabled={isDeleting}
						className={workspaceStyles.secondaryAction}
					>
						Keep review
					</button>
					<button
						type="button"
						onClick={handleDelete}
						disabled={isDeleting}
						className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-destructive px-4 font-label-md text-label-md font-medium text-white transition-colors hover:bg-destructive/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40"
					>
						{isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
						<span>Delete review</span>
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
