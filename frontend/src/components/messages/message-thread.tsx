import {
	ArrowLeft,
	ArrowUpRight,
	MessageSquare,
	Search,
	Send,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChatMessagePublic } from "@/client";
import { MessageBubble } from "@/components/messages/message-bubble";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
// 	DropdownMenu,
// 	DropdownMenuContent,
// 	DropdownMenuItem,
// 	DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import {
	type ConversationProfile,
	isClientProfile,
} from "@/hooks/isClientProfile";
import { useAccountAvatarUrl } from "@/hooks/useAccountAvatar";
import { cn } from "@/lib/utils";

// import { useWebSocket } from "@/context/websocket-context"

const iconButton =
	"grid size-8.5 shrink-0 place-items-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition-colors hover:border-outline hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function MessageThread({
	selected,
	isOnline,
	presencePending,
	messages,
	draft,
	onBack,
	onDetails,
	onDraftChange,
	onSend,
	onOpenLatest,
	hasConversations,
	canViewProfile,
}: {
	selected: ConversationProfile | undefined;
	isOnline?: boolean;
	presencePending: boolean;
	messages: ChatMessagePublic[] | undefined;
	draft: string;
	archived: boolean;
	onBack: () => void;
	onDetails: () => void;
	onDraftChange: (draft: string) => void;
	onSend: () => void;
	canViewProfile: boolean;
	hasConversations: boolean;
	onOpenLatest: () => void;
}) {
	const [searchOpen, setSearchOpen] = useState(false);
	const [query, setQuery] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);
	const composer = useRef<HTMLTextAreaElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);
	const count = messages?.length ?? 0;
	const selectedId = selected?.id;
	const selectedAvatarUrl = useAccountAvatarUrl(selected?.user_id);
	useEffect(() => {
		if (query || !selectedId || !count) return;
		const scroller = scrollRef.current;
		if (scroller) scroller.scrollTop = scroller.scrollHeight;
	}, [selectedId, count, query]);
	useEffect(() => {
		if (searchOpen) searchRef.current?.focus();
	}, [searchOpen]);
	useEffect(() => {
		const scroller = scrollRef.current;
		if (!scroller || !selectedId) return;
		let previousHeight = scroller.clientHeight;
		const observer = new ResizeObserver(() => {
			const height = scroller.clientHeight;
			scroller.scrollTop += previousHeight - height;
			previousHeight = height;
		});
		observer.observe(scroller);
		return () => observer.disconnect();
	}, [selectedId]);
	const term = query.trim();
	const visible = term
		? messages?.filter((message) =>
				message.content.toLowerCase().includes(term.toLowerCase()),
			)
		: messages;

	if (!selected)
		return (
			<section
				aria-label="No conversation selected"
				className="hidden min-w-0 flex-1 flex-col items-center justify-center bg-surface-container-lowest px-8 text-center lg:flex"
			>
				<span className="grid size-16 place-items-center rounded-lg border border-outline-variant bg-surface-container-low text-link">
					<MessageSquare className="size-7" strokeWidth={1.5} />
				</span>
				<h2 className="mt-6 max-w-sm font-headline-md font-semibold text-headline-md text-on-surface tracking-tight">
					Good work starts with a conversation.
				</h2>
				<p className="mt-2.5 max-w-sm font-body-sm text-body-sm text-on-surface-variant leading-6">
					Choose a conversation to share ideas, ask questions, and collaborate
					on project details together.
				</p>
				<button
					type="button"
					onClick={onOpenLatest}
					className="mt-6 inline-flex h-9 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-label-md text-label-md font-medium text-on-surface transition-colors hover:bg-surface-container-low"
				>
					{hasConversations
						? "Open latest conversation"
						: "Start a conversation"}{" "}
					<ArrowUpRight className="size-4 text-outline" />
				</button>
			</section>
		);

	const Name = selected?.full_name || "Unknown";
	let subtitle = "Client";
	if (selected && isClientProfile(selected)) {
		if (selected.company_role) subtitle = `${selected.company_role}@`;
		if (selected.company) subtitle += `${selected.company}`;
	} else subtitle = selected?.title || "Freelancer";

	return (
		<section
			aria-label={`Conversation with ${selected?.full_name ?? "User"}`}
			className="message-thread flex min-h-0 min-w-0 flex-1 flex-col bg-surface-container-lowest"
		>
			<header className="flex h-16 shrink-0 items-center gap-3 border-outline-variant border-b bg-surface-container-lowest px-4 sm:px-6 dark:bg-[#181a1d]">
				<button
					type="button"
					onClick={onBack}
					aria-label="Back to conversations"
					className={cn(iconButton, "lg:hidden")}
				>
					<ArrowLeft className="size-4" />
				</button>
				<Avatar className="size-10 rounded-lg">
					<AvatarImage
						src={selectedAvatarUrl}
						alt={selected.full_name ?? ""}
						aria-hidden="true"
					/>
					<AvatarFallback>{selected.full_name || "Unknown"}</AvatarFallback>
				</Avatar>
				<div className="flex-1 m-auto">
					<div className="flex flex-wrap items-center gap-2">
						<button
							type="button"
							onClick={onDetails}
							disabled={!canViewProfile}
							className="block max-w-full truncate text-left font-headline-sm font-semibold text-headline-sm text-on-surface transition-colors hover:text-link"
						>
							{Name}
						</button>
						<p className="truncate font-caption text-caption text-on-surface-variant underline">
							{subtitle}
						</p>
					</div>
					<div className="flex items-center gap-1.5 font-caption text-caption text-on-surface-variant">
						<span
							aria-hidden="true"
							title={isOnline ? "Online" : "Offline"}
							className={cn(
								"size-2.5 rounded-full border-1",
								presencePending
									? "animate-pulse bg-outline"
									: isOnline
										? "bg-[#b5ce5b] ring-1 ring-neutral-900"
										: "bg-slate-400 ring-1 ring-neutral-900",
							)}
						/>
						<span>
							{presencePending
								? "Checking status"
								: isOnline
									? "Online"
									: "Offline"}
						</span>
					</div>
				</div>
				<button
					type="button"
					aria-label="Search this conversation"
					aria-expanded={searchOpen}
					onClick={() => {
						setSearchOpen(!searchOpen);
						setQuery("");
					}}
					className={cn(
						iconButton,
						searchOpen && "border-outline bg-surface-container-low text-link",
					)}
				>
					<Search className="size-4" />
				</button>
				{/* <DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							aria-label="Conversation options"
							className={iconButton}
						>
							<MoreHorizontal className="size-4" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-52 border-outline-variant bg-surface-container-lowest p-1"
					>
						<DropdownMenuItem
							onSelect={onMarkUnread}
							className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface"
						>
							<Mail className="size-4 text-outline" />
							Mark as unread
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={onArchive}
							className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface"
						>
							<Archive className="size-4 text-outline" />
							{archived ? "Move to inbox" : "Archive conversation"}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu> */}
			</header>
			{searchOpen && (
				<div className="border-outline-variant border-b bg-surface-container-lowest px-4 py-2.5 sm:px-6">
					<div className="flex items-center gap-2">
						<Search className="size-4 text-outline" />
						<input
							ref={searchRef}
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							aria-label="Search messages in this conversation"
							placeholder="Find a word or phrase…"
							className="h-8 min-w-0 flex-1 bg-transparent px-2 font-body-sm text-body-sm text-on-surface outline-none placeholder:text-outline"
							onKeyDown={(event) => {
								if (event.key === "Escape") {
									setSearchOpen(false);
									setQuery("");
								}
							}}
						/>
						<button
							type="button"
							aria-label="Close conversation search"
							onClick={() => {
								setSearchOpen(false);
								setQuery("");
							}}
							className="grid size-6 place-items-center rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
						>
							<X className="size-3.5" />
						</button>
					</div>
					{term && (
						<p
							role="status"
							className="pt-1 font-caption text-caption text-on-surface-variant"
						>
							{visible?.length} {visible?.length === 1 ? "message" : "messages"}{" "}
							found
						</p>
					)}
				</div>
			)}
			{/* {archived && (
				<div className="flex items-center justify-between border-outline-variant border-b bg-surface-container-low px-4 py-2 font-caption text-caption text-on-surface-variant">
					<span>Archived conversation</span>
					<button
						type="button"
						onClick={onArchive}
						className="font-medium text-link hover:underline"
					>
						Move to inbox
					</button>
				</div>
			)} */}
			<div
				ref={scrollRef}
				className="message-history min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#f0f2f5] px-4 py-6 sm:px-8 dark:bg-[#131518]"
			>
				<div className="mx-auto w-full max-w-3xl">
					{!term &&
						(messages?.length !== undefined ? messages?.length : 0) > 0 && (
							<div className="mb-6 text-center">
								<span className="rounded-full border border-outline-variant/80 bg-surface-container-lowest px-3.5 py-1 font-caption text-caption font-medium text-on-surface-variant shadow-xs">
									Project conversation
								</span>
							</div>
						)}
					{!term &&
						(messages?.length !== undefined ? messages?.length : 0) === 0 && (
							<p
								role="status"
								className="py-12 text-center text-muted-foreground"
							>
								Start a conversation with {selected?.full_name ?? "User"}. Say
								hello and share a little about your project.
							</p>
						)}
					<div
						role="log"
						aria-label="Message history"
						aria-live="polite"
						aria-relevant="additions"
						className="space-y-5"
					>
						{visible?.map((message) => (
							<MessageBubble
								// sentState={messageSendState[message.id]}
								key={message.id}
								message={message}
								name={selected?.full_name ?? Name ?? "Unknown"}
								highlight={term}
								own={
									selected?.user_id
										? message.sender_id !== selected.user_id
										: true
								}
							/>
						))}
					</div>
					{term && !visible?.length && (
						<div className="py-12 text-center">
							<Search className="mx-auto size-5 text-outline" />
							<h3 className="mt-3 font-headline-sm font-semibold text-headline-sm text-on-surface">
								No messages match this search
							</h3>
							<p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
								Try another word or phrase.
							</p>
						</div>
					)}
				</div>
			</div>
			<footer className="shrink-0 border-t border-outline-variant bg-surface-container-lowest dark:bg-[#181a1d] p-3 sm:p-4">
				<form
					onSubmit={(event) => {
						event.preventDefault();
						onSend();
						composer.current?.focus();
					}}
					className="rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#141618] transition-colors focus-within:border-primary/80 focus-within:ring-1 focus-within:ring-primary/20 shadow-2xs"
				>
					<textarea
						ref={composer}
						value={draft}
						onChange={(event) => {
							onDraftChange(event.target.value);
						}}
						onKeyDown={(event) => {
							if (event.key === "Enter" && !event.nativeEvent.isComposing) {
								if (event.metaKey || event.ctrlKey) {
									event.preventDefault();
									const textarea = event.currentTarget;
									const start = textarea.selectionStart;
									const end = textarea.selectionEnd;
									const nextValue = `${draft.substring(0, start)}\n${draft.substring(end)}`;
									onDraftChange(nextValue);
									requestAnimationFrame(() => {
										textarea.selectionStart = textarea.selectionEnd = start + 1;
									});
								} else if (
									!event.shiftKey &&
									window.matchMedia("(pointer: fine)").matches
								) {
									event.preventDefault();
									if (draft.trim()) {
										onSend();
									}
								}
							}
						}}
						rows={3}
						maxLength={5000}
						aria-label={`Message ${selected?.full_name ?? "User"}`}
						placeholder={`Write a message to ${selected?.full_name ?? "User"}…`}
						className="block max-h-36 min-h-16 w-full resize-none bg-transparent px-3.5 pt-3 pb-1 font-body-sm text-body-sm leading-6 text-on-surface outline-none placeholder:text-outline"
					/>
					<div className="flex items-center justify-between gap-2 px-3 pb-2.5 pt-1">
						<span className="hidden font-caption text-caption text-on-surface-variant sm:block">
							Enter to send, Ctrl + Enter for new line
						</span>
						<button
							type="submit"
							disabled={!draft.trim()}
							className="ml-auto inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-md text-label-md font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
						>
							Send <Send className="size-3.5" />
						</button>
					</div>
				</form>
			</footer>
		</section>
	);
}
