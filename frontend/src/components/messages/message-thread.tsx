import { Link } from "@tanstack/react-router";
import {
  Archive,
  ArrowLeft,
  BadgeCheck,
  CheckCheck,
  FileText,
  Info,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Monogram, workspaceStyles } from "@/components/dashboard/dashboard-header";
import { MessageBubble } from "@/components/messages/message-bubble";
import type { MessageToolDialog } from "@/components/messages/message-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Freelancer } from "@/data/freelancers";

export function MessageThread({
  selected,
  selectedId,
  incomingMessage,
  sentMessages,
  draft,
  onBack,
  onOpenTool,
  onShowUnread,
  onDraftChange,
  onSend,
}: {
  selected: Freelancer;
  selectedId: string;
  incomingMessage?: string;
  sentMessages: string[];
  draft: string;
  onBack: () => void;
  onOpenTool: (dialog: Exclude<MessageToolDialog, null>) => void;
  onShowUnread: () => void;
  onDraftChange: (draft: string) => void;
  onSend: () => void;
}) {
  return (
    <section
      aria-label={`Conversation with ${selected.name}`}
      className={`${selectedId ? "flex" : "hidden lg:flex"} bg-background min-h-0 min-w-0 flex-col`}
    >
      <header className="border-border bg-card flex min-h-[76px] items-center gap-3 border-b px-3 sm:px-5">
        <button
          type="button"
          onClick={() => onBack()}
          aria-label="Back to conversations"
          className="hover:bg-muted grid size-11 place-items-center rounded-full transition lg:hidden"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="relative">
          <Monogram className={`size-11 text-sm ${selected.background} ${selected.foreground}`}>
            {selected.initials}
          </Monogram>
          <span className="border-card absolute right-0 bottom-0 size-3 rounded-full border-2 bg-emerald-500" />
        </div>
        <div className="min-w-0">
          <Link
            to="/talent/$freelancerId"
            params={{ freelancerId: selected.id }}
            search={{ q: undefined }}
            className="font-display hover:text-brand-700 flex items-center gap-1 truncate font-semibold"
          >
            {selected.name}
            <BadgeCheck className="text-brand-600 size-3.5 shrink-0" />
          </Link>
          <p className="truncate text-xs text-emerald-700">Online · {selected.responseTime.replace("Usually ", "")}</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Search this conversation"
            onClick={() => onOpenTool("search")}
            className={`${workspaceStyles.iconButton} border-transparent`}
          >
            <Search className="size-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Conversation options"
                className={`${workspaceStyles.iconButton} border-transparent`}
              >
                <MoreHorizontal className="size-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => onShowUnread()}>
                <CheckCheck className="size-4" />
                Show unread only
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Archive className="size-4" />
                Archive conversation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/talent/$freelancerId" params={{ freelancerId: selected.id }} search={{ q: undefined }}>
                  <Info className="size-4" />
                  View talent details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_var(--color-brand-50),_transparent_38%)] p-4 sm:p-6 dark:bg-none">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center gap-3 py-1">
            <span className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-[11px] font-medium">Today</span>
            <span className="bg-border h-px flex-1" />
          </div>

          <div className="border-brand-100 bg-brand-50/70 dark:border-brand-900 dark:bg-brand-950/35 rounded-2xl border p-4 text-center">
            <Sparkles className="text-brand-600 mx-auto size-4" />
            <p className="mt-2 text-xs font-medium">You started a conversation with {selected.name}</p>
            <p className="text-muted-foreground mt-1 text-[11px]">Keep project details and files together here.</p>
          </div>

          <MessageBubble
            initials={selected.initials}
            avatarClass={`${selected.background} ${selected.foreground}`}
            message={
              incomingMessage ?? "Thanks for reaching out. I’d be happy to learn more about what you’re building."
            }
            time="10:24 AM"
          />

          <div className="ml-auto max-w-[88%] sm:max-w-[76%]">
            <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 text-sm leading-6 shadow-sm">
              Great to meet you. We’re building a client-facing marketplace and need help making the core experience
              feel clear and trustworthy.
            </div>
            <p className="text-muted-foreground mt-1 flex items-center justify-end gap-1 text-[11px]">
              10:28 AM <CheckCheck className="text-brand-600 size-3.5" />
            </p>
          </div>

          <MessageBubble
            initials={selected.initials}
            avatarClass={`${selected.background} ${selected.foreground}`}
            message="Absolutely — I can share a first approach tomorrow. Could you send the main user flow and the screens you want prioritized?"
            time="10:31 AM"
          />

          {sentMessages.map((message, index) => (
            <div key={`${message}-${index}`} className="ml-auto max-w-[88%] sm:max-w-[76%]">
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 text-sm leading-6 shadow-sm">
                {message}
              </div>
              <p className="text-muted-foreground mt-1 flex items-center justify-end gap-1 text-[11px]">
                Now <CheckCheck className="text-brand-600 size-3.5" />
              </p>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-border bg-card border-t p-3 sm:p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSend();
          }}
          className="border-input bg-background focus-within:border-brand-600 focus-within:ring-brand-100 rounded-2xl border p-2 transition-shadow focus-within:ring-4"
        >
          <textarea
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            rows={2}
            aria-label="Message"
            placeholder={`Message ${selected.name.split(" ")[0]}…`}
            className="min-h-12 w-full resize-none bg-transparent px-3 py-2 text-base leading-6 outline-none md:text-sm"
          />
          <div className="border-border flex items-center gap-1 border-t px-1 pt-2">
            <button
              type="button"
              aria-label="Attach a file"
              onClick={() => onOpenTool("attachment")}
              className="text-muted-foreground hover:bg-muted hover:text-foreground grid size-10 place-items-center rounded-full transition"
            >
              <Paperclip className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Add a project brief"
              onClick={() => onOpenTool("brief")}
              className="text-muted-foreground hover:bg-muted hover:text-foreground grid size-10 place-items-center rounded-full transition"
            >
              <FileText className="size-4" />
            </button>
            <span className="text-muted-foreground ml-1 hidden text-[11px] sm:block">
              Enter to send · Shift + Enter for a new line
            </span>
            <button
              type="submit"
              disabled={!draft.trim()}
              className="bg-primary text-primary-foreground hover:bg-brand-700 ml-auto inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send <Send className="size-3.5" />
            </button>
          </div>
        </form>
        <p className="text-muted-foreground mt-2 flex items-center justify-center gap-1.5 text-[10px]">
          <ShieldCheck className="size-3" /> Conversations are protected on Freelancer.
        </p>
      </footer>
    </section>
  );
}
