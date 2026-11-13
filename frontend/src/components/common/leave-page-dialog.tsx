import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

// Shown when the user tries to leave a page that has unsaved work.
export function LeavePageDialog({
	open,
	message,
	onStay,
	onLeave,
}: {
	open: boolean
	message: string
	onStay: () => void
	onLeave: () => void
}) {
	return (
		<Dialog open={open} onOpenChange={(next) => !next && onStay()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Leave this page?</DialogTitle>
					<DialogDescription>{message}</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<button type="button" className={workspaceStyles.secondaryAction} onClick={onStay}>
						Stay on this page
					</button>
					<button type="button" className={workspaceStyles.destructiveAction} onClick={onLeave}>
						Leave
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
