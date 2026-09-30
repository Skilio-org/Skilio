import { createFileRoute, redirect } from "@tanstack/react-router"
import { isLoggedIn } from "@/hooks/useAuth"
import { SignupPage } from "@/pages/auth/signup-page"

export const Route = createFileRoute("/signup")({
	component: SignupRoute,
	validateSearch: (search: Record<string, unknown>): { role?: "client" | "freelancer" } => ({
		role: search.role === "client" || search.role === "freelancer" ? search.role : undefined,
	}),
	beforeLoad: async () => {
		if (isLoggedIn()) throw redirect({ to: "/dashboard" })
	},
	head: () => ({
		meta: [
			{ title: "Create account | Skilio" },
			{
				name: "description",
				content: "Create your account as a freelancer or client and start working together.",
			},
		],
	}),
})

function SignupRoute() {
	return <SignupPage role={Route.useSearch().role} />
}
