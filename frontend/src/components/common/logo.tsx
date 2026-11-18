import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

import skilioLogo from "/assets/images/skilio-logo.svg"

interface LogoProps {
	variant?: "full" | "icon" | "combined" | "responsive"
	className?: string
	iconClassName?: string
	asLink?: boolean
	to?: "/" | "/dashboard" | "/freelancer" | "/freelancer-dashboard" | string
}

export function Logo({ className, iconClassName, asLink = true, to = "/" }: LogoProps) {
	const content = (
		<span className="inline-flex">
			<img
				src={skilioLogo}
				alt="Skilio"
				draggable={false}
				className={cn("h-8 w-auto shrink-0 select-none object-contain", className, iconClassName)}
			/>
		</span>
	)

	if (!asLink) {
		return content
	}

	return (
		<Link
			to={to}
			aria-label="Skilio home"
			className="inline-flex shrink-0 items-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		>
			{content}
		</Link>
	)
}
