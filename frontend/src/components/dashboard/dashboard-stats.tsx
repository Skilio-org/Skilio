import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Bookmark, Eye, MessageSquare } from "lucide-react"

export const Stats = () => (
  <section aria-label="Workspace summary" className="grid gap-3 sm:grid-cols-3">
    {[
      {
        icon: Bookmark,
        value: "5",
        label: "Saved profiles",
        detail: "Your growing shortlist",
        to: "/saved",
      },
      {
        icon: Eye,
        value: "28",
        label: "Profiles viewed",
        detail: "Keep exploring your options",
        to: "/talent",
      },
      {
        icon: MessageSquare,
        value: "4",
        label: "Conversations",
        detail: "Pick up where you left off",
        to: "/messages",
      },
    ].map(({ icon: Icon, ...item }) => (
      <Link
        key={item.label}
        to={item.to}
        className="workspace-metric group border-border bg-card hover:border-primary/40 rounded-xl border px-6 py-5 transition-colors"
      >
        <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
          <Icon className="size-4" />
          {item.label}
          <ArrowUpRight className="ml-auto size-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
        </div>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-display text-3xl font-medium tracking-tight tabular-nums">
            {item.value}
          </span>
          <span className="text-muted-foreground text-xs">{item.detail}</span>
        </div>
      </Link>
    ))}
  </section>
)
