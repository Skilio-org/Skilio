import { Bookmark, Eye, MessageSquare } from "lucide-react";

export const Stats = () => {
  return (
    <section
      aria-label="Workspace summary"
      className="border-border bg-card shadow-card grid overflow-hidden rounded-2xl border sm:grid-cols-3"
    >
      {[
        {
          icon: Bookmark,
          value: "5",
          label: "Saved profiles",
          detail: "2 shortlisted this week",
        },
        {
          icon: Eye,
          value: "28",
          label: "Profiles viewed",
          detail: "Across 6 disciplines",
        },
        {
          icon: MessageSquare,
          value: "4",
          label: "Conversations",
          detail: "2 awaiting a reply",
        },
      ].map((item) => (
        <article
          key={item.label}
          className="border-border border-b p-5 last:border-b-0 sm:border-r sm:border-b-0 sm:p-6 sm:last:border-r-0"
        >
          <div className="flex items-start justify-between">
            <item.icon className="text-brand-600 size-5" />
            <span className="font-display text-3xl font-medium tracking-tight">{item.value}</span>
          </div>
          <p className="mt-7 font-semibold">{item.label}</p>
          <p className="text-muted-foreground mt-1 text-sm">{item.detail}</p>
        </article>
      ))}
    </section>
  );
};
