import { createFileRoute } from "@tanstack/react-router"
import { MessagesPage } from "@/pages/common/messages-page"

export const Route = createFileRoute("/_layout/messages")({
	validateSearch: (search: Record<string, unknown>): { userId?: string | undefined } => ({
		userId:
			typeof search.userId === "string"
				? search.userId.trim() || undefined
				: typeof search.with === "string"
					? search.with.trim() || undefined
					: undefined,
	}),
	component: Messages,
	head: () => ({ meta: [{ title: "Messages | Freelancer" }] }),
})

function Messages() {
	const search = Route.useSearch()
	const navigate = Route.useNavigate()
	return (
		<MessagesPage
			SelectedUserId={search.userId}
			onSelectContact={(id) => void navigate({ search: { userId: id || undefined } })}
		/>
	)
}	