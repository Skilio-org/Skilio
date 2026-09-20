import { Link } from "@tanstack/react-router"
import {
	Archive,
	ArrowLeft,
	ArrowUpRight,
	FileText,
	Info,
	Mail,
	MessageSquare,
	MoreHorizontal,
	Search,
	Send,
	X,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Monogram } from "@/components/dashboard/dashboard-header"
import { MessageBubble } from "@/components/messages/message-bubble"
import type { ThreadMessage } from "@/components/messages/message-types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Freelancer } from "@/data/freelancers"
import { cn } from "@/lib/utils"

const iconButton =
	"grid size-11 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

export function MessageThread({
	clientMode = false,
	selected,
	messages,
	draft,
	archived,
	onBack,
	onOpenBrief,
	onDetails,
	onArchive,
	onMarkUnread,
	onDraftChange,
	onSend,
	onOpenLatest,
}: {
	clientMode?: boolean
	selected?: Freelancer
	messages: ThreadMessage[]
	draft: string
	archived: boolean
	onBack: () => void
	onOpenBrief: () => void
	onDetails: () => void
	onArchive: () => void
	onMarkUnread: () => void
	onDraftChange: (draft: string) => void
	onSend: () => void
	onOpenLatest: () => void
}) {
	const [searchOpen, setSearchOpen] = useState(false)
	const [query, setQuery] = useState("")
	const scrollRef = useRef<HTMLDivElement>(null)
	const composer = useRef<HTMLTextAreaElement>(null)
	const searchRef = useRef<HTMLInputElement>(null)
	const count = messages.length
	const selectedId = selected?.id
	useEffect(() => {
		if (query || !selectedId || !count) return
		const scroller = scrollRef.current
		if (scroller) scroller.scrollTop = scroller.scrollHeight
	}, [selectedId, count, query])
	useEffect(() => {
		if (searchOpen) searchRef.current?.focus()
	}, [searchOpen])
	useEffect(() => {
		const scroller = scrollRef.current
		if (!scroller || !selectedId) return
		let previousHeight = scroller.clientHeight
		const observer = new ResizeObserver(() => {
			const height = scroller.clientHeight
			scroller.scrollTop += previousHeight - height
			previousHeight = height
		})
		observer.observe(scroller)
		return () => observer.disconnect()
	}, [selectedId])
	const term = query.trim()
	const visible = term
		? messages.filter((message) => message.body.toLowerCase().includes(term.toLowerCase()))
		: messages

	if (!selected)
		return (
			<section
				aria-label="No conversation selected"
				className="hidden min-w-0 flex-col items-center justify-center bg-background/60 px-8 text-center lg:flex"
			>
				<span className="grid size-20 place-items-center rounded-3xl border border-border bg-card text-primary">
					<MessageSquare className="size-8" strokeWidth={1.5} />
				</span>
				<h2 className="mt-7 max-w-sm font-display font-medium text-3xl tracking-tight">
					Good work starts with a conversation.
				</h2>
				<p className="mt-4 max-w-sm text-muted-foreground text-sm leading-7">
					Choose a conversation to share ideas, ask questions, and work through the details together.
				</p>
				<button
					type="button"
					onClick={onOpenLatest}
					className="mt-6 inline-flex min-h-11 items-center gap-2 font-medium text-primary text-sm"
				>
					Open latest conversation <ArrowUpRight className="size-4" />
				</button>
			</section>
		)

	return (
		<section
			aria-label={`Conversation with ${selected.name}`}
			className="message-thread flex min-h-0 min-w-0 flex-col bg-background/60"
		>
			<header className="flex min-h-[76px] shrink-0 items-center gap-2 border-border border-b bg-card px-3 sm:gap-3 sm:px-6">
				<button
					type="button"
					onClick={onBack}
					aria-label="Back to conversations"
					className={cn(iconButton, "lg:hidden")}
				>
					<ArrowLeft className="size-5" />
				</button>
				<Monogram className={cn("hidden size-10 text-xs sm:grid", selected.background, selected.foreground)}>
					{clientMode
						? (selected.title.split(" · ")[1] || selected.name)
								.split(" ")
								.map((word) => word[0])
								.slice(0, 2)
								.join("")
						: selected.initials}
				</Monogram>
				<div className="min-w-0 flex-1">
					{clientMode ? (
						<button
							type="button"
							onClick={onDetails}
							className="block max-w-full truncate text-left font-semibold text-sm hover:text-primary"
						>
							{selected.title.split(" · ")[1] || selected.name}
						</button>
					) : (
						<Link
							to="/talent/$freelancerId"
							params={{ freelancerId: selected.id }}
							search={{ q: undefined }}
							className="block truncate font-semibold text-sm hover:text-primary"
						>
							{selected.name}
						</Link>
					)}
					<p className="mt-1 truncate text-muted-foreground text-xs">
						{clientMode ? `${selected.name} · ${selected.skills.join(" · ")}` : selected.title}
					</p>
				</div>
				<button
					type="button"
					aria-label="Search this conversation"
					aria-expanded={searchOpen}
					onClick={() => {
						setSearchOpen(!searchOpen)
						setQuery("")
					}}
					className={cn(iconButton, searchOpen && "bg-accent text-primary")}
				>
					<Search className="size-[18px]" />
				</button>
				<button type="button" aria-label="Show conversation details" onClick={onDetails} className={iconButton}>
					<Info className="size-[18px]" />
				</button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button type="button" aria-label="Conversation options" className={iconButton}>
							<MoreHorizontal className="size-5" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56 p-1.5">
						<DropdownMenuItem onSelect={onMarkUnread} className="min-h-11">
							<Mail className="size-4" />
							Mark as unread
						</DropdownMenuItem>
						<DropdownMenuItem onSelect={onArchive} className="min-h-11">
							<Archive className="size-4" />
							{archived ? "Move to inbox" : "Archive conversation"}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</header>
			{searchOpen && (
				<div className="border-border border-b bg-card px-4 py-3 sm:px-6">
					<div className="flex items-center gap-2">
						<Search className="size-4 text-muted-foreground" />
						<input
							ref={searchRef}
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							aria-label="Search messages in this conversation"
							placeholder="Find a word or phrase"
							className="min-h-11 min-w-0 flex-1 rounded-md bg-transparent px-2 text-sm outline-none"
							onKeyDown={(event) => {
								if (event.key === "Escape") {
									setSearchOpen(false)
									setQuery("")
								}
							}}
						/>
						<button
							type="button"
							aria-label="Close conversation search"
							onClick={() => {
								setSearchOpen(false)
								setQuery("")
							}}
							className={iconButton}
						>
							<X className="size-4" />
						</button>
					</div>
					{term && (
						<p role="status" className="pb-1 text-muted-foreground text-xs">
							{visible.length} {visible.length === 1 ? "message" : "messages"} found
						</p>
					)}
				</div>
			)}
			{archived && (
				<div className="flex items-center justify-between border-border border-b bg-muted px-5 py-2 text-muted-foreground text-xs">
					<span>Archived conversation</span>
					<button type="button" onClick={onArchive} className="min-h-9 font-medium text-primary">
						Move to inbox
					</button>
				</div>
			)}
			<div
				ref={scrollRef}
				className="message-history min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-8"
			>
				<div className="mx-auto w-full max-w-4xl">
					{!term && (
						<div className="mb-8 text-center">
							<span className="rounded-full border border-border bg-card px-3 py-1.5 text-[10px] text-muted-foreground">
								{clientMode ? "Project conversation · Preview" : "Sample conversation"}
							</span>
						</div>
					)}
					<div
						role="log"
						aria-label="Message history"
						aria-live="polite"
						aria-relevant="additions"
						className="space-y-6"
					>
						{visible.map((message) => (
							<MessageBubble
								key={message.id}
								message={message}
								name={selected.name}
								highlight={term}
								rich={clientMode}
							/>
						))}
					</div>
					{term && !visible.length && (
						<div className="py-10 text-center">
							<Search className="mx-auto size-6 text-muted-foreground" />
							<h2 className="mt-4 font-medium text-sm">No messages match this search</h2>
							<p className="mt-2 text-muted-foreground text-xs">Try another word or phrase.</p>
						</div>
					)}
				</div>
			</div>
			<footer className="shrink-0 border-border border-t bg-card px-3 pt-3 pb-2 sm:px-6 sm:pt-4 sm:pb-3">
				<form
					onSubmit={(event) => {
						event.preventDefault()
						onSend()
						composer.current?.focus()
					}}
					className="rounded-xl border border-input bg-card transition-shadow focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10"
				>
					<textarea
						ref={composer}
						value={draft}
						onChange={(event) => onDraftChange(event.target.value)}
						onKeyDown={(event) => {
							if (
								event.key === "Enter" &&
								(clientMode ? event.metaKey || event.ctrlKey : !event.shiftKey) &&
								!event.nativeEvent.isComposing &&
								window.matchMedia("(pointer: fine)").matches
							) {
								event.preventDefault()
								onSend()
							}
						}}
						rows={clientMode ? 4 : 2}
						maxLength={10000}
						aria-label={`Message ${selected.name}`}
						placeholder={`Write a message to ${clientMode ? selected.title.split(" · ")[1] || selected.name : selected.name}…`}
						className="block max-h-36 min-h-16 w-full resize-none rounded-t-xl bg-transparent px-4 pt-3 pb-1 text-base leading-6 outline-none sm:text-sm"
					/>
					<div className="flex items-center gap-2 px-2 pb-2">
						<button
							type="button"
							onClick={onOpenBrief}
							className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-medium text-muted-foreground text-xs hover:bg-muted hover:text-foreground"
						>
							<FileText className="size-4" />
							Add a brief
						</button>
						<span className="ml-auto hidden text-[10px] text-muted-foreground xl:block">
							{clientMode ? "⌘ / Ctrl + Enter to send" : "Enter to send. Shift + Enter for a new line."}
						</span>
						<button
							type="submit"
							disabled={!draft.trim()}
							className="ml-auto inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-medium text-primary-foreground text-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 xl:ml-2"
						>
							Send <Send className="size-3.5" />
						</button>
					</div>
				</form>
			</footer>
		</section>
	)
}
