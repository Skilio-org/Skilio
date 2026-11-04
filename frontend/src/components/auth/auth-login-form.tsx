import { zodResolver } from "@hookform/resolvers/zod"
import { Link as RouterLink } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Body_login_login_access_token as AccessToken } from "@/client"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import useAuth from "@/hooks/useAuth"
import { AuthInput } from "./auth-input"

const formSchema = z.object({
	username: z.email({
		message: "Please enter a valid email address.",
	}),

	password: z
		.string()
		.min(1, {
			message: "Password is required.",
		})
		.min(8, {
			message: "Password must be at least 8 characters.",
		}),
}) satisfies z.ZodType<AccessToken>

type FormData = z.infer<typeof formSchema>

export const LoginForm = () => {
	const onSubmit = (data: FormData) => {
		if (loginMutation.isPending) return

		loginMutation.mutate(data)
	}

	const { loginMutation } = useAuth()

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),

		mode: "onBlur",
		criteriaMode: "all",

		defaultValues: {
			username: "",
			password: "",
		},
	})
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
				<AuthInput
					control={form.control}
					inputName="username"
					inputLabel="Email"
					inputPlaceHolder="you@example.com"
					inputDataTestId="email-input"
					inputType="email"
					disabled={loginMutation.isPending}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem className="gap-1.5">
							<div className="flex items-center justify-between gap-4">
								<FormLabel className="font-medium text-[13px] text-foreground">Password</FormLabel>

								<RouterLink
									to="/recover-password"
									className="font-medium text-foreground text-xs underline-offset-4 hover:underline"
								>
									Forgot your password?
								</RouterLink>
							</div>

							<FormControl>
								<PasswordInput
									data-testid="password-input"
									autoComplete="current-password"
									placeholder="Enter your password"
									disabled={loginMutation.isPending}
									className="h-11 rounded-lg border-input bg-muted/30 text-foreground text-sm shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60"
									{...field}
								/>
							</FormControl>

							<FormMessage className="text-xs" />
						</FormItem>
					)}
				/>
				<LoadingButton
					type="submit"
					loading={loginMutation.isPending}
					disabled={loginMutation.isPending}
					className="mt-2 h-11 w-full rounded-lg font-semibold text-sm"
				>
					Sign in
				</LoadingButton>
			</form>
		</Form>
	)
}

export default LoginForm
