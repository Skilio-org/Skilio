import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import { UsersService } from "@/client"
import { workspaceStyles } from "@/components/dashboard/dashboard-header"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { LoadingButton } from "@/components/ui/loading-button"
import { useAccountRole } from "@/hooks/useAccountRole"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const DeleteConfirmation = () => {
	const queryClient = useQueryClient()
	const { showSuccessToast, showErrorToast } = useCustomToast()
	const { handleSubmit } = useForm()
	const { logout } = useAuth()
	const savedItems = useAccountRole() === "freelancer" ? "saved jobs" : "saved talent"

	const mutation = useMutation({
		mutationFn: () => UsersService.deleteUserMe(),
		onSuccess: () => {
			showSuccessToast("Your account has been successfully deleted")
			logout()
		},
		onError: handleError.bind(showErrorToast),
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["currentUser"] })
		},
	})

	const onSubmit = async () => {
		mutation.mutate()
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<button type="button" className={workspaceStyles.destructiveAction}>
					Delete account
				</button>
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogHeader>
						<DialogTitle>Delete your account?</DialogTitle>
						<DialogDescription>
							Your profile, {savedItems}, conversations, and account data will be permanently deleted. This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>

					<DialogFooter className="mt-4">
						<DialogClose asChild>
							<button type="button" disabled={mutation.isPending} className={workspaceStyles.secondaryAction}>
								Cancel
							</button>
						</DialogClose>
						<LoadingButton type="submit" loading={mutation.isPending} className={workspaceStyles.destructiveAction}>
							Delete permanently
						</LoadingButton>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default DeleteConfirmation
