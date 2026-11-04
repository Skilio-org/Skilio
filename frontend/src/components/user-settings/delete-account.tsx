import { SettingsSectionHeader } from "@/components/user-settings/settings-section-header"
import { useAccountRole } from "@/hooks/useAccountRole"
import DeleteConfirmation from "./delete-confirmation"

const DeleteAccount = () => {
	const savedItems = useAccountRole() === "freelancer" ? "saved jobs" : "saved talent"
	return (
		<section className="overflow-hidden rounded-lg border border-destructive/30 bg-surface-container-lowest">
			<SettingsSectionHeader
				title="Delete account"
				description="Permanently close your Skilio account and remove its associated information."
				tone="destructive"
				className="border-destructive/20"
			/>
			<div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
				<p className="max-w-xl text-on-surface-variant text-sm leading-6">
					Your profile, {savedItems}, conversations and account data will be removed. This cannot be undone, so download
					anything you need first.
				</p>
				<div className="shrink-0">
					<DeleteConfirmation />
				</div>
			</div>
		</section>
	)
}

export default DeleteAccount
