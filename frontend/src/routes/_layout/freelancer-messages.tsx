import { createFileRoute } from "@tanstack/react-router"
import { MessagesPage } from "@/pages/common/messages-page"
export const Route = createFileRoute("/_layout/freelancer-messages")({
	validateSearch: (search: Record<string, unknown>): { with?: string } => ({
		with: typeof search.with === "string" ? search.with : undefined,
	}),
	component: Messages,
	head: () => ({ meta: [{ title: "Messages | Freelancer" }] }),
})
function Messages() {
	const search = Route.useSearch()
	const navigate = Route.useNavigate()
	return (
		<MessagesPage
			clientMode
			selectedContact={search.with}
			onSelectContact={(id) => void navigate({ search: { with: id || undefined } })}
		/>
	)
}
