import { LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatMessagePublic } from "@/client/types.gen"
import { formatMessageTime } from "@/lib/format"
import { useWebSocket } from "@/context/websocket-context"
import { accountAvatarUrl } from "@/hooks/useAccountAvatar"

function Time({ created_at = "" }: { created_at: string }) {
	return (
		<div className=" flex items-baseline gap-2 font-caption text-caption text-on-surface-variant">
			<span className="text-outline text-[11px]">{formatMessageTime(created_at)}</span>
		</div>
	)
}

function MessageBubbleRepresentation({
	own = false,
	message,
	highlight = "",
	name = "",
}: {
	own?: boolean
	message: ChatMessagePublic
	highlight?: string
	name: string
}) {
	const { messageSendState } = useWebSocket()
	const sendState = messageSendState[message.id] ?? "sent"
	const match = highlight ? message.content.toLowerCase().indexOf(highlight.toLowerCase()) : -1

	return (
		<div className="flex flex-col">
			<div className="flex items-end justify-items-end gap-2 group w-full">
				<div className={cn("w-full flex flex-col ", own ? "items-end" : "items-start")}>
					<div className="flex gap-3 w-full">
						{!own && (
							<img
								src={accountAvatarUrl(message.sender_id)}
								alt=""
								className={cn("size-8 place-items-center border font-label-sm font-semibold shadow-2xs rounded-4xl")}
							/>
						)}
						<div className={cn("w-full flex flex-col", own ? "items-end" : "items-start")}>
							<div
								className={cn(
									"min-w-0 max-w-full px-3 py-3 font-body-sm text-body-sm leading-reaxed [overflow-wrap:anywhere] word-wrap-break",
									own
										? "rounded-2xl rounded-tr-none bg-[#1f2125] text-white shadow-sm dark:bg-[#202722] dark:border dark:border-primary/35 dark:text-on-surface"
										: "rounded-2xl rounded-tl-none border border-outline-variant/80 bg-surface-container-lowest text-on-surface shadow-xs dark:bg-[#1e2226] dark:border-outline-variant",
								)}
							>
								{match < 0 ? (
									message.content
								) : (
									<>
										{message.content.slice(0, match)}
										<mark className="rounded-xs bg-primary/20 text-on-surface px-1 py-0.5 font-medium">
											{message.content.slice(match, match + highlight.length)}
										</mark>
										{message.content.slice(match + highlight.length)}
									</>
								)}
							</div>
							<span className="py-1 flex justify-around items-center gap-1 text-outline text-[10px]" aria-live="polite">
								{!own && (
									<div className="flex items-center justify-center gap-1">
										<span
											className={cn(
												"font-semibold truncate font-label-md text-label-md text-on-surface  text-link dark:text-link",
											)}
										>
											{`${name}`}
										</span>
										<span className="text-outline text-[11px]">•</span>
									</div>
								)}
								<Time created_at={message.created_at ? message.created_at : ""} />
								{own && (
									<div className="flex items-center justify-center gap-1">
										<span className="text-outline text-[11px]">•</span>
										<span
											className={cn(
												"truncate text-label-md text-on-surface ",
												sendState === "failed"
													? "text-red-500"
													: "dark:text-link text-label-md text-on-surface-variant",
											)}
										>
											{sendState === "sent"
												? "sent"
												: sendState === "pending"
													? "Sending..."
													: sendState === "failed"
														? "Failed to send"
														: ""}
										</span>
										{sendState === "pending" && <LoaderCircle className="size-2 animate-spin" aria-hidden="true" />}
									</div>
								)}
							</span>
						</div>

						{own && (
							<img
								src={accountAvatarUrl(message.sender_id)}
								alt=""
								className={cn("size-8 place-items-center border font-label-sm font-semibold shadow-2xs rounded-4xl")}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export function MessageBubble({
	message,
	name,
	highlight = "",
	rich = false,
	own = false,
}: {
	message: ChatMessagePublic
	name: string
	highlight?: string
	rich?: boolean
	own?: boolean
}) {
	return (
		<>
			<article
				className={cn(
					"message-bubble relative flex max-w-[88%] flex-col sm:max-w-[78%]",
					rich && !own && "pl-11",
					own ? "own-message ml-auto items-end" : "items-start",
				)}
			>
				{rich && !own && (
					<span
						aria-hidden="true"
						className="absolute left-0 top-0 grid size-8 place-items-center rounded-lg border border-outline-variant/60 bg-surface-container-high font-label-sm font-semibold text-xs text-on-surface"
					>
						{name
							.split(" ")
							.map((part) => part[0])
							.slice(0, 2)
							.join("")}
					</span>
				)}
				<MessageBubbleRepresentation name={name} own={own} message={message} highlight={highlight} />
			</article>
		</>
	)
}
