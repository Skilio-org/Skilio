import { UserMinus } from "lucide-react"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

export function RemoveConnectionDialog({
	personName,
	isRemoving,
	onClose,
	onConfirm,
}: {
	personName: string | null
	isRemoving: boolean
	onClose: () => void
	onConfirm: () => void
}) {
	return (
		<Dialog open={personName !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<span className="mb-1 grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive">
						<UserMinus className="size-5" />
					</span>
					<DialogTitle>Remove connection</DialogTitle>
					<DialogDescription>
						Are you sure you want to remove your connection with <strong className="text-foreground">{personName}</strong>
						? Direct messaging channels will be locked until a new connection is accepted.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<button type="button" className={workspaceStyles.secondaryAction} onClick={onClose}>
						Cancel
					</button>
					<button
						type="button"
						className={workspaceStyles.destructiveAction}
						disabled={isRemoving}
						onClick={onConfirm}
					>
						{isRemoving ? "Removing..." : "Remove connection"}
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
