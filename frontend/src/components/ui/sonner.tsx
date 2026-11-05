import type { CSSProperties } from "react"
import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { useTheme } from "@/components/theme-provider"

const Toaster = ({
	toastOptions,
	...props
}: ToasterProps) => {
	const { resolvedTheme } = useTheme()

	return (
		<Sonner
			theme={
				resolvedTheme === "dark"
					? "dark"
					: "light"
			}
			position="bottom-right"
			duration={3800}
			visibleToasts={4}
			gap={8}
			offset={16}
			mobileOffset={12}
			closeButton
			className="toaster group"
			icons={{
				success: (
					<span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-link">
						<CircleCheckIcon className="size-4" />
					</span>
				),

				info: (
					<span className="grid size-8 place-items-center rounded-lg bg-surface-container text-link">
						<InfoIcon className="size-4" />
					</span>
				),

				warning: (
					<span className="grid size-8 place-items-center rounded-lg bg-warning-soft text-warning">
						<TriangleAlertIcon className="size-4" />
					</span>
				),

				error: (
					<span className="grid size-8 place-items-center rounded-lg bg-error-container text-error">
						<OctagonXIcon className="size-4" />
					</span>
				),

				loading: (
					<span className="grid size-8 place-items-center rounded-lg bg-surface-container text-on-surface-variant">
						<Loader2Icon className="size-4 animate-spin" />
					</span>
				),
			}}
			toastOptions={{
				...toastOptions,

				classNames: {
					toast: [
						"!w-[min(360px,calc(100vw-24px))]",
						"!min-h-[64px]",
						"!rounded-lg",
						"!border",
						"!border-outline-variant",
						"!bg-surface-container-lowest",
						"!px-3.5",
						"!py-3",
						"!pr-11",
						"!text-on-surface",
						"!shadow-xl",
						"dark:!border-border-subtle",
						"dark:!bg-surface-panel",
					].join(" "),

					content:
						"!gap-0.5 !min-w-0",

					title: [
						"!font-label-md",
						"!font-semibold",
						"!text-[13px]",
						"!leading-5",
						"!text-on-surface",
					].join(" "),

					description: [
						"!font-body-sm",
						"!text-[11px]",
						"!leading-[17px]",
						"!text-on-surface-variant",
					].join(" "),

					icon:
						"!mr-1 !size-8 !shrink-0",

					closeButton: [
						"!top-1/2",
						"!right-2",
						"!left-auto",
						"!size-7",
						"!translate-x-0",
						"!-translate-y-1/2",
						"!border-0",
						"!bg-transparent",
						"!text-outline",
						"!shadow-none",
						"hover:!bg-surface-container",
						"hover:!text-on-surface",
					].join(" "),

					actionButton: [
						"!h-8",
						"!rounded-lg",
						"!bg-primary",
						"!px-3",
						"!font-label-sm",
						"!font-medium",
						"!text-label-sm",
						"!text-on-primary",
						"hover:!opacity-90",
						"dark:!bg-on-surface",
						"dark:!text-background",
					].join(" "),

					cancelButton: [
						"!h-8",
						"!rounded-lg",
						"!border",
						"!border-outline-variant",
						"!bg-surface-container-lowest",
						"!px-3",
						"!font-label-sm",
						"!font-medium",
						"!text-label-sm",
						"!text-on-surface",
						"hover:!bg-surface-container",
					].join(" "),

					...toastOptions?.classNames,
				},
			}}
			style={
				{
					"--normal-bg":
						"var(--surface-container-lowest)",
					"--normal-text":
						"var(--on-surface)",
					"--normal-border":
						"var(--outline-variant)",
					"--border-radius": "0.5rem",
				} as CSSProperties
			}
			{...props}
		/>
	)
}

export { Toaster }