import { createFileRoute, Link } from "@tanstack/react-router";
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
import { useMemo, useState } from "react";

import { Monogram, SkillTag, workspaceStyles } from "@/components/Common/WorkspaceUI";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { freelancers } from "@/data/freelancers";

type MessagesSearch = { with?: string };
type InboxFilter = "all" | "unread";
type MessageToolDialog = "search" | "attachment" | "brief" | null;

const conversationMeta = [
  {
    id: "maya-laurent",
    preview: "Absolutely — I can share a first approach tomorrow.",
    time: "10:24",
    unread: 2,
  },
  {
    id: "noah-williams",
    preview: "The architecture notes are ready for your review.",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: "amara-okafor",
    preview: "Your positioning brief gives me a clear direction.",
    time: "Mon",
    unread: 1,
  },
  {
    id: "elias-chen",
    preview: "I’ve outlined the automation and evaluation flow.",
    time: "Sep 4",
    unread: 0,
  },
];

const incomingMessages: Record<string, string> = {
  "maya-laurent":
    "Thanks for reaching out. I’d love to learn more about the product and the workflow you want to improve.",
  "noah-williams": "Thanks for the context. The product sounds like a strong fit for the systems I usually build.",
  "amara-okafor":
    "I’ve read through your brief. There is a good opportunity to make the positioning much more distinctive.",
  "elias-chen": "The workflow is a good candidate for automation, especially with a clear human review step.",
};

export const Route = createFileRoute("/_layout/messages")({
  validateSearch: (search: Record<string, unknown>): MessagesSearch => ({
    with: typeof search.with === "string" ? search.with : undefined,
  }),
  component: Messages,
  head: () => ({ meta: [{ title: "Messages | Freelancer" }] }),
});

