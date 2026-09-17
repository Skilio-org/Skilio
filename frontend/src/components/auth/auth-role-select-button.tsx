import type { UseMutationResult } from "@tanstack/react-query"
import { BriefcaseBusiness, Check, UserRound } from "lucide-react"
import type { ControllerRenderProps } from "react-hook-form"

type Role = "freelancer" | "client"

type RoleSelectButtonProps = {
	field: ControllerRenderProps<any, "role">
	signUpMutation: UseMutationResult<any, Error, any>
	userRole: Role
	title: string
	description: string
}

export const RoleSelectButton = ({ field, signUpMutation, userRole, title, description }: RoleSelectButtonProps) => {
	const selected = field.value === userRole
	return (
		<button
			type="button"
			aria-pressed={selected}
			disabled={signUpMutation.isPending}
			onClick={() => field.onChange(userRole)}
			className={`group relative flex min-h-28 w-full items-center gap-5 rounded-2xl border p-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-60 ${
				selected
					? `border-primary/40 bg-accent shadow-card`
					: `border-border bg-card hover:-translate-y-px hover:border-primary/25 hover:bg-accent/40 hover:shadow-card-hover`
			} `}
		>
			<div
				className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
					selected
						? `bg-primary text-primary-foreground shadow-sm`
						: `bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground`
				} `}
			>
				{userRole === "client" ? <BriefcaseBusiness className="size-5" /> : <UserRound className="size-5" />}
			</div>

			<div className="min-w-0 flex-1">
				<div className="font-semibold text-[15px] text-foreground">{title}</div>

				<p className="mt-1.5 text-[13px] text-muted-foreground leading-5">{description}</p>
			</div>
			<div
				className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
					selected
						? `border-primary bg-primary text-primary-foreground`
						: `border-border bg-background text-transparent`
				} `}
			>
				<Check className="size-3.5" strokeWidth={3} />
			</div>
		</button>
	)
}

export default RoleSelectButton
