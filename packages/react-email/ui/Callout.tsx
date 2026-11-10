import { Section, Text } from "@react-email/components"
import type { PropsWithChildren } from "react"

type CalloutProps = PropsWithChildren

export const Callout = ({ children }: CalloutProps) => (
	<Section className="my-7 border-0 border-brand border-l-2 border-solid pl-5">{children}</Section>
)

type DetailProps = { label: string; value: string }

export const Detail = ({ label, value }: DetailProps) => (
	<Text className="m-0 my-3">
		<span className="block text-[11px] text-muted uppercase tracking-[0.08em] leading-4">{label}</span>
		<span className="mt-1 block break-all font-mono font-semibold text-body text-sm leading-5">{value}</span>
	</Text>
)
