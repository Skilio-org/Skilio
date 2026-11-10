import { PropsWithChildren } from "react"

type LinkProps = PropsWithChildren & { href: string }

export const Link = ({ children, href }: LinkProps) => (
	<a href={href} className="break-all text-brand-dark underline">
		{children}
	</a>
)
