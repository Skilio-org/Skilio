import { Search } from "lucide-react";

import { Monogram, workspaceStyles } from "@/components/dashboard/dashboard-header";
import type { ConversationSummary, InboxFilter } from "@/components/messages/message-types";
import { type Freelancer, freelancers } from "@/data/freelancers";

export function ConversationList({
  conversations,
  selected,
  selectedId,
  query,
  filter,
  onQueryChange,
  onFilterChange,
  onSelect,
}: {
  conversations: ConversationSummary[];
  selected: Freelancer;
  selectedId: string;
  query: string;
  filter: InboxFilter;
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: InboxFilter) => void;
  onSelect: (id: string) => void;
}) {
  return (
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
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search conversations"
            className="min-w-0 flex-1 bg-transparent px-2 text-base outline-none md:text-sm"
          />
        </label>
        <fieldset className="bg-muted mt-3 flex gap-1 rounded-xl p-1" aria-label="Inbox filters">
          {(["all", "unread"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onFilterChange(value)}
              className={`min-h-9 flex-1 rounded-lg px-3 text-xs font-semibold capitalize transition ${
                filter === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
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
              onClick={() => onSelect(person.id)}
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
  );
}
