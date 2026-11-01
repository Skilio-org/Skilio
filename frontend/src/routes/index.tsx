import { createFileRoute } from "@tanstack/react-router"
import { LandingPage } from "@/pages/common/landing-page"

export const Route = createFileRoute("/")({
	component: LandingPage,
	head: () => ({
		meta: [
			{ title: "Skilio - Top 3% Independent Talent Network" },
			{
				name: "description",
				content:
					"Connect directly with pre-vetted senior engineers, designers, and AI specialists. Transparent rates, milestone escrow protection, and zero hidden platform cuts.",
			},
		],
	}),
})
