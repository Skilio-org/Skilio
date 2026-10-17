import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { GoogleAuthCallbackPage } from "@/pages/auth/google-auth-callback-page"

const googleAuthSearchSchema = z.object({
	code: z.string().optional(),
	state: z.string().optional(),
	error: z.string().optional(),
})

export const Route = createFileRoute("/googleAuth")({
	component: GoogleAuthCallbackRoute,
	validateSearch: (search) => googleAuthSearchSchema.parse(search),
})

function GoogleAuthCallbackRoute() {
	return <GoogleAuthCallbackPage {...Route.useSearch()} />
}
