import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ConversationList } from "@/components/messages/conversation-list";
import { MessageTalentDetails } from "@/components/messages/message-talent-details";
import { MessageThread } from "@/components/messages/message-thread";
import { type InboxFilter, type MessageToolDialog } from "@/components/messages/message-types";
import { MessageToolDialogView } from "@/components/messages/message-tool-dialog";
import { freelancers } from "@/data/freelancers";

type MessagesSearch = { with?: string };

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
        <ConversationList
          conversations={conversations}
          selected={selected}
          selectedId={selectedId}
          query={query}
          filter={filter}
          onQueryChange={setQuery}
          onFilterChange={setFilter}
          onSelect={setSelectedId}
        />

        <MessageThread
          selected={selected}
          selectedId={selectedId}
          incomingMessage={incomingMessages[selected.id]}
          sentMessages={sentMessages[selected.id] ?? []}
          draft={draft}
          onBack={() => setSelectedId("")}
          onOpenTool={setToolDialog}
          onShowUnread={() => setFilter("unread")}
          onDraftChange={setDraft}
          onSend={sendMessage}
        />

        <MessageTalentDetails selected={selected} />
      </div>

      <MessageToolDialogView toolDialog={toolDialog} onClose={() => setToolDialog(null)} />
    </div>
  );
}
