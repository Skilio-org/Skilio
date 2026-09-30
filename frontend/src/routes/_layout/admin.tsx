import { createFileRoute, redirect } from "@tanstack/react-router"
import { UsersService } from "@/client"
import { AdminPage } from "@/pages/common/admin-page"

export const Route = createFileRoute("/_layout/admin")({
	component: AdminPage,
	beforeLoad: async () => {
		const { data: user } = await UsersService.readUserMe()
		if (!user.is_superuser) throw redirect({ to: "/dashboard" })
	},
	head: () => ({ meta: [{ title: "User management | Skilio" }] }),
})
