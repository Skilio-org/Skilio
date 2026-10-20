import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"

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
					<DialogDescription className="text-muted-foreground text-sm">
						This review and rating will be permanently removed from this freelancer's profile. You can write a new
						review at any time.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className="mt-6 gap-2 sm:gap-2">
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
						Keep review
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}
						className="gap-2 font-medium"
					>
						{isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
						Delete review
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
