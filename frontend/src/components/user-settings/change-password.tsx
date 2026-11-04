import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { KeyRound } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { type UpdatePassword, UsersService } from "@/client"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import { SettingsSectionHeader } from "@/components/user-settings/settings-section-header"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/lib/errors"
import { workspaceStyles } from "../dashboard/dashboard-header"

const formSchema = z
	.object({
		current_password: z
			.string()
			.min(1, { message: "Password is required" })
			.min(8, { message: "Password must be at least 8 characters" }),
		new_password: z
			.string()
			.min(1, { message: "Password is required" })
			.min(8, { message: "Password must be at least 8 characters" }),
		confirm_password: z.string().min(1, { message: "Password confirmation is required" }),
	})
	.refine((data) => data.new_password === data.confirm_password, {
		message: "The passwords don't match",
		path: ["confirm_password"],
	})

type FormData = z.infer<typeof formSchema>

const ChangePassword = () => {
	const { showSuccessToast, showErrorToast } = useCustomToast()
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		mode: "onSubmit",
		criteriaMode: "all",
		defaultValues: {
			current_password: "",
			new_password: "",
			confirm_password: "",
		},
	})

	const mutation = useMutation({
		mutationFn: (data: UpdatePassword) => UsersService.updatePasswordMe({ body: data }),
		onSuccess: () => {
			showSuccessToast("Password updated successfully")
			form.reset()
		},
		onError: handleError.bind(showErrorToast),
	})

	const onSubmit = async (data: FormData) => {
		mutation.mutate(data)
	}

	return (
		<div className="space-y-5">
			<section className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
				<SettingsSectionHeader
					eyebrow="Security"
					title="Change password"
					description="Use at least eight characters and avoid passwords you use elsewhere."
					icon={KeyRound}
				/>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full max-w-xl flex-col gap-5 p-5 sm:p-7">
						<FormField
							control={form.control}
							name="current_password"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel>Current password</FormLabel>
									<FormControl>
										<PasswordInput
											data-testid="current-password-input"
											placeholder="••••••••"
											className="h-11 rounded-lg border-input bg-surface-container-lowest shadow-none dark:bg-surface-container-lowest"
											aria-invalid={fieldState.invalid}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="new_password"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel>New password</FormLabel>
									<FormControl>
										<PasswordInput
											data-testid="new-password-input"
											placeholder="••••••••"
											className="h-11 rounded-lg border-input bg-surface-container-lowest shadow-none dark:bg-surface-container-lowest"
											aria-invalid={fieldState.invalid}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="confirm_password"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel>Confirm password</FormLabel>
									<FormControl>
										<PasswordInput
											data-testid="confirm-password-input"
											placeholder="••••••••"
											className="h-11 rounded-lg border-input bg-surface-container-lowest shadow-none dark:bg-surface-container-lowest"
											aria-invalid={fieldState.invalid}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex flex-col gap-4 border-outline-variant border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
							<LoadingButton type="submit" loading={mutation.isPending} className={workspaceStyles.primaryAction}>
								Update password
							</LoadingButton>
						</div>
					</form>
				</Form>
			</section>
		</div>
	)
}

export default ChangePassword
