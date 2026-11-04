import { FileText } from "lucide-react"
import { useState } from "react"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function MessageToolDialogView({
	onClose,
	onInsert,
}: {
	onClose: () => void
	onInsert: (brief: string) => void
}) {
	const [brief, setBrief] = useState("")
	return (
		<Dialog
			open
			onOpenChange={(open) => {
				if (!open) onClose()
			}}
		>
			<DialogContent className="sm:max-w-lg border-outline-variant bg-surface-container-lowest">
				<DialogHeader>
					<span className="mb-2 grid size-10 place-items-center rounded-lg border border-outline-variant/60 bg-surface-container text-link">
						<FileText className="size-5" />
					</span>
					<DialogTitle className="font-headline-sm font-semibold text-headline-sm text-on-surface">
						Add a project brief
					</DialogTitle>
					<DialogDescription className="font-body-sm text-body-sm text-on-surface-variant">
						Give your collaborator a clear starting point. You can review it in your message before sending.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(event) => {
						event.preventDefault()
						if (brief.trim()) onInsert(brief.trim())
					}}
					className="space-y-4"
				>
					<label className="block font-label-md font-medium text-label-md text-on-surface">
						What do you have in mind?
						<textarea
							autoFocus
							required
							value={brief}
							maxLength={8000}
							onChange={(event) => setBrief(event.target.value)}
							rows={7}
							placeholder={
								"Project goal\nWhat you'd like to create or improve\n\nScope and deliverables\n\nTimeline and budget"
							}
							className="mt-2 w-full resize-y rounded-lg border border-input bg-surface-container-low/40 px-3.5 py-2.5 font-body-sm text-body-sm leading-relaxed text-on-surface outline-none placeholder:text-outline focus:border-outline focus:bg-surface-container-lowest focus:ring-1 focus:ring-outline"
						/>
					</label>
					<div className="flex justify-end gap-2.5 pt-1">
						<button type="button" className={workspaceStyles.secondaryAction} onClick={onClose}>
							Cancel
						</button>
						<button
							type="submit"
							disabled={!brief.trim()}
							className={`${workspaceStyles.primaryAction} disabled:cursor-not-allowed disabled:opacity-40`}
						>
							Add to message
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
