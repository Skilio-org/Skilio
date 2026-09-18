import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { LinkedinAuthCallbackPage } from "@/pages/auth/linkedin-auth-callback-page"

const linkedinAuthSearchSchema = z.object({
	code: z.string().optional(),
	error: z.string().optional(),
})

export const Route = createFileRoute("/linkedinAuth")({
	component: LinkedinAuthCallbackRoute,
	validateSearch: (search) => linkedinAuthSearchSchema.parse(search),
})

function LinkedinAuthCallbackRoute() {
	return <LinkedinAuthCallbackPage {...Route.useSearch()} />
}
