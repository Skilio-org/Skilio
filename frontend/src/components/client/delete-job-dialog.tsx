import { Trash2 } from "lucide-react"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

// Asks before deleting a job. `jobTitle` is null while the dialog is closed.
export function DeleteJobDialog({
	jobTitle,
	isDeleting,
	onClose,
	onConfirm,
}: {
	jobTitle: string | null
	isDeleting: boolean
	onClose: () => void
	onConfirm: () => void
}) {
	return (
		<Dialog open={jobTitle !== null} onOpenChange={(open) => !open && !isDeleting && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<span className="mb-1 grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive">
						<Trash2 className="size-5" />
					</span>
					<DialogTitle>Delete this job</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete <strong className="text-foreground">{jobTitle || "this job"}</strong>? This
						cannot be undone.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<button type="button" className={workspaceStyles.secondaryAction} disabled={isDeleting} onClick={onClose}>
						Cancel
					</button>
					<button
						type="button"
						className={workspaceStyles.destructiveAction}
						disabled={isDeleting}
						onClick={onConfirm}
					>
						{isDeleting ? "Deleting..." : "Delete job"}
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
