import { FaLinkedinIn } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"

export const SocialAuth = () => {
	const handleSocialLogin = (href: string | undefined) => {
		if (!href) return

		window.location.assign(href)
	}

	const apiUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")

	const socialProviders = [
		{
			id: "google",
			label: "Continue with Google",
			icon: FcGoogle,
			href: (import.meta.env.VITE_GOOGLE_OAUTH_URL as string | undefined) || `${apiUrl}/api/v1/login/google`,
		},
		{
			id: "linkedin",
			label: "Continue with LinkedIn",
			icon: FaLinkedinIn,
			href: (import.meta.env.VITE_LINKEDIN_OAUTH_URL as string | undefined) || `${apiUrl}/api/v1/login/linkedin`,
		},
	]

	return (
		<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
			{socialProviders.map(({ id, label, icon: Icon, href }) => {
				const isConfigured = Boolean(href)

				return (
					<button
						key={id}
						type="button"
						disabled={!isConfigured}
						onClick={() => handleSocialLogin(href)}
						title={isConfigured ? label : `${label} is not configured yet`}
						className="group flex h-11 items-center justify-center gap-2.5 rounded-lg border border-border bg-card px-3 font-medium text-[13px] text-foreground shadow-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-45"
					>
						<Icon className={`size-4.5 shrink-0 ${id === "linkedin" ? "text-[#0A66C2]" : ""} `} />

						<span className="hidden whitespace-nowrap xl:inline">
							{id === "google" && "Google"}
							{id === "linkedin" && "LinkedIn"}
						</span>

						<span className="whitespace-nowrap xl:hidden">
							{id === "google" && "Google"}
							{id === "linkedin" && "LinkedIn"}
						</span>
					</button>
				)
			})}
		</div>
	)
}

export default SocialAuth
