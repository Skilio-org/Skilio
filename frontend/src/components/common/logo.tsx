import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

import skilioIcon from "/assets/images/skilio-icon.svg"
import skilioLogo from "/assets/images/skilio-logo.svg"
import skilioTypography from "/assets/images/skilio-typography.svg"

export interface LogoProps {
	variant?: "full" | "icon" | "typography" | "combined" | "responsive"
	className?: string
	iconClassName?: string
	textClassName?: string
	gapClassName?: string
	asLink?: boolean
	to?: "/" | "/dashboard" | "/freelancer" | "/freelancer-dashboard" | string
	// Adds the light-mode outline so the lime logo stands out on light backgrounds. Turn off on dark-only surfaces.
	outlined?: boolean
}

export function Logo({
	variant = "full",
	className,
	iconClassName,
	textClassName,
	gapClassName = "gap-2.5",
	asLink = true,
	to = "/",
	outlined = true,
}: LogoProps) {
	let content: React.ReactNode

	switch (variant) {
		case "icon":
			content = (
				<img
					src={skilioIcon}
					alt="Skilio"
					draggable={false}
					className={cn("size-8 select-none object-contain", className)}
				/>
			)
			break

		case "typography":
			content = (
				<img
					src={skilioTypography}
					alt="Skilio"
					draggable={false}
					className={cn("h-6 w-auto select-none object-contain", className)}
				/>
			)
			break

		case "combined":
			content = (
				<img
					src={skilioLogo}
					alt="Skilio"
					draggable={false}
					className={cn("h-8 w-auto select-none object-contain", className)}
				/>
			)
			break

		case "responsive":
			content = (
				<div className={cn("inline-flex items-center", gapClassName, className)}>
					<img
						src={skilioIcon}
						alt="Skilio"
						draggable={false}
						className={cn("size-8 select-none object-contain shrink-0", iconClassName)}
					/>
					<img
						src={skilioTypography}
						alt="Skilio"
						draggable={false}
						className={cn("h-5 w-auto select-none object-contain group-data-[collapsible=icon]:hidden", textClassName)}
					/>
				</div>
			)
			break

		case "full":
		default:
			content = (
				<div className={cn("inline-flex items-center", gapClassName, className)}>
					<img
						src={skilioIcon}
						alt="Skilio"
						draggable={false}
						className={cn("size-8 select-none object-contain shrink-0", iconClassName)}
					/>
					<img
						src={skilioTypography}
						alt="Skilio"
						draggable={false}
						className={cn("h-5 w-auto select-none object-contain", textClassName)}
					/>
				</div>
			)
			break
	}

	content = <span className={cn("inline-flex", outlined && "logo-outline")}>{content}</span>

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
