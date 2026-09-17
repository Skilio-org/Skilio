import { cn } from "@/lib/utils"
import type { ThreadMessage } from "./message-types"

export function MessageBubble({
	message,
	name,
	highlight = "",
}: {
	message: ThreadMessage
	name: string
	highlight?: string
}) {
	const match = highlight ? message.body.toLowerCase().indexOf(highlight.toLowerCase()) : -1
	return (
		<article
			className={cn("flex max-w-[90%] flex-col sm:max-w-[80%]", message.own ? "ml-auto items-end" : "items-start")}
		>
			<div className="mb-1.5 flex items-baseline gap-2.5 px-1 text-[11px]">
				<span className="font-medium text-foreground">{message.own ? "You" : name}</span>
				<span className="text-muted-foreground">{message.time}</span>
			</div>
			<p
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
			</p>
		</article>
	)
}
