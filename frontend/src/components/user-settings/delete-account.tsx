import { TriangleAlert, Trash2 } from "lucide-react"
import { useAccountRole } from "@/hooks/useAccountRole"
import { SettingsSectionHeader } from "@/components/user-settings/settings-section-header"
import DeleteConfirmation from "./delete-confirmation"

const DeleteAccount = () => {
	const savedItems = useAccountRole() === "freelancer" ? "saved jobs" : "saved talent"
	return (
		<section className="overflow-hidden rounded-lg border border-destructive/20 bg-surface-container-lowest">
			<SettingsSectionHeader
				eyebrow="Danger zone"
				title="Delete account"
				description="Permanently close your Skilio account and remove its associated information."
				icon={Trash2}
				tone="destructive"
				className="border-destructive/15"
			/>
			<div className="p-5 sm:p-7">
				<div className="flex flex-col gap-5 rounded-lg border border-destructive/30 bg-danger-soft p-5 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex gap-3">
						<span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-container-lowest text-destructive shadow-sm ring-1 ring-destructive/15">
							<TriangleAlert className="size-4" />
						</span>
						<div>
							<h3 className="font-semibold text-destructive">This cannot be undone</h3>
							<p className="mt-1 text-muted-foreground text-sm leading-6">
								Download anything you need before continuing.
							</p>
						</div>
					</div>
					<DeleteConfirmation />
				</div>
				<p className="mt-4 text-muted-foreground text-xs leading-5">
					Your profile, {savedItems}, conversations, and account data will be removed. Download anything you need before
					continuing.
				</p>
			</div>
		</section>
	)
}

export default DeleteAccount
