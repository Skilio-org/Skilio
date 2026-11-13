import { Button as EmailButton } from "@react-email/components"
import type { PropsWithChildren } from "react"

interface LinkButtonProps extends PropsWithChildren {
	href: string
	className?: string
}

export const LinkButton = ({ children, href, className = "" }: LinkButtonProps) => {
	return (
		<EmailButton
			href={href}
			className={`inline-block rounded-md bg-primary px-7 py-3 text-center align-middle font-semibold text-primary-foreground text-sm leading-5 no-underline ${className}`}
		>
			{children}
		</EmailButton>
	)
}
