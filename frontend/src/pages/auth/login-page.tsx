import { Link as RouterLink } from "@tanstack/react-router"
import { useEffect } from "react"
import { toast } from "sonner"
import Divider from "@/components/auth/auth-divider"
import LoginForm from "@/components/auth/auth-login-form"
import SocialAuth from "@/components/auth/auth-social"
import { AuthLayout } from "@/components/common/auth-layout"
export function LoginPage({ error, onErrorHandled }: { error?: string; onErrorHandled: () => void }) {
	useEffect(() => {
		if (!error) return

		toast.error(`We couldn't log you in. ${error}`, {
			id: "login-error",
		})

		onErrorHandled()
	}, [error, onErrorHandled])

	return (
		<AuthLayout>
			<div className="mx-auto w-full max-w-115">
				<div className="mb-8 space-y-3 text-center">
					<h1 className="font-bold font-display text-[42px] text-foreground leading-[0.98] tracking-[-0.045em] sm:text-[46px]">
						Login to your <br />
						account.
					</h1>

					<p className="mx-auto max-w-sm text-muted-foreground text-sm leading-6">
						Welcome back. Enter your details to continue to your account.
					</p>
				</div>

				<LoginForm />
				<Divider text="Or continue with" />
				<SocialAuth />

				<div className="mt-7 text-center text-muted-foreground text-sm">
					Don't have an account yet?{" "}
					<RouterLink
						to="/signup"
						className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/40"
					>
						Sign up
					</RouterLink>
				</div>
			</div>
		</AuthLayout>
	)
}
