import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Link as RouterLink, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, ArrowRight, Check, KeyRound, LockKeyhole } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { LoginService } from "@/client"

import { AuthLayout } from "@/components/common/auth-layout"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"

import useCustomToast from "@/hooks/useCustomToast"

import { handleError } from "@/lib/errors"

const formSchema = z
	.object({
		new_password: z
			.string()
			.min(1, {
				message: "Password is required.",
			})
			.min(8, {
				message: "Password must be at least 8 characters.",
			}),

		confirm_password: z.string().min(1, {
			message: "Please confirm your password.",
		}),
	})
	.refine((data) => data.new_password === data.confirm_password, {
		message: "The passwords don't match.",
		path: ["confirm_password"],
	})

type FormData = z.infer<typeof formSchema>

export function ResetPasswordPage({ token }: { token: string }) {
	const { showSuccessToast, showErrorToast } = useCustomToast()

	const navigate = useNavigate()

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),

		mode: "onBlur",
		criteriaMode: "all",

		defaultValues: {
			new_password: "",
			confirm_password: "",
		},
	})

	const newPassword = form.watch("new_password")
	const confirmPassword = form.watch("confirm_password")

	const hasMinLength = newPassword.length >= 8

	const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword

	const mutation = useMutation({
		mutationFn: (data: { new_password: string; token: string }) =>
			LoginService.resetPassword({
				body: data,
			}),

		onSuccess: () => {
			showSuccessToast("Your password has been updated successfully.")

			form.reset()

			navigate({
				to: "/login",
			})
		},

		onError: handleError.bind(showErrorToast),
	})

	const onSubmit = (data: FormData) => {
		if (mutation.isPending) return

		mutation.mutate({
			new_password: data.new_password,
			token,
		})
	}

	return (
		<AuthLayout>
			<div>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} noValidate className="w-full">
						<RouterLink
							to="/login"
							className="mb-6 inline-flex items-center gap-2 rounded-md font-medium text-muted-foreground text-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
						>
							<ArrowLeft className="size-4" />
							Back to login
						</RouterLink>
						<div className="mb-7 text-center">
							<div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-muted text-foreground">
								<KeyRound className="size-5" />
							</div>

							<h1 className="font-display font-semibold text-3xl tracking-tight text-foreground">
								Create a new password
							</h1>

							<p className="mx-auto mt-2 max-w-sm text-muted-foreground text-sm leading-6">
								Choose a strong password that you haven't used before. You'll use it to sign in to your account.
							</p>
						</div>
						<div className="flex flex-col gap-5">
							<FormField
								control={form.control}
								name="new_password"
								render={({ field }) => (
									<FormItem className="gap-1.5">
										<FormLabel className="font-medium text-[13px] text-foreground">New password</FormLabel>

										<FormControl>
											<PasswordInput
												data-testid="new-password-input"
												autoComplete="new-password"
												placeholder="Create a new password"
												disabled={mutation.isPending}
												className="h-11 rounded-lg border-input bg-muted/30 text-foreground text-sm shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60"
												{...field}
											/>
										</FormControl>

										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="confirm_password"
								render={({ field }) => (
									<FormItem className="gap-1.5">
										<FormLabel className="font-medium text-[13px] text-foreground">Confirm password</FormLabel>

										<FormControl>
											<PasswordInput
												data-testid="confirm-password-input"
												autoComplete="new-password"
												placeholder="Confirm your new password"
												disabled={mutation.isPending}
												className="h-11 rounded-lg border-input bg-muted/30 text-foreground text-sm shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60"
												{...field}
											/>
										</FormControl>

										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							<div className="rounded-xl border border-border bg-card/60 p-4">
								<div className="mb-3 flex items-center gap-2 font-semibold text-[12px] text-foreground">
									<LockKeyhole className="size-3.5 text-muted-foreground" />
									Password requirements
								</div>

								<div className="space-y-2.5">
									<div
										className={`flex items-center gap-2 text-xs transition-colors ${hasMinLength ? "text-success" : "text-muted-foreground"} `}
									>
										<div
											className={`flex size-4 items-center justify-center rounded-full border transition-colors ${
												hasMinLength
													? `border-success/30 bg-success/10 text-success`
													: `border-border bg-muted/40 text-muted-foreground`
											} `}
										>
											<Check className="size-2.5" strokeWidth={3} />
										</div>
										At least 8 characters
									</div>

									<div
										className={`flex items-center gap-2 text-xs transition-colors ${
											passwordsMatch ? "text-success" : "text-muted-foreground"
										} `}
									>
										<div
											className={`flex size-4 items-center justify-center rounded-full border transition-colors ${
												passwordsMatch
													? `border-success/30 bg-success/10 text-success`
													: `border-border bg-muted/40 text-muted-foreground`
											} `}
										>
											<Check className="size-2.5" strokeWidth={3} />
										</div>
										Both passwords match
									</div>
								</div>
							</div>
							<LoadingButton
								type="submit"
								loading={mutation.isPending}
								disabled={mutation.isPending}
								className="h-11 w-full gap-2 rounded-lg font-semibold text-sm"
							>
								Reset password
								{!mutation.isPending && <ArrowRight className="size-4" />}
							</LoadingButton>
						</div>
						<div className="mt-7 border-border/70 border-t pt-6 text-center text-muted-foreground text-sm">
							Remember your password?{" "}
							<RouterLink
								to="/login"
								className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-link hover:decoration-primary/40"
							>
								Log in
							</RouterLink>
						</div>
					</form>
				</Form>
			</div>
		</AuthLayout>
	)
}
