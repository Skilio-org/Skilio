import { createFileRoute } from "@tanstack/react-router";
import { MessagesWorkspace } from "@/components/messages/messages-workspace";
export const Route = createFileRoute("/_layout/messages")({
  validateSearch: (search: Record<string, unknown>): { with?: string } => ({
    with: typeof search.with === "string" ? search.with : undefined,
  }),
  component: Messages,
  head: () => ({ meta: [{ title: "Messages | Freelancer" }] }),
});
function Messages() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <MessagesWorkspace
      selectedContact={search.with}
      onSelectContact={(id) => void navigate({ search: { with: id || undefined } })}
    />
  );
}
