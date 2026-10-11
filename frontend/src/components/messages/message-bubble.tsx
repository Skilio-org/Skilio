// import { Download, Eye, FileText, MessageSquareText } from "lucide-react"
// import { useState } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"
// import type { ThreadMessage } from "./message-types"
import { ChatMessagePublic } from "@/client/types.gen"
import { formatMessageTime } from "@/util/timestampformatter"
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
	// rich?: boolean
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
							></img>
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
								{/* {rich && message. && (
								<section className="mt-3 rounded-lg border border-outline-variant bg-surface-container-low p-3.5 text-on-surface">
									<h4 className="mb-2 flex items-center gap-2 font-label-md font-semibold text-label-md text-on-surface">
										<MessageSquareText className="size-4 text-primary" />
										Design critique notes
									</h4>
									<ul className="space-y-1.5 font-body-sm text-body-sm text-on-surface-variant">
										{message.feedback.map((note) => (
											<li key={note} className="ml-4 list-disc marker:text-primary">
												<strong className="font-medium text-on-surface">{note.split(": ")[0]}:</strong> {note.split(": ").slice(1).join(": ")}
											</li>
										))}
									</ul>
								</section>
							)} */}
							</div>
							<span className="py-1 flex justify-around items-center gap-1 text-outline text-[10px]" aria-live="polite">
								{!own && (
									<div className="flex items-center justify-center gap-1">
										<span
											className={cn(
												"font-semibold truncate font-label-md text-label-md text-on-surface  text-primary dark:text-primary",
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
										{sendState}
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
							></img>
						)}
					</div>
				</div>

				{/* State of sending! */}
				{/* {rich && message.attachment_id && (
					<>
						<div className="message-attachment mt-2 flex w-full flex-wrap items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-3 text-on-surface shadow-xs">
							<FileText className="size-8 shrink-0 rounded-lg bg-surface-container p-1.5 text-primary" />
							<div className="min-w-0 flex-1">
								<p className="truncate font-label-md font-semibold text-label-md text-on-surface">{message.attachment.name}</p>
								<p className="font-caption text-caption text-on-surface-variant">Text document · Project handoff</p>
							</div>
							<button
								type="button"
								onClick={() => setPreviewOpen(true)}
								className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 font-label-sm text-label-sm text-on-surface hover:bg-surface-container-low transition-colors"
							>
								<Eye className="size-3.5 text-outline" />
								Inspect
							</button>
							<a
								aria-label={`Download ${message.attachment.name}`}
								download={message.attachment.name}
								href={`data:text/plain;charset=utf-8,${encodeURIComponent(message.attachment.content)}`}
								className="grid size-8 place-items-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
							>
								<Download className="size-3.5" />
							</a>
						</div>
						<Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
							<DialogContent className="border-outline-variant bg-surface-container-lowest">
								<DialogHeader>
									<DialogTitle className="font-headline-sm font-semibold text-headline-sm text-on-surface">{message.attachment.name}</DialogTitle>
								</DialogHeader>
								<pre className="whitespace-pre-wrap font-body-sm text-body-sm leading-relaxed text-on-surface-variant">{message.attachment.content}</pre>
							</DialogContent>
						</Dialog>
						</>
				)} */}
			</div>
			{/* 
		{!own && (
			<span className="flex justify-around items-center gap-1 text-outline text-[10px]" aria-live="polite">
				<Time  created_at={message.created_at ? message.created_at : ""} />
				{sendState}
				{sendState === "pending" && <LoaderCircle className="size-2 animate-spin" aria-hidden="true" />}
			</span>
		)}
		 */}
		</div>
	)
}

export function MessageBubble({
	// sentState,
	message,
	name,
	highlight = "",
	rich = false,
	own = false,
}: {
	// senttState: sendState,
	message: ChatMessagePublic
	name: string
	highlight?: string
	rich?: boolean
	own?: boolean
}) {
	// const [previewOpen, setPreviewOpen] = useState(false)

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
				{/* { Message Legend Date and User.} */}

				<MessageBubbleRepresentation name={name} own={own} message={message} highlight={highlight} />
			</article>
		</>
	)
}
