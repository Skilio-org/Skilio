import { createFileRoute, Link } from "@tanstack/react-router"
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
} from "lucide-react"
import { useMemo, useState } from "react"

import {
  Monogram,
  SkillTag,
  workspaceStyles,
} from "@/components/Common/WorkspaceUI"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { freelancers } from "@/data/freelancers"

type MessagesSearch = { with?: string }
type InboxFilter = "all" | "unread"
type MessageToolDialog = "search" | "attachment" | "brief" | null

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
]

const incomingMessages: Record<string, string> = {
  "maya-laurent":
    "Thanks for reaching out. I’d love to learn more about the product and the workflow you want to improve.",
  "noah-williams":
    "Thanks for the context. The product sounds like a strong fit for the systems I usually build.",
  "amara-okafor":
    "I’ve read through your brief. There is a good opportunity to make the positioning much more distinctive.",
  "elias-chen":
    "The workflow is a good candidate for automation, especially with a clear human review step.",
}

export const Route = createFileRoute("/_layout/messages")({
  validateSearch: (search: Record<string, unknown>): MessagesSearch => ({
    with: typeof search.with === "string" ? search.with : undefined,
  }),
  component: Messages,
  head: () => ({ meta: [{ title: "Messages | Freelancer" }] }),
})

function Messages() {
  const search = Route.useSearch()
  const initial =
    freelancers.find((person) => person.id === search.with) ?? freelancers[0]
  const [selectedId, setSelectedId] = useState(search.with ? initial.id : "")
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<InboxFilter>("all")
  const [draft, setDraft] = useState("")
  const [sentMessages, setSentMessages] = useState<Record<string, string[]>>({})
  const [toolDialog, setToolDialog] = useState<MessageToolDialog>(null)

  const selected = useMemo(
    () =>
      freelancers.find((person) => person.id === selectedId) ?? freelancers[0],
    [selectedId],
  )

  const conversations = useMemo(() => {
    return conversationMeta.filter((conversation) => {
      const person = freelancers.find((item) => item.id === conversation.id)
      if (!person) return false
      const matchesQuery = `${person.name} ${person.title}`
        .toLowerCase()
        .includes(query.toLowerCase())
      return matchesQuery && (filter === "all" || conversation.unread > 0)
    })
  }, [filter, query])

  function sendMessage() {
    const message = draft.trim()
    if (!message) return
    setSentMessages((current) => ({
      ...current,
      [selected.id]: [...(current[selected.id] ?? []), message],
    }))
    setDraft("")
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-card">
      <div className="grid h-[calc(100svh-112px)] min-h-[620px] lg:h-[calc(100svh-180px)] lg:min-h-[680px] lg:max-h-[820px] lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_280px]">
        <aside
          aria-label="Conversations"
          className={`${selectedId ? "hidden lg:flex" : "flex"} min-h-0 flex-col border-r border-border bg-card`}
        >
          <div className="border-b border-border px-5 pb-4 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-brand-700">Inbox</p>
                <h1 className="mt-1 font-display text-2xl font-semibold">
                  Messages
                </h1>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/60">
                3 new
              </span>
            </div>
            <label
              className={`${workspaceStyles.inputShell} mt-4 min-h-11 px-3`}
            >
              <Search className="size-4 text-muted-foreground" />
              <span className="sr-only">Search conversations</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations"
                className="min-w-0 flex-1 bg-transparent px-2 text-base outline-none md:text-sm"
              />
            </label>
            <fieldset
              className="mt-3 flex gap-1 rounded-xl bg-muted p-1"
              aria-label="Inbox filters"
            >
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
              const person = freelancers.find(
                (item) => item.id === conversation.id,
              )
              if (!person) return null
              const isSelected = selected.id === person.id
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => setSelectedId(person.id)}
                  className={`relative flex min-h-[92px] w-full items-start gap-3 rounded-xl p-3 text-left transition-colors ${
                    isSelected
                      ? "bg-brand-50 dark:bg-brand-950/45"
                      : "hover:bg-muted/70"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute inset-y-4 left-0 w-0.5 rounded-full bg-brand-600" />
                  )}
                  <div className="relative">
                    <Monogram
                      className={`size-11 text-sm ${person.background} ${person.foreground}`}
                    >
                      {person.initials}
                    </Monogram>
                    <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-emerald-500" />
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <strong className="truncate text-sm">
                        {person.name}
                      </strong>
                      <span className="ml-2 shrink-0 text-[11px] text-muted-foreground">
                        {conversation.time}
                      </span>
                    </span>
                    <span className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {conversation.preview}
                    </span>
                  </span>
                  {conversation.unread > 0 && (
                    <span className="absolute bottom-3 right-3 grid size-5 place-items-center rounded-full bg-brand-600 text-[10px] font-semibold text-white">
                      {conversation.unread}
                    </span>
                  )}
                </button>
              )
            })}
            {conversations.length === 0 && (
              <div className="px-4 py-10 text-center">
                <Search className="mx-auto size-5 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  No conversations found
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try another name or inbox filter.
                </p>
              </div>
            )}
          </div>
        </aside>

        <section
          aria-label={`Conversation with ${selected.name}`}
          className={`${selectedId ? "flex" : "hidden lg:flex"} min-h-0 min-w-0 flex-col bg-background`}
        >
          <header className="flex min-h-[76px] items-center gap-3 border-b border-border bg-card px-3 sm:px-5">
            <button
              type="button"
              onClick={() => setSelectedId("")}
              aria-label="Back to conversations"
              className="grid size-11 place-items-center rounded-full transition hover:bg-muted lg:hidden"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="relative">
              <Monogram
                className={`size-11 text-sm ${selected.background} ${selected.foreground}`}
              >
                {selected.initials}
              </Monogram>
              <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-emerald-500" />
            </div>
            <div className="min-w-0">
              <Link
                to="/talent/$freelancerId"
                params={{ freelancerId: selected.id }}
                search={{ q: undefined }}
                className="flex items-center gap-1 truncate font-display font-semibold hover:text-brand-700"
              >
                {selected.name}
                <BadgeCheck className="size-3.5 shrink-0 text-brand-600" />
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
                    <Link
                      to="/talent/$freelancerId"
                      params={{ freelancerId: selected.id }}
                      search={{ q: undefined }}
                    >
                      <Info className="size-4" />
                      View talent details
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_var(--color-brand-50),_transparent_38%)] p-4 dark:bg-none sm:p-6">
            <div className="mx-auto max-w-2xl space-y-6">
              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  Today
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4 text-center dark:border-brand-900 dark:bg-brand-950/35">
                <Sparkles className="mx-auto size-4 text-brand-600" />
                <p className="mt-2 text-xs font-medium">
                  You started a conversation with {selected.name}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Keep project details and files together here.
                </p>
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
                <div className="rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground shadow-sm">
                  Great to meet you. We’re building a client-facing marketplace
                  and need help making the core experience feel clear and
                  trustworthy.
                </div>
                <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                  10:28 AM <CheckCheck className="size-3.5 text-brand-600" />
                </p>
              </div>

              <MessageBubble
                initials={selected.initials}
                avatarClass={`${selected.background} ${selected.foreground}`}
                message="Absolutely — I can share a first approach tomorrow. Could you send the main user flow and the screens you want prioritized?"
                time="10:31 AM"
              />

              {(sentMessages[selected.id] ?? []).map((message, index) => (
                <div
                  key={`${message}-${index}`}
                  className="ml-auto max-w-[88%] sm:max-w-[76%]"
                >
                  <div className="rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground shadow-sm">
                    {message}
                  </div>
                  <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                    Now <CheckCheck className="size-3.5 text-brand-600" />
                  </p>
                </div>
              ))}
            </div>
          </div>

          <footer className="border-t border-border bg-card p-3 sm:p-4">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                sendMessage()
              }}
              className="rounded-2xl border border-input bg-background p-2 transition-shadow focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-100"
            >
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    sendMessage()
                  }
                }}
                rows={2}
                aria-label="Message"
                placeholder={`Message ${selected.name.split(" ")[0]}…`}
                className="min-h-12 w-full resize-none bg-transparent px-3 py-2 text-base leading-6 outline-none md:text-sm"
              />
              <div className="flex items-center gap-1 border-t border-border px-1 pt-2">
                <button
                  type="button"
                  aria-label="Attach a file"
                  onClick={() => setToolDialog("attachment")}
                  className="grid size-10 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <Paperclip className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Add a project brief"
                  onClick={() => setToolDialog("brief")}
                  className="grid size-10 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <FileText className="size-4" />
                </button>
                <span className="ml-1 hidden text-[11px] text-muted-foreground sm:block">
                  Enter to send · Shift + Enter for a new line
                </span>
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Send <Send className="size-3.5" />
                </button>
              </div>
            </form>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
              <ShieldCheck className="size-3" /> Conversations are protected on
              Freelancer.
            </p>
          </footer>
        </section>

        <aside className="hidden min-h-0 flex-col border-l border-border bg-card xl:flex">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p className="font-display font-semibold">Talent details</p>
            <Info className="size-4 text-muted-foreground" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="text-center">
              <div className="relative mx-auto w-fit">
                <Monogram
                  className={`size-20 text-xl ${selected.background} ${selected.foreground}`}
                >
                  {selected.initials}
                </Monogram>
                <span className="absolute bottom-1 right-0 size-4 rounded-full border-[3px] border-card bg-emerald-500" />
              </div>
              <p className="mt-3 font-display text-lg font-semibold">
                {selected.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selected.title}
              </p>
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
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="font-display text-lg font-semibold">
                  ${selected.rate}/hr
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Rate</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="font-display text-lg font-semibold">
                  {selected.rating.toFixed(1)}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Client rating
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <p className="text-xs font-semibold">Conversation context</p>
              <div className="mt-3 space-y-3 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">Availability</span>
                  <span className="text-right font-medium text-emerald-700">
                    {selected.availability}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">Local time</span>
                  <span className="text-right font-medium">
                    {selected.timezone.split(" · ")[1]}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">Response</span>
                  <span className="text-right font-medium">
                    {selected.responseTime.replace("Usually replies ", "")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <p className="text-xs font-semibold">Top skills</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selected.skills.slice(0, 5).map((skill) => (
                  <SkillTag key={skill}>{skill}</SkillTag>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/35">
              <ShieldCheck className="size-4 text-emerald-700" />
              <p className="mt-2 text-xs font-semibold">
                Verified professional
              </p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                Identity and work history have been reviewed.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <Dialog
        open={toolDialog !== null}
        onOpenChange={() => setToolDialog(null)}
      >
        <DialogContent>
          {toolDialog === "search" && (
            <>
              <DialogHeader>
                <DialogTitle>Search this conversation</DialogTitle>
                <DialogDescription>
                  Find names, topics, or brief details in the current thread.
                </DialogDescription>
              </DialogHeader>
              <label className={`${workspaceStyles.inputShell} min-h-12`}>
                <Search className="size-4 text-muted-foreground" />
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
                  Add a brief, requirements, or references when this
                  conversation is ready for shared files.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center">
                <Paperclip className="mx-auto size-5 text-brand-600" />
                <p className="mt-3 text-sm font-semibold">Shared files</p>
              </div>
            </>
          )}
          {toolDialog === "brief" && (
            <>
              <DialogHeader>
                <DialogTitle>Add a project brief</DialogTitle>
                <DialogDescription>
                  Draft a short scope that can be sent into this conversation.
                </DialogDescription>
              </DialogHeader>
              <textarea
                rows={5}
                placeholder="Summarize the goal, timeline, and screens you want prioritized."
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm leading-6 outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-100"
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MessageBubble({
  initials,
  avatarClass,
  message,
  time,
}: {
  initials: string
  avatarClass: string
  message: string
  time: string
}) {
  return (
    <div className="flex max-w-[92%] items-end gap-2 sm:max-w-[78%] sm:gap-3">
      <Monogram className={`size-8 text-[10px] ${avatarClass}`}>
        {initials}
      </Monogram>
      <div>
        <div className="rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 text-sm leading-6 shadow-sm">
          {message}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}
