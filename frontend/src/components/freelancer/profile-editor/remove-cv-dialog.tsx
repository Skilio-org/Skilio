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

// Asks before removing the resume, the same way the other confirmation dialogs in the app do.
export function RemoveCvDialog({
	open,
	isRemoving,
	onClose,
	onConfirm,
}: {
	open: boolean
	isRemoving: boolean
	onClose: () => void
	onConfirm: () => void
}) {
	return (
		<Dialog open={open} onOpenChange={(next) => !next && !isRemoving && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<span className="mb-1 grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive">
						<Trash2 className="size-5" />
					</span>
					<DialogTitle>Remove your resume</DialogTitle>
					<DialogDescription>
						Clients will no longer be able to download your resume. You can upload a new one at any time.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<button type="button" className={workspaceStyles.secondaryAction} disabled={isRemoving} onClick={onClose}>
						Cancel
					</button>
					<button type="button" className={workspaceStyles.destructiveAction} disabled={isRemoving} onClick={onConfirm}>
						{isRemoving ? "Removing..." : "Remove resume"}
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
