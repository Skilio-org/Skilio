import { createFileRoute } from "@tanstack/react-router"
import DesignSystemPage from "@/pages/common/design-system-page"

export const Route = createFileRoute("/design-system")({
	component: DesignSystemPage,
	head: () => ({ meta: [{ title: "Design system | Skilio" }] }),
})
