import { Trash2, UserMinus } from "lucide-react"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import type { BackendProposal } from "@/hooks/useFreelancerProposals"

// Asks before discarding a draft, deleting a declined record or withdrawing a submitted proposal.
export function ProposalWithdrawDialog({
	proposal,
	isWithdrawing,
	onClose,
	onConfirm,
}: {
	proposal: BackendProposal | null
	isWithdrawing: boolean
	onClose: () => void
	onConfirm: () => void
}) {
	const isDraft = proposal?.rawStatus === "draft"
	const isRejected = proposal?.rawStatus === "rejected"

	return (
		<Dialog open={Boolean(proposal)} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<span className="mb-1 grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive">
						{isDraft || isRejected ? <Trash2 className="size-5" /> : <UserMinus className="size-5" />}
					</span>
					<DialogTitle>{isDraft ? "Discard draft" : isRejected ? "Delete proposal record" : "Withdraw proposal"}</DialogTitle>
					<DialogDescription>
						{isDraft ? (
							<>
								Are you sure you want to discard your draft for{" "}
								<strong className="text-foreground">{proposal?.job.title}</strong>? This cannot be undone.
							</>
						) : isRejected ? (
							<>
								Are you sure you want to remove the declined proposal record for{" "}
								<strong className="text-foreground">{proposal?.job.title}</strong>?
							</>
						) : (
							<>
								Are you sure you want to withdraw your proposal for{" "}
								<strong className="text-foreground">{proposal?.job.title}</strong>? The client will no longer see your
								submission.
							</>
						)}
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<button type="button" className={workspaceStyles.secondaryAction} onClick={onClose}>
						Cancel
					</button>
					<button
						type="button"
						className={workspaceStyles.destructiveAction}
						disabled={isWithdrawing}
						onClick={onConfirm}
					>
						{isWithdrawing ? "Processing..." : isDraft ? "Discard draft" : isRejected ? "Delete record" : "Withdraw proposal"}
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
