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
			<div>
				<div className="mb-7 text-center">
					<h1 className="font-display font-semibold text-3xl tracking-tight text-foreground">Welcome back</h1>
					<p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
						Sign in to continue working with your network.
					</p>
				</div>
				<SocialAuth />
				<Divider text="Or sign in with email" />
				<LoginForm />
				<div className="mt-6 text-center text-muted-foreground text-sm">
					Don't have an account yet?{" "}
					<RouterLink
						to="/signup"
						className="font-semibold text-foreground underline-offset-4 hover:underline focus-visible:underline"
					>
						Create an account
					</RouterLink>
				</div>
			</div>
		</AuthLayout>
	)
}
