import { LoaderCircle, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatMessagePublic } from "@/client/types.gen"
import { formatMessageTime } from "@/lib/format"
import { useWebSocket } from "@/context/websocket-context"
import { accountAvatarUrl, useAccountAvatarUrl } from "@/hooks/useAccountAvatar"
import { MessageContent } from "./MessageContent"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useEffect, useState } from "react"
import { useDeleteMessage } from "@/hooks/userConversation"
import { LoadingImage } from "@/components/common/loading-image"
import useAuth from "@/hooks/useAuth"
import { useAccountRole } from "@/hooks/useAccountRole"

function Time({ created_at = "" }: { created_at: string }) {
	return (
		<div className="flex items-baseline gap-2 font-caption text-caption text-on-surface-variant">
			<span className="text-[11px] text-outline">{formatMessageTime(created_at)}</span>
		</div>
	)
}

function MessageOptions({
	message,
	onDelete,
	isDeleting = false,
}: {
	message: ChatMessagePublic
	onDelete?: () => void
	isDeleting?: boolean
}) {
	useEffect(() => {
		// message options lifecycle
	}, [message])

	return (
		<div className="mx-1 flex justify-end">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						aria-label="Message options"
						disabled={isDeleting}
						className="text-black dark:text-white flex size-5 items-center justify-center rounded-md outline-none transition-all duration-150 hover:bg-white/10 disabled:opacity-50"
					>
						<MoreHorizontal className="size-3" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					sideOffset={4}
					className="min-w-24 w-auto rounded-lg border-outline-variant/80 bg-surface-container-lowest p-1 shadow-md"
				>
					<DropdownMenuItem
						variant="destructive"
						disabled={isDeleting}
						onSelect={() => {
							onDelete?.()
						}}
						className="min-h-7 h-7 cursor-pointer gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="size-3 shrink-0"
							aria-hidden="true"
						>
							<path d="M3 6h18" />
							<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
							<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
							<line x1="10" x2="10" y1="11" y2="17" />
							<line x1="14" x2="14" y1="11" y2="17" />
						</svg>
						<span> Delete </span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}

function MessageBubbleRepresentation({
	own = false,
	message,
	highlight = "",
	name = "",
	onDelete,
	isDeleting = false,
}: {
	own?: boolean
	message: ChatMessagePublic
	highlight?: string
	name: string
	onDelete?: () => void
	isDeleting?: boolean
}) {
	const role = useAccountRole()
	const { messageSendState } = useWebSocket()
	const sendState = messageSendState[message.id] ?? "sent"
	const match = highlight ? message.content.toLowerCase().indexOf(highlight.toLowerCase()) : -1

	return (
		<div className="flex flex-col">
			<div className="flex items-end justify-items-end gap-2 group w-full">
				<div className={cn("w-full flex flex-col ", own ? "items-end" : "items-start")}>
					<div className="flex gap-3 w-full">
						{!own && (
							<LoadingImage
								src={useAccountAvatarUrl(message.sender_id)}
								alt=""
								className={cn("size-8 place-items-center border font-label-sm font-semibold shadow-2xs rounded-4xl")}
							/>
						)}
						<div className={cn("w-full flex flex-col", own ? "items-end" : "items-start")}>
							<div
								className={cn(
									"flex flex-col min-w-0 max-w-full px-3 py-3 font-body-sm text-body-sm leading-reaxed [overflow-wrap:anywhere] word-wrap-break",
									own
									? "rounded-2xl rounded-tr-none bg-[#1f2125] text-white shadow-sm dark:bg-[#202722] dark:border dark:border-primary/35 dark:text-on-surface"
									: "rounded-2xl rounded-tl-none border border-outline-variant/80 bg-surface-container-lowest text-on-surface shadow-xs dark:bg-[#1e2226] dark:border-outline-variant",
								)}
								>
								
								{match < 0 ? (
									<MessageContent content={message.content} />
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
								{
									own && (
										<MessageOptions
											message={message}
											onDelete={onDelete}
											isDeleting={isDeleting}
										/>
									)
								}
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
							<LoadingImage
								src={useAccountAvatarUrl(message.sender_id, role)}
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
	const [isDeleting, setIsDeleting] = useState(false)
	const { mutate: deleteMessage, isPending } = useDeleteMessage(message.conversation_id)

	const handleDelete = () => {
		setIsDeleting(true)
		setTimeout(() => {
			deleteMessage(message.id, {
				onError: () => {
					setIsDeleting(false)
				},
			})
		}, 300)
	}

	return (
		<div
			className={cn(
				"grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
				isDeleting
					? "grid-rows-[0fr] opacity-0 scale-95 -translate-y-1 pointer-events-none !mt-0"
					: "grid-rows-[1fr] opacity-100 scale-100 translate-y-0",
			)}
		>
			<div className="overflow-hidden">
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
							className="absolute top-0 left-0 grid size-8 place-items-center rounded-lg border border-outline-variant/60 bg-surface-container-high font-label-sm font-semibold text-on-surface text-xs"
						>
							{name
								.split(" ")
								.map((part) => part[0])
								.slice(0, 2)
								.join("")}
						</span>
					)}
					<MessageBubbleRepresentation
						name={name}
						own={own}
						message={message}
						highlight={highlight}
						onDelete={handleDelete}
						isDeleting={isDeleting || isPending}
					/>
				</article>
			</div>
		</div>
	)
}
