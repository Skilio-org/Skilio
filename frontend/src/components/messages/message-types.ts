export type InboxFilter = "all" | "unread" | "archived"
type ClientTheme = {
	bg: string
	text: string
	border: string
	status: string
	statusTone: "emerald" | "amber" | "neutral"
}

export function getClientTheme(id: string): ClientTheme {
	switch (id) {
		case "olivia-bennett":
			return {
				bg: "bg-blue-500/12 dark:bg-blue-400/15",
				text: "text-blue-700 dark:text-blue-300",
				border: "border-blue-500/30",
				status: "Active Contract",
				statusTone: "emerald",
			}
		case "daniel-kim":
			return {
				bg: "bg-emerald-500/12 dark:bg-emerald-400/15",
				text: "text-emerald-700 dark:text-emerald-300",
				border: "border-emerald-500/30",
				status: "Active Contract",
				statusTone: "emerald",
			}
		case "sarah-mitchell":
			return {
				bg: "bg-amber-500/12 dark:bg-amber-400/15",
				text: "text-amber-700 dark:text-amber-300",
				border: "border-amber-500/30",
				status: "Proposal Review",
				statusTone: "amber",
			}
		default:
			return {
				bg: "bg-purple-500/12 dark:bg-purple-400/15",
				text: "text-purple-700 dark:text-purple-300",
				border: "border-purple-500/30",
				status: "Direct Discussion",
				statusTone: "neutral",
			}
	}
}
