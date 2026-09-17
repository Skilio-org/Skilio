export type InboxFilter = "all" | "unread" | "archived"
export type MessageToolDialog = "brief" | null
export type ConversationSummary = {
	id: string
	preview: string
	time: string
	unread: number
	hasDraft?: boolean
}
export type ThreadMessage = {
	id: string
	body: string
	time: string
	own: boolean
	local?: boolean
}
