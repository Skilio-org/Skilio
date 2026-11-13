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

// Asks before removing a work experience, an education or a project from the profile.
// `kindLabel` is for example "project"; `title` is the name of the entry, or null while the dialog is closed.
export function RemoveEntryDialog({
	kindLabel,
	title,
	onClose,
	onConfirm,
}: {
	kindLabel: string
	title: string | null
	onClose: () => void
	onConfirm: () => void
}) {
	return (
		<Dialog open={title !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<span className="mb-1 grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive">
						<Trash2 className="size-5" />
					</span>
					<DialogTitle>Remove this {kindLabel}</DialogTitle>
					<DialogDescription className="break-words">
						Are you sure you want to remove <strong className="text-foreground">{title}</strong> from your profile? The
						change is applied when you save your profile.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<button type="button" className={workspaceStyles.secondaryAction} onClick={onClose}>
						Cancel
					</button>
					<button type="button" className={workspaceStyles.destructiveAction} onClick={onConfirm}>
						Remove {kindLabel}
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
