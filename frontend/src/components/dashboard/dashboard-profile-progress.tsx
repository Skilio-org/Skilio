import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Bookmark, MessageSquare, UserRound } from "lucide-react"
import { WorkspaceSurface } from "./dashboard-header"

export const ProfileProgress = () => (
  <WorkspaceSurface className="p-6">
    <p className="text-muted-foreground text-xs font-medium">
      A good place to start
    </p>
    <h2 className="font-display mt-3 text-xl font-medium tracking-tight">
      Set your project up for success.
    </h2>
    <p className="text-muted-foreground mt-3 text-sm leading-6">
      A few small steps toward a great collaboration.
    </p>
    <div className="mt-6 space-y-1">
      {[
        {
          icon: UserRound,
          title: "Introduce yourself",
          detail: "Complete your client profile",
          to: "/client-profile",
        },
        {
          icon: Bookmark,
          title: "Build a shortlist",
          detail: "Keep your favorites together",
          to: "/saved",
        },
        {
          icon: MessageSquare,
          title: "Start a conversation",
          detail: "Talk through your project",
          to: "/messages",
        },
      ].map(({ icon: Icon, ...item }) => (
        <Link
          key={item.title}
          to={item.to}
          className="group hover:bg-muted -mx-2 flex min-h-16 items-center gap-3 rounded-lg px-2 py-3"
        >
          <span className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-lg">
            <Icon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">{item.title}</span>
            <span className="text-muted-foreground mt-1 block text-xs">
              {item.detail}
            </span>
          </span>
          <ArrowUpRight className="text-muted-foreground group-hover:text-primary size-3.5" />
        </Link>
      ))}
    </div>
  </WorkspaceSurface>
)
