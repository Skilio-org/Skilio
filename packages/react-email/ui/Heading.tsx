import { Heading as BaseHeading } from "@react-email/components"
import type { PropsWithChildren } from "react"

type HeadingProps = PropsWithChildren & {
	as?: "h1" | "h2" | "h3"
	className?: string
}

export const Heading = ({ as = "h2", className = "", children }: HeadingProps) => {
	const sizeClasses = {
		h1: "text-2xl leading-8 font-semibold tracking-[-0.02em]", // 24px / 32px
		h2: "text-xl leading-7 font-semibold tracking-[-0.01em]", // 20px / 28px
		h3: "text-lg leading-6 font-semibold", // 18px / 24px
	}[as]

	return (
		<BaseHeading as={as} className={`m-0 mb-5 text-body ${sizeClasses} ${className}`}>
			{children}
		</BaseHeading>
	)
}
