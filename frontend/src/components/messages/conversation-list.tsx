import { Archive, MessageSquare, Search, X } from "lucide-react"
import { getClientTheme } from "@/components/messages/message-types"
import type { InboxFilter } from "@/components/messages/message-types"
import { cn } from "@/lib/utils"
import { accountAvatarUrl } from "@/hooks/useAccountAvatar"
import { type ConversationProfile, isClientProfile, isFreelancerProfile } from "@/hooks/isClientProfile"
import { useChatData } from "@/hooks/useChatData"

export function ConversationList({
	selected,
	query,
	filter,
	unreadCount,
	onQueryChange,
	onFilterChange,
	onSelect,
}: {
	selected: ConversationProfile | undefined
	query: string
	filter: InboxFilter
	unreadCount: number
	onQueryChange: (query: string) => void
	onFilterChange: (filter: InboxFilter) => void
	onSelect: (id: string) => void
}) {
	const { conversations, profiles } = useChatData()

	return (
		<aside
			aria-label="Conversations"
			className={cn(
				"min-h-0 min-w-0 flex-col border-outline-variant bg-surface-container-low/50 dark:bg-[#181a1d] lg:flex lg:border-r",
				selected?.id ? "hidden" : "flex",
			)}
		>
			<div className="border-b border-outline-variant/60 bg-surface-container-lowest/60 dark:bg-[#181a1d] p-4 pb-3 sm:p-5 sm:pb-3.5">
				<div className="flex items-center justify-between gap-3">
					<h2 className="font-headline-sm font-semibold text-headline-sm text-on-surface">Direct Threads</h2>
					<span className="rounded bg-surface-container px-2 py-0.5 font-caption text-caption text-on-surface-variant font-medium">
						{conversations?.data?.count} Total
					</span>
				</div>
				<label className="mt-3.5 flex h-9 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 font-body-sm text-body-sm text-on-surface transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
					<Search className="size-4 shrink-0 text-outline" aria-hidden="true" />
					<span className="sr-only">Search conversations</span>
					<input
						type="text"
						value={query}
						onChange={(event) => onQueryChange(event.target.value)}
						placeholder="Search conversations…"
						className="min-w-0 flex-1 bg-transparent py-1 font-body-sm text-body-sm text-on-surface outline-none placeholder:text-outline"
					/>
					{query && (
						<button
							type="button"
							onClick={() => onQueryChange("")}
							aria-label="Clear conversation search"
							className="grid size-6 shrink-0 place-items-center rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
						>
							<X className="size-3.5" />
						</button>
					)}
				</label>
				<div className="mt-3 flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container-low p-1 dark:border-border-dark dark:bg-surface-container/60">
					{(["all", "unread"] as const).map((value: string) => {
						const active = filter === value

						return (
							<button
								key={value}
								type="button"
								aria-pressed={active}
								onClick={() => onFilterChange(value as InboxFilter)}
								className={cn(
									"relative flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md px-2 font-label-sm font-medium text-label-sm transition-all duration-150",
									active
										? "bg-primary text-primary-foreground shadow-sm dark:bg-on-surface dark:text-background"
										: "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
								)}
							>
								<span>{(value.charAt(0).toUpperCase() + value.slice(1)) as string}</span>

								{value === "unread" && unreadCount > 0 && (
									<span
										className={cn(
											"min-w-5 rounded px-1.5 py-0.5 text-center font-caption font-bold text-[10px] leading-none",
											active
												? "bg-primary-foreground/15 text-primary-foreground dark:bg-background/10 dark:text-background"
												: "bg-surface-container-high text-on-surface-variant",
										)}
									>
										{unreadCount}
									</span>
								)}
							</button>
						)
					})}
				</div>
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto p-2.5 space-y-1.5">
				{conversations?.data?.data
					.filter((conversation) => {
						if (filter === "unread" && (conversation.unread_count ?? 0) === 0) return false
						if (query && !conversation.other_user?.full_name?.toLowerCase().includes(query.toLowerCase())) return false
						return true
					})
					.map((conversation) => {
						if (conversation.other_user == undefined) return
						const person = profiles.data?.get(conversation.other_user.id)
						if (!person) return null
						const theme = getClientTheme(person.user_id)
						const active = selected?.user_id === person.user_id
						let roleAndLocation = person.full_name

						if (isClientProfile(person)) roleAndLocation = `${person.company} . ${person.company_role}`
						else if (isFreelancerProfile(person)) roleAndLocation = `${person.category} . ${person.title}`
						return (
							<button
								key={person.user_id}
								type="button"
								aria-pressed={active}
								aria-label={`${person.full_name ?? "Unknown user"}${(conversation.unread_count ?? 0) > 0 ? `, ${conversation.unread_count} unread messages` : ""}`}
								onClick={() => onSelect(person.user_id)}
								className={cn(
									"group relative flex w-full items-start gap-3 border px-[12px] py-2 text-left transition-all",
									active
										? "border-outline-variant bg-surface-container-lowest text-on-surface shadow-xs dark:bg-surface-container dark:border-outline/70"
										: "border-transparent text-on-surface-variant hover:border-outline-variant/60 hover:bg-surface-container-lowest/80 dark:hover:bg-surface-container/40 hover:text-on-surface",
								)}
							>
								{active && <span className="absolute left-0 top-3 bottom-3 w-[5px] rounded-ee rounded-se bg-primary" />}
								<img
									src={accountAvatarUrl(person.user_id)}
									alt=""
									className={cn(
										"mt-0.5 grid size-12 shrink-0 place-items-center rounded-sm border font-label-sm font-semibold shadow-2xs transition-transform group-hover:scale-105",
										theme.bg,
										theme.text,
										theme.border,
									)}
								></img>
								<span className="min-w-0 flex-1">
									<span className="flex items-center justify-between gap-2">
										<span
											className={cn(
												"truncate font-label-md text-label-md text-on-surface",
												(conversation.unread_count ?? 0) > 0 || active ? "font-semibold" : "font-medium",
											)}
										>
											{person.full_name ?? "Unknown user"}
										</span>
										<span className="shrink-0 font-caption text-caption text-on-surface-variant">
											{conversation.created_at &&
												new Date(conversation.created_at).toLocaleDateString(undefined, {
													month: "short",
													day: "numeric",
												})}
										</span>
									</span>
									<span className="text-xs text-accent-cyan  italic dark:color-[#131518]">{roleAndLocation}</span>
									<span className="flex items-between justify-between gap-2">
										<span
											className={cn(
												"line-clamp-2 min-w-0 break-words font-body-sm text-body-sm leading-5",
												(conversation.unread_count ?? 0) > 0
													? "font-medium text-on-surface"
													: "text-on-surface-variant",
											)}
										>
											{conversation.last_message?.content || "No messages yet"}
										</span>
										{(conversation.unread_count ?? 0) > 0 && (
											<span className="mt-0.5 grid  place-items-center rounded-full bg-primary p-1 font-caption text-[8px] font-bold text-on-primary leading-none shadow-xs">
												{conversation.unread_count}
											</span>
										)}
									</span>
								</span>
							</button>
						)
					})}
				{conversations.data?.count === 0 && (
					<div className="px-4 py-12 text-center">
						<span className="mx-auto grid size-12 place-items-center rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant">
							{filter === "archived" ? (
								<Archive className="size-5" />
							) : query ? (
								<Search className="size-5" />
							) : (
								<MessageSquare className="size-5" />
							)}
						</span>
						<h3 className="mt-4 font-headline-sm font-semibold text-headline-sm text-on-surface">
							{query
								? "No matching conversations"
								: filter === "unread"
									? "You're all caught up"
									: filter === "archived"
										? "Nothing archived yet"
										: "No conversations yet"}
						</h3>
						<p className="mt-1.5 font-body-sm text-body-sm text-on-surface-variant">
							{query
								? "Try a different name, skill, or message."
								: filter === "unread"
									? "New messages will appear here."
									: filter === "archived"
										? "Conversations you archive will live here."
										: "Choose a freelancer to start a conversation."}
						</p>
						<button
							type="button"
							onClick={() => {
								onQueryChange("")
								onFilterChange("all")
							}}
							className="mt-3 inline-flex h-8 items-center font-label-sm text-label-sm font-medium text-primary hover:underline"
						>
							Back to all conversations
						</button>
					</div>
				)}
			</div>
		</aside>
	)
}
