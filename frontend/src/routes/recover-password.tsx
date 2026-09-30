import { createFileRoute, redirect } from "@tanstack/react-router"
import { isLoggedIn } from "@/hooks/useAuth"
import { RecoverPasswordPage } from "@/pages/auth/recover-password-page"

export const Route = createFileRoute("/recover-password")({
	component: RecoverPasswordPage,
	beforeLoad: async () => {
		if (isLoggedIn()) throw redirect({ to: "/dashboard" })
	},
	head: () => ({
		meta: [
			{ title: "Recover password | Skilio" },
			{
				name: "description",
				content: "Recover access to your Skilio account by requesting a password reset link.",
			},
		],
	}),
})
