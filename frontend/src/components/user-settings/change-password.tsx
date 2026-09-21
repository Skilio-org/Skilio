import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { KeyRound } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { type UpdatePassword, UsersService } from "@/client"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

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
				<header className="flex items-start gap-4 border-outline-variant border-b p-5 sm:p-7">
					<span className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
						<KeyRound className="size-5" />
					</span>
					<div>
						<p className="font-bold text-brand-700 text-xs uppercase tracking-[0.16em]">Security</p>
						<h2 className="mt-2 font-headline-md font-semibold text-headline-md">Change password</h2>
						<p className="mt-2 text-muted-foreground text-sm leading-6">
							Use at least eight characters and avoid passwords you use elsewhere.
						</p>
					</div>
				</header>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-5 p-5 sm:p-7">
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
											aria-invalid={fieldState.invalid}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex flex-col gap-4 border-outline-variant border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
							<LoadingButton type="submit" loading={mutation.isPending} className="self-start sm:self-auto">
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
