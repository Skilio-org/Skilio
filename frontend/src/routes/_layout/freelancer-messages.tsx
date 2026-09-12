import { createFileRoute } from "@tanstack/react-router";
import { FreelancerWorkspace } from "@/components/common/freelancer-workspace";
export const Route = createFileRoute("/_layout/freelancer-messages")({
  component: () => <FreelancerWorkspace page="messages" />,
  head: () => ({ meta: [{ title: "Messages | Freelancer" }] }),
});
