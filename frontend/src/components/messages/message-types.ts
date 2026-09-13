export type InboxFilter = "all" | "unread";

export type MessageToolDialog = "search" | "attachment" | "brief" | null;

export type ConversationSummary = {
  id: string;
  preview: string;
  time: string;
  unread: number;
};
