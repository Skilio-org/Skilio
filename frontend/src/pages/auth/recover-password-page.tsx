import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Link as RouterLink } from "@tanstack/react-router"
import { ArrowLeft, ArrowRight, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { LoginService } from "@/client"

import { AuthLayout } from "@/components/common/auth-layout"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"

import useCustomToast from "@/hooks/useCustomToast"

import { handleError } from "@/lib/errors"

const formSchema = z.object({
	email: z.email({
		message: "Please enter a valid email address.",
	}),
})

type FormData = z.infer<typeof formSchema>

export function RecoverPasswordPage() {
	const { showSuccessToast, showErrorToast } = useCustomToast()

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),

		mode: "onBlur",

		defaultValues: {
			email: "",
		},
	})

	const recoverPassword = async (data: FormData) => {
		await LoginService.recoverPassword({
			path: {
				email: data.email,
			},
		})
	}

	const mutation = useMutation({
		mutationFn: recoverPassword,

		onSuccess: () => {
			showSuccessToast("Password recovery email sent successfully.")

			form.reset()
		},

		onError: handleError.bind(showErrorToast),
	})

	const onSubmit = (data: FormData) => {
		if (mutation.isPending) return

		mutation.mutate(data)
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
							{/* <div
                className="
                  mb-5
                  flex
                  size-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-primary/20
                  bg-accent
                  text-accent-foreground
                  shadow-sm
                "
              >
                <Mail className="size-5" />
              </div> */}

							<h1 className="font-display font-semibold text-3xl tracking-tight text-foreground">
								Forgot your password?
							</h1>

							<p className="mx-auto mt-2 max-w-sm text-muted-foreground text-sm leading-6">
								No problem. Enter the email address associated with your account and we'll send you a link to reset your
								password.
							</p>
						</div>

						<div className="flex flex-col gap-5">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem className="gap-1.5">
										<FormLabel className="font-medium text-[13px] text-foreground">Email address</FormLabel>

										<FormControl>
											<div className="relative">
												<Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />

												<Input
													data-testid="email-input"
													type="email"
													autoComplete="email"
													placeholder="you@example.com"
													disabled={mutation.isPending}
													className="h-11 rounded-lg border-input bg-muted/30 pr-4 pl-11 text-foreground text-sm shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60"
													{...field}
												/>
											</div>
										</FormControl>

										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							<LoadingButton
								type="submit"
								loading={mutation.isPending}
								disabled={mutation.isPending}
								className="h-11 w-full gap-2 rounded-lg font-semibold text-sm"
							>
								Send recovery link
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