function Messages() {
  const search = Route.useSearch();
  const initial = freelancers.find((person) => person.id === search.with) ?? freelancers[0];
  const [selectedId, setSelectedId] = useState(search.with ? initial.id : "");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [draft, setDraft] = useState("");
  const [sentMessages, setSentMessages] = useState<Record<string, string[]>>({});
  const [toolDialog, setToolDialog] = useState<MessageToolDialog>(null);

  const selected = useMemo(
    () => freelancers.find((person) => person.id === selectedId) ?? freelancers[0],
    [selectedId],
  );

  const conversations = useMemo(() => {
    return conversationMeta.filter((conversation) => {
      const person = freelancers.find((item) => item.id === conversation.id);
      if (!person) return false;
      const matchesQuery = `${person.name} ${person.title}`.toLowerCase().includes(query.toLowerCase());
      return matchesQuery && (filter === "all" || conversation.unread > 0);
    });
  }, [filter, query]);

  function sendMessage() {
    const message = draft.trim();
    if (!message) return;
    setSentMessages((current) => ({
      ...current,
      [selected.id]: [...(current[selected.id] ?? []), message],
    }));
    setDraft("");
  }

  return (
    <div className="border-border bg-card shadow-card overflow-hidden rounded-[28px] border">
      <div className="grid h-[calc(100svh-112px)] min-h-[620px] lg:h-[calc(100svh-180px)] lg:max-h-[820px] lg:min-h-[680px] lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_280px]">
        <aside
          aria-label="Conversations"
          className={`${selectedId ? "hidden lg:flex" : "flex"} border-border bg-card min-h-0 flex-col border-r`}
        >
          <div className="border-border border-b px-5 pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-700 text-xs font-semibold">Inbox</p>
                <h1 className="font-display mt-1 text-2xl font-semibold">Messages</h1>
              </div>
              <span className="bg-brand-50 text-brand-700 dark:bg-brand-950/60 rounded-full px-2.5 py-1 text-xs font-semibold">
                3 new
              </span>
            </div>
            <label className={`${workspaceStyles.inputShell} mt-4 min-h-11 px-3`}>
              <Search className="text-muted-foreground size-4" />
              <span className="sr-only">Search conversations</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations"
                className="min-w-0 flex-1 bg-transparent px-2 text-base outline-none md:text-sm"
              />
            </label>
            <fieldset className="bg-muted mt-3 flex gap-1 rounded-xl p-1" aria-label="Inbox filters">
              {(["all", "unread"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`min-h-9 flex-1 rounded-lg px-3 text-xs font-semibold capitalize transition ${
                    filter === value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {value}
                </button>
              ))}
            </fieldset>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {conversations.map((conversation) => {
              const person = freelancers.find((item) => item.id === conversation.id);
              if (!person) return null;
              const isSelected = selected.id === person.id;
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => setSelectedId(person.id)}
                  className={`relative flex min-h-[92px] w-full items-start gap-3 rounded-xl p-3 text-left transition-colors ${
                    isSelected ? "bg-brand-50 dark:bg-brand-950/45" : "hover:bg-muted/70"
                  }`}
                >
                  {isSelected && <span className="bg-brand-600 absolute inset-y-4 left-0 w-0.5 rounded-full" />}
                  <div className="relative">
                    <Monogram className={`size-11 text-sm ${person.background} ${person.foreground}`}>
                      {person.initials}
                    </Monogram>
                    <span className="border-card absolute right-0 bottom-0 size-3 rounded-full border-2 bg-emerald-500" />
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <strong className="truncate text-sm">{person.name}</strong>
                      <span className="text-muted-foreground ml-2 shrink-0 text-[11px]">{conversation.time}</span>
                    </span>
                    <span className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-5">
                      {conversation.preview}
                    </span>
                  </span>
                  {conversation.unread > 0 && (
                    <span className="bg-brand-600 absolute right-3 bottom-3 grid size-5 place-items-center rounded-full text-[10px] font-semibold text-white">
                      {conversation.unread}
                    </span>
                  )}
                </button>
              );
            })}
            {conversations.length === 0 && (
              <div className="px-4 py-10 text-center">
                <Search className="text-muted-foreground mx-auto size-5" />
                <p className="mt-2 text-sm font-medium">No conversations found</p>
                <p className="text-muted-foreground mt-1 text-xs">Try another name or inbox filter.</p>
              </div>
            )}
          </div>
        </aside>

        <section
          aria-label={`Conversation with ${selected.name}`}
          className={`${selectedId ? "flex" : "hidden lg:flex"} bg-background min-h-0 min-w-0 flex-col`}
        >
          <header className="border-border bg-card flex min-h-[76px] items-center gap-3 border-b px-3 sm:px-5">
            <button
              type="button"
              onClick={() => setSelectedId("")}
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
              <p className="truncate text-xs text-emerald-700">
                Online · {selected.responseTime.replace("Usually ", "")}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                aria-label="Search this conversation"
                onClick={() => setToolDialog("search")}
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
                  <DropdownMenuItem onClick={() => setFilter("unread")}>
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
                  incomingMessages[selected.id] ??
                  "Thanks for reaching out. I’d be happy to learn more about what you’re building."
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

              {(sentMessages[selected.id] ?? []).map((message, index) => (
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
                sendMessage();
              }}
              className="border-input bg-background focus-within:border-brand-600 focus-within:ring-brand-100 rounded-2xl border p-2 transition-shadow focus-within:ring-4"
            >
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
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
                  onClick={() => setToolDialog("attachment")}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground grid size-10 place-items-center rounded-full transition"
                >
                  <Paperclip className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Add a project brief"
                  onClick={() => setToolDialog("brief")}
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

        <aside className="border-border bg-card hidden min-h-0 flex-col border-l xl:flex">
          <div className="border-border flex items-center justify-between border-b px-5 py-4">
            <p className="font-display font-semibold">Talent details</p>
            <Info className="text-muted-foreground size-4" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="text-center">
              <div className="relative mx-auto w-fit">
                <Monogram className={`size-20 text-xl ${selected.background} ${selected.foreground}`}>
                  {selected.initials}
                </Monogram>
                <span className="border-card absolute right-0 bottom-1 size-4 rounded-full border-[3px] bg-emerald-500" />
              </div>
              <p className="font-display mt-3 text-lg font-semibold">{selected.name}</p>
              <p className="text-muted-foreground mt-1 text-xs">{selected.title}</p>
              <Link
                to="/talent/$freelancerId"
                params={{ freelancerId: selected.id }}
                search={{ q: undefined }}
                className={`${workspaceStyles.secondaryAction} mt-4 min-h-10 px-4 text-xs`}
              >
                View profile
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <div className="bg-muted/60 rounded-xl p-3">
                <p className="font-display text-lg font-semibold">${selected.rate}/hr</p>
                <p className="text-muted-foreground mt-0.5 text-[10px]">Rate</p>
              </div>
              <div className="bg-muted/60 rounded-xl p-3">
                <p className="font-display text-lg font-semibold">{selected.rating.toFixed(1)}</p>
                <p className="text-muted-foreground mt-0.5 text-[10px]">Client rating</p>
              </div>
            </div>

            <div className="border-border mt-6 border-t pt-5">
              <p className="text-xs font-semibold">Conversation context</p>
              <div className="mt-3 space-y-3 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">Availability</span>
                  <span className="text-right font-medium text-emerald-700">{selected.availability}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">Local time</span>
                  <span className="text-right font-medium">{selected.timezone.split(" · ")[1]}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">Response</span>
                  <span className="text-right font-medium">
                    {selected.responseTime.replace("Usually replies ", "")}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-border mt-6 border-t pt-5">
              <p className="text-xs font-semibold">Top skills</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selected.skills.slice(0, 5).map((skill) => (
                  <SkillTag key={skill}>{skill}</SkillTag>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/35">
              <ShieldCheck className="size-4 text-emerald-700" />
              <p className="mt-2 text-xs font-semibold">Verified professional</p>
              <p className="text-muted-foreground mt-1 text-[11px] leading-5">
                Identity and work history have been reviewed.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <Dialog open={toolDialog !== null} onOpenChange={() => setToolDialog(null)}>
        <DialogContent>
          {toolDialog === "search" && (
            <>
              <DialogHeader>
                <DialogTitle>Search this conversation</DialogTitle>
                <DialogDescription>Find names, topics, or brief details in the current thread.</DialogDescription>
              </DialogHeader>
              <label className={`${workspaceStyles.inputShell} min-h-12`}>
                <Search className="text-muted-foreground size-4" />
                <span className="sr-only">Conversation search</span>
                <input
                  placeholder="Search messages"
                  className="min-w-0 flex-1 bg-transparent px-3 text-base outline-none md:text-sm"
                />
              </label>
            </>
          )}
          {toolDialog === "attachment" && (
            <>
              <DialogHeader>
                <DialogTitle>Attach a file</DialogTitle>
                <DialogDescription>
                  Add a brief, requirements, or references when this conversation is ready for shared files.
                </DialogDescription>
              </DialogHeader>
              <div className="border-border bg-background rounded-xl border border-dashed p-6 text-center">
                <Paperclip className="text-brand-600 mx-auto size-5" />
                <p className="mt-3 text-sm font-semibold">Shared files</p>
              </div>
            </>
          )}
          {toolDialog === "brief" && (
            <>
              <DialogHeader>
                <DialogTitle>Add a project brief</DialogTitle>
                <DialogDescription>Draft a short scope that can be sent into this conversation.</DialogDescription>
              </DialogHeader>
              <textarea
                rows={5}
                placeholder="Summarize the goal, timeline, and screens you want prioritized."
                className="border-input bg-background focus:border-brand-600 focus:ring-brand-100 w-full rounded-xl border px-4 py-3 text-sm leading-6 outline-none focus:ring-4"
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessageBubble({
  initials,
  avatarClass,
  message,
  time,
}: {
  initials: string;
  avatarClass: string;
  message: string;
  time: string;
}) {
  return (
    <div className="flex max-w-[92%] items-end gap-2 sm:max-w-[78%] sm:gap-3">
      <Monogram className={`size-8 text-[10px] ${avatarClass}`}>{initials}</Monogram>
      <div>
        <div className="border-border bg-card rounded-2xl rounded-bl-md border px-4 py-3 text-sm leading-6 shadow-sm">
          {message}
        </div>
        <p className="text-muted-foreground mt-1 text-[11px]">{time}</p>
      </div>
    </div>
  );
}
