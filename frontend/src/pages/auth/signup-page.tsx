import { zodResolver } from "@hookform/resolvers/zod"
import { Link as RouterLink } from "@tanstack/react-router"
import { ArrowRight, BriefcaseBusiness, Laptop } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Divider from "@/components/auth/auth-divider"
import { AuthInput } from "@/components/auth/auth-input"
import SocialAuth from "@/components/auth/auth-social"
import { AuthLayout } from "@/components/common/auth-layout"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { LoadingButton } from "@/components/ui/loading-button"
import useAuth from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const formSchema = z
	.object({
		role: z.enum(["freelancer", "client"], { message: "Please choose an account type." }),
		full_name: z.string().trim().min(1, "Full name is required.").min(2, "Full name must be at least 2 characters."),
		email: z.email({ message: "Please enter a valid email address." }),
		password: z.string().min(1, "Password is required.").min(8, "Password must be at least 8 characters."),
		confirm_password: z.string().min(1, "Please confirm your password."),
	})
	.refine((data) => data.password === data.confirm_password, {
		message: "The passwords don't match.",
		path: ["confirm_password"],
	})

type FormData = z.infer<typeof formSchema>

export function SignupPage({ role }: { role?: "client" | "freelancer" }) {
	const { signUpMutation } = useAuth()
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		mode: "onBlur",
		criteriaMode: "all",
		defaultValues: { role: role ?? "freelancer", full_name: "", email: "", password: "", confirm_password: "" },
	})

	const onSubmit = (data: FormData) => {
		if (signUpMutation.isPending) return
		const { confirm_password: _confirmPassword, role: selectedRole, ...submitData } = data
		signUpMutation.mutate({ ...submitData, role: selectedRole, active_role: selectedRole })
	}

	return (
		<AuthLayout>
			<div className="text-center">
				<h1 className="font-display font-semibold text-3xl tracking-tight text-foreground">Create your account</h1>
				<p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
					Join Skilio to find great work or the right person for your project.
				</p>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mt-7">
					<FormField
						control={form.control}
						name="role"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<div
										role="group"
										aria-label="Account type"
										className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
									>
										{(
											[
												{ value: "freelancer", label: "I want to find work", icon: Laptop },
												{ value: "client", label: "I want to hire", icon: BriefcaseBusiness },
											] as const
										).map(({ value, label, icon: Icon }) => (
											<button
												key={value}
												type="button"
												aria-pressed={field.value === value}
												disabled={signUpMutation.isPending}
												onClick={() => field.onChange(value)}
												className={cn(
													"flex min-h-10 items-center justify-center gap-2 rounded-lg px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 sm:text-sm",
													field.value === value
														? "bg-card text-foreground shadow-sm"
														: "text-muted-foreground hover:text-foreground",
												)}
											>
												<Icon className="size-4 shrink-0" aria-hidden="true" />
												{label}
											</button>
										))}
									</div>
								</FormControl>
								<FormMessage className="text-xs" />
							</FormItem>
						)}
					/>
					<div className="mt-5">
						<SocialAuth />
					</div>
					<Divider text="Or sign up with email" />
					<div className="flex flex-col gap-4">
						<AuthInput
							control={form.control}
							inputName="full_name"
							inputLabel="Full name"
							inputPlaceHolder="Alex Morgan"
							inputDataTestId="full-name-input"
							inputType="text"
							disabled={signUpMutation.isPending}
						/>
						<AuthInput
							control={form.control}
							inputName="email"
							inputLabel="Email address"
							inputPlaceHolder="alex@example.com"
							inputDataTestId="email-input"
							inputType="email"
							disabled={signUpMutation.isPending}
						/>
						<AuthInput
							control={form.control}
							inputName="password"
							inputLabel="Password"
							inputPlaceHolder="At least 8 characters"
							inputDataTestId="password-input"
							inputType="password"
							disabled={signUpMutation.isPending}
						/>
						<AuthInput
							control={form.control}
							inputName="confirm_password"
							inputLabel="Confirm password"
							inputPlaceHolder="Repeat your password"
							inputDataTestId="confirm-password-input"
							inputType="password"
							disabled={signUpMutation.isPending}
						/>
					</div>
					<LoadingButton
						type="submit"
						loading={signUpMutation.isPending}
						disabled={signUpMutation.isPending}
						className="mt-6 h-11 w-full rounded-lg font-semibold text-sm"
					>
						Create account
						{!signUpMutation.isPending && <ArrowRight className="size-4" aria-hidden="true" />}
					</LoadingButton>
				</form>
			</Form>
			<p className="mt-6 text-center text-sm text-muted-foreground">
				Already have an account?{" "}
				<RouterLink
					to="/login"
					className="font-semibold text-foreground underline-offset-4 hover:underline focus-visible:underline"
				>
					Sign in
				</RouterLink>
			</p>
		</AuthLayout>
	)
}
