import type { MouseEventHandler, ReactNode } from "react"

interface AuthSubmitButtonProps {
	onClick: MouseEventHandler<HTMLButtonElement>
	icon?: ReactNode
}

export const AuthSubmitButton = ({ onClick, icon }: AuthSubmitButtonProps) => {
	return (
		<button
			type="button"
			onClick={onClick}
			className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground text-sm shadow-sm transition-all duration-200 hover:-translate-y-px hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 active:translate-y-0 active:bg-primary/85"
		>
			Continue
			{icon}
		</button>
	)
}
