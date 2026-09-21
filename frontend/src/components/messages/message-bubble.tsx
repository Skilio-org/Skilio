import { Download, Eye, FileText, MessageSquareText } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { ThreadMessage } from "./message-types"

export function MessageBubble({
	message,
	name,
	highlight = "",
	rich = false,
}: {
	message: ThreadMessage
	name: string
	highlight?: string
	rich?: boolean
}) {
	const [previewOpen, setPreviewOpen] = useState(false)
	const match = highlight ? message.body.toLowerCase().indexOf(highlight.toLowerCase()) : -1
	return (
		<article
			className={cn(
				"message-bubble relative flex max-w-[88%] flex-col sm:max-w-[78%]",
				rich && !message.own && "pl-11",
				message.own ? "own-message ml-auto items-end" : "items-start",
			)}
		>
			{rich && !message.own && (
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
			<div className="mb-1.5 flex items-baseline gap-2 px-1 font-caption text-caption text-on-surface-variant">
				<span className={cn("font-semibold", message.own ? "text-primary dark:text-primary" : "text-on-surface")}>
					{message.own ? "You" : name}
				</span>
				<span className="text-outline text-[10px]">·</span>
				<span className="text-outline text-[11px]">{message.time}</span>
			</div>
			<div
				className={cn(
					"min-w-0 max-w-full whitespace-pre-wrap px-4.5 py-3.5 font-body-sm text-body-sm leading-relaxed [overflow-wrap:anywhere]",
					message.own
						? "rounded-2xl rounded-tr-xs bg-[#1f2125] text-white shadow-sm dark:bg-[#202722] dark:border dark:border-primary/35 dark:text-on-surface"
						: "rounded-2xl rounded-tl-xs border border-outline-variant/80 bg-surface-container-lowest text-on-surface shadow-xs dark:bg-[#1e2226] dark:border-outline-variant",
				)}
			>
				{match < 0 ? (
					message.body
				) : (
					<>
						{message.body.slice(0, match)}
						<mark className="rounded-xs bg-primary/20 text-on-surface px-1 py-0.5 font-medium">
							{message.body.slice(match, match + highlight.length)}
						</mark>
						{message.body.slice(match + highlight.length)}
					</>
				)}
				{rich && message.feedback && (
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
				)}
			</div>
			{rich && message.attachment && (
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
			)}
		</article>
	)
}
