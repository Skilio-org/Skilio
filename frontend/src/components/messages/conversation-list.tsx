import { Link } from "@tanstack/react-router";
import { Archive, ArrowUpRight, MessageSquare, Search, X } from "lucide-react";
import { Monogram } from "@/components/dashboard/dashboard-header";
import type { ConversationSummary, InboxFilter } from "@/components/messages/message-types";
import type { Freelancer } from "@/data/freelancers";
import { cn } from "@/lib/utils";

export function ConversationList({
  people,
  clientMode = false,
  conversations,
  selectedId,
  query,
  filter,
  unreadCount,
  onQueryChange,
  onFilterChange,
  onSelect,
}: {
  people: Freelancer[];
  clientMode?: boolean;
  conversations: ConversationSummary[];
  selectedId: string;
  query: string;
  filter: InboxFilter;
  unreadCount: number;
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: InboxFilter) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <aside
      aria-label="Conversations"
      className={cn(
        "border-border bg-card min-h-0 min-w-0 flex-col lg:flex lg:border-r",
        selectedId ? "hidden" : "flex",
      )}
    >
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-medium tracking-tight">Messages</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">Your next great collaboration starts here.</p>
        <label className="border-input bg-background focus-within:border-primary focus-within:ring-primary/15 mt-6 flex min-h-11 items-center gap-2 rounded-lg border px-3 focus-within:ring-2">
          <Search className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
          <span className="sr-only">Search conversations</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search name or message"
            className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear conversation search"
              className="hover:bg-muted grid size-8 shrink-0 place-items-center rounded-md"
            >
              <X className="size-3.5" />
            </button>
          )}
        </label>
        <fieldset className="border-border mt-4 flex gap-1 border-b">
          <legend className="sr-only">Inbox filters</legend>
          {(["all", "unread", "archived"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => onFilterChange(value)}
              className={cn(
                "flex min-h-11 flex-1 items-center justify-center gap-1.5 border-b-2 px-1 text-xs font-medium capitalize transition-colors",
                filter === value
                  ? "border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              {value === "all" ? "All inbox" : value === "unread" ? "Unread" : "Archived"}
              {value === "unread" && unreadCount > 0 && (
                <span className="bg-accent text-accent-foreground rounded-md px-1.5 py-0.5 text-[10px]">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </fieldset>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
        {conversations.map((conversation) => {
          const person = people.find((item) => item.id === conversation.id);
          if (!person) return null;
          const active = selectedId === person.id;
          return (
            <button
              key={person.id}
              type="button"
              aria-pressed={active}
              aria-label={person.name + (conversation.unread ? `, ${conversation.unread} unread messages` : "")}
              onClick={() => onSelect(person.id)}
              className={cn(
                "mb-1 flex min-h-24 w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                active ? "border-brand-200 bg-brand-50" : "hover:bg-muted/60 border-transparent",
              )}
            >
              <Monogram className={cn("mt-0.5 size-11 text-sm", person.background, person.foreground)}>
                {person.initials}
              </Monogram>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span
                    className={cn("truncate text-sm", conversation.unread || active ? "font-semibold" : "font-medium")}
                  >
                    {person.name}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-[10px]">{conversation.time}</span>
                </span>
                <span className="text-muted-foreground mt-1 block truncate text-[11px]">{person.title}</span>
                <span className="mt-2 flex items-start gap-2">
                  <span
                    className={cn(
                      "line-clamp-2 min-w-0 flex-1 text-xs leading-5 break-words",
                      conversation.unread ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {conversation.hasDraft && <span className="text-primary font-medium">Draft: </span>}
                    {conversation.preview}
                  </span>
                  {conversation.unread > 0 && (
                    <span className="bg-primary text-primary-foreground mt-0.5 grid min-w-5 shrink-0 place-items-center rounded-full px-1 text-[10px] leading-5 font-semibold">
                      {conversation.unread}
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
        {conversations.length === 0 && (
          <div className="px-4 py-12 text-center">
            <span className="border-border bg-background text-muted-foreground mx-auto grid size-12 place-items-center rounded-xl border">
              {filter === "archived" ? (
                <Archive className="size-5" />
              ) : query ? (
                <Search className="size-5" />
              ) : (
                <MessageSquare className="size-5" />
              )}
            </span>
            <h2 className="mt-4 text-sm font-medium">
              {query
                ? "No matching conversations"
                : filter === "unread"
                  ? "You're all caught up"
                  : "Nothing archived yet"}
            </h2>
            <p className="text-muted-foreground mt-2 text-xs leading-6">
              {query
                ? "Try a different name, skill, or message."
                : filter === "unread"
                  ? "New messages will appear here."
                  : "Conversations you archive will live here."}
            </p>
            <button
              type="button"
              onClick={() => {
                onQueryChange("");
                onFilterChange("all");
              }}
              className="text-primary mt-3 min-h-11 text-xs font-medium"
            >
              Back to all conversations
            </button>
          </div>
        )}
      </div>
      <div className="border-border text-muted-foreground flex items-center justify-between gap-3 border-t px-5 py-3 text-[11px]">
        <span>Preview inbox</span>
        <span>{unreadCount ? `${unreadCount} unread messages` : "All caught up"}</span>
      </div>
    </aside>
  );
}
