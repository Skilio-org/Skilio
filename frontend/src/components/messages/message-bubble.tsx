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
				"message-bubble relative flex max-w-[90%] flex-col sm:max-w-[80%]",
				rich && !message.own && "pl-11",
				message.own ? "own-message ml-auto items-end" : "items-start",
			)}
		>
			{rich && !message.own && (
				<span
					aria-hidden="true"
					className="absolute left-0 top-0 grid size-8 place-items-center rounded-xl bg-primary text-xs font-medium text-primary-foreground"
				>
					{name
						.split(" ")
						.map((part) => part[0])
						.slice(0, 2)
						.join("")}
				</span>
			)}
			<div className="mb-1.5 flex items-baseline gap-2.5 px-1 text-[11px]">
				<span className="font-medium text-foreground">{message.own ? "You" : name}</span>
				<span className="text-muted-foreground">{message.time}</span>
			</div>
			<div
				className={cn(
					"min-w-0 max-w-full whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 [overflow-wrap:anywhere]",
					message.own
						? "rounded-tr-sm bg-accent text-accent-foreground"
						: "rounded-tl-sm border border-border bg-card text-foreground",
				)}
			>
				{match < 0 ? (
					message.body
				) : (
					<>
						{message.body.slice(0, match)}
						<mark className="rounded-sm bg-amber-200 px-0.5 text-slate-950">
							{message.body.slice(match, match + highlight.length)}
						</mark>
						{message.body.slice(match + highlight.length)}
					</>
				)}
				{rich && message.feedback && (
					<section className="mt-4 rounded-lg bg-surface-container-low p-4 text-on-surface">
						<h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold">
							<MessageSquareText className="size-4 text-primary" />
							Design critique consolidations
						</h3>
						<ul className="space-y-2 text-[13px] leading-6">
							{message.feedback.map((note) => (
								<li key={note} className="ml-4 list-disc marker:text-primary">
									<strong className="font-medium">{note.split(": ")[0]}:</strong> {note.split(": ").slice(1).join(": ")}
								</li>
							))}
						</ul>
					</section>
				)}
			</div>
			{rich && message.attachment && (
				<>
					<div className="message-attachment mt-2 flex w-full flex-wrap items-center gap-3 rounded-lg bg-card p-4 text-foreground">
						<FileText className="size-8 shrink-0 rounded-lg bg-surface-container p-1.5 text-primary" />
						<div className="min-w-0 flex-1">
							<p className="truncate text-[13px] font-semibold">{message.attachment.name}</p>
							<p className="mt-1 text-xs text-muted-foreground">Text document · Project handoff</p>
						</div>
						<button
							type="button"
							onClick={() => setPreviewOpen(true)}
							className="flex h-9 items-center gap-1.5 rounded-md bg-surface-container px-2.5 text-xs"
						>
							<Eye className="size-4" />
							Inspect
						</button>
						<a
							aria-label={`Download ${message.attachment.name}`}
							download={message.attachment.name}
							href={`data:text/plain;charset=utf-8,${encodeURIComponent(message.attachment.content)}`}
							className="grid size-9 place-items-center rounded-md bg-surface-container"
						>
							<Download className="size-4" />
						</a>
					</div>
					<Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>{message.attachment.name}</DialogTitle>
							</DialogHeader>
							<pre className="whitespace-pre-wrap text-sm leading-7">{message.attachment.content}</pre>
						</DialogContent>
					</Dialog>
				</>
			)}
		</article>
	)
}
