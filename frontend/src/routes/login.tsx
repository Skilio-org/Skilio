import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { isLoggedIn } from "@/hooks/useAuth"
import { LoginPage } from "@/pages/auth/login-page"

const loginSearchSchema = z.object({ error: z.string().optional() })

export const Route = createFileRoute("/login")({
	component: LoginRoute,
	validateSearch: (search) => loginSearchSchema.parse(search),
	beforeLoad: async () => {
		if (isLoggedIn()) throw redirect({ to: "/dashboard" })
	},
	head: () => ({
		meta: [{ title: "Log in | Freelancer" }, { name: "description", content: "Log in to your Freelancer account." }],
	}),
})

function LoginRoute() {
	const { error } = Route.useSearch()
	const navigate = Route.useNavigate()
	return <LoginPage error={error} onErrorHandled={() => void navigate({ search: {}, replace: true })} />
}
