import { Archive, MessageSquare, Search, X } from "lucide-react"
import { Monogram } from "@/components/dashboard/dashboard-header"
import type { ConversationSummary, InboxFilter } from "@/components/messages/message-types"
import type { Freelancer } from "@/data/freelancers"
import { cn } from "@/lib/utils"

export function ConversationList({
	people,
	conversations,
	selectedId,
	query,
	filter,
	unreadCount,
	onQueryChange,
	onFilterChange,
	onSelect,
}: {
	people: Freelancer[]
	conversations: ConversationSummary[]
	selectedId: string
	query: string
	filter: InboxFilter
	unreadCount: number
	onQueryChange: (query: string) => void
	onFilterChange: (filter: InboxFilter) => void
	onSelect: (id: string) => void
}) {
	return (
		<aside
			aria-label="Conversations"
			className={cn(
				"min-h-0 min-w-0 flex-col border-border bg-card lg:flex lg:border-r",
				selectedId ? "hidden" : "flex",
			)}
		>
			<div className="px-5 pt-6">
				<div className="flex items-center justify-between gap-3">
					<h2 className="font-semibold text-lg tracking-tight">{"Direct Threads"}</h2>
					<span className="rounded-full bg-surface-container px-2.5 py-1 text-xs text-primary">
						{people.length} Total
					</span>
				</div>
				<label className="mt-6 flex min-h-11 items-center gap-2 rounded-lg border border-input bg-background px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
					<Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
					<span className="sr-only">Search conversations</span>
					<input
						type="text"
						value={query}
						onChange={(event) => onQueryChange(event.target.value)}
						placeholder="Search conversations…"
						className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
					/>
					{query && (
						<button
							type="button"
							onClick={() => onQueryChange("")}
							aria-label="Clear conversation search"
							className="grid size-8 shrink-0 place-items-center rounded-md hover:bg-muted"
						>
							<X className="size-3.5" />
						</button>
					)}
				</label>
				<fieldset className="mt-4 flex gap-1 border-border border-b">
					<legend className="sr-only">Inbox filters</legend>
					{(["all", "unread", "archived"] as const).map((value) => (
						<button
							key={value}
							type="button"
							aria-pressed={filter === value}
							onClick={() => onFilterChange(value)}
							className={cn(
								"flex min-h-11 flex-1 items-center justify-center gap-1.5 border-b-2 px-1 font-medium text-xs capitalize transition-colors",
								filter === value
									? "border-primary text-primary"
									: "border-transparent text-muted-foreground hover:text-foreground",
							)}
						>
							{value === "all"
								? "All inbox"
								: value === "unread"
									? "Unread"
									: "Archived"}
							{value === "unread" && unreadCount > 0 && (
								<span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">
									{unreadCount}
								</span>
							)}
						</button>
					))}
				</fieldset>
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto p-2.5">
				{conversations.map((conversation) => {
					const person = people.find((item) => item.id === conversation.id)
					if (!person) return null
					const active = selectedId === person.id
					return (
						<button
							key={person.id}
							type="button"
							aria-pressed={active}
							aria-label={person.name + (conversation.unread ? `, ${conversation.unread} unread messages` : "")}
							onClick={() => onSelect(person.id)}
							className={cn(
								"mb-1 flex min-h-24 w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
								active ? "border-brand-200 bg-brand-50" : "border-transparent hover:bg-muted/60",
							)}
						>
							<Monogram className={cn("mt-0.5 size-11 text-sm", person.background, person.foreground)}>
								{(person.title.split(" · ")[1] || person.name)
											.split(" ")
											.map((word) => word[0])
											.slice(0, 2)
											.join("")}
							</Monogram>
							<span className="min-w-0 flex-1">
								<span className="flex items-baseline justify-between gap-2">
									<span
										className={cn("truncate text-sm", conversation.unread || active ? "font-semibold" : "font-medium")}
									>
										{person.title.split(" · ")[1]}
									</span>
									<span className="shrink-0 text-[10px] text-muted-foreground">{conversation.time}</span>
								</span>
								<span className="mt-1 block truncate text-[11px] text-muted-foreground">
									{`${person.name} · ${person.title.split(" · ")[0]}`}
								</span>
								<span className="mt-2 flex items-start gap-2">
									<span
										className={cn(
											"line-clamp-2 min-w-0 flex-1 break-words text-xs leading-5",
											conversation.unread ? "text-foreground" : "text-muted-foreground",
										)}
									>
										{conversation.hasDraft && <span className="font-medium text-primary">Draft: </span>}
										{conversation.preview}
									</span>
									{conversation.unread > 0 && (
										<span className="mt-0.5 grid min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1 font-semibold text-[10px] text-primary-foreground leading-5">
											{conversation.unread}
										</span>
									)}
								</span>
							</span>
						</button>
					)
				})}
				{conversations.length === 0 && (
					<div className="px-4 py-12 text-center">
						<span className="mx-auto grid size-12 place-items-center rounded-xl border border-border bg-background text-muted-foreground">
							{filter === "archived" ? (
								<Archive className="size-5" />
							) : query ? (
								<Search className="size-5" />
							) : (
								<MessageSquare className="size-5" />
							)}
						</span>
						<h2 className="mt-4 font-medium text-sm">
							{query
								? "No matching conversations"
								: filter === "unread"
									? "You're all caught up"
									: "Nothing archived yet"}
						</h2>
						<p className="mt-2 text-muted-foreground text-xs leading-6">
							{query
								? "Try a different name, skill, or message."
								: filter === "unread"
									? "New messages will appear here."
									: "Conversations you archive will live here."}
						</p>
						<button
							type="button"
							onClick={() => {
								onQueryChange("")
								onFilterChange("all")
							}}
							className="mt-3 min-h-11 font-medium text-primary text-xs"
						>
							Back to all conversations
						</button>
					</div>
				)}
			</div>
			<div className="flex items-center justify-between gap-3 border-border border-t px-5 py-3 text-[11px] text-muted-foreground">
				<span>Preview inbox</span>
				<span>{unreadCount ? `${unreadCount} unread messages` : "All caught up"}</span>
			</div>
		</aside>
	)
}
