import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Mail, Pencil, UserRound } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { UsersService, type UserUpdateMe } from "@/client"
import { Monogram, workspaceStyles } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { SettingsSectionHeader } from "@/components/user-settings/settings-section-header"
import { useAccountAvatarUrl } from "@/hooks/useAccountAvatar"
import { useAccountRole } from "@/hooks/useAccountRole"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

const formSchema = z.object({
	full_name: z.string().max(30).optional(),
	email: z.email({ message: "Invalid email address" }),
})

type FormData = z.infer<typeof formSchema>

const UserInformation = () => {
	const queryClient = useQueryClient()
	const { showSuccessToast, showErrorToast } = useCustomToast()
	const [editMode, setEditMode] = useState(false)
	const { user: currentUser } = useAuth()
	const accountLabel = useAccountRole() === "freelancer" ? "Freelancer account" : "Client account"
	const avatarUrl = useAccountAvatarUrl(currentUser?.id)
	const [avatarFailed, setAvatarFailed] = useState(false)
	useEffect(() => setAvatarFailed(false), [])

	const [emailPasswordDialogOpen, setEmailPasswordDialogOpen] = useState(false)

	const [emailChangePassword, setEmailChangePassword] = useState("")

	const [pendingUpdate, setPendingUpdate] = useState<UserUpdateMe | null>(null)

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		mode: "onBlur",
		criteriaMode: "all",
		defaultValues: {
			full_name: currentUser?.full_name ?? "",
			email: currentUser?.email ?? "",
		},
	})

	useEffect(() => {
		if (!currentUser || editMode) return

		form.reset({
			full_name: currentUser.full_name ?? "",
			email: currentUser.email,
		})
	}, [currentUser, editMode, form])

	const mutation = useMutation({
		mutationFn: (data: UserUpdateMe) => UsersService.updateUserMe({ body: data }),
		onSuccess: () => {
			showSuccessToast("User updated successfully")
			setEditMode(false)
			setEmailPasswordDialogOpen(false)
			setEmailChangePassword("")
			setPendingUpdate(null)
		},
		onError: handleError.bind(showErrorToast),
		onSettled: () => queryClient.invalidateQueries(),
	})

	const onSubmit = (data: FormData) => {
		const updateData: UserUpdateMe = {}

		if ((data.full_name ?? "") !== (currentUser?.full_name ?? "")) {
			updateData.full_name = data.full_name
		}

		if (data.email !== currentUser?.email) {
			updateData.email = data.email
		}

		// An email change requires password confirmation.
		if (updateData.email) {
			setPendingUpdate(updateData)
			setEmailChangePassword("")
			setEmailPasswordDialogOpen(true)
			return
		}

		// No email change: save other edits normally.
		if (Object.keys(updateData).length > 0) {
			mutation.mutate(updateData)
		}
	}

	const onCancel = () => {
		form.reset()
		setEditMode(false)
	}

	const displayName = currentUser?.full_name || accountLabel
	const initials = displayName
		.split(" ")
		.map((word) => word[0])
		.join("")
		.slice(0, 2)
		.toUpperCase()

	return (
		<div className="space-y-5">
			<section className="flex items-center gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 sm:px-7">
				<Monogram className="size-16 shrink-0 overflow-hidden bg-brand-100 text-brand-800 text-lg dark:bg-brand-950 dark:text-brand-200">
					{avatarUrl && !avatarFailed ? (
						<img
							src={avatarUrl}
							alt={displayName}
							className="size-full rounded-lg object-cover"
							onError={() => setAvatarFailed(true)}
						/>
					) : (
						initials
					)}
				</Monogram>
				<div className="min-w-0">
					<p className="truncate font-semibold text-lg">{displayName}</p>
					<p className="mt-0.5 text-on-surface-variant text-sm">{accountLabel}</p>
				</div>
			</section>

			<section className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
				<SettingsSectionHeader
					eyebrow="Identity"
					title="Personal details"
					description="Your name and email appear across your workspace."
					icon={UserRound}
					className="flex-col justify-between gap-4 sm:flex-row sm:items-start"
					actions={
						!editMode && (
							<button type="button" onClick={() => setEditMode(true)} className={workspaceStyles.secondaryAction}>
								<Pencil className="size-4" />
								Edit details
							</button>
						)
					}
				/>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						{editMode ? (
							<div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
								<FormField
									control={form.control}
									name="full_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Full name</FormLabel>
											<FormControl>
												<Input
													type="text"
													autoComplete="name"
													className="h-11 rounded-lg border-outline-variant bg-surface-container-lowest shadow-none dark:bg-surface-container-lowest"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email address</FormLabel>
											<FormControl>
												<Input
													type="email"
													autoComplete="email"
													className="h-11 rounded-lg border-outline-variant bg-surface-container-lowest shadow-none dark:bg-surface-container-lowest"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						) : (
							<div className="divide-y divide-border px-5 sm:px-7">
								<InformationRow
									icon={UserRound}
									label="Full name"
									value={form.getValues("full_name") || "Not added yet"}
								/>
								<InformationRow
									icon={Mail}
									label="Email address"
									value={form.getValues("email") || "Not available"}
									badge={currentUser?.is_email_verified ? "Verified" : "Unverified"}
								/>
							</div>
						)}

						{editMode && (
							<footer className="flex flex-col-reverse gap-3 border-outline-variant border-t bg-muted/30 p-4 sm:flex-row sm:justify-end sm:px-7">
								<Button
									type="button"
									variant="outline"
									onClick={onCancel}
									disabled={mutation.isPending}
									className={workspaceStyles.secondaryAction}
								>
									Cancel
								</Button>
								<LoadingButton
									type="submit"
									loading={mutation.isPending}
									disabled={!form.formState.isDirty}
									className={workspaceStyles.primaryAction}
								>
									Save changes
								</LoadingButton>
							</footer>
						)}
					</form>
				</Form>
			</section>
			<Dialog
				open={emailPasswordDialogOpen}
				onOpenChange={(open) => {
					setEmailPasswordDialogOpen(open)

					if (!open) {
						setEmailChangePassword("")
						setPendingUpdate(null)
					}
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Confirm your password</DialogTitle>
						<DialogDescription>
							To change your email address, enter your current password to verify your identity.
						</DialogDescription>
					</DialogHeader>

					<form
						onSubmit={(event) => {
							event.preventDefault()

							if (!pendingUpdate) return

							mutation.mutate({
								...pendingUpdate,
								password: emailChangePassword,
							})
						}}
						className="space-y-4"
					>
						<div className="space-y-2">
							<label htmlFor="email-change-password" className="text-sm font-medium">
								Current password
							</label>

							<Input
								id="email-change-password"
								type="password"
								autoComplete="current-password"
								placeholder="Enter your current password"
								value={emailChangePassword}
								onChange={(event) => setEmailChangePassword(event.target.value)}
								required
								autoFocus
								className="mt-1 h-11 rounded-lg border-outline-variant bg-surface-container-lowest shadow-none dark:bg-surface-container-lowest"
							/>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setEmailPasswordDialogOpen(false)
									setEmailChangePassword("")
									setPendingUpdate(null)
								}}
								disabled={mutation.isPending}
								className={workspaceStyles.secondaryAction}
							>
								Cancel
							</Button>
							<LoadingButton
								className={workspaceStyles.primaryAction}
								type="submit"
								loading={mutation.isPending}
								disabled={!emailChangePassword}
							>
								Confirm email change
							</LoadingButton>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}

function InformationRow({
	label,
	value,
	badge,
}: {
	icon?: typeof UserRound
	label: string
	value: string
	badge?: string
}) {
	return (
		<div className="flex items-center gap-4 py-4">
			<p className="w-36 shrink-0 text-on-surface-variant text-sm">{label}</p>
			<p className="min-w-0 flex-1 truncate font-medium text-sm">{value}</p>
			{badge && (
				<span
					className={`shrink-0 rounded px-2 py-0.5 font-medium text-xs ${badge === "Verified" ? "bg-success-soft text-success" : "bg-surface-container text-on-surface-variant"}`}
				>
					{badge}
				</span>
			)}
		</div>
	)
}

export default UserInformation
