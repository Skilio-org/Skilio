import { TriangleAlert } from "lucide-react"
import { useAccountRole } from "@/hooks/useAccountRole"
import DeleteConfirmation from "./delete-confirmation"

const DeleteAccount = () => {
	const savedItems = useAccountRole() === "freelancer" ? "saved jobs" : "saved talent"
	return (
		<section className="overflow-hidden rounded-2xl border border-destructive/20 bg-card shadow-card">
			<header className="border-destructive/15 border-b p-5 sm:p-7">
				<p className="font-bold text-destructive text-xs uppercase tracking-[0.16em]">Danger zone</p>
				<h2 className="mt-1 font-display font-semibold text-2xl">Delete account</h2>
				<p className="mt-1 max-w-2xl text-muted-foreground text-sm leading-6">
					Permanently close your Freelancer account and remove its associated information.
				</p>
			</header>
			<div className="p-5 sm:p-7">
				<div className="flex flex-col gap-5 rounded-2xl border border-destructive/30 bg-danger-soft p-5 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex gap-3">
						<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-destructive shadow-sm ring-1 ring-destructive/15">
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
